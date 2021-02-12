import React from 'react';
// import '../styles/Button.css'

function Item ({ name, url, grabURL}) {

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