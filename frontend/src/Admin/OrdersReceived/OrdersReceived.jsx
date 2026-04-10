import { Header1 } from "../Admin";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./OrdersReceived.css";
import { useAuth } from "../../context/AuthContext";

export default function OrdersReceived({ title }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const NEXT_STATUS = {
    "Order Placed": "Order Confirmed",
    "Order Confirmed": "Order Packed",
    "Order Packed": "Out for Delivery",
    "Out for Delivery": "Delivered",
  };
  const getStatusLabel = (order) =>
    order.orderStatus === "Cancelled"
      ? `Order Cancelled - By ${
          order?.cancellation?.cancelledByRole === "admin" ? "Admin" : "User"
        } (${order?.cancellation?.cancelledByName || "Unknown"})`
      : order.orderStatus;

  const getStatusClass = (status) =>
    String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  const formatOrderDateTime = (dateValue) =>
    new Date(dateValue).toLocaleString("en-IN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const filteredOrders = useMemo(() => {
    const query = String(searchValue || "").trim().toLowerCase();
    return orders.filter((order) => {
      const orderStatus = String(order?.orderStatus || "");
      if (statusFilter !== "all" && orderStatus !== statusFilter) return false;
      if (!query) return true;
      const matchesOrderId = String(order?._id || "")
        .toLowerCase()
        .includes(query);
      const matchesProductId = (order?.orderItems || []).some((item) =>
        String(item?.productId || "")
          .toLowerCase()
          .includes(query)
      );
      return matchesOrderId || matchesProductId;
    });
  }, [orders, searchValue, statusFilter]);

  const summary = useMemo(
    () =>
      filteredOrders.reduce(
        (acc, order) => {
          acc.total += 1;
          if (order.orderStatus === "Delivered") acc.delivered += 1;
          else if (order.orderStatus === "Cancelled") acc.cancelled += 1;
          else acc.active += 1;
          const createdAt = new Date(order.createdAt);
          const now = new Date();
          if (
            createdAt.getDate() === now.getDate() &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          ) {
            acc.today += 1;
          }
          return acc;
        },
        { total: 0, active: 0, delivered: 0, cancelled: 0, today: 0 }
      ),
    [filteredOrders]
  );

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Unable to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      let payload = { status };
      if (status === "Cancelled") {
        const cancellationReason = window
          .prompt("Enter cancellation reason for customer:")
          ?.trim();
        if (!cancellationReason) {
          alert("Cancellation reason is required.");
          return;
        }
        payload = {
          status,
          cancelledByRole: "admin",
          cancelledByName: String(user?.name || "Admin"),
          cancellationReason,
        };
      }
      await axios.patch(`${SERVER_URL}/orders/${orderId}/status`, payload);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error?.response?.data?.error || "Unable to update order status.");
    }
  };

  useEffect(() => {
    document.title = title;
    fetchOrders();
  }, [title]);

  return (
    <>
      <Header1 />
      <div className="orders-ordered">
        <section className="orders-kpi-grid">
          <article className="kpi-card">
            <p>Total</p>
            <h3>{summary.total}</h3>
          </article>
          <article className="kpi-card">
            <p>Active</p>
            <h3>{summary.active}</h3>
          </article>
          <article className="kpi-card">
            <p>Delivered</p>
            <h3>{summary.delivered}</h3>
          </article>
          <article className="kpi-card">
            <p>Cancelled</p>
            <h3>{summary.cancelled}</h3>
          </article>
          <article className="kpi-card">
            <p>Today</p>
            <h3>{summary.today}</h3>
          </article>
        </section>

        <div className="orders-search-bar sticky-controls">
          <div className="filters-left">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by Order ID or Product ID"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Status</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Order Confirmed">Order Confirmed</option>
              <option value="Order Packed">Order Packed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <span>
            Showing {filteredOrders.length} of {orders.length}
          </span>
        </div>
        {loading ? (
          <h1>Loading orders...</h1>
        ) : filteredOrders.length === 0 ? (
          <h1>No orders received yet.</h1>
        ) : (
          filteredOrders.map((order) => (
          <div key={order._id} className={`main-row row-${getStatusClass(order.orderStatus)}`}>
            <div className="compact-head">
              <div className="compact-meta">
                <p className="compact-title">Order #{order._id}</p>
                <p>{formatOrderDateTime(order.createdAt)}</p>
                <p>{order?.customer?.customerEmail || "N/A"}</p>
              </div>
              <div className="compact-actions">
                <span className={`status-chip status-${getStatusClass(order.orderStatus)}`}>
                  {getStatusLabel(order)}
                </span>
                <div className="action-row">
                  {NEXT_STATUS[order.orderStatus] ? (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order._id, NEXT_STATUS[order.orderStatus])
                      }
                      className={`confirm-order status-${getStatusClass(order.orderStatus)}`}
                    >
                      Move to {NEXT_STATUS[order.orderStatus]}
                    </button>
                  ) : null}
                  {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" ? (
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, "Cancelled")}
                      className="delivery-status"
                    >
                      Cancel Order
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="view-order-btn"
                    onClick={() => toggleOrderDetails(order._id)}
                  >
                    {expandedOrders[order._id] ? "Hide Details" : "View Details"}
                  </button>
                </div>
              </div>
            </div>

            {expandedOrders[order._id] ? (
              <div className="second-row">
                <div className="customer-details">
                  <h1>Customer Details</h1>
                  <table>
                    <tbody>
                      <tr>
                        <th>Customer Name</th>
                        <td>{order.customer?.customerName}</td>
                      </tr>
                      <tr>
                        <th>Mobile Number</th>
                        <td>{order.customer?.mobileNumber}</td>
                      </tr>
                      <tr>
                        <th>House Number</th>
                        <td>{order.customer?.houseNumber}</td>
                      </tr>
                      <tr>
                        <th>Street Name</th>
                        <td>{order.customer?.streetName}</td>
                      </tr>
                      <tr>
                        <th>Landmark</th>
                        <td>{order.customer?.landmark}</td>
                      </tr>
                      <tr>
                        <th>Pin Code</th>
                        <td>{order.customer?.pinCode}</td>
                      </tr>
                      <tr>
                        <th>City</th>
                        <td>{order.customer?.city}</td>
                      </tr>
                      <tr>
                        <th>State</th>
                        <td>{order.customer?.state}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="order-details">
                  <h1>Order Details</h1>
                  <table>
                    <thead>
                      <tr>
                        <th>SNo.</th>
                        <th>Product Id</th>
                        <th>Product Name</th>
                        <th>Product Size</th>
                        <th>Product Quantity</th>
                        <th>Product Price</th>
                        <th>Product MRP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems?.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td>{itemIndex + 1}</td>
                          <td>{item.productId}</td>
                          <td>{item.productName}</td>
                          <td>{item.productSize}</td>
                          <td>{item.productQuantity}</td>
                          <td>₹{item.productPrice}</td>
                          <td>₹{item.productMRP}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ul className="order-summary">
                    <li>Total Number of Items = {order.orderItems?.length || 0}</li>
                    <li>
                      Total Quantity ={" "}
                      {order.orderItems?.reduce(
                        (total, item) => total + parseInt(item.productQuantity, 10),
                        0
                      )}
                    </li>
                    <li>Subtotal = ₹{Number(order.subtotal || 0).toFixed(2)}</li>
                    <li>
                      Delivery Charge = ₹{Number(order.deliveryCharge || 0).toFixed(2)}
                    </li>
                    <li>
                      Total Bill Amount = ₹
                      {Number(order.totalAmount || 0).toFixed(2)}
                    </li>
                    <li>Mode of Payment = {order.paymentMethod}</li>
                    <li>Order Status = {getStatusLabel(order)}</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
          ))
        )}
      </div>
    </>
  );
}
