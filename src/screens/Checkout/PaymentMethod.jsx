import React, { useEffect, useState } from 'react';
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"
import {useStripe, useElements, CardExpiryElement} from '@stripe/react-stripe-js';

function PaymentMethod ({ backend, checkoutData, token, handleCardChange, redirect, billing, handleBillingChange, cardholderName, handleCardholderNameChange, grabPaymentMethodID, grabBilling, grabEditPayment, grabCollectCVV }) {

    const [paymentData, setPaymentData] = useState({})
    const [editPayment, setEditPayment] = useState(false)
    const [updatedPayment, setUpdatedPayment] = useState(false)
    /* ------- SET UP STRIPE ------- */
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        console.log(12, redirect)
        if(!redirect){
            console.log("running fetching payment method if no redirect")
            if(token){
                // Get either a 1) default, saved card or 2) last used, saved (but not default) card info back (will be an object response), OR 3) no saved cards (will be null response)
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
                    }

                    // The editPayment state get changed to true depending if the Edit button is clicked or when the Close button is clicked. The editPayment state is passed back down to Checkout via the grabEditPayment() to determine if the Confirm Payment button in Checkout will be shown.
                    grabEditPayment(editPayment)
                }
                fetchPaymentMethod();
            } else {
                grabPaymentMethodID(null)
            }
        }
    },[])

    const handleUpdatePayment = async() => {
        console.log("Update payment")
        
        if (localStorage.getItem('token')) {
            grabCollectCVV(true)

            console.log(billing)
            console.log(elements.getElement(CardExpiryElement))

            const updatePaymentMethodReponse = await fetch(`${backend}/order/payment/${paymentData.paymentMethodID}`, {
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
                        country: 'US'
                    },
                    expMonth: 11,
                    recollectCVV: false
                })
            })
            
            const updatePaymentMethodData = await updatePaymentMethodReponse.json()
            console.log(updatePaymentMethodData)
            if(await updatePaymentMethodData.paymentMethodID) {
                setEditPayment(false)
                // setUpdatedPayment(true)
            }
        } else {
            return (
                <div>Uh oh! It looks like you are logged out. Please log back in.</div>
            )
        }
    }
    
    if(!paymentData.paymentMethodID && !editPayment) {
        {/* Show Card and Billing Details or Card element and input depending if there is an already default or last used, saved card for logged in user. If there is an already default or last used, saved card, a payment method ID gets returned from the server. */}
        return (
            <div>
                <h2>Payment</h2>
                <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>
                <CollectCard handleCardChange={handleCardChange} editPayment={editPayment}/>
                <h2>Billing Address</h2>
                <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>
                {/* <input value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange}/>
                <input value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange}/>
                <input value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange}/>
                <input value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />
                <input value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange}/>
                <input value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange}/>
                <input value={billing.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleBillingChange}/> */}
            </div>
        )
    } else if(paymentData.paymentMethodID && !editPayment) {
        return (
            <div>
                <h2>Payment</h2>
                <p>{paymentData.brand}</p>
                <p>{paymentData.last4}</p>
                <p>{paymentData.expDate}</p>

                <h2>Billing Address</h2>
                <p>{paymentData.billingDetails.name}</p>
                <p>{paymentData.billingDetails.address.line1}</p>
                <p>{paymentData.billingDetails.address.line2}</p>
                <p>{paymentData.billingDetails.address.city}, {paymentData.billingDetails.address.state} {paymentData.billingDetails.address.postalCode}</p>
                <button id={paymentData.paymentMethodID} onClick={() => setEditPayment(true)}>Edit</button>
            </div>
        )
    } else if(paymentData.paymentMethodID && editPayment) {
        return (
            <div>
                <h2>Payment</h2>
                <p>{paymentData.brand}</p>
                <p>{paymentData.last4}</p>
                <CollectCard handleCardChange={handleCardChange} editPayment={editPayment}/>
                <BillingInput billing={billing} handleBillingChange={handleBillingChange} />
                <button onClick={handleUpdatePayment}>Save</button>
                <button onClick={() => setEditPayment(false)}>Close</button>
            </div>
        )
    }

}

export default PaymentMethod