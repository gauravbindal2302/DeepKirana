import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Cart.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useCart } from "../../context/CartContext";

export default function Cart({ title }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart, itemCount, clearCart } =
    useCart();
  const processedAddRequestRef = useRef("");

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (!productId) {
      processedAddRequestRef.current = "";
      return;
    }

    const incomingQuantity = Math.max(
      1,
      parseInt(searchParams.get("quantity") || "1", 10)
    );
    const incomingWeight = parseInt(searchParams.get("weight") || "0", 10) || null;
    const requestKey = `${productId}-${incomingQuantity}-${incomingWeight || "unit"}`;

    // Prevent double-add in React Strict Mode/dev effect re-runs.
    if (processedAddRequestRef.current === requestKey) {
      return;
    }
    processedAddRequestRef.current = requestKey;

    async function addProductFromQuery() {
      try {
        const response = await axios.get(`${SERVER_URL}/categories`);
        const flattenedProducts = response.data.reduce(
          (accumulator, category) => [
            ...accumulator,
            ...category.products.map((product) => ({
              ...product,
              category: category.category,
              image: `${SERVER_URL}/uploads/${product.productImage}`,
            })),
          ],
          []
        );

        const product = flattenedProducts.find((item) => item._id === productId);
        if (!product) {
          navigate("/cart", { replace: true });
          return;
        }

        const parsedPrice = Number(product.productPrice) || 0;
        const parsedMrp = Number(product.productMrp) || 0;
        const isCustomizable = product.productSize === "Customizable";
        const selectedWeight = incomingWeight || 1000;

        // For customizable products, productPrice/productMrp are per Kg values.
        // Cart stores per-pack values based on selected weight.
        const calculatedPackPrice = isCustomizable
          ? Number(((parsedPrice * selectedWeight) / 1000).toFixed(2))
          : parsedPrice;
        const calculatedPackMrp = isCustomizable
          ? Number(((parsedMrp * selectedWeight) / 1000).toFixed(2))
          : parsedMrp;

        addToCart({
          id: product._id,
          name: product.productName,
          image: product.image,
          price: calculatedPackPrice,
          mrp: calculatedPackMrp,
          quantity: incomingQuantity,
          weight: isCustomizable ? selectedWeight : null,
          sizeType: product.productSize,
        });
      } catch (error) {
        console.error("Error adding product to cart:", error);
      } finally {
        navigate("/cart", { replace: true });
      }
    }

    addProductFromQuery();
  }, [addToCart, navigate, searchParams]);

  const handleInputChange = (event, item) => {
    const quantity = parseInt(event.target.value, 10);
    updateQuantity(item.id, item.weight, Number.isNaN(quantity) ? 1 : quantity);
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item.id, item.weight);
  };

  const [showOrderSection, setShowOrderSection] = useState(false); // State to control order section visibility
  const [proceedClicked, setProceedClicked] = useState(false);

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentNote, setShowPaymentNote] = useState(false); // To show/hide the payment note
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const deliveryCharge = totalPrice >= 499 ? 0 : 60;
  const totalAmount = totalPrice + deliveryCharge;

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Your cart is empty. Please add items before placing order.");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const orderPayload = {
      customer: {
        customerName: name,
        mobileNumber,
        houseNumber: houseNo,
        streetName,
        landmark,
        pinCode,
        city,
        state,
      },
      orderItems: items.map((item) => ({
        productId: item.id,
        productName: item.name,
        productSize: item.weight
          ? item.weight >= 1000
            ? `${item.weight / 1000}kg`
            : `${item.weight}gm`
          : "unit",
        productQuantity: item.quantity,
        productPrice: Number(item.price),
        productMRP: Number(item.mrp || item.price),
      })),
      paymentMethod,
      subtotal: Number(totalPrice.toFixed(2)),
      deliveryCharge,
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    setIsPlacingOrder(true);
    axios
      .post(`${SERVER_URL}/orders`, orderPayload)
      .then((res) => {
        clearCart();
        navigate(`/order-confirmation/${res.data.order._id}`);
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        alert("Unable to place order right now. Please try again.");
      })
      .finally(() => {
        setIsPlacingOrder(false);
      });
  };

  // Function to toggle the visibility of the payment note for the selected payment method
  const togglePaymentNote = (selectedPaymentMethod) => {
    setShowPaymentNote(selectedPaymentMethod);
  };

  return (
    <>
      <Navbar noOfItems={itemCount} />
      <div className="small-container cart-page" id="cart">
        {items.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: "20px", borderRadius: "8px 0 0 8px" }}>
                  S. No.
                </th>
                <th>Cart Items</th>
                <th>Quantity</th>
                <th style={{ paddingRight: "20px", borderRadius: "0 8px 8px 0" }}>
                  SubTotal
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.id}-${item.weight || "unit"}`}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="cart-info">
                      <img alt={item.name} src={item.image} />
                      <div>
                        <p>{item.name}</p>
                        <small style={{ fontSize: "13px", m: "-0" }}>
                          OUR PRICE: ₹{item.price.toFixed(2)}
                        </small>
                        <br />
                        <small style={{ fontSize: "12px" }}>
                          MRP: ₹{(item.mrp || item.price).toFixed(2)}
                        </small>
                        {item.weight ? (
                          <>
                            <br />
                            <small style={{ fontSize: "12px" }}>
                              Pack Size:{" "}
                              {item.weight >= 1000
                                ? `${item.weight / 1000}kg`
                                : `${item.weight}gm`}
                            </small>
                          </>
                        ) : null}
                        <br />
                        <button
                          className="cart-remove-btn"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cart-quantity">
                      <input
                        type="number"
                        value={item.quantity}
                        className="cart-quantity"
                        min="1"
                        onChange={(e) => handleInputChange(e, item)}
                      />
                    </div>
                  </td>
                  <td className="cart-subtotal">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Your cart is empty.
          </h2>
        )}
        <div className={`total-price ${proceedClicked ? "border-bottom" : ""}`}>
          <table>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td>₹{totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={`place-order-btn ${proceedClicked ? "hidden" : ""}`}
          onClick={() => {
            setShowOrderSection(true);
            setProceedClicked(true);
          }}
        >
          Proceed
        </button>

        {showOrderSection && (
          <div className="order">
            <form onSubmit={handleSubmit}>
              <div className="address-section">
                <h3>Shipping Details</h3>
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number:</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="houseNo">House No:</label>
                  <input
                    type="name"
                    id="houseNo"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="streetName">Street Name:</label>
                  <input
                    type="name"
                    id="streetName"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="landmark">Landmark:</label>
                  <input
                    type="name"
                    id="landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="streetName">Pin Code</label>
                  <input
                    type="name"
                    id="pinCode"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City:</label>
                  <input
                    type="name"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="streetName">State</label>
                  <input
                    type="name"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>{" "}
              </div>
              <div className="payment-section">
                <div className="payment-heading">
                  <h3>Payment Method</h3>
                  <h3>(Bill Amount: ₹{totalPrice.toFixed(2)})</h3>
                </div>
                <div className="form-group-payment">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => {
                      setPaymentMethod("UPI");
                      togglePaymentNote("UPI");
                    }}
                  />
                  <label htmlFor="upi">
                    UPI (Paytm, PhonePe, Google Pay, etc.)
                  </label>
                </div>
                {showPaymentNote === "UPI" && (
                  <div className="UPI-section">
                    <p>
                      [Total Amount: ₹{totalPrice.toFixed(2)} + ₹
                      {deliveryCharge.toFixed(2)} (Delivery) = ₹
                      {totalAmount.toFixed(2)}]
                    </p>
                    <ul>
                      Follow these steps:
                      <li>
                        <label>Step-1</label>
                        <span>
                          Click on "Place Order" button in UPI Section
                        </span>
                      </li>
                      <li>
                        <label>Step-2</label>
                        <span>
                          Pay Amount of ₹{totalAmount.toFixed(2)} using UPI
                          number 4567891234
                        </span>
                      </li>
                      <li>
                        <label>Step-3</label>
                        <span>
                          Send the screenshot of the payment along with your
                          name to 4567891234
                        </span>
                      </li>
                    </ul>
                    <button
                      type="submit"
                      className="submit-order-btn"
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? "Placing Order..." : "Place Order"}
                    </button>{" "}
                  </div>
                )}
                <div className="form-group-payment">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => {
                      setPaymentMethod("COD");
                      togglePaymentNote("COD");
                    }}
                  />
                  <label htmlFor="cod">COD (Cash On Delivery)</label>
                </div>
                {showPaymentNote === "COD" && (
                  <div className="COD-section">
                    <p>
                      [Total Amount: ₹{totalPrice.toFixed(2)} + ₹
                      {deliveryCharge.toFixed(2)} (Delivery)= ₹
                      {totalAmount.toFixed(2)}]
                    </p>
                    <button
                      type="submit"
                      className="submit-order-btn"
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                )}
                <label id="COD-Note">
                  [Note: Free delivery on minimum order of ₹499]
                </label>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
