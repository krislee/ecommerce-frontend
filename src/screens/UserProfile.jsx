import React, { useEffect, useState } from 'react'
import Button from '../components/Button'
import '../styles/UserProfile.css'
import Navbar from '../components/NavigationBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { Redirect } from 'react-router-dom';

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
        console.log(newAddressData);
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
        return(
            <div key={index} className="one-address-container">
                <div>{address.Name}</div>
            </div>
        )
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
                                <div className="header">Saved Addresses</div>
                                {addressData.length === 0 ? 
                                <>
                                    <div className="add-address one-address-container" onClick={openModal}>
                                        <FontAwesomeIcon className="plus-icon" icon={faPlus}/>
                                        <div>Add an Address</div> 
                                    </div>
                                    {/* <button onClick={openModal}>Open Modal</button> */}
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
                                : 
                                <>
                                    <div className="all-address-container">
                                        <div className="add-address one-address-container" onClick={openModal}>
                                            <FontAwesomeIcon className="plus-icon" icon={faPlus}/>
                                            <div>Add an Address</div> 
                                        </div>
                                        <div className="all-addresses-container">{allAddresses}</div>
                                        <button onClick={() => console.log(addressData)}>Log Address Data</button>
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
            </>
        )
    }

}

export default UserProfile