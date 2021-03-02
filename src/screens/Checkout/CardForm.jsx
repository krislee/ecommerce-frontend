import React from 'react';
import CollectCard from "../../components/Checkout/Card"
import BillingInput from "../../components/Checkout/BillingInput"
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

export default function CardForm ({ loggedIn, paymentMethod, processing, handleSubmitCardForm, handleCardChange, handleBillingChange, handleBillingStateChange, handleCardholderNameChange, cardholderName, billing, collectCVV, redisplayCardElement, closeAddNewModal, error, disabled, sameAsShipping, handleSameAsShipping, billingInputErrorDisableButton, disableButtonAfterMakingRequest, guestProcessingPayment }) {

    return(
        <form id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-card-form" : "card-form" } onSubmit={handleSubmitCardForm}>
            <h2 id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-add-card-heading" : "add-card-heading" }>Enter Credit Card</h2>
            {/* Show Card Element */}
            <CollectCard loggedIn={loggedIn} handleCardChange={handleCardChange} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} cardholderName={cardholderName} handleCardholderNameChange={handleCardholderNameChange} />

            {/* Show any error that happens when processing the payment */}
            {error && <div className="card-error" role="alert">{error}</div>}

            <h2 className="billing-address-heading">Enter Billing Address</h2>
            <div id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-same-billing-shipping-container" : "same-billing-shipping-container"} >
                <input id="sameAsShipping" type="checkbox" defaultChecked={sameAsShipping} onChange={handleSameAsShipping}/>
                <label className="same-billing-shipping-label">Same as Shipping Address </label>
            </div>
            {/* If user does not have a saved payment method as indicated by !paymentMethod.paymentMethodID or if users who is adding an additionally new payment method at checkout does NOT check Same as Shipping box as indicated by !sameAsShipping, then show the input form */}
            {(!sameAsShipping || (!sameAsShipping && !paymentMethod.paymentMethodID)) && <BillingInput loggedIn={loggedIn} handleBillingChange={handleBillingChange} handleBillingStateChange={handleBillingStateChange} billing={billing} paymentMethod={paymentMethod} />}

            {sameAsShipping && (
                <div id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-display-same-billing-shipping-info-container" : "display-same-billing-shipping-info-container"}>
                    <p id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-billing-names": "billing-names"}><b>{billing.firstName} {billing.lastName}</b></p>
                    <p id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-billing-line1" : "billing-line1"}>{billing.line1}</p>
                    {(billing.line2 !== 'null' || billing.line2 !== '') && <p id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? 'guest-billing-line2' : 'billing-line2' }>{billing.line2}</p>}
                    <p id={(!loggedIn() || loggedIn() && !paymentMethod.paymentMethodID) ? "guest-billing-cityStateZipcode" : "billing-cityStateZipcode"}>{billing.city}, {billing.state} {billing.postalCode}</p>
                </div>
            )}

            {redisplayCardElement ? (
                <div id="add-card-buttons-container">
                    <Button id="cancel-save-button" type="button" type='lg' variant='dark' onClick={closeAddNewModal}>Cancel</Button>
                    <Button id="save-card-button" type='submit' type='lg' variant='dark' disabled= { (error !== '') || disabled || billingInputErrorDisableButton() || disableButtonAfterMakingRequest || billing.state==="Select"}>Save</Button>
                </div>
            ): (
                <>
                 {/* Do not show the checkbox for guests (as indicated by customer state. */}
                {loggedIn() ? (
                   <div id="save-card-container">
                        <label htmlFor="saveCard">
                            Save card for future purchases
                        </label>
                        <input type="checkbox" id="saveCard" name="saveCard" />
                    </div>
                ): <></>}
                 
                {/* Disable Confirm Payment button when: 
                1) There is an empty Card Element 
                - We can tell if the Element is empty or not when handleCardChange() runs, handleCardChange() runs when there is typing/backspacing in the input. When handleCardChange() runs, the disabled state is updated to false when there is typing/backspacing or something written in Card Element
                - A Card Element is only displayed if user does not have any saved cards. Saved card is indicated by a truthy value of paymentMethod.paymentMethodID (recall paymentMethod state was updated upon Checkout/PaymentMethod's useEffect() running, which fetches for either a default-saved, last-used-saved, last-saved, or no saved card - server sends back {paymentMethodID: null} for no saved card, so paymentMethod state equals to {paymentMethodID: null})
                2) error when typing in the Card/CVV Element */}
                
                <Button id="guest-submit" variant="dark" type='submit' size='lg' disabled={ (disabled && !paymentMethod.paymentMethodID) || error || billingInputErrorDisableButton() || billing.state==="Select" || guestProcessingPayment } >
                    { guestProcessingPayment ? (
                    <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                    <span>Processing...</span>
                    </> 
                    ) : "Confirm Payment"
                    }
                </Button>
                </>
            )}

            
        </form>
    )
}
