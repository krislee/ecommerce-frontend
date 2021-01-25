import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';
import '../styles/Login.css'
import '../styles/BuyerLogin.css'

function Login ({backend, grabLoginInfo}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [email, setEmail] = useState('');
    const [isLogin, setIsLogin] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault();
        const loginInfo = {
            username: username,
            password: password,
        }
        const resp = await fetch(`${backend}/auth/buyer/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginInfo)
        });
        const data = await resp.json()
        // console.log(data);
        // console.log(data.success);
        if (data.success === false) {
            setIsLogin(false);
        } else if (data.success === true) {
            // console.log(data)
            console.log(data.token)
            // await grabLoginInfo(username, password, true, data.token);
            // setIsLogin(true);
            const resp = await fetch(`${backend}/buyer/sync/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': data.token
                },
                credentials: 'include'

            })
            const syncData = await resp.json()
            console.log(syncData)
            await grabLoginInfo(username, password, true, data.token);
            setIsLogin(true);
        }
        // e.preventDefault();
        // grabLoginInfo('Billy', 'rockstar', true, 'd92d900290');
        // setIsLogin(true);
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
            <form className="login" onSubmit={handleLogin}>
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