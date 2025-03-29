import React, { useState, useEffect } from "react";
import "./Users.css";
/* import sw from "../../../sw";
 */
const Users = () => {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    navigator.serviceWorker.register('../../../sw.js', { type: 'module' })
    .then(registro => {
        console.log("Service Worker registrado");

        // Verificar permisos de notificaciones
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    // Suscribirse a notificaciones push
                    registro.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: keys.public_key
                    })
                    .then(subscription => {
                        console.log(subscription);
                        // Guardar la suscripción en el servidor
                        return fetch('https://backendpwa-6xks.onrender.com/save-subscription', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscription)
                        });
                    })
                    .then(response => response.json())
                    .then(data => console.log('Suscripción guardada:', data))
                    .catch(error => console.error('Error al guardar la suscripción:', error));
                }
            });
        }
    })
    .catch(error => {
        console.error("Error al registrar el Service Worker:", error);
    });

    // 🚀 Obtener usuarios desde la API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("https://backendpwa-6xks.onrender.com/users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("❌ Error al obtener usuarios:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleSendNotification = () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                action: 'sendNotification',
                title: 'Notificación para ' + selectedUser.name,
                body: `Gracias ${selectedUser.name} por usar mi PWA`,
            });
        }
        setModalOpen(false);
    };

    return (
        <div className="container">
            <h1>Usuarios</h1>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Correo</th>
                        <th>Enviar Notificación</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.email}>
                            <td>{user.name}</td>
                            <td>{user.app}</td>
                            <td>{user.apm}</td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => handleOpenModal(user)}>Notificar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <p>¿Quieres enviar una notificación a: <span>{selectedUser.email}</span>?</p>
                        <div className="modal-buttons">
                            <button className="btnN" onClick={handleSendNotification}>Sí</button>
                            <button className="btnN" onClick={() => setModalOpen(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;