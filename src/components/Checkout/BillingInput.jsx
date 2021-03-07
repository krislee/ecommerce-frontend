import React, { useState } from 'react';
import usStates from '../../components/states'
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

import {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, line1InputError, cityInputError, cityInputError2, stateInputError, postalCodeInputError, postalCodeInputError2, postalCodeInputError3} from './inputsErrors'

import '../../styles/Checkout/BillingInput.css'

function BillingInput({ loggedIn, billing, handleBillingChange, handleBillingStateChange, paymentMethod, classes, handleMaxExpOrZipcodeLength, handleNonNumericExpirationOrZipcode }) {

    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)

    return (
        <div id="billing-form">
            <div id="billing-input-names-container">
                <div id={
                    ((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn())
                    ? "guest-billing-input-firstName-error-container"
                    : "billing-input-firstName-error-container" 
                }>
                    <TextField
                    label="First Name"
                    className="filled-margin-none"
                    placeholder="Enter First Name"
                    className={classes.textField}
                    variant="filled"
                    required
                    fullWidth
                    error={firstNameInputError(billing) || onFirstNameBlurEvent}
                    onFocus={() => setOnFirstNameBlurEvent(false)}
                    onBlur={() => {
                        if(firstNameInputError2(billing)) setOnFirstNameBlurEvent(true)
                    }}
                    helperText={(onFirstNameBlurEvent &&  "Required field") ||(firstNameInputError(billing) && "Only letters and ', . ' -' are allowed") || ""}
                    value={billing.firstName || ""} 
                    name="firstName" 
                    onChange={handleBillingChange}
                    />
                </div>

                <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-lastName-error-container" : "billing-input-lastName-error-container" } >
                    <TextField
                    label="Last Name"
                    className="filled-margin-none"
                    placeholder="Enter Last Name"
                    variant="filled"
                    className={classes.textField}
                    required
                    fullWidth
                    onFocus={() => setOnLastNameBlurEvent(false)}
                    onBlur={() => {
                        if(lastNameInputError2(billing)) setOnLastNameBlurEvent(true)
                    }}
                    error={lastNameInputError(billing) || onLastNameBlurEvent} 
                    helperText={(onLastNameBlurEvent &&  "Required field")  ||(lastNameInputError(billing) && "Only letters and ', . ' -' are allowed") || ""}
                    value={billing.lastName || ""} 
                    name="lastName"
                    onChange={handleBillingChange}
                    />
                </div>
            </div>

            <TextField
            label="Address Line One"
            className="filled-margin-none"
            placeholder="Enter Address"
            variant="filled"
            fullWidth
            className={classes.textField}
            required
            onFocus={() => setOnLine1BlurEvent(false)}
            onBlur={() => {
                if(line1InputError(billing)) setOnLine1BlurEvent(true)
            }}
            error={onLine1BlurEvent}
            helperText={onLine1BlurEvent && "Required field"}
            value={billing.line1 || ""} 
            name="line1"
            onChange={handleBillingChange}
            />
             <TextField
            label="Address Line Two"
            className="filled-margin-none"
            placeholder="Apartment, Floor, Suite"
            variant="filled"
            fullWidth
            className={classes.textField}
            value={billing.line2 || ""}
            name="line2"
            onChange={handleBillingChange}
            />
            
            <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-city-error-container" : "billing-input-city-error-container" }>
                <TextField
                label="City"
                fullWidth
                className="filled-margin-none"
                placeholder="Enter City"
                variant="filled"
                className={classes.textField}
                required
                onFocus={() => setOnCityBlurEvent(false)}
                onBlur={() => {
                    if(cityInputError2(billing)) setOnCityBlurEvent(true)
                }}
                error={cityInputError(billing) || onCityBlurEvent}
                helperText={(onCityBlurEvent && "Required field") ||  (cityInputError(billing) && "Only letters and ', . ' -' are allowed") || ""}
                value={billing.city || ""} 
                name="city"
                onChange={handleBillingChange}
                />
            </div>

            <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-stateZipcode-container" : "billing-input-stateZipcode-container"} >
                <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-state-error-container" : "billing-input-state-error-container"} >
                    <FormControl variant="filled" className={classes.formControl}>
                        <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
                        <Select
                        label="State"
                        labelId="demo-simple-select-filled-label"
                        fullWidth
                        id="demo-simple-select-filled"
                        value={billing.state || "Select"} 
                        onFocus={() => setOnStateBlurEvent(false)}
                        onBlur={() => {
                            if(stateInputError(billing)) setOnStateBlurEvent(true)
                        }}
                        onChange={handleBillingStateChange}
                        >
                        <MenuItem disabled value="Select">Select</MenuItem>
                        {usStates.map((state) => { return (
                                <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
                        )})}
                        </Select>

                        {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
                    </FormControl>
                </div>

                <div id="billing-input-postalCode-error-container">
                    <TextField
                    id="billing-postalCode-input"
                    label="Zipcode"
                    className="filled-margin-none"
                    placeholder="Enter zipcode"
                    variant="filled"
                    fullWidth
                    className={classes.textField}
                    inputProps={{
                        type: "number",
                        maxLength: 5
                    }}
                    required
                    onInput={handleMaxExpOrZipcodeLength}
                    onKeyDown={handleNonNumericExpirationOrZipcode}
                    onFocus={() => setOnPostalCodeBlurEvent(false)}
                    onBlur={() => {
                        if(postalCodeInputError3(billing) || postalCodeInputError2(billing)) setOnPostalCodeBlurEvent(true)
                    }}
                    error={postalCodeInputError(billing) || onPostalCodeBlurEvent}
                    helperText={(onPostalCodeBlurEvent && "Required field") || (postalCodeInputError(billing) && "You must enter only numbers for your zip code") || ""}
                    value={billing.postalCode || ""} 
                    name="postalCode"
                    onChange={handleBillingChange}
                    />
                    {/* )} */}
                </div>
            </div>
        </div>
    )
}

export default BillingInput