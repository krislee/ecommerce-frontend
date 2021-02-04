import React, { useEffect, useState } from 'react';
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"
import Modal from 'react-modal';
// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal'

function PaymentMethod ({ backend, token, paymentLoading, grabPaymentLoading, handleCardChange, billing, grabBilling, handleBillingChange, cardholderName, handleCardholderNameChange, paymentMethod, grabPaymentMethod, editPayment, grabEditPayment, collectCVV, grabCollectCVV, redisplayCardElement, grabRedisplayCardElement}) {

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
    }, [])

    const handleUpdatePayment = async(event) => {
        console.log("Update payment")
        
        if (localStorage.getItem('token')) {

            grabCollectCVV('true')
            console.log(redisplayCardElement)
            console.log(billing)

            const updatePaymentMethodReponse = await fetch(`${backend}/order/update/payment/${paymentMethod.paymentMethodID}?checkout=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
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
                    recollectCVV: true,
                    name: cardholderName
                })
            })
            
            const updatePaymentMethodData = await updatePaymentMethodReponse.json()
            console.log(updatePaymentMethodData);
                // setEditPayment(false)
            grabEditPayment(false)
            // setPaymentData(updatePaymentMethodData)
            grabPaymentMethod(updatePaymentMethodData)
        } else {
            return (
                <div>Uh oh! It looks like you are logged out. Please log back in.</div>
            )
        }
    }

    // When adding new card, update the redisplayCardElement state to true to reshow the div with Card Element and inputs, and update collectCVV state to "false" to now show the Card CVV Element if the Card CVV Element is shown when user clicks Save for editing. Although the shown collectCVV state is supposed to be dismounted when we do not display the Card CVV Element once the redisplayCardElement and collectCVV states are updated, the Card CVV Element is still on the DOM, so we will destroy it. 
    const handleAddNew = () => {
        grabRedisplayCardElement(true)
        grabCollectCVV("false")
        setShowModal(true)
        console.log(93)
    }

    const closeModal = () => {
        grabRedisplayCardElement(false)
        grabCollectCVV("true")
        setShowModal(false)
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

    // Normally, Card Element is displayed only if 1) card and billing details are not sent back after fetching to /order/checkout/payment because it indicates there is no card attached to the Stripe customer (meaning there is no card saved to the user) so !paymentData.paymentMethodID, and 2) editPayment must also be false so that the Card Element is displayed because we do not want the Card Element when editing the card is happening. 
    // But when we do have card and billing details, and we click Add New, we want to display the Card Element. 
    // To do so, we click Add New -->  passing true to grabRedisplayCardElement() function that was sent down as a prop to PaymentMethod component --> redisplayCardElement state at Checkout component is updated to true --> Checkout component re-renders, causing PaymentMethod component. Since redisplayCardElement state was passed a prop to PaymentMethod component, the true value of redisplayCardElement allows the Card Element to be displayed again through the conditional statement: if((!paymentData.paymentMethodID && !editPayment) || redisplayCardElement){}
    // We need to reset the redisplayCardElement to false after confirming payment so that if user has a default or last used saved card, then the saved card details gets rendered and not the Card Element again when user goes to checkout with items. 
    if(paymentLoading) {
        return <h1>Loading...</h1>
    } else if((!paymentMethod.paymentMethodID && !editPayment) || (paymentMethod.paymentMethodID && redisplayCardElement)) {
        {/* Show Card and Billing Details or Card element and input depending if there is an already default or last used, saved card for logged in user. If there is an already default or last used, saved card, a payment method ID gets returned from the server. */}
        console.log(149, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)
        return (
            <div>
                <h2>Payment</h2>
                <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>

                 {/* Close button is displayed if the div with Card Element and inputs are REdisplayed, which happens when Add new button is clicked to change redisplayCardElement to true. When Close button is clicked, we grab the Card Element displayed and destroy it to allow for the old CVV element to be shown. */}
                <Modal isOpen={showModal} ariaHideApp={false} contentLabel="Saved Cards" onRequestClose={closeModal}>
                    <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>
                    <h2>Billing Address</h2>
                    <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>
                    <button onClick={closeModal}>Close</button>
                </Modal>
                
                <div>
                    <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} editPayment={editPayment}/>
                    
                    <h2>Billing Address</h2>
                    <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>
                </div>
                
            </div>
        )
    } else if((paymentMethod.paymentMethodID && !editPayment && !redisplayCardElement) ) {
        console.log(173, "collect cvv: ", collectCVV, "redisplay card: ", redisplayCardElement)
        return (
            <div>
                <h2>Payment</h2>
                <p><b>{paymentMethod.brand}</b></p>
                <p>Ending in <b>{paymentMethod.last4}</b></p>
                <p>Expires <b>{paymentMethod.expDate}</b></p>
                <p><b>{paymentMethod.cardholderName}</b></p>

                {/* {(collectCVV === "true" && !redisplayCardElement) && <CollectCard collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />} */}
                <CollectCard collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />

                <h2>Billing Address</h2>
                <p>{paymentMethod.billingDetails.name}</p>
                <p>{paymentMethod.billingDetails.address.line1}</p>
                <p>{paymentMethod.billingDetails.address.line2}</p>
                <p>{paymentMethod.billingDetails.address.city}, {paymentMethod.billingDetails.address.state} {paymentMethod.billingDetails.address.postalCode}</p>

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

                {/* Modal will only be displayed if showModal state is true. showModal state changes from initial false to true when Saved Cards button is clicked. When Saved Cards button is clicked, it updates both the showModal and savedCards state, rerendering the component with the updated showModal and savedCards state allowing for the modal to be shown with information. */}
                <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} ariaHideApp={false} contentLabel="Saved Cards">
                    {savedCards.map(savedCard => {
                    return <div>
                        <h1>{savedCard.brand}</h1>
                        <p>Ending in <b>{savedCard.last4}</b></p>
                        <p>Expires <b>{savedCard.expDate}</b></p>
                        <p><b>{savedCard.cardholderName}</b></p>
                        <button id={savedCard.paymentMethodID} onClick={showOneSavedCard}>Select</button>
                    </div>
                    })}
                    <button onClick={() => setShowModal(false)}>Close</button>
                </Modal>
            </div>
        )
    } else if(paymentMethod.paymentMethodID && editPayment) {
        console.log(227)
        return (
            <>
                <div>
                    <h2>Payment</h2>
                    <p><b>{paymentMethod.brand}</b></p>
                    <p>Ending in <b>{paymentMethod.last4}</b></p>
                    <p>Expires <b>{paymentMethod.expDate}</b></p>
                    <p><b>{paymentMethod.cardholderName}</b></p>
                </div>

                <input value={cardholderName || ""} name="name" placeholder="Name on card" onChange={handleCardholderNameChange}/>

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