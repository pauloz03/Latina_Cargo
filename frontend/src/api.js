import { client } from './Supabase/client';

const API_URL = import.meta.env.VITE_API_URL || '';

async function apiFetch(path, options = {}) {
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Error en la solicitud');
  }

  return payload;
}

export function getMe() {
  return apiFetch('/api/me');
}

export function getMyPackages() {
  return apiFetch('/api/my-packages');
}

export function getClients() {
  return apiFetch('/api/admin/clients');
}

export function addPackage(userId, weight) {
  return apiFetch('/api/admin/packages', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, weight }),
  });
}

export function updatePackage(id, weight) {
  return apiFetch(`/api/admin/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ weight }),
  });
}

export function deletePackage(id) {
  return apiFetch(`/api/admin/packages/${id}`, {
    method: 'DELETE',
  });
}
