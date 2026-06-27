const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000/api';

async function renderCatalog() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '<p>Buscando últimos artículos en almacén...</p>';

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';

    // Detectar categoría por pathname — más robusto que leer ?category= de la URL
    const path = window.location.pathname.toLowerCase();
    let category = '';
    if (path.includes('women')) category = 'women';
    else if (path.includes('men')) category = 'men';
    else if (path.includes('new')) category = 'new-in';
    else if (path.includes('sale')) category = 'sale';

    // Si viene ?category= explícito en la URL, tiene prioridad
    const categoryParam = urlParams.get('category');
    if (categoryParam) category = categoryParam;

    let endpoint = `${BASE_URL}/products?limit=30`;
    if (category && !query) endpoint += `&category=${category}`;
    if (query) endpoint += `&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Error en respuesta HTTP');
        const json = await response.json();
        const products = json.data || [];

        if (products.length === 0) {
            container.innerHTML = '<p>No se encontraron productos en este momento.</p>';
            return;
        }

        container.innerHTML = products.map(p => window.createProductCard(p)).join('');
    } catch (err) {
        console.error('Catalog error:', err);
        container.innerHTML = '<p>Error al conectar con la base de datos de BarkedShop.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderCatalog);