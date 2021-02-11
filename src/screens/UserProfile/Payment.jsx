import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import PaymentContainer from '../../components/UserProfile/PaymentContainer';
import {useStripe, useElements, CardElement, CardCvcElement} from '@stripe/react-stripe-js';

function UserProfilePayment ({ backend, paymentData }) {

    const [modalIsOpen,setIsOpen] = useState(false);
    const [paymentInput, setPaymentInput] = useState({});
    
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
        setIsOpen(true);
    }

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        setIsOpen(false);
    }

    const handlePaymentChange = (e) => {
        const { name, value } = e.target
        setPaymentInput((prevPayment) => ({
            ...prevPayment, [name] : value
        }))
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
                contentLabel="Example Modal"
                >
                <form className="form">
                <h2>Add Your Payment</h2>
                <input value={paymentInput.cardNumber || ""} name="cardNumber" placeholder="Card Number" onChange={handlePaymentChange}/>
                <input value={paymentInput.cardName || ""} name="cardName" placeholder="Card Name" onChange={handlePaymentChange}/>
                <button onClick={closeModal} >
                    Submit
                </button>
                </form>
                </Modal>
        </div>
    )

}

export default UserProfilePayment