import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../styles/BuyerLogin.css'
import '../styles/CartPage.css'
import NavBar from '../components/NavigationBar'


function CartPage ({ backend }) {

    const [items, setItems] = useState([]);
    // const [token, setToken] = useState('');
    const [cartID, setCartID] = useState('');
    const [data, setData] = useState('');
    // const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        async function getCartItems() {
            if(localStorage.getItem('token')){
                let resp = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const data = await resp.json();
                console.log(data);
                setData(data);
                setItems(data.cart.Items);
                setCartID(data.cart._id);
                console.log(cartID)
                console.log(30, "items: ", items)
            } else {
                let resp = await fetch(`${backend}/buyer/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await resp.json();
                if (!data.message)  {
                    console.log(data);
                    setItems(data.cart);
                    setCartID(data.cart._id);
                    console.log(cartID)
                    console.log(42, "items: ", items)
                }
            }
        };
        getCartItems();
    },[backend, cartID, items])

    return (
        <>
            <NavBar />
            <div className="cart">
                {typeof data.cart === 'string' || items.length === 0? <div className="noItems">No Items...</div>: 
                <>
                <div className="cart-items">{items.map(item => [
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