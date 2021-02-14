import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavigationBar';
import { Redirect } from 'react-router-dom';
import Footer from '../../components/Footer';
import Address from './Address';
import Payment from './Payment'
import Orders from './Orders'
import '../../styles/UserProfile/UserProfile.css';


function UserProfile ({ backend, loggedIn, orderID, grabOrderID }) {

    // Getter and Setter to display the address component or not
    const [addressesTabOpen, setAddressesTabOpen] = useState(true);
    // Getter and Setter to display the payments component or not
    const [paymentsTabOpen, setPaymentsTabOpen] = useState(false);
    const [ordersTabOpen, setOrdersTabOpen] = useState(false);

    const [addressData, setAddressData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [orderData, setOrderData] = useState([])

    useEffect(() => {
        // When the page renders in, we want to grab the address data from the backend server and use that data to display different AddressContainer components
        async function fetchAddressData() {
            let resp = await fetch(`${backend}/shipping/address`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            });
            const data = await resp.json();
            // The data recieved back will be reordered to make sure the default address appears first followed by the newest address on the list
            defaultFirst(data);
            // Use that data recieved back and set it to the variable addressData
            setAddressData(data);
        }
        async function fetchPaymentData () {
            let resp = await fetch(`${backend}/order/index/payment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            });
            const data = await resp.json();
            setPaymentData(data.paymentMethods);
            console.log(data.paymentMethods)
        }

        async function fetchOrderData () {
            const orderResponse = await fetch(`${backend}/complete/list/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const orderData = await orderResponse.json()
            setOrderData(orderData.orders)
            console.log(orderData.orders)
        }

        fetchPaymentData();
        fetchAddressData();
        fetchOrderData();
    }, [backend]);

    // Function that is used to reorder the data so that default is first and to also make the newest data come first on the list
    const defaultFirst = (data) => {
        // Reverses the order of the data so the newest data will be first and the oldest will be last
        data.reverse();
        // If the data that is returned has a object with the property of defaultAddress being true, then run 
        if (data.findIndex(address => address.DefaultAddress === true) !== -1 && data.length !== 0) {
            // Find the index of the object that has the default address information
            const index = data.findIndex(address => address.DefaultAddress === true)
            // Splice it so we can grab it and remove it from the array
            const defaultFirstAddress = data.splice(index, 1)[0];
            // Push it to the top of the list so it would be index zero (first element)
            data.unshift(defaultFirstAddress);
        }
    }

    const grabAddressData = (data) => {
        setAddressData(data);
    }

    const grabPaymentData = (data) => {
        setPaymentData(data);
    }

    const grabOrderData = (data) => {
        setOrderData(data)
    }

    // Function that will handle whether the address component is open or not so 
    const handleClickAddresses = () => {
        // if (addressesTabOpen) {
        //     setAddressesTabOpen(false);
        // } else if (!addressesTabOpen) {
            setAddressesTabOpen(true);
            setPaymentsTabOpen(false);
            setOrdersTabOpen(false)
        // }
    }

    // Function that will handle whether the payment component is open or not so 
    const handleClickPayments = () => {
        // if (paymentsTabOpen) {
        //     setPaymentsTabOpen(false);
        // } else if (!paymentsTabOpen) {
            setAddressesTabOpen(false);
            setPaymentsTabOpen(true);
            setOrdersTabOpen(false)
        // }
    }

    const handleClickOrders = () => {
        // if(ordersTabOpen) {
        //     setOrdersTabOpen(false)
        // } else if(!ordersTabOpen) {
            setOrdersTabOpen(true)
            setAddressesTabOpen(false);
            setPaymentsTabOpen(false);
        // }
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
                        <div style={{borderLeft: '1px solid #000'}} onClick={handleClickAddresses} 
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
                    {/* This component renders only when the addressesTab is open */}
                    {addressesTabOpen && 
                        <Address 
                        backend={backend} 
                        addressData={addressData} 
                        defaultFirst={defaultFirst}
                        grabAddressData={grabAddressData}/>
                    }
                    {/* This component renders only when the paymentsTab is open  */}
                    {paymentsTabOpen &&
                        <Payment 
                        backend={backend} 
                        paymentData={paymentData}
                        grabPaymentData={grabPaymentData}/>
                    }
                    {ordersTabOpen &&
                        <Orders 
                        backend={backend} 
                        orderData={orderData}
                        grabOrderData={grabOrderData}
                        orderID={orderID}
                        grabOrderID={grabOrderID} />
                    }
                    <Footer />
                </div>
            </>
        )
    }

}

export default UserProfile