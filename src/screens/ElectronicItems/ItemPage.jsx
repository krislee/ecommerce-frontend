import React, { useEffect, useState } from 'react'
import {useLocation} from 'react-router-dom';
import '../../styles/ItemPage.css'
import AddCartButton from '../../components/Buttons/AddCartButton';
import AddReviewButton from '../../components/Buttons/AddReviewButton';
import NavBar from '../../components/NavigationBar';
import Footer from '../../components/Footer'
import AllReviews from '../../components/Reviews/AllReviews'
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
}));

function ItemPage ({ loggedIn, url, backend, totalCartQuantity, grabTotalCartQuantity }) {
    const classes = useStyles()

    const [itemInfo, setItemInfo] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [avgRating, setAvgRating] = useState(null);
    const [review, setReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [upToTwelve, setUpToTwelve] = useState(false);
    const [notANumber, setNotANumber] = useState(false);
    const [negativeWarning, setNegativeWarning] = useState(false);

    const grabReview = (review) => setReview(review)

    const location = useLocation() //get the full URL which will be parsed in the else statement to get the query value if user decides to not go through the /shop page but straight to the URL

    useEffect(() => {
        
        const abortController = new AbortController()
        const signal = abortController.signal

        // If the url to the backend is not empty because users directly went to the item page going through the homepage first
        if (url !== '') {
            async function fetchData() {
                // fetch the url provided to go to the server backend and grab the item using a GET request
                let resp = await fetch(`${url}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    signal: signal
                });
                let data = await resp.json();
                console.log(31, data)
                setItemInfo(data.electronicItem);
                setAllReviews(data.review)
                setAvgRating(data.avgRating)
            }

            fetchData();

            return function cleanUp () {
                abortController.abort()
            }

        } else {

            // If we are going to the item page not through the homepage
            // If the url to the backend is empty, then we need to grab the item using the id which is located in the url params
            const queryParams = new URLSearchParams(location.search) // returns query obj
            const electronicID = queryParams.get("id") // get the query value
            console.log(electronicID)
            async function fetchData() {
                let resp = await fetch(`${backend}/buyer/electronic/${electronicID}`,{
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: signal
                });
                let data = await resp.json();
                console.log(49, data)
                setItemInfo(data.electronicItem);
                setAllReviews(data.review)
                setAvgRating(data.avgRating)
            }

            fetchData();

            return function cleanUp () {
                abortController.abort()
            }
        }
    }, [review])

    const handleChangeQuantity = e => {
        if (e.target.value.includes('-')) {
            setNegativeWarning(true);
        } else {
            setNegativeWarning(false);
            if (e.target.value.length > 2) {
                setQuantity(e.target.value.slice(0, 2))
            } else {
                setQuantity(e.target.value)
            }
        }
    };

    const grabHandleUpToTwelve = (bool) => {
        setUpToTwelve(bool);
    }

    const grabNotANumber = (bool) => {
        setNotANumber(bool)
    };

    return (
        // Name, price, description, add to cart
        <div className="item-page">
            {/* <NavBar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} backend={backend} loggedIn={loggedIn}/> */}
            <div className="item-info">
                <div className="left-side-item-page">
                    <div className="item-image">Image of Item Here</div>
                </div>
                <div className="right-side-item-page">
                    <div className="item-logistics">
                        <div>
                            <div className="name">{itemInfo.Name}</div>
                            <div className={classes.root}>
                                <Rating name="size-small" value={avgRating} size="small" precision={0.25} readOnly/>
                            </div>
                            <div className="price">Price: ${itemInfo.Price}</div>
                            <div className="description">Description: {itemInfo.Description}</div>
                        </div>
                        <div className="input-info">
                            <div className="quantity-tag">Quantity</div>
                            <input className="quantity-input" type="number" min="1" value={quantity} onChange={handleChangeQuantity} />
                            {notANumber && <div className="warning">You input must be a number</div>}
                            {negativeWarning && <div className="warning">You can't have a negative amount of items</div>}
                            {upToTwelve && <div className="warning">You can only buy twelve items at once</div>}
                            <AddCartButton backend={backend} loggedIn={loggedIn} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} grabTotalCartQuantity={grabTotalCartQuantity} grabHandleUpToTwelve={grabHandleUpToTwelve} grabNotANumber={grabNotANumber}/>
                            <AddReviewButton backend={backend} loggedIn={loggedIn} electronicID={itemInfo._id} grabReview={grabReview} />
                        </div>
                    </div>
                </div>
            </div>
            <AllReviews backend={backend} allReviews={allReviews} />
            <Footer />
        </div>
    )
}

export default ItemPage