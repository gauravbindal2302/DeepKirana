import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import Account from "./Account/Account";

const Header = () => {
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/">
          <span>Deep Store</span>
        </Link>
        <Link to="/admin">
          <span className="log-reg">Login | Register</span>
        </Link>
      </div>
    </div>
  );
};

const Header1 = () => {
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/">
          <span>Deep Store</span>
        </Link>
        <Link to="/admin/dashboard">
          <span className="go-to-dashboard">Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

const CRUD = () => {
  return (
    <div className="CRUD">
      <Link to="/admin/dashboard/add">
        <button type="submit" className="CRUD-button">
          Add
        </button>
      </Link>
      <Link to="/admin/dashboard/view">
        <button type="submit" className="CRUD-button">
          View
        </button>
      </Link>
      <Link to="/admin/dashboard/update">
        <button type="submit" className="CRUD-button">
          Update
        </button>
      </Link>
      <Link to="/admin/dashboard/delete">
        <button type="submit" className="CRUD-button">
          Delete
        </button>
      </Link>
    </div>
  );
};
function Admin({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <>
      <div className="admin-page">
        <Account />
      </div>
    </>
  );
}

export { Admin, Header, Header1, CRUD };
