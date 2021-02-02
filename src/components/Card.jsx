import React from 'react';
import {CardCvcElement, CardElement, CardExpiryElement} from "@stripe/react-stripe-js";
import '../styles/Card.css'

function CollectCard({ handleCardChange, collectCVV, redisplayCardElement }) {

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

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happenes when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'. But when user clicks Add New to add a new card, we cannot have CVV Card Element attached. So only when redisplayCardElement state is false (initial value), then we have the possibility to show CVV card element. redisplayCardElement state is true when Add New is clicked.
    if (collectCVV === 'true' && !redisplayCardElement) {
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