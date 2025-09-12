import axios from "axios";
import React from "react";
import swal from "sweetalert";
import { isAutheticated } from "src/auth";

const ProductDetails = (props) => {
  const token = isAutheticated();
  const { data, setData } = props.data;
  const { productId, setProductId } = props.ProductId;
  const { loading, setLoading } = props.loading;
  const taxes = props.taxes;
  const categories = props?.categories || [];

  const handleChange = (e) => {
    if (e.target.id === "master_price" && /^\D+$/.test(e.target.value)) return;
    if (
      e.target.id === "discontinue_on" &&
      new Date(e.target.value) < new Date()
    ) {
      return setData((prev) => ({
        ...prev,
        [e.target.id]: new Date().toISOString().slice(0, 10),
      }));
    }
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = () => {
    if (
      !data.name.trim() ||
      !data.master_price ||
      !data.master_GST ||
      !data.category ||
      !data.description ||
      !data.product_Status
    ) {
      swal({
        title: "Warning",
        text: "Fill all mandatory fields",
        icon: "warning",
        button: "Return",
      });
      return;
    }
    setLoading(true);
    axios
      .post(
        `/api/product/create/`,
        { ...data, product_id: productId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        swal({
          title: "Saved",
          text: "Product details saved successfully!",
          icon: "success",
          button: "Close",
        });
        setProductId(res.data.product_id);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Something went wrong!";
        swal({
          title: "Warning",
          text: msg,
          icon: "warning",
          button: "Close",
        });
        setLoading(false);
      });
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h5>Product Details</h5>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading" : "Save Details"}
        </button>
      </div>

      <div className="mb-3 row">
        <div className="col-md-6 d-flex align-items-center">
          <label
            htmlFor="name"
            className="form-label me-2 mb-0"
            style={{ minWidth: "120px" }}
          >
            Product Name*
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={data.name}
            maxLength="50"
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3 row">
        <div className="col-lg-6">
          <label htmlFor="category" className="form-label">
            Category *
          </label>
          <select
            id="category"
            onChange={handleChange}
            className="form-control"
            value={data.category}
          >
            <option value="">---select---</option>
            {categories.map((item, index) => (
              <option value={item._id} key={index}>
                {item.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-lg-6">
          <label htmlFor="product_Status" className="form-label">
            Product Status *
          </label>
          <select
            className="form-control"
            id="product_Status"
            value={data.product_Status}
            onChange={handleChange}
          >
            <option value="">--Select--</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="mb-3 row">
        <div className="col-lg-6">
          <label htmlFor="master_price" className="form-label">
            Price*
          </label>
          <input
            type="text"
            className="form-control"
            id="master_price"
            value={data.master_price}
            maxLength="6"
            onChange={handleChange}
          />
        </div>

        <div className="col-lg-6">
          <label htmlFor="master_GST" className="form-label">
            GST
          </label>
          <select
            id="master_GST"
            className="form-control"
            value={data.master_GST}
            onChange={handleChange}
          >
            <option value="">---select---</option>
            {taxes.map((item, index) => (
              <option value={item._id} key={index}>
                {item.tax} % {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description*
        </label>
        <textarea
          className="form-control"
          id="description"
          value={data.description}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="special_instructions" className="form-label">
          Special Instructions
        </label>
        <textarea
          className="form-control"
          id="special_instructions"
          value={data.special_instructions}
          onChange={handleChange}
          style={{ minHeight: "100px" }}
        />
      </div>
    </>
  );
};

export default ProductDetails;
