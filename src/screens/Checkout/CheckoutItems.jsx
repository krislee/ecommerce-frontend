import React, {useEffect, useState} from 'react'
import { Redirect } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { makeStyles } from '@material-ui/core/styles';
import '../../styles/Checkout/CheckoutItem.css'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

// Table Style
const useStyles = makeStyles({
    table: {
      minWidth: '100%',
    },
});

export default function CheckoutItems({ backend, loggedIn, showItems, grabShowItems, grabShowShipping, grabShowButtons, grabReadOnly, grabTotalCartQuantity, shipping, prevLoggedIn, grabPrevLoggedIn, paymentMethod, grabRedirect }) {
    
    const classes = useStyles() // for table style

    const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0)
    const [redirect, setRedirect] = useState(false)
    // const [checkoutItemPrevLoggedIn, setCheckoutItemPrevLoggedIn] = useState(loggedIn())

    useEffect(() => {

        const abortController = new AbortController()
        const signal = abortController.signal

        const getCheckoutItems = async() => {
            if(loggedIn()){
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                setItems(cartItemsData.cart.Items);
                setSubtotal(cartItemsData.cart.TotalCartPrice)
                grabPrevLoggedIn(loggedIn())
                setCheckoutItemsLoading(false)
            } else {
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: signal
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData);
                
                // Update items state to store the list of items
                setItems(cartItemsData.cart)
                setSubtotal(cartItemsData.cart.TotalCartPrice) // update the subtotal state to get the subtotal price
                setCheckoutItemsLoading(false)
            }
        }
        
        getCheckoutItems();

        return function cleanUp () {
            abortController.abort()
        }

    }, [])

    const handleNext = async () => {
        // logged in user cleared local storage before clicking Next button, redirect and update nav bar
        if(prevLoggedIn && !loggedIn()) {
            return grabTotalCartQuantity(0) // triggers Checkout useEffect and App useEffect
        } else if(!loggedIn()) { // check if guest user cleared cookies before clicking Next button; if so, redirect and update nav bar
            const cartResponse = await fetch(`${backend}/buyer/cart`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const cartResponseData = await cartResponse.json()
            console.log(cartResponseData);
            if(cartResponseData.cart === "No items in cart") {
                console.log(66)
                grabTotalCartQuantity(0)
                setRedirect(true)
                return
            }
        }
        grabShowItems(false) //hide the Next button in CheckoutItems
        grabReadOnly(true)
        grabShowButtons(true) // show the Add New, Edit, and Saved Addresses buttons for the already saved Shipping
        grabShowShipping(true) // show the Shipping details or form
    }

    const editCheckoutCart = () => {
        if((prevLoggedIn&& !loggedIn())) return grabTotalCartQuantity(0)
        else setRedirect(true)
    }

    if(checkoutItemsLoading) {
        return <></>
    } else if(redirect) {
        return <Redirect to='/cart'></Redirect>
    } else {
        return (
            <div className="checkout-items-container">
            <div className="Heading-Edit">
                <h2>Your Cart</h2>
                <p onClick={editCheckoutCart}><u>Edit</u></p>
            </div>
            <div className="checkout-items-sub-container">
                {items.map((item) => { return(
                    <div key={item._id} className="checkout-items-individual-container">
                        <div className="checkout-item-img-container">
                            <img src={item.Image}></img>
                        </div>
                        <div className="checkout-item-name">
                            <b>{item.Name.length > 20 ? item.Name.substring(0, 20) + "..." : item.Name}</b>
                        </div>
                    </div>
                )})}
            
            </div>

            <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableBody>
                            <TableRow key={"subtotal"}>
                                <TableCell component="th" scope="row">
                                    Subtotal
                                </TableCell>
                                <TableCell align="right">{subtotal}</TableCell>
                            </TableRow>

                            <TableRow key={"shipping-fee"}>
                                <TableCell component="th" scope="row">
                                    Shipping Fee
                                </TableCell>
                                <TableCell align="right">$0.00</TableCell>
                            </TableRow>

                            <TableRow key={"tax"}>
                                <TableCell component="th" scope="row"> Taxes </TableCell>
                                <TableCell align="right">$0.00</TableCell>
                            </TableRow>
                            
                            <TableRow key={"total"}>
                                <TableCell component="th" scope="row">Total</TableCell>
                                <TableCell align="right">{subtotal}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* {showItems && <button onClick={handleNext}>Next</button>} */}
{/*          
            <button onClick={()=> {
                if((prevLoggedIn&& !loggedIn())) return grabTotalCartQuantity(0)
                else setRedirect(true)
            }}>Edit</button> */}
            {/* <FontAwesomeIcon className="home" icon={faPencilAlt} size={20} onClick={()=> {
                    if((prevLoggedIn&& !loggedIn())) return grabTotalCartQuantity(0)
                    else setRedirect(true)
                }}/> */}
            </div>
        )
    }
};

