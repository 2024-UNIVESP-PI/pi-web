import { ChangeEvent, ChangeEventHandler } from "react"

export type Option = {
    value: any
    content: string | number
    disabled?: boolean
}
export type SelectProps = {
    className: string
    disabled?: boolean | string
    disabledValue?: string | number
    options?: Option[]
    value: string | number
    onChange: ChangeEventHandler<HTMLSelectElement>
    required?: boolean
}

export default function Select(props: SelectProps) {
    return (
        <select
            className={props.className}
            value={props.value}
            onChange={props.onChange}
            required={props.required}
        >
            {
                props.disabled &&
                <option value={props.disabledValue != undefined ? props.disabledValue : ''} disabled>
                    {typeof props.disabled == 'string' ? props.disabled : "Escolha uma opção"}
                </option>
            }
            {
                props.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.content}</option>
                ))
            }
        </select>
    )
}
