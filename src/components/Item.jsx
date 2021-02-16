import React from 'react';
// import '../styles/Button.css'

function Item ({ name, itemUrl, grabURL }) {

    function grabAndLogURL() {
        console.log(itemUrl);
        grabURL(itemUrl);
    }

    return (
        <div className="item" onClick={() => grabAndLogURL()}>
            <div>{name}</div>
        </div>
    )
}


export default Item