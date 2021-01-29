import React, { useEffect, useState } from 'react';

function PaymentMethod ({ checkoutData }) {
    
    return (
        <div>
            <button onClick={() => console.log(checkoutData)}>Payment Method Component</button>
        </div>
    )

}

export default PaymentMethod