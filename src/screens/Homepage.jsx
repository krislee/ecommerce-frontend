import React, {useEffect, useState} from 'react'
import {Redirect} from "react-router-dom";
import NavBar from '../components/NavigationBar'
import Footer from '../components/Footer'

export default function Homepage({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const [redirect, setRedirect] = useState(false)

    if (redirect) return <Redirect to="/shop/1"></Redirect>
    return (
        <>
        <NavBar backend={backend} loggedIn={loggedIn} totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} />
    
        <button style={{marginTop: '100px'}} onClick={() => setRedirect(true)}>Shop All</button>
        <Footer />
        </>
    )
}