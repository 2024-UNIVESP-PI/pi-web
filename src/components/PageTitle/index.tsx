import './styles.scss'
export type PageTitleProps = {
    title?: string
    subtitle?: string
}

export default function PageTitle(props: PageTitleProps) {
    return (
        <div className='page-title-component'>
            {props.title && <h2>{props.title}</h2>}
            {props.subtitle && <h3>{props.subtitle}</h3>}
        </div>
    )
}
