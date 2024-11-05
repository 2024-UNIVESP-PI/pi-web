import { ReactNode, ElementType } from 'react'

import './styles.scss'
export type CardProps = {
    as?: ElementType
    className?: string
    lowOpacity?: boolean
    color?: string
    onClick?: Function
    children: ReactNode | ReactNode[]
    options?: ReactNode | ReactNode[]
}

export default function Card(props: CardProps) {
    const Component = props.as || 'div'

    return (
        <Component
            className={
                'card-component'
                + (props.className ? ` ${props.className}` : '')
                + (props.lowOpacity ? ' low-opacity' : '')
                + (props.color ? ' colored' : '')
                + (props.onClick ? ' clickable' : '')
            }
            style={props.color && {
                '--card-color': props.color,
            } as React.CSSProperties || undefined}
            onClick={props.onClick}
        >
            {props.children}
        </Component>
    )
}
