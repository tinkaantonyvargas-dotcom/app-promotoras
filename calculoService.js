// calculoService.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const NOMBRES_CATEGORIA = {
    TK:  'Tinka Kiosco',
    KGD: 'Kabala y Gana Diario',
    RGG: 'Red de Gestión y Garantía',
    TDV: 'Terminales de Venta'
};

const PRODUCTOS_POR_CATEGORIA = {
    TK:  ['Tinka'],
    KGD: ['Kabala', 'Gana Diario'],
    RGG: ['Ganagol', 'Instantaneas'],
    TDV: ['Te Apuesto', 'Deporte Virtual']
};

async function obtenerDatosDashboard(codPromotora) {
    const { data, error } = await supabase
        .from('reporte_final_promotoras')
        .select('*')
        .eq('COD_PROMOTORA', codPromotora)
        .single();

    if (error || !data) return { success: false, message: 'Datos no encontrados' };

    // Lógica de Responsable: Coordinador con fallback a Supervisor
    let responsable = data.Coordinador;
    if (responsable === 'SIN COORDINADOR' || responsable === 'SIN ASIGNAR') {
        responsable = data.Supervisor;
    }

    // Parsear detalle_ventas y detalle_cuotas (productos individuales)
    const ventas = typeof data.detalle_ventas === 'string' ? JSON.parse(data.detalle_ventas) : data.detalle_ventas;
    const cuotas = typeof data.detalle_cuotas === 'string' ? JSON.parse(data.detalle_cuotas) : data.detalle_cuotas;

    const productos = Object.keys(ventas).map(producto => {
        const venta = ventas[producto];
        const cuota = cuotas[producto] || 1;
        return {
            producto,
            venta,
            cuota,
            porcentaje: parseFloat(((venta / cuota) * 100).toFixed(2))
        };
    });

    // Parsear ctg_venta y ctg_cuota (agrupado por categoría)
    const ctgVentas = typeof data.ctg_venta === 'string' ? JSON.parse(data.ctg_venta) : (data.ctg_venta || {});
    const ctgCuotas = typeof data.ctg_cuota === 'string' ? JSON.parse(data.ctg_cuota) : (data.ctg_cuota || {});

    const categorias = Object.keys(ctgVentas).map(codigo => {
        const venta = ctgVentas[codigo];
        const cuota = ctgCuotas[codigo] || 1;
        return {
            codigo,
            nombre: NOMBRES_CATEGORIA[codigo] || codigo,
            venta,
            cuota,
            porcentaje: parseFloat(((venta / cuota) * 100).toFixed(2)),
            productos_keys: PRODUCTOS_POR_CATEGORIA[codigo] || []
        };
    });

    return {
        success: true,
        data: {
            cod_promotora: data.COD_PROMOTORA,
            nombre_completo: data.NOMBRE_COMPLETO || '',
            formato: data.Formato,
            responsable,
            posicion: data.posicion_regional,
            categorias,
            productos
        }
    };
}

module.exports = { obtenerDatosDashboard };
