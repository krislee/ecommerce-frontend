import React from 'react';
import '../../styles/Input.css'


function BillingInput({ billing, handleBillingChange, editPayment }) {

    return (
        <>
            <input value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange} required/>
            {((/^[a-z][a-z\s]*$/i.test(billing.firstName) !== true)  &&  billing.firstName !== "") && <div className="warning">You must enter only letters as your first name</div>}

            <input value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange} required/>
            {((/^[a-z][a-z\s]*$/i.test(billing.lastName) !== true)  && billing.firstName !== "") && <div className="warning">You must enter only letters as your last name</div>}

            <input value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange} required/>
            <input value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />

            <input value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange} required/>
            {((/^[a-z][a-z\s]*$/i.test(billing.city) !== true) && billing.city !== "") && <div className="warning">You must enter only letters as your city</div>}

            <input value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange} maxLength="2" required/>
            {((/^[a-z][a-z\s]*$/i.test(billing.state) !== true) && billing.state !== "") && <div className="warning">You must enter only letters as your state</div>}

            {editPayment ? <input value={billing.postalCode || ""} name="postalCode" placeholder="Zipcode" maxLength="5" onChange={handleBillingChange} required/> : <></>}
            {((/[a-zA-Z]/g.test(billing.postalCode) === true) && billing.postalCode !== undefined) && <div className="warning">You must enter only numbers as your zip code</div>}
        </>
    )
}

export default BillingInput