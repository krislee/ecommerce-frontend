import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import CartItemPage from './CartItemPage'

function CartPage ({ backend, loggedIn }) {

    const [cartLoading, setCartLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [updatedItem, setUpdatedItem] = useState(null)
    const [cartQuantity, setCartQuantity] = useState([])
    // const [token, setToken] = useState('');
    const [data, setData] = useState('');
    const [totalPrice, setTotalPrice] = useState(0)

    const grabItems = (items) => setItems(items)
    const grabTotalPrice = (totalPrice) => setTotalPrice(totalPrice)

    useEffect(() => {
        async function getCartItems() {
            if(loggedIn()){
                console.log(loggedIn())
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                if(typeof cartItemsData.cart !== 'string') {
                    setItems(cartItemsData.cart.Items);
                    setTotalPrice(cartItemsData.totalCartPrice)
                } else {
                    setData(cartItemsData);
                }
                setCartLoading(false)
            } else {
                console.log("guest")
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData);
                if (cartItemsData.message)  {
                    console.log(46)
                    setData(cartItemsData);
                    setCartLoading(false)
                } else {
                    // Update items state to store the list of items
                    setItems(cartItemsData.cart)
                    setTotalPrice(cartItemsData.totalCartPrice)
                    setCartLoading(false)
                }
            }
        };
        getCartItems();
    },[])

   


    if(cartLoading) {
        console.log(123)
        return <></>
    } else if(data.message || data.cart || items.length === 0) {
        console.log(126)
        return (
            <>
            <NavBar />
            <div className="noItems">No Items...</div>
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

