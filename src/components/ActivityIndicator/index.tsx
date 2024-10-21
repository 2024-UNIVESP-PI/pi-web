import { Dots } from "react-activity"
import "react-activity/dist/Dots.css"

import './styles.scss'
export type ActivityIndicatorProps = {
    margin?: boolean
}

export default function ActivityIndicator(props: ActivityIndicatorProps) {
    return (
        <div className={'activity-indicator-component' + (props.margin ? ' margin' : '')}>
            <Dots />
        </div>
    )
}
