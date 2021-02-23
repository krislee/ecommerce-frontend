import React, { useState } from 'react';
// import Footer from '../../components/Footer';
import Toast from 'react-bootstrap/Toast'

export default function Settings({ backend, loggedIn, settingData, grabSettingData, grabTotalCartQuantity, grabRedirect }) {
   
    // EMAIL/PASSWORD SUBMISSION ERRORS 
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [emailErrorMessage, setEmailErrorMessage] = useState(false)
    const [passwordInvalid, setPasswordInvalid] = useState(false)
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(false)

    // EMAIL/PASSWORD SUBMISSION SUCCESS
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
    const [updateEmailSuccess, setUpdateEmailSuccess] = useState(false)

    // INPUT VALUES 
    const [emailInput, setEmailInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')

    // SHOW EMAIL/PASSWORD FORM
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)

    const [disableForm, setDisableForm] = useState(true)
    

  
    const handleEmailUpdate = async(event) => {
        event.preventDefault()
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
                grabSettingData(emailUpdateData) // update email
                setUpdateEmailSuccess(true) // show success message
                setEmailErrorMessage(false) // do not show error message
                setEmailInvalid(false) // do not show error message
                setShowEmailInput(false) // hide input 
                setEmailInput('') // empty input
            }
            if(emailUpdateData.msg) {
                setEmailErrorMessage(true)
                setEmailInvalid(false)
                setEmailInput('') // empty input
            }
            if(emailUpdateData.details && emailUpdateData.details[0].message) {
                setEmailInvalid(true)
                setEmailErrorMessage(false)
                setEmailInput('') // empty input
            }
        } else {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
            
    }

    const handleResetPassword = async(event) => {
        event.preventDefault()

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
                setResetPasswordSuccess(true) // show success message
                setPasswordErrorMessage(false)
                setPasswordInvalid(false)
                setShowPasswordInput(false) // hide input
                setPasswordInput('') // empty input
            }
            if(resetPasswordData.msg) {
                setPasswordErrorMessage(true)
                setPasswordInvalid(false)
                setPasswordInput('') // empty input
            }
            if(resetPasswordData.details && resetPasswordData.details[0].message) {
                setPasswordInvalid(true)
                setPasswordErrorMessage(false)
                setPasswordInput('') // empty input
            }
        } else {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
    }

    const openChangeEmailForm = () => {
        setShowEmailInput(true)
        setShowPasswordInput(false)
        if(!loggedIn()) {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
    }

    const closeChangeEmailForm = () => {
        setShowEmailInput(false) // hide input
        setEmailInput('') // empty input
        if(!loggedIn()) {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
                            
    }

    const openChangePasswordForm = () => {
        setShowPasswordInput(true) 
        setShowEmailInput(false)
        if(!loggedIn()) {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
    }

    const closeChangePasswordForm = () => {
        setShowPasswordInput(false) // hide input
        setPasswordInput('') // empty input
        if(!loggedIn()) {
            grabTotalCartQuantity(0)
            grabRedirect(true)
        }
    }

    const handlePasswordInputChange = e => {
        setPasswordInput(e.target.value)
    }
    const handleEmailInputChange = e => setEmailInput(e.target.value)



    return (
        <>
            <div>
                <h5>Username: {settingData.username} </h5>

                <h5>Password: *****</h5>
                <button disabled = {showEmailInput} onClick={openChangePasswordForm}>Change password</button>
                {showPasswordInput && (
                    <form>
                        <input type="password" value={passwordInput} onChange={handlePasswordInputChange}/>
                        <input type="submit" disabled={!passwordInput.length} onClick={handleResetPassword}/>
                        <button onClick={closeChangePasswordForm}>Close</button>
                    </form>
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

                <h5>Email:{settingData.email} </h5>
                <button disabled={showPasswordInput} onClick={openChangeEmailForm}>Update email</button>
                {showEmailInput && (
                    <form>
                        <input type="email" value={emailInput} onChange={handleEmailInputChange}/>
                        <input type="submit" disabled={!emailInput} onClick={handleEmailUpdate}/>
                        <button onClick={closeChangeEmailForm}>Close</button>
                    </form>
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
            </div>
            {/* <Footer /> */}
        </>
    )
}  