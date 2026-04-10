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
  const [isCancellingOrderId, setIsCancellingOrderId] = useState("");
  const [expandedBills, setExpandedBills] = useState({});

  const formatFullDateTime = (dateValue) =>
    new Date(dateValue).toLocaleString("en-IN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

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

  const getCancelledLabel = (order) => {
    const byRole = order?.cancellation?.cancelledByRole === "admin" ? "Admin" : "User";
    const byName = order?.cancellation?.cancelledByName || "Unknown";
    return `Order Cancelled - By ${byRole} (${byName})`;
  };
  const getCancelledShortLabel = (order) => {
    const byRole = order?.cancellation?.cancelledByRole === "admin" ? "Admin" : "User";
    return `Order Cancelled - By ${byRole}`;
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setIsCancellingOrderId(orderId);
      await axios.patch(`${SERVER_URL}/orders/${orderId}/status`, {
        status: "Cancelled",
        cancelledByRole: "user",
        cancelledByName: String(user?.name || "User"),
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: "Cancelled",
                cancellation: {
                  cancelledByRole: "user",
                  cancelledByName: String(user?.name || "User").split(/\s+/)[0],
                  cancellationReason: "",
                  cancelledAt: new Date().toISOString(),
                },
              }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setErrorMessage(error?.response?.data?.error || "Unable to cancel order right now.");
    } finally {
      setIsCancellingOrderId("");
    }
  };

  const toggleBillDetails = (orderId) => {
    setExpandedBills((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

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
                    <div className="order-head-left">
                      <h3>Order #{order._id}</h3>
                      <p className="order-created-at">{formatFullDateTime(order.createdAt)}</p>
                    </div>
                    <div className="order-head-right">
                      <span className={`order-status-chip ${order.orderStatus.replace(/\s+/g, "-")}`}>
                        {order.orderStatus === "Cancelled"
                          ? getCancelledShortLabel(order)
                          : order.orderStatus}
                      </span>
                      <button
                        type="button"
                        className="dropdown-toggle-text"
                        onClick={() => toggleBillDetails(order._id)}
                      >
                        {expandedBills[order._id] ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  <div className="order-bill-summary">
                    <p>
                      Items: <strong>{order.orderItems?.length || 0}</strong>
                    </p>
                    <p>
                      Total: <strong>Rs {Number(order.totalAmount || 0).toFixed(2)}</strong>
                    </p>
                  </div>

                  {order.orderStatus !== "Cancelled" ? (
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
                  ) : null}

                  {expandedBills[order._id] ? (
                    <div className="order-bill">
                      {order.orderStatus === "Cancelled" &&
                      order?.cancellation?.cancelledByRole === "admin" ? (
                        <p className="cancel-reason">
                          <strong>Cancellation Reason:</strong>{" "}
                          {order?.cancellation?.cancellationReason || "Not provided"}
                        </p>
                      ) : null}
                      <table className="order-bill-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>MRP</th>
                            <th>Price</th>
                            <th>MRP Total</th>
                            <th>Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems?.map((item, idx) => {
                            const quantity = Number(item.productQuantity || 0);
                            const price = Number(item.productPrice || 0);
                            const mrp = Number(item.productMRP || item.productPrice || 0);
                            const lineMrpTotal = quantity * mrp;
                            const lineTotal = quantity * price;
                            return (
                              <tr key={`${order._id}-${idx}`}>
                                <td>
                                  {item.productName} ({item.productSize})
                                </td>
                                <td>{quantity}</td>
                                <td>Rs {mrp.toFixed(2)}</td>
                                <td>Rs {price.toFixed(2)}</td>
                                <td>Rs {lineMrpTotal.toFixed(2)}</td>
                                <td>Rs {lineTotal.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="bill-totals">
                        <p>Subtotal: Rs {Number(order.subtotal || 0).toFixed(2)}</p>
                        <p>Delivery: Rs {Number(order.deliveryCharge || 0).toFixed(2)}</p>
                        <p className="order-total">Total: Rs {Number(order.totalAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ) : null}
                  {["Order Placed", "Order Confirmed"].includes(order.orderStatus) ? (
                    <div className="order-actions">
                      <button
                        type="button"
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancellingOrderId === order._id}
                      >
                        {isCancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>
                  ) : null}
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
