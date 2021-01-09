import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'

function SellerLogin ({}) {
    return (
        <React.Fragment>
            <Input name={'Seller Login'}/>
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
        </React.Fragment>
    )
}

export default SellerLogin