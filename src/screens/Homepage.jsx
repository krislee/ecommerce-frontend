import React, {useEffect, useState} from 'react'
import { Redirect, useLocation}  from "react-router-dom";
// import NavBar from '../components/NavigationBar'
import Button from 'react-bootstrap/Button'
import Footer from '../components/Footer'
import '../styles/Homepage/Homepage.css'

export default function Homepage({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const [redirect, setRedirect] = useState(false)
    const location = useLocation()
    console.log(location)
    // if(!location.state) location.state = {}
    useEffect(() => {
        if(!loggedIn()) grabTotalCartQuantity(0)
    },[loggedIn()])

    if (redirect) return <Redirect to="/shop/1"></Redirect>
    
    return (
        <>
        {/* <NavBar backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} /> */}
        <div id="video-button-container">
            {/* <div id="video-container">
                <video width="100%" autoPlay defaultMuted loop playsInline>
                    <source src={require("../styles/Homepage/circuit.mp4")} type="video/mp4"/>
                </video>
            </div> */}
            <div id="homepage-image-container">
                <img src={require('../styles/Homepage/homepage2.png')} />
            </div>

            <div id="shop-all-button-container">
                <Button variant="dark" id="shop-all-button" onClick={() => setRedirect(true)}><h1>Shop All</h1></Button>
            </div>
        </div>
        <div id="homepage-footer-container">
            <Footer />
        </div>
        
        </>
    )
}