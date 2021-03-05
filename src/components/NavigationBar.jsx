import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
// import Button from '../components/Button'
import '../styles/NavigationBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'react-bootstrap'
import Badge from '@material-ui/core/Badge';
import { withStyles, makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useResizeDetector } from 'react-resize-detector';

import { v4 as uuidv4 } from 'uuid';

// Nav Bar Shopping Cart Badge
const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);

// Nav Bar Swipe Drawer
const useStyles = makeStyles((theme) => ({
    list: {
        width: '50vw',
        [theme.breakpoints.down(450)]: {
            width: "80vw"
        }
    }
}));

function NavBar ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const location = useLocation()

    const handleLogout = () => {
        localStorage.clear();
        grabTotalCartQuantity()
    }

    const { width, height, ref } = useResizeDetector(); // returns the width and height of the window; 

    useEffect(() => {
        // console.log(54, width)
        if(width > 568) { // since the width returned from useResizeDetector() hook does not include the  padding of the .navbar element, which is 16px for left padding and 16px for right padding, we need to deduct 32px from 600px; so when the .navbar element is 568px in width, the .navbar element is actually 600px when we include the 32px of left and right padding combined
            return setHamburgerState({ ...hamburgerState, 'left': false}) // close the swipe drawer by setting 'left' to false when the window width is greater than 600px
        }
    }, [width]) // run the use effect everytime the width changes since we need to check if we need to close the swipe drawer 

    // Hamburger
    const classes = useStyles();
    const [hamburgerState, setHamburgerState] = useState({
        left: false,
        right: false,
        top: false,
        bottom: false
    });
    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setHamburgerState({ ...hamburgerState, [anchor]: open });
    };
    const list = (anchor) => (
        <div
            className={classes.list}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                <ListItem button >
                    <ListItemText primary= {<Link to="/shop/1">Shop All </Link>} />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button >
                    <ListItemText primary={localStorage.getItem('token') ? 
                    <Link to="/profile/setting">
                        <div>Account Setting</div>
                    </Link> 
                    : <Link to="/login/buyer">Login</Link>} />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button >
                    <ListItemText primary={localStorage.getItem('token') ? 
                    <div onClick={handleLogout}>Sign Out</div>
                    : <Link to="/register/buyer">Register</Link>} />
                </ListItem>
            </List>
        </div>
        
    );


    return (
        <div className="navbar" ref={ref} >
            <div id="navbar-hamburger"  >
                <Button onClick={toggleDrawer("left", true)}><MenuRoundedIcon /></Button>
                <SwipeableDrawer
                    anchor={"left"}
                    open={hamburgerState["left"]}
                    onClose={toggleDrawer("left", false)}
                    onOpen={toggleDrawer("left", true)}
                    SlideProps={{ unmountOnExit: true }}

                >
                    {list("left")}
                </SwipeableDrawer>
            </div>

            <Link to={{
            pathname: "/",
            // key: uuidv4(),
            // state: {prevPath: location.pathname }
            }}>
                <div className="home-container">
                    <FontAwesomeIcon className="home" icon={faHome}/>
                </div>
            </Link>

            <div className= {localStorage.getItem('token') ? "login-cart-profile-nav-container" : "guest-cart-nav-container"}>
            {localStorage.getItem('token') ? (
                <Dropdown id="nav-bar-dropdown">
                    <Dropdown.Toggle>
                    {localStorage.getItem('token') ? 
                        <FontAwesomeIcon className="user-icon" icon={faUser}/>
                    : null}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                        <Dropdown.Item href="/profile/setting" onClick={() => window.location.reload()}>Account Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown> 
                ) : (
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
                )}
                
                {/*  reload the cart page in case user clears local storage and then re-clicks on the cart icon */}
                <Link to={{
                    pathname: "/cart",
                    // key: uuidv4(),
                    // state: { prevPath: location.pathname }
                }} > 
                    <IconButton aria-label="cart" onClick={() => {
                        if(location.pathname === '/cart') return grabTotalCartQuantity(0) // if logged in user cleared local storage, and is already on the cart page, we want to reload the page and update nav bar
                    }}>
                        <StyledBadge badgeContent={totalCartQuantity} color="secondary">
                            <FontAwesomeIcon className="cart-icon" icon={faShoppingCart}/>
                        </StyledBadge>
                    </IconButton>
                </Link>

                
            </div>
        </div>
    )
    
}

export default NavBar