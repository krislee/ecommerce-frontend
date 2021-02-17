import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../styles/UserProfile/PaymentContainer.css'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

function PaymentContainer ({ backend, index, payment, defaultFirstPayment, grabPaymentData, capitalize, capitalizeArray, loggedIn }) {

    const [expanded, setExpanded] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [editModalTwoIsOpen, setEditModalTwoIsOpen] = useState(false);
    const [editCardHolderInput, setEditCardHolderInput] = useState({});
    const [editBillingInput, setEditBillingInput] = useState({});
    const [invalidExpirationDate, setInvalidExpirationDate] = useState(false);
    const [editZipcodeWarning, setEditZipcodeWarning] = useState(false);
    const [editStateAbbreviationWarning, setEditStateAbbreviationWarning] = useState(false);
    const [deletePaymentModalIsOpen, setDeletePaymentModalIsOpen] = useState(false);

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

    const openEditModal = async (e) => {
      e.preventDefault();
      const onePaymentResponse = await fetch(`${backend}/order/show/payment/${cardID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': loggedIn()
        }
      });
      const paymentData = await onePaymentResponse.json();
      const capitalizedName = [];
      const name = capitalizeArray(paymentData.cardholderName.split(" "), capitalizedName);
      const expDate = paymentData.expDate;
      const expDateSplit = expDate.split('/')
      const expDateMonthConversion = () => {
        if (expDateSplit[0].length === 1){
          return `0${expDateSplit[0]}`
        } else {
          return expDateSplit[0]
        }
      }
      setEditCardHolderInput({
        cardName: `${name}`,
        cardMonthExpDate: expDateMonthConversion(),
        cardYearExpDate: expDateSplit[1]
      })
      const billingDetails = paymentData.billingDetails
      const billingDetailsAddress = billingDetails.address
      const billingDetailsName = billingDetails.name.replace (/,/g, "");
      const firstName = capitalize(billingDetailsName.split(" ")[0]);
      const lastName = capitalize(billingDetailsName.split(" ")[1]);
      const capitalizedFirstAddressLine = [];
      const firstAddressLine = capitalizeArray(billingDetailsAddress.line1.split(" "), capitalizedFirstAddressLine);
      const secondAddressLineCheck = () => {
        if (billingDetailsAddress.line2 === 'undefined' || billingDetailsAddress.line2 === null) {
          return '';
        } else {
          const capitalizedSecondAddressLine = [];
          const secondAddressLine = capitalizeArray(billingDetailsAddress.line2.split(" "), capitalizedSecondAddressLine)
          return secondAddressLine;
        }
      }
      const capitalizedCity = [];
      const city = capitalizeArray(billingDetailsAddress.city.split(" "), capitalizedCity);
      const state = billingDetailsAddress.state;
      const zipcode = billingDetailsAddress.postalCode;
      setEditBillingInput({
        editBillingFirstName: `${firstName}`,
        editBillingLastName: `${lastName}`,
        editBillingFirstAddressLine: `${firstAddressLine}`,
        editBillingSecondAddressLine: secondAddressLineCheck(),
        editBillingCity: `${city}`,
        editBillingState: `${state}`,
        editBillingZipcode: `${zipcode}`,

      })
      setEditModalIsOpen(true);
    }

    const handleEditPaymentSubmit = async (e) => {
      e.preventDefault();
      if (editBillingInput.editBillingZipcode.length !== 5) {
        setEditZipcodeWarning(true);
        setEditStateAbbreviationWarning(false);
      } else if (editBillingInput.editBillingState.length !== 2) {
        setEditStateAbbreviationWarning(true);
        setEditZipcodeWarning(false);
      } else {
        setEditZipcodeWarning(false);
        setEditStateAbbreviationWarning(false);
        const editPaymentResponse = await fetch(`${backend}/order/update/payment/${cardID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          },
          body: JSON.stringify({
            billingDetails: {
              line1: editBillingInput.editBillingFirstAddressLine,
              line2: editBillingInput.editBillingSecondAddressLine,
              city: editBillingInput.editBillingCity,
              state: editBillingInput.editBillingState.toUpperCase(),
              postal_code: editBillingInput.editBillingZipcode,
              country: 'US',
              name: `${editBillingInput.editBillingFirstName} ${editBillingInput.editBillingLastName}`
            },
            name: editCardHolderInput.cardName,
            recollectCVV: false,
            expMonth: editCardHolderInput.cardMonthExpDate,
            expYear: editCardHolderInput.cardYearExpDate
          })
        })
        const editPaymentData = await editPaymentResponse.json();
        defaultFirstPayment(editPaymentData.paymentMethods);
        grabPaymentData(editPaymentData.paymentMethods);
        setEditBillingInput({});
        setEditCardHolderInput({});
        handleExpandClick();
        closeEditModalTwo();
      }
    }

    const handleDeletePayment = async (e) => {
      e.preventDefault();
      if (loggedIn()) {
        const deletePaymentResponse = await fetch(`${backend}/order/payment/${cardID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          }
        })
        const deletePaymentData = await deletePaymentResponse.json();
        defaultFirstPayment(deletePaymentData.paymentMethods);
        grabPaymentData(deletePaymentData.paymentMethods);
        handleExpandClick();
        closeEditModalTwo();
      }
    }

    const handleEditPaymentDefaultStatus = async (e) => {
      e.preventDefault();
      if (defaultCard) {
        const removePaymentDefaultStatusResponse = await fetch(`${backend}/order/default/payment/${cardID}?default=false`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          }
        })
        const removePaymentDefaultStatusData = await removePaymentDefaultStatusResponse.json();
        defaultFirstPayment(removePaymentDefaultStatusData.paymentMethods);
        grabPaymentData(removePaymentDefaultStatusData.paymentMethods);
        handleExpandClick();
      } else {
        const removePaymentDefaultStatusResponse = await fetch(`${backend}/order/default/payment/${cardID}?default=true`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': loggedIn()
          }
        })
        const removePaymentDefaultStatusData = await removePaymentDefaultStatusResponse.json();
        defaultFirstPayment(removePaymentDefaultStatusData.paymentMethods);
        grabPaymentData(removePaymentDefaultStatusData.paymentMethods);
        handleExpandClick();
      }
    }

    const closeEditModal = () => {
      setEditModalIsOpen(false);
    }

    const openEditModalTwo = (e) => {
      e.preventDefault();
      if (Number(editCardHolderInput.cardYearExpDate) === new Date().getFullYear()){
        if (Number(editCardHolderInput.cardMonthExpDate) >= new Date().getMonth() + 1) {
          setEditModalTwoIsOpen(true);
          setInvalidExpirationDate(false);
        } else {
          setInvalidExpirationDate(true);
        }
      } else {
        setEditModalTwoIsOpen(true);
        setInvalidExpirationDate(false);
      }
    }

    const closeEditModalTwo = () => {
      setEditModalTwoIsOpen(false);
      setEditModalIsOpen(false);
    }

    const openDeleteModal = () => {
      setDeletePaymentModalIsOpen(true);
    }

    const closeDeleteModal = () => {
      setDeletePaymentModalIsOpen(false);
    }

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

  const handleEditCardHolderNameChange = (e) => {
    const { name, value } = e.target
    setEditCardHolderInput((prevEditCardHolder) => ({
        ...prevEditCardHolder, [name] : value
    }))
  }

  const handleEditBillingChange = (e) => {
    const { name, value } = e.target
    setEditBillingInput((prevEditBilling) => ({
        ...prevEditBilling, [name] : value
    }))
  }



    const useStyles = makeStyles((theme) => ({
        root: {
          width: '100%',
          backgroundColor: '#e8e8e8'
        },
        header: {
          cursor: 'pointer'
        },
        avatar: {
          backgroundColor: '#e8e8e8',
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
          cursor: 'pointer'
        },
        collapsedContent: {
          borderTop: '1px solid #c8c8c8',
          backgroundColor: '#fff'
        }
      }));

    const classes = useStyles();

    const backgroundStyling = {
      backgroundSize: 'cover',
      height: '100%',
      width: '100%'
    }

    // Regular card information
    const cardHolderNameCapitalized = [];
    const cardHolderName = capitalizeArray(payment.cardholderName.split(" "), cardHolderNameCapitalized);
    const cardBrand = payment.brand
    const expirationDate = payment.expDate;
    const cardID = payment.paymentMethodID;
    const lastFourDigitsOfCard = `Card ending in ${payment.last4}`;
    // Billing information variables
    const billingInfo = payment.billingDetails
    const billingName = () => {
      const billingNameCapitalized = [];
      if (billingInfo.name.includes(',') === true) {
        const billingNameCapitalizedSplit = capitalizeArray(billingInfo.name.split(','), billingNameCapitalized);
        return billingNameCapitalizedSplit;
      } else {
        const billingNameCapitalizedSplit = capitalizeArray(billingInfo.name.split(' '), billingNameCapitalized);
        return billingNameCapitalizedSplit;
      }
    }
    const capitalizedBillingCity = [];
    const billingCity = capitalizeArray(billingInfo.address.city.split(' '), capitalizedBillingCity);
    const billingAddress = () => {
      if (billingInfo.address.line2 === 'undefined' || billingInfo.address.line2 === null) {
        let splitBillingAddressCapitalized = [];
        let splitBillingAddressLineOne = billingInfo.address.line1.split(" ");
        let billingAddressCapitalized = capitalizeArray(splitBillingAddressLineOne, splitBillingAddressCapitalized);
        return billingAddressCapitalized;
      } else {
        let splitBillingAddressLineOne = billingInfo.address.line1.split(" ");
        let splitBillingAddressLineTwo = billingInfo.address.line2.split(" ");
        let splitBillingAddressCapitalizedLineOne = [];
        let splitBillingAddressCapitalizedLineTwo = [];
        let billingAddressCapitalizedLineOne = capitalizeArray(splitBillingAddressLineOne, splitBillingAddressCapitalizedLineOne);
        let billingAddressCapitalizedLineTwo = capitalizeArray(splitBillingAddressLineTwo, splitBillingAddressCapitalizedLineTwo);
        return `${billingAddressCapitalizedLineOne} ${billingAddressCapitalizedLineTwo}`
      }
    }
    const billingAddressTwo = `${billingCity}, ${billingInfo.address.state} ${billingInfo.address.postalCode}`
    const billingAddressCountry = `${billingInfo.address.country}`
    const defaultCard = payment.default;

    const brandImage = () => {
      if (cardBrand === 'amex') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
          alt="American Express"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'cartes_bancaires') {
        return (
          <img src="https://upload.wikimedia.org/wikipedia/fr/7/72/Logo_GIE-CB.jpg"
          alt="Cartes Bancaires"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'diners') {
        return (
          <img 
          src="https://1000logos.net/wp-content/uploads/2020/04/Diners-Club-International-Logo.png"
          alt="Diners Club"
          style={{height: '60%'}}/>
        )
      } else if (cardBrand === 'discover') {
        return (
          <img 
          src ="https://brandeps.com/logo-download/D/Discover-Card-logo-vector-01.svg"
          alt="Discover"
          style={backgroundStyling}/>
        )
      } else if (cardBrand === 'jcb') {
        return (
          <img 
          src ="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/1200px-JCB_logo.svg.png"
          alt="JCB"
          style={{height: '80%', width: '80%'}}/>
        )
      } else if (cardBrand === 'mastercard') {
        return (
          <img 
          src ="https://www.mastercard.com/content/dam/mccom/global/logos/logo-mastercard-mobile.svg"
          alt="Mastercard"
          style={{height: '60%'}}/>
        )
      } else if (cardBrand === 'visa') {
        return (
          <img 
          src ="https://metapay.eu/images/reference/visa.png"
          alt="Visa"
          style={{height: '70%'}}/>
        )
      } else if (cardBrand === 'unionpay') {
        return (
          <img 
          src ="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UnionPay_logo.svg/1200px-UnionPay_logo.svg.png"
          alt="UnionPay"
          style={{height: '50%'}}/>
        )
      }
    }

    return (
      <>
        <Card className={classes.root}>
        <CardHeader
          className={classes.header}
          onClick={handleExpandClick}
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
          title={cardHolderName}
          subheader={lastFourDigitsOfCard}
        />
        <CardContent className={classes.expirationDate} onClick={handleExpandClick}>
          {defaultCard && <div className="default-payment-indicator">Default </div>}
          <Typography variant="body2" color="textSecondary" component="p">
            {expirationDate.length === 6 ? `Expires: 0${expirationDate}` : `Expires: ${expirationDate}`}
          </Typography>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className={classes.collapsedContent}>
            <Typography paragraph>Billing Address:</Typography>
            <Typography paragraph>
              {billingName()} <br/>
              {billingAddress()} <br/>
              {billingAddressTwo} <br/>
              {billingAddressCountry}
            </Typography>
            <div className="update-buttons">
              {defaultCard ? 
              <Button variant="contained" onClick={handleEditPaymentDefaultStatus}>Remove Default</Button> : 
              <Button variant="contained" onClick={handleEditPaymentDefaultStatus}>Make Default</Button> }
              <Button variant="contained" onClick={openEditModal}>Edit</Button>
              <Button variant="contained" color="secondary" onClick={openDeleteModal}>Delete</Button>
            </div>
          </CardContent>
        </Collapse>
      </Card>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        style={customStyles}
        contentLabel="Edit Card Information Modal"
        >
        <form className="form">
        <h2>Edit Your Card Information</h2>
        <input 
        value={editCardHolderInput.cardName || ""} 
        name="cardName"
        type="text"
        placeholder="Card Name"
        onChange={handleEditCardHolderNameChange}/>
        {(/^[a-z][a-z\s]*$/i.test(editCardHolderInput.cardName) !== true 
        && editCardHolderInput.cardName !== "") 
        && <div className="warning">You must enter only letters as your name</div>}
        <input 
        value={editCardHolderInput.cardMonthExpDate || ''} 
        name="cardMonthExpDate" 
        placeholder="Month" 
        maxLength="2" 
        min="1"
        max="12"
        type="number"
        onChange={handleEditCardHolderNameChange}/>
        {((editCardHolderInput.cardMonthExpDate > 12 
        || editCardHolderInput.cardMonthExpDate < 1) 
        && editCardHolderInput.cardMonthExpDate !== "") 
        && <div className="warning">You must enter a valid month</div>}
        <input 
        value={editCardHolderInput.cardYearExpDate || ""} 
        name="cardYearExpDate"
        maxLength="4"
        min={new Date().getFullYear()}
        max={new Date().getFullYear() + 10}
        type="number"
        placeholder="Year" 
        onChange={handleEditCardHolderNameChange}/>
        {((editCardHolderInput.cardYearExpDate > new Date().getFullYear() + 10 
        || editCardHolderInput.cardYearExpDate < new Date().getFullYear())
        && editCardHolderInput.cardYearExpDate !== "") 
        && <div className="warning">You must enter a valid year</div>}
        {invalidExpirationDate 
        && <div className="warning">You must enter a valid expiration date</div>}
        <button onClick={openEditModalTwo} 
        style={{marginTop: "1rem"}}
        disabled={
          (/^[a-z][a-z\s]*$/i.test(editCardHolderInput.cardName) !== true 
          || editCardHolderInput.cardName === "") 
          || ((editCardHolderInput.cardMonthExpDate > 12 
          || editCardHolderInput.cardMonthExpDate < 1)
          && editCardHolderInput.cardMonthExpDate === "") 
          || (editCardHolderInput.cardYearExpDate > new Date().getFullYear() + 10 
          || editCardHolderInput.cardYearExpDate < new Date().getFullYear() 
          || editCardHolderInput.cardYearExpDate === "")
        }>
            Next
        </button>
        </form>
      </Modal>
      <Modal
        isOpen={editModalTwoIsOpen}
        onRequestClose={closeEditModalTwo}
        style={customStyles}
        contentLabel="Edit Payment Modal"
        >
        <form className="form">
        <h2>Edit Your Card Information</h2>
        <input 
        value={editBillingInput.editBillingFirstName || ""} 
        name="editBillingFirstName" 
        placeholder="First Name" 
        type="text"
        onChange={handleEditBillingChange}/>
        {(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingFirstName) !== true 
        && editBillingInput.editBillingFirstName !== "") 
        && <div className="warning">You must enter only letters as your first name</div>}
        <input 
        value={editBillingInput.editBillingLastName || ""} 
        name="editBillingLastName" 
        placeholder="Last Name" 
        type="text"
        onChange={handleEditBillingChange}/>
        {(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingLastName) !== true 
        && editBillingInput.editBillingLastName !== "") 
        && <div className="warning">You must enter only letters as your last name</div>}
        <input 
        value={editBillingInput.editBillingFirstAddressLine || ""} name="editBillingFirstAddressLine" 
        placeholder="Address Line One" 
        type="text"
        onChange={handleEditBillingChange}/>
        {editBillingInput.editBillingFirstAddressLine === "" 
        && <div className="warning">You must enter an address</div>}
        <input 
        value={editBillingInput.editBillingSecondAddressLine || ""} name="editBillingSecondAddressLine" 
        placeholder="Address Line Two" 
        type="text"
        onChange={handleEditBillingChange}/>
        <input 
        value={editBillingInput.editBillingCity || ""} 
        name="editBillingCity" 
        placeholder="City" 
        type="text"
        onChange={handleEditBillingChange}/>
        {(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingCity) !== true 
        && editBillingInput.editBillingCity !== "") 
        && <div className="warning">You must enter only letters as your city</div>}
        <input 
        value={editBillingInput.editBillingState || ""} 
        name="editBillingState" 
        placeholder="State" 
        type="text"
        onChange={handleEditBillingChange}/>
        {(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingState) !== true 
        && editBillingInput.editBillingState !== "") 
        && <div className="warning">You must enter only letters as your state</div>}
        <input 
        value={editBillingInput.editBillingZipcode || ""} 
        name="editBillingZipcode" 
        placeholder="Zipcode" 
        type="text"
        pattern="\d*"
        onChange={handleEditBillingChange}/>
        {(/[a-zA-Z]/g.test(editBillingInput.editBillingZipcode) === true 
        && editBillingInput.editBillingZipcode !== "") 
        && <div className="warning">You must enter only numbers as your zip code</div>}
        {editZipcodeWarning 
        && <div className="warning">You must enter five digits as your zip code</div>}
        {editStateAbbreviationWarning 
        && <div className="warning">Please enter your state as an abbreviation (ex. CA, NY)</div>}
        <button 
        style={{marginTop: '1rem'}}
        onClick={handleEditPaymentSubmit} 
        disabled={(/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingFirstName) !== true 
        || editBillingInput.editBillingFirstName === "") 
        || (/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingLastName) !== true 
        || editBillingInput.editBillingLastName === "") 
        || editBillingInput.editBillingFirstAddressLine === "" 
        || (/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingCity) !== true 
        || editBillingInput.editBillingCity === "") 
        || (/^[a-z][a-z\s]*$/i.test(editBillingInput.editBillingState) !== true 
        || editBillingInput.editBillingState === "") 
        || (/[a-zA-Z]/g.test(editBillingInput.editBillingZipcode) === true 
        || editBillingInput.editBillingZipcode === "")}>
            Submit
        </button>
        </form>
      </Modal>
      <Modal
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
          onClick={handleDeletePayment}>Delete</button>
          <button onClick={closeDeleteModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );

}

export default PaymentContainer