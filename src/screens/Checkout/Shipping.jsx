import React, { useEffect, useState } from 'react';
import ShippingForm from '../../components/ShippingForm'
import Button from '../../components/Button'
import Modal from 'react-modal';;

function Shipping({ backend, loggedIn, grabPaymentLoading, cartID  }) {
    // shippingLoading state is initially set to true to render <></> before updating it to false in useEffect()
    const [shippingLoading, setShippingLoading] = useState(true)
    const [RGBA, setRGBA] = useState({backgroundColor: "rgba(192,192,192,1.0)"})
    const [showModal, setShowModal] = useState(false)

    // shipping state is to store ONE saved shipping address (either default, last used, or last created) that we wil display or no saved shipping address
    // Aside from useEffect(), whenever we select an address, update an address, or add a new address, shipping state is updated to store that current, saved shipping address to redisplay it
    // If shipping state stores an object of saved shipping address, then we would always use it 
    const [shipping, setShipping] = useState({})
    // addShipping state to represent if we are currently adding a new shipping address to addresses logged in user has already saved
    const [addShipping, setAddShipping] = useState(false)
    // shippingInput state that contains the address values for the input value
    const [shippingInput, setShippingInput] = useState({})
    // allSavedShipping state contains the array of all the shipping addresses that would be mapped over to display each address in the modal
    const [allSavedShipping, setAllSavedShipping] = useState([])
    // showingAllSavedShipping state represents if we are currently showing saved cards
    const [showSavedShipping, setShowSavedShipping] = useState(false)
    // editShipping state represents if we are currently editing an address
    const [editShipping, setEditShipping] = useState(false)
    const [readOnly, setReadOnly] = useState(false) // disable the inputs after clicking Next
    // const [shippingDisabled, setShippingDisabled] = useState(false)

    /* ------- MISCELLANEOUS FUNCTIONS ------ */

    const grabRGBA = (rgba) => setRGBA(rgba)

    const grabShippingInput = (shippingInput) => setShippingInput(shippingInput)

    const grabAddNewShipping = (addShipping) => setAddShipping(addShipping)

    // Fade out the Shipping component and show the Payment Method component when Next button is clicked
    const collapse = () => {
        console.log("collapse")
        grabRGBA({backgroundColor: "transparent"})
        grabPaymentLoading(false) // paymentLoading state is currently true UNTIL Next button in ShippingForm component is clicked. By clicking the button, paymentLoading state is updated to false so it can render stuff from the Checkout/PaymentMethod components rather than render <></>
        setReadOnly(true)
    }

    const back = () => {
        grabRGBA({backgroundColor: "rgba(192,192,192,1.0)"})
        setReadOnly(false)
        grabPaymentLoading(true)
    }

    /* ------- SAVED SHIPPING FUNCTIONS ------ */

    const handleSavedShipping = async() => {
        const allSavedShippingResponse = await fetch(`${backend}/shipping/saved/address/${shipping.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })

        const allSavedShippingData = await allSavedShippingResponse.json()
        console.log(47, "all shipping: ", allSavedShippingData)
        setAllSavedShipping(allSavedShippingData) // update allSavedShipping state from [] to store all the addresses returned from server
    }

    const handleSelectedShipping = async(event) => {
        const selectedShippingResponse = await fetch(`${backend}/shipping/address/${event.target.id}`, { // address id stored in each Selected button
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            }
        })

        const selectedShippingData = await selectedShippingResponse.json()
        console.log(59, "selected shipping: ", selectedShippingData)
        updateShippingState(selectedShippingData.address) // update the shipping state with updateShippingState helper to store the selected addresses
        updateShippingInputState(selectedShippingData.address) // update the shippingInput state so the inputs would have the select address
        closeModal() // call the helper to close modal and update showSavedShipping state to false to represent we are no longer showing saved addresses after selecting one
    }

    /* ------- CONTROLLING MODALS ------ */

    const closeModal = () => {
        // grabPaymentLoading(false)  // we show the payment info back when we are not adding/editing/showing all addresses; by updating paymentLoading state to false, the PaymentMethod component will return <></>
        if(showSavedShipping) {
            setShowSavedShipping(false) // update showSavedShipping state to false to represent we are not showing saved addresses
        } else if(addShipping) {
            setAddShipping(false) // update the addShipping state to false to represent we are not adding a shipping
        } else if(editShipping) {
            setEditShipping(false) // update the editShipping state to false to represent we are not edditing a shipping
        }
        setShowModal(false) // close modal
        // updateShippingInputState(shipping)
    }

    const openAddNewModal = () => {
        setAddShipping(true) // update the addShipping state to true to represent we are currently adding a shipping
        // setShowModal(true) // open modal
        // grabPaymentLoading(true) // we do not want to show the payment info when we are adding/editing/showing all addresses; by updating paymentLoading state to false, the PaymentMethod component will return <></>
    }


    const openEditModal = () => {
        setEditShipping(true) // update the editShipping state to true to represent we are currently edditing a shipping
        // setShowModal(true) // open modal
        // grabPaymentLoading(true) // we do not want to show the payment info when we are adding/editing/showing all addresses; by updating paymentLoading state to false, the PaymentMethod component will return <></>
    }

    const openAllAddressesModal = () => {
        setShowModal(true) // open modal
        // grabPaymentLoading(true) // we do not want to show the payment info when we are adding/editing/showing all addresses; by updating paymentLoading state to false, the PaymentMethod component will return <></>
        setShowSavedShipping(true) // update showSavedShipping state to true to represent we are currently showing saved addresses
        handleSavedShipping()
    }

    /* ------- EDITING SHIPPING ------ */

    const handleEditShipping = async () => {
        const editShippingResponse = await fetch(`${backend}/shipping/address/${shipping.id}?checkout=true`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loggedIn()
            },
            body: JSON.stringify({
                name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                address: `${shippingInput.addressLineOne}, ${shippingInput.addressLineTwo}, ${shippingInput.city}, ${shippingInput.state}, ${shippingInput.zipcode}`
            })
        })
        const editShippingData = await editShippingResponse.json()
        console.log("edit shipping: ", editShippingData)

        updateShippingState(editShippingData.address)
        updateShippingInputState(editShippingData.address)
        setEditShipping(false) // update the editShipping state to true to represent we are not edditing a shipping
    }

    /* ------- HELPERS FOR UPDATING SHIPPING STATE/UPDATE SHIPPING INPUT STATE------ */

    // Update the shipping state whenever we want to store ONE saved address that we want to display. The param savedShippingAddressData is some data received after fetching the server. We update the shipping state to store that data of ONE address. We update the shipping state when we run useEffect(), edit address, selected address, and add new address.
    const updateShippingState = (checkoutSavedShippingAddressData) => {
        const shippingAddress = checkoutSavedShippingAddressData.Address
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = checkoutSavedShippingAddressData.Name.split(", ")
            setShipping({
                
                    firstName: splitShippingName[0],
                    lastName: splitShippingName[1],
                    addressLineOne: splitShippingAddress[0],
                    addressLineTwo: splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined" ? "" : splitShippingAddress[1],
                    city: splitShippingAddress[2],
                    state: splitShippingAddress[3],
                    zipcode: splitShippingAddress[4],
               
                id: checkoutSavedShippingAddressData._id
            })

            // grabPaymentLoading(false)
        } 
    }

    // Update the shippingInput state alongside the shipping state after fetching the server for one shipping address, so that when we do click on Edit button the inputs would be prefilled with the most current displayed saved address.
    const updateShippingInputState = (checkoutSavedShippingAddressData) => {
        const shippingAddress = checkoutSavedShippingAddressData.Address
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = checkoutSavedShippingAddressData.Name.split(", ")

            setShippingInput({
                
                    firstName: splitShippingName[0],
                    lastName: splitShippingName[1],
                    addressLineOne: splitShippingAddress[0],
                    addressLineTwo: splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined" ? "" : splitShippingAddress[1],
                    city: splitShippingAddress[2],
                    state: splitShippingAddress[3],
                    zipcode: splitShippingAddress[4]
                
            })
        } 
    }

    /* --------------------- USE EFFECT -------------------- */

    useEffect(() => {
        if(loggedIn()) {
            const getCheckoutShippingAddress = async() => {
                const checkoutShippingAddressResponse = await fetch(`${backend}/shipping/checkout/address`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    }
                })
    
                const checkoutShippingAddressData = await checkoutShippingAddressResponse.json()
                console.log("fetching for checkout address", checkoutShippingAddressData)
    
                // If there are no saved cards, then shipping state does not get updated and remains {}
                updateShippingState(checkoutShippingAddressData.address)
                updateShippingInputState(checkoutShippingAddressData.address)
                
                setShippingLoading(false) // update shippingLoading state to false so we can render the shipping info and not <></>
                grabPaymentLoading(true)
            } 
    
            getCheckoutShippingAddress()
        } else {
            setShippingLoading(false)
           
        }
    }, [])

   
    if(shippingLoading) {
        return <></> // When the Checkout component first loads, render nothing for Shipping Component until after fetching an address. Depending if there is an address or not from the fetch, we will return something different as shown based on the conditional retuns below.
    } else if(!shipping.firstName || !loggedIn() || addShipping || editShipping ) {
        // If user is guest (as indicated by !loggedIn()), or logged in user does not have a shipping address (indicated by !shipping.address), or logged in user clicked Add New Shipping (as indicated by addShipping state), or logged in user clicked Edit Shipping show Shipping Input form
        return (
            <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} grabRGBA={grabRGBA} RGBA={RGBA} addShipping={addShipping} grabAddNewShipping={grabAddNewShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} editShipping={editShipping} handleEditShipping={handleEditShipping} closeModal={closeModal} collapse={collapse} back={back}/>
        )
    } else if(showSavedShipping) {
        return(
            <Modal isOpen={showModal} onRequestClose={ closeModal } ariaHideApp={false} contentLabel="Saved Shipping">
                <h2>Shipping Address</h2>
                {allSavedShipping.map((savedShipping, index) => { return (
                    <div key={index}>
                        <p id="name"><b>{savedShipping.Name.split(", ")[0]} {savedShipping.Name.split(", ")[1]}</b></p>
                        <p id="line1">{savedShipping.Address.split(", ")[0]}</p>
                        <p id="line2">{savedShipping.Address.split(", ")[1]}</p>
                        <p id="cityStateZipcode">{savedShipping.Address.split(", ")[2]}, {savedShipping.Address.split(", ")[3]} {savedShipping.Address.split(", ")[4]}</p>
                        <button id={savedShipping._id} onClick={handleSelectedShipping}>Select</button>
                    </div>
                )})}
                <Button name={'Close'} onClick={ closeModal } />
            </Modal>
        )
    } else if(shipping.firstName) {
        return (
            <>
            <div style={RGBA}>
                {/* If user has a saved address (indicated by shipping.address), display the address: */}
                <h2>Shipping Address</h2>
                <p id="name">{shipping.firstName} {shipping.lastName}</p>
                <p id="line1">{shipping.addressLineOne}</p>
                <p id="line2">{shipping.addressLineTwo}</p>
                <p id="cityStateZipcode">{shipping.city}, {shipping.state} {shipping.zipcode}</p>
                <button disabled={readOnly} id="addNewAddress" onClick={openAddNewModal}>Add New</button>
                <button disabled={readOnly} id="editAddress" onClick={openEditModal}>Edit</button>
                <button disabled={readOnly} id="allAddresses" onClick={openAllAddressesModal}>All Addresses</button> 
                {!readOnly ? <button onClick={collapse}>Next</button> : <></>}
            </div>
            {readOnly ? <button onClick={back}>Back</button> : <></> }
            </>
        )
    } 
}

export default Shipping

// Click edit --> show edit button & Add new and saved addresses buttons & 'Save and Continue' buttons -->
// Will show edit button again for shipping 
// Shows Payment method --> "" --> Click Pay now 