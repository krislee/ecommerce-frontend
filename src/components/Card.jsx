import React, { useEffect, useState } from 'react';
import {CardElement} from "@stripe/react-stripe-js";
import '../styles/Card.css'

function CollectCard({ handleChange }) {

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
  
    return (
        <label>
            Card details
            <CardElement options={cardStyle} onChange={(event) => handleChange(event)}/>
        </label>
    );

}

export default CollectCard