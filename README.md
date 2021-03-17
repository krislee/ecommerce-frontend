## Deployed Website 
Click [here](https://elecommerce.netlify.app/) to view our online electronics store, Elecommerce! 
## Run Locally

1. Install all dependencies

```
npm i 
````

2. Configure Stripe library with Stripe's publishable API Key. Add the API key to ```.env``` file. 
```
REACT_APP_loadStripe=some_stripe_publishable_API_key
```

## Main Functional Components
1. Login
2. Register
3. Shop all electronic items 
4. An individual electronic item
5. Cart
6. Checkout
    - Cart
    - Shipping
    - Payment Method
    - Order Complete
7. User Profile
    - Settings
    - Shipping Addresses
    - Payment Methods
    - Orders
    - Reviews

## Libraries
- stripe-js
    - Stripe's card elements used to collect card information at checkout or saving credit card under user profile tab
- socket.io-client
    - Establishes a communication with the server to send the id of the cart to server and receive complete order information from server
- Material-UI
- React Bootstrap

## Issues
Currently, you can experience the full user functionalities of the deployed website on desktop.

Please bear with us as we work on resolving the following issues for mobile/tablet:
- Unable to add items to cart 
- Unable to checkout 
- Unable to view order confirmation 
- Modals under User Profile are off centered

## Client-side Code Source
Click [here](https://github.com/krislee/ecommerce-frontend) to view the client-side code repository.



