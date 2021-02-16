import React, {useState} from 'react'
import {Redirect} from 'react-router-dom';
import '../styles/Login.css'


export default function Register ({backend, loggedIn, grabLoginInfo, buyer, seller}) {

     /* ------- INPUT STATES ------- */
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState({})

    const [isRegistered, setIsRegistered] = useState(false) // if successfully registered, redirect to homepage

    const handleRegister = async (event) => {
        event.preventDefault();

        const registerInfo = {
            username: username,
            password: password,
            email: email,
            name: `${fullName.firstName}, ${fullName.lastName}`
        }
     
        if(buyer) {
            const registerResponse = await fetch(`${backend}/auth/buyer/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerInfo)
            });
            const registerData = await registerResponse.json()
            if (registerData.success === true) {
                grabLoginInfo(registerData.token);
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
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
    }

    const handleChangeEmail = e => {
        setEmail(e.target.value)
    }

    const handleChangeName = (e) => {
        const { name, value } = e.target
        setFullName((prevName) => ({
            ...prevName, [name]: value
        }))
    }

    
    if (isRegistered) {
        return (
            <Redirect to="/" />
        )
    } else {
        return (
            <form className="login" onSubmit={handleRegister}>
                <input type="text" placeholder="First Name" name="firstName" value={fullName.firstName || ""} onChange={handleChangeName}></input>
                <input type="text" placeholder="Last Name" name ="lastName" value={fullName.lastName || ""} onChange={handleChangeName}></input>
                <input type="text" placeholder="Username" value={username} onChange={handleChangeUsername}></input>
                <input type="email" placeholder="Email" value={email} onChange={handleChangeEmail}></input>
                <input type="password" placeholder="Password" value={password} onChange={handleChangePassword}  autoComplete="current-password"></input>
                {(email === '' || fullName.firstName === '' || fullName.lastName === '' || password === '' || username === '') ? <input className="submit-button-disabled" type="submit" disabled={true}/> :  <input className="submit-button" type="submit" />}
            </form>
        )
    }
}