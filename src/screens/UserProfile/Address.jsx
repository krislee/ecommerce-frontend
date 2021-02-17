import React, { useState } from 'react';
import Modal from 'react-modal';
import AddressContainer from '../../components/UserProfile/AddressContainer';

function UserProfileAddress ({ backend, addressData, defaultFirst, grabAddressData, loggedIn, capitalize, capitalizeArray }) {

    // Getter and Setter to store the information recieved back when fetching address data
    // Getter and Setter to display modal based off a boolean value
    const [modalIsOpen,setIsOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users put into inputs specifically regarding the adding address function
    const [addressInput, setAddressInput] = useState({});
    const [addZipcodeAddressWarning, setAddZipcodeAddressWarning] = useState(false);
    const [addStateAbbreviationAddressWarning, setAddStateAbbreviationAddressWarning] = useState(false);

    const customStyles = {
        content : {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)'
        }
      };

    Modal.setAppElement('#root');

    // Function that is used to open the modal when users plan to create
    const openModal = () => {
        setIsOpen(true);
    }

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        setIsOpen(false);
    }

    // Function that is used to make sure the inputs that are being put in by the user is saved to the addressInput object so we can use the object when creating a new address
    const handleAddressChange = (e) => {
        const { name, value } = e.target
        setAddressInput((prevAddress) => ({
            ...prevAddress, [name] : value
        }))
    }

    // Function that is used to handle the event when a user submits the request to make a new address
    const handleSubmitAddress = async (event) => {
        // Prevents the page from refreshing
        event.preventDefault();
        if (addressInput.zipcode.length !== 5) {
            setAddZipcodeAddressWarning(true);
            setAddStateAbbreviationAddressWarning(false);
        } else if (addressInput.state.length !== 2) {
            setAddZipcodeAddressWarning(false);
            setAddStateAbbreviationAddressWarning(true);
        } else {
            setAddZipcodeAddressWarning(false);
            setAddStateAbbreviationAddressWarning(false);
            // Grabbing the DOM element with the ID of address-default (which is the checkbox that is used by users to indicate whether or not they want said address to be default or not)
            const checkbox = document.getElementById('address-default');
            // We check if the checkbox is checked or not, and this will return a boolean
            const check = checkbox.checked
            // Fetching to the backend server to make a request to create a new address and using string interopolation to dynamically set the address to request whether or not the address will be a default address or not
            const newAddressResponse = await fetch(`${backend}/shipping/address?lastUse=false&default=${check}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                // Using the addressInput object, we are able to grab the values and use these values to generate what user wants for the name and address of the address they are trying to create
                body: JSON.stringify({
                    name: `${addressInput.firstName}, ${addressInput.lastName}`,
                    address: `${addressInput.addressLineOne}, ${addressInput.addressLineTwo}, ${addressInput.city}, ${addressInput.state}, ${addressInput.zipcode}`
                })
            })
            const newAddressData = await newAddressResponse.json();
            // Make sure that data we recieve back is ordered so that the default will be first followed by newest address added
            defaultFirst(newAddressData);
            // Assigning the data we recieve back to the variable addressData so we can use that variable which stores an array and map through it to display different AddressContainer components
            grabAddressData(newAddressData);
            // Clearing out the object used to store the information that users put in the input fields so it's blank when users want to create a new one
            setAddressInput({});
            // Close the modal
            setIsOpen(false);
        }
    }

    // Function that creates AddressContainer components based off the array set in addressData
    // We map through the array and grab the address (so we have the data of each individual address) and the index (so we can assign them as keys for React's virtual DOM)
    const allAddresses = addressData.map((address, index) => {
        if (addressData === undefined) {
            return null;
        } else {
            return( 
                <AddressContainer 
                key={index} 
                address={address} 
                backend={backend}
                addressData={addressData}
                grabAddressData={grabAddressData}
                defaultFirst={defaultFirst}
                loggedIn={loggedIn}
                capitalize={capitalize}
                capitalizeArray={capitalizeArray}/>
            )
        }
    })

    return (
        <div className="addresses-container">
            <div className="header-container">
                <div className="header">Saved Addresses</div>
                {/* The button that opens the modal that users can use to create new addresses */}
                <div 
                className="add-address" 
                onClick={openModal}>
                    Add Address
                </div>
            </div>
            {/* If there are no addresses, then return a statement that tells users to add an address, otherwise the user will see all the addresses they have decided to save */}
            {addressData[0] === undefined ? 
                <div>Add Your Address Above</div> : 
            <>
                <div className="all-address-container">
                    <div className="all-addresses-container">{addressData.length !== 0 && allAddresses}
                    </div>
                </div>
            </>}
            {/* Modal that specifically pertains to the adding new addresses */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
                >
                <form className="form">
                <h2>Add Your Address</h2>
                <input 
                value={addressInput.firstName || ""} 
                name="firstName" 
                placeholder="First Name" 
                onChange={handleAddressChange}/>
                {(/^[a-z][a-z\s]*$/i.test(addressInput.firstName) !== true 
                && addressInput.firstName !== "") 
                && <div className="warning">You must enter only letters as your first name</div>}
                <input 
                value={addressInput.lastName || ""} 
                name="lastName" 
                placeholder="Last Name" 
                onChange={handleAddressChange}/>
                {(/^[a-z][a-z\s]*$/i.test(addressInput.lastName) !== true 
                && addressInput.lastName !== "") 
                && <div className="warning">You must enter only letters as your last name</div>}
                <input 
                value={addressInput.addressLineOne || ""} 
                name="addressLineOne" 
                placeholder="Address Line One"
                onChange={handleAddressChange}/>
                {addressInput.addressLineOne === "" 
                && <div className="warning">You must enter an address</div>}
                <input 
                value={addressInput.addressLineTwo || ""} 
                name="addressLineTwo" 
                placeholder="Address Line Two"
                onChange={handleAddressChange}/>
                <input 
                value={addressInput.city || ""} 
                name="city" placeholder="City"
                onChange={handleAddressChange}/>
                {(/^[a-z][a-z\s]*$/i.test(addressInput.city) !== true 
                && addressInput.city !== "") 
                && <div className="warning">You must enter only letters as your city</div>}
                <input 
                value={addressInput.state || ""} 
                name="state" 
                placeholder="State"
                onChange={handleAddressChange}/>
                {(/^[a-z][a-z\s]*$/i.test(addressInput.state) !== true 
                && addressInput.state !== "") 
                && <div className="warning">You must enter only letters as your state</div>}
                <input 
                value={addressInput.zipcode || ""} 
                name="zipcode" 
                placeholder="Zipcode"
                onChange={handleAddressChange}
                type="text" 
                maxLength="5" 
                pattern="\d*"/>
                {(/[a-zA-Z]/g.test(addressInput.zipcode) === true 
                && addressInput.zipcode !== undefined) 
                && <div className="warning">You must enter only numbers as your zip code</div>}
                {/* Section where users can check off whether or not they want the address being created to become the default address */}
                <div className="default-container">
                    <label htmlFor="addressDefault">Save as default</label>
                    <input name="addressDefault" type="checkbox" id="address-default"/>
                </div>
                {addZipcodeAddressWarning 
                && <div className="warning">You must enter five digits as your zip code</div>}
                {addStateAbbreviationAddressWarning 
                && <div className="warning">Please enter your state as an abbreviation (ex. CA, NY)</div>}
                {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
                <button onClick={handleSubmitAddress} 
                disabled={
                (/^[a-z][a-z\s]*$/i.test(addressInput.firstName) !== true 
                || addressInput.firstName === undefined)
                || (/^[a-z][a-z\s]*$/i.test(addressInput.lastName) !== true 
                || addressInput.lastName === undefined)
                || addressInput.addressLineOne === undefined
                || (/^[a-z][a-z\s]*$/i.test(addressInput.city) !== true 
                || addressInput.city === undefined)
                || (/^[a-z][a-z\s]*$/i.test(addressInput.state) !== true 
                || addressInput.state === undefined)
                || (/[a-zA-Z]/g.test(addressInput.zipcode) === true 
                || addressInput.zipcode === undefined)
                }>
                    Submit
                </button>
                </form>
                </Modal>
        </div>
    )
}

export default UserProfileAddress