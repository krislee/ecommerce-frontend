import React, { useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import Button from '@material-ui/core/Button'
import '../../styles/UserProfile/SettingsContainer.css'

export default function Settings({ backend, loggedIn, settingData, grabSettingData, grabTotalCartQuantity, grabRedirect }) {
    
    const [disableButtonAfterFetching, setDisableButtonAfterFetching] = useState(false); // disable submit buttons for changing emails and password so user does not make more than one request when submitting

    // EMAIL/PASSWORD SUBMISSION ERRORS 
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState(false);
    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(false);

    // EMAIL/PASSWORD SUBMISSION SUCCESS
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const [updateEmailSuccess, setUpdateEmailSuccess] = useState(false);

    // INPUT VALUES 
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');

    // SHOW EMAIL/PASSWORD FORM
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

  
    const handleEmailUpdate = async(event) => {
        event.preventDefault();
        if(loggedIn()) {
            setDisableButtonAfterFetching(true); // disable submit button so email change consecutive requests are prevented
            const emailUpdateResponse = await fetch(`${backend}/buyer/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({email: emailInput})
            });
            const emailUpdateData = await emailUpdateResponse.json()
            if(!emailUpdateData.msg && !emailUpdateData.details) {
                grabSettingData(emailUpdateData); // update email
                setUpdateEmailSuccess(true); // show success message
                setEmailErrorMessage(false); // do not show error message
                setEmailInvalid(false); // do not show error message
                setShowEmailInput(false); // hide input 
                setEmailInput(''); // empty input
            }
            if(emailUpdateData.msg) {
                setEmailErrorMessage(true);
                setEmailInvalid(false);
                setEmailInput(''); // empty input
            }
            if(emailUpdateData.details && emailUpdateData.details[0].message) {
                setEmailInvalid(true);
                setEmailErrorMessage(false);
                setEmailInput(''); // empty input
            }

            setDisableButtonAfterFetching(false); // enable the submit button so that user can change email again after the request is done if user wants to 

        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };    
    };

    const handleResetPassword = async(event) => {
        event.preventDefault();

        if(loggedIn()) {

            setDisableButtonAfterFetching(true); // disable submit button so password change consecutive requests are prevented

            const resetPasswordResponse = await fetch(`${backend}/buyer/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({password: passwordInput})
            });
            const resetPasswordData = await resetPasswordResponse.json();
            if(!resetPasswordData.msg && !resetPasswordData.details); {
                setResetPasswordSuccess(true); // show success message
                setPasswordErrorMessage(false);
                setPasswordInvalid(false);
                setShowPasswordInput(false); // hide input
                setPasswordInput(''); // empty input
            }
            if(resetPasswordData.msg) {
                setPasswordErrorMessage(true);
                setPasswordInvalid(false);
                setPasswordInput(''); // empty input
            }
            if(resetPasswordData.details && resetPasswordData.details[0].message) {
                setPasswordInvalid(true);
                setPasswordErrorMessage(false);
                setPasswordInput(''); // empty input
            }

            setDisableButtonAfterFetching(false); // enable the submit button so that user can change password again after the request is done if user wants to 

        } else {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const openChangeEmailForm = () => {
        setShowEmailInput(true);
        setShowPasswordInput(false);
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        }
    }

    const closeChangeEmailForm = () => {
        setShowEmailInput(false); // hide input
        setEmailInput(''); // empty input
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };           
    };

    const openChangePasswordForm = () => {
        setShowPasswordInput(true);
        setShowEmailInput(false);
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const closeChangePasswordForm = () => {
        setShowPasswordInput(false); // hide input
        setPasswordInput(''); // empty input
        if(!loggedIn()) {
            grabTotalCartQuantity(0);
            grabRedirect(true);
        };
    };

    const handlePasswordInputChange = e => {
        setPasswordInput(e.target.value);
    };
    const handleEmailInputChange = e => setEmailInput(e.target.value);

    return (
        <>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#ff0000',
            color: '#fff'
            }} 
            onClose={() => setEmailInvalid(false)}
            show={emailInvalid}
            delay={3000}
            autohide>
                <Toast.Body>Must be a valid email.</Toast.Body>
            </Toast>
            </div>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#008000',
            color: '#fff'
            }} 
            onClose={() => setUpdateEmailSuccess(false)}
            show={updateEmailSuccess}
            delay={3000}
            autohide>
                <Toast.Body>Your email is successfully changed.</Toast.Body>
            </Toast>
            </div>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#ff0000',
            color: '#fff'
            }} 
            onClose={() => setEmailErrorMessage(false)}
            show={emailErrorMessage}
            delay={3000}
            autohide>
                <Toast.Body>Email is already registered.</Toast.Body>
            </Toast>
            </div>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#ff0000',
            color: '#fff'
            }} 
            onClose={() => setPasswordInvalid(false)}
            show={passwordInvalid}
            delay={3000}
            autohide>
                <Toast.Body>Your password must be at least 8 characters long.</Toast.Body>
            </Toast>
            </div>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#ff0000',
            color: '#fff'
            }} 
            onClose={() => setPasswordErrorMessage(false)}
            show={passwordErrorMessage}
            delay={3000}
            autohide>
                <Toast.Body>Your password cannot be your 5 most recently used passwords.</Toast.Body>
            </Toast>
            </div>
            <div
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                minHeight: '100px',
                top: '6rem',
                right: '1rem'
            }}
            >
            <Toast
            style={{
            width: '100%',
            backgroundColor: '#008000',
            color: '#fff'
            }} 
            onClose={() => setResetPasswordSuccess(false)}
            show={resetPasswordSuccess}
            delay={3000}
            autohide>
                <Toast.Body>Your password is successfully changed.</Toast.Body>
            </Toast>
            </div>
            <div className="settings">
                <header>Account Settings</header>
                <div className="account-information">
                <div className="account-information-container">
                    <div className="account-information-name-container">
                    <div className="information-type">Name</div>
                    <div className="information-info">{settingData.username}</div>
                    </div>
                    <div className="account-information-displayName-container">
                    <div className="information-type">Username</div>
                    <div className="information-info">{settingData.username}</div>
                    </div>
                    <div className="account-information-email-container">
                    <div>
                    <div className="information-type">Email</div>
                    <div className="information-info">{settingData.email}</div>
                    </div>
                    <Button 
                    variant="contained"
                    disabled={showPasswordInput || showEmailInput}
                    onClick={openChangeEmailForm}>Edit</Button>
                    </div>
                    {showEmailInput && (
                        <div>
                        <form className="change-form">
                            <input type="email" value={emailInput} onChange={handleEmailInputChange}/>
                            <Button 
                            variant="contained"
                            disabled={!emailInput || disableButtonAfterFetching} 
                            onClick={handleEmailUpdate}>Submit</Button>
                        </form>
                        <Button
                        variant="contained"
                        onClick={closeChangeEmailForm}>Close</Button>
                        </div>
                    )} 
                    <div className="account-information-password-container">
                    <div>
                    <div className="information-type">Password</div>
                    <div className="information-password-info">●●●●●●●●</div>
                    </div>
                    <Button 
                    variant="contained"
                    disabled={showPasswordInput || showEmailInput} 
                    onClick={openChangePasswordForm}>Edit</Button>
                    </div>
                    {showPasswordInput && (
                        <div>
                        <form className="change-form">
                            <input type="password" value={passwordInput} onChange={handlePasswordInputChange}/>
                            <Button 
                            variant="contained"
                            disabled={!passwordInput.length || disableButtonAfterFetching} 
                            onClick={handleResetPassword}>Submit</Button>
                        </form>
                        <Button
                        variant="contained"
                        onClick={closeChangePasswordForm}>Close</Button>
                        </div>
                    )}
                    {/* <Toast onClose={() => setPasswordInvalid(false)} show={passwordInvalid} delay={3000} autohide>
                        <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}>Your password must be at least 8 characters long.</Toast.Body>
                    </Toast>  
                    <Toast onClose={() => setPasswordErrorMessage(false)} show={passwordErrorMessage} delay={3000} autohide>
                        <Toast.Body style={{backgroundColor: 'rgb(255, 51, 51)'}}> Your password cannot be your 5 most recently used passwords.</Toast.Body>
                    </Toast>  
                    <Toast onClose={() => setResetPasswordSuccess(false)} show={resetPasswordSuccess} delay={3000} autohide>
                        <Toast.Body style={{backgroundColor: 'rgb(57, 172, 57)'}}>Your password is successfully changed.</Toast.Body>
                    </Toast> */}
                    </div>    
                </div>   
            </div>
        </>
    );
};