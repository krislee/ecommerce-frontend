import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';
// import '../styles/Login.css'
import Toast from 'react-bootstrap/Toast'
import Button from 'react-bootstrap/Button'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

function Login ({backend, loggedIn, grabLoginInfo, buyer, seller, grabTotalCartQuantity}) {

    const useStyles = makeStyles((theme) => ({
        root: {
          '& .MuiTextField-root': {
            'margin-bottom': '1.75rem',
            width: "100%"

          },
        },
    }));

    const classes = useStyles();


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false)
    const [loginError, setLoginError] = useState(false)
    const [disable, setDisable] = useState(false)

    const handleLogin = async (event) => {
        event.preventDefault();

        setDisable(true) // disable button after submitting to prevent user making consecutive requests; renable the button after typing in the input

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
            if(loginData.success === false){
                setLoginError(true)
            }
            if (loginData.success === true) {
                localStorage.setItem('token', loginData.token)
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
                grabTotalCartQuantity(syncCartData.cart.TotalItems)
                
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
        setDisable(false)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
        setDisable(false)
    }

    if (isLogin) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <>
            <form id='login-form' onSubmit={handleLogin} className={classes.root} noValidate autoComplete="off">
                {/* <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input> */}
                {/* <input type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input> */}
                {/* <input type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input> */}

                <TextField
                className="filled-error-helper-text"
                label="Username"
                size="medium"
                placeholder="Enter Username"
                variant="filled"
                value={username}
                onChange={handleChangeUsername}
                />
                <TextField
                size="medium"
                className="filled-error-helper-text"
                label="Password"
                type="password"
                placeholder="Enter Password"
                variant="filled"
                value={password}
                onChange={handleChangePassword}
                />
                <div id="login-toast-container">
                    <Toast onClose={() => setLoginError(false)} show={loginError} delay={3000} autohide >
                        <Toast.Body>Invalid login credentials.</Toast.Body>
                    </Toast>
                </div>
                <div id="login-submit-button-container">
                    {username === '' || password === '' || disable ? <Button className="login-submit-button-disabled" type="submit" variant="dark" disabled>Login</Button> : <Button className="login-submit-button" type="submit" variant="dark" size='lg'>Login</Button>}
                </div>
            </form>
            </>
        )
    }
}

export default Login