const express = require('express');
const router  = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

router.post('/', async (req, res) => {
    const m = req.body;

    try {
        await sql`
            INSERT INTO analytics (
                session_id,
                timestamp,
                duration_seconds,
                pages_count,
                search_queries_count,

                user_id,
                session_count,
                first_visit,
                is_returning_user,

                categories_count,
                categories_list,

                favorites_added_count,
                favorites_added_list,
                products_viewed_json,

                used_search,
                clicks_total,
                clicks_favorite,
                clicks_add_to_cart,
                clicks_search,
                clicks_navigation,

                promo_clicks_count,
                promo_clicks_list,
                cart_after_promo_count,
                cart_after_promo_list,
                search_after_promo_count
            ) VALUES (
                ${m.sessionId},
                ${m.timestamp},
                ${m.durationSeconds},
                ${m.pagesCount},
                ${m.searchQueriesCount},

                ${m.userId || null},
                ${m.sessionCount || 1},
                ${m.firstVisit || null},
                ${m.isReturningUser || false},

                ${m.categoriesCount || 0},
                ${JSON.stringify(m.categoriesList || [])},

                ${m.favoritesAddedCount || 0},
                ${JSON.stringify(m.favoritesAddedList || [])},
                ${JSON.stringify(m.productsViewedTimers || {})},

                ${m.usedSearch || 'No'},
                ${m.clicksBreakdown?.total || 0},
                ${m.clicksBreakdown?.favorite || 0},
                ${m.clicksBreakdown?.addToCart || 0},
                ${m.clicksBreakdown?.search || 0},
                ${m.clicksBreakdown?.navigation || 0},

                ${m.promoClicksCount || 0},
                ${JSON.stringify(m.promoClicksList || [])},
                ${m.cartAfterPromoCount || 0},
                ${JSON.stringify(m.cartAfterPromoList || [])},
                ${m.searchAfterPromoCount || 0}
            )
        `;

        res.status(204).end();
    } catch (error) {
        console.error("Error guardando telemetría:", error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

module.exports = router;
