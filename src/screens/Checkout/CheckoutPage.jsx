import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';
import NavBar from '../../components/NavigationBar';
import '../../styles/CheckoutPage.css';
import createPaymentMethod from './CreatePayment'

function Checkout ({backend}) {
    // Helper to check if user is logged in
    const loggedIn = () => localStorage.getItem('token')

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
    
    // editPayment, redisplayCardElement, showSavedCards states represent if we are currently editing, adding new card, or showing all saved cards. Update editPayment, redisplayCardElement, showSavedCards state at Checkout/PaymentMethod by sending grabEditPayment, grabRedisplayCard, grabShowSavedCards functions as prop down to Checkout/PaymentMethod. 
    const[editPayment, setEditPayment] = useState(false)
    const [redisplayCardElement, setRedisplayCardElement] = useState(false)
    const [showSavedCards, setShowSavedCards] = useState(false)

    // collectCVV state gets updated to "true" string value whenever the Save button in Edit modal is clicked. When the Save button in Edit modal is clicked, grabCollectCVV function, which is sent as a prop down to Checkout/PaymentMethod, runs. If the collectCVV is "true" string value, the CVV Element is shown. If collectCVV state is "false" string value, the CVV Element is not shown.
    const [collectCVV, setCollectCVV] = useState('false')
    
    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe(); // need stripe instance to confirm card payment: stripe.confirmCardPayment()
    const elements = useElements(); // need elements to grab the CVV or Card Element


    /* ------- FUNCTIONS TO UPDATE PAYMENT METHOD-RELATED STATES ------- */

    // paymentLoading default state is true, so when you hit /checkout, you see an empty div. But in useEffect, paymentLoading state is updated to false so that the user can see the cart page if there are no items in the cart OR see the payment method component and not just an empty div 
    const grabPaymentLoading = (paymentLoading) => {
        setPaymentLoading(paymentLoading)
    }

    /* 
    1) collectCVV state & grabPaymentMethod() function passed as props from CheckoutPage to Checkout/PaymentMethod  
    2) Checkout/PaymentMethod's useEffect() runs: fetch server for default-saved or last-used-saved card or last-created-saved card or no saved card (null) 
    3) grabPaymentMethod(<fetch_returned_response>) runs  
    4) paymentMethod, billingDetails, and recollectCVV states are updated at CheckoutPage from default empty objects and 'false', respectively, to the object and recollectCVV property values retrieved from the fetch returned response, respectively  
        > paymentMethod & billing State:
            - Their objects will contain either card and billing details information(paymentMethod state) or just billing details information(billingDetails state) that from the server 
        > collectCVV State:
            - recollectCVV property value is either "true" or "false", so collectCVV state is either "true" or "false"
            - updating the card will tell the server to set recollectCVV property to "true", so when grabPaymentMethod() runs after a response from fetching the server is returned, collectCVV state will be "true"
            - adding the card will tell the server to set recollectCVV property to "true", so when grabPaymentMethod() runs after a response from fetching the server is returned, collectCVV state will be "false"
    5) CheckoutPage re-renders & Checkout/PaymentMethod re-renders since Checkout/PaymentMethod is in CheckoutPage component displaying the information from paymentMethod, billingDetails, recollectCVV updated states 
    
    grabPaymentMethod() runs again when we add new card, update card, select card, and steps 4 & 5 are followed again
    */
    const grabPaymentMethod = (paymentMethod) => {   
        setPaymentMethod(paymentMethod)      
        grabBilling(paymentMethod.billingDetails) 
        grabCollectCVV(paymentMethod.recollectCVV) 
        setCardholderName(paymentMethod.cardholderName)
    }

    // We need to prefill the billing details input when user wants to edit the displayed, saved card's billing details or add a new card's billing details. To do this, we pass down billing state as prop down to Checkout/PaymentMethod and then further down to Component/BillingInput. Each Component/BillingInput inputs' value attribute will now equal to each billing state keys. The billing state keys' values have been set by running grabBilling(<payment_method_billing_details>).
    // grabBilling(<payment_method_billing_details>) runs at Checkout/PaymentMethod's useEffect(), updating the card, adding new card, and selecting a card since grabPaymentMethod() runs during any of the 3 actions
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

    // Update collectCVV states when 1) load or refresh /checkout URL 2) update card 3) select card 4) add card. Updated collectCVV states will let us know if we need to show a CVV Element.
    const grabCollectCVV = (collectCVV) => {
        console.log("checkout collect cvv", collectCVV)
        setCollectCVV(collectCVV)
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

    // Show Errors in the div when Saving new card or Confirming card payment. If there is an error, disable Save or Confirm Payment button.
    const grabError = (error) => {
        setError(error)
    }

    // When we are typing in the Card Element, handleCardChange() runs, making the grabDisabled() to run. This update the disable state to false, enabling the Confirm Payment or Save (in the Add New Card) button. 
    // When we do click Save or Close in the Add New Card modal, grabDisabled() runs to update disable state to true. This disables the button so that when we reopen the Add New Card modal, the Save button is disabled until we start typing in the Card Element without any error, enabling the Save button again. If there is an error after clicking Save for adding new card, we do not need to run grabDisabled() to disable Save button because grabError() updates the error state from null to an error value, and Save button disables when there is an error value.
    // grabDisabled() runs to update disable state to true when we hit Confirm Payment button - but if there is an error when confirming payment, update disable state back to false
    const grabDisabled = (disabled) => {
        setDisabled(disabled)
    }

    /* ------- LISTEN TO INPUT CHANGES TO UPDATE STATES ------- */  

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

     // Listen to changes on the Card Element to immediately display card errors (e.g. expiry date in the past, missing fields) and disable the button if the Card Element is empty.
    const handleCardChange = async (event) => {
        console.log("listening for card changes")
        grabDisabled(event.empty);
        grabError(event.error ? event.error.message : "");
    };

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
        grabDisabled(true)
        setProcessing(true)
        // We don't want to let default form submission happen here, which would refresh the page.
        event.preventDefault();

        // Check if Stripe.js has loaded yet.
        if (!stripe || !elements) {
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
            grabError(`Payment failed. ${confirmCardResult.error.message}`);
            grabDisabled(false);
            setProcessing(false)
        } else if(confirmCardResult.paymentIntent.status === 'succeeded'){
            // The payment has been processed!
            console.log('succeeded')
            if(localStorage.getItem('cartItems')) localStorage.setItem('cartItems', false);
            if(localStorage.getItem('guestCartItems')) localStorage.setItem('guestCartItems', false)
            // Need to put these updating state functions in the Order Complete component??
            setProcessing(false)
            setRedisplayCardElement(false)
            setCollectCVV("false")
            setPaymentMethod({})

            // Redirect to Order Complete component
        }
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
                <PaymentMethod backend={backend} loggedIn={loggedIn} error={error} grabError={grabError} disabled={disabled} grabDisabled={grabDisabled} paymentLoading={paymentLoading} grabPaymentLoading={grabPaymentLoading} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} paymentMethod={paymentMethod} grabPaymentMethod={grabPaymentMethod} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} collectCVV={collectCVV} grabCollectCVV={grabCollectCVV} editPayment={editPayment} grabEditPayment={grabEditPayment} redisplayCardElement={redisplayCardElement} grabRedisplayCardElement={grabRedisplayCardElement} grabShowSavedCards={grabShowSavedCards}/>
    
                {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display as indicated by paymentMethod state. Do not show the checkbox for guests (as indicated by customer state). */}

                {/* We want both Save Card checkbox & Confirm Payment button to be displayed at the same time was other payment method component stuff are loaded in. So we want to make sure paymentLoading state is false, or else both the checkbox and button will be displayed before the other payment method component stuff are displayed, and instead they are loaded when it says Loading... on the page */}
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
                    /* Disable Confirm Payment button when: 
                    1) There is an empty Card/CVV Element 
                    - We can tell if the Element is empty or not when handleCardChange() runs, handleCardChange() runs when there is typing/backspacing in the input. When handleCardChange() runs, the disabled state is updated to false when there is typing/backspacing or something written in Card Element
                    - A Card Element is only displayed if user does not have any saved cards. Saved card is indicated by a truthy value of paymentMethod.paymentMethodID (recall paymentMethod state was updated upon Checkout/PaymentMethod's useEffect() running, which fetches for either a default-saved, last-used-saved, last-saved, or no saved card - server sends back {paymentMethodID: null} for no saved card, so paymentMethod state equals to {paymentMethodID: null})
                    - A CVC Element is only displayed if there is a saved card with a "true" recollectCVV property) 
                    2) error when typing in the Card/CVV Element
                    */
                    <button disabled={ (disabled && !paymentMethod.paymentMethodID) || (disabled && paymentMethod.recollectCVV === "true") || error }  id="submit" onClick={handleSubmit}>
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
/* 



*/