import React, { Component } from 'react';
// import '../styles/Button.css'

function Item ({ name }) {
    return (
        <div className="item">
            <div>{name}</div>
        </div>
    )
}


export default Item