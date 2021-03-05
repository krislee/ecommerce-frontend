import React from 'react'
import {Link} from 'react-router-dom';
import Login from '../../components/LoginRegister/Login'
import Footer from '../../components/Footer'
import '../../styles/LoginRegister/Login.css'

function BuyerLogin ({backend, loggedIn, grabTotalCartQuantity }) {
    return (
        <>
        <div className="login-container">
            <div id="login-heading-form-container">
                <h2 id="login-heading">Welcome Back!</h2>
                <Login backend={backend} loggedIn={loggedIn} buyer={true} grabTotalCartQuantity={grabTotalCartQuantity}/>
            </div>
            <div id="login-image-container">
                <img src={require("../../styles/LoginRegister/images/login.png")} alt="login-macbook-pro" />
            </div>
        </div>
        <Footer />
        </>
    )
}

export default BuyerLogin