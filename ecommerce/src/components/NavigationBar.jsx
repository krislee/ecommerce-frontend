import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Button from '../components/Button'
import '../styles/BuyerLogin.css'

function NavBar ({}) {
    return (
        <div className="cart">
            <Link to="/cart">
                <Button name={'Cart'}/>
            </Link>
        </div>
    )
}

export default NavBar