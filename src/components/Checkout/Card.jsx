import React from 'react';
import {CardCvcElement, CardElement } from "@stripe/react-stripe-js";
import '../../styles/Card.css'

function CollectCard({ handleCardChange, collectCVV, handleCardholderNameChange, cardholderName }) {

    const cardStyle = {
        base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
            color: "#32325d"
        }
        },
        invalid: {
        fontFamily: 'Arial, sans-serif',
        color: "#fa755a",
        iconColor: "#fa755a"
        }
    }

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happens when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'.
    if (collectCVV !== "true") {
        return (
            <>
            <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange} required/>
            <CardElement options={cardStyle} onChange={(event) => handleCardChange(event)}/>
            </>
        )
    } else {
        return <CardCvcElement options={cardStyle} onChange={(event) => handleCardChange(event)}/> 
    }

}

export default CollectCard