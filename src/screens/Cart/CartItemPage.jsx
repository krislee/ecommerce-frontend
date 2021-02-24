import { Link } from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import '../../styles/CartPage.css'


export default function CartItemPage ({ backend, loggedIn, id, name, quantity, totalPrice, grabItems, grabTotalPrice, grabTotalCartQuantity }) {
    const [cartQuantity, setCartQuantity] = useState(quantity)
    const [prevLoggedIn, setPrevLoggedIn] = useState('')
    const [itemID, setItemID] = useState('')

    // useEffect(() => {
    //     setPrevLoggedIn(loggedIn())
    //     setCartQuantity(quantity)
    // }, [quantity]) 

    const handleUpdateItemQuantity = async (event) => {
        const { value, id } = event.target
        setCartQuantity(Number(value))
        setItemID(id)
    }

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        setPrevLoggedIn(loggedIn())
        console.log(23, cartQuantity)
        if(itemID && cartQuantity) handleUpdateCartItem(itemID, signal)

        return function cleanUp () {
            abortController.abort()
        }

    }, [cartQuantity])

    const handleUpdateCartItem = async(itemID, signal) => {
        if(loggedIn()) {
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${itemID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                body: JSON.stringify({
                    Quantity: cartQuantity
                }),
                signal: signal
            })
            const updateCartData = await updateCartResponse.json()
            console.log(38, "UPDATE CART", updateCartData)
            // if(!updateCartData.cart) return
            grabItems(updateCartData.cart.Items)
            grabTotalPrice(updateCartData.cart.TotalCartPrice)
            grabTotalCartQuantity(updateCartData.cart.TotalItems)
        } else {
            if(prevLoggedIn) return grabTotalCartQuantity(0)
            console.log("updating guest")
            const updateCartResponse = await fetch(`${backend}/buyer/electronic/cart/${itemID}`, {
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
            // setCartQuantity(0)
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
            <Link className="homepage-items" to={{
                pathname:`/item/${name}`,
                search: `id=${id}`
            }}>
                <div>{name}</div>
            </Link>
            {/* <input type="number" min="1" value={cartQuantity} onChange={handleQuantity}/> */}
            <select id={id} value={cartQuantity} onChange={handleUpdateItemQuantity}>
                <option value={1}>01</option>
                <option value={2}>02</option>
                <option value={3}>03</option>
                <option value={4}>04</option>
                <option value={5}>05</option>
                <option value={6}>06</option>
                <option value={7}>07</option>
                <option value={8}>08</option>
                <option value={9}>09</option>
                <option value={10}>10</option>
            </select>
            <p>${totalPrice}</p>
            <button id={id} onClick={handleDeleteCartItem}>Delete</button>
        </div>
    )
}