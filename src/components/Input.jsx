import React from 'react';
import '../styles/Input.css'

function Input ({ name }) {
    return (
        <div className="input">
            {/* Username, email and password */}
            <input type="text" placeholder={name}></input>
        </div>
    )
}


export default Input