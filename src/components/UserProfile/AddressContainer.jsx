import React, { useState } from 'react';
import '../../styles/UserProfile/AddressContainer.css'
import Modal from 'react-modal';

function AddressContainer ({ index, address, backend, grabAddressData, defaultFirst }) {

    // Creating a setter and getter function to open and close the modal
    const [editModalIsOpen,setIsEditModalOpen] = useState(false);
    // Creating a setter and getter function for the input fields
    const [editAddress, setEditAddress] = useState({});

    // Styles for the Modal
    const customStyles = {
        content : {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)'
        }
      };

    Modal.setAppElement('#root')

    // Function that runs when the modal opens
    const openEditModal = async (e) => {
        // Fetching to the backend to GET the information related to the particular address this container is rendering
        const oneAddressResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        })
        const oneAddressData = await oneAddressResponse.json();
        console.log(37, oneAddressData)
        // Splitting the name with the comma so we get an array back
        const name = oneAddressData.address.Name.split(", ")
        // Splitting the address with the comma so we get an array back
        const address = oneAddressData.address.Address.split(", ")
        console.log(address);
        // Function that sets the input values equal to the data recieved back
        const checkForAddressLineTwo = () => {
            // Our condition is make sure that we display data in the input based off whether or not there is an addressLineTwo, since it is not required
            if (address[1] === "undefined"){
                setEditAddress({
                    firstName: name[0],
                    lastName: name[1],
                    addressLineOne: address[0],
                    addressLineTwo: "",
                    city: address[2],
                    state: address[3],
                    zipcode: address[4]
                })
            } else {
                setEditAddress({
                    firstName: name[0],
                    lastName: name[1],
                    addressLineOne: address[0],
                    addressLineTwo: address[1],
                    city: address[2],
                    state: address[3],
                    zipcode: address[4]
                })
            }
        }
        checkForAddressLineTwo();
        // After we finish inputting the data from the fetch request, we display the modal so we set the condition of the edit modal to true
        setIsEditModalOpen(true);
    }

    // Function used to close the modal by setting the edit modal condition to false
    const closeModal = () => {
        setIsEditModalOpen(false);
    }

    // Function that allows us to change the value of the input dynamically and display it on the page
    const handleEditAddressChange = (e) => {
        const { name, value } = e.target
        setEditAddress((prevAddress) => ({
            ...prevAddress, [name] : value
        }))
    }

    // Function that handles the editing of the addresses (not the default part)
    const handleEditAddress = async(e) => {
        e.preventDefault()
        // Creating a variable that tells the server we are EDITING the information for a specific address, which is identified from the e.target.id
        const editAddressResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            // For our body, we need to have a value for both the address and name, and we use the values recieved back from the inputs to do so
            body: JSON.stringify({
                address: `${editAddress.addressLineOne}, ${editAddress.addressLineTwo}, ${editAddress.city}, ${editAddress.state}, ${editAddress.zipcode}`,
                name: `${editAddress.firstName}, ${editAddress.lastName}`
            })
        })
        const editAddressData = await editAddressResponse.json()
        // defaultFirst(editAddressData);
        console.log(editAddressData);
        defaultFirst(editAddressData);
        grabAddressData(editAddressData) // Update the addressData state in user profile
        setIsEditModalOpen(false)
    }

    const handleDefaultEdit = async(e) => {
        e.preventDefault();
        console.log(defaultAddress);
        const editDefaultResponse = await fetch(`${backend}/shipping/default/address/${e.target.id}?default=${!defaultAddress}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        })
        const editDefaultData = await editDefaultResponse.json();
        console.log(editDefaultData)
        defaultFirst(editDefaultData);
        grabAddressData(editDefaultData);
        setIsEditModalOpen(false);
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
            const data = await deleteResponse.json();
            console.log(data);
            defaultFirst(data);
            grabAddressData(data);
            // if (data.findIndex(address => address.DefaultAddress === true) === -1 && data.length !== 0) {
            //     const oldestAddress = data[data.length - 1];
            //     console.log(oldestAddress);
            //     // We grab the last element in the address array, and make it default
            //     // We pass it through the handle submit again
            //     // We delete the old one and create a new one
            //     const oldestAddressCheckedResponse = await fetch(`${backend}/shipping/address?lastUse=false&default=true`, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             'Authorization': localStorage.getItem('token')
            //         },
            //         body: JSON.stringify({
            //             name: oldestAddress.Name,
            //             address: oldestAddress.Address
            //         })
            //     })
            //     const oldestAddressCheckedData = await oldestAddressCheckedResponse.json()
            //     console.log(oldestAddressCheckedData);
            //     const deleteDuplicateResponse = await fetch(`${backend}/shipping/address/${oldestAddress._id}`, {
            //         method: 'DELETE',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             'Authorization': localStorage.getItem('token')
            //         }
            //     })
            //     const finalDeleteData = await deleteDuplicateResponse.json();
            //     if (finalDeleteData.findIndex(address => address.DefaultAddress === true) !== -1 && finalDeleteData.length !== 0){
            //         defaultFirst(finalDeleteData);
            //         grabAddressData(finalDeleteData);
            //     } else {
            //         grabAddressData(finalDeleteData)
            //     }
            // } else {
            //     console.log('there is a default');
            //     if (data.findIndex(address => address.DefaultAddress === true) !== -1 && data.length !== 0){
            //         defaultFirst(data);
            //         grabAddressData(data);
            //     } else {
            //         grabAddressData(data);
            //     }
            // }
        }
    }

    const name = address.Name.replace(/,/g, '');
    const newAddress = address.Address.split(',')
    const addressLineWithSecondAddress = `${newAddress[0]} ${newAddress[1]}`
    const secondAddressLineWithSecondAddress = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    const addressLineWithoutSecondAddress = `${newAddress[0]}`
    const secondAddressLineWithoutSecondAddress = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    const defaultAddress = address.DefaultAddress

    if (address) {
        return (
            <>
            <div key={index} className="one-address-container">
                    <div className="person-name">{name}</div>
                    <div 
                    className="address">
                        {newAddress[1] !== ' undefined' 
                        ? addressLineWithSecondAddress : addressLineWithoutSecondAddress }
                    </div>
                    <div 
                    className="address">
                        {newAddress[1] !== ' undefined'  
                        ? secondAddressLineWithSecondAddress : secondAddressLineWithoutSecondAddress }
                    </div>
                    {defaultAddress && <div className="default-indicator">Default</div>}
                    <div 
                    className={defaultAddress ? 
                    "update-address-default" : "update-address"}>
                        <div id={address._id} onClick={openEditModal}>Edit</div>
                        <div id={address._id} onClick={handleDeleteAddress}>Delete</div>
                    </div>
            </div>
            <Modal
            isOpen={editModalIsOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form className="form" id="edit-address-form">
            <h2>Edit Your Address</h2>
            <input value={editAddress.firstName || ""} name="firstName" placeholder="First Name" onChange={handleEditAddressChange}/>
            <input value={editAddress.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleEditAddressChange}/>
            <input value={editAddress.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.city || ""} name="city" placeholder="City"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.state|| ""} name="state" placeholder="State"
            onChange={handleEditAddressChange}/>
            <input value={editAddress.zipcode || ""} name="zipcode" placeholder="Zipcode"
            onChange={handleEditAddressChange} type="text" maxLength="5" pattern="\d*"/>
            {!defaultAddress ? <div className="default-container">
                <button id={address._id} onClick={handleDefaultEdit}>Make Default</button>
                </div> :
                <div>
                <button id={address._id} onClick={handleDefaultEdit}>Remove Default</button>
            </div>}
            <button id={address._id} 
            type="submit"
            form="edit-address-form"
            value="Submit"
            onClick={handleEditAddress}
            disabled={!editAddress.firstName || !editAddress.addressLineOne || !editAddress.city || !editAddress.state || !editAddress.zipcode}>
            Submit</button>
            </form>
            </Modal>
            </>
        )
    }
}

export default AddressContainer