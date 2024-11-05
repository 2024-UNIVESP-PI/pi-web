import { FaBoxOpen } from 'react-icons/fa6'

import './styles.scss'
export type EstoqueProps = {
    number: number
}

export default function Estoque(props: EstoqueProps) {
    return (
        <span className='estoque-component'>
            <FaBoxOpen className='box-icon' />
            <p>{props.number}</p>
        </span>
    )
}
