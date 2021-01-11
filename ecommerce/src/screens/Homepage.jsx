import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Button from '../components/Button';
import Item from '../components/Item';
import '../styles/Homepage.css'

function Homepage ({}) {

    const [items, setItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const electronicURL = "http://localhost:3001/buyer/electronic"

    useEffect(() => {
        async function fetchItems() {
            const resp = await fetch(electronicURL);
            const data = await resp.json();
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            setIsLoaded(true)
        };
        fetchItems();
    },[])

    const itemList = items.map((item, index) => 
        <Item 
        key={index}
        id={item._id}
        name={item.Name}
        description={item.Description}
        />
    )

    console.log(items);

    return (
        <React.Fragment>
            <div className="login-button">
            <Link to='/buyer'>
                <Button name={'Buyer'}/>
            </Link>
            <Link to='/seller'>
                <Button name={'Seller'}/>
            </Link>
            </div>
            <div className="itemContainer">
                {itemList}
            </div>
        </React.Fragment>
    )
}

export default Homepage