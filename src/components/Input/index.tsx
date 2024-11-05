import { ChangeEventHandler, HTMLAttributes } from 'react'

import { Option } from '../Select'

import './styles.scss'
export type InputProps = {
    id: string
    className?: string
    type?: string
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
    placeholder?: string
    label?: string
    message?: string
    options?: Option[]
    disabledValue?: string | number
    value?: string | number
    onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
    required?: boolean
    maxLength?: number
    min?: number
    max?: number
    step?: number

    errors?: string[]
    // generalErrors?: string[]
    // showGeneralErrors?: boolean
    // errorColor?: string
}

export default function Input(props: InputProps) {
    return (
        <div
            className={
                'input-component'
                + (props.className ? ` ${props.className}` : '')
                + (props.errors ? ' error' : '')
            }>
            {
                (props.label || props.message) &&
                <label htmlFor={props.id}>
                    {props.label && <span className='label'>
                        {props.label}
                        {props.required && '*'}
                    </span>}
                    {props.message && <span className='message'>{props.message}</span>}
                </label>
            }
            {
                props.type != 'select' ?
                    <input
                        id={props.id}
                        type={props.type ? (props.type == 'intenger' ? 'number' : props.type) : 'text'}
                        inputMode={props.inputMode}
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={
                            props.type == 'intenger' ?
                                (e) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                    props.onChange(e)
                                }
                                :
                                props.onChange
                        }
                        required={props.required}
                        maxLength={props.maxLength}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                    />
                    :
                    <select
                        id={props.id}
                        value={props.value}
                        onChange={props.onChange}
                        required={props.required}
                    >
                        {
                            props.placeholder &&
                            <option value={props.disabledValue != undefined ? props.disabledValue : ''} disabled>
                                {props.placeholder}
                            </option>
                        }
                        {
                            props.options &&
                            props.options.map(option => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.content}
                                </option>
                            ))
                        }
                    </select>
            }

            {props.errors && props.errors.map(error => <span className='error'>{error}</span>)}
        </div>
    )
}
