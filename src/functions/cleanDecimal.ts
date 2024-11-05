export default function cleanDecimal(input: string | number, decimalPlaces?: number) {
    decimalPlaces = decimalPlaces != undefined ? decimalPlaces : 2
    const cleanStrInput = String(input).replace(/[^0-9]/g, '')
    const formatedDecimalInput = Number(cleanStrInput) / 10 ** decimalPlaces
    return formatedDecimalInput
}