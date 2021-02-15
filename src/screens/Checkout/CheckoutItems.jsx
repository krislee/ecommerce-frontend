import React, {useEffect, useState} from 'react'

export default function CheckoutItems({ backend, loggedIn, showItems, grabShowItems, grabShowShipping, grabShowButtons, grabShowPayment, grabReadOnly}) {
    const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        const getCheckoutItems = async() => {
            if(loggedIn()){
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                
                setItems(cartItemsData.cart.Items);
                setCheckoutItemsLoading(false)
            } else {
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData);
                
                // Update items state to store the list of items
                setItems(cartItemsData.cart)
                setCheckoutItemsLoading(false)
            }
        }
        getCheckoutItems();
    }, [])

    const handleNext = () => {
        grabShowItems(false) //hide the Next button in CheckoutItems
        grabShowShipping(true) // show the Shipping details or form
        grabShowButtons(true) // show the Add New, Edit, and Saved Addresses buttons for the already saved Shipping details
    }

    if(checkoutItemsLoading) {
        console.log(123)
        return <></>
    } else {
        return (
            <>
            <h2>Your Cart</h2>
            {/* {showItems && ( */}
                <>
                <div style={{display: 'flex'}}>
                    {items.map((item, index) => { return(
                        <div key={index}>{item.Name}</div>
                    )})}
                
                </div>
                {showItems && <button onClick={handleNext}>Next</button>}
                </>
            {/* )} */}
            <button onClick={()=> setRedirect(true)}>Edit</button>
            </>
        )
    }
};

