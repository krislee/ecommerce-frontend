export default function reviseOrderDate(orderDate) {
    const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    const date = new Date(orderDate)
    const orderDateMonth = Number(date.getUTCMonth() + 1)
    const orderDateDay = date.getUTCDate() 
    const orderDateYear = date.getUTCFullYear()
    const revisedOrderDate =`${months[orderDateMonth]} ${orderDateDay}, ${orderDateYear}` 
    return revisedOrderDate
}