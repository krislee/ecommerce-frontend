import React from 'react'
import {Link} from 'react-router-dom';
// import Button from '../components/Button'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'react-bootstrap'

function NavBar () {

    // const [test, setTest] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
        // return false;
    }

    // let username = localStorage.getItem('username');
    

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
            <div className="login-button-container">
                <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                    Login
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item href="/buyer">Buyer</Dropdown.Item>
                    <Dropdown.Item href="/seller">Seller</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
            </div>}
            </div>
        </div>
    )
}

export default NavBar