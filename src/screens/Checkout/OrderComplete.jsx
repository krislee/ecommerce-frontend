import React, { useEffect, useState, useRef } from 'react';
import NavBar from '../../components/NavigationBar';
import CircularProgress from '@material-ui/core/CircularProgress';
// import socketIOClient from "socket.io-client";
import { io } from "socket.io-client";
// var HOST = window.location.origin.replace(/^http/, 'ws')
// var ws = new WebSocket(HOST);
const socket = io.connect('wss://elecommerce.herokuapp.com',  { transports: ['websocket', 'polling', 'flashsocket'] })
export default function OrderComplete({ backend, cartID }) {
 
    const [orderLoading, setOrderLoading] = useState(true)
    const [showOrderDetails, setShowOrderDetails] = useState(false)
    // const [order, setOrder] = useState({})
    const [orderItems, setOrderItems] = useState([])
    const [orderShipping, setOrderShipping] = useState([])
    const [orderShippingName, setOrderShippingName] = useState('')
    const [orderPayment, setOrderPayment] = useState({})
    const [orderNumber, setOrderNumber] = useState('')

    const [socketID, setSocketID] = useState('')

    const currentURL = window.location.href;
    const indexOfEqualSign = currentURL.split('=');
    const id=indexOfEqualSign[indexOfEqualSign.length - 1];

    // const socketRef = useRef()

    // socket.emit('join', {cartID: cartID})

    useEffect(() => {
        // socket.on('connect', () => console.log(29, socket.socket.sessionid))
        socket.on('socketID', (socketID, fn) => {
            console.log(33, socketID)
            fn({socketID: socketID, cartID: cartID})
            setOrderLoading(false)
        })
    
        
        // socket.emit('end')

        // ws.onmessage = (event) => {
        //     const orderData = event.data 
        //     setOrderItems(orderData.order.Items)
        //     // setOrderShipping(shipping)
        //     setOrderShippingName(orderData.order.Shipping.Name.replace(", ", " "))
        //     setOrderNumber(orderData.order.OrderNumber)
        //     setOrderPayment(orderData.payment)
        //     setShowOrderDetails(true)
        //     setOrderLoading(false)
        // }
           
    }, [])

    socket.on('receivedOrder', (orderData) => {
        console.log(51, orderData)
        setOrderItems(orderData.order.Items)
        // setOrderShipping(shipping)
        setOrderShippingName(orderData.order.Shipping.Name.replace(", ", " "))
        setOrderNumber(orderData.order.OrderNumber)
        setOrderPayment(orderData.payment)
        setShowOrderDetails(true)
        setOrderLoading(false)
    })
    
    if(orderLoading && cartID) {
        return (
            <>
            <h1>Please wait while we process your payment</h1>
            <CircularProgress />
            </>
        )
    } 
    else {
        return (
        
            <>
                <NavBar />
                <h2>Thank you for your purchase! </h2>
                <h3>Order #: {orderNumber}</h3>
                {/* { !showOrderDetails ? <button onClick={handleOrderDetails}>Order Details</button> : <button onClick={()=> setShowOrderDetails(!showOrderDetails)}>Close</button> }
                { showOrderDetails && ( */}
                    
                <div>
                    <h4>Items</h4>
                    {orderItems.map((orderItem, index) => { return (
                        <div key={index}>
                            <p>{orderItem.Name}</p>
                            <p>{orderItem.Quantity}</p>
                        </div>
                    )})}

                    <h4>Shipping</h4>
                    {/* <p>{order.Shipping.Name.split(", ")[0]} {order.Shipping.Name.split(", ")[1]} </p> */}
                    <p>{orderShippingName}</p>
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
                {/* )} */}
                
            </>
        
        )
    }
}