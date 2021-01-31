import React, {useEffect, useState} from 'react'
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/ItemPage.css'
import AddCartButton from '../components/AddCartButton';
import NavBar from '../components/NavigationBar';

function ItemPage ({ url, backend, loggedIn }) {

    const [itemInfo, setItemInfo] = useState('');
    const [quantity, setQuantity] = useState(1);
    // const itemURL = 'http://localhost:3001';
    // const itemURL = 'https://elecommerce.herokuapp.com'
    
    let currentURL = window.location.href;
    let indexOfEqualSign = currentURL.split('=');
    let id=indexOfEqualSign[indexOfEqualSign.length - 1];

    useEffect(() => {
        console.log(currentURL)
        if (url !== '') {
            async function fetchData() {
                let resp = await fetch(`${url}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                let data = await resp.json();
                setItemInfo(data.electronicItem);
            }
            fetchData();
        } else {
            async function fetchData() {
                let resp = await fetch(`${backend}/buyer/electronic/${id}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                let data = await resp.json();
                // console.log(data)
                setItemInfo(data.electronicItem);
            }
            fetchData();
        }
    }, [currentURL, id, url, backend])

    const handleChangeQuantity = e => {
        setQuantity(e.target.value)
    };

    return (
        // Name, price, description, add to cart
        <div className="item-page">
            {localStorage.getItem('loggedIn') ? 
            <>
                <NavBar />
            </>
             : <NavBar />}
            <div className="item-info">
                <div className="name">{itemInfo.Name}</div>
                <div className="price">Price: ${itemInfo.Price}</div>
                <div className="description">Description: {itemInfo.Description}</div>
                <input type="number" value={quantity} onChange={handleChangeQuantity}></input>
            </div>
            <AddCartButton backend={backend} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} />
        </div>
    )
}

export default ItemPage