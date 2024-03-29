## Deployed Website 
Click [here](https://elecommerce.netlify.app/) to view our online electronics store, Elecommerce! 
### Safari Users
If you want to view our website on the Safari mobile/iPad app, please turn off Prevent Cross-site Tracking in the Safari setting. If you want to view our website on Mac's Safari, please click on Safari, then Preferences, then Privacy, and then turn off Prevent Cross-site Tracking. 

### Mobile/Tablet Google Chrome Users
Please be aware that guest users may be experiencing issues on our website when using the mobile or tablet Chrome app. Please create an account to proceed our website instead.
## Run Locally

1. Install all dependencies

```
npm i 
````

2. Create a ```.env``` file at the root.
- Configure Stripe library with Stripe's publishable API Key. Add the API key as an environmental variabe in ```.env``` file.
```
REACT_APP_loadStripe=some_stripe_publishable_API_key 
```
- Add the server URL in ```.env``` file.
```
REACT_APP_server_URL='localhost:3001'
```

3. Click [here](https://github.com/krislee/ecommerce-backend/blob/main/README.md#run-locally) to run server locally. 
4. Run ```npm start```.
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
    - Establishes a communication with the server to send the ID of the cart to server and receive complete order information from server
- Material-UI
- React Bootstrap

## Issues
Currently, you can experience the full user functionalities of the deployed website on desktop.

Please bear with us as we work on resolving the following issues for the website on mobile/tablet:
- Guests cannot make orders on Google Chrome app 
- CSS and UI are skewed

## Backend Code Source
Click [here](https://github.com/krislee/ecommerce-backend) to view the backend code repository.



