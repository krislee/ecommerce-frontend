import React from 'react';
import '../styles/Button.css'

function Button ({ name, onClick, type, disabled }) {
    return (
        <div className="button">
            <button type={type} disabled={disabled} onClick={onClick}>{name} </button>
        </div>
    )
}

Button.defaultProps = { type: 'submit', disabled: false}

export default Button