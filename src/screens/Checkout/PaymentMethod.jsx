import React, { useEffect, useState } from 'react';

function PaymentMethod ({ backend, checkoutData, token }) {

    useEffect(() => {
        const fetchPaymentMethod = async () => {
            const paymentMethodResponse = await fetch(`${backend}/order/checkout/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            })
            const paymentMethodData = await paymentMethodResponse.json()
            console.log(paymentMethodData);
            if (!paymentMethodData) {
                
            }
        }
        fetchPaymentMethod();
    },[])

    // const handleClick = () => {
    //     console.log(checkoutData);
    //     if (token) {
    //         if (localStorage.getItem('token')) {
    //             console.log('Logged In')
    //         } else {
    //             console.log('Local Storage')
    //         }
    //     } else {
    //         console.log('Not Logged')
    //     }
    // }
    
    return (
        <div>
            <button onClick={() => console.log('payment')}>Payment Method Component</button>
        </div>
    )

}

export default PaymentMethod