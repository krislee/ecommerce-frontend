import React, { useState, useEffect } from 'react';
import Footer from '../../components/Footer';
import Toast from 'react-bootstrap/Toast'

export default function Settings({ backend, loggedIn, settingData, grabSettingData }) {
   
    // const [open, setOpen] = useState(false)
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [emailErrorMessage, setEmailErrorMessage] = useState(false)
    const [passwordInvalid, setPasswordInvalid] = useState(false)
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(false)

    const [showEmailInput, setShowEmailInput] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
    const [updateEmailSuccess, setUpdateEmailSuccess] = useState(false)

  
    const handleEmailUpdate = async() => {
        if(loggedIn()) {
            const emailUpdateResponse = await fetch(`${backend}/buyer/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({email: emailInput})
            })
            const emailUpdateData = await emailUpdateResponse.json()
            console.log(emailUpdateData)
            if(!emailUpdateData.msg && !emailUpdateData.details) {
                grabSettingData(emailUpdateData)
                setUpdateEmailSuccess(true)
                setEmailErrorMessage(false)
                setEmailInvalid(false)
                setShowEmailInput(false)
            }
            if(emailUpdateData.msg) {
                setEmailErrorMessage(true)
                setEmailInvalid(false)
            }
            if(emailUpdateData.details && emailUpdateData.details[0].message) {
                setEmailInvalid(true)
                setEmailErrorMessage(false)
            }
        }
            
    }

    const handleResetPassword = async() => {
        if(loggedIn()) {
            const resetPasswordResponse = await fetch(`${backend}/buyer/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({password: passwordInput})
            })
            const resetPasswordData = await resetPasswordResponse.json()
            console.log(resetPasswordData)
            if(!resetPasswordData.msg && !resetPasswordData.details) {
                setResetPasswordSuccess(true)
                setPasswordErrorMessage(false)
                setPasswordInvalid(false)
                setShowPasswordInput(false)
            }
            if(resetPasswordData.msg) {
                setPasswordErrorMessage(true)
                setPasswordInvalid(false)
            }
            if(resetPasswordData.details && resetPasswordData.details[0].message) {
                setPasswordInvalid(true)
                setPasswordErrorMessage(false)
            }
        }
    }

    const handlePasswordInputChange = e => setPasswordInput(e.target.value)
    const handleEmailInputChange = e => setEmailInput(e.target.value)

    return (
        <>
            <div>
                <h5>Email:{settingData.email} </h5>
                <button disabled={showPasswordInput} onClick={() => {
                    setShowEmailInput(true)
                    setShowPasswordInput(false)
                }}>Update email</button>
                {showEmailInput && (
                    <div>
                        <input type="email" value={emailInput} onChange={handleEmailInputChange}/>
                        <input type="submit" onClick={handleEmailUpdate}/>
                        <button onClick={() => setShowEmailInput(false)}>Close</button>
                    </div>
                )} 
                <Toast onClose={() => setEmailInvalid(false)} show={emailInvalid} delay={2000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}>Must be a valid email.</Toast.Body>
                </Toast>  
                <Toast onClose={() => setEmailErrorMessage(false)} show={emailErrorMessage} delay={2000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}> Email is already registered.</Toast.Body>
                </Toast>  
                <Toast onClose={() => setUpdateEmailSuccess(false)} show={updateEmailSuccess} delay={2000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(57, 172, 57)'}}>Your email is successfully changed.</Toast.Body>
                </Toast>     

                <h5>Username: {settingData.username} </h5>

                <h5>Password: *****</h5>
                <button disabled = {showEmailInput} onClick={()=> {
                    setShowPasswordInput(true)
                    setShowEmailInput(false)
                }}>Reset password</button>

                {showPasswordInput && (
                    <div>
                    <input type="password" value={passwordInput} onChange={handlePasswordInputChange}/>
                    <input type="submit" onClick={handleResetPassword}/>
                    <button onClick={() => setShowPasswordInput(false)}>Close</button>
                    </div>
                )}
   
                <Toast onClose={() => setPasswordInvalid(false)} show={passwordInvalid} delay={3000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}>Your password must be at least 8 characters long.</Toast.Body>
                </Toast>  
                <Toast onClose={() => setPasswordErrorMessage(false)} show={passwordErrorMessage} delay={3000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}> Your password cannot be your 5 most recently used passwords.</Toast.Body>
                </Toast>  
                <Toast onClose={() => setResetPasswordSuccess(false)} show={resetPasswordSuccess} delay={3000} autohide>
                    <Toast.Body style={{backgroundColor: 'rgb(57, 172, 57)'}}>Your password is successfully changed.</Toast.Body>
                </Toast>    
            </div>
            <Footer />
        </>
    )
}  