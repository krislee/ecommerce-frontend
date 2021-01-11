import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Input from '../components/Input'
import Button from '../components/Button'
import Login from '../components/Login'
// import '../styles/BuyerLogin.css'

function ItemPage ({ url }) {

    const [itemInfo, setItemInfo] = useState('');
    const itemURL = 'http://localhost:3001/buyer/electronic'
    let currentURL = window.location.href
    let indexOfEqualSign = currentURL.split('=')
    let id=indexOfEqualSign[indexOfEqualSign.length - 1]

    useEffect(() => {
        console.log(currentURL)
        if (url !== '') {
            async function fetchData() {
                let resp = await fetch(`${url}`);
                let data = await resp.json();
                setItemInfo(data.electronicItem);
            }
            fetchData();
        } else {
            async function fetchData() {
                let resp = await fetch(`${itemURL}/${id}`);
                let data = await resp.json();
                setItemInfo(data.electronicItem);
            }
            fetchData();
        }
    }, [])

    return (
        // Name, price, add to cart
        <div className="item-info">
            <div>Name: {itemInfo.Name}</div>
            <div>Price: ${itemInfo.Price}</div>
            <Button name={'Add To Cart'} />
        </div>
    )
}

export default ItemPage