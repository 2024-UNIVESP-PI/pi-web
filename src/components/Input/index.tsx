import { ChangeEventHandler } from 'react'

// import 

import './styles.scss'
export type InputProps = {
    id: string
    type?: string
    placeholder: string
    label: string
    message?: string
    value: any
    onChange: ChangeEventHandler<HTMLInputElement>
    required?: boolean
    maxLength?: number
    min?: number
    max?: number
    step?: number

    // errors?: string[]
    // generalErrors?: string[]
    // showGeneralErrors?: boolean
    // errorColor?: string
}

export default function Input(props: InputProps) {
    return (
        <div className='input-component'>
            <label htmlFor={props.id}>
                <span className='label'>{props.label}</span>
                {props.message && <span className='message'>{props.message}</span>}
            </label>
            <input
                id={props.id}
                type={props.type ? (props.type == 'intenger' ? "text" : props.type) : 'text'}
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
        </div>
    )
}
