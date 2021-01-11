import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'

function CartPage ({url}) {

    useEffect(() => {
        async function getCartItems() {
            const resp = await fetch(`http://localhost:3001/buyer/cart`);
            const data = await resp.json();
            console.log(data);
        }
        getCartItems();
    },[])


    return (
        <div className="cart">
            <div>Hello</div>
        </div>
    )
}

export default CartPage;