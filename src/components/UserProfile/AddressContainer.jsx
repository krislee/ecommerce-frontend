import React, { useState, useEffect } from 'react';
import '../../styles/UserProfile/AddressContainer.css'
import Modal from 'react-modal';

function AddressContainer ({ index, address, backend, grabAddressData }) {

    const [editModalIsOpen,setIsEditModalOpen] = useState(false);
    const [editAddress, setEditAddress] = useState({})
    let subtitle;

    useEffect(() => {
        console.log(address);
    })

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

    const openModal = async (e) => {
        const oneAddressResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        })
        const oneAddressData = await oneAddressResponse.json();
        console.log(37, oneAddressData)
        const name = oneAddressData.address.Name.split(", ")
        const address = oneAddressData.address.Address.split(", ")
        setEditAddress({
            firstName: name[0],
            lastName: name[1],
            addressLine1: address[0],
            addressLine2: address[1],
            city: address[2],
            state: address[3],
            zipcode: address[4]
        })
        setIsEditModalOpen(true);
    }

    const afterOpenModal = () => {
        subtitle.style.color = '#000';
    }

    const closeModal = () => {
        setIsEditModalOpen(false);
    }

    const handleEditAddressChange = (e) => {
        const { name, value } = e.target
        setEditAddress((prevAddress) => ({
            ...prevAddress, [name] : value
        }))
    }

    const handleDeleteAddress = async (e) => {
        e.preventDefault();
        if (localStorage.getItem('token')) {
            const deleteResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            const data = deleteResponse.json();
            grabAddressData(data);
        }
    }

    const name = address.Name.replace(/,/g, '');
    const firstName = address.Name.split(',')[0]
    const lastName = address.Name.split(',')[1]
    const newAddress = address.Address.split(',')
    const addressLine = `${newAddress[0]} ${newAddress[1]}`
    const secondAddressLine = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    const defaultAddress = address.DefaultAddress

    if (address) {
        return (
            <>
            <div key={index} className="one-address-container">
                    <div className="person-name">{name}</div>
                    <div className="address">{addressLine}</div>
                    <div className="address">{secondAddressLine}</div>
                    {defaultAddress && <div className="default-indicator">Default</div>}
                    <div className="update-address">
                        <div id={address._id} onClick={openModal}>Edit</div>
                        <div id={address._id} onClick={handleDeleteAddress}>Delete</div>
                    </div>
            </div>
            <Modal
            isOpen={editModalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form className="form">
            <h2 ref={_subtitle => (subtitle = _subtitle)}>Edit Your Address</h2>
            <input value={editAddress.firstName || ""} name="firstName" placeholder="First Name" onChange={handleEditAddressChange}/>
            <input value={editAddress.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleEditAddressChange}/>
            <input value={editAddress.addressLine1 || ""} name="addressLineOne" placeholder="Address Line One"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.addressLine2 || ""} name="addressLineTwo" placeholder="Address Line Two"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.city || ""} name="city" placeholder="City"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.state|| ""} name="state" placeholder="State"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.zipcode || ""} name="zipcode" placeholder="Zipcode"
            onChange={handleEditAddressChange}/>
            <div className="default-container">
                <label htmlFor="addressDefault">Save as default</label>
                <input name="addressDefault" type="checkbox" id="address-default"/>
            </div>
            <button>Submit</button>
            </form>
            </Modal>
            </>
        )
    }
}

export default AddressContainer