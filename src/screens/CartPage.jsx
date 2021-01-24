import React, {useEffect, useState} from 'react'
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
// import Cookies from 'js-cookie'

// import { getCart } from '../services/url'

function CartPage ({backend}) {

    const [items, setItems] = useState([]);
    // const [price, setPrice] = useState(0);

    useEffect(() => {
        async function getCartItems() {

            let resp = await fetch(`${backend}/buyer/cart`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await resp.json();
            console.log(data);
            setItems(data.cart);
        };
        getCartItems();
    },[backend])

    // const checkout = async() => {
    //     console.log(1, Cookies.get('idempotency'))

        
    //     if(!Cookies.get('idempotency')){
    //         Cookies.set('idempotency', data.idempotency)
    //     } 
    //     console.log(2, document.cookie)
    //     console.log(3, Cookies.get('idempotency'))
    //     const resp = await fetch(`http://localhost:3000/create-payment-intent`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Idempotency-Key': `${Cookies.get('idempotency')}`
    //         }
    //     })

    //     const data = resp.json()

    //     console.log("created payment intent: ", data)
    // }

    return (
        <>
            <NavBar />
            <div className="cart">
                {items === [] || items === undefined ? <div className="noItems">No Items...</div>: 
                <div>{items.map(item => [
                    <div key={item.ItemId}>
                        <div>{item.Name}</div>
                        <div>{item.Quantity}</div>
                        <div>{item.TotalPrice}</div>
                    </div>
                ])}</div>}
            </div>
            {/* <button onClick={checkout}>Checkout</button> */}
        </>
    )
}

export default CartPage;