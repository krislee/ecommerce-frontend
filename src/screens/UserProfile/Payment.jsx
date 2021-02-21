import React, { useState } from 'react';
import Modal from 'react-modal';
import PaymentContainer from '../../components/UserProfile/PaymentContainer';
import {useStripe, useElements, CardElement, CardExpiryElement, CardCvcElement, CardNumberElement} from '@stripe/react-stripe-js';

function UserProfilePayment ({ backend, paymentData, grabPaymentData, defaultFirstPayment, loggedIn, capitalize, capitalizeArray }) {

    /* ------- STATES ------- */

    // Getter and Setter to open and close the creating modal for payment methods (specifically for the card information)
    const [modalIsOpen,setModalIsOpen] = useState(false);
    // Getter and Setter to open and close the creating modal for payment methods (specifically for the billing information)
    const [modalTwoIsOpen, setModalTwoIsOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the creating payment function on the first edit modal (for card information)
    const [cardHolderInput, setCardHolderInput] = useState({});
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the creating payment function on the second edit modal (for billing information)
    const [billingInput, setBillingInput] = useState({});
    // Getter and Setter to display a warning message regarding when the user does not fulfill requirements for the zipcode input when creating a payment method
    const [addZipcodeWarning, setAddZipcodeWarning] = useState(false);
    // Getter and Setter to display a warning message regarding when the user does not fulfill requirements for the state input when creating a payment method
    const [addStateAbbreviationWarning, setAddStateAbbreviationWarning] = useState(false);
    // Getter and Setter to disable the button based on whether or not the card is valid when the user enters to create the payment method
    const [cardNumberDisabled, setCardNumberDisabled] = useState(true);
    const [cardCVCDisabled, setCardCVCDisabled] = useState(true);
    const [cardExpirationDisabled, setCardExpirationDisabled] = useState(true);
    // Getter and Setter to display an error message based on whether or not the card is valid when the user enters to create the payment method
    const [cardNumberError, setCardNumberError] = useState(null);
    const [cardCVCError, setCardCVCError] = useState(null);
    const [cardExpirationError, setCardExpirationError] = useState(null);

    // Stripe elements
    const elements = useElements();
    const stripe = useStripe();
    
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

    // Function that is used to open the modal when users plan to create
    const openModal = () => {
        setModalIsOpen(true);
    };

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        setModalIsOpen(false);
        setCardNumberDisabled(true);
        setCardCVCDisabled(true);
        setCardExpirationDisabled(true);
        setCardHolderInput({});
        setBillingInput({});
    };

    // Function that is used to open the second modal when users plan to create
    const openModalTwo = (e) => {
        e.preventDefault();
        setModalTwoIsOpen(true);
    };

    // Function that is used to close the second modal when the user either leaves or submits a address
    const closeModalTwo = () => {
        setModalIsOpen(false);
        setModalTwoIsOpen(false);
        setCardNumberDisabled(true);
        setCardCVCDisabled(true);
        setCardExpirationDisabled(true);
        setCardHolderInput({});
        setBillingInput({});
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the card information
    const handleCardHolderNameChange = (e) => {
        const { name, value } = e.target;
        setCardHolderInput((prevCardHolder) => ({
            ...prevCardHolder, [name] : value
        }));
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the billing address information
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingInput((prevBilling) => ({
            ...prevBilling, [name] : value
        }));
    };

    // Function that allows us to check on the changes made when entering card number (whether it is valid or empty) set disabled or error accordingly
    const handleCardNumberChange = (event) => {
        setCardNumberDisabled(event.empty);
        console.log(event.error);
        setCardNumberError(event.error ? event.error.message : "");
    };

    const handleCardCVCChange = (event) => {
        setCardCVCDisabled(event.empty);
        console.log(event.error);
        setCardCVCError(event.error ? event.error.message : "");
    };

    const handleCardExpirationChange = (event) => {
        setCardExpirationDisabled(event.empty);
        console.log(event.error);
        setCardExpirationError(event.error ? event.error.message : "");
    };

    // Function that is used to handle the event when a user submits the request to make a new payment method
    const handleCreatePayment = async (e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // If the user does not fulfill the requirements for the zipcode input
        if (billingInput.zipcode.length !== 5) {
            setAddZipcodeWarning(true);
            setAddStateAbbreviationWarning(false);
        // If the user does not fulfill the requirements for the state input
        } else if (billingInput.state.length !== 2) {
            setAddZipcodeWarning(false);
            setAddStateAbbreviationWarning(true);
        } else {
            // If the user does fulfill the requirements for the all the inputs
            setAddZipcodeWarning(false);
            setAddStateAbbreviationWarning(false);
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
                />
            );
        };
    });

    return (
        <div className="payments-container">
            <div className="header-container">
                <div className="header">Saved Payments</div>
                {/* The button that opens the modal that users can use to create new payment methods */}
                <div 
                className="add-address" 
                onClick={openModal}>
                        Add Payment
                </div>
            </div>
            {/* If there are no payment methods, then return a statement that tells users to add a payment method, otherwise the user will see all the payments they have decided to save */}
            {paymentData[0] === undefined ? 
                <div>Add Your Payment Above</div> : 
            <>
                <div className="all-payment-container">
                    <div className="all-payments-container">{paymentData.length !== 0 && allPayments}
                    </div>
                </div>
            </>}
            {/* Modal that specifically pertains to the adding new payment methods */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Payment Modal"
                >
                <form className="form">
                <h2>Add Your Card Information</h2>
                {/* Input regarding the full name of the creating payment method modal */}
                <input 
                style={{marginBottom: '1rem'}}
                value={cardHolderInput.cardName || ""} 
                name="cardName" 
                placeholder="Card Name" 
                onChange={handleCardHolderNameChange}/>
                {/* Appears when the input for full name has anything other than letters */}
                {(/^[a-z][a-z\s]*$/i.test(cardHolderInput.cardName) !== true 
                && cardHolderInput.cardName !== "")
                && <div className="warning">You must enter only letters as your name</div>}
                {/* Imported from Stripe API, this will generate the input fields for the card number, expiration date and zipcode */}
                <div style={{marginTop: '1rem'}}>
                    <CardNumberElement onChange={handleCardNumberChange}/>
                    <CardExpiryElement onChange={handleCardExpirationChange}/>
                    <CardCvcElement onChange={handleCardCVCChange}/>
                </div>
                {/* Appears when the inputs in CardElement has an error*/}
                <div>{cardNumberError}</div>
                <div>{cardCVCError}</div>
                <div>{cardExpirationError}</div>
                {/* Users can check this box to make the payment method they are creating the default payment method */}
                <div className="default-container" style={{margin: '1rem 0rem'}}>
                    <label htmlFor="paymentDefault">Save as default</label>
                    <input name="paymentDefault" type="checkbox" id="payment-default"/>
                </div>
                {/* Button to go onto the next modal where users will create the billing address */}
                <button 
                onClick={openModalTwo} 
                // Button will be disabled if the input fields are not filled in (except for the address line two input field)
                disabled={cardNumberError
                || cardCVCError
                || cardExpirationError
                || cardCVCDisabled
                || cardNumberDisabled
                || cardExpirationDisabled
                || ((/^[a-z][a-z\s]*$/i.test(cardHolderInput.cardName) !== true) 
                || cardHolderInput.cardName === "")
                }>
                    Next
                </button>
                {/* <button type="button" onClick={() => console.log(error)}>Test</button> */}
                </form>
            </Modal>
            {/* Modal that is used to create the payment method billing address section*/}
            <Modal
                isOpen={modalTwoIsOpen}
                onRequestClose={closeModalTwo}
                style={customStyles}
                contentLabel="Add Billing Information Modal"
                >
                <form className="form">
                <h2>Add Your Billing Address</h2>
                {/* Input regarding the first name of the creating payment method billing address modal */}
                <input 
                value={billingInput.firstName || ""} 
                name="firstName" 
                type="text"
                placeholder="First Name" 
                onChange={handleBillingChange}/>
                {/* Appears when the input for first name has anything other than letters */}
                {(/^[a-z][a-z\s]*$/i.test(billingInput.firstName) !== true 
                && billingInput.firstName !== "") 
                && <div className="warning">You must enter only letters as your first name</div>}
                {/* Input regarding the last name of the creating payment method billing address modal */}
                <input 
                value={billingInput.lastName || ""} 
                name="lastName" 
                placeholder="Last Name" 
                onChange={handleBillingChange}/>
                {/* Appears when the input for last name has anything other than letters */}
                {(/^[a-z][a-z\s]*$/i.test(billingInput.lastName) !== true 
                && billingInput.lastName !== "") 
                && <div className="warning">You must enter only letters as your last name</div>}
                {/* Input regarding the first address line of the creating payment method billing address modal */}
                <input 
                value={billingInput.lineOne || ""} 
                name="lineOne" 
                placeholder="Address Line One" 
                onChange={handleBillingChange}/>
                {/* Appears when the input for first address line has no input */}
                {billingInput.lineOne === "" 
                && <div className="warning">You must enter an address</div>}
                {/* Input regarding the second address line of the creating payment method billing address modal */}
                <input 
                value={billingInput.lineTwo || ""}
                name="lineTwo" 
                placeholder="Address Line Two" 
                onChange={handleBillingChange}/>
                {/* Input regarding the city of the creating payment method billing address modal */}
                <input 
                value={billingInput.city || ""} 
                name="city" 
                placeholder="City" 
                onChange={handleBillingChange}/>
                {/* Appears when the input for city has anything other than letters */}
                {(/^[a-z][a-z\s]*$/i.test(billingInput.city) !== true 
                && billingInput.city !== "") 
                && <div className="warning">You must enter only letters as your city</div>}
                {/* Input regarding the state of the creating payment method billing address modal */}
                <input 
                value={billingInput.state || ""} 
                name="state" 
                placeholder="State" 
                type="text"
                maxLength="2"
                onChange={handleBillingChange}/>
                {/* Appears when the input for state has anything other than letters */}
                {(/^[a-z][a-z\s]*$/i.test(billingInput.state) !== true 
                && billingInput.state !== "") 
                && <div className="warning">You must enter only letters as your state</div>}
                {/* Input regarding the zipcode of the creating payment method billing address modal */}
                <input 
                value={billingInput.zipcode || ""} 
                name="zipcode" 
                placeholder="Zipcode" 
                maxLength="5"
                onChange={handleBillingChange}/>
                {/* Appears when the input for zipcode has anything other than numbers */}
                {(/[a-zA-Z]/g.test(billingInput.zipcode) === true 
                && billingInput.zipcode !== undefined) 
                && <div className="warning">You must enter only numbers as your zip code</div>}
                {/* Appears when the input for zipcode has not met the five digit count length */}
                {addZipcodeWarning 
                && <div className="warning">You must enter five digits as your zip code</div>}
                {/* Appears when the input for state has not met the two digit count length */}
                {addStateAbbreviationWarning 
                && <div className="warning">Please enter your state as an abbreviation (ex. CA, NY)</div>}
                {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
                <button 
                style={{marginTop: '1rem'}}
                onClick={handleCreatePayment} 
                disabled={
                (/^[a-z][a-z\s]*$/i.test(billingInput.firstName) !== true 
                || billingInput.firstName === undefined)
                || (/^[a-z][a-z\s]*$/i.test(billingInput.lastName) !== true 
                || billingInput.lastName === undefined)
                || billingInput.lineOne === undefined
                || (/^[a-z][a-z\s]*$/i.test(billingInput.city) !== true 
                || billingInput.city === undefined)
                || (/^[a-z][a-z\s]*$/i.test(billingInput.state) !== true 
                || billingInput.state === undefined)
                || (/[a-zA-Z]/g.test(billingInput.zipcode) === true 
                || billingInput.zipcode === "")
                }>
                    Submit
                </button>
                </form>
            </Modal>
        </div>
    );
};

export default UserProfilePayment