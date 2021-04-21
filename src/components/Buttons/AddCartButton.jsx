import React from 'react';
import Button from 'react-bootstrap/Button'

function AddCartButton ({ name, id, loggedIn, backend, quantity, differenceQuantity, grabDifferenceQuantity, grabTotalCartQuantity, prevLoggedIn, grabShowAddItemAlert, grabShowAddItemDifferenceAlert }) {
    
    // const [addedQuantityToReach10, setAddedQuantityToReach10] = useState(0)

    const addItem = async (e) => {
        e.preventDefault();

        if(loggedIn()) {
             // Check how many of that item is already in the cart:
             const itemQuantityResponse = await fetch(`${backend}/buyer/cart-item/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn()
                },
                // body: {
                //     Authorization: loggedIn()
                // }
            })
            const itemQuantityData = await itemQuantityResponse.json()
            console.log(21, itemQuantityData)
            let difference = 0
            if(itemQuantityData.item && (itemQuantityData.item.Items[0].Quantity + parseInt(quantity) > 10)) {
                if(itemQuantityData.item.Items[0].Quantity < 10) { // If there is less than 10 of that item in the cart, and user is adding more of that item but will cause the item quantity to exceed 10, we will add only the difference to get to 10 of that item
                    console.log(24)
                    difference = 10-itemQuantityData.item.Items[0].Quantity
                    console.log(27, difference)
                    grabDifferenceQuantity(difference)
                    grabShowAddItemDifferenceAlert(true)
                } else {
                    return grabShowAddItemAlert(true) // If there is 10 of that item already in the cart, do not continue to make a POST request and show an alert back at ItemPage component
                }
            }
            console.log(34, quantity)
            const addItemResponse = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loggedIn(),
                },
                credentials: 'include',
                body: JSON.stringify({
                    Quantity: difference ? difference : quantity,
                    // Authorization: loggedIn()
                })
            });
            const addItemData = await addItemResponse.json();
            console.log(addItemData)
            grabTotalCartQuantity(addItemData.cart.TotalItems)
            difference = 0

        } else { 
            // If user was previously logged in as indicated by prevLoggedIn state (prevLoggedIn state value is retrieved from local storage once item page is loaded), but then clears local storage after item page is loaded as checked by loggedIn(), then we will update the nav bar.
            if(prevLoggedIn && !loggedIn()) grabTotalCartQuantity(0)
            // if(prevLoggedIn && !loggedIn())return window.location.href = window.location.href // This does cause user who clicks log out on item page instead of clearing local storage, the page would refresh when trying to click on Add to Cart the first time after clicking log out

            // Check how many of that item is already in the cart:
            const itemQuantityResponse = await fetch(`${backend}/buyer/cart-item/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // always send the cookies
            })
            const itemQuantityData = await itemQuantityResponse.json()
            console.log(itemQuantityData)
            
            let difference
            if(itemQuantityData.item && itemQuantityData.item.length !== 0 && (itemQuantityData.item[0].Quantity + parseInt(quantity) > 10)) {
                if(itemQuantityData.item[0].Quantity < 10) { // If there is less than 10 of that item in the cart, and user is adding more of that item but will cause the item quantity to exceed 10, we will add only the difference to get to 10 of that item
                    difference = 10-itemQuantityData.item[0].Quantity
                    grabDifferenceQuantity(difference) 
                    grabShowAddItemDifferenceAlert(true)
                } else {
                    return grabShowAddItemAlert(true) // If there is 10 of that item already in the cart, do not continue to make a POST request and show an alert back at ItemPage component
                } 
            }

            // If user was always logged out, then run the following:
            const addItemResponse = await fetch(`${backend}/buyer/electronic/cart/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // always send the cookies
                body: JSON.stringify({
                    Quantity: difference ? difference: quantity
                })
            });
            const addItemData = await addItemResponse.json();
            console.log(addItemData);
            grabTotalCartQuantity(addItemData.totalItems)
            difference = 0
        }
    }

    return (
        <div id={id} className="add-item-button-container">
            <Button variant="dark" size='lg' className="add-item-button"
                // disabled={cartQuantity > 10 } 
                onClick={addItem}>{name}</Button>
        </div>
    )
}

// 1 "Sambucol Sugar Free Black Elderberry Syrup, 4oz Bottle" has been moved to your cart. You have now reached the maximum quantity of 3 for this item.

export default AddCartButton