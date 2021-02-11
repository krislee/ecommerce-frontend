import React from 'react'
import Button from './Button'

export default function ShippingForm( { backend, loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, cartID, updateShippingState, updateShippingInputState, editShipping, handleEditShipping, closeModal, collapse, back, addNewShipping, grabAddNewShipping, }) {
    

    const handleShippingChange = (event) => {
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    // Depending on if we are adding a shipping (indicated by addShipping state), editing a shipping (indicated by editShipping state), or saving our first address/guest user, different onSubmit form functions will run.
    const handleNext = async (event) => {
        event.preventDefault() // prevent the page from refreshing after form submission
        console.log("shipping input: ", shippingInput)
        if(addShipping) {
            console.log("adding")
            addAdditionalSaveShipping()
        } if(editShipping) {
            console.log("editing")
            handleEditShipping()
        } else if(!loggedIn() || !shipping.firstName) {
            console.log("guest/first time saving next")
            addNewShipping()
            collapse()
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
                address: `${shippingInput.line1}, ${shippingInput.line2}, ${shippingInput.city}, ${shippingInput.state}, ${shippingInput.postalCode}`
            })
        })
        const saveNewShippingData = await saveNewShippingResponse.json()
        console.log(saveNewShippingData)
        updateShippingState(saveNewShippingData.address)
        updateShippingInputState(saveNewShippingData.address)
        grabAddNewShipping(false)
    }

    return (
        <>
        <form id="form" name="form" onSubmit={handleNext}>
            <h2>Shipping Address</h2>
            <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.line1 || ""} name="line1" placeholder="Address Line One" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.line2 || ""} name="line2" placeholder="Address Line Two" onChange={handleShippingChange} readOnly={readOnly} />

            <input value={shippingInput.city || ""} name="city" placeholder="City" onChange={handleShippingChange} readOnly={readOnly} required/>
            
            <input value={shippingInput.state || ""} name="state" placeholder="State" onChange={handleShippingChange} readOnly={readOnly} required />
            
            <input value={shippingInput.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleShippingChange} readOnly={readOnly} required />

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
            </>
        ) : <button form="form" disabled={readOnly}>Next</button>   
        }
        </>      
    )
}

// ShippingForm.defaultProps = {opacity: 1}