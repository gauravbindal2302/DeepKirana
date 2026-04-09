import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./OrderConfirmation.css";

export default function OrderConfirmation({ title }) {
  const { orderId } = useParams();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        <div className="order-confirmation-card">
          <h1>Order Placed Successfully</h1>
          <p>Thank you for shopping with Deep Store.</p>
          <p>
            Order ID: <strong>{orderId}</strong>
          </p>
          <p>We have received your order and will process it shortly.</p>
          <div className="order-confirmation-actions">
            <Link to="/products">
              <button type="button">Continue Shopping</button>
            </Link>
            <Link to="/">
              <button type="button">Go to Home</button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
