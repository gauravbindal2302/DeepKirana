import { Header1, CRUD } from "../Admin";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Add.css";

export default function Add({ title }) {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [productImage, setProductImage] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productMrp, setProductMrp] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    document.title = title;
    getCategoryNames();
  }, [title]);

  const submitCategory = async (event) => {
    event.preventDefault();

    // Check if the category name and image are empty
    if (!categoryName || !event.target.image.files[0]) {
      alert("Please fill in all fields");
      return; // Prevent form submission
    }

    const formData = new FormData();
    formData.append("category", categoryName);
    formData.append("image", categoryImage);

    try {
      const response = await axios.post(
        `${SERVER_URL}/admin/dashboard/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        alert(`Category (${categoryName}) added successfully!`);
        setCategoryImage(null);
        setCategoryName("");
        getCategoryNames();
      } else {
        console.log("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
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

  const submitProduct = async (event) => {
    event.preventDefault();

    if (
      !selectedCategory ||
      !productImage ||
      !productName ||
      !productPrice ||
      !productMrp ||
      !productSize ||
      !productDescription
    ) {
      alert("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("category", selectedCategory);
    formData.append("image", productImage);
    formData.append("productName", productName);
    formData.append("productPrice", productPrice);
    formData.append("productMrp", productMrp);
    formData.append("productDescription", productDescription);

    // Check the value of productSize and append it conditionally
    if (productSize === "customizable") {
      formData.append("productSize", "Customizable");
    } else if (productSize === "non-customizable") {
      formData.append("productSize", "Non-Customizable");
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/admin/dashboard/add-product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        alert(`Product (${productName}) added successfully!`);
        setSelectedCategory("");
        setProductImage("");
        setProductName("");
        setProductPrice("");
        setProductMrp("");
        setProductSize("");
        setProductDescription("");
      } else {
        console.log("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <>
      <Header1 />
      <CRUD />
      <div className="dashboard-row">
        <div className="dashboard-col-1">
          <h1>Add Category</h1>
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
          <form onSubmit={submitCategory} encType="multipart/form-data">
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              placeholder="Select product image"
              onChange={(event) => setCategoryImage(event.target.files[0])}
            />
            <input
              type="name"
              name="category"
              placeholder="Add Category"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
            <button type="submit" className="admin-btn">
              Add Category
            </button>
          </form>
        </div>
        <div className="dashboard-col-2">
          <h1>Add Product</h1>
          <form onSubmit={submitProduct} encType="multipart/form-data">
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option>Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.category}>
                  {category.category} (Total: {category.products.length}{" "}
                  {category.products.length === 1 ? "product" : "products"})
                </option>
              ))}
            </select>

            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              placeholder="Select product image"
              onChange={(event) => setProductImage(event.target.files[0])}
            />
            <input
              type="name"
              name="productName"
              value={productName}
              placeholder="Product Name"
              onChange={(event) => setProductName(event.target.value)}
            />
            <input
              type="name"
              name="productPrice"
              value={productPrice}
              placeholder="Product Price"
              onChange={(event) => setProductPrice(event.target.value)}
            />
            <input
              type="name"
              name="productMrp"
              value={productMrp}
              placeholder="Product MRP"
              onChange={(event) => setProductMrp(event.target.value)}
            />
            <div className="size">
              <label>Size:</label>
              <div className="checkboxes">
                <div className="check-box">
                  <input
                    type="checkbox"
                    id="customizable"
                    checked={productSize === "customizable"}
                    onChange={() => setProductSize("customizable")}
                  />
                  <label htmlFor="customizable">Customizable</label>
                </div>
                <div className="check-box">
                  <input
                    type="checkbox"
                    id="non-customizable"
                    checked={productSize === "non-customizable"}
                    onChange={() => setProductSize("non-customizable")}
                  />
                  <label htmlFor="non-customizable">Non-Customizable</label>
                </div>
              </div>
            </div>

            <textarea
              placeholder="Product Description"
              name="productDescription"
              id=""
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
            />
            <button type="submit" className="admin-btn">
              Add Product
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
