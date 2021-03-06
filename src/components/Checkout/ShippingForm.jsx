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
        console.log(shippingInput)
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
            || /^[0-9]+$/.test(shippingInput.postalCode) !== true 
            || shippingInput.postalCode === ""
            || shippingInput.postalCode === undefined
            || shippingInput.postalCode.length !== 5
            || /^[0-9]+$/.test(shippingInput.phone) !== true 
            || shippingInput.phone === ""
            || shippingInput.phone === undefined
            // || shippingInput.phone.length !== 10
            || shippingInput.phone.toString().length !==10
        )
    }
    
    return (
        <>
        <form id="shipping-form" name="form" onSubmit={handleSubmit} classes={classes.root} noValidate autoComplete="off">
            <div id="names-container">
                <div id="first-name-container">
                    {/* <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.firstName) !== true && shippingInput.firstName !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>} */}

                    <TextField
                    label="First Name"
                    className="filled-margin-none"
                    placeholder="Enter First Name"
                    className={classes.textField}
                    variant="filled"
                    readOnly={readOnly} 
                    required
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
                    {/* <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.lastName) !== true && shippingInput.lastName !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>} */}
                    <TextField
                    label="Last Name"
                    className="filled-margin-none"
                    placeholder="Enter Last Name"
                    variant="filled"
                    className={classes.textField}
                    readOnly={readOnly} 
                    required
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

            {/* <input value={shippingInput.line1 || ""} name="line1" placeholder="Address Line One" onChange={handleShippingChange} readOnly={readOnly} required/> */}
            <div id="checkout-shipping-line1">
                <TextField
                label="Address Line One"
                className="filled-margin-none"
                placeholder="Enter Address"
                variant="filled"
                fullWidth
                className={classes.textField}
                readOnly={readOnly} 
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
            {/* <input value={shippingInput.line2 || ""} name="line2" placeholder="Address Line Two" onChange={handleShippingChange} readOnly={readOnly} /> */}
            <div id="checkout-shipping-line2">
                <TextField
                label="Address Line Two"
                className="filled-margin-none"
                placeholder="Apartment, Floor, Suite"
                variant="filled"
                fullWidth
                className={classes.textField}
                readOnly={readOnly} 
                value={shippingInput.line2 || ""}
                name="line2"
                onChange={handleShippingChange}
                />
            </div>
            <div className="city-state-zipcode">
                <div id="city-container">
                    {/* <input value={shippingInput.city || ""} name="city" placeholder="City" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>} */}
                    <TextField
                    label="City"
                    className="filled-margin-none"
                    placeholder="Enter City"
                    variant="filled"
                    className={classes.textField}
                    readOnly={readOnly} 
                    required
                    onFocus={() => setOnCityBlurEvent(false)}
                    onBlur={() => {
                        if(cityInputError2(shippingInput)) setOnCityBlurEvent(true)
                    }}
                    error={cityInputError(shippingInput) || onCityBlurEvent}
                    helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(shippingInput) && "Only letters and ', . ' -' are allowed") || ""}
                    value={shippingInput.city || ""} 
                    name="city"
                    onChange={handleShippingChange}
                    />
                </div>
                
                {/* <select 
                className="state" 
                value={shippingInput.state || "Select"} 
                onChange={handleShippingStateChange}
                id={

                    ((!loggedIn() && /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== "")
                    || (!loggedIn() && /^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined)
                    || (loggedIn() && !shipping.firstName && /^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) 
                    || (loggedIn() && !shipping.firstName && /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== ""))
                    ? 'guest-shipping-input-state-city-postalCode-error'
                    : ((/^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) 
                    || (/^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== ""))
                    ? 'shipping-input-state-city-postalCode-error'
                    : 'shipping-input-state'
                }
                >
                    <option value="Select">Select</option>
                    {usStates.map((state, index) => { return (
                        <option key={state.abbreviation} value={state.name}>{state.name}</option>
                    )})}

                </select> */}
                <div id="checkout-shipping-state-container">
                    <FormControl variant="filled" className={classes.formControl}>
                        <InputLabel id="demo-simple-select-filled-label">State
                        </InputLabel>

                        <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        defaultValue={shippingInput.state || "Select"} 
                        onFocus={() => setOnStateBlurEvent(false)}
                        onBlur={() => {
                            if(stateInputError(shippingInput)) setOnStateBlurEvent(true)
                        }}
                        onChange={handleShippingStateChange}
                        >
                        <MenuItem value="select">Select</MenuItem>
                        {usStates.map((state, index) => { return (
                                <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
                        )})}
                        </Select>

                        {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
                    </FormControl>
                </div>
                <div id="postalcode-container">
                    {/* <input value={shippingInput.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleShippingChange} maxLength="5" readOnly={readOnly} required />
                    {(/^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) && <div className="warning">You must enter only numbers for your zip code</div>} 
                    */}
                    <TextField
                    label="Zipcode"
                    className="filled-margin-none"
                    placeholder="Enter zipcode"
                    variant="filled"
                    className={classes.textField}
                    readOnly={readOnly} 
                    required
                    onFocus={() => setOnPostalCodeBlurEvent(false)}
                    onBlur={() => {
                        if(postalCodeInputError3(shippingInput) || postalCodeInputError2(shippingInput)) setOnPostalCodeBlurEvent(true)
                    }}
                    error={postalCodeInputError(shippingInput) || onPostalCodeBlurEvent}
                    helperText={(onPostalCodeBlurEvent && "Required field") || (postalCodeInputError(shippingInput) && "You must enter only numbers for your zip code") || ""}
                    value={shippingInput.postalCode || ""} 
                    name="postalCode"
                    onChange={handleShippingChange}
                    />
                </div>
            </div>

            {/* <input value={shippingInput.phone || ""} name="phone" placeholder="Phone Number" onChange={handleShippingChange} maxLength="10" readOnly={readOnly} required />
            {(/^[0-9]+$/.test(shippingInput.phone) !== true && shippingInput.phone !== "" && shippingInput.phone !== undefined) && <div className="warning">You must enter only numbers for your phone number</div>} */}
            <FormControl>
            <Input
            fullWidth
            value={shippingInput.phone}
            onChange={handleShippingChange}
            onFocus={() => setOnPhoneBlurEvent(false)}
            onBlur={() => {
                if(phoneInputError3(shippingInput) || phoneInputError2(shippingInput)) setOnPhoneBlurEvent(true)
            }}
            error ={onPhoneBlurEvent}
            name="phone"
            id="formatted-text-mask-input"
            inputComponent={TextMaskCustom}
            />
            {onPhoneBlurEvent && <FormHelperText>Required field</FormHelperText>}
            </FormControl>

            {(loggedIn() && !shipping.firstName) && (
                <div id="save-default-container">
                    <label id="address-default-label" htmlFor="addressDefault">Save as default</label>
                    <input name="saveAddress" type="checkbox" disabled={readOnly} />
                </div>
            )}

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
                {/* <Button variant="dark" type="submit" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</Button> */}
                {/* <button type="button" onClick={closeModal}>Cancel</button> */}
                
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
        {/* {shipping.firstName ? (
            <>
            <Button 
            form="form" 
            type="submit"
            variant="dark"
            disabled={disableButton() || disableButtonAfterMakingRequest }>
                Save
            </Button>  */}
            {/* <Button variant="dark" type="submit" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</Button> */}
            {/* <button type="button" onClick={closeModal}>Cancel</button> */}
            {/* <Button variant="dark" type="button" onClick={closeModal}>Cancel</Button>
            </>
        ) : <Button 
            // form="form" 
            type="submit"
            variant="dark"
            disabled={readOnly || disableButton() || disableButtonAfterMakingRequest }>
                Next
            </Button>   
        } */}
        </>      
    )
}


