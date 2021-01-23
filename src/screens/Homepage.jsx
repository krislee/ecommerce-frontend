import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Button from '../components/Button';
import Item from '../components/Item';
import '../styles/Homepage.css'
import NavBar from '../components/NavigationBar'

function Homepage ({ grabURL }) {

    const URL = "http://localhost:3001"
    // const URL = `https://elecommerce.herokuapp.com`

    const [items, setItems] = useState([]);
    // const [isLoaded, setIsLoaded] = useState(false);
    // const [isItemSelected, setIsItemSelected] = useState(false);
    const electronicURL = `${URL}/buyer/electronic`
    // const url = "http://localhost:3001/buyer/electronic/"

    useEffect(() => {
        async function fetchItems() {
            const resp = await fetch(electronicURL);
            const data = await resp.json();
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            // setIsLoaded(true)
        };
        fetchItems();
    },[electronicURL])




    const itemList = items.map((item, index) => 
        <React.Fragment key={index}>
        <Link to={{
            pathname:"/store",
            search: `?${item.Name}=${item._id}`
        }}>
            <Item 
            id={item._id}
            name={item.Name}
            description={item.Description}
            url={`${electronicURL}/${item._id}`}
            grabURL={grabURL}
            />
        </Link>
        </React.Fragment>
    )

    return (
        <React.Fragment>
            <NavBar />
            <div className="login-button">
            <Link to='/buyer'>
                <Button name={'Buyer'}/>
            </Link>
            <Link to='/seller'>
                <Button name={'Seller'}/>
            </Link>
            </div>
            {<div className="itemContainer">
                {itemList}
            </div>}
            {/* {isItemSelected && } */}
        </React.Fragment>
    )
}

export default Homepage