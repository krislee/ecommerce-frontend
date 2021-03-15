import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../styles/UserProfile/PaymentContainer.css';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from 'react-bootstrap/Button';
import usStates from '../../components/states'
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

import {profileFirstNameInputError, profileFirstNameInputError2, profileLastNameInputError, profileLastNameInputError2, profileAddressLineOneInputError, profileCityInputError, profileCityInputError2, profileStateInputError, profileStateInputError2, profileZipcodeInputError, profileZipcodeInputError2, profileZipcodeInputError3,  cardHolderNameInputError, cardHolderNameInputError2, invalidCardMonthExpDateInput, invalidCardYearExpInput, cardMonthExpDateInputError, cardYearExpDateInputError, cardMonthExpDateLengthInputError, cardYearExpDateLengthInputError, expInvalidInput2} from '../Checkout/inputsErrors'

// Styles for the Modal
const customStyles = {
  content : {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    zIndex: 3
  }
};

Modal.setAppElement('#root');


// Styles pertaining to the cards used to display the payment methods
const useStyles = makeStyles((theme) => ({
  root: {
    width: '60%',
    backgroundColor: '#21212B',
    margin: '0.5rem',
    fontFamily: 'Mukta Vaani, sans-serif'
  },
  header: {
    cursor: 'pointer',
    fontFamily: 'Mukta Vaani, sans-serif'
  },
  avatar: {
    backgroundColor: '#fff',
    position: 'static'
  },
  avatarVisa: {
    backgroundColor: '#14287F',
    position: 'static'
  },
  avatarJCB: {
    backgroundColor: '#fff',
    position: 'static'
  },
  expirationDate: {
    paddingTop: '0.5rem',
    paddingBottom: '1rem !important',
    cursor: 'pointer',
    fontFamily: 'Mukta Vaani, sans-serif'
  },
  collapsedContent: {
    borderTop: '1px solid #101016',
    backgroundColor: '#21212B'
  }
}));

  const backgroundStyling = {
    backgroundSize: 'cover',
    height: '100%',
    width: '100%'
  };
  

