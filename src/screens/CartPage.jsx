import React, {useEffect, useState} from 'react'
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
// import axios from 'axios';
// import { getCart } from '../services/url'

function CartPage ({url}) {

    const [items, setItems] = useState([]);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        async function getCartItems() {
            // let resp = await fetch(`http://localhost:3001/buyer/cart`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // });
            // const data = await resp.json();
            // console.log(data);
            // setItems(data.cart);
            // setPrice(data.totalPrice)

            // let resp = await fetch(`https://elecommerce.herokuapp.com/buyer/cart`, {
            let resp = await fetch(`https://123testing.netlify.app/.netlify/functions/server`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await resp.json();
            console.log(data);
            setItems(data.cart);
            // console.log(items)
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
    },[])

    // const setItemsFunction = async (data) => {
    //     console.log(data)
    //     setItems(data)
    //     console.log(items)
    // }


    return (
        <>
            <NavBar />
            <div className="cart">
                {items === [] || items === undefined ? <div className="noItems">No Items...</div>: 
                <div>{items.map(item => [
                    <div>
                        <div>{item.Name}</div>
                        <div>{item.Quantity}</div>
                        <div>{price}</div>
                    </div>
                ])}</div>}
            </div>
        </>
    )
}

export default CartPage;