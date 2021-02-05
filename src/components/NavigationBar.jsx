import React from 'react'
import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import '../styles/BuyerLogin.css'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'

function NavBar () {

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
        // return false;
    }

    let username = localStorage.getItem('username');
    

    return (
        <div className="navbar">
            <Link to="/">
                <div className="home-container">
                <FontAwesomeIcon className="home" icon={faHome}/>
                {/* <div className="home-name">Ele-Commerce</div> */}
                </div>
            </Link>
            <div className="cart-profile-container">
            {localStorage.getItem('loggedIn') ? 
            <Link to="/profile">
            <div className='column user-profile'>
                <FontAwesomeIcon className="user-icon" icon={faUser}/>
                <div>{username}</div>
            </div>
            </Link>: null}
            <Link to="/cart">
                <FontAwesomeIcon className="cart-icon" icon={faShoppingCart}/>
            </Link>
            {localStorage.getItem('loggedIn') ? <div className="logout-button" onClick={() => handleLogout()}>Logout</div> : 
            <div className="login-button-container">
                <Link to='/buyer'>
                <div className="login-button">Buyer</div>
                </Link>
                <Link to='/seller'>
                <div className="login-button">Seller</div>
                </Link>
            </div>}
            </div>
        </div>
    )
}

export default NavBar