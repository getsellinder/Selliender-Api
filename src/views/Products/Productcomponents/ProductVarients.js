import axios from "axios";
import React from "react";
import swal from "sweetalert";
import { isAutheticated } from "src/auth";

const ProductVarients = (props) => {
  const token = isAutheticated();
  const productId = props.productId;
 
  const taxes = props.taxes;
  const sizes = props.sizes;
  const { varients, setVarients } = props.data;
  const { loading, setLoading } = props.loading;
  const addVarientRow = () => {
    setVarients((prev) => [
      ...prev,
      {
        variant_Name: "",
        weight: "",
        volume: "",
        price: "",
        gst_Id: "",
      },
    ]);
  };

  const handleChange = (e, idx) => {
    if (
      e.target.name === "weight" &&
      e.target.value !== "" &&
      !/^[0-9.]+$/.test(e.target.value)
    )
      return;
    if (
      e.target.name === "price" &&
      e.target.value !== "" &&
      !/^[0-9.]+$/.test(e.target.value)
    )
      return;
    let clone = [...varients];
    let obj = clone[idx];
    // if (e.target.name === "gst_Id") {
    // }
    obj[e.target.name] = e.target.value;
    clone[idx] = obj;
    setVarients([...clone]);
  };
  //  variant_Name: "",
  //       weight: "",
  //       volume: "",
  //       price: "",
  //       gst_Name: "",
  //       gst_Rate: "",
  //       gst_Id: "",
  const handleSubmit = () => {
    const emptyVarients = varients.filter(
      (e) =>
        !(e.variant_Name === "" && e.price === "" && e.gst_Id === "") &&
        (e.variant_Name === "" || e.price === "" || e.gst_Id === "")
    );

    if (emptyVarients.length !== 0) {
      swal({
        title: "Warning",
        text: "Fill all fields of a row",
        icon: "warning",
        button: "Return",
      });
      return;
    }

    // const variant_Name = [];
    // varients.map((e) => e.variant_Name && variant_Name.push(e.variant_Name));
    // const duplicate = variant_Name.filter(
    //   (e) => sizes.indexOf(e) !== sizes.lastIndexOf(e)
    // );
    // if (duplicate.length !== 0) {
    //   swal({
    //     title: "Warning",
    //     text: "Duplicate sizes selected!",
    //     icon: "warning",
    //     button: "Return",
    //   });
    //   return;
    // }

    const varientData = varients.filter((e) => e.variant_Name !== "");
    const emptyVariants = varients.reduce(
      (arr, e) =>
        e.gst_Id !== "" && e.variant_Name === "" && e.price === ""
          ? [...arr, e._id]
          : arr,
      []
    );
    setLoading(true);
    axios
      .patch(
        `/api/product/update/${productId}`,
        { variants: varientData, delete_variants: emptyVariants },
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
          text: "Product variants saved successfully!",
          icon: "success",
          button: "Close",
        });
        setVarients((prev) =>
          res?.data?.variants?.length > 0 ? [...res?.data?.variants] : prev
        );
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
      <div className="d-flex justify-content-between">
        <h5>Product Variants</h5>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => handleSubmit()}
          disabled={!productId || loading}
        >
          {productId
            ? loading
              ? "Loading"
              : "Save Varients"
            : "First Save Product Details then Save Varients"}
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            {/* <th scope="col">Size</th> */}
            <th scope="col">Variant Name</th>
            <th scope="col">Price</th>

            {/* <th scope="col">Weight (in Grams)</th> */}
            {/* <th scope="col">Show in E-store</th> */}
            <th scope="col">Tax</th>
          </tr>
        </thead>
        <tbody>
          {varients.map((r, idx) => (
            <tr key={idx}>
              {/* <td>
                <select
                  name="size"
                  value={r.size}
                  onChange={(e) => handleChange(e, idx)}
                  className="form-control"
                >
                  <option value="">---select---</option>
                  {sizes &&
                    sizes.map((item, index) => (
                      <option value={item._id} key={index}>
                        {item.size}
                      </option>
                    ))}
                </select>
              </td> */}
              <td>
                <input
                  type="text"
                  className="form-control"
                  name="variant_Name"
                  value={r.variant_Name}
                  onChange={(e) => handleChange(e, idx)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={r.price}
                  onChange={(e) => handleChange(e, idx)}
                />
              </td>
              {/* <td>
                <input
                  type="text"
                  className="form-control"
                  name="weight"
                  value={r.weight}
                  onChange={(e) => handleChange(e, idx)}
                />
              </td> */}
              {/* <td>
                <select
                  name="show_in_estore"
                  value={r.show_in_estore}
                  onChange={(e) => handleChange(e, idx)}
                  className="form-control"
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </td> */}
              <td>
                <select
                  name="gst_Id"
                  value={r.gst_Id?._id ? r.gst_Id?._id : r.gst_Id}
                  onChange={(e) => handleChange(e, idx)}
                  className="form-control"
                >
                  <option value="">---select---</option>
                  {taxes &&
                    taxes.map((item, index) => (
                      <option value={item._id} key={index}>
                        {item.tax} %{item.name}
                      </option>
                    ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => addVarientRow()}
        >
          Add another variant
        </button>
      </div>
    </>
  );
};

export default ProductVarients;
