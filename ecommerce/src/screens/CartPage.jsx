import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import axios from 'axios';
import { getCart } from '../services/url'

function CartPage ({url}) {

    const [items, setItems] = useState([]);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        async function getCartItems() {
            let resp = await getCart(`http://localhost:3001/buyer/cart`);
            console.log(resp);
            setItems(resp.cart);
            console.log(items)
            // await setItemsFunction(resp.cart);
            // console.log(items)
            // console.log(items);
            // console.log(items)

            // axios.defaults.withCredentials = true;
            // axios.get('http://localhost:3001/buyer/cart', {
            //     headers: {withCredentials:true}
            // });


            // const resp = await axios('http://localhost:3001/buyer/cart', {
            //     method: "get",
            //     withCredentials: true
            // })
            // console.log(resp.data);
            // setItems(resp.data.cart)
            // console.log(items)
        };
        getCartItems();
        // const test = async () => {
        //     const abc = await getCartItems();
        //     setItems(abc.cart)
        //     console.log(items)
        // }
        // test();
    },[setItems])

    // const setItemsFunction = async (data) => {
    //     console.log(data)
    //     setItems(data)
    //     console.log(items)
    // }

    const itemsInCart = items.map(item => {
        <div>Hello</div>
    })

    return (
        <div className="cart">
            {itemsInCart}
        </div>
    )
}

export default CartPage;