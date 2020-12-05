import React from 'react';

import ModalIconError from '../../assets/modal-icon-error.svg';
import ModalIconOk from '../../assets/modal-icon-ok.svg';
import ModalIconWarning from '../../assets/modal-icon-warning.svg';

const modalIcons = {
    error: ModalIconError,
    ok: ModalIconOk,
    warning: ModalIconWarning,
};

export default function ModalIcon ({icon}) {
    if (!modalIcons[icon]) {
        return null;
    }
    return <img src={modalIcons[icon]} alt={`${icon} icon`} />
}
