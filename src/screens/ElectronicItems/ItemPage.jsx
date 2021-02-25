import React, { useEffect, useState } from 'react'
import {useLocation} from 'react-router-dom';
import '../../styles/ItemPage.css'
import AddCartButton from '../../components/Buttons/AddCartButton';
import AddReviewButton from '../../components/Buttons/AddReviewButton';
// import NavBar from '../../components/NavigationBar';
import Footer from '../../components/Footer'
import AllReviews from '../../components/Reviews/AllReviews'
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import Toast from 'react-bootstrap/Toast'

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
    const [nameOfItemLength, setNameOfItemLength] = useState(0);
    const [showAddItemAlert, setShowAddItemAlert] = useState(false)
    const [showAddItemDifferenceAlert, setShowAddItemDifferenceAlert] = useState(false)
    const [differenceQuantity, setDifferenceQuantity] = useState(0)

    const [prevLoggedIn, setPrevLoggedIn] = useState(localStorage.getItem('token')) // when we first load the item page check if user is logged in, storing the token value or null value to prevLoggedIn state, which then passes to AddCartButton; if user then clears the local storage once the item page is loaded, we will not be able to add an item (view at AddCartButton component)

    const grabReview = (review) => setReview(review)
    const grabShowAddItemAlert = (showAddItemAlert) => setShowAddItemAlert(showAddItemAlert)
    const grabShowAddItemDifferenceAlert = (showAddItemDifferenceAlert) => setShowAddItemDifferenceAlert(showAddItemDifferenceAlert)
    const grabDifferenceQuantity = (differenceQuantity) => setDifferenceQuantity(differenceQuantity)
    
    const location = useLocation() //get the full URL which will be parsed in the else statement to get the query value if user decides to not go through the /shop page but straight to the URL

    useEffect(() => {
        
        const abortController = new AbortController()
        const signal = abortController.signal

        if(!loggedIn()) grabTotalCartQuantity(0) // If user clears local storage, and then clicks on the item from the individual order receipt, we need to update the shopping badge icon in the nav bar

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
                setNameOfItemLength(data.electronicItem.Name.length);
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
                setNameOfItemLength(data.electronicItem.Name.length);
                setAllReviews(data.review)
                setAvgRating(data.avgRating)
            }

            fetchData();
            // nameOfItem();
            return function cleanUp () {
                abortController.abort()
            }
        }
    }, [review]);

    const handleAddItemQuantity = (event) => {
        const { value } = event.target
        console.log(value, typeof value)
        setQuantity(parseInt(value))
    };


    // const nameOfItem = () => {
    //     if (nameOfItemLength < 20) {
    //         return itemInfo.Name
    //     } else {
    //         return `${itemInfo.Name.split(" ").splice(0, 7).join(" ")}...`
    //     }
    // }

    if (!itemInfo) {
        return null
    } else {
        return (
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
                                <Rating name="size-small" value={avgRating} size="small" precision={0.1} readOnly/>
                            </div>
                            <div className="price">Price: ${itemInfo.Price}</div>
                            <div className="description">Description: {itemInfo.Description}</div>
                        </div>
                        <div className="input-info">
                            <div className="quantity-tag">Quantity</div>
                            <select value={quantity} onChange={handleAddItemQuantity}>
                                <option value={1}>01</option>
                                <option value={2}>02</option>
                                <option value={3}>03</option>
                                <option value={4}>04</option>
                                <option value={5}>05</option>
                                <option value={6}>06</option>
                                <option value={7}>07</option>
                                <option value={8}>08</option>
                                <option value={9}>09</option>
                                <option value={10}>10</option>
                            </select>
                            {/* <input className="quantity-input" type="number" min="1" max="12" value={quantity} onChange={handleChangeQuantity} />
                            {notANumber && <div className="warning">You input must be a number</div>}
                            {negativeWarning && <div className="warning">You can't have a negative amount of items</div>}
                            {upToTwelve && <div className="warning">You can only buy twelve items at once</div>} */}
  
                            <Toast onClose={() => setShowAddItemAlert(false)} show={showAddItemAlert} delay={3000} autohide>
                                    <Toast.Body>The maximum quantity of this item has already been added to your cart.</Toast.Body>
                            </Toast>

                            <Toast onClose={() => setShowAddItemDifferenceAlert(false)} show={showAddItemDifferenceAlert} delay={3000} autohide>
                                    <Toast.Body>{differenceQuantity} item(s) has been moved to your cart. You have now reached the maximum quantity of 10 for this item.`</Toast.Body>
                            </Toast>
                  
                        <AddCartButton backend={backend} loggedIn={loggedIn} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} grabTotalCartQuantity={grabTotalCartQuantity}  prevLoggedIn={prevLoggedIn} grabShowAddItemAlert={grabShowAddItemAlert} differenceQuantity={differenceQuantity} grabDifferenceQuantity={grabDifferenceQuantity} grabShowAddItemDifferenceAlert={grabShowAddItemDifferenceAlert} />

                            <AddReviewButton backend={backend} loggedIn={loggedIn} electronicID={itemInfo._id} grabReview={grabReview} grabTotalCartQuantity={grabTotalCartQuantity} />
                        </div>
                    </div>
                </div>
            </div>
            <AllReviews backend={backend} allReviews={allReviews} />
            <Footer />
        </div>
        )
    }
}

export default ItemPage