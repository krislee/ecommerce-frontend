import React, { useEffect, useState } from 'react';
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import CollectCard from "../../components/Card"

function PaymentMethod ({ backend, checkoutData, token, handleCardChange, redirect, billing, handleBillingChange, grabPaymentMethodID }) {

    const [paymentData, setPaymentData] = useState({})

    useEffect(() => {
        console.log(12, redirect)
        if(!redirect){
            console.log("running fetching payment method if no redirect")
            if(token){
                // Get either a 1) default, saved card or 2) last used, saved (but not default) card info back (will be an object response), OR 3) no saved cards (will be null response)
                const fetchPaymentMethod = async () => {
                    const paymentMethodResponse = await fetch(`${backend}/order/checkout/payment`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        }
                    })
                    const paymentMethodData = await paymentMethodResponse.json()
                    console.log(paymentMethodData);
                    // After getting the card info, update paymentMethodID state in Checkout Page. The value is either a string of the payment method ID or null if there is no payment method saved for the logged in user. 
                    grabPaymentMethodID(paymentMethodData.paymentMethodID)
                    setPaymentData(paymentMethodData)

                    
                    
                }
                fetchPaymentMethod();
            } else {
                grabPaymentMethodID(null)
            }
        }
    },[])

    
    if (!paymentData.paymentMethodID) {
        {/* Show Card and Billing Details or Card element and input depending if there is an already default or last used, saved card for logged in user. If there is an already default or last used, saved card, a payment method ID gets returned from the server. */}
        return (
            <div>
            <h2>Payment</h2>
            <CollectCard handleCardChange={handleCardChange}/>
            <h2>Billing Address</h2>
            <input value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange}/>
            <input value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange}/>
            <input value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange}/>
            <input value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />
            <input value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange}/>
            <input value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange}/>
            <input value={billing.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleBillingChange}/>
            </div>
        )
    } else {
        return (
            <div>
                <h2>Payment</h2>
                <p>{paymentData.brand}</p>
                <p>{paymentData.last4}</p>
                <p>{paymentData.expDate}</p>

                {/* <h2>Billing Address</h2>
                <p>{paymentData.billingDetails.name}</p>
                <p>{paymentData.billingDetails.address}</p> */}
                <button id={paymentData.paymentMethodID}>Edit</button>
            </div>
        )
    }

}

export default PaymentMethod