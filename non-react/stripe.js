const URL = "http://localhost:3001"

const button = document.querySelector('#checkoutButton')
let paymentIntentId = ''

button.addEventListener('click', async () => {
    console.log("paymentIntentId 1", paymentIntentId)
    
    const response = await fetch(`${URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // get the idempotency key value from the guest or logged in customer's cart id (cart id can be the id of the checkout button)
            // 'Idempotency-Key':
        },
        body: JSON.stringify({paymentIntentId: paymentIntentId})
    })
    const data = await response.json()
    console.log("data: ", data)

    paymentIntentId ? paymentIntentId : data.paymentIntentId
    console.log("paymentIntentId 2", paymentIntentId)

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

    if (!data.returningCustomer) {
        // Display form to collect shipping info page
        
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
    } else {
        // fetch customer shipping details & default payment method
        // (do not need to display billing details unless customer clicks on edit payment method button - billing details need to be retrieved from payment method obj vs. shipping details retrieved from customer obj)
    }
    
    /* ------- SUBMIT PAYMENT ------- */

    const form = document.getElementById('payment-form')
    form.addEventListener('submit', async (event) => {
        
        event.preventDefault()
        
        // Finalize payment 
        payWithCard(stripe, card, data.clientSecret, data.returningCustomer)
        
    })
})


/* ------- SUBMIT PAYMENT HELPER ------- */
const payWithCard = async (stripe, card, clientSecret, returningCustomer) => {

    loading(true)

    if (!returningCustomer) {
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
                }
            },
            // receipt_email: document.getElementById('email').value
        }).then((response) => {
            if (response.error) {
                showError(response.error.message)
            } else {
                // delete the guest or logged in cart first and then run orderComplete function
                // fetch (`${URL}`)
                // .then(response => response.json())
                // .then(() => {orderComplete(response.paymentIntent.id)})
                orderComplete(response.paymentIntent.id)
            }
        })
    } else { // When confirming the payment intent, you do not need to attach payment method for returning customers because payment has already been attached to the payment intent when creating it
        stripe.confirmCardPayment(clientSecret)
        .then((response) => {
            if (response.error) {
                showError(response.error.message)
            } else {
                // delete the guest or logged in cart first and then run orderComplete function
                // fetch (`${URL}`)
                // .then(response => response.json())
                // .then(() => {orderComplete(response.paymentIntent.id)})
                orderComplete(response.paymentIntent.id)
            }
        })
    }
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

// https://medium.com/dsc-hit/creating-an-idempotent-api-using-node-js-bdfd7e52a947
// https://medium.com/@saurav200892/how-to-achieve-idempotency-in-post-method-d88d7b08fcdd
// https://github.com/stripe/stripe-node/issues/877
// https://github.com/stripe/react-stripe-js/issues/85

// If you experience network issues:
// offline: did not get charged and then do not refresh, 