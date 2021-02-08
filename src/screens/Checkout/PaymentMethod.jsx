import React, { useEffect, useState } from 'react';
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"
import Modal from 'react-modal';
import { useStripe, CardElement, useElements, CardCvcElement } from "@stripe/react-stripe-js"; 
import createPaymentMethod from './CreatePayment'
import { Redirect } from 'react-router-dom';
import CardForm from './CardForm'
// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal'

function PaymentMethod ({ backend, customer, processing, loggedIn, error, grabError, disabled, grabDisabled,  paymentLoading, grabPaymentLoading, billing, grabBilling, handleBillingChange, paymentMethod, grabPaymentMethod, cardholderName, grabCardholderName, handleCardholderNameChange, handleCardChange, collectCVV, grabCollectCVV, editPayment, grabEditPayment, redisplayCardElement, grabRedisplayCardElement, grabShowSavedCards, handleConfirmPayment, showSavedCards}) {

    /* ------- STRIPE VARIABLES ------ */
    const elements = useElements()
    const stripe = useStripe()


    const [savedCards, setSavedCards] = useState([])
    const [showModal, setShowModal] = useState(false)


    useEffect(() => {
        // Check if user is logged in or not since different headers for routes depend if user is logged in or not
        if(loggedIn()){
            // Get either a 1) default, saved card or 2) last used, saved card info, or 3) last created, saved card, or 4) no saved cards 
            let paymentMethodData
            const fetchPaymentMethod = async () => {
                const paymentMethodResponse = await fetch(`${backend}/order/checkout/payment`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                })
                paymentMethodData = await paymentMethodResponse.json()
                console.log(paymentMethodData);
                // After getting the card info, call grabPaymentMethod() which was passed as a prop from CheckoutPage. The grabPaymentMethod() will update paymentMethod state, billing state, and collectCVV state in Checkout Page. The value is either an object of info or object with just {paymentMethodID:null} if there is no payment method saved for the logged in user. 
                grabPaymentMethod(paymentMethodData)
                grabPaymentLoading(false) // update paymentLoading state to false so it will not render Loading... when we re-render CheckoutPage and Checkout/PaymentMethod components
            }

            fetchPaymentMethod();
           
        } else if (!loggedIn()){
            grabPaymentMethod({}) // if guest user, then paymentMethod state would remain an empty obj, billing details state would remain empty obj, and collectCVV state would remain "false"
            grabPaymentLoading(false) // update paymentLoading state to false so it will not render Loading... when we re-render CheckoutPage and Checkout/PaymentMethod components
        }
    }, [])

    /* ------- EDIT PAYMENT METHOD FUNCTIONS ------ */

    const handleEdit = () => {
        grabEditPayment(true) // The editPayment state get changed to true depending if the Edit button is clicked or when the Close button is clicked. If Edit button is clicked, the Confirm Payment button in Checkout will be shown.
        setShowModal(true) //show modal
        grabError(null) // Clear any errors (i.e. an incomplete security code from CVV Element) before opening the edit modal
    }

    // When Save is clicked, handleUpdatePayment() runs
    const handleUpdatePayment = async(event) => {
        // Make sure user is logged in in order to update
        if (loggedIn()) {
            const updatePaymentMethodReponse = await fetch(`${backend}/order/update/payment/${paymentMethod.paymentMethodID}?checkout=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
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
            console.log("updated payment: ", updatePaymentMethodData);

            grabPaymentMethod(updatePaymentMethodData) // update the paymentMethod, billingDetails, collectCVV states with the server response
            grabEditPayment(false) // editPayment state represents we are editing; after clicking Save button, we are no longer editing, so update the editPayment state to false 
            setShowModal(false) // close the modal
            grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Edit modal closes the Confirm Payment button is disabled until user enters CVV element.
        } else {
            return (
                // <div>Uh oh! It looks like you are logged out. Please log back in.</div>
                <Redirect to="/"/>
            )
        }
    }

    // When Close button is clicked in Edit modal, closeEditModal() runs
    const closeEditModal = () => {
        console.log("closing editing")
        grabEditPayment(false) // editPayment state is updated to false since user closed editing modal
        grabBilling(paymentMethod.billingDetails) // If user began editing the billing details input, handleBillingChange() runs. This means billing state is updated. If user just closes the edit modal, and reopens the edit modal, the billing details input will have the updated billing state. In other words, the billing details input will have the previously edited but unsubmitted input values. So when we run grabBilling() with the current paymentMethod state (reminder: paymentMethod state did not get updated since grabPaymentMethod() does not run unless Save button is clicked), it will reset the billing state back to the current paymentMethod's billing details.
        grabCardholderName(paymentMethod.cardholderName) // Also reset the cardholder's name if user began editing the cardholder's name details input but only closes the Edit modal without clicking Save (for more detailed info, look at grabBilling() above)
        grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Edit modal closes the Confirm Payment button is disabled until user enters CVV element
        setShowModal(false) // close the Edit Card modal by setting showModal state to false
        // grabError(null)
        // We do not need to update the collectCVV state when we close the edit modal because we did not update the collectCVV state when we opened the edit modal
    }

     /* ------- ADD PAYMENT METHOD FUNCTIONS ------ */

    // When Add New Card button is clicked, handleAddNew() runs
    const handleAddNew = async () => {
        if (loggedIn()) {
            await grabError(null) // If there are errors from CVC Element before clicking Add New Cards button (i.e. incomplete security code), then the error will be displayed the moment we click Add New Cards button. So we want to clear the error when the Add New Cards button is clicked and the Add New Cards modal would not show the error. (We do not need to do this to opening Edit modal because there is no div to display the error in the Edit modal.)
            grabDisabled(true) // Disable the Save button in the Add New Card modal again, in case disabled state was false because something was written in the CVV Element if we were recollecting the CVV again
            grabRedisplayCardElement(true) // redisplayCardElement state represents if we are currently adding a new card, so update the redisplayCardElement state from default false to true; what we render in the Checkout/PaymentMethod component depends on the redisplayCardElement state (look at the conditional statements below); the Confirm Payment button won't be displayed if redisplayCardElement state is true
            await grabCollectCVV("false") // need to update the collectCVV state to "false" so that the CVV Element won't be displayed but a Card Element would be displayed 
            setShowModal(true) // open the modal
            console.log("add new")
        } else {
            return (
                // <div>Uh oh! It looks like you are logged out. Please log back in.</div>
                <Redirect to="/"/>
            )
        }
    }

    // Click save in Add New Card modal to run saveNewCard()
    const saveNewCard = async(event) => {
        if (loggedIn()) {
            event.preventDefault()
            console.log("NEW CARD")
            const cardElement = elements.getElement(CardElement)
            // createPaymentMethod() will create a new payment method by calling stripe.createPaymentMethod() and a fetch to server that makes sure there are no duplicate cards being added
            const newSavedPaymentMethod = await createPaymentMethod(stripe, cardElement, billing, cardholderName, backend)
            // If there is an error when creating a new payment method by calling stripe.createPaymentMethod(), then update the error state from null to the error message, which will be displayed by the #card-error div whenever there is an error.
            if(typeof newSavedPaymentMethod === "string") {
                grabError(newSavedPaymentMethod)
                // Do not close the modal yet (do not do setShowModal(false)), so that the user has a chance to fix the card details.
                console.log("ERROR ADDING NEW CARD")
            } else {
                // If there is no error from creating a payment method, then update the payment method state to re-render the CheckoutPage and Checkout/PaymentMethod components with the new payment method, billing details, recollectCVV info
                await grabPaymentMethod(newSavedPaymentMethod)
                await grabRedisplayCardElement(false) // update the redisplayCardElement state back to false
                setShowModal(false) // Close modal
                await grabDisabled(true) // disable state is set to false when there are card changes; After saving a new payment method, disable the Save button again, so that when we reopen the Add New Card modal again it will be disabled
                // await grabError(null)
                console.log("NO ERROR ADDING NEW CARD")
            }
        } else {
            return (
                // <div>Uh oh! It looks like you are logged out. Please log back in.</div>
                <Redirect to="/"/>
            )
        }
    }

    // When Close button is clicked in Add New Card modal, closeAddNewModal() runs
    const closeAddNewModal = async () => {
        console.log("ADD NEW MODAL RECOLLECT CVV: ", paymentMethod.recollectCVV)
    
        await grabCollectCVV(paymentMethod.recollectCVV) // Since we updated the collectCVV state to "false" when we click Add New Card button, we need to update the collectCVV state back to what the payment method's recollectCVV property was if we are redisplaying what the current payment method was. 
        await grabRedisplayCardElement(false) // Update the redisplayCardElement to false to represent we are not adding a card at the moment since we hit Close button
        grabBilling(paymentMethod.billingDetails) // If user began editing the billing details input, handleBillingChange() runs. This means billing state is updated. If user just closes the edit modal, and reopens the edit modal, the billing details input will have the updated billing state. In other words, the billing details input will have the previously edited but unsubmitted input values. So when we run grabBilling() with the current paymentMethod state (reminder: paymentMethod state did not get updated since grabPaymentMethod() does not run unless Save button is clicked), it will reset the billing state back to the current paymentMethod's billing details.
        grabCardholderName(paymentMethod.cardholderName) // Also reset the cardholder's name if user began editing the cardholder's name details input but only closes the Add New Card modal without clicking Save (for more detailed info, look at grabBilling() above)
        setShowModal(false) // close the Add New Card modal by setting showModal state to false
        grabError(null) // We want to reset the error state to its default value, null, so that when we open back up the Add Mew Card modal, it will not show the error still. 
        grabDisabled(true) // When you first open the Add New Card modal, disabled state is true so Save new card button is disabled. When we start typing on the Card Element, disabled state is false since disabled state is updated only when it is e.empty so you can click on Save new card button. We want to reset the disable state to true, so the button is disabled upon reopening the Add New Card modal. 
    }
    
     /* -------SELECT PAYMENT METHOD FUNCTIONS ------ */

    // When Saved Cards modal is clicked, showAllSavedCards() runs
    const showAllSavedCards = async(event) => {
        if(loggedIn()) {
            const savedCardsResponse = await fetch(`${backend}/order/index/payment?save=true&id=${event.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const savedCardsData = await savedCardsResponse.json()
            console.log("all saved cards: ", savedCardsData.paymentMethods)
            setSavedCards(savedCardsData.paymentMethods) // Update the savedCards state from empty array to an array containing all the payment methods (indicated by savedCardsData.paymentMethods). After the savedCards state is updated, we can loop through the savedCards array state to display all the payment methods 
            grabShowSavedCards(true) // showSavedCards state represents if we are currently showing all cards; update showSavedCards state to true; if the showSavedCards state is true, then a Confirm Payment button won't be shown
            setShowModal(true); // open the modal
            grabError(null) // If there are errors from CVC Element before clicking Saved Cards button, we clear the errors. That way, when we close the Saved Cards modal if there were previous errors, there won't be any errors.
            const cvv = elements.getElement(CardCvcElement)
            console.log(cvv)
            if(cvv) cvv.clear()
        } else {
            return (
                // <div>Uh oh! It looks like you are logged out. Please log back in.</div>
                <Redirect to="/"/>
            )
        }
    }
    
    // When one payment method is selected, showOneSavedCard() runs
    const showOneSavedCard = async(event) => {
        if(loggedIn()) {
            // Each select button has an id
            const showSavedCardResponse = await fetch(`${backend}/order/show/payment/${event.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const showSavedCardData = await showSavedCardResponse.json()

            grabPaymentMethod(showSavedCardData) // Update the paymentMethod, billing, cardholderName, and collectCVV states, so that when CheckoutPage and Checkout/PaymentMethod components are re-rendered it will show the updated info from the updated states.
            grabShowSavedCards(false)
            setShowModal(false)
            grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Saved Cards modal closes the Confirm Payment button is disabled until user enters CVV element
        } else {
            return (
                // <div>Uh oh! It looks like you are logged out. Please log back in.</div>
                <Redirect to="/"/>
            )
        }
    }

    // When Close button is clicked in the Saved Cards modal, closeSavedCards() runs
    const closeSavedCards = () => {
        grabShowSavedCards(false) // showSavedCards state represents if we are currently showing all cards; update showSavedCards state to false; if the showSavedCards state is false, then a Confirm Payment button will be shown
        setShowModal(false) // close the modal
        grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Saved Cards modal closes the Confirm Payment button is disabled until user enters CVV element
    }

    if(paymentLoading) {
        return <h1>Loading...</h1>
    } else if(!paymentMethod.paymentMethodID || (paymentMethod.paymentMethodID && redisplayCardElement)) {
        // If there is no saved payment methods (indicated by !paymentMethod.paymentMethodID) OR if there is a saved payment method (indicated by paymentMethod.paymentMethodID) and Add New Card button is clicked (indicated by redisplayCardElement state to true), then the same form that collects cards details is displayed. But for the form's onSubmit, the functions would be different.
        let handleSubmitCardForm
        if(redisplayCardElement) {
            handleSubmitCardForm = saveNewCard
            console.log(220)
        } else {
            handleSubmitCardForm = handleConfirmPayment
            console.log(223)
        }
        return collectCVV !== 'true' && <CardForm customer={customer} paymentMethod={paymentMethod} paymentLoading={paymentLoading} editPayment={editPayment} processing={processing} showSavedCards={showSavedCards} handleSubmitCardForm={handleSubmitCardForm} handleCardChange={handleCardChange} handleBillingChange={handleBillingChange} handleCardholderNameChange={handleCardholderNameChange} cardholderName={cardholderName} billing={billing} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} closeAddNewModal={closeAddNewModal} disabled={disabled} error={error} />    
          
    } else if(paymentMethod.paymentMethodID && !editPayment) {
        console.log(paymentMethod)

        return (
            <form onSubmit = {handleConfirmPayment}>
                <h2>Payment</h2>
                <p><b>{paymentMethod.cardholderName}</b></p>
                <p><b>{paymentMethod.brand}</b></p>
                <p>Ending in <b>{paymentMethod.last4}</b></p>
                <p>Expires <b>{paymentMethod.expDate}</b></p>
                
                {/* Need the conditions in order for the CVC Element to render properly */}
                {(collectCVV === "true" && !redisplayCardElement) && <CollectCard collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />}

                {/* Show any error that happens when processing the payment */}
                {( error) && (<div className="card-error" role="alert">{error}</div>)}

                <h2>Billing Address</h2>
                <p>{paymentMethod.billingDetails.name.split(", ")[0]} {paymentMethod.billingDetails.name.split(", ")[1]}</p>
                <p>{paymentMethod.billingDetails.address.line1}</p>
                <p>{paymentMethod.billingDetails.address.line2}</p>
                <p>{paymentMethod.billingDetails.address.city}, {paymentMethod.billingDetails.address.state} {paymentMethod.billingDetails.address.postalCode}</p>

                {/* Click Edit to update payment method */}
                <button id={paymentMethod.paymentMethodID} onClick={handleEdit}>Edit</button>

                {/* Click Add New to add a new payment method */}
                <button type="button" id={paymentMethod.paymentMethodID} onClick={handleAddNew}>Add New</button>
                {/* Click Saved Cards to see all the other cards the logged in user has saved. */}
                <button type="button" id={paymentMethod.paymentMethodID} onClick={showAllSavedCards}>Saved Cards</button>

                {/* Do not show the Confirm Payment button when Saved Cards modal, Edit modal, and Add New Card modal are open */}
                {/* Disable Confirm Payment button when: 
                1) There is an empty CVV Element 
                - We can tell if the Element is empty or not when handleCardChange() runs, handleCardChange() runs when there is typing/backspacing in the input. When handleCardChange() runs, the disabled state is updated to false when there is typing/backspacing or something written in CVV Element
                - A CVC Element is only displayed if there is a saved card with a "true" recollectCVV property) 
                2) error when typing in the Card/CVV Element */}
                {(!editPayment && !redisplayCardElement && !showSavedCards) ? (
                    <button disabled={ (disabled && paymentMethod.recollectCVV === "true") || error }  id="submit" >
                        <span id="button-text">
                            {processing ? (<div className="spinner" id="spinner"></div>) : ("Confirm Payment")}
                        </span>
                    </button>
                ):<></>}
             
                {/* Modal with the list of saved cards appear when Saved Cards button is clicked and updates the state of showModal to true. Since redisplayCardElement and editPayment states are false, this part gets returned. */}
                <Modal isOpen={showModal} onRequestClose={ closeSavedCards } ariaHideApp={false} contentLabel="Saved Cards">
                    {savedCards.map((savedCard, index) => { return (
                        <div key={index}>
                            <h1>{savedCard.brand}</h1>
                            <p>Ending in <b>{savedCard.last4}</b></p>
                            <p>Expires <b>{savedCard.expDate}</b></p>
                            <p><b>{savedCard.cardholderName}</b></p>
                            <button id={savedCard.paymentMethodID} onClick={ showOneSavedCard }>Select</button>
                        </div>
                    )})}
                    <button onClick={ closeSavedCards }>Close</button>
                </Modal>
                
            </form>
        )
    } else if(paymentMethod.paymentMethodID && editPayment) {
        // When the Edit button is clicked this modal is shown
        return (
            <Modal isOpen={showModal} onRequestClose={closeEditModal} ariaHideApp={false} contentLabel="Edit Card">
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
                    <button onClick={closeEditModal}>Close</button>
                </div>
            </Modal>
        )
    } 
}
export default PaymentMethod