function PaymentContainer ({ backend, payment, defaultFirstPayment, grabPaymentData, capitalize, capitalizeArray, loggedIn, grabRedirect }) {

    const classes = useStyles();

    /* ------- STATES ------- */

    // Getter and Setter to expand the cards (dropdown)
    const [expanded, setExpanded] = useState(false);
    // Getter and Setter to open and close the edit modal for payment methods
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    // Getter and Setter to open and close the second edit modal for payment methods
    const [editModalTwoIsOpen, setEditModalTwoIsOpen] = useState(false);
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the editing payment function on the first edit modal (for card information)
    const [editCardHolderInput, setEditCardHolderInput] = useState({});
    // Getter and Setter to store an object that will later be used to determine what users enter into inputs specifically regarding the editing payment function on the second edit modal (for billing information)
    const [editBillingInput, setEditBillingInput] = useState({});

    // Getter and Setter to display a warning message when users enter an invalid expiration date
    // const [invalidExpirationDate, setInvalidExpirationDate] = useState(false);

    // If user submits an invalid card year, such as 60 years later from today's year, server sends an error back to client. When this happens update invalidCardYearUpdate state to true
    const [invalidCardYearUpdate, setInvalidCardYearUpdate] = useState(false)

    // Getter and Setter to open and close the delete modal for payment methods
    const [deletePaymentModalIsOpen, setDeletePaymentModalIsOpen] = useState(false);
    const [disabledOnSubmitEditPaymentModal, setDisabledOnSubmitEditPaymentModal] = useState(false);
    const [overlayClickCloseEditPaymentModal, setOverlayClickCloseEditPaymentModal] = useState(true);
    const [disabledOnSubmitDeletePaymentModal, setDisabledOnSubmitDeletePaymentModal] = useState(false);
    const [overlayClickCloseDeletePaymentModal, setOverlayClickCloseDeletePaymentModal] = useState(true);

    // States to handle required Inputs that user clicked on but did not enter any values and clicked away
    const [onFirstNameBlurEvent, setOnFirstNameBlurEvent] = useState(false)
    const [onLastNameBlurEvent, setOnLastNameBlurEvent] = useState(false)
    const [onLine1BlurEvent, setOnLine1BlurEvent] = useState(false)
    const [onCityBlurEvent, setOnCityBlurEvent] = useState(false)
    const [onStateBlurEvent, setOnStateBlurEvent] = useState(false)
    const [onPostalCodeBlurEvent, setOnPostalCodeBlurEvent] = useState(false)
    const [onCardholderBlur, setOnCardholderBlur] = useState(false)
    const [onMonthBlur, setOnMonthBlur] = useState(false)
    const [onYearBlur, setOnYearBlur] = useState(false)


    // Function that runs when the edit modal opens
    const openEditModal = async (e) => {
      // Prevents the page from refreshing
      e.preventDefault();
      if (loggedIn()) {
        // Fetching to the backend to GET the information related to the particular payment method this container is rendering
        const onePaymentResponse = await fetch(`${backend}/order/show/payment/${cardID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          }
        });
        // Data regarding the payment methods that is received back from the request to the backend server
        const paymentData = await onePaymentResponse.json();
        const capitalizedName = [];
        // Name is put through the function to capitalize both the first and last name
        const name = capitalizeArray(paymentData.cardholderName.split(" "), capitalizedName);
        // Expiration date of the card for the payment method
        const expDate = paymentData.expDate;
        // Split the expiration date
        const expDateSplit = expDate.split('/');
        // Use the split expiration date to check whether or not we should add a zero in front of the month to format it properly
        const expDateMonthConversion = () => {
          if (expDateSplit[0].length === 1){
            return `0${expDateSplit[0]}`
          } else {
            return expDateSplit[0]
          }
        };
        // Prefill the inputs regarding the first edit modal for the payment methods with the information received back from paymentData
        setEditCardHolderInput({
          cardName: `${name}`,
          cardMonthExpDate: expDateMonthConversion(),
          cardYearExpDate: expDateSplit[1]
        });
        // Billing details is an object within the paymentData object
        const billingDetails = paymentData.billingDetails;
        // Address for the billing details
        const billingDetailsAddress = billingDetails.address;
        // Replace the name so that it does not contain a comma in between
        const billingDetailsName = billingDetails.name.replace (/,/g, "");
        // Capitalize first name incase user enters a name that is not capitalized
        const firstName = capitalize(billingDetailsName.split(" ")[0]);
        // Capitalize last name incase user enters a name that is not capitalized
        const lastName = capitalize(billingDetailsName.split(" ")[1]);
        // Define arrays that will be used to capitalize strings with multiple words (like full name, or addresses)
        const [capitalizedFirstAddressLine, capitalizedSecondAddressLine, capitalizedCity] = [[], [], []];
        // Capitalize the first line of address
        const firstAddressLine = capitalizeArray(billingDetailsAddress.line1.split(" "), capitalizedFirstAddressLine);
        // Check to see if there is a second line of address, and if there is, then capitalize the the second line of address
        const secondAddressLineCheck = () => {
          if (billingDetailsAddress.line2 === 'undefined' || billingDetailsAddress.line2 === null) {
            return '';
          } else {
            const secondAddressLine = capitalizeArray(billingDetailsAddress.line2.split(" "), capitalizedSecondAddressLine)
            return secondAddressLine;
          }
        };
        // Capitalize the city name
        const city = capitalizeArray(billingDetailsAddress.city.split(" "), capitalizedCity);
        // Grabbing the state from the billingDetailsAddress object
        const state = billingDetailsAddress.state;
        // Grabbing the zipcode from the billingDetailsAddress object
        const zipcode = billingDetailsAddress.postalCode;
        // Prefill the inputs regarding the second edit modal for the payment methods with the information received back from paymentData and specifically the billingDetails object
        setEditBillingInput({
          editBillingFirstName: `${firstName}`,
          editBillingLastName: `${lastName}`,
          editBillingFirstAddressLine: `${firstAddressLine}`,
          editBillingSecondAddressLine: secondAddressLineCheck(),
          editBillingCity: `${city}`,
          editBillingState: `${state}`,
          editBillingZipcode: `${zipcode}`,
        });
        // After all the inputs have been prefilled, the modal will open
        setEditModalIsOpen(true);
      } else {
        grabRedirect();
      };
    };

    // Function that handles the editing of payment methods
    const handleEditPaymentSubmit = async (e) => {
      // Prevents the page from refreshing
      e.preventDefault();
      if (loggedIn()) {
        // Creating a variable that tells the server we are EDITING the information for a specific payment method, which is identified from the cardID we recieve from the data of payment (passed down from the Payment parent component)
        setDisabledOnSubmitEditPaymentModal(true);
        setOverlayClickCloseEditPaymentModal(false);
        const editPaymentResponse = await fetch(`${backend}/order/update/payment/${cardID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          },
          // For our body, we need to have a value for both the payment information and billing address information, and we use the values received back from the inputs to do so
          body: JSON.stringify({
            billingDetails: {
              line1: editBillingInput.editBillingFirstAddressLine,
              line2: editBillingInput.editBillingSecondAddressLine,
              city: editBillingInput.editBillingCity,
              state: editBillingInput.editBillingState,
              postalCode: editBillingInput.editBillingZipcode,
              country: 'US',
              name: `${editBillingInput.editBillingFirstName} ${editBillingInput.editBillingLastName}`
            },
            name: editCardHolderInput.cardName,
            recollectCVV: false,
            expMonth: editCardHolderInput.cardMonthExpDate,
            expYear: editCardHolderInput.cardYearExpDate
          })
        });
        // Data regarding the payment methods that is received back from the request to the backend server when editing is finished to receive updated version of the data
        const editPaymentData = await editPaymentResponse.json();
        if(editPaymentData.invalidCardYear) {
          setEditModalIsOpen(true)
          setEditModalTwoIsOpen(false)
          setDisabledOnSubmitEditPaymentModal(false)
          return setInvalidCardYearUpdate(true)
        }
        // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default payment first on the list followed by the newest
        defaultFirstPayment(editPaymentData.paymentMethods);
        // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable PaymentData, so we can reuse that data to map through and display the different PaymentContainer components
        grabPaymentData(editPaymentData.paymentMethods);
        // Empty the object of the billing information inputs so that new ones can replace it later on without any duplication errors
        setEditBillingInput({});
        // Empty the object of the payment information inputs so that new ones can replace it later on without any duplication errors
        setEditCardHolderInput({});
        // Close the card dropdown since it was opened
        handleExpandClick();
        // Close the modal after all of this function is finished so user will return back on the regular screen
        closeEditModalTwo();
      } else {
        grabRedirect();
      };
    };

    // // Function that handles the editing of the default status (and not the contents of the payment method)
    const handleEditPaymentDefaultStatus = async (e) => {
      // Prevents the page from refreshing
      e.preventDefault();
      if (loggedIn()) {
        // Fetching to a server to make a request to update the default status based off of the current default status. We fetch to different backend URLs based off whether or not the card is true or false in the first place
        if (defaultCard) {
          // Removing the default status
          const removePaymentDefaultStatusResponse = await fetch(`${backend}/order/default/payment/${cardID}?default=false`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': loggedIn()
            }
          });
          // Data regarding the payment methods that is received back from the request to the backend server when editing default is finished to receive updated version of the data
          const removePaymentDefaultStatusData = await removePaymentDefaultStatusResponse.json();
          // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default payment method first on the list followed by the newest
          defaultFirstPayment(removePaymentDefaultStatusData.paymentMethods);
          // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable PaymentData, so we can reuse that data to map through and display the different PaymentContainer components
          grabPaymentData(removePaymentDefaultStatusData.paymentMethods);
          // Close the card dropdown since it was opened
          handleExpandClick();
        } else {
          // Adding the default status
          const addPaymentDefaultStatusResponse = await fetch(`${backend}/order/default/payment/${cardID}?default=true`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': loggedIn()
            }
          });
          // Data regarding the payment methods that is received back from the request to the backend server when editing default is finished to receive updated version of the data
          const addPaymentDefaultStatusData = await addPaymentDefaultStatusResponse.json();
          // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default payment method first on the list followed by the newest
          defaultFirstPayment(addPaymentDefaultStatusData.paymentMethods);
          // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable PaymentData, so we can reuse that data to map through and display the different PaymentContainer components
          grabPaymentData(addPaymentDefaultStatusData.paymentMethods);
          // Close the card dropdown since it was opened
          handleExpandClick();
        };
      } else {
        grabRedirect();
      };
    };
    
    // Function that handles the deleting of payment methods
    const handleDeletePayment = async (e) => {
      // Prevents the page from refreshing
      e.preventDefault();
      if (loggedIn()) {
        setDisabledOnSubmitDeletePaymentModal(true);
        setOverlayClickCloseDeletePaymentModal(false);
        // Fetching to a server to make a request to delete an payment method
        const deletePaymentResponse = await fetch(`${backend}/order/payment/${cardID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          }
        });
        // Data regarding the payment methods that is received back from the request to the backend server when deleting is finished to receive updated version of the data
        const deletePaymentData = await deletePaymentResponse.json();
        // Being passed down as a prop from the parent component of UserProfile, we are able to reorder the data so it will display the default payment first on the list followed by the newest
        defaultFirstPayment(deletePaymentData.paymentMethods);
        // Being passed down as a prop from the parent component of UserProfile, we are able to the set the data that we received back from the response of the server to the variable PaymentData, so we can reuse that data to map through and display the different PaymentContainer components
        grabPaymentData(deletePaymentData.paymentMethods);
        // Close the card dropdown since it was opened
        handleExpandClick();
        // Close the modal after all of this function is finished so user will return back on the regular screen
        closeDeleteModal();
      } else {
        grabRedirect();
      };
    };

    // Function used to close the modal by setting the edit modal condition to false
    const closeEditModal = () => {
      if (loggedIn()) {
        setEditModalIsOpen(false);
      } else {
        grabRedirect();
      };
    };

    // Function that runs when the second edit modal is trying to be activated
    const openEditModalTwo = (e) => {
      // Prevents the page from refreshing
      e.preventDefault();
      if (loggedIn()) {
        // If the year of expiration is the same as the current year, we have to check whether or not the month has passed
        if (Number(editCardHolderInput.cardYearExpDate) === new Date().getFullYear()){
          // If the month is the current or a month that will come in the future, we continue onto the second modal. If not, then we display a warning message saying that the month entered is not valid as it has already passed
          if (Number(editCardHolderInput.cardMonthExpDate) >= new Date().getMonth() + 1) {
            setEditModalTwoIsOpen(true);
            // setInvalidExpirationDate(false);
          } else {
            // setInvalidExpirationDate(true);
          };
        } else {
          setEditModalTwoIsOpen(true);
          // setInvalidExpirationDate(false);
        };
      } else {
        grabRedirect();
      };
    };

    // Function used to close the modal by setting the second edit modal condition to false
    const closeEditModalTwo = () => {
      if (loggedIn()) {
        setEditModalTwoIsOpen(false);
        setEditModalIsOpen(false);
        setDisabledOnSubmitEditPaymentModal(false);
        setOverlayClickCloseEditPaymentModal(true);
      } else {
        grabRedirect();
      }
    };

    // Function to open the modal regarding deletion of an payment methods
    const openDeleteModal = () => {
      if (loggedIn()) {
        setDeletePaymentModalIsOpen(true);
      } else {
        grabRedirect();
      };
    };

    // Function used to close the modal by setting the delete modal condition to false
    const closeDeleteModal = () => {
      if (loggedIn()) {
        setDeletePaymentModalIsOpen(false);
        setOverlayClickCloseDeletePaymentModal(true);
        setDisabledOnSubmitDeletePaymentModal(false);
      } else {
        grabRedirect();
      };
    };

    // Function used to expand the card dropdown when the card is dropped and to also close it when the card dropdown was already in a state of being expanded
    const handleExpandClick = () => {
      if (loggedIn()) {
        setExpanded(!expanded);
      } else {
        grabRedirect();
      };
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the card information
    const handleEditCardHolderNameChange = (e) => {
      if (loggedIn()) {
        const { name, value } = e.target;
        setEditCardHolderInput((prevEditCardHolder) => ({
            ...prevEditCardHolder, [name] : value
        }));
        setInvalidCardYearUpdate(false)
      } else {
        grabRedirect();
      };
    };

    // Function that allows us to change the value of the input dynamically and display it on the page regarding the billing address information
    const handleEditBillingChange = (e) => {
      if (loggedIn()) {
        const { name, value } = e.target;
        setEditBillingInput((prevEditBilling) => ({
            ...prevEditBilling, [name] : value
        }));
      } else {
        grabRedirect();
      };
    };
    const handleBillingStateChange = (event) => {
      if (loggedIn()) {
          setEditBillingInput((prevBilling) => ({
              ...prevBilling, "state": event.target.value
          }))
      } else {
          grabRedirect();
      };
  }

    // Only displays 2 characters in zipcode input, or display 2 characters in month input, or display 4 characters in year input
    const handleMaxExpOrZipcodeLength = (event) => {
      console.log(204, event.target)
      if (event.target.value.length > event.target.maxLength) {
        event.target.value = event.target.value.slice(0, event.target.maxLength)
      }
    }

    // Does not allow user to enter anything but numbers on zipcode input and exp date inputs
    const handleNonNumericExpirationOrZipcode =(event) => {
      if(event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) return event.preventDefault()
    }

    // Regular card information
    // Define arrays that will be used to capitalize strings with multiple words (like full name, or addresses)
    const [cardHolderNameCapitalized, billingNameCapitalized, capitalizedBillingCity, splitBillingAddressCapitalized, splitBillingAddressCapitalizedLineOne, splitBillingAddressCapitalizedLineTwo] = [[], [], [], [], [], []];
    // Capitalizing the name from the card holder
    const cardHolderName = capitalizeArray(payment.cardholderName.split(" "), cardHolderNameCapitalized);
    // Grabbing the payment brand
    const cardBrand = payment.brand;
    // Grabbing the expiration date
    const expirationDate = payment.expDate;
    // Grabbing the cardID which we will later use to fetch to different backend URLs
    const cardID = payment.paymentMethodID;
    // The last four digits of the card will be displayed for users to identify
    const lastFourDigitsOfCard = `Card ending in ${payment.last4}`;
    // Billing information variables
    // Billing details is an object within the payment object
    const billingInfo = payment.billingDetails;
    // For the first time users create a new payment method, the name on the billing information will have comma in between, while edited names do not have a comma, so we split accordingly based on whether or not there is a comma in the name
    const billingName = () => {
      // If the name does have a comma, then we split by the comma
      if (billingInfo.name.includes(',') === true) {
        const billingNameCapitalizedSplit = capitalizeArray(billingInfo.name.split(','), billingNameCapitalized);
        return billingNameCapitalizedSplit;
      } else {
        // if the name does not have a comma, then we split by the space in between
        const billingNameCapitalizedSplit = capitalizeArray(billingInfo.name.split(' '), billingNameCapitalized);
        return billingNameCapitalizedSplit;
      }
    };
    // Capitalize the city name
    const billingCity = capitalizeArray(billingInfo.address.city.split(' '), capitalizedBillingCity);
    // Function that will check whether or not there is a second line of address and will capitalize accordingly
    const billingAddress = () => {
      // If there is no address line two, we capitalize the one address line
      if (billingInfo.address.line2 === 'undefined' || billingInfo.address.line2 === null) {
        let splitBillingAddressLineOne = billingInfo.address.line1.split(" ");
        let billingAddressCapitalized = capitalizeArray(splitBillingAddressLineOne, splitBillingAddressCapitalized);
        return billingAddressCapitalized;
      } else {
        // If there is a address line two, then we capitalize both
        let splitBillingAddressLineOne = billingInfo.address.line1.split(" ");
        let splitBillingAddressLineTwo = billingInfo.address.line2.split(" ");
        let billingAddressCapitalizedLineOne = capitalizeArray(splitBillingAddressLineOne, splitBillingAddressCapitalizedLineOne);
        let billingAddressCapitalizedLineTwo = capitalizeArray(splitBillingAddressLineTwo, splitBillingAddressCapitalizedLineTwo);
        return `${billingAddressCapitalizedLineOne} ${billingAddressCapitalizedLineTwo}`;
      }
    };
    // Combining the city, state and postal code (zipcode) into one line
    const billingAddressTwo = `${billingCity}, ${billingInfo.address.state} ${billingInfo.address.postalCode}`;
    // Country for the billing address
    const billingAddressCountry = `${billingInfo.address.country}`;
    // True or false based off of whether or not the payment method is the default payment method
    const defaultCard = payment.default;

    // Function that will generate an image based off the card brand
    const brandImage = () => {
      // If the cardbrand was American Express
      if (cardBrand === 'amex') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
          alt="American Express"
          style={backgroundStyling}/>
        );
        // If the cardbrand was Cartes Bancaires
      } else if (cardBrand === 'cartes_bancaires') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/fr/7/72/Logo_GIE-CB.jpg"
          alt="Cartes Bancaires"
          style={backgroundStyling}/>
        );
        // If the cardbrand was Diners
      } else if (cardBrand === 'diners') {
        return (
          <img 
          src="https://cdn.worldvectorlogo.com/logos/diners-club-international-2.svg"
          alt="Diners Club"
          style={{width: '100%'}}/>
        );
        // If the cardbrand was Discover
      } else if (cardBrand === 'discover') {
        return (
          <img 
          src ="https://brandeps.com/logo-download/D/Discover-Card-logo-vector-01.svg"
          alt="Discover"
          style={backgroundStyling}/>
        );
        // If the cardbrand was JCB
      } else if (cardBrand === 'jcb') {
        return (
          <img 
          src ="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/1200px-JCB_logo.svg.png"
          alt="JCB"
          style={{height: '80%', width: '80%'}}/>
        );
        // If the cardbrand was Mastercard
      } else if (cardBrand === 'mastercard') {
        return (
          <img 
          src ="https://static.dezeen.com/uploads/2016/07/mastercard-logo-redesign-pentagram-square_dezeen_936_0.jpg"
          alt="Mastercard"
          style={{width: '90%'}}/>
        );
        // If the cardbrand was Visa
      } else if (cardBrand === 'visa') {
        return (
          <img 
          src ="https://lavca.org/wp-content/uploads/2019/07/VISA-logo-square.png"
          alt="Visa"
          style={{width: '100%', backgroundColor: '#fff'}}/>
        );
        // If the cardbrand was UnionPay
      } else if (cardBrand === 'unionpay') {
        return (
          <img 
          src ="https://www.logolynx.com/images/logolynx/bf/bf02dfe1aff8179c8902f04a4c227a82.png"
          alt="UnionPay"
          style={{width: '150%'}}/>
        );
      };
    };

    return (
      <>
        {/* Card is imported from Material UI */}
        <Card className={classes.root}>
        <CardHeader
          className={classes.header}
          // Clicking anywhere on the card will activate the dropdown function
          onClick={handleExpandClick}
          // Avatar is decided based off card brand
          avatar={
            <Avatar className={cardBrand === 'visa' ? classes.avatarVisa : cardBrand ===  'jcb' ? classes.avatarJCB : classes.avatar}>
              {brandImage()}
            </Avatar>
          }
          action={
            <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          // Title is based off the name of the card holder
          title={cardHolderName}
          // Last four digits are shown here
          subheader={lastFourDigitsOfCard}
        />
        <CardContent className={classes.expirationDate} onClick={handleExpandClick}>
          {/* Default status will show if the payment method is the default payment method */}
          {defaultCard && <div className="default-payment-indicator">Default </div>}
          {/* Based on whether or not the month of the expiration date is one digit or two */}
          <Typography variant="body2" color="textSecondary" component="p">
            {expirationDate.length === 6 ? `Expires: 0${expirationDate}` : `Expires: ${expirationDate}`}
          </Typography>
        </CardContent>
        {/* In the dropdown, the content will be the billing address and the buttons to change default status, edit payment method information, or delete payment method */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className={classes.collapsedContent}>
            <Typography paragraph>Billing Address:</Typography>
            <Typography paragraph>
              {/* Function that will capitalize name */}
              {billingName()} <br/>
              {/* Function that will capitalize address */}
              {billingAddress()} <br/>
              {/* Contains both city, state, and zipcode */}
              {billingAddressTwo} <br/>
              {/* The country */}
              {billingAddressCountry}
            </Typography>
            <div className="update-buttons">
              {/* Button will be different based on whether or not the payment method is default or not. If it is default, then the remove default button will show, but if it isn't default, then the add default button will appear instead */}
              {defaultCard ? 
              <Button variant="primary" onClick={handleEditPaymentDefaultStatus}>Remove Default</Button> : 
              <Button variant="primary" onClick={handleEditPaymentDefaultStatus}>Make Default</Button> }
              {/* Buttons to open the edit modal or the delete modal */}
              <Button variant="primary" onClick={openEditModal}>Edit</Button>
              <Button variant="danger"  onClick={openDeleteModal}>Delete</Button>
            </div>
          </CardContent>
        </Collapse>
      </Card>
      {/* Modal that is used to edit the payment method card information section */}
      <Modal
        id="profile-edit-payment-modal"
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        style={customStyles}
        contentLabel="Edit Card Information Modal"
        >
        <form id="profile-payment-form" classes={classes.root} noValidate autoComplete="off">
        <h2>Edit Payment</h2>

        {/* Input regarding the full name of the editing payment method modal */}
        {/* <input 
        value={editCardHolderInput.cardName || ""} 
        name="cardName"
        type="text"
        placeholder="Card Name"
        onChange={handleEditCardHolderNameChange}/> */}
        {/* Appears when the input for full name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
        {/* {(/^[a-z ,.'-]+$/i.test(editCardHolderInput.cardName) !== true 
        && editCardHolderInput.cardName !== "") 
        && <div className="warning">You must enter only letters as your name</div>} */}
        <div id="edit-cardholder-name-container">
          <TextField
          label="Name on card"
          className="filled-margin-none"
          placeholder="Enter cardholder's name"
          variant="filled"
          required
          fullWidth
          value={editCardHolderInput.cardName || ""} 
          name="cardName"
          onChange={handleEditCardHolderNameChange}
          onFocus={() => setOnCardholderBlur(false)}
          onBlur={() => {
              if(cardHolderNameInputError2(editCardHolderInput)) setOnCardholderBlur(true)
          }}
          error={cardHolderNameInputError(editCardHolderInput) || onCardholderBlur}
          helperText={(onCardholderBlur && "Required field") || (cardHolderNameInputError(editCardHolderInput) && "Only letters and ', . ' -' are allowed")}
          />
        </div>


        {/* Input regarding the expiration month of the editing payment method modal */}
        {/* <input 
        value={editCardHolderInput.cardMonthExpDate || ''} 
        name="cardMonthExpDate" 
        placeholder="Month" 
        maxLength="2" 
        min="1"
        max="12"
        type="text"
        onChange={handleEditCardHolderNameChange}/> */}
        {/* Appears when the input for the expiration month does not meet requirements like being above 12 and below 1, or if the input is left blank */}
        {/* {((editCardHolderInput.cardMonthExpDate > 12 
        || editCardHolderInput.cardMonthExpDate < 0) 
        || /^[0-9]+$/.test(editCardHolderInput.cardMonthExpDate) !== true
        && editCardHolderInput.cardMonthExpDate !== "")
        && <div className="warning">You must enter a valid month</div>} */}
        <div id="profile-payment-exp-date-container">
          <div id="profile-payment-month">
            <TextField
            label="Exp. Month"
            className="filled-margin-none"
            placeholder="MM"
            fullWidth
            variant="filled"
            required
            inputProps={{
                type: "number",
                maxLength: 2
            }}
            value={editCardHolderInput.cardMonthExpDate || ""}
            name="cardMonthExpDate"
            onInput={handleMaxExpOrZipcodeLength}
            onKeyDown={handleNonNumericExpirationOrZipcode}
            onChange={handleEditCardHolderNameChange} 
            onFocus={() => setOnMonthBlur(false)}
            onBlur={() => {
                if(cardMonthExpDateInputError(editCardHolderInput) || cardMonthExpDateLengthInputError(editCardHolderInput)) setOnMonthBlur(true)
            }}
            error={invalidCardMonthExpDateInput(editCardHolderInput) || expInvalidInput2(editCardHolderInput) || onMonthBlur}
            helperText={(onMonthBlur && "Required field") ||  (invalidCardMonthExpDateInput(editCardHolderInput) && "Invalid Month")}
            />
          </div>            

        {/* Input regarding the expiration year of the editing payment method modal */}
        {/* <input 
        value={editCardHolderInput.cardYearExpDate || ""} 
        name="cardYearExpDate"
        maxLength="4"
        min={new Date().getFullYear()}
        max={new Date().getFullYear() + 10}
        type="text"
        placeholder="Year" 
        onChange={handleEditCardHolderNameChange}/> */}
        {/* Appears when the input for the expiration year does not meet requirements like being before this current year, being above over then ten years from the current year, or if the input is left blank */}
        {/* {((
        editCardHolderInput.cardYearExpDate > new Date().getFullYear() + 10 
        || editCardHolderInput.cardYearExpDate < new Date().getFullYear()) 
        || /^[0-9]+$/.test(editCardHolderInput.cardYearExpDate) !== true
        && editCardHolderInput.cardYearExpDate !== "") 
        && <div className="warning">You must enter a valid year</div>} */}
          <div id="profile-payment-year">
            <TextField
            label="Exp. Year"
            className="filled-margin-none"
            placeholder="YYYY"
            variant="filled"
            fullWidth
            required
            value={editCardHolderInput.cardYearExpDate || ""}
            name="cardYearExpDate"
            inputProps={{
                type: "number",
                maxLength: 4
            }}
            onInput={handleMaxExpOrZipcodeLength}
            onKeyDown={handleNonNumericExpirationOrZipcode}
            onChange={handleEditCardHolderNameChange}
            onFocus={() => setOnYearBlur(false)}
            onBlur={() => {
                if(cardYearExpDateInputError(editCardHolderInput) || cardYearExpDateLengthInputError(editCardHolderInput)) setOnYearBlur(true)
            }} 
            error={invalidCardYearExpInput(editCardHolderInput) || onYearBlur || expInvalidInput2(editCardHolderInput)}
            helperText={(onYearBlur && "Required field") ||  ((invalidCardYearExpInput(editCardHolderInput) || invalidCardYearUpdate) && "Invalid Year")}
            />
          </div>

          {expInvalidInput2(editCardHolderInput) && <FormHelperText>Expiration date is invalid</FormHelperText>}
        </div>

        {/* Appears when the inputs for the expiration date are of the past */}
        {/* {invalidExpirationDate 
        && <div className="warning">You must enter a valid expiration date</div>} */}

        {/* Button to go onto the next modal where users will edit the billing address */}
          <div id="profile-payment-edit-button-div">
            <Button onClick={openEditModalTwo} 
            style={{marginTop: "1rem"}}
            variant="dark"
            size="lg"
            // Button will be disabled if the input fields are not filled in (except for the address line two input field)
            disabled={
              (/^[a-z ,.'-]+$/i.test(editCardHolderInput.cardName) !== true 
              || editCardHolderInput.cardName === "") 
              || ((editCardHolderInput.cardMonthExpDate > 12 
              || editCardHolderInput.cardMonthExpDate < 1)
              || editCardHolderInput.cardMonthExpDate === "") 
              || editCardHolderInput.cardMonthExpDate === undefined
              || editCardHolderInput.cardMonthExpDate.length !== 2
              || /^[0-9]+$/.test(editCardHolderInput.cardMonthExpDate) !== true
              // || (editCardHolderInput.cardYearExpDate > new Date().getFullYear() + 10 
              || editCardHolderInput.cardYearExpDate < new Date().getFullYear() 
              || editCardHolderInput.cardYearExpDate === ""
              || editCardHolderInput.cardYearExpDate === undefined
              || /^[0-9]+$/.test(editCardHolderInput.cardYearExpDate) !== true
              || editCardHolderInput.cardYearExpDate.length !== 4
              ||  (editCardHolderInput.cardYearExpDate === new Date().getFullYear().toString() && (Number(editCardHolderInput.cardMonthExpDate) < new Date().getMonth() + 1) )
            }>
                Next
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal that is used to edit the payment method billing address section*/}
      <Modal
        id="profile-payment-modal"
        shouldCloseOnOverlayClick={overlayClickCloseEditPaymentModal}
        isOpen={editModalTwoIsOpen}
        onRequestClose={closeEditModalTwo}
        style={customStyles}
        contentLabel="Edit Payment Modal"
        >
        <form id="profile-payment-form" classes={classes.root} noValidate autoComplete="off">
        <h2>Edit Payment</h2>

        {/* Input regarding the first name of the editing payment method billing address modal */}
        {/* <input 
        value={editBillingInput.editBillingFirstName || ""} 
        name="editBillingFirstName" 
        placeholder="First Name" 
        type="text"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for first name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
        {/* {(/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingFirstName) !== true 
        && editBillingInput.editBillingFirstName !== "") 
        && <div className="warning">You must enter only letters as your first name</div>} */}
        <div id="profile-payment-names-container">
          <div id="profile-payment-firstName">
            <TextField
            label="First Name"
            className="filled-margin-none"
            placeholder="Enter First Name"
            className={classes.textField}
            variant="filled"
            required
            fullWidth
            error={profileFirstNameInputError(editBillingInput) || onFirstNameBlurEvent}
            onFocus={() => setOnFirstNameBlurEvent(false)}
            onBlur={() => {
                if(profileFirstNameInputError2(editBillingInput)) setOnFirstNameBlurEvent(true)
            }}
            helperText={(onFirstNameBlurEvent &&  "Required field") ||(profileFirstNameInputError(editBillingInput) && "Only letters and ', . ' -' are allowed") || ""}
            value={editBillingInput.editBillingFirstName || ""} 
            name="editBillingFirstName" 
            onChange={handleEditBillingChange}
            />
          </div>

        {/* Input regarding the last name of the editing payment method billing address modal */}
        {/* <input 
        value={editBillingInput.editBillingLastName || ""} 
        name="editBillingLastName" 
        placeholder="Last Name" 
        type="text"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for last name has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
        {/* {(/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingLastName) !== true 
        && editBillingInput.editBillingLastName !== "") 
        && <div className="warning">You must enter only letters as your last name</div>} */}
          <div id="profile-payment-lastName">
            <TextField
            label="Last Name"
            className="filled-margin-none"
            placeholder="Enter Last Name"
            variant="filled"
            className={classes.textField}
            required
            fullWidth
            onFocus={() => setOnLastNameBlurEvent(false)}
            onBlur={() => {
                if(profileLastNameInputError2(editBillingInput)) setOnLastNameBlurEvent(true)
            }}
            error={profileLastNameInputError(editBillingInput) || onLastNameBlurEvent} 
            helperText={(onLastNameBlurEvent &&  "Required field")  ||(profileLastNameInputError(editBillingInput) && "Only letters and ', . ' -' are allowed") || ""}
            value={ editBillingInput.editBillingLastName || ""} 
            name="editBillingLastName"
            onChange={handleEditBillingChange}
            />
          </div>
        </div>

        {/* Input regarding the first address line of the editing payment method billing address modal */}
        {/* <input 
        value={editBillingInput.editBillingFirstAddressLine || ""} name="editBillingFirstAddressLine" 
        placeholder="Address Line One" 
        type="text"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for first address line has no input */}
        {/* {editBillingInput.editBillingFirstAddressLine === "" 
        && <div className="warning">You must enter an address</div>} */}
        <div id="profile-payment-line1">
          <TextField
          label="Address Line One"
          className="filled-margin-none"
          placeholder="Enter Address"
          variant="filled"
          fullWidth
          className={classes.textField}
          required
          onFocus={() => setOnLine1BlurEvent(false)}
          onBlur={() => {
              if(profileAddressLineOneInputError(editBillingInput)) setOnLine1BlurEvent(true)
          }}
          error={onLine1BlurEvent}
          helperText={onLine1BlurEvent && "Required field"}
          value={ editBillingInput.editBillingFirstAddressLine || ""} 
          name="editBillingFirstAddressLine"
          onChange={handleEditBillingChange}
          />
        </div>

        {/* Input regarding the second address line of the editing payment method billing address modal */}
        {/* <input 
        value={editBillingInput.editBillingSecondAddressLine || ""} name="editBillingSecondAddressLine" 
        placeholder="Address Line Two" 
        type="text"
        onChange={handleEditBillingChange}/> */}
        <div id="profile-payment-line2">
          <TextField
          label="Address Line Two"
          className="filled-margin-none"
          placeholder="Apartment, Floor, Suite"
          variant="filled"
          fullWidth
          className={classes.textField}
          value={ editBillingInput.editBillingSecondAddressLine  || ""}
          name="editBillingSecondAddressLine"
          onChange={handleEditBillingChange}
          />
        </div>


        {/* Input regarding the city of the editing payment method billing address modal */}
        {/* <input 
        value={editBillingInput.editBillingCity || ""} 
        name="editBillingCity" 
        placeholder="City" 
        type="text"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for city has anything other than letters and certain characters like apostrophes, commas, periods and hyphens */}
        {/* {(/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingCity) !== true 
        && editBillingInput.editBillingCity !== "") 
        && <div className="warning">You must enter only letters as your city</div>} */}
        <div id="profile-payment-city">
          <TextField
          label="City"
          fullWidth
          className="filled-margin-none"
          placeholder="Enter City"
          variant="filled"
          className={classes.textField}
          required
          onFocus={() => setOnCityBlurEvent(false)}
          onBlur={() => {
              if(profileCityInputError2(editBillingInput)) setOnCityBlurEvent(true)
          }}
          error={profileCityInputError(editBillingInput) || onCityBlurEvent}
          helperText={(onCityBlurEvent && "Required field") ||  (profileCityInputError(editBillingInput) && "Only letters and ', . ' -' are allowed") || ""}
          value={ editBillingInput.editBillingCity|| ""} 
          name="editBillingCity"
          onChange={handleEditBillingChange}
          />
        </div>

        {/* Input regarding the state of the editing payment method billing address modal */}  
        {/* <input 
        value={editBillingInput.editBillingState || ""} 
        name="editBillingState" 
        placeholder="State" 
        type="text"
        maxLength="2"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for state has anything other than letters */}
        {/* {(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingState) !== true 
        && editBillingInput.editBillingState !== "") 
        && <div className="warning">You must enter only letters as your state</div>} */}
        <div className="profile-payment-state-zipcode">
          <div id="profile-payment-state">
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel htmlFor="filled-age-native-simple">State</InputLabel>    
              <Select
              label="State"
              labelId="demo-simple-select-filled-label"
              fullWidth
              id="demo-simple-select-filled"
              value={ editBillingInput.editBillingState || "Select"} 
              onFocus={() => setOnStateBlurEvent(false)}
              onBlur={() => {
                  if(profileStateInputError(editBillingInput)) setOnStateBlurEvent(true)
              }}
              onChange={handleBillingStateChange}
              >
              <MenuItem disabled value="Select">Select</MenuItem>
              {usStates.map((state) => { return (
                <MenuItem key={state.abbreviation} value={state.name}>{state.name}</MenuItem>
              )})}
              </Select>

              {onStateBlurEvent && <FormHelperText>Required state field</FormHelperText>}
            </FormControl>
          </div>

        {/* Input regarding the zipcode of the editing payment method billing address modal */}  
        {/* <input 
        value={editBillingInput.editBillingZipcode || ""} 
        name="editBillingZipcode" 
        placeholder="Zipcode" 
        type="text"
        maxLength="5"
        pattern="\d*"
        onChange={handleEditBillingChange}/> */}
        {/* Appears when the input for zipcode has anything other than numbers */}
        {/* {(/^[0-9]+$/.test(editBillingInput.editBillingZipcode) !== true 
        && editBillingInput.editBillingZipcode !== "") 
        && <div className="warning">You must enter only numbers as your zip code</div>} */}
          <div id="profile-payment-zipcode">
            <TextField
            label="Zipcode"
            className="filled-margin-none"
            placeholder="Enter zipcode"
            variant="filled"
            fullWidth
            className={classes.textField}
            inputProps={{
                type: "number",
                maxLength: 5
            }}
            required
            onInput={handleMaxExpOrZipcodeLength}
            onKeyDown={handleNonNumericExpirationOrZipcode}
            onFocus={() => setOnPostalCodeBlurEvent(false)}
            onBlur={() => {
                if(profileZipcodeInputError3(editBillingInput) || profileZipcodeInputError2(editBillingInput)) setOnPostalCodeBlurEvent(true)
            }}
            error={profileZipcodeInputError(editBillingInput) || onPostalCodeBlurEvent}
            helperText={(onPostalCodeBlurEvent && "Required field") || (profileZipcodeInputError(editBillingInput) && "You must enter only numbers for your zip code") || ""}
            value={ editBillingInput.editBillingZipcode || ""} 
            name="editBillingZipcode"
            onChange={handleEditBillingChange}
            />
          </div>
        </div>

        {/* Button will be disabled if the input fields are not filled in (except for the address line two input field) */}
          <div id="profile-payment-edit-buttons-container">
            <Button 
            id="profile-payment-edit-back-button"
            size="lg"
            variant="dark"
            style={{marginTop: '1rem'}}
            onClick={() => {
              setEditModalIsOpen(true)
              setEditModalTwoIsOpen(false)
            }}>
              Back
            </Button>

            <Button 
            form="form"
            id="profile-payment-edit-submit-button"
            size="lg"
            variant="dark"
            style={{marginTop: '1rem'}}
            onClick={handleEditPaymentSubmit}
            disabled={(/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingFirstName) !== true 
            || editBillingInput.editBillingFirstName === "") 
            || (/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingLastName) !== true 
            || editBillingInput.editBillingLastName === "") 
            || editBillingInput.editBillingFirstAddressLine === "" 
            || (/^[a-z ,.'-]+$/i.test(editBillingInput.editBillingCity) !== true 
            || editBillingInput.editBillingCity === "") 
            || editBillingInput.editBillingState === "Select"
            // || (/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingState) !== true 
            // || editBillingInput.editBillingState === ""
            // || editBillingInput.editBillingState === undefined
            // || editBillingInput.editBillingState.length !== 2) 
            || (/^[0-9]+$/.test(editBillingInput.editBillingZipcode) !== true 
            || editBillingInput.editBillingZipcode === ""
            || editBillingInput.editBillingZipcode === undefined
            || editBillingInput.editBillingZipcode.length !== 5)
            || disabledOnSubmitEditPaymentModal}>
                Submit
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal used to delete the address */}
      <Modal
      shouldCloseOnOverlayClick={overlayClickCloseDeletePaymentModal}
      isOpen={deletePaymentModalIsOpen}
      onRequestClose={closeDeleteModal}
      style={customStyles}
      contentLabel="Delete Your Payment"
      >
        <form className="form" id="delete-payment-form">
          <div style={{'marginBottom':'1rem'}}>Are you sure you want to delete this payment?</div>
          <div className="submit-default-button-container">
          <button id={payment._id} 
          type="submit"
          form="delete-address-form"
          value="Submit"
          // When user clicks to submit, the payment method will be deleted
          onClick={handleDeletePayment}
          disabled={disabledOnSubmitDeletePaymentModal}
          >Delete</button>
          <button 
          onClick={closeDeleteModal}
          disabled={disabledOnSubmitDeletePaymentModal}
          >Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PaymentContainer