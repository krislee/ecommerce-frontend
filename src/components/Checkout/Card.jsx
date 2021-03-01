import React from 'react';
import {CardCvcElement, CardElement } from "@stripe/react-stripe-js";
import '../../styles/Checkout/Card.css'

function CollectCard({ handleCardChange, collectCVV, handleCardholderNameChange, cardholderName }) {

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happens when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'.
    if (collectCVV !== "true") {
        return (
            <>
            <input value={cardholderName || ""} name="name" placeholder="Name on card" id="cardholder-name" onChange={handleCardholderNameChange} required/>
            {((/^[a-z ,.'-]+$/i.test(cardholderName) !== true)  && cardholderName !== "") && <div className="warning">You must enter only letters as your full name</div>}
            <div id="card-container">
            <CardElement onChange={(event) => handleCardChange(event)}/>
            </div>
            </>
        )
    } else {
        return (
            <div id="label-cvc-container">
                <label id="recollect-cvv-label"><h5 id="recollect-cvv-heading">Re-enter CVV:</h5></label>
                <div id="cvc-container">
                    <CardCvcElement onChange={(event) => handleCardChange(event)}/> 
                </div>
            </div>
        )
    }

}

export default CollectCard