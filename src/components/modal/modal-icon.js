export default function ModalIcon ({icon}) {
    return (
        <svg className="button-icon" version="1.1" viewBox="0 0 100 100">
            <use href={`#modal-icon-${icon}`} />
        </svg>
    )
}
