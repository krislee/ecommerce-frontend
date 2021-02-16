import React, {useEffect, useState} from 'react'
import {Link, useParams, useHistory} from 'react-router-dom';
import Item from '../components/Item';
import '../styles/Homepage.css'
import NavBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import { makeStyles } from '@material-ui/core/styles';
import { Pagination, PaginationItem } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        marginTop: theme.spacing(2),
      },
    },
}));

function AllItems ({ loggedIn, grabURL, backend }) {
    const classes = useStyles();

    const [footerLoading, setFooterLoading] = useState(true) // this state allows for the footer to be loaded at the SAME TIME as items being loaded in, instead of being loaded less than a second BEFORE the items are loaded in

    const {pageIndex} = useParams() // use the param from URL in the useEffect fetch to load the items automatically corresponding to that particular page; also since we still need to highlight the pagination number when we do not click on the number but by going to the page directly, we can use the param from URL to highlight the pagination number
    const history = useHistory()

    const [items, setItems] = useState([]); // store all the items in items state

    useEffect(() => {
        async function fetchItems() {
            const resp = await fetch(`${backend}/buyer/electronic?page=${pageIndex}`);
            const data = await resp.json();
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            setFooterLoading(false)
        };
        fetchItems();
    },[])

    const handlePageOnChange = async(event, page) => {
        history.replace({
            pathname: `/shop/${page}` // when we click on the pagination number, we want to update the URL param with the clicked pagination number (represented by page)
        })
        const resp = await fetch(`${backend}/buyer/electronic?page=${page}`);
        const data = await resp.json();
        console.log(data.allElectronic);
        setItems(data.allElectronic)
    }

    const itemList = items.map((item, index) => 
        <React.Fragment key={index}>
        <Link className="homepage-items" to={{
            pathname:"/store",
            search: `?${item.Name}=${item._id}`
        }}>
            <Item 
            name={item.Name}
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
                    <div className={classes.root}>
                        <Pagination showFirstButton showLastButton size="large" variant="outlined" shape="rounded" page={Number(pageIndex)} count={2} siblingCount={1} boundaryCount={2} onChange={handlePageOnChange} />
                    </div>        
                </div>}
            </div>
     
            <Footer footerLoading={footerLoading}/>
        </div>
    )
}



export default AllItems