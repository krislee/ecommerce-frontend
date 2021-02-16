import React, {useEffect, useState} from 'react'
import {Redirect} from "react-router-dom";
import NavBar from '../components/NavigationBar'
// import Footer from '../components/Footer'

export default function Homepage() {
    const [redirect, setRedirect] = useState(false)

    if (redirect) return <Redirect to="/shop/1"></Redirect>
    return (
        <>
        <NavBar />
    
        <button style={{marginTop: '100px'}} onClick={() => setRedirect(true)}>Shop All</button>
        {/* <Footer /> */}
        </>
    )
}