import React, { useEffect, useState } from 'react';
import ShippingInput from '../../components/ShippingInput'

export default function Shipping({ backend, loggedIn }) {
    const [shippingLoading, setShippingLoading] = useState(true)

    // shipping state is to store the saved shipping address (either default, last used, or last created) or no saved shipping address
    const [shipping, setShipping] = useState({})

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
            setShipping(savedShippingAddressResponse)
            setShippingLoading(false)
        }

        getSavedShippingAddress()
    })


    if(shippingLoading) {
        return <h2>Loading...</h2>
    } else if(!shipping.address || !loggedIn()) {
        // If user is guest, or logged in user does not have a shipping address, or logged in user clicked Add New Shipping, show Shipping Input form
        return (
            <ShippingInput loggedIn={loggedIn} shipping={shipping} />
        )
    }
}