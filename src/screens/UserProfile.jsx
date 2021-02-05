import React, { useEffect, useState } from 'react'
import Button from '../components/Button'
import '../styles/UserProfile/UserProfile.css'
import Navbar from '../components/NavigationBar'
import Modal from 'react-modal';
import { Redirect } from 'react-router-dom';
import AddressContainer from '../components/UserProfile/AddressContainer'

function UserProfile ({backend}) {

    const [addresses, setAddresses] = useState(true);
    const [payments, setPayments] = useState(false);
    const [addressData, setAddressData] = useState([]);
    const [modalIsOpen,setIsOpen] = useState(false);
    const [addressInput, setAddressInput] = useState({});
    let subtitle;
    
    const customStyles = {
        content : {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
        //   marginRight: '-50%',
          transform: 'translate(-50%, -50%)'
        }
      };

    Modal.setAppElement('#root')

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
            console.log(data);
            const index = data.findIndex(address => address.DefaultAddress === true)
            console.log(index);
            const defaultFirstAddress = data.splice(index, 1)[0];
            data.unshift(defaultFirstAddress);
            setAddressData(data);
        }
        fetchAddressData();
    }, [backend]);

    const openModal = () => {
        setIsOpen(true);
    }

    const afterOpenModal = () => {
    subtitle.style.color = '#000';
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const handleAddressChange = (e) => {
        const { name, value } = e.target
        setAddressInput((prevAddress) => ({
            ...prevAddress, [name] : value
        }))
    }

    // const handleCheckInput = (event) => {
    //     event.preventDefault();
    //     console.log('Address:', addressInput);
    // }

    const handleSubmitAddress = async (event) => {
        event.preventDefault();
        const checkbox = document.getElementById('address-default');
        const check = checkbox.checked
        const newAddressResponse = await fetch(`${backend}/shipping/address?lastUse=false&default=${check}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
                name: `${addressInput.firstName}, ${addressInput.lastName}`,
                address: `${addressInput.addressLineOne}, ${addressInput.addressLineTwo}, ${addressInput.city}, ${addressInput.state}, ${addressInput.zipcode}`
            })
        })
        const newAddressData = await newAddressResponse.json();
        const index = newAddressData.findIndex(address => address.DefaultAddress === true)
        console.log(index);
        const defaultFirstAddress = newAddressData.splice(index, 1)[0];
        newAddressData.unshift(defaultFirstAddress);
        setAddressData(newAddressData);
        setIsOpen(false);
    }

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

    const allAddresses = addressData.map((address, index) => {
        if (addressData === undefined) {
            return null;
        } else {
            return( 
                <AddressContainer key={index} address={address}/>
            )
        }
    })

    if (!localStorage.getItem('token')) {
        return (
            <Redirect to="/"/>
        )
    } else {
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
                                <div className="header-container">
                                    <div className="header">Saved Addresses</div>
                                    <div className="add-address" 
                                    onClick={openModal}>
                                        <div>Add Address</div> 
                                    </div>
                                </div>
                                {addressData[0] === undefined ? 
                                    <div>Add Your Address Above</div> : 
                                <>
                                    <div className="all-address-container">
                                        <div className="all-addresses-container">{addressData.length !== 0 && allAddresses}
                                        </div>
                                        <button onClick={() => console.log(addressData)}>Log Address Data</button>
                                    </div>
                                </>}
                            </div>
                        </>
                    }
                    {payments &&
                        <div className="container">
                            <div className="header">Saved Payments</div>
                        </div>
                    }
                </div>
                <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
                >
                <form className="form">
                <h2 ref={_subtitle => (subtitle = _subtitle)}>Add Your Address</h2>
                <input value={addressInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleAddressChange}/>
                <input value={addressInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleAddressChange}/>
                <input value={addressInput.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One"
                onChange={handleAddressChange}/>
                <input value={addressInput.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two"
                onChange={handleAddressChange}/>
                <input value={addressInput.city || ""} name="city" placeholder="City"
                onChange={handleAddressChange}/>
                <input value={addressInput.state || ""} name="state" placeholder="State"
                onChange={handleAddressChange}/>
                <input value={addressInput.zipcode || ""} name="zipcode" placeholder="Zipcode"
                onChange={handleAddressChange}/>
                <div className="default-container">
                    <label htmlFor="addressDefault">Save as default</label>
                    <input name="addressDefault" type="checkbox" id="address-default"/>
                </div>
                <button onClick={handleSubmitAddress}>Submit</button>
                </form>
                </Modal>
            </>
        )
    }

}

export default UserProfile