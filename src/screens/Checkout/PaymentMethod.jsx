import React, { useEffect, useState } from 'react';
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"
import Modal from 'react-modal';
import { useStripe, CardElement, useElements } from "@stripe/react-stripe-js"; 
import createPaymentMethod from './CreatePayment'

// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal'

function PaymentMethod ({ backend, token, error, disabled, grabDisabled, grabError, paymentLoading, grabPaymentLoading, handleCardChange, billing, grabBilling, handleBillingChange, cardholderName, handleCardholderNameChange, paymentMethod, grabPaymentMethod, editPayment, grabEditPayment, collectCVV, grabCollectCVV, redisplayCardElement, grabRedisplayCardElement}) {

    const elements = useElements()
    const stripe = useStripe()

    /* ------- SAVED CARDS RELATED STATE------- */
    const [savedCards, setSavedCards] = useState([])
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        console.log("CVV state payment: ", collectCVV)
        console.log("redisplay card element payment", redisplayCardElement)
        if(localStorage.getItem('cartItems') !== 'false' && token){
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
                // After getting the card info, update paymentMethod state in Checkout Page. The value is either an object or null if there is no payment method saved for the logged in user. 
                grabPaymentMethod(paymentMethodData)
                grabPaymentLoading(false)
                
                console.log("property recollectCVV", paymentMethodData.recollectCVV, typeof paymentMethodData.recollectCVV )
        
            }
            fetchPaymentMethod();
        } else if (localStorage.getItem('cartItems') === 'false'){
            
            grabPaymentMethod(null) // also applies to guest
            grabCollectCVV("false") // also applies to guest
        }
    }, [backend, collectCVV, grabBilling, grabCollectCVV, grabPaymentMethod, redisplayCardElement, token, grabPaymentLoading])

    const handleUpdatePayment = async(event) => {
        console.log("Update payment")
        
        if (localStorage.getItem('token')) {

            grabEditPayment(false)
            const updatePaymentMethodReponse = await fetch(`${backend}/order/update/payment/${paymentMethod.paymentMethodID}?checkout=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }, 
                body: JSON.stringify({
                    billingDetails: {
                        name: `${billing.firstName}, ${billing.lastName}`,
                        line1: billing.line1,
                        line2: billing.line2,
                        city: billing.city,
                        state: billing.state,
                        postalCode: billing.postalCode,
                        country: 'US'
                    },
                    expMonth: 11,
                    recollectCVV: true,
                    name: cardholderName
                })
            })
            
            const updatePaymentMethodData = await updatePaymentMethodReponse.json()
            console.log(updatePaymentMethodData);

            grabPaymentMethod(updatePaymentMethodData)
            grabCollectCVV('true')
            // grabCollectCVV(updatePaymentMethodData.recollectCVV)
        } else {
            return (
                <div>Uh oh! It looks like you are logged out. Please log back in.</div>
            )
        }
    }

    const handleAddNew = () => {
        grabRedisplayCardElement(true)
        grabCollectCVV("false")
        setShowModal(true)
        console.log(91, "add new")
    }

    const saveNewCard = async() => {
        const cardElement = elements.getElement(CardElement)
        const newBilling = billing
        // Attach payment method to Stripe customer. Returns back the payment method's ID.
        const newSavedPaymentMethod = await createPaymentMethod(stripe, cardElement, newBilling, cardholderName, backend)
        if(typeof newSavedPaymentMethod === "string") {
            grabError(newSavedPaymentMethod)
        } else {
            // Update the payment method state to re-render the checkout payment method component with the new payment method info
            await grabPaymentMethod(newSavedPaymentMethod)
            // Format of the return is based on redisplayCardElement
            await grabRedisplayCardElement(false)
            // Close modal
            setShowModal(false)
            grabDisabled(true)
        }
        
        
        // Update billing
        // await grabBilling(newSavedPaymentMethod.billingDetails)
    }

    const closeModal = async () => {
        console.log(paymentMethod.recollectCVV)
        if(paymentMethod.recollectCVV === "true") {
            await grabCollectCVV("true") 
        }
        await grabRedisplayCardElement(false)
        setShowModal(false)
        grabError(null)
        grabDisabled(true)
        console.log("close")
        console.log("immediately after closing", "redisplay: ", redisplayCardElement, "collect CVV: ", collectCVV, "show modal: ", showModal)
    }

    const showAllSavedCards = async(event) => {
        if(localStorage.getItem('token')) {
            console.log(event.target.id)
            const savedCardsResponse = await fetch(`${backend}/order/index/payment?save=true&id=${event.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            const savedCardsData = await savedCardsResponse.json()
            console.log(savedCardsData.paymentMethods)

            setSavedCards(savedCardsData.paymentMethods)
            setShowModal(true);
        }
    }
    
    const showOneSavedCard = async(event) => {
        if(localStorage.getItem('token')) {
            const showSavedCardResponse = await fetch(`${backend}/order/show/payment/${event.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            const showSavedCardData = await showSavedCardResponse.json()
            // setPaymentData(showSavedCardData)
            grabPaymentMethod(showSavedCardData)
            setShowModal(false)
            // grabPaymentMethodID(showSavedCardData.paymentMethodID)
            grabBilling(showSavedCardData.billingDetails)
            grabCollectCVV(showSavedCardData.recollectCVV)
        }
    }

    if(paymentLoading) {
        return <h1>Loading...</h1>
    } else if((!paymentMethod.paymentMethodID && !editPayment) || (paymentMethod.paymentMethodID && redisplayCardElement)) {

        console.log(143, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement, "show modal: ", showModal)
        return (
            <div>
                {(!showModal && collectCVV !== 'true' && !redisplayCardElement) && (
                    <div>
                        <h2>Payment</h2>
                        <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>
                    </div>
                )}

                 {/* Close button is displayed if the div with Card Element and inputs are REdisplayed, which happens when Add new button is clicked to change redisplayCardElement to true. When Close button is clicked, we grab the Card Element displayed and destroy it to allow for the old CVV element to be shown. */}
                {(showModal && collectCVV==='false' && redisplayCardElement) && <Modal isOpen={showModal} ariaHideApp={false} contentLabel="Saved Cards" onRequestClose={closeModal}>
                    <h1>Payment</h1>
                     <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>
                    <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>
                    {error && <div className="card-error" role="alert">{error}</div>}
                    <h2>Billing Address</h2>
                    <BillingInput handleBillingChange={handleBillingChange} billing={billing} editPayment={editPayment}/>
                    <button disabled = {error || disabled} onClick={saveNewCard}>Save</button>
                    <button onClick={closeModal}>Close</button>
                </Modal>}
                
                {(!showModal && collectCVV !== 'true' && !redisplayCardElement) && (
                    <div>
                        {/* {(!showModal && collectCVV==='false' && !redisplayCardElement) && <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>} */}
                        <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>
                        <h2>Billing Address</h2>
                        <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>
                    </div>
                )}
                
            </div>
        )
    } else if((paymentMethod.paymentMethodID && !editPayment && !redisplayCardElement) ) {
        console.log(167, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)
        console.log(elements.getElement(CardElement))

        return (
            <div>
                <h2>Payment</h2>
                <p><b>{paymentMethod.cardholderName}</b></p>
                <p><b>{paymentMethod.brand}</b></p>
                <p>Ending in <b>{paymentMethod.last4}</b></p>
                <p>Expires <b>{paymentMethod.expDate}</b></p>
                

                {(collectCVV === "true" && !redisplayCardElement) && <CollectCard collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />}
                {/* {(collectCVV==='true' && !redisplayCardElement) && <CardCvcElement collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />} */}

                <h2>Billing Address</h2>
                <p>{billing.firstName} {billing.lastName}</p>
                <p>{billing.line1}</p>
                <p>{billing.line2}</p>
                <p>{billing.city}, {billing.state} {billing.postalCode}</p>

                {/* Click Edit to update payment method */}
                <button id={paymentMethod.paymentMethodID} onClick={() => { 
                    // The editPayment state get changed to true depending if the Edit button is clicked or when the Close button is clicked. If Edit button is clicked, the value true is passed back down to Checkout via the grabEditPayment() to determine if the Confirm Payment button in Checkout will be shown.
                    // setEditPayment(true) 
                    console.log("Edit")
                    grabEditPayment(true)
                }}>Edit</button>

                {/* Click Add New to add a new payment method */}
                <button id={paymentMethod.paymentMethodID} onClick={handleAddNew}>Add New</button>
                <button id={paymentMethod.paymentMethodID} onClick={showAllSavedCards}>Saved Cards</button>

                <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} ariaHideApp={false} contentLabel="Saved Cards">
                    {savedCards.map((savedCard, index) => { return (
                        <div key={index}>
                            <h1>{savedCard.brand}</h1>
                            <p>Ending in <b>{savedCard.last4}</b></p>
                            <p>Expires <b>{savedCard.expDate}</b></p>
                            <p><b>{savedCard.cardholderName}</b></p>
                            <button id={savedCard.paymentMethodID} onClick={showOneSavedCard}>Select</button>
                        </div>
                    )})}
                    <button onClick={() => setShowModal(false)}>Close</button>
                </Modal>
            </div>
        )
    } else if(paymentMethod.paymentMethodID && editPayment) {
        console.log(213)
        return (
            <>
                <div>
                    <h2>Payment</h2>
                    <p><b>{paymentMethod.cardholderName}</b></p>
                    <p><b>{paymentMethod.brand}</b></p>
                    <p>Ending in <b>{paymentMethod.last4}</b></p>
                    <p>Expires <b>{paymentMethod.expDate}</b></p>
                    
                </div>

                <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>

                <div>
                    <BillingInput billing={billing} handleBillingChange={handleBillingChange} editPayment={editPayment} />
                    <button onClick={handleUpdatePayment}>Save</button>
                    <button onClick={() => grabEditPayment(false)}>Close</button>
                </div>
            </>
        )
    } 
}
export default PaymentMethod
