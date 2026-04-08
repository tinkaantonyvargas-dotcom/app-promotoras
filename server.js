require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// IMPORTAMOS LOS DOS SERVICIOS
const authService = require('./authService');
const calculoService = require('./calculoService');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// RUTA LOGIN
app.post('/api/login', async (req, res) => {
    const { cod_promotora, password } = req.body;
    const resultado = await authService.validarLogin(cod_promotora, password);
    
    if (!resultado.success) return res.status(401).json(resultado);
    res.json(resultado);
});

// RUTA DASHBOARD
app.get('/api/dashboard/:cod', async (req, res) => {
    const resultado = await calculoService.obtenerDatosDashboard(req.params.cod);
    
    if (!resultado.success) return res.status(404).json(resultado);
    res.json(resultado);
});


// Agrega esto justo antes del const PORT = process.env.PORT...
const path = require('path');

// Cambia esto en server.js
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`));

// Agrega esto al final de tu server.js
module.exports = app;