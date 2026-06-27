// frontend/js/analytics.js

const sessionAnalytics = {
    // P3: identidad persistente (definida en main.js antes de este script)
    userId:        typeof BARKED_USER_ID       !== 'undefined' ? BARKED_USER_ID       : 'unknown',
    sessionCount:  typeof BARKED_SESSION_COUNT !== 'undefined' ? BARKED_SESSION_COUNT : 1,
    firstVisit:    typeof BARKED_FIRST_VISIT   !== 'undefined' ? BARKED_FIRST_VISIT   : new Date().toISOString(),
    isReturning:   typeof BARKED_SESSION_COUNT !== 'undefined' ? BARKED_SESSION_COUNT > 1 : false,

    sessionId:   'sess_' + Math.random().toString(36).substr(2, 9),
    startTime:   Date.now(),

    pagesVisited:       new Set(),
    categoriesExplored: new Set(),
    searchCount:        0,

    // P2: favoritos y tiempos de visualización por producto
    favoritesAdded:   [],   // IDs de productos marcados como fav en esta sesión
    favoritesRemoved: [],   // IDs removidos
    productTimers:    {},   // { productId: { startTime, duration } }

    clicks: {
        total: 0, addToCart: 0, favorite: 0,
        search: 0, recommendation: 0, navigation: 0
    }
};

// ─────────────────────────────────────────────
// Registrar página actual
// ─────────────────────────────────────────────
function recordPageLoad() {
    const path = window.location.pathname;
    sessionAnalytics.pagesVisited.add(path);

    if (path.includes('women'))  sessionAnalytics.categoriesExplored.add('women');
    if (path.includes('men'))    sessionAnalytics.categoriesExplored.add('men');
    if (path.includes('new'))    sessionAnalytics.categoriesExplored.add('new-in');
    if (path.includes('sale'))   sessionAnalytics.categoriesExplored.add('sale');

    // P2: iniciar cronómetro de producto si la URL tiene ?id=
    const productId = new URLSearchParams(window.location.search).get('id');
    if (productId) {
        sessionAnalytics.productTimers[productId] = { startTime: Date.now(), duration: 0 };
    }
}

// P2: también cronometrar productos al hacer hover prolongado en la card
function trackProductHover() {
    let hoverStart = null;
    let hoveredId  = null;

    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.product-card');
        if (card && card.dataset.id !== hoveredId) {
            hoveredId  = card.dataset.id;
            hoverStart = Date.now();
        }
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.product-card');
        if (card && card.dataset.id === hoveredId && hoverStart) {
            const elapsed = Math.round((Date.now() - hoverStart) / 1000);
            if (elapsed >= 2) { // solo registrar si estuvo 2+ segundos
                if (!sessionAnalytics.productTimers[hoveredId]) {
                    sessionAnalytics.productTimers[hoveredId] = { startTime: hoverStart, duration: 0 };
                }
                sessionAnalytics.productTimers[hoveredId].duration += elapsed;
            }
            hoverStart = null;
            hoveredId  = null;
        }
    });
}

// ─────────────────────────────────────────────
// P2: hook que main.js llama al toglear favorito
// ─────────────────────────────────────────────
window._trackFavoriteToggle = function(productId, added) {
    sessionAnalytics.clicks.favorite++;
    if (added) {
        sessionAnalytics.favoritesAdded.push(String(productId));
    } else {
        sessionAnalytics.favoritesRemoved.push(String(productId));
        const idx = sessionAnalytics.favoritesAdded.indexOf(String(productId));
        if (idx !== -1) sessionAnalytics.favoritesAdded.splice(idx, 1);
    }
};

// ─────────────────────────────────────────────
// Clics generales
// ─────────────────────────────────────────────
function trackUserClicks() {
    document.addEventListener('click', (e) => {
        sessionAnalytics.clicks.total++;
        if      (e.target.closest('.btn-add-cart') || e.target.closest('.btn-checkout'))  sessionAnalytics.clicks.addToCart++;
        else if (e.target.closest('#search-form button') || e.target.closest('#search-input')) sessionAnalytics.clicks.search++;
        else if (e.target.closest('.btn-favorite'))  sessionAnalytics.clicks.favorite++;
        else if (e.target.closest('.recommended-item')) sessionAnalytics.clicks.recommendation++;
        else if (e.target.closest('.nav-links a') || e.target.closest('.logo-container')) sessionAnalytics.clicks.navigation++;
    });
}

function trackSearchActivity() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) searchForm.addEventListener('submit', () => sessionAnalytics.searchCount++);
}

// ─────────────────────────────────────────────
// Envío de datos al backend
// ─────────────────────────────────────────────
function sendAnalyticsData() {
    const totalSessionTime = Math.round((Date.now() - sessionAnalytics.startTime) / 1000);

    // Cerrar cronómetros abiertos
    for (const pId in sessionAnalytics.productTimers) {
        if (sessionAnalytics.productTimers[pId].duration === 0) {
            sessionAnalytics.productTimers[pId].duration =
                Math.round((Date.now() - sessionAnalytics.productTimers[pId].startTime) / 1000);
        }
    }

    const payload = {
        // Identidad — P3
        userId:          sessionAnalytics.userId,
        sessionCount:    sessionAnalytics.sessionCount,
        firstVisit:      sessionAnalytics.firstVisit,
        isReturningUser: sessionAnalytics.isReturning,

        // Sesión
        sessionId:           sessionAnalytics.sessionId,
        timestamp:           new Date().toISOString(),
        durationSeconds:     totalSessionTime,
        pagesCount:          sessionAnalytics.pagesVisited.size,
        categoriesCount:     sessionAnalytics.categoriesExplored.size,
        categoriesList:      Array.from(sessionAnalytics.categoriesExplored),

        // Búsqueda — P5
        searchQueriesCount:  sessionAnalytics.searchCount,
        usedSearch:          sessionAnalytics.searchCount > 0 ? 'Sí' : 'No',

        // Favoritos — P2
        favoritesAddedCount:   sessionAnalytics.favoritesAdded.length,
        favoritesAddedList:    sessionAnalytics.favoritesAdded,
        favoritesRemovedList:  sessionAnalytics.favoritesRemoved,

        // Tiempo por producto — P2
        productsViewedTimers: sessionAnalytics.productTimers,

        // Clics — P6
        clicksBreakdown: sessionAnalytics.clicks
    };

    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : '/api';

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(`${baseUrl}/analytics`, blob);
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    recordPageLoad();
    trackUserClicks();
    trackSearchActivity();
    trackProductHover();
});

window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendAnalyticsData();
});
