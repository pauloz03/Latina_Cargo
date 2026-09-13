import { useEffect, useState } from 'react';
import { getMyPackages } from '../api';
import { Layout } from '../components/Layout';
import { client } from '../Supabase/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPackages = async () => {
      const { data, error: queryError } = await client
        .from('packages')
        .select('id, weight, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (!queryError) {
        setPackages(data || []);
        setLoading(false);
        return;
      }

      try {
        const apiData = await getMyPackages();
        if (!cancelled) {
          setPackages(apiData || []);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError(queryError.message);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    loadPackages();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <Layout title="Mis paquetes">
      {error && <p className="error">{error}</p>}
      <p className="summary">Paquetes en oficina: {packages.length}</p>
      {loading ? (
        <p className="muted">Cargando paquetes...</p>
      ) : packages.length === 0 ? (
        <p className="muted">No hay paquetes todavía.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Peso</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.weight}</td>
                <td>{new Date(pkg.created_at).toLocaleDateString('es')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
