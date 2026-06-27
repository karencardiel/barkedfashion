// frontend/js/main.js
 
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:3000/api' 
    : '/api';
 
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
 
function createProductCard(product) {
    const hasDiscount = product.original_price && product.original_price > product.price;
 
    // La BD devuelve category_id (número), no "category" (texto)
    // Usamos un mapa o simplemente omitimos si no viene el nombre
    const categoryLabel = product.category
        ? product.category.toUpperCase()
        : '';
 
    // Imagen: usar image_url de la BD si existe, si no un fallback confiable
    const imageUrl = product.image_url && product.image_url.trim() !== ''
        ? product.image_url
        : `https://placehold.co/300x350?text=${encodeURIComponent(product.name)}`;
 
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <span class="badge ${product.stock === 0 ? 'out-of-stock' : (hasDiscount ? 'offer' : '')}">
                    ${product.stock === 0 ? 'Agotado' : (hasDiscount ? 'Oferta' : 'Nuevo')}
                </span>
                <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://placehold.co/300x350?text=BarkedShop'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${categoryLabel ? `<p class="category">${categoryLabel}</p>` : ''}
                <div class="price-container">
                    <span class="price">$${Number(product.price).toFixed(2)}</span>
                    ${hasDiscount ? `<span class="original-price">$${Number(product.original_price).toFixed(2)}</span>` : ''}
                </div>
                <p class="stock-info">${product.stock > 0 ? `Unidades: ${product.stock}` : 'Fuera de Stock'}</p>
                <button class="btn-add-cart" ${product.stock === 0 ? 'disabled' : ''} onclick='window.triggerAddToCart(${JSON.stringify(product)})'>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;
}
 
window.triggerAddToCart = function(product) {
    addToCart(product);
};
 
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
            const targetUrl = isInPagesFolder
                ? `new.html?q=${encodeURIComponent(query)}`
                : `pages/new.html?q=${encodeURIComponent(query)}`;
 
            window.location.href = targetUrl;
        });
    }
});