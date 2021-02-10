import React from 'react'
import Button from './Button'

export default function ShippingForm( { backend, loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, grabPaymentLoading, cartID, updateShippingState, updateShippingInputState, editShipping, handleEditShipping, closeModal, collapse, back, handleNext }) {
    

    const handleShippingChange = (event) => {
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }




    return (
        <>
        <form id="form" name="form" onSubmit={handleNext}>
            <h2>Shipping Address</h2>
            <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two" onChange={handleShippingChange} readOnly={readOnly} />

            <input value={shippingInput.city || ""} name="city" placeholder="City" onChange={handleShippingChange} readOnly={readOnly} required/>
            
            <input value={shippingInput.state || ""} name="state" placeholder="State" onChange={handleShippingChange} readOnly={readOnly} required />
            
            <input value={shippingInput.zipcode || ""} name="zipcode" placeholder="Zipcode" onChange={handleShippingChange} readOnly={readOnly} required />

            {(loggedIn() && !shipping.firstName) && (
                <>
                <label htmlFor="addressDefault">Save as default</label>
                <input name="saveAddress" type="checkbox" disabled={readOnly} />
                </>
            )}
        </form>
        {shipping.firstName ? (
            <>
            <button form="form">Save</button> 
            <Button type={"button"} name={"Cancel"} onClick={closeModal}/>
            </>) : (
            <>
            <button form="form" disabled={readOnly}>Next</button> 
            {/* {readOnly && <button onClick={back}>Edit</button> } */}
            </>
        )}
        </>      
    )
}

// ShippingForm.defaultProps = {opacity: 1}