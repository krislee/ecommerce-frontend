// import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// const stripe = useStripe()
// const elements = useElements()

const createPaymentMethod = async (stripe,cardElement, billing, cardholderName, backend) => {
    console.log("from create payment ", billing)
    console.log("from create payment ", billing.postalCode)
    const createPaymentMethodResponse = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
            name: `${billing.firstName}, ${billing.lastName}`,
            address: {
                line1: `${billing.line1}`,
                line2: `${billing.line2}`,
                city: `${billing.city}`,
                state: `${billing.state}`,
                country: 'US'
            }
        },
        metadata: {
            cardholder_name: `${cardholderName}`,
            recollect_cvv: false
        }
    })

    console.log(createPaymentMethodResponse)
    if(createPaymentMethodResponse.error) {
        return createPaymentMethodResponse.error.message
    }

    const savePaymentMethodToCustomerResponse = await fetch(`${backend}/order/payment?checkout=true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
            paymentMethodID: createPaymentMethodResponse.paymentMethod.id,
            default: false
        })
    })
    const savePaymentMethodToCustomerData = await savePaymentMethodToCustomerResponse.json()

    console.log(savePaymentMethodToCustomerData.billing_details)

    return savePaymentMethodToCustomerData
}

export default createPaymentMethod