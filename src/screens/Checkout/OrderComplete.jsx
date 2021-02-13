import React, { useEffect, useState } from 'react';
// import { io } from "socket.io-client";


export default function OrderComplete({ backend, loggedIn, cartID, successfulPaymentIntent, billing }) {
    
    // Get items from cart 
    // Get last used shipping
    // Get last used payment + billing details


    const [orderLoading, setOrderLoading] = useState(true)
    const [order, setOrder] = useState([])
    const [payment, setPayment] = useState({})

    let currentURL = window.location.href;
    console.log(currentURL)
    let indexOfEqualSign = currentURL.split('=');
    console.log(indexOfEqualSign)
    let id=indexOfEqualSign[indexOfEqualSign.length - 1];

    useEffect(() => {
        console.log(successfulPaymentIntent)
        const getOrderItems = async() => {
            console.log("complete order", cartID)
            if(cartID) {
                if (loggedIn()) {
                    const orderItemsResponse = await fetch(`${backend}/buyer/cart`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': loggedIn()
                        }
                    })
                    const orderItemsData = await orderItemsResponse.json()
                    console.log(orderItemsData)
                    setOrder(orderItemsData.cart.Items)
                    setOrderLoading(false)
                } else {
                    const orderItemsResponse = await fetch(`${backend}/buyer/cart`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include'
                    })
                    const orderItemsData = await orderItemsResponse.json()
                    console.log(orderItemsData)
                    setOrder(orderItemsData.cart)
                    setOrderLoading(false)
                }
               
                
            } else {
                console.log(49, id)
                const orderItemsResponse = await fetch(`${backend}/buyer/cart`)
                const orderItemsData = await orderItemsResponse.json()
            }
        }

        const getPayment = async() => {
            const orderPaymentResponse = await fetch(`${backend}/order/show/payment/${successfulPaymentIntent.payment_method}`)
            const orderPaymentData = await orderPaymentResponse.json()
            console.log(orderPaymentData)
            setPayment(orderPaymentData)
            setOrderLoading(false)
        }
        getOrderItems()
        // getPayment()
        // setOrderLoading(false)
    }, [])
    
    
    return (
        orderLoading ? <></> : (
            <>
                <div id="purchasedItems">
                    <h3>Items</h3>
                    {order.map((item, index) => { return (
                        <div key={index}>
                            <p>{item.Name}</p>
                            <p>{item.Quantity}</p>
                        </div>
                    )})}
                    <h4>Total Amount: {successfulPaymentIntent.amount}</h4>
                </div>
                <div id="completeShipping">
                    <h3>Shipping</h3>
                    <p>{successfulPaymentIntent.shipping.name.split(", ")[0]} {successfulPaymentIntent.shipping.name.split(", ")[1]} </p>
                    <p>{successfulPaymentIntent.shipping.line1}</p>
                    <p>{successfulPaymentIntent.shipping.line2 ? successfulPaymentIntent.shipping.line2 : ""}</p>
                    <p>{successfulPaymentIntent.shipping.city}, {successfulPaymentIntent.shipping.state} {successfulPaymentIntent.shipping.postal_code}</p>
                </div>
            </>
        )
        
    )
}