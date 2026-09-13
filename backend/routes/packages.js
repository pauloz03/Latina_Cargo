const express = require('express');
const { supabase } = require('../supabase');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, is_admin')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/my-packages', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('packages')
    .select('id, user_id, weight, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
