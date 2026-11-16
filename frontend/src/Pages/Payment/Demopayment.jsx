import RazorpayPayment from "./Razorpy";

function Demopayment() {
  return (
    <div>
      <h2>Buy 1000 Credits</h2>

      <RazorpayPayment
        amount={1}
        appName="Ultriti"
        description="1000 AI Credits"
        buttonText="Purchase Credits"
        metadata={{
          product: "credit_pack",
          credits: 1,
        }}
        onSuccess={(payment) => {
          console.log("Payment successful:", payment);
          alert("Credits purchased successfully!");
        }}
        onFailure={(error) => {
          console.error(error);
          alert(error.message);
        }}
      />
    </div>
  );
}

export default Demopayment;
