import React from 'react';
import {CardCvcElement, CardElement, useElements} from "@stripe/react-stripe-js";
import '../../styles/Card.css'

function CollectCard({ handleCardChange, collectCVV, handleCardholderNameChange, cardholderName }) {
    const elements = useElements()
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

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happenes when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'.
    if (collectCVV !== "true") {
        console.log(elements.getElement(CardCvcElement))
        console.log(elements.getElement(CardElement))
        return (
            <>
            <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange} required/>
            <CardElement options={cardStyle} onChange={(event) => handleCardChange(event)}/>
            </>
        )
    } else {
        console.log(elements.getElement(CardElement))
        console.log(elements.getElement(CardCvcElement))
        return <CardCvcElement options={cardStyle} onChange={(event) => handleCardChange(event)}/> 
    }

}

export default CollectCard