// authService.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function validarLogin(cod_promotora, password) {
    const { data, error } = await supabase
        .from('usuarios_promotoras')
        .select('*')
        .eq('cod_promotora', cod_promotora)
        .eq('password', password)
        .single();

    if (error || !data) return { success: false, message: 'Credenciales incorrectas' };
    return { success: true, user: data };
}

module.exports = { validarLogin };