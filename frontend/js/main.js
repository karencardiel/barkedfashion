// Configuración global del endpoint del Servidor Express
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global de la Bolsa de Compras
let cart = JSON.parse(localStorage.getItem('barked_cart')) || [];

function saveCart() {
    localStorage.setItem('barked_cart', JSON.stringify(cart));
    updateCartCounter();
}

function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    saveCart();
    alert(`¡${product.name} fue añadido al carrito!`);
}

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = total;
    }
}

// Generador HTML dinámico para inyectar en cualquier catálogo
function createProductCard(product) {
    const hasDiscount = product.original_price && product.original_price > product.price;
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <span class="badge ${product.stock === 0 ? 'out-of-stock' : (hasDiscount ? 'offer' : '')}">
                    ${product.stock === 0 ? 'Agotado' : (hasDiscount ? 'Oferta' : 'Nuevo')}
                </span>
                <img src="https://via.placeholder.com/300x350?text=${encodeURIComponent(product.name)}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="category">${product.category.toUpperCase()}</p>
                <div class="price-container">
                    <span class="price">$${product.price.toFixed(2)}</span>
                    ${hasDiscount ? `<span class="original-price">$${product.original_price.toFixed(2)}</span>` : ''}
                </div>
                <p class="stock-info">${product.stock > 0 ? `Unidades: ${product.stock}` : 'Fuera de Stock'}</p>
                <button class="btn-add-cart" ${product.stock === 0 ? 'disabled' : ''} onclick='window.triggerAddToCart(${JSON.stringify(product)})'>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;
}

// Exponer triggers globales para eventos onclick inline generados dinámicamente
window.triggerAddToCart = function(product) {
    addToCart(product);
};

// Exponer la función de renderizado para asegurar su acceso desde products.js u otras vistas
window.createProductCard = createProductCard;

// Escuchador común global
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const query = document.getElementById('search-input').value.trim();
            if (!query) return; // Si la búsqueda está vacía, no hace nada

            // Parche dinámico para corregir rutas relativas (Evita errores 404 al cambiar de página)
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            
            let targetUrl = '';
            if (isInPagesFolder) {
                // Si ya estamos dentro de /pages/ (ej: men.html), new.html está en este mismo nivel
                targetUrl = `new.html?q=${encodeURIComponent(query)}`;
            } else {
                // Si estamos en la raíz (index.html), debemos entrar primero a la carpeta pages/
                targetUrl = `pages/new.html?q=${encodeURIComponent(query)}`;
            }

            // Ejecuta la redirección correcta
            window.location.href = targetUrl;
        });
    }
});