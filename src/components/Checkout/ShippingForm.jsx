import React, { useState } from 'react'
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

import {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, line1InputError, cityInputError, cityInputError2, stateInputError, stateInputError2, postalCodeInputError, postalCodeInputError2, postalCodeInputError3, phoneInputError, phoneInputError2, phoneInputError3} from './inputsErrors'

import '../../styles/Checkout/ShippingForm.css'
import '../../styles/Checkout/Shipping.css'

// const useStyles = makeStyles((theme) => ({
//     root: {
//       display: 'flex',
//       flexWrap: 'wrap',
//     },
//     textField: {
//       marginLeft: theme.spacing(1),
//       marginRight: theme.spacing(1),
//     //   width: '25ch',
//     },
    
// }));

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

// const useStyles = makeStyles((theme) => ({
//     root: {
//       '& > *': {
//         margin: theme.spacing(1),
//       },
//     },
//   }));


  
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

export default function ShippingForm({ loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, editShipping, handleEditShipping, closeModal, collapse, disableButtonAfterMakingRequest, grabDisableButtonAfterMakingRequest, addAdditionalSaveShipping}) {
    console.log(78, readOnly)
    const classes = useStyles();

    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)
    const [onPhoneBlurEvent, setOnPhoneBlurEvent] = useState(false)

    const handleShippingChange = (event) => {
        // console.log(shippingInput)
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    const handleShippingStateChange = (event) => {
        // console.log(event.target.value)
        grabShippingInput((prevShipping) => ({
            ...prevShipping, "state": event.target.value
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

    
    // Depending on if we are adding a shipping (indicated by addShipping state), editing a shipping (indicated by editShipping state), or saving our first address/guest user, different onSubmit form functions will run.
    const handleSubmit = async (event) => {
        event.preventDefault() // prevent the page from refreshing after form submission
        console.log("shipping input: ", shippingInput)
        if(addShipping) {
            console.log("adding")
            grabDisableButtonAfterMakingRequest(true)
            addAdditionalSaveShipping()
        } if(editShipping) {
            console.log("editing")
            grabDisableButtonAfterMakingRequest(true)
            handleEditShipping()
        } else if(!loggedIn() || !shipping.firstName) {
            console.log("guest/first time saving next")
            // addNewShipping()
            collapse()
        }
    }

    const disableButton = () => {
        return (
            /^[a-z ,.'-]+$/i.test(shippingInput.firstName) !== true 
            || shippingInput.firstName === ""
            || shippingInput.firstName === undefined
            || /^[a-z ,.'-]+$/i.test(shippingInput.lastName) !== true 
            || shippingInput.lastName === ""
            || shippingInput.lastName === undefined
            || shippingInput.line1 === ""
            || shippingInput.line1 === undefined
            || /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true 
            || shippingInput.city === ""
            || shippingInput.city === undefined
            || /^[a-z][a-z\s]*$/i.test(shippingInput.state) !== true 
            || shippingInput.state === ""
            || shippingInput.state === undefined
            // || shippingInput.state.length !== 2
            || /^[0-9]+$/.test(Number(shippingInput.postalCode)) !== true 
            || shippingInput.postalCode === ""
            || shippingInput.postalCode === undefined
            || shippingInput.postalCode.length !== 5
            || (shippingInput.phone &&  /^[0-9]+$/.test(Number(shippingInput.phone.replace(/\D/g,''))) !== true)
            || shippingInput.phone === ""
            || shippingInput.phone === undefined
            // || shippingInput.phone.length !== 10
            || (shippingInput.phone && shippingInput.phone.replace(/\D/g,'').toString().length!==10)
        )
    }
    
    return (
        <>
        <form id="shipping-form" name="form" onSubmit={handleSubmit} classes={classes.root} noValidate autoComplete="off">
            <div id="names-container">
                <div id="first-name-container">
                    <TextField
                    label="First Name"
                    className="filled-margin-none"
                    placeholder="Enter First Name"
                    variant="filled"
                    InputProps={{
                        readOnly: readOnly,
                    }}
                    required
                    fullWidth
                    error={firstNameInputError(shippingInput) || onFirstNameBlurEvent}
                    onFocus={() => setOnFirstNameBlurEvent(false)}
                    onBlur={() => {
                        if(firstNameInputError2(shippingInput)) setOnFirstNameBlurEvent(true)
                    }}
                    helperText={(onFirstNameBlurEvent &&  "Required field") ||(firstNameInputError(shippingInput) && "Only letters and ', . ' -' are allowed") || ""}
                    value={shippingInput.firstName || ""} 
                    name="firstName" 
                    onChange={handleShippingChange}
                    />
                </div>
                <div id="last-name-container">
                    <TextField
                    label="Last Name"
                    className="filled-margin-none"
                    placeholder="Enter Last Name"
                    variant="filled"
                    InputProps={{
                        readOnly: readOnly,
                    }}
                    required
                    fullWidth
                    onFocus={() => setOnLastNameBlurEvent(false)}
                    onBlur={() => {
                        if(lastNameInputError2(shippingInput)) setOnLastNameBlurEvent(true)
                    }}
                    error={lastNameInputError(shippingInput) || onLastNameBlurEvent} 
                    helperText={(onLastNameBlurEvent &&  "Required field")  ||(lastNameInputError(shippingInput) && "Only letters and ', . ' -' are allowed") || ""}
                    value={shippingInput.lastName || ""} 
                    name="lastName"
                    onChange={handleShippingChange}
                    />
                </div>
            </div>

            <div id="checkout-shipping-line1">
                <TextField
                label="Address Line One"
                className="filled-margin-none"
                placeholder="Enter Address"
                variant="filled"
                fullWidth
                InputProps={{
                    readOnly: readOnly,
                }}
                required
                onFocus={() => setOnLine1BlurEvent(false)}
                onBlur={() => {
                    if(line1InputError(shippingInput)) setOnLine1BlurEvent(true)
                }}
                error={onLine1BlurEvent}
                helperText={onLine1BlurEvent && "Required field"}
                value={shippingInput.line1 || ""} 
                name="line1"
                onChange={handleShippingChange}
                />
            </div>

            <div id="checkout-shipping-line2">
                <TextField
                label="Address Line Two"
                className="filled-margin-none"
                placeholder="Apartment, Floor, Suite"
                variant="filled"
                fullWidth
                InputProps={{
                    readOnly: readOnly,
                }}
                value={shippingInput.line2 || ""}
                name="line2"
                onChange={handleShippingChange}
                />
            </div>

            <div id="city-container">
                <TextField
                label="City"
                fullWidth
                className="filled-margin-none"
                placeholder="Enter City"
                variant="filled"
                required
                InputProps={{
                    readOnly: readOnly,
                }}
                onFocus={() => setOnCityBlurEvent(false)}
                onBlur={() => {
                    if(cityInputError2(shippingInput)) setOnCityBlurEvent(true)
                }}
                error={cityInputError(shippingInput) || onCityBlurEvent}
                helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(shippingInput) && "Only letters and ', . ' -' are allowed") || ""}
                value={ shippingInput.city || "" } 
                name="city"
                onChange={handleShippingChange}
                />
            </div>

            <div className="state-zipcode">
                <div id="checkout-shipping-state-container">
                    <FormControl variant="filled" className={classes.formControl}>
                    <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
                        <Select
                        label="State"
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        value={ shippingInput.state } 
                        onFocus={() => setOnStateBlurEvent(false)}
                        onBlur={() => {
                            if(stateInputError(shippingInput)) setOnStateBlurEvent(true)
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
                <div id="postalcode-container">
                    <TextField
                    id="shipping-postalCode-input"
                    label="Zipcode"
                    className="filled-margin-none"
                    placeholder="Enter zipcode"
                    variant="filled"
                    InputProps={{
                        readOnly: readOnly,
                    }}
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
                        if(postalCodeInputError3(shippingInput) || postalCodeInputError2(shippingInput)) setOnPostalCodeBlurEvent(true)
                    }}
                    error={postalCodeInputError(shippingInput) || onPostalCodeBlurEvent}
                    helperText={(onPostalCodeBlurEvent && "Required field") || (postalCodeInputError(shippingInput) && "You must enter only numbers for your zip code") || ""}
                    value={ shippingInput.postalCode || "" } 
                    name="postalCode"
                    onChange={handleShippingChange}
                    />
                </div>
            </div>

            <div id="shipping-phoneNumber">
                <FormControl>
                    <InputLabel>Phone Number</InputLabel>
                    <Input
                    fullWidth
                    required
                    label="Phone Number"
                    value={ shippingInput.phone || "" }
                    onChange={handleShippingChange}
                    onFocus={() => setOnPhoneBlurEvent(false)}
                    onBlur={() => {
                        if(phoneInputError3(shippingInput) || phoneInputError2(shippingInput)) setOnPhoneBlurEvent(true)
                    }}
                    error ={onPhoneBlurEvent}
                    name="phone"
                    id="formatted-text-mask-input"
                    inputComponent={TextMaskCustom}
                    readOnly={readOnly}
                    />
                </FormControl>

                {(loggedIn() && !shipping.firstName) && (
                    <div id="save-default-container">
                        <label id="address-default-label" htmlFor="addressDefault">Save as default</label>
                        <input name="saveAddress" type="checkbox" disabled={readOnly} />
                    </div>
                )}
            </div>
            {onPhoneBlurEvent && <FormHelperText>Required field</FormHelperText>}

        {shipping.firstName ? (
            <div id="save-cancel-shipping-buttons">
                <Button id="cancel-shipping-button" size='lg' variant="dark" type="button" onClick={closeModal}>Cancel</Button>
                <Button 
                id="save-shipping-button"
                // form="form" 
                type="submit"
                variant="dark"
                size='lg'
                disabled={disableButton() || disableButtonAfterMakingRequest || shippingInput.state === 'Select' }>
                    Save
                </Button>                
            </div>
        ) : <Button 
            id="next-shipping-button"
            // form="form" 
            type="submit"
            variant="dark"
            size='lg'
            disabled={ readOnly || disableButton() || disableButtonAfterMakingRequest || shippingInput.state === 'Select' }>
                Next
            </Button>   
        }

        </form>
        
        </>      
    )
}


