import React, { useEffect, useState, useRef, useContext } from 'react'
import {useLocation} from 'react-router-dom';
import AddCartButton from '../../components/Buttons/AddCartButton';
import AddReviewButton from '../../components/Buttons/AddReviewButton';
// import NavBar from '../../components/NavigationBar';
import Footer from '../../components/Footer'
import AllReviews from '../../components/Reviews/AllReviews'

import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Toast from 'react-bootstrap/Toast';

import VisibilitySensor from 'react-visibility-sensor';
// import { useInView } from 'react-hook-inview'
import { InView } from 'react-intersection-observer';

import Pulse from 'react-reveal/Pulse';
import Flip from 'react-reveal/Flip';
// import { useInView } from 'react-intersection-observer';
import { motion, useTransform, useViewportScroll } from 'framer-motion';




// import Swiper core and required modules
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import '../../styles/Items/ItemPage.css'

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        "margin-top": '1rem'
    },
}));


function ItemPage ({ loggedIn, url, backend, totalCartQuantity, grabTotalCartQuantity }) {

    const classes = useStyles()

    // const [ref, inView] = useInView({
    //     // triggerOnce: true,
    //     // rootMargin: '300px 0px'
    //     threshold: 0.1
    // })

    // const [imgViz, setImgViz] = useState(false)

    const [open, setOpen] = useState(false);
    
    const [showItemDetails, setShowItemDetails] = useState(true)
    const [itemInfo, setItemInfo] = useState('');
    const [ownPageInfo, setOwnPageInfo] = useState('')
    const [notOwnPageInfo, setNotOwnPageInfo] = useState('')
    const [nameOfItemLength, setNameOfItemLength] = useState(0);

    const [quantity, setQuantity] = useState(1);
    const [avgRating, setAvgRating] = useState(null);

    const [review, setReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [allReviewsTotal, setAllReviewsTotal] = useState(1)
    const [electronicID, setElectronicID] = useState(null)

    const [showAddItemAlert, setShowAddItemAlert] = useState(false)
    const [showAddItemDifferenceAlert, setShowAddItemDifferenceAlert] = useState(false)
    const [differenceQuantity, setDifferenceQuantity] = useState(0)

    const [prevLoggedIn, setPrevLoggedIn] = useState(localStorage.getItem('token')) // when we first load the item page check if user is logged in, storing the token value or null value to prevLoggedIn state, which then passes to AddCartButton; if user then clears the local storage once the item page is loaded, we will not be able to add an item (view at AddCartButton component)

    const grabAllReviews = (allReviews) => setAllReviews(allReviews)
    const grabReview = (review) => setReview(review)
    const grabShowAddItemAlert = (showAddItemAlert) => setShowAddItemAlert(showAddItemAlert)
    const grabShowAddItemDifferenceAlert = (showAddItemDifferenceAlert) => setShowAddItemDifferenceAlert(showAddItemDifferenceAlert)
    const grabDifferenceQuantity = (differenceQuantity) => setDifferenceQuantity(differenceQuantity)
    
    const location = useLocation() //get the full URL which will be parsed in the else statement to get the query value if user decides to not go through the /shop page but straight to the URL

    useEffect(() => {
        
        const abortController = new AbortController()
        const signal = abortController.signal

        if(!loggedIn()) grabTotalCartQuantity(0) // If user clears local storage, and then clicks on the item from the individual order receipt, we need to update the shopping badge icon in the nav bar

         // If we are going to the item page not through the homepage
        // If the url to the backend is empty, then we need to grab the item using the id which is located in the url params
        const queryParams = new URLSearchParams(location.search) // returns query obj
        const electronicID = queryParams.get("id") // use the electronicID in the else statement
        setElectronicID(electronicID) //send the electronicID down to reviews

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
                setOwnPageInfo(data.ownPageElectronic)
                setNotOwnPageInfo(data.notOwnPageElectronic)
                setNameOfItemLength(data.electronicItem.Name.length);
                setAllReviews(data.review)
                setAllReviewsTotal(data.totalReviews)
                setAvgRating(data.avgRating)
                setShowItemDetails(false)
            }
            fetchData();

            return function cleanUp () {
                abortController.abort()
            }

        } else {

            // If we are going to the item page not through the homepage
            // If the url to the backend is empty, then we need to grab the item using the id which is located in the url params
            // const queryParams = new URLSearchParams(location.search) // returns query obj
            // const electronicID = queryParams.get("id") // get the query value
            // console.log(electronicID)
            // setElectronicID(electronicID)
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
                setOwnPageInfo(data.ownPageElectronic)
                setNotOwnPageInfo(data.notOwnPageElectronic)
                setNameOfItemLength(data.electronicItem.Name.length);
                setAllReviews(data.review)
                setAllReviewsTotal(data.totalReviews)
                setAvgRating(data.avgRating)
                setShowItemDetails(false)
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


    if (showItemDetails) {
        return null
    } else {
        return (
            <div className="item-page">
            {/* <NavBar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} backend={backend} loggedIn={loggedIn}/> */}
            <div className="item-info">
                <div className="left-side-item-page">
                    
                    {/* <div className="item-image">Image of Item Here</div> */}
                    <Swiper
                    id="main-swiper"
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                    onSwiper={(swiper) => console.log(swiper)}
                    onSlideChange={() => console.log('slide change')}
                    >
                    {itemInfo.Image.map((image, index) =>{ return (
                        <SwiperSlide key={index}><div><img src={image} /></div></SwiperSlide>
                    )})}
                    </Swiper>
                </div>
                <div className="right-side-item-page">
                    <div className="item-logistics">
                        <div>
                            <div className="item-name"><b id="item-brand">{itemInfo.Brand}</b> {itemInfo.Name}</div>
                            <div className={classes.root}>
                                <div id="item-ratings-container">
                                    <Rating name="size-small" value={avgRating} size="small" precision={0.1} readOnly/>
                                    <div id="total-ratings">({allReviews.length})</div>
                                </div>
                                <div id="add-review-container">
                                    <AddReviewButton backend={backend} loggedIn={loggedIn} electronicID={itemInfo._id} grabReview={grabReview} grabTotalCartQuantity={grabTotalCartQuantity} />
                                </div>
                            </div>
                            <div className="price"><b>${itemInfo.Price.toFixed(2)}</b></div>
                            {/* <div className="description">Description: {itemInfo.Description}</div> */}
                        </div>
                    </div>
                        <Toast onClose={() => setShowAddItemAlert(false)} show={showAddItemAlert} 
                         delay={3000} autohide
                        >
                            <Toast.Body>The maximum quantity of this item has already been added to your cart.</Toast.Body>
                        </Toast>

                        <Toast onClose={() => setShowAddItemDifferenceAlert(false)} show={showAddItemDifferenceAlert} 
                        delay={3000} autohide
                        >
                            <Toast.Body>{differenceQuantity} item(s) has been moved to your cart. You have now reached the maximum quantity of 10 for this item.</Toast.Body>
                        </Toast>
                        <div className={showAddItemAlert || showAddItemDifferenceAlert ?"input-info-with-alert" : "input-info"}>
                            <div id="quantity-container">
                                <div className="quantity-tag">Quantity:</div>
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
                            </div>
                  
                            <AddCartButton backend={backend} loggedIn={loggedIn} id={itemInfo._id} quantity={quantity} name={'Add To Cart'} grabTotalCartQuantity={grabTotalCartQuantity}  prevLoggedIn={prevLoggedIn} grabShowAddItemAlert={grabShowAddItemAlert} differenceQuantity={differenceQuantity} grabDifferenceQuantity={grabDifferenceQuantity} grabShowAddItemDifferenceAlert={grabShowAddItemDifferenceAlert} />
                        </div>
                        
                    
                </div>
            </div>
            {/* Full window with image on the left side and description on left side*/}
            <div id="all-own-page-container">
                {ownPageInfo.map((description, index) => {return (
                    <div key={description._id}className="own-page-item-container" >
                        <div className="left-side-own-page-item-page">
                            <div className="own-page-item-image">
                                <img src={description.Image}/>
                            </div>
                        </div>
                        <div className="right-side-own-page-item-description">
                            <h2 className="own-page-item-description-heading">{description.Heading}</h2>
                            <h5>{description.Paragraph}</h5>
                        </div>
                    </div>
    
                    

                           
                )})} 
            </div>
            
            <div id={notOwnPageInfo.length <=1 ? "single-item-collapse-container" : "item-collapse-container"}>
                <div
                onClick={() => setOpen(!open)}
                aria-controls="example-fade-text"
                aria-expanded={open}
                id="not-own-page-heading-container"
                >
                    <h2>More Features</h2>
                </div>

                <Collapse in={open} timeout="auto" unmountOnExit>

                {notOwnPageInfo.map((description) => {return (
                    <div className="not-own-page-container" key={description._id}>
                        <h3 className="not-own-page-heading">{description.Heading}</h3>
                        <p className="not-own-page-description">{description.Paragraph}</p>
                    </div>
                )})}
                </Collapse>
            </div>
            <AllReviews backend={backend} allReviews={allReviews} grabAllReviews={grabAllReviews} electronicID={electronicID} allReviewsTotal={allReviewsTotal} />
            <Footer />
        </div>
        )
    }
}

export default ItemPage

