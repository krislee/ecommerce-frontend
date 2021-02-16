import React, {useState} from 'react'
import {Link, Redirect} from 'react-router-dom';
// import Button from '../components/Button'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'react-bootstrap'

function NavBar () {
    const [redirect, setRedirect] = useState(false)

    const handleLogout = () => {
        localStorage.clear();
        setRedirect(true)
    }
    if(redirect) {
        return <Redirect to='/'></Redirect>
    } 

    return (
        <div className="navbar">
            <Link to="/">
                <div className="home-container">
                <FontAwesomeIcon className="home" icon={faHome}/>
                {/* <div className="home-name">Ele-Commerce</div> */}
                </div>
            </Link>
            <div className="cart-profile-container">
            <Link to="/cart">
                <FontAwesomeIcon className="cart-icon" icon={faShoppingCart}/>
            </Link>
            {localStorage.getItem('token') ? 
            <Dropdown>
            <Dropdown.Toggle>
            {localStorage.getItem('token') ? 
                <FontAwesomeIcon className="user-icon" icon={faUser}/>
            : null}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu">
                <Dropdown.Item href="/profile">Account Settings</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown> : 
            <>
            <div className="login-button-container">
                <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                    Login
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item href="/login/buyer">Buyer</Dropdown.Item>
                    <Dropdown.Item href="/login/seller">Seller</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="login-button-container">
                <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                    Register
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item href="/register/buyer">Buyer</Dropdown.Item>
                    <Dropdown.Item href="/register/seller">Seller</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
            </div>
            </>
            }
            </div>
        </div>
    )
    
}

export default NavBar