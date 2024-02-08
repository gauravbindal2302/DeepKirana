import { Header1 } from "../Admin";
import { useState, useEffect } from "react";
import "./OrdersReceived.css";

export default function OrdersReceived({ title }) {
  const orderDetails = [
    {
      orderId: "12364554",
      customers: [
        {
          customerName: "Shubham Papneja",
          mobileNumber: "4598127865",
          houseNumber: "B-74",
          streetName: "Chandni Chowk",
          landmark: "Main Bazaar",
          pinCode: "459815",
          city: "Ghaziabad",
          state: "Madhya Pradesh",
        },
      ],
      orderItems: [
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Tata Tea Premium",
          productSize: "250gm",
          productQuantity: "2",
          productPrice: "50.00",
          productMRP: "60.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
      ],
    },
    {
      orderId: "12364554",
      customers: [
        {
          customerName: "Shubham Papneja",
          mobileNumber: "4598127865",
          houseNumber: "B-74",
          streetName: "Chandni Chowk",
          landmark: "Main Bazaar",
          pinCode: "459815",
          city: "Ghaziabad",
          state: "Madhya Pradesh",
        },
      ],
      orderItems: [
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Tata Tea Premium",
          productSize: "250gm",
          productQuantity: "2",
          productPrice: "50.00",
          productMRP: "60.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
        {
          productId: "64f9f6531dbe0770ae356e2c",
          productName: "Nawazish Basmati Rice",
          productSize: "10Kg",
          productQuantity: "1",
          productPrice: "74.00",
          productMRP: "80.00",
        },
      ],
    },
    // Add more order details as needed
  ];
  const [orderConfirmed, setOrderConfirmed] = useState(
    new Array(orderDetails.length).fill(false)
  );
  const [orderSent, setOrderSent] = useState(
    new Array(orderDetails.length).fill(false)
  );

  const handleConfirmOrder = (orderIndex) => {
    const updatedOrderConfirmed = [...orderConfirmed];
    updatedOrderConfirmed[orderIndex] = true;
    setOrderConfirmed(updatedOrderConfirmed);
  };

  const handleDeliveryStatus = (orderIndex) => {
    if (orderConfirmed[orderIndex]) {
      const updatedOrderSent = [...orderSent];
      updatedOrderSent[orderIndex] = true;
      setOrderSent(updatedOrderSent);
    }
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Header1 />
      <div className="orders-ordered">
        {orderDetails.map((order, orderIndex) => (
          <div key={orderIndex} className="main-row">
            <div className="first-row">Order Id: {order.orderId}</div>
            <div className="second-row">
              {order.customers.map((customer, customerIndex) => (
                <div key={customerIndex} className="customer-details">
                  <h1>Customer Details</h1>
                  <table>
                    <tbody>
                      <tr>
                        <th>Customer Name</th>
                        <td>{customer.customerName}</td>
                      </tr>
                      <tr>
                        <th>Mobile Number</th>
                        <td>{customer.mobileNumber}</td>
                      </tr>
                      <tr>
                        <th>House Number</th>
                        <td>{customer.houseNumber}</td>
                      </tr>
                      <tr>
                        <th>Street Name</th>
                        <td>{customer.streetName}</td>
                      </tr>
                      <tr>
                        <th>Landmark</th>
                        <td>{customer.landmark}</td>
                      </tr>
                      <tr>
                        <th>Pin Code</th>
                        <td>{customer.pinCode}</td>
                      </tr>
                      <tr>
                        <th>City</th>
                        <td>{customer.city}</td>
                      </tr>
                      <tr>
                        <th>State</th>
                        <td>{customer.state}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
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
                    {order.orderItems.map((item, itemIndex) => (
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
                  <li>Total Number of Items = {order.orderItems.length}</li>
                  <li>
                    Total Quantity ={" "}
                    {order.orderItems.reduce(
                      (total, item) => total + parseInt(item.productQuantity),
                      0
                    )}
                  </li>
                  <li>
                    Total Bill Amount = ₹
                    {order.orderItems
                      .reduce(
                        (total, item) => total + parseFloat(item.productPrice),
                        0
                      )
                      .toFixed(2)}
                  </li>
                  <li>Mode of Payment = {}</li>
                </ul>
                {orderConfirmed[orderIndex] ? (
                  <button className="confirm-order confirmed">
                    Order Confirmed
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmOrder(orderIndex)}
                    className="confirm-order"
                  >
                    Confirm Order
                  </button>
                )}
                {orderConfirmed[orderIndex] && !orderSent[orderIndex] ? (
                  <button
                    onClick={() => handleDeliveryStatus(orderIndex)}
                    className="delivery-status"
                  >
                    Delivery Status
                  </button>
                ) : orderSent[orderIndex] ? (
                  <button className="delivery-status confirmed">Sent</button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
