import { useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  defaultInitialValue: T
) {
  const getStoredValue = (): T => {
    try {
      const storedValue = localStorage.getItem(key);
      if (
        storedValue === null ||
        storedValue === undefined ||
        storedValue === "undefined"
      ) {
        return defaultInitialValue;
      }
      return JSON.parse(storedValue);
    } catch (error) {
      // Se houver erro ao fazer parse, retorna o valor padrão
      console.warn(`Erro ao fazer parse do localStorage key "${key}":`, error);
      return defaultInitialValue;
    }
  };

  const [value, setValue] = useState<T>(getStoredValue);

  function setLocalStorage(newValue: T) {
    setValue(newValue);
    if (newValue === undefined || newValue === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  }

  function deleteLocalStorage() {
    setValue(defaultInitialValue);
    localStorage.removeItem(key);
  }

  return [value, setLocalStorage, deleteLocalStorage] as const;
}
