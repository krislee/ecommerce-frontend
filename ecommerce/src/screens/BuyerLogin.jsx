import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import '../styles/BuyerLogin.css'

function BuyerLogin ({}) {
    return (
        <div className="buyer-login">
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Input name={'Username'}/>
            <Input name={'Email'}/>
            <Input name={'Password'}/>
        </div>
    )
}

export default BuyerLogin