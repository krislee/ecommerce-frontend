import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function ItemPage ({ url }) {

    const [itemInfo, setItemInfo] = useState('')
    
    useEffect(() => {
        async function fetchData() {
            let resp = await fetch(`${url}`);
            let data = await resp.json();
            setItemInfo(data.electronicItem.Name);
        }
        fetchData();
        // console.log(url)
    }, [])

    return (
        <div className="item-info">
            <div>{itemInfo}</div>
        </div>
    )
}

export default ItemPage