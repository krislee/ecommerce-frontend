import React from 'react'
import {Link} from 'react-router-dom';
// import Input from '../components/Input'
import Button from '../components/Button'
import Login from '../components/Login'

function SellerLogin () {
    return (
        <React.Fragment>
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Login />
        </React.Fragment>
    )
}

export default SellerLogin