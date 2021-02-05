import React, { useState, useEffect } from 'react';
import '../../styles/UserProfile/AddressContainer.css'
import Modal from 'react-modal';

function AddressContainer ({ index, address, backend, grabAddressData, handleAddressChange }) {

    const [editModalIsOpen,setIsEditModalOpen] = useState(false);
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
        const oneAddressData = oneAddressResponse.json();

        setIsEditModalOpen(true);
    }

    const afterOpenModal = () => {
        subtitle.style.color = '#000';
    }

    const closeModal = () => {
        setIsEditModalOpen(false);
    }

    // const handleEditSubmitAddress = async (event) => {
    //     event.preventDefault();
    //     const checkbox = document.getElementById('address-default');
    //     const check = checkbox.checked
    //     const newAddressResponse = await fetch(`${backend}/shipping/address?lastUse=false&default=${check}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': localStorage.getItem('token')
    //         },
    //         body: JSON.stringify({
    //             name: `${addressInput.firstName}, ${addressInput.lastName}`,
    //             address: `${addressInput.addressLineOne}, ${addressInput.addressLineTwo}, ${addressInput.city}, ${addressInput.state}, ${addressInput.zipcode}`
    //         })
    //     })
    // }

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
            <input value={address.firstName || ""} name="firstName" placeholder="First Name" onChange={handleAddressChange}/>
            <input value={address.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleAddressChange}/>
            <input value={address.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One"
            onChange={handleAddressChange}/>
            <input value={address.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two"
            onChange={handleAddressChange}/>
            <input value={address.city || ""} name="city" placeholder="City"
            onChange={handleAddressChange}/>
            <input value={address.state|| ""} name="state" placeholder="State"
            onChange={handleAddressChange}/>
            <input value={address.zipcode || ""} name="zipcode" placeholder="Zipcode"
            onChange={handleAddressChange}/>
            <div className="default-container">
                <label htmlFor="addressDefault">Save as default</label>
                <input name="addressDefault" type="checkbox" id="address-default"/>
            </div>
            <button onClick={handleEditSubmitAddress}>Submit</button>
            </form>
            </Modal>
            </>
        )
    }
}

export default AddressContainer