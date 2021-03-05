import React, { useEffect, useState } from 'react';
// import NavBar from '../../components/NavigationBar';
import brandImage from '../../components/Checkout/creditcardIcons.jsx'
import CircularProgress from '@material-ui/core/CircularProgress';
import { useLocation, Link, Redirect } from 'react-router-dom';
import Modal from 'react-modal';

import '../../styles/Checkout/OrderComplete.css'

export default function OrderComplete({ backend, loggedIn, cartID, socket, grabTotalCartQuantity, totalCartQuantity }) {
 
    const [orderLoading, setOrderLoading] = useState(true)
    const [showRedirectModal, setShowRedirectModal] = useState(false)
    const [redirect, setRedirect] = useState(false)

    const [orderItems, setOrderItems] = useState([])
    const [orderShipping, setOrderShipping] = useState([])
    const [orderShippingName, setOrderShippingName] = useState('')
    const [orderPayment, setOrderPayment] = useState({})
    const [orderNumber, setOrderNumber] = useState('')
    const [orderDate, setOrderDate] = useState('')
    const [orderTotal, setOrderTotal] = useState(0)
    const [prevLoggedIn] = useState(loggedIn())

    const location = useLocation()

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        const getOrderConfirmation = async() => {
            if(cartID) {
                
                // socket sends event, called completeOrder, with the data which pertains to order info
                socket.on('completeOrder', (orderData) => {
                    console.log(44, orderData)

                    grabTotalCartQuantity(0) // update nav bar shopping cart badge icon to 0 after order; grabTotalCartQuantity() needs to be called inside socket.on('completeOrder) because if we get data back then that means the webhook function successfully carried out, including deleting cart
                    setOrderItems(orderData.order.Items)
                    const shipping = orderData.order.Shipping.Address.split(", ")
                    setOrderShipping(shipping)
                    setOrderShippingName(orderData.order.Shipping.Name.replace(", ", " "))
                    setOrderNumber(orderData.order.OrderNumber)
                    setOrderPayment(orderData.payment)
                    setOrderDate(orderData.order.OrderDate)
                    setOrderTotal(orderData.order.TotalPrice)
                    setOrderLoading(false)
                    socket.emit('end', {cartID: cartID}) // end socket connect
                })
                if((prevLoggedIn && !loggedIn())) setRedirect(true)
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
                        setOrderTotal(completeOrderData.order.TotalPrice)
                        setOrderPayment(completeOrderData.payment)
                        setOrderDate(new Date(completeOrderData.order.OrderDate).toDateString())
                        setOrderLoading(false)
                       
                } else {
                    if(prevLoggedIn && !loggedIn()) {
                        grabTotalCartQuantity(0)
                        return setRedirect(true)
                    }
                    return setShowRedirectModal(true)
                }
            }
        }
        
        getOrderConfirmation()  
        return function cleanUp () {
            abortController.abort()
        }

    }, [loggedIn()])

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
    } else if (redirect) {
        return <Redirect to="/"></Redirect>
    } else if(orderLoading) {
        return null
    } else {
        return (
            <div id="order-complete-container">
            <h2 id="order-complete-heading">Thank you for your purchase! </h2>
            
                <div id="order-complete-details-shipping-container">
                    <div id="order-compelete-details-container">
                        <div id="order-complete-details-heading"><b>Order Details</b></div>
                        <div id="order-complete-number">Order #: {orderNumber}</div>
                        <div id="order-complete-date">Order placed on {orderDate}</div>
                    </div>
                    <div id="order-complete-shipping-container">
                        <div id="order-complete-shipping-heading"><b>Shipping Address</b></div>
                        <div id="order-complete-shipping-info">
                            <p className="order-complete-name">{orderShippingName}</p>
                            <p className="order-complete-line1">{orderShipping[0]}</p>
                            {orderShipping[1] !== "null" && <p className="order-complete-line2">{orderShipping[1]}</p>}
                            <p className="order-complete-cityStatePostal">{orderShipping[2]}, {orderShipping[3]} {orderShipping[4]} </p>
                        </div>
                    </div>
                </div>

                <div id="order-complete-pm-billing-container">
                    <div id="order-complete-pm-container">
                        <div id="order-complete-pm-heading">
                            <b>Payment Method</b>
                        </div>
                        <div id="order-complete-pm-info">
                            <div id="order-complete-card-img-container">
                                {brandImage(orderPayment.brand)}
                            </div>
                            <div id="order-complete-card-number-container">
                                {orderPayment.brand === 'amex' ? <p id='order-completecard-number'>****   ******   {orderPayment.last4}</p> : <p id='order-completecard-number'>****   ****   ****   {orderPayment.last4}</p>}
                            </div>
                        
                        </div>
                    </div>
                    <div id="order-complete-billing-container">
                        <div id="order-complete-billing-heading">
                            <b>Billing Details</b>
                        </div>
                        <div id="order-complete-billing-info">
                            <p className="order-complete-name">{orderPayment.billingDetails.name.split(", ")[0]} {orderPayment.billingDetails.name.split(", ")[1]} </p>
                            <p className="order-complete-line1">{orderPayment.billingDetails.address.line1}</p>
                            {orderPayment.billingDetails.address.line2 !== "null" && <p className="order-complete-line2">{orderPayment.billingDetails.address.line2}</p>}
                            <p className="order-complete-cityStatePostal">{orderPayment.billingDetails.address.city}, {orderPayment.billingDetails.address.state} {orderPayment.billingDetails.address.postalCode}</p>
                        </div>
                    </div>
                </div>


                <div id="order-complete-items-container">
                    <div id="order-complete-items-heading"><b>Here is what you ordered:</b></div>
                    <div id="order-complete-items-table-heading">
                        <div>Item</div>
                        <div></div>
                        <div>Qty</div>
                        <div>Total</div>
                    </div>
                    <div id="order-complete-item-container">
                        {orderItems.map((orderItem, index) => { return (
                            <div className="order-complete-item" key={index}>
                                <div className="order-complete-img-container"><img src={orderItem.Image} /></div>
                                <div className="order-complete-name">{orderItem.Name}</div>
                                <div className="order-complete-quantity">{orderItem.Quantity}</div>
                                <div className="order-complete-price">${orderItem.TotalPrice.toFixed(2)}</div>
                            </div>
                        )})}
                    </div>
                    <div id="order-complete-total-container">
                        <div id="order-complete-total-heading-container">
                            <div>Subtotal: </div>
                            <div>Shipping: </div>
                            <div id="order-complete-tax">Tax: </div>
                            <div><b>Total: </b></div>
                        </div>
                
                        <div id="order-complete-total-prices-container">
                            <div>${(orderTotal/100).toFixed(2)}</div>
                            <div>$0</div>
                            <div id="order-complete-tax">$0</div>
                            <div><b>${(orderTotal/100).toFixed(2)}</b></div>
                        </div>
                        
                    </div>
                </div>
            </div>
           
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

    // http://localhost:3000/order-complete?orderNumber=6037007eaa771e00154481b0