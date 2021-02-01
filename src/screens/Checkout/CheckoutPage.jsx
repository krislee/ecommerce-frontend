import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';

function Checkout ({backend, paymentIntentInfo}) {
    const token = localStorage.getItem('token')
    
    /* ------- PAYMENT INTENT-RELATED STATES ------- */
    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [checkoutData, setCheckoutData] = useState('');
    const [redirect, setRedirect] = useState(false);

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
    const [paymentMethodID, setPaymentMethodID] = useState('')
    
    // Update editPayment state by sending grabEditPayment functions as prop down to Checkout/PaymentMethod. 
    const[editPayment, setEditPayment] = useState(false)

    const [collectCVV, setCollectCVV] = useState(false)

    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe();
    const elements = useElements();

    /* ------- FUNCTIONS TO UPDATE PAYMENT-RELATED STATES ------- */
    
    // Update paymentMethodID state by sending grabPaymentMethodID function as prop down to Checkout/PaymentMethod
    const grabPaymentMethodID = (paymentMethodID) => {
        setPaymentMethodID(paymentMethodID)      
        // If the logged in user has a default, saved or last used, saved card, the paymentMethodID state is a string. If paymentMethodID is truthy, then we will use it as the first option to confirm the card payment in stripe.confirmCardPayment(). If truthy, we would also not need to run the saveCardForFuture() helper since that should be run only if the card Element is displayed but it would not be displayed if there is a payment method ID from Checkout/PaymentMethod.
        // If the logged in user has neither or if user is a guest, then paymementMethodID is updated to null. If paymentMethodID is falsy, then we need to run saveCardForFuture() helper in case the user wants to save the card. 
    }

    // We need to prefill the billing details input when user wants to edit the displayed, saved card. So we pass the grabBilling function as prop to Checkout/PaymentMethod to update the billing state IF the payment data that comes back from fetching the server for either default, saved or last used, saved, or no, saved cards is default, saved or last used, saved card. 
    // By updating the billing state, and sending the billing state as prop down to Checkout/PaymentMethod and then further down to Component/BillingInput, the Component/BillingInput inputs value property can now use the billing state.
    const grabBilling = (billing) => {
        console.log(billing)
        const name = billing.name.split(" ")
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

    // Update editPayment state by sending grabEditPayment() down as prop to Checkout/PaymentMethod, which gets updated to true if the Edit button in Checkout/PaymentMethod component is clicked. If editPayment is true, then we do not show Confirm Card Payment button.
    const grabEditPayment = (edit) => {
        setEditPayment(edit)
    }

    const grabCollectCVV = (collectCVV) => {
        setCollectCVV(collectCVV)
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

    
    /* ------- CREATE NEW OR UPDATE EXISTING PAYMENT INTENT AFTER RENDERING DOM ------- */
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
                    localStorage.setItem("cartItems", false);
                    setRedirect(true);
                    return;
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
        let paymentMethod
        console.log(paymentMethodID)
        if(!paymentMethodID){
            paymentMethod = await saveCardForFuture()
            console.log(paymentMethod)
        }
        console.log("collect CVV: ", collectCVV)
        // Confirm the payment using either 1) an already saved card (default or last used) - designated by paymentMethodID state 2) a card being created and saved during checkout - designated by paymentMethod.paymentMethodID 3) a card being created and not saved during checkout
        let confirmCardResult
        if(paymentMethodID || paymentMethod.paymentMethodID){
            console.log(176, paymentMethod)
            confirmCardResult = await stripe.confirmCardPayment(clientSecret, {
                // Check if there is an already default or last used saved card first. 
                // If there is one, use that first. If there is not one, use the NEW card created during checkout that has now been saved to the logged in user through saveCardForFuture helper function.
                payment_method: paymentMethodID ? paymentMethodID : paymentMethod.paymentMethodID,
                payment_method_options: collectCVV ? {
                    card: {
                      cvc: elements.getElement(CardCvcElement)
                    }
                } : undefined
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
            setDisabled(false);
          } else {
            // The payment has been processed!
            if (confirmCardResult.paymentIntent.status === 'succeeded') {
              console.log('succeeded')
              setDisabled(true)
              setProcessing(false)

            // Redirect to Order Page
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

        <div id="payment-form">
            <div>Checkout Screen</div>
            <PaymentMethod backend={backend} checkoutData={checkoutData} token={token} billing={billing} handleBillingChange={handleBillingChange} grabBilling={grabBilling} grabPaymentMethodID={grabPaymentMethodID} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} handleCardChange={handleCardChange} grabEditPayment={grabEditPayment} grabCollectCVV={grabCollectCVV} redirect={redirect}/>

            {/* Show any error that happens when processing the payment */}
            {error && (<div className="card-error" role="alert">{error}</div>)}

            {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display. Do not show the checkbox for guests. */}
            {(customer && !paymentMethodID)? (
                <div>
                    <input type="checkbox" id="saveCard" name="saveCard" />
                    <label htmlFor="saveCard">Save card for future purchases</label>
                </div>
            ): <div></div>}
            {!editPayment ? (
                <button disabled={ disabled && !paymentMethodID }  id="submit" onClick={handleSubmit}>
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
export default Checkout

// 4000 0027 6000 3184 (auth card)