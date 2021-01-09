import React, {useEffect, useState} from 'react'
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import Button from '../components/Button';
import Item from '../components/Item';

function Homepage ({}) {

    const [items, setItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function fetchItems() {
            const resp = await fetch("http://localhost:3001/buyer/electronic");
            const data = await resp.json();
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            setIsLoaded(true)
        };
        fetchItems();
    },[])

    const itemList = items.map(item => 
        <Item 
        key={item._id}
        name={item.name}
        />
    )

    return (
        <React.Fragment>
            <Link to='/buyer'>
                <Button name={'Buyer'}/>
            </Link>
            <Link to='/seller'>
                <Button name={'Seller'}/>
            </Link>
            {itemList}
            <button onClick={() => console.log(items)}>Test</button>
        </React.Fragment>
    )
}

export default Homepage