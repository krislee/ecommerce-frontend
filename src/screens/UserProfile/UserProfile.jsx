import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavigationBar';
import { Redirect } from 'react-router-dom';
import Footer from '../../components/Footer';
import Profile from './Profile';
import Address from './Address';
import Payment from './Payment';
import Orders from './Orders';
import '../../styles/UserProfile/UserProfile.css';
import { SnackbarContent } from '@material-ui/core';


function UserProfile ({ backend, loggedIn, orderID, grabOrderID }) {

    /* ------- STATES ------- */

    // Getter and Setter to display the address component or not
    const [addressesTabOpen, setAddressesTabOpen] = useState(false);
    // Getter and Setter to display the payments component or not
    const [paymentsTabOpen, setPaymentsTabOpen] = useState(false);
    // Getter and Setter to display the orders component or not
    const [ordersTabOpen, setOrdersTabOpen] = useState(false);
    // Getter and Setter to display the profiles component or not
    const [profileTabOpen, setProfileTabOpen] = useState(true);
    /* ------- Data used as information to load in components within the User Profile page ------- */
    // Getter and Setter for the data pertaining to the profile
    const [profileData, setProfileData] = useState({});
    // Getter and Setter for the data pertaining to the address
    const [addressData, setAddressData] = useState([]);
    // Getter and Setter for the data pertaining to the payments
    const [paymentData, setPaymentData] = useState([]);
    // Getter and Setter for the data pertaining to the orders
    const [orderData, setOrderData] = useState([]);

    useEffect(() => {
        // Display the Profile
        async function fetchProfileData() {
            const profileResponse = await fetch (`${backend}/buyer/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const profileData = await profileResponse.json();
            setProfileData(profileData);
        };

        // When the page renders in, we want to grab the address data from the backend server and use that data to display different AddressContainer components
        async function fetchAddressData() {
            let resp = await fetch(`${backend}/shipping/address`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const data = await resp.json();
            // The data recieved back will be reordered to make sure the default address appears first followed by the newest address on the list
            defaultFirst(data);
            // Use that data recieved back and set it to the variable addressData
            setAddressData(data);
        }
        // When the page renders in, we want to grab the payment data from the backend server and use that data to display different PaymentContainer components
        async function fetchPaymentData () {
            let resp = await fetch(`${backend}/order/index/payment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const data = await resp.json();
            if(!data.msg) {
                // The data recieved back will be reordered to make sure the default payment appears first followed by the newest payment on the list
                defaultFirstPayment(data.paymentMethods);
                // Use that data recieved back and set it to the variable paymentData
                setPaymentData(data.paymentMethods);
            }
            
        }

        async function fetchOrderData () {
            const orderResponse = await fetch(`${backend}/complete/list/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            const orderData = await orderResponse.json();
            setOrderData(orderData.orders);
            console.log(orderData.orders);
        };

        fetchPaymentData();
        fetchAddressData();
        fetchOrderData();
        fetchProfileData();
    }, []);

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
    // Function to set data for Payments in child components
    const grabPaymentData = (data) => setPaymentData(data);
    // Function to set data for Orders in child components
    const grabOrderData = (data) => setOrderData(data);
    // Function to set data for Profile Data in child components
    const grabProfileData = (data) => setProfileData(data);

    // Function that will handle whether the address component is open or not
    const handleClickAddresses = () => {
        setAddressesTabOpen(true);
        setProfileTabOpen(false);
        setPaymentsTabOpen(false);
        setOrdersTabOpen(false);
    }

    // Function that will handle whether the payment component is open or not
    const handleClickPayments = () => {
        setPaymentsTabOpen(true);
        setProfileTabOpen(false);
        setAddressesTabOpen(false);
        setOrdersTabOpen(false);
    }

    // Function that will handle whether the order component is open or not 
    const handleClickOrders = () => {
        setOrdersTabOpen(true);
        setProfileTabOpen(false);
        setAddressesTabOpen(false);
        setPaymentsTabOpen(false);
    }
    
    // Function that will handle whether the profile component is open or not
    const handleClickProfile = () => {
        setProfileTabOpen(true);
        setAddressesTabOpen(false);
        setPaymentsTabOpen(false);
        setOrdersTabOpen(false);
    }

    // If the user does not have a token (or logged in), users will automatically render onto the homepage because the user profile page is on accessible to users that are logged in
    if (!localStorage.getItem('token')) {
        return (
            <Redirect to="/"/>
        )
    } else {
        return (
            <>
                <Navbar />
                <div className="user-profile-container">
                    {/* This bar represents the sections that users can click on to switch between the address, payments, and order components (screens) */}
                    <div className='top-bar'>
                         <div style={{borderLeft: '1px solid #000'}} onClick={handleClickProfile} 
                        className={profileTabOpen === true ? "highlighted-tab" : null}>
                            Profile
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
                    </div>
                    {/* This component renders only when the profileTabOpen is open  */}
                    {profileTabOpen && 
                        <Profile backend={backend} loggedIn={loggedIn} profileData={profileData} grabProfileData={grabProfileData} />
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
                        capitalizeArray={capitalizeArray}/>
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
                        capitalizeArray={capitalizeArray}/>
                    }
                    {/* This component renders only when the orderTabOpen is true  */}
                    {ordersTabOpen &&
                        <Orders 
                        backend={backend} 
                        loggedIn={loggedIn}
                        orderData={orderData}
                        grabOrderData={grabOrderData}
                        orderID={orderID}
                        grabOrderID={grabOrderID} />
                    }
                    <Footer />
                </div>
            </>
        );
    };
};

export default UserProfile