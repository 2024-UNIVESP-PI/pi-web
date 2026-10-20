import { MouseEventHandler, ReactNode } from 'react'

import Card from '..'

import './styles.scss'
export type HomeCardProps = {
    icon: ReactNode
    title: string
    onClick?: MouseEventHandler<HTMLDivElement>
}

export default function HomeCard(props: HomeCardProps) {
    return (
        <Card className='home-card' onClick={props.onClick}>
            {props.icon}
            <p className='title'>{props.title}</p>
        </Card>
    )
}
