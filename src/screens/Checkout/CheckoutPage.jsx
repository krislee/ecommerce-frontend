import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

function Checkout ({backend, paymentIntentInfo}) {
    const token = localStorage.getItem('token')

    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [checkoutData, setCheckoutData] = useState('');
    const [redirect, setRedirect] = useState(false)

    // SET UP STRIPE
    const stripe = useStripe();
    const elements = useElements();

    // PAYMENT-RELATED STATES
    // Update billing state through Checkout/PaymentMethod by sending handleBillingChange function as a prop down to it, listening to the input changes
    const [billing, setBilling] = useState({})
    // Update paymentMethodID state through Checkout/PaymentMethod by sending grabPaymentMethodID function as prop down to it. The grabPaymentMethodID function will run in Checkout/PaymentMethod right after fetching the server to see if there are any default, saved OR last used, saved, or no, saved cards. 
    const [paymentMethodID, setPaymentMethodID] = useState('')

    // UI STRIPE STATES
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);
    
    
     // Update paymentMethodID state through Checkout/PaymentMethod by sending grabPaymentMethodID function as prop down to it.
     const grabPaymentMethodID = (paymentMethodID) => {
        setPaymentMethodID(paymentMethodID)      
        // If the logged in user has a default, saved or last used, saved card, the paymentMethodID state is a string.
        // If the logged in user has neither or if user is a guest, then paymementMethodID is updated to null.
    }

    const handleBillingChange = (event) => {
        const { name, value } = event.target
        setBilling((prevBilling) => ({
            ...prevBilling, [name] : value
        }))
    }

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
                    const checkoutIntentData = await response.json()
                    console.log(checkoutIntentData);
                    setCustomer(checkoutIntentData.customer);
                    console.log(customer)
                    setPublicKey(checkoutIntentData.publicKey);
                    console.log(publicKey)
                    setClientSecret(checkoutIntentData.clientSecret);
                    console.log(clientSecret)
                    setCheckoutData(checkoutIntentData);
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
    },[]);

    // Listen to changes on the Card Element to immediately display card errors (e.g. expiry date in the past) and disable the button if the Card Element is empty.
    const handleCardChange = async (event) => {
        console.log("listening for card changes")
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    const handleSubmit = async (event) => {
        // Disable Confirm Payment button
        setProcessing(true)
        // We don't want to let default form submission happen here, which would refresh the page.
        event.preventDefault();
    
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          setProcessing(false)
          return;
        }

        console.log(clientSecret)

        // If there is no already saved card, and therefore, no card details displayed by PaymentMethod component, then we need to only display the Card Element that is also via the PaymentMethod component, but if the user is logged in then we need to also give the option of saving the card details from the Card Element. So let's run saveCardForFuture helper function.
        let paymentMethod
        console.log(paymentMethodID)
        if(!paymentMethodID){
            paymentMethod = await saveCardForFuture()
            console.log(paymentMethod)
        }

        // Confirm the payment using either 1) an already saved card (default or last used) - designated by paymentMethodID state 2) a card being created and saved during checkout - designated by paymentMethod.paymentMethod 3) a card being created and not saved during checkout
        let confirmCardResult
        if(paymentMethodID || paymentMethod.paymentMethodID){
            console.log(126, paymentMethod)
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    // Check if there is an already default or last used saved card first. 
                    // If there is one, use that first. If there is not one, use the NEW card created during checkout that has now been saved to the logged in user through saveCardForFuture helper function.
                    card: paymentMethodID ? paymentMethodID : paymentMethod.paymentMethodID  
                }
            })
        } else {
            console.log(135, paymentMethod)
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: `${billing.firstName} ${billing.lastName}`,
                        address: {
                            line1: `${billing.line1}`,
                            line2: `${billing.line2}`,
                            city: `${billing.city}`,
                            state: `${billing.state}`,
                            postal_code: `${billing.postalCode}`,
                            country: 'US'
                        }
                    }
                }
            }) 
        }
        
        console.log("result: ", confirmCardResult)

        if (confirmCardResult.error) {
            // Show error to your customer (e.g., insufficient funds)
            setError(`Payment failed. ${confirmCardResult.error.message}`);
            setProcessing(false);
          } else {
            // The payment has been processed!
            if (confirmCardResult.paymentIntent.status === 'succeeded') {
              console.log('succeeded')
              setSucceeded(true)
              setProcessing(false)
            }
          }
    }

    const saveCardForFuture = async() => {
        const checkbox = document.getElementById('saveCard')
        
        console.log(checkbox, checkbox.checked)

        // If user is logged in, user is also a Stripe customer. If logged in user checks the Save Card box, create the payment method with stripe.createPaymentMethod(), and on the server-side, check if the newly created payment method is a duplicate of already saved payment methods attached to Stripe customer before attaching to the Stripe customer. If duplicate card number, detach old one and attach the new one to Stripe customer. The server will send back the new payment method ID that was created by stripe.createPaymentMethod().
        if(checkbox && checkbox.checked) {
            const createPaymentMethodResponse = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: `${billing.firstName} ${billing.lastName}`,
                    address: {
                        line1: `${billing.line1}`,
                        line2: `${billing.line2}`,
                        city: `${billing.city}`,
                        state: `${billing.state}`,
                        postal_code: `${billing.postalCode}`,
                        country: 'US'
                    }
                },
                metadata: {
                    cardholder_name: 'Jenny Rosen',
                    recollect_cvv: false
                }
            })

            console.log(createPaymentMethodResponse)

            const savePaymentMethodToCustomerResponse = await fetch(`${backend}/order/payment?checkout=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    fingerprint: createPaymentMethodResponse.paymentMethod.card.fingerprint,
                    paymentMethodID: createPaymentMethodResponse.paymentMethod.id,
                    default: false
                })
            })
            const savePaymentMethodToCustomerData = await savePaymentMethodToCustomerResponse.json()

            console.log(savePaymentMethodToCustomerData)

            return savePaymentMethodToCustomerData
        }
        // Return null for payment method ID if guest or if logged in user did not check Save Card 
        return {paymentMethodID: null}
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
            <PaymentMethod backend={backend} checkoutData={checkoutData} token={token} billing={billing} handleBillingChange={handleBillingChange} grabPaymentMethodID={grabPaymentMethodID} handleCardChange={handleCardChange} redirect={redirect}/>

            {/* Show any error that happens when processing the payment */}
            {error && (<div className="card-error" role="alert">{error}</div>)}

            {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display. Do not show the checkbox for guests. */}
            {(customer && !paymentMethodID)? (
                <div>
                    <input type="checkbox" id="saveCard" name="saveCard" />
                    <label htmlFor="saveCard">Save card for future purchases</label>
                </div>
            ): <div></div>}

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