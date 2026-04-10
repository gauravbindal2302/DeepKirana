import { Header1 } from "../Admin";
import { useState, useEffect } from "react";
import axios from "axios";
import "./OrdersReceived.css";

export default function OrdersReceived({ title }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const NEXT_STATUS = {
    "Order Placed": "Order Confirmed",
    "Order Confirmed": "Order Packed",
    "Order Packed": "Out for Delivery",
    "Out for Delivery": "Delivered",
  };

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
      await axios.patch(`${SERVER_URL}/orders/${orderId}/status`, { status });
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
        {loading ? (
          <h1>Loading orders...</h1>
        ) : orders.length === 0 ? (
          <h1>No orders received yet.</h1>
        ) : (
          orders.map((order) => (
          <div key={order._id} className="main-row">
            <div className="first-row">Order Id: {order._id}</div>
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
                  <li>Order Status = {order.orderStatus}</li>
                </ul>
                {NEXT_STATUS[order.orderStatus] ? (
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(order._id, NEXT_STATUS[order.orderStatus])
                    }
                    className="confirm-order"
                  >
                    Move to {NEXT_STATUS[order.orderStatus]}
                  </button>
                ) : (
                  <button className="confirm-order confirmed">{order.orderStatus}</button>
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
