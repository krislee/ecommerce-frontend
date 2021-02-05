import React, { useEffect } from 'react';
import '../../styles/UserProfile/AddressContainer.css'

function AddressContainer ({ index, address }) {

    useEffect(() => {
        console.log(address);
    })

    const name = address.Name.replace(/,/g, '');
    const newAddress = address.Address.split(',')
    const addressLine = `${newAddress[0]} ${newAddress[1]}`
    const secondAddressLine = `${newAddress[2]}, ${newAddress[3]} ${newAddress[4]}`
    const defaultAddress = address.DefaultAddress

    if (address) {
        return (
            <div key={index} className="one-address-container">
                    <div className="person-name">{name}</div>
                    <div className="address">{addressLine}</div>
                    <div className="address">{secondAddressLine}</div>
                    {defaultAddress && <div className="default-indicator">Default</div>}
            </div>
        )
    }
}

export default AddressContainer