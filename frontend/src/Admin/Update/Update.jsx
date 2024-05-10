import React, { useState, useEffect } from "react";
import { Header1, CRUD } from "../Admin";
import axios from "axios";

export default function Update({ title }) {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const [categories, setCategories] = useState([]);
  const [selectedCategory1, setSelectedCategory1] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [updatedCategoryImage, setUpdatedCategoryImage] = useState("");
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [updatedProductImage, setUpdatedProductImage] = useState("");
  const [updatedProductName, setUpdatedProductName] = useState("");
  const [updatedProductPrice, setUpdatedProductPrice] = useState("");
  const [updatedProductMrp, setUpdatedProductMrp] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productDescription, setProductDescription] = useState("");

  useEffect(() => {
    document.title = title;
    getCategoryNames();
  }, [title]);

  useEffect(() => {
    const selectedCategoryValue = selectedCategory1;
    if (selectedCategoryValue) {
      const category = categories.find(
        (category) => category.category === selectedCategoryValue
      );
      setCategoryProducts(category ? category.products : []);
      setSelectedProduct("");
    } else {
      setCategoryProducts([]);
      setSelectedProduct("");
    }
  }, [selectedCategory1, categories]);

  useEffect(() => {
    const selectedCategoryValue = selectedCategory2;
    if (selectedCategoryValue) {
      const category = categories.find(
        (category) => category.category === selectedCategoryValue
      );
      setCategoryProducts(category ? category.products : []);
      setSelectedProduct("");
    } else {
      setCategoryProducts([]);
      setSelectedProduct("");
    }
  }, [selectedCategory2, categories]);

  const getCategoryNames = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleUpdateCategory = async (event) => {
    event.preventDefault();
    const selectedCategory = selectedCategory1 || selectedCategory2;

    if (!selectedCategory || (!updatedCategoryImage && !updatedCategoryName)) {
      alert("Please fill in either category name or select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("categoryImage", updatedCategoryImage);
      formData.append("categoryName", updatedCategoryName);

      await axios.put(
        `${SERVER_URL}/admin/dashboard/update/${selectedCategory}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(`Category (${selectedCategory}) updated successfully!`);
      setSelectedCategory1("");
      setSelectedCategory2("");
      setUpdatedCategoryImage("");
      setUpdatedCategoryName("");
      getCategoryNames();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!selectedCategory2 || !selectedProduct) {
      alert("Please select both category and product to update.");
      return;
    }

    let updatedProductSize = productSize; // Initialize with the current productSize

    // If Customizable checkbox is not selected, set productSize to "Non-Customizable"
    if (productSize !== "Customizable") {
      updatedProductSize = "Non-Customizable";
    }

    try {
      const formData = new FormData();
      formData.append("category", selectedCategory2);
      formData.append("product", selectedProduct);
      formData.append("productName", updatedProductName);
      formData.append("productPrice", updatedProductPrice);
      formData.append("productMrp", updatedProductMrp);
      formData.append("productSize", updatedProductSize); // Use the updated productSize
      formData.append("productDescription", productDescription);

      // Add this part to handle the product image
      if (updatedProductImage) {
        formData.append("productImage", updatedProductImage);
      }

      await axios.put(
        `${SERVER_URL}/admin/dashboard/update/product/${selectedCategory2}/${selectedProduct}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`Product (${selectedProduct}) updated successfully!`);
      // Clear or update state as needed
      setUpdatedProductName("");
      setUpdatedProductPrice("");
      setUpdatedProductMrp("");
      setProductSize(updatedProductSize); // Update the productSize in the state
      setProductDescription("");
      setUpdatedProductImage(""); // Clear the product image state as well
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <>
      <Header1 />
      <CRUD />
      <div className="dashboard-row">
        <div className="dashboard-col-1">
          <h1>Update Category</h1>
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
          <form onSubmit={handleUpdateCategory} encType="multipart/form-data">
            <select
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
            <input
              type="file"
              id="categoryImage"
              name="categoryImage"
              accept="image/*"
              placeholder="Select category image"
              onChange={(event) =>
                setUpdatedCategoryImage(event.target.files[0])
              }
            />
            <input
              type="name"
              placeholder="Update Category Name"
              value={updatedCategoryName}
              onChange={(event) => setUpdatedCategoryName(event.target.value)}
            />
            <button type="submit" className="admin-btn">
              Update Category
            </button>
          </form>
        </div>
        <div className="dashboard-col-2">
          <h1>Update Product</h1>
          <form onSubmit={handleUpdateProduct} encType="multipart/form-data">
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
            <input
              type="file"
              id="productImage"
              name="productImage"
              accept="image/*"
              placeholder="Select product image"
              onChange={(event) =>
                setUpdatedProductImage(event.target.files[0])
              }
            />

            <input
              type="name"
              name="productName"
              value={updatedProductName}
              placeholder="Product Name"
              onChange={(event) => setUpdatedProductName(event.target.value)}
            />
            <input
              type="name"
              name="productPrice"
              value={updatedProductPrice}
              placeholder="Product Price"
              onChange={(event) => setUpdatedProductPrice(event.target.value)}
            />
            <input
              type="name"
              name="productMrp"
              value={updatedProductMrp}
              placeholder="Product MRP"
              onChange={(event) => setUpdatedProductMrp(event.target.value)}
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
            <button
              type="submit"
              className="admin-btn"
              onClick={handleUpdateProduct}
            >
              Update Product
            </button>
          </form>
        </div>{" "}
      </div>
    </>
  );
}
