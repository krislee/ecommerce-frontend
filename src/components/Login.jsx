import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';
import '../styles/Login.css'

function Login ({backend, loggedIn, grabLoginInfo, buyer, seller}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false)

    const [resetPassword, setResetPassword] = useState(false)

    const handleLogin = async (event) => {
        event.preventDefault();
        const loginInfo = {
            username: username,
            password: password,
        }
        if(buyer) {
            const loginResponse = await fetch(`${backend}/auth/buyer/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const loginData = await loginResponse.json()
            if (loginData.success === true) {
                grabLoginInfo(loginData.token);
                setIsLogin(true)
                const syncCartResponse = await fetch(`${backend}/buyer/sync/cart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    credentials: 'include'
    
                })
                const syncCartData = await syncCartResponse.json()
                console.log(syncCartData)
                
            }
        }
        if(seller) {
            const loginResponse = await fetch(`${backend}/auth/seller/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const loginData = await loginResponse.json()
            if (loginData.success === true) {
                grabLoginInfo(loginData.token);
                setIsLogin(true)
            }
        }
        
    }

    const handleChangeUsername = e => {
        setUsername(e.target.value)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
    }

    if (isLogin) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <form className="login" onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>
                {/* <input type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input> */}
                <input type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input>
                {username === '' || password === '' ? <input className="submit-button-disabled" type="submit" disabled></input> : 
                    <input className="submit-button" type="submit"></input>}
                <button onClick={() => {
                    setPassword('')
                    setResetPassword(true)
                }}>Forgot Password</button>
            </form>
        )
    }
}

export default Login