import React from 'react'
import {Link} from 'react-router-dom';
import Button from '../../components/Buttons/Button'
import Register from '../../components/Register'
import Footer from '../../components/Footer'
import '../../styles/Login.css'

function BuyerRegister ({backend, loggedIn, grabLoginInfo}) {
    return (
        <div className="buyer-login">
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Register backend={backend} grabLoginInfo={grabLoginInfo} loggedIn={loggedIn} seller={true}/>
            <Footer />
        </div>
    )
}

export default BuyerRegister