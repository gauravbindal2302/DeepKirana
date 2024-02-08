import { Header1, CRUD } from "../Admin";
import { useState, useEffect } from "react";
import axios from "axios";
import "./View.css";

export default function View({ title }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    document.title = title;
    getCategoryNames();
  }, [title]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(
        (category) => category.category === selectedCategory
      );
      setFilteredProducts(category ? category.products : []);
      setSelectedProduct("");
    } else {
      setFilteredProducts([]);
      setSelectedProduct("");
    }
  }, [selectedCategory, categories]);

  const getCategoryNames = async () => {
    try {
      const response = await axios.get(
        "https://deep-kirana-server.vercel.app/categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getSelectedProductDetails = () => {
    if (selectedProduct) {
      const product = filteredProducts.find(
        (product) => product.productName === selectedProduct
      );
      return product;
    }
    return null;
  };

  const selectedProductDetails = getSelectedProductDetails();

  return (
    <>
      <Header1 />
      <CRUD />
      <div className="dashboard-row-view">
        <div className="dashboard-col-1">
          <h1>View Category</h1>
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
        </div>
        <div className="dashboard-col-2">
          <h1>View Product</h1>
          <select
            id="view-select-1"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
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
            id="view-select-2"
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(event.target.value)}
          >
            <option value="">Select Product</option>
            {filteredProducts.map((product) => (
              <option key={product._id} value={product.productName}>
                {product.productName}
              </option>
            ))}
          </select>
          <table className="view-table" id="view-table-2">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Product</th>
                <th>Image</th>
                <th>Price</th>
                <th>Mrp</th>
                <th>Size</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {selectedProductDetails && (
                <tr>
                  <td>1</td>
                  <td>{selectedProductDetails.productName}</td>
                  <td>
                    {selectedProductDetails.productImage && (
                      <img
                        src={
                          "https://deep-kirana-server.vercel.app/uploads/" +
                          selectedProductDetails.productImage
                        }
                        alt={selectedProductDetails.productName}
                      />
                    )}
                  </td>

                  <td>₹{selectedProductDetails.productPrice}</td>
                  <td>₹{selectedProductDetails.productMrp}</td>
                  <td>{selectedProductDetails.productSize}</td>
                  <td>{selectedProductDetails.productDescription}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
