import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function ItemPage ({ url }) {

    const [itemInfo, setItemInfo] = useState('')
    
    useEffect(() => {
        async function grabItemInformation() {
            const resp = await fetch(`${url}`);
            const data = await resp.json();
            console.log(data);
            setItemInfo(data.Name);
        }
    }, [])

    return (
        <div className="item-info">
            <div>{itemInfo}</div>
        </div>
    )
}

export default ItemPage