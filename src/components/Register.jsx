import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';
// import '../styles/Login.css'
import Toast from 'react-bootstrap/Toast'
import Button from 'react-bootstrap/Button'

export default function Register ({backend, loggedIn, grabLoginInfo, buyer, seller}) {

     /* ------- INPUT STATES ------- */
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState({})

    const [isRegistered, setIsRegistered] = useState(false) // if successfully registered, redirect to homepage

    const [emailError, setEmailError] = useState(false)
    const [usernameError, setUsernameError] = useState(false)
    const [usernameInvalid, setUsernameInvalid] = useState(false)
    const [passwordInvalid, setPasswordInvalid] = useState(false)
    const [emailInvalid, setEmailInvalid] = useState(false)

    const [disabled, setDisabled] = useState(false)
    const handleRegister = async (event) => {
        event.preventDefault();
        setDisabled(true)
        const registerInfo = {
            username: username,
            password: password,
            email: email,
            name: `${fullName.firstName}, ${fullName.lastName}`
        }
        console.log(registerInfo)
        if(buyer) {
            const registerResponse = await fetch(`${backend}/auth/buyer/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerInfo)
            });
            const registerData = await registerResponse.json()
            console.log(registerData)
            if(registerData.emailMsg) {
                setEmailError(true)
            } else if(registerData.usernameMsg) {
                setUsernameError(true)
            } else if(registerData.details && registerData.details[0].message === "\"username\" length must be at least 8 characters long") {
                setUsernameInvalid(true)
            } else if(registerData.details && registerData.details[0].message === "\"password\" length must be at least 8 characters long") {
                setPasswordInvalid(true)
            } else if(registerData.details && registerData.details[0].message === "\"email\" must be a valid email") {
                setEmailInvalid(true)
            }
            if (registerData.success === true) {
                localStorage.setItem('token', registerData.token)
                setIsRegistered(true)
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
    }

     /* ------- UPDATE INPUT STATES ------- */
    const handleChangeUsername = e => {
        setUsername(e.target.value)
        // setDisabled(false)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
        // setDisabled(false)
    }

    const handleChangeEmail = e => {
        setEmail(e.target.value)
        // setDisabled(false)
    }

    const handleChangeName = (e) => {
        const { name, value } = e.target
        setFullName((prevName) => ({
            ...prevName, [name]: value
        }))
        // setDisabled(false)
    }

    
    if (isRegistered) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <div id="heading-form-container">
                <div id = "toast-container">

                    <Toast onClose={() => {
                        setEmailInvalid(false)
                        setDisabled(false)
                    }} show={emailInvalid} 
                    delay={3000} 
                    autohide >
                        <Toast.Body>Invalid email</Toast.Body>
                    </Toast>

                    <Toast onClose={() => {
                        setEmailError(false)
                        setDisabled(false)
                    }} 
                    show={emailError} 
                    delay={3000} 
                    autohide >
                        <Toast.Body>This email has been registered already.</Toast.Body>
                    </Toast>

                    <Toast onClose={() => {
                        setUsernameError(false)
                        setDisabled(false)
                    }} 
                    show={usernameError} 
                    delay={3000} 
                    autohide >
                        <Toast.Body>Username has been taken</Toast.Body>
                    </Toast>

                    <Toast onClose={() => {
                        setUsernameInvalid(false)
                        setDisabled(false)
                    }} 
                    show={usernameInvalid} 
                    delay={3000} 
                    autohide >
                        <Toast.Body>Username needs to be at least 8 characters.</Toast.Body>
                    </Toast>

                    <Toast onClose={() => {
                        setPasswordInvalid(false)
                        setDisabled(false)
                    }} 
                    show={passwordInvalid} 
                    delay={3000} 
                    autohide >
                        <Toast.Body>Password needs to be at least 8 characters.</Toast.Body>
                    </Toast>
                </div>

            <h2 id="register-heading">Register</h2>
            <div className="register-form" 
            // onSubmit={handleRegister}
            >
                <input className="register-input" type="text" placeholder="First Name" name="firstName" value={fullName.firstName || ""} onChange={handleChangeName}></input>

                <input  className="register-input" type="text" placeholder="Last Name" name ="lastName" value={fullName.lastName || ""} onChange={handleChangeName}></input>

                <input className="register-input" type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>

                <input className="register-input" type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input>

                <input className="register-input" type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input>

                {(email === '' || fullName.firstName === '' || fullName.lastName === '' || password === '' || username === '' || disabled) ? <Button id="submit-button-disabled" type="submit" variant="dark" size='lg' disabled={true}>Submit</Button> :  <Button size='lg' id="submit-button" variant="dark" type="button" onClick={handleRegister} >Submit</Button> }

            </div>
         </div>
        )
    }
}