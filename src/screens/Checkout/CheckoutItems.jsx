import React, {useEffect, useState} from 'react'
import { Redirect } from 'react-router-dom';
import PaymentMethod from './PaymentMethod';

export default function CheckoutItems({ backend, loggedIn, showItems, grabShowItems, grabShowShipping, grabShowButtons, grabReadOnly, grabTotalCartQuantity, shipping, prevLoggedIn, grabPrevLoggedIn, paymentMethod, grabRedirect }) {
    
    const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(true)
    const [items, setItems] = useState([]);
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

    if(checkoutItemsLoading) {
        return <></>
    } else if(redirect) {
        return <Redirect to='/cart'></Redirect>
    } else {
        return (
            <>
            <h2>Your Cart</h2>
                <>
                <div style={{display: 'flex'}}>
                    {items.map((item, index) => { return(
                        <div key={index}>{item.Name}</div>
                    )})}
                
                </div>
                {showItems && <button onClick={handleNext}>Next</button>}
                </>
            <button onClick={()=> {
                if((prevLoggedIn&& !loggedIn())) return grabTotalCartQuantity(0)
                else setRedirect(true)
            }}>Edit</button>
            </>
        )
    }
};

