import { Fragment, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { addPackage, deletePackage, getClients, updatePackage } from '../api';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [newWeights, setNewWeights] = useState({});
  const [editWeights, setEditWeights] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const toggleClient = (id) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleAdd = async (userId) => {
    const weight = Number(newWeights[userId]);
    if (Number.isNaN(weight)) {
      setError('Ingresa un peso numérico antes de agregar un paquete');
      return;
    }

    try {
      await addPackage(userId, weight);
      setNewWeights((current) => ({ ...current, [userId]: '' }));
      await loadClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (packageId) => {
    const currentWeight = clients
      .flatMap((clientRow) => clientRow.packages)
      .find((pkg) => pkg.id === packageId)?.weight;
    const weight = Number(editWeights[packageId] ?? currentWeight);

    if (Number.isNaN(weight)) {
      return;
    }

    try {
      await updatePackage(packageId, weight);
      await loadClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (packageId) => {
    try {
      await deletePackage(packageId);
      await loadClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredClients = clients.filter((clientRow) =>
    (clientRow.name || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Layout title="Clientes">
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Cargando clientes...</p>
      ) : (
        <>
        <label className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M15.5 15.5 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            aria-label="Buscar por nombre"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {filteredClients.length === 0 ? (
          <p className="muted">No se encontraron clientes.</p>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Paquetes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((clientRow) => (
              <Fragment key={clientRow.id}>
                <tr>
                  <td>
                    {clientRow.name || 'Sin nombre'}
                    {clientRow.is_admin ? <span className="badge">Administrador</span> : null}
                  </td>
                  <td>{clientRow.packages.length}</td>
                  <td>
                    <button type="button" onClick={() => toggleClient(clientRow.id)}>
                      {expanded[clientRow.id] ? 'Ocultar' : 'Ver'}
                    </button>
                  </td>
                </tr>
                {expanded[clientRow.id] && (
                  <tr className="nested-row">
                    <td colSpan={3}>
                      <div className="package-panel">
                        {clientRow.packages.length === 0 ? (
                          <p className="muted">Este cliente no tiene paquetes.</p>
                        ) : (
                          <ul className="package-list">
                            {clientRow.packages.map((pkg) => (
                              <li key={pkg.id}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editWeights[pkg.id] ?? pkg.weight}
                                  onChange={(event) =>
                                    setEditWeights((current) => ({
                                      ...current,
                                      [pkg.id]: event.target.value,
                                    }))
                                  }
                                />
                                <button type="button" onClick={() => handleUpdate(pkg.id)}>
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => handleDelete(pkg.id)}
                                >
                                  Eliminar
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="add-row">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Peso"
                            value={newWeights[clientRow.id] ?? ''}
                            onChange={(event) =>
                              setNewWeights((current) => ({
                                ...current,
                                [clientRow.id]: event.target.value,
                              }))
                            }
                          />
                          <button type="button" onClick={() => handleAdd(clientRow.id)}>
                            Agregar paquete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        )}
        </>
      )}
    </Layout>
  );
}
