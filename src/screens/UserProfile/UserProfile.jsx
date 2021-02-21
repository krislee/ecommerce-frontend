import React, { useState, useEffect } from 'react';
// import Navbar from '../../components/NavigationBar';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import Settings from './Settings'
import Address from './Address';
import Payment from './Payment'
import Orders from './Orders'
import UserReviews from './UserReviews'
import '../../styles/UserProfile/UserProfile.css';


function UserProfile ({ backend, loggedIn, totalCartQuantity, grabTotalCartQuantity }) {
    const history = useHistory()
    const location = useLocation() // gets the full current URL

    // Getter and Setter to display the address component or not
    const [addressesTabOpen, setAddressesTabOpen] = useState(location.pathname === '/profile/address'? true: false);
    // Getter and Setter to display the payments component or not
    const [paymentsTabOpen, setPaymentsTabOpen] = useState(location.pathname === '/profile/payment'? true: false);
    const [ordersTabOpen, setOrdersTabOpen] = useState(location.pathname ==='/profile/order'? true: false);
    const [settingsTabOpen, setSettingsTabOpen] = useState(location.pathname ==='/profile/setting'? true: false);
    const [reviewsTabOpen, setReviewsTabOpen] = useState(location.pathname ==='/profile/review'? true: false);

    const [settingData, setSettingData] = useState({})
    const [addressData, setAddressData] = useState([]);
    // Getter and Setter for the data pertaining to the payments
    const [paymentData, setPaymentData] = useState([]);

    const [orderLoading, setOrderLoading] = useState(true)
    const [orderData, setOrderData] = useState([])
    const [ordersTotal, setOrdersTotal] = useState(null)
    const [ordersPage, setOrdersPage] = useState('')

    const [reviewLoading, setReviewLoading] = useState(true)
    const [reviewData, setReviewData] = useState([])
    const [reviewsTotal, setReviewsTotal] = useState(null)
    const [reviewsPage, setReviewsPage] = useState('')

    const [footerLoading, setFooterLoading] = useState(true)

    useEffect(() => {
        
        const abortController = new AbortController()
        const signal = abortController.signal

        // Display the Profile
        async function fetchSettingData() {
            const settingResponse = await fetch (`${backend}/buyer/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                signal: signal
            })
            const settingData = await settingResponse.json()
            setSettingData(settingData)
            setFooterLoading(false)
        }

        // When the page renders in, we want to grab the address data from the backend server and use that data to display different AddressContainer components
        async function fetchAddressData() {
            let resp = await fetch(`${backend}/shipping/address`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                signal: signal
            });
            const data = await resp.json();
            // The data recieved back will be reordered to make sure the default address appears first followed by the newest address on the list
            defaultFirst(data);
            // Use that data recieved back and set it to the variable addressData
            setAddressData(data);
            setFooterLoading(false)
        }

        // When the page renders in, we want to grab the payment data from the backend server and use that data to display different PaymentContainer components
        async function fetchPaymentData () {
            let resp = await fetch(`${backend}/order/index/payment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                signal: signal
            });
            const data = await resp.json();
            if(!data.msg) {
                // The data recieved back will be reordered to make sure the default payment appears first followed by the newest payment on the list
                defaultFirstPayment(data.paymentMethods);
                // Use that data recieved back and set it to the variable paymentData
                setPaymentData(data.paymentMethods);
            }
            setFooterLoading(false)
        }

        async function fetchOrderData() {
            const queryParams = new URLSearchParams(location.search) // returns query obj from the full URL
            const page = queryParams.get("page") // get the query value

            const orderResponse = await fetch(`${backend}/complete/list/orders?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                signal: signal
            })
            const orderData = await orderResponse.json()
            console.log(orderData.orders)
            setOrderData(orderData.orders)
            setOrderLoading(false) // do not want to show the paragraph, "No purchases yet..." if we go to the URL directly since useEffect has not ran yet, so set orderLoading to true first, to show nothing if we hit the order URL directly, and then either show "No purchases yet" or a list of orders
            setOrdersTotal(orderData.totalPages) // used for pagination count in Orders component
            if(!page) {
                setOrdersPage(1) // user can go to /orders and still be shown the same list of orders as going to /orders/page=1, but the pagination number won't be highlighted since page is null, so set ordersPage state to 1
            } else {
                setOrdersPage(page) // if logged in user decides to immediately go to i.e. /orders/page=2, we need to be able to highlight the pagination number that corresponds to the url page #, 2
            }
            setFooterLoading(false)
        }

        async function fetchReviewsData() {
            const queryParams = new URLSearchParams(location.search) // returns query obj from the full URL
            const page = queryParams.get("page") // get the query value

            const reviewsResponse = await fetch(`${backend}/buyer/all/electronic/reviews?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                signal: signal
            })
            const reviewsData = await reviewsResponse.json()
            console.log(reviewsData.totalPages, reviewsData)
            setReviewData(reviewsData.allReviews)
            setReviewLoading(false)
            setReviewsTotal(reviewsData.totalPages)
            if(!page) {
                setReviewsPage(1) // user can go to /review and still be shown the same list of reviews as going to /review/page=1, but the pagination number won't be highlighted since page is null, so set ordersPage state to 1
            } else {
                setReviewsPage(page) // if logged in user decides to immediately go to i.e. /review/page=2, we need to be able to highlight the pagination number that corresponds to the url page #, 2
            }
            setFooterLoading(false)
        }

        if(loggedIn()) {
            fetchPaymentData();
            fetchAddressData();
            fetchOrderData();
            fetchReviewsData();
            fetchSettingData();
        } else {
            return grabTotalCartQuantity(0)
        }

        return function cleanUp () {
            abortController.abort()
        }

    }, [loggedIn()]);

    // Function that is used to capitalize a string
    const capitalize = (string) => {
        return (string.charAt(0).toUpperCase() + string.slice(1));
    };
  
    // Function that is used to capitalize a group of strings (like addresses and full names)
    const capitalizeArray = (splitArray, newArray) => {
        for (let i = 0; i < splitArray.length; i++) {
            newArray.push(capitalize(splitArray[i]));
        };
        return newArray.join(" ");
    };

    // Function that is used to reorder the data so that default is first and to also make the newest data come first on the list
    const defaultFirst = (data) => {
        // Reverses the order of the data so the newest data will be first and the oldest will be last
        data.reverse();
        // If the data that is returned has a object with the property of defaultAddress being true, then run 
        if (data.findIndex(address => address.DefaultAddress === true) !== -1 && data.length !== 0) {
            // Find the index of the object that has the default address information
            const index = data.findIndex(address => address.DefaultAddress === true);
            // Splice the address with the default status so we can grab it and remove it from the array
            const defaultFirstAddress = data.splice(index, 1)[0];
            // Push it to the top of the list so it would be index zero (first element)
            data.unshift(defaultFirstAddress);
        };
    };

    // Function that is used to reorder the data so that default is first and to also make the newest data come first on the list 
    const defaultFirstPayment = (data) => {
        // Reverses the order of the data so the newest data will be first and the oldest will be last
        data.reverse(); 
        // If the data that is returned has a object with the property of defaultPayment being true, then run 
        if (data.findIndex(payment => payment.default === true) !== -1 && data.length !== 0) {
            // Find the index of the object that has the default payment information
            const index = data.findIndex(payment => payment.default === true);
            // Splice the payment with the default status so we can grab it and remove it from the array
            const defaultFirstPayment = data.splice(index, 1)[0];
            // Push it to the top of the list so it would be index zero (first element)
            data.unshift(defaultFirstPayment);
        };
    };

    // Function to set data for Address in child components
    const grabAddressData = (data) => setAddressData(data);
    const grabPaymentData = (data) => setPaymentData(data); // Function to set data for Payments in child components
    const grabOrderData = (data) => setOrderData(data) // pass down to Orders component to update the orderData state to contain a new list of orders. The new list of orders is given from the server when we click on the page number.
    const grabOrdersPage =(data) => setOrdersPage(data) //update the ordersPage state in handlePageOnChange; ordersPage state is used for Pagination 
    const grabReviewsPage = (data) => setReviewsPage(data) //update the reviewsPage state in handlePageOnChange; reviewsPage state is used for Pagination 
    const grabReviewData = (data) => setReviewData(data) // pass down to UserReviews component to update the reviews state to contain a new list of reviews. When we click on a page number, the page onChange function runs, getting a new list of reviews from the server.
    const grabSettingData = (data) => setSettingData(data)
    
    /* ------- HANDLES WHICH COMPONENT TO DISPLAY IN THE RETURN ------- */

    // Function that will handle whether the address component is open or not
    const handleClickAddresses = () => {
        setAddressesTabOpen(true);
        setSettingsTabOpen(false)
        setPaymentsTabOpen(false);
        setOrdersTabOpen(false)
        setReviewsTabOpen(false)
        history.replace({ pathname: `/profile/address`})
    }
    // Function that will handle whether the payment component is open or not
    const handleClickPayments = () => {
        setPaymentsTabOpen(true);
        setSettingsTabOpen(false)
        setAddressesTabOpen(false);
        setOrdersTabOpen(false)
        setReviewsTabOpen(false)
        history.replace({ pathname: `/profile/payment`})
    }
    // Function that will open the order component and hide all the other components (since we are hiding all the other components, it does not matter which component you were previously displaying)
    const handleClickOrders = () => {
        setOrdersTabOpen(true)
        setSettingsTabOpen(false)
        setAddressesTabOpen(false);
        setPaymentsTabOpen(false)
        setReviewsTabOpen(false)
        grabOrdersPage(1) // When we click on Orders tab, have pagination number be defaulted to 1
        history.replace({ pathname: `/profile/order?page=1`})
    }
    // Function that will open the order component and hide all the other components (since we are hiding all the other components, it does not matter which tab you were previously on)
    const handleClickReviews = () => {
        setReviewsTabOpen(true)
        setSettingsTabOpen(false)
        setAddressesTabOpen(false);
        setPaymentsTabOpen(false);
        setOrdersTabOpen(false)
        history.replace({ pathname: `/profile/review?page=1`})
    }
    const handleClickSettings = () => {
        if(!loggedIn()) return grabTotalCartQuantity(0)
        setSettingsTabOpen(true)
        setAddressesTabOpen(false);
        setPaymentsTabOpen(false);
        setOrdersTabOpen(false)
        setReviewsTabOpen(false)
        history.replace({ pathname: `/profile/setting`})
    }

    // If the user does not have a token (or logged in), users will automatically render onto the homepage because the user profile page is on accessible to users that are logged in
    if (!loggedIn()) {
        return (
            <Redirect to="/"/>
        )
    } else {
        return (
            <>
                {/* <Navbar totalCartQuantity={totalCartQuantity} grabTotalCartQuantity={grabTotalCartQuantity} backend={backend} loggedIn={loggedIn}/> */}
                <div className="user-profile-container">
                    {/* This bar represents the sections that users can click on to switch between the address, payments, and order components (screens) */}
                    <div className='top-bar'>
                         <div style={{borderLeft: '1px solid #000'}} onClick={handleClickSettings} 
                        className={settingsTabOpen === true ? "highlighted-tab" : null}>
                            Settings
                        </div>
                        <div onClick={handleClickAddresses} 
                        className={addressesTabOpen === true ? "highlighted-tab" : null}>
                            Addresses
                        </div>
                        <div onClick={handleClickPayments} 
                        className={paymentsTabOpen === true ? "highlighted-tab" : null}>
                            Payments
                        </div>
                        <div onClick={handleClickOrders} 
                        className={ordersTabOpen === true ? "highlighted-tab" : null}>
                           Orders
                        </div>
                        <div onClick={handleClickReviews} 
                        className={reviewsTabOpen === true ? "highlighted-tab" : null}>
                           Reviews
                        </div>
                    </div>
                   
                    {/* This component renders only when the profileTabOpen is open  */}
                    {settingsTabOpen && 
                        <Settings backend={backend} loggedIn={loggedIn} settingData={settingData} grabSettingData={grabSettingData} grabTotalCartQuantity={grabTotalCartQuantity} />
                    }
                   
                    {/* This component renders only when the addressesTab is open */}
                    {addressesTabOpen && 
                        <Address 
                        backend={backend} 
                        addressData={addressData} 
                        defaultFirst={defaultFirst}
                        grabAddressData={grabAddressData}
                        loggedIn={loggedIn}
                        capitalize={capitalize}
                        capitalizeArray={capitalizeArray}
                        grabTotalCartQuantity={grabTotalCartQuantity} />
                    }
          
                    {/* This component renders only when the paymentsTab is open  */}
                    {paymentsTabOpen &&
                        <Payment 
                        backend={backend} 
                        paymentData={paymentData}
                        defaultFirstPayment={defaultFirstPayment}
                        grabPaymentData={grabPaymentData}
                        loggedIn={loggedIn}
                        capitalize={capitalize}
                        capitalizeArray={capitalizeArray} 
                        grabTotalCartQuantity={grabTotalCartQuantity} />
                    }
    
                    {/* This component renders only when the orderTabOpen is true  */}
                    {ordersTabOpen &&
                        <Orders 
                        backend={backend} 
                        loggedIn={loggedIn}
                        orderLoading={orderLoading}
                        orderData={orderData}
                        grabOrderData={grabOrderData}
                        // orderID={orderID}
                        // grabOrderID={grabOrderID}
                        ordersTotal={ordersTotal}
                        ordersPage={ordersPage}
                        grabOrdersPage={grabOrdersPage}
                        grabTotalCartQuantity={grabTotalCartQuantity} />
                    }

                    {reviewsTabOpen && 
                        <UserReviews 
                        backend={backend} 
                        loggedIn={loggedIn} 
                        reviewLoading={reviewLoading}
                        reviewData={reviewData} 
                        grabReviewData={grabReviewData} 
                        reviewsTotal={reviewsTotal}
                        reviewsPage={reviewsPage} 
                        grabReviewsPage={grabReviewsPage}
                        grabTotalCartQuantity={grabTotalCartQuantity} />
                    }
                    {!footerLoading && <Footer />}
                </div>
            </>
        );
    };
};

export default UserProfile