import React, { Component } from 'react';
import '../styles/Button.css'

function AddCartButton ({ name, id, url, quantity }) {

    const addItem = async () => {
        const resp = await fetch(`${url}/buyer/electronic/cart/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Quantity: quantity
            })
        });
        const data = await resp.json()
        console.log(data)
    }

    return (
        <div id={id} className="button">
            <button onClick={() => addItem()}>{name}</button>
        </div>
    )
}


export default AddCartButton