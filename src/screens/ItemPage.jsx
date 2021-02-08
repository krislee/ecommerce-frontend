import React, {useEffect, useState} from 'react'
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import '../styles/ItemPage.css'
import AddCartButton from '../components/AddCartButton';
import NavBar from '../components/NavigationBar';

function ItemPage ({ url, backend }) {

    const [itemInfo, setItemInfo] = useState('');
    const [quantity, setQuantity] = useState(1);
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
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                let data = await resp.json();
                console.log(data)
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
        <div className="item-page">
            <NavBar />
            <div className="item-info">
                <div className="left-side-item-page">
                    <div class="item-image">Image of Item Here</div>
                </div>
                <div className="right-side-item-page">
                    <div className="item-logistics">
                        <div>
                            <div className="name">{itemInfo.Name}</div>
                            <div className="price">Price: ${itemInfo.Price}</div>
                            <div className="description">Description: {itemInfo.Description}</div>
                        </div>
                        <div class="input-info">
                        <div class="quantity-tag">Quantity</div>
                        <input  className="quantity-input" type="number" value={quantity} onChange={handleChangeQuantity}></input>
                        <AddCartButton backend={backend} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemPage