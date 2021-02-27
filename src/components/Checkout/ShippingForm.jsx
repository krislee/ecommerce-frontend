import React from 'react'
import Button from 'react-bootstrap/Button';

export default function ShippingForm({ loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, editShipping, handleEditShipping, closeModal, collapse, disableButtonAfterMakingRequest, grabDisableButtonAfterMakingRequest, addAdditionalSaveShipping}) {
    
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
            grabDisableButtonAfterMakingRequest(true)
            addAdditionalSaveShipping()
        } if(editShipping) {
            console.log("editing")
            grabDisableButtonAfterMakingRequest(true)
            handleEditShipping()
        } else if(!loggedIn() || !shipping.firstName) {
            console.log("guest/first time saving next")
            // addNewShipping()
            collapse()
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
            <button form="form" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</button> 
            {/* <Button variant="dark" type="submit" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</Button> */}
            {/* <button type="button" onClick={closeModal}>Cancel</button> */}
            <Button variant="dark" type="button" onClick={closeModal}>Cancel</Button>
            </>
        ) : <button form="form" disabled={readOnly || disableButton() || disableButtonAfterMakingRequest }>Next</button>   
        }
        </>      
    )
}


