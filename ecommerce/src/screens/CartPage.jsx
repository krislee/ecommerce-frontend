import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import axios from 'axios';

function CartPage ({url}) {

    useEffect(() => {
        async function getCartItems() {
            const resp = await fetch(`http://localhost:3001/buyer/cart`);
            const data = await resp.json();
            console.log(data);

            // axios.defaults.withCredentials = true;
            // axios.get('http://localhost:3001/buyer/cart', {
            //     headers: {withCredentials:true}
            // });

            // axios('http://localhost:3001/buyer/cart', {
            //     method: "get",
            //     withCredentials: true
            // })
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