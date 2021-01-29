import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
// import { Redirect } from 'react-router-dom';
// import Cookies from 'js-cookie'

// import { getCart } from '../services/url'

function CartPage ({ backend }) {

    const [items, setItems] = useState([]);
    const [token, setToken] = useState('');
    const [cartID, setCartID] = useState('');
    // const [redirect, setRedirect] = useState(false)

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
        getCartItems();
        // console.log(localStorage.getItem('token'));
        // console.log(token);
    },[])

    // const handleCheckout = async () => {
    //     if (localStorage.getItem('token')) {
    //         console.log("logged in")
    //         console.log(56, `${cartID}`)
    //         console.log(60, token)
    //         const response = await fetch(`${backend}/order/payment-intent`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Idempotency-Key': `${cartID}`,
    //                 'Authorization': `${token}`
    //             }
    //         })
    //         const checkoutData = await response.json()
    //         console.log(checkoutData);
    //         setReturningCustomer(checkoutData.returningCustomer);
    //         setCustomer(checkoutData.customer);
    //         setPublicKey(checkoutData.publicKey);
    //         setClientSecret(checkoutData.clientSecret);
    //         setCheckoutData(checkoutData);
    //         // console.log(checkoutData);
    //         // grabItem(checkoutData);
    //         // if (checkoutData) {
    //         //     setRedirect(true)
    //         // }
    //     } else {
    //         if(token) {
    //             console.log("Cleared local storage")
    //         } else {
    //             console.log('I am not logged in')
    //         }
    //         // if
    //         // fetch('', {

    //         // })
    //     }
    // }

    // const renderRedirect = () => {
    //     if (redirect === true) {
    //         return <Redirect to="/checkout"/>
    //     }
    // }



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
                {/* {renderRedirect()} */}
                <Link to="/checkout">
                <button>Checkout</button>
                </Link>
                </>}
            </div>
            {/* <button onClick={checkout}>Checkout</button> */}
        </>
    )
}

export default CartPage;