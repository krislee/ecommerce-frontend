import React from 'react'
import { Link, useLocation } from 'react-router-dom';
// import Button from '../components/Button'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'react-bootstrap'
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { v4 as uuidv4 } from 'uuid';

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);


function NavBar ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {

    const location = useLocation()
    
    const handleLogout = () => {
        localStorage.clear();
        grabTotalCartQuantity()
    }

    return (
        <div className="navbar">
            <Link to={{
                pathname: "/",
                key: uuidv4(),
                state: {prevPath: location.pathname }
            }}>
                <div className="home-container" >
                    <FontAwesomeIcon className="home" icon={faHome}/>
                </div>
            </Link>
            <div className="cart-profile-container">
            {/*  reload the cart page in case user clears local storage and then re-clicks on the cart icon */}
            <Link to={{
                pathname: "/cart",
                key: uuidv4(),
                state: { prevPath: location.pathname }
            }} > 
                <IconButton aria-label="cart" onClick={() => {
                    if(location.pathname === '/cart') return grabTotalCartQuantity(0) // if logged in user cleared local storage, and is already on the cart page, we want to reload the page and update nav bar
                }}>
                    <StyledBadge badgeContent={totalCartQuantity} color="secondary">
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
                <Dropdown.Item href="/profile/setting" onClick={() => window.location.reload()}>Account Settings</Dropdown.Item>
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