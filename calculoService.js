// calculoService.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function obtenerDatosDashboard(codPromotora) {
    const { data, error } = await supabase
        .from('reporte_final_promotoras')
        .select('*')
        .eq('COD_PROMOTORA', codPromotora)
        .single();

    if (error || !data) return { success: false, message: 'Datos no encontrados' };

    // Lógica de Responsable
    let responsable = data.Coordinador;
    if (responsable === 'SIN COORDINADOR' || responsable === 'SIN ASIGNAR') {
        responsable = data.Supervisor;
    }

    // Lógica de porcentajes
    const ventas = typeof data.detalle_ventas === 'string' ? JSON.parse(data.detalle_ventas) : data.detalle_ventas;
    const cuotas = typeof data.detalle_cuotas === 'string' ? JSON.parse(data.detalle_cuotas) : data.detalle_cuotas;

    const progreso = Object.keys(ventas).map(producto => {
        const venta = ventas[producto];
        const cuota = cuotas[producto] || 1;
        return {
            producto: producto,
            venta: venta,
            cuota: cuota,
            porcentaje: parseFloat(((venta / cuota) * 100).toFixed(2))
        };
    });

    return {
        success: true,
        data: {
            cod_promotora: data.COD_PROMOTORA,
            formato: data.Formato,
            responsable: responsable,
            posicion: data.posicion_regional,
            productos: progreso
        }
    };
}

module.exports = { obtenerDatosDashboard };