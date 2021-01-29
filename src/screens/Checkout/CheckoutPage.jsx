import React, { useEffect, useState } from 'react';
// import PaymentIntent from './PaymentIntent';
// import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function Checkout ({backend, grabPaymentIntentInfo, paymentIntentInfo}) {

    const [token, setToken] = useState('')

    useEffect(() => {
        setToken(localStorage.getItem('token'));
        console.log(token);
        const handleCheckout = async () => {
            if (localStorage.getItem('token')) {
                console.log("logged in")
                console.log(56, `${cartID}`)
                console.log(60, token)
                const response = await fetch(`${backend}/order/payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': `${cartID}`,
                        'Authorization': `${token}`
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
                if(token) {
                    console.log("Cleared local storage")
                } else {
                    console.log('I am not logged in')
                }
                // if
                // fetch('', {
    
                // })
            }
        }
        grabPaymentIntentInfo();
        console.log(paymentIntentInfo);
    });
    
    return (
        <div className="buyer-login">
            <div>Checkout Screen</div>
            <button onClick={() => console.log(paymentIntentInfo)}>Cart Items</button>
        </div>
    )
}

export default Checkout