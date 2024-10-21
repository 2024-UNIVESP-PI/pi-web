import { MouseEventHandler, ReactNode, ElementType } from 'react'

import './styles.scss'
export type CardProps = {
    className?: string
    lowOpacity?: boolean
    color?: string
    onClick?: MouseEventHandler<HTMLDivElement>
    children: ReactNode | ReactNode[]
    as?: ElementType
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
