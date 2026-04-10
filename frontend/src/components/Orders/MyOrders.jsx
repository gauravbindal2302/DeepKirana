import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./MyOrders.css";

const ORDER_FLOW = [
  "Order Placed",
  "Order Confirmed",
  "Order Packed",
  "Out for Delivery",
  "Delivered",
];

export default function MyOrders({ title }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    async function fetchMyOrders() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await axios.get(`${SERVER_URL}/orders/customer`, {
          params: { email: user?.email || "", userId: user?.id || "" },
        });
        setOrders(response.data);
      } catch (error) {
        try {
          // Fallback for environments where /orders/customer is not available yet.
          const fallbackResponse = await axios.get(`${SERVER_URL}/orders`);
          const filtered = (fallbackResponse.data || []).filter(
            (order) =>
              String(order?.customer?.customerUserId || "") === String(user?.id || "") ||
              String(order?.customer?.customerEmail || "").toLowerCase() ===
                String(user?.email || "").toLowerCase()
          );
          setOrders(filtered);
          if (!filtered.length) {
            setErrorMessage(
              "No linked orders found for this account yet. Place a new order while logged in."
            );
          }
        } catch (fallbackError) {
          console.error("Error fetching customer orders:", fallbackError);
          setErrorMessage("Unable to fetch your orders right now.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (user?.email) {
      fetchMyOrders();
    }
  }, [SERVER_URL, user?.email]);

  const groupedCount = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          if (order.orderStatus === "Delivered") acc.delivered += 1;
          else if (order.orderStatus === "Cancelled") acc.cancelled += 1;
          else acc.inProgress += 1;
          return acc;
        },
        { inProgress: 0, delivered: 0, cancelled: 0 }
      ),
    [orders]
  );

  return (
    <>
      <Navbar noOfItems={itemCount} />
      <div className="my-orders-page">
        <div className="my-orders-head">
          <h2>My Orders</h2>
          <div className="order-badges">
            <span>In Progress: {groupedCount.inProgress}</span>
            <span>Delivered: {groupedCount.delivered}</span>
            <span>Cancelled: {groupedCount.cancelled}</span>
          </div>
        </div>

        {isLoading ? (
          <p>Loading your orders...</p>
        ) : errorMessage && orders.length === 0 ? (
          <p>{errorMessage}</p>
        ) : orders.length === 0 ? (
          <p>No orders yet. Start shopping to place your first order.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const activeIdx = ORDER_FLOW.indexOf(order.orderStatus);
              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-head">
                    <div>
                      <h3>Order #{String(order._id).slice(-8)}</h3>
                      <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <span className={`order-status-chip ${order.orderStatus.replace(/\s+/g, "-")}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="order-items-preview">
                    {order.orderItems?.map((item, idx) => (
                      <p key={`${order._id}-${idx}`}>
                        {item.productName} ({item.productSize}) x {item.productQuantity}
                      </p>
                    ))}
                  </div>

                  {order.orderStatus === "Cancelled" ? (
                    <div className="order-cancelled-msg">This order was cancelled.</div>
                  ) : (
                    <div className="order-timeline">
                      {ORDER_FLOW.map((status, idx) => (
                        <div
                          key={status}
                          className={`timeline-step ${
                            idx < activeIdx ? "done" : idx === activeIdx ? "active" : ""
                          }`}
                        >
                          <span>{idx + 1}</span>
                          <p>{status}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="order-bill">
                    <p>Subtotal: Rs {Number(order.subtotal || 0).toFixed(2)}</p>
                    <p>Delivery: Rs {Number(order.deliveryCharge || 0).toFixed(2)}</p>
                    <p className="order-total">Total: Rs {Number(order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
