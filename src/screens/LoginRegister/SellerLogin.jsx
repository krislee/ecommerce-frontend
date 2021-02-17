import React from 'react'
import {Link} from 'react-router-dom';
import Button from '../../components/Buttons/Button'
import Login from '../../components/Login'
import Footer from '../../components/Footer'
import '../../styles/Login.css'

function SellerLogin ({backend, loggedIn, grabLoginInfo}) {
    return (
        <div className="seller-login">
            <Link to="/">
                <Button name={'Back'}></Button>
            </Link>
            <Login backend={backend} grabLoginInfo={grabLoginInfo} loggedIn={loggedIn} seller={true}/>
            <Footer />
        </div>
    )
}

export default SellerLogin