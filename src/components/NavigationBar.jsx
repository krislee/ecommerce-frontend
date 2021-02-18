import React, {useState, useEffect} from 'react'
import {Link, Redirect} from 'react-router-dom';
// import Button from '../components/Button'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'react-bootstrap'
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);


function NavBar ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const [redirect, setRedirect] = useState(false)
    // const [loggedOutByClicking, setLoggedOutByClicking] = useState(false)

    const handleLogout = () => {
        localStorage.clear();
        // setLoggedOutByClicking(true)
        grabTotalCartQuantity(0)
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
               
                <IconButton aria-label="cart">
                    <StyledBadge badgeContent={totalCartQuantity} color="secondary">
                        {/* <ShoppingCartIcon /> */}
                         <FontAwesomeIcon className="cart-icon" icon={faShoppingCart}/>
                    </StyledBadge>
                </IconButton>
            </Link>
            {localStorage.getItem('token') ? 
            <Dropdown>
            <Dropdown.Toggle>
            {localStorage.getItem('token') ? 
                <FontAwesomeIcon className="user-icon" icon={faUser}/>
            : null}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu">
                <Dropdown.Item href="/profile/setting">Account Settings</Dropdown.Item>
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