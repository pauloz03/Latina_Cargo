const { supabase } = require('../supabase');

async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', req.user.id)
    .single();

  if (error || !data?.is_admin) {
    return res.status(403).json({ error: 'Se requiere acceso de administrador' });
  }

  next();
}

module.exports = { requireAdmin };
