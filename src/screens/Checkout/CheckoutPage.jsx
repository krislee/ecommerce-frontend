import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';
import NavBar from '../../components/NavigationBar';
import '../../styles/CheckoutPage.css';
import createPaymentMethod from './CreatePayment'

function Checkout ({backend, paymentIntentInfo}) {
    const token = localStorage.getItem('token')
    
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(true)

    /* ------- PAYMENT INTENT-RELATED STATES ------- */
    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    /* ------- UI STRIPE STATES ------- */
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);

    /* ------- PAYMENT-RELATED STATES ------- */

    // Update cardholder's name state by sending handleCardholderNameChange function as a prop down to Checkout/PaymentMethod
    const [cardholderName, setCardholderName] = useState('')

    // Update billing state by sending handleBillingChange function as a prop down to Checkout/PaymentMethod, listening to the input changes
    const [billing, setBilling] = useState({})

    // Update paymentMethodID state by sending grabPaymentMethodID function as prop down to Checkout/PaymentMethod. The grabPaymentMethodID function will run in Checkout/PaymentMethod right after fetching the server to see if there are any default, saved OR last used, saved, or no, saved cards. 
    const [paymentMethod, setPaymentMethod] = useState({})
    
    // Update editPayment state by sending grabEditPayment functions as prop down to Checkout/PaymentMethod. 
    const[editPayment, setEditPayment] = useState(false)


    const [collectCVV, setCollectCVV] = useState('false')

    const [redisplayCardElement, setRedisplayCardElement] = useState(false)

    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe();
    const elements = useElements();


    /* ------- FUNCTIONS TO UPDATE PAYMENT-RELATED STATES ------- */
    const grabPaymentLoading = (paymentLoading) => {
        setPaymentLoading(paymentLoading)
    }
    // Update paymentMethodID state by sending grabPaymentMethodID function as prop down to Checkout/PaymentMethod
    const grabPaymentMethod = (paymentMethod) => {
        setPaymentMethod(paymentMethod)      
        // If the logged in user has a default, saved or last used, saved card, the paymentMethodID state is a string. If paymentMethodID is truthy, then we will use it as the first option to confirm the card payment in stripe.confirmCardPayment(). If truthy, we would also not need to run the saveCardForFuture() helper since that should be run only if the card Element is displayed but it would not be displayed if there is a payment method ID from Checkout/PaymentMethod.
        // If the logged in user has neither or if user is a guest, then paymementMethodID is updated to null. If paymentMethodID is falsy, then we need to run saveCardForFuture() helper in case the user wants to save the card. 
        grabBilling(paymentMethod.billingDetails)
        setCollectCVV(paymentMethod.recollectCVV)
        setCardholderName(paymentMethod.cardholderName)
    }

    // We need to prefill the billing details input when user wants to edit the displayed, saved card. So we pass the grabBilling function as prop to Checkout/PaymentMethod to update the billing state IF the payment data that comes back from fetching the server for either default, saved or last used, saved, or no, saved cards is default, saved or last used, saved card. 
    // By updating the billing state, and sending the billing state as prop down to Checkout/PaymentMethod and then further down to Component/BillingInput, the Component/BillingInput inputs value property can now use the billing state.
    const grabBilling = (billing) => {
        console.log(billing)

        if(billing) {
            const name = billing.name.split(", ")
            console.log("name after splitting: ", name)
            setBilling({
                firstName: name[0],
                lastName: name[1],
                line1: billing.address.line1,
                line2: billing.address.line2,
                city: billing.address.city,
                state: billing.address.state,
                postalCode: billing.address.postalCode
            })
        } 
    }

    // Update editPayment state by sending grabEditPayment() down as prop to Checkout/PaymentMethod, which gets updated to true if the Edit button in Checkout/PaymentMethod component is clicked. If editPayment is true, then we do not show Confirm Card Payment button.
    const grabEditPayment = (edit) => {
        setEditPayment(edit)
    }

    const grabCollectCVV = (collectCVV) => {
        console.log("checkout collect cvv", collectCVV)
        setCollectCVV(collectCVV)
    }

    const grabRedisplayCardElement = (redisplayCardElement) => {
        console.log("checkout redisplay", redisplayCardElement)
        setRedisplayCardElement(redisplayCardElement)
    }

    // handleBillingChange() gets passed down as prop to Checkout/PaymentMethod, and then to Component/BillingInput
    const handleBillingChange = (event) => {
        const { name, value } = event.target
        setBilling((prevBilling) => ({
            ...prevBilling, [name] : value // need the previous billing state when updating the billing state (hence the ...prevBilling) or else the other input values will be empty
        }))
    }

    // Listen to changes on cardholder name's input. handleCardholderNameChange() is passed as a prop to Checkout/PaymentMethod
    const handleCardholderNameChange = (event) => {
        const { value } = event.target
        setCardholderName(value)
    }   

     // Listen to changes on the Card Element to immediately display card errors (e.g. expiry date in the past) and disable the button if the Card Element is empty.
    const handleCardChange = async (event) => {
        console.log("listening for card changes")
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    /* ------- CREATE NEW OR UPDATE EXISTING PAYMENT INTENT AFTER RENDERING DOM ------- */
    useEffect(() => {
        const handleCheckout = async () => {
            console.log("token", token)
            // setLoading(false)
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
                    localStorage.setItem("cartItems", false);
                    setRedirect(true);
                    setLoading(false)
                    return;
                    // setIsMounted(false)
                }
                if(typeof data.cart !== 'string'){
                    localStorage.setItem('cartItems', true)
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
                    setClientSecret(checkoutIntentData.clientSecret);
                    setLoading(false)
                } 
            } else {
                const cartResponse = await fetch(`${backend}/buyer/cart`)
                const data = await cartResponse.json()
                console.log(data);
                if(data.message) {
                    setRedirect(true)
                    setLoading(false)
                }
            }
        }    
        handleCheckout();
    },[]);

    /* 
    Confirm card payment with either:
        1) An existing payment method ID from a default, saved or last used, saved card. We get the existing payment method ID from paymentMethodID state. Recall the paymentMethodID state is updated from Checkout/PaymentMethod component after fetching the server in its useEffect()). Using the existing payment method ID immediately runs stripe.confirmCardPayment().
        2) A newly created AND saved card. We create and save the card in saveCardForFuture(). saveCardForFuture() calls stripe.createPaymentMethod(), creating a new payment method with its ID. To save, saveCardForFuture() then runs a fetch to our server. Our server ensures the newly created card is not a duplicate before attaching to the Stripe customer. By attaching the payment method to the Stripe customer, we save the card. After saveCardForFuture() is ran, we call stripe.confirmCardPayment() with the newly, created payment method ID.  
        3) A newly created, non-saved card (this applies to logged in users who did not click Save Card or for guests). We still run saveCardForFuture() but since the card is not saved, the function does not run stripe.createPaymentMethod() and does not fetch to our server - it just returns null. Then stripe.confirmCardPayment() is ran collecting the card details straight from the Stripe's Card element. 
    */
    const handleSubmit = async (event) => {
        // Disable Confirm Payment button
        setDisabled(true)
        setProcessing(true)
        // We don't want to let default form submission happen here, which would refresh the page.
        event.preventDefault();
        
        // Check if Stripe.js has loaded yet.
        if (!stripe || !elements) {
          setDisabled(true)
          setProcessing(false)
          return; // return when Stripe.js is not loaded
        }

        console.log(clientSecret)

        // If there is no already saved card, and therefore, no card details displayed by PaymentMethod component, then we need to only display the Card Element that is also via the PaymentMethod component, but if the user is logged in then we need to also give the option of saving the card details from the Card Element. So let's run saveCardForFuture helper function. If user did not click save card, then saveCardForFuture will just return null.
        let newSavedCheckoutPaymentMethod
        console.log(newSavedCheckoutPaymentMethod)
        if(!paymentMethod.paymentMethodID && customer){
            const cardElement = elements.getElement(CardElement)
            newSavedCheckoutPaymentMethod = await saveCardForFuture(stripe, cardElement, billing, cardholderName, backend)
            console.log(newSavedCheckoutPaymentMethod)
        }
        console.log("collect CVV: ", collectCVV)
        // Confirm the payment using either 1) an already saved card (default or last used) - designated by paymentMethodID state 2) a card being created and saved during checkout - designated by paymentMethod.paymentMethodID 3) a card being created and not saved during checkout
        let confirmCardResult
        if ((paymentMethod.paymentMethodID && !redisplayCardElement)|| (newSavedCheckoutPaymentMethod && newSavedCheckoutPaymentMethod.paymentMethodID)){ // For saved cards
            console.log(181, elements.getElement(CardCvcElement))
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                // Check if there is an already default or last used saved card first. 
                // If there is one, use that first. If there is not one, use the NEW card created during checkout that has now been saved to the logged in user through saveCardForFuture helper function.
                payment_method: paymentMethod.paymentMethodID && !redisplayCardElement ? paymentMethod.paymentMethodID : newSavedCheckoutPaymentMethod.paymentMethodID,
                payment_method_options: (collectCVV === 'true') ? {
                    card: {
                      cvc: elements.getElement(CardCvcElement)
                    } 
                } : undefined
            })
        } else { // For none-saved cards
            console.log(135, paymentMethod)
            console.log(elements.getElement(CardElement))
            // Do not include the cardholder's name when confirming card payment because metadata is not a property in stripe.confirmCardPayment(). We need to store cardholder's name in metadata property.
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: `${billing.firstName}, ${billing.lastName}`,
                        address: {
                            line1: `${billing.line1}`,
                            line2: `${billing.line2}`,
                            city: `${billing.city}`,
                            state: `${billing.state}`,
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
            setDisabled(false);
            setProcessing(false)
          } else {
            // The payment has been processed!
            if (confirmCardResult.paymentIntent.status === 'succeeded') {
              console.log('succeeded')
              localStorage.setItem('cartItems', false);
            // Need to put these updating state functions in the Order Complete component??
              setDisabled(true)
              setProcessing(false)
              setRedisplayCardElement(false)
              setCollectCVV("false")

            // Redirect to Order Complete component
            }
          }
    }

    const saveCardForFuture = async() => {
        const checkbox = document.getElementById('saveCard')
        
        console.log(checkbox, checkbox.checked)

        // If user is logged in, user is also a Stripe customer. If logged in user checks the Save Card box, create the payment method with stripe.createPaymentMethod(), and on the server-side, check if the newly created payment method is a duplicate of already saved payment methods attached to Stripe customer before attaching to the Stripe customer. If duplicate card number, detach old one and attach the new one to Stripe customer. The server will send back the new payment method ID that was created by stripe.createPaymentMethod().
        const cardElement = elements.getElement(CardElement)
 
        if(checkbox && checkbox.checked) {
            return await createPaymentMethod(stripe, cardElement, billing, cardholderName, backend)
        }
        // Return null for payment method ID if guest or if logged in user did not check Save Card 
        return {paymentMethodID: null}
    }


    if(loading) {
        return <></>
    }else if (redirect === true) {
        return (
            <Redirect to="/cart"/>
        )
    } else {
        return (
            <>
            <NavBar />
            <div id="payment-form">
                <PaymentMethod backend={backend} token={token} paymentLoading={paymentLoading} grabPaymentLoading={grabPaymentLoading} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} paymentMethod={paymentMethod} grabPaymentMethod={grabPaymentMethod} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} editPayment={editPayment} grabEditPayment={grabEditPayment} collectCVV={collectCVV} grabCollectCVV={grabCollectCVV} redisplayCardElement={redisplayCardElement} grabRedisplayCardElement={grabRedisplayCardElement} />
                {/* Show any error that happens when processing the payment */}
                {error && (<div className="card-error" role="alert">{error}</div>)}
    
                {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display as indicated by paymentMethodID state OR does have an already default/last used saved card but want to add a new card as indicated by redisplayCardElement state. Do not show the checkbox for guests (as indicated by customer state). */}
                {(customer && !paymentMethod.paymentMethodID && !paymentLoading) ? (
                    <div>
                        <label htmlFor="saveCard">
                            Save card for future purchases
                            <input type="checkbox" id="saveCard" name="saveCard" />
                        </label>
                    </div>
                ): <div></div>}
                {(!editPayment && !paymentLoading) || (customer && !paymentMethod && !paymentLoading) ? (
                    <button disabled={ disabled && !paymentMethod}  id="submit" onClick={handleSubmit}>
                        <span id="button-text">
                            {processing ? (<div className="spinner" id="spinner"></div>) : ("Confirm Payment")}
                        </span>
                    </button>
                ) : <></>
                }
                
            </div>
               
            
            </>
        )
    }
}
export default Checkout
// 4000 0027 6000 3184 (auth card)