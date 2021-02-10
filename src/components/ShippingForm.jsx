import React, { useEffect, useState } from 'react'
import Button from './Button'

export default function ShippingForm( { backend, loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, grabPaymentLoading, RGBA, grabRGBA, cartID, updateShippingState, updateShippingInputState, grabAddNewShipping, editShipping, handleEditShipping, closeModal, collapse, back }) {
    

    const handleShippingChange = (event) => {
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    // Depending on if we are adding a shipping (indicated by addShipping state), editing a shipping (indicated by editShipping state), or saving our first address/guest user, different onSubmit form functions will run.
    const handleNext = async (event) => {
        console.log("submitting form")
        event.preventDefault()
        console.log("shipping input: ", shippingInput)
        if(addShipping) {
            addAdditionalSaveShipping()
        } if(editShipping) {
            handleEditShipping()
        } else if(!loggedIn() || !shipping.firstName){
            addNewShipping()
            collapse()
        }
    }

    const addNewShipping = async() => {
        const checkbox = document.querySelector('input[name=saveAddress]')
        console.log("adding new address as guest or first saved address")
        console.log("adding new address input: ", shippingInput)
        // If logged in user is saving his/her first shipping address, fetch to this route:
        if(loggedIn()) {
            console.log(49, cartID)
            const updatePaymentIntentWithShippingResponse = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': cartID,
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    address: {
                        name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                        line1: shippingInput.addressLineOne,
                        line2: shippingInput.addressLineTwo,
                        city: shippingInput.city,
                        state: shippingInput.state,
                        postalCode: shippingInput.zipcode
                    },
                    saveShipping: (checkbox && checkbox.checked) ? true : false,
                    lastUsedShipping: shipping.address ? shipping._id : undefined
                })
            })
            const updatePaymentIntentWithShippingData = await updatePaymentIntentWithShippingResponse.json()
            console.log(updatePaymentIntentWithShippingData)
        } else {
            console.log(73, cartID)
            // Guest user fetches to this route:
            const updatePaymentIntentWithShippingResponse = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': cartID
                },
                credentials: 'include',
                body: JSON.stringify({
                    address: {
                        name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                        line1: shippingInput.addressLineOne,
                        line2: shippingInput.addressLineTwo,
                        city: shippingInput.city,
                        state: shippingInput.state,
                        postalCode: shippingInput.zipcode
                    },
                    saveShipping: false
                })
            })
            const updatePaymentIntentWithShippingData = await updatePaymentIntentWithShippingResponse.json()
            console.log("guest updated payment intent", updatePaymentIntentWithShippingData)
        }
    }

    const addAdditionalSaveShipping = async() => {
        console.log("adding additional address")
        const saveNewShippingResponse = await fetch(`${backend}/shipping/address?lastUsed=false&default=false&checkout=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }, 
            body: JSON.stringify({
                name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                address: `${shippingInput.addressLineOne}, ${shippingInput.addressLineTwo}, ${shippingInput.city}, ${shippingInput.state}, ${shippingInput.zipcode}`
            })
        })
        const saveNewShippingData = await saveNewShippingResponse.json()
        console.log(saveNewShippingData)
        updateShippingState(saveNewShippingData.address)
        updateShippingInputState(saveNewShippingData.address)
        closeModal()
    }



    return (
        <>
        <form id="form" name="form" style={RGBA} onSubmit={handleNext}>
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
            <button form="form" style={RGBA} disabled={readOnly}>Next</button> 
            {readOnly && <button style={{backgroundColor: "rgba(192,192,192,1.0)"}} onClick={back}>Edit</button> }
            </>
        )}
        </>      
    )
}

// ShippingForm.defaultProps = {opacity: 1}