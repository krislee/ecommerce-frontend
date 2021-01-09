import React, { Component } from 'react';
import '../styles/Input.css'

function Input ({ name }) {
    return (
        <div className="input">
            <div>{name}</div>
        </div>
    )
}


export default Input