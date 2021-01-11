import React, { Component } from 'react';
// import '../styles/Button.css'

function Item ({ name, description}) {
    return (
        <div className="item">
            <div>{name}</div>
            {/* <div>{description}</div> */}
        </div>
    )
}


export default Item