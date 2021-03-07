
const firstNameInputError = (input) =>  input.firstName !== undefined && input.firstName !== "" && /^[a-z ,.'-]+$/i.test(input.firstName) !== true 

const firstNameInputError2 = (input) => input.firstName === undefined || input.firstName === ""

const lastNameInputError = (input) => input.lastName !== undefined && input.lastName !== "" && /^[a-z ,.'-]+$/i.test(input.lastName) !== true 

const lastNameInputError2 = (input) => input.lastName === undefined || input.lastName === ""

const line1InputError = (input) => input.line1 === undefined || input.line1 === ""

const cityInputError = (input) => input.city !== undefined && input.city !== ""  &&  /^[a-z ,.'-]+$/i.test(input.city) !== true 

const cityInputError2 = (input) => input.city === undefined || input.city === ""

const stateInputError = (input) =>  input.state === "Select"

const stateInputError2 = (input) => input.state === undefined || input.state === ""

const postalCodeInputError = (input) => input.postalCode !== undefined && input.postalCode !== ""  && /^[0-9]+$/.test(input.postalCode) !== true 

const postalCodeInputError2 = (input) => input.postalCode !== undefined && input.postalCode !== "" && input.postalCode.length !== 5

const postalCodeInputError3 = (input) => input.postalCode === undefined || input.postalCode === ""
          
const phoneInputError = (input) => input.phone !== undefined && input.phone !== "" && /^[0-9]+$/.test(input.phone) !== true 
   
const phoneInputError2 = (input) => input.phone !== undefined && input.phone !== "" && input.phone.replace(/\D/g,'').toString().length !== 10

const phoneInputError3 = (input) => input && (input.phone === undefined || input.phone === "") 


const cardholderNameInputError = (input) => input !== undefined && input !== "" && /^[a-z ,.'-]+$/i.test(input) !== true 
const cardholderNameInputError2 = (input) => input === undefined || input === ""

const invalidMonthInput = (input) => input.month !== undefined && input.month !== "" && (/^\d+$/g.test(input.month) !== true || Number(input.month) > 12)

const invalidYearInput = (input) => input.year !== undefined && input.year !== "" &&  (/^\d+$/g.test(input.year) !== true || Number(input.year) < 2021)

const monthInputError = (input) => input.month === undefined || input.month === ''

const yearInputError = (input) => input.year === undefined || input.year === ''

const monthLengthInputError = (input) => input.month !== undefined  && input.month !== "" && input.month.length < 2

const yearLengthInputError = (input) => input.year !== undefined  && input.year !== "" && input.year.length < 4

const expInvalidInput = (input) => input.year !== undefined && input.month !== undefined && input.year === "2021" && (Number(input.month) < new Date().getMonth() + 1)




export {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, line1InputError, cityInputError, cityInputError2, stateInputError, stateInputError2, postalCodeInputError, postalCodeInputError2, postalCodeInputError3, phoneInputError, phoneInputError2, phoneInputError3, cardholderNameInputError, cardholderNameInputError2, invalidMonthInput, invalidYearInput, monthInputError, yearInputError, monthLengthInputError, yearLengthInputError, expInvalidInput}





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