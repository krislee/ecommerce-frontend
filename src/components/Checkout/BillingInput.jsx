import React from 'react';
import '../../styles/Input.css'

function BillingInput({ billing, handleBillingChange, editPayment }) {
    return (
        <>
            <input value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange} required/>
            <input value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange} required/>
            <input value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange} required/>
            <input value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />
            <input value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange} required/>
            <input value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange} required/>
            {editPayment ? <input value={billing.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleBillingChange} required/> : <></>}
        </>
    )
}

export default BillingInput