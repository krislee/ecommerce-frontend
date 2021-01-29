import React from 'react'
// import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function Checkout ({backend, cartItems}) {
    return (
        <div className="buyer-login">
            <div>Checkout Screen</div>
            <button onClick={() => console.log(cartItems)}>Cart Items</button>
        </div>
    )
}

export default Checkout