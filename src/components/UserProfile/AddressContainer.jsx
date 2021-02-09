import React, { useState } from 'react';
import '../../styles/UserProfile/AddressContainer.css'
import Modal from 'react-modal';

function AddressContainer ({ index, address, backend, grabAddressData, defaultFirst }) {

    // Creating a setter and getter function to open and close the modal
    const [isEditModalIsOpen,setIsEditModalOpen] = useState(false);
    const [isDeleteModalIsOpen,setIsDeleteModalOpen] = useState(false);
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
        // Splitting the name with the comma so we get an array back
        const name = oneAddressData.address.Name.split(", ")
        // Splitting the address with the comma so we get an array back
        const address = oneAddressData.address.Address.split(", ")
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

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    }

    // Function used to close the modal by setting the edit modal condition to false
    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
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
        // Prevents the page from refreshing
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
        // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
        defaultFirst(editAddressData);
        // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we recieved back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
        grabAddressData(editAddressData)
        // Close the modal after all of this function is finished so user will end up back on the regular screen
        setIsEditModalOpen(false)
    }

    // Function that handles the editing of the default status (and not the contents of the address)
    const handleDefaultEdit = async(e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // Fetching to a server to make a request to update the default status based off of the current default status. If the default status is true, then it will turn into false, and vice versa.
        const editDefaultResponse = await fetch(`${backend}/shipping/default/address/${e.target.id}?default=${!defaultAddress}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        })
        const editDefaultData = await editDefaultResponse.json();
        // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
        defaultFirst(editDefaultData);
        // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we recieved back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
        grabAddressData(editDefaultData);
        // Close the modal after all of this function is finished so user will end up back on the regular screen
        setIsEditModalOpen(false);
    }

    // Function that handles the deleting of addresses
    const handleDeleteAddress = async (e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // Fetching to a server to make a request to delete an address
        if (localStorage.getItem('token')) {
            const deleteResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            })
            const data = await deleteResponse.json();
            // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
            defaultFirst(data);
            // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we recieved back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
            setIsDeleteModalOpen(false);
            // Close the modal after all of this function is finished so user will end up back on the regular screen
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

    // We create the name by grabbing the Name property in the Object returned by the prop that was passed down, and then replacing it by removing the commas in between.
    const name = address.Name.replace(/,/g, '');
    // Split the address up by the comma, since the information is seperated by commas and creating an array where each information is its own seperate element
    const newAddress = address.Address.split(',')
    // Using the elements in the array newAddress, we are able to create new strings by interpolating the information
    const addressLineWithSecondAddress = `${newAddress[0]} ${newAddress[1]}`
    const secondAddressLineWithSecondAddress = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    // These variables are created in case users did not use a second line
    const addressLineWithoutSecondAddress = `${newAddress[0]}`
    const secondAddressLineWithoutSecondAddress = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    // This returns a boolean on whether or not address is default
    const defaultAddress = address.DefaultAddress

    // Returning only if the address is not blank
    if (address) {
        return (
            <>
            <div key={index} className="one-address-container">
                {/* We find the person's name on top of the card */}
                    <div className="person-name">{name}</div>
                    {/* Next we put the address line one */}
                    <div className="address">
                        {/* We wrap it around curly braces so that the information that renders is based off of whether or not there is a second line to the address */}
                        {newAddress[1] !== ' undefined' 
                        ? addressLineWithSecondAddress : addressLineWithoutSecondAddress }
                    </div>
                    <div 
                    className="address">
                        {/* We wrap it around curly braces so that the information that renders is based off of whether or not there is a second line to the address */}
                        {newAddress[1] !== ' undefined'  
                        ? secondAddressLineWithSecondAddress : secondAddressLineWithoutSecondAddress }
                    </div>
                    {/* This badge labeled Default only appears if the address is the default address based off the condition defaultAddress, which is a boolean */}
                    {defaultAddress && <div className="default-indicator">Default</div>}
                    {/* Styles had to be rendered differently based on whether or not the address is the default because the badge would push the edit and delete buttons down */}
                    <div 
                    className={defaultAddress ? 
                    "update-address-default" : "update-address"}>
                        <div id={address._id} onClick={openEditModal}>Edit</div>
                        <div id={address._id} onClick={openDeleteModal}>Delete</div>
                    </div>
            </div>
            {/* Modal that is used to edit the address */}
            <Modal
            isOpen={isEditModalIsOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form className="form" id={address._id} onSubmit={handleEditAddress}>
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
            <div className="submit-default-button-container">
            {/* Based off whether or not defaultAddress is true or false, we display the button that allows users to remove default if the address is the default, or the button to make the address a default if it is not currently the default address */}
            {!defaultAddress ? <div className="update-default-container">
                <button id={address._id} onClick={handleDefaultEdit}>Make Default</button>
                </div> :
                <div>
                <button id={address._id} onClick={handleDefaultEdit}>Remove Default</button>
            </div>}
            <button id={address._id}
            type="submit"
            value="Submit"
            // Disabled based off whether or not inputs were filled to prevent blank answers
            disabled={!editAddress.firstName || !editAddress.addressLineOne || !editAddress.city || !editAddress.state || !editAddress.zipcode}>
            Submit</button>
            </div>
            </form>
            </Modal>
            {/* Modal used to delete the address */}
            <Modal
            isOpen={isDeleteModalIsOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form className="form" id="delete-address-form">
            {/* <h2>Delete Your Address</h2> */}
            <div style={{'marginBottom':'1rem'}}>Are you sure you want to delete this address?</div>
            <div className="submit-default-button-container">
            <button id={address._id} 
            type="submit"
            form="delete-address-form"
            value="Submit"
            onClick={handleDeleteAddress}>
            Delete</button>
            <button onClick={closeModal}>Cancel</button>
            </div>
            </form>
            </Modal>
            </>
        )
    }
}

export default AddressContainer