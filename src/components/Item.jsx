import React, { useState } from 'react';
// import '../styles/Button.css'

function Item ({ name, itemUrl, grabURL }) {

    const grabAndLogURL = () => {
        grabURL(itemUrl);
    };

    return (
        <div className="item" onClick={() => grabAndLogURL()}>
            {name.length < 50 ? <div>{name}</div> :
            <div>{`${name.split(" ").splice(0, 8).join(" ")}...`}</div>}
        </div>
    );
};

export default Item