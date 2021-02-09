import React, { useEffect, useState } from 'react';
import ShippingForm from '../../components/ShippingForm'
import Button from '../../components/Button'
import Modal from 'react-modal';

function Shipping({ backend, loggedIn, grabPaymentLoading, cartID  }) {
    const [shippingLoading, setShippingLoading] = useState(true)
    const [RGBA, setRGBA] = useState({backgroundColor: "rgba(192,192,192,1.0)"})
    const [showModal, setShowModal] = useState(false)

    // shipping state is to store the saved shipping address (either default, last used, or last created) or no saved shipping address
    const [shipping, setShipping] = useState({})
    // addShipping state to represent if we are currently adding a new shipping address to addresses logged in user has already saved
    const [addShipping, setAddShipping] = useState(false)
    // shippingInput state that contains the address values for the input value
    const [shippingInput, setShippingInput] = useState({})
    // allSavedShipping state contains the array of all the shipping addresses
    const [allSavedShipping, setAllSavedShipping] = useState([])
    // showingAllSavedShipping state represents if we are currently showing saved cards
    const [showingSavedShipping, setShowingSavedShipping] = useState(false)

    /* ------- MISCELLANEOUS FUNCTIONS ------ */

    const grabRGBA = (rgba) => setRGBA(rgba)

    const grabShippingInput = (shippingInput) => setShippingInput(shippingInput)

    const grabAddNewShipping = (addShipping) => setAddShipping(addShipping)

    /* ------- SAVED SHIPPING FUNCTIONS ------ */

    const showSavedShipping = async() => {
        const allSavedShippingResponse = await fetch(`${backend}/shipping/saved/address/${shipping.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })

        const allSavedShippingData = await allSavedShippingResponse.json()
        console.log(allSavedShippingData)
        setShowModal(true)
        setShowingSavedShipping(true)
        setAllSavedShipping(allSavedShippingData)
        
    }

    const showSelectedShipping = async(event) => {
        const selectedShippingResponse = await fetch(`${backend}/shipping/address/${event.target.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })

        const selectedShippingData = await selectedShippingResponse.json()
        console.log(59, selectedShippingData)
        updateShippingState(selectedShippingData.address)
        closeSavedShipping()
    }

    const closeSavedShipping = () => {
        setShowModal(false)
        setShowingSavedShipping(false)
    }

    /* ------- UPDATE SHIPPING STATE/UPDATE SHIPPING INPUT STATE------ */

    const updateShippingState = (savedShippingAddressData) => {
        const shippingAddress = savedShippingAddressData.Address
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = savedShippingAddressData.Name.split(", ")

            setShipping({
                address: {
                    firstName: splitShippingName[0],
                    lastName: splitShippingName[1],
                    addressLineOne: splitShippingAddress[0],
                    addressLineTwo: splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined" ? "" : splitShippingAddress[1],
                    city: splitShippingAddress[2],
                    state: splitShippingAddress[3],
                    zipcode: splitShippingAddress[4]
                },
                id: savedShippingAddressData._id
            })

            grabPaymentLoading(false)
        } 
    }

    const updateShippingInputState = (savedShippingAddressData) => {
        const shippingAddress = savedShippingAddressData.Address
        console.log(96, savedShippingAddressData._id)
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = savedShippingAddressData.Name.split(", ")

            setShipping({
                address: {
                    firstName: splitShippingName[0],
                    lastName: splitShippingName[1],
                    addressLineOne: splitShippingAddress[0],
                    addressLineTwo: splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined" ? "" : splitShippingAddress[1],
                    city: splitShippingAddress[2],
                    state: splitShippingAddress[3],
                    zipcode: splitShippingAddress[4]
                },
                id: savedShippingAddressData._id
                
            })

            grabPaymentLoading(false)
        } 
    }

    /* --------------------- USE EFFECT -------------------- */

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
            updateShippingState(savedShippingAddressData.address)
            updateShippingInputState(savedShippingAddressData.address)
            
            setShippingLoading(false) // update shippingLoading state to false so we can render the shipping info and not <></>
        }

        getSavedShippingAddress()
    }, [])

   
    if(shippingLoading) {
        return <></>
    } else if(!shipping.address || !loggedIn() || addShipping) {
        // If user is guest (as indicated by !loggedIn()), or logged in user does not have a shipping address (indicated by !shipping.address), or logged in user clicked Add New Shipping (as indicated by addShipping state), show Shipping Input form
        return (
            <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} grabRGBA={grabPaymentLoading} RGBA={RGBA} addShipping={addShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} grabAddNewShipping={grabAddNewShipping} showSavedShipping={showSavedShipping}/>
        )
    } else if(shipping.address && !showingSavedShipping) {
        return (
            <>
            {/* If user has a saved address (indicated by shipping.address), display the address: */}
            <h2>Shipping Address</h2>
            <p id="name">{shipping.address.firstName} {shipping.address.lastName}</p>
            <p id="line1">{shipping.address.addressLineOne}</p>
            <p id="line2">{shipping.address.addressLineTwo}</p>
            <p id="cityStateZipcode">{shipping.address.city}, {shipping.address.state} {shipping.address.zipcode}</p>
            <Button name={'Add New Shipping Address'} onClick={() => {
                grabPaymentLoading(true)
                grabAddNewShipping(true)
            }}/>
            <Button name={'Edit Shipping Address'} />
            <Button name={'Save Shipping Address'} onClick={showSavedShipping} />
            </>
        )
    } else if(showingSavedShipping) {
        return(
            <Modal isOpen={showModal} onRequestClose={ closeSavedShipping } ariaHideApp={false} contentLabel="Saved Shipping">
                <h2>Shipping Address</h2>
                {allSavedShipping.map((savedShipping, index) => { return (
                    <div key={index}>
                        <p id="name"><b>{savedShipping.Name.split(", ")[0]} {savedShipping.Name.split(", ")[1]}</b></p>
                        <p id="line1">{savedShipping.Address.split(", ")[0]}</p>
                        <p id="line2">{savedShipping.Address.split(", ")[1]}</p>
                        <p id="cityStateZipcode">{savedShipping.Address.split(", ")[2]}, {savedShipping.Address.split(", ")[3]} {savedShipping.Address.split(", ")[4]}</p>
                        <button id={savedShipping._id} onClick={showSelectedShipping}>Select</button>
                    </div>
                )})}
                <Button name={'Close'} onClick={ closeSavedShipping } />
            </Modal>
        )
    }
}

export default Shipping