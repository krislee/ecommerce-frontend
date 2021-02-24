import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';
import { io } from "socket.io-client";

import Shipping from './Shipping'
import PaymentMethod from './PaymentMethod'
import CheckoutItems from './CheckoutItems'
import OrderComplete from './OrderComplete'

import createPaymentMethod from './CreatePayment'
import '../../styles/CheckoutPage.css';


const socket = io.connect('wss://elecommerce.herokuapp.com',  { transports: ['websocket', 'polling', 'flashsocket'] }) // connect to socket outside function because we want to connect to the socket only one time; if inside the function, then it will reconnect at every render; reconnecting more than once will give us multiple socket IDs

function Checkout ({ backend, loggedIn,loggedOut, grabLoggedOut, cartID, grabCartID, grabTotalCartQuantity, grabSocketContainer }) {
    // Helper to check if user is logged in

    /* ------- LOADING STATES ------- */
    // The loading states determine what you will see when you hit the "/checkout" route the first time
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(true)
    const [orderComplete, setOrderComplete] = useState(false)
    
    const [prevLoggedIn, setPrevLoggedIn] = useState(loggedIn())

    /* ------- PAYMENT INTENT-RELATED STATES ------- */
    // const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    /* ------- UI STRIPE STATES ------- */
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);

    /* ------- PAYMENT-RELATED STATES ------- */

    // Update the cartID state after fetching for the cart items in to store the logged in or guest session cart's ID
    // const [cartID, setCartID] = useState("")

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
    
    // editExpiration state gets updated when we edit the payment
    const [editExpiration, setEditExpiration] = useState({})
    
    /* ------- SHIPPING STATES ------- */
    
    const [sameAsShipping, setSameAsShipping] = useState(true) // checkbox state 
    // shipping state is to store ONE saved shipping address (either default, last used, or last created) that we wil display or no saved shipping address. Aside from useEffect(), whenever we select an address, update an address, or add a new address, shipping state is updated to store that current, saved shipping address to redisplay it. If shipping state stores an object of saved shipping address, then we would always use it 
    const [shipping, setShipping] = useState({})
    // shippingInput state that contains the address values for the input value
    const [shippingInput, setShippingInput] = useState({})
    
    // The following Shipping states controls if we show or hide the CheckoutItems, Shipping, and PaymentMethod component:
    const [showShipping, setShowShipping] = useState(false) // showShipping state is updated in either CheckoutItems and PaymentMethod components to show the Shipping details or form
    const [readOnly, setReadOnly] = useState(false) // Shipping form is enabled by default until we click Next button in CheckoutItems component, updating readOnly state to true to disable the shipping form. When we are showing the Payment component, and then click Edit in the Shipping component, we enable the shipping form to edit
    const [showButtons, setShowButtons] = useState(false) // If showButtons state is true, it will show 3 buttons: Add New, Edit, and Saved Shipping in the Shipping component. showButtons state is updated when we click Next button in CheckoutItems component and when we are in the Payment component but click on the Edit button in the Shipping component
    const [showPayment, setShowPayment] = useState(false) // showPayment state is passed to both PaymentMethod component, and is updated in the Shipping Component when we click Next or Edit button in the Shipping Component
    const [showItems, setShowItems] = useState(true) //showItems state is updated in CheckoutItems component

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
        if(paymentMethod.paymentMethodID) {
            let expMonth
            if(paymentMethod.expDate.split("/")[0].length === 1) expMonth = `0${paymentMethod.expDate.split("/")[0]}`
            else expMonth = paymentMethod.expDate.split("/")[0]
            setEditExpiration({month: expMonth, year: paymentMethod.expDate.split("/")[1]})
        }
    }

    // We need to prefill the billing details input when user wants to edit the displayed, saved card's billing details and after adding a new card. To do this, we pass down billing state as prop down to Checkout/PaymentMethod and then further down to Component/BillingInput. Each Component/BillingInput inputs' value attribute will now equal to each billing state keys. The billing state keys' values have been set by running grabBilling(<payment_method_billing_details>).
    // grabBilling(<payment_method_billing_details>) runs at Checkout/PaymentMethod's useEffect(), updating the card, after adding a new card, and selecting a card since grabPaymentMethod() runs during any of the 3 actions
    const grabBilling = (billing) => {
        console.log(billing)
        if (billing) {
            const name = billing.name.split(", ")
            console.log("name after splitting: ", name)
            console.log(billing.address.line2, typeof billing.address.line2)
            let billingline2
            if(billing.address.line2 === "null" || billing.address.line2 === "undefined") {
                console.log(112)
                billingline2 = ""
            } else {
                console.log(115)
                billingline2 = billing.address.line2
            }
            setBilling({
                firstName: name[0],
                lastName: name[1],
                line1: billing.address.line1,
                line2: billingline2,
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

    // We need to update the cardholder's name ????
    const grabCardholderName = (cardholderName) => setCardholderName(cardholderName)
 

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

    // Update editExpiration state to edit Payment Expiration Dates
    const grabEditExpiration = (editExpiration) => setEditExpiration(editExpiration)

    /* ------- CONTROL THE SAVE BUTTON OF ADDING NEW CARD AND CONFIRMING PAYMENT BUTTON ------- */  

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

    /* ------- FUNCTIONS UPDATING SHIPPING-RELATED STATES  ------- */  

    const grabPrevLoggedIn = (prevLoggedIn) => setPrevLoggedIn(prevLoggedIn)

    // update the shipping & shippingInput states whenever we Select a shipping, Add a new shipping, edit a shipping 
    const grabShipping = (shipping) => setShipping(shipping)
    const grabShippingInput = (shippingInput) => setShippingInput(shippingInput)

    // grabBillingWithShipping is only called on when we are going to display a payment method form for guest user, logged in user who never saved a card before, and logged in user who wants to save more cards; this function will update billing state to have the same values as shipping input state, allowing for the payment method form's billing details input values, which is dependent on billing state, to be the same as shipping input values
    const grabBillingWithShipping = (shippingInput) => setBilling(shippingInput)

    // The following Shipping states controls if we show or hide the CheckoutItems, Shipping, and PaymentMethod component:
    const grabShowItems = (showItems) => setShowItems(showItems)
    const grabShowShipping = (showShipping) => setShowShipping(showShipping)
    const grabShowPayment = (showPayment) => setShowPayment(showPayment) // grabShowPayment updates the showPayment state to true when we hit Next button from the Shipping component; when showPayment state is true, the payment method details or form is shown
    const grabShowButtons = (showButtons) => setShowButtons(showButtons)
    const grabReadOnly = (readOnly) => setReadOnly(readOnly)

    /* ------- PASSING SOCKET FROM CHECKOUT TO ORDER COMPLETE VIA APP ------- */  

    grabSocketContainer(socket)

    /* ------- LISTEN TO INPUT CHANGES TO UPDATE STATES ------- */  

    // handleBillingChange() gets passed down as prop to Checkout/PaymentMethod, and then to Component/BillingInput
    const handleBillingChange = (event) => {
        const { name, value } = event.target
        
        setBilling((prevBilling) => ({
            ...prevBilling, [name] : value // need the previous billing state when updating the billing state (hence the ...prevBilling) or else the other input values will be empty
        }))
    }
    
    const recheckSameAsShippingButton = (sameAsShipping) => setSameAsShipping(sameAsShipping)

    // When we click on the Same as Shipping Address checkbox, handleSameAsShipping serves as the onChange function. The checkbox is only shown in the payment method form displayed if a guest is user, logged in user does not have any saved cards, or when logged in user clicks Add New card to save more cards.
    const handleSameAsShipping = () =>{
        console.log(208, sameAsShipping)
        setSameAsShipping(!sameAsShipping) // changes if the checkbox is checked or not
        console.log(shipping)
        // If the checkbox is checked, we want the billing state to equal to shippingInput state. 
        if(!sameAsShipping) {
            setBilling({
                firstName: shippingInput.firstName,
                lastName: shippingInput.lastName,
                line1: shippingInput.line1,
                line2: shippingInput.line2,
                city: shippingInput.city,
                state: shippingInput.state,
                postalCode: shippingInput.zipcode,
            })
        } else {
            // If the checkbox is not checked, then leave the billing input fields empty
            setBilling({})
        }
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

    /* ------- REDIRECT TO CART PAGE ------- */  
    const grabRedirect = (redirect) => setRedirect(redirect) // aside from using redirect state at CheckoutPage component, redirect state is also passed down to the 2 other child components (CheckoutItems and Shipping) to be used for users who cleared local storage.

    const billingInputErrorDisableButton = () => {
        console.log(billing)
        console.log(cardholderName)
        return (
            /^[a-z][a-z\s]*$/i.test(cardholderName) !== true 
            || cardholderName === undefined
            || /^[a-z][a-z\s]*$/i.test(billing.firstName) !== true 
            || billing.firstName === undefined
            || /^[a-z][a-z\s]*$/i.test(billing.lastName) !== true 
            || billing.lastName === undefined
            || billing.line1 === undefined
            || billing.line1 === ''
            || /^[a-z][a-z\s]*$/i.test(billing.city) !== true 
            || billing.city === undefined
            || /^[a-z][a-z\s]*$/i.test(billing.state) !== true 
            || billing.state === undefined
        )
    }

    const billingPostalCodeInputErrorDisableButton = () => {
        return (
            /^[0-9]*$/g.test(billing.postalCode) !== true 
            || billing.postalCode === undefined
            || billing.postalCode === ''
        )
    }



    /* ------- CREATE NEW OR UPDATE EXISTING PAYMENT INTENT AFTER RENDERING DOM ------- */
    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        const handleCheckout = async () => {
            // We need to first check if user is logged in or not, since all the routes will contain different headers.
            // Then, check if there are items in the cart. We only want to create/update a payment intent when there are items in the cart (Stripe does not let you create a payment intent with 0 as the amount). When we create a payment intent, we need to attach an Idempotency-Key header to the server. The server uses the idempotency-key to know NOT to create multiple,duplicate payment intents whenever we hit /checkout route. The idempotency-key value for logged in and guest users is the cart's ID, or session cart's ID.
            if (loggedIn()) {
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                const cartResponseData = await cartResponse.json();
                console.log(cartResponseData);
                // If there are no cart items, then redirect user to cart page. Also update loading state to false or else if loading state is still true, then it will return <></>.
                if(cartResponseData.cart === "No cart available") {
                    grabTotalCartQuantity(0)
                    grabRedirect(true)
                    return setLoading(false) // need to update setLoading false or else it will always return null since loading is still true even if redirect is true
                }
                // If there are cart items, then create/update a payment intent. 
                if(typeof cartResponseData.cart !== 'string'){
                    const paymentIntentResponse = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': cartResponseData.cart._id,
                            'Authorization': loggedIn()
                        },
                        signal: signal
                    })
                    const paymentIntentData = await paymentIntentResponse.json()
                    console.log(paymentIntentData);
                    
                    setLoading(false) // Update loading state to false so we won't return <></> again when we re-render.
                    // setCustomer(paymentIntentData.customer); // Update customer's state. The customer state will dictate if we should show the Save Card for Future Purchase checkbox, if we should run the function when the Save Card checkbox is checked, which stripe.confirmCardPayment() to run.
                    setClientSecret(paymentIntentData.clientSecret) // need the client secret in order to call stripe.confirmCardPayment(); the client secret will be the same if we are updating a payment intent
                    grabCartID(cartResponseData.cart._id) // When we click Next in the ShippingForm component, we update the payment intent to include the shipping address. To update the PI, we need the Idempotency-Key header, in which its value is the cart ID. So after fetching the server for the cart, update the cartID to the id of the cart, and pass down cartID state to ShippingForm component.
                    
                    socket.emit('cartID', {cartID: cartResponseData.cart._id}) // send the cartID to the socket; the cartID will be store alongside the socket id at the database by our server since we want the socket to send the order info at webhook and webhook has access to the cartID; so by storing cartID with the socket id, we can find the socket id by using the cartID at webhook; we need the socket id to send the order info to a particular client
                } 
            } else {
                // We want to always include a credentials: 'include' header, so that the session ID will be sent back in the request headers to the server. 
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    signal: signal
                })
                const cartResponseData = await cartResponse.json()
                console.log(cartResponseData);
                if(cartResponseData.cart === "No items in cart") {
                    console.log(294)
                    grabTotalCartQuantity(0)
                    grabRedirect(true)
                    return setLoading(false) 
                } else if(cartResponseData.sessionID){
                    const paymentIntentResponse = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': cartResponseData.sessionID
                        },
                        credentials: 'include',
                        signal: signal
                    })
                    const paymentIntentData = await paymentIntentResponse.json()
                    console.log(paymentIntentData);
                    setLoading(false)
                    setClientSecret(paymentIntentData.clientSecret)
                    grabCartID(cartResponseData.sessionID)
                    socket.emit('cartID', {cartID: cartResponseData.sessionID})
                }
            }
        }    

        handleCheckout();

        return function cleanUp () {
            abortController.abort()
        }
        
    }, [loggedIn()]);

    const handleConfirmPayment = async (event) => {
        
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
            if(typeof cartResponseData.cart === 'string') {
                console.log(356)
                // Logged in user with both saved shipping & payment method OR only with saved payment only; Logged in user with saved shipping only; Logged in user with neither shipping nor payment method 
                if(prevLoggedIn) {
                    console.log(359)
                    return grabTotalCartQuantity(0) // update the Nav Bar & rerun CheckoutPage UseEffect
                }
                else {
                    grabTotalCartQuantity(0) // update the Nav Bar
                    return grabRedirect(true) // return so that we do not proceed confirming payment
                }
            }
        }

        // If logged in user (indicated by truthy customer's state) does not have any saved cards (indicated by !paymentMethod.paymentMethodID), the Checkout/Payment will show the Card Element and billing inputs. There will also be a Save Card for Future checkbox. If it is checked, then createPaymentMethod() function will run (arguments are required) with the returned object saved in newSavedCheckoutPaymentMethod variable. If logged in user did not check the Save Card for Future or if user is a guest, then newSavedCheckoutPaymentMethod variable remains as an empty obj.
        let newSavedCheckoutPaymentMethod = {}

        if(!paymentMethod.paymentMethodID && loggedIn()){
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
            // grabSuccessfulPaymentIntent(confirmCardResult.paymentIntent)
            setProcessing(false) // Stop the spinner
            setOrderComplete(true) //redirect to OrderComplete component
        }
    }
        
    if(loading) {
        return <></>
    } else if (redirect) {
        console.log(414)
        return <Redirect to="/cart"></Redirect>
    } else if(orderComplete) {
        return (
            <Redirect to={`/order-complete?orderNumber=${cartID}`}>
                <OrderComplete />
            </Redirect>
    )} else {
        return (
            <>
            {/* <NavBar /> */}
            <div id="payment-form" >
                <CheckoutItems backend={backend} loggedIn={loggedIn} showItems={showItems} grabShowItems={grabShowItems} grabShowShipping={grabShowShipping} grabShowButtons={grabShowButtons} grabShowPayment={grabShowPayment} grabReadOnly={grabReadOnly} grabTotalCartQuantity={grabTotalCartQuantity} grabRedirect={grabRedirect} shipping={shipping} grabTotalCartQuantity={grabTotalCartQuantity} revLoggedIn={prevLoggedIn} grabPrevLoggedIn={grabPrevLoggedIn} paymentMethod={paymentMethod} grabRedirect={grabRedirect} />

                <Shipping backend={backend} loggedIn={loggedIn} grabPaymentLoading={grabPaymentLoading} cartID={cartID} showPayment={showPayment} grabShowPayment={grabShowPayment} grabShowItems={grabShowItems} shipping={shipping} grabShipping={grabShipping} grabBillingWithShipping={grabBillingWithShipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} paymentMethod={paymentMethod} grabCardholderName={grabCardholderName} grabShowButtons={grabShowButtons} showButtons={showButtons} showShipping={showShipping} grabShowShipping={grabShowShipping} grabShowItems={grabShowItems} readOnly={readOnly} grabReadOnly={grabReadOnly} grabTotalCartQuantity={grabTotalCartQuantity} grabError={grabError} grabDisabled={grabDisabled} grabRedirect={grabRedirect} paymentMethod={paymentMethod} prevLoggedIn={prevLoggedIn} grabPrevLoggedIn={grabPrevLoggedIn} />

                <PaymentMethod backend={backend} loggedIn={loggedIn} error={error} grabError={grabError} disabled={disabled} grabDisabled={grabDisabled} paymentLoading={paymentLoading} grabPaymentLoading={grabPaymentLoading} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} paymentMethod={paymentMethod} grabPaymentMethod={grabPaymentMethod} cardholderName={cardholderName} grabCardholderName={grabCardholderName}handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} collectCVV={collectCVV} grabCollectCVV={grabCollectCVV} editPayment={editPayment} grabEditPayment={grabEditPayment} redisplayCardElement={redisplayCardElement} grabRedisplayCardElement={grabRedisplayCardElement} grabShowSavedCards={grabShowSavedCards} handleConfirmPayment={handleConfirmPayment} showSavedCards={showSavedCards} editExpiration={editExpiration} grabEditExpiration={grabEditExpiration} loggedOut={loggedOut} grabLoggedOut={grabLoggedOut} showPayment={showPayment} sameAsShipping={sameAsShipping} handleSameAsShipping={handleSameAsShipping} shippingInput={shippingInput} grabBillingWithShipping={grabBillingWithShipping} shipping={shipping} recheckSameAsShippingButton={recheckSameAsShippingButton} grabTotalCartQuantity={grabTotalCartQuantity}grabRedirect={grabRedirect} billingInputErrorDisableButton={billingInputErrorDisableButton} billingPostalCodeInputErrorDisableButton={billingPostalCodeInputErrorDisableButton} />
                
            </div>         
            </>
        )
    }
}
export default Checkout