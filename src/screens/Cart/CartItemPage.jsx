import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../../styles/CartPage.css'
import NavBar from '../../components/NavigationBar'
import Footer from '../../components/Footer'


export default function CartItemPage ({ backend, loggedIn, index, id, name, quantity, totalPrice, grabItems, grabTotalPrice}) {

    const [cartQuantity, setCartQuantity] = useState(quantity)

    const handleQuantity = (event) => {
        setCartQuantity(event.target.value)
    }

    const handleUpdateCartItem = async(event) => {
        if(loggedIn()) {
            console.log(event.target.id)
            console.log(cartQuantity)
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    Quantity: cartQuantity
                })
            })
            const updateCartData = await updateCartResponse.json()
            console.log(updateCartData)
            grabItems(updateCartData.cart.Items)
            grabTotalPrice(updateCartData.totalCartPrice)
        } else {
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    Quantity: cartQuantity
                })
            })
            const updateCartData = await updateCartResponse.json()
            console.log(updateCartData)
            grabItems(updateCartData.cart)
            grabTotalPrice(updateCartData.totalCartPrice)
        }
    }


    const handleDeleteCartItem = async(event) => {
        if(loggedIn()) {
            console.log("deleting logged in")
            const deleteCartItemResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                }
            })
            const deleteCartItemData = await deleteCartItemResponse.json()
            console.log(deleteCartItemData)
            grabItems(deleteCartItemData.cart.Items)
            grabTotalPrice(deleteCartItemData.totalCartPrice)
        } else {
            console.log("deleting guest")
            const deleteCartItemResponse = await fetch(`${backend}/buyer/electronic/cart/${event.target.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const deleteCartItemData = await deleteCartItemResponse.json()
            console.log(deleteCartItemData)
            grabItems(deleteCartItemData.cart)
            grabTotalPrice(deleteCartItemData.totalCartPrice)
        }
    }

    return (
        <div key={index}>
            <p>{name}</p>
            <input type="number" min="1" value={cartQuantity} onChange={handleQuantity}/>
            <p>${totalPrice}</p>
            <button id={id} onClick={handleUpdateCartItem}>Update</button>
            <button id={id} onClick={handleDeleteCartItem}>Delete</button>
        </div>
    )
}