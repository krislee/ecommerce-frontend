import React, { useEffect, useState } from 'react'
// import {Link} from 'react-router-dom';
import Button from '../components/Button'
// import Login from '../components/Login'
import '../styles/UserProfile.css'
import Navbar from '../components/NavigationBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function UserProfile ({backend}) {

    const [addresses, setAddresses] = useState(true);
    const [payments, setPayments] = useState(false);
    const [addressData, setAddressData] = useState([]);
    // const [addressData, setAddressData] = useState([]);

    useEffect(() => {
        async function fetchAddressData() {
            let resp = await fetch(`${backend}/shipping/address`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            });
            const data = await resp.json();
            setAddressData(data);
        }
        fetchAddressData();
    }, []);

    const handleClickAddresses = () => {
        if (addresses) {
            setAddresses(false);
        } else if (!addresses) {
            setAddresses(true);
            setPayments(false);
        }
    }

    const handleClickPayments = () => {
        if (payments) {
            setPayments(false);
        } else if (!payments) {
            setAddresses(false);
            setPayments(true);
        }
    }

    return (
        <>
            <Navbar />
            <div className="user-profile-container">
                <div className='side-bar'>
                    <Button name={'Addresses'} onClick={handleClickAddresses}/>
                    <Button name={'Payments'} onClick={handleClickPayments}/>
                </div>
                {addresses && 
                    <>
                        <div className="container addresses-container">
                            <div className="header">Saved Addresses</div>
                            {addressData.length === 0 ? 
                            <div className="add-address one-address-container">
                                <FontAwesomeIcon className="plus-icon" icon={faPlus}/>
                                <div>Add an Address</div> 
                            </div>
                            : 
                            <div>You have an address</div>}
                        </div>
                    </>
                }
                {payments &&
                    <div className="container">
                        <div className="header">Saved Payments</div>
                    </div>
                }
            </div>
        </>
    )
}

export default UserProfile