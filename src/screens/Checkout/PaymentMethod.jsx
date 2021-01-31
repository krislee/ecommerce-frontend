import React, { useEffect, useState } from 'react';
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import CollectCard from "../../components/Card"

function PaymentMethod ({ backend, checkoutData, token, handleChange, redirect }) {

    const [paymentData, setPaymentData] = useState({})
    const [paymentMethodID, setPaymentMethodID] = useState('')

    useEffect(() => {
        console.log(12, redirect)
        if(redirect){
            console.log(14)
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

                setPaymentData(paymentMethodData)
                if(paymentMethodData.paymentMethodID) {
                    setPaymentMethodID(paymentMethodData.paymentMethodID)
                }
            }
            fetchPaymentMethod();
        }
    },[])

    
    
    return (
        
        <div>
            {(!paymentData.paymentMethodID) ? <CollectCard handleChange={handleChange}/> : (
                // <div>Payment Details</div>
                <div>
                    <h2>Payment Details</h2>
                        <p>{paymentData.brand}</p>
                        <p>{paymentData.last4}</p>
                        <p>{paymentData.expDate}</p>
                    <h2>Billing Details</h2>
                        <p>{paymentData.billingDetails.name}</p>
                        <p>{paymentData.billingDetails.address}</p>
                    <button id={paymentData.paymentMethodID}>Edit</button>
                </div>
            )}
        </div>
    )

}

export default PaymentMethod