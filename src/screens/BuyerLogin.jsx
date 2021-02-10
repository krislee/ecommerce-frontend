import React from 'react'
import {Link} from 'react-router-dom';
import Button from '../components/Button'
import Login from '../components/Login'
import Footer from '../components/Footer'
import '../styles/Login.css'

function BuyerLogin ({backend, grabLoginInfo}) {
    return (
        <div className="buyer-login">
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Login backend={backend} grabLoginInfo={grabLoginInfo}/>
            <Footer />
        </div>
    )
}

export default BuyerLogin