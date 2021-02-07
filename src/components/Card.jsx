import React from 'react';
import {CardCvcElement, CardElement, useElements} from "@stripe/react-stripe-js";
import '../styles/Card.css'

function CollectCard({ handleCardChange, collectCVV, redisplayCardElement }) {
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

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happenes when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'. But when user clicks Add New to add a new card, we cannot have CVV Card Element attached. So only when redisplayCardElement state is false (initial value), then we have the possibility to show CVV card element. redisplayCardElement state is true when Add New is clicked.
    if (collectCVV !== "true") {
        console.log(elements.getElement(CardCvcElement))
        console.log(elements.getElement(CardElement))
        return (
            <label>
                Card details
                <CardElement options={cardStyle} onChange={(event) => handleCardChange(event)}/>
            </label>
        )
    } else {
        console.log(elements.getElement(CardElement))
        console.log(elements.getElement(CardCvcElement))
        return <CardCvcElement options={cardStyle} onChange={(event) => handleCardChange(event)}/> 
    }

}

export default CollectCard