import React, { useEffect, useState } from 'react';
import CollectCard from "../../components/Checkout/Card"
import BillingInput from "../../components/Checkout/BillingInput"
import Modal from 'react-modal';
import { useStripe, CardElement, useElements, CardCvcElement } from "@stripe/react-stripe-js"; 
import createPaymentMethod from './CreatePayment'
import CardForm from './CardForm'
import brandImage from '../../components/Checkout/creditcardIcons.jsx'
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import FormHelperText from '@material-ui/core/FormHelperText';

import {cardholderNameInputError, cardholderNameInputError2, invalidMonthInput, invalidYearInput, monthInputError, yearInputError, monthLengthInputError, yearLengthInputError, expInvalidInput} from '../../components/Checkout/inputsErrors'

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'

import '../../styles/Checkout/Payment.css'
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import PaymentRoundedIcon from '@material-ui/icons/PaymentRounded';


// Theme for overriding Speed Dial styles
let theme = createMuiTheme({})
theme = { ...theme,
    overrides: {
        MuiFab: {
            root: {
                [theme.breakpoints.down("sm")]: {
                    width: 34,
                    height: 30
                },
                [theme.breakpoints.up("sm")]: {
                    width: 45,
                    height: 45
                },
            },
            primary: {
                backgroundColor: '#343a40'
            }
        },
        MuiSvgIcon: {
            root: {
                "font-size": "2.5em",
                [theme.breakpoints.down("sm")]: {
                    "font-size": "1.5em"
                }
            }
            
        },
        MuiSpeedDialAction: {
            staticTooltipLabel : {
                padding: '5px',
                "font-size": '0.75rem'
            }
        }
    },
};

// Speed Dial Styles
const useStyles = makeStyles((theme) => ({
    speedDialRoot: {
        transform: 'translateZ(0px)',
        flexGrow: 1,
    },
    speedDial: {
        position: 'absolute',
        bottom: '-5rem', 
        // right: '1.5rem', 
        right: '-11px'
    },
    formRoot: {
        '& .MuiTextField-root': {
          'margin-bottom': '1.75rem',
          width: "100%"
  
        },
    },
    formControl: {
          margin: theme.spacing(1),
          // minWidth: 120,
    },
}));

Modal.setAppElement('#root');


function PaymentMethod ({ backend, processing, loggedIn, error, grabError, disabled, grabDisabled,  paymentLoading, grabPaymentLoading, billing, grabBilling, handleBillingChange, handleBillingStateChange, paymentMethod, grabPaymentMethod, cardholderName, grabCardholderName, handleCardholderNameChange, handleCardChange, collectCVV, grabCollectCVV, editPayment, grabEditPayment, redisplayCardElement, grabRedisplayCardElement, grabShowSavedCards, handleConfirmPayment, showSavedCards, editExpiration, grabEditExpiration, showPayment, sameAsShipping, handleSameAsShipping, shippingInput, grabBillingWithShipping, recheckSameAsShippingButton, grabTotalCartQuantity, billingInputErrorDisableButton, billingPostalCodeInputErrorDisableButton, processingPayment, guestProcessingPayment, grabGuestProcessingPayment, disableButtonAfterMakingRequest, grabDisableButtonAfterMakingRequest}) {

    /* ------- STRIPE VARIABLES ------ */
    const elements = useElements()
    const stripe = useStripe()

    // Speed Dial State and Functions
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    // const [processingPayment, setProcessingPayment] = useState(false) // for saved cards users processingPayment truthy state will disable the Confirm Payment button  
    const [savedCards, setSavedCards] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [multipleSavedCards, setMultipleSavedCards] = useState(false)
    const [onCardholderBlur, setOnCardholderBlur] = useState(false)
    const [onMonthBlur, setOnMonthBlur] = useState(false)
    const [onYearBlur, setOnYearBlur] = useState(false)

    const [invalidCardYearUpdate, setInvalidCardYearUpdate] = useState(false)
    // const [disableButtonAfterMakingRequest, setDisableButtonAfterMakingRequest] = useState(false)

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        // Check if user is logged in or not since different headers for routes depend if user is logged in or not
        if(loggedIn()){
            // Get either a 1) default, saved card or 2) last used, saved card info, or 3) last created, saved card, or 4) no saved cards 
            let paymentMethodData
            
            const fetchPaymentMethod = async () => {
                grabPaymentLoading(false) // update paymentLoading state to false so it will not render Loading... when we re-render CheckoutPage and Checkout/PaymentMethod components

                const paymentMethodResponse = await fetch(`${backend}/order/checkout/payment`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                paymentMethodData = await paymentMethodResponse.json()
                console.log(paymentMethodData);
                // After getting the card info, call grabPaymentMethod() which was passed as a prop from CheckoutPage. The grabPaymentMethod() will update paymentMethod state, billing state, and collectCVV state in Checkout Page. The value is either an object of info or object with just {paymentMethodID:null} if there is no payment method saved for the logged in user. 
                grabPaymentMethod(paymentMethodData)
            }
            const retrievingSavedCards = async() => {
                const savedCardsResponse = await fetch(`${backend}/order/index/payment?save=false`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                const savedCardsData = await savedCardsResponse.json()
                console.log(savedCardsData.paymentMethods)
                if(savedCardsData.paymentMethods.length > 1) setMultipleSavedCards(true)
            }

            fetchPaymentMethod();
            retrievingSavedCards();
            
            return function cleanUp () {
                abortController.abort()
            }
           
        } else if (!loggedIn()){
            setTimeout(() => {
                grabPaymentMethod({}) // if guest user, then paymentMethod state would remain an empty obj, billing details state would remain empty obj, and collectCVV state would remain "false"
                grabPaymentLoading(false) // update paymentLoading state to false so it will not render Loading... when we re-render CheckoutPage and Checkout/PaymentMethod components
            },2000) 
        }
    }, [])

    /* ------- EDIT PAYMENT METHOD FUNCTIONS ------ */

    // When 2nd Edit button is clicked
    const handleEdit = () => {
        if(loggedIn()) {
            grabDisableButtonAfterMakingRequest(false) // enable Edit button
            console.log("edit Expiration: ", editExpiration)
            grabEditPayment(true) // The editPayment state get changed to true depending if the Edit button is clicked or when the Close button is clicked. If Edit button is clicked, the Confirm Payment button in Checkout will be shown.
            setShowModal(true) //show modal
            grabError(null) // Clear any errors (i.e. an incomplete security code from CVV Element) before opening the edit modal
        } else {
            grabTotalCartQuantity(0)
        }
    }

    // Listen to the month and year input changes
    const handleEditExpiration = (event) => {
        const { name, value } = event.target
        grabEditExpiration((prevEditExpiration) => ({...prevEditExpiration, [name]: value }))
        setInvalidCardYearUpdate(false)
        if(disableButtonAfterMakingRequest) grabDisableButtonAfterMakingRequest(false)
    }
    
    const handleMaxExpOrZipcodeLength = (event) => {
        console.log(204, event.target)
        if (event.target.value.length > event.target.maxLength) {
            event.target.value = event.target.value.slice(0, event.target.maxLength)
        }
    }

    const handleNonNumericExpirationOrZipcode =(event) => {
        if(event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) return event.preventDefault()
    }
    // When Save is clicked, handleUpdatePayment() runs
    const handleUpdatePayment = async(event) => {
        console.log("hi")
        console.log(editExpiration.month, typeof editExpiration.month)

        // Make sure user is logged in in order to update
        event.preventDefault()
        if (loggedIn()) {
            console.log("updating")

            grabDisableButtonAfterMakingRequest(true) // disable Edit button

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
                    expMonth: Number(editExpiration.month),
                    expYear: Number(editExpiration.year),
                    recollectCVV: true,
                    name: cardholderName
                })
            })
            
            const updatePaymentMethodData = await updatePaymentMethodReponse.json()
            console.log("updated payment: ", updatePaymentMethodData);
            if(updatePaymentMethodData.invalidCardYear) return setInvalidCardYearUpdate(true)
            grabPaymentMethod(updatePaymentMethodData) // update the paymentMethod, billingDetails, collectCVV states with the server response
            grabEditPayment(false) // editPayment state represents we are editing; after clicking Save button, we are no longer editing, so update the editPayment state to false 
            setShowModal(false) // close the modal
            grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Edit modal closes the Confirm Payment button is disabled until user enters CVV element.
        } else {
            grabTotalCartQuantity(0)
        }
    }

    // When Close button is clicked in Edit modal, closeEditModal() runs
    const closeEditModal = () => {
        console.log("closing editing")
        if(loggedIn()) {
            grabEditPayment(false) // editPayment state is updated to false since user closed editing modal
            grabBilling(paymentMethod.billingDetails) // If user began editing the billing details input, handleBillingChange() runs. This means billing state is updated. If user just closes the edit modal, and reopens the edit modal, the billing details input will have the updated billing state. In other words, the billing details input will have the previously edited but unsubmitted input values. So when we run grabBilling() with the current paymentMethod state (reminder: paymentMethod state did not get updated since grabPaymentMethod() does not run unless Save button is clicked), it will reset the billing state back to the current paymentMethod's billing details.
            grabCardholderName(paymentMethod.cardholderName) // Also reset the cardholder's name if user began editing the cardholder's name details input but only closes the Edit modal without clicking Save (for more detailed info, look at grabBilling() above)
            grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Edit modal closes the Confirm Payment button is disabled until user enters CVV element
            setShowModal(false) // close the Edit Card modal by setting showModal state to false
            // grabError(null)
            // We do not need to update the collectCVV state when we close the edit modal because we did not update the collectCVV state when we opened the edit modal
        } else {
            grabTotalCartQuantity(0)
        }
    }

     /* ------- ADD PAYMENT METHOD FUNCTIONS ------ */

    // When Add New Card button is clicked, handleAddNew() runs to open modal
    const handleAddNew = async () => {
        if (loggedIn()) {
            grabDisableButtonAfterMakingRequest(false) // enable Edit button
            recheckSameAsShippingButton(true) // in case user unchecked the Same as Shipping button and then submit or not submit and just close the modal, we want the Same As Shipping button to still be checked when modal is open, so update the sameAsShipping state with recheckSameAsShippingButton function
            grabBillingWithShipping(shippingInput) // the billing input values depend on billing state; if we want the billing input values to prefilled with shipping input values when we click Add New Card because the checkbox Same as Shipping Address is checked (which is checked by default), then we need to update the billing state to have the same value as shipping input state because currently the billing state is whatever we get back from the server 
            grabCardholderName("") // Make sure the cardholder name input is empty when we click add new (even though we clear the cardholder's name when we hit close for Add New modal, this assumes user has clicked on the Add New Card already; so if user is clicking Add New Card for the first time, the cardholder's name input should be cleared)
            grabError(null) // If there are errors from CVC Element before clicking Add New Cards button (i.e. incomplete security code), then the error will be displayed the moment we click Add New Cards button. So we want to clear the error when the Add New Cards button is clicked and the Add New Cards modal would not show the error. (We do not need to do this to opening Edit modal because there is no div to display the error in the Edit modal.)
            grabDisabled(true) // Disable the Save button in the Add New Card modal again, in case disabled state was false because something was written in the CVV Element if we were recollecting the CVV again
            grabRedisplayCardElement(true) // redisplayCardElement state represents if we are currently adding a new card, so update the redisplayCardElement state from default false to true; what we render in the Checkout/PaymentMethod component depends on the redisplayCardElement state (look at the conditional statements below); the Confirm Payment button won't be displayed if redisplayCardElement state is true
            grabCollectCVV("false") // need to update the collectCVV state to "false" so that the CVV Element won't be displayed but a Card Element would be displayed 
            setShowModal(true) // open the modal
        } else {
            grabTotalCartQuantity(0)
        }
    }

    // Click Save in Add New Card modal to run saveNewCard()
    const saveNewCard = async(event) => {
        if (loggedIn()) {
            event.preventDefault()

            grabDisableButtonAfterMakingRequest(true) // disable Edit button

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
                setMultipleSavedCards(true)
                setShowModal(false) // Close modal
                await grabDisabled(true) // disable state is set to false when there are card changes; After saving a new payment method, disable the Save button again, so that when we reopen the Add New Card modal again it will be disabled
                // await grabError(null)
                console.log("NO ERROR ADDING NEW CARD")
            }
        } else {
            grabTotalCartQuantity(0)
        }
    }

    // When Close button is clicked in Add New Card modal, closeAddNewModal() runs
    const closeAddNewModal = async () => {
        console.log("ADD NEW MODAL RECOLLECT CVV: ", paymentMethod.recollectCVV)
        if(loggedIn()) {
            await grabCollectCVV(paymentMethod.recollectCVV) // Since we updated the collectCVV state to "false" when we click Add New Card button, we need to update the collectCVV state back to what the payment method's recollectCVV property was if we are redisplaying what the current payment method was. 
            await grabRedisplayCardElement(false) // Update the redisplayCardElement to false to represent we are not adding a card at the moment since we hit Close button
            grabBilling(paymentMethod.billingDetails) // If user began editing the billing details input, handleBillingChange() runs. This means billing state is updated. If user just closes the edit modal, and reopens the edit modal, the billing details input will have the updated billing state. In other words, the billing details input will have the previously edited but unsubmitted input values. So when we run grabBilling() with the current paymentMethod state (reminder: paymentMethod state did not get updated since grabPaymentMethod() does not run unless Save button is clicked), it will reset the billing state back to the current paymentMethod's billing details.
            grabCardholderName(paymentMethod.cardholderName)  // Also reset the cardholder's name input to what the cardholder's name was if user began editing the cardholder's name details input but only closes the Add New Card modal without clicking Save (for more detailed info, look at grabBilling() above)
            setShowModal(false) // close the Add New Card modal by setting showModal state to false
            grabError(null) // We want to reset the error state to its default value, null, so that when we open back up the Add Mew Card modal, it will not show the error still. 
            grabDisabled(true) // When you first open the Add New Card modal, disabled state is true so Save new card button is disabled. When we start typing on the Card Element, disabled state is false since disabled state is updated only when it is e.empty so you can click on Save new card button. We want to reset the disable state to true, so the button is disabled upon reopening the Add New Card modal. 
        } else {
            grabTotalCartQuantity(0)
        }
    }
    
     /* -------SELECT PAYMENT METHOD FUNCTIONS ------ */

    // When Saved Cards modal is clicked, showAllSavedCards() runs
    const showAllSavedCards = async(event) => {
        if(loggedIn()) {
            grabDisableButtonAfterMakingRequest(false) // disable Edit button

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
            if(cvv) cvv.clear() // Since for some reason the CVV contents remain if something was written in it and we clicked Saved Cards, we want to clear the CVV field 
        } else {
            grabTotalCartQuantity(0)
        }
    }
    
    // When one payment method is selected, showOneSavedCard() runs
    const showOneSavedCard = async(event) => {
        if(loggedIn()) {
            grabDisableButtonAfterMakingRequest(true) // disable Edit button

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
            grabTotalCartQuantity(0)
        }
    }

    // When Close button is clicked in the Saved Cards modal, closeSavedCards() runs
    const closeSavedCards = () => {
        if(loggedIn) {
            grabShowSavedCards(false) // showSavedCards state represents if we are currently showing all cards; update showSavedCards state to false; if the showSavedCards state is false, then a Confirm Payment button will be shown
            setShowModal(false) // close the modal
            grabDisabled(true) // In case user was typing in the CVV element which would update the disabled state to false, we want to change the disabled state to true again, so that after the Saved Cards modal closes the Confirm Payment button is disabled until user enters CVV element
        } else {
            grabTotalCartQuantity(0)
        }
    }

    // Test if the expiration is only numbers; function will return true if test fails
    const editExpirationError = () => {
        // console.log(/^[0-9]*$/g.test(editExpiration.month) !== true)
        // console.log(/^[0-9]*$/g.test(editExpiration.year) !== true)
        // console.log(editExpiration.month === '')
        // console.log(editExpiration.month === undefined)
        // console.log(editExpiration.year === '')
        // console.log(editExpiration.year === undefined)
        // console.log(editExpiration.month.length < 2)
        // console.log(editExpiration.year.length < 4)
        // console.log(Number(editExpiration.month)> 13)
        // console.log(Number(editExpiration.year) < 2021)
        // console.log(editExpiration.year === '2021' && (Number(editExpiration.month) < new Date().getMonth() + 1))
       
       return (
          /^[0-9]*$/g.test(editExpiration.month) !== true
          || /^[0-9]*$/g.test(editExpiration.year) !== true
          || editExpiration.month === ''
          || editExpiration.month === undefined
          || editExpiration.year === ''
          || editExpiration.year === undefined
          || editExpiration.month.length < 2
          || editExpiration.year.length < 4
          || Number(editExpiration.month)> 12
          || Number(editExpiration.month)< 1
          || Number(editExpiration.year) < new Date().getFullYear() 
          || (editExpiration.year === new Date().getFullYear().toString() && (Number(editExpiration.month) < new Date().getMonth() + 1) )
          || invalidCardYearUpdate
        )
    }

    if(paymentLoading) {
        return <></>
    } else if(!paymentMethod.paymentMethodID) {
        if(!showPayment) return null
        // If there is no saved payment methods (indicated by !paymentMethod.paymentMethodID) OR if there is a saved payment method (indicated by paymentMethod.paymentMethodID) and Add New Card button is clicked (indicated by redisplayCardElement state to true), then the same form that collects cards details is displayed. But for the form's onSubmit, the functions would be different.
        return collectCVV !== 'true' && (
            <div id="guest-payment-container">
            <h2 id="guest-payment-heading">Payment Method</h2>
            {showPayment && <CardForm loggedIn={loggedIn} paymentMethod={paymentMethod} handleSubmitCardForm={handleConfirmPayment} handleCardChange={handleCardChange} handleBillingChange={handleBillingChange} handleBillingStateChange={handleBillingStateChange} handleCardholderNameChange={handleCardholderNameChange} cardholderName={cardholderName} billing={billing} grabBilling={grabBilling} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} closeAddNewModal={closeAddNewModal} disabled={disabled} error={error} sameAsShipping={sameAsShipping} handleSameAsShipping={handleSameAsShipping} billingInputErrorDisableButton={billingInputErrorDisableButton} processing={processing} guestProcessingPayment={guestProcessingPayment} grabGuestProcessingPayment={grabGuestProcessingPayment} classes={classes} handleMaxExpOrZipcodeLength={handleMaxExpOrZipcodeLength} handleNonNumericExpirationOrZipcode={handleNonNumericExpirationOrZipcode} />}
            </div>
        )      

    } else if (paymentMethod.paymentMethodID && redisplayCardElement) {
        // When Add New Card button is clicked
        return collectCVV !== 'true' && (
            <Modal isOpen={showModal} onRequestClose={closeAddNewModal} ariaHideApp={false} contentLabel="Add Card">
                <CardForm loggedIn={loggedIn} paymentMethod={paymentMethod} handleSubmitCardForm={saveNewCard} handleCardChange={handleCardChange} handleBillingChange={handleBillingChange} handleBillingStateChange={handleBillingStateChange} handleCardholderNameChange={handleCardholderNameChange} cardholderName={cardholderName} billing={billing} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} closeAddNewModal={closeAddNewModal} disabled={disabled} error={error} sameAsShipping={sameAsShipping} handleSameAsShipping={handleSameAsShipping} billingInputErrorDisableButton={billingInputErrorDisableButton} disableButtonAfterMakingRequest={disableButtonAfterMakingRequest} classes={classes} handleMaxExpOrZipcodeLength={handleMaxExpOrZipcodeLength} handleNonNumericExpirationOrZipcode={handleNonNumericExpirationOrZipcode}/>
            </Modal>
        )  
    } else if(paymentMethod.paymentMethodID && !editPayment) {
        // console.log(paymentMethod)
        return (
            <>
            {/* <div><h2>Payment Method</h2></div> */}
            {showPayment && (
            <div id="payment-container" style={{marginLeft: '30px'}}>
                <h2>Payment Method</h2>
                <div>
                    <div id="display-payment-info">  
                        <div id={paymentMethod.brand} className="display-credit-card">
                            <div id="chip-card-img">
                                <img src="https://img.pngio.com/chip-png-free-download-fourjayorg-chip-png-2400_2400.png"></img>
                                <img src="https://students.1fbusa.com/hubfs/pw.png"></img>
                            </div>
                            <div id="card-img-container">
                                {brandImage(paymentMethod.brand)}
                            </div>
                            <div id="cardNumber"><b>{paymentMethod.brand === 'amex' ? <p id='card-number'>****   ******   {paymentMethod.last4}</p> : <p id='card-number'>****   ****   ****   {paymentMethod.last4}</p>}</b></div>
                            <div id="cardholder-title">Cardholder</div>
                            <div id="display-cardholder-name"><b>{paymentMethod.cardholderName}</b></div>
                            <div id="expiry-date-title">Valid thru</div>
                            <div id="expiry-date"><b>{paymentMethod.expDate}</b></div>
                        </div>
                    </div>
                
                    {/* Need the conditions in order for the CVC Element to render properly */}
                    {(collectCVV === "true" && !redisplayCardElement) && <CollectCard loggedIn={loggedIn} collectCVV={collectCVV} redisplayCardElement={redisplayCardElement} handleCardChange={handleCardChange} />}

                    {/* Show any error that happens when processing the payment */}
                    {( error) && (<div className="card-error" role="alert">{error}</div>)}

                    <h2 id="display-billing-heading">Billing Address</h2>
                    <p id="billing-name" className="display-billing">{paymentMethod.billingDetails.name.split(", ")[0]} {paymentMethod.billingDetails.name.split(", ")[1]}</p>
                    <p id="billing-line1" className="display-billing">{paymentMethod.billingDetails.address.line1}</p>
                    <p id="billing-line2" className="display-billing">{paymentMethod.billingDetails.address.line2 === "null" || paymentMethod.billingDetails.address.line2 === "undefined" ? "" : paymentMethod.billingDetails.address.line2}</p>
                    <p id="billing-cityStateZipcode" className="display-billing">{paymentMethod.billingDetails.address.city}, {paymentMethod.billingDetails.address.state} {paymentMethod.billingDetails.address.postalCode}</p>

                    {/* Click Edit to update payment method */}
                    {/* <button id={paymentMethod.paymentMethodID} onClick={handleEdit}>Edit</button> */}

                    {/* Click Add New to add a new payment method */}
                    {/* <button type="button" id={paymentMethod.paymentMethodID} onClick={handleAddNew}>Add New</button> */}
                    {/* Click Saved Cards to see all the other cards the logged in user has saved. */}
                    {/* {multipleSavedCards && <button type="button" id={paymentMethod.paymentMethodID} onClick={showAllSavedCards}>Saved Cards</button>} */}


                    {/* <div id="control-speed-dial-payment-margin"> */}
                        <ThemeProvider theme={theme}>
                            <div className={classes.speedDialRoot}>
                                <SpeedDial 
                                    ariaLabel="SpeedDial openIcon"
                                    className={classes.speedDial}
                                    icon={<MoreHorizRoundedIcon />} 
                                    onClose={handleClose}
                                    onOpen={handleOpen}
                                    open={open}
                                >
                                    <SpeedDialAction
                                        id={paymentMethod.paymentMethodID} 
                                        onClick={handleAddNew}
                                        key={"Add Payment"}
                                        icon={<AddIcon />}
                                        tooltipTitle={"Add Payment"}
                                        tooltipOpen
                                    />
                                    <SpeedDialAction
                                        id={paymentMethod.paymentMethodID} 
                                        onClick={handleEdit}
                                        key={"Edit Payment"}
                                        icon={<EditIcon />}
                                        tooltipTitle={"Edit Payment"}
                                        tooltipOpen
                                    />
                                    {multipleSavedCards && <SpeedDialAction
                                        id={paymentMethod.paymentMethodID}
                                        key={"Saved Payments"}
                                        icon={<PaymentRoundedIcon />}
                                        onClick={showAllSavedCards}
                                        tooltipTitle={"Saved Payments"}
                                        tooltipOpen
                                    />}
                                </SpeedDial>
                            </div>
                        </ThemeProvider>
                    {/* </div> */}
                
                    {/* Modal with the list of saved cards appear when Saved Cards button is clicked and updates the state of showModal to true. Since redisplayCardElement and editPayment states are false, this part gets returned. */}
                    <Modal isOpen={showModal} onRequestClose={ closeSavedCards } ariaHideApp={false} contentLabel="Saved Cards">
                        <h2 id="saved-address-heading">Select an address</h2>
                        {savedCards.map((savedCard, index) => { return (
                            <div id="display-saved-payment-info" key={index}>  
                                <div id={savedCard.brand} className="saved-credit-card">
                                    <div id="chip-card-img">
                                        <img src="https://img.pngio.com/chip-png-free-download-fourjayorg-chip-png-2400_2400.png"></img>
                                        <img src="https://students.1fbusa.com/hubfs/pw.png"></img>
                                    </div>
                                    <div id="card-img-container">
                                        {brandImage(savedCard.brand)}
                                    </div>
                                    <div id="cardNumber"><b>{savedCard.brand === 'amex' ? <p id='card-number'>****   ******   {savedCard.last4}</p> : <p id='card-number'>****   ****   ****   {savedCard.last4}</p>}</b></div>
                                    <div id="cardholder-title">Cardholder</div>
                                    <div id="saved-cardholder-name"><b>{savedCard.cardholderName}</b></div>
                                    <div id="expiry-date-title">Valid thru</div>
                                    <div id="expiry-date"><b>{savedCard.expDate}</b></div>
                                </div>
                                <Button type="button" variant='dark' size='lg' id={savedCard.paymentMethodID} className="select-save-address-button" disabled={disableButtonAfterMakingRequest} onClick={ showOneSavedCard }>Select</Button>
                            </div>
                        )})}
                        <Button id="close-save-address-button" type='button' variant='dark' size='lg' onClick={ closeSavedCards }>Close</Button>
                    </Modal>

                    {/* Do not show the Confirm Payment button when Saved Cards modal, Edit modal, and Add New Card modal are open */}

                    {(!editPayment && !redisplayCardElement && !showSavedCards) && (
                        <Button variant="dark" id="submit" size='lg'
                        disabled={ (disabled && paymentMethod.recollectCVV === "true") || error || processingPayment }  
                        onClick={(event) => {
                            // setProcessingPayment(true)
                            handleConfirmPayment(event)
                        }}>
                            { processingPayment ? (
                                <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                                <span>Processing...</span>
                                </> 
                                ) : "Confirm Payment"
                            }
                        </Button>
                        ) 
                    }

                </div>
            </div>
            )}
            </>
        )
        
    } else if(paymentMethod.paymentMethodID && editPayment) {
        // When the Edit button is clicked this modal is shown
        return (
            <Modal isOpen={showModal} onRequestClose={closeEditModal} ariaHideApp={false} contentLabel="Edit Card">
                <form classes={classes.root} noValidate autoComplete="off" onSubmit={handleUpdatePayment}>
                    <h2 id="edit-payment-heading">Edit Payment</h2>
                    <div id="display-edit-payment-info">  
                        <div id={paymentMethod.brand} className="edit-credit-card">
                            <div id="chip-card-img">
                                <img src="https://img.pngio.com/chip-png-free-download-fourjayorg-chip-png-2400_2400.png"></img>
                                <img src="https://students.1fbusa.com/hubfs/pw.png"></img>
                            </div>
                            <div id="card-img-container">
                                {brandImage(paymentMethod.brand)}
                            </div>
                            <div id="cardNumber"><b>{paymentMethod.brand === 'amex' ? <p id='card-number'>****   ******   {paymentMethod.last4}</p> : <p id='card-number'>****   ****   ****   {paymentMethod.last4}</p>}</b></div>
                            <div id="cardholder-title">Cardholder</div>
                            <div id="edit-cardholder-name"><b>{paymentMethod.cardholderName}</b></div>
                            <div id="expiry-date-title">Valid thru</div>
                            <div id="expiry-date"><b>{paymentMethod.expDate}</b></div>
                        </div>
                    </div>
                    <div id="edit-cardholder-name-container">
                        <TextField
                        id="edit-cardholder-name-input"
                        label="Name on card"
                        className="filled-margin-none"
                        placeholder="Enter cardholder's name"
                        variant="filled"
                        required
                        fullWidth
                        value={cardholderName || ""} 
                        name="name"
                        onChange={handleCardholderNameChange}
                        onFocus={() => setOnCardholderBlur(false)}
                        onBlur={() => {
                            if(cardholderNameInputError2(cardholderName)) setOnCardholderBlur(true)
                        }}
                        error={cardholderNameInputError(cardholderName) || onCardholderBlur}
                        helperText={(onCardholderBlur && "Required field") || (cardholderNameInputError(cardholderName) && "Only letters and ', . ' -' are allowed")}
                        />
                    </div>
                    <div className="expiration-container" >
                        <div id="edit-month-container">
                            <TextField
                            id="edit-exp-month"
                            label="Exp. Month"
                            className="filled-margin-none"
                            placeholder="MM"
                            variant="filled"
                            required
                            inputProps={{
                                type: "number",
                                maxLength: 2
                            }}
                            value={editExpiration.month || ""}
                            name="month"
                            onInput={handleMaxExpOrZipcodeLength}
                            onKeyDown={handleNonNumericExpirationOrZipcode}
                            onChange={handleEditExpiration} 
                            onFocus={() => setOnMonthBlur(false)}
                            onBlur={() => {
                                if(monthInputError(editExpiration) || monthLengthInputError(editExpiration)) setOnMonthBlur(true)
                            }}
                            error={invalidMonthInput(editExpiration) || expInvalidInput(editExpiration) || onMonthBlur}
                            helperText={(onMonthBlur && "Required field") ||  (invalidMonthInput(editExpiration) && "Invalid Month")}
                            />
                        </div>            
                        
                        <div id="edit-year-container">
                            <TextField
                            id="edit-exp-year"
                            label="Exp. Year"
                            className="filled-margin-none"
                            placeholder="YYYY"
                            variant="filled"
                            required
                            value={editExpiration.year || ""}
                            name="year"
                            inputProps={{
                                type: "number",
                                maxLength: 4
                            }}
                            onInput={handleMaxExpOrZipcodeLength}
                            onKeyDown={handleNonNumericExpirationOrZipcode}
                            onChange={handleEditExpiration}
                            onFocus={() => setOnYearBlur(false)}
                            onBlur={() => {
                                if(yearInputError(editExpiration) || yearLengthInputError(editExpiration)) setOnYearBlur(true)
                            }} 
                            error={invalidYearInput(editExpiration) || onYearBlur || expInvalidInput(editExpiration)}
                            helperText={(onYearBlur && "Required field") ||  ((invalidYearInput(editExpiration) || invalidCardYearUpdate) && "Invalid Year")}
                            />
                        </div>
                        {expInvalidInput(editExpiration) && <FormHelperText>Expiration date is invalid</FormHelperText>}
                    </div>

                    <div id="edit-container">
                        <BillingInput loggedIn={loggedIn} billing={billing} handleBillingChange={handleBillingChange} handleBillingStateChange={handleBillingStateChange} editPayment={editPayment} paymentMethod={paymentMethod} classes={classes} handleMaxExpOrZipcodeLength={handleMaxExpOrZipcodeLength} handleNonNumericExpirationOrZipcode={handleNonNumericExpirationOrZipcode} />
                        <div id="edit-buttons-container">
                            <Button size='lg' variant='dark' className="edit-buttons" onClick={closeEditModal}>Close</Button>
                            <Button size='lg' variant='dark' className="edit-buttons" type="submit" disabled={ billingInputErrorDisableButton() || editExpirationError() || disableButtonAfterMakingRequest || billing.state === 'Select'}>Save</Button>
                            {/* <button type="button" onClick={() => console.log("disable after making request: ", disableButtonAfterMakingRequest, "billing input: ", billingInputErrorDisableButton(), "edit exp error: ", editExpirationError(), "postal code: ", billingInputErrorDisableButton(), "billing state: ", billing.state)}>click</button> */}
                        </div>
                    
                    </div>
                </form>
            </Modal>
        )
    } 
}
export default PaymentMethod