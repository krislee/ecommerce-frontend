import React from 'react';
import '../../styles/Button.css'

function AddCartButton ({ name, id, loggedIn, backend, quantity, grabHandleUpToTwelve, grabNotANumber, grabTotalCartQuantity }) {

    const addItem = async (e) => {
        e.preventDefault();
        console.log(quantity);
        if (quantity === "") {
            grabHandleUpToTwelve(false);
            grabNotANumber(true);
        } else if (quantity > 12) {
            grabNotANumber(false);
            grabHandleUpToTwelve(true);
        } else {
            grabHandleUpToTwelve(false);
            grabNotANumber(false);
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
                grabTotalCartQuantity(addItemData.cart.TotalItems)
            } else { 
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
        }
    }

    return (
        <div id={id} className="button">
            <button onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton