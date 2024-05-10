import { Header1, CRUD } from "../Admin";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Delete.css";

export default function Delete({ title }) {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const [categories, setCategories] = useState([]);
  const [selectedCategory1, setSelectedCategory1] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [categoryProducts, setCategoryProducts] = useState([]);

  useEffect(() => {
    document.title = title;
    getCategoryNames();
  }, [title]);

  useEffect(() => {
    if (selectedCategory2) {
      const category = categories.find(
        (category) => category.category === selectedCategory2
      );
      setCategoryProducts(category ? category.products : []);
    } else {
      setCategoryProducts([]);
    }
  }, [selectedCategory2, categories]);

  const handleDeleteCategory = async (event) => {
    event.preventDefault();
    if (!selectedCategory1) {
      alert("Please select a category to delete");
      return;
    }

    try {
      await axios.delete(
        `${SERVER_URL}/admin/dashboard/delete/${selectedCategory1}`
      );
      alert(`Category (${selectedCategory1}) deleted successfully!`);
      setSelectedCategory1("");
      getCategoryNames();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDeleteProduct = async (event) => {
    event.preventDefault();
    if (!selectedCategory2 || !selectedProduct) {
      alert("Please select both category and product to delete.");
      return;
    }

    try {
      await axios.delete(
        `${SERVER_URL}/admin/dashboard/delete/${selectedCategory2}/${selectedProduct}`
      );
      alert(`Product (${selectedProduct}) deleted successfully!`);
      setSelectedProduct("");
      // You can add logic here to refresh the product list if needed
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const getCategoryNames = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <>
      <Header1 />
      <CRUD />
      <div className="dashboard-row">
        <div className="dashboard-col-1">
          <h1>Delete Category</h1>
          <table className="view-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Categories</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category._id}>
                  <td>{index + 1}</td>
                  <td>{category.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={handleDeleteCategory}>
            <select
              name=""
              value={selectedCategory1}
              onChange={(event) => setSelectedCategory1(event.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.category}>
                  {category.category}
                </option>
              ))}
            </select>
            <button type="submit" className="admin-btn">
              Delete Category
            </button>
          </form>
        </div>
        <div className="dashboard-col-2">
          <h1>Delete Product</h1>
          <form onSubmit={handleDeleteProduct}>
            <select
              value={selectedCategory2}
              onChange={(event) => setSelectedCategory2(event.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.category}>
                  {category.category} (Total: {category.products.length}{" "}
                  {category.products.length === 1 ? "product" : "products"})
                </option>
              ))}
            </select>
            <select
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
              style={{ margin: "5px 0" }}
            >
              <option value="">Select Product</option>
              {categoryProducts.map((product) => (
                <option key={product._id} value={product.productName}>
                  {product.productName}
                </option>
              ))}
            </select>
            <button type="submit" className="admin-btn">
              Delete Product
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
