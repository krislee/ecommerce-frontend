import React, { useEffect, useState } from 'react';
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';

function PaymentMethod ({ backend, checkoutData, token, handleCardChange, redirect, billing, grabBilling, handleBillingChange, cardholderName, handleCardholderNameChange, grabPaymentMethodID, editPayment, grabEditPayment, collectCVV, grabCollectCVV, redisplayCardElement, grabRedisplayCardElement}) {

    const [paymentData, setPaymentData] = useState({})
    // const [editPayment, setEditPayment] = useState(false)
    // const [redisplayCardElement, setRedisplayCardElement] = useState(false)

    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        // console.log(12, redirect)
        console.log("running fetching payment method if no redirect")
        console.log("CVV state payment: ", collectCVV)
        console.log("redisplay card element payment", redisplayCardElement)
        if(localStorage.getItem('cartItems') !== 'false' && token){
            // Get either a 1) default, saved card or 2) last used, saved (but not default) card info back (will be an object response), OR 3) no saved cards (will be null     response)
            const fetchPaymentMethod = async () => {
                const paymentMethodResponse = await fetch(`${backend}/order/checkout/payment`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                })
                const paymentMethodData = await paymentMethodResponse.json()
                console.log(paymentMethodData);
                // After getting the card info, update paymentMethodID state in Checkout Page. The value is either a string of the payment method ID or null if there is no payment method saved for the logged in user. 
                grabPaymentMethodID(paymentMethodData.paymentMethodID)

                setPaymentData(paymentMethodData)

                // grabBilling() only updates the billing state at Checkout if there are billing details sent back from the fetch to the server for checkout payments. Billing details are sent back from server if there is a default, saved or last used, saved card. The updated billing state will allow the input values in BillingInput components to be updated since billing state is passed as prop from Checkout to PaymentMethod to BillingInput component.
                if(paymentMethodData.paymentMethodID) {
                    grabBilling(paymentMethodData.billingDetails)
                    // When the logged in user first loads the checkout page, the payment method renders. If there are cart items, then it will render the card & billing details info. If, before checkout was completed, the payment method was at any time edited, either at non-checkout or at checkout, then we want <CollectCard /> to be rendered during checkout. 
                    // So the <CollectCard /> component will render depending on the collectCVV state, which was passed as prop from CheckoutPage and is initially "false" (string value). The collectCVV state gets updated in this component when we either 1) fetch the server for the default, saved OR last used, saved OR null card 2) or when we click Edit to edit the displaying card expiration and/or billing details. We need to update the collectCVV state when we fetch the server because if there is a saved card that was previously edited during non-checkout OR during checkout, then the server's update payment method function will send back in the JSON recollectCVV: true (true is a string). So when the user does not hit the Edit button but the checkout page reloads (either because user decides to go back or refreshes), then we need to still show the CVV card element when the checkout page loads because user had previously edited the payment method.
                    console.log("property recollectCVV", paymentMethodData.recollectCVV, typeof paymentMethodData.recollectCVV )
                    grabCollectCVV(paymentMethodData.recollectCVV)
                }
                // if(redisplayCardElement && collectCVV) {
                //     const CVC = elements.getElement(CardCvcElement)
                //     console.log(CVC)
                //     CVC.unmount()
                //     console.log(CVC)
                // }
            }
            fetchPaymentMethod();
        } else if (localStorage.getItem('cartItems') === 'false'){
            grabPaymentMethodID(null) // also applies to guest
            grabCollectCVV("false") // also applies to guest
        }
    }, [editPayment])

    const handleUpdatePayment = async(event) => {
        console.log("Update payment")
        
        if (localStorage.getItem('token')) {

            grabCollectCVV('true')
            console.log(redisplayCardElement)
            console.log(billing)

            const updatePaymentMethodReponse = await fetch(`${backend}/order/update/payment/${paymentData.paymentMethodID}?checkout=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }, 
                body: JSON.stringify({
                    billingDetails: {
                        name: `${billing.firstName} ${billing.lastName}`,
                        line1: billing.line1,
                        line2: billing.line2,
                        city: billing.city,
                        state: billing.state,
                        postalCode: billing.postalCode,
                        country: 'US'
                    },
                    expMonth: 11,
                    recollectCVV: true
                })
            })
            
            const updatePaymentMethodData = await updatePaymentMethodReponse.json()
            console.log(updatePaymentMethodData);
            // console.log(paymentMethodData);
            if(await updatePaymentMethodData.paymentMethodID) {
                // setEditPayment(false)
                grabEditPayment(false)
            }
        } else {
            return (
                <div>Uh oh! It looks like you are logged out. Please log back in.</div>
            )
        }
    }

    const handleAddNew = async () => {
        grabRedisplayCardElement(true)
        grabCollectCVV("false")
        console.log(105)
        
        // if(redisplayCardElement && collectCVV === 'false') {

        // }
            const CVV = elements.getElement(CardCvcElement)
            console.log(CVV)
            if(CVV) {
                CVV.destroy()
            }
            console.log(CVV)
        
    }
    // Normally, Card Element is displayed only if 1) card and billing details are not sent back after fetching to /order/checkout/payment because it indicates there is no card attached to the Stripe customer (meaning there is no card saved to the user) so !paymentData.paymentMethodID, and 2) editPayment must also be false so that the Card Element is displayed because we do not want the Card Element when editing the card is happening. 
    // But when we do have card and billing details, and we click Add New, we want to display the Card Element. 
    // To do so, we click Add New -->  passing true to grabRedisplayCardElement() function that was sent down as a prop to PaymentMethod component --> redisplayCardElement state at Checkout component is updated to true --> Checkout component re-renders, causing PaymentMethod component. Cince redisplayCardElement state was passed a prop to PaymentMethod component, the true value of redisplayCardElement allows the Card Element to be displayed again through the conditional statement: if((!paymentData.paymentMethodID && !editPayment) || redisplayCardElement){}
    // We need to reset the redisplayCardElement to false after confirming payment so that if user has a default or last used saved card, then the saved card details gets rendered and not the Card Element again when user goes to checkout with items. 
    if((!paymentData.paymentMethodID && !editPayment) || (paymentData.paymentMethodID && redisplayCardElement)) {
        {/* Show Card and Billing Details or Card element and input depending if there is an already default or last used, saved card for logged in user. If there is an already default or last used, saved card, a payment method ID gets returned from the server. */}
        console.log(108, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)
        return (
            <div>
                <h2>Payment</h2>
                <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>
                <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>
                <h2>Billing Address</h2>
                <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>
                {redisplayCardElement && <button onClick={() => {
                    grabRedisplayCardElement(false)
                    if(paymentData.recollectCVV === 'true') {
                        grabCollectCVV("true")
                        const card = elements.getElement(CardElement)
                        // console.log(card)
                        card.destroy()
                    }
                }}>Close</button>}
            </div>
        )
    } else if(paymentData.paymentMethodID && !editPayment && !redisplayCardElement) {
        console.log(124, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)
        return (
            <div>
                <h2>Payment</h2>
                <p><b>{paymentData.brand}</b></p>
                <p>Ending in <b>{paymentData.last4}</b></p>
                <p>Expires <b>{paymentData.expDate}</b></p>
                <p><b>{paymentData.cardholderName}</b></p>

                {(collectCVV === 'true' && !redisplayCardElement) && <CollectCard collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />}

                <h2>Billing Address</h2>
                <p>{paymentData.billingDetails.name}</p>
                <p>{paymentData.billingDetails.address.line1}</p>
                <p>{paymentData.billingDetails.address.line2}</p>
                <p>{paymentData.billingDetails.address.city}, {paymentData.billingDetails.address.state} {paymentData.billingDetails.address.postalCode}</p>

                {/* Click Edit to update payment method */}
                <button id={paymentData.paymentMethodID} onClick={() => { 
                    // The editPayment state get changed to true depending if the Edit button is clicked or when the Close button is clicked. If Edit button is clicked, the value true is passed back down to Checkout via the grabEditPayment() to determine if the Confirm Payment button in Checkout will be shown.
                    // setEditPayment(true) 
                    grabEditPayment(true)
                }}>Edit</button>

                {/* Click Add New to add a new payment method */}
                <button id={paymentData.paymentMethodID} onClick={handleAddNew}>Add New</button>

                <button onClick={()=> console.log("collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)}>Check</button>
            </div>
        )
    } else if(paymentData.paymentMethodID && editPayment) {
        console.log(156)
        return (
            <>
                <div>
                    <h2>Payment</h2>
                    <p><b>{paymentData.brand}</b></p>
                    <p>Ending in <b>{paymentData.last4}</b></p>
                    <p>Expires <b>{paymentData.expDate}</b></p>
                    <p><b>{paymentData.cardholderName}</b></p>
                </div>
                    {/* <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} /> */}
                <input type='text'></input>
                <div>
                    <BillingInput billing={billing} handleBillingChange={handleBillingChange} />
                    <button onClick={handleUpdatePayment}>Save</button>
                    <button onClick={() => {
                        // setEditPayment(false)
                        grabEditPayment(false)
                    }}>Close</button>
                </div>
            </>
        )
    } 
}
export default PaymentMethod