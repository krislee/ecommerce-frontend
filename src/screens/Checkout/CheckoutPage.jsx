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
            - Their objects will contain either card and billing details information(paymentMethod state) or just billing details information(billingDetails state) from the server 
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
        if(paymentMethod.cardholderName)setCardholderName(paymentMethod.cardholderName)
    }

    // We need to prefill the billing details input when user wants to edit the displayed, saved card's billing details or add a new card's billing details. To do this, we pass down billing state as prop down to Checkout/PaymentMethod and then further down to Component/BillingInput. Each Component/BillingInput inputs' value attribute will now equal to each billing state keys. The billing state keys' values have been set by running grabBilling(<payment_method_billing_details>).
    // grabBilling(<payment_method_billing_details>) runs at Checkout/PaymentMethod's useEffect(), updating the card, adding new card, and selecting a card since grabPaymentMethod() runs during any of the 3 actions
    const grabBilling = (billing) => {
        console.log(billing)
        if (billing) {
            const name = billing.name.split(", ")
            console.log("name after splitting: ", name)
            setBilling({
                firstName: name[0],
                lastName: name[1],
                line1: billing.address.line1,
                line2: billing.address.line2 ? billing.address.line2 : "",
                city: billing.address.city,
                state: billing.address.state,
                postalCode: billing.address.postalCode
            })
        }  
    }

    // Update collectCVV states when 1) load or refresh /checkout URL 2) update card 3) select card 4) add card. Updated collectCVV states will let us know if we need to show a CVV Element.
    const grabCollectCVV = (collectCVV) => {
        console.log("checkout collect cvv", collectCVV)
        if(collectCVV) setCollectCVV(collectCVV)
    }

    const grabCardholderName = (cardholderName) => {
        setCardholderName(cardholderName)
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
            // We need to first check if user is logged in or not, since all the routes will contain different headers.
            // Then, check if there are items in the cart. We only want to create/update a payment intent when there are items in the cart (Stripe does not let you create a payment intent with 0 as the amount). When we create a payment intent, we need to attach an Idempotency-Key header to the server. The server uses the idempotency-key to know NOT to create multiple,duplicate payment intents whenever we hit /checkout route. The idempotency-key value for logged in and guest users is the cart's ID, or session cart's ID.
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
                // If there are no cart items, then redirect user to cart page. Also update loading state to false or else if loading state is still true, then it will return <></>.
                if(cartResponseData.cart === "No cart available") {
                    setRedirect(true);
                    setLoading(false)
                    return;
                }
                // If there are cart items, then create/update a payment intent. 
                if(typeof cartResponseData.cart !== 'string'){
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
                    
                    setLoading(false) // Update loading state to false so we won't return <></> again when we re-render.
                    setCustomer(paymentIntentData.customer); // Update customer's state. The customer state will dictate if we should show the Save Card for Future Purchase checkbox, if we should run the function when the Save Card checkbox is checked, which stripe.confirmCardPayment() to run.
                    setClientSecret(paymentIntentData.clientSecret) // need the client secret in order to call stripe.confirmCardPayment(); the client secret will be the same if we are updating a payment intent
                } 
            } else {
                // We want to always include a credentials: 'include' header, so that the session ID will be sent back in the request headers to the server. 
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include'
                })
                const cartResponseData = await cartResponse.json()
                console.log(cartResponseData);
                if(cartResponseData.message) {
                    setRedirect(true)
                    setLoading(false)
                    return
                } else if(cartResponseData.sessionID){
                    console.log("cookie checkout: ", document.cookie)
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

    const handleSubmit = async (event) => {
        
        grabDisabled(true) // Disable Confirm Payment button once we hit it
        setProcessing(true) // Create a spinner by updating processing state to true
        // We don't want to let default form submission happen here, which would refresh the page.
        event.preventDefault();

        // Check if Stripe.js has loaded yet.
        if (!stripe || !elements) {
            return; // return when Stripe.js is not loaded
        }

        // If user is a guest because either 1) user was always going through the website as guest, or 2) logged in user cleared local storage before clicking Confirm Payment, then check if guest has cookies, which stores the session ID that we send to the server. The session ID is used to look up a session which contains the cart items. If guest cleared cookies before clicking Confirm Payment or if logged in user logged cleared local storage before clicking Confirm Payment, then there is no session ID to send to the server, so we cannot retrieve the session containing the cart items. If there are no cart items, then we cannot proceed payment so we will redirect to Cart page by updating redirect state from default false to true.
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

        // If logged in user (indicated by truthy customer's state) does not have any saved cards (indicated by !paymentMethod.paymentMethodID), the Checkout/Payment will show the Card Element and billing inputs. There will also be a Save Card for Future checkbox. If it is checked, then createPaymentMethod() function will run (arguments are required) with the returned object saved in newSavedCheckoutPaymentMethod variable. If logged in user did not check the Save Card for Future or if user is a guest, then newSavedCheckoutPaymentMethod variable remains as an empty obj.
        let newSavedCheckoutPaymentMethod = {}

        if(!paymentMethod.paymentMethodID && customer){
            const cardElement = elements.getElement(CardElement)
            const checkbox = document.getElementById('saveCard')
            if(checkbox && checkbox.checked){
                 newSavedCheckoutPaymentMethod = await createPaymentMethod(stripe, cardElement, billing, cardholderName, backend)
            }
            console.log("newSavedCheckoutPaymentMethod: ", newSavedCheckoutPaymentMethod)
        }

        console.log("collect CVV at checkout component: ", collectCVV)

        // Confirm the payment using either (listed in order): 1) an already saved card (default or last used or last created) (indicated by paymentMethod state: the paymentMethod state is an object with a paymentMethodID key that has a value of string or null (null indicates no saved card)) 2) a new card being created and saved during checkout (indicated by newSavedCheckoutPaymentMethod's non-empty object) 3) a card being created and not saved during checkout 
        let confirmCardResult
        // If is a saved card from either option 1 or 2, then use the payment method's ID from either option 1 or 2
        if (paymentMethod.paymentMethodID ||  newSavedCheckoutPaymentMethod.paymentMethodID){ // For saved cards
            console.log(181, elements.getElement(CardCvcElement))
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                // Check if there is an already saved card first
                // If there is one (indicated by paymentMethod state), use that first for payment_method param. If there is not one, use the NEW card created and saved during checkout (indicated by newSavedCheckoutPaymentMethod variable)
                payment_method: paymentMethod.paymentMethodID ? paymentMethod.paymentMethodID : newSavedCheckoutPaymentMethod.paymentMethodID,
                // If there is a CVV Element displayed because the card was previously edited but have not been used to confirm payment (indicated by collectCVV state), then the CVV value (indicated by elements.getElement(CardCvcElement)) for payment_method_options param. If there is no CVV element, then payment_method_options param would not be included in stripe.confirmCardPayment()
                payment_method_options: (collectCVV === 'true') ? {
                    card: {
                    cvc: elements.getElement(CardCvcElement)
                    } 
                } : undefined
            })
        } else { // The following code runs if there are no saved cards because user is a guest or logged in user never saved a card
            console.log(135, paymentMethod)
            console.log(elements.getElement(CardElement))
            // Do not include the cardholder's name when confirming card payment because metadata is not a property in stripe.confirmCardPayment(). We need to store cardholder's name in metadata property.
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
            // Don't disable the button to let user be able to click Confirm Payment again after fixing card details.
            grabDisabled(false);
            setProcessing(false) // Stop the spinner
        } else if(confirmCardResult.paymentIntent.status === 'succeeded'){
            // The payment has been processed!
            console.log('succeeded')
            setProcessing(false) // Stop the spinner

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
            <div id="payment-form" >
                <PaymentMethod backend={backend} loggedIn={loggedIn} error={error} grabError={grabError} disabled={disabled} grabDisabled={grabDisabled} paymentLoading={paymentLoading} grabPaymentLoading={grabPaymentLoading} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} paymentMethod={paymentMethod} grabPaymentMethod={grabPaymentMethod} cardholderName={cardholderName} grabCardholderName={grabCardholderName}handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} collectCVV={collectCVV} grabCollectCVV={grabCollectCVV} editPayment={editPayment} grabEditPayment={grabEditPayment} redisplayCardElement={redisplayCardElement} grabRedisplayCardElement={grabRedisplayCardElement} grabShowSavedCards={grabShowSavedCards}/>
    
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