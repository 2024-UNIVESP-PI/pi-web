import { Dispatch, SetStateAction, useState, ChangeEvent } from "react"

export type Option = {
    value: any
    content: string | number
}
export type SelectProps = {
    className: string
    disabled?: boolean | string
    options: Option[]
    setValue?: Dispatch<SetStateAction<string>>
}

export default function Select(props: SelectProps) {
    const [selectedOption, setSelectedOption] = useState('')

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value)
        if (props.setValue) props.setValue(event.target.value)
    }

    return (
        <select
            className={props.className}
            value={selectedOption}
            onChange={handleChange}
        >
            {
                props.disabled &&
                <option value={''} disabled>
                    {typeof props.disabled == 'string' ? props.disabled : "Escolha uma opção"}
                </option>
            }
            {
                props.options.map(option => (
                    <option key={option.value} value={option.value}>{option.content}</option>
                ))
            }
        </select>
    )
}
