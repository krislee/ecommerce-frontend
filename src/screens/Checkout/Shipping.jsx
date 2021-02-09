import React, { useEffect, useState } from 'react';
import ShippingForm from '../../components/ShippingForm'
import Button from '../../components/Button'

function Shipping({ backend, loggedIn, grabPaymentLoading, cartID  }) {
    const [shippingLoading, setShippingLoading] = useState(true)
    const [RGBA, setRGBA] = useState({backgroundColor: "rgba(192,192,192,1.0)"})

    // shipping state is to store the saved shipping address (either default, last used, or last created) or no saved shipping address
    const [shipping, setShipping] = useState({})
    // addShipping state to represent if we are currently adding a new shipping address to addresses logged in user has already saved
    const [addShipping, setAddShipping] = useState(false)
    // shippingInput state that contains the address values for the input value
    const [shippingInput, setShippingInput] = useState({})

    useEffect(() => {
        const getSavedShippingAddress = async() => {
            const savedShippingAddressResponse = await fetch(`${backend}/shipping/checkout/address`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })

            const savedShippingAddressData = await savedShippingAddressResponse.json()
            console.log(savedShippingAddressData)

            // If there are no saved cards, then shipping state does not get updated and remains {}
            updateShippingStateAndInputState(savedShippingAddressData.address)
            
            setShippingLoading(false) // update shippingLoading state to false so we can render the shipping info and not <></>
        }

        getSavedShippingAddress()
    }, [])

    const grabRGBA = (rgba) => setRGBA(rgba)

    const grabShippingInput = (shippingInput) => setShippingInput(shippingInput)

    const handleAddNewShipping = () => {
        setAddShipping(true)
        console.log("clicked Add New")
    }

    const updateShippingStateAndInputState = (savedShippingAddressData) => {
        const shippingAddress = savedShippingAddressData.Address
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = savedShippingAddressData.Name.split(", ")

            setShippingInput({
                firstName: splitShippingName[0],
                lastName: splitShippingName[1],
                addressLineOne: splitShippingAddress[0],
                addressLineTwo: splitShippingAddress[1] === "null" ? "" : splitShippingAddress[1],
                city: splitShippingAddress[2],
                state: splitShippingAddress[3],
                zipcode: splitShippingAddress[4]
            })

            setShipping({
                address: {
                    firstName: splitShippingName[0],
                    lastName: splitShippingName[1],
                    addressLineOne: splitShippingAddress[0],
                    addressLineTwo: splitShippingAddress[1] === "null" ? "" : splitShippingAddress[1],
                    city: splitShippingAddress[2],
                    state: splitShippingAddress[3],
                    zipcode: splitShippingAddress[4]
                }
                
            })

            grabPaymentLoading(false)
        } 
    }

    if(shippingLoading) {
        return <></>
    } else if(!shipping.address || !loggedIn() || addShipping) {
        // If user is guest (as indicated by !loggedIn()), or logged in user does not have a shipping address (indicated by !shipping.address), or logged in user clicked Add New Shipping (as indicated by addShipping state), show Shipping Input form
        return (
            <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} grabRGBA={grabPaymentLoading} RGBA={RGBA} addShipping={addShipping} cartID={cartID} updateShippingStateAndInputState={updateShippingStateAndInputState}/>
        )
    } else if(shipping.address) {
        return (
            <>
            {/* If user has a saved address (indicated by shipping.address), display the address: */}
            <h2>Shipping Address</h2>
            <p id="name">{shipping.address.firstName} {shipping.address.lastName}</p>
            <p id="line1">{shipping.address.addressLineOne}</p>
            <p id="line2">{shipping.address.addressLineTwo}</p>
            <p id="cityStateZipcode">{shipping.address.city}, {shipping.address.state} {shipping.address.zipcode}</p>
            <Button name={'Add New Shipping Address'} onClick={handleAddNewShipping}/>
            <Button name={'Edit Shipping Address'} />
            <Button name={'Save Shipping Address'} />
            </>
        )
    }
}

export default Shipping