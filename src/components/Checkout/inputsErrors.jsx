
const firstNameInputError = (input) => {
    return (
        (input.firstName !== undefined && input.firstName !== "") && /^[a-z ,.'-]+$/i.test(input.firstName) !== true 
    )
}
const firstNameInputError2 = (input) => {
    return (
        (input.firstName === undefined || input.firstName === "") 
    )
}
const lastNameInputError = (input) => {
    return (
        (input.lastName !== undefined && input.lastName !== "") && /^[a-z ,.'-]+$/i.test(input.lastName) !== true 
    )
}
const lastNameInputError2 = (input) => {
    return (
        (input.lastName === undefined || input.lastName === "") 
    )
}
const line1InputError = (input) => {
    return (
        (input.line1 === undefined || input.line1 === "") 
    )
}

const cityInputError = (input) => {
    return (
       (input.city !== undefined && input.city !== "" ) &&  /^[a-z ,.'-]+$/i.test(input.city) !== true 
    )
}
const cityInputError2 = (input) => {
    return (
        (input.city === undefined || input.city === "") 
    )
}

const stateInputError = (input) => {
    return (
        input.state === "Select"
    )
}
const stateInputError2 = (input) => {
    return (
        (input.state === undefined || input.state === "") 
    )
}

const postalCodeInputError = (input) => {
    console.log(51, input.postalCode)
    return (
        (input.postalCode !== undefined && input.postalCode !== "" ) && /^[0-9]+$/.test(input.postalCode) !== true 
    )
}

const postalCodeInputError2 = (input) => {
    return (
        (input.postalCode !== undefined && input.postalCode !== "") 
        && input.postalCode.length !== 5
    )
}
const postalCodeInputError3 = (input) => {
    return (
        (input.postalCode === undefined || input.postalCode === "") 
    )
}
          
const phoneInputError = (input) => {
    return (
        (input.phone !== undefined && input.phone !== "") && /^[0-9]+$/.test(input.phone) !== true 
    )
}
       
const phoneInputError2 = (input) => {
    console.log(76, input.phone)
    return (
        (input.phone !== undefined && input.phone !== "") 
        && input.phone.replace(/\D/g,'').toString().length !== 10
    )
}

const phoneInputError3 = (input) => {
    console.log(84, input.phone)
    return (
        (input.phone === undefined || input.phone === "") 
    )
}

export {firstNameInputError, firstNameInputError2, lastNameInputError, lastNameInputError2, line1InputError, cityInputError, cityInputError2, stateInputError, stateInputError2, postalCodeInputError, postalCodeInputError2, postalCodeInputError3, phoneInputError, phoneInputError2, phoneInputError3}