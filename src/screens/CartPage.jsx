import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'
import Footer from '../components/Footer'


function CartPage ({ backend, loggedIn }) {

    const [cartLoading, setCartLoading] = useState(true)
    const [items, setItems] = useState([]);
    const [updatedItem, setUpdatedItem] = useState(null)
    const [cartQuantity, setCartQuantity] = useState([])
    // const [token, setToken] = useState('');
    const [data, setData] = useState('');
    // const [redirect, setRedirect] = useState(false)

    
    useEffect(() => {
        async function getCartItems() {
            if(loggedIn()){
                const cartItemsResponse = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const cartItemsData = await cartItemsResponse.json();
                console.log(cartItemsData)
                if(typeof cartItemsData.cart !== 'string') {
                    setItems(cartItemsData.cart.Items);
                    setCartLoading(false)
                } 
                // setData(cartItemsData);
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
                } else {
                    // Update items state to store the list of items
                    setItems(cartItemsData.cart);
                    setCartLoading(false)
                }
            }
        };
        getCartItems();
    },[])

    const handleCartQuantity = (event) => {
       const {id, value} = event.target
       console.log(items)
       const itemIndex = items.findIndex(item => item.ItemId === id)

       if(itemIndex !== -1) {
           items[itemIndex].Quantity = value
           setItems(items)
       }
    }

    const handleUpdateCartItem = async(event) => {
        if(loggedIn()) {
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    Quantity: cartQuantity
                })
            })
            const updateCartData = await updateCartResponse.json()
            console.log(updateCartData)
            setUpdatedItem(updateCartData)
        } else {
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const updateCartData = await updateCartResponse.json()
            console.log(updateCartData)
            setUpdatedItem(updateCartData)
        }
    }

    const handleDeleteCartItem = async(event) => {
        if(loggedIn()) {
            console.log("deleting logged in")
            const deleteCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const deleteCartData = await deleteCartResponse.json()
            console.log(deleteCartData)
            setItems(deleteCartData.Items)
        } else {
            console.log("deleting guest")
            const deleteCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const deleteCartData = await deleteCartResponse.json()
            console.log(deleteCartData)
            setItems(deleteCartData)
        }
    }

    if(cartLoading) {
        console.log(123)
        return <></>
    } else if(data.message || items.length === 0) {
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
            <div className="cart-page-container">
                <NavBar />
                <div className="cart">
                    <div className="cart-items">{items.map((item, index) => [
                        
                        <div key={item.ItemId}>
                            <div>{item.Name}</div>
                            <input type="number" id={item.ItemId} value={item.Quantity} onChange={handleCartQuantity}/>
                            <div>{item.TotalPrice}</div>
                            <button id={item.ItemId} onClick={handleUpdateCartItem}>Update</button>
                            <button id={item.ItemId} onClick={handleDeleteCartItem}>Delete</button>
                        </div>
                    ])}</div>
                    {/* {renderRedirect()} */}
                    <Link to="/checkout">
                    <button>Checkout</button>
                    </Link>
                </div>
                <Footer />
                {/* <button onClick={checkout}>Checkout</button> */}
            </div>
        )
    }
}

export default CartPage;