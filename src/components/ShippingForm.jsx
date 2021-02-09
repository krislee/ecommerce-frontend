import React, { useEffect, useState } from 'react'
import Button from './Button'

export default function ShippingForm( { backend, loggedIn, shipping, addShipping, shippingInput, grabShippingInput, grabPaymentLoading, RGBA, grabRGBA, cartID, updateShippingState, updateShippingInputState, grabAddNewShipping, showSavedShipping }) {
    
    const [readOnly, setReadOnly] = useState(false)
    // const [displayAddEditButton, setDisplayAddEditButton] = useState({display: 'none'})

    const handleShippingChange = (event) => {
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    // Fade out the Shipping component and show the Payment Method component when Next button is clicked
    const collapse = () => {
        console.log("collapse")
        grabRGBA({backgroundColor: "transparent"})
        grabPaymentLoading(false) // paymentLoading state is currently true UNTIL Next button in ShippingForm component is clicked. By clicking the button, paymentLoading state is updated to false so it can render stuff from the Checkout/PaymentMethod components rather than render <></>
        setReadOnly(true)
    }

    const handleNext = async (event) => {
        event.preventDefault()
        console.log(shippingInput)
        if(addShipping) {
            addAdditionalSaveShipping()
        } else {
            addNewShipping()
            collapse()
        }
    }

    const addNewShipping = async() => {
        const checkbox = document.querySelector('input[name=saveAddress]')
        // If logged in user does not have any saved shipping addresses, fetch to this route:
        if(loggedIn()) {
            console.log("cart ID: ", cartID)
            console.log(shipping)
            console.log(shipping.address)
            console.log(shippingInput)
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
            const updatePaymentIntentWithShippingResponse = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': cartID
                },
                body: JSON.stringify({
                    address: {
                        name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                        line1: shippingInput.addressLineOne,
                        line2: shippingInput.addressLineTwo,
                        city: shippingInput.city,
                        state: shippingInput.state,
                        postalCode: shippingInput.zipcode
                    }
                })
            })
            const updatePaymentIntentWithShippingData = await updatePaymentIntentWithShippingResponse.json()
            console.log(updatePaymentIntentWithShippingData)
        }
    }

    const addAdditionalSaveShipping = async() => {
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
        grabAddNewShipping(false)
    }

    const closeAddAdditionalSaveShipping = () => {
        grabAddNewShipping(false)
        grabShippingInput(shipping.address)
        grabPaymentLoading(false)
    }

    const reEnableEdit = () => {
        grabRGBA({backgroundColor: "rgba(192,192,192,1.0)"})
        setReadOnly(false)
    }


    return (
        <>
        <form className="form" style={RGBA} onSubmit={handleNext}>
            <h2>Shipping Address</h2>
            <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>
            <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>
            <input value={shippingInput.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One"
            onChange={handleShippingChange} readOnly={readOnly} required/>
            <input value={shippingInput.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two"
            onChange={handleShippingChange} readOnly={readOnly} />
            <input value={shippingInput.city || ""} name="city" placeholder="City"
            onChange={handleShippingChange} readOnly={readOnly} required/>
            <input value={shippingInput.state|| ""} name="state" placeholder="State"
            onChange={handleShippingChange} readOnly={readOnly} required />
            <input value={shippingInput.zipcode || ""} name="zipcode" placeholder="Zipcode"
            onChange={handleShippingChange} readOnly={readOnly} required />

            {(loggedIn() && !shipping.address) && (
                <>
                <label htmlFor="addressDefault">Save as default</label>
                <input name="saveAddress" type="checkbox" disabled={readOnly} />
                </>
            )}
            {shipping.address ? (
            <>
            <Button name={"Save"} type={"button"} /> 
            <Button type={"button"} name={"Close"} onClick={closeAddAdditionalSaveShipping}/>
            </>) : (
            <>
            <button style={RGBA} disabled={readOnly}>Next</button> 
            {readOnly && <button style={{backgroundColor: "rgba(192,192,192,1.0)"}} onClick={reEnableEdit}>Edit</button> }
            </>
            )}
        </form>
        </>      
    )
}

// ShippingForm.defaultProps = {opacity: 1}