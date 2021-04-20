import React, { useState } from 'react';
import Modal from 'react-modal';
import PaymentContainer from '../../components/UserProfile/PaymentContainer';
import {useStripe, useElements, CardExpiryElement, CardCvcElement, CardNumberElement} from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import usStates from '../../components/states'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

import {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, lineOneInputError, cityInputError, cityInputError2, stateInputError, zipcodeInputError, zipcodeInputError2, zipcodeInputError3, cardHolderNameInputError, cardHolderNameInputError2} from '../../components/Checkout/inputsErrors'

import '../../styles/UserProfile/PaymentForm.css'

// TextField Inputs Styles
const useStyles = makeStyles((theme) => ({
    root: {
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

// Styles for the Modal
const customStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        zIndex: 3
    }
};

Modal.setAppElement('#root');


function UserProfilePayment ({ backend, paymentData, grabPaymentData, defaultFirstPayment, loggedIn, capitalize, capitalizeArray, grabRedirect }) {

    const classes = useStyles()

    /* ------- STATES ------- */

    // Getter and Setter to open and close the creating modal for payment methods (specifically for the card information)
    const [modalIsOpen,setModalIsOpen] = useState(false);
    // Getter and Setter to open and close the creating modal for payment methods (specifically for the billing information)
    const [modalTwoIsOpen, setModalTwoIsOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the creating payment function on the first edit modal (for card information)
    const [cardHolderInput, setCardHolderInput] = useState({});
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the creating payment function on the second edit modal (for billing information)
    const [billingInput, setBillingInput] = useState({state: "Select"});
    // Getter and Setter to disable the button based on whether or not the card is valid when the user enters to create the payment method
    const [cardNumberDisabled, setCardNumberDisabled] = useState(true);
    const [cardCVCDisabled, setCardCVCDisabled] = useState(true);
    const [cardExpirationDisabled, setCardExpirationDisabled] = useState(true);
    // Getter and Setter to display an error message based on whether or not the card is valid when the user enters to create the payment method
    const [cardNumberError, setCardNumberError] = useState(null);
    const [cardCVCError, setCardCVCError] = useState(null);
    const [cardExpirationError, setCardExpirationError] = useState(null);
    const [disabledOnSubmitAddPaymentModal, setDisabledOnSubmitAddPaymentModal] = useState(false);
    const [overlayClickCloseAddPaymentModal, setOverlayClickCloseAddPaymentModal] = useState(true);
    
    // States to handle required Inputs that user clicked on but did not enter any values and clicked away
    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)
    const [onCardholderBlur, setOnCardholderBlur] = useState(false)

    // Stripe elements
    const elements = useElements();
    const stripe = useStripe();
    
    // Function that is used to open the modal when users plan to create
    const openModal = () => {
        if (loggedIn()) {
            setModalIsOpen(true);
        } else {
            grabRedirect();
        };
    };

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        if (loggedIn()) {
            setModalIsOpen(false);
            setCardNumberDisabled(true);
            setCardCVCDisabled(true);
            setCardExpirationDisabled(true);
            setCardHolderInput({});
            setBillingInput({});
            setCardNumberError(null);
            setCardCVCError(null);
            setCardExpirationError(null);
        } else {
            grabRedirect();
        };
    };

    // Function that is used to open the second modal when users plan to create
    const openModalTwo = (e) => {
        e.preventDefault();
        if (loggedIn()) {
            setModalTwoIsOpen(true);
        } else {
            grabRedirect();
        };
    };

    // Function that is used to close the second modal when the user either leaves or submits a address
    const closeModalTwo = () => {
        if (loggedIn()) {
            setModalIsOpen(false);
            setModalTwoIsOpen(false);
            setCardNumberDisabled(true);
            setCardCVCDisabled(true);
            setCardExpirationDisabled(true);
            setCardHolderInput({});
            setBillingInput({});
            setCardNumberError(null);
            setCardCVCError(null);
            setCardExpirationError(null);
            setDisabledOnSubmitAddPaymentModal(false);
            setOverlayClickCloseAddPaymentModal(true);
        } else {
            grabRedirect();
        };
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the card information
    const handleCardHolderNameChange = (e) => {
        if (loggedIn()) {
            const { name, value } = e.target;
            setCardHolderInput((prevCardHolder) => ({
                ...prevCardHolder, [name] : value
            }));
        } else {
            grabRedirect();
        };
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the billing address information
    const handleBillingChange = (e) => {
        if (loggedIn()) {
            const { name, value } = e.target;
            setBillingInput((prevBilling) => ({
                ...prevBilling, [name] : value
            }));
        } else {
            grabRedirect();
        };
    };
    const handleBillingStateChange = (event) => {
        console.log(event.target.value)
        if (loggedIn()) {
            setBillingInput((prevBilling) => ({
                ...prevBilling, "state": event.target.value
            }))
        } else {
            grabRedirect();
        };
    }

    // Function that allows us to check on the changes made when entering card number (whether it is valid or empty) set disabled or error accordingly
    const handleCardNumberChange = (event) => {
        if (loggedIn()) {
            setCardNumberDisabled(event.empty);
            setCardNumberError(event.error ? event.error.message : "");
        } else {
            grabRedirect();
        };
    };

    const handleCardCVCChange = (event) => {
        if (loggedIn()) {
            setCardCVCDisabled(event.empty);
            setCardCVCError(event.error ? event.error.message : "");
        } else {
            grabRedirect();
        };
    };

    const handleCardExpirationChange = (event) => {
        if (loggedIn()) { 
            setCardExpirationDisabled(event.empty);
            setCardExpirationError(event.error ? event.error.message : "");
        } else {
            grabRedirect();
        };
    };

    // Only displays 2 characters in zipcode input, or display 2 characters in month input, or display 4 characters in year input
    const handleMaxExpOrZipcodeLength = (event) => {
        console.log(204, event.target)
        if (event.target.value.length > event.target.maxLength) {
            event.target.value = event.target.value.slice(0, event.target.maxLength)
        }
    }

    // Does not allow user to enter anything but numbers on zipcode input and exp date inputs
    const handleNonNumericExpirationOrZipcode =(event) => {
        if(event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) return event.preventDefault()
    }

    // Function that is used to handle the event when a user submits the request to make a new payment method
    const handleCreatePayment = async (e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // Sets the button to disabled to not create duplicate payments
        if (loggedIn()) {
            setOverlayClickCloseAddPaymentModal(false);
            setDisabledOnSubmitAddPaymentModal(true);
            // We grab the checkbox that has the ID payment-default
            const checkbox = document.getElementById('payment-default');
            // We check whether or not the checkbox is checked (which indicates whether or not they want to make the payment method the default payment method)
            const check = checkbox.checked
            // Fetch to Stripe to create a new payment method response
            const newPaymentResponse = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardNumberElement),
                billing_details: {
                    name: `${billingInput.firstName}, ${billingInput.lastName}`,
                    address: {
                        city: `${billingInput.city}`,
                        country: `US`,
                        line1: `${billingInput.lineOne}`,
                        line2: `${billingInput.lineTwo}`,
                        postal_code: `${billingInput.zipcode}`,
                        state: `${billingInput.state}`
                    }
                },
                metadata: {
                    cardholder_name: `${cardHolderInput.cardName}`,
                    recollect_cvv: false
                }
            });
            // Creating a payment method based on the stripe response back and fetching it to the backend server
            const savePaymentMethodToCustomerResponse = await fetch(`${backend}/order/payment?checkout=false`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    paymentMethodID: `${newPaymentResponse.paymentMethod.id}`,
                    default: check
                })
            });
            // Data regarding the payment methods that is received back from the request to the backend server when creating is finished to receive updated version of the data
            const savePaymentMethodToCustomerData = await savePaymentMethodToCustomerResponse.json();
            // Make sure that data we recieve back is ordered so that the default will be first followed by newest payment method added
            defaultFirstPayment(savePaymentMethodToCustomerData.paymentMethods);
            // Assigning the data we recieve back to the variable paymentData so we can use that variable which stores an array and map through it to display different PaymentContainer components
            grabPaymentData(savePaymentMethodToCustomerData.paymentMethods);
            // Clearing out the object used to store the information that users put in the input fields so it's blank when users want to create a new one
            setCardHolderInput({});
            // Clearing out the object used to store the information that users put in the input fields so it's blank when users want to create a new one
            setBillingInput({});
            // Close the modal
            closeModalTwo();
        } else {
            grabRedirect();
        };
    };

    // Function that creates PaymentContainer components based off the array set in paymentData
    // We map through the array and grab the payment method (so we have the data of each individual address) and the index (so we can assign them as keys for React's virtual DOM)
    const allPayments = paymentData.map((payment, index) => {
        if (paymentData === undefined) {
            return null;
        } else {
            return (
                <PaymentContainer 
                key={index}
                payment={payment}
                backend={backend}
                defaultFirstPayment={defaultFirstPayment}
                grabPaymentData={grabPaymentData}
                capitalize={capitalize}
                capitalizeArray={capitalizeArray}
                loggedIn={loggedIn}
                grabRedirect={grabRedirect}
                />
            );
        }
    });

    return (
        <div className={paymentData[0] === undefined ? "payments-container-noInfo" : "payments-container"}>
            <div className="header-container">
                <div className="header">Saved Payments</div>
                {/* The button that opens the modal that users can use to create new payment methods */}
                <div 
                className="add-address" 
                onClick={openModal}>
                        Add Payment
                </div>
                <div 
                className="add-address-media add-address"
                onClick={openModal}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
            {/* If there are no payment methods, then return a statement that tells users to add a payment method, otherwise the user will see all the payments they have decided to save */}
            {paymentData[0] === undefined ? 
                <div 
                style={{
                    display: 'flex',
                    color: '#fff',
                    justifyContent: 'center',
                    height: '100%',
                    alignItems: 'center',
                    fontFamily: 'Mukta Vaani, sans-serif'
                }}>Looks like you don't have any payments saved yet! Click the Add Payment button to add your first one.</div> : 
            <>
                <div className="all-payment-container">
                    <div className="all-payments-container">{paymentData.length !== 0 && allPayments}
                    </div>
                </div>
            </>}
            {/* Modal that specifically pertains to the adding new payment methods */}
            <Modal
                id="profile-payment-modal"
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Payment Modal"
                >
                <form id="profile-payment-form" classes={classes.root} noValidate autoComplete="off">
                <h2>Add Payment</h2>
                {/* Input regarding the full name of the creating payment method modal */}
                {/* <input 
                style={{marginBottom: '1rem'}}
                value={cardHolderInput.cardName || ""} 
                name="cardName" 
                placeholder="Card Name" 
                onChange={handleCardHolderNameChange}/> */}
                {/* Appears when the input for full name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(cardHolderInput.cardName) !== true 
                && cardHolderInput.cardName !== "")
                && <div className="warning">You must enter only letters as your name</div>} */
                }
                <div id="profile-cardholder-name">
                    <TextField
                    label="Name on card"
                    className="filled-margin-none"
                    placeholder="Enter name on card"
                    variant="filled"
                    required
                    fullWidth
                    value={cardHolderInput.cardName || ""} 
                    name="cardName"
                    onChange={handleCardHolderNameChange}
                    onFocus={() => setOnCardholderBlur(false)}
                    onBlur={() => {
                        if(cardHolderNameInputError2(cardHolderInput)) setOnCardholderBlur(true)
                    }}
                    error={cardHolderNameInputError(cardHolderInput) || onCardholderBlur}
                    helperText={(onCardholderBlur && "Required field") || (cardHolderNameInputError(cardHolderInput) && "Only letters and ', . ' -' are allowed")}
                    />
                </div>

                {/* Imported from Stripe API, this will generate the input fields for the card number, expiration date and zipcode */}
                <div id="card-element-container">
                    <div id="card-number-element">
                        <CardNumberElement onChange={handleCardNumberChange}/>
                    </div>
                    <div className="warning">{cardNumberError}</div>
                    <div id="card-expiration-element">
                        <CardExpiryElement onChange={handleCardExpirationChange}/>
                    </div>
                    <div className="warning">{cardExpirationError}</div>
                    <div id="card-cvc-element">
                        <CardCvcElement onChange={handleCardCVCChange}/>
                    </div>
                    <div className="warning">{cardCVCError}</div>
                </div>         
                {/* Users can check this box to make the payment method they are creating the default payment method */}
                <div className="default-container" style={{margin: '1rem 0rem'}}>
                    <label htmlFor="paymentDefault">Save as default</label>
                    <input name="paymentDefault" type="checkbox" id="payment-default"/>
                </div>
                {/* Button to go onto the next modal where users will create the billing address */}
                <div id="profile-payment-add-button-div">
                    <Button 
                    id="profile-payment-add-next-button"
                    size="lg"
                    variant="dark"
                    onClick={openModalTwo} 
                    // Button will be disabled if the input fields are not filled in (except for the address line two input field)
                    disabled={cardNumberError
                    || cardCVCError
                    || cardExpirationError
                    || cardCVCDisabled
                    || cardNumberDisabled
                    || cardExpirationDisabled
                    || ((/^[a-z ,.'-]+$/i.test(cardHolderInput.cardName) !== true) 
                    || cardHolderInput.cardName === ""
                    || cardHolderInput.cardName === undefined)
                    }>
                        Next
                    </Button>
                </div>
                {/* <button type="button" onClick={() => console.log(error)}>Test</button> */}
                </form>
            </Modal>
            {/* Modal that is used to create the payment method billing address section*/}
            <Modal
                id="profile-payment-modal"
                shouldCloseOnOverlayClick={overlayClickCloseAddPaymentModal}
                isOpen={modalTwoIsOpen}
                onRequestClose={closeModalTwo}
                style={customStyles}
                contentLabel="Add Billing Information Modal"
                >
                <form id="profile-payment-form" classes={classes.root} noValidate autoComplete="off">
                <h2>Add Your Billing Address</h2>

                {/* Input regarding the first name of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.firstName || ""} 
                name="firstName" 
                type="text"
                placeholder="First Name" 
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for first name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(billingInput.firstName) !== true 
                && billingInput.firstName !== "") 
                && <div className="warning">You must enter only letters as your first name</div>} */}
                <div id="profile-payment-names-container">
                    <div id="profile-payment-firstName">
                        <TextField
                        label="First Name"
                        className="filled-margin-none"
                        placeholder="Enter First Name"
                        className={classes.textField}
                        variant="filled"
                        required
                        fullWidth
                        error={firstNameInputError(billingInput) || onFirstNameBlurEvent}
                        onFocus={() => setOnFirstNameBlurEvent(false)}
                        onBlur={() => {
                            if(firstNameInputError2(billingInput)) setOnFirstNameBlurEvent(true)
                        }}
                        helperText={(onFirstNameBlurEvent &&  "Required field") ||(firstNameInputError(billingInput) && "Only letters and ', . ' -' are allowed") || ""}
                        value={billingInput.firstName || ""} 
                        name="firstName" 
                        onChange={handleBillingChange}
                        />
                    </div>


                {/* Input regarding the last name of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.lastName || ""} 
                name="lastName" 
                placeholder="Last Name" 
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for last name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(billingInput.lastName) !== true 
                && billingInput.lastName !== "") 
                && <div className="warning">You must enter only letters as your last name</div>} */}
                    <div id="profile-payment-lastName">
                        <TextField
                        label="Last Name"
                        className="filled-margin-none"
                        placeholder="Enter Last Name"
                        variant="filled"
                        className={classes.textField}
                        required
                        fullWidth
                        onFocus={() => setOnLastNameBlurEvent(false)}
                        onBlur={() => {
                            if(lastNameInputError2(billingInput)) setOnLastNameBlurEvent(true)
                        }}
                        error={lastNameInputError(billingInput) || onLastNameBlurEvent} 
                        helperText={(onLastNameBlurEvent &&  "Required field")  ||(lastNameInputError(billingInput) && "Only letters and ', . ' -' are allowed") || ""}
                        value={billingInput.lastName || ""} 
                        name="lastName"
                        onChange={handleBillingChange}
                        />
                    </div>
                </div>



                {/* Input regarding the first address line of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.lineOne || ""} 
                name="lineOne" 
                placeholder="Address Line One" 
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for first address line has no input */}
                {/* {billingInput.lineOne === "" 
                && <div className="warning">You must enter an address</div>} */}
                <div id="profile-payment-line1">
                    <TextField
                    label="Address Line One"
                    className="filled-margin-none"
                    placeholder="Enter Address"
                    variant="filled"
                    fullWidth
                    className={classes.textField}
                    required
                    onFocus={() => setOnLine1BlurEvent(false)}
                    onBlur={() => {
                        if(lineOneInputError(billingInput)) setOnLine1BlurEvent(true)
                    }}
                    error={onLine1BlurEvent}
                    helperText={onLine1BlurEvent && "Required field"}
                    value={billingInput.lineOne || ""} 
                    name="lineOne"
                    onChange={handleBillingChange}
                    />
                </div>

                {/* Input regarding the second address line of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.lineTwo || ""}
                name="lineTwo" 
                placeholder="Address Line Two" 
                onChange={handleBillingChange}/> */}
                <div id="profile-payment-line2">
                    <TextField
                    label="Address Line Two"
                    className="filled-margin-none"
                    placeholder="Apartment, Floor, Suite"
                    variant="filled"
                    fullWidth
                    className={classes.textField}
                    value={billingInput.line2 || ""}
                    name="lineTwo"
                    onChange={handleBillingChange}
                    />
                </div>

                {/* Input regarding the city of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.city || ""} 
                name="city" 
                placeholder="City" 
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for city has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(billingInput.city) !== true 
                && billingInput.city !== "") 
                && <div className="warning">You must enter only letters as your city</div>} */}
                <div id="profile-payment-city">
                    <TextField
                    label="City"
                    fullWidth
                    className="filled-margin-none"
                    placeholder="Enter City"
                    variant="filled"
                    className={classes.textField}
                    required
                    onFocus={() => setOnCityBlurEvent(false)}
                    onBlur={() => {
                        if(cityInputError2(billingInput)) setOnCityBlurEvent(true)
                    }}
                    error={cityInputError(billingInput) || onCityBlurEvent}
                    helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(billingInput) && "Only letters and ', . ' -' are allowed") || ""}
                    value={billingInput.city || ""} 
                    name="city"
                    onChange={handleBillingChange}
                    />
                </div>

                {/* Input regarding the state of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.state || ""} 
                name="state" 
                placeholder="State" 
                type="text"
                maxLength="2"
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for state has anything other than letters */}
                {/* {(/^[a-z][a-z\s]*$/i.test(billingInput.state) !== true 
                && billingInput.state !== "") 
                && <div className="warning">You must enter only letters as your state</div>} */}
                <div className="profile-payment-state-zipcode">
                    <div id="profile-payment-state">
                        <FormControl variant="filled" className={classes.formControl}>
                            <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
                            <Select
                            label="State"
                            labelId="demo-simple-select-filled-label"
                            fullWidth
                            id="demo-simple-select-filled"
                            value={billingInput.state || "Select"} 
                            onFocus={() => setOnStateBlurEvent(false)}
                            onBlur={() => {
                                if(stateInputError(billingInput)) setOnStateBlurEvent(true)
                            }}
                            onChange={handleBillingStateChange}
                            >
                            <MenuItem disabled value="Select">Select</MenuItem>
                            {usStates.map((state) => { return (
                                <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
                            )})}
                            </Select>

                            {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
                        </FormControl>
                    </div>

                {/* Input regarding the zipcode of the creating payment method billing address modal */}
                {/* <input 
                value={billingInput.zipcode || ""} 
                name="zipcode" 
                placeholder="Zipcode" 
                maxLength="5"
                onChange={handleBillingChange}/> */}
                {/* Appears when the input for zipcode has anything other than numbers */}
                {/* {(/^[0-9]+$/.test(billingInput.zipcode) !== true 
                && billingInput.zipcode !== undefined) 
                && <div className="warning">You must enter only numbers as your zip code</div>} */}
                    <div id="profile-payment-zipcode">
                        <TextField
                        label="Zipcode"
                        className="filled-margin-none"
                        placeholder="Enter zipcode"
                        variant="filled"
                        fullWidth
                        className={classes.textField}
                        inputProps={{
                            type: "number",
                            maxLength: 5
                        }}
                        required
                        onInput={handleMaxExpOrZipcodeLength}
                        onKeyDown={handleNonNumericExpirationOrZipcode}
                        onFocus={() => setOnPostalCodeBlurEvent(false)}
                        onBlur={() => {
                            if(zipcodeInputError3(billingInput) || zipcodeInputError2(billingInput)) setOnPostalCodeBlurEvent(true)
                        }}
                        error={zipcodeInputError(billingInput) || onPostalCodeBlurEvent}
                        helperText={(onPostalCodeBlurEvent && "Required field") || (zipcodeInputError(billingInput) && "You must enter only numbers for your zip code") || ""}
                        value={billingInput.zipcode || ""} 
                        name="zipcode"
                        onChange={handleBillingChange}
                        />
                    </div>
                </div>


                {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
                <div id="profile-payment-add-buttons-container">

                    <Button 
                    id="profile-payment-add-back-button"
                    size="lg"
                    variant="dark"
                    style={{marginTop: '1rem'}}
                    onClick={() => {
                    setModalIsOpen(true)
                    setModalTwoIsOpen(false)
                    }}>
                    Back
                    </Button>

                    <Button 
                    id="profile-payment-add-submit-button"
                    size="lg"
                    variant="dark"
                    style={{marginTop: '1rem'}}
                    onClick={handleCreatePayment} 
                    disabled={
                    (/^[a-z ,.'-]+$/i.test(billingInput.firstName) !== true 
                    || billingInput.firstName === undefined)
                    || (/^[a-z ,.'-]+$/i.test(billingInput.lastName) !== true 
                    || billingInput.lastName === undefined)
                    || billingInput.lineOne === undefined
                    || (/^[a-z ,.'-]+$/i.test(billingInput.city) !== true 
                    || billingInput.city === undefined)
                    || billingInput.state === "Select"
                    // || (/^[a-z][a-z\s]*$/i.test(billingInput.state) !== true 
                    // || billingInput.state === undefined
                    // || billingInput.state.length !== 2)
                    || (/^[0-9]+$/.test(billingInput.zipcode) !== true 
                    || billingInput.zipcode === "")
                    || billingInput.zipcode.length !== 5
                    || disabledOnSubmitAddPaymentModal
                    }>
                        Submit
                    </Button>
                </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserProfilePayment