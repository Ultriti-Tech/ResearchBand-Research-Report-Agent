import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL?.replace(/\/+$/, "");
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const getAuthHeaders = () => {
  const token = localStorage.getItem("RHD_v1_dashed_t");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Load Razorpay SDK
const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Razorpay SDK failed to load")),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));

    document.body.appendChild(script);
  });
};

const updateSubscription = async ({
  amount,
  plan_type,
  payment_id,
  razorpay_order_id,
}) => {
  const { data } = await axios.post(
    `${API_URL}/api/v1/creditTransaction/credit`,
    {
      amount,
      plan_type,
      payment_id,
      razorpay_order_id,
    },
    {
      withCredentials: true,
      headers: getAuthHeaders(),
    },
  );

  return data;
};

const RazorpayPayment = ({
  planId,
  description = "Application Payment",
  appName = "My Application",
  buttonText = "Pay Now",
  onSuccess,
  onFailure,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!API_URL) {
      onFailure?.({
        message: "Payment API URL is not configured.",
      });
      return;
    }

    if (!RAZORPAY_KEY) {
      onFailure?.({
        message: "Razorpay Key ID is not configured.",
      });
      return;
    }

    if (!planId) {
      onFailure?.({
        message: "Please select a valid plan.",
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Load Razorpay SDK
      await loadRazorpay();

      // 2. Request order using plan ID only
      const { data: order } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
          plan_id: planId,
        },
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        },
      );

      console.log("Created Razorpay order:", order);

      // 3. Validate backend response
      if (!order?.order_id) {
        throw new Error("Invalid Razorpay order ID.");
      }

      if (!order?.amount || !order?.currency) {
        throw new Error("Invalid order amount or currency.");
      }

      const options = {
        key: order.key_id || RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: appName,
        description,
        order_id: order.order_id,

        handler: async (response) => {
          console.log("Razorpay response:", response);

          try {
            const {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            } = response;

            if (
              !razorpay_order_id ||
              !razorpay_payment_id ||
              !razorpay_signature
            ) {
              throw new Error("Incomplete Razorpay payment response.");
            }

            // 4. Verify payment through FastAPI
            const { data } = await axios.post(
              `${API_URL}/api/payment/verify-payment`,
              {
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
              },
              {
                withCredentials: true,
                headers: getAuthHeaders(),
              },
            );

            console.log("Verification response:", data);

            if (data.status === "success" || data.success === true) {
              onSuccess?.({
                ...response,
                order,
                verification: data,
                planId,
              });

              // -----------------------------------
              // database verification
              const verifyPaymentAxios = await axios.post(
                `${API_URL}/api/payment/transaction/verify`,
                {
                  plan_type: planId,
                  payment_id: order?.payment_id,
                  razorpay_order_id,
                  razorpay_payment_id,
                  razorpay_signature,
                },
                {
                  withCredentials: true,
                  headers: getAuthHeaders(),
                },
              );

              // console.log("verifyPaymentAxios", verifyPaymentAxios);

              const verifyPaymentData = verifyPaymentAxios;

              if (verifyPaymentData.status == 200) {
                console.log("payment added sucesfuly");
                alert(`${verifyPaymentData?.data?.message}`);

                // --------------------
                // update subscritption plan
                const creditResult = await updateSubscription({
                  amount: order.amount,
                  plan_type: planId,
                  payment_id: order?.payment_id,
                  razorpay_order_id: razorpay_order_id,
                });

                if (creditResult.success) {
                  console.log("Credit added");
                  alert(creditResult.message);
                }
              }
            } else {
              onFailure?.({
                message: data.message || "Payment verification failed.",
              });
            }
          } catch (error) {
            console.error("Verification error:", error);

            onFailure?.({
              message:
                error.response?.data?.detail ||
                error.message ||
                "Payment verification failed.",
              error,
            });
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      // 5. Open Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);

        onFailure?.({
          message: response.error?.description || "Payment failed.",
          error: response.error,
        });

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {

      if (error.response?.status == 400) {
        alert(`${error.response?.data?.detail}`);
      }

      console.error("Payment initiation error:", error.response);

      onFailure?.({
        message:
          error.response?.data?.detail ||
          error.message ||
          "Unable to initiate payment.",
        error,
      });

      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={`w-full py-3 px-6 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-md font-medium transition-colors ${className}`}
    >
      {loading ? "Processing..." : buttonText}
    </button>
  );
};

export default RazorpayPayment;
