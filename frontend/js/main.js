// frontend/js/main.js

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

// ─────────────────────────────────────────────
// P3: Identificador de usuario persistente
// Genera un ID único la primera vez y lo guarda
// en localStorage para detectar visitas recurrentes
// ─────────────────────────────────────────────
function getOrCreateUserId() {
    let userId = localStorage.getItem('barked_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('barked_user_id', userId);
        localStorage.setItem('barked_user_first_visit', new Date().toISOString());
        localStorage.setItem('barked_user_session_count', '1');
    } else {
        // Usuario recurrente — incrementar contador de sesiones
        const prev = parseInt(localStorage.getItem('barked_user_session_count') || '1');
        localStorage.setItem('barked_user_session_count', String(prev + 1));
    }
    return userId;
}

const BARKED_USER_ID = getOrCreateUserId();
const BARKED_SESSION_COUNT = parseInt(localStorage.getItem('barked_user_session_count') || '1');
const BARKED_FIRST_VISIT = localStorage.getItem('barked_user_first_visit');

// ─────────────────────────────────────────────
// P2: Favoritos persistentes
// ─────────────────────────────────────────────
let favorites = JSON.parse(localStorage.getItem('barked_favorites')) || [];

function saveFavorites() {
    localStorage.setItem('barked_favorites', JSON.stringify(favorites));
}

function isFavorite(productId) {
    return favorites.some(f => f.id === productId);
}

function toggleFavorite(product) {
    const idx = favorites.findIndex(f => f.id === product.id);
    if (idx === -1) {
        favorites.push({ ...product, savedAt: new Date().toISOString() });
        saveFavorites();
        return true; // agregado
    } else {
        favorites.splice(idx, 1);
        saveFavorites();
        return false; // removido
    }
}

window.triggerToggleFavorite = function(productJson, btn) {
    const product = JSON.parse(productJson);
    const added = toggleFavorite(product);
    btn.classList.toggle('favorited', added);
    btn.title = added ? 'Quitar de favoritos' : 'Agregar a favoritos';
    // Notificar a analytics
    if (window._trackFavoriteToggle) window._trackFavoriteToggle(product.id, added);
};

// ─────────────────────────────────────────────
// Carrito
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Card de producto — ahora incluye botón ❤️
// ─────────────────────────────────────────────
function createProductCard(product) {
    const hasDiscount = product.original_price && product.original_price > product.price;
    const categoryLabel = product.category ? product.category.toUpperCase() : '';
    const imageUrl = product.image_url && product.image_url.trim() !== ''
        ? product.image_url
        : `https://placehold.co/300x350?text=${encodeURIComponent(product.name)}`;
    const alreadyFav = isFavorite(product.id);
    const productJson = JSON.stringify(product).replace(/'/g, '&#39;');

    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <span class="badge ${product.stock === 0 ? 'out-of-stock' : (hasDiscount ? 'offer' : '')}">
                    ${product.stock === 0 ? 'Agotado' : (hasDiscount ? 'Oferta' : 'Nuevo')}
                </span>
                <button
                    class="btn-favorite ${alreadyFav ? 'favorited' : ''}"
                    title="${alreadyFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                    onclick="window.triggerToggleFavorite('${productJson}', this)">
                    ♥
                </button>
                <img src="${imageUrl}" alt="${product.name}"
                     onerror="this.src='https://placehold.co/300x350?text=BarkedShop'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${categoryLabel ? `<p class="category">${categoryLabel}</p>` : ''}
                <div class="price-container">
                    <span class="price">$${Number(product.price).toFixed(2)}</span>
                    ${hasDiscount ? `<span class="original-price">$${Number(product.original_price).toFixed(2)}</span>` : ''}
                </div>
                <p class="stock-info">${product.stock > 0 ? `Unidades: ${product.stock}` : 'Fuera de Stock'}</p>
                <button class="btn-add-cart" ${product.stock === 0 ? 'disabled' : ''}
                    onclick='window.triggerAddToCart(${JSON.stringify(product)})'>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;
}

window.triggerAddToCart = function(product) { addToCart(product); };
window.createProductCard = createProductCard;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('search-input').value.trim();
            if (!query) return;
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isInPagesFolder
                ? `new.html?q=${encodeURIComponent(query)}`
                : `pages/new.html?q=${encodeURIComponent(query)}`;
        });
    }
});
