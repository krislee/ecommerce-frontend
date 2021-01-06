const URL = "http://localhost:3000"
let stripe

const getPublicKey = async () => {
    const response = await fetch(`${URL}/getpublickey`)
    const data = await response.json()
    console.log(data.publicKey, typeof data.publicKey)
    stripe = Stripe(data.publicKey)
}
getPublicKey()

const button = document.querySelector('button')

button.addEventListener('click', async () => {
    const response = await fetch(`${URL}/create-payment-intent`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
    })
    const data = await response.json()
    console.log("data: ", data)

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


    
    /* ------- SUBMIT PAYMENT ------- */

    const form = document.getElementById('payment-form')
    form.addEventListener('submit', (event) => {

        event.preventDefault()

        // After collecting card details in Card Element, finalize payment when submit button is clicked
        payWithCard(stripe, card, data.clientSecret)

    })
})


/* ------- SUBMIT PAYMENT HELPER ------- */
const payWithCard = async (stripe, card, clientSecret) => {

    loading(true)

    stripe.confirmCardPayment(clientSecret, {
        // Creates a Payment Method object
        payment_method: {
            card: card,
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
        }
    })
    .then((response) => {
        if (response.error) {
            showError(response.error.message)
        } else {
            orderComplete(response.paymentIntent.id)
        }
    })
}

/* ------- UI HELPERS ------- */

// Shows a success message when the payment is complete
var orderComplete = function(paymentIntentId) {

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