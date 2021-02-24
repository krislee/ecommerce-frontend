import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavigationBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useLocation, Link } from 'react-router-dom';
import Modal from 'react-modal';

export default function OrderComplete({ backend, loggedIn, cartID, socketContainer, grabTotalCartQuantity }) {
 
    const [orderLoading, setOrderLoading] = useState(true)
    const [showRedirectModal, setShowRedirectModal] = useState(false)

    const [orderItems, setOrderItems] = useState([])
    const [orderShipping, setOrderShipping] = useState([])
    const [orderShippingName, setOrderShippingName] = useState('')
    const [orderPayment, setOrderPayment] = useState({})
    const [orderNumber, setOrderNumber] = useState('')

    const location = useLocation()

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        const getOrderConfirmation = async() => {
            if(cartID) {
                // socket sends event, called completeOrder, with the data which pertains to order info
                socketContainer.on('completeOrder', (orderData) => {
                    console.log(44, orderData)

                    const shipping = orderData.order.Shipping.Address.split(",")
                    setOrderItems(orderData.order.Items)
                    setOrderShipping(shipping)
                    setOrderShippingName(orderData.order.Shipping.Name.replace(", ", " "))
                    setOrderNumber(orderData.order.OrderNumber)
                    setOrderPayment(orderData.payment)
                    setOrderLoading(false)

                    socketContainer.emit('end', {cartID: cartID}) // end socket connect
                    socketContainer.disconnect(true)
                })

                // socketContainer.emit('end', {cartID: cartID}) // end socket connect

                // socketContainer.disconnect(true)
            } else {
            
                // If user wants to see the order receipt after order is complete at anytime, then we need to parse the URL query to get the order number. However, user needs to be logged in to see the order since it would not be safe for anyone with the URL can view the order. So if guest made an order, then guest can only view the order confirmation right after confirming payment.
                if(loggedIn()) {
                    const queryObj = new URLSearchParams(location.search)
                    const orderNumber = queryObj.get('orderNumber')
                    console.log(orderNumber)
                    
                        const completeOrderResponse = await fetch(`${backend}/complete/list/orders/${orderNumber}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': loggedIn()
                            },
                            signal: signal
                        })
                        const completeOrderData = await completeOrderResponse.json()
                        console.log(completeOrderData)
        
                        const shipping = completeOrderData.order.Shipping.Address.split(",")
                        setOrderItems(completeOrderData.order.Items)
                        setOrderShipping(shipping)
                        setOrderShippingName(completeOrderData.order.Shipping.Name.replace(", ", " "))
                        setOrderNumber(completeOrderData.order.OrderNumber)
                        setOrderPayment(completeOrderData.payment)
                        setOrderLoading(false)
                } else {
                    return setShowRedirectModal(true)
                }
            }
        }
        
        getOrderConfirmation()  
        return function cleanUp () {
            abortController.abort()
        }

    }, [])

    if(orderLoading && cartID) {
        return (
            <>
            <h1>Please wait while we process your payment</h1>
            <CircularProgress />
            </>
        )
    } else if (showRedirectModal) {
        return (
            <Modal isOpen={showRedirectModal} ariaHideApp={false} contentLabel="Page cannot be shown">
                Looks like this page does not exist or requires you to log in. Click <Link to="/">here</Link> to return to homepage.
            </Modal>
        )
    } else if(orderLoading) {
        return null
    } else {
        return (
        
            <>
                <NavBar />
                <h2>Thank you for your purchase! </h2>
                <h3>Order #: {orderNumber}</h3>
                    
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
            </>
        )
    }
}

    // const socketRef = useRef()

    // socket.emit('join', {cartID: cartID})

    // useEffect(() => {
    //     // socket.on('connect', () => console.log(29, socket.socket.sessionid))
    //     socket.on('socketID', (socketID, fn) => {
    //         console.log(33, socketID)
    //         fn({socketID: socketID, cartID: cartID})
    //         setOrderLoading(false)
    //     })
    // }, [])
