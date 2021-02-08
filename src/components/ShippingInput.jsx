import React, { useState } from 'react'
import { Collapse, CardBody, Card } from 'reactstrap';
import Button from '../components/Button'

export default function ShippingForm( { loggedIn, shipping, grabIsCollapseOpen }) {

    const [shippingInput, setShippingInput] = useState(shipping)
    const [isOpen, setIsOpen] = useState(false);

    // const toggle = () => setIsOpen(!isOpen);

    const handleShippingChange = (event) => {
        const { name, value} = event.target
        setShippingInput((prevShipping) => ({
            ...prevShipping, [name]: value
        }))
    }

    return (

        <form className="form">
            <input value={shippingInput.firstName || ""} name="firstName" placeholder="First Name" onChange={handleShippingChange} required />
            <input value={shippingInput.lastName || ""} name="lastName" placeholder="Last Name" onChange={handleShippingChange} required />
            <input value={shippingInput.addressLineOne || ""} name="addressLineOne" placeholder="Address Line One"
            onChange={handleShippingChange} required />
            <input value={shippingInput.addressLineTwo || ""} name="addressLineTwo" placeholder="Address Line Two"
            onChange={handleShippingChange} />
            <input value={shippingInput.city || ""} name="city" placeholder="City"
            onChange={handleShippingChange} required />
            <input value={shippingInput.state|| ""} name="state" placeholder="State"
            onChange={handleShippingChange} required />
            <input value={shippingInput.zipcode || ""} name="zipcode" placeholder="Zipcode"
            onChange={handleShippingChange} required />

            {(loggedIn() && !shipping.address) && (
                <>
                <label htmlFor="addressDefault">Save as default</label>
                <input name="addressDefault" type="checkbox" id="address-default"/>
                </>
            )}
            {shipping.address ? <Button name={"Submit"} /> : <Button type="button" onClick={grabIsCollapseOpen(true)} name={"Next"} />}
        </form>
              
    )
}
