async function renderCatalog() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '<p>Buscando últimos artículos en almacén...</p>';

    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category') || "";
    const query = urlParams.get('q') || "";

    // Autodetectar categoría basada en el nombre del archivo de la página
    if (window.location.pathname.includes('women.html')) category = 'women';
    if (window.location.pathname.includes('men.html')) category = 'men';

    // Construcción dinámica del Query String a la API
    let endpoint = `${API_BASE_URL}/products?limit=30`;
    if (category) endpoint += `&category=${category}`;
    if (query) endpoint += `&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Error en respuesta HTTP");
        const json = await response.json();
        const products = json.data || [];

        if (products.length === 0) {
            container.innerHTML = '<p>No se encontraron productos coincidentes en este momento.</p>';
            return;
        }

        container.innerHTML = products.map(p => createProductCard(p)).join('');
    } catch (err) {
        console.error("Catalog error:", err);
        container.innerHTML = '<p>Error al conectar con la base de datos de BarkedShop.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderCatalog);