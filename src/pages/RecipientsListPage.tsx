import { useNavigate } from 'react-router-dom';
import { useRecipients, useDeleteRecipient } from '../hooks/useRecipients';

export default function RecipientsListPage() {
  const navigate = useNavigate();
  const { data: recipients = [], isLoading, error: queryError } = useRecipients();
  const deleteRecipient = useDeleteRecipient();

  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este destinatario?')) return;
    try {
      await deleteRecipient.mutateAsync(id);
    } catch (err) {
      /* error is ignored in list page */
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Destinatarios</h2>
          <button type="button" onClick={() => navigate('/recipients/new')}>Nuevo destinatario</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        {isLoading && <div className="loading-banner">Cargando...</div>}
        <div className="list-card">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Carnet</th><th>Telefono</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id}>
                  <td>{r.fullName}</td>
                  <td>{r.idCard}</td>
                  <td>{r.phone || '—'}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="small" onClick={() => navigate(`/recipients/${r.id}/edit`)}>Editar</button>
                      <button type="button" className="small secondary" onClick={() => handleDelete(r.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
