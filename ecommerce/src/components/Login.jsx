import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/Login.css'
import '../styles/BuyerLogin.css'

function Login ({}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const testChange = (e) => {
        e.preventDefault();
        console.log(username);
        console.log(password);
        console.log(email);
    }

    const handleChangeUsername = e => {
        setUsername(e.target.value)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
    }

    const handleChangeEmail = e => {
        setEmail(e.target.value)
    }

    return (
        <form className="login" onSubmit={testChange}>
            <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>
            <input type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input>
            <input type="password" placeholder="Password" value={password} onChange={handleChangePassword}></input>
            <input className="submit-button" type="submit"></input>
        </form>
    )
}

export default Login