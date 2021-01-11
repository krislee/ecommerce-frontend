import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/ItemPage.css'
import AddCartButton from '../components/AddCartButton';
import NavBar from '../components/NavigationBar';

function ItemPage ({ url }) {

    const [itemInfo, setItemInfo] = useState('');
    const [quantity, setQuantity] = useState(1);
    const itemURL = 'http://localhost:3001';
    let currentURL = window.location.href;
    let indexOfEqualSign = currentURL.split('=');
    let id=indexOfEqualSign[indexOfEqualSign.length - 1];

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
                let resp = await fetch(`${itemURL}/buyer/electronic/${id}`);
                let data = await resp.json();
                // console.log(data)
                setItemInfo(data.electronicItem);
            }
            fetchData();
        }
    }, [])

    const handleChangeQuantity = e => {
        setQuantity(e.target.value)
    };

    return (
        // Name, price, description, add to cart
        <div className="item-info">
            <NavBar />
            <div className="name">{itemInfo.Name}</div>
            <div className="price">Price: ${itemInfo.Price}</div>
            <div className="description">Description: {itemInfo.Description}</div>
            <input type="number" value={quantity} onChange={handleChangeQuantity}></input>
            <br />
            <AddCartButton url={itemURL} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} />
        </div>
    )
}

export default ItemPage