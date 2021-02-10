import React, { useState } from 'react';
import Navbar from '../../components/NavigationBar';
import { Redirect } from 'react-router-dom';
import Footer from '../../components/Footer';
import Address from './Address';
import Payment from './Payment'
import '../../styles/UserProfile/UserProfile.css';

function UserProfile ({ backend }) {

    // Getter and Setter to display the address component or not
    const [addressesTabOpen, setAddressesTabOpen] = useState(true);
    // Getter and Setter to display the payments component or not
    const [paymentsTabOpen, setPaymentsTabOpen] = useState(false);

    // Function that will handle whether the address component is open or not so 
    const handleClickAddresses = () => {
        if (addressesTabOpen) {
            setAddressesTabOpen(false);
        } else if (!addressesTabOpen) {
            setAddressesTabOpen(true);
            setPaymentsTabOpen(false);
        }
    }

    // Function that will handle whether the payment component is open or not so 
    const handleClickPayments = () => {
        if (paymentsTabOpen) {
            setPaymentsTabOpen(false);
        } else if (!paymentsTabOpen) {
            setAddressesTabOpen(false);
            setPaymentsTabOpen(true);
        }
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
                        <div>Orders</div>
                    </div>
                    {/* This component renders only when the addressesTab is open */}
                    {addressesTabOpen && 
                        <Address backend={backend}/>
                    }
                    {/* This component renders only when the paymentsTab is open  */}
                    {paymentsTabOpen &&
                        <Payment backend={backend}/>
                    }
                    <Footer />
                </div>
            </>
        )
    }

}

export default UserProfile