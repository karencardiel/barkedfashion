// frontend/js/analytics.js

// Estado de la sesión actual de analíticas
const sessionAnalytics = {
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
    startTime: Date.now(),
    pagesVisited: new Set(),
    categoriesExplored: new Set(),
    searchCount: 0,
    favoritesCount: 0,
    clicks: {
        total: 0,
        addToCart: 0,
        favorite: 0,
        search: 0,
        recommendation: 0,
        navigation: 0
    },
    productTimers: {} // Guarda el tiempo por producto visto
};

// Registrar la página actual y su categoría al cargar
function recordPageLoad() {
    const path = window.location.pathname;
    sessionAnalytics.pagesVisited.add(path);

    // Detectar categorías exploradas automáticamente
    if (path.includes('women.html')) sessionAnalytics.categoriesExplored.add('women');
    if (path.includes('men.html')) sessionAnalytics.categoriesExplored.add('men');
    if (path.includes('new.html')) sessionAnalytics.categoriesExplored.add('new');

    // Si es una página de producto, inicializar cronómetro dinámico
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        sessionAnalytics.productTimers[productId] = {
            startTime: Date.now(),
            duration: 0
        };
    }
}

// Clasificar e identificar el tipo de clics en la interfaz
function trackUserClicks() {
    document.addEventListener('click', (e) => {
        sessionAnalytics.clicks.total++;

        // 1. Clic en "Añadir al Carrito"
        if (e.target.closest('.btn-add-cart') || e.target.closest('.btn-checkout')) {
            sessionAnalytics.clicks.addToCart++;
        }
        // 2. Clic en barra de búsqueda o botón de lupa
        else if (e.target.closest('#search-form button') || e.target.closest('#search-input')) {
            sessionAnalytics.clicks.search++;
        }
        // 3. Clic en Favoritos (asumiendo clases futuras .btn-favorite)
        else if (e.target.closest('.btn-favorite')) {
            sessionAnalytics.clicks.favorite++;
            sessionAnalytics.favoritesCount++;
        }
        // 4. Clic en Recomendaciones (bloques con clase .recommended-item)
        else if (e.target.closest('.recommended-item')) {
            sessionAnalytics.clicks.recommendation++;
        }
        // 5. Navegación por menú estándar
        else if (e.target.closest('.nav-links a') || e.target.closest('.logo-container')) {
            sessionAnalytics.clicks.navigation++;
        }
    });
}

// Capturar cuando se usa activamente la función de búsqueda
function trackSearchActivity() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', () => {
            sessionAnalytics.searchCount++;
        });
    }
}

// Calcular la duración final de la sesión o del producto y enviar datos al Backend
function sendAnalyticsData() {
    const totalSessionTime = Math.round((Date.now() - sessionAnalytics.startTime) / 1000); // en segundos

    // Cerrar cronómetros de productos si siguen abiertos
    for (let pId in sessionAnalytics.productTimers) {
        if (sessionAnalytics.productTimers[pId].duration === 0) {
            sessionAnalytics.productTimers[pId].duration = Math.round((Date.now() - sessionAnalytics.productTimers[pId].startTime) / 1000);
        }
    }

    // Estructura limpia que responde al 100% a tus 6 preguntas de investigación
    const payload = {
        sessionId: sessionAnalytics.sessionId,
        timestamp: new Date().toISOString(),
        durationSeconds: totalSessionTime,
        pagesCount: sessionAnalytics.pagesVisited.size,
        categoriesCount: sessionAnalytics.categoriesExplored.size,
        categoriesList: Array.from(sessionAnalytics.categoriesExplored),
        searchQueriesCount: sessionAnalytics.searchCount,
        usedSearch: sessionAnalytics.searchCount > 0 ? 'Sí' : 'No',
        favoritesAddedCount: sessionAnalytics.favoritesCount,
        clicksBreakdown: sessionAnalytics.clicks,
        productsViewedTimers: sessionAnalytics.productTimers
    };

    // sendBeacon transmite los datos al servidor incluso si el usuario cierra bruscamente la pestaña
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('http://localhost:3000/api/analytics', blob);
}

// Inicialización de escuchadores
document.addEventListener('DOMContentLoaded', () => {
    recordPageLoad();
    trackUserClicks();
    trackSearchActivity();
});

// Enviar datos de telemetría de manera automática cuando el usuario decide irse de la app
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        sendAnalyticsData();
    }
});