import React, { useEffect, useState } from 'react';
// import PaymentIntent from './PaymentIntent';
// import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import Login from '../components/Login'
// import '../styles/BuyerLogin.css'
import PaymentMethod from './PaymentMethod'
function Checkout ({backend, paymentIntentInfo}) {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [cartID, setCartID] = useState('');
    const [returningCustomer, setReturningCustomer] = useState(false);
    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [checkoutData, setCheckoutData] = useState('');
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        setToken((prevToken) => {
            if (prevToken === (localStorage.getItem('token'))) {
                return true
            } else {
                return false
            }
        });
        console.log(1, token);
        const handleCheckout = async () => {
            if (token) {
                console.log("logged in")
                console.log(2, token)
                const responseCartID = await fetch(`${backend}/buyer/cartID`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                })
                const dataCartID = await responseCartID.json()
                console.log("cart id: ", dataCartID)
                const response = await fetch(`${backend}/order/payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': dataCartID.cartID,
                        'Authorization': token
                    }
                })
                const checkoutData = await response.json()
                console.log(checkoutData);
                setReturningCustomer(checkoutData.returningCustomer);
                setCustomer(checkoutData.customer);
                setPublicKey(checkoutData.publicKey);
                setClientSecret(checkoutData.clientSecret);
                setCheckoutData(checkoutData);
                // console.log(checkoutData);
                // grabItem(checkoutData);
                // if (checkoutData) {
                //     setRedirect(true)
                // }
            } else {
                // if(token) {
                    console.log("Cleared local storage")
                // } else {
                    console.log('I am not logged in')
                // }
                // if
                // fetch('', {
    
                // })
            }
        }     
        handleCheckout();
    },[token]);
    
    return (
        <div className="buyer-login">
            <div>Checkout Screen</div>
            <button onClick={() => console.log(token)}>Cart Items</button>
            <PaymentMethod checkoutData={checkoutData}/>
        </div>
    )
}

export default Checkout