import React, { useState } from 'react';
import {CardCvcElement, CardElement } from "@stripe/react-stripe-js";
import { cardholderNameInputError, cardholderNameInputError2 } from './inputsErrors'
import TextField from '@material-ui/core/TextField';

import '../../styles/Checkout/Card.css'

function CollectCard({ loggedIn, handleCardChange, collectCVV, handleCardholderNameChange, cardholderName }) {
    const [onCardholderBlur, setOnCardholderBlur] = useState(false)

    // We want to show CVV Card Element whenever collectCVV is 'true'. This happens when the json data we get back when we fetch to /order/checkout/payment has the property recollectCVV with a value of 'true'.
    if (collectCVV !== "true") {
        return (
            <>
            <div id="addNewCardholderName">
                <TextField
                id="edit-cardholder-name-input"
                label="Name on card"
                className="filled-margin-none"
                placeholder="Enter name on card"
                variant="filled"
                required
                fullWidth
                value={cardholderName || ""} 
                name="name"
                onChange={handleCardholderNameChange}
                onFocus={() => setOnCardholderBlur(false)}
                onBlur={() => {
                    if(cardholderNameInputError2(cardholderName)) setOnCardholderBlur(true)
                }}
                error={cardholderNameInputError(cardholderName) || onCardholderBlur}
                helperText={(onCardholderBlur && "Required field") || (cardholderNameInputError(cardholderName) && "Only letters and ', . ' -' are allowed")}
                />
            </div>
            <div id={loggedIn() ? "card-container" : "guest-card-container"} >
            <CardElement options={{hidePostalCode: true}} onChange={(event) => handleCardChange(event)}/>
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