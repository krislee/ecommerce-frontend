import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../../styles/CartPage.css'
import NavBar from '../../components/NavigationBar'
import Footer from '../../components/Footer'
import CartItemPage from './CartItemPage'

function CartPage ({ backend, loggedIn }) {

    const [cartLoading, setCartLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [emptyCart, setEmptyCart] = useState('');
    const [totalPrice, setTotalPrice] = useState(0)

    const grabItems = (items) => setItems(items)
    const grabTotalPrice = (totalPrice) => setTotalPrice(totalPrice)

    useEffect(() => {
        async function getCartItems() {
            if(loggedIn()){
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                if(typeof cartItemsData.cart == 'string') {
                    // If there are no items in the cart when we first load the cart page, update data property to store {cart: "No cart available"}
                    setEmptyCart(cartItemsData);
                } else {
                    setItems(cartItemsData.cart.Items);
                    setTotalPrice(cartItemsData.totalCartPrice)
                }
                setCartLoading(false)
            } else {
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData);
                if (typeof cartItemsData.cart == "string")  {
                    console.log(48)
                    // If there are no items in the cart when we first load the cart page, update data property to store {cart: 'No items in cart'}
                    setEmptyCart(cartItemsData);
                } else {
                    console.log(52)
                    // Update items state to store the list of items
                    setItems(cartItemsData.cart)
                    setTotalPrice(cartItemsData.totalCartPrice)
                }
                setCartLoading(false)
            }
        };
        getCartItems();
    },[])

   


    if(cartLoading) {
        console.log(123)
        return <></>
    } else if(emptyCart.cart || items.length === 0) {
        console.log(126)
        return (
            <>
            <NavBar />
            <h2 className="noItems">No Items...</h2>
            </>
        )
    }
    else if(items.length >0) {
        console.log(135)
        return (
            <>
            <div className="cart-page-container">
                <NavBar />
                <div className="cart">
                    <div className="cart-items">
                        {items.map((item, index) => { return <CartItemPage backend={backend} loggedIn={loggedIn} index={index} id={item.ItemId} name={item.Name} quantity={item.Quantity} totalPrice={item.TotalPrice} grabItems={grabItems} grabTotalPrice={grabTotalPrice} /> })}
                        <p><b>Total Price: ${totalPrice}</b></p>
                    </div>
                        
                
                    {/* {renderRedirect()} */}
                    <Link to="/checkout">
                    <button>Checkout</button>
                    </Link>
                </div>
                {/* <button onClick={checkout}>Checkout</button> */}
            </div>
            <Footer />
            </>
        )
    }
}

export default CartPage;

