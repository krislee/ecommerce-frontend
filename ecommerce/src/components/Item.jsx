import React, { Component } from 'react';
// import '../styles/Button.css'

function Item ({ name, url}) {

    

    return (
        <div className="item" onClick={() => console.log(url)}>
            <div>{name}</div>
        </div>
    )
}


export default Item