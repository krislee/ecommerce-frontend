import React from 'react';
import '../../styles/Button.css'

function AddCartButton ({ name, id, loggedIn, backend, quantity }) {

    const addItem = async () => {

        if(loggedIn()) {
            const resp = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    Quantity: quantity
                })
            });
            const data = await resp.json()
            console.log(data)
        } else{ 
            const resp = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // always send the cookies
                body: JSON.stringify({
                    Quantity: quantity
                })
            });
            const data = await resp.json()
            console.log(data)
        }
    }

    return (
        <div id={id} className="button">
            <button onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton