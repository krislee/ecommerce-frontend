import React, { useState } from 'react';
import Modal from 'react-modal';
import PaymentContainer from '../../components/UserProfile/PaymentContainer';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

function UserProfilePayment ({ backend, paymentData, grabPaymentData, defaultFirstPayment }) {

    const [modalIsOpen,setModalIsOpen] = useState(false);
    const [modalTwoIsOpen, setModalTwoIsOpen] = useState(false);
    const [cardHolderInput, setCardHolderInput] = useState({});
    const [billingInput, setBillingInput] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(null);

    const elements = useElements();
    const stripe = useStripe();
    
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
    }

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        setModalIsOpen(false);
    }
    // Function that is used to open the second modal when users plan to create
    const openModalTwo = (e) => {
        e.preventDefault();
        setModalTwoIsOpen(true);
    }

    // Function that is used to close the second modal when the user either leaves or submits a address
    const closeModalTwo = () => {
        setModalIsOpen(false);
        setModalTwoIsOpen(false);
    }

    const handleCardHolderNameChange = (e) => {
        const { name, value } = e.target
        setCardHolderInput((prevCardHolder) => ({
            ...prevCardHolder, [name] : value
        }))
    }

    const handleBillingChange = (e) => {
        const { name, value } = e.target
        setBillingInput((prevBilling) => ({
            ...prevBilling, [name] : value
        }));
    }

    const handleCardChange = (event) => {
        console.log("listening for card changes");
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        const checkbox = document.getElementById('payment-default');
        const check = checkbox.checked
        console.log(check);
        const newPaymentResponse = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
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
        console.log(newPaymentResponse);
        const savePaymentMethodToCustomerResponse = await fetch(`${backend}/order/payment?checkout=false`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
                paymentMethodID: `${newPaymentResponse.paymentMethod.id}`,
                default: check
            })
        })
        const savePaymentMethodToCustomerData = await savePaymentMethodToCustomerResponse.json();
        console.log(savePaymentMethodToCustomerData);
        defaultFirstPayment(savePaymentMethodToCustomerData.paymentMethods);
        grabPaymentData(savePaymentMethodToCustomerData.paymentMethods);
        setCardHolderInput({});
        setBillingInput({});
        closeModalTwo();
    }

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
                />
            )
        }
    })

    return (
        <div className="payments-container">
            <div className="header-container">
                <div className="header">Saved Payments</div>
                <div 
                className="add-address" 
                onClick={openModal}>
                        Add Payment
                </div>
            </div>
            {paymentData[0] === undefined ? 
                <div>Add Your Payment Above</div> : 
            <>
                <div className="all-payment-container">
                    <div className="all-payments-container">{paymentData.length !== 0 && allPayments}
                    </div>
                </div>
            </>}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Payment Modal"
                >
                <form className="form">
                <h2>Add Your Card Information</h2>
                <input value={cardHolderInput.cardName || ""} name="cardName" placeholder="Card Name" onChange={handleCardHolderNameChange}/>
                <CardElement onChange={handleCardChange}/>
                <div>{error}</div>
                <div className="default-container">
                    <label htmlFor="paymentDefault">Save as default</label>
                    <input name="paymentDefault" type="checkbox" id="payment-default"/>
                </div>
                <button onClick={openModalTwo} disabled={error || disabled}>
                    Next
                </button>
                </form>
            </Modal>
            <Modal
                isOpen={modalTwoIsOpen}
                onRequestClose={closeModalTwo}
                style={customStyles}
                contentLabel="Add Billing Information Modal"
                >
                <form className="form">
                <h2>Add Your Billing Address</h2>
                <input value={billingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange}/>
                <input value={billingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange}/>
                <input value={billingInput.lineOne || ""} name="lineOne" placeholder="Address Line One" onChange={handleBillingChange}/>
                <input value={billingInput.lineTwo || ""} name="lineTwo" placeholder="Address Line Two" onChange={handleBillingChange}/>
                <input value={billingInput.city || ""} name="city" placeholder="City" onChange={handleBillingChange}/>
                <input value={billingInput.state || ""} name="state" placeholder="State" onChange={handleBillingChange}/>
                <input value={billingInput.zipcode || ""} name="zipcode" placeholder="Zipcode" onChange={handleBillingChange}/>
                <button onClick={handleCreatePayment} 
                disabled={!billingInput.firstName || !billingInput.lastName || !billingInput.lineOne || !billingInput.city || !billingInput.state || !billingInput.zipcode}>
                    Submit
                </button>
                </form>
            </Modal>
        </div>
    )

}

export default UserProfilePayment