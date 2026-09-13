const express = require('express');
const { supabase } = require('../supabase');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/clients', async (_req, res) => {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, is_admin')
    .order('name', { ascending: true });

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  const { data: packages, error: packageError } = await supabase
    .from('packages')
    .select('id, user_id, weight, created_at')
    .order('created_at', { ascending: false });

  if (packageError) {
    return res.status(500).json({ error: packageError.message });
  }

  const packagesByUser = new Map();
  for (const pkg of packages || []) {
    const list = packagesByUser.get(pkg.user_id) || [];
    list.push(pkg);
    packagesByUser.set(pkg.user_id, list);
  }

  const clients = (profiles || []).map((profile) => ({
    ...profile,
    packages: packagesByUser.get(profile.id) || [],
  }));

  res.json(clients);
});

router.post('/packages', async (req, res) => {
  const { user_id, weight } = req.body || {};
  const parsedWeight = Number(weight);

  if (!user_id || Number.isNaN(parsedWeight)) {
    return res.status(400).json({ error: 'Se requiere user_id y un peso numérico' });
  }

  const { data, error } = await supabase
    .from('packages')
    .insert({ user_id, weight: parsedWeight })
    .select('id, user_id, weight, created_at')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.put('/packages/:id', async (req, res) => {
  const parsedWeight = Number(req.body?.weight);

  if (Number.isNaN(parsedWeight)) {
    return res.status(400).json({ error: 'Se requiere un peso numérico' });
  }

  const { data, error } = await supabase
    .from('packages')
    .update({ weight: parsedWeight })
    .eq('id', req.params.id)
    .select('id, user_id, weight, created_at')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.delete('/packages/:id', async (req, res) => {
  const { error } = await supabase.from('packages').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;
