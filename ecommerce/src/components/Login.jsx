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

    const testChange = () => {
        console.log(username);
        console.log(password);
        console.log(email);
    }

    const handleChangeUsername = e => {
        setUsername({ [e.target.name]: e.target.value })
    }

    const handleChangePassword = e => {
        setPassword({ [e.target.name]: e.target.value })
    }

    const handleChangeEmail = e => {
        setEmail({ [e.target.name]: e.target.value })
    }

    // const fetchItems = () => {
    //     fetch()
    // }

    return (
        <form className="login">
            <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>
            <input type="text" placeholder="Email" value={email} onChange={handleChangeEmail}></input>
            <input type="text" placeholder="Password" value={password} onChange={handleChangePassword}></input>
            <input className="submit-button" type="submit" onSubmit={testChange()}></input>
        </form>
    )
}

export default Login