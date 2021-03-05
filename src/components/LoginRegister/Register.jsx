import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';

// import Toast from 'react-bootstrap/Toast'
import Button from 'react-bootstrap/Button'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';


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
    const [passwordInvalidInput, setPasswordInvalidInput] = useState(false)
    const [usernameInvalidInput, setUsernameInvalidInput] = useState(false)
    const [emailInvalidInput, setEmailInvalidInput] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const useStyles = makeStyles((theme) => ({
        root: {
          '& .MuiTextField-root': {
            'margin-bottom': '1.75rem',
            width: "100%"

          },
        },
    }));

    const classes = useStyles();

    const handleRegister = async (event) => {
        event.preventDefault();

        setDisabled(true) // disable button after submitting to prevent user making consecutive requests; renable the button after typing in the input

        // If there was any previous error showing under the input, then make the error false so that we do not still see the error still when we re-render
        setEmailError(false)
        setEmailInvalid(false)
        setUsernameError(false)
        setUsernameInvalid(false)
        setPasswordInvalid(false)

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
                // setUsernameInvalidInput(true)
            } else if(registerData.details && registerData.details[0].message === "\"username\" length must be at least 8 characters long") {
                setUsernameInvalid(true)
                // setUsernameInvalidInput(true)
            } else if(registerData.details && registerData.details[0].message === "\"password\" length must be at least 8 characters long") {
                setPasswordInvalid(true)
                // setPasswordInvalidInput(true)
            } else if(registerData.details && registerData.details[0].message === "\"email\" must be a valid email") {
                setEmailInvalid(true)
                // setEmailInvalidInput(true)
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
        setDisabled(false)
        // setUsernameInvalidInput(false)
    }
    const handleChangePassword = e => {
        setPassword(e.target.value)
        setDisabled(false)
        // setPasswordInvalidInput(false)
    }

    const handleChangeEmail = e => {
        setEmail(e.target.value)
        setDisabled(false)
        // setEmailInvalidInput(false)
    }

    const handleChangeName = (e) => {
        const { name, value } = e.target
        setFullName((prevName) => ({
            ...prevName, [name]: value
        }))
        setDisabled(false)
    }

    
    if (isRegistered) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <div id="register-heading-form-container">
                {/* <div id = "register-toast-container">

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
                </div> */}

            <h2 id="register-heading">Create Account</h2>
            <div className="register-form" 
            // onSubmit={handleRegister}
            >
                {/* <input className="register-input" type="text" placeholder="First Name" name="firstName" value={fullName.firstName || ""} onChange={handleChangeName}></input>

                <input  className="register-input" type="text" placeholder="Last Name" name ="lastName" value={fullName.lastName || ""} onChange={handleChangeName}></input>

                <input className={usernameInvalidInput || usernameError? "register-invalid-username-input" : "register-input"} type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>

                <input className={emailInvalidInput || emailError ? "register-invalid-email-input" : "register-input"} type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input>

                <input className={passwordInvalidInput ? "register-invalid-password-input" : "register-input"} type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input> */}

                <form className={classes.root} noValidate autoComplete="off">
                    <div id="register-container">
                        <TextField
                        className="filled-error-helper-text"
                        label="First Name"
                        size="medium"
                        placeholder="Enter First Name"
                        variant="filled"
                        name ="firstName"
                        value={fullName.firstName || ""}
                        onChange={handleChangeName}
                        />
                        <TextField
                        className="filled-error-helper-text"
                        label="Last Name"
                        size="medium"
                        placeholder="Enter Last Name"
                        variant="filled"
                        name ="lastName"
                        value={fullName.lastName || ""}
                        onChange={handleChangeName}
                        />
                        <TextField
                        error={emailInvalid || emailError}
                        className="filled-error-helper-text"
                        label="Email"
                        size="medium"
                        placeholder="Enter Email"
                        helperText={emailInvalid ? "Invalid email" : emailError ? "This email has been registered already" : ""}
                        variant="filled"
                        value={email}
                        onChange={handleChangeEmail}
                        />
                        <TextField
                        error={usernameInvalid || usernameError}
                        className="filled-error-helper-text"
                        label="Username"
                        size="medium"
                        placeholder="Enter Username"
                        helperText={usernameInvalid ? "Username needs to be at least 8 characters" : usernameError ? "This username has been registered already" : ""}
                        variant="filled"
                        value={username}
                        onChange={handleChangeUsername}
                
                        />
                        <TextField
                        error={passwordInvalid}
                        size="medium"
                        className="filled-error-helper-text"
                        label="Password"
                        type="password"
                        placeholder="Enter Password"
                        helperText={passwordInvalid ?  "Password needs to be at least 8 characters" : ""}
                        variant="filled"
                        value={password}
                        onChange={handleChangePassword}
                        />
                        
                    </div>
                </form>

                {(email === '' || fullName.firstName === '' || fullName.lastName === '' || password === '' || username === '' || disabled) ? <Button id="submit-button-disabled" type="submit" variant="dark" size='lg' disabled={true}>Submit</Button> :  <Button size='lg' id="submit-button" variant="dark" type="button" onClick={handleRegister} >Submit</Button> }

            </div>
         </div>
        )
    }
}