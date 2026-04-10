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

  const filteredOrders = useMemo(() => {
    const query = String(searchValue || "").trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => {
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
  }, [orders, searchValue]);

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
        <div className="orders-search-bar">
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by Order ID or Product ID"
          />
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
          <div key={order._id} className="main-row">
            <div className="first-row">
              <p>
                <strong>Order Id:</strong> {order._id}
              </p>
              <p>
                <strong>Order Date & Time:</strong> {formatOrderDateTime(order.createdAt)}
              </p>
              <p>
                <strong>Customer Email:</strong> {order?.customer?.customerEmail || "N/A"}
              </p>
            </div>
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
                      (total, item) => total + parseInt(item.productQuantity),
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
                  <li>
                    Order Status = {getStatusLabel(order)}
                  </li>
                </ul>
                {NEXT_STATUS[order.orderStatus] ? (
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(order._id, NEXT_STATUS[order.orderStatus])
                    }
                    className={`confirm-order status-${getStatusClass(order.orderStatus)}`}
                  >
                    Move to {NEXT_STATUS[order.orderStatus]}
                  </button>
                ) : (
                  <button
                    className={`confirm-order confirmed status-${getStatusClass(order.orderStatus)}`}
                  >
                    {getStatusLabel(order)}
                  </button>
                )}
                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" ? (
                  <button
                    onClick={() => handleUpdateOrderStatus(order._id, "Cancelled")}
                    className="delivery-status"
                  >
                    Cancel Order
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </>
  );
}
