import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer";

const server = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: "./config.env" });

server.use(express.json());
server.use(cors());
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

const DB = process.env.DATABASE;
const PORT = process.env.PORT;
const SECRET_KEY = process.env.KEY;
const SERVER_URL = process.env.API_URL;
const STORE_PINCODE = String(process.env.STORE_PINCODE || "").replace(/\D/g, "");
const STORE_LATITUDE = Number(process.env.STORE_LATITUDE || "28.6139");
const STORE_LONGITUDE = Number(process.env.STORE_LONGITUDE || "77.209");
const FREE_DELIVERY_RADIUS_KM = Number(process.env.FREE_DELIVERY_RADIUS_KM || "5");
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TO_NUMBER = String(process.env.WHATSAPP_TO_NUMBER || "").replace(/\D/g, "");

const ORDER_NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

// Connect to the MongoDB database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Specify the destination folder to store the images (create the 'uploads' folder in your project)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Rename the file with a timestamp to avoid name collisions
  },
});

const upload = multer({ storage: storage });

const toRad = (value) => (value * Math.PI) / 180;
const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const fetchCoordinatesForIndianPincode = async (pinCode) => {
  const urls = [
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=in&postalcode=${pinCode}`,
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=in&q=${pinCode}`,
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${pinCode}%2C%20India`,
  ];

  for (const geoUrl of urls) {
    const response = await fetch(geoUrl, {
      headers: {
        "User-Agent": "deepstore-delivery-check/1.0",
      },
    });

    if (!response.ok) {
      continue;
    }

    const locations = await response.json();
    if (!Array.isArray(locations) || locations.length === 0) {
      continue;
    }

    const location = locations[0];
    const targetLatitude = Number(location.lat);
    const targetLongitude = Number(location.lon);

    if (!Number.isFinite(targetLatitude) || !Number.isFinite(targetLongitude)) {
      continue;
    }

    return {
      latitude: targetLatitude,
      longitude: targetLongitude,
      sourceDisplayName: location.display_name || "",
    };
  }

  return null;
};

const getStoreCoordinates = async () => {
  if (/^\d{6}$/.test(STORE_PINCODE)) {
    const storeCoordinates = await fetchCoordinatesForIndianPincode(STORE_PINCODE);
    if (storeCoordinates) {
      return {
        ...storeCoordinates,
        pinCode: STORE_PINCODE,
      };
    }
  }

  if (Number.isFinite(STORE_LATITUDE) && Number.isFinite(STORE_LONGITUDE)) {
    return {
      latitude: STORE_LATITUDE,
      longitude: STORE_LONGITUDE,
      pinCode: null,
      sourceDisplayName: "",
    };
  }

  return null;
};

const buildWhatsAppOrderMessage = (order) => {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const customer = order.customer || {};
  const itemLines = (order.orderItems || [])
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} | ${item.productSize} | Qty ${item.productQuantity} | Rs ${Number(
          item.productPrice || 0
        ).toFixed(2)}`
    )
    .join("\n");

  return `New Order Received

Order ID: ${order._id}
Date & Time: ${orderDate}

Customer:
Name: ${customer.customerName || "-"}
Mobile: ${customer.mobileNumber || "-"}
Address: ${customer.houseNumber || "-"}, ${customer.streetName || "-"}, ${
    customer.landmark || "-"
  }, ${customer.city || "-"}, ${customer.state || "-"} - ${customer.pinCode || "-"}

Items:
${itemLines}

Payment: ${order.paymentMethod || "-"}
Subtotal: Rs ${Number(order.subtotal || 0).toFixed(2)}
Delivery: Rs ${Number(order.deliveryCharge || 0).toFixed(2)}
Total: Rs ${Number(order.totalAmount || 0).toFixed(2)}
Order Status: ${order.orderStatus || "Pending"}`;
};

const sendOrderToWhatsApp = async (order) => {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TO_NUMBER) {
    return;
  }

  const payload = {
    messaging_product: "whatsapp",
    to: WHATSAPP_TO_NUMBER,
    type: "text",
    text: {
      body: buildWhatsAppOrderMessage(order),
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${errorBody}`);
  }
};

const sendOrderEmail = async (order) => {
  if (!ORDER_NOTIFY_EMAIL || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const plainBody = buildWhatsAppOrderMessage(order);
  const subject = `New order #${order._id} — DeepStore`;

  const itemRows = (order.orderItems || [])
    .map(
      (item, idx) =>
        `<tr><td>${idx + 1}</td><td>${escapeHtml(item.productName)}</td><td>${escapeHtml(
          String(item.productSize || "")
        )}</td><td>${item.productQuantity}</td><td>₹${Number(item.productPrice || 0).toFixed(2)}</td></tr>`
    )
    .join("");

  const customer = order.customer || {};
  const htmlBody = `
    <h2>New order received</h2>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Payment:</strong> ${escapeHtml(String(order.paymentMethod || ""))}</p>
    <p><strong>Subtotal:</strong> ₹${Number(order.subtotal || 0).toFixed(2)} &nbsp;
    <strong>Delivery:</strong> ₹${Number(order.deliveryCharge || 0).toFixed(2)} &nbsp;
    <strong>Total:</strong> ₹${Number(order.totalAmount || 0).toFixed(2)}</p>
    <h3>Customer</h3>
    <p>${escapeHtml(customer.customerName || "")} — ${escapeHtml(customer.mobileNumber || "")}<br/>
    ${escapeHtml(customer.houseNumber || "")}, ${escapeHtml(customer.streetName || "")}, ${escapeHtml(
    customer.landmark || ""
  )}<br/>
    ${escapeHtml(customer.city || "")}, ${escapeHtml(customer.state || "")} — ${escapeHtml(
    customer.pinCode || ""
  )}</p>
    <h3>Items</h3>
    <table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>#</th><th>Product</th><th>Size</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemRows}</tbody></table>
    <p><small>Status: ${escapeHtml(String(order.orderStatus || "Pending"))}</small></p>
  `;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: ORDER_NOTIFY_EMAIL,
    subject,
    text: plainBody,
    html: htmlBody,
  });
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const normalizeMobileNumber = (value) => String(value || "").replace(/\D/g, "").slice(-10);

const authUserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], required: true },
  },
  { timestamps: true }
);
const AuthUser = mongoose.model("AuthUser", authUserSchema);
const otpStore = new Map();

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, mobileNumber: user.mobileNumber },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

server.post("/auth/register", async (req, res) => {
  try {
    const { name, mobileNumber, password } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    if (!/^\d{10}$/.test(normalizedMobileNumber)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }
    if (!password || String(password).length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters." });
    }

    const existingUser = await AuthUser.findOne({ mobileNumber: normalizedMobileNumber });
    if (existingUser) {
      return res.status(409).json({ error: "Mobile number already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await AuthUser.create({
      name: String(name || "").trim(),
      mobileNumber: normalizedMobileNumber,
      password: hashedPassword,
      role: "customer",
    });

    const token = createToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    return res.status(500).json({ error: "Failed to register user." });
  }
});

server.post("/auth/request-otp", async (req, res) => {
  try {
    const { mobileNumber, role } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    const selectedRole = String(role || "customer").toLowerCase();

    if (!["customer", "admin"].includes(selectedRole)) {
      return res.status(400).json({ error: "Invalid role selected." });
    }
    if (!/^\d{10}$/.test(normalizedMobileNumber)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }

    if (selectedRole === "admin") {
      const adminUser = await AuthUser.findOne({
        mobileNumber: normalizedMobileNumber,
        role: "admin",
      });
      if (!adminUser) {
        return res.status(404).json({ error: "Admin account not found for this mobile number." });
      }
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(`${selectedRole}:${normalizedMobileNumber}`, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Replace this with real SMS provider integration.
    return res.status(200).json({
      message: "OTP sent successfully.",
      devOtp: otp,
    });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP." });
  }
});

server.post("/auth/verify-otp", async (req, res) => {
  try {
    const { mobileNumber, role, otp, name } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    const selectedRole = String(role || "customer").toLowerCase();
    const otpCode = String(otp || "").trim();

    if (!["customer", "admin"].includes(selectedRole)) {
      return res.status(400).json({ error: "Invalid role selected." });
    }
    if (!/^\d{10}$/.test(normalizedMobileNumber)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }
    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({ error: "Please enter a valid 6-digit OTP." });
    }

    const key = `${selectedRole}:${normalizedMobileNumber}`;
    const storedOtp = otpStore.get(key);
    if (!storedOtp) {
      return res.status(400).json({ error: "OTP not found. Please request OTP again." });
    }
    if (storedOtp.expiresAt < Date.now()) {
      otpStore.delete(key);
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }
    if (storedOtp.otp !== otpCode) {
      return res.status(401).json({ error: "Invalid OTP." });
    }
    otpStore.delete(key);

    let user = await AuthUser.findOne({
      mobileNumber: normalizedMobileNumber,
      role: selectedRole,
    });

    if (!user && selectedRole === "customer") {
      user = await AuthUser.create({
        name: String(name || "").trim() || "Customer",
        mobileNumber: normalizedMobileNumber,
        password: "__OTP_ONLY__",
        role: "customer",
      });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found for selected role." });
    }

    if (!user.name && selectedRole === "customer" && String(name || "").trim()) {
      user.name = String(name).trim();
      await user.save();
    }

    const token = createToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
});

server.post("/auth/login", async (req, res) => {
  try {
    const { mobileNumber, password, role } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    const loginRole = String(role || "customer").toLowerCase();
    if (!["customer", "admin"].includes(loginRole)) {
      return res.status(400).json({ error: "Invalid role selected." });
    }
    if (!/^\d{10}$/.test(normalizedMobileNumber)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }

    const user = await AuthUser.findOne({
      mobileNumber: normalizedMobileNumber,
      role: loginRole,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found for selected role." });
    }

    const isPasswordValid = await bcrypt.compare(String(password || ""), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = createToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Failed to login." });
  }
});

/*
//Admin schema and model
const adminSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
});
const Admin = mongoose.model("Admin", adminSchema);

// Helper function to create a JWT token
function createToken(admin) {
  return jwt.sign({ id: admin._id, email: admin.email }, SECRET_KEY, {
    expiresIn: "1h",
  });
}

// Registration route
server.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Email already exists, Go to Login!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();
    const token = createToken(newAdmin);
    res.json({ message: "Registration Successful!", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to register!" });
  }
});

// Login route
server.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ error: "You are not registered, Register Now!" });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Incorrect password, Enter correct password!" });
    }
    const token = createToken(admin);
    res.json({ message: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

// Password reset route
server.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found!" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();
    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password!" });
  }
});
*/

//Category schema and model
const categorySchema = new mongoose.Schema({
  category: String,
  image: String,
  products: [
    {
      productImage: String,
      productName: String,
      productPrice: String,
      productMrp: String,
      productSize: String,
      productDescription: String,
    },
  ],
});
const Category = mongoose.model("Category", categorySchema);

// Route handler for adding a new category
server.post(
  "/admin/dashboard/add",
  upload.single("image"),
  async (req, res) => {
    const { category } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
      const newCategory = new Category({ category, image, products: [] });
      await newCategory.save();
      res.sendStatus(200);
    } catch (error) {
      console.error("Error adding category:", error);
      res.sendStatus(500);
    }
  }
);

// Reusable route handler function for fetching (view) categories
const fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(
      categories.map((category) => ({
        ...category._doc,
        image: `${SERVER_URL}/uploads/${category.image}`, // Send the full image URL to the client
      }))
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.sendStatus(500);
  }
};

// Route handlers for fetching categories
server.get("/categories", fetchCategories);

// Route handlers for updating categories
server.put(
  "/admin/dashboard/update/:category",
  upload.single("categoryImage"),
  async (req, res) => {
    const { category } = req.params;
    const { categoryName } = req.body;
    const categoryImage = req.file ? req.file.filename : null;
    try {
      await Category.findOneAndUpdate(
        { category },
        { category: categoryName, image: categoryImage }
      );
      res.sendStatus(200);
    } catch (error) {
      console.error("Error updating category:", error);
      res.sendStatus(500);
    }
  }
);

// Route handlers for deleting categories
server.delete("/admin/dashboard/delete/:category", async (req, res) => {
  const { category } = req.params;
  try {
    await Category.deleteOne({ category });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting category:", error);
    res.sendStatus(500);
  }
});

// Create a schema for products
const productSchema = new mongoose.Schema({
  productImage: String,
  productName: String,
  productPrice: String,
  productMrp: String,
  productSize: String,
  productDescription: String,
  category: String,
});
const Product = mongoose.model("Product", productSchema);

server.post(
  "/admin/dashboard/add-product",
  upload.single("image"),
  async (req, res) => {
    const {
      productName,
      productPrice,
      productMrp,
      productSize,
      productDescription,
      category,
    } = req.body;

    const productImage = req.file ? req.file.filename : null;

    try {
      await Category.findOneAndUpdate(
        { category },
        {
          $push: {
            products: {
              productName,
              productPrice,
              productMrp,
              productSize,
              productDescription,
              productImage,
            },
          },
        }
      );
      res.sendStatus(200);
    } catch (error) {
      console.error("Error adding product:", error);
      res.sendStatus(500);
    }
  }
);

server.put(
  "/admin/dashboard/update/product/:category/:productId",
  upload.single("image"),
  async (req, res) => {
    const { category, productId } = req.params;
    const {
      productName,
      productPrice,
      productMrp,
      productSize,
      productDescription,
    } = req.body;

    const productImage = req.file ? req.file.filename : null;

    try {
      // Find the category by name
      const existingCategory = await Category.findOne({ category });

      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Find the product within the category using productId
      const existingProduct = existingCategory.products.id(productId);

      if (!existingProduct) {
        return res
          .status(404)
          .json({ error: "Product not found in the category" });
      }

      // Update product details
      if (productName) existingProduct.productName = productName;
      if (productPrice) existingProduct.productPrice = productPrice;
      if (productMrp) existingProduct.productMrp = productMrp;
      if (productSize) existingProduct.productSize = productSize;
      if (productDescription)
        existingProduct.productDescription = productDescription;
      if (productImage) existingProduct.productImage = productImage;

      // Save the updated category document
      await existingCategory.save();

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route handlers for deleting product
server.delete(
  "/admin/dashboard/delete/:category/:product",
  async (req, res) => {
    const { category, product } = req.params;
    try {
      // Find the category by name
      const categoryDoc = await Category.findOne({ category });

      if (!categoryDoc) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Find the product to delete by name within the category
      const productIndex = categoryDoc.products.findIndex(
        (p) => p.productName === product
      );

      if (productIndex === -1) {
        return res
          .status(404)
          .json({ error: "Product not found in the category" });
      }

      // Remove the product from the category's products array
      categoryDoc.products.splice(productIndex, 1);

      // Save the updated category document
      await categoryDoc.save();

      res.sendStatus(200);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.sendStatus(500);
    }
  }
);

// Route handler for fetching products
server.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.sendStatus(500);
  }
});

server.get("/details/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler for checking delivery feasibility by pincode distance
server.get("/delivery/check", async (req, res) => {
  try {
    const rawPinCode = String(req.query.pinCode || "").trim();
    const pinCode = rawPinCode.replace(/\D/g, "");

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({ error: "Please provide a valid 6-digit pincode." });
    }

    const coordinates = await fetchCoordinatesForIndianPincode(pinCode);
    if (!coordinates) {
      return res.status(404).json({ error: "Pincode location not found." });
    }

    const storeCoordinates = await getStoreCoordinates();
    if (!storeCoordinates) {
      return res.status(500).json({
        error:
          "Store location is not configured. Please set STORE_PINCODE (preferred) or valid STORE_LATITUDE and STORE_LONGITUDE.",
      });
    }

    const distanceKm = calculateDistanceInKm(
      storeCoordinates.latitude,
      storeCoordinates.longitude,
      coordinates.latitude,
      coordinates.longitude
    );

    const roundedDistanceKm = Number(distanceKm.toFixed(2));
    const withinFreeRange = roundedDistanceKm <= FREE_DELIVERY_RADIUS_KM;

    return res.status(200).json({
      pinCode,
      distanceKm: roundedDistanceKm,
      freeDeliveryRadiusKm: FREE_DELIVERY_RADIUS_KM,
      withinFreeRange,
      storePinCode: storeCoordinates.pinCode,
      storeCoordinates: {
        latitude: storeCoordinates.latitude,
        longitude: storeCoordinates.longitude,
      },
      destinationCoordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      matchedAddress: coordinates.sourceDisplayName,
    });
  } catch (error) {
    console.error("Error checking delivery range:", error);
    return res.status(500).json({ error: "Failed to check delivery range." });
  }
});

// Create schemas for customer orders
const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: String,
    productSize: String,
    productQuantity: Number,
    productPrice: Number,
    productMRP: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      customerName: { type: String, required: true },
      mobileNumber: { type: String, required: true },
      houseNumber: { type: String, required: true },
      streetName: { type: String, required: true },
      landmark: { type: String, default: "" },
      pinCode: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      distanceKm: { type: Number, default: null },
      withinFreeDeliveryRange: { type: Boolean, default: null },
    },
    orderItems: [orderItemSchema],
    paymentMethod: { type: String, required: true },
    orderStatus: { type: String, default: "Pending" },
    deliveryStatus: { type: String, default: "Not Sent" },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

// Route handler for creating a customer order
server.post("/orders", async (req, res) => {
  try {
    const {
      customer,
      orderItems,
      paymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
    } = req.body;

    if (!customer || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    const newOrder = new Order({
      customer,
      orderItems,
      paymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
    });

    await newOrder.save();
    try {
      await sendOrderToWhatsApp(newOrder);
    } catch (whatsAppError) {
      console.error("Error sending WhatsApp order message:", whatsAppError);
    }
    try {
      await sendOrderEmail(newOrder);
    } catch (emailError) {
      console.error("Error sending order email:", emailError);
    }
    return res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Route handler for fetching all orders
server.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Route handler for fetching single order details
server.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Route handler for confirming an order
server.patch("/orders/:id/confirm", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: "Confirmed" },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.status(500).json({ error: "Failed to confirm order" });
  }
});

// Route handler for marking order as sent
server.patch("/orders/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus: "Sent" },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return res.status(500).json({ error: "Failed to update delivery status" });
  }
});

// Create a schema for the contact form
const contactSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: String,
  phone: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema);

// Route handler for submitting the contact details
server.post("/contact", async (req, res) => {
  const { fName, lName, email, phone, message } = req.body;

  try {
    const newContact = new Contact({
      fName,
      lName,
      email,
      phone,
      message,
    });
    await newContact.save();
    res.send({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.sendStatus(500);
  }
});

// Route handler for fetching messages
server.get("/getContacts", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.send(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.sendStatus(500);
  }
});

// Route handler for deleting all messages
server.delete("/deleteAllMessages", async (req, res) => {
  try {
    await Contact.deleteMany({});
    res.send({ message: "All messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting all messages:", error);
    res.sendStatus(500);
  }
});

// Route handler for deleting a message
server.delete("/deleteMessage/:id", async (req, res) => {
  const messageId = req.params.id;
  try {
    await Contact.findByIdAndDelete(messageId);
    res.send({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.sendStatus(500);
  }
});

// Listening to the server at port
server.listen(PORT, () => {
  console.log(`Your server is running on port ${PORT}`);
});
