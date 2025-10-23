import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isAutheticated } from "src/auth";
import swal from "sweetalert";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
// import PercentIcon from "@mui/icons-material/Percent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import AddressSelectionModal from "./AddressSelectionModal";

const Pos = () => {
  const token = isAutheticated();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [usersWithAddresses, setUsersWithAddresses] = useState([]);

  const getUsersWithAddresses = async () => {
    try {
      const usersResponse = await axios.get("/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = usersResponse.data.users;

      const usersWithAddressesPromises = users.map(async (user) => {
        try {
          const addressResponse = await axios.get(
            `/api/shipping/address/user/address/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const userWithAddress = {
            ...user,
            address: addressResponse.data?.UserShippingAddress || [],
          };
          return userWithAddress;
        } catch (error) {
          throw new Error(`Error fetching address for user ${user._id}`);
        }
      });

      const usersWithAddresses = await Promise.all(usersWithAddressesPromises);
      setUsersWithAddresses(usersWithAddresses);
    } catch (error) {
      swal({
        title: error,
        text: "Please login to access the resource or refresh the page.",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };

  useEffect(() => {
    getUsersWithAddresses();
  }, [token]);
  const [showData, setShowData] = useState(usersWithAddresses);
  const [currentUser, setCurrentUser] = useState(null);
  const [storedelivery, setStoreDelivery] = useState("");

  // Function to handle change in radio button selection
  const handleSalesTypeChange = (event) => {
    setSalesType(event.target.value);
  };
  const handlestoredeliveryChange = (event) => {
    setStoreDelivery(event.target.value);
  };
  useEffect(() => {
    setTimeout(() => {
      if (query !== "") {
        setCurrentUser(null);
        const lowerCaseQuery = query.toLowerCase(); // Convert query to lowercase

        const searchedResult = usersWithAddresses.filter((item) =>
          item.name.toString().toLowerCase().includes(lowerCaseQuery)
        );

        setShowData(searchedResult);
        setLoading(false);
      }
    }, 100);
  }, [query]);

  const handleClick = (id) => {
    setQuery("");
    const customer = usersWithAddresses.find((user) => user._id === id);
    setCurrentUser(customer);
  };

  // part 2*****************************8
  const [productData, setProductData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryValue, setCategoryValue] = useState("All");
  const [cartItem, setCartItem] = useState([]);
  const [individualSubtotals, setIndividualSubtotals] = useState([]);
  const [total, setTotal] = useState(0);
  // varient
  const [selectedVariants, setSelectedVariants] = useState({});

  const getAllProducts = async () => {
    try {
      const response = await axios.get("/api/product/getAll/user/");
      if (response.status === 200) {
        // setProductData(response?.data?.product);
        const activeProducts = response?.data?.product.filter(
          (product) => product.product_Status === "Active"
        );
        setProductData(activeProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getCaterogy = async () => {
    try {
      const response = await axios.get("/api/category/getCategories");
      if (response.status === 200) {
        setCategories(response?.data?.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "category") {
      setCategoryValue(value);
      setSelectedCategories((prevCategories) => {
        if (prevCategories.includes(value)) {
          return prevCategories.filter((category) => category !== value);
        } else {
          return [...prevCategories, value];
        }
      });
    }
  };
  const items = () => {
    setFilteredItems(
      productData?.filter((item) => {
        const categoryMatch =
          categoryValue === "All" ||
          item.category.categoryName === categoryValue;
        return categoryMatch;
      })
    );
  };

  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then(() => {
        getCaterogy();
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after data fetching
      });
  }, [token]);

  useEffect(() => {
    items();
  }, [categoryValue, productData]);
  const styles = {
    selectHeading: {
      fontFamily: "inter",
      fontWeight: "600",
      fontSize: "16px",
      color: "#6C7275",
      marginBottom: ".5rem",
    },
    tableContainer: {
      maxHeight: 360,
      height: 360,
      overflowY: "auto", // Enable vertical scrolling
    },
    headingStyle: {
      fontFamily: "inter",
      fontWeight: "600",
      fontSize: "16px",
      color: "#121212",
      width: "70%",
      borderBottom: "1px solid black",
    },
  };

  const addToCart = async (item) => {
    try {
      const selectedVariant = selectedVariants[item._id];
      if (selectedVariant) {
        // Fetch tax details using the gstdetails function
        const taxRate = selectedVariant?.gst_Id?.tax / 100;
        const taxAmount = selectedVariant.price * taxRate;
        const subtotal =
          parseFloat(selectedVariant.price) + parseFloat(taxAmount);

        const existingCartItemIndex = cartItem.findIndex(
          (cartItem) =>
            cartItem.product._id === item._id &&
            cartItem.variant._id === selectedVariant._id
        );

        if (existingCartItemIndex !== -1) {
          const newCart = [...cartItem];
          const existingCartItem = newCart[existingCartItemIndex];

          existingCartItem.quantity += 1;
          existingCartItem.subtotal =
            parseFloat(existingCartItem.quantity) *
            parseFloat(existingCartItem.subtotal);

          setCartItem(newCart);
          swal("Item quantity updated in cart", "", "success");
        } else {
          setCartItem([
            ...cartItem,
            {
              product: item,
              quantity: 1,
              variant: {
                _id: selectedVariant._id,
                gst_Id: selectedVariant.gst_Id,
                price: selectedVariant.price,
                volume: selectedVariant.volume,
                weight: selectedVariant.weight,
                variant_Name: selectedVariant.variant_Name,
              },
              subtotal: subtotal.toFixed(2), // Format the subtotal to two decimal places
            },
          ]);
          swal("Item added to cart", "", "success");
        }
      } 
    } catch (error) {
      console.error("Error adding item to cart:", error);
      swal("Error", "Failed to add item to cart", "error");
    }
  };

  const handleIncrease = (index) => {
    const newCart = [...cartItem];
    const item = newCart[index];
    const taxRate = item.variant?.gst_Id?.tax / 100;
    const taxAmount = item.variant?.price * taxRate;
    const price = item.variant ? item.variant?.price : item.product.price;
    const totalAmount =
      (item.quantity + 1) * (parseFloat(price) + parseFloat(taxAmount));

    newCart[index].quantity += 1;
    newCart[index].subtotal = totalAmount;

    setCartItem(newCart);
  };
  const handleDecrease = (index) => {
    const newCart = [...cartItem];
    const item = newCart[index];
    const taxRate = item.variant?.gst_Id?.tax / 100;
    const taxAmount = item.variant?.price * taxRate;
    const price = item.variant ? item.variant?.price : item.product.price;
    const totalAmount =
      (item.quantity - 1) * (parseFloat(price) + parseFloat(taxAmount));

    newCart[index].quantity -= 1;
    newCart[index].subtotal = totalAmount;

    setCartItem(newCart);
  };

  const removeCartItemHandler = (id, variant) => {
    const newCart = cartItem.filter(
      (item) => item.product._id !== id || item.variant._id !== variant
    );
    setCartItem(newCart);
  };

  // Calculate subtotal of all items in cart
  const calculateTotal = () => {
    let subtotal = 0;
    cartItem.forEach((item) => {
      subtotal += parseFloat(item.subtotal);
    });
    // Round the subtotal to two decimal places
    const roundedSubtotal = parseFloat(subtotal.toFixed(2));
    setTotal(roundedSubtotal);
  };

  useEffect(() => {
    calculateTotal();
  }, [cartItem]);

  // console.log(usersWithAddresses);
  const [showChangeAddress, setShowChangeAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    currentUser?.address[0]
  );
  useEffect(() => {
    setSelectedAddress(currentUser?.address[0]);
  }, [currentUser]);
  const handleChangeAddress = () => {
    setShowChangeAddress(true);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setShowChangeAddress(false);
  };

  const checkoutCash = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const cartData = cartItem.map((item) => ({
      product: item.product, // Entire product object
      quantity: item.quantity,
      variant: item.variant, // Entire variant object
      subtotal: item.subtotal,
    }));

    const order = {
      userr: currentUser._id,
      address: selectedAddress._id,
      cart: cartData,
      subtotal: total,
      orderType: "PointOfSale",
    };

    // Send POST request to backend API endpoint
    axios
      .post("/api/order/pos-checkout/", order, config)
      .then((response) => {
        // Handle successful response
        swal({
          title: "Order Placed!",
          text: `Order ID: ${
            response.data.order.orderID
          }\nDate and Time: ${new Date(
            response.data.order.createdAt
          ).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "numeric",
            hour12: true,
          })}`,
          icon: "success",
          button: "OK",
        });

        // Clear cart items, reset current user and address, and reset radio button states
        setCartItem([]);
        setCurrentUser(null);
        setSelectedAddress(null);
        setStoreDelivery("");
        setTotal(0);
        setCategoryValue("All");
      })
      .catch((error) => {
        // Handle errors
        console.error("Error placing order:", error);

        toast.error(
          "Error! There was an error placing your order. Please try again later."
        );
      });
  };

  // for QR Code
  const checkoutQRCode = async () => {
    try {
      const {
        data: { key },
      } = await axios.get(
        `/api/order/getRzpKey/${currentUser.name}/${currentUser.email}`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cartData = cartItem.map((item) => ({
        product: item.product, // Entire product object
        quantity: item.quantity,
        variant: item.variant, // Entire variant object
        subtotal: item.subtotal,
      }));

      const {
        data: { order },
      } = await axios.post(
        "/api/order/Rzpcheckout",
        {
          userr: currentUser._id,
          address: selectedAddress._id,
          cart: cartData,
          subtotal: total,
          orderType: "PointOfSale",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Smellika",
        description: "Smellika RazorPay",
        image:
          "https://res.cloudinary.com/dnmgivd1x/image/upload/v1707058241/bolo/Logo/aasy4ulmbbtqmcxi64j0.jpg",
        order_id: order.id,
        // callback_url:
        //   "http://localhost:5000/api/order/pos-paymentverification/",
        callback_url:
          "https://api.smellika.com/api/order/pos-paymentverification/",

        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#121212",
        },
      };

      const razor = new window.Razorpay(options);

      razor.on("payment.success", async function (response) {
        // Handle successful payment
        console.log("Payment successful:", response);
      });

      razor.open();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If error.response and its properties exist, handle the error message
        toast.error(error.response.data.message);
      } else {
        // If error.response or its properties are undefined, handle the error generically
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  // Function to set default variant for each product
  const setDefaultVariants = () => {
    const defaultVariants = {};
    filteredItems.forEach((item) => {
      defaultVariants[item._id] =
        item.variants && item.variants.length > 0 ? item.variants[0] : null;
    });
    setSelectedVariants(defaultVariants);
  };

  // Function to handle variant change
  const handleVariantChange = (productId, event) => {
    const selectedVariantName = event.target.value;
    const selectedVariant = filteredItems
      .find((item) => item._id === productId)
      ?.variants.find(
        (variant) => variant.variant_Name === selectedVariantName
      );
    setSelectedVariants((prevState) => ({
      ...prevState,
      [productId]: selectedVariant,
    }));
  };
  // console.log(selectedVariants);
  // console.log(cartItem);
  // Call setDefaultVariants when the component mounts
  useEffect(() => {
    setDefaultVariants();
  }, [filteredItems]);

  // console.log("currentUser", currentUser);
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          {/* Part 1: Top Part */}
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div
                  className="card-body"
                  style={{ backgroundColor: "#D3D3D3" }}
                >
                  {/* Customer search */}
                  <div
                    style={{
                      flex: "1",
                      display: "flex",
                      margin: "1rem 1rem 1rem 0rem",
                    }}
                  >
                    <Typography
                      style={{
                        fontWeight: "bold",
                        marginTop: "1rem",
                        marginRight: "2rem",
                      }}
                    >
                      Select Customer:
                    </Typography>
                    <TextField
                      style={{
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "1px solid grey",
                        marginRight: "2rem",
                        height: "3rem",
                        position: "relative",
                        width: "300px",
                      }}
                      placeholder="Search here..."
                      variant="standard"
                      color="white"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            sx={{
                              background: "white",
                              color: "grey",
                              height: "2.9rem",
                              width: "3rem",
                              position: "absolute",
                              right: "-8px",
                              top: "-8px",
                              borderRadius: "0px 8px 8px 0px",
                            }}
                            // onClick={() => handleSearchClick(query)}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        ),
                        disableUnderline: true,
                      }}
                    />
                  </div>
                  {query !== "" && (
                    <div className="table-responsive table-shoot mt-3">
                      <table
                        className="table table-centered table-nowrap"
                        style={{ border: "1px solid" }}
                      >
                        <thead
                          className="thead-info"
                          style={{ background: "rgb(140, 213, 213)" }}
                        >
                          <tr>
                            <th className="text-start">Customer Name</th>
                            <th className="text-start">Address</th>
                            <th className="text-start">Mobile No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!loading && showData.length === 0 && (
                            <tr className="text-center">
                              <td colSpan="3">
                                <div className="page-title-right">
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    style={{
                                      fontWeight: "bold",
                                      marginBottom: "1rem",
                                      textTransform: "capitalize",
                                    }}
                                    onClick={() => {
                                      navigate("/add-customer", {
                                        replace: true,
                                      });
                                    }}
                                  >
                                    Add New Customer
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                          {loading ? (
                            <tr>
                              <td className="text-center" colSpan="3">
                                Loading...
                              </td>
                            </tr>
                          ) : (
                            showData.map((user, index) => (
                              <tr
                                key={index}
                                onClick={() => {
                                  if (user.address.length === 0) {
                                    toast.error(
                                      "Please add an address for shopping."
                                    );
                                  } else {
                                    handleClick(user?._id);
                                  }
                                }}
                                className={`cursor-pointer hover:bg-gray-100 ${
                                  user.address.length === 0 ? "opacity-50" : ""
                                }`}
                              >
                                <td className="text-start">{user.name}</td>
                                {user.address.length === 0 ? (
                                  <td colSpan="2" className="text-start">
                                    Add address for shopping
                                  </td>
                                ) : (
                                  <>
                                    <td className="text-start">
                                      {`${user?.address[0]?.street}, ${user?.address[0]?.city}, ${user?.address[0]?.state}, ${user?.address[0]?.country}, ${user?.address[0]?.postalCode}`}
                                    </td>
                                    <td className="text-start">{`${user?.address[0]?.phone_Number}`}</td>
                                  </>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Display selected customer */}
                  <div>
                    {currentUser && (
                      <div style={{ display: "flex" }}>
                        <div style={{ flex: "1" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <Typography
                                style={{
                                  fontWeight: "bold",
                                  marginRight: "0.5rem",
                                }}
                              >
                                Customer Name:
                              </Typography>
                              <Typography>{`${currentUser?.name}`}</Typography>
                            </div>
                            <div style={{ display: "flex" }}>
                              <Typography
                                style={{
                                  fontWeight: "bold",
                                  marginRight: "0.5rem",
                                }}
                              >
                                Mobile No.:
                              </Typography>
                              <Typography>{`${selectedAddress?.phone_Number}`}</Typography>
                            </div>
                            <div style={{ display: "flex" }}>
                              <Typography
                                style={{
                                  fontWeight: "bold",
                                  marginRight: "0.5rem",
                                }}
                              >
                                Address:
                              </Typography>
                              <Typography>{`${selectedAddress?.street}, ${selectedAddress?.city}, ${selectedAddress?.state}, ${selectedAddress?.country}, ${selectedAddress?.postalCode}`}</Typography>
                            </div>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleChangeAddress}
                            >
                              Change Address
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Render AddressSelectionModal only when currentUser exists */}
                    {currentUser && (
                      <AddressSelectionModal
                        isOpen={showChangeAddress}
                        onClose={() => setShowChangeAddress(false)}
                        addresses={currentUser.address}
                        onSelect={handleSelectAddress}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Part 2: Panel 1 and Panel 2 */}
          <div className="row" style={{ marginTop: "0.5rem" }}>
            {/* Panel 1 (Left Hand Side) */}
            <div className="col-lg-5">
              <div className="card-body" style={{ border: "1px solid black" }}>
                {/* Category selection */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "1rem",
                  }}
                >
                  <Typography
                    style={{
                      fontWeight: "bold",
                      marginRight: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    Categories:
                  </Typography>
                  <FormControl>
                    <Select
                      name="category"
                      value={categoryValue}
                      onChange={handleChange}
                      style={{
                        display: "flex",
                        marginBottom: "1rem",
                        width: "120px",
                        height: "2rem",
                      }}
                    >
                      <MenuItem
                        value="All"
                        style={{ display: "block", marginLeft: "0.5rem" }}
                      >
                        All
                      </MenuItem>
                      {categories.map((category, index) => (
                        <MenuItem
                          value={category.categoryName}
                          key={index}
                          style={{ display: "block", marginLeft: "0.5rem" }}
                        >
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                {/* Product display */}
                <div style={{ marginTop: "-0.5rem" }}>
                  <div
                    className="table-container"
                    style={styles.tableContainer}
                  >
                    <table className="table table-centered table-nowrap ">
                      <thead className="thead-info">
                        <tr>
                          <th>Product Image</th>
                          <th>Product Name</th>
                          <th>variant</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {item.image && item.image.length > 0 && (
                                <img
                                  src={item.image[0].url}
                                  alt="Product Image"
                                  style={{ width: "50px" }}
                                />
                              )}
                            </td>
                            <td>{item.name}</td>
                            <td>
                              {item.variants && item.variants.length > 0 ? (
                                <FormControl
                                  variant="standard"
                                  style={{ width: "100%" }}
                                >
                                  <Select
                                    labelId={`variant-label-${item._id}`}
                                    id={`variant-select-${item._id}`}
                                    value={
                                      selectedVariants[item._id]
                                        ? selectedVariants[item._id]
                                            .variant_Name
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleVariantChange(item._id, e)
                                    }
                                    style={{
                                      display: "flex",
                                      width: "100%",
                                    }}
                                  >
                                    {item.variants.map((variant, i) => (
                                      <MenuItem
                                        key={i}
                                        value={variant.variant_Name}
                                        style={{ display: "block" }}
                                      >
                                        {variant.variant_Name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                "No Variant"
                              )}
                            </td>

                            <td>
                              {selectedVariants[item._id]
                                ? selectedVariants[item._id].price
                                : item.price}
                            </td>
                            <td>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => addToCart(item)}
                              >
                                Add
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* Panel 2 (Right Hand Side) */}
            <div
              className="col-lg-7"
              style={{ marginLeft: "-1rem", marginTop: "2px" }}
            >
              <div
                className="card-body"
                style={{
                  height: "400px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  border: "1px solid black",
                }}
              >
                {/* Display added products */}
                <Typography
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    marginLeft: "1rem",
                  }}
                >
                  Added Products:
                </Typography>
                {/* Display added products */}
                <div>
                  <Box>
                    <Grid container>
                      <Grid item lg={12}>
                        <Box>
                          <TableContainer
                            component={Paper}
                            elevation={0}
                            style={{
                              borderBottom: "1.5px solid rgb(207 210 213)",
                              borderRadius: "0",
                            }}
                          >
                            <Table aria-label="a dense table">
                              <TableHead>
                                <TableRow>
                                  <TableCell style={styles.headingStyle}>
                                    Product
                                  </TableCell>
                                  <TableCell style={styles.headingStyle}>
                                    Quantity
                                  </TableCell>
                                  <TableCell style={styles.headingStyle}>
                                    Price
                                  </TableCell>
                                  <TableCell style={styles.headingStyle}>
                                    GST
                                  </TableCell>

                                  <TableCell style={styles.headingStyle}>
                                    Subtotal
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {cartItem.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      align="center"
                                      style={{ padding: "1rem" }}
                                    >
                                      <Typography variant="h6">
                                        Add products for shopping
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  cartItem.map((row, index) => (
                                    <TableRow
                                      key={index}
                                      style={{ padding: "0.5rem" }}
                                      sx={{
                                        "&:last-child td, &:last-child th": {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      <TableCell component="th" scope="row">
                                        {/* {row.product} */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            width: "50%",
                                          }}
                                        >
                                          <Grid
                                            sx={{
                                              width: "90px",
                                              height: "60px",
                                              mr: "0.5rem",
                                            }}
                                          >
                                            <img
                                              style={{
                                                height: "100%",
                                                width: "100%",
                                              }}
                                              src={
                                                row?.product.image &&
                                                row?.product.image[0].url
                                              }
                                              alt=""
                                            />
                                          </Grid>
                                          <Grid sx={{ width: "20%" }}>
                                            <Typography
                                              sx={{
                                                fontFamily: "inter",
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                color: "#141718",
                                                ml: "10px",
                                              }}
                                            >
                                              {row?.product.name}
                                            </Typography>
                                            <Box
                                              onClick={() =>
                                                removeCartItemHandler(
                                                  row?.product._id,
                                                  row.variant._id
                                                )
                                              }
                                              sx={{
                                                color: "#6C7275",
                                                width: "105%",
                                                display: "flex",
                                                alignItems: "center",
                                                // justifyContent: "space-between",
                                                cursor: "pointer",
                                                ml: "10px",

                                                // border: 'solid'
                                              }}
                                            >
                                              <ClearIcon fontSize="small" />
                                              <Typography
                                                sx={{
                                                  fontFamily: "inter",
                                                  fontWeight: "600",
                                                  fontSize: "14px",
                                                }}
                                              >
                                                Remove
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            border: "1px solid #6C7275",
                                            borderRadius: "4px",
                                            height: "3%",
                                            width: "60%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography
                                            ml={1}
                                            onClick={() =>
                                              handleDecrease(index)
                                            }
                                          >
                                            -
                                          </Typography>

                                          {row && row.quantity}
                                          <Typography
                                            mr={1}
                                            onClick={() =>
                                              handleIncrease(index)
                                            }
                                          >
                                            +
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontFamily: "inter",
                                          fontWeight: "400",
                                          fontSize: "18px",
                                          color: "#121212",
                                        }}
                                      >
                                        ₹
                                        {row?.variant.price
                                          ? row.variant.price
                                          : row.product.price}
                                        {/* {selectedVariants[row._id]
                                          ? selectedVariants[row._id].price
                                          : row.price} */}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontFamily: "inter",
                                          fontWeight: "400",
                                          fontSize: "18px",
                                          color: "#121212",
                                        }}
                                      >
                                        ₹
                                        {Number(
                                          (row.variant?.price *
                                            row.variant?.gst_Id?.tax) /
                                            100
                                        )?.toFixed(2)}
                                      </TableCell>

                                      <TableCell
                                        sx={{
                                          fontFamily: "inter",
                                          fontWeight: "600",
                                          fontSize: "18px",
                                          color: "#121212",
                                        }}
                                      >
                                        ₹{Number(row?.subtotal)?.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </div>
              </div>
            </div>
          </div>
          <div className="row" style={{ marginTop: "0.5rem" }}>
            <div className="col-lg-12">
              <div className="card">
                <div
                  className="card-body"
                  style={{ backgroundColor: "#D3D3D3" }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      {currentUser ? (
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <Typography
                            style={{
                              fontWeight: "bold",
                              marginRight: "0.5rem",
                            }}
                          >
                            In-Store delivery:
                          </Typography>
                          <div style={{ marginRight: "0.5rem" }}>
                            <input
                              type="radio"
                              id="QRCode"
                              name="storedelivery"
                              value="QRCode"
                              checked={storedelivery === "QRCode"}
                              onChange={handlestoredeliveryChange}
                              className="mr-2"
                            />
                            <label htmlFor="QRCode">QR Code</label>
                          </div>
                          <div style={{ marginRight: "5rem" }}>
                            <input
                              type="radio"
                              id="Cash"
                              name="storedelivery"
                              value="Cash"
                              checked={storedelivery === "Cash"}
                              onChange={handlestoredeliveryChange}
                              className="mr-2"
                            />
                            <label htmlFor="Cash">Cash</label>
                          </div>
                          {storedelivery && (
                            <Button
                              variant="contained"
                              color="primary"
                              style={{
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}
                              onClick={
                                storedelivery === "QRCode"
                                  ? checkoutQRCode
                                  : checkoutCash
                              }
                            >
                              Checkout
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h3>
                            Please Add user and their address to place the order
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Total Section */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "2rem",
                      }}
                    >
                      <Typography
                        style={{
                          fontFamily: "inter",
                          fontWeight: "400",
                          fontSize: "16px",
                          marginRight: "0.5rem",
                        }}
                      >
                        Total:
                      </Typography>
                      <Typography
                        style={{
                          fontFamily: "inter",
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        ₹{total}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;
