import { ReactNode } from 'react'

import './styles.scss'
export type TagProps = {
    className?: string
    color?: string
    children: ReactNode | ReactNode[]
}

export default function Tag(props: TagProps) {
    return (
        <span
            className={
                'tag-component'
                + (props.className ? ` ${props.className}` : '')
                + (props.color ? ' colored' : '')
            }
            style={props.color && {
                '--tag-color': props.color,
            } as React.CSSProperties || undefined}
        >
            {props.children}
        </span>
    )
}
