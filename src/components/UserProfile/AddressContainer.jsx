import React, { useState } from 'react';
import '../../styles/UserProfile/AddressContainer.css'
import Modal from 'react-modal';
// import Input from '../Input'
// import { Redirect } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import usStates from '../../components/states'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

import {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, addressLineOneInputError, cityInputError, cityInputError2, stateInputError, zipcodeInputError, zipcodeInputError2, zipcodeInputError3, phoneInputError2, phoneInputError3} from '../../components/Checkout/inputsErrors'

import '../../styles/UserProfile/AddressForm.css'

const useStyles = makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        'margin-bottom': '1.75rem',
        width: "100%"

      },
    },
    formControl: {
        margin: theme.spacing(1),
        // minWidth: 120,
    },
}));
function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
        {...other}
        ref={(ref) => {
            inputRef(ref ? ref.inputElement : null);
        }}
        mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
        placeholderChar={'\u2000'}
        showMask
        />
    );
}
  
TextMaskCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
};
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

Modal.setAppElement('#root');

function AddressContainer ({ index, address, backend, grabAddressData, defaultFirst, capitalize, capitalizeArray, loggedIn, grabRedirect }) {

    const classes = useStyles()

    /* ------- STATES ------- */

    // Getter and Setter to open and close the edit modal for addresses
    const [isEditModalIsOpen,setIsEditModalOpen] = useState(false);
    // Getter and Setter to open and close the delete modal for addresses
    const [isDeleteModalIsOpen,setIsDeleteModalOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the editing address function
    const [editAddress, setEditAddress] = useState({});
    // Getter and Setter to disable the button relating to the edit address modal when users click submit
    const [disabledOnSubmitEditAddressModal, setDisabledOnSubmitEditAddressModal] = useState(false);
    // Getter and Setter to disable clicking out of the edit address modal once the server is processing
    const [overlayClickCloseEditAddressModal, setOverlayClickCloseEditAddressModal] = useState(true);
    // Getter and Setter to disable the button relating to the delete address modal when users click submit
    const [disabledOnSubmitDeleteAddressModal, setDisabledOnSubmitDeleteAddressModal] = useState(false);
    // Getter and Setter to disable clicking out of the delete address modal once the server is processing=
    const [overlayClickCloseDeleteAddressModal, setOverlayClickCloseDeleteAddressModal] = useState(true);


    // States for Editing Address Modal Inputs When required inputs are out of focus but have not been completed
    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)
    const [onPhoneBlurEvent, setOnPhoneBlurEvent] = useState(false) 

    const handleMaxZipcodeLength = (event) => {
        console.log(204, event.target)
        if (event.target.value.length > event.target.maxLength) {
            event.target.value = event.target.value.slice(0, event.target.maxLength)
        }
    }

    const handleNonNumericZipcode =(event) => {
        if(event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) return event.preventDefault()
    }

    // Function that runs when the edit modal opens
    const openEditModal = async (e) => {
        // Fetching to the backend to GET the information related to the particular address this container is rendering
        if (loggedIn()) {
            const oneAddressResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            // Data regarding the addresses that is received back from the request to the backend server
            const oneAddressData = await oneAddressResponse.json();
            console.log(51, oneAddressData)
            // Splitting the name with the comma so we get an array back
            const name = oneAddressData.address.Name.split(", ");
            // Splitting the address with the comma so we get an array back
            const address = oneAddressData.address.Address.split(", ");
            // Function that sets the input values equal to the data received back
            const checkForAddressLineTwo = () => {
                // Define arrays that will be used to capitalize strings with multiple words (like full name, or addresses)
                const [capitalizedAddressLineOneEditModal, capitalizedAddressLineTwoEditModal, capitalizedCityEditModal] = [[], [], []];
                // Our condition is make sure that we prefill data in the input based off whether or not there is an addressLineTwo, since it is not required
                if (address[1] === "undefined"){
                    setEditAddress({
                        firstName: capitalize(name[0]),
                        lastName: capitalize(name[1]),
                        addressLineOne: capitalizeArray(address[0].split(" "), capitalizedAddressLineOneEditModal),
                        addressLineTwo: "",
                        city: capitalizeArray(address[2].split(" "), capitalizedCityEditModal),
                        state: address[3],
                        zipcode: address[4],
                        phone: oneAddressData.address.Phone
                    })
                } else {
                    setEditAddress({
                        firstName: capitalize(name[0]),
                        lastName: capitalize(name[1]),
                        addressLineOne: capitalizeArray(address[0].split(" "), capitalizedAddressLineOneEditModal),
                        addressLineTwo: capitalizeArray(address[1].split(" "), capitalizedAddressLineTwoEditModal),
                        city: capitalizeArray(address[2].split(" "), capitalizedCityEditModal),
                        state: address[3],
                        zipcode: address[4],
                        phone: oneAddressData.address.Phone
                    });
                };
            };
            checkForAddressLineTwo();
            // After we finish inputting the data from the fetch request, we display the modal so we set the condition of the edit modal to true
            setIsEditModalOpen(true);
        } else {
            grabRedirect();
        };
    };

    // Function to open the modal regarding deletion of an address
    const openDeleteModal = () => {
        if (loggedIn()) {
            setIsDeleteModalOpen(true);
        } else {
            grabRedirect();
        };
    };

    // Function used to close the modal by setting the edit and delete modal condition to false
    const closeModal = () => {
        if (loggedIn()) {
            setIsEditModalOpen(false);
            setIsDeleteModalOpen(false);
            setDisabledOnSubmitEditAddressModal(false);
            setOverlayClickCloseEditAddressModal(true);
            setDisabledOnSubmitDeleteAddressModal(false);
            setOverlayClickCloseDeleteAddressModal(true);
        } else {
            grabRedirect();
        };
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the address
    const handleEditAddressChange = (e) => {
        if (loggedIn()) {
            const { name, value } = e.target;
            setEditAddress((prevAddress) => ({
                ...prevAddress, [name] : value
            }));
        } else {
            grabRedirect();
        };
    };

    const handleEditAddressStateChange = (event) => {
        // console.log(event.target.value)
        setEditAddress((prevAddress) => ({
            ...prevAddress, state: event.target.value
        }))
    }

    // Function that handles the editing of the addresses (not the default part)
    const handleEditAddress = async(e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // If the user does fulfill the requirements for the all the inputs
        if (loggedIn()) {
            setDisabledOnSubmitEditAddressModal(true);
            setOverlayClickCloseEditAddressModal(false);
            // Creating a variable that tells the server we are EDITING the information for a specific address, which is identified from the e.target.id
            const editAddressResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                // For our body, we need to have a value for both the address and name, and we use the values received back from the inputs to do so
                body: JSON.stringify({
                    address: `${editAddress.addressLineOne}, ${editAddress.addressLineTwo}, ${editAddress.city}, ${editAddress.state}, ${editAddress.zipcode}`,
                    name: `${editAddress.firstName}, ${editAddress.lastName}`,
                    phone: editAddress.phone.replace(/\D/g,'')
                })
            });
            // Data regarding the addresses that is received back from the request to the backend server when editing is finished to receive updated version of the data
            const editAddressData = await editAddressResponse.json();
            // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
            defaultFirst(editAddressData);
            // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
            grabAddressData(editAddressData);
            // Empty the object of the address inputs so that new ones can replace it later on without any duplication errors
            setEditAddress({});
            // Close the modal after all of this function is finished so user will return back on the regular screen
            closeModal();
        } else {
            grabRedirect();
        };
    };

    // Function that handles the editing of the default status (and not the contents of the address)
    const handleEditAddressDefaultStatus = async(e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        if (loggedIn()) {
            // Fetching to a server to make a request to update the default status based off of the current default status. If the default status is true, then it will turn into false, and vice versa.
            const editDefaultResponse = await fetch(`${backend}/shipping/default/address/${e.target.id}?default=${!defaultAddress}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            // Data regarding the addresses that is received back from the request to the backend server when editing default is finished to receive updated version of the data
            const editDefaultData = await editDefaultResponse.json();
            // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
            defaultFirst(editDefaultData);
            // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
            grabAddressData(editDefaultData);
            // Close the modal after all of this function is finished so user will end up back on the regular screen
            setIsEditModalOpen(false);
        } else {
            grabRedirect();
        };
    };

    // Function that handles the deleting of addresses
    const handleDeleteAddress = async (e) => {
        // Prevents the page from refreshing
        e.preventDefault();
        // Fetching to a server to make a request to delete an address
        if (loggedIn()) {
            setDisabledOnSubmitDeleteAddressModal(true);
            setOverlayClickCloseDeleteAddressModal(false);
            const deleteResponse = await fetch(`${backend}/shipping/address/${e.target.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            });
            // Data regarding the addresses that is received back from the request to the backend server when deleting is finished to receive updated version of the data
            const deleteAddressData = await deleteResponse.json();
            // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default address first on the list followed by the newest
            defaultFirst(deleteAddressData);
            // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable AddressData, so we can reuse that data to map through and display the different AddressContainer components
            closeModal();
            // Close the modal after all of this function is finished so user will end up back on the regular screen
            grabAddressData(deleteAddressData);
        } else {
            grabRedirect();
        };
    };

    // Define arrays that will be used to capitalize strings with multiple words (like full name, or addresses)
    const [capitalizedName, capitalizedFirstAddressLine, capitalizedSecondAddressLine, capitalizedCity] = [[], [], [], []];
    // Capitalize the full name even if users enter it lowercased
    const name = capitalizeArray(address.Name.replace(/,/g, '').split(' '), capitalizedName);
    // Function that will shorten the length of the full name if the name is too long to fit in the container without interfering with the styling
    const shortenName = (name) => {
        // If the name is longer than 25 characters, then we split it into an array and splice it to only bring back the first 25 characters and rejoin.
        if (name.length > 25) {
            return `${name.split("").splice(0, 25).join("")}...`;
        } else {
            // If name is not above 25 characters, then we return the name
            return name;
        }
    };
    const newAddress = address.Address.split(',')
    // Capitalize the address line one even if users enter it lowercased
    const firstAddressLine = capitalizeArray(newAddress[0].split(" "), capitalizedFirstAddressLine);
    // Capitalize the address line two even if users enter it lowercased
    const secondAddressLine = capitalizeArray(newAddress[1].split(" "), capitalizedSecondAddressLine);
    // Capitalize the city even if users enter it lowercased
    const city = capitalizeArray(newAddress[2].split(' '), capitalizedCity);
    // Capitalize the state even if users enter it lowercased
    const state = newAddress[3].toUpperCase();
    const zipcode = newAddress[4];
    // When users do enter a value for the second address
    const addressLineWithSecondAddress = `${firstAddressLine} ${secondAddressLine}`
    const secondAddressLineWithSecondAddress = `${city}, ${state} ${zipcode}`
    // When users do not enter a value for the second address
    const addressLineWithoutSecondAddress = `${firstAddressLine}`
    const secondAddressLineWithoutSecondAddress = `${city}, ${state} ${zipcode}`
    // This returns a boolean on whether or not address is default
    const defaultAddress = address.DefaultAddress

    // Returning only if the address is not blank
    if (address) {
        return (
            <>
            <div key={index} className="one-address-container">
                {/* We find the person's name on top of the card */}
                    <div className="person-name">{shortenName(name)}</div>
                    {/* Next we put the address line one */}
                    <div className="address">
                        {/* We wrap it around curly braces so that the information that renders is based off of whether or not there is a second line to the address */}
                        {(newAddress[1] === ' Undefined' || newAddress[1] === null  )
                        ? addressLineWithSecondAddress : addressLineWithoutSecondAddress }
                    </div>
                    <div className="address">
                        {/* We wrap it around curly braces so that the information that renders is based off of whether or not there is a second line to the address */}
                        {(newAddress[1] === ' undefined' ||  newAddress[1] === null)
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
            shouldCloseOnOverlayClick={overlayClickCloseEditAddressModal}
            isOpen={isEditModalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form 
            classes={classes.root}
            className="profile-edit-form" 
            id={address._id} 
            onSubmit={handleEditAddress}
            noValidate autoComplete="off"
            >
            <h2>Edit Your Address</h2>
            {/* Input regarding the first name of the editing address modal */}
            {/* <Input 
            value={editAddress.firstName || ""} 
            name={"firstName"} 
            placeholder={"First Name"} 
            type={"text"} 
            onChange={handleEditAddressChange}/> */}
            {/* Appears when the input for first name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
            {/* {(/^[a-z ,.'-]+$/i.test(editAddress.firstName) !== true 
            && editAddress.firstName !== "") 
            && <div className="warning">You must enter only letters as your first name</div>} */}

            <div id="profile-names-container">
                <div id="profile-firstName">
                    <TextField
                    label="First Name"
                    className="filled-margin-none"
                    placeholder="Enter First Name"
                    variant="filled"
                    required
                    fullWidth
                    error={firstNameInputError(editAddress) || onFirstNameBlurEvent}
                    onFocus={() => setOnFirstNameBlurEvent(false)}
                    onBlur={() => {
                        if(firstNameInputError2(editAddress)) setOnFirstNameBlurEvent(true)
                    }}
                    helperText={(onFirstNameBlurEvent &&  "Required field") ||(firstNameInputError(editAddress) && "Only letters and ', . ' -' are allowed") || ""}
                    value={editAddress.firstName || ""} 
                    name="firstName" 
                    onChange={handleEditAddressChange}
                    />
                </div>
            {/* Input regarding the last name of the editing address modal */}
            {/* <Input 
            value={editAddress.lastName || ""} 
            name={"lastName"} 
            placeholder={"Last Name"} 
            type={"text"} 
            onChange={handleEditAddressChange}/> */}
            {/* Appears when the input for last name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
            {/* {(/^[a-z ,.'-]+$/i.test(editAddress.lastName) !== true 
            && editAddress.lastName !== "") 
            && <div className="warning">You must enter only letters as your last name</div>} */}
                <div id="profile-lastName">
                    <TextField
                    label="Last Name"
                    className="filled-margin-none"
                    placeholder="Enter Last Name"
                    variant="filled"
                    required
                    fullWidth
                    onFocus={() => setOnLastNameBlurEvent(false)}
                    onBlur={() => {
                        if(lastNameInputError2(editAddress)) setOnLastNameBlurEvent(true)
                    }}
                    error={lastNameInputError(editAddress) || onLastNameBlurEvent} 
                    helperText={(onLastNameBlurEvent &&  "Required field")  ||(lastNameInputError(editAddress) && "Only letters and ', . ' -' are allowed") || ""}
                    value={editAddress.lastName || ""} 
                    name="lastName"
                    onChange={handleEditAddressChange}
                    />
                </div>
            </div>

            {/* Input regarding the first address line of the editing address modal */}
            {/* <Input 
            value={editAddress.addressLineOne || ""} 
            name={"addressLineOne"} 
            placeholder={"Address Line One"} 
            type={"text"} 
            onChange={handleEditAddressChange}/> */}
            {/* Appears when the input for first address line has no input */}
            {/* {editAddress.addressLineOne === "" 
            && <div className="warning">You must enter an address</div>} */}

            <div id="profile-line1">
                <TextField
                label="Address Line One"
                className="filled-margin-none"
                placeholder="Enter Address"
                variant="filled"
                fullWidth
                required
                onFocus={() => setOnLine1BlurEvent(false)}
                onBlur={() => {
                    if(addressLineOneInputError(editAddress)) setOnLine1BlurEvent(true)
                }}
                error={onLine1BlurEvent}
                helperText={onLine1BlurEvent && "Required field"}
                value={editAddress.addressLineOne || ""} 
                name="addressLineOne"
                onChange={handleEditAddressChange}
                />
            </div>

            {/* Input regarding the second address line of the editing address modal */}
            {/* <Input 
            value={editAddress.addressLineTwo || ""} 
            name={"addressLineTwo"} 
            placeholder={"Address Line Two"} 
            type={"text"} 
            onChange={handleEditAddressChange}/> */}
            <div id="profile-line2">
                <TextField
                label="Address Line Two"
                className="filled-margin-none"
                placeholder="Apartment, Floor, Suite"
                variant="filled"
                fullWidth
                value={editAddress.addressLineTwo || ""} 
                name="addressLineTwo"
                onChange={handleEditAddressChange}
                />
            </div>

            {/* Input regarding the city of the editing address modal */}
            {/* <Input 
            value={editAddress.city || ""} 
            name={"city"} 
            placeholder={"City"} 
            type={"text"} 
            onChange={handleEditAddressChange}/> */}
            {/* Appears when the input for city has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
            {/* {(/^[a-z ,.'-]+$/i.test(editAddress.city) !== true 
            && editAddress.city !== "") 
            && <div className="warning">You must enter only letters as your city</div>} */}
            <div id="profile-city">
                <TextField
                label="City"
                fullWidth
                className="filled-margin-none"
                placeholder="Enter City"
                variant="filled"
                required
                onFocus={() => setOnCityBlurEvent(false)}
                onBlur={() => {
                    if(cityInputError2(editAddress)) setOnCityBlurEvent(true)
                }}
                error={cityInputError(editAddress) || onCityBlurEvent}
                helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(editAddress) && "Only letters and ', . ' -' are allowed") || ""}
                value={ editAddress.city || "" } 
                name="city"
                onChange={handleEditAddressChange}
                />
            </div>

            <div className="profile-state-zipcode">
            {/* Input regarding the state of the editing address modal */}
            {/* <Input 
            value={editAddress.state || ""} 
            name={"state"} 
            placeholder={"State"} 
            type={"text"} 
            maxLength={"2"}
            onChange={handleEditAddressChange}/> */}
            {/* Appears when the input for state has anything other than letters */}
            {/* {(/^[a-z][a-z\s]*$/i.test(editAddress.state) !== true 
            && editAddress.state !== "") 
            && <div className="warning">You must enter only letters as your state</div>} */}
                <div id="profile-state">
                    <FormControl variant="filled" className={classes.formControl}>
                        <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
                        <Select
                        label="State"
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        required
                        value={ editAddress.state || "Select"} 
                        onFocus={() => setOnStateBlurEvent(false)}
                        onBlur={() => {
                            if(stateInputError(editAddress)) setOnStateBlurEvent(true)
                        }}
                        onChange={handleEditAddressStateChange}
                        >
                        <MenuItem disabled value="Select">Select</MenuItem>
                        {usStates.map((state, index) => { return (
                            <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
                        )})}
                        </Select>

                        {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
                    </FormControl>
                </div>


            {/* Input regarding the zipcode of the editing address modal */}
            {/* <Input 
            value={editAddress.zipcode || ""} 
            name={"zipcode"} 
            placeholder={"Zipcode"}
            onChange={handleEditAddressChange} 
            type={"text"} 
            maxLength={"5"} /> */}
            {/* Appears when the input for zipcode has anything other than numbers */}
            {/* {(/^[0-9]+$/.test(editAddress.zipcode) !== true 
            && editAddress.zipcode !== "") 
            && <div className="warning">You must enter only numbers as your zip code</div>} */}
            {/* Appears when the input for zipcode has not met the five digit count length */}
                <div id="profile-zipcode">
                    <TextField
                    id="shipping-postalCode-input"
                    label="Zipcode"
                    className="filled-margin-none"
                    placeholder="Enter zipcode"
                    variant="filled"
                    inputProps={{
                        type: "number",
                        maxLength: 5
                    }}
                    fullWidth
                    required
                    onInput={handleMaxZipcodeLength}
                    onKeyDown={handleNonNumericZipcode}
                    onFocus={() => setOnPostalCodeBlurEvent(false)}
                    onBlur={() => {
                        if(zipcodeInputError3(editAddress) || zipcodeInputError2(editAddress)) setOnPostalCodeBlurEvent(true)
                    }}
                    error={zipcodeInputError(editAddress) || onPostalCodeBlurEvent}
                    helperText={(onPostalCodeBlurEvent && "Required field") || (zipcodeInputError(editAddress) && "You must enter only numbers for your zip code") || ""}
                    value={ editAddress.zipcode || "" } 
                    name="zipcode"
                    onChange={handleEditAddressChange}
                    />
                </div>
            </div>
            
            <div id="profile-phoneNumber">
                <FormControl>
                    <InputLabel>Phone Number</InputLabel>
                    <Input
                    fullWidth
                    required
                    label="Phone Number"
                    value={ editAddress.phone || "" }
                    onChange={handleEditAddressChange}
                    onFocus={() => setOnPhoneBlurEvent(false)}
                    onBlur={() => {
                        if(phoneInputError3(editAddress) || phoneInputError2(editAddress)) setOnPhoneBlurEvent(true)
                    }}
                    error ={onPhoneBlurEvent}
                    name="phone"
                    id="formatted-text-mask-input"
                    inputComponent={TextMaskCustom}
                    />
                </FormControl>
                {onPhoneBlurEvent && <FormHelperText>Required field</FormHelperText>}
            </div>
            
            <div 
            className="submit-default-button-container" 
            style={{marginTop: '1rem'}}>
            {/* Based off whether or not defaultAddress is true or false, we display the button that allows users to remove default if the address is the default, or the button to make the address a default if it is not currently the default address */}
            {!defaultAddress ? <div className="update-default-container">
                <Button id={address._id} onClick={handleEditAddressDefaultStatus}>Make Default</Button>
                </div> :
                <div>
                <Button id={address._id} onClick={handleEditAddressDefaultStatus}>Remove Default</Button>
            </div>}



            {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
            <Button id={address._id}
            type="submit"
            value="Submit"
            disabled={
            (/^[a-z ,.'-]+$/i.test(editAddress.firstName) !== true 
            || editAddress.firstName === "")
            || (/^[a-z ,.'-]+$/i.test(editAddress.lastName) !== true 
            || editAddress.lastName === "")
            || editAddress.addressLineOne === ""
            || (/^[a-z ,.'-]+$/i.test(editAddress.city) !== true 
            || editAddress.city === "")
            || editAddress.state === "Select" 
            || (/^[0-9]+$/.test(editAddress.zipcode) !== true 
            || editAddress.zipcode === undefined
            || editAddress.zipcode === "")
            || editAddress.zipcode.length !== 5
            || (editAddress.phone &&  /^[0-9]+$/.test(editAddress.phone.replace(/\D/g,'')) !== true)
            || editAddress.phone === ""
            || editAddress.phone === undefined
            || (editAddress.phone && editAddress.phone.replace(/\D/g,'').toString().length!==10)
            || disabledOnSubmitEditAddressModal}>
            Submit</Button>
            </div>
            </form>
            </Modal>
            {/* Modal used to delete the address */}
            <Modal
            shouldCloseOnOverlayClick={overlayClickCloseDeleteAddressModal}
            isOpen={isDeleteModalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Edit Your Address"
            >
            <form className="form" id="delete-address-form">
            <div style={{'marginBottom':'1rem'}}>Are you sure you want to delete this address?</div>
            <div className="submit-default-button-container">
            <button id={address._id} 
            type="submit"
            form="delete-address-form"
            value="Submit"
            // When user clicks to submit, the address will be deleted
            onClick={handleDeleteAddress}
            disabled={disabledOnSubmitDeleteAddressModal}>
            Delete</button>
            <button 
            onClick={closeModal}
            disabled={disabledOnSubmitDeleteAddressModal}>Cancel</button>
            </div>
            </form>
            </Modal>
            </>
        );
    };
};

export default AddressContainer