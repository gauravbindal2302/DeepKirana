import { Header1 } from "../Admin";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard({ title }) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/orders`)
      .then((response) => setOrders(response.data || []))
      .catch((error) => console.error("Failed to load dashboard stats:", error));
  }, [SERVER_URL]);

  const stats = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        if (order.orderStatus === "Delivered") acc.delivered += 1;
        else if (order.orderStatus === "Cancelled") acc.cancelled += 1;
        else acc.active += 1;
        return acc;
      },
      { total: 0, active: 0, delivered: 0, cancelled: 0 }
    );
  }, [orders]);

  return (
    <>
      <Header1 />
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <h1>Admin Dashboard</h1>
          <p>Manage products, orders, and customer communication in one place.</p>
        </section>

        <section className="dashboard-stats">
          <article className="stat-card">
            <p>Total Orders</p>
            <h2>{stats.total}</h2>
          </article>
          <article className="stat-card">
            <p>Active Orders</p>
            <h2>{stats.active}</h2>
          </article>
          <article className="stat-card">
            <p>Delivered</p>
            <h2>{stats.delivered}</h2>
          </article>
          <article className="stat-card">
            <p>Cancelled</p>
            <h2>{stats.cancelled}</h2>
          </article>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Categories and Products</h3>
            <p>Add, view, update, and delete products quickly.</p>
            <div className="operations">
              <Link to="/admin/dashboard/add">
                <button type="button" className="admin-button">
                  Add
                </button>
              </Link>
              <Link to="/admin/dashboard/view">
                <button type="button" className="admin-button">
                  View
                </button>
              </Link>
              <Link to="/admin/dashboard/update">
                <button type="button" className="admin-button">
                  Update
                </button>
              </Link>
              <Link to="/admin/dashboard/delete">
                <button type="button" className="admin-button">
                  Delete
                </button>
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-head">
              <h3>Orders Management</h3>
              <span className="feature-pill">New Feature</span>
            </div>
            <p>Search orders by Order ID or Product ID, then update status instantly.</p>
            <div className="order-buttons">
              <Link to="/admin/dashboard/ordersReceived">
                <button type="button" className="admin-button">
                  Manage Orders
                </button>
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Messages Received</h3>
            <p>Review and respond to latest customer messages.</p>
            <div className="order-buttons">
              <Link to="/admin/dashboard/messagesReceived">
                <button type="button" className="admin-button">
                  Check Messages
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
