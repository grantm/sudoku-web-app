export default function ButtonIcon({name}) {
    return (
        <svg className="button-icon" version="1.1" viewBox="0 0 48 48">
            <use href={`#icon-${name}`} />
        </svg>
    )
}
