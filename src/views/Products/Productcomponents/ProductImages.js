import axios from "axios";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { isAutheticated } from "src/auth";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductsImages = (props) => {
  const token = isAutheticated();
  const navigate = useNavigate();

  const productId = props.productId;
  const { images, setImages } = props.data;
  const { loading, setLoading } = props.loading;
  const [deleting, setDeleting] = useState(false);
  const [imagesPreview, setImagesPreview] = useState([]);

  const [data, setData] = useState({
    image: [],
    imageURL: [],
  });

  useEffect(() => {
    if (images?.length > 0) {
      setData((prev) => ({
        ...prev,
        imageURL: images?.url,
      }));
      setImagesPreview(images);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.id === "image") {
      if (
        e.target.files[0]?.type === "image/jpeg" ||
        e.target.files[0]?.type === "image/png" ||
        e.target.files[0]?.type === "image/jpg"
      ) {
        if (imagesPreview.length >= 4) {
          swal({
            title: "Warning",
            text: "Maximum of four images can be uploaded.",
            icon: "error",
            button: "Close",
            dangerMode: true,
          });
          return;
        }

        const files = Array.from(e.target.files);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.readyState === 2) {
              setImagesPreview((old) => [...old, reader.result]);
            }
          };
          reader.readAsDataURL(file);
        });

        setData((prev) => ({
          ...prev,
          image: [...data.image, ...e.target.files],
        }));
        return;
      } else {
        swal({
          title: "Warning",
          text: "Upload jpg, jpeg, or png only.",
          icon: "error",
          button: "Close",
          dangerMode: true,
        });
        e.target.value = null;
        return;
      }
    }
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleDelete = (id, imageUrl) => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: {
        Yes: { text: "Yes", value: true },
        Cancel: { text: "Cancel", value: "cancel" },
      },
    }).then((value) => {
      if (value === true) {
        setDeleting(true);
        axios
          .delete(`/api/product/image/${productId}/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            setDeleting(false);
            const filteredImages = imagesPreview.filter((img) => img !== imageUrl);
            setImagesPreview(filteredImages);
            setImages(filteredImages);
          })
          .catch(() => {
            setDeleting(false);
            swal({
              title: "Error",
              text: "Could not delete image. Try again.",
              icon: "error",
              button: "Retry",
              dangerMode: true,
            });
          });
      }
    });
  };

  const handleSubmit = () => {
    if (data.image?.length < 1) {
      swal({
        title: "Warning",
        text: "Please select a product image.",
        icon: "warning",
        button: "Ok",
        dangerMode: true,
      });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    data.image.forEach((singleImage) => formData.append("image", singleImage));

    axios
      .patch(`/api/product/update/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        swal({
          title: "Saved",
          text: "Product image saved successfully!",
          icon: "success",
          button: "Close",
        });
        navigate("/products")
        setImages((prev) => [...prev, res.data?.image]);
        setImagesPreview((prev) => [...prev, res.data?.image.url]);
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
        <h5>Product Images</h5>
      </div>
      <div className="my-3">
        <div className="row">
          <div className="col-lg-9">
            <input
              type="file"
              className="form-control"
              id="image"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
          </div>
          <div className="col-lg-3">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!productId || loading}
            >
              {loading ? "Loading" : "Upload"}
            </button>
          </div>
        </div>
        <p className="pt-1 pl-2 text-secondary">Upload jpg, jpeg, and png only*</p>
        <div>
          <strong className="fs-6 fst-italic">
            *Please upload a maximum of four images.
          </strong>
        </div>
        <div className="d-flex flex-wrap mt-3">
          {imagesPreview.map((image, index) => (
            <div key={index} className="position-relative m-2">
              <img
                src={image?.url || image}
                alt="Uploaded Image"
                style={{ maxHeight: "100px", maxWidth: "100%" }}
                className="border rounded"
              />
              {/* <button
                onClick={() => handleDelete(image._id, image)}
                className="position-absolute top-0 start-0 m-1 p-1 bg-danger text-white rounded-circle border-0"
                style={{ cursor: "pointer" }}
              >
                <FaTrashAlt size={12} />
              </button> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsImages;
