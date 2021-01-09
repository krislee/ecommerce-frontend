import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/Login.css'

function Login ({}) {
    return (
        <form className="login">
            <Input name={'Username'}/>
            <Input name={'Email'}/>
            <Input name={'Password'}/>
            <Link to="/">
                <Button name={'Submit'}></Button>
            </Link>
        </form>
    )
}

export default Login