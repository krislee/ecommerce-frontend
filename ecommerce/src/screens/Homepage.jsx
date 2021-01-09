import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Button from '../components/Button'

function Homepage ({}) {
    return (
        <React.Fragment>
            <BrowserRouter>
                <Link to='/buyer'>
                    <Button name={'Buyer'}/>
                </Link>
                <Link to='/seller'>
                    <Button name={'Seller'}/>
                </Link>
            </BrowserRouter>
        </React.Fragment>
    )
}

export default Homepage