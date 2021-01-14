import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/Login.css'
import '../styles/BuyerLogin.css'

function Login ({}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [email, setEmail] = useState('');
    const [isLogin, setIsLogin] = useState(false)

    const login = async (e) => {
        e.preventDefault();
        const loginInfo = {
            username: username,
            password: password,
        }
        const resp = await fetch('http://localhost:3001/auth/buyer/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginInfo)
        });
        const data = await resp.json()
        console.log(data.success)
        if (data.success === false) {
            setIsLogin(false);
        } else if (data.success === true) {
            setIsLogin(true);
        }
    }

    const handleChangeUsername = e => {
        setUsername(e.target.value)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
    }

    // const handleChangeEmail = e => {
    //     setEmail(e.target.value)
    // }

    if (isLogin) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <form className="login" onSubmit={login}>
                <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>
                {/* <input type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input> */}
                <input type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input>
                {username === '' || password === '' ? <input className="submit-button-disabled" type="submit" disabled></input> : 
                    <input className="submit-button" type="submit"></input>}
            </form>
        )
    }
}

export default Login