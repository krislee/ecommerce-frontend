import React from 'react';
import CollectCard from "../../components/Card"
import BillingInput from "../../components/BillingInput"

export default function CardForm ({ customer, paymentMethod, paymentLoading, editPayment, showSavedCards, processing, handleSubmitCardForm, handleCardChange, handleBillingChange, handleCardholderNameChange, cardholderName, billing, collectCVV, redisplayCardElement, closeAddNewModal, error, disabled }) {
    return(
        <form onSubmit={handleSubmitCardForm}>
            <h2>Payment</h2>
            {/* Show Card Element */}
            <CollectCard handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} />

            {/* Show any error that happens when processing the payment */}
            {error && <div className="card-error" role="alert">{error}</div>}

            <h2>Billing Address</h2>
            <BillingInput handleBillingChange={handleBillingChange} billing={billing}/>

            {redisplayCardElement ? (
                <>
                <button disabled= { error || disabled }>Save</button>
                <button type="button" onClick={closeAddNewModal}>Close</button>
                </>
            ): (
                <>
                 {/* Show Save card checkbox if user is logged in and does not have an already default, saved or last used, saved card to display as indicated by paymentMethod state. Do not show the checkbox for guests (as indicated by customer state). */}

                {/* We want both Save Card checkbox & Confirm Payment button to be displayed at the same time as other payment method component stuff are loaded in. So we want to make sure paymentLoading state is false, or else both the checkbox and button will be displayed before the other payment method component stuff are displayed, and instead they are loaded when it says Loading... on the page */}
                {(customer && !paymentMethod.paymentMethodID && !paymentLoading) ? (
                    <div>
                        <label htmlFor="saveCard">
                            Save card for future purchases
                            <input type="checkbox" id="saveCard" name="saveCard" />
                        </label>
                    </div>
                ): <></>}

                {/* Do not show the Confirm Payment button when Saved Cards modal, Edit modal, and Add New Card modal are open & when payment method component is still loading (indicated by default true "paymentLoading" state - the "paymentLoading" state does not change to false until Checkout/PaymentMethod component render*/}
                
                
                {/* Disable Confirm Payment button when: 
                1) There is an empty Card/CVV Element 
                - We can tell if the Element is empty or not when handleCardChange() runs, handleCardChange() runs when there is typing/backspacing in the input. When handleCardChange() runs, the disabled state is updated to false when there is typing/backspacing or something written in Card Element
                - A Card Element is only displayed if user does not have any saved cards. Saved card is indicated by a truthy value of paymentMethod.paymentMethodID (recall paymentMethod state was updated upon Checkout/PaymentMethod's useEffect() running, which fetches for either a default-saved, last-used-saved, last-saved, or no saved card - server sends back {paymentMethodID: null} for no saved card, so paymentMethod state equals to {paymentMethodID: null})
                - A CVC Element is only displayed if there is a saved card with a "true" recollectCVV property) 
                2) error when typing in the Card/CVV Element */}
                
                <button disabled={ (disabled && !paymentMethod.paymentMethodID) || (disabled && paymentMethod.recollectCVV === "true") || error }  id="submit" >
                    <span id="button-text">
                        {processing ? (<div className="spinner" id="spinner"></div>) : ("Confirm Payment")}
                    </span>
                </button>
                
                </>
            )}


        </form>
    )
}
