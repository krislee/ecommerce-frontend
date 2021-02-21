import React, {useEffect, useState} from 'react'
import '../../styles/CartPage.css'



export default function CartItemPage ({ backend, loggedIn, id, name, quantity, totalPrice, grabItems, grabTotalPrice, grabTotalCartQuantity}) {
    const [cartQuantity, setCartQuantity] = useState(quantity)
    const [prevLoggedIn, setPrevLoggedIn] = useState('')

    useEffect(() => {
        setPrevLoggedIn(loggedIn())
        setCartQuantity(quantity)
    }, [quantity])

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
            grabTotalPrice(updateCartData.cart.TotalCartPrice)
            grabTotalCartQuantity(updateCartData.cart.TotalItems)
        } else {
            if(prevLoggedIn) return grabTotalCartQuantity(0)
            console.log("updating guest")
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
            grabTotalCartQuantity(updateCartData.totalItems)
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
            grabTotalPrice(deleteCartItemData.cart.TotalCartPrice)
            grabTotalCartQuantity(deleteCartItemData.cart.TotalItems)
        } else {
            if(prevLoggedIn) return grabTotalCartQuantity(0)
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
            grabTotalCartQuantity(deleteCartItemData.totalItems)
        }
    }

    return (
        <div>
            <p>{name}</p>
            <input type="number" min="1" value={cartQuantity} onChange={handleQuantity}/>
            <p>${totalPrice}</p>
            <button id={id} onClick={handleUpdateCartItem}>Update</button>
            <button id={id} onClick={handleDeleteCartItem}>Delete</button>
        </div>
    )
}