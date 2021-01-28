import React, {useEffect, useState} from 'react'
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
// import Cookies from 'js-cookie'

// import { getCart } from '../services/url'

function CartPage ({ backend }) {

    const [items, setItems] = useState([]);
    // const [price, setPrice] = useState(0);
    const [token, setToken] = useState('');
    const [cartID, setCartID] = useState('');

    useEffect(() => {
        async function getCartItems() {
            if(localStorage.getItem('loggedIn')){
                let resp = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const data = await resp.json();
                console.log(data);
                setItems(data.cart.Items);
                setCartID(data.cart._id);
                console.log(cartID)
                console.log(30, "items: ", items)
            } else {
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
                setCartID(data.cart._id);
                console.log(cartID)
                console.log(42, "items: ", items)
            }
        };
        setToken(localStorage.getItem('token'));
        // console.log(localStorage.getItem('token'));
        // console.log(token);
        getCartItems();
    },[])

    const handleCheckout = async () => {
        if (localStorage.getItem('token')) {
            console.log("logged in")
            console.log(56, `${cartID}`)
            console.log(60, token)
            const response = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': `${cartID}`,
                    'Authorization': `${token}`
                }
            })
            const data = await response.json()
        } else {
            if(token) {
                console.log("Cleared local storage")
            } else {
                console.log('I am not logged in')
            }
            // if
            // fetch('', {

            // })
        }
    }

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
            {localStorage.getItem('loggedIn') ? 
            <>
                <NavBar />
            </>
             : <NavBar />}
            <div className="cart">
                {items === [] || items === undefined ? <div className="noItems">No Items...</div>: 
                <>
                <div>{items.map(item => [
                    <div key={item.ItemId}>
                        <div>{item.Name}</div>
                        <div>{item.Quantity}</div>
                        <div>{item.TotalPrice}</div>
                    </div>
                ])}</div>
                <button onClick={() => handleCheckout()}>Checkout</button>
                <button onClick={() => console.log(token)}>Token</button>
                </>}
            </div>
            {/* <button onClick={checkout}>Checkout</button> */}
        </>
    )
}

export default CartPage;