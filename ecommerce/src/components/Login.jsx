import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/Login.css'
import '../styles/BuyerLogin.css'

function Login ({}) {

    const fetchItems = () => {
        fetch()
    }

    return (
        <form className="login" onSubmit={fetchItems}>
            <input type="text" placeholder="Username"></input>
            <input type="text" placeholder="Email"></input>
            <input type="text" placeholder="Password"></input>
            <input className="submit-button" type="submit"></input>
        </form>
    )
}

export default Login