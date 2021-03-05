import React from 'react'
import {Link} from 'react-router-dom';
import Login from '../../components/LoginRegister/Login'
import Footer from '../../components/Footer'
// import '../../styles/Login.css'

function SellerLogin ({backend, loggedIn }) {
    return (
        <div className="seller-login">
            <Link to="/">
                <button>Back</button> 
            </Link>
            <Login backend={backend} loggedIn={loggedIn} seller={true}/>
            <Footer />
        </div>
    )
}

export default SellerLogin