import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Modal from 'react-modal';
import CustomInput from '../../components/Input';
import AddressContainer from '../../components/UserProfile/AddressContainer';

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

function UserProfileAddress ({ backend, addressData, defaultFirst, grabAddressData, loggedIn, capitalize, capitalizeArray, grabTotalCartQuantity, grabRedirect }) {

    const classes = useStyles();

    /* ------- STATES ------- */

    // Getter and Setter to display modal based off a boolean value
    const [modalIsOpen,setIsOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the adding address function
    const [addressInput, setAddressInput] = useState({state: "Select"});
    // Getter and setter to display a warning message regarding when the user does not fulfill requirements for the zipcode input when creating an address
    const [disabledOnSubmitAddAddressModal, setDisabledOnSubmitAddAddressModal] = useState(false);
    const [overlayClickCloseAddAddressModal, setOverlayClickCloseAddAddressModal] = useState(true);

    // States for Adding Address Modal Inputs When required inputs are out of focus but have not been completed
    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)
    const [onPhoneBlurEvent, setOnPhoneBlurEvent] = useState(false) 

    // Style for the Modal
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
        if (loggedIn()) {
            setIsOpen(true);
        }
        else {
            grabRedirect();
        };
    };

    // Function that is used to close the modal when the user either leaves or submits a address
    const closeModal = () => {
        if (loggedIn()) {
            setIsOpen(false);
            setAddressInput({});
            setOverlayClickCloseAddAddressModal(true);
            setDisabledOnSubmitAddAddressModal(false);
        } else {
            grabRedirect();
        };
    };

    // Function that is used to make sure the inputs that are being put in by the user is saved to the addressInput object so we can use the object when creating a new address
    const handleAddressChange = (e) => {
        if (loggedIn()) {
            const { name, value } = e.target
        setAddressInput((prevAddress) => ({
            ...prevAddress, [name] : value
        }));
        } else {
            grabRedirect();
        }
    };

    const handleShippingStateChange = (event) => {
        // console.log(event.target.value)
        setAddressInput((prevAddress) => ({
            ...prevAddress, state: event.target.value
        }))
    }

    const handleMaxZipcodeLength = (event) => {
        console.log(204, event.target)
        if (event.target.value.length > event.target.maxLength) {
            event.target.value = event.target.value.slice(0, event.target.maxLength)
        }
    }

    const handleNonNumericZipcode =(event) => {
        if(event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) return event.preventDefault()
    }

    // Function that is used to handle the event when a user submits the request to make a new address
    const handleSubmitAddress = async (event) => {
        // Prevents the page from refreshing
        event.preventDefault();
        if (loggedIn()) {
        setDisabledOnSubmitAddAddressModal(true);
        setOverlayClickCloseAddAddressModal(false);
        // Grabbing the DOM element with the ID of address-default (which is the checkbox that is used by users to indicate whether or not they want said address to be default or not)
        const checkbox = document.getElementById('address-default');
        // We check if the checkbox is checked or not, and this will return a boolean
        const check = checkbox.checked
        // Fetching to the backend server to make a request to create a new address and using string interopolation to dynamically set the address to request whether or not the address will be a default address or not
        const newAddressResponse = await fetch(`${backend}/shipping/address?lastUse=false&default=${check}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            },
            // Using the addressInput object, we are able to grab the values and use these values to generate what user wants for the name and address of the address they are trying to create
            body: JSON.stringify({
                name: `${addressInput.firstName}, ${addressInput.lastName}`,
                address: `${addressInput.addressLineOne}, ${addressInput.addressLineTwo}, ${addressInput.city}, ${addressInput.state}, ${addressInput.zipcode}`,
                phone: addressInput.phone.replace(/\D/g,''),
            })
        });
        // Data regarding the addresses that is received back from the request to the backend server when creating is finished to receive updated version of the data
        const newAddressData = await newAddressResponse.json();
        // Make sure that data we recieve back is ordered so that the default will be first followed by newest address added
        defaultFirst(newAddressData);
        // Assigning the data we recieve back to the variable addressData so we can use that variable which stores an array and map through it to display different AddressContainer components
        grabAddressData(newAddressData);
        console.log(newAddressData);
        // Clearing out the object used to store the information that users put in the input fields so it's blank when users want to create a new one
        setAddressInput({});
        // Close the modal
        closeModal();
        } else {
            grabRedirect();
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
                capitalizeArray={capitalizeArray}
                grabTotalCartQuantity={grabTotalCartQuantity}
                grabRedirect={grabRedirect}/>
            );
        }
    });

    return (
        <div className={addressData[0] === undefined ? "addresses-container-noInfo" : "addresses-container"}>
            <div className="header-container">
                <div className="header">Saved Addresses</div>
                {/* The button that opens the modal that users can use to create new addresses */}
                <div 
                className="add-address" 
                onClick={openModal}>
                    Add Address
                </div>
                <div 
                className="add-address-media add-address" 
                onClick={openModal}>
                    <FontAwesomeIcon icon={faPlus}/>
                </div>
            </div>
            {/* If there are no addresses, then return a statement that tells users to add an address, otherwise the user will see all the addresses they have decided to save */}
            {addressData[0] === undefined ? 
                <div 
                style={{
                    display: 'flex',
                    color: '#fff',
                    justifyContent: 'center',
                    height: '100%',
                    alignItems: 'center',
                    fontFamily: 'Mukta Vaani, sans-serif'
                }}>Looks like you don't have any addresses saved yet! Click the Add Address button to add your first one.</div> : 
            <>
                <div className="all-address-container">
                    <div className="all-addresses-container">{addressData.length !== 0 && allAddresses}
                    {addressData.length % 3 === 1 ? 
                    <>
                    <div className="one-address-container-empty"></div>
                    <div className="one-address-container-empty"></div>
                    </> : addressData.length % 3 === 2 ? 
                    <div className="one-address-container-empty"></div>: <div></div>}
                    </div>
                </div>
            </>}
            {/* Modal that specifically pertains to the adding new addresses */}
            <Modal
            id="profile-add-modal"
            shouldCloseOnOverlayClick={overlayClickCloseAddAddressModal}
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
                <form id="profile-form" classes={classes.root} noValidate autoComplete="off">
                <h2>Add Your Address</h2>
                {/* Input regarding the first name of the adding address modal */}
                {/* <Input 
                value={addressInput.firstName || ""} 
                name={"firstName"}
                placeholder={"First Name"}
                type={"text"}
                onChange={handleAddressChange}/> */}
                {/* Appears when the input for first name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(addressInput.firstName) !== true 
                && addressInput.firstName !== "") 
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
                        error={firstNameInputError(addressInput) || onFirstNameBlurEvent}
                        onFocus={() => setOnFirstNameBlurEvent(false)}
                        onBlur={() => {
                            if(firstNameInputError2(addressInput)) setOnFirstNameBlurEvent(true)
                        }}
                        helperText={(onFirstNameBlurEvent &&  "Required field") ||(firstNameInputError(addressInput) && "Only letters and ', . ' -' are allowed") || ""}
                        value={addressInput.firstName || ""} 
                        name="firstName" 
                        onChange={handleAddressChange}
                        />
                    </div>

                {/* Input regarding the last name of the adding address modal */}
                {/* <Input 
                value={addressInput.lastName || ""} 
                name={"lastName"}
                placeholder={"Last Name"}
                type={"text"}
                onChange={handleAddressChange}/> */}
                {/* Appears when the input for last name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(addressInput.lastName) !== true 
                && addressInput.lastName !== "") 
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
                            if(lastNameInputError2(addressInput)) setOnLastNameBlurEvent(true)
                        }}
                        error={lastNameInputError(addressInput) || onLastNameBlurEvent} 
                        helperText={(onLastNameBlurEvent &&  "Required field")  ||(lastNameInputError(addressInput) && "Only letters and ', . ' -' are allowed") || ""}
                        value={addressInput.lastName || ""} 
                        name="lastName"
                        onChange={handleAddressChange}
                        />
                    </div>
                </div>

                {/* Input regarding the first address line of the adding address modal */}
                {/* <Input 
                value={addressInput.addressLineOne || ""} 
                name={"addressLineOne"}
                placeholder={"Address Line One"}
                type={"text"}
                onChange={handleAddressChange}/> */}
                {/* Appears when the input for first address line has no input */}
                {/* {addressInput.addressLineOne === "" 
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
                        if(addressLineOneInputError(addressInput)) setOnLine1BlurEvent(true)
                    }}
                    error={onLine1BlurEvent}
                    helperText={onLine1BlurEvent && "Required field"}
                    value={addressInput.addressLineOne || ""} 
                    name="addressLineOne"
                    onChange={handleAddressChange}
                    />
                </div>

                {/* Input regarding the second address line of the adding address modal */}
                {/* <Input 
                value={addressInput.addressLineTwo || ""} 
                name={"addressLineTwo"}
                placeholder={"Address Line Two"}
                type={"text"}
                onChange={handleAddressChange}/> */}
                <div id="profile-line2">
                    <TextField
                    label="Address Line Two"
                    className="filled-margin-none"
                    placeholder="Apartment, Floor, Suite"
                    variant="filled"
                    fullWidth
                    value={addressInput.addressLineTwo || ""} 
                    name="addressLineTwo"
                    onChange={handleAddressChange}
                    />
                </div>

                {/* Input regarding the city of the adding address modal */}
                {/* <Input 
                value={addressInput.city || ""} 
                name={"city"}
                placeholder={"City"}
                type={"text"}
                onChange={handleAddressChange}/> */}
                {/* Appears when the input for city has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
                {/* {(/^[a-z ,.'-]+$/i.test(addressInput.city) !== true 
                && addressInput.city !== "") 
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
                        if(cityInputError2(addressInput)) setOnCityBlurEvent(true)
                    }}
                    error={cityInputError(addressInput) || onCityBlurEvent}
                    helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(addressInput) && "Only letters and ', . ' -' are allowed") || ""}
                    value={ addressInput.city || "" } 
                    name="city"
                    onChange={handleAddressChange}
                    />
                </div>

                {/* Input regarding the state of the adding address modal */}
                {/* <Input 
                value={addressInput.state || ""} 
                name={"state"}
                placeholder={"State"}
                type={"text"}
                maxLength="2"
                onChange={handleAddressChange}/> */}
                {/* Appears when the input for state has anything other than letters */}
                {/* {(/^[a-z][a-z\s]*$/i.test(addressInput.state) !== true 
                && addressInput.state !== "") 
                && <div className="warning">You must enter only letters as your state</div>} */}
                <div className="profile-state-zipcode">
                    <div id="profile-state">
                        <FormControl variant="filled" className={classes.formControl}>
                            <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
                            <Select
                            label="State"
                            labelId="demo-simple-select-filled-label"
                            id="demo-simple-select-filled"
                            required
                            value={ addressInput.state || "Select"} 
                            onFocus={() => setOnStateBlurEvent(false)}
                            onBlur={() => {
                                if(stateInputError(addressInput)) setOnStateBlurEvent(true)
                            }}
                            onChange={handleShippingStateChange}
                            >
                            <MenuItem disabled value="Select">Select</MenuItem>
                            {usStates.map((state, index) => { return (
                                <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
                            )})}
                            </Select>

                            {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
                        </FormControl>
                    </div>

                {/* Input regarding the zipcode of the adding address modal */}
                {/* <Input 
                value={addressInput.zipcode || ""} 
                name={"zipcode"} 
                placeholder={"Zipcode"}
                onChange={handleAddressChange}
                type={"text"} 
                maxLength={"5"} 
                pattern={"\d*"}/> */}
                {/* Appears when the input for zipcode has anything other than numbers */}
                {/* {(/^[0-9]+$/.test(addressInput.zipcode) !== true 
                && addressInput.zipcode !== undefined) 
                && <div className="warning">You must enter only numbers as your zip code</div>} */}
                {/* Section where users can check off whether or not they want the address being created to become the default address */}
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
                            if(zipcodeInputError3(addressInput) || zipcodeInputError2(addressInput)) setOnPostalCodeBlurEvent(true)
                        }}
                        error={zipcodeInputError(addressInput) || onPostalCodeBlurEvent}
                        helperText={(onPostalCodeBlurEvent && "Required field") || (zipcodeInputError(addressInput) && "You must enter only numbers for your zip code") || ""}
                        value={ addressInput.zipcode || "" } 
                        name="zipcode"
                        onChange={handleAddressChange}
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
                        value={ addressInput.phone || "" }
                        onChange={handleAddressChange}
                        onFocus={() => setOnPhoneBlurEvent(false)}
                        onBlur={() => {
                            if(phoneInputError3(addressInput) || phoneInputError2(addressInput)) setOnPhoneBlurEvent(true)
                        }}
                        error ={onPhoneBlurEvent}
                        name="phone"
                        id="formatted-text-mask-input"
                        inputComponent={TextMaskCustom}
                        />
                    </FormControl>
                    {onPhoneBlurEvent && <FormHelperText>Required field</FormHelperText>}
                </div>
                {/* {onPhoneBlurEvent && <FormHelperText>Required field</FormHelperText>} */}

                <div className="default-container">
                    <CustomInput 
                    name={"addressDefault"} 
                    type={"checkbox"} 
                    id={"address-default"}/>
                    <label htmlFor="addressDefault">Save as default</label>
                </div>


                {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
                <div id="profile-submit-button-container">
                <Button 
                variant="dark"
                size="lg"
                onClick={handleSubmitAddress} 
                disabled={
                (/^[a-z ,.'-]+$/i.test(addressInput.firstName) !== true 
                || addressInput.firstName === undefined)
                || (/^[a-z ,.'-]+$/i.test(addressInput.lastName) !== true 
                || addressInput.lastName === undefined)
                || addressInput.addressLineOne === undefined
                || addressInput.addressLineOne === ""
                || (/^[a-z ,.'-]+$/i.test(addressInput.city) !== true 
                || addressInput.city === undefined)
                || addressInput.state === "Select"
                // || (/^[a-z][a-z\s]*$/i.test(addressInput.state) !== true 
                // || addressInput.state === undefined)
                // || addressInput.state.length !== 2 
                || (/^[0-9]+$/.test(addressInput.zipcode) !== true 
                || addressInput.zipcode === undefined
                || addressInput.zipcode === "")
                || addressInput.zipcode.length !== 5
                || (addressInput.phone &&  /^[0-9]+$/.test(addressInput.phone.replace(/\D/g,'')) !== true)
                || addressInput.phone === ""
                || addressInput.phone === undefined
                || (addressInput.phone && addressInput.phone.replace(/\D/g,'').toString().length!==10)
                || disabledOnSubmitAddAddressModal
                }>Submit</Button>
                </div>
                </form>
                </Modal>
        </div>
    );
};

export default UserProfileAddress