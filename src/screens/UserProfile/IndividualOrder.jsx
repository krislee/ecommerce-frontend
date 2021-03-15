import React, { useEffect, useState } from 'react';
import {Redirect, useLocation, Link} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
// import ConvertDate from './ConvertDate'
import '../../styles/Checkout/OrderComplete.css'
import brandImage from '../../components/Checkout/creditcardIcons'

const useStyles = makeStyles({
    table: {
      minWidth: 650,
      color: '#fff'
    },
    white: {
        color: '#fff !important'
    }
});
  
  
export default function IndividualOrder({ backend, loggedIn, grabTotalCartQuantity }) {
    const location = useLocation()

    const classes = useStyles();

    const [orderLoading, setOrderLoading] = useState(true)
    const [order, setOrder] = useState({})
    const [orderItems, setOrderItems] = useState([])
    const [orderNumber, setOrderNumber] = useState(null)
    const [orderDate, setOrderDate] = useState(null)
    const [orderTotal, setOrderTotal] = useState(0)
    const [orderShipping, setOrderShipping] = useState([])
    const [orderShippingName, setOrderShippingName] = useState([])
    const [orderPayment, setOrderPayment] = useState({})
    const [redirect, setRedirect] = useState(false)

    // const {orderNumber} = useParams()
    const queryParams = new URLSearchParams(location.search)
    const orderID = queryParams.get('orderNumber')

    useEffect(() => {

        const abortController = new AbortController()
        const signal = abortController.signal
        
        const getOrder = async() => {
            if(loggedIn()) {
                const orderResponse = await fetch(`${backend}/complete/list/orders/${orderID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                const orderData = await orderResponse.json()
                console.log(orderData)
                setOrder(orderData.order)
                setOrderItems(orderData.order.Items)
                setOrderNumber(orderData.order.OrderNumber)
                setOrderDate(orderData.order.OrderDate)
                setOrderTotal(orderData.order.TotalPrice)
                setOrderPayment(orderData.payment)
                setOrderShipping(orderData.order.Shipping.Address.split(", "))
                setOrderShippingName(orderData.order.Shipping.Name.split(", "))
                setOrderLoading(false)
            } 
            else {
                console.log(62)
                // If user has the URL link for the individual order, and tries to go to it directly, then user will be redirected to homepage and nav bar shopping badge icon will be updated
                grabTotalCartQuantity(0) // update shopping badge icon
                setOrderLoading(false) // need to set it to false in order for the condition, else if(redirect), to be hit
                return setRedirect(true)
            }
        }
        
        getOrder();

        return function cleanUp () {
            abortController.abort()
        }

    }, [loggedIn()]) // when we click log out, the loggedIn() in dependency array will allow for redirecting

    if(orderLoading) {
        return <></>
    } else if (redirect) {
        return <Redirect to="/"></Redirect>
    }else {
        return (
            <div id="profile-order-complete-container">
                <div id="order-complete-details-shipping-container">
                    <div id="order-complete-details-container">
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