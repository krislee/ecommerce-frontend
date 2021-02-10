import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import PaymentContainer from '../../components/UserProfile/PaymentContainer';

function UserProfilePayment ({ backend }) {

    const [modalIsOpen,setIsOpen] = useState(false);
    const [paymentData, setPaymentData] = useState([]);
    const [paymentInput, setPaymentInput] = useState({});
    
    const customStyles = {
        content : {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)'
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

    useEffect(() => {
        async function fetchPaymentData () {
            let resp = await fetch(`${backend}/order/index/payment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            });
            const data = await resp.json();
            setPaymentData(data.paymentMethods);
            console.log(data.paymentMethods)
        }
        fetchPaymentData();
    }, [backend])

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
        </div>
    )

}

export default UserProfilePayment