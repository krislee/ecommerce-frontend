import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavigationBar';
import Footer from '../../components/Footer';
import { Snackbar } from '@material-ui/core';

export default function Profile({ backend, loggedIn, profileData, grabProfileData }) {

    const [open, setOpen] = useState(true)

    const [showEmailInput, setShowEmailInput] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [resetPassword, setResetPassword] = useState({})
    const [updateEmail, setUpdateEmail] = useState({})

    const handleEmailUpdate = async() => {
        const emailUpdateResponse = await fetch(`${backend}/buyer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })
        const emailUpdateData = await emailUpdateResponse.json()
        setUpdateEmail(emailUpdateData)
    }

    const handleResetPassword = async() => {
        const resetPasswordResponse = await fetch(`${backend}/buyer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            },
            body: JSON.stringify({password: password})
        })
        const resetPasswordData = await resetPasswordResponse.json()
        setResetPassword(resetPasswordData)
    }

    const handlePasswordInputChange = e => setPasswordInput(e.target.value)
    const handleEmailInputChange = e => setEmailInput(e.target.value)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
    };

    return (
        <>
            <div>
            <h5>Email:{updateEmail || profileData.email} </h5>
            <button disabled={showPasswordInput} onClick={() => setShowEmailInput(true)}>Update email</button>
            {showEmailInput && <input type="email" value={emailInput} onChange={handleEmailInputChange}/>}
            {showEmailInput && <input type="submit" onClick={handleEmailUpdate}/>}
            <Snackbar open={ (open && updateEmail.details[0].message) || (open && updateEmail.msg)} autoHideDuration={6000} onClose={handleClose}> 
                { updateEmail.details[0].message && <Alert severity="error"> Must be a valid email.</Alert> }
                { updateEmail.msg && <Alert severity="error"> Email is already registered.</Alert> }
            </Snackbar>

            <h5>Username: {profileData.username} </h5>

            <h5>Password: *****</h5>
            <button disabled = {showEmailInput} onClick={()=> setShowPasswordInput(true)}>Reset password</button>
            {showPasswordInput && <input type="password" value={passwordInput} onChange={handlePasswordInputChange}/>}
            {showPasswordInput && <input type="submit" onClick={handleResetPassword}/>}
            <Snackbar open={ (open && resetPassword.msg)|| (open && resetPassword.details[0].message) } autoHideDuration={6000} onClose={handleClose}> 
                { resetPassword.msg && <Alert severity="error"> Your password cannot be your 5 most recently used passwords.</Alert> }
                { resetPassword.details[0].message && <Alert severity="error">Your password must be at least 8 characters long.</Alert> }
            </Snackbar>
            
            </div>
        </>
    )
} 