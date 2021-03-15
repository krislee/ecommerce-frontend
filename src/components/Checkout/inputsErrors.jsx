
const firstNameInputError = (input) =>  input.firstName !== undefined && input.firstName !== "" && /^[a-z ,.'-]+$/i.test(input.firstName) !== true 

const firstNameInputError2 = (input) => input.firstName === undefined || input.firstName === ""

const profileFirstNameInputError = (input) =>  input.editBillingFirstName !== undefined && input.editBillingFirstName !== "" && /^[a-z ,.'-]+$/i.test(input.editBillingFirstName) !== true 

const profileFirstNameInputError2 = (input) => input.editBillingFirstName === undefined || input.editBillingFirstName === ""




const lastNameInputError = (input) => input.lastName !== undefined && input.lastName !== "" && /^[a-z ,.'-]+$/i.test(input.lastName) !== true 

const lastNameInputError2 = (input) => input.lastName === undefined || input.lastName === ""

const profileLastNameInputError = (input) => input.editBillingLastName !== undefined && input.editBillingLastName !== "" && /^[a-z ,.'-]+$/i.test(input.editBillingLastName) !== true 

const profileLastNameInputError2 = (input) => input.editBillingLastName === undefined || input.editBillingLastName === ""




const line1InputError = (input) => input.line1 === undefined || input.line1 === ""

const addressLineOneInputError = (input) => input.addressLineOne === undefined || input.addressLineOne === ""

const lineOneInputError = (input) => input.lineOne === undefined || input.lineOne === ""

const profileAddressLineOneInputError = (input) => input.editBillingFirstAddressLine === undefined || input.editBillingFirstAddressLine === ""




const cityInputError = (input) => input.city !== undefined && input.city !== ""  &&  /^[a-z ,.'-]+$/i.test(input.city) !== true 

const cityInputError2 = (input) => input.city === undefined || input.city === ""

const profileCityInputError = (input) => input.editBillingCity !== undefined && input.editBillingCity !== ""  &&  /^[a-z ,.'-]+$/i.test(input.editBillingCity) !== true 

const profileCityInputError2 = (input) => input.editBillingCity === undefined || input.editBillingCity === ""




const stateInputError = (input) =>  input.state === "Select"

const stateInputError2 = (input) => input.state === undefined || input.state === ""

const profileStateInputError = (input) =>  input.editBillingState === "Select"

const profileStateInputError2 = (input) => input.editBillingState === undefined || input.editBillingState === ""





const postalCodeInputError = (input) => input.postalCode !== undefined && input.postalCode !== ""  && /^[0-9]+$/.test(input.postalCode) !== true 

const postalCodeInputError2 = (input) => input.postalCode !== undefined && input.postalCode !== "" && input.postalCode.length !== 5

const postalCodeInputError3 = (input) => input.postalCode === undefined || input.postalCode === ""

const zipcodeInputError = (input) => input.zipcode !== undefined && input.zipcode !== ""  && /^[0-9]+$/.test(input.zipcode) !== true 

const zipcodeInputError2 = (input) => input.zipcode !== undefined && input.zipcode !== "" && input.zipcode.length !== 5

const zipcodeInputError3 = (input) => input.zipcode === undefined || input.zipcode === ""

const profileZipcodeInputError = (input) => input.editBillingZipcode !== undefined && input.editBillingZipcode !== ""  && /^[0-9]+$/.test(input.editBillingZipcode) !== true 

const profileZipcodeInputError2 = (input) => input.editBillingZipcode !== undefined && input.editBillingZipcode !== "" && input.editBillingZipcode.length !== 5

const profileZipcodeInputError3 = (input) => input.editBillingZipcode === undefined || input.editBillingZipcode === ""
          



const phoneInputError = (input) => input.phone !== undefined && input.phone !== "" && /^[0-9]+$/.test(input.phone) !== true 
   
const phoneInputError2 = (input) => input.phone !== undefined && input.phone !== "" && input.phone.replace(/\D/g,'').toString().length !== 10

const phoneInputError3 = (input) => input && (input.phone === undefined || input.phone === "") 


const cardholderNameInputError = (input) => input !== undefined && input !== "" && /^[a-z ,.'-]+$/i.test(input) !== true 
const cardholderNameInputError2 = (input) => input === undefined || input === ""

const cardHolderNameInputError = (input) => input.cardName !== undefined && input.cardName !== "" && /^[a-z ,.'-]+$/i.test(input.cardName) !== true 
const cardHolderNameInputError2 = (input) => input.cardName === undefined || input.cardName === ""

const invalidMonthInput = (input) => input.month !== undefined && input.month !== "" && (/^\d+$/g.test(input.month) !== true || Number(input.month) > 12)

const invalidCardMonthExpDateInput = (input) => {
    return input.cardMonthExpDate !== undefined && input.cardMonthExpDate !== "" && (/^\d+$/g.test(input.cardMonthExpDate) !== true || Number(input.cardMonthExpDate) > 12)
}

const invalidYearInput = (input) => input.year !== undefined && input.year !== "" &&  (/^\d+$/g.test(input.year) !== true || Number(input.year) < new Date().getFullYear() )

const invalidCardYearExpInput = (input) => input.cardYearExpDate !== undefined && input.cardYearExpDate !== "" &&  (/^\d+$/g.test(input.cardYearExpDate) !== true || Number(input.cardYearExpDate) < new Date().getFullYear())

const monthInputError = (input) => input.month === undefined || input.month === ''
const cardMonthExpDateInputError = (input) => input.cardMonthExpDate === undefined || input.cardMonthExpDate === ''

const yearInputError = (input) => input.year === undefined || input.year === ''
const cardYearExpDateInputError = (input) => input.cardYearExpDate === undefined || input.cardYearExpDate === ''

const monthLengthInputError = (input) => input.month !== undefined  && input.month !== "" && input.month.length < 2
const cardMonthExpDateLengthInputError = (input) => input.cardMonthExpDate !== undefined  && input.cardMonthExpDate !== "" && input.cardMonthExpDate.length < 2

const yearLengthInputError = (input) => input.year !== undefined  && input.year !== "" && input.year.length < 4
const cardYearExpDateLengthInputError = (input) => input.cardYearExpDate !== undefined  && input.cardYearExpDate !== "" && input.cardYearExpDate.length < 4

const expInvalidInput = (input) => input.year !== undefined && input.month !== undefined && input.year === new Date().getFullYear().toString() && (Number(input.month) < new Date().getMonth() + 1)
const expInvalidInput2 = (input) => input.cardYearExpDate !== undefined && input.cardMonthExpDate !== undefined && input.cardYearExpDate === new Date().getFullYear().toString() && (Number(input.cardMonthExpDate) < new Date().getMonth() + 1)




export {firstNameInputError, profileFirstNameInputError, firstNameInputError2, profileFirstNameInputError2, lastNameInputError, profileLastNameInputError, lastNameInputError2, profileLastNameInputError2, line1InputError, addressLineOneInputError, lineOneInputError, profileAddressLineOneInputError, cityInputError, profileCityInputError, cityInputError2, profileCityInputError2, stateInputError, profileStateInputError, stateInputError2, profileStateInputError2, postalCodeInputError, postalCodeInputError2, postalCodeInputError3, zipcodeInputError, zipcodeInputError2, zipcodeInputError3, profileZipcodeInputError, profileZipcodeInputError2, profileZipcodeInputError3, phoneInputError, phoneInputError2, phoneInputError3, cardholderNameInputError, cardholderNameInputError2, cardHolderNameInputError, cardHolderNameInputError2, invalidMonthInput, invalidCardMonthExpDateInput, invalidYearInput, invalidCardYearExpInput, monthInputError, cardMonthExpDateInputError, yearInputError, cardYearExpDateInputError, monthLengthInputError, cardMonthExpDateLengthInputError, yearLengthInputError, cardYearExpDateLengthInputError, expInvalidInput, expInvalidInput2}





// const x = () => {
//     console.log(155, disableButtonAfterMakingRequest)
//     console.log( 156,  /^[a-z ,.'-]+$/i.test(shippingInput.firstName) !== true 
//     || shippingInput.firstName === ""
//     || shippingInput.firstName === undefined)
//     console.log( 159, /^[a-z ,.'-]+$/i.test(shippingInput.lastName) !== true 
//     || shippingInput.lastName === ""
//     || shippingInput.lastName === undefined)
//     console.log( 162, shippingInput.line1 === ""
//     || shippingInput.line1 === undefined)
//     console.log(164, /^[a-z ,.'-]+$/i.test(shippingInput.city) !== true 
//     || shippingInput.city === ""
//     || shippingInput.city === undefined)
//     console.log(167, shippingInput.state)
//     console.log(168, /^[a-z][a-z\s]*$/i.test(shippingInput.state) !== true 
//     || shippingInput.state === ""
//     || shippingInput.state === undefined)
//     console.log(171, 
//     /^[0-9]+$/.test(Number(shippingInput.postalCode)) !== true 
//     || shippingInput.postalCode === ""
//     || shippingInput.postalCode === undefined
//     || shippingInput.postalCode.length !== 5)
//     console.log(176,
//     shippingInput.phone && /^[0-9]+$/.test(Number(shippingInput.phone.replace(/\D/g,''))) !== true 
//     || shippingInput.phone === ""
//     || shippingInput.phone === undefined
//     || (shippingInput.phone && shippingInput.phone.replace(/\D/g,'').toString().length !==10 ))
//     console.log(disableButton(), readOnly, shippingInput.state === 'Select', disableButtonAfterMakingRequest)
// }