import React from 'react'
import {Link} from 'react-router-dom';
// import Input from '../components/Input'
import Button from '../components/Button'
import Login from '../components/Login'

function SellerLogin ({backend}) {
    return (
        <React.Fragment>
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Login backend={backend}/>
        </React.Fragment>
    )
}

export default SellerLogin