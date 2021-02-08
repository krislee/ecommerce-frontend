import React from 'react';
import '../styles/Button.css'

function Button ({ name, onClick, type }) {
    return (
        <div className="button">
            <button type={type} onClick={onClick}>{name}</button>
        </div>
    )
}

Button.defaultProps = { type: 'submit' }

export default Button