import React from 'react'
import {Link} from 'react-router-dom';
import Register from '../../components/LoginRegister/Register'
import Footer from '../../components/Footer'
// import '../../styles/Login.css'

function BuyerRegister ({backend, loggedIn, }) {
    return (
        <div className="buyer-login">
            <Link to="/">
                <button>Back</button>
            </Link>
            <Register backend={backend} loggedIn={loggedIn} seller={true}/>
            <Footer />
        </div>
    )
}

export default BuyerRegister