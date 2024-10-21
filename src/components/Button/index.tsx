import {MouseEventHandler, ReactNode } from 'react'

import './styles.scss'
export type ButtonProps = {
    className?: string
    type?: "button" | "submit" | "reset"
    color?: string
    opacity?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    children: ReactNode | ReactNode[]
}

export default function Button(props: ButtonProps) {
    return (
        <button
            className={
                'button-component'
                + (props.className ? ` ${props.className}` : '')
                + (props.color ? ' colored' : '')
                + (props.opacity ? ' opacity' : '')
            }
            type={props.type || 'button'}
            style={props.color && {
                '--button-color': props.color,
            } as React.CSSProperties || undefined}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
