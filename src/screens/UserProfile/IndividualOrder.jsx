import React, { useEffect, useState } from 'react';
import {Redirect, useLocation, useParams, Link} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ConvertDate from './ConvertDate'

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
});
  
  
export default function IndividualOrder({ backend, loggedIn, grabTotalCartQuantity }) {
    const location = useLocation()

    const classes = useStyles();

    const [orderLoading, setOrderLoading] = useState(true)
    const [order, setOrder] = useState({})
    const [orderItems, setOrderItems] = useState([])
    const [orderPayment, setOrderPayment] = useState({})
    const [orderShipping, setOrderShipping] = useState([])
    const [orderShippingName, setOrderShippingName] = useState([])
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
            <>
            <h4>Order #: {order.OrderNumber}</h4>
            <h6>Placed on {new Date(order.OrderDate).toDateString()}</h6>
            <div id='items'>
                <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">SubTotal</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orderItems.map((item, index) => (
                    <TableRow key={index}>                
                        <TableCell component="th" scope="row">
                            <Link className="homepage-items" to={{
                                pathname:`/item/${item.Name}`,
                                search: `id=${item.ItemId}`}} >
                            {item.Brand} {item.Name}
                            </Link>
                        </TableCell>
                        <TableCell align="right">{item.Quantity}</TableCell>
                        <TableCell align="right">{item.TotalPrice}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                </TableContainer>   
            </div>  
            <div style={{display: 'flex', justifyContent: 'space-around' }}>  
                <div>
                    <h4>Payment Summary</h4>
                    <div style={{display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p>{orderPayment.brand[0].toUpperCase()}{orderPayment.brand.slice(1)} *** {orderPayment.last4} </p>
                        </div>
                        <div>
                            <p>{orderPayment.billingDetails.name.split(", ")[0]} {orderPayment.billingDetails.name.split(", ")[1]}</p>
                            <p>{orderPayment.billingDetails.address.line1}</p>
                            <p>{orderPayment.billingDetails.address.line2 === "null" || orderPayment.billingDetails.address.line2 === "undefined" ? "" : orderPayment.billingDetails.address.line2}</p>
                            <p>{orderPayment.billingDetails.address.city}, {orderPayment.billingDetails.address.state} {orderPayment.billingDetails.address.postalCode}</p>
                        </div> 
                    </div>
                </div>
                <div>
                    <h4>Delivered to</h4>
                    <p><b>{orderShippingName[0]} {orderShippingName[1]}</b></p>
                    <p>{orderShipping[0]}</p>
                    <p>{orderShipping[1] === "null" || orderShipping[1] === "undefined" ? "" : orderShipping[1]}</p>
                    <p>{orderShipping[2]}, {orderShipping[3]} {orderShipping[4]}</p>
                </div>
            </div>
            </>      
        )
    }
}