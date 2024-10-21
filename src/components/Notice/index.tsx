import { ReactNode } from 'react'

import './styles.scss'
export type NoticeProps = {
    margin?: boolean
    children: ReactNode | ReactNode[]
}

export default function Notice(props: NoticeProps) {
    return (
        <span className={'notice-component' + (props.margin ? ' margin' : '')}>
            {props.children}
        </span>
    )
}
