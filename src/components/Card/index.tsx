import { ElementType, KeyboardEvent, MouseEvent as ReactMouseEvent, MouseEventHandler, ReactNode } from 'react'

import './styles.scss'
export type CardProps = {
    as?: ElementType
    className?: string
    lowOpacity?: boolean
    color?: string
    onClick?: MouseEventHandler<HTMLElement>
    children: ReactNode | ReactNode[]
    options?: ReactNode | ReactNode[]
}

export default function Card(props: CardProps) {
    const Component = props.as || 'div'
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (props.onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            props.onClick(event as unknown as ReactMouseEvent<HTMLElement>)
        }
    }

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
            onKeyDown={props.onClick ? handleKeyDown : undefined}
            role={props.onClick && Component === 'div' ? 'button' : undefined}
            tabIndex={props.onClick && Component === 'div' ? 0 : undefined}
        >
            {props.children}
        </Component>
    )
}
