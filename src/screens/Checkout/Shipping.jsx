import React, { useEffect, useState } from 'react';
import ShippingForm from '../../components/Checkout/ShippingForm'
import Modal from 'react-modal';
import { Redirect } from 'react-router-dom';
// import { Accordion, Card } from 'react-bootstrap'

function Shipping({ backend, loggedIn, grabPaymentLoading, cartID, showPayment, grabShowPayment, loggedOut, grabLoggedOut, shipping, grabShipping, grabBillingWithShipping, shippingInput, grabShippingInput, paymentMethod, grabCardholderName, showButtons, grabShowButtons, grabShowItems, showShipping, grabShowShipping, grabError, grabDisabled, readOnly, grabReadOnly, grabTotalCartQuantity, grabRedirect, prevLoggedIn, grabPrevLoggedIn }) {
   
    const [shippingLoading, setShippingLoading] = useState(true) // shippingLoading state is initially set to true to render <></> before updating it to false in useEffect()
    const [showModal, setShowModal] = useState(false)
    const [redirect, setRedirect] = useState(false)

    // addShipping state to represent if we are currently adding a new shipping address to addresses logged in user has already saved
    const [addShipping, setAddShipping] = useState(false)
    // allSavedShipping state contains the array of all the shipping addresses that would be mapped over to display each address in the modal
    const [allSavedShipping, setAllSavedShipping] = useState([])
    // showingAllSavedShipping state represents if we are currently showing saved cards
    const [showSavedShipping, setShowSavedShipping] = useState(false)
    // editShipping state represents if we are currently editing an address
    const [editShipping, setEditShipping] = useState(false)
    // const [readOnly, setReadOnly] = useState(false) // disable the inputs after clicking Next
    // const [showButtons, setShowButtons] = useState(false) //when we click Next button an Edit (sort of like a back button) appears. When the Edit button is clicked, showButtons state gets updated to true to display 3 other buttons: Add New, Edit, and Saved Shipping
    const [multipleShipping, setMultipleShipping] = useState(false) //multipleShipping state is initially false but will update to true in UseEffect if there is more than 1 saved address coming back from the server or after adding a new address at checkout


    /* ------- MISCELLANEOUS FUNCTIONS ------ */

    const grabAddNewShipping = (addShipping) => setAddShipping(addShipping)

    // Fade out the Shipping component and show the Payment Method component when Next button is clicked
    const collapse = async () => {
        if(prevLoggedIn && !loggedIn()) return grabTotalCartQuantity(0)
        grabShowShipping(false) // hide the Shipping component that shows the shipment details
        grabShowPayment(true) //The payment method form or payment method details  from paymentMethod component will be displayed when openCollapse state is true
        grabReadOnly(true) // disable the input fields
        grabShowButtons(false) // hide the Add New, Saved Shipping, and Edit buttons 
        addNewShipping() // updates the payment intent with whatever is written in the shipping inputs; the shipping inputs would still have values when we are using an already saved shipping because we update the shippingInput state alongside updating shipping state in our useEffect()
        if(!paymentMethod.paymentMethodID) grabBillingWithShipping(shippingInput) // For guest user or logged in user without any saved payment methods, a payment method form shows after clicking Next. When we hit Next, collapse() runs, running the grabBillingWithShipping function, so that the billing state of the payment method form will be prefilled with the Shipping Input fields values; we do not want to prefill the Billing Inputs of an already saved payment method with shipping input fields values because the billing inputs may be different from shipping input; we only want the billing inputs value to be the same as shipping input field values when we are ADDING a new payment method. So for logged in users adding a payment method, grabBillingWithShipping(shippingInput) runs when we hit Add New payment method (see it in the PaymentMethod component)
    }

    const back =() => {
        if(!loggedIn() && prevLoggedIn) return grabTotalCartQuantity(0)
        grabShowShipping(true) // show the Shipping component with the shipment details again
        grabShowPayment(false) // close the payment method info/form
        grabShowButtons(true) // show the Add New, Edit (the one that is associated with handleEditShipping function), and All Addresses buttons again & 
        // For guests who are at the PaymentMethod component but clicks Edit button at the Shipping Component to edit the Shipping form, the following condition is run:
        if(!paymentMethod.paymentMethodID) {
            grabCardholderName("") // When we click Back while filling out the Payment method form we want to clear the cardholder's name input if user started typing in it
            grabError(null) // clear any card errors if we are clicking back into the Shipping component from PaymentMethod component, so that when we click Next to show the PaymentMethod component, there would not be any errors displayed
            grabDisabled(true) // if we are clicking back into the Shipping component from PaymentMethod component, and then click Next to show the PaymentMethod component, we want the confirm payment button to be disabled until guest types the card number again
        }
        grabReadOnly(false) // enable the Shipping Form for editing or Adding card again, and reshow the Next button
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
        if(loggedIn()) {
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
        } else {
            grabTotalCartQuantity(0)
        }
    }

    const handleSelectedShipping = async(event) => {
        if(loggedIn()) {
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
        } else {
            grabTotalCartQuantity(0)
        }
    }

    /* ------- CONTROLLING MODALS ------ */

    // This function runs when we hit Cancel in the Add New Shipping, Edit, or Saved Addresses modal
    const closeModal = () => {
        if(loggedIn()) {
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
        } else {
            grabTotalCartQuantity(0)
        }
    }

    const openAddNewModal = () => {
        if(loggedIn()) {
            setAddShipping(true) // update the addShipping state to true to represent we are currently adding a shipping
            grabShippingInput({}) // clear out the pre-filled input fields by updating shippingInput state to be an empty obj so user will see a shipping form with empty inputs
            setShowModal(true) // open modal
        } else {
            grabTotalCartQuantity(0)
        }
    }

    const openEditModal = () => {
        if(loggedIn()) {
            setEditShipping(true) // update the editShipping state to true to represent we are currently edditing a shipping
            setShowModal(true) // open modal
        } else {
            grabTotalCartQuantity(0)
        }
        
    }

    const openAllAddressesModal = () => {
        if(loggedIn()) {
            setShowModal(true) // open modal
            setShowSavedShipping(true) // update showSavedShipping state to true to represent we are currently showing saved addresses
            handleSavedShipping() // when we open the Saved Addresses modal we want to run handleSavedShipping to fetch to the server to display all the shipping addresses user has saved
        } else {
            grabTotalCartQuantity(0)
        }
    }

    /* ------- EDITING SHIPPING ------ */

    const handleEditShipping = async () => {
        if(loggedIn()) {
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
        } else {
            grabTotalCartQuantity(0)
        }
    }

    /* ------- NEXT BUTTON FUNCTION ------ */

    const addNewShipping = async() => {
        const checkbox = document.querySelector('input[name=saveAddress]')
        console.log("adding new address as guest or first saved address")
        console.log("adding new address input: ", shippingInput)
        console.log("used shipping: ", shipping)

        // We want to always update the Payment Intent when we click Next so that it stores the most up to date shipping for both guest and logged in users. For logged in user who has saved shipping addresses or is saving an address for the first time, we also want to highlight it as the last used shipping in our Payment Intent. The payment intent webhook will create a new address with LastUsed property with a true value if saving an address for the first time. The payment webhook will update the saved address with LastUsed property with a true value. If logged in user does not have any saved address, the payment webhook won't do anything to the addresses.
        if(loggedIn()) {
            console.log(49, cartID)
            const updatePaymentIntentWithShippingResponse = await fetch(`${backend}/order/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': cartID, // cartID is a state passed from CheckoutPage component; cartID state value set in CheckoutPage component's useEffect
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
            // if(shipping.firstName) return // check if user is a guest because logged in user actively cleared local storage; we would know if user was previously logged in if shipping state has stored the address, since in useEffect, we store address in shipping state if user was logged in; if logged in user cleared local storage do not run the function (this only works for logged in user already has a saved shipping only or already has both saved shipping and payment method)
            // if(paymentMethod.paymentMethodID) return // if logged in user has a saved payment method only but not shipping, but then clears local storage and clicks Next on shipping, we do not want to update payment intent
            if(prevLoggedIn && !loggedIn()) return // if logged in user clears local storage and then clicks next, we do not want to continue updating payment intent

            // Guest user fetches to this route to update payment intent to include shipping address:
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
            if(updatePaymentIntentWithShippingData.message === "Please add an item to cart to checkout.") {
                grabTotalCartQuantity(0);
                return grabRedirect(true)
            } 
        }
    }
 
    /* ------- UPDATE MULTIPLESHIPPING STATE AFTER ADDING AN ADDRESS TO SHOW SAVED ADDRESSES BUTTON ------ */
    const grabMultipleShipping = (multipleShipping) => setMultipleShipping(multipleShipping)

    /* --------------------- USE EFFECT -------------------- */

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal
        if(loggedIn()) {
            const getCheckoutShippingAddress = async() => {
                const checkoutShippingAddressResponse = await fetch(`${backend}/shipping/checkout/address`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                const checkoutShippingAddressData = await checkoutShippingAddressResponse.json()
                console.log("fetching for checkout address", checkoutShippingAddressData)
    
                // If there are no saved shipping, then shipping state does not get updated and remains {}
                updateShippingState(checkoutShippingAddressData.address)
                updateShippingInputState(checkoutShippingAddressData.address)       
                setShippingLoading(false) // update shippingLoading state to false so we can render the shipping info and not <></>
            } 

            // Check if user has more than 1 address save to render the Saved Addresses button or not
            const retrieveAllAddresses = async() => {
                const allSavedShippingResponse = await fetch(`${backend}/shipping/address`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loggedIn()
                    },
                    signal: signal
                })
                const allSavedShippingData = await allSavedShippingResponse.json()
                console.log(allSavedShippingData)
                if(allSavedShippingData.length > 1) setMultipleShipping(true)
            }
            getCheckoutShippingAddress()
            retrieveAllAddresses()
            return function cleanUp () {
                abortController.abort()
            }

        } else {
            setShippingLoading(false) // if guest user, we do not need to update the shipping state and just render shipping the form (the condition, !shipping.firstName || !loggedIn() will be satisfied so that would be rendered)
        }
    }, [])

   
    if(shippingLoading) {
        return <></> // When the Checkout component first loads, render nothing for Shipping Component until after fetching an address. Depending if there is an address or not from the fetch, we will return something different as shown based on the conditional retuns below.
    } else if((loggedIn() && !shipping.firstName) || (!loggedIn() && !shipping.firstName)) {
        console.log(300)
        // If user is guest (as indicated by !loggedIn()), or logged in user does not have a shipping address (indicated by !shipping.address), we want to show the shipping form when the Next button from CheckoutItems component is clicked
        return (
            <>
            <h2>Shipping Address</h2>
            {/* When the Next button in CheckoutItems component is clicked, showShipping state is updated to true, and only then the form will be shown */}
            {showShipping && (
                <>
                <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} addShipping={addShipping} grabAddNewShipping={grabAddNewShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} editShipping={editShipping} handleEditShipping={handleEditShipping} closeModal={closeModal} collapse={collapse} addNewShipping={addNewShipping} /> 
                </>
            )} 
            {/* When we click Next button in Shipping component, collapse() runs and showPayment state is updated to true to show the Payment Component. We need to make sure to still show the shipping details and Edit button when we do show the payment section*/}
            {showPayment && (
                <>  
                <div>
                    <p>{shippingInput.firstName} {shippingInput.lastName}</p>
                    <p>{shippingInput.line1}</p>
                    <p>{shippingInput.line2}</p>
                    <p>{shippingInput.city}, {shippingInput.state} {shippingInput.postalCode}</p>
                    {!showButtons && <button onClick={back}>Edit</button>}
                </div>
                </>
            )} 
            </>
        )
    } else if(showSavedShipping) {
        return(
            <Modal isOpen={showModal} onRequestClose={ closeModal } ariaHideApp={false} contentLabel="Saved Shipping">
                <h2>Shipping Address</h2>
                {allSavedShipping.map((savedShipping, index) => { return (
                    <div key={index}>
                        <p id="name"><b>{savedShipping.Name.replace(", ", " ")}</b></p>
                        <p id="line1">{savedShipping.Address.split(", ")[0]}</p>
                        <p id="line2">{savedShipping.Address.split(", ")[1] === "null" || savedShipping.Address.split(", ")[1] === "undefined" ? "" : savedShipping.Address.split(", ")[1]}</p>
                        <p id="cityStateZipcode">{savedShipping.Address.split(", ")[2]}, {savedShipping.Address.split(", ")[3]} {savedShipping.Address.split(", ")[4]}</p>
                        <button id={savedShipping._id} onClick={handleSelectedShipping}>Select</button>
                    </div>
                )})}
                <button onClick={ closeModal }>Close</button>
            </Modal>
        )
    } else if(addShipping || editShipping ) {
        return (
            <Modal isOpen={showModal} onRequestClose={ closeModal } ariaHideApp={false} contentLabel="Add or Edit Shipping">
                <ShippingForm backend={backend} loggedIn={loggedIn} shipping={shipping} shippingInput={shippingInput} grabShippingInput={grabShippingInput} grabPaymentLoading={grabPaymentLoading} addShipping={addShipping} grabAddNewShipping={grabAddNewShipping} cartID={cartID} updateShippingState={updateShippingState} updateShippingInputState={updateShippingInputState} editShipping={editShipping} handleEditShipping={handleEditShipping} closeModal={closeModal} collapse={collapse} grabMultipleShipping={grabMultipleShipping} grabTotalCartQuantity={grabTotalCartQuantity} /> 
            </Modal>
        )
    } else if(shipping.firstName) {
        return (
            <>
            <h2>Shipping Address</h2>
            {/* When Next is clicked from the CheckoutItems component, showShipping updates to true & showPayment updates to false so the following shipment details will show. We still want to show the shipment details when we click Next in Shipping component. When we click Next in Shipping component, showShipping is false but showPayment will be updated to true , so shipment details will STILL show. */}
            {(showShipping || showPayment) && (
            <div>
                {/* If user has a saved address (indicated by shipping.address), display the address: */}
                <p id="name">{shipping.firstName} {shipping.lastName}</p>
                <p id="line1">{shipping.line1}</p>
                <p id="line2">{shipping.line2}</p>
                <p id="cityStateZipcode">{shipping.city}, {shipping.state} {shipping.postalCode}</p>
                {/* Edit button only shown if user has moved onto the Payment Method component */}
                {!showButtons && <button onClick={back}>Edit</button>} 
                {/* The following are shown if user is still in the Shipping component */}
                { showButtons && (
                    <>
                    <button id="addNewAddress" onClick={openAddNewModal}>Add New</button>
                    <button id="editAddress" onClick={openEditModal}>Edit</button>
                    {multipleShipping && <button id="allAddresses" onClick={openAllAddressesModal}>All Addresses</button>}
                    </>
                )}
                {showShipping && <button onClick={collapse}>Next</button>}
            </div>
            )}
            
            </>
        )
    } 
}

export default Shipping

// if(!loggedIn() && shipping.firstName) {
//     grabTotalCartQuantity(0)
//     return grabRedirect(true)
// }