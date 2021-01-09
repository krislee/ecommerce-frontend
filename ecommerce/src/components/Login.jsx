import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/Login.css'

function Login ({}) {
    return (
        <div className="login">
            <Input name={'Username'}/>
            <Input name={'Email'}/>
            <Input name={'Password'}/>
            <Link to="/">
                <Button name={'Submit'}></Button>
            </Link>
        </div>
    )
}

export default Login