import React from 'react';
import '../../styles/Button.css'

function AddCartButton ({ name, id, loggedIn, backend, quantity, grabHandleUpToTwelve, grabNotANumber, grabTotalCartQuantity, prevLoggedIn }) {

    const addItem = async (e) => {
        e.preventDefault();

        // console.log(quantity);
        // if (quantity === "") {
        //     grabHandleUpToTwelve(false);
        //     grabNotANumber(true);
        // } else if (quantity > 12) {
        //     grabNotANumber(false);
        //     grabHandleUpToTwelve(true);
        // } else {
        //     grabHandleUpToTwelve(false);
        //     grabNotANumber(false);
        
            if(loggedIn()) {
                const addItemResponse = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        Quantity: quantity
                    })
                });
                const addItemData = await addItemResponse.json();
                console.log(addItemData)
                // const selectedItem = addItemData.cart.Items.filter(item => item.ItemId === id)
                grabTotalCartQuantity(addItemData.cart.TotalItems)
            } else { 
                // If user was previously logged in as indicated by prevLoggedIn state (prevLoggedIn state value is retrieved from local storage once item page is loaded), but then clears local storage after item page is loaded as checked by loggedIn(), then we will reload the page.
                if(prevLoggedIn && !loggedIn())return window.location.href = window.location.href

                // If user was always logged out, then run the following:
                const addItemResponse = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // always send the cookies
                    body: JSON.stringify({
                        Quantity: quantity
                    })
                });
                const addItemData = await addItemResponse.json();
                console.log(addItemData);
                grabTotalCartQuantity(addItemData.totalItems)
            }
        // }
    }

    return (
        <div id={id} className="button">
            <button disabled={quantity > 12} onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton