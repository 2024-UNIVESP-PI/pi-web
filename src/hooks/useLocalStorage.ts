import { useState } from "react"

export default function useLocalStorage<T>(key: string, defaultInitialValue: T) {
    const storedValue = localStorage.getItem(key)
    const initialValue = storedValue ? JSON.parse(storedValue) : defaultInitialValue
    const [value, setValue] = useState(initialValue)

    function setLocalStorage(newValue: any) {
        setValue(newValue)
        localStorage.setItem(key, JSON.stringify(newValue))
    }

    function deleteLocalStorage() {
        setValue(undefined)
        localStorage.removeItem(key)
    }

    return [value, setLocalStorage, deleteLocalStorage]
}