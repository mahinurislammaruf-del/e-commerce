// Pazaro BD — Public Storefront Views & Interactive Flows
import { state, formatPrice, calcDiscountPercent, getCartTotals, getLocalOrders } from "/src/js/store.js";
import { escHtml, getProductImage, getStockBadge, renderStars, renderProductCard, renderHorizontalScroller, renderAdSlot, renderProductVideoSection } from "/src/js/ui-components.js";
import { SEED_GENERAL_SETTINGS } from "/src/js/seed-data.js";
import { getDivisions, getDivisionBn, getDistrictsByDivision } from "/src/js/bd-locations.js";
import { LOCAL_PHOTOS } from "/src/js/product-art.js";
import { getCustomerSession, isCustomerAdmin } from "/src/js/customer-auth.js";
export function renderHeader(currentRoute, searchQuery = "") {
	const g = state.general || SEED_GENERAL_SETTINGS;
	const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
	const wishCount = state.wishlist.length;
	const session = getCustomerSession();
	const initial = session?.fullName ? session.fullName.trim().charAt(0).toUpperCase() : "U";
	const navItems = [
		{
			label: "Home",
			hash: "#home",
			key: "home"
		},
		{
			label: "Categories",
			hash: "#categories",
			key: "categories"
		},
		{
			label: "Deals",
			hash: "#deals",
			key: "deals"
		},
		{
			label: "New Arrivals",
			hash: "#new-arrivals",
			key: "new-arrivals"
		},
		{
			label: "Best Sellers",
			hash: "#best-sellers",
			key: "best-sellers"
		},
		{
			label: "Blog",
			hash: "#blog",
			key: "blog"
		},
		{
			label: "Track Order",
			hash: "#track-order",
			key: "track-order"
		}
	];
	const rawSiteName = String(g.siteName || "Pazaro BD").trim() || "Pazaro BD";
	const nameParts = rawSiteName.split(/\s+/);
	const hasSuffix = nameParts.length > 1;
	const primaryBrandWord = hasSuffix ? nameParts.slice(0, -1).join(" ") : rawSiteName;
	const accentBrandWord = hasSuffix ? nameParts[nameParts.length - 1] : "";
	return `
    <header class="site-header">
      <div class="container">
        <div class="header-main">
          <a href="#home" class="brand-logo" aria-label="${escHtml(rawSiteName)} Home">
            ${g.logoUrl ? `<img src="${escHtml(g.logoUrl)}" alt="${escHtml(rawSiteName)} logo" />` : `<span class="brand-logo-frame"><img src="/assets/pazaro-logo.svg" alt="${escHtml(rawSiteName)} logo" class="brand-logo-icon" /></span>`}
            <span class="brand-text-stack">
              <span class="brand-wordmark">
                <span class="brand-word-main">${escHtml(primaryBrandWord)}</span>${accentBrandWord ? `<span class="brand-word-accent">${escHtml(accentBrandWord)}</span>` : ""}
              </span>
              <span class="brand-tagline">${escHtml(g.tagline || "Your Bazaar, Smarter")}</span>
            </span>
          </a>

          <div class="header-search-wrap">
            <form class="header-search-form" id="global-search-form" role="search">
              <label for="global-search-input" class="sr-only">Search products</label>
              <input
                type="search"
                id="global-search-input"
                class="header-search-input"
                placeholder="Search phones, laptops, Panjabi, honey..."
                value="${escHtml(searchQuery)}"
                autocomplete="off"
              />
              <button type="submit" class="header-search-btn" aria-label="Search">🔍</button>
            </form>
            <div class="search-suggestions" id="search-suggestions" hidden></div>
          </div>

          <div class="header-actions">
            <button type="button" class="icon-btn" data-action="nav-wishlist" title="Wishlist" aria-label="Wishlist">
              ♡
              ${wishCount > 0 ? `<span class="count-badge tabular-nums">${wishCount}</span>` : ""}
            </button>
            <button type="button" class="icon-btn" id="header-cart-btn" data-action="open-cart" title="Shopping Cart" aria-label="Open Cart">
              🛒
              <span class="count-badge tabular-nums" id="header-cart-count">${cartCount}</span>
            </button>
            ${session ? `
              <div class="header-user-wrap">
                <a
                  href="#account"
                  class="header-user-chip ${currentRoute === "account" ? "is-active" : ""}"
                  data-action="open-account"
                  title="Open Account & Settings (${escHtml(session.fullName)})"
                  aria-label="Open Account and Settings for ${escHtml(session.fullName)}"
                >
                  <span class="header-user-avatar" aria-hidden="true">
                    ${session.avatarUrl ? `<img src="${escHtml(session.avatarUrl)}" alt="" class="header-user-avatar-img" />` : escHtml(initial)}
                  </span>
                  <span class="header-user-name">${escHtml(session.fullName)}</span>
                  <span class="header-user-caret" aria-hidden="true">⚙</span>
                </a>
                <button type="button" class="header-logout-btn" data-action="customer-logout">Log Out</button>
              </div>
            ` : ""}
          </div>
        </div>
      </div>

      <nav class="header-subnav" aria-label="Main storefront navigation">
        <div class="container">
          <div class="subnav-wrap scroller-wrap">
            <button type="button" class="scroller-arrow subnav-arrow subnav-prev" data-scroll-target="header-subnav-scroll" data-dir="-1" aria-label="Scroll menu left">‹</button>
            <div class="subnav-scroll" id="header-subnav-scroll">
              ${navItems.map((item) => `
                <a href="${item.hash}" class="subnav-link ${currentRoute === item.key ? "active" : ""}">${item.label}</a>
              `).join("")}
            </div>
            <button type="button" class="scroller-arrow subnav-arrow subnav-next" data-scroll-target="header-subnav-scroll" data-dir="1" aria-label="Scroll menu right">›</button>
          </div>
        </div>
      </nav>
    </header>
  `;
}
export function renderFooter(currentRoute = "home") {
	const g = state.general || SEED_GENERAL_SETTINGS;
	const session = getCustomerSession();
	const canAccessAdmin = isCustomerAdmin(session);
	const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
	return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h3 style="margin:0 0 8px;color:#ffffff;font-size:1.3rem;">${escHtml(g.siteName || "Pazaro BD")}</h3>
            <p style="margin:0 0 12px;font-size:0.88rem;opacity:0.85;">${escHtml(g.tagline || "Your Bazaar, Smarter")}</p>
            <p style="margin:0 0 6px;font-size:0.84rem;">${escHtml(g.address)}</p>
            <p style="margin:0;font-size:0.84rem;">Phone: ${escHtml(g.phone)} · Email: ${escHtml(g.email)}</p>
          </div>

          <div class="footer-col">
            <h4>Shop</h4>
            <ul class="footer-links">
              <li><a href="#deals">Flash Deals</a></li>
              <li><a href="#new-arrivals">New Arrivals</a></li>
              <li><a href="#best-sellers">Best Sellers</a></li>
              <li><a href="#categories">All Categories</a></li>
              <li><a href="#wishlist">Saved Wishlist</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Customer Care</h4>
            <ul class="footer-links">
              <li><a href="#account">My Account & Settings</a></li>
              <li><a href="#help-center">Help Center</a></li>
              <li><a href="#track-order">Track Order</a></li>
              <li><a href="#returns-refunds">Returns and Refunds</a></li>
              <li><a href="#contact-us">Contact Us</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>About Pazaro BD</h4>
            <ul class="footer-links">
              <li><a href="#about-us">Our Story</a></li>
              <li><a href="#blog">Tech & Lifestyle Blog</a></li>
              ${canAccessAdmin ? `<li><a href="/admin" data-action="go-admin">Admin Portal</a></li>` : ""}
            </ul>
            <div style="display:flex;gap:12px;margin-top:14px;font-size:0.88rem;">
              <a href="${escHtml(g.facebookUrl || "#")}" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="${escHtml(g.instagramUrl || "#")}" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="${escHtml(g.youtubeUrl || "#")}" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>${escHtml(g.footerText)}</span>
          <span>Prices in Bangladeshi Taka (৳) · Cash on Delivery, bKash & Nagad</span>
        </div>
      </div>
    </footer>

    <a
      href="https://wa.me/${escHtml(String(g.whatsapp || "8801700000000").replace(/\D/g, ""))}"
      target="_blank"
      rel="noopener noreferrer"
      class="floating-whatsapp"
      aria-label="Chat on WhatsApp"
      title="Chat with Pazaro BD on WhatsApp"
    >
      💬
    </a>

    <button type="button" class="back-to-top" id="back-to-top-btn" aria-label="Back to top">↑</button>

    <nav class="mobile-bottom-nav ${canAccessAdmin ? "mobile-bottom-nav--5" : ""}" aria-label="Mobile navigation">
      <a href="#home" class="mobile-nav-item ${currentRoute === "home" ? "active" : ""}"><span>🏠</span><span>Home</span></a>
      <a href="#categories" class="mobile-nav-item ${currentRoute === "categories" ? "active" : ""}"><span>🗂️</span><span>Categories</span></a>
      <button type="button" class="mobile-nav-item" data-action="open-cart"><span>🛒</span><span>Cart (${cartCount})</span></button>
      ${canAccessAdmin ? `<button type="button" class="mobile-nav-item" data-action="go-admin"><span>🛡️</span><span>Admin</span></button>` : ""}
      <a href="#account" class="mobile-nav-item mobile-nav-account ${currentRoute === "account" ? "active" : ""}" data-action="open-account" aria-label="My Account and Settings">
        ${session?.avatarUrl ? `<img src="${escHtml(session.avatarUrl)}" alt="" class="mobile-nav-avatar" />` : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`}
        <span>Account</span>
      </a>
    </nav>
  `;
}
export function renderHomeView(activeSlideIdx = 0) {
	const slides = state.theme?.heroSlides?.length ? state.theme.heroSlides : [];
	const promos = state.theme?.promoTiles?.length ? state.theme.promoTiles : [];
	const safeIdx = slides.length ? activeSlideIdx % slides.length : 0;
	const flashProducts = state.products.filter((p) => p.isFlashSale);
	const trendingProducts = state.products.filter((p) => p.isTrending);
	const newProducts = state.products.filter((p) => p.isNewArrival);
	const topTech = state.products.filter((p) => [
		"Phones",
		"Laptops",
		"Headphones",
		"Smart Watches",
		"Gaming",
		"Smart Home"
	].includes(p.category));
	const recommended = [...state.products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
	const recentProducts = state.recentlyViewed.map((id) => state.products.find((p) => p.id === id)).filter(Boolean);
	const publishedPosts = state.posts.filter((p) => p.published !== false).slice(0, 3);
	const topReviews = state.reviews.filter((r) => r.approved !== false).slice(0, 6);
	return `
    <main class="container">
      <!-- 1. Hero Slider -->
      <section class="hero-section" aria-label="Featured Promotions">
        <div class="hero-slider" id="hero-slider" data-slide-count="${slides.length}" data-active-index="${safeIdx}">
          <div class="hero-track" id="hero-track" style="transform: translate3d(-${safeIdx * 100}%, 0, 0);">
            ${slides.map((slide, idx) => {
		const featuredProd = slide.featuredProductId ? state.products.find((p) => String(p.id) === String(slide.featuredProductId)) : null;
		const animStyle = [
			"float",
			"orbit",
			"pulse",
			"zoom",
			"glide",
			"fade"
		].includes(slide.animStyle) ? slide.animStyle : "glide";
		const heroImg = slide.imageUrl || (featuredProd ? getProductImage(featuredProd, 0) : "") || LOCAL_PHOTOS.heroTech;
		return `
                <div class="hero-slide ${idx === safeIdx ? "active is-active" : ""}" data-slide-index="${idx}" data-anim="${escHtml(animStyle)}">
                  <div class="hero-copy">
                    <div class="hero-kicker">
                      ${slide.badgeText ? `<span class="hero-kicker-tag">${escHtml(slide.badgeText)}</span>` : ""}
                      <span>${escHtml(slide.kicker || "Pazaro BD Exclusive")}</span>
                    </div>
                    <h1 class="hero-title">${escHtml(slide.headline)}</h1>
                    <p class="hero-sub">${escHtml(slide.subtext)}</p>
                    <div class="hero-cta-row">
                      <a href="${escHtml(slide.buttonLink || "#deals")}" class="btn btn-accent hero-cta-btn">${escHtml(slide.buttonText || "Shop Now")} →</a>
                      ${featuredProd ? `
                        <a href="#product/${encodeURIComponent(featuredProd.id)}" class="hero-secondary-link">
                          ${escHtml(featuredProd.name)} · <strong>${formatPrice(featuredProd.price)}</strong>
                        </a>
                      ` : ""}
                    </div>
                  </div>
                  <div class="hero-media">
                    <img
                      class="hero-bg-img hero-bg-anim-${escHtml(animStyle)}"
                      src="${escHtml(heroImg)}"
                      alt="${escHtml(slide.headline)}"
                      loading="${idx === 0 ? "eager" : "lazy"}"
                      decoding="async"
                      draggable="false"
                    />
                    <div class="hero-media-scrim" aria-hidden="true"></div>
                  </div>
                </div>
              `;
	}).join("")}
          </div>
          ${slides.length > 1 ? `
            <button type="button" class="hero-nav-btn hero-prev" data-action="hero-prev" aria-label="Previous slide">‹</button>
            <button type="button" class="hero-nav-btn hero-next" data-action="hero-next" aria-label="Next slide">›</button>
            <div class="hero-bottom-bar">
              <div class="hero-dots">
                ${slides.map((_, idx) => `<button type="button" class="hero-dot ${idx === safeIdx ? "active" : ""}" data-action="hero-dot" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>`).join("")}
              </div>
              <div class="hero-slide-meta" aria-live="polite">
                <span class="hero-slide-counter tabular-nums" id="hero-slide-counter">${String(safeIdx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</span>
              </div>
            </div>
          ` : ""}
        </div>
      </section>

      <!-- Leaderboard Ad under Hero (collapses completely when empty) -->
      ${renderAdSlot("ad_hero_leaderboard")}

      <!-- 2. Swipeable Category Circles -->
      <section class="section-block section-categories-top" aria-label="Browse Categories">
        <div class="section-head">
          <h2 class="section-title">Shop by Category</h2>
          <div style="display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <a href="#categories" class="section-link">All Categories →</a>
            ${isCustomerAdmin() || state.isAdmin ? `<button type="button" class="btn btn-sm btn-outline" data-action="storefront-edit-category">✏️ Edit Category</button>` : ""}
          </div>
        </div>
        <div class="scroller-wrap">
          <button type="button" class="scroller-arrow scroller-prev" data-scroll-target="home-cat-scroller" data-dir="-1" aria-label="Scroll categories left">‹</button>
          <div class="cat-scroller" id="home-cat-scroller">
            ${state.categories.map((cat) => `
              <button type="button" class="cat-item" data-action="open-category" data-category="${escHtml(cat.name)}">
                <div class="cat-circle">
                  ${cat.imageUrl ? `<img src="${escHtml(cat.imageUrl)}" alt="${escHtml(cat.name)}" loading="lazy" decoding="async" />` : `<span aria-hidden="true">${escHtml(cat.icon || "🛍️")}</span>`}
                </div>
                <span class="cat-name">
                  ${escHtml(cat.name)}
                  ${cat.nameBn ? `<span class="cat-name-bn">${escHtml(cat.nameBn)}</span>` : ""}
                </span>
              </button>
            `).join("")}
          </div>
          <button type="button" class="scroller-arrow scroller-next" data-scroll-target="home-cat-scroller" data-dir="1" aria-label="Scroll categories right">›</button>
        </div>
      </section>

      <!-- 4. Product Scrollers -->
      ${renderHorizontalScroller("scroller-flash", "Flash Sale", flashProducts, {
		linkHash: "#deals",
		isFlash: true
	})}
      ${renderHorizontalScroller("scroller-trending", "Trending Now", trendingProducts, { linkHash: "#best-sellers" })}

      <!-- Mid Rectangle Ad -->
      <div style="margin: 12px 0;">${renderAdSlot("ad_mid_rectangle")}</div>

      <!-- 5. Promo Banner Tiles -->
      ${promos.length ? `
        <section class="section-block" aria-label="Featured Collections">
          <div class="promo-grid">
            ${promos.map((tile) => `
              <a href="${escHtml(tile.link || "#deals")}" class="promo-tile">
                <img src="${escHtml(tile.imageUrl || LOCAL_PHOTOS.audioGaming)}" alt="${escHtml(tile.title)}" loading="lazy" decoding="async" />
                <div class="promo-scrim"></div>
                <div class="promo-content">
                  <h3>${escHtml(tile.title)}</h3>
                  <p>${escHtml(tile.subtext)}</p>
                  <span class="btn btn-sm btn-accent">${escHtml(tile.buttonText || "Shop Now")}</span>
                </div>
              </a>
            `).join("")}
          </div>
        </section>
      ` : ""}

      ${renderHorizontalScroller("scroller-new", "New Arrivals", newProducts, { linkHash: "#new-arrivals" })}
      ${renderHorizontalScroller("scroller-tech", "Top Tech Picks", topTech, { linkHash: "#top-tech" })}
      ${renderHorizontalScroller("scroller-recommended", "Recommended For You", recommended, { linkHash: "#categories" })}
      ${recentProducts.length ? renderHorizontalScroller("scroller-recent", "Recently Viewed", recentProducts, { linkHash: "#categories" }) : ""}

      <!-- 6. Latest Blog Posts -->
      ${publishedPosts.length ? `
        <section class="section-block" aria-label="Latest Blog Posts">
          <div class="section-head">
            <h2 class="section-title">Tech Tips & Buying Guides</h2>
            <a href="#blog" class="section-link">Read Blog →</a>
          </div>
          <div class="blog-grid">
            ${publishedPosts.map((post) => `
              <article class="blog-card" data-action="open-post" data-id="${escHtml(post.id)}">
                <div class="blog-card-img">
                  <img src="${escHtml(post.coverImage || LOCAL_PHOTOS.heroWorkspace)}" alt="${escHtml(post.title)}" loading="lazy" decoding="async" />
                </div>
                <div class="blog-card-body">
                  <div class="blog-meta">${escHtml(post.category)}</div>
                  <h3>${escHtml(post.title)}</h3>
                  <p>${escHtml(post.excerpt || "")}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      ` : ""}

      <!-- 7. Customer Reviews -->
      <section class="section-block" aria-label="Customer Reviews">
        <div class="section-head">
          <h2 class="section-title">Loved by Thousands</h2>
          <span style="font-size:0.85rem;color:var(--muted);">Verified Shoppers Across Bangladesh</span>
        </div>
        <div class="reviews-grid">
          ${topReviews.map((rev) => `
            <article class="review-card">
              <div class="review-stars" aria-label="${rev.rating} out of 5 stars">${renderStars(rev.rating)}</div>
              <p class="review-text">"${escHtml(rev.comment)}"</p>
              <div class="review-author">${escHtml(rev.authorName)} · ${escHtml(rev.city || "Bangladesh")}</div>
            </article>
          `).join("")}
        </div>
      </section>

      <!-- 8. Newsletter -->
      <section class="section-block" aria-label="Newsletter Signup">
        <div class="newsletter-box">
          <div>
            <h2 style="margin:0 0 4px;font-size:1.35rem;">Stay in the Loop</h2>
            <p style="margin:0;font-size:0.9rem;opacity:0.9;">Get flash sale alerts, new gadget drops, and exclusive Dhaka & nationwide deals.</p>
          </div>
          <form class="newsletter-form" id="newsletter-form">
            <label for="newsletter-email" class="sr-only">Email address</label>
            <input type="email" id="newsletter-email" required placeholder="Enter your email address" />
            <button type="submit" class="btn btn-accent">Subscribe</button>
          </form>
        </div>
      </section>

      <!-- Footer Banner Ad -->
      <div style="margin: 12px 0;">${renderAdSlot("ad_footer_banner")}</div>
    </main>
  `;
}
export function renderCatalogView({ title, categoryFilter = "All", mode = "all", searchQuery = "", sortBy = "featured" }) {
	let items = [...state.products];
	if (mode === "deals") items = items.filter((p) => p.isFlashSale || calcDiscountPercent(p.price, p.oldPrice) >= 15);
	if (mode === "new") items = items.filter((p) => p.isNewArrival);
	if (mode === "bestsellers") items = [...items].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0));
	if (mode === "top-tech") items = items.filter((p) => [
		"Phones",
		"Laptops",
		"Headphones",
		"Smart Watches",
		"Gaming",
		"Smart Home"
	].includes(p.category));
	if (mode === "wishlist") items = items.filter((p) => state.wishlist.includes(p.id));
	if (categoryFilter && categoryFilter !== "All") {
		items = items.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());
	}
	if (searchQuery) {
		const q = searchQuery.toLowerCase();
		items = items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q)));
	}
	if (sortBy === "price-asc") items.sort((a, b) => a.price - b.price);
	if (sortBy === "price-desc") items.sort((a, b) => b.price - a.price);
	if (sortBy === "rating") items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
	return `
    <main class="container" style="padding-top:20px;padding-bottom:32px;">
      <div class="section-head" style="flex-wrap:wrap;">
        <div>
          <h1 class="section-title" style="margin:0;">${escHtml(title)}</h1>
          <div style="font-size:0.85rem;color:var(--muted);margin-top:2px;">
            Showing ${items.length} product${items.length === 1 ? "" : "s"}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
          <select class="field-select" id="catalog-cat-select" style="width:auto;min-height:42px;">
            <option value="All">All Categories</option>
            ${state.categories.map((c) => `
              <option value="${escHtml(c.name)}" ${categoryFilter === c.name ? "selected" : ""}>
                ${escHtml(c.name)}${c.nameBn ? ` (${escHtml(c.nameBn)})` : ""}
              </option>
            `).join("")}
          </select>
          ${isCustomerAdmin() || state.isAdmin ? `<button type="button" class="btn btn-sm btn-outline" data-action="storefront-edit-category" data-category="${escHtml(categoryFilter)}">✏️ Edit Category</button>` : ""}
          <select class="field-select" id="catalog-sort-select" style="width:auto;min-height:42px;">
            <option value="featured" ${sortBy === "featured" ? "selected" : ""}>Sort: Featured</option>
            <option value="price-asc" ${sortBy === "price-asc" ? "selected" : ""}>Price: Low to High</option>
            <option value="price-desc" ${sortBy === "price-desc" ? "selected" : ""}>Price: High to Low</option>
            <option value="rating" ${sortBy === "rating" ? "selected" : ""}>Top Rated</option>
          </select>
        </div>
      </div>

      ${items.length ? `<div class="product-grid">${items.map(renderProductCard).join("")}</div>` : `
          <div class="card-panel" style="text-align:center;padding:48px 20px;">
            <div style="font-size:2.4rem;margin-bottom:8px;">🛍️</div>
            <h2 style="margin:0 0 6px;">No matching products found</h2>
            <p style="margin:0 0 16px;color:var(--muted);">Try clearing filters or browsing another category.</p>
            <a href="#home" class="btn btn-primary">Back to Home</a>
          </div>
        `}
    </main>
  `;
}
export function renderProductDetailView(productId, selectedImgIdx = 0, selectedOption = "", qty = 1) {
	const product = state.products.find((p) => p.id === productId);
	if (!product) {
		return `
      <main class="container" style="padding:48px 16px;text-align:center;">
        <h1>Product Not Found</h1>
        <p style="color:var(--muted);">This product may have been removed or is unavailable.</p>
        <a href="#home" class="btn btn-primary">Return to Storefront</a>
      </main>
    `;
	}
	const images = Array.isArray(product.images) && product.images.length ? product.images.filter(Boolean) : [getProductImage(product, 0)];
	const activeImg = images[selectedImgIdx] || images[0];
	const disc = calcDiscountPercent(product.price, product.oldPrice);
	const stockBadge = getStockBadge(product.stock);
	const options = Array.isArray(product.options) ? product.options.filter(Boolean) : [];
	const chosenOpt = selectedOption || options[0] || "";
	const prodReviews = state.reviews.filter((r) => r.productId === product.id && r.approved !== false);
	const related = state.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 8);
	const wished = state.wishlist.includes(product.id);
	return `
    <main class="container" style="padding-bottom:36px;">
      <nav style="font-size:0.84rem;color:var(--muted);padding:14px 0 4px;" aria-label="Breadcrumb">
        <a href="#home">Home</a> / <a href="#category/${encodeURIComponent(product.category)}">${escHtml(product.category)}</a> / <span>${escHtml(product.name)}</span>
      </nav>

      <div class="pdp-layout">
        <!-- Left Column: Image Gallery + Video Section -->
        <div>
          <div class="pdp-gallery-card">
            <div class="pdp-main-img" id="pdp-main-zoom" title="Click to toggle zoom">
              <img src="${escHtml(activeImg)}" alt="${escHtml(product.name)}" id="pdp-active-img" />
              ${disc > 0 ? `<span class="discount-tag">-${disc}% OFF</span>` : ""}
            </div>
            ${images.length > 1 ? `
              <div class="pdp-thumbs">
                ${images.map((src, idx) => `
                  <button type="button" class="pdp-thumb ${idx === selectedImgIdx ? "active" : ""}" data-action="pdp-thumb" data-index="${idx}">
                    <img src="${escHtml(src)}" alt="${escHtml(product.name)} thumbnail ${idx + 1}" loading="lazy" />
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>

          ${renderProductVideoSection(product)}
        </div>

        <!-- Right Column: Purchase Module & Details -->
        <div class="pdp-info-card">
          <div style="font-size:0.84rem;color:var(--muted);">
            ${escHtml(product.brand || "Pazaro BD")} · SKU: <span class="tabular-nums">${escHtml(product.sku || product.id)}</span>
          </div>
          <h1 class="pdp-title">${escHtml(product.name)}</h1>

          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
            <span class="star-icon">${renderStars(product.rating)}</span>
            <span style="font-size:0.86rem;color:var(--muted);">${Number(product.rating || 4.7).toFixed(1)} (${product.reviewCount || prodReviews.length} reviews)</span>
            <span class="status-text ${stockBadge.cls}">● ${escHtml(stockBadge.label)}</span>
          </div>

          <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:14px;">
            <span style="font-size:1.85rem;font-weight:700;color:var(--primary);" class="tabular-nums">${formatPrice(product.price)}</span>
            ${Number(product.oldPrice) > Number(product.price) ? `<span style="font-size:1.05rem;color:var(--muted);text-decoration:line-through;" class="tabular-nums">${formatPrice(product.oldPrice)}</span>` : ""}
          </div>

          <p style="margin:0 0 16px;color:var(--text);font-size:0.95rem;">${escHtml(product.shortDescription || "")}</p>

          ${options.length ? `
            <div style="margin-bottom:16px;">
              <div class="field-label">Select Option: <span style="color:var(--primary);">${escHtml(chosenOpt)}</span></div>
              <div class="option-chips">
                ${options.map((opt) => `
                  <button type="button" class="option-chip ${opt === chosenOpt ? "active" : ""}" data-action="pdp-option" data-option="${escHtml(opt)}">${escHtml(opt)}</button>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:18px;">
            <div class="qty-stepper" aria-label="Quantity">
              <button type="button" data-action="pdp-qty" data-delta="-1" aria-label="Decrease quantity">-</button>
              <span id="pdp-qty-val" class="tabular-nums">${qty}</span>
              <button type="button" data-action="pdp-qty" data-delta="1" aria-label="Increase quantity">+</button>
            </div>

            <button
              type="button"
              class="btn btn-primary"
              style="flex:1 1 150px;"
              data-action="pdp-add-cart"
              data-id="${escHtml(product.id)}"
              ${(product.stock || 0) <= 0 ? "disabled" : ""}
            >
              🛒 Add to Cart
            </button>

            <button
              type="button"
              class="btn btn-accent"
              style="flex:1 1 140px;"
              data-action="pdp-buy-now"
              data-id="${escHtml(product.id)}"
              ${(product.stock || 0) <= 0 ? "disabled" : ""}
            >
              ⚡ Buy Now
            </button>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:16px;">
            <button type="button" class="btn btn-sm btn-outline" data-action="toggle-wish" data-id="${escHtml(product.id)}">
              ${wished ? "♥ Saved in Wishlist" : "♡ Save to Wishlist"}
            </button>
            <button type="button" class="btn btn-sm btn-outline" data-action="share-product" data-name="${escHtml(product.name)}">
              ↗ Share Product
            </button>
          </div>

          <div style="display:grid;gap:8px;font-size:0.875rem;color:var(--muted);">
            <div><strong>🚚 Delivery:</strong> ${escHtml(product.deliveryInfo || "Inside Dhaka ৳60 · Outside Dhaka ৳120")}</div>
            <div><strong>↩️ Returns:</strong> ${escHtml(product.returnPolicy || "7-day easy replacement guarantee.")}</div>
            ${product.tags?.length ? `<div><strong>Tags:</strong> ${escHtml(product.tags.join(" · "))}</div>` : ""}
          </div>
        </div>
      </div>

      <!-- Ad slot on PDP -->
      <div style="margin:12px 0;">${renderAdSlot("ad_product_page")}</div>

      <!-- Full Description, Features & Specification Table -->
      <section class="card-panel" style="margin-top:18px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:24px;">
          <div>
            <h2 style="margin:0 0 10px;font-size:1.15rem;">Product Description & Key Features</h2>
            <p style="margin:0 0 14px;font-size:0.93rem;line-height:1.65;">${escHtml(product.fullDescription || product.shortDescription || "")}</p>
            ${product.features?.length ? `
              <ul style="padding-left:18px;margin:0;display:grid;gap:6px;font-size:0.92rem;">
                ${product.features.map((f) => `<li>${escHtml(f)}</li>`).join("")}
              </ul>
            ` : ""}
          </div>

          <div>
            <h2 style="margin:0 0 10px;font-size:1.15rem;">Specifications</h2>
            ${product.specs?.length ? `
              <table class="specs-table">
                <tbody>
                  ${product.specs.map((row) => `
                    <tr>
                      <th>${escHtml(row.key)}</th>
                      <td>${escHtml(row.value)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : "<p style=\"color:var(--muted);font-size:0.9rem;\">Standard manufacturer specifications included inside packaging.</p>"}
          </div>
        </div>
      </section>

      <!-- Customer Reviews & Review Form -->
      <section class="card-panel" style="margin-top:20px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:24px;">
          <div>
            <h2 style="margin:0 0 12px;font-size:1.15rem;">Customer Reviews (${prodReviews.length})</h2>
            ${prodReviews.length ? `<div style="display:grid;gap:12px;">
                  ${prodReviews.map((rev) => `
                    <div style="padding:12px;background:var(--bg);border-radius:10px;">
                      <div class="review-stars">${renderStars(rev.rating)}</div>
                      <p style="margin:4px 0 6px;font-size:0.9rem;">${escHtml(rev.comment)}</p>
                      <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">${escHtml(rev.authorName)} · ${escHtml(rev.city || "Bangladesh")}</div>
                    </div>
                  `).join("")}
                </div>` : "<p style=\"color:var(--muted);font-size:0.9rem;\">No reviews for this product yet. Be the first to review!</p>"}
          </div>

          <form id="pdp-review-form" data-product-id="${escHtml(product.id)}" data-product-name="${escHtml(product.name)}" class="form-grid">
            <h3 style="margin:0;font-size:1.05rem;">Write a Review</h3>
            <div class="form-row-2">
              <div>
                <label class="field-label" for="rev-author">Your Name</label>
                <input class="field-input" id="rev-author" required placeholder="e.g. Arif Hossain" />
              </div>
              <div>
                <label class="field-label" for="rev-city">City / Area</label>
                <input class="field-input" id="rev-city" placeholder="e.g. Mirpur, Dhaka" />
              </div>
            </div>
            <div>
              <label class="field-label" for="rev-rating">Rating</label>
              <select class="field-select" id="rev-rating">
                <option value="5">★★★★★ (5/5 Excellent)</option>
                <option value="4">★★★★☆ (4/5 Very Good)</option>
                <option value="3">★★★☆☆ (3/5 Good)</option>
                <option value="2">★★☆☆☆ (2/5 Fair)</option>
                <option value="1">★☆☆☆☆ (1/5 Poor)</option>
              </select>
            </div>
            <div>
              <label class="field-label" for="rev-comment">Your Review</label>
              <textarea class="field-textarea" id="rev-comment" required placeholder="Share your experience with quality and delivery..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Review</button>
          </form>
        </div>
      </section>

      ${renderHorizontalScroller("scroller-related", "Related Products", related, { linkHash: `#category/${encodeURIComponent(product.category)}` })}
    </main>
  `;
}
export function renderCartDrawer(isOpen, deliveryZone = "inside") {
	const totals = getCartTotals(deliveryZone);
	const g = state.general || SEED_GENERAL_SETTINGS;
	const freeMin = Number(g.freeDeliveryMin) || 0;
	const remainingFree = freeMin > 0 ? Math.max(0, freeMin - totals.subtotal) : 0;
	return `
    <div class="drawer-backdrop ${isOpen ? "open" : ""}" data-action="close-cart"></div>
    <aside class="cart-drawer ${isOpen ? "open" : ""}" aria-label="Shopping Cart">
      <div class="drawer-head">
        <h2 style="margin:0;font-size:1.15rem;">Your Cart (${totals.itemCount})</h2>
        <button type="button" class="icon-btn" style="color:var(--text);" data-action="close-cart" aria-label="Close cart">✕</button>
      </div>

      <div class="drawer-body">
        ${freeMin > 0 && state.cart.length ? `
          <div style="padding:10px 12px;border-radius:10px;background:var(--primary-soft);color:var(--primary);font-size:0.82rem;font-weight:600;">
            ${remainingFree > 0 ? `Add ${formatPrice(remainingFree)} more for FREE nationwide delivery!` : "🎉 You unlocked FREE nationwide delivery!"}
          </div>
        ` : ""}

        ${state.cart.length ? state.cart.map((item, idx) => `
              <div style="display:flex;gap:12px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border);">
                <img src="${escHtml(item.image)}" alt="${escHtml(item.name)}" style="width:62px;height:62px;border-radius:10px;object-fit:cover;background:var(--surface-alt);flex-shrink:0;" />
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(item.name)}</div>
                  ${item.option ? `<div style="font-size:0.78rem;color:var(--muted);">${escHtml(item.option)}</div>` : ""}
                  <div style="font-weight:700;color:var(--primary);font-size:0.92rem;margin-top:2px;" class="tabular-nums">${formatPrice(item.price)}</div>
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
                    <div class="qty-stepper" style="transform:scale(0.86);transform-origin:left;">
                      <button type="button" data-action="cart-qty" data-index="${idx}" data-delta="-1" aria-label="Decrease quantity">-</button>
                      <span>${item.qty}</span>
                      <button type="button" data-action="cart-qty" data-index="${idx}" data-delta="1" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="btn-ghost" style="border:0;padding:6px;cursor:pointer;color:#b91c1c;font-size:0.8rem;" data-action="cart-remove" data-index="${idx}">Remove</button>
                  </div>
                </div>
              </div>
            `).join("") : `
            <div style="text-align:center;padding:48px 16px;">
              <div style="font-size:2.4rem;margin-bottom:8px;">🛒</div>
              <h3 style="margin:0 0 6px;">Your cart is empty</h3>
              <p style="margin:0 0 16px;color:var(--muted);font-size:0.9rem;">Explore phones, audio, fashion & daily essentials.</p>
              <button type="button" class="btn btn-primary" data-action="close-cart">Start Shopping</button>
            </div>
          `}
      </div>

      ${state.cart.length ? `
        <div class="drawer-foot">
          <div style="margin-bottom:10px;">
            <label class="field-label" for="drawer-zone-select" style="font-size:0.8rem;">Delivery Zone</label>
            <select id="drawer-zone-select" class="field-select" style="min-height:40px;font-size:0.85rem;">
              <option value="inside" ${deliveryZone === "inside" ? "selected" : ""}>Inside Dhaka (${formatPrice(g.insideDhakaFee ?? 60)})</option>
              <option value="outside" ${deliveryZone === "outside" ? "selected" : ""}>Outside Dhaka (${formatPrice(g.outsideDhakaFee ?? 120)})</option>
            </select>
          </div>
          <div style="display:grid;gap:4px;font-size:0.88rem;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span class="tabular-nums">${formatPrice(totals.subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span class="tabular-nums">${totals.delivery === 0 ? "FREE" : formatPrice(totals.delivery)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.05rem;padding-top:6px;border-top:1px solid var(--border);">
              <span>Total</span><span style="color:var(--primary);" class="tabular-nums">${formatPrice(totals.total)}</span>
            </div>
          </div>
          <button type="button" class="btn btn-accent" style="width:100%;" data-action="go-checkout">Proceed to Checkout →</button>
        </div>
      ` : ""}
    </aside>
  `;
}
export function renderCheckoutView(checkoutState, confirmedReceipt = null) {
	if (confirmedReceipt) {
		const locLine = [
			confirmedReceipt.upazila,
			confirmedReceipt.district,
			confirmedReceipt.division
		].filter(Boolean).join(", ");
		return `
      <main class="container" style="padding:36px 16px;max-width:680px;">
        <div class="card-panel" style="text-align:center;padding:36px 24px;">
          <div style="font-size:3rem;margin-bottom:10px;">🎉</div>
          <h1 style="margin:0 0 8px;color:var(--primary);">Order Placed Successfully!</h1>
          <p style="margin:0 0 18px;color:var(--muted);">Thank you for shopping with Pazaro BD. Save your Order ID below to track delivery anytime.</p>
          <div style="background:var(--bg);padding:16px;border-radius:12px;display:inline-block;margin-bottom:20px;">
            <div style="font-size:0.8rem;color:var(--muted);">Order Tracking ID</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--text);" class="tabular-nums">${escHtml(confirmedReceipt.orderCode)}</div>
            <div style="font-size:0.88rem;margin-top:4px;">Total Payable: <strong>${formatPrice(confirmedReceipt.total)}</strong> · ${escHtml(confirmedReceipt.paymentMethod)}</div>
            ${locLine ? `<div style="font-size:0.8rem;color:var(--muted);margin-top:4px;">Delivery Area: ${escHtml(locLine)}</div>` : ""}
          </div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a href="#track-order/${encodeURIComponent(confirmedReceipt.orderCode)}" class="btn btn-primary">Track This Order</a>
            <a href="#home" class="btn btn-outline">Continue Shopping</a>
          </div>
        </div>
      </main>
    `;
	}
	const co = typeof checkoutState === "object" && checkoutState ? checkoutState : {
		division: "Dhaka",
		district: "Dhaka",
		customerName: "",
		phone: "",
		address: "",
		paymentMethod: "Cash on Delivery",
		paymentNumber: "",
		notes: "",
		mapLat: null,
		mapLng: null,
		mapStatus: ""
	};
	const g = state.general || SEED_GENERAL_SETTINGS;
	const divisions = getDivisions();
	const activeDivision = divisions.includes(co.division) ? co.division : "Dhaka";
	const districts = getDistrictsByDivision(activeDivision);
	const activeDistrict = districts.includes(co.district) ? co.district : districts[0] || "Dhaka";
	const zone = activeDistrict === "Dhaka" ? "inside" : "outside";
	const totals = getCartTotals(zone);
	if (!state.cart.length) {
		return `
      <main class="container" style="padding:48px 16px;text-align:center;">
        <h1>Your Cart is Empty</h1>
        <p style="color:var(--muted);">Add items before checking out.</p>
        <a href="#home" class="btn btn-primary">Browse Products</a>
      </main>
    `;
	}
	return `
    <main class="container" style="padding:24px 16px 40px;">
      <h1 class="section-title" style="margin-bottom:18px;">One-Page Checkout</h1>
      <div class="pdp-layout" style="padding:0;">
        <form id="checkout-form" class="card-panel form-grid">
          <h2 style="margin:0;font-size:1.15rem;">Shipping & Payment Details</h2>
          <div class="form-row-2">
            <div>
              <label class="field-label" for="co-name">Full Name *</label>
              <input class="field-input" id="co-name" required minlength="2" placeholder="e.g. Tariqul Islam" value="${escHtml(co.customerName || "")}" />
            </div>
            <div>
              <label class="field-label" for="co-phone">Mobile Number *</label>
              <input class="field-input" id="co-phone" type="tel" required minlength="6" placeholder="017XXXXXXXX" value="${escHtml(co.phone || "")}" />
            </div>
          </div>

          ${g.mapEnabled !== false ? `
            <div class="co-map-card">
              <div class="co-map-toolbar">
                <div>
                  <strong style="font-size:0.9rem;">Pin Delivery Location on Map</strong>
                  <div style="font-size:0.78rem;color:var(--muted);">Tap the map or use GPS to auto-fill Division, District & Full Detailed Address</div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" data-action="co-use-location">📍 Use My Current Location</button>
              </div>
              <div id="checkout-map" class="co-map-canvas" aria-label="Interactive Bangladesh delivery location map"></div>
              <div id="co-map-status" class="co-map-status">
                ${co.mapStatus ? escHtml(co.mapStatus) : co.mapLat && co.mapLng ? `Pinned location: ${Number(co.mapLat).toFixed(4)}, ${Number(co.mapLng).toFixed(4)} (${escHtml(activeDistrict)}, ${escHtml(activeDivision)})` : "Click anywhere on the map or drag the pin to auto-fill your shipping address."}
              </div>
            </div>
          ` : ""}

          <div class="co-location-grid">
            <div>
              <label class="field-label" for="co-division">Division (বিভাগ) *</label>
              <select class="field-select" id="co-division" required>
                ${divisions.map((divName) => {
		const bn = getDivisionBn(divName);
		return `<option value="${escHtml(divName)}" ${divName === activeDivision ? "selected" : ""}>${escHtml(divName)}${bn ? ` (${bn})` : ""}</option>`;
	}).join("")}
              </select>
            </div>
            <div>
              <label class="field-label" for="co-district">District (জেলা) *</label>
              <select class="field-select" id="co-district" required>
                ${districts.map((d) => `<option value="${escHtml(d)}" ${d === activeDistrict ? "selected" : ""}>${escHtml(d)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div>
            <label class="field-label" for="co-address">Full Detailed Address (Thana/Upazila, Area, Road, House / Holding No.) *</label>
            <textarea class="field-textarea" id="co-address" required minlength="4" placeholder="Write your Thana / Upazila, Union / Area, Road / Village, House / Holding No., and Landmark...">${escHtml(co.address || "")}</textarea>
          </div>

          <div class="form-row-2">
            <div>
              <label class="field-label" for="co-payment">Payment Method *</label>
              <select class="field-select" id="co-payment" required>
                <option value="Cash on Delivery" ${co.paymentMethod === "Cash on Delivery" ? "selected" : ""}>Cash on Delivery (Pay on arrival)</option>
                <option value="bKash" ${co.paymentMethod === "bKash" ? "selected" : ""}>bKash (Send Money / Payment)</option>
                <option value="Nagad" ${co.paymentMethod === "Nagad" ? "selected" : ""}>Nagad (Send Money / Payment)</option>
              </select>
            </div>
            <div id="co-trx-wrap" ${co.paymentMethod && co.paymentMethod !== "Cash on Delivery" ? "" : "hidden"}>
              <label class="field-label" for="co-pay-num">bKash / Nagad Sender Number or TrxID</label>
              <input class="field-input" id="co-pay-num" placeholder="e.g. 017XXXXXXXX or TrxID" value="${escHtml(co.paymentNumber || "")}" />
            </div>
          </div>

          <div>
            <label class="field-label" for="co-notes">Order Note (Optional)</label>
            <input class="field-input" id="co-notes" placeholder="e.g. Call before delivery" value="${escHtml(co.notes || "")}" />
          </div>

          <button type="submit" class="btn btn-accent" id="co-submit-btn">Confirm Order · ${formatPrice(totals.total)}</button>
        </form>

        <aside class="card-panel">
          <h2 style="margin:0 0 14px;font-size:1.1rem;">Order Summary (${totals.itemCount} items)</h2>
          <div style="display:grid;gap:10px;margin-bottom:14px;">
            ${state.cart.map((item) => `
              <div style="display:flex;justify-content:space-between;gap:10px;font-size:0.9rem;">
                <span>${escHtml(item.name)} × ${item.qty} ${item.option ? `(${escHtml(item.option)})` : ""}</span>
                <strong class="tabular-nums">${formatPrice(item.price * item.qty)}</strong>
              </div>
            `).join("")}
          </div>
          <div style="border-top:1px solid var(--border);padding-top:12px;display:grid;gap:6px;font-size:0.92rem;">
            <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span class="tabular-nums">${formatPrice(totals.subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between;">
              <span>Delivery (${escHtml(activeDistrict)}, ${escHtml(activeDivision)})</span>
              <span class="tabular-nums">${totals.delivery === 0 ? "FREE" : formatPrice(totals.delivery)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:1.15rem;font-weight:700;padding-top:8px;border-top:1px solid var(--border);">
              <span>Grand Total</span>
              <span style="color:var(--primary);" class="tabular-nums">${formatPrice(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  `;
}
export function renderTrackOrderView(queryVal = "", results = null) {
	const steps = [
		"Pending",
		"Confirmed",
		"Shipped",
		"Delivered"
	];
	return `
    <main class="container" style="padding:28px 16px 48px;max-width:760px;">
      <div class="card-panel">
        <h1 style="margin:0 0 6px;font-size:1.45rem;">Track Your Order</h1>
        <p style="margin:0 0 18px;color:var(--muted);font-size:0.92rem;">Enter your Order ID (e.g. PB-2026-4821) or the mobile number used at checkout.</p>
        <form id="track-order-form" style="display:flex;flex-wrap:wrap;gap:10px;">
          <input class="field-input" id="track-query-input" style="flex:1 1 240px;" required placeholder="Order ID or Phone Number" value="${escHtml(queryVal)}" />
          <button type="submit" class="btn btn-primary">Track Order</button>
        </form>
      </div>

      ${Array.isArray(results) ? `
        <div style="margin-top:20px;display:grid;gap:14px;">
          ${results.length ? results.map((ord) => {
		const curIdx = steps.indexOf(ord.status);
		const locStr = [
			ord.upazila,
			ord.district,
			ord.division
		].filter(Boolean).join(", ");
		return `
                  <div class="card-panel">
                    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                      <div>
                        <strong style="font-size:1.1rem;" class="tabular-nums">${escHtml(ord.orderCode)}</strong>
                        <div style="font-size:0.84rem;color:var(--muted);">Location: ${escHtml(locStr || ord.district)} · ${ord.itemCount} item(s) · ${escHtml(ord.paymentMethod)}</div>
                      </div>
                      <div style="text-align:right;">
                        <div class="status-text status-${escHtml(ord.status)}">${escHtml(ord.status)}</div>
                        <strong class="tabular-nums">${formatPrice(ord.total)}</strong>
                      </div>
                    </div>
                    ${ord.status === "Cancelled" ? `<div style="padding:10px;border-radius:8px;background:#fef2f2;color:#b91c1c;font-size:0.88rem;font-weight:600;">This order was cancelled.</div>` : `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font-size:0.78rem;">
                          ${steps.map((st, idx) => `
                            <div style="padding:8px 4px;border-radius:8px;background:${idx <= curIdx ? "var(--primary-soft)" : "var(--bg)"};color:${idx <= curIdx ? "var(--primary)" : "var(--muted)"};font-weight:${idx <= curIdx ? "700" : "500"};">
                              ${escHtml(st)}
                            </div>
                          `).join("")}
                        </div>`}
                  </div>
                `;
	}).join("") : `<div class="card-panel" style="text-align:center;padding:32px;">No order found matching "${escHtml(queryVal)}". Double-check your Order ID or phone number.</div>`}
        </div>
      ` : ""}
    </main>
  `;
}
export function renderBlogView(postId = null) {
	const posts = state.posts.filter((p) => p.published !== false);
	if (postId) {
		const post = posts.find((p) => p.id === postId) || state.posts.find((p) => p.id === postId);
		if (!post) {
			return `<main class="container" style="padding:48px 16px;text-align:center;"><h1>Post Not Found</h1><a href="#blog" class="btn btn-primary">All Blog Posts</a></main>`;
		}
		return `
      <main class="container" style="padding:24px 16px 48px;max-width:860px;">
        <a href="#blog" class="section-link" style="margin-bottom:10px;">← Back to Blog</a>
        <article class="card-panel">
          <div style="font-size:0.84rem;color:var(--muted);margin-bottom:8px;">${escHtml(post.category)}${post.tags?.length ? ` · ${escHtml(post.tags.join(", "))}` : ""}</div>
          <h1 style="margin:0 0 16px;font-size:clamp(1.5rem,3vw,2.2rem);line-height:1.25;">${escHtml(post.title)}</h1>
          <img src="${escHtml(post.coverImage || LOCAL_PHOTOS.heroWorkspace)}" alt="${escHtml(post.title)}" style="width:100%;max-height:420px;object-fit:cover;border-radius:12px;margin-bottom:20px;" />
          <div style="font-size:1rem;line-height:1.75;">${post.body || escHtml(post.excerpt || "")}</div>
          <div style="margin-top:20px;padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <span style="font-size:0.82rem;color:var(--muted);">Found outdated pricing or a broken link in this guide?</span>
            <button type="button" class="btn btn-sm btn-outline" data-action="report-blog-issue" data-id="${escHtml(post.id)}">🚩 Report Issue</button>
          </div>
        </article>
        <div style="margin-top:18px;">${renderAdSlot("ad_blog_post")}</div>
      </main>
    `;
	}
	return `
    <main class="container" style="padding:24px 16px 48px;">
      <div class="section-head">
        <h1 class="section-title">Pazaro BD Blog</h1>
        <span style="font-size:0.88rem;color:var(--muted);">Tech Tips · Buying Guides · Shopping Offers</span>
      </div>
      ${posts.length ? `<div class="blog-grid">
            ${posts.map((post) => `
              <article class="blog-card" data-action="open-post" data-id="${escHtml(post.id)}">
                <div class="blog-card-img">
                  <img src="${escHtml(post.coverImage || LOCAL_PHOTOS.heroWorkspace)}" alt="${escHtml(post.title)}" loading="lazy" />
                </div>
                <div class="blog-card-body">
                  <div class="blog-meta">${escHtml(post.category)}</div>
                  <h3>${escHtml(post.title)}</h3>
                  <p>${escHtml(post.excerpt || "")}</p>
                </div>
              </article>
            `).join("")}
          </div>` : `<div class="card-panel" style="text-align:center;padding:40px;">No blog posts published yet.</div>`}
      <div style="margin-top:20px;">${renderAdSlot("ad_blog_post")}</div>
    </main>
  `;
}
export function renderStaticInfoView(pageKey) {
	const g = state.general || SEED_GENERAL_SETTINGS;
	const pages = {
		"help-center": {
			title: "Help Center",
			body: `<p>Need help with an order, warranty, or payment? Reach us directly on WhatsApp (${escHtml(g.phone)}) or email ${escHtml(g.email)} from 9:00 AM to 10:00 PM daily.</p>
             <ul><li><strong>Dhaka Delivery:</strong> 24–48 hours (${formatPrice(g.insideDhakaFee ?? 60)})</li><li><strong>Nationwide Delivery:</strong> 2–4 business days (${formatPrice(g.outsideDhakaFee ?? 120)})</li><li><strong>Payment Options:</strong> Cash on Delivery, bKash, Nagad</li></ul>`
		},
		"returns-refunds": {
			title: "Returns and Refunds",
			body: `<p>Pazaro BD offers a transparent <strong>7-day easy replacement and return policy</strong> for factory defects, damaged parcels, or wrong size/variant deliveries.</p>
             <p>Keep original packaging and invoice intact, and contact our team with your Order ID.</p>`
		},
		"contact-us": {
			title: "Contact Us",
			body: `<p><strong>Office:</strong> ${escHtml(g.address)}</p><p><strong>Phone / Support:</strong> ${escHtml(g.phone)}</p><p><strong>Email:</strong> ${escHtml(g.email)}</p>`
		},
		"about-us": {
			title: "About Pazaro BD",
			body: `<p><strong>Pazaro BD — Your Bazaar, Smarter.</strong> Built for shoppers across Bangladesh, we bring verified smartphones, laptops, smartwatches, gaming gear, fashion, beauty, home living, books, and pure groceries into one fast, trustworthy storefront.</p>`
		}
	};
	const info = pages[pageKey] || pages["about-us"];
	return `
    <main class="container" style="padding:28px 16px 48px;max-width:780px;">
      <div class="card-panel">
        <h1 style="margin:0 0 12px;">${escHtml(info.title)}</h1>
        <div style="line-height:1.7;">${info.body}</div>
      </div>
    </main>
  `;
}
export function renderMaintenanceView() {
	const g = state.general || SEED_GENERAL_SETTINGS;
	return `
    <main class="container" style="min-height:80vh;display:flex;align-items:center;justify-content:center;">
      <div class="card-panel" style="max-width:520px;text-align:center;padding:36px 24px;">
        <div style="font-size:2.6rem;margin-bottom:10px;">🛠️</div>
        <h1 style="margin:0 0 8px;">${escHtml(g.siteName || "Pazaro BD")} is Updating</h1>
        <p style="margin:0 0 18px;color:var(--muted);">We are refreshing deals and inventory. Please check back shortly or message us on WhatsApp (${escHtml(g.phone)}).</p>
        <a href="/admin" data-action="go-admin" class="btn btn-outline">Admin Login</a>
      </div>
    </main>
  `;
}
export function renderAccountView(accountState = {}) {
	const session = getCustomerSession();
	if (!session) {
		return `
      <main class="container" style="padding:36px 16px;text-align:center;">
        <div class="card-panel" style="max-width:460px;margin:0 auto;padding:32px 24px;">
          <h1>Please Sign In</h1>
          <p style="color:var(--muted);">Sign in to manage your Pazaro BD account, saved numbers, cart, and order history.</p>
          <a href="#home" class="btn btn-primary">Go to Sign In</a>
        </div>
      </main>
    `;
	}
	const activeTab = [
		"overview",
		"cart",
		"orders",
		"settings"
	].includes(accountState.tab) ? accountState.tab : "overview";
	const canAccessAdmin = isCustomerAdmin(session);
	const initial = (session.fullName || "U").trim().charAt(0).toUpperCase();
	const cartItems = state.cart || [];
	const cartCount = cartItems.reduce((sum, i) => sum + (Number(i.qty) || 1), 0);
	const cartSubtotal = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
	const orders = getLocalOrders();
	const totalOrderedProducts = orders.reduce((sum, o) => {
		const fromItems = Array.isArray(o.items) && o.items.length ? o.items.reduce((k, it) => k + (Number(it.qty) || 1), 0) : 0;
		return sum + (fromItems || Number(o.itemCount) || 0);
	}, 0);
	const wishCount = (state.wishlist || []).length;
	const divisions = getDivisions();
	const selectedDiv = divisions.includes(accountState.division || session.division) ? accountState.division || session.division : "Dhaka";
	const districts = getDistrictsByDivision(selectedDiv);
	const selectedDist = districts.includes(accountState.district || session.district) ? accountState.district || session.district : districts[0] || "Dhaka";
	const showCart = activeTab === "overview" || activeTab === "cart";
	const showOrders = activeTab === "overview" || activeTab === "orders";
	const showSettings = activeTab === "overview" || activeTab === "settings";
	return `
    <main class="container account-page">
      <!-- Profile Summary Header -->
      <section class="card-panel account-hero-card" aria-label="Account profile overview">
        <div class="account-hero-left">
          <div class="account-avatar-wrap">
            ${session.avatarUrl ? `<img src="${escHtml(session.avatarUrl)}" alt="${escHtml(session.fullName)}" class="account-avatar-img" />` : `<div class="account-avatar-fallback" aria-hidden="true">${escHtml(initial)}</div>`}
            <label class="account-avatar-upload-btn" title="Change profile picture">
              📷 Upload Photo
              <input type="file" id="account-avatar-input" accept="image/*" hidden />
            </label>
            ${session.avatarUrl ? `
              <button type="button" class="account-avatar-remove-btn" data-action="account-remove-avatar">Remove</button>
            ` : ""}
          </div>
          <div class="account-hero-meta">
            <div class="account-kicker">${canAccessAdmin ? "Administrator Account" : "Pazaro BD Member"}</div>
            <h1 class="account-hero-name">${escHtml(session.fullName || "Customer")}</h1>
            <div class="account-hero-details">
              ${session.email ? `<span>${escHtml(session.email)}</span>` : ""}
              ${session.phone ? `<span>${session.email ? "· " : ""}${escHtml(session.phone)}</span>` : ""}
              ${session.altPhone ? `<span>· Alt: ${escHtml(session.altPhone)}</span>` : ""}
            </div>
            ${session.address || session.district ? `
              <div class="account-hero-address">
                📍 ${escHtml([
		session.address,
		session.district,
		session.division
	].filter(Boolean).join(", "))}
              </div>
            ` : ""}
          </div>
        </div>
        <div class="account-hero-actions">
          ${canAccessAdmin ? `<button type="button" class="btn btn-sm btn-outline" data-action="go-admin">🛡️ Admin Panel</button>` : ""}
          <button type="button" class="btn btn-sm btn-danger" data-action="customer-logout">🚪 Log Out</button>
        </div>
      </section>

      <!-- Quick Numeric Stats -->
      <section class="account-stats-grid" aria-label="Account numbers summary">
        <button type="button" class="account-stat-card" data-action="account-tab" data-tab="cart">
          <span class="account-stat-label">Items in Cart</span>
          <strong class="account-stat-value tabular-nums">${cartCount}</strong>
          <span class="account-stat-sub tabular-nums">${formatPrice(cartSubtotal)} subtotal</span>
        </button>
        <button type="button" class="account-stat-card" data-action="account-tab" data-tab="orders">
          <span class="account-stat-label">Products Ordered</span>
          <strong class="account-stat-value tabular-nums">${totalOrderedProducts}</strong>
          <span class="account-stat-sub tabular-nums">${orders.length} order${orders.length === 1 ? "" : "s"} placed</span>
        </button>
        <a href="#wishlist" class="account-stat-card">
          <span class="account-stat-label">Saved Wishlist</span>
          <strong class="account-stat-value tabular-nums">${wishCount}</strong>
          <span class="account-stat-sub">Tap to view saved items</span>
        </a>
      </section>

      <!-- Account Navigation Tabs -->
      <div class="account-tabs" role="tablist" aria-label="Account sections">
        <button type="button" role="tab" aria-selected="${activeTab === "overview"}" class="account-tab-btn ${activeTab === "overview" ? "active" : ""}" data-action="account-tab" data-tab="overview">
          Overview
        </button>
        <button type="button" role="tab" aria-selected="${activeTab === "cart"}" class="account-tab-btn ${activeTab === "cart" ? "active" : ""}" data-action="account-tab" data-tab="cart">
          Cart (${cartCount})
        </button>
        <button type="button" role="tab" aria-selected="${activeTab === "orders"}" class="account-tab-btn ${activeTab === "orders" ? "active" : ""}" data-action="account-tab" data-tab="orders">
          Orders (${orders.length})
        </button>
        <button type="button" role="tab" aria-selected="${activeTab === "settings"}" class="account-tab-btn ${activeTab === "settings" ? "active" : ""}" data-action="account-tab" data-tab="settings">
          Settings
        </button>
      </div>

      <div class="account-sections-stack">
        ${showCart ? `
          <section class="card-panel" aria-label="Items in your cart">
            <div class="section-head" style="margin-bottom:14px;">
              <div>
                <h2 style="margin:0;font-size:1.15rem;">Items Added to Cart (${cartCount})</h2>
                <div style="font-size:0.84rem;color:var(--muted);">Review products in your cart or proceed directly to checkout</div>
              </div>
              ${cartItems.length ? `<a href="#checkout" class="btn btn-sm btn-accent">Checkout · ${formatPrice(cartSubtotal)}</a>` : ""}
            </div>

            ${cartItems.length ? `
              <div class="account-cart-list">
                ${cartItems.map((item, idx) => `
                  <div class="account-cart-row">
                    <img
                      src="${escHtml(item.image || "")}"
                      alt="${escHtml(item.name)}"
                      class="account-item-thumb"
                      data-action="open-product"
                      data-id="${escHtml(item.productId)}"
                      onerror="this.style.visibility='hidden'"
                    />
                    <div class="account-item-info">
                      <a href="#product/${encodeURIComponent(item.productId)}" class="account-item-title">${escHtml(item.name)}</a>
                      ${item.option ? `<div class="account-item-sub">${escHtml(item.option)}</div>` : ""}
                      <div class="account-item-price tabular-nums">${formatPrice(item.price)} × ${item.qty} = <strong>${formatPrice(item.price * item.qty)}</strong></div>
                    </div>
                    <div class="account-item-controls">
                      <div class="qty-stepper" style="transform:scale(0.86);transform-origin:right;">
                        <button type="button" data-action="cart-qty" data-index="${idx}" data-delta="-1" aria-label="Decrease quantity">-</button>
                        <span class="tabular-nums">${item.qty}</span>
                        <button type="button" data-action="cart-qty" data-index="${idx}" data-delta="1" aria-label="Increase quantity">+</button>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline" style="color:#b91c1c;" data-action="cart-remove" data-index="${idx}">Remove</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : `
              <div class="account-empty-box">
                <p style="margin:0 0 12px;color:var(--muted);">Your cart is currently empty.</p>
                <a href="#categories" class="btn btn-sm btn-primary">Browse Products</a>
              </div>
            `}
          </section>
        ` : ""}

        ${showOrders ? `
          <section class="card-panel" aria-label="Order history">
            <div class="section-head" style="margin-bottom:14px;">
              <div>
                <h2 style="margin:0;font-size:1.15rem;">My Orders &amp; Ordered Products (${totalOrderedProducts} items)</h2>
                <div style="font-size:0.84rem;color:var(--muted);">Track every order and see how many products you have ordered</div>
              </div>
              <a href="#track-order" class="section-link">Track by ID / Phone →</a>
            </div>

            ${orders.length ? `
              <div class="account-orders-list">
                ${orders.map((ord) => {
		const dateLabel = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}) : "";
		const locStr = [ord.district, ord.division].filter(Boolean).join(", ");
		const ordItems = Array.isArray(ord.items) ? ord.items : [];
		const ordUnits = ordItems.length ? ordItems.reduce((s, it) => s + (Number(it.qty) || 1), 0) : Number(ord.itemCount) || 1;
		return `
                    <article class="account-order-card">
                      <div class="account-order-head">
                        <div>
                          <strong class="tabular-nums" style="font-size:1rem;">${escHtml(ord.orderCode)}</strong>
                          <div style="font-size:0.8rem;color:var(--muted);">
                            ${dateLabel ? `${escHtml(dateLabel)} · ` : ""}${ordUnits} product${ordUnits === 1 ? "" : "s"} · ${escHtml(ord.paymentMethod || "Cash on Delivery")}${locStr ? ` · ${escHtml(locStr)}` : ""}
                          </div>
                        </div>
                        <div style="text-align:right;">
                          <span class="status-text status-${escHtml(ord.status || "Pending")}">● ${escHtml(ord.status || "Pending")}</span>
                          <div class="tabular-nums" style="font-weight:700;color:var(--primary);margin-top:2px;">${formatPrice(ord.total)}</div>
                        </div>
                      </div>
                      ${ordItems.length ? `
                        <ul class="account-order-items">
                          ${ordItems.map((it) => `
                            <li>
                              <span>${escHtml(it.name)}${it.option ? ` (${escHtml(it.option)})` : ""} × ${Number(it.qty) || 1}</span>
                              <span class="tabular-nums">${formatPrice((Number(it.price) || 0) * (Number(it.qty) || 1))}</span>
                            </li>
                          `).join("")}
                        </ul>
                      ` : ""}
                      <div style="display:flex;justify-content:flex-end;margin-top:10px;">
                        <a href="#track-order/${encodeURIComponent(ord.orderCode)}" class="btn btn-sm btn-outline">Track Live Status</a>
                      </div>
                    </article>
                  `;
	}).join("")}
              </div>
            ` : `
              <div class="account-empty-box">
                <p style="margin:0 0 12px;color:var(--muted);">You haven't placed any orders from this device yet.</p>
                <a href="#deals" class="btn btn-sm btn-primary">Explore Flash Deals</a>
              </div>
            `}
          </section>
        ` : ""}

        ${showSettings ? `
          <section class="card-panel" aria-label="Account profile settings">
            <h2 style="margin:0 0 4px;font-size:1.15rem;">Account Settings &amp; Contact Numbers</h2>
            <p style="margin:0 0 16px;font-size:0.85rem;color:var(--muted);">
              Update your display name, profile photo, mobile numbers, default delivery address, and notification preferences.
            </p>

            ${accountState.error ? `
              <div class="auth-error-box" role="alert">${escHtml(accountState.error)}</div>
            ` : ""}

            <form id="account-profile-form" class="form-grid">
              <div class="form-row-2">
                <div>
                  <label class="field-label" for="acc-fullname">Full Name *</label>
                  <input class="field-input" id="acc-fullname" name="fullName" required minlength="2" value="${escHtml(session.fullName || "")}" placeholder="Your display name" />
                </div>
                <div>
                  <label class="field-label" for="acc-email">Email Address</label>
                  <input
                    class="field-input"
                    id="acc-email"
                    name="email"
                    type="email"
                    value="${escHtml(session.email || "")}"
                    placeholder="you@example.com"
                    ${session.id === "admin-root" ? "readonly style=\"background:var(--bg);color:var(--muted);\"" : ""}
                  />
                </div>
              </div>

              <div class="form-row-2">
                <div>
                  <label class="field-label" for="acc-phone">Primary Mobile Number</label>
                  <input class="field-input" id="acc-phone" name="phone" type="tel" value="${escHtml(session.phone || "")}" placeholder="017XXXXXXXX" />
                </div>
                <div>
                  <label class="field-label" for="acc-alt-phone">Secondary / Backup Number</label>
                  <input class="field-input" id="acc-alt-phone" name="altPhone" type="tel" value="${escHtml(session.altPhone || "")}" placeholder="018XXXXXXXX (optional)" />
                </div>
              </div>

              <div class="form-row-2">
                <div>
                  <label class="field-label" for="acc-whatsapp">WhatsApp Number</label>
                  <input class="field-input" id="acc-whatsapp" name="whatsappNumber" type="tel" value="${escHtml(session.whatsappNumber || "")}" placeholder="017XXXXXXXX (for delivery updates)" />
                </div>
                <div>
                  <label class="field-label" for="acc-payment">Preferred Payment Method</label>
                  <select class="field-select" id="acc-payment" name="preferredPayment">
                    <option value="Cash on Delivery" ${(session.preferredPayment || "Cash on Delivery") === "Cash on Delivery" ? "selected" : ""}>Cash on Delivery</option>
                    <option value="bKash" ${session.preferredPayment === "bKash" ? "selected" : ""}>bKash</option>
                    <option value="Nagad" ${session.preferredPayment === "Nagad" ? "selected" : ""}>Nagad</option>
                  </select>
                </div>
              </div>

              <div class="co-location-grid">
                <div>
                  <label class="field-label" for="acc-division">Default Division</label>
                  <select class="field-select" id="acc-division" name="division">
                    ${divisions.map((div) => `
                      <option value="${escHtml(div)}" ${div === selectedDiv ? "selected" : ""}>
                        ${escHtml(div)} (${escHtml(getDivisionBn(div))})
                      </option>
                    `).join("")}
                  </select>
                </div>
                <div>
                  <label class="field-label" for="acc-district">Default District</label>
                  <select class="field-select" id="acc-district" name="district">
                    ${districts.map((dist) => `
                      <option value="${escHtml(dist)}" ${dist === selectedDist ? "selected" : ""}>${escHtml(dist)}</option>
                    `).join("")}
                  </select>
                </div>
              </div>

              <div>
                <label class="field-label" for="acc-address">Saved Delivery Address</label>
                <input class="field-input" id="acc-address" name="address" value="${escHtml(session.address || "")}" placeholder="House, Road, Block / Area" />
              </div>

              <div style="display:flex;flex-wrap:wrap;gap:16px;padding:6px 0;">
                <label style="display:inline-flex;align-items:center;gap:8px;font-size:0.88rem;cursor:pointer;">
                  <input type="checkbox" id="acc-notify-orders" name="notifyOrders" ${session.notifyOrders !== false ? "checked" : ""} />
                  Order status &amp; delivery updates
                </label>
                <label style="display:inline-flex;align-items:center;gap:8px;font-size:0.88rem;cursor:pointer;">
                  <input type="checkbox" id="acc-notify-deals" name="notifyDeals" ${session.notifyDeals ? "checked" : ""} />
                  Flash deals &amp; price drop alerts
                </label>
              </div>

              <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;">
                <button type="submit" class="btn btn-primary">Save Account Settings</button>
              </div>
            </form>

            ${session.id !== "admin-root" ? `
              <hr style="border:0;border-top:1px solid var(--border);margin:24px 0 18px;" />
              <h3 style="margin:0 0 10px;font-size:1rem;">Security &amp; Password</h3>
              ${accountState.passError ? `<div class="auth-error-box" role="alert">${escHtml(accountState.passError)}</div>` : ""}
              <form id="account-password-form" class="form-grid">
                <div class="form-row-2">
                  <div>
                    <label class="field-label" for="acc-cur-pass">Current Password</label>
                    <input class="field-input" id="acc-cur-pass" type="password" required placeholder="Current password" />
                  </div>
                  <div>
                    <label class="field-label" for="acc-new-pass">New Password (min. 6 chars)</label>
                    <input class="field-input" id="acc-new-pass" type="password" required minlength="6" placeholder="New password" />
                  </div>
                </div>
                <div>
                  <label class="field-label" for="acc-conf-pass">Confirm New Password</label>
                  <input class="field-input" id="acc-conf-pass" type="password" required minlength="6" placeholder="Re-enter new password" />
                </div>
                <div>
                  <button type="submit" class="btn btn-outline btn-sm">Update Password</button>
                </div>
              </form>
            ` : ""}

            <hr style="border:0;border-top:1px solid var(--border);margin:24px 0 18px;" />
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
              <div>
                <strong style="font-size:0.95rem;">Sign Out of Account</strong>
                <div style="font-size:0.82rem;color:var(--muted);">Your saved profile details, numbers, and cart stay safe for your next sign-in.</div>
              </div>
              <button type="button" class="btn btn-danger" data-action="customer-logout">🚪 Log Out</button>
            </div>
          </section>
        ` : ""}
      </div>
    </main>
  `;
}

//# sourceMappingURL=data:application/json;base64,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Ozs7c0JBTVYsVUFBVSxLQUFLLFNBQVM7dUNBQ1AsUUFBUSxJQUFJLEVBQUUsSUFBSSxTQUFTLGVBQWUsYUFBYSxHQUFHLEdBQUcsUUFBUSxJQUFJLEVBQUU7cUJBQzdGLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTs7Ozs7OztvRkFPb0QsUUFBUSxRQUFRLFdBQVcsRUFBRSxFQUFFOzs7OztzRkFLN0IsUUFBUSxpQkFBaUIsUUFBUSxZQUFZLEdBQUc7Ozs7b0ZBSWxELFFBQVEsY0FBYyxZQUFZLEdBQUc7Ozs7Ozs7Ozs7Y0FVM0csUUFBUSxPQUFPLGVBQWU7OztnQkFHNUIsYUFBYSxZQUFZLDRDQUE0QyxRQUFRLGFBQWEsU0FBUyxFQUFFLFVBQVUsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JBb0JsSCxHQUFHOzs7Ozs7Ozs7OztZQVdQLEdBQUc7Ozs7QUFJZiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJzdG9yZWZyb250LmpzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbIi8vIFBhemFybyBCRCDigJQgUHVibGljIFN0b3JlZnJvbnQgVmlld3MgJiBJbnRlcmFjdGl2ZSBGbG93c1xuaW1wb3J0IHtcbiAgc3RhdGUsXG4gIGZvcm1hdFByaWNlLFxuICBjYWxjRGlzY291bnRQZXJjZW50LFxuICBnZXRDYXJ0VG90YWxzLFxuICBnZXRMb2NhbE9yZGVyc1xufSBmcm9tICcuL3N0b3JlLmpzJztcbmltcG9ydCB7XG4gIGVzY0h0bWwsXG4gIGdldFByb2R1Y3RJbWFnZSxcbiAgZ2V0U3RvY2tCYWRnZSxcbiAgcmVuZGVyU3RhcnMsXG4gIHJlbmRlclByb2R1Y3RDYXJkLFxuICByZW5kZXJIb3Jpem9udGFsU2Nyb2xsZXIsXG4gIHJlbmRlckFkU2xvdCxcbiAgcmVuZGVyUHJvZHVjdFZpZGVvU2VjdGlvblxufSBmcm9tICcuL3VpLWNvbXBvbmVudHMuanMnO1xuaW1wb3J0IHsgU0VFRF9HRU5FUkFMX1NFVFRJTkdTIH0gZnJvbSAnLi9zZWVkLWRhdGEuanMnO1xuaW1wb3J0IHsgZ2V0RGl2aXNpb25zLCBnZXREaXZpc2lvbkJuLCBnZXREaXN0cmljdHNCeURpdmlzaW9uIH0gZnJvbSAnLi9iZC1sb2NhdGlvbnMuanMnO1xuaW1wb3J0IHsgTE9DQUxfUEhPVE9TIH0gZnJvbSAnLi9wcm9kdWN0LWFydC5qcyc7XG5pbXBvcnQgeyBnZXRDdXN0b21lclNlc3Npb24sIGlzQ3VzdG9tZXJBZG1pbiB9IGZyb20gJy4vY3VzdG9tZXItYXV0aC5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIZWFkZXIoY3VycmVudFJvdXRlLCBzZWFyY2hRdWVyeSA9ICcnKSB7XG4gIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IFNFRURfR0VORVJBTF9TRVRUSU5HUztcbiAgY29uc3QgY2FydENvdW50ID0gc3RhdGUuY2FydC5yZWR1Y2UoKHN1bSwgaSkgPT4gc3VtICsgaS5xdHksIDApO1xuICBjb25zdCB3aXNoQ291bnQgPSBzdGF0ZS53aXNobGlzdC5sZW5ndGg7XG4gIGNvbnN0IHNlc3Npb24gPSBnZXRDdXN0b21lclNlc3Npb24oKTtcbiAgY29uc3QgaW5pdGlhbCA9IHNlc3Npb24/LmZ1bGxOYW1lID8gc2Vzc2lvbi5mdWxsTmFtZS50cmltKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgOiAnVSc7XG5cbiAgY29uc3QgbmF2SXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ0hvbWUnLCBoYXNoOiAnI2hvbWUnLCBrZXk6ICdob21lJyB9LFxuICAgIHsgbGFiZWw6ICdDYXRlZ29yaWVzJywgaGFzaDogJyNjYXRlZ29yaWVzJywga2V5OiAnY2F0ZWdvcmllcycgfSxcbiAgICB7IGxhYmVsOiAnRGVhbHMnLCBoYXNoOiAnI2RlYWxzJywga2V5OiAnZGVhbHMnIH0sXG4gICAgeyBsYWJlbDogJ05ldyBBcnJpdmFscycsIGhhc2g6ICcjbmV3LWFycml2YWxzJywga2V5OiAnbmV3LWFycml2YWxzJyB9LFxuICAgIHsgbGFiZWw6ICdCZXN0IFNlbGxlcnMnLCBoYXNoOiAnI2Jlc3Qtc2VsbGVycycsIGtleTogJ2Jlc3Qtc2VsbGVycycgfSxcbiAgICB7IGxhYmVsOiAnQmxvZycsIGhhc2g6ICcjYmxvZycsIGtleTogJ2Jsb2cnIH0sXG4gICAgeyBsYWJlbDogJ1RyYWNrIE9yZGVyJywgaGFzaDogJyN0cmFjay1vcmRlcicsIGtleTogJ3RyYWNrLW9yZGVyJyB9XG4gIF07XG5cbiAgY29uc3QgcmF3U2l0ZU5hbWUgPSBTdHJpbmcoZy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJykudHJpbSgpIHx8ICdQYXphcm8gQkQnO1xuICBjb25zdCBuYW1lUGFydHMgPSByYXdTaXRlTmFtZS5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBoYXNTdWZmaXggPSBuYW1lUGFydHMubGVuZ3RoID4gMTtcbiAgY29uc3QgcHJpbWFyeUJyYW5kV29yZCA9IGhhc1N1ZmZpeCA/IG5hbWVQYXJ0cy5zbGljZSgwLCAtMSkuam9pbignICcpIDogcmF3U2l0ZU5hbWU7XG4gIGNvbnN0IGFjY2VudEJyYW5kV29yZCA9IGhhc1N1ZmZpeCA/IG5hbWVQYXJ0c1tuYW1lUGFydHMubGVuZ3RoIC0gMV0gOiAnJztcblxuICByZXR1cm4gYFxuICAgIDxoZWFkZXIgY2xhc3M9XCJzaXRlLWhlYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyLW1haW5cIj5cbiAgICAgICAgICA8YSBocmVmPVwiI2hvbWVcIiBjbGFzcz1cImJyYW5kLWxvZ29cIiBhcmlhLWxhYmVsPVwiJHtlc2NIdG1sKHJhd1NpdGVOYW1lKX0gSG9tZVwiPlxuICAgICAgICAgICAgJHtnLmxvZ29VcmxcbiAgICAgICAgICAgICAgPyBgPGltZyBzcmM9XCIke2VzY0h0bWwoZy5sb2dvVXJsKX1cIiBhbHQ9XCIke2VzY0h0bWwocmF3U2l0ZU5hbWUpfSBsb2dvXCIgLz5gXG4gICAgICAgICAgICAgIDogYDxzcGFuIGNsYXNzPVwiYnJhbmQtbG9nby1mcmFtZVwiPjxpbWcgc3JjPVwiL2Fzc2V0cy9wYXphcm8tbG9nby5zdmdcIiBhbHQ9XCIke2VzY0h0bWwocmF3U2l0ZU5hbWUpfSBsb2dvXCIgY2xhc3M9XCJicmFuZC1sb2dvLWljb25cIiAvPjwvc3Bhbj5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJyYW5kLXRleHQtc3RhY2tcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJicmFuZC13b3JkbWFya1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYnJhbmQtd29yZC1tYWluXCI+JHtlc2NIdG1sKHByaW1hcnlCcmFuZFdvcmQpfTwvc3Bhbj4ke2FjY2VudEJyYW5kV29yZCA/IGA8c3BhbiBjbGFzcz1cImJyYW5kLXdvcmQtYWNjZW50XCI+JHtlc2NIdG1sKGFjY2VudEJyYW5kV29yZCl9PC9zcGFuPmAgOiAnJ31cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJyYW5kLXRhZ2xpbmVcIj4ke2VzY0h0bWwoZy50YWdsaW5lIHx8ICdZb3VyIEJhemFhciwgU21hcnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L2E+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyLXNlYXJjaC13cmFwXCI+XG4gICAgICAgICAgICA8Zm9ybSBjbGFzcz1cImhlYWRlci1zZWFyY2gtZm9ybVwiIGlkPVwiZ2xvYmFsLXNlYXJjaC1mb3JtXCIgcm9sZT1cInNlYXJjaFwiPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZ2xvYmFsLXNlYXJjaC1pbnB1dFwiIGNsYXNzPVwic3Itb25seVwiPlNlYXJjaCBwcm9kdWN0czwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJzZWFyY2hcIlxuICAgICAgICAgICAgICAgIGlkPVwiZ2xvYmFsLXNlYXJjaC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJoZWFkZXItc2VhcmNoLWlucHV0XCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBwaG9uZXMsIGxhcHRvcHMsIFBhbmphYmksIGhvbmV5Li4uXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjSHRtbChzZWFyY2hRdWVyeSl9XCJcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImhlYWRlci1zZWFyY2gtYnRuXCIgYXJpYS1sYWJlbD1cIlNlYXJjaFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtc3VnZ2VzdGlvbnNcIiBpZD1cInNlYXJjaC1zdWdnZXN0aW9uc1wiIGhpZGRlbj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXItYWN0aW9uc1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpY29uLWJ0blwiIGRhdGEtYWN0aW9uPVwibmF2LXdpc2hsaXN0XCIgdGl0bGU9XCJXaXNobGlzdFwiIGFyaWEtbGFiZWw9XCJXaXNobGlzdFwiPlxuICAgICAgICAgICAgICDimaFcbiAgICAgICAgICAgICAgJHt3aXNoQ291bnQgPiAwID8gYDxzcGFuIGNsYXNzPVwiY291bnQtYmFkZ2UgdGFidWxhci1udW1zXCI+JHt3aXNoQ291bnR9PC9zcGFuPmAgOiAnJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpY29uLWJ0blwiIGlkPVwiaGVhZGVyLWNhcnQtYnRuXCIgZGF0YS1hY3Rpb249XCJvcGVuLWNhcnRcIiB0aXRsZT1cIlNob3BwaW5nIENhcnRcIiBhcmlhLWxhYmVsPVwiT3BlbiBDYXJ0XCI+XG4gICAgICAgICAgICAgIPCfm5JcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3VudC1iYWRnZSB0YWJ1bGFyLW51bXNcIiBpZD1cImhlYWRlci1jYXJ0LWNvdW50XCI+JHtjYXJ0Q291bnR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAke3Nlc3Npb24gPyBgXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXItdXNlci13cmFwXCI+XG4gICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgIGhyZWY9XCIjYWNjb3VudFwiXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImhlYWRlci11c2VyLWNoaXAgJHtjdXJyZW50Um91dGUgPT09ICdhY2NvdW50JyA/ICdpcy1hY3RpdmUnIDogJyd9XCJcbiAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwib3Blbi1hY2NvdW50XCJcbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiT3BlbiBBY2NvdW50ICYgU2V0dGluZ3MgKCR7ZXNjSHRtbChzZXNzaW9uLmZ1bGxOYW1lKX0pXCJcbiAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJPcGVuIEFjY291bnQgYW5kIFNldHRpbmdzIGZvciAke2VzY0h0bWwoc2Vzc2lvbi5mdWxsTmFtZSl9XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhlYWRlci11c2VyLWF2YXRhclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAke3Nlc3Npb24uYXZhdGFyVXJsXG4gICAgICAgICAgICAgICAgICAgICAgPyBgPGltZyBzcmM9XCIke2VzY0h0bWwoc2Vzc2lvbi5hdmF0YXJVcmwpfVwiIGFsdD1cIlwiIGNsYXNzPVwiaGVhZGVyLXVzZXItYXZhdGFyLWltZ1wiIC8+YFxuICAgICAgICAgICAgICAgICAgICAgIDogZXNjSHRtbChpbml0aWFsKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImhlYWRlci11c2VyLW5hbWVcIj4ke2VzY0h0bWwoc2Vzc2lvbi5mdWxsTmFtZSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJoZWFkZXItdXNlci1jYXJldFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPuKamTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJoZWFkZXItbG9nb3V0LWJ0blwiIGRhdGEtYWN0aW9uPVwiY3VzdG9tZXItbG9nb3V0XCI+TG9nIE91dDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGAgOiAnJ31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPG5hdiBjbGFzcz1cImhlYWRlci1zdWJuYXZcIiBhcmlhLWxhYmVsPVwiTWFpbiBzdG9yZWZyb250IG5hdmlnYXRpb25cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdWJuYXYtd3JhcCBzY3JvbGxlci13cmFwXCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNjcm9sbGVyLWFycm93IHN1Ym5hdi1hcnJvdyBzdWJuYXYtcHJldlwiIGRhdGEtc2Nyb2xsLXRhcmdldD1cImhlYWRlci1zdWJuYXYtc2Nyb2xsXCIgZGF0YS1kaXI9XCItMVwiIGFyaWEtbGFiZWw9XCJTY3JvbGwgbWVudSBsZWZ0XCI+4oC5PC9idXR0b24+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3VibmF2LXNjcm9sbFwiIGlkPVwiaGVhZGVyLXN1Ym5hdi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgJHtuYXZJdGVtcy5tYXAoKGl0ZW0pID0+IGBcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLmhhc2h9XCIgY2xhc3M9XCJzdWJuYXYtbGluayAke2N1cnJlbnRSb3V0ZSA9PT0gaXRlbS5rZXkgPyAnYWN0aXZlJyA6ICcnfVwiPiR7aXRlbS5sYWJlbH08L2E+XG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNjcm9sbGVyLWFycm93IHN1Ym5hdi1hcnJvdyBzdWJuYXYtbmV4dFwiIGRhdGEtc2Nyb2xsLXRhcmdldD1cImhlYWRlci1zdWJuYXYtc2Nyb2xsXCIgZGF0YS1kaXI9XCIxXCIgYXJpYS1sYWJlbD1cIlNjcm9sbCBtZW51IHJpZ2h0XCI+4oC6PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9uYXY+XG4gICAgPC9oZWFkZXI+XG4gIGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJGb290ZXIoY3VycmVudFJvdXRlID0gJ2hvbWUnKSB7XG4gIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IFNFRURfR0VORVJBTF9TRVRUSU5HUztcbiAgY29uc3Qgc2Vzc2lvbiA9IGdldEN1c3RvbWVyU2Vzc2lvbigpO1xuICBjb25zdCBjYW5BY2Nlc3NBZG1pbiA9IGlzQ3VzdG9tZXJBZG1pbihzZXNzaW9uKTtcbiAgY29uc3QgY2FydENvdW50ID0gc3RhdGUuY2FydC5yZWR1Y2UoKHMsIGkpID0+IHMgKyBpLnF0eSwgMCk7XG4gIHJldHVybiBgXG4gICAgPGZvb3RlciBjbGFzcz1cInNpdGUtZm9vdGVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXItZ3JpZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXItY29sXCI+XG4gICAgICAgICAgICA8aDMgc3R5bGU9XCJtYXJnaW46MCAwIDhweDtjb2xvcjojZmZmZmZmO2ZvbnQtc2l6ZToxLjNyZW07XCI+JHtlc2NIdG1sKGcuc2l0ZU5hbWUgfHwgJ1BhemFybyBCRCcpfTwvaDM+XG4gICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowIDAgMTJweDtmb250LXNpemU6MC44OHJlbTtvcGFjaXR5OjAuODU7XCI+JHtlc2NIdG1sKGcudGFnbGluZSB8fCAnWW91ciBCYXphYXIsIFNtYXJ0ZXInKX08L3A+XG4gICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowIDAgNnB4O2ZvbnQtc2l6ZTowLjg0cmVtO1wiPiR7ZXNjSHRtbChnLmFkZHJlc3MpfTwvcD5cbiAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjA7Zm9udC1zaXplOjAuODRyZW07XCI+UGhvbmU6ICR7ZXNjSHRtbChnLnBob25lKX0gwrcgRW1haWw6ICR7ZXNjSHRtbChnLmVtYWlsKX08L3A+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9vdGVyLWNvbFwiPlxuICAgICAgICAgICAgPGg0PlNob3A8L2g0PlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwiZm9vdGVyLWxpbmtzXCI+XG4gICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI2RlYWxzXCI+Rmxhc2ggRGVhbHM8L2E+PC9saT5cbiAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjbmV3LWFycml2YWxzXCI+TmV3IEFycml2YWxzPC9hPjwvbGk+XG4gICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI2Jlc3Qtc2VsbGVyc1wiPkJlc3QgU2VsbGVyczwvYT48L2xpPlxuICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNjYXRlZ29yaWVzXCI+QWxsIENhdGVnb3JpZXM8L2E+PC9saT5cbiAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjd2lzaGxpc3RcIj5TYXZlZCBXaXNobGlzdDwvYT48L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXItY29sXCI+XG4gICAgICAgICAgICA8aDQ+Q3VzdG9tZXIgQ2FyZTwvaDQ+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJmb290ZXItbGlua3NcIj5cbiAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjYWNjb3VudFwiPk15IEFjY291bnQgJiBTZXR0aW5nczwvYT48L2xpPlxuICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNoZWxwLWNlbnRlclwiPkhlbHAgQ2VudGVyPC9hPjwvbGk+XG4gICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3RyYWNrLW9yZGVyXCI+VHJhY2sgT3JkZXI8L2E+PC9saT5cbiAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjcmV0dXJucy1yZWZ1bmRzXCI+UmV0dXJucyBhbmQgUmVmdW5kczwvYT48L2xpPlxuICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNjb250YWN0LXVzXCI+Q29udGFjdCBVczwvYT48L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXItY29sXCI+XG4gICAgICAgICAgICA8aDQ+QWJvdXQgUGF6YXJvIEJEPC9oND5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cImZvb3Rlci1saW5rc1wiPlxuICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNhYm91dC11c1wiPk91ciBTdG9yeTwvYT48L2xpPlxuICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNibG9nXCI+VGVjaCAmIExpZmVzdHlsZSBCbG9nPC9hPjwvbGk+XG4gICAgICAgICAgICAgICR7Y2FuQWNjZXNzQWRtaW4gPyBgPGxpPjxhIGhyZWY9XCIvYWRtaW5cIiBkYXRhLWFjdGlvbj1cImdvLWFkbWluXCI+QWRtaW4gUG9ydGFsPC9hPjwvbGk+YCA6ICcnfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjEycHg7bWFyZ2luLXRvcDoxNHB4O2ZvbnQtc2l6ZTowLjg4cmVtO1wiPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiJHtlc2NIdG1sKGcuZmFjZWJvb2tVcmwgfHwgJyMnKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+RmFjZWJvb2s8L2E+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCIke2VzY0h0bWwoZy5pbnN0YWdyYW1VcmwgfHwgJyMnKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+SW5zdGFncmFtPC9hPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiJHtlc2NIdG1sKGcueW91dHViZVVybCB8fCAnIycpfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5Zb3VUdWJlPC9hPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXItYm90dG9tXCI+XG4gICAgICAgICAgPHNwYW4+JHtlc2NIdG1sKGcuZm9vdGVyVGV4dCl9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuPlByaWNlcyBpbiBCYW5nbGFkZXNoaSBUYWthICjgp7MpIMK3IENhc2ggb24gRGVsaXZlcnksIGJLYXNoICYgTmFnYWQ8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9mb290ZXI+XG5cbiAgICA8YVxuICAgICAgaHJlZj1cImh0dHBzOi8vd2EubWUvJHtlc2NIdG1sKFN0cmluZyhnLndoYXRzYXBwIHx8ICc4ODAxNzAwMDAwMDAwJykucmVwbGFjZSgvXFxEL2csICcnKSl9XCJcbiAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgIGNsYXNzPVwiZmxvYXRpbmctd2hhdHNhcHBcIlxuICAgICAgYXJpYS1sYWJlbD1cIkNoYXQgb24gV2hhdHNBcHBcIlxuICAgICAgdGl0bGU9XCJDaGF0IHdpdGggUGF6YXJvIEJEIG9uIFdoYXRzQXBwXCJcbiAgICA+XG4gICAgICDwn5KsXG4gICAgPC9hPlxuXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJiYWNrLXRvLXRvcFwiIGlkPVwiYmFjay10by10b3AtYnRuXCIgYXJpYS1sYWJlbD1cIkJhY2sgdG8gdG9wXCI+4oaRPC9idXR0b24+XG5cbiAgICA8bmF2IGNsYXNzPVwibW9iaWxlLWJvdHRvbS1uYXYgJHtjYW5BY2Nlc3NBZG1pbiA/ICdtb2JpbGUtYm90dG9tLW5hdi0tNScgOiAnJ31cIiBhcmlhLWxhYmVsPVwiTW9iaWxlIG5hdmlnYXRpb25cIj5cbiAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIGNsYXNzPVwibW9iaWxlLW5hdi1pdGVtICR7Y3VycmVudFJvdXRlID09PSAnaG9tZScgPyAnYWN0aXZlJyA6ICcnfVwiPjxzcGFuPvCfj6A8L3NwYW4+PHNwYW4+SG9tZTwvc3Bhbj48L2E+XG4gICAgICA8YSBocmVmPVwiI2NhdGVnb3JpZXNcIiBjbGFzcz1cIm1vYmlsZS1uYXYtaXRlbSAke2N1cnJlbnRSb3V0ZSA9PT0gJ2NhdGVnb3JpZXMnID8gJ2FjdGl2ZScgOiAnJ31cIj48c3Bhbj7wn5eC77iPPC9zcGFuPjxzcGFuPkNhdGVnb3JpZXM8L3NwYW4+PC9hPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtb2JpbGUtbmF2LWl0ZW1cIiBkYXRhLWFjdGlvbj1cIm9wZW4tY2FydFwiPjxzcGFuPvCfm5I8L3NwYW4+PHNwYW4+Q2FydCAoJHtjYXJ0Q291bnR9KTwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICR7Y2FuQWNjZXNzQWRtaW5cbiAgICAgICAgPyBgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtb2JpbGUtbmF2LWl0ZW1cIiBkYXRhLWFjdGlvbj1cImdvLWFkbWluXCI+PHNwYW4+8J+boe+4jzwvc3Bhbj48c3Bhbj5BZG1pbjwvc3Bhbj48L2J1dHRvbj5gXG4gICAgICAgIDogJydcbiAgICAgIH1cbiAgICAgIDxhIGhyZWY9XCIjYWNjb3VudFwiIGNsYXNzPVwibW9iaWxlLW5hdi1pdGVtIG1vYmlsZS1uYXYtYWNjb3VudCAke2N1cnJlbnRSb3V0ZSA9PT0gJ2FjY291bnQnID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLWFjdGlvbj1cIm9wZW4tYWNjb3VudFwiIGFyaWEtbGFiZWw9XCJNeSBBY2NvdW50IGFuZCBTZXR0aW5nc1wiPlxuICAgICAgICAke3Nlc3Npb24/LmF2YXRhclVybFxuICAgICAgICAgID8gYDxpbWcgc3JjPVwiJHtlc2NIdG1sKHNlc3Npb24uYXZhdGFyVXJsKX1cIiBhbHQ9XCJcIiBjbGFzcz1cIm1vYmlsZS1uYXYtYXZhdGFyXCIgLz5gXG4gICAgICAgICAgOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIk0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyXCI+PC9wYXRoPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiN1wiIHI9XCI0XCI+PC9jaXJjbGU+PC9zdmc+YFxuICAgICAgICB9XG4gICAgICAgIDxzcGFuPkFjY291bnQ8L3NwYW4+XG4gICAgICA8L2E+XG4gICAgPC9uYXY+XG4gIGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJIb21lVmlldyhhY3RpdmVTbGlkZUlkeCA9IDApIHtcbiAgY29uc3Qgc2xpZGVzID0gc3RhdGUudGhlbWU/Lmhlcm9TbGlkZXM/Lmxlbmd0aCA/IHN0YXRlLnRoZW1lLmhlcm9TbGlkZXMgOiBbXTtcbiAgY29uc3QgcHJvbW9zID0gc3RhdGUudGhlbWU/LnByb21vVGlsZXM/Lmxlbmd0aCA/IHN0YXRlLnRoZW1lLnByb21vVGlsZXMgOiBbXTtcbiAgY29uc3Qgc2FmZUlkeCA9IHNsaWRlcy5sZW5ndGggPyBhY3RpdmVTbGlkZUlkeCAlIHNsaWRlcy5sZW5ndGggOiAwO1xuXG4gIGNvbnN0IGZsYXNoUHJvZHVjdHMgPSBzdGF0ZS5wcm9kdWN0cy5maWx0ZXIoKHApID0+IHAuaXNGbGFzaFNhbGUpO1xuICBjb25zdCB0cmVuZGluZ1Byb2R1Y3RzID0gc3RhdGUucHJvZHVjdHMuZmlsdGVyKChwKSA9PiBwLmlzVHJlbmRpbmcpO1xuICBjb25zdCBuZXdQcm9kdWN0cyA9IHN0YXRlLnByb2R1Y3RzLmZpbHRlcigocCkgPT4gcC5pc05ld0Fycml2YWwpO1xuICBjb25zdCB0b3BUZWNoID0gc3RhdGUucHJvZHVjdHMuZmlsdGVyKChwKSA9PiBbJ1Bob25lcycsICdMYXB0b3BzJywgJ0hlYWRwaG9uZXMnLCAnU21hcnQgV2F0Y2hlcycsICdHYW1pbmcnLCAnU21hcnQgSG9tZSddLmluY2x1ZGVzKHAuY2F0ZWdvcnkpKTtcbiAgY29uc3QgcmVjb21tZW5kZWQgPSBbLi4uc3RhdGUucHJvZHVjdHNdLnNvcnQoKGEsIGIpID0+IChiLnJhdGluZyB8fCAwKSAtIChhLnJhdGluZyB8fCAwKSkuc2xpY2UoMCwgMTApO1xuICBjb25zdCByZWNlbnRQcm9kdWN0cyA9IHN0YXRlLnJlY2VudGx5Vmlld2VkXG4gICAgLm1hcCgoaWQpID0+IHN0YXRlLnByb2R1Y3RzLmZpbmQoKHApID0+IHAuaWQgPT09IGlkKSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xuXG4gIGNvbnN0IHB1Ymxpc2hlZFBvc3RzID0gc3RhdGUucG9zdHMuZmlsdGVyKChwKSA9PiBwLnB1Ymxpc2hlZCAhPT0gZmFsc2UpLnNsaWNlKDAsIDMpO1xuICBjb25zdCB0b3BSZXZpZXdzID0gc3RhdGUucmV2aWV3cy5maWx0ZXIoKHIpID0+IHIuYXBwcm92ZWQgIT09IGZhbHNlKS5zbGljZSgwLCA2KTtcblxuICByZXR1cm4gYFxuICAgIDxtYWluIGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICA8IS0tIDEuIEhlcm8gU2xpZGVyIC0tPlxuICAgICAgPHNlY3Rpb24gY2xhc3M9XCJoZXJvLXNlY3Rpb25cIiBhcmlhLWxhYmVsPVwiRmVhdHVyZWQgUHJvbW90aW9uc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaGVyby1zbGlkZXJcIiBpZD1cImhlcm8tc2xpZGVyXCIgZGF0YS1zbGlkZS1jb3VudD1cIiR7c2xpZGVzLmxlbmd0aH1cIiBkYXRhLWFjdGl2ZS1pbmRleD1cIiR7c2FmZUlkeH1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVyby10cmFja1wiIGlkPVwiaGVyby10cmFja1wiIHN0eWxlPVwidHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtJHtzYWZlSWR4ICogMTAwfSUsIDAsIDApO1wiPlxuICAgICAgICAgICAgJHtzbGlkZXMubWFwKChzbGlkZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVkUHJvZCA9IHNsaWRlLmZlYXR1cmVkUHJvZHVjdElkXG4gICAgICAgICAgICAgICAgPyBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBTdHJpbmcocC5pZCkgPT09IFN0cmluZyhzbGlkZS5mZWF0dXJlZFByb2R1Y3RJZCkpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgICBjb25zdCBhbmltU3R5bGUgPSBbJ2Zsb2F0JywgJ29yYml0JywgJ3B1bHNlJywgJ3pvb20nLCAnZ2xpZGUnLCAnZmFkZSddLmluY2x1ZGVzKHNsaWRlLmFuaW1TdHlsZSlcbiAgICAgICAgICAgICAgICA/IHNsaWRlLmFuaW1TdHlsZVxuICAgICAgICAgICAgICAgIDogJ2dsaWRlJztcbiAgICAgICAgICAgICAgY29uc3QgaGVyb0ltZyA9IHNsaWRlLmltYWdlVXJsIHx8IChmZWF0dXJlZFByb2QgPyBnZXRQcm9kdWN0SW1hZ2UoZmVhdHVyZWRQcm9kLCAwKSA6ICcnKSB8fCBMT0NBTF9QSE9UT1MuaGVyb1RlY2g7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVyby1zbGlkZSAke2lkeCA9PT0gc2FmZUlkeCA/ICdhY3RpdmUgaXMtYWN0aXZlJyA6ICcnfVwiIGRhdGEtc2xpZGUtaW5kZXg9XCIke2lkeH1cIiBkYXRhLWFuaW09XCIke2VzY0h0bWwoYW5pbVN0eWxlKX1cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZXJvLWNvcHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImhlcm8ta2lja2VyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgJHtzbGlkZS5iYWRnZVRleHQgPyBgPHNwYW4gY2xhc3M9XCJoZXJvLWtpY2tlci10YWdcIj4ke2VzY0h0bWwoc2xpZGUuYmFkZ2VUZXh0KX08L3NwYW4+YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7ZXNjSHRtbChzbGlkZS5raWNrZXIgfHwgJ1BhemFybyBCRCBFeGNsdXNpdmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3M9XCJoZXJvLXRpdGxlXCI+JHtlc2NIdG1sKHNsaWRlLmhlYWRsaW5lKX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImhlcm8tc3ViXCI+JHtlc2NIdG1sKHNsaWRlLnN1YnRleHQpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImhlcm8tY3RhLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2VzY0h0bWwoc2xpZGUuYnV0dG9uTGluayB8fCAnI2RlYWxzJyl9XCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudCBoZXJvLWN0YS1idG5cIj4ke2VzY0h0bWwoc2xpZGUuYnV0dG9uVGV4dCB8fCAnU2hvcCBOb3cnKX0g4oaSPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICR7ZmVhdHVyZWRQcm9kID8gYFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNwcm9kdWN0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZlYXR1cmVkUHJvZC5pZCl9XCIgY2xhc3M9XCJoZXJvLXNlY29uZGFyeS1saW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICR7ZXNjSHRtbChmZWF0dXJlZFByb2QubmFtZSl9IMK3IDxzdHJvbmc+JHtmb3JtYXRQcmljZShmZWF0dXJlZFByb2QucHJpY2UpfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgIGAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZXJvLW1lZGlhXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImhlcm8tYmctaW1nIGhlcm8tYmctYW5pbS0ke2VzY0h0bWwoYW5pbVN0eWxlKX1cIlxuICAgICAgICAgICAgICAgICAgICAgIHNyYz1cIiR7ZXNjSHRtbChoZXJvSW1nKX1cIlxuICAgICAgICAgICAgICAgICAgICAgIGFsdD1cIiR7ZXNjSHRtbChzbGlkZS5oZWFkbGluZSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICBsb2FkaW5nPVwiJHtpZHggPT09IDAgPyAnZWFnZXInIDogJ2xhenknfVwiXG4gICAgICAgICAgICAgICAgICAgICAgZGVjb2Rpbmc9XCJhc3luY1wiXG4gICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVyby1tZWRpYS1zY3JpbVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAke3NsaWRlcy5sZW5ndGggPiAxID8gYFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJoZXJvLW5hdi1idG4gaGVyby1wcmV2XCIgZGF0YS1hY3Rpb249XCJoZXJvLXByZXZcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXMgc2xpZGVcIj7igLk8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaGVyby1uYXYtYnRuIGhlcm8tbmV4dFwiIGRhdGEtYWN0aW9uPVwiaGVyby1uZXh0XCIgYXJpYS1sYWJlbD1cIk5leHQgc2xpZGVcIj7igLo8L2J1dHRvbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZXJvLWJvdHRvbS1iYXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImhlcm8tZG90c1wiPlxuICAgICAgICAgICAgICAgICR7c2xpZGVzLm1hcCgoXywgaWR4KSA9PiBgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJoZXJvLWRvdCAke2lkeCA9PT0gc2FmZUlkeCA/ICdhY3RpdmUnIDogJyd9XCIgZGF0YS1hY3Rpb249XCJoZXJvLWRvdFwiIGRhdGEtaW5kZXg9XCIke2lkeH1cIiBhcmlhLWxhYmVsPVwiR28gdG8gc2xpZGUgJHtpZHggKyAxfVwiPjwvYnV0dG9uPmApLmpvaW4oJycpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImhlcm8tc2xpZGUtbWV0YVwiIGFyaWEtbGl2ZT1cInBvbGl0ZVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGVyby1zbGlkZS1jb3VudGVyIHRhYnVsYXItbnVtc1wiIGlkPVwiaGVyby1zbGlkZS1jb3VudGVyXCI+JHtTdHJpbmcoc2FmZUlkeCArIDEpLnBhZFN0YXJ0KDIsICcwJyl9IC8gJHtTdHJpbmcoc2xpZGVzLmxlbmd0aCkucGFkU3RhcnQoMiwgJzAnKX08L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYCA6ICcnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPCEtLSBMZWFkZXJib2FyZCBBZCB1bmRlciBIZXJvIChjb2xsYXBzZXMgY29tcGxldGVseSB3aGVuIGVtcHR5KSAtLT5cbiAgICAgICR7cmVuZGVyQWRTbG90KCdhZF9oZXJvX2xlYWRlcmJvYXJkJyl9XG5cbiAgICAgIDwhLS0gMi4gU3dpcGVhYmxlIENhdGVnb3J5IENpcmNsZXMgLS0+XG4gICAgICA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24tYmxvY2sgc2VjdGlvbi1jYXRlZ29yaWVzLXRvcFwiIGFyaWEtbGFiZWw9XCJCcm93c2UgQ2F0ZWdvcmllc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1oZWFkXCI+XG4gICAgICAgICAgPGgyIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPlNob3AgYnkgQ2F0ZWdvcnk8L2gyPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDtcIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIjY2F0ZWdvcmllc1wiIGNsYXNzPVwic2VjdGlvbi1saW5rXCI+QWxsIENhdGVnb3JpZXMg4oaSPC9hPlxuICAgICAgICAgICAgJHsoaXNDdXN0b21lckFkbWluKCkgfHwgc3RhdGUuaXNBZG1pbilcbiAgICAgICAgICAgICAgPyBgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJzdG9yZWZyb250LWVkaXQtY2F0ZWdvcnlcIj7inI/vuI8gRWRpdCBDYXRlZ29yeTwvYnV0dG9uPmBcbiAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGVyLXdyYXBcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNjcm9sbGVyLWFycm93IHNjcm9sbGVyLXByZXZcIiBkYXRhLXNjcm9sbC10YXJnZXQ9XCJob21lLWNhdC1zY3JvbGxlclwiIGRhdGEtZGlyPVwiLTFcIiBhcmlhLWxhYmVsPVwiU2Nyb2xsIGNhdGVnb3JpZXMgbGVmdFwiPuKAuTwvYnV0dG9uPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXQtc2Nyb2xsZXJcIiBpZD1cImhvbWUtY2F0LXNjcm9sbGVyXCI+XG4gICAgICAgICAgICAke3N0YXRlLmNhdGVnb3JpZXMubWFwKChjYXQpID0+IGBcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjYXQtaXRlbVwiIGRhdGEtYWN0aW9uPVwib3Blbi1jYXRlZ29yeVwiIGRhdGEtY2F0ZWdvcnk9XCIke2VzY0h0bWwoY2F0Lm5hbWUpfVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXQtY2lyY2xlXCI+XG4gICAgICAgICAgICAgICAgICAke2NhdC5pbWFnZVVybFxuICAgICAgICAgICAgICAgICAgICA/IGA8aW1nIHNyYz1cIiR7ZXNjSHRtbChjYXQuaW1hZ2VVcmwpfVwiIGFsdD1cIiR7ZXNjSHRtbChjYXQubmFtZSl9XCIgbG9hZGluZz1cImxhenlcIiBkZWNvZGluZz1cImFzeW5jXCIgLz5gXG4gICAgICAgICAgICAgICAgICAgIDogYDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiR7ZXNjSHRtbChjYXQuaWNvbiB8fCAn8J+bje+4jycpfTwvc3Bhbj5gXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXQtbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgJHtlc2NIdG1sKGNhdC5uYW1lKX1cbiAgICAgICAgICAgICAgICAgICR7Y2F0Lm5hbWVCbiA/IGA8c3BhbiBjbGFzcz1cImNhdC1uYW1lLWJuXCI+JHtlc2NIdG1sKGNhdC5uYW1lQm4pfTwvc3Bhbj5gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwic2Nyb2xsZXItYXJyb3cgc2Nyb2xsZXItbmV4dFwiIGRhdGEtc2Nyb2xsLXRhcmdldD1cImhvbWUtY2F0LXNjcm9sbGVyXCIgZGF0YS1kaXI9XCIxXCIgYXJpYS1sYWJlbD1cIlNjcm9sbCBjYXRlZ29yaWVzIHJpZ2h0XCI+4oC6PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8IS0tIDQuIFByb2R1Y3QgU2Nyb2xsZXJzIC0tPlxuICAgICAgJHtyZW5kZXJIb3Jpem9udGFsU2Nyb2xsZXIoJ3Njcm9sbGVyLWZsYXNoJywgJ0ZsYXNoIFNhbGUnLCBmbGFzaFByb2R1Y3RzLCB7IGxpbmtIYXNoOiAnI2RlYWxzJywgaXNGbGFzaDogdHJ1ZSB9KX1cbiAgICAgICR7cmVuZGVySG9yaXpvbnRhbFNjcm9sbGVyKCdzY3JvbGxlci10cmVuZGluZycsICdUcmVuZGluZyBOb3cnLCB0cmVuZGluZ1Byb2R1Y3RzLCB7IGxpbmtIYXNoOiAnI2Jlc3Qtc2VsbGVycycgfSl9XG5cbiAgICAgIDwhLS0gTWlkIFJlY3RhbmdsZSBBZCAtLT5cbiAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW46IDEycHggMDtcIj4ke3JlbmRlckFkU2xvdCgnYWRfbWlkX3JlY3RhbmdsZScpfTwvZGl2PlxuXG4gICAgICA8IS0tIDUuIFByb21vIEJhbm5lciBUaWxlcyAtLT5cbiAgICAgICR7cHJvbW9zLmxlbmd0aCA/IGBcbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uLWJsb2NrXCIgYXJpYS1sYWJlbD1cIkZlYXR1cmVkIENvbGxlY3Rpb25zXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByb21vLWdyaWRcIj5cbiAgICAgICAgICAgICR7cHJvbW9zLm1hcCgodGlsZSkgPT4gYFxuICAgICAgICAgICAgICA8YSBocmVmPVwiJHtlc2NIdG1sKHRpbGUubGluayB8fCAnI2RlYWxzJyl9XCIgY2xhc3M9XCJwcm9tby10aWxlXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2VzY0h0bWwodGlsZS5pbWFnZVVybCB8fCBMT0NBTF9QSE9UT1MuYXVkaW9HYW1pbmcpfVwiIGFsdD1cIiR7ZXNjSHRtbCh0aWxlLnRpdGxlKX1cIiBsb2FkaW5nPVwibGF6eVwiIGRlY29kaW5nPVwiYXN5bmNcIiAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9tby1zY3JpbVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9tby1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICA8aDM+JHtlc2NIdG1sKHRpbGUudGl0bGUpfTwvaDM+XG4gICAgICAgICAgICAgICAgICA8cD4ke2VzY0h0bWwodGlsZS5zdWJ0ZXh0KX08L3A+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWFjY2VudFwiPiR7ZXNjSHRtbCh0aWxlLmJ1dHRvblRleHQgfHwgJ1Nob3AgTm93Jyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgYCA6ICcnfVxuXG4gICAgICAke3JlbmRlckhvcml6b250YWxTY3JvbGxlcignc2Nyb2xsZXItbmV3JywgJ05ldyBBcnJpdmFscycsIG5ld1Byb2R1Y3RzLCB7IGxpbmtIYXNoOiAnI25ldy1hcnJpdmFscycgfSl9XG4gICAgICAke3JlbmRlckhvcml6b250YWxTY3JvbGxlcignc2Nyb2xsZXItdGVjaCcsICdUb3AgVGVjaCBQaWNrcycsIHRvcFRlY2gsIHsgbGlua0hhc2g6ICcjdG9wLXRlY2gnIH0pfVxuICAgICAgJHtyZW5kZXJIb3Jpem9udGFsU2Nyb2xsZXIoJ3Njcm9sbGVyLXJlY29tbWVuZGVkJywgJ1JlY29tbWVuZGVkIEZvciBZb3UnLCByZWNvbW1lbmRlZCwgeyBsaW5rSGFzaDogJyNjYXRlZ29yaWVzJyB9KX1cbiAgICAgICR7cmVjZW50UHJvZHVjdHMubGVuZ3RoID8gcmVuZGVySG9yaXpvbnRhbFNjcm9sbGVyKCdzY3JvbGxlci1yZWNlbnQnLCAnUmVjZW50bHkgVmlld2VkJywgcmVjZW50UHJvZHVjdHMsIHsgbGlua0hhc2g6ICcjY2F0ZWdvcmllcycgfSkgOiAnJ31cblxuICAgICAgPCEtLSA2LiBMYXRlc3QgQmxvZyBQb3N0cyAtLT5cbiAgICAgICR7cHVibGlzaGVkUG9zdHMubGVuZ3RoID8gYFxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24tYmxvY2tcIiBhcmlhLWxhYmVsPVwiTGF0ZXN0IEJsb2cgUG9zdHNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1oZWFkXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+VGVjaCBUaXBzICYgQnV5aW5nIEd1aWRlczwvaDI+XG4gICAgICAgICAgICA8YSBocmVmPVwiI2Jsb2dcIiBjbGFzcz1cInNlY3Rpb24tbGlua1wiPlJlYWQgQmxvZyDihpI8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2ctZ3JpZFwiPlxuICAgICAgICAgICAgJHtwdWJsaXNoZWRQb3N0cy5tYXAoKHBvc3QpID0+IGBcbiAgICAgICAgICAgICAgPGFydGljbGUgY2xhc3M9XCJibG9nLWNhcmRcIiBkYXRhLWFjdGlvbj1cIm9wZW4tcG9zdFwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocG9zdC5pZCl9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2ctY2FyZC1pbWdcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtlc2NIdG1sKHBvc3QuY292ZXJJbWFnZSB8fCBMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZSl9XCIgYWx0PVwiJHtlc2NIdG1sKHBvc3QudGl0bGUpfVwiIGxvYWRpbmc9XCJsYXp5XCIgZGVjb2Rpbmc9XCJhc3luY1wiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2ctY2FyZC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmxvZy1tZXRhXCI+JHtlc2NIdG1sKHBvc3QuY2F0ZWdvcnkpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGgzPiR7ZXNjSHRtbChwb3N0LnRpdGxlKX08L2gzPlxuICAgICAgICAgICAgICAgICAgPHA+JHtlc2NIdG1sKHBvc3QuZXhjZXJwdCB8fCAnJyl9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgYCA6ICcnfVxuXG4gICAgICA8IS0tIDcuIEN1c3RvbWVyIFJldmlld3MgLS0+XG4gICAgICA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24tYmxvY2tcIiBhcmlhLWxhYmVsPVwiQ3VzdG9tZXIgUmV2aWV3c1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1oZWFkXCI+XG4gICAgICAgICAgPGgyIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPkxvdmVkIGJ5IFRob3VzYW5kczwvaDI+XG4gICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MC44NXJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+VmVyaWZpZWQgU2hvcHBlcnMgQWNyb3NzIEJhbmdsYWRlc2g8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmV2aWV3cy1ncmlkXCI+XG4gICAgICAgICAgJHt0b3BSZXZpZXdzLm1hcCgocmV2KSA9PiBgXG4gICAgICAgICAgICA8YXJ0aWNsZSBjbGFzcz1cInJldmlldy1jYXJkXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXZpZXctc3RhcnNcIiBhcmlhLWxhYmVsPVwiJHtyZXYucmF0aW5nfSBvdXQgb2YgNSBzdGFyc1wiPiR7cmVuZGVyU3RhcnMocmV2LnJhdGluZyl9PC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwicmV2aWV3LXRleHRcIj5cIiR7ZXNjSHRtbChyZXYuY29tbWVudCl9XCI8L3A+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXZpZXctYXV0aG9yXCI+JHtlc2NIdG1sKHJldi5hdXRob3JOYW1lKX0gwrcgJHtlc2NIdG1sKHJldi5jaXR5IHx8ICdCYW5nbGFkZXNoJyl9PC9kaXY+XG4gICAgICAgICAgICA8L2FydGljbGU+XG4gICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8IS0tIDguIE5ld3NsZXR0ZXIgLS0+XG4gICAgICA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24tYmxvY2tcIiBhcmlhLWxhYmVsPVwiTmV3c2xldHRlciBTaWdudXBcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5ld3NsZXR0ZXItYm94XCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgNHB4O2ZvbnQtc2l6ZToxLjM1cmVtO1wiPlN0YXkgaW4gdGhlIExvb3A8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MC45cmVtO29wYWNpdHk6MC45O1wiPkdldCBmbGFzaCBzYWxlIGFsZXJ0cywgbmV3IGdhZGdldCBkcm9wcywgYW5kIGV4Y2x1c2l2ZSBEaGFrYSAmIG5hdGlvbndpZGUgZGVhbHMuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxmb3JtIGNsYXNzPVwibmV3c2xldHRlci1mb3JtXCIgaWQ9XCJuZXdzbGV0dGVyLWZvcm1cIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJuZXdzbGV0dGVyLWVtYWlsXCIgY2xhc3M9XCJzci1vbmx5XCI+RW1haWwgYWRkcmVzczwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCIgaWQ9XCJuZXdzbGV0dGVyLWVtYWlsXCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJFbnRlciB5b3VyIGVtYWlsIGFkZHJlc3NcIiAvPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiPlN1YnNjcmliZTwvYnV0dG9uPlxuICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIDwhLS0gRm9vdGVyIEJhbm5lciBBZCAtLT5cbiAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW46IDEycHggMDtcIj4ke3JlbmRlckFkU2xvdCgnYWRfZm9vdGVyX2Jhbm5lcicpfTwvZGl2PlxuICAgIDwvbWFpbj5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNhdGFsb2dWaWV3KHsgdGl0bGUsIGNhdGVnb3J5RmlsdGVyID0gJ0FsbCcsIG1vZGUgPSAnYWxsJywgc2VhcmNoUXVlcnkgPSAnJywgc29ydEJ5ID0gJ2ZlYXR1cmVkJyB9KSB7XG4gIGxldCBpdGVtcyA9IFsuLi5zdGF0ZS5wcm9kdWN0c107XG5cbiAgaWYgKG1vZGUgPT09ICdkZWFscycpIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChwKSA9PiBwLmlzRmxhc2hTYWxlIHx8IGNhbGNEaXNjb3VudFBlcmNlbnQocC5wcmljZSwgcC5vbGRQcmljZSkgPj0gMTUpO1xuICBpZiAobW9kZSA9PT0gJ25ldycpIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChwKSA9PiBwLmlzTmV3QXJyaXZhbCk7XG4gIGlmIChtb2RlID09PSAnYmVzdHNlbGxlcnMnKSBpdGVtcyA9IFsuLi5pdGVtc10uc29ydCgoYSwgYikgPT4gKGIudW5pdHNTb2xkIHx8IDApIC0gKGEudW5pdHNTb2xkIHx8IDApKTtcbiAgaWYgKG1vZGUgPT09ICd0b3AtdGVjaCcpIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChwKSA9PiBbJ1Bob25lcycsICdMYXB0b3BzJywgJ0hlYWRwaG9uZXMnLCAnU21hcnQgV2F0Y2hlcycsICdHYW1pbmcnLCAnU21hcnQgSG9tZSddLmluY2x1ZGVzKHAuY2F0ZWdvcnkpKTtcbiAgaWYgKG1vZGUgPT09ICd3aXNobGlzdCcpIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChwKSA9PiBzdGF0ZS53aXNobGlzdC5pbmNsdWRlcyhwLmlkKSk7XG5cbiAgaWYgKGNhdGVnb3J5RmlsdGVyICYmIGNhdGVnb3J5RmlsdGVyICE9PSAnQWxsJykge1xuICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKChwKSA9PiBwLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCkgPT09IGNhdGVnb3J5RmlsdGVyLnRvTG93ZXJDYXNlKCkpO1xuICB9XG5cbiAgaWYgKHNlYXJjaFF1ZXJ5KSB7XG4gICAgY29uc3QgcSA9IHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoKHApID0+XG4gICAgICBwLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSB8fFxuICAgICAgcC5jYXRlZ29yeS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpIHx8XG4gICAgICAocC5icmFuZCB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSB8fFxuICAgICAgKHAudGFncyB8fCBbXSkuc29tZSgodCkgPT4gdC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpKVxuICAgICk7XG4gIH1cblxuICBpZiAoc29ydEJ5ID09PSAncHJpY2UtYXNjJykgaXRlbXMuc29ydCgoYSwgYikgPT4gYS5wcmljZSAtIGIucHJpY2UpO1xuICBpZiAoc29ydEJ5ID09PSAncHJpY2UtZGVzYycpIGl0ZW1zLnNvcnQoKGEsIGIpID0+IGIucHJpY2UgLSBhLnByaWNlKTtcbiAgaWYgKHNvcnRCeSA9PT0gJ3JhdGluZycpIGl0ZW1zLnNvcnQoKGEsIGIpID0+IChiLnJhdGluZyB8fCAwKSAtIChhLnJhdGluZyB8fCAwKSk7XG5cbiAgcmV0dXJuIGBcbiAgICA8bWFpbiBjbGFzcz1cImNvbnRhaW5lclwiIHN0eWxlPVwicGFkZGluZy10b3A6MjBweDtwYWRkaW5nLWJvdHRvbTozMnB4O1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24taGVhZFwiIHN0eWxlPVwiZmxleC13cmFwOndyYXA7XCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiIHN0eWxlPVwibWFyZ2luOjA7XCI+JHtlc2NIdG1sKHRpdGxlKX08L2gxPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44NXJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLXRvcDoycHg7XCI+XG4gICAgICAgICAgICBTaG93aW5nICR7aXRlbXMubGVuZ3RofSBwcm9kdWN0JHtpdGVtcy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjEwcHg7YWxpZ24taXRlbXM6Y2VudGVyO1wiPlxuICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3RcIiBpZD1cImNhdGFsb2ctY2F0LXNlbGVjdFwiIHN0eWxlPVwid2lkdGg6YXV0bzttaW4taGVpZ2h0OjQycHg7XCI+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiQWxsXCI+QWxsIENhdGVnb3JpZXM8L29wdGlvbj5cbiAgICAgICAgICAgICR7c3RhdGUuY2F0ZWdvcmllcy5tYXAoKGMpID0+IGBcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjSHRtbChjLm5hbWUpfVwiICR7Y2F0ZWdvcnlGaWx0ZXIgPT09IGMubmFtZSA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICAgICAgJHtlc2NIdG1sKGMubmFtZSl9JHtjLm5hbWVCbiA/IGAgKCR7ZXNjSHRtbChjLm5hbWVCbil9KWAgOiAnJ31cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAkeyhpc0N1c3RvbWVyQWRtaW4oKSB8fCBzdGF0ZS5pc0FkbWluKVxuICAgICAgICAgICAgPyBgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJzdG9yZWZyb250LWVkaXQtY2F0ZWdvcnlcIiBkYXRhLWNhdGVnb3J5PVwiJHtlc2NIdG1sKGNhdGVnb3J5RmlsdGVyKX1cIj7inI/vuI8gRWRpdCBDYXRlZ29yeTwvYnV0dG9uPmBcbiAgICAgICAgICAgIDogJydcbiAgICAgICAgICB9XG4gICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwiY2F0YWxvZy1zb3J0LXNlbGVjdFwiIHN0eWxlPVwid2lkdGg6YXV0bzttaW4taGVpZ2h0OjQycHg7XCI+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZmVhdHVyZWRcIiAke3NvcnRCeSA9PT0gJ2ZlYXR1cmVkJyA/ICdzZWxlY3RlZCcgOiAnJ30+U29ydDogRmVhdHVyZWQ8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJwcmljZS1hc2NcIiAke3NvcnRCeSA9PT0gJ3ByaWNlLWFzYycgPyAnc2VsZWN0ZWQnIDogJyd9PlByaWNlOiBMb3cgdG8gSGlnaDwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInByaWNlLWRlc2NcIiAke3NvcnRCeSA9PT0gJ3ByaWNlLWRlc2MnID8gJ3NlbGVjdGVkJyA6ICcnfT5QcmljZTogSGlnaCB0byBMb3c8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJyYXRpbmdcIiAke3NvcnRCeSA9PT0gJ3JhdGluZycgPyAnc2VsZWN0ZWQnIDogJyd9PlRvcCBSYXRlZDwvb3B0aW9uPlxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICAke2l0ZW1zLmxlbmd0aFxuICAgICAgICA/IGA8ZGl2IGNsYXNzPVwicHJvZHVjdC1ncmlkXCI+JHtpdGVtcy5tYXAocmVuZGVyUHJvZHVjdENhcmQpLmpvaW4oJycpfTwvZGl2PmBcbiAgICAgICAgOiBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6NDhweCAyMHB4O1wiPlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToyLjRyZW07bWFyZ2luLWJvdHRvbTo4cHg7XCI+8J+bje+4jzwvZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjAgMCA2cHg7XCI+Tm8gbWF0Y2hpbmcgcHJvZHVjdHMgZm91bmQ8L2gyPlxuICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDE2cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPlRyeSBjbGVhcmluZyBmaWx0ZXJzIG9yIGJyb3dzaW5nIGFub3RoZXIgY2F0ZWdvcnkuPC9wPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiNob21lXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5CYWNrIHRvIEhvbWU8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIGBcbiAgICAgIH1cbiAgICA8L21haW4+XG4gIGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQcm9kdWN0RGV0YWlsVmlldyhwcm9kdWN0SWQsIHNlbGVjdGVkSW1nSWR4ID0gMCwgc2VsZWN0ZWRPcHRpb24gPSAnJywgcXR5ID0gMSkge1xuICBjb25zdCBwcm9kdWN0ID0gc3RhdGUucHJvZHVjdHMuZmluZCgocCkgPT4gcC5pZCA9PT0gcHJvZHVjdElkKTtcbiAgaWYgKCFwcm9kdWN0KSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxtYWluIGNsYXNzPVwiY29udGFpbmVyXCIgc3R5bGU9XCJwYWRkaW5nOjQ4cHggMTZweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj5cbiAgICAgICAgPGgxPlByb2R1Y3QgTm90IEZvdW5kPC9oMT5cbiAgICAgICAgPHAgc3R5bGU9XCJjb2xvcjp2YXIoLS1tdXRlZCk7XCI+VGhpcyBwcm9kdWN0IG1heSBoYXZlIGJlZW4gcmVtb3ZlZCBvciBpcyB1bmF2YWlsYWJsZS48L3A+XG4gICAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UmV0dXJuIHRvIFN0b3JlZnJvbnQ8L2E+XG4gICAgICA8L21haW4+XG4gICAgYDtcbiAgfVxuXG4gIGNvbnN0IGltYWdlcyA9IEFycmF5LmlzQXJyYXkocHJvZHVjdC5pbWFnZXMpICYmIHByb2R1Y3QuaW1hZ2VzLmxlbmd0aFxuICAgID8gcHJvZHVjdC5pbWFnZXMuZmlsdGVyKEJvb2xlYW4pXG4gICAgOiBbZ2V0UHJvZHVjdEltYWdlKHByb2R1Y3QsIDApXTtcbiAgY29uc3QgYWN0aXZlSW1nID0gaW1hZ2VzW3NlbGVjdGVkSW1nSWR4XSB8fCBpbWFnZXNbMF07XG4gIGNvbnN0IGRpc2MgPSBjYWxjRGlzY291bnRQZXJjZW50KHByb2R1Y3QucHJpY2UsIHByb2R1Y3Qub2xkUHJpY2UpO1xuICBjb25zdCBzdG9ja0JhZGdlID0gZ2V0U3RvY2tCYWRnZShwcm9kdWN0LnN0b2NrKTtcbiAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmlzQXJyYXkocHJvZHVjdC5vcHRpb25zKSA/IHByb2R1Y3Qub3B0aW9ucy5maWx0ZXIoQm9vbGVhbikgOiBbXTtcbiAgY29uc3QgY2hvc2VuT3B0ID0gc2VsZWN0ZWRPcHRpb24gfHwgb3B0aW9uc1swXSB8fCAnJztcbiAgY29uc3QgcHJvZFJldmlld3MgPSBzdGF0ZS5yZXZpZXdzLmZpbHRlcigocikgPT4gci5wcm9kdWN0SWQgPT09IHByb2R1Y3QuaWQgJiYgci5hcHByb3ZlZCAhPT0gZmFsc2UpO1xuICBjb25zdCByZWxhdGVkID0gc3RhdGUucHJvZHVjdHMuZmlsdGVyKChwKSA9PiBwLmNhdGVnb3J5ID09PSBwcm9kdWN0LmNhdGVnb3J5ICYmIHAuaWQgIT09IHByb2R1Y3QuaWQpLnNsaWNlKDAsIDgpO1xuICBjb25zdCB3aXNoZWQgPSBzdGF0ZS53aXNobGlzdC5pbmNsdWRlcyhwcm9kdWN0LmlkKTtcblxuICByZXR1cm4gYFxuICAgIDxtYWluIGNsYXNzPVwiY29udGFpbmVyXCIgc3R5bGU9XCJwYWRkaW5nLWJvdHRvbTozNnB4O1wiPlxuICAgICAgPG5hdiBzdHlsZT1cImZvbnQtc2l6ZTowLjg0cmVtO2NvbG9yOnZhcigtLW11dGVkKTtwYWRkaW5nOjE0cHggMCA0cHg7XCIgYXJpYS1sYWJlbD1cIkJyZWFkY3J1bWJcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNob21lXCI+SG9tZTwvYT4gLyA8YSBocmVmPVwiI2NhdGVnb3J5LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHByb2R1Y3QuY2F0ZWdvcnkpfVwiPiR7ZXNjSHRtbChwcm9kdWN0LmNhdGVnb3J5KX08L2E+IC8gPHNwYW4+JHtlc2NIdG1sKHByb2R1Y3QubmFtZSl9PC9zcGFuPlxuICAgICAgPC9uYXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJwZHAtbGF5b3V0XCI+XG4gICAgICAgIDwhLS0gTGVmdCBDb2x1bW46IEltYWdlIEdhbGxlcnkgKyBWaWRlbyBTZWN0aW9uIC0tPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwZHAtZ2FsbGVyeS1jYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGRwLW1haW4taW1nXCIgaWQ9XCJwZHAtbWFpbi16b29tXCIgdGl0bGU9XCJDbGljayB0byB0b2dnbGUgem9vbVwiPlxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7ZXNjSHRtbChhY3RpdmVJbWcpfVwiIGFsdD1cIiR7ZXNjSHRtbChwcm9kdWN0Lm5hbWUpfVwiIGlkPVwicGRwLWFjdGl2ZS1pbWdcIiAvPlxuICAgICAgICAgICAgICAke2Rpc2MgPiAwID8gYDxzcGFuIGNsYXNzPVwiZGlzY291bnQtdGFnXCI+LSR7ZGlzY30lIE9GRjwvc3Bhbj5gIDogJyd9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICR7aW1hZ2VzLmxlbmd0aCA+IDEgPyBgXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwZHAtdGh1bWJzXCI+XG4gICAgICAgICAgICAgICAgJHtpbWFnZXMubWFwKChzcmMsIGlkeCkgPT4gYFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJwZHAtdGh1bWIgJHtpZHggPT09IHNlbGVjdGVkSW1nSWR4ID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLWFjdGlvbj1cInBkcC10aHVtYlwiIGRhdGEtaW5kZXg9XCIke2lkeH1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2VzY0h0bWwoc3JjKX1cIiBhbHQ9XCIke2VzY0h0bWwocHJvZHVjdC5uYW1lKX0gdGh1bWJuYWlsICR7aWR4ICsgMX1cIiBsb2FkaW5nPVwibGF6eVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgIDogJyd9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAke3JlbmRlclByb2R1Y3RWaWRlb1NlY3Rpb24ocHJvZHVjdCl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDwhLS0gUmlnaHQgQ29sdW1uOiBQdXJjaGFzZSBNb2R1bGUgJiBEZXRhaWxzIC0tPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGRwLWluZm8tY2FyZFwiPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44NHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+XG4gICAgICAgICAgICAke2VzY0h0bWwocHJvZHVjdC5icmFuZCB8fCAnUGF6YXJvIEJEJyl9IMK3IFNLVTogPHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2VzY0h0bWwocHJvZHVjdC5za3UgfHwgcHJvZHVjdC5pZCl9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxoMSBjbGFzcz1cInBkcC10aXRsZVwiPiR7ZXNjSHRtbChwcm9kdWN0Lm5hbWUpfTwvaDE+XG5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtmbGV4LXdyYXA6d3JhcDtnYXA6MTJweDttYXJnaW4tYm90dG9tOjE0cHg7XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXItaWNvblwiPiR7cmVuZGVyU3RhcnMocHJvZHVjdC5yYXRpbmcpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjAuODZyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPiR7TnVtYmVyKHByb2R1Y3QucmF0aW5nIHx8IDQuNykudG9GaXhlZCgxKX0gKCR7cHJvZHVjdC5yZXZpZXdDb3VudCB8fCBwcm9kUmV2aWV3cy5sZW5ndGh9IHJldmlld3MpPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGF0dXMtdGV4dCAke3N0b2NrQmFkZ2UuY2xzfVwiPuKXjyAke2VzY0h0bWwoc3RvY2tCYWRnZS5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6MTJweDttYXJnaW4tYm90dG9tOjE0cHg7XCI+XG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxLjg1cmVtO2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjp2YXIoLS1wcmltYXJ5KTtcIiBjbGFzcz1cInRhYnVsYXItbnVtc1wiPiR7Zm9ybWF0UHJpY2UocHJvZHVjdC5wcmljZSl9PC9zcGFuPlxuICAgICAgICAgICAgJHtOdW1iZXIocHJvZHVjdC5vbGRQcmljZSkgPiBOdW1iZXIocHJvZHVjdC5wcmljZSlcbiAgICAgICAgICAgICAgPyBgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MS4wNXJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7dGV4dC1kZWNvcmF0aW9uOmxpbmUtdGhyb3VnaDtcIiBjbGFzcz1cInRhYnVsYXItbnVtc1wiPiR7Zm9ybWF0UHJpY2UocHJvZHVjdC5vbGRQcmljZSl9PC9zcGFuPmBcbiAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDE2cHg7Y29sb3I6dmFyKC0tdGV4dCk7Zm9udC1zaXplOjAuOTVyZW07XCI+JHtlc2NIdG1sKHByb2R1Y3Quc2hvcnREZXNjcmlwdGlvbiB8fCAnJyl9PC9wPlxuXG4gICAgICAgICAgJHtvcHRpb25zLmxlbmd0aCA/IGBcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjE2cHg7XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlNlbGVjdCBPcHRpb246IDxzcGFuIHN0eWxlPVwiY29sb3I6dmFyKC0tcHJpbWFyeSk7XCI+JHtlc2NIdG1sKGNob3Nlbk9wdCl9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib3B0aW9uLWNoaXBzXCI+XG4gICAgICAgICAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0KSA9PiBgXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm9wdGlvbi1jaGlwICR7b3B0ID09PSBjaG9zZW5PcHQgPyAnYWN0aXZlJyA6ICcnfVwiIGRhdGEtYWN0aW9uPVwicGRwLW9wdGlvblwiIGRhdGEtb3B0aW9uPVwiJHtlc2NIdG1sKG9wdCl9XCI+JHtlc2NIdG1sKG9wdCl9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYCA6ICcnfVxuXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7bWFyZ2luLWJvdHRvbToxOHB4O1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInF0eS1zdGVwcGVyXCIgYXJpYS1sYWJlbD1cIlF1YW50aXR5XCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwicGRwLXF0eVwiIGRhdGEtZGVsdGE9XCItMVwiIGFyaWEtbGFiZWw9XCJEZWNyZWFzZSBxdWFudGl0eVwiPi08L2J1dHRvbj5cbiAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJwZHAtcXR5LXZhbFwiIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtxdHl9PC9zcGFuPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cInBkcC1xdHlcIiBkYXRhLWRlbHRhPVwiMVwiIGFyaWEtbGFiZWw9XCJJbmNyZWFzZSBxdWFudGl0eVwiPis8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgIHN0eWxlPVwiZmxleDoxIDEgMTUwcHg7XCJcbiAgICAgICAgICAgICAgZGF0YS1hY3Rpb249XCJwZHAtYWRkLWNhcnRcIlxuICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtlc2NIdG1sKHByb2R1Y3QuaWQpfVwiXG4gICAgICAgICAgICAgICR7KHByb2R1Y3Quc3RvY2sgfHwgMCkgPD0gMCA/ICdkaXNhYmxlZCcgOiAnJ31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAg8J+bkiBBZGQgdG8gQ2FydFxuICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzPVwiYnRuIGJ0bi1hY2NlbnRcIlxuICAgICAgICAgICAgICBzdHlsZT1cImZsZXg6MSAxIDE0MHB4O1wiXG4gICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwicGRwLWJ1eS1ub3dcIlxuICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtlc2NIdG1sKHByb2R1Y3QuaWQpfVwiXG4gICAgICAgICAgICAgICR7KHByb2R1Y3Quc3RvY2sgfHwgMCkgPD0gMCA/ICdkaXNhYmxlZCcgOiAnJ31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAg4pqhIEJ1eSBOb3dcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDtwYWRkaW5nLWJvdHRvbToxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7bWFyZ2luLWJvdHRvbToxNnB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtd2lzaFwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocHJvZHVjdC5pZCl9XCI+XG4gICAgICAgICAgICAgICR7d2lzaGVkID8gJ+KZpSBTYXZlZCBpbiBXaXNobGlzdCcgOiAn4pmhIFNhdmUgdG8gV2lzaGxpc3QnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cInNoYXJlLXByb2R1Y3RcIiBkYXRhLW5hbWU9XCIke2VzY0h0bWwocHJvZHVjdC5uYW1lKX1cIj5cbiAgICAgICAgICAgICAg4oaXIFNoYXJlIFByb2R1Y3RcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6OHB4O2ZvbnQtc2l6ZTowLjg3NXJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+XG4gICAgICAgICAgICA8ZGl2PjxzdHJvbmc+8J+amiBEZWxpdmVyeTo8L3N0cm9uZz4gJHtlc2NIdG1sKHByb2R1Y3QuZGVsaXZlcnlJbmZvIHx8ICdJbnNpZGUgRGhha2Eg4KezNjAgwrcgT3V0c2lkZSBEaGFrYSDgp7MxMjAnKX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+PHN0cm9uZz7ihqnvuI8gUmV0dXJuczo8L3N0cm9uZz4gJHtlc2NIdG1sKHByb2R1Y3QucmV0dXJuUG9saWN5IHx8ICc3LWRheSBlYXN5IHJlcGxhY2VtZW50IGd1YXJhbnRlZS4nKX08L2Rpdj5cbiAgICAgICAgICAgICR7cHJvZHVjdC50YWdzPy5sZW5ndGggPyBgPGRpdj48c3Ryb25nPlRhZ3M6PC9zdHJvbmc+ICR7ZXNjSHRtbChwcm9kdWN0LnRhZ3Muam9pbignIMK3ICcpKX08L2Rpdj5gIDogJyd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDwhLS0gQWQgc2xvdCBvbiBQRFAgLS0+XG4gICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luOjEycHggMDtcIj4ke3JlbmRlckFkU2xvdCgnYWRfcHJvZHVjdF9wYWdlJyl9PC9kaXY+XG5cbiAgICAgIDwhLS0gRnVsbCBEZXNjcmlwdGlvbiwgRmVhdHVyZXMgJiBTcGVjaWZpY2F0aW9uIFRhYmxlIC0tPlxuICAgICAgPHNlY3Rpb24gY2xhc3M9XCJjYXJkLXBhbmVsXCIgc3R5bGU9XCJtYXJnaW4tdG9wOjE4cHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgobWluKDI4MHB4LDEwMCUpLDFmcikpO2dhcDoyNHB4O1wiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MCAwIDEwcHg7Zm9udC1zaXplOjEuMTVyZW07XCI+UHJvZHVjdCBEZXNjcmlwdGlvbiAmIEtleSBGZWF0dXJlczwvaDI+XG4gICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowIDAgMTRweDtmb250LXNpemU6MC45M3JlbTtsaW5lLWhlaWdodDoxLjY1O1wiPiR7ZXNjSHRtbChwcm9kdWN0LmZ1bGxEZXNjcmlwdGlvbiB8fCBwcm9kdWN0LnNob3J0RGVzY3JpcHRpb24gfHwgJycpfTwvcD5cbiAgICAgICAgICAgICR7cHJvZHVjdC5mZWF0dXJlcz8ubGVuZ3RoID8gYFxuICAgICAgICAgICAgICA8dWwgc3R5bGU9XCJwYWRkaW5nLWxlZnQ6MThweDttYXJnaW46MDtkaXNwbGF5OmdyaWQ7Z2FwOjZweDtmb250LXNpemU6MC45MnJlbTtcIj5cbiAgICAgICAgICAgICAgICAke3Byb2R1Y3QuZmVhdHVyZXMubWFwKChmKSA9PiBgPGxpPiR7ZXNjSHRtbChmKX08L2xpPmApLmpvaW4oJycpfVxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgYCA6ICcnfVxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTBweDtmb250LXNpemU6MS4xNXJlbTtcIj5TcGVjaWZpY2F0aW9uczwvaDI+XG4gICAgICAgICAgICAke3Byb2R1Y3Quc3BlY3M/Lmxlbmd0aCA/IGBcbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwic3BlY3MtdGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAke3Byb2R1Y3Quc3BlY3MubWFwKChyb3cpID0+IGBcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgIDx0aD4ke2VzY0h0bWwocm93LmtleSl9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtlc2NIdG1sKHJvdy52YWx1ZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICBgIDogJzxwIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTowLjlyZW07XCI+U3RhbmRhcmQgbWFudWZhY3R1cmVyIHNwZWNpZmljYXRpb25zIGluY2x1ZGVkIGluc2lkZSBwYWNrYWdpbmcuPC9wPid9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8IS0tIEN1c3RvbWVyIFJldmlld3MgJiBSZXZpZXcgRm9ybSAtLT5cbiAgICAgIDxzZWN0aW9uIGNsYXNzPVwiY2FyZC1wYW5lbFwiIHN0eWxlPVwibWFyZ2luLXRvcDoyMHB4O1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KG1pbigyODBweCwxMDAlKSwxZnIpKTtnYXA6MjRweDtcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjAgMCAxMnB4O2ZvbnQtc2l6ZToxLjE1cmVtO1wiPkN1c3RvbWVyIFJldmlld3MgKCR7cHJvZFJldmlld3MubGVuZ3RofSk8L2gyPlxuICAgICAgICAgICAgJHtwcm9kUmV2aWV3cy5sZW5ndGhcbiAgICAgICAgICAgICAgPyBgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTJweDtcIj5cbiAgICAgICAgICAgICAgICAgICR7cHJvZFJldmlld3MubWFwKChyZXYpID0+IGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6MTJweDtiYWNrZ3JvdW5kOnZhcigtLWJnKTtib3JkZXItcmFkaXVzOjEwcHg7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJldmlldy1zdGFyc1wiPiR7cmVuZGVyU3RhcnMocmV2LnJhdGluZyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46NHB4IDAgNnB4O2ZvbnQtc2l6ZTowLjlyZW07XCI+JHtlc2NIdG1sKHJldi5jb21tZW50KX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKTtmb250LXdlaWdodDo2MDA7XCI+JHtlc2NIdG1sKHJldi5hdXRob3JOYW1lKX0gwrcgJHtlc2NIdG1sKHJldi5jaXR5IHx8ICdCYW5nbGFkZXNoJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICAgICAgICA6ICc8cCBzdHlsZT1cImNvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6MC45cmVtO1wiPk5vIHJldmlld3MgZm9yIHRoaXMgcHJvZHVjdCB5ZXQuIEJlIHRoZSBmaXJzdCB0byByZXZpZXchPC9wPidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxmb3JtIGlkPVwicGRwLXJldmlldy1mb3JtXCIgZGF0YS1wcm9kdWN0LWlkPVwiJHtlc2NIdG1sKHByb2R1Y3QuaWQpfVwiIGRhdGEtcHJvZHVjdC1uYW1lPVwiJHtlc2NIdG1sKHByb2R1Y3QubmFtZSl9XCIgY2xhc3M9XCJmb3JtLWdyaWRcIj5cbiAgICAgICAgICAgIDxoMyBzdHlsZT1cIm1hcmdpbjowO2ZvbnQtc2l6ZToxLjA1cmVtO1wiPldyaXRlIGEgUmV2aWV3PC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJyZXYtYXV0aG9yXCI+WW91ciBOYW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwicmV2LWF1dGhvclwiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPVwiZS5nLiBBcmlmIEhvc3NhaW5cIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cInJldi1jaXR5XCI+Q2l0eSAvIEFyZWE8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJyZXYtY2l0eVwiIHBsYWNlaG9sZGVyPVwiZS5nLiBNaXJwdXIsIERoYWthXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicmV2LXJhdGluZ1wiPlJhdGluZzwvbGFiZWw+XG4gICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3RcIiBpZD1cInJldi1yYXRpbmdcIj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNVwiPuKYheKYheKYheKYheKYhSAoNS81IEV4Y2VsbGVudCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiNFwiPuKYheKYheKYheKYheKYhiAoNC81IFZlcnkgR29vZCk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiM1wiPuKYheKYheKYheKYhuKYhiAoMy81IEdvb2QpPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjJcIj7imIXimIXimIbimIbimIYgKDIvNSBGYWlyKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxXCI+4piF4piG4piG4piG4piGICgxLzUgUG9vcik8L29wdGlvbj5cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicmV2LWNvbW1lbnRcIj5Zb3VyIFJldmlldzwvbGFiZWw+XG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cImZpZWxkLXRleHRhcmVhXCIgaWQ9XCJyZXYtY29tbWVudFwiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPVwiU2hhcmUgeW91ciBleHBlcmllbmNlIHdpdGggcXVhbGl0eSBhbmQgZGVsaXZlcnkuLi5cIj48L3RleHRhcmVhPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlN1Ym1pdCBSZXZpZXc8L2J1dHRvbj5cbiAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAke3JlbmRlckhvcml6b250YWxTY3JvbGxlcignc2Nyb2xsZXItcmVsYXRlZCcsICdSZWxhdGVkIFByb2R1Y3RzJywgcmVsYXRlZCwgeyBsaW5rSGFzaDogYCNjYXRlZ29yeS8ke2VuY29kZVVSSUNvbXBvbmVudChwcm9kdWN0LmNhdGVnb3J5KX1gIH0pfVxuICAgIDwvbWFpbj5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNhcnREcmF3ZXIoaXNPcGVuLCBkZWxpdmVyeVpvbmUgPSAnaW5zaWRlJykge1xuICBjb25zdCB0b3RhbHMgPSBnZXRDYXJ0VG90YWxzKGRlbGl2ZXJ5Wm9uZSk7XG4gIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IFNFRURfR0VORVJBTF9TRVRUSU5HUztcbiAgY29uc3QgZnJlZU1pbiA9IE51bWJlcihnLmZyZWVEZWxpdmVyeU1pbikgfHwgMDtcbiAgY29uc3QgcmVtYWluaW5nRnJlZSA9IGZyZWVNaW4gPiAwID8gTWF0aC5tYXgoMCwgZnJlZU1pbiAtIHRvdGFscy5zdWJ0b3RhbCkgOiAwO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz1cImRyYXdlci1iYWNrZHJvcCAke2lzT3BlbiA/ICdvcGVuJyA6ICcnfVwiIGRhdGEtYWN0aW9uPVwiY2xvc2UtY2FydFwiPjwvZGl2PlxuICAgIDxhc2lkZSBjbGFzcz1cImNhcnQtZHJhd2VyICR7aXNPcGVuID8gJ29wZW4nIDogJyd9XCIgYXJpYS1sYWJlbD1cIlNob3BwaW5nIENhcnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJkcmF3ZXItaGVhZFwiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MS4xNXJlbTtcIj5Zb3VyIENhcnQgKCR7dG90YWxzLml0ZW1Db3VudH0pPC9oMj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpY29uLWJ0blwiIHN0eWxlPVwiY29sb3I6dmFyKC0tdGV4dCk7XCIgZGF0YS1hY3Rpb249XCJjbG9zZS1jYXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlIGNhcnRcIj7inJU8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZHJhd2VyLWJvZHlcIj5cbiAgICAgICAgJHtmcmVlTWluID4gMCAmJiBzdGF0ZS5jYXJ0Lmxlbmd0aCA/IGBcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzoxMHB4IDEycHg7Ym9yZGVyLXJhZGl1czoxMHB4O2JhY2tncm91bmQ6dmFyKC0tcHJpbWFyeS1zb2Z0KTtjb2xvcjp2YXIoLS1wcmltYXJ5KTtmb250LXNpemU6MC44MnJlbTtmb250LXdlaWdodDo2MDA7XCI+XG4gICAgICAgICAgICAke3JlbWFpbmluZ0ZyZWUgPiAwXG4gICAgICAgICAgICAgID8gYEFkZCAke2Zvcm1hdFByaWNlKHJlbWFpbmluZ0ZyZWUpfSBtb3JlIGZvciBGUkVFIG5hdGlvbndpZGUgZGVsaXZlcnkhYFxuICAgICAgICAgICAgICA6ICfwn46JIFlvdSB1bmxvY2tlZCBGUkVFIG5hdGlvbndpZGUgZGVsaXZlcnkhJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgIDogJyd9XG5cbiAgICAgICAgJHtzdGF0ZS5jYXJ0Lmxlbmd0aFxuICAgICAgICAgID8gc3RhdGUuY2FydC5tYXAoKGl0ZW0sIGlkeCkgPT4gYFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtwYWRkaW5nLWJvdHRvbToxMnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2VzY0h0bWwoaXRlbS5pbWFnZSl9XCIgYWx0PVwiJHtlc2NIdG1sKGl0ZW0ubmFtZSl9XCIgc3R5bGU9XCJ3aWR0aDo2MnB4O2hlaWdodDo2MnB4O2JvcmRlci1yYWRpdXM6MTBweDtvYmplY3QtZml0OmNvdmVyO2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZS1hbHQpO2ZsZXgtc2hyaW5rOjA7XCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZmxleDoxO21pbi13aWR0aDowO1wiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MC45cmVtO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpcztcIj4ke2VzY0h0bWwoaXRlbS5uYW1lKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICR7aXRlbS5vcHRpb24gPyBgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj4ke2VzY0h0bWwoaXRlbS5vcHRpb24pfTwvZGl2PmAgOiAnJ31cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXdlaWdodDo3MDA7Y29sb3I6dmFyKC0tcHJpbWFyeSk7Zm9udC1zaXplOjAuOTJyZW07bWFyZ2luLXRvcDoycHg7XCIgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKGl0ZW0ucHJpY2UpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47bWFyZ2luLXRvcDo2cHg7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJxdHktc3RlcHBlclwiIHN0eWxlPVwidHJhbnNmb3JtOnNjYWxlKDAuODYpO3RyYW5zZm9ybS1vcmlnaW46bGVmdDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNhcnQtcXR5XCIgZGF0YS1pbmRleD1cIiR7aWR4fVwiIGRhdGEtZGVsdGE9XCItMVwiIGFyaWEtbGFiZWw9XCJEZWNyZWFzZSBxdWFudGl0eVwiPi08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj4ke2l0ZW0ucXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNhcnQtcXR5XCIgZGF0YS1pbmRleD1cIiR7aWR4fVwiIGRhdGEtZGVsdGE9XCIxXCIgYXJpYS1sYWJlbD1cIkluY3JlYXNlIHF1YW50aXR5XCI+KzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tZ2hvc3RcIiBzdHlsZT1cImJvcmRlcjowO3BhZGRpbmc6NnB4O2N1cnNvcjpwb2ludGVyO2NvbG9yOiNiOTFjMWM7Zm9udC1zaXplOjAuOHJlbTtcIiBkYXRhLWFjdGlvbj1cImNhcnQtcmVtb3ZlXCIgZGF0YS1pbmRleD1cIiR7aWR4fVwiPlJlbW92ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICA6IGBcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjQ4cHggMTZweDtcIj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToyLjRyZW07bWFyZ2luLWJvdHRvbTo4cHg7XCI+8J+bkjwvZGl2PlxuICAgICAgICAgICAgICA8aDMgc3R5bGU9XCJtYXJnaW46MCAwIDZweDtcIj5Zb3VyIGNhcnQgaXMgZW1wdHk8L2gzPlxuICAgICAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowIDAgMTZweDtjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOjAuOXJlbTtcIj5FeHBsb3JlIHBob25lcywgYXVkaW8sIGZhc2hpb24gJiBkYWlseSBlc3NlbnRpYWxzLjwvcD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cImNsb3NlLWNhcnRcIj5TdGFydCBTaG9wcGluZzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYFxuICAgICAgICB9XG4gICAgICA8L2Rpdj5cblxuICAgICAgJHtzdGF0ZS5jYXJ0Lmxlbmd0aCA/IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImRyYXdlci1mb290XCI+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206MTBweDtcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiZHJhd2VyLXpvbmUtc2VsZWN0XCIgc3R5bGU9XCJmb250LXNpemU6MC44cmVtO1wiPkRlbGl2ZXJ5IFpvbmU8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImRyYXdlci16b25lLXNlbGVjdFwiIGNsYXNzPVwiZmllbGQtc2VsZWN0XCIgc3R5bGU9XCJtaW4taGVpZ2h0OjQwcHg7Zm9udC1zaXplOjAuODVyZW07XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJpbnNpZGVcIiAke2RlbGl2ZXJ5Wm9uZSA9PT0gJ2luc2lkZScgPyAnc2VsZWN0ZWQnIDogJyd9Pkluc2lkZSBEaGFrYSAoJHtmb3JtYXRQcmljZShnLmluc2lkZURoYWthRmVlID8/IDYwKX0pPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJvdXRzaWRlXCIgJHtkZWxpdmVyeVpvbmUgPT09ICdvdXRzaWRlJyA/ICdzZWxlY3RlZCcgOiAnJ30+T3V0c2lkZSBEaGFrYSAoJHtmb3JtYXRQcmljZShnLm91dHNpZGVEaGFrYUZlZSA/PyAxMjApfSk8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjRweDtmb250LXNpemU6MC44OHJlbTttYXJnaW4tYm90dG9tOjEycHg7XCI+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO1wiPjxzcGFuPlN1YnRvdGFsPC9zcGFuPjxzcGFuIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtmb3JtYXRQcmljZSh0b3RhbHMuc3VidG90YWwpfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47XCI+PHNwYW4+RGVsaXZlcnk8L3NwYW4+PHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke3RvdGFscy5kZWxpdmVyeSA9PT0gMCA/ICdGUkVFJyA6IGZvcm1hdFByaWNlKHRvdGFscy5kZWxpdmVyeSl9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2Vlbjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjEuMDVyZW07cGFkZGluZy10b3A6NnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XCI+XG4gICAgICAgICAgICAgIDxzcGFuPlRvdGFsPC9zcGFuPjxzcGFuIHN0eWxlPVwiY29sb3I6dmFyKC0tcHJpbWFyeSk7XCIgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKHRvdGFscy50b3RhbCl9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIiBkYXRhLWFjdGlvbj1cImdvLWNoZWNrb3V0XCI+UHJvY2VlZCB0byBDaGVja291dCDihpI8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgIDogJyd9XG4gICAgPC9hc2lkZT5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNoZWNrb3V0VmlldyhjaGVja291dFN0YXRlLCBjb25maXJtZWRSZWNlaXB0ID0gbnVsbCkge1xuICBpZiAoY29uZmlybWVkUmVjZWlwdCkge1xuICAgIGNvbnN0IGxvY0xpbmUgPSBbY29uZmlybWVkUmVjZWlwdC51cGF6aWxhLCBjb25maXJtZWRSZWNlaXB0LmRpc3RyaWN0LCBjb25maXJtZWRSZWNlaXB0LmRpdmlzaW9uXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKTtcbiAgICByZXR1cm4gYFxuICAgICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cInBhZGRpbmc6MzZweCAxNnB4O21heC13aWR0aDo2ODBweDtcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6MzZweCAyNHB4O1wiPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6M3JlbTttYXJnaW4tYm90dG9tOjEwcHg7XCI+8J+OiTwvZGl2PlxuICAgICAgICAgIDxoMSBzdHlsZT1cIm1hcmdpbjowIDAgOHB4O2NvbG9yOnZhcigtLXByaW1hcnkpO1wiPk9yZGVyIFBsYWNlZCBTdWNjZXNzZnVsbHkhPC9oMT5cbiAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowIDAgMThweDtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+VGhhbmsgeW91IGZvciBzaG9wcGluZyB3aXRoIFBhemFybyBCRC4gU2F2ZSB5b3VyIE9yZGVyIElEIGJlbG93IHRvIHRyYWNrIGRlbGl2ZXJ5IGFueXRpbWUuPC9wPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJiYWNrZ3JvdW5kOnZhcigtLWJnKTtwYWRkaW5nOjE2cHg7Ym9yZGVyLXJhZGl1czoxMnB4O2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi1ib3R0b206MjBweDtcIj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44cmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj5PcmRlciBUcmFja2luZyBJRDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxLjVyZW07Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOnZhcigtLXRleHQpO1wiIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtlc2NIdG1sKGNvbmZpcm1lZFJlY2VpcHQub3JkZXJDb2RlKX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44OHJlbTttYXJnaW4tdG9wOjRweDtcIj5Ub3RhbCBQYXlhYmxlOiA8c3Ryb25nPiR7Zm9ybWF0UHJpY2UoY29uZmlybWVkUmVjZWlwdC50b3RhbCl9PC9zdHJvbmc+IMK3ICR7ZXNjSHRtbChjb25maXJtZWRSZWNlaXB0LnBheW1lbnRNZXRob2QpfTwvZGl2PlxuICAgICAgICAgICAgJHtsb2NMaW5lID8gYDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tdG9wOjRweDtcIj5EZWxpdmVyeSBBcmVhOiAke2VzY0h0bWwobG9jTGluZSl9PC9kaXY+YCA6ICcnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjEycHg7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmbGV4LXdyYXA6d3JhcDtcIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIjdHJhY2stb3JkZXIvJHtlbmNvZGVVUklDb21wb25lbnQoY29uZmlybWVkUmVjZWlwdC5vcmRlckNvZGUpfVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+VHJhY2sgVGhpcyBPcmRlcjwvYT5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lXCI+Q29udGludWUgU2hvcHBpbmc8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgIGA7XG4gIH1cblxuICBjb25zdCBjbyA9IHR5cGVvZiBjaGVja291dFN0YXRlID09PSAnb2JqZWN0JyAmJiBjaGVja291dFN0YXRlID8gY2hlY2tvdXRTdGF0ZSA6IHtcbiAgICBkaXZpc2lvbjogJ0RoYWthJyxcbiAgICBkaXN0cmljdDogJ0RoYWthJyxcbiAgICBjdXN0b21lck5hbWU6ICcnLFxuICAgIHBob25lOiAnJyxcbiAgICBhZGRyZXNzOiAnJyxcbiAgICBwYXltZW50TWV0aG9kOiAnQ2FzaCBvbiBEZWxpdmVyeScsXG4gICAgcGF5bWVudE51bWJlcjogJycsXG4gICAgbm90ZXM6ICcnLFxuICAgIG1hcExhdDogbnVsbCxcbiAgICBtYXBMbmc6IG51bGwsXG4gICAgbWFwU3RhdHVzOiAnJ1xuICB9O1xuXG4gIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IFNFRURfR0VORVJBTF9TRVRUSU5HUztcbiAgY29uc3QgZGl2aXNpb25zID0gZ2V0RGl2aXNpb25zKCk7XG4gIGNvbnN0IGFjdGl2ZURpdmlzaW9uID0gZGl2aXNpb25zLmluY2x1ZGVzKGNvLmRpdmlzaW9uKSA/IGNvLmRpdmlzaW9uIDogJ0RoYWthJztcbiAgY29uc3QgZGlzdHJpY3RzID0gZ2V0RGlzdHJpY3RzQnlEaXZpc2lvbihhY3RpdmVEaXZpc2lvbik7XG4gIGNvbnN0IGFjdGl2ZURpc3RyaWN0ID0gZGlzdHJpY3RzLmluY2x1ZGVzKGNvLmRpc3RyaWN0KSA/IGNvLmRpc3RyaWN0IDogKGRpc3RyaWN0c1swXSB8fCAnRGhha2EnKTtcblxuICBjb25zdCB6b25lID0gYWN0aXZlRGlzdHJpY3QgPT09ICdEaGFrYScgPyAnaW5zaWRlJyA6ICdvdXRzaWRlJztcbiAgY29uc3QgdG90YWxzID0gZ2V0Q2FydFRvdGFscyh6b25lKTtcblxuICBpZiAoIXN0YXRlLmNhcnQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxtYWluIGNsYXNzPVwiY29udGFpbmVyXCIgc3R5bGU9XCJwYWRkaW5nOjQ4cHggMTZweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj5cbiAgICAgICAgPGgxPllvdXIgQ2FydCBpcyBFbXB0eTwvaDE+XG4gICAgICAgIDxwIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO1wiPkFkZCBpdGVtcyBiZWZvcmUgY2hlY2tpbmcgb3V0LjwvcD5cbiAgICAgICAgPGEgaHJlZj1cIiNob21lXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5Ccm93c2UgUHJvZHVjdHM8L2E+XG4gICAgICA8L21haW4+XG4gICAgYDtcbiAgfVxuXG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cInBhZGRpbmc6MjRweCAxNnB4IDQwcHg7XCI+XG4gICAgICA8aDEgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjE4cHg7XCI+T25lLVBhZ2UgQ2hlY2tvdXQ8L2gxPlxuICAgICAgPGRpdiBjbGFzcz1cInBkcC1sYXlvdXRcIiBzdHlsZT1cInBhZGRpbmc6MDtcIj5cbiAgICAgICAgPGZvcm0gaWQ9XCJjaGVja291dC1mb3JtXCIgY2xhc3M9XCJjYXJkLXBhbmVsIGZvcm0tZ3JpZFwiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO2ZvbnQtc2l6ZToxLjE1cmVtO1wiPlNoaXBwaW5nICYgUGF5bWVudCBEZXRhaWxzPC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJjby1uYW1lXCI+RnVsbCBOYW1lICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiY28tbmFtZVwiIHJlcXVpcmVkIG1pbmxlbmd0aD1cIjJcIiBwbGFjZWhvbGRlcj1cImUuZy4gVGFyaXF1bCBJc2xhbVwiIHZhbHVlPVwiJHtlc2NIdG1sKGNvLmN1c3RvbWVyTmFtZSB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJjby1waG9uZVwiPk1vYmlsZSBOdW1iZXIgKjwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJjby1waG9uZVwiIHR5cGU9XCJ0ZWxcIiByZXF1aXJlZCBtaW5sZW5ndGg9XCI2XCIgcGxhY2Vob2xkZXI9XCIwMTdYWFhYWFhYWFwiIHZhbHVlPVwiJHtlc2NIdG1sKGNvLnBob25lIHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAke2cubWFwRW5hYmxlZCAhPT0gZmFsc2UgPyBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY28tbWFwLWNhcmRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvLW1hcC10b29sYmFyXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmcgc3R5bGU9XCJmb250LXNpemU6MC45cmVtO1wiPlBpbiBEZWxpdmVyeSBMb2NhdGlvbiBvbiBNYXA8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+VGFwIHRoZSBtYXAgb3IgdXNlIEdQUyB0byBhdXRvLWZpbGwgRGl2aXNpb24sIERpc3RyaWN0ICYgRnVsbCBEZXRhaWxlZCBBZGRyZXNzPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJjby11c2UtbG9jYXRpb25cIj7wn5ONIFVzZSBNeSBDdXJyZW50IExvY2F0aW9uPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGlkPVwiY2hlY2tvdXQtbWFwXCIgY2xhc3M9XCJjby1tYXAtY2FudmFzXCIgYXJpYS1sYWJlbD1cIkludGVyYWN0aXZlIEJhbmdsYWRlc2ggZGVsaXZlcnkgbG9jYXRpb24gbWFwXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgaWQ9XCJjby1tYXAtc3RhdHVzXCIgY2xhc3M9XCJjby1tYXAtc3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgJHtjby5tYXBTdGF0dXNcbiAgICAgICAgICAgICAgICAgID8gZXNjSHRtbChjby5tYXBTdGF0dXMpXG4gICAgICAgICAgICAgICAgICA6IChjby5tYXBMYXQgJiYgY28ubWFwTG5nXG4gICAgICAgICAgICAgICAgICAgICAgPyBgUGlubmVkIGxvY2F0aW9uOiAke051bWJlcihjby5tYXBMYXQpLnRvRml4ZWQoNCl9LCAke051bWJlcihjby5tYXBMbmcpLnRvRml4ZWQoNCl9ICgke2VzY0h0bWwoYWN0aXZlRGlzdHJpY3QpfSwgJHtlc2NIdG1sKGFjdGl2ZURpdmlzaW9uKX0pYFxuICAgICAgICAgICAgICAgICAgICAgIDogJ0NsaWNrIGFueXdoZXJlIG9uIHRoZSBtYXAgb3IgZHJhZyB0aGUgcGluIHRvIGF1dG8tZmlsbCB5b3VyIHNoaXBwaW5nIGFkZHJlc3MuJyl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYCA6ICcnfVxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvLWxvY2F0aW9uLWdyaWRcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiY28tZGl2aXNpb25cIj5EaXZpc2lvbiAo4Kas4Ka/4Kat4Ka+4KaXKSAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwiY28tZGl2aXNpb25cIiByZXF1aXJlZD5cbiAgICAgICAgICAgICAgICAke2RpdmlzaW9ucy5tYXAoKGRpdk5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGJuID0gZ2V0RGl2aXNpb25CbihkaXZOYW1lKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjSHRtbChkaXZOYW1lKX1cIiAke2Rpdk5hbWUgPT09IGFjdGl2ZURpdmlzaW9uID8gJ3NlbGVjdGVkJyA6ICcnfT4ke2VzY0h0bWwoZGl2TmFtZSl9JHtibiA/IGAgKCR7Ym59KWAgOiAnJ308L29wdGlvbj5gO1xuICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJjby1kaXN0cmljdFwiPkRpc3RyaWN0ICjgppzgp4fgprLgpr4pICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZmllbGQtc2VsZWN0XCIgaWQ9XCJjby1kaXN0cmljdFwiIHJlcXVpcmVkPlxuICAgICAgICAgICAgICAgICR7ZGlzdHJpY3RzLm1hcCgoZCkgPT4gYDxvcHRpb24gdmFsdWU9XCIke2VzY0h0bWwoZCl9XCIgJHtkID09PSBhY3RpdmVEaXN0cmljdCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NIdG1sKGQpfTwvb3B0aW9uPmApLmpvaW4oJycpfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiY28tYWRkcmVzc1wiPkZ1bGwgRGV0YWlsZWQgQWRkcmVzcyAoVGhhbmEvVXBhemlsYSwgQXJlYSwgUm9hZCwgSG91c2UgLyBIb2xkaW5nIE5vLikgKjwvbGFiZWw+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJmaWVsZC10ZXh0YXJlYVwiIGlkPVwiY28tYWRkcmVzc1wiIHJlcXVpcmVkIG1pbmxlbmd0aD1cIjRcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgVGhhbmEgLyBVcGF6aWxhLCBVbmlvbiAvIEFyZWEsIFJvYWQgLyBWaWxsYWdlLCBIb3VzZSAvIEhvbGRpbmcgTm8uLCBhbmQgTGFuZG1hcmsuLi5cIj4ke2VzY0h0bWwoY28uYWRkcmVzcyB8fCAnJyl9PC90ZXh0YXJlYT5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImNvLXBheW1lbnRcIj5QYXltZW50IE1ldGhvZCAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwiY28tcGF5bWVudFwiIHJlcXVpcmVkPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJDYXNoIG9uIERlbGl2ZXJ5XCIgJHtjby5wYXltZW50TWV0aG9kID09PSAnQ2FzaCBvbiBEZWxpdmVyeScgPyAnc2VsZWN0ZWQnIDogJyd9PkNhc2ggb24gRGVsaXZlcnkgKFBheSBvbiBhcnJpdmFsKTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJiS2FzaFwiICR7Y28ucGF5bWVudE1ldGhvZCA9PT0gJ2JLYXNoJyA/ICdzZWxlY3RlZCcgOiAnJ30+Ykthc2ggKFNlbmQgTW9uZXkgLyBQYXltZW50KTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJOYWdhZFwiICR7Y28ucGF5bWVudE1ldGhvZCA9PT0gJ05hZ2FkJyA/ICdzZWxlY3RlZCcgOiAnJ30+TmFnYWQgKFNlbmQgTW9uZXkgLyBQYXltZW50KTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBpZD1cImNvLXRyeC13cmFwXCIgJHtjby5wYXltZW50TWV0aG9kICYmIGNvLnBheW1lbnRNZXRob2QgIT09ICdDYXNoIG9uIERlbGl2ZXJ5JyA/ICcnIDogJ2hpZGRlbid9PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImNvLXBheS1udW1cIj5iS2FzaCAvIE5hZ2FkIFNlbmRlciBOdW1iZXIgb3IgVHJ4SUQ8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiY28tcGF5LW51bVwiIHBsYWNlaG9sZGVyPVwiZS5nLiAwMTdYWFhYWFhYWCBvciBUcnhJRFwiIHZhbHVlPVwiJHtlc2NIdG1sKGNvLnBheW1lbnROdW1iZXIgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImNvLW5vdGVzXCI+T3JkZXIgTm90ZSAoT3B0aW9uYWwpPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJjby1ub3Rlc1wiIHBsYWNlaG9sZGVyPVwiZS5nLiBDYWxsIGJlZm9yZSBkZWxpdmVyeVwiIHZhbHVlPVwiJHtlc2NIdG1sKGNvLm5vdGVzIHx8ICcnKX1cIiAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIGlkPVwiY28tc3VibWl0LWJ0blwiPkNvbmZpcm0gT3JkZXIgwrcgJHtmb3JtYXRQcmljZSh0b3RhbHMudG90YWwpfTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwiY2FyZC1wYW5lbFwiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTRweDtmb250LXNpemU6MS4xcmVtO1wiPk9yZGVyIFN1bW1hcnkgKCR7dG90YWxzLml0ZW1Db3VudH0gaXRlbXMpPC9oMj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dhcDoxMHB4O21hcmdpbi1ib3R0b206MTRweDtcIj5cbiAgICAgICAgICAgICR7c3RhdGUuY2FydC5tYXAoKGl0ZW0pID0+IGBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjtnYXA6MTBweDtmb250LXNpemU6MC45cmVtO1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuPiR7ZXNjSHRtbChpdGVtLm5hbWUpfSDDlyAke2l0ZW0ucXR5fSAke2l0ZW0ub3B0aW9uID8gYCgke2VzY0h0bWwoaXRlbS5vcHRpb24pfSlgIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKGl0ZW0ucHJpY2UgKiBpdGVtLnF0eSl9PC9zdHJvbmc+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImJvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7cGFkZGluZy10b3A6MTJweDtkaXNwbGF5OmdyaWQ7Z2FwOjZweDtmb250LXNpemU6MC45MnJlbTtcIj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47XCI+PHNwYW4+U3VidG90YWw8L3NwYW4+PHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKHRvdGFscy5zdWJ0b3RhbCl9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjtcIj5cbiAgICAgICAgICAgICAgPHNwYW4+RGVsaXZlcnkgKCR7ZXNjSHRtbChhY3RpdmVEaXN0cmljdCl9LCAke2VzY0h0bWwoYWN0aXZlRGl2aXNpb24pfSk8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHt0b3RhbHMuZGVsaXZlcnkgPT09IDAgPyAnRlJFRScgOiBmb3JtYXRQcmljZSh0b3RhbHMuZGVsaXZlcnkpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2Vlbjtmb250LXNpemU6MS4xNXJlbTtmb250LXdlaWdodDo3MDA7cGFkZGluZy10b3A6OHB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XCI+XG4gICAgICAgICAgICAgIDxzcGFuPkdyYW5kIFRvdGFsPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOnZhcigtLXByaW1hcnkpO1wiIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtmb3JtYXRQcmljZSh0b3RhbHMudG90YWwpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgPC9kaXY+XG4gICAgPC9tYWluPlxuICBgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVHJhY2tPcmRlclZpZXcocXVlcnlWYWwgPSAnJywgcmVzdWx0cyA9IG51bGwpIHtcbiAgY29uc3Qgc3RlcHMgPSBbJ1BlbmRpbmcnLCAnQ29uZmlybWVkJywgJ1NoaXBwZWQnLCAnRGVsaXZlcmVkJ107XG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cInBhZGRpbmc6MjhweCAxNnB4IDQ4cHg7bWF4LXdpZHRoOjc2MHB4O1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgPGgxIHN0eWxlPVwibWFyZ2luOjAgMCA2cHg7Zm9udC1zaXplOjEuNDVyZW07XCI+VHJhY2sgWW91ciBPcmRlcjwvaDE+XG4gICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjAgMCAxOHB4O2NvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6MC45MnJlbTtcIj5FbnRlciB5b3VyIE9yZGVyIElEIChlLmcuIFBCLTIwMjYtNDgyMSkgb3IgdGhlIG1vYmlsZSBudW1iZXIgdXNlZCBhdCBjaGVja291dC48L3A+XG4gICAgICAgIDxmb3JtIGlkPVwidHJhY2stb3JkZXItZm9ybVwiIHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDoxMHB4O1wiPlxuICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJ0cmFjay1xdWVyeS1pbnB1dFwiIHN0eWxlPVwiZmxleDoxIDEgMjQwcHg7XCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJPcmRlciBJRCBvciBQaG9uZSBOdW1iZXJcIiB2YWx1ZT1cIiR7ZXNjSHRtbChxdWVyeVZhbCl9XCIgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlRyYWNrIE9yZGVyPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuXG4gICAgICAke0FycmF5LmlzQXJyYXkocmVzdWx0cykgPyBgXG4gICAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tdG9wOjIwcHg7ZGlzcGxheTpncmlkO2dhcDoxNHB4O1wiPlxuICAgICAgICAgICR7cmVzdWx0cy5sZW5ndGhcbiAgICAgICAgICAgID8gcmVzdWx0cy5tYXAoKG9yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cklkeCA9IHN0ZXBzLmluZGV4T2Yob3JkLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jU3RyID0gW29yZC51cGF6aWxhLCBvcmQuZGlzdHJpY3QsIG9yZC5kaXZpc2lvbl0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47ZmxleC13cmFwOndyYXA7Z2FwOjhweDttYXJnaW4tYm90dG9tOjEycHg7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgc3R5bGU9XCJmb250LXNpemU6MS4xcmVtO1wiIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtlc2NIdG1sKG9yZC5vcmRlckNvZGUpfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjg0cmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj5Mb2NhdGlvbjogJHtlc2NIdG1sKGxvY1N0ciB8fCBvcmQuZGlzdHJpY3QpfSDCtyAke29yZC5pdGVtQ291bnR9IGl0ZW0ocykgwrcgJHtlc2NIdG1sKG9yZC5wYXltZW50TWV0aG9kKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpyaWdodDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0dXMtdGV4dCBzdGF0dXMtJHtlc2NIdG1sKG9yZC5zdGF0dXMpfVwiPiR7ZXNjSHRtbChvcmQuc3RhdHVzKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKG9yZC50b3RhbCl9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAke29yZC5zdGF0dXMgPT09ICdDYW5jZWxsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgPyBgPGRpdiBzdHlsZT1cInBhZGRpbmc6MTBweDtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOiNmZWYyZjI7Y29sb3I6I2I5MWMxYztmb250LXNpemU6MC44OHJlbTtmb250LXdlaWdodDo2MDA7XCI+VGhpcyBvcmRlciB3YXMgY2FuY2VsbGVkLjwvZGl2PmBcbiAgICAgICAgICAgICAgICAgICAgICA6IGA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoNCwxZnIpO2dhcDo4cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjAuNzhyZW07XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICR7c3RlcHMubWFwKChzdCwgaWR4KSA9PiBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cInBhZGRpbmc6OHB4IDRweDtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOiR7aWR4IDw9IGN1cklkeCA/ICd2YXIoLS1wcmltYXJ5LXNvZnQpJyA6ICd2YXIoLS1iZyknfTtjb2xvcjoke2lkeCA8PSBjdXJJZHggPyAndmFyKC0tcHJpbWFyeSknIDogJ3ZhcigtLW11dGVkKSd9O2ZvbnQtd2VpZ2h0OiR7aWR4IDw9IGN1cklkeCA/ICc3MDAnIDogJzUwMCd9O1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtlc2NIdG1sKHN0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgIH0pLmpvaW4oJycpXG4gICAgICAgICAgICA6IGA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzozMnB4O1wiPk5vIG9yZGVyIGZvdW5kIG1hdGNoaW5nIFwiJHtlc2NIdG1sKHF1ZXJ5VmFsKX1cIi4gRG91YmxlLWNoZWNrIHlvdXIgT3JkZXIgSUQgb3IgcGhvbmUgbnVtYmVyLjwvZGl2PmBcbiAgICAgICAgICB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgYCA6ICcnfVxuICAgIDwvbWFpbj5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckJsb2dWaWV3KHBvc3RJZCA9IG51bGwpIHtcbiAgY29uc3QgcG9zdHMgPSBzdGF0ZS5wb3N0cy5maWx0ZXIoKHApID0+IHAucHVibGlzaGVkICE9PSBmYWxzZSk7XG5cbiAgaWYgKHBvc3RJZCkge1xuICAgIGNvbnN0IHBvc3QgPSBwb3N0cy5maW5kKChwKSA9PiBwLmlkID09PSBwb3N0SWQpIHx8IHN0YXRlLnBvc3RzLmZpbmQoKHApID0+IHAuaWQgPT09IHBvc3RJZCk7XG4gICAgaWYgKCFwb3N0KSB7XG4gICAgICByZXR1cm4gYDxtYWluIGNsYXNzPVwiY29udGFpbmVyXCIgc3R5bGU9XCJwYWRkaW5nOjQ4cHggMTZweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj48aDE+UG9zdCBOb3QgRm91bmQ8L2gxPjxhIGhyZWY9XCIjYmxvZ1wiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+QWxsIEJsb2cgUG9zdHM8L2E+PC9tYWluPmA7XG4gICAgfVxuICAgIHJldHVybiBgXG4gICAgICA8bWFpbiBjbGFzcz1cImNvbnRhaW5lclwiIHN0eWxlPVwicGFkZGluZzoyNHB4IDE2cHggNDhweDttYXgtd2lkdGg6ODYwcHg7XCI+XG4gICAgICAgIDxhIGhyZWY9XCIjYmxvZ1wiIGNsYXNzPVwic2VjdGlvbi1saW5rXCIgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjEwcHg7XCI+4oaQIEJhY2sgdG8gQmxvZzwvYT5cbiAgICAgICAgPGFydGljbGUgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjg0cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tYm90dG9tOjhweDtcIj4ke2VzY0h0bWwocG9zdC5jYXRlZ29yeSl9JHtwb3N0LnRhZ3M/Lmxlbmd0aCA/IGAgwrcgJHtlc2NIdG1sKHBvc3QudGFncy5qb2luKCcsICcpKX1gIDogJyd9PC9kaXY+XG4gICAgICAgICAgPGgxIHN0eWxlPVwibWFyZ2luOjAgMCAxNnB4O2ZvbnQtc2l6ZTpjbGFtcCgxLjVyZW0sM3Z3LDIuMnJlbSk7bGluZS1oZWlnaHQ6MS4yNTtcIj4ke2VzY0h0bWwocG9zdC50aXRsZSl9PC9oMT5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7ZXNjSHRtbChwb3N0LmNvdmVySW1hZ2UgfHwgTE9DQUxfUEhPVE9TLmhlcm9Xb3Jrc3BhY2UpfVwiIGFsdD1cIiR7ZXNjSHRtbChwb3N0LnRpdGxlKX1cIiBzdHlsZT1cIndpZHRoOjEwMCU7bWF4LWhlaWdodDo0MjBweDtvYmplY3QtZml0OmNvdmVyO2JvcmRlci1yYWRpdXM6MTJweDttYXJnaW4tYm90dG9tOjIwcHg7XCIgLz5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjFyZW07bGluZS1oZWlnaHQ6MS43NTtcIj4ke3Bvc3QuYm9keSB8fCBlc2NIdG1sKHBvc3QuZXhjZXJwdCB8fCAnJyl9PC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6MjBweDtwYWRkaW5nLXRvcDoxNHB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtmbGV4LXdyYXA6d3JhcDtnYXA6MTBweDtcIj5cbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjAuODJyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPkZvdW5kIG91dGRhdGVkIHByaWNpbmcgb3IgYSBicm9rZW4gbGluayBpbiB0aGlzIGd1aWRlPzwvc3Bhbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwicmVwb3J0LWJsb2ctaXNzdWVcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHBvc3QuaWQpfVwiPvCfmqkgUmVwb3J0IElzc3VlPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6MThweDtcIj4ke3JlbmRlckFkU2xvdCgnYWRfYmxvZ19wb3N0Jyl9PC9kaXY+XG4gICAgICA8L21haW4+XG4gICAgYDtcbiAgfVxuXG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cInBhZGRpbmc6MjRweCAxNnB4IDQ4cHg7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1oZWFkXCI+XG4gICAgICAgIDxoMSBjbGFzcz1cInNlY3Rpb24tdGl0bGVcIj5QYXphcm8gQkQgQmxvZzwvaDE+XG4gICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjAuODhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPlRlY2ggVGlwcyDCtyBCdXlpbmcgR3VpZGVzIMK3IFNob3BwaW5nIE9mZmVyczwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgJHtwb3N0cy5sZW5ndGhcbiAgICAgICAgPyBgPGRpdiBjbGFzcz1cImJsb2ctZ3JpZFwiPlxuICAgICAgICAgICAgJHtwb3N0cy5tYXAoKHBvc3QpID0+IGBcbiAgICAgICAgICAgICAgPGFydGljbGUgY2xhc3M9XCJibG9nLWNhcmRcIiBkYXRhLWFjdGlvbj1cIm9wZW4tcG9zdFwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocG9zdC5pZCl9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2ctY2FyZC1pbWdcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtlc2NIdG1sKHBvc3QuY292ZXJJbWFnZSB8fCBMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZSl9XCIgYWx0PVwiJHtlc2NIdG1sKHBvc3QudGl0bGUpfVwiIGxvYWRpbmc9XCJsYXp5XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmxvZy1jYXJkLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJibG9nLW1ldGFcIj4ke2VzY0h0bWwocG9zdC5jYXRlZ29yeSl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8aDM+JHtlc2NIdG1sKHBvc3QudGl0bGUpfTwvaDM+XG4gICAgICAgICAgICAgICAgICA8cD4ke2VzY0h0bWwocG9zdC5leGNlcnB0IHx8ICcnKX08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgIDwvZGl2PmBcbiAgICAgICAgOiBgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6NDBweDtcIj5ObyBibG9nIHBvc3RzIHB1Ymxpc2hlZCB5ZXQuPC9kaXY+YFxuICAgICAgfVxuICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6MjBweDtcIj4ke3JlbmRlckFkU2xvdCgnYWRfYmxvZ19wb3N0Jyl9PC9kaXY+XG4gICAgPC9tYWluPlxuICBgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3RhdGljSW5mb1ZpZXcocGFnZUtleSkge1xuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIGNvbnN0IHBhZ2VzID0ge1xuICAgICdoZWxwLWNlbnRlcic6IHtcbiAgICAgIHRpdGxlOiAnSGVscCBDZW50ZXInLFxuICAgICAgYm9keTogYDxwPk5lZWQgaGVscCB3aXRoIGFuIG9yZGVyLCB3YXJyYW50eSwgb3IgcGF5bWVudD8gUmVhY2ggdXMgZGlyZWN0bHkgb24gV2hhdHNBcHAgKCR7ZXNjSHRtbChnLnBob25lKX0pIG9yIGVtYWlsICR7ZXNjSHRtbChnLmVtYWlsKX0gZnJvbSA5OjAwIEFNIHRvIDEwOjAwIFBNIGRhaWx5LjwvcD5cbiAgICAgICAgICAgICA8dWw+PGxpPjxzdHJvbmc+RGhha2EgRGVsaXZlcnk6PC9zdHJvbmc+IDI04oCTNDggaG91cnMgKCR7Zm9ybWF0UHJpY2UoZy5pbnNpZGVEaGFrYUZlZSA/PyA2MCl9KTwvbGk+PGxpPjxzdHJvbmc+TmF0aW9ud2lkZSBEZWxpdmVyeTo8L3N0cm9uZz4gMuKAkzQgYnVzaW5lc3MgZGF5cyAoJHtmb3JtYXRQcmljZShnLm91dHNpZGVEaGFrYUZlZSA/PyAxMjApfSk8L2xpPjxsaT48c3Ryb25nPlBheW1lbnQgT3B0aW9uczo8L3N0cm9uZz4gQ2FzaCBvbiBEZWxpdmVyeSwgYkthc2gsIE5hZ2FkPC9saT48L3VsPmBcbiAgICB9LFxuICAgICdyZXR1cm5zLXJlZnVuZHMnOiB7XG4gICAgICB0aXRsZTogJ1JldHVybnMgYW5kIFJlZnVuZHMnLFxuICAgICAgYm9keTogYDxwPlBhemFybyBCRCBvZmZlcnMgYSB0cmFuc3BhcmVudCA8c3Ryb25nPjctZGF5IGVhc3kgcmVwbGFjZW1lbnQgYW5kIHJldHVybiBwb2xpY3k8L3N0cm9uZz4gZm9yIGZhY3RvcnkgZGVmZWN0cywgZGFtYWdlZCBwYXJjZWxzLCBvciB3cm9uZyBzaXplL3ZhcmlhbnQgZGVsaXZlcmllcy48L3A+XG4gICAgICAgICAgICAgPHA+S2VlcCBvcmlnaW5hbCBwYWNrYWdpbmcgYW5kIGludm9pY2UgaW50YWN0LCBhbmQgY29udGFjdCBvdXIgdGVhbSB3aXRoIHlvdXIgT3JkZXIgSUQuPC9wPmBcbiAgICB9LFxuICAgICdjb250YWN0LXVzJzoge1xuICAgICAgdGl0bGU6ICdDb250YWN0IFVzJyxcbiAgICAgIGJvZHk6IGA8cD48c3Ryb25nPk9mZmljZTo8L3N0cm9uZz4gJHtlc2NIdG1sKGcuYWRkcmVzcyl9PC9wPjxwPjxzdHJvbmc+UGhvbmUgLyBTdXBwb3J0Ojwvc3Ryb25nPiAke2VzY0h0bWwoZy5waG9uZSl9PC9wPjxwPjxzdHJvbmc+RW1haWw6PC9zdHJvbmc+ICR7ZXNjSHRtbChnLmVtYWlsKX08L3A+YFxuICAgIH0sXG4gICAgJ2Fib3V0LXVzJzoge1xuICAgICAgdGl0bGU6ICdBYm91dCBQYXphcm8gQkQnLFxuICAgICAgYm9keTogYDxwPjxzdHJvbmc+UGF6YXJvIEJEIOKAlCBZb3VyIEJhemFhciwgU21hcnRlci48L3N0cm9uZz4gQnVpbHQgZm9yIHNob3BwZXJzIGFjcm9zcyBCYW5nbGFkZXNoLCB3ZSBicmluZyB2ZXJpZmllZCBzbWFydHBob25lcywgbGFwdG9wcywgc21hcnR3YXRjaGVzLCBnYW1pbmcgZ2VhciwgZmFzaGlvbiwgYmVhdXR5LCBob21lIGxpdmluZywgYm9va3MsIGFuZCBwdXJlIGdyb2NlcmllcyBpbnRvIG9uZSBmYXN0LCB0cnVzdHdvcnRoeSBzdG9yZWZyb250LjwvcD5gXG4gICAgfVxuICB9O1xuICBjb25zdCBpbmZvID0gcGFnZXNbcGFnZUtleV0gfHwgcGFnZXNbJ2Fib3V0LXVzJ107XG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cInBhZGRpbmc6MjhweCAxNnB4IDQ4cHg7bWF4LXdpZHRoOjc4MHB4O1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgPGgxIHN0eWxlPVwibWFyZ2luOjAgMCAxMnB4O1wiPiR7ZXNjSHRtbChpbmZvLnRpdGxlKX08L2gxPlxuICAgICAgICA8ZGl2IHN0eWxlPVwibGluZS1oZWlnaHQ6MS43O1wiPiR7aW5mby5ib2R5fTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9tYWluPlxuICBgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyTWFpbnRlbmFuY2VWaWV3KCkge1xuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6ODB2aDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiIHN0eWxlPVwibWF4LXdpZHRoOjUyMHB4O3RleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6MzZweCAyNHB4O1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjIuNnJlbTttYXJnaW4tYm90dG9tOjEwcHg7XCI+8J+boO+4jzwvZGl2PlxuICAgICAgICA8aDEgc3R5bGU9XCJtYXJnaW46MCAwIDhweDtcIj4ke2VzY0h0bWwoZy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJyl9IGlzIFVwZGF0aW5nPC9oMT5cbiAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDE4cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPldlIGFyZSByZWZyZXNoaW5nIGRlYWxzIGFuZCBpbnZlbnRvcnkuIFBsZWFzZSBjaGVjayBiYWNrIHNob3J0bHkgb3IgbWVzc2FnZSB1cyBvbiBXaGF0c0FwcCAoJHtlc2NIdG1sKGcucGhvbmUpfSkuPC9wPlxuICAgICAgICA8YSBocmVmPVwiL2FkbWluXCIgZGF0YS1hY3Rpb249XCJnby1hZG1pblwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lXCI+QWRtaW4gTG9naW48L2E+XG4gICAgICA8L2Rpdj5cbiAgICA8L21haW4+XG4gIGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBY2NvdW50VmlldyhhY2NvdW50U3RhdGUgPSB7fSkge1xuICBjb25zdCBzZXNzaW9uID0gZ2V0Q3VzdG9tZXJTZXNzaW9uKCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHJldHVybiBgXG4gICAgICA8bWFpbiBjbGFzcz1cImNvbnRhaW5lclwiIHN0eWxlPVwicGFkZGluZzozNnB4IDE2cHg7dGV4dC1hbGlnbjpjZW50ZXI7XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCIgc3R5bGU9XCJtYXgtd2lkdGg6NDYwcHg7bWFyZ2luOjAgYXV0bztwYWRkaW5nOjMycHggMjRweDtcIj5cbiAgICAgICAgICA8aDE+UGxlYXNlIFNpZ24gSW48L2gxPlxuICAgICAgICAgIDxwIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO1wiPlNpZ24gaW4gdG8gbWFuYWdlIHlvdXIgUGF6YXJvIEJEIGFjY291bnQsIHNhdmVkIG51bWJlcnMsIGNhcnQsIGFuZCBvcmRlciBoaXN0b3J5LjwvcD5cbiAgICAgICAgICA8YSBocmVmPVwiI2hvbWVcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdvIHRvIFNpZ24gSW48L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgIGA7XG4gIH1cblxuICBjb25zdCBhY3RpdmVUYWIgPSBbJ292ZXJ2aWV3JywgJ2NhcnQnLCAnb3JkZXJzJywgJ3NldHRpbmdzJ10uaW5jbHVkZXMoYWNjb3VudFN0YXRlLnRhYilcbiAgICA/IGFjY291bnRTdGF0ZS50YWJcbiAgICA6ICdvdmVydmlldyc7XG4gIGNvbnN0IGNhbkFjY2Vzc0FkbWluID0gaXNDdXN0b21lckFkbWluKHNlc3Npb24pO1xuICBjb25zdCBpbml0aWFsID0gKHNlc3Npb24uZnVsbE5hbWUgfHwgJ1UnKS50cmltKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCk7XG5cbiAgY29uc3QgY2FydEl0ZW1zID0gc3RhdGUuY2FydCB8fCBbXTtcbiAgY29uc3QgY2FydENvdW50ID0gY2FydEl0ZW1zLnJlZHVjZSgoc3VtLCBpKSA9PiBzdW0gKyAoTnVtYmVyKGkucXR5KSB8fCAxKSwgMCk7XG4gIGNvbnN0IGNhcnRTdWJ0b3RhbCA9IGNhcnRJdGVtcy5yZWR1Y2UoKHN1bSwgaSkgPT4gc3VtICsgKE51bWJlcihpLnByaWNlKSB8fCAwKSAqIChOdW1iZXIoaS5xdHkpIHx8IDEpLCAwKTtcblxuICBjb25zdCBvcmRlcnMgPSBnZXRMb2NhbE9yZGVycygpO1xuICBjb25zdCB0b3RhbE9yZGVyZWRQcm9kdWN0cyA9IG9yZGVycy5yZWR1Y2UoKHN1bSwgbykgPT4ge1xuICAgIGNvbnN0IGZyb21JdGVtcyA9IEFycmF5LmlzQXJyYXkoby5pdGVtcykgJiYgby5pdGVtcy5sZW5ndGhcbiAgICAgID8gby5pdGVtcy5yZWR1Y2UoKGssIGl0KSA9PiBrICsgKE51bWJlcihpdC5xdHkpIHx8IDEpLCAwKVxuICAgICAgOiAwO1xuICAgIHJldHVybiBzdW0gKyAoZnJvbUl0ZW1zIHx8IE51bWJlcihvLml0ZW1Db3VudCkgfHwgMCk7XG4gIH0sIDApO1xuICBjb25zdCB3aXNoQ291bnQgPSAoc3RhdGUud2lzaGxpc3QgfHwgW10pLmxlbmd0aDtcblxuICBjb25zdCBkaXZpc2lvbnMgPSBnZXREaXZpc2lvbnMoKTtcbiAgY29uc3Qgc2VsZWN0ZWREaXYgPSBkaXZpc2lvbnMuaW5jbHVkZXMoYWNjb3VudFN0YXRlLmRpdmlzaW9uIHx8IHNlc3Npb24uZGl2aXNpb24pXG4gICAgPyAoYWNjb3VudFN0YXRlLmRpdmlzaW9uIHx8IHNlc3Npb24uZGl2aXNpb24pXG4gICAgOiAnRGhha2EnO1xuICBjb25zdCBkaXN0cmljdHMgPSBnZXREaXN0cmljdHNCeURpdmlzaW9uKHNlbGVjdGVkRGl2KTtcbiAgY29uc3Qgc2VsZWN0ZWREaXN0ID0gZGlzdHJpY3RzLmluY2x1ZGVzKGFjY291bnRTdGF0ZS5kaXN0cmljdCB8fCBzZXNzaW9uLmRpc3RyaWN0KVxuICAgID8gKGFjY291bnRTdGF0ZS5kaXN0cmljdCB8fCBzZXNzaW9uLmRpc3RyaWN0KVxuICAgIDogKGRpc3RyaWN0c1swXSB8fCAnRGhha2EnKTtcblxuICBjb25zdCBzaG93Q2FydCA9IGFjdGl2ZVRhYiA9PT0gJ292ZXJ2aWV3JyB8fCBhY3RpdmVUYWIgPT09ICdjYXJ0JztcbiAgY29uc3Qgc2hvd09yZGVycyA9IGFjdGl2ZVRhYiA9PT0gJ292ZXJ2aWV3JyB8fCBhY3RpdmVUYWIgPT09ICdvcmRlcnMnO1xuICBjb25zdCBzaG93U2V0dGluZ3MgPSBhY3RpdmVUYWIgPT09ICdvdmVydmlldycgfHwgYWN0aXZlVGFiID09PSAnc2V0dGluZ3MnO1xuXG4gIHJldHVybiBgXG4gICAgPG1haW4gY2xhc3M9XCJjb250YWluZXIgYWNjb3VudC1wYWdlXCI+XG4gICAgICA8IS0tIFByb2ZpbGUgU3VtbWFyeSBIZWFkZXIgLS0+XG4gICAgICA8c2VjdGlvbiBjbGFzcz1cImNhcmQtcGFuZWwgYWNjb3VudC1oZXJvLWNhcmRcIiBhcmlhLWxhYmVsPVwiQWNjb3VudCBwcm9maWxlIG92ZXJ2aWV3XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LWhlcm8tbGVmdFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LWF2YXRhci13cmFwXCI+XG4gICAgICAgICAgICAke3Nlc3Npb24uYXZhdGFyVXJsXG4gICAgICAgICAgICAgID8gYDxpbWcgc3JjPVwiJHtlc2NIdG1sKHNlc3Npb24uYXZhdGFyVXJsKX1cIiBhbHQ9XCIke2VzY0h0bWwoc2Vzc2lvbi5mdWxsTmFtZSl9XCIgY2xhc3M9XCJhY2NvdW50LWF2YXRhci1pbWdcIiAvPmBcbiAgICAgICAgICAgICAgOiBgPGRpdiBjbGFzcz1cImFjY291bnQtYXZhdGFyLWZhbGxiYWNrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+JHtlc2NIdG1sKGluaXRpYWwpfTwvZGl2PmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImFjY291bnQtYXZhdGFyLXVwbG9hZC1idG5cIiB0aXRsZT1cIkNoYW5nZSBwcm9maWxlIHBpY3R1cmVcIj5cbiAgICAgICAgICAgICAg8J+TtyBVcGxvYWQgUGhvdG9cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJmaWxlXCIgaWQ9XCJhY2NvdW50LWF2YXRhci1pbnB1dFwiIGFjY2VwdD1cImltYWdlLypcIiBoaWRkZW4gLz5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAke3Nlc3Npb24uYXZhdGFyVXJsID8gYFxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImFjY291bnQtYXZhdGFyLXJlbW92ZS1idG5cIiBkYXRhLWFjdGlvbj1cImFjY291bnQtcmVtb3ZlLWF2YXRhclwiPlJlbW92ZTwvYnV0dG9uPlxuICAgICAgICAgICAgYCA6ICcnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LWhlcm8tbWV0YVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQta2lja2VyXCI+JHtjYW5BY2Nlc3NBZG1pbiA/ICdBZG1pbmlzdHJhdG9yIEFjY291bnQnIDogJ1BhemFybyBCRCBNZW1iZXInfTwvZGl2PlxuICAgICAgICAgICAgPGgxIGNsYXNzPVwiYWNjb3VudC1oZXJvLW5hbWVcIj4ke2VzY0h0bWwoc2Vzc2lvbi5mdWxsTmFtZSB8fCAnQ3VzdG9tZXInKX08L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtaGVyby1kZXRhaWxzXCI+XG4gICAgICAgICAgICAgICR7c2Vzc2lvbi5lbWFpbCA/IGA8c3Bhbj4ke2VzY0h0bWwoc2Vzc2lvbi5lbWFpbCl9PC9zcGFuPmAgOiAnJ31cbiAgICAgICAgICAgICAgJHtzZXNzaW9uLnBob25lID8gYDxzcGFuPiR7c2Vzc2lvbi5lbWFpbCA/ICfCtyAnIDogJyd9JHtlc2NIdG1sKHNlc3Npb24ucGhvbmUpfTwvc3Bhbj5gIDogJyd9XG4gICAgICAgICAgICAgICR7c2Vzc2lvbi5hbHRQaG9uZSA/IGA8c3Bhbj7CtyBBbHQ6ICR7ZXNjSHRtbChzZXNzaW9uLmFsdFBob25lKX08L3NwYW4+YCA6ICcnfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAke3Nlc3Npb24uYWRkcmVzcyB8fCBzZXNzaW9uLmRpc3RyaWN0ID8gYFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWNjb3VudC1oZXJvLWFkZHJlc3NcIj5cbiAgICAgICAgICAgICAgICDwn5ONICR7ZXNjSHRtbChbc2Vzc2lvbi5hZGRyZXNzLCBzZXNzaW9uLmRpc3RyaWN0LCBzZXNzaW9uLmRpdmlzaW9uXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCA6ICcnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtaGVyby1hY3Rpb25zXCI+XG4gICAgICAgICAgJHtjYW5BY2Nlc3NBZG1pbiA/IGA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImdvLWFkbWluXCI+8J+boe+4jyBBZG1pbiBQYW5lbDwvYnV0dG9uPmAgOiAnJ31cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWRhbmdlclwiIGRhdGEtYWN0aW9uPVwiY3VzdG9tZXItbG9nb3V0XCI+8J+aqiBMb2cgT3V0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8IS0tIFF1aWNrIE51bWVyaWMgU3RhdHMgLS0+XG4gICAgICA8c2VjdGlvbiBjbGFzcz1cImFjY291bnQtc3RhdHMtZ3JpZFwiIGFyaWEtbGFiZWw9XCJBY2NvdW50IG51bWJlcnMgc3VtbWFyeVwiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImFjY291bnQtc3RhdC1jYXJkXCIgZGF0YS1hY3Rpb249XCJhY2NvdW50LXRhYlwiIGRhdGEtdGFiPVwiY2FydFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWNjb3VudC1zdGF0LWxhYmVsXCI+SXRlbXMgaW4gQ2FydDwvc3Bhbj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwiYWNjb3VudC1zdGF0LXZhbHVlIHRhYnVsYXItbnVtc1wiPiR7Y2FydENvdW50fTwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWNjb3VudC1zdGF0LXN1YiB0YWJ1bGFyLW51bXNcIj4ke2Zvcm1hdFByaWNlKGNhcnRTdWJ0b3RhbCl9IHN1YnRvdGFsPC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJhY2NvdW50LXN0YXQtY2FyZFwiIGRhdGEtYWN0aW9uPVwiYWNjb3VudC10YWJcIiBkYXRhLXRhYj1cIm9yZGVyc1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWNjb3VudC1zdGF0LWxhYmVsXCI+UHJvZHVjdHMgT3JkZXJlZDwvc3Bhbj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwiYWNjb3VudC1zdGF0LXZhbHVlIHRhYnVsYXItbnVtc1wiPiR7dG90YWxPcmRlcmVkUHJvZHVjdHN9PC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhY2NvdW50LXN0YXQtc3ViIHRhYnVsYXItbnVtc1wiPiR7b3JkZXJzLmxlbmd0aH0gb3JkZXIke29yZGVycy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ30gcGxhY2VkPC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGEgaHJlZj1cIiN3aXNobGlzdFwiIGNsYXNzPVwiYWNjb3VudC1zdGF0LWNhcmRcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImFjY291bnQtc3RhdC1sYWJlbFwiPlNhdmVkIFdpc2hsaXN0PC9zcGFuPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJhY2NvdW50LXN0YXQtdmFsdWUgdGFidWxhci1udW1zXCI+JHt3aXNoQ291bnR9PC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhY2NvdW50LXN0YXQtc3ViXCI+VGFwIHRvIHZpZXcgc2F2ZWQgaXRlbXM8L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPCEtLSBBY2NvdW50IE5hdmlnYXRpb24gVGFicyAtLT5cbiAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9XCJBY2NvdW50IHNlY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPVwiJHthY3RpdmVUYWIgPT09ICdvdmVydmlldyd9XCIgY2xhc3M9XCJhY2NvdW50LXRhYi1idG4gJHthY3RpdmVUYWIgPT09ICdvdmVydmlldycgPyAnYWN0aXZlJyA6ICcnfVwiIGRhdGEtYWN0aW9uPVwiYWNjb3VudC10YWJcIiBkYXRhLXRhYj1cIm92ZXJ2aWV3XCI+XG4gICAgICAgICAgT3ZlcnZpZXdcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPVwiJHthY3RpdmVUYWIgPT09ICdjYXJ0J31cIiBjbGFzcz1cImFjY291bnQtdGFiLWJ0biAke2FjdGl2ZVRhYiA9PT0gJ2NhcnQnID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLWFjdGlvbj1cImFjY291bnQtdGFiXCIgZGF0YS10YWI9XCJjYXJ0XCI+XG4gICAgICAgICAgQ2FydCAoJHtjYXJ0Q291bnR9KVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcm9sZT1cInRhYlwiIGFyaWEtc2VsZWN0ZWQ9XCIke2FjdGl2ZVRhYiA9PT0gJ29yZGVycyd9XCIgY2xhc3M9XCJhY2NvdW50LXRhYi1idG4gJHthY3RpdmVUYWIgPT09ICdvcmRlcnMnID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLWFjdGlvbj1cImFjY291bnQtdGFiXCIgZGF0YS10YWI9XCJvcmRlcnNcIj5cbiAgICAgICAgICBPcmRlcnMgKCR7b3JkZXJzLmxlbmd0aH0pXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiByb2xlPVwidGFiXCIgYXJpYS1zZWxlY3RlZD1cIiR7YWN0aXZlVGFiID09PSAnc2V0dGluZ3MnfVwiIGNsYXNzPVwiYWNjb3VudC10YWItYnRuICR7YWN0aXZlVGFiID09PSAnc2V0dGluZ3MnID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLWFjdGlvbj1cImFjY291bnQtdGFiXCIgZGF0YS10YWI9XCJzZXR0aW5nc1wiPlxuICAgICAgICAgIFNldHRpbmdzXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LXNlY3Rpb25zLXN0YWNrXCI+XG4gICAgICAgICR7c2hvd0NhcnQgPyBgXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJjYXJkLXBhbmVsXCIgYXJpYS1sYWJlbD1cIkl0ZW1zIGluIHlvdXIgY2FydFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24taGVhZFwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbToxNHB4O1wiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO2ZvbnQtc2l6ZToxLjE1cmVtO1wiPkl0ZW1zIEFkZGVkIHRvIENhcnQgKCR7Y2FydENvdW50fSk8L2gyPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44NHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+UmV2aWV3IHByb2R1Y3RzIGluIHlvdXIgY2FydCBvciBwcm9jZWVkIGRpcmVjdGx5IHRvIGNoZWNrb3V0PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAke2NhcnRJdGVtcy5sZW5ndGggPyBgPGEgaHJlZj1cIiNjaGVja291dFwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tYWNjZW50XCI+Q2hlY2tvdXQgwrcgJHtmb3JtYXRQcmljZShjYXJ0U3VidG90YWwpfTwvYT5gIDogJyd9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgJHtjYXJ0SXRlbXMubGVuZ3RoID8gYFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWNjb3VudC1jYXJ0LWxpc3RcIj5cbiAgICAgICAgICAgICAgICAke2NhcnRJdGVtcy5tYXAoKGl0ZW0sIGlkeCkgPT4gYFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtY2FydC1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgIHNyYz1cIiR7ZXNjSHRtbChpdGVtLmltYWdlIHx8ICcnKX1cIlxuICAgICAgICAgICAgICAgICAgICAgIGFsdD1cIiR7ZXNjSHRtbChpdGVtLm5hbWUpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJhY2NvdW50LWl0ZW0tdGh1bWJcIlxuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwib3Blbi1wcm9kdWN0XCJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtlc2NIdG1sKGl0ZW0ucHJvZHVjdElkKX1cIlxuICAgICAgICAgICAgICAgICAgICAgIG9uZXJyb3I9XCJ0aGlzLnN0eWxlLnZpc2liaWxpdHk9J2hpZGRlbidcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWNjb3VudC1pdGVtLWluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiI3Byb2R1Y3QvJHtlbmNvZGVVUklDb21wb25lbnQoaXRlbS5wcm9kdWN0SWQpfVwiIGNsYXNzPVwiYWNjb3VudC1pdGVtLXRpdGxlXCI+JHtlc2NIdG1sKGl0ZW0ubmFtZSl9PC9hPlxuICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5vcHRpb24gPyBgPGRpdiBjbGFzcz1cImFjY291bnQtaXRlbS1zdWJcIj4ke2VzY0h0bWwoaXRlbS5vcHRpb24pfTwvZGl2PmAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWNjb3VudC1pdGVtLXByaWNlIHRhYnVsYXItbnVtc1wiPiR7Zm9ybWF0UHJpY2UoaXRlbS5wcmljZSl9IMOXICR7aXRlbS5xdHl9ID0gPHN0cm9uZz4ke2Zvcm1hdFByaWNlKGl0ZW0ucHJpY2UgKiBpdGVtLnF0eSl9PC9zdHJvbmc+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWNjb3VudC1pdGVtLWNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInF0eS1zdGVwcGVyXCIgc3R5bGU9XCJ0cmFuc2Zvcm06c2NhbGUoMC44Nik7dHJhbnNmb3JtLW9yaWdpbjpyaWdodDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2FydC1xdHlcIiBkYXRhLWluZGV4PVwiJHtpZHh9XCIgZGF0YS1kZWx0YT1cIi0xXCIgYXJpYS1sYWJlbD1cIkRlY3JlYXNlIHF1YW50aXR5XCI+LTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2l0ZW0ucXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2FydC1xdHlcIiBkYXRhLWluZGV4PVwiJHtpZHh9XCIgZGF0YS1kZWx0YT1cIjFcIiBhcmlhLWxhYmVsPVwiSW5jcmVhc2UgcXVhbnRpdHlcIj4rPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjb2xvcjojYjkxYzFjO1wiIGRhdGEtYWN0aW9uPVwiY2FydC1yZW1vdmVcIiBkYXRhLWluZGV4PVwiJHtpZHh9XCI+UmVtb3ZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCA6IGBcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtZW1wdHktYm94XCI+XG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDEycHg7Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPllvdXIgY2FydCBpcyBjdXJyZW50bHkgZW1wdHkuPC9wPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjY2F0ZWdvcmllc1wiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tcHJpbWFyeVwiPkJyb3dzZSBQcm9kdWN0czwvYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgfVxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgYCA6ICcnfVxuXG4gICAgICAgICR7c2hvd09yZGVycyA/IGBcbiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImNhcmQtcGFuZWxcIiBhcmlhLWxhYmVsPVwiT3JkZXIgaGlzdG9yeVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24taGVhZFwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbToxNHB4O1wiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO2ZvbnQtc2l6ZToxLjE1cmVtO1wiPk15IE9yZGVycyAmYW1wOyBPcmRlcmVkIFByb2R1Y3RzICgke3RvdGFsT3JkZXJlZFByb2R1Y3RzfSBpdGVtcyk8L2gyPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44NHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+VHJhY2sgZXZlcnkgb3JkZXIgYW5kIHNlZSBob3cgbWFueSBwcm9kdWN0cyB5b3UgaGF2ZSBvcmRlcmVkPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8YSBocmVmPVwiI3RyYWNrLW9yZGVyXCIgY2xhc3M9XCJzZWN0aW9uLWxpbmtcIj5UcmFjayBieSBJRCAvIFBob25lIOKGkjwvYT5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAke29yZGVycy5sZW5ndGggPyBgXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhY2NvdW50LW9yZGVycy1saXN0XCI+XG4gICAgICAgICAgICAgICAgJHtvcmRlcnMubWFwKChvcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVMYWJlbCA9IG9yZC5jcmVhdGVkQXQgPyBuZXcgRGF0ZShvcmQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLUdCJywgeyBkYXk6ICdudW1lcmljJywgbW9udGg6ICdzaG9ydCcsIHllYXI6ICdudW1lcmljJyB9KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgY29uc3QgbG9jU3RyID0gW29yZC5kaXN0cmljdCwgb3JkLmRpdmlzaW9uXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZEl0ZW1zID0gQXJyYXkuaXNBcnJheShvcmQuaXRlbXMpID8gb3JkLml0ZW1zIDogW107XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmRVbml0cyA9IG9yZEl0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICA/IG9yZEl0ZW1zLnJlZHVjZSgocywgaXQpID0+IHMgKyAoTnVtYmVyKGl0LnF0eSkgfHwgMSksIDApXG4gICAgICAgICAgICAgICAgICAgIDogKE51bWJlcihvcmQuaXRlbUNvdW50KSB8fCAxKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxhcnRpY2xlIGNsYXNzPVwiYWNjb3VudC1vcmRlci1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtb3JkZXItaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInRhYnVsYXItbnVtc1wiIHN0eWxlPVwiZm9udC1zaXplOjFyZW07XCI+JHtlc2NIdG1sKG9yZC5vcmRlckNvZGUpfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjAuOHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkYXRlTGFiZWwgPyBgJHtlc2NIdG1sKGRhdGVMYWJlbCl9IMK3IGAgOiAnJ30ke29yZFVuaXRzfSBwcm9kdWN0JHtvcmRVbml0cyA9PT0gMSA/ICcnIDogJ3MnfSDCtyAke2VzY0h0bWwob3JkLnBheW1lbnRNZXRob2QgfHwgJ0Nhc2ggb24gRGVsaXZlcnknKX0ke2xvY1N0ciA/IGAgwrcgJHtlc2NIdG1sKGxvY1N0cil9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246cmlnaHQ7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3RhdHVzLXRleHQgc3RhdHVzLSR7ZXNjSHRtbChvcmQuc3RhdHVzIHx8ICdQZW5kaW5nJyl9XCI+4pePICR7ZXNjSHRtbChvcmQuc3RhdHVzIHx8ICdQZW5kaW5nJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFidWxhci1udW1zXCIgc3R5bGU9XCJmb250LXdlaWdodDo3MDA7Y29sb3I6dmFyKC0tcHJpbWFyeSk7bWFyZ2luLXRvcDoycHg7XCI+JHtmb3JtYXRQcmljZShvcmQudG90YWwpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgJHtvcmRJdGVtcy5sZW5ndGggPyBgXG4gICAgICAgICAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJhY2NvdW50LW9yZGVyLWl0ZW1zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICR7b3JkSXRlbXMubWFwKChpdCkgPT4gYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7ZXNjSHRtbChpdC5uYW1lKX0ke2l0Lm9wdGlvbiA/IGAgKCR7ZXNjSHRtbChpdC5vcHRpb24pfSlgIDogJyd9IMOXICR7TnVtYmVyKGl0LnF0eSkgfHwgMX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRhYnVsYXItbnVtc1wiPiR7Zm9ybWF0UHJpY2UoKE51bWJlcihpdC5wcmljZSkgfHwgMCkgKiAoTnVtYmVyKGl0LnF0eSkgfHwgMSkpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgYCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO21hcmdpbi10b3A6MTBweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIjdHJhY2stb3JkZXIvJHtlbmNvZGVVUklDb21wb25lbnQob3JkLm9yZGVyQ29kZSl9XCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCI+VHJhY2sgTGl2ZSBTdGF0dXM8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvYXJ0aWNsZT5cbiAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCA6IGBcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFjY291bnQtZW1wdHktYm94XCI+XG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDEycHg7Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPllvdSBoYXZlbid0IHBsYWNlZCBhbnkgb3JkZXJzIGZyb20gdGhpcyBkZXZpY2UgeWV0LjwvcD5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiI2RlYWxzXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5XCI+RXhwbG9yZSBGbGFzaCBEZWFsczwvYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgfVxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgYCA6ICcnfVxuXG4gICAgICAgICR7c2hvd1NldHRpbmdzID8gYFxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiY2FyZC1wYW5lbFwiIGFyaWEtbGFiZWw9XCJBY2NvdW50IHByb2ZpbGUgc2V0dGluZ3NcIj5cbiAgICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgNHB4O2ZvbnQtc2l6ZToxLjE1cmVtO1wiPkFjY291bnQgU2V0dGluZ3MgJmFtcDsgQ29udGFjdCBOdW1iZXJzPC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjAgMCAxNnB4O2ZvbnQtc2l6ZTowLjg1cmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj5cbiAgICAgICAgICAgICAgVXBkYXRlIHlvdXIgZGlzcGxheSBuYW1lLCBwcm9maWxlIHBob3RvLCBtb2JpbGUgbnVtYmVycywgZGVmYXVsdCBkZWxpdmVyeSBhZGRyZXNzLCBhbmQgbm90aWZpY2F0aW9uIHByZWZlcmVuY2VzLlxuICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAke2FjY291bnRTdGF0ZS5lcnJvciA/IGBcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImF1dGgtZXJyb3ItYm94XCIgcm9sZT1cImFsZXJ0XCI+JHtlc2NIdG1sKGFjY291bnRTdGF0ZS5lcnJvcil9PC9kaXY+XG4gICAgICAgICAgICBgIDogJyd9XG5cbiAgICAgICAgICAgIDxmb3JtIGlkPVwiYWNjb3VudC1wcm9maWxlLWZvcm1cIiBjbGFzcz1cImZvcm0tZ3JpZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImFjYy1mdWxsbmFtZVwiPkZ1bGwgTmFtZSAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJhY2MtZnVsbG5hbWVcIiBuYW1lPVwiZnVsbE5hbWVcIiByZXF1aXJlZCBtaW5sZW5ndGg9XCIyXCIgdmFsdWU9XCIke2VzY0h0bWwoc2Vzc2lvbi5mdWxsTmFtZSB8fCAnJyl9XCIgcGxhY2Vob2xkZXI9XCJZb3VyIGRpc3BsYXkgbmFtZVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYWNjLWVtYWlsXCI+RW1haWwgQWRkcmVzczwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmaWVsZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIGlkPVwiYWNjLWVtYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY0h0bWwoc2Vzc2lvbi5lbWFpbCB8fCAnJyl9XCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJ5b3VAZXhhbXBsZS5jb21cIlxuICAgICAgICAgICAgICAgICAgICAke3Nlc3Npb24uaWQgPT09ICdhZG1pbi1yb290JyA/ICdyZWFkb25seSBzdHlsZT1cImJhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLW11dGVkKTtcIicgOiAnJ31cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYWNjLXBob25lXCI+UHJpbWFyeSBNb2JpbGUgTnVtYmVyPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJhY2MtcGhvbmVcIiBuYW1lPVwicGhvbmVcIiB0eXBlPVwidGVsXCIgdmFsdWU9XCIke2VzY0h0bWwoc2Vzc2lvbi5waG9uZSB8fCAnJyl9XCIgcGxhY2Vob2xkZXI9XCIwMTdYWFhYWFhYWFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYWNjLWFsdC1waG9uZVwiPlNlY29uZGFyeSAvIEJhY2t1cCBOdW1iZXI8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBpZD1cImFjYy1hbHQtcGhvbmVcIiBuYW1lPVwiYWx0UGhvbmVcIiB0eXBlPVwidGVsXCIgdmFsdWU9XCIke2VzY0h0bWwoc2Vzc2lvbi5hbHRQaG9uZSB8fCAnJyl9XCIgcGxhY2Vob2xkZXI9XCIwMThYWFhYWFhYWCAob3B0aW9uYWwpXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhY2Mtd2hhdHNhcHBcIj5XaGF0c0FwcCBOdW1iZXI8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBpZD1cImFjYy13aGF0c2FwcFwiIG5hbWU9XCJ3aGF0c2FwcE51bWJlclwiIHR5cGU9XCJ0ZWxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChzZXNzaW9uLndoYXRzYXBwTnVtYmVyIHx8ICcnKX1cIiBwbGFjZWhvbGRlcj1cIjAxN1hYWFhYWFhYIChmb3IgZGVsaXZlcnkgdXBkYXRlcylcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImFjYy1wYXltZW50XCI+UHJlZmVycmVkIFBheW1lbnQgTWV0aG9kPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3RcIiBpZD1cImFjYy1wYXltZW50XCIgbmFtZT1cInByZWZlcnJlZFBheW1lbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIkNhc2ggb24gRGVsaXZlcnlcIiAkeyhzZXNzaW9uLnByZWZlcnJlZFBheW1lbnQgfHwgJ0Nhc2ggb24gRGVsaXZlcnknKSA9PT0gJ0Nhc2ggb24gRGVsaXZlcnknID8gJ3NlbGVjdGVkJyA6ICcnfT5DYXNoIG9uIERlbGl2ZXJ5PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJiS2FzaFwiICR7c2Vzc2lvbi5wcmVmZXJyZWRQYXltZW50ID09PSAnYkthc2gnID8gJ3NlbGVjdGVkJyA6ICcnfT5iS2FzaDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiTmFnYWRcIiAke3Nlc3Npb24ucHJlZmVycmVkUGF5bWVudCA9PT0gJ05hZ2FkJyA/ICdzZWxlY3RlZCcgOiAnJ30+TmFnYWQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY28tbG9jYXRpb24tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImFjYy1kaXZpc2lvblwiPkRlZmF1bHQgRGl2aXNpb248L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwiYWNjLWRpdmlzaW9uXCIgbmFtZT1cImRpdmlzaW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICR7ZGl2aXNpb25zLm1hcCgoZGl2KSA9PiBgXG4gICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjSHRtbChkaXYpfVwiICR7ZGl2ID09PSBzZWxlY3RlZERpdiA/ICdzZWxlY3RlZCcgOiAnJ30+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2VzY0h0bWwoZGl2KX0gKCR7ZXNjSHRtbChnZXREaXZpc2lvbkJuKGRpdikpfSlcbiAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhY2MtZGlzdHJpY3RcIj5EZWZhdWx0IERpc3RyaWN0PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3RcIiBpZD1cImFjYy1kaXN0cmljdFwiIG5hbWU9XCJkaXN0cmljdFwiPlxuICAgICAgICAgICAgICAgICAgICAke2Rpc3RyaWN0cy5tYXAoKGRpc3QpID0+IGBcbiAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiJHtlc2NIdG1sKGRpc3QpfVwiICR7ZGlzdCA9PT0gc2VsZWN0ZWREaXN0ID8gJ3NlbGVjdGVkJyA6ICcnfT4ke2VzY0h0bWwoZGlzdCl9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhY2MtYWRkcmVzc1wiPlNhdmVkIERlbGl2ZXJ5IEFkZHJlc3M8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgaWQ9XCJhY2MtYWRkcmVzc1wiIG5hbWU9XCJhZGRyZXNzXCIgdmFsdWU9XCIke2VzY0h0bWwoc2Vzc2lvbi5hZGRyZXNzIHx8ICcnKX1cIiBwbGFjZWhvbGRlcj1cIkhvdXNlLCBSb2FkLCBCbG9jayAvIEFyZWFcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDoxNnB4O3BhZGRpbmc6NnB4IDA7XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPVwiZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MC44OHJlbTtjdXJzb3I6cG9pbnRlcjtcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cImFjYy1ub3RpZnktb3JkZXJzXCIgbmFtZT1cIm5vdGlmeU9yZGVyc1wiICR7c2Vzc2lvbi5ub3RpZnlPcmRlcnMgIT09IGZhbHNlID8gJ2NoZWNrZWQnIDogJyd9IC8+XG4gICAgICAgICAgICAgICAgICBPcmRlciBzdGF0dXMgJmFtcDsgZGVsaXZlcnkgdXBkYXRlc1xuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPVwiZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MC44OHJlbTtjdXJzb3I6cG9pbnRlcjtcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cImFjYy1ub3RpZnktZGVhbHNcIiBuYW1lPVwibm90aWZ5RGVhbHNcIiAke3Nlc3Npb24ubm90aWZ5RGVhbHMgPyAnY2hlY2tlZCcgOiAnJ30gLz5cbiAgICAgICAgICAgICAgICAgIEZsYXNoIGRlYWxzICZhbXA7IHByaWNlIGRyb3AgYWxlcnRzXG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6MTBweDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47XCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5TYXZlIEFjY291bnQgU2V0dGluZ3M8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgICAgICR7c2Vzc2lvbi5pZCAhPT0gJ2FkbWluLXJvb3QnID8gYFxuICAgICAgICAgICAgICA8aHIgc3R5bGU9XCJib3JkZXI6MDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO21hcmdpbjoyNHB4IDAgMThweDtcIiAvPlxuICAgICAgICAgICAgICA8aDMgc3R5bGU9XCJtYXJnaW46MCAwIDEwcHg7Zm9udC1zaXplOjFyZW07XCI+U2VjdXJpdHkgJmFtcDsgUGFzc3dvcmQ8L2gzPlxuICAgICAgICAgICAgICAke2FjY291bnRTdGF0ZS5wYXNzRXJyb3IgPyBgPGRpdiBjbGFzcz1cImF1dGgtZXJyb3ItYm94XCIgcm9sZT1cImFsZXJ0XCI+JHtlc2NIdG1sKGFjY291bnRTdGF0ZS5wYXNzRXJyb3IpfTwvZGl2PmAgOiAnJ31cbiAgICAgICAgICAgICAgPGZvcm0gaWQ9XCJhY2NvdW50LXBhc3N3b3JkLWZvcm1cIiBjbGFzcz1cImZvcm0tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImFjYy1jdXItcGFzc1wiPkN1cnJlbnQgUGFzc3dvcmQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWNjLWN1ci1wYXNzXCIgdHlwZT1cInBhc3N3b3JkXCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJDdXJyZW50IHBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhY2MtbmV3LXBhc3NcIj5OZXcgUGFzc3dvcmQgKG1pbi4gNiBjaGFycyk8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWNjLW5ldy1wYXNzXCIgdHlwZT1cInBhc3N3b3JkXCIgcmVxdWlyZWQgbWlubGVuZ3RoPVwiNlwiIHBsYWNlaG9sZGVyPVwiTmV3IHBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImFjYy1jb25mLXBhc3NcIj5Db25maXJtIE5ldyBQYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWNjLWNvbmYtcGFzc1wiIHR5cGU9XCJwYXNzd29yZFwiIHJlcXVpcmVkIG1pbmxlbmd0aD1cIjZcIiBwbGFjZWhvbGRlcj1cIlJlLWVudGVyIG5ldyBwYXNzd29yZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lIGJ0bi1zbVwiPlVwZGF0ZSBQYXNzd29yZDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICBgIDogJyd9XG5cbiAgICAgICAgICAgIDxociBzdHlsZT1cImJvcmRlcjowO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7bWFyZ2luOjI0cHggMCAxOHB4O1wiIC8+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjtnYXA6MTJweDtcIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIHN0eWxlPVwiZm9udC1zaXplOjAuOTVyZW07XCI+U2lnbiBPdXQgb2YgQWNjb3VudDwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44MnJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+WW91ciBzYXZlZCBwcm9maWxlIGRldGFpbHMsIG51bWJlcnMsIGFuZCBjYXJ0IHN0YXkgc2FmZSBmb3IgeW91ciBuZXh0IHNpZ24taW4uPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCIgZGF0YS1hY3Rpb249XCJjdXN0b21lci1sb2dvdXRcIj7wn5qqIExvZyBPdXQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgYCA6ICcnfVxuICAgICAgPC9kaXY+XG4gICAgPC9tYWluPlxuICBgO1xufVxuXG4iXX0=