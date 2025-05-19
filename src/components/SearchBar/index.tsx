import { ChangeEventHandler, FormEventHandler } from 'react'

import Button from '../Button'

import './styles.scss'
export type SearchBarProps = {
    value: string
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <form
            className='search-bar-component'
            onSubmit={props.onSubmit}
        >
            <input
                value={props.value}
                onChange={props.onChange}
                placeholder="Digite o nome do produto"
            />
            <Button
                type='submit'
                color='var(--color-light-black)'
            >
                <p>Buscar</p>
            </Button>
        </form>
    )
}
