const { response } = require("express")

const URL = "http://localhost:3001"

const button = document.querySelector('#checkoutButton')

button.addEventListener('click', async () => {
    
    const response = await fetch(`${URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // get the value of idempotency key wil be from the guest or logged in customer's cart id (cart id can be the id of the checkout button)
            // 'Idempotency-Key':
        }
    })
    const data = await response.json()
    console.log("data: ", data)

    const stripe = Stripe(data.publicKey)

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

    if (!data.returningCustomer && !data.customer) {
        // CREATE A FORM TO COLLECT SHIPPING DETAILS AND BILLING DETAILS (BILLING DETAILS FORM UNDER CARD DETAILS)
        
        // SHOW CARD ELEMENT

        // STORE data.idempotency in a cookie

    } else {
        // fetch customer shipping details having an edit button on the side of shipping details (fetch(/lastUsed/address)) - if no shipping details, display shipping form

        // fetch customer's card details, if no card details, display card element and billing details form
        
        // (do not need to display billing details unless customer clicks on edit payment method button)

        // If edit button next to card details is clicked, then collect the CVV using card element, expiration using input type=month, and name and billing details input type=text
        // Note, that edit button in payment method component will not collect the CVV when editing
        

        // div with shipping details will contain the id of the selected address
        const response = await fetch(`$URL/getCustomer`)
        const data = await response.json()
        console.log("customer: ", data)
    }
    
    /* ------- SUBMIT PAYMENT ------- */

    const form = document.getElementById('payment-form')
    form.addEventListener('submit', async (event) => {
        
        event.preventDefault()
        
        // Finalize payment 
        payWithCard(stripe, card, data.clientSecret, data.customer, data.returningCustomer)
        
    })
})


/* ------- SUBMIT PAYMENT HELPER ------- */
const payWithCard = async (stripe, card, clientSecret, customer, returningCustomer) => {

    loading(true)

    if (!returningCustomer && !customer) {
        // Confirms the Payment Intent, creates a new Payment Method and attaches the payment method to the payment intent, and creates a charge to the card
        stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card, // card details are collected from Card Element
                billing_details: {
                    address: {
                        city: 'New York',
                        country: 'US',
                        line1: '123 Test Ave.',
                        line2: null,
                        state: 'NY'
                    },
                    email: 'test@gmail.com',
                    name: 'Test1',
                    phone: '1234567890'
                }, 
            },
            // shipping : {
            //     name: ,
            //     phone: ,
            //     address: {
            //         line1: ,
            //         line2: ,
            //         city: ,
            //         state: ,
            //         postal_code: ,
            //         country: 
            //     }
            // }
            // receipt_email: document.getElementById('email').value
        }).then((response) => {
            if (response.error) {
                showError(response.error.message)
                // SHOW THE CARD ELEMENT AGAIN
            } else {
                orderComplete(response.paymentIntent.id)
            }
        })
    } else { 
        updateLastUsedShipping(ID_Number) // need to put in the id of the shipping edit button as the argument
        
        // When confirming the payment intent, you do not need to attach payment method for returning customers because payment has already been attached to the payment intent when creating it
        await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodID, //put in some payment method id depending on the displayed payment method
            // shipping : {
            //     name: ,
            //     phone: ,
            //     address: {
            //         line1: ,
            //         line2: ,
            //         city: ,
            //         state: ,
            //         postal_code: ,
            //         country: 
            //     }
            // }
        })
        .then((response) => {
            if (response.error) {
                showError(response.error.message)
                 // SHOW THE CARD ELEMENT AGAIN
            } else {
                orderComplete(response.paymentIntent.id)
            }
        })
    }
}

/* ------- UPDATE LAST USED SHIPPING HELPERS ------- */
const updateLastUsedShipping = async(shippingID) => {
    // if default checked, then add in the body
    const response = await fetch(`${URL}/last-used/address/${shippingID}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
    })
    const data = response.json()

    console.log("updated last used shipping: ", data)
}

/* ------- POST PAYMENT HELPERS ------- */

// Shows a success message when the payment is complete
const orderComplete = function(paymentIntentId) {

    loading(false);

    document.querySelector(".result-message").setAttribute("href", "https://dashboard.stripe.com/test/payments/" + paymentIntentId)
    document.querySelector(".result-message").classList.remove("hidden");
    document.getElementById("submit").disabled = true;
  };
  
// Show the customer the error from Stripe if their card fails to charge
const showError = function(errorMsgText) {

    loading(false);

    const errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    
    setTimeout(function() {
        errorMsg.textContent = "";
    }, 10000);
};

// Show a spinner on payment submission
const loading = function(isLoading) {
if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
} else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
}
};



