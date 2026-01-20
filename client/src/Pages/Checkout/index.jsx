import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";


import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";

const PayhereScript = ({ onPaymentSuccess }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => {
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        onPaymentSuccess(orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
      };

      window.payhere.onError = function onError(error) {
        console.log("Error:" + error);
      };
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [onPaymentSuccess]);
  return null;
};

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    fullName: "",
    country: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
  });
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState();
  const [paymentHash, setPaymentHash] = useState("");

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
      setCartData(res);

      setTotalAmount(
        res.length !== 0 &&
          res
            .map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0)
      );
    });

    context.setEnableFilterTab(false);

    if (window.payhere) {
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        processSuccessfulPayment(orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Payment was cancelled",
        });
      };

      window.payhere.onError = function onError(error) {
        console.log("Error:" + error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Payment error occurred",
        });
      };
    }
  }, []);

  const onChangeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "fullName",
      "country",
      "streetAddressLine1",
      "streetAddressLine2",
      "city",
      "state",
      "zipCode",
      "phoneNumber",
      "email",
    ];

    for (const field of requiredFields) {
      if (formFields[field] === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: `Please fill ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        });
        return false;
      }
    }
    return true;
  };

  const processSuccessfulPayment = async (orderId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const payLoad = {
      name: formFields.fullName,
      phoneNumber: formFields.phoneNumber,
      address:
        formFields.streetAddressLine1 + " " + formFields.streetAddressLine2,
      pincode: formFields.zipCode,
      amount: parseInt(totalAmount),
      paymentId: orderId,
      email: user.email,
      userid: user.userId,
      products: cartData,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    try {
      await postData(`/api/orders/create`, payLoad);

      const res = await fetchDataFromApi(`/api/cart?userId=${user?.userId}`);
      if (res?.length !== 0) {
        for (const item of res) {
          await deleteData(`/api/cart/${item?.id}`);
        }
      }

      setTimeout(() => {
        context.getCartData();
      }, 1000);

      history("/orders");
    } catch (error) {
      console.error("Error processing order:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error processing order",
      });
    }
  };

  const initiatePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const orderId = `ORDER_${Date.now()}_${user?.userId}`;

    try {
      const hashResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/get-hash`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
            orderId,
            amount: totalAmount,
            currency: "LKR",
          }),
        }
      );

      const { hash } = await hashResponse.json();

      const payment = {
        sandbox: true, // Set to false in production
        merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
        return_url: undefined, // Let PayHere handle redirects
        cancel_url: undefined, // Let PayHere handle redirects
        notify_url: `${import.meta.env.VITE_API_URL}/api/payment/notify`,
        order_id: orderId,
        items: cartData.map((item) => item.productTitle).join(", "),
        amount: totalAmount.toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: formFields.fullName.split(" ")[0],
        last_name: formFields.fullName.split(" ").slice(1).join(" "),
        email: formFields.email,
        phone: formFields.phoneNumber,
        address: formFields.streetAddressLine1,
        city: formFields.city,
        country: formFields.country,
        delivery_address: `${formFields.streetAddressLine1} ${formFields.streetAddressLine2}`,
        delivery_city: formFields.city,
        delivery_country: formFields.country,
        custom_1: user?.userId,
      };

      window.payhere.startPayment(payment);
    } catch (error) {
      console.error("Error initiating payment:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error initiating payment",
      });
    }
  };

  return (
    <div>
      <PayhereScript onPaymentSuccess={processSuccessfulPayment} />
      <section className="section">
        <div className="container">
          <form className="checkoutForm" onSubmit={initiatePayment}>
            <div className="row">
              <div className="col-md-8">
                <h2 className="hd">BILLING DETAILS</h2>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <TextField
                        label="Full Name *"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="fullName"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <TextField
                        label="Country *"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="country"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>

                <h6>Street address *</h6>

                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <TextField
                        label="House number and street name"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="streetAddressLine1"
                        onChange={onChangeInput}
                      />
                    </div>

                    <div className="form-group">
                      <TextField
                        label="Apartment, suite, unit, etc. (optional)"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="streetAddressLine2"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>

                <h6>Town / City *</h6>

                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <TextField
                        label="City"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="city"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>

                <h6>State / County *</h6>

                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <TextField
                        label="State"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="state"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>

                <h6>Postcode / ZIP *</h6>

                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <TextField
                        label="ZIP Code"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="zipCode"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <TextField
                        label="Phone Number"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="phoneNumber"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <TextField
                        label="Email Address"
                        variant="outlined"
                        className="w-100"
                        size="small"
                        name="email"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card orderInfo">
                  <h4 className="hd">YOUR ORDER</h4>
                  <div className="table-responsive mt-3">
                    <table className="table table-borderless">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {cartData?.length !== 0 &&
                          cartData?.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  {item?.productTitle?.substr(0, 20) + "..."}{" "}
                                  <b>× {item?.quantity}</b>
                                </td>

                                <td>
                                  {item?.subTotal?.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "LKR",
                                  })}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td>Subtotal </td>

                          <td>
                            {(cartData?.length !== 0
                              ? cartData
                                  ?.map(
                                    (item) => parseInt(item.price) * item.quantity
                                  )
                                  .reduce((total, value) => total + value, 0)
                              : 0
                            )?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "LKR",
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="submit"
                    className="btn-blue bg-red btn-lg btn-big"
                  >
                     &nbsp; Checkout
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Checkout;