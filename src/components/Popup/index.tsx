import { Dispatch, SetStateAction, ReactNode } from 'react'
import { FaXmark } from 'react-icons/fa6'

import Button from '../Button'

import './styles.scss'
export type PopupProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    id?: string
    icon?: ReactNode
    title?: string
    children: ReactNode | ReactNode[]
}

export default function Popup(props: PopupProps) {
    return (
        <div
            className={'popup-component' + (!props.visible ? ' hidden' : '')}
            id={props.id}
        >
            <div className="popup-content">
                <div className="popup-header">
                    <div className="header-info">
                        {props.icon}
                        <p className='title'>{props.title || "Popup"}</p>
                    </div>

                    <Button
                        className='close-popup'
                        color='var(--color-red)'
                        onClick={() => props.setVisible(false)}
                    >
                        <FaXmark />
                    </Button>
                </div>

                <div className="popup-main">
                    {props.children}
                </div>
            </div>
        </div>
    )
}
