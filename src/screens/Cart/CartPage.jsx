import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../../styles/CartPage.css'
import NavBar from '../../components/NavigationBar'
import Footer from '../../components/Footer'
import CartItemPage from './CartItemPage'
import axios from 'axios';

function CartPage ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {

    const [cartLoading, setCartLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [emptyCart, setEmptyCart] = useState('');
    const [totalPrice, setTotalPrice] = useState(0)

    const grabItems = (items) => setItems(items)
    const grabTotalPrice = (totalPrice) => setTotalPrice(totalPrice)

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        async function getCartItems() {
            if(loggedIn()){
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                if(typeof cartItemsData.cart == 'string') {
                    // If there are no items in the cart when we first load the cart page, update data property to store {cart: "No cart available"}
                    setEmptyCart(cartItemsData);
                    grabTotalCartQuantity(0)
                } else {
                    console.log(34)
                    setItems(cartItemsData.cart.Items);
                    setTotalPrice(cartItemsData.cart.TotalCartPrice)
                    grabTotalCartQuantity(cartItemsData.cart.TotalItems)
                }
                setCartLoading(false)
            } else {
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: signal
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData);
                if (typeof cartItemsData.cart == "string")  {
                    console.log(48)
                    // If there are no items in the cart when we first load the cart page, update data property to store {cart: 'No items in cart'}
                    setEmptyCart(cartItemsData);
                    grabTotalCartQuantity(0)
                } else {
                    console.log(52)
                    // Update items state to store the list of items
                    setItems(cartItemsData.cart)
                    setTotalPrice(cartItemsData.totalCartPrice)
                    grabTotalCartQuantity(cartItemsData.totalItems)
                }
                setCartLoading(false)
            }
        };
        getCartItems();
        return function cleanUp () {
            abortController.abort()
        }
        
    },[])

   


    if(cartLoading) {
        return <></>
    } else if(emptyCart.cart || items.length === 0) {
        return (
            <>
            {/* <NavBar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} backend={backend} loggedIn={loggedIn}/> */}
            <h2 className="noItems">No Items...</h2>
            </>
        )
    } else if(items.length >0) {
        return (
            <>
            <div className="cart-page-container">
                {/* <NavBar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity}/> */}
                <div className="cart">
                    <div className="cart-items">
                        {items.map((item, index) => { return <CartItemPage backend={backend} loggedIn={loggedIn} key={index} id={item.ItemId} name={item.Name} quantity={item.Quantity} totalPrice={item.TotalPrice} grabItems={grabItems} grabTotalPrice={grabTotalPrice} grabTotalCartQuantity={grabTotalCartQuantity} /> })}
                        <p><b>Total Price: ${totalPrice}</b></p>
                    </div>
                        
                    <Link to="/checkout">
                        <button>Checkout</button>
                    </Link>
                </div>
               
            </div>
            <Footer />
            </>
        )
    }
}

export default CartPage;

