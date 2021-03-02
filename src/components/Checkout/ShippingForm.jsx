import React from 'react'
import Button from 'react-bootstrap/Button';
import '../../styles/Checkout/ShippingForm.css'
import '../../styles/Checkout/Shipping.css'
export default function ShippingForm({ loggedIn, readOnly, shipping, addShipping, shippingInput, grabShippingInput, editShipping, handleEditShipping, closeModal, collapse, disableButtonAfterMakingRequest, grabDisableButtonAfterMakingRequest, addAdditionalSaveShipping}) {
  
    const handleShippingChange = (event) => {
        console.log(shippingInput)
        const { name, value} = event.target
        grabShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    const handleShippingStateChange = (event) => {
        console.log(event.target.value)
        grabShippingInput((prevShipping) => ({
            ...prevShipping, "state": event.target.value
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
        console.log(shippingInput)
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
            // || shippingInput.state.length !== 2
            || /^[0-9]+$/.test(shippingInput.postalCode) !== true 
            || shippingInput.postalCode === ""
            || shippingInput.postalCode === undefined
            || shippingInput.postalCode.length !== 5
            || /^[0-9]+$/.test(shippingInput.phone) !== true 
            || shippingInput.phone === ""
            || shippingInput.phone === undefined
            // || shippingInput.phone.length !== 10
            || shippingInput.phone.toString().length !==10
        )
    }
    return (
        <>
        <form id="form" name="form" onSubmit={handleSubmit}>
            <div id="names-container">
                <div id="first-name-container">
                    <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.firstName) !== true && shippingInput.firstName !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>}
                </div>
                <div id="last-name-container">
                    <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.lastName) !== true && shippingInput.lastName !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>}
                </div>
            </div>
            <input value={shippingInput.line1 || ""} name="line1" placeholder="Address Line One" onChange={handleShippingChange} readOnly={readOnly} required/>

            <input value={shippingInput.line2 || ""} name="line2" placeholder="Address Line Two" onChange={handleShippingChange} readOnly={readOnly} />

            <div className="city-state-zipcode">
                <div id="city-container">
                    <input value={shippingInput.city || ""} name="city" placeholder="City" onChange={handleShippingChange} readOnly={readOnly} required/>
                    {(/^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== "") && <div className="warning"><i>Only letters and ", . ' -" are accepted</i></div>}
                </div>
                
                <select 
                className="state" 
                value={shippingInput.state || "Select"} 
                onChange={handleShippingStateChange}
                id={

                    ((!loggedIn() && /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== "")
                    || (!loggedIn() && /^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined)
                    || (loggedIn() && !shipping.firstName && /^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) 
                    || (loggedIn() && !shipping.firstName && /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== ""))
                    ? 'guest-shipping-input-state-city-postalCode-error'
                    : ((/^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) 
                    || (/^[a-z ,.'-]+$/i.test(shippingInput.city) !== true && shippingInput.city !== ""))
                    ? 'shipping-input-state-city-postalCode-error'
                    : 'shipping-input-state'
                }
                >
                    <option value="">Select</option>
                    <option value="Alabama">Alabama</option>
                    <option value="New York">New York</option>
                    <option value="California">California</option>
                </select>
               
                <div id="postalcode-container">
                    <input value={shippingInput.postalCode || ""} name="postalCode" placeholder="Zipcode" onChange={handleShippingChange} maxLength="5" readOnly={readOnly} required />
                    {(/^[0-9]+$/.test(shippingInput.postalCode) !== true && shippingInput.postalCode !== "" && shippingInput.postalCode !== undefined) && <div className="warning">You must enter only numbers for your zip code</div>}
                </div>
            </div>

            <input value={shippingInput.phone || ""} name="phone" placeholder="Phone Number" onChange={handleShippingChange} maxLength="10" readOnly={readOnly} required />
            {(/^[0-9]+$/.test(shippingInput.phone) !== true && shippingInput.phone !== "" && shippingInput.phone !== undefined) && <div className="warning">You must enter only numbers for your phone number</div>}

            {(loggedIn() && !shipping.firstName) && (
                <div id="save-default-container">
                    <label id="address-default-label" htmlFor="addressDefault">Save as default</label>
                    <input name="saveAddress" type="checkbox" disabled={readOnly} />
                </div>
            )}

        {shipping.firstName ? (
            <div id="save-cancel-shipping-buttons">
                <Button id="cancel-shipping-button" size='lg' variant="dark" type="button" onClick={closeModal}>Cancel</Button>
                <Button 
                id="save-shipping-button"
                // form="form" 
                type="submit"
                variant="dark"
                size='lg'
                disabled={disableButton() || disableButtonAfterMakingRequest || shippingInput.state === 'select' }>
                    Save
                </Button> 
                {/* <Button variant="dark" type="submit" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</Button> */}
                {/* <button type="button" onClick={closeModal}>Cancel</button> */}
                
            </div>
        ) : <Button 
            id="next-shipping-button"
            // form="form" 
            type="submit"
            variant="dark"
            size='lg'
            disabled={readOnly || disableButton() || disableButtonAfterMakingRequest }>
                Next
            </Button>   
        }

        </form>
        {/* {shipping.firstName ? (
            <>
            <Button 
            form="form" 
            type="submit"
            variant="dark"
            disabled={disableButton() || disableButtonAfterMakingRequest }>
                Save
            </Button>  */}
            {/* <Button variant="dark" type="submit" disabled={disableButton() || disableButtonAfterMakingRequest }>Save</Button> */}
            {/* <button type="button" onClick={closeModal}>Cancel</button> */}
            {/* <Button variant="dark" type="button" onClick={closeModal}>Cancel</Button>
            </>
        ) : <Button 
            // form="form" 
            type="submit"
            variant="dark"
            disabled={readOnly || disableButton() || disableButtonAfterMakingRequest }>
                Next
            </Button>   
        } */}
        </>      
    )
}


