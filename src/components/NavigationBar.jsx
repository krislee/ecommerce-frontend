import React from 'react'
import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import '../styles/BuyerLogin.css'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

function NavBar () {

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
        // return false;
    }



    return (
        <div className="navbar">
            <Link to="/">
                <div className="link-home">Homepage</div>
            </Link>
            {localStorage.getItem('loggedIn') ? <button onClick={() => handleLogout()}>Log Out</button> : null}
            <Link to="/cart">
                <FontAwesomeIcon className="icon" icon={faShoppingCart}/>
            </Link>
        </div>
    )
}

export default NavBar