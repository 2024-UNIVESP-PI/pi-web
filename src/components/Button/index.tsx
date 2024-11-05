import { MouseEventHandler, ReactNode } from 'react'

import ActivityIndicator from '../ActivityIndicator'

import './styles.scss'
export type ButtonProps = {
    className?: string
    type?: "button" | "submit" | "reset"
    color?: string
    opacity?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    children: ReactNode | ReactNode[]
    loading?: boolean
}

export default function Button(props: ButtonProps) {
    return (
        <button
            className={
                'button-component'
                + (props.className ? ` ${props.className}` : '')
                + (props.color ? ' colored' : '')
                + (props.opacity ? ' opacity' : '')
                + (props.loading ? ' loading' : '')
            }
            type={props.type || 'button'}
            style={props.color && {
                '--button-color': props.color,
            } as React.CSSProperties || undefined}
            onClick={!props.loading ? props.onClick : undefined}
        >
            {props.loading && <ActivityIndicator/>}
            {props.children}
        </button>
    )
}
