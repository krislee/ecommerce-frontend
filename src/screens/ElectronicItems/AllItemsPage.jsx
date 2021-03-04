import React, { useEffect, useState } from 'react'
import {Link, useParams, useHistory} from 'react-router-dom';
import Item from '../../components/Item';
import '../../styles/Items/AllItems.css'
// import NavBar from '../../components/NavigationBar'
import Footer from '../../components/Footer'
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        marginTop: theme.spacing(2),
      },
    },
}));

function AllItems ({ loggedIn, grabURL, backend, totalCartQuantity, grabTotalCartQuantity }) {
    const classes = useStyles();

    const [footerLoading, setFooterLoading] = useState(true) // this state allows for the footer to be loaded at the SAME TIME as items being loaded in, instead of being loaded less than a second BEFORE the items are loaded in

    const {pageIndex} = useParams() // use the param from URL in the useEffect fetch to load the items automatically corresponding to that particular page; also since we still need to highlight the pagination number when we do not click on the number but by going to the page directly, we can use the param from URL to highlight the pagination number
    const history = useHistory()

    const [items, setItems] = useState([]); // store all the items in items state
    const [totalItemsPage, setTotalItemsPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(0)

    useEffect(() => {
        
        const abortController = new AbortController()
        const signal = abortController.signal

        async function fetchItems() {
            const resp = await fetch(`${backend}/buyer/electronic?page=${pageIndex}`, {
                method: 'GET',
                headers: { 'Content-Type' : 'application/json' },
                signal: signal
            });
            const data = await resp.json();
            console.log(data)
            console.log(data.allElectronic);
            setItems(data.allElectronic);
            setTotalItemsPage(data.totalPages)
            setPageLimit(data.pageLimit)
            setFooterLoading(false)
        };

        fetchItems();

        return function cleanUp () {
            abortController.abort()
        }
        
    },[])

    const handlePageOnChange = async(event, page) => {
        history.replace({
            pathname: `/shop/${page}` // when we click on the pagination number, we want to update the URL param with the clicked pagination number (represented by page)
        })
        const resp = await fetch(`${backend}/buyer/electronic?page=${page}`);
        const data = await resp.json();
        console.log(data.allElectronic);
        setItems(data.allElectronic)
        // setTotalItemsPage(data.totalPages)
    }

    const itemList = items.map((item, index) => 
        <div className="individual-store-item-container" key={index}>
            <div className="individual-store-item-img"><img src={item.Image[0]} /></div>
            <div className="item-name-link">
            <Link className="homepage-items" to={{
                pathname:`/item/${item.Name}`,
                search: `id=${item._id}`
            }}>
                <Item 
                name={item.Name}
                itemUrl={`${backend}/buyer/electronic/${item._id}`}
                grabURL={grabURL}
                />
            </Link>
            </div>
        </div>
    )

    const retrieveDivID = () => {
        console.log(87, pageIndex, totalItemsPage)
        if(Number(pageIndex) === totalItemsPage) {
            console.log(88, items.length % pageLimit)
            if(items.length % pageLimit === 0) return 'even'
            else return 'odd'
        } else {
            console.log(92, pageLimit % 2)
            if(pageLimit % 2 === 0) return 'even'
            else return 'odd'
        }
    }
    return (
        <>
        <div className="homepage-container">
            {<div className={ retrieveDivID() === 'even' ? 'store-item-container-even' :'store-item-container-odd'}>
                {itemList}     
            </div>}
            <div className={classes.root}>
                <Pagination size="large" variant="outlined" shape="rounded" count={totalItemsPage} onChange={handlePageOnChange} siblingCount={0} />
            </div>   
        </div>
        <Footer footerLoading={footerLoading}/>
        </>
    )
}



export default AllItems
// 002424
// tabindex="-1"