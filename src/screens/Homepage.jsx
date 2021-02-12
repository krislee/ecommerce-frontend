import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Item from '../components/Item';
import '../styles/Homepage.css'
import NavBar from '../components/NavigationBar'
import Footer from '../components/Footer'

function Homepage ({ loggedIn, grabURL, backend }) {

    const [items, setItems] = useState([]);


    useEffect(() => {
        async function fetchItems() {
            const resp = await fetch(`${backend}/buyer/electronic`);
            const data = await resp.json();
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            console.log(backend);
            // setIsLoaded(true)
        };
        fetchItems();
    },[])

    const itemList = items.map((item, index) => 
        <React.Fragment key={index}>
        <Link className="homepage-items" to={{
            pathname:"/store",
            search: `?${item.Name}=${item._id}`
        }
        }>
            <Item 
            // id={item._id}
            name={item.Name}
            // description={item.Description}
            itemUrl={`${backend}/buyer/electronic/${item._id}`}
            grabURL={grabURL}
            />
        </Link>
        </React.Fragment>
    )

    return (
        <div className="homepage-container">
            <NavBar />
            <div className="display-item-container">
                {<div className={loggedIn() ? 'itemContainerLoggedIn' : 'itemContainer'}>
                    {itemList}
                </div>}
            </div>
            <Footer />
        </div>
    )
}

export default Homepage