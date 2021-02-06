import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';
import NavBar from '../../components/NavigationBar';
import '../../styles/CheckoutPage.css';
import createPaymentMethod from './CreatePayment'

function Checkout ({backend}) {

    /* ------- LOADING STATES ------- */
    // The loading states determine what you will see when you hit the "/checkout" route the first time
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

    // Update paymentMethod state by sending grabPaymentMethod function as prop down to Checkout/PaymentMethod. The grabPaymentMethod function will run in Checkout/PaymentMethod right after fetching the server for are any default, saved OR last used, saved, or no, saved cards (look down for more details on the grabPaymentMethod function)
    const [paymentMethod, setPaymentMethod] = useState({})
    
    // Update editPayment, redisplayCardElement, showSavedCards state at Checkout/PaymentMethod by sending grabEditPayment, grabRedisplayCard, grabShowSavedCards functions as prop down to Checkout/PaymentMethod. When the functions are called at Checkout/PaymentMethod, the states would be respectively be updated. The Confirm Payment Button will show or not show depending on either one of these states.
    const[editPayment, setEditPayment] = useState(false)
    const [redisplayCardElement, setRedisplayCardElement] = useState(false)
    const [showSavedCards, setShowSavedCards] = useState(false)

    // collectCVV state gets updated to "true" string value whenever the Save button in Edit modal is clicked. When the Save button in Edit modal is clicked, grabCollectCVV function, which is sent as a prop down to Checkout/PaymentMethod, runs. If the collectCVV is "true" string value, the CVV Element is shown.
    const [collectCVV, setCollectCVV] = useState('false')
    
    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe(); // need stripe instance to confirm card payment: stripe.confirmCardPayment()
    const elements = useElements(); // need elements to grab the CVV or Card Element


    /* ------- FUNCTIONS TO UPDATE PAYMENT-RELATED STATES ------- */

    // paymentLoading default state is true, so when you hit /checkout, you see an empty div. But in useEffect, paymentLoading state is updated to false so that the user can see the cart page if there are no items in the cart OR see the payment method component and not just an empty div 
    const grabPaymentLoading = (paymentLoading) => {
        setPaymentLoading(paymentLoading)
    }

    // Update paymentMethod state by sending grabPaymentMethod function as prop down to Checkout/PaymentMethod. We want to update the paymentMethod state default value {} to some object when we either 1) first load or refresh /checkout route, 2) add new card, 3) update card. We want to update the paymentMethod state because it contains an object with saved card information that we want to display in the Payment Method component. If there is no saved card, then the paymentMethod state will just get updated to {paymentMethodID: null} - even though the paymentMethod state does not contain information to display, it tells us to display a checkout form instead.
    const grabPaymentMethod = (paymentMethod) => {
        
        setPaymentMethod(paymentMethod)      

        grabBilling(paymentMethod.billingDetails) // Update the billing state with the billing details 
        setCollectCVV(paymentMethod.recollectCVV) // When we load /checkout route, each card's info sent from the server includes a recollectCVV property that indicates "true" or "false" string values. So the card that is auto loaded or selected or when an Add New Card modal is closed will either show a CVV element or not by the collectCVV state. When we update the card, grabPaymentMethod() runs , collectCVV state is updated to "true" string value. Since grabPaymentMethod() runs when we add a new card, we need to show the new card but it does not need the CVV Element, which is indicated by the "false" string value of recollectCVV property sent from the server. Since collectCVV state is passed as a prop, Checkout/PaymentMethod component can use collectCVV state's value to know if it should show CVV Element. CVV Element is shown if collectCVV is "true"
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

    // Update editPayment, grabRedisplayCardElement, grabShowSavedCards states by sending grabEditPayment() down as prop to Checkout/PaymentMethod, which gets updated to true if the Edit, or Add New Card, or Saved Cards button is clicked in Checkout/PaymentMethod component. If editPayment, or redisplayCardElement, or showSavedCards state is true, then we do not show Confirm Card Payment button.
    const grabEditPayment = (edit) => {
        setEditPayment(edit)
    }
    
    const grabRedisplayCardElement = (redisplayCardElement) => {
        console.log("checkout redisplay", redisplayCardElement)
        setRedisplayCardElement(redisplayCardElement)
    }

    const grabShowSavedCards = (showSavedCards) => {
        setShowSavedCards(showSavedCards)
    }

    const grabCollectCVV = (collectCVV) => {
        console.log("checkout collect cvv", collectCVV)
        setCollectCVV(collectCVV)
    }

    

    const grabError = (error) => {
        setError(error)
    }
    const grabDisabled = (disabled) => {
        setDisabled(disabled)
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

    // Helper to check if user is logged in
    const loggedIn = () => localStorage.getItem('token')

    /* ------- CREATE NEW OR UPDATE EXISTING PAYMENT INTENT AFTER RENDERING DOM ------- */
    useEffect(() => {
        const handleCheckout = async () => {

            if (loggedIn()) {
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                })
                const cartResponseData = await cartResponse.json();
                console.log(cartResponseData);
                if(cartResponseData.cart === "No cart available") {
                    localStorage.setItem("cartItems", false);
                    setRedirect(true);
                    setLoading(false)
                    return;
                }
                if(typeof cartResponseData.cart !== 'string'){
                    localStorage.setItem('cartItems', true)
                    const paymentIntentResponse = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': cartResponseData.cart._id,
                            'Authorization': loggedIn()
                        }
                    })
                    const paymentIntentData = await paymentIntentResponse.json()
                    console.log(paymentIntentData);
                    setLoading(false)
                    setCustomer(paymentIntentData.customer);
                    setClientSecret(paymentIntentData.clientSecret);
                } 
            } else {
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include'
                })
                const cartResponseData = await cartResponse.json()
                console.log(cartResponseData);
                if(cartResponseData.message) {
                    localStorage.setItem('guestCartItems', false)
                    setRedirect(true)
                    setLoading(false)
                    return
                } else if(cartResponseData.sessionID){
                    console.log("cookie checkout: ", document.cookie)
                    localStorage.setItem('guestCartItems', true)
                    const paymentIntentResponse = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': cartResponseData.sessionID
                        },
                        credentials: 'include'
                    })
                    const paymentIntentData = await paymentIntentResponse.json()
                    console.log(paymentIntentData);
                    setLoading(false)
                    setCustomer(paymentIntentData.customer)
                    setClientSecret(paymentIntentData.clientSecret)
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

        // Check if user is logged in. If user is a guest, then make sure guest did not clear cookies. If guest cleared cookies, then we cannot proceed payment so we will redirect to Cart page.
        if(!loggedIn()) {
            const cartResponse = await fetch(`${backend}/buyer/cart`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const cartResponseData = await cartResponse.json()
            console.log(cartResponseData);
            if(cartResponseData.message) return setRedirect(true)
        }

        console.log(clientSecret)

        // If there is no already saved card, and therefore, no card details displayed by PaymentMethod component, then we need to only display the Card Element that is also via the PaymentMethod component, but if the user is logged in then we need to also give the option of saving the card details from the Card Element. So let's run saveCardForFuture helper function. If user did not click save card, then saveCardForFuture will just return null.
        let newSavedCheckoutPaymentMethod

        if(!paymentMethod.paymentMethodID && customer){
            const cardElement = elements.getElement(CardElement)
            const checkbox = document.getElementById('saveCard')
            if(checkbox && checkbox.checked){
                 newSavedCheckoutPaymentMethod = await createPaymentMethod(stripe, cardElement, billing, cardholderName, backend)
            }
            console.log("newSavedCheckoutPaymentMethod: ", newSavedCheckoutPaymentMethod)
        }
        console.log("collect CVV at checkout component: ", collectCVV)
        // Confirm the payment using either 1) an already saved card (default or last used) - designated by paymentMethodID state 2) a card being created and saved during checkout - designated by paymentMethod.paymentMethodID 3) a card being created and not saved during checkout
        let confirmCardResult
        if (paymentMethod.paymentMethodID || (newSavedCheckoutPaymentMethod && newSavedCheckoutPaymentMethod.paymentMethodID)){ // For saved cards
            console.log(181, elements.getElement(CardCvcElement))
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                // Check if there is an already default or last used saved card first. 
                // If there is one, use that first. If there is not one, use the NEW card created during checkout that has now been saved to the logged in user through saveCardForFuture helper function.
                payment_method: paymentMethod.paymentMethodID ? paymentMethod.paymentMethodID : newSavedCheckoutPaymentMethod.paymentMethodID,
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
        } else if(confirmCardResult.paymentIntent.status === 'succeeded'){
            // The payment has been processed!
            console.log('succeeded')
            if(localStorage.getItem('cartItems')) localStorage.setItem('cartItems', false);
            if(localStorage.getItem('guestCartItems')) localStorage.setItem('guestCartItems', false)
            // Need to put these updating state functions in the Order Complete component??
            setDisabled(true)
            setProcessing(false)
            setRedisplayCardElement(false)
            setCollectCVV("false")
            setPaymentMethod({})

            // Redirect to Order Complete component
        }
    }
        

    // const saveCardForFuture = async() => {
    //     const checkbox = document.getElementById('saveCard')
        
    //     console.log(checkbox, checkbox.checked)

    //     // If user is logged in, user is also a Stripe customer. If logged in user checks the Save Card box, create the payment method with stripe.createPaymentMethod(), and on the server-side, check if the newly created payment method is a duplicate of already saved payment methods attached to Stripe customer before attaching to the Stripe customer. If duplicate card number, detach old one and attach the new one to Stripe customer. The server will send back the new payment method ID that was created by stripe.createPaymentMethod().
    //     const cardElement = elements.getElement(CardElement)
 
    //     if(checkbox && checkbox.checked) {
    //         return await createPaymentMethod(stripe, cardElement, billing, cardholderName, backend)
    //     }
    //     // Return null for payment method ID if user did not check Save Card 
    //     return {paymentMethodID: null}
    // }


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
                <PaymentMethod backend={backend} loggedIn={loggedIn} error={error} grabError={grabError} disabled={disabled} grabDisabled={grabDisabled} paymentLoading={paymentLoading} grabPaymentLoading={grabPaymentLoading} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} paymentMethod={paymentMethod} grabPaymentMethod={grabPaymentMethod} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} collectCVV={collectCVV} grabCollectCVV={grabCollectCVV} editPayment={editPayment} grabEditPayment={grabEditPayment} redisplayCardElement={redisplayCardElement} grabRedisplayCardElement={grabRedisplayCardElement} grabShowSavedCards={grabShowSavedCards}/>
                {/* Show any error that happens when processing the payment */}
                {( error) && (<div className="card-error" role="alert">{error}</div>)}
    
                {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display as indicated by paymentMethodID state OR does have an already default/last used saved card but want to add a new card as indicated by redisplayCardElement state. Do not show the checkbox for guests (as indicated by customer state). */}
                {(customer && !paymentMethod.paymentMethodID && !paymentLoading) ? (
                    <div>
                        <label htmlFor="saveCard">
                            Save card for future purchases
                            <input type="checkbox" id="saveCard" name="saveCard" />
                        </label>
                    </div>
                ): <div></div>}

                {/* Do not show the Confirm Payment button when Saved Cards modal, Edit modal, and Add New Card modal are open & when payment method component is still loading (indicated by default true "paymentLoading" state - the "paymentLoading" state does not change to false until Checkout/PaymentMethod component render*/}

                {((!editPayment && !paymentLoading) || (!redisplayCardElement && !paymentLoading) || (!showSavedCards && !paymentLoading)) ? (
                    // Disable Confirm Payment button when either there is an error, 
                    // OR when the user does not have a saved payment method to display and needs to fill out the checkout form but has not filled out the Card Element on the form yet. BUT We do NOT want to disable the button when logged in user has a saved payment method.
                    // To know if user has a saved payment method or not, check the value of paymentMethod.paymentMethodID. 
                    <button disabled={ (disabled && !paymentMethod.paymentMethodID) || error }  id="submit" onClick={handleSubmit}>
                        <span id="button-text">
                            {processing ? (<div className="spinner" id="spinner"></div>) : ("Confirm Payment")}
                        </span>
                    </button>
                ) : <></>}
                
            </div>         
            </>
        )
    }
}
export default Checkout
// 4000 0027 6000 3184 (auth card)