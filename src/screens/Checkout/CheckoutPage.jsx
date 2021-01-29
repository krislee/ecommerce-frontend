import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod'
function Checkout ({backend, paymentIntentInfo}) {
    const token = localStorage.getItem('token')
    const [cartID, setCartID] = useState('');
    const [returningCustomer, setReturningCustomer] = useState(false);
    const [customer, setCustomer] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [checkoutData, setCheckoutData] = useState('');
    const [redirect, setRedirect] = useState(false)
    useEffect(() => {
        const handleCheckout = async () => {
            console.log("token", token)
            if (token) {
                console.log("hi")
                const cartResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    }
                })
                const data = await cartResponse.json();
                console.log(data);
                if(typeof data.cart !== 'string'){
                    const response = await fetch(`${backend}/order/payment-intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Idempotency-Key': data.cart._id,
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
                } else {
                    setRedirect(true)
                };
            } else {
                const cartResponse = await fetch(`${backend}/buyer/cart`)
                const data = await cartResponse.json()
                console.log(data);
                if(data.message) {
                    setRedirect(true)
                }
            }
        }     
        handleCheckout();
    },[]);
    const redirectToCart = () => {
        if (redirect === true) {
            return <Redirect to="/cart"/>
        }
    }
    return (
        <div className="buyer-login">
            <div>Checkout Screen</div>
            <button onClick={() => console.log(token)}>Cart Items</button>
            {redirectToCart()}
            <PaymentMethod backend={backend} checkoutData={checkoutData} token={token}/>
        </div>
    )
}
export default Checkout