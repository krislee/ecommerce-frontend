import React from 'react';
import usStates from '../../components/states'

import '../../styles/Checkout/BillingInput.css'

function BillingInput({ loggedIn, billing, handleBillingChange, handleBillingStateChange, editPayment, paymentMethod }) {

    return (
        <>
            <div id="billing-input-names-container">
                <div id={
                    ((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn())
                    ? "guest-billing-input-firstName-error-container"
                    : "billing-input-firstName-error-container" 
                }>
                    <input id="billing-input-firstName" className="billing-input" value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange} required/>

                    {(/^[a-z ,.'-]+$/i.test(billing.firstName) !== true &&  billing.firstName !== "") && <div className="warning" id="billing-input-firstName-error">You must enter only letters as your first name</div>}
                </div>

                <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-lastName-error-container" : "billing-input-lastName-error-container" } >
                    <input id="billing-input-lastName" className="billing-input" value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange} required/>
                    {(/^[a-z ,.'-]+$/i.test(billing.lastName) !== true && billing.lastName !== "") && <div className="warning" id="billing-input-lastName-error">You must enter only letters as your last name</div>}
                </div>
            </div>

            <input id="billing-input-line1" className="billing-input" value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange} required/>
            <input id="billing-input-line2" className="billing-input" value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />

            <div id="billing-input-cityStateZipcode-container">
                <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-city-error-container" : "billing-input-city-error-container" }>
                    <input id="billing-input-city" className="billing-input" value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange} required/>
                    {(/^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "") && <div className="warning">You must enter only letters as your city</div>}
                </div>

                <div id={((loggedIn() && !paymentMethod.paymentMethodID) || !loggedIn()) ? "guest-billing-input-state-error-container" : "billing-input-state-error-container"} >
                    {/* <input id="billing-input-state" className="billing-input" value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange} maxLength="2" required/> */}
                    
                    <select 
                        // id={
                        //     (loggedIn() && /^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "") 
                        //     ? "billing-input-state-city-error" : loggedIn() 
                        //     ? "billing-input-state" : (!loggedIn() && (/^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "")) 
                        //     ? "guest-billing-input-state-city-error" 
                        //     : "guest-billing-input-state"
                        // } 

                        id={
                            (!loggedIn() && /^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "")
                            || (loggedIn() && !paymentMethod.paymentMethodID && /^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "")
                            ? "guest-billing-input-state-city-error" 
                            : (editPayment && loggedIn() && /^[0-9]+$/.test(billing.postalCode) !== true  && billing.postalCode !== "" && billing.postalCode !== undefined ) 
                            || (editPayment && loggedIn() && /^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "")
                            ? "billing-input-state-city-or-zipcode-error"
                            : (loggedIn() && /^[a-z ,.'-]+$/i.test(billing.city) !== true && billing.city !== "") 
                            ? "billing-input-state-city-error" 
                            : (!loggedIn() || (loggedIn() && !paymentMethod.paymentMethodID))
                            ? "guest-billing-input-state" 
                            : "billing-input-state"
                        }
                        className="billing-input" value={billing.state || "Select"} 
                        onChange={handleBillingStateChange}
                    >
                        <option value="Select">Select</option>
                        {usStates.map((state, index) => { return (
                            <option key={state.abbreviation} value={state.name}>{state.name}</option>
                        )})}
                    </select>
                    {/* {((/^[a-z][a-z\s]*$/i.test(billing.state) !== true) && billing.state !== "") && <div className="warning">You must enter only letters as your state</div>} */}
                </div>

                <div id="billing-input-postalCode-error-container">
                    {editPayment ? <input value={billing.postalCode || ""} name="postalCode" id="billing-input-postalCode" className="billing-input" placeholder="Zipcode" maxLength="5" onChange={handleBillingChange} required/> : <></>}
                    {editPayment && (/^[0-9]+$/.test(billing.postalCode) !== true  && billing.postalCode !== "" && billing.postalCode !== undefined) && <div className="warning">You must enter only numbers as your zip code</div>}
                </div>
            </div>
        </>
    )
}

export default BillingInput