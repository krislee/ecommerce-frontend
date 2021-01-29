import React, { useEffect, useState } from 'react';

function collectCard({publicKey}) {
    useEffect(() => {
        const stripe = Stripe(publicKey)
    
        // Get Stripe Elements UI library
        const elements = stripe.elements()
    
        const style = {
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
    
        /* ------- COLLECT CARD DETAILS ------- */
    
        // Create Card Element to collect card details
        const card = elements.create('card', {style: style})
    
        // Stripe injects Card Element iframe into the DOM
        card.mount("#card-element");
    
        // Listen to changes on the Card Element to immediately display card errors (e.g. expiry date in the past) and disable the button if the Card Element is empty.
        card.on('change', (event) => {
    
            console.log("event: ", event)
    
            document.getElementById('submit').disabled = event.empty // event.empty = true when there is no values in the Card Element
            document.querySelector('#card-error').textContent = event.error ? event.error.message : ""
        })
    })
}

export default collectCard