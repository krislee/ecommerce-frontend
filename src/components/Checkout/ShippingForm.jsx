import React from 'react'

export default function ShippingForm({ backend, loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, updateShippingState, updateShippingInputState, editShipping, handleEditShipping, closeModal, collapse, addNewShipping, grabAddNewShipping, grabMultipleShipping, grabTotalCartQuantity }) {
    
    const handleShippingChange = (event) => {
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    // Depending on if we are adding a shipping (indicated by addShipping state), editing a shipping (indicated by editShipping state), or saving our first address/guest user, different onSubmit form functions will run.
    const handleSubmit = async (event) => {
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
            // addNewShipping()
            collapse()
        }
    }

    const addAdditionalSaveShipping = async() => {
        console.log("adding additional address")
        if(loggedIn()) {
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
            grabAddNewShipping(false) // updates the addShipping state to represent we are no longer adding a new shipping; if false, modal won't be returned; if true, modal would be shown
            grabMultipleShipping(true) // We can only add a new shipping if Add New button is shown. Add New button is shown if we have at least one saved address. If we only have one saved address, then Saved Shipping button would not be shown. But since we are adding a new shipping, then Saved Shipping button would definitely be shown. Saved Shipping button is shown dependent on the truthy value of MultipleShipping state
        } else {
            grabTotalCartQuantity(0)
        }
    }

    const disableButton = () => {
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
            || shippingInput.state.length !== 2
            || /^[0-9]+$/.test(shippingInput.postalCode) !== true 
            || shippingInput.postalCode === ""
            || shippingInput.postalCode === undefined
            || shippingInput.postalCode.length !== 5
        )
    }

    return (
        <>
        <form id="form" name="form" onSubmit={handleSubmit}>
            <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>
            {(/^[a-z ,.'-]+$/i.test(shippingInput.firstName) !== true && shippingInput.firstName !== "") && <div className="warning">You must enter only letters as your first name</div>}

            <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>
            {(/^[a-z ,.'-]+$/i.test(shippingInput.lastName) !== true && shippingInput.lastName !== "") && <div className="warning">You must enter only letters as your last name</div>}

            <input value={shippingInput.line1 || ""} name="line1" placeholder="Address Line One" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.line2 || ""} name="line2" placeholder="Address Line Two" onChange={handleShippingChange} readOnly={readOnly} />

            <input value={shippingInput.city || ""} name="city" placeholder="City" onChange={handleShippingChange} readOnly={readOnly} required/>
            {(/^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== "") && <div className="warning">You must enter only letters as your city</div>}

            <input value={shippingInput.state || ""} name="state" placeholder="State" onChange={handleShippingChange} maxLength="2" readOnly={readOnly} required />
            {((/^[a-z][a-z\s]*$/i.test(shippingInput.state) !== true) && shippingInput.state !== "") && <div className="warning">You must enter only letters as your state</div>}

            <input value={shippingInput.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleShippingChange} maxLength="5" readOnly={readOnly} required />
            {(/^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) && <div className="warning">You must enter only numbers as your zip code</div>}

            {(loggedIn() && !shipping.firstName) && (
                <>
                <label htmlFor="addressDefault">Save as default</label>
                <input name="saveAddress" type="checkbox" disabled={readOnly} />
                </>
            )}
        </form>
        {shipping.firstName ? (
            <>
            <button form="form" disabled={disableButton()}>Save</button> 
            <button type="button" onClick={closeModal}>Cancel</button>
            </>
        ) : <button form="form" disabled={readOnly || disableButton()}>Next</button>   
        }
        </>      
    )
}


