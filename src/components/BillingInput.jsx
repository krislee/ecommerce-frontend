import React from 'react';
import '../styles/Input.css'

function BillingInput({ billing, handleBillingChange }) {
    return (
        <>
            <input value={billing.firstName || ""} name="firstName" placeholder="First Name" onChange={handleBillingChange}/>
            <input value={billing.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleBillingChange}/>
            <input value={billing.line1 || ""} name="line1" placeholder="Address 1" onChange={handleBillingChange}/>
            <input value={billing.line2 || ""} name="line2" placeholder="Address 2" onChange={handleBillingChange} />
            <input value={billing.city || ""} name="city" placeholder="City" onChange={handleBillingChange}/>
            <input value={billing.state || ""} name="state" placeholder="State" onChange={handleBillingChange}/>
            <input value={billing.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleBillingChange}/>
        </>
    )
}

export default BillingInput