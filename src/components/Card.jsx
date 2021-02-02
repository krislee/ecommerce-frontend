import React from 'react';
import {CardCvcElement, CardElement, CardExpiryElement} from "@stripe/react-stripe-js";
import '../styles/Card.css'

function CollectCard({ handleCardChange, collectCVV }) {

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

    if (collectCVV) {
        return <CardCvcElement options={cardStyle} onChange={(event) => handleCardChange(event)}/> 
    } else {
        return (
            <label>
                Card details
                <CardElement options={cardStyle} onChange={(event) => handleCardChange(event)}/>
            </label>
        )
    }

}

export default CollectCard