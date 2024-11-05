import axios from "axios"

export const apiBaseURL = "https://api-arraiatech.up.railway.app/"
const api = axios.create({
    baseURL: apiBaseURL,
})

api.interceptors.response.use(function (response) {
    if (import.meta.env.VITE_DEBUG) console.log(response)
    return response
}, async function (error) {
    console.log(error.request)
    return Promise.reject(error)
})

export default api

export type Map = {
    [id: number | string]: number
}

export type Errors = {
    [key: string]: string[],
}