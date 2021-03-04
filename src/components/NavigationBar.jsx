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

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);

const useStyles = makeStyles((theme) => ({
    list: {
        width: '50vw',
        [theme.breakpoints.down(450)]: {
            width: "80vw"
        },
        // [theme.breakpoints.up('sm')] : {
        //     width: '0'
        // }
    }
}));

// let theme = createMuiTheme({})
// theme = { ...theme,
//     overrides: {
//         MuiBackdrop: {
//             root: {
//                [theme.breakpoints.up('sm')]: {
//                     display: 'none'
//                 }
//             }
//         }
//     }
// };

function NavBar ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const { width, height, ref } = useResizeDetector();

    const location = useLocation()

    useEffect(() => {
        const resizeWindow = () => {
            if(width > 600) {
                return setHamburgerState({ ...hamburgerState, 'left':false})
            }
        }
        resizeWindow()
    }, [width])

    const handleLogout = () => {
        localStorage.clear();
        grabTotalCartQuantity()
    }

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
                    <ListItemText primary="Shop All" />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button >
                    <ListItemText primary={localStorage.getItem('token') ? "Account Setting" : "Login"} />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button >
                    <ListItemText primary={localStorage.getItem('token') ? "Sign Out" : "Register"} />
                </ListItem>
            </List>
        </div>
        
    );

    

    return (
        <div className="navbar" ref={ref} >
            <div id="navbar-hamburger"  >
                <Button onClick={toggleDrawer("left", true)}><MenuRoundedIcon /></Button>
                {/* <ThemeProvider theme={theme}> */}
                    <SwipeableDrawer
                        anchor={"left"}
                        open={hamburgerState["left"]}
                        onClose={toggleDrawer("left", false)}
                        onOpen={toggleDrawer("left", true)}
                        SlideProps={{ unmountOnExit: true }}

                    >
                        {list("left")}
                    </SwipeableDrawer>
                {/* </ThemeProvider> */}
            </div>

            <Link to={{
            pathname: "/",
            // key: uuidv4(),
            // state: {prevPath: location.pathname }
        }}>
            <div className="home-container" >
                <FontAwesomeIcon className="home" icon={faHome}/>
            </div>
        </Link>

            <div className= {localStorage.getItem('token') ? "login-cart-profile-nav-container" : "guest-cart-nav-container"}>
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
            </div>
        </div>
    )
    
}

export default NavBar