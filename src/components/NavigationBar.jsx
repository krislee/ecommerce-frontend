import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import Button from '../components/Button'
// import '../styles/BuyerLogin.css'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'

function NavBar () {

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
        // return false;
    }

    const [username, setUsername] = useState(localStorage.getItem('username'));
    

    return (
        <div className="navbar">
            <Link to="/">
                <div className="link-home">Homepage</div>
            </Link>
            {localStorage.getItem('loggedIn') ? 
            <>
            <Button onClick={() => handleLogout()} name={'Logout'} /> 
            <Link to="/profile">
            <div className='row'>
                <FontAwesomeIcon className="user-icon" icon={faUser}/>
                <div>{username}</div>
            </div>
            </Link>
            </>: null}
            <Link to="/cart">
                <FontAwesomeIcon className="cart-icon" icon={faShoppingCart}/>
            </Link>
        </div>
    )
}

export default NavBar