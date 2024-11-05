import { ReactNode } from 'react'

import Card from '..'

import './styles.scss'
export type HomeCardProps = {
    icon: ReactNode
    title: string
    onClick?: Function
}

export default function HomeCard(props: HomeCardProps) {
    return (
        <Card className='home-card' onClick={props.onClick}>
            {props.icon}
            <p className='title'>{props.title}</p>
        </Card>
    )
}
