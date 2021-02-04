import React, { useEffect, useState } from 'react'
import Button from '../components/Button'
import '../styles/UserProfile.css'
import Navbar from '../components/NavigationBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

function UserProfile ({backend}) {

    const [addresses, setAddresses] = useState(true);
    const [payments, setPayments] = useState(false);
    const [addressData, setAddressData] = useState([]);
    const [modalIsOpen,setIsOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [addressOne, setAddressOne] = useState('');
    const [addressTwo, setAddressTwo] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipcode, setZipcode] = useState('');
    let subtitle;

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
    subtitle.style.color = '#000';
    }

    function closeModal() {
        setIsOpen(false);
    }
    
    const customStyles = {
        content : {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
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
                                <form>
                                    <h2 ref={_subtitle => (subtitle = _subtitle)}>Add Your Address</h2>
                                    <input placeholder="First Name"/>
                                    <input placeholder="Last Name"/>
                                    <input placeholder="Address Line One"/>
                                    <input placeholder="Address Line Two"/>
                                    <input placeholder="City"/>
                                    <input placeholder="State"/>
                                    <input placeholder="Zipcode"/>
                                    <button onClick={closeModal}>Submit</button>
                                </form>
                                </Modal>
                            </>
                          
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