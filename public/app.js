// --- FUNCION DE LOGIN (Llamada desde el onclick del botón en index.html) ---
// Dentro del script de index.html
async function intentarLogin() {
    const cod_promotora = document.getElementById('username').value; // Cambié el nombre de la variable
    const password = document.getElementById('password').value;      // Cambié el nombre de la variable
    const errorDiv = document.getElementById('mensajeError');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod_promotora, password }) // Ahora coincide con el backend
        });

        const data = await response.json();

        if (response.ok) {
            // IMPORTANTE: En app.js usas 'cod_promotora', asegúrate de guardar lo mismo
            localStorage.setItem('cod_promotora', cod_promotora); 
            window.location.href = 'home.html';
        } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = data.message || 'Código o DNI incorrectos';
        }
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Error al conectar con el servidor';
    }
}

// --- LÓGICA DE DASHBOARD (Se ejecuta al cargar la página) ---
if (window.location.pathname.endsWith('dashboard.html')) {
    // const cod = localStorage.getItem('cod_promotora');

    // if (!cod) {
    //     window.location.href = 'index.html';
    // }

    async function cargarDatos() {
        try {
            const response = await fetch(`/api/dashboard/${cod}`);
            const result = await response.json();

            if (result.success) {
                const d = result.data;
                
                // Mapeo de datos del servidor al HTML
                document.getElementById('userName').innerText = `Cod: ${d.cod_promotora}`;
                document.getElementById('rankValue').innerText = d.posicion || d.posicion_regional || '-';
                document.getElementById('formatoValue').innerText = d.formato || '-';
                document.getElementById('responsableValue').innerText = d.responsable || d.responsable_asignado || '-';

                const container = document.getElementById('productosContainer');
                container.innerHTML = ''; // Limpiar mensaje de carga

                // Usamos 'productos' o 'progreso_ventas' según lo que envíe tu calculoService
                const productos = d.productos || d.progreso_ventas;

                productos.forEach(p => {
                    const pct = p.porcentaje || p.porcentaje_progreso;
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <div class="product-info">
                            <span class="product-name">${p.producto}</span>
                            <span class="product-pct">${pct}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${pct > 100 ? 100 : pct}%"></div>
                        </div>
                        <div class="product-footer">
                            <span>Venta: S/ ${p.venta}</span>
                            <span>Meta: S/ ${p.cuota}</span>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        }
    }

    cargarDatos();

    // Configurar el botón de salir
    const btnLogout = document.getElementById('logoutBtn');
    if(btnLogout) {
        btnLogout.onclick = () => {
            localStorage.removeItem('cod_promotora');
            window.location.href = 'index.html';
        };
    }
}

// --- ESCUCHAR LA TECLA ENTER EN EL LOGIN ---
// Solo si estamos en la página de login (donde existe el input 'password')
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            intentarLogin();
        }
    });
}