import React from 'react'
import {Link} from 'react-router-dom';
import Login from '../../components/Login'
import Footer from '../../components/Footer'
import '../../styles/Login.css'

function BuyerLogin ({backend, loggedIn }) {
    return (
        <div className="buyer-login">
            <Link to="/">
                <button>Back</button>
            </Link>
            <Login backend={backend} loggedIn={loggedIn} buyer={true}/>
            <Footer />
        </div>
    )
}

export default BuyerLogin