import React from 'react';
import '../styles/Button.css'
// import Cookies from 'js-cookie'

function AddCartButton ({ name, id, backend, quantity }) {

    const addItem = async () => {

        if(localStorage.getItem('loggedIn')) {
            const resp = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                credentials: 'include', // always send the cookies
                body: JSON.stringify({
                    Quantity: quantity
                })
            });
            const data = await resp.json()
            console.log(data)
            console.log(3, document.cookie)
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
            console.log(4, document.cookie)
        }
    }

    return (
        <div id={id} className="button">
            <button onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton