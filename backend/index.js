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
