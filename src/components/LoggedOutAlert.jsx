import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

export default function LoggedOutAlert() {
    const [openModal, setOpenModal] = useState(true)
    setTimeout(() => {
        setOpenModal(false)
    }, 2000)
    return (
        
            <Modal isOpen={openModal} onRequestClose={() => setOpenModal(false)} ariaHideApp={false} contentLabel="Edit Card">
                Log in
            </Modal>

    )
}