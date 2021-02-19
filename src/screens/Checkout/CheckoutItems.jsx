import React, {useEffect, useState} from 'react'
import { Redirect } from 'react-router-dom';

export default function CheckoutItems({ backend, loggedIn, showItems, grabShowItems, grabShowShipping, grabShowButtons, grabReadOnly }) {
    const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [redirect, setRedirect] = useState(false)

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

    const handleNext = () => {
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
            <button onClick={()=> setRedirect(true)}>Edit</button>
            </>
        )
    }
};

