import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { getNotifications, markNotificationAsRead } from '../services/notificationsService';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) return <Spinner />;

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2>Notifications</h2>
          <p>Centre de notifications de l'application GMAO.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Aucune notification disponible" />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Message</th>
                <th>Date</th>
                <th>État</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.message}</td>
                  <td>{new Date(notification.createdAt).toLocaleString()}</td>
                  <td>{notification.readAt ? 'Lue' : 'Non lue'}</td>
                  <td>
                    {!notification.readAt && (
                      <button
                        className="button-mark-read"
                        onClick={async () => {
                        await markNotificationAsRead(notification.id);
                        loadNotifications();
                        }}
                        >
                        ✓ Marquer comme lue
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Notifications;