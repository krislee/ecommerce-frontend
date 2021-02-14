import React, { useEffect, useState } from 'react';
// import { io } from "socket.io-client";


export default function OrderComplete({ backend, cartID }) {
 
    const [orderLoading, setOrderLoading] = useState(true)
    const [showOrderDetails, setShowOrderDetails] = useState(false)
    const [order, setOrder] = useState({})
    const [orderItems, setOrderItems] = useState([])
    const [orderShipping, setOrderShipping] = useState({})
    const [orderPayment, setOrderPayment] = useState({})

    const currentURL = window.location.href;
    const indexOfEqualSign = currentURL.split('=');
    const id=indexOfEqualSign[indexOfEqualSign.length - 1];

    useEffect(() => setOrderLoading(false))

    const handleOrderDetails = async() => {
        const orderID = cartID || id
        const orderResponse = await fetch(`${backend}/complete/list/orders/${orderID}`)
        const orderData = await orderResponse.json()
        console.log(orderData)
        const shipping = orderData.order.Shipping.Address.split(",")
        setOrder(orderData.order)
        setOrderItems(orderData.order.Items)
        setOrderShipping(shipping)
        setOrderPayment(orderData.payment)
        setShowOrderDetails(true)
    }
    
    if(orderLoading && cartID) {
        return <h1>Please wait while we process your payment</h1>
    } else {
        return (
        
            <>
                <h2>Thank you for your purchase! </h2>
                <h3>Order #: {cartID || id}</h3>
                { !showOrderDetails ? <button onClick={handleOrderDetails}>Order Details</button> : <button onClick={()=> setShowOrderDetails(!showOrderDetails)}>Close</button> }
                { showOrderDetails && (
                    
                <div>
                    <h4>Items</h4>
                    {orderItems.map((orderItem, index) => { return (
                        <div key={index}>
                            <p>{orderItem.Name}</p>
                            <p>{orderItem.Quantity}</p>
                        </div>
                    )})}

                    <h4>Shipping</h4>
                    <p>{order.Shipping.Name.split(", ")[0]} {order.Shipping.Name.split(", ")[1]} </p>
                    <p>{orderShipping[0]}</p>
                    <p>{orderShipping[1] === "null" || orderShipping[1] === "undefined" ? "" : orderShipping[1]}</p>
                    <p>{orderShipping[2]}, {orderShipping[3]} {orderShipping[4]} </p>
                    
                    <h4>Billing Details</h4>
                    <p>{orderPayment.brand[0].toUpperCase()}{orderPayment.brand.slice(1)} ending in {orderPayment.last4}</p>
                    <p>{orderPayment.billingDetails.name.split(", ")[0]} {orderPayment.billingDetails.name.split(", ")[1]} </p>
                    <p>{orderPayment.billingDetails.address.line1}</p>
                    <p>{orderPayment.billingDetails.address.line2 === "null" || orderPayment.billingDetails.address.line2 === "undefined" ? "" : orderPayment.billingDetails.address.line2}</p>
                    <p>{orderPayment.billingDetails.address.city}, {orderPayment.billingDetails.address.state} {orderPayment.billingDetails.address.postalCode}</p>
                </div>
                )}
                
            </>
        
        )
    }
}