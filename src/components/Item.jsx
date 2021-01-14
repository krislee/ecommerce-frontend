import React, { Component, useEffect } from 'react';
// import '../styles/Button.css'

function Item ({ name, url, grabURL}) {

    // useEffect(() => {
    //     grabURL(url)
    // },[])

    function grabAndLogURL() {
        console.log(url);
        grabURL(url);
    }

    return (
        <div className="item" onClick={() => grabAndLogURL()}>
            <div>{name}</div>
        </div>
    )
}


export default Item