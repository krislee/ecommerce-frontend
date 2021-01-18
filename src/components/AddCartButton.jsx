import React from 'react';
import '../styles/Button.css'
// import axios from 'axios';

function AddCartButton ({ name, id, url, quantity }) {

    const addItem = async () => {
        console.log(3, document.cookie)
        // const testURL = "https://happy-bohr-10f4b0.netlify.app"
        // const testURL = "https://elecommerce.herokuapp.com"
        const testURL = "https://backend-elecommerce.netlify.app/.netlify/functions/server"
        const resp = await fetch(`${testUrl}/buyer/electronic/cart/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Accept': 'application/json'
            },
            credentials: 'include', // always send the cookies
            body: JSON.stringify({
                Quantity: quantity
            })
        });
        const data = await resp.json()
        console.log(data)
        console.log(4, document.cookie)

        // const resp = await axios(`${url}/buyer/electronic/cart/${id}`, {
        //     method: 'post',
        //     data: {Quantity: quantity}, 
        //     withCredentials: true,
        //     // credentials: 'include'
        // })
        // console.log(resp)

        // axios.defaults.withCredentials = true;
        // axios.post(`${url}/buyer/electronic/cart/${id}`, {
        //     data: {Quantity: quantity},
        //     headers:{withCredentials:true}
        // });
    }

    return (
        <div id={id} className="button">
            <button onClick={addItem}>{name}</button>
        </div>
    )
}


export default AddCartButton