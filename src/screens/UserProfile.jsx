import React, { useEffect, useState } from 'react'
// import {Link} from 'react-router-dom';
// import Button from '../components/Button'
// import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function UserProfile ({backend}) {

    useEffect(() => {
        console.log(backend);
    })

    return (
        <div className="user-profile">
            <div>User Profile</div>
        </div>
    )
}

export default UserProfile