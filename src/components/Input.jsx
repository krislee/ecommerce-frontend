import React from 'react';
import '../styles/Input.css'

function CustomInput ({ name, value, placeholder, type, onChange, pattern, maxLength, id }) {
    return (
            <input 
            type={type} 
            placeholder={placeholder}
            value={value}
            name={name}
            onChange={onChange}
            maxLength={maxLength}
            id={id}
            />
    )
}


export default CustomInput