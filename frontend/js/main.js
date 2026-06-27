// frontend/js/main.js

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

// ─── P3: Identificador de usuario persistente ───
function getOrCreateUserId() {
    let userId = localStorage.getItem('barked_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('barked_user_id', userId);
        localStorage.setItem('barked_user_first_visit', new Date().toISOString());
        localStorage.setItem('barked_user_session_count', '1');
    } else {
        const prev = parseInt(localStorage.getItem('barked_user_session_count') || '1');
        localStorage.setItem('barked_user_session_count', String(prev + 1));
    }
    return userId;
}

const BARKED_USER_ID      = getOrCreateUserId();
const BARKED_SESSION_COUNT = parseInt(localStorage.getItem('barked_user_session_count') || '1');
const BARKED_FIRST_VISIT   = localStorage.getItem('barked_user_first_visit');

// ─── P2: Favoritos ───
let favorites = JSON.parse(localStorage.getItem('barked_favorites') || '[]');

function saveFavorites() {
    localStorage.setItem('barked_favorites', JSON.stringify(favorites));
}

function isFavorite(productId) {
    return favorites.some(f => f.id === productId);
}

function toggleFavorite(productId) {
    const idx = favorites.findIndex(f => f.id === productId);
    if (idx === -1) {
        // Buscar el producto en el DOM por data-id
        const card = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (card) {
            const raw = card.dataset.product;
            if (raw) favorites.push({ ...JSON.parse(raw), savedAt: new Date().toISOString() });
        }
        saveFavorites();
        if (window._trackFavoriteToggle) window._trackFavoriteToggle(productId, true);
        return true;
    } else {
        favorites.splice(idx, 1);
        saveFavorites();
        if (window._trackFavoriteToggle) window._trackFavoriteToggle(productId, false);
        return false;
    }
}

// Handler global — el botón llama a esto con solo el ID
window.triggerToggleFavorite = function(productId, btn) {
    const added = toggleFavorite(productId);
    btn.classList.toggle('favorited', added);
    btn.title = added ? 'Quitar de favoritos' : 'Agregar a favoritos';
};

// ─── Carrito ───
let cart = JSON.parse(localStorage.getItem('barked_cart') || '[]');

function saveCart() {
    localStorage.setItem('barked_cart', JSON.stringify(cart));
    updateCartCounter();
}

function addToCart(product, quantity = 1) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    saveCart();
    // P4: registrar si el producto tenía oferta y si hubo un clic de promo previo
    if (window._trackCartAfterPromo) window._trackCartAfterPromo(product.id, product.name);
    alert(`¡${product.name} fue añadido al carrito!`);
}

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// ─── Card de producto ───
function createProductCard(product) {
    const hasDiscount = product.original_price && product.original_price > product.price;
    const categoryLabel = product.category ? product.category.toUpperCase() : '';
    const imageUrl = product.image_url && product.image_url.trim() !== ''
        ? product.image_url
        : `https://placehold.co/300x350?text=${encodeURIComponent(product.name)}`;
    const alreadyFav = isFavorite(product.id);

    // Guardar el objeto producto en data-product (escapado para HTML)
    const productDataAttr = JSON.stringify(product)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');

    return `
        <div class="product-card" data-id="${product.id}" data-product="${productDataAttr}">
            <div class="product-image">
                ${product.stock === 0
                    ? `<span class="badge out-of-stock">Agotado</span>`
                    : hasDiscount
                        ? `<span class="badge offer" style="cursor:pointer"
                             onclick="window._trackPromoClick && window._trackPromoClick(${product.id}, ${JSON.stringify(product.name)})">
                             Oferta
                           </span>`
                        : `<span class="badge">Nuevo</span>`
                }
                <button
                    class="btn-favorite ${alreadyFav ? 'favorited' : ''}"
                    title="${alreadyFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                    data-product-id="${product.id}"
                    onclick="window.triggerToggleFavorite(${product.id}, this)">
                    &#9829;
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
                    onclick='window.triggerAddToCart(${product.id})'>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;
}

window.triggerAddToCart = function(productId) {
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (card && card.dataset.product) {
        addToCart(JSON.parse(card.dataset.product));
    }
};

window.createProductCard = createProductCard;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // P4: registrar búsqueda realizada después de un clic en promoción
            if (window._trackSearchAfterPromo) window._trackSearchAfterPromo();
            const query = document.getElementById('search-input').value.trim();
            if (!query) return;
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            window.location.href = isInPagesFolder
                ? `new.html?q=${encodeURIComponent(query)}`
                : `pages/new.html?q=${encodeURIComponent(query)}`;
        });
    }
});