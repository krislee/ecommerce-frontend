import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

function Checkout ({backend, paymentIntentInfo}) {
    const token = localStorage.getItem('token')
    // const [cartID, setCartID] = useState('');
    const [returningCustomer, setReturningCustomer] = useState(false);
    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [checkoutData, setCheckoutData] = useState('');
    const [redirect, setRedirect] = useState(true)
    // const [isMounted, setIsMounted] = useState(false)

    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const handleCheckout = async () => {
            console.log("token", token)
            if (token) {
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    }
                })
                const data = await cartResponse.json();
                console.log(data);
                if(data.cart === "No cart available") {
                    setRedirect(true)
                    // setIsMounted(false)
                }
                if(typeof data.cart !== 'string'){
                    const response = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': data.cart._id,
                            'Authorization': token
                        }
                    })
                    const checkoutData = await response.json()
                    console.log(checkoutData);
                    setReturningCustomer(checkoutData.returningCustomer);
                    console.log(returningCustomer)
                    setCustomer(checkoutData.customer);
                    console.log(customer)
                    setPublicKey(checkoutData.publicKey);
                    console.log(publicKey)
                    setClientSecret(checkoutData.clientSecret);
                    setCheckoutData(checkoutData);
                } 
            } else {
                const cartResponse = await fetch(`${backend}/buyer/cart`)
                const data = await cartResponse.json()
                console.log(data);
                if(data.message) {
                    setRedirect(true)
                }
            }
        }     
        handleCheckout();
    },[backend, token, customer, publicKey, returningCustomer]);

    // Listen to changes on the Card Element to immediately display card errors (e.g. expiry date in the past) and disable the button if the Card Element is empty.
    const handleChange = async (event) => {
        console.log("listening for card changes")
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    const handleSubmit = async (event) => {
        setProcessing(true)
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();
    
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }
        console.log(85, clientSecret)
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: 'Jenny Rosen',
            },
          }
        });

        console.log("result: ", result)

        if (result.error) {
            // Show error to your customer (e.g., insufficient funds)
            setError(`Payment failed. ${result.error.message}`);
            setProcessing(false);
          } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
              console.log('succeeded')
              setSucceeded(true)
              setProcessing(false)
            }
          }
    }

    const redirectToCart = () => {
        if (redirect === true) {
            return <Redirect to="/cart"/>
        }
    }
    return (
        <>
        {redirectToCart()}

        <form id="payment-form" onSubmit={handleSubmit}>
            <div>Checkout Screen</div>
            <PaymentMethod backend={backend} checkoutData={checkoutData} token={token} handleChange={handleChange} redirect={!redirect}/>

            {/* Show any error that happens when processing the payment */}
            {error && (<div className="card-error" role="alert">{error}</div>)}

            <button disabled={processing || disabled || succeeded} id="submit" onClick={handleSubmit}>
                <span id="button-text">
                    {processing ? (<div className="spinner" id="spinner"></div>) : ("Confirm Payment")}
                </span>
            </button>
            
        </form>
           
        
        </>
    )
}
export default Checkout

// 4000 0027 6000 3184 (auth card)