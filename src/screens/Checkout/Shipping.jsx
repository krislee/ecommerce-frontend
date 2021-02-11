import React, { useEffect, useState } from 'react';
import ShippingForm from '../../components/ShippingForm'
import Button from '../../components/Button'
import Modal from 'react-modal';
import { Accordion, Card } from 'react-bootstrap'

function Shipping({ backend, loggedIn, grabPaymentLoading, cartID, openCollapse, grabOpenCollapse, loggedOut, grabLoggedOut, shipping, grabShipping, grabBillingWithShipping, shippingInput, grabShippingInput, paymentMethod }) {
    // shippingLoading state is initially set to true to render <></> before updating it to false in useEffect()
    const [shippingLoading, setShippingLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // addShipping state to represent if we are currently adding a new shipping address to addresses logged in user has already saved
    const [addShipping, setAddShipping] = useState(false)
    // allSavedShipping state contains the array of all the shipping addresses that would be mapped over to display each address in the modal
    const [allSavedShipping, setAllSavedShipping] = useState([])
    // showingAllSavedShipping state represents if we are currently showing saved cards
    const [showSavedShipping, setShowSavedShipping] = useState(false)
    // editShipping state represents if we are currently editing an address
    const [editShipping, setEditShipping] = useState(false)
    const [readOnly, setReadOnly] = useState(false) // disable the inputs after clicking Next
    const [showButtons, setShowButtons] = useState(false) //when we click Next button an Edit (sort of like a back button) appears. When the Edit button is clicked, showButtons state gets updated to true to display 3 other buttons: Add New, Edit, and Saved Shipping

    /* ------- MISCELLANEOUS FUNCTIONS ------ */

    // const grabShippingInput = (shippingInput) => setShippingInput(shippingInput)

    const grabAddNewShipping = (addShipping) => setAddShipping(addShipping)

    // Fade out the Shipping component and show the Payment Method component when Next button is clicked
    const collapse = async () => {
        console.log("collapse")
        grabOpenCollapse(true) //The payment method form or payment method details  from paymentMethod component will be displayed when openCollapse state is true
        setReadOnly(true) // disable the input fields
        setShowButtons(false) // hide the Add New, Saved Shipping, and Edit buttons 
        addNewShipping() // updates the payment intent with whatever is written in the shipping inputs; the shipping inputs would still have values when we are using an already saved shipping because we update the shippingInput state alongside updating shipping state in our useEffect()
        if(!paymentMethod.paymentMethodID) grabBillingWithShipping(shippingInput) // For guest user or logged in user without any saved payment methods, a payment method form shows after clicking Next. When we hit Next, collapse() runs, running the grabBillingWithShipping function, so that the billing state of the payment method form will be prefilled with the Shipping Input fields values; we do not want to prefill the Billing Inputs of an already saved payment method with shipping input fields values because the billing inputs may be different from shipping input; we only want the billing inputs value to be the same as shipping input field values when we are ADDING a new payment method. So for logged in users adding a payment method, grabBillingWithShipping(shippingInput) runs when we hit Add New payment method (see it in the PaymentMethod component)
    }

    const back = () => {
        setReadOnly(false)
        grabOpenCollapse(false) // close the payment method info/form
        setShowButtons(true) // show the Add New, Edit, and All Addresses buttons
    }

     /* ------- HELPERS FOR UPDATING SHIPPING STATE/UPDATE SHIPPING INPUT STATE------ */

    // Update the shipping state whenever we want to store ONE saved address that we want to display. The param savedShippingAddressData is some data received after fetching the server. We update the shipping state to store that data of ONE address. We update the shipping state when we run useEffect(), edit address, selected address, and after adding a new address. The goals is to be able to display the address after editing/selecting/adding an address or showing the address when we load the page. To display the address, it depends on the shipping state. 
    const updateShippingState = (checkoutSavedShippingAddressData) => {
        const shippingAddress = checkoutSavedShippingAddressData.Address
        console.log(checkoutSavedShippingAddressData)
        
        if(shippingAddress) {
            console.log(shippingAddress[1], typeof shippingAddress[1])
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = checkoutSavedShippingAddressData.Name.split(", ")
            grabShipping({ 
                firstName: splitShippingName[0],
                lastName: splitShippingName[1],
                line1: splitShippingAddress[0],
                addressLineTwo: (splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined") ? "" : splitShippingAddress[1],
                city: splitShippingAddress[2],
                state: splitShippingAddress[3],
                postalCode: splitShippingAddress[4],
                id: checkoutSavedShippingAddressData._id
            })

            // grabPaymentLoading(false)
        } 
    }

    // Update the shippingInput state alongside the shipping state (including useEffect, editing/adding/selecting address), so that when we do click on Edit button the inputs would be prefilled with the most current displayed saved address.
    const updateShippingInputState = (checkoutSavedShippingAddressData) => {
        const shippingAddress = checkoutSavedShippingAddressData.Address
        if(shippingAddress) {
            const splitShippingAddress = shippingAddress.split(", ")
            const splitShippingName = checkoutSavedShippingAddressData.Name.split(", ")

            grabShippingInput({
                firstName: splitShippingName[0],
                lastName: splitShippingName[1],
                line1: splitShippingAddress[0],
                addressLineTwo: splitShippingAddress[1] === "null" || splitShippingAddress[1] === "undefined" ? "" : splitShippingAddress[1],
                city: splitShippingAddress[2],
                state: splitShippingAddress[3],
                postalCode: splitShippingAddress[4]
                
            })
        } 
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
        updateShippingState(selectedShippingData.address) // update the shipping state with updateShippingState helper to store the selected address; then we can use the shipping state in the return below to show the selected address
        updateShippingInputState(selectedShippingData.address) // update the shippingInput state so the input values would be the select address
        closeModal() // call the helper to close modal and update showSavedShipping state to false to represent we are no longer showing saved addresses after selecting one
    }

    /* ------- CONTROLLING MODALS ------ */

    // This function runs when we hit Cancel in the Add New Shipping, Edit, or Saved Addresses modal
    const closeModal = () => {
        if(showSavedShipping) {
            setShowSavedShipping(false) // update showSavedShipping state to false to represent we are not showing saved addresses
        } else if(addShipping) {
            setAddShipping(false) // update the addShipping state to false to represent we are not adding a shipping
            grabShippingInput(shipping) // We need to reset back the input fields to what the displayed address is if user did not add a new card and just closes the modal/click Cancel since we updated the shippingInput state to be an empty object when we first clicked Add New to open modal or if user began typing and then hit Cancel/close modal. The displayed address is retrieved from shipping state.
        } else if(editShipping) {
            setEditShipping(false) // update the editShipping state to false to represent we are not edditing a shipping
            grabShippingInput(shipping) // In case the user starts editing and then closes the Edit modal, and then immediately click Edit again, the input fields need to be reset with what the address values are, which is retrieved from the shipping state.
        }
        setShowModal(false) // close modal
    }

    const openAddNewModal = () => {
        setAddShipping(true) // update the addShipping state to true to represent we are currently adding a shipping
        grabShippingInput({}) // clear out the pre-filled input fields by updating shippingInput state to be an empty obj so user will see a shipping form with empty inputs
        setShowModal(true) // open modal
    }

    const openEditModal = () => {
        setEditShipping(true) // update the editShipping state to true to represent we are currently edditing a shipping
        setShowModal(true) // open modal
    }

    const openAllAddressesModal = () => {
        setShowModal(true) // open modal
        setShowSavedShipping(true) // update showSavedShipping state to true to represent we are currently showing saved addresses
        handleSavedShipping() // when we open the Saved Addresses modal we want to run handleSavedShipping to fetch to the server to display all the shipping addresses user has saved
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
                address: `${shippingInput.line1}, ${shippingInput.line2}, ${shippingInput.city}, ${shippingInput.state}, ${shippingInput.postalCode}`
            })
        })
        const editShippingData = await editShippingResponse.json()
        console.log("edit shipping: ", editShippingData)

        updateShippingState(editShippingData.address) // Update the shipping state to re-render the newly edited address. Recall address display is retrieved from shipping state, so shipping state stores the address info.
        updateShippingInputState(editShippingData.address) // Update the shippingInput state so that the input fields will also reflect the newly edited address, so when you click Edit button again the input fields are prefilled with the newly edited address
        setEditShipping(false) // update the editShipping state to true to represent we are not edditing a shipping
    }

    /* ------- NEXT BUTTON FUNCTION ------ */

    const addNewShipping = async() => {
        const checkbox = document.querySelector('input[name=saveAddress]')
        console.log("adding new address as guest or first saved address")
        console.log("adding new address input: ", shippingInput)
        console.log(shipping)
        // We want to always update the Payment Intent when we click Next so that it stores the most up to date shipping for both guest and logged in users. For logged in user who has saved shipping addresses or is saving an address for the first time, we also want to highlight it as the last used shipping in our Payment Intent. The payment intent webhook will create a new address with LastUsed property with a true value if saving an address for the first time. The payment webhook will update the saved address with LastUsed property with a true value. If logged in user does not have any saved address, the payment webhook won't do anything to the addresses.
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
                        line1: shippingInput.line1,
                        line2: shippingInput.line2,
                        city: shippingInput.city,
                        state: shippingInput.state,
                        postalCode: shippingInput.postalCode
                    },
                    saveShipping: (checkbox && checkbox.checked) ? true : false,
                    lastUsedShipping: shipping.firstName ? shipping.id : undefined
                })
            })
            const updatePaymentIntentWithShippingData = await updatePaymentIntentWithShippingResponse.json()
            console.log(updatePaymentIntentWithShippingData)
        } else {
            // Guest user fetches to this route:
            const updatePaymentIntentWithShippingResponse = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': cartID
                },
                credentials: 'include', // need to send the sessionID in the request headers because updating the payment intent function also entails updating the order amount, which needs the sessionID to find the session (even though we are not updating the order amount, the updating payment intent function includes updating the order amount)
                body: JSON.stringify({
                    address: {
                        name: `${shippingInput.firstName}, ${shippingInput.lastName}`,
                        line1: shippingInput.line1,
                        line2: shippingInput.line2,
                        city: shippingInput.city,
                        state: shippingInput.state,
                        postalCode: shippingInput.postalCode
                    },
                    saveShipping: false
                })
            })
            const updatePaymentIntentWithShippingData = await updatePaymentIntentWithShippingResponse.json()
            console.log("guest updated payment intent", updatePaymentIntentWithShippingData)
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
                // grabPaymentLoading(true)
            } 
    
            getCheckoutShippingAddress()
        } else {
            setShippingLoading(false)
           
        }
    }, [])

   
    if(shippingLoading) {
        return <></> // When the Checkout component first loads, render nothing for Shipping Component until after fetching an address. Depending if there is an address or not from the fetch, we will return something different as shown based on the conditional retuns below.
    } else if(!shipping.firstName || !loggedIn()) {
        // If user is guest (as indicated by !loggedIn()), or logged in user does not have a shipping address (indicated by !shipping.address), or logged in user clicked Add New Shipping (as indicated by addShipping state), or logged in user clicked Edit Shipping show Shipping Input form
        return (
            <>
            {!openCollapse ? (
                <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} addShipping={addShipping} grabAddNewShipping={grabAddNewShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} editShipping={editShipping} handleEditShipping={handleEditShipping} closeModal={closeModal} collapse={collapse} back={back} addNewShipping={addNewShipping} /> 
            ): (
            <div>
                <h2>Shipping Address</h2>
                <p>{shippingInput.firstName} {shippingInput.lastName}</p>
                <p>{shippingInput.line1}</p>
                <p>{shippingInput.line2}</p>
                <p>{shippingInput.city}, {shippingInput.state} {shippingInput.postalCode}</p>
                {!showButtons && <button onClick={back}>Edit</button>}
            </div>
            )} 
            </>
        )
    } else if(showSavedShipping) {
        return(
            <Modal isOpen={showModal} onRequestClose={ closeModal } ariaHideApp={false} contentLabel="Saved Shipping">
                <h2>Shipping Address</h2>
                {allSavedShipping.map((savedShipping, index) => { return (
                    <div key={index}>
                        <p id="name"><b>{savedShipping.Name.split(", ")[0]} {savedShipping.Name.split(", ")[1]}</b></p>
                        <p id="line1">{savedShipping.Address.split(", ")[0]}</p>
                        <p id="line2">{savedShipping.Address.split(", ")[1] === "null" || savedShipping.Address.split(", ")[1] === "undefined" ? "" : savedShipping.Address.split(", ")[1]}</p>
                        <p id="cityStateZipcode">{savedShipping.Address.split(", ")[2]}, {savedShipping.Address.split(", ")[3]} {savedShipping.Address.split(", ")[4]}</p>
                        <button id={savedShipping._id} onClick={handleSelectedShipping}>Select</button>
                    </div>
                )})}
                <Button name={'Close'} onClick={ closeModal } />
            </Modal>
        )
    } else if(addShipping || editShipping ) {
        return (
            <Modal isOpen={showModal} onRequestClose={ closeModal } ariaHideApp={false} contentLabel="Saved Shipping">
                <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} addShipping={addShipping} grabAddNewShipping={grabAddNewShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} editShipping={editShipping} handleEditShipping={handleEditShipping} closeModal={closeModal} collapse={collapse} back={back}/> 
            </Modal>
        )
    } else if(shipping.firstName) {
        return (
            <>
            <div>
                <h2>Shipping Address</h2>
                {/* If user has a saved address (indicated by shipping.address), display the address: */}
                <p id="name">{shipping.firstName} {shipping.lastName}</p>
                <p id="line1">{shipping.line1}</p>
                <p id="line2">{shipping.line2}</p>
                <p id="cityStateZipcode">{shipping.city}, {shipping.state} {shipping.postalCode}</p>
                {!showButtons && <button onClick={back}>Edit</button>}
                { showButtons && (
                <>
                <button disabled={readOnly} id="addNewAddress" onClick={openAddNewModal}>Add New</button>
                <button disabled={readOnly} id="editAddress" onClick={openEditModal}>Edit</button>
                <button disabled={readOnly} id="allAddresses" onClick={openAllAddressesModal}>All Addresses</button> 
                </>
                )}
                
                {!readOnly && <button onClick={collapse}>Next</button>}
            </div>
            </>
        )
    } 
}

export default Shipping
