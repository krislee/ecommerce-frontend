import React from 'react';
import '../../styles/Button.css'

function AddCartButton ({ name, id, loggedIn, backend, quantity, grabTotalCartQuantity }) {

    const addItem = async () => {

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
            const addItemData = await addItemResponse.json()
            console.log(addItemData)
            grabTotalCartQuantity(addItemData.cart.TotalQuantity)
        } else{ 
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
            const addItemData = await addItemResponse.json()
            console.log(addItemData)
            grabTotalCartQuantity(addItemData.totalQuantity)
        }
    }

    return (
        <div id={id} className="button">
            <button onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton