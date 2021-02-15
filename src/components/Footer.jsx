import React from 'react'
import '../styles/Footer.css'

function Footer ( {footerLoading}) {

    if(footerLoading) {
        return null
    } else {
        return (
            <div className="footer">Footer Placeholder</div>
        )
    }
}

export default Footer