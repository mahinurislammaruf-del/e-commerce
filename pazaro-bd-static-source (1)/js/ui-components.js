// Pazaro BD — Pure Vanilla JS UI Components & Helpers
import { state, formatPrice, calcDiscountPercent } from "/src/js/store.js";
import { makeProductSvg } from "/src/js/product-art.js";
export function escHtml(str) {
	return String(str ?? "").replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			case "'": return "&#39;";
			default: return ch;
		}
	});
}
export function getProductImage(product, idx = 0) {
	const imgs = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
	if (imgs[idx]) return imgs[idx];
	if (imgs[0]) return imgs[0];
	return makeProductSvg(product?.name || "Pazaro BD", product?.category || "Phones");
}
export function getStockBadge(stock) {
	const s = Number(stock) || 0;
	if (s <= 0) return {
		label: "Out of Stock",
		cls: "status-Cancelled"
	};
	if (s <= 5) return {
		label: `Low Stock (${s} left)`,
		cls: "status-Pending"
	};
	return {
		label: "In Stock",
		cls: "status-Confirmed"
	};
}
export function renderStars(rating = 4.7) {
	const full = Math.round(Number(rating) || 4.7);
	return "★".repeat(Math.min(5, Math.max(1, full))) + "☆".repeat(Math.max(0, 5 - full));
}
export function renderProductCard(product) {
	const imgSrc = getProductImage(product, 0);
	const fallbackSrc = makeProductSvg(product.name, product.category);
	const disc = calcDiscountPercent(product.price, product.oldPrice);
	const wished = state.wishlist.includes(product.id);
	const outOfStock = (Number(product.stock) || 0) <= 0;
	return `
    <article class="product-card reveal-up" data-product-id="${escHtml(product.id)}">
      <div class="card-media" data-action="open-product" data-id="${escHtml(product.id)}">
        <img
          src="${escHtml(imgSrc)}"
          alt="${escHtml(product.name)}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null;this.src='${escHtml(fallbackSrc)}';"
        />
        ${disc > 0 ? `<span class="discount-tag">-${disc}%</span>` : ""}
        <button
          type="button"
          class="wish-btn ${wished ? "active" : ""}"
          aria-label="Toggle wishlist for ${escHtml(product.name)}"
          data-action="toggle-wish"
          data-id="${escHtml(product.id)}"
        >
          ${wished ? "♥" : "♡"}
        </button>
      </div>
      <div class="card-body">
        <div class="card-meta">${escHtml(product.brand || "Pazaro BD")} · ${escHtml(product.category)}</div>
        <h3 class="card-title" data-action="open-product" data-id="${escHtml(product.id)}">${escHtml(product.name)}</h3>
        <div class="card-rating">
          <span class="star-icon" aria-hidden="true">${renderStars(product.rating)}</span>
          <span class="tabular-nums">${Number(product.rating || 4.6).toFixed(1)} (${product.reviewCount || 0})</span>
        </div>
        <div class="card-price-row">
          <span class="price-now tabular-nums">${formatPrice(product.price)}</span>
          ${Number(product.oldPrice) > Number(product.price) ? `<span class="price-old tabular-nums">${formatPrice(product.oldPrice)}</span>` : ""}
        </div>
        <div class="card-action-row">
          <button
            type="button"
            class="card-order-btn"
            data-action="order-now"
            data-id="${escHtml(product.id)}"
            ${outOfStock ? "disabled" : ""}
          >
            ${outOfStock ? "Out of Stock" : "Order Now"}
          </button>
          <button
            type="button"
            class="card-cart-icon-btn ${state.lastAddedProductId === product.id ? "is-added" : ""}"
            data-action="add-cart"
            data-id="${escHtml(product.id)}"
            aria-label="Add ${escHtml(product.name)} to cart"
            title="${outOfStock ? "Out of Stock" : "Add to Cart"}"
            ${outOfStock ? "disabled" : ""}
          >
            ${state.lastAddedProductId === product.id ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>` : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`}
          </button>
        </div>
      </div>
    </article>
  `;
}
export function renderHorizontalScroller(id, title, products, { linkHash = "", isFlash = false } = {}) {
	if (!products.length) return "";
	return `
    <section class="section-block">
      <div class="section-head">
        <div class="section-title-group">
          <h2 class="section-title">${escHtml(title)}</h2>
          ${isFlash ? `
            <div class="flash-timer" id="flash-sale-timer" aria-label="Flash sale countdown">
              <span>Ends in</span>
              <span class="flash-digit" id="fs-hrs">08</span>:
              <span class="flash-digit" id="fs-min">42</span>:
              <span class="flash-digit" id="fs-sec">19</span>
            </div>
          ` : ""}
        </div>
        ${linkHash ? `<a href="${escHtml(linkHash)}" class="section-link">View All →</a>` : ""}
      </div>
      <div class="scroller-wrap">
        <button type="button" class="scroller-arrow scroller-prev" data-scroll-target="${escHtml(id)}" data-dir="-1" aria-label="Scroll left">‹</button>
        <div class="product-scroller" id="${escHtml(id)}">
          ${products.map(renderProductCard).join("")}
        </div>
        <button type="button" class="scroller-arrow scroller-next" data-scroll-target="${escHtml(id)}" data-dir="1" aria-label="Scroll right">›</button>
      </div>
    </section>
  `;
}
export function renderAdSlot(slotKey, extraClass = "") {
	const slot = state.ads?.slots?.[slotKey];
	if (!slot || !slot.enabled) {
		return `<div class="ad-slot is-collapsed ${escHtml(extraClass)}" data-ad-slot="${escHtml(slotKey)}"></div>`;
	}
	const hasHtml = Boolean(slot.htmlCode && slot.htmlCode.trim());
	const hasImage = Boolean(slot.imageUrl && slot.imageUrl.trim());
	if (!hasHtml && !hasImage) {
		return `<div class="ad-slot is-collapsed ${escHtml(extraClass)}" data-ad-slot="${escHtml(slotKey)}"></div>`;
	}
	return `
    <div class="ad-slot ${escHtml(extraClass)}" data-ad-slot="${escHtml(slotKey)}">
      <div class="ad-slot-inner">
        <span class="ad-label">Sponsored</span>
        ${hasHtml ? `<div class="ad-html-wrap">${slot.htmlCode}</div>` : `<a href="${escHtml(slot.linkUrl || "#")}" target="_blank" rel="noopener noreferrer">
               <img src="${escHtml(slot.imageUrl)}" alt="Promotional sponsor banner" loading="lazy" decoding="async" style="width:100%;max-height:260px;object-fit:cover;" />
             </a>`}
      </div>
    </div>
  `;
}
export function parseEmbedVideo(url) {
	if (!url) return null;
	const clean = url.trim();
	// YouTube
	const ytMatch = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
	if (ytMatch) {
		return {
			type: "iframe",
			src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0`
		};
	}
	// Facebook video
	if (clean.includes("facebook.com") || clean.includes("fb.watch")) {
		return {
			type: "iframe",
			src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false&autoplay=true&mute=true`
		};
	}
	// Direct MP4 / WebM video
	return {
		type: "video",
		src: clean
	};
}
export function renderProductVideoSection(product) {
	const videoUrl = (product.videoUrl || "").trim();
	const poster = product.videoPoster || getProductImage(product, 0);
	if (!videoUrl) {
		return `
      <div class="pdp-video-card">
        <h3 style="margin:0 0 6px;font-size:1rem;">Product Video</h3>
        <p style="margin:0;font-size:0.86rem;color:var(--muted);">
          No demo video uploaded for this item yet. Ask our WhatsApp support team for a live look anytime.
        </p>
      </div>
    `;
	}
	return `
    <div class="pdp-video-card" id="pdp-video-section">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <h3 style="margin:0;font-size:1rem;">Product Demo Video</h3>
        <span style="font-size:0.78rem;color:var(--muted);">Muted by default · Tap to play</span>
      </div>
      <div class="video-frame" id="pdp-video-container" data-video-url="${escHtml(videoUrl)}" data-video-poster="${escHtml(poster)}">
        <button type="button" class="video-poster-btn" data-action="play-product-video" aria-label="Play product demo video">
          <img src="${escHtml(poster)}" alt="${escHtml(product.name)} video preview" loading="lazy" decoding="async" />
          <span class="video-play-circle" aria-hidden="true">▶</span>
        </button>
      </div>
    </div>
  `;
}
export function renderTrustStrip() {
	return `
    <section class="trust-strip" aria-label="Storefront guarantees and payment methods">
      <div class="trust-items">
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">🔒</span>
          <div>
            <div class="trust-title">Secure Payment</div>
            <div class="trust-sub">Verified & safe checkout</div>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">🚚</span>
          <div>
            <div class="trust-title">Fast Delivery</div>
            <div class="trust-sub">24-48h Dhaka · 64 Districts</div>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">↩️</span>
          <div>
            <div class="trust-title">Easy Returns</div>
            <div class="trust-sub">7-day replacement guarantee</div>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">💬</span>
          <div>
            <div class="trust-title">24/7 Support</div>
            <div class="trust-sub">WhatsApp & phone help</div>
          </div>
        </div>
      </div>
      <div class="payment-badges" aria-label="Accepted payment methods in Bangladesh">
        <span class="pay-mark" style="color:#E2136E;">● bKash</span>
        <span class="pay-mark" style="color:#F6921E;">● Nagad</span>
        <span class="pay-mark" style="color:#8C3494;">● Rocket</span>
        <span class="pay-mark" style="color:#0F766E;">💵 Cash on Delivery</span>
      </div>
    </section>
  `;
}
export function renderDbConnectionAlert() {
	if (state.dbStatus !== "error") return "";
	const detail = state.dbError || "Connection to Firebase Cloud Firestore failed. Showing cached catalog data.";
	return `
    <div class="db-alert-banner" role="alert" aria-live="assertive">
      <div class="db-alert-banner__body">
        <span class="db-alert-banner__icon" aria-hidden="true">⚠️</span>
        <div>
          <div class="db-alert-banner__title">Unable to reach the Firebase database (pazaro-bd)</div>
          <div class="db-alert-banner__msg">${escHtml(detail)}</div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-primary" data-action="retry-db-connection">
        Retry Connection
      </button>
    </div>
  `;
}

//# sourceMappingURL=data:application/json;base64,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TUFBTSxhQUFhLFNBQVMsT0FBTztDQUN2QyxNQUFNLFNBQVMsTUFBTSxXQUFXO0NBQ2hDLE9BQU87Ozs7Ozs4Q0FNcUMsUUFBUSxNQUFNLEVBQUU7Ozs7Ozs7O0FBUTlEIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInVpLWNvbXBvbmVudHMuanMiXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiLy8gUGF6YXJvIEJEIOKAlCBQdXJlIFZhbmlsbGEgSlMgVUkgQ29tcG9uZW50cyAmIEhlbHBlcnNcbmltcG9ydCB7IHN0YXRlLCBmb3JtYXRQcmljZSwgY2FsY0Rpc2NvdW50UGVyY2VudCB9IGZyb20gJy4vc3RvcmUuanMnO1xuaW1wb3J0IHsgbWFrZVByb2R1Y3RTdmcgfSBmcm9tICcuL3Byb2R1Y3QtYXJ0LmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGVzY0h0bWwoc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyID8/ICcnKS5yZXBsYWNlKC9bJjw+XCInXS9nLCAoY2gpID0+IHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICBjYXNlICcmJzogcmV0dXJuICcmYW1wOyc7XG4gICAgICBjYXNlICc8JzogcmV0dXJuICcmbHQ7JztcbiAgICAgIGNhc2UgJz4nOiByZXR1cm4gJyZndDsnO1xuICAgICAgY2FzZSAnXCInOiByZXR1cm4gJyZxdW90Oyc7XG4gICAgICBjYXNlIFwiJ1wiOiByZXR1cm4gJyYjMzk7JztcbiAgICAgIGRlZmF1bHQ6IHJldHVybiBjaDtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvZHVjdEltYWdlKHByb2R1Y3QsIGlkeCA9IDApIHtcbiAgY29uc3QgaW1ncyA9IEFycmF5LmlzQXJyYXkocHJvZHVjdD8uaW1hZ2VzKSA/IHByb2R1Y3QuaW1hZ2VzLmZpbHRlcihCb29sZWFuKSA6IFtdO1xuICBpZiAoaW1nc1tpZHhdKSByZXR1cm4gaW1nc1tpZHhdO1xuICBpZiAoaW1nc1swXSkgcmV0dXJuIGltZ3NbMF07XG4gIHJldHVybiBtYWtlUHJvZHVjdFN2Zyhwcm9kdWN0Py5uYW1lIHx8ICdQYXphcm8gQkQnLCBwcm9kdWN0Py5jYXRlZ29yeSB8fCAnUGhvbmVzJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdG9ja0JhZGdlKHN0b2NrKSB7XG4gIGNvbnN0IHMgPSBOdW1iZXIoc3RvY2spIHx8IDA7XG4gIGlmIChzIDw9IDApIHJldHVybiB7IGxhYmVsOiAnT3V0IG9mIFN0b2NrJywgY2xzOiAnc3RhdHVzLUNhbmNlbGxlZCcgfTtcbiAgaWYgKHMgPD0gNSkgcmV0dXJuIHsgbGFiZWw6IGBMb3cgU3RvY2sgKCR7c30gbGVmdClgLCBjbHM6ICdzdGF0dXMtUGVuZGluZycgfTtcbiAgcmV0dXJuIHsgbGFiZWw6ICdJbiBTdG9jaycsIGNsczogJ3N0YXR1cy1Db25maXJtZWQnIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTdGFycyhyYXRpbmcgPSA0LjcpIHtcbiAgY29uc3QgZnVsbCA9IE1hdGgucm91bmQoTnVtYmVyKHJhdGluZykgfHwgNC43KTtcbiAgcmV0dXJuICfimIUnLnJlcGVhdChNYXRoLm1pbig1LCBNYXRoLm1heCgxLCBmdWxsKSkpICsgJ+KYhicucmVwZWF0KE1hdGgubWF4KDAsIDUgLSBmdWxsKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQcm9kdWN0Q2FyZChwcm9kdWN0KSB7XG4gIGNvbnN0IGltZ1NyYyA9IGdldFByb2R1Y3RJbWFnZShwcm9kdWN0LCAwKTtcbiAgY29uc3QgZmFsbGJhY2tTcmMgPSBtYWtlUHJvZHVjdFN2Zyhwcm9kdWN0Lm5hbWUsIHByb2R1Y3QuY2F0ZWdvcnkpO1xuICBjb25zdCBkaXNjID0gY2FsY0Rpc2NvdW50UGVyY2VudChwcm9kdWN0LnByaWNlLCBwcm9kdWN0Lm9sZFByaWNlKTtcbiAgY29uc3Qgd2lzaGVkID0gc3RhdGUud2lzaGxpc3QuaW5jbHVkZXMocHJvZHVjdC5pZCk7XG4gIGNvbnN0IG91dE9mU3RvY2sgPSAoTnVtYmVyKHByb2R1Y3Quc3RvY2spIHx8IDApIDw9IDA7XG5cbiAgcmV0dXJuIGBcbiAgICA8YXJ0aWNsZSBjbGFzcz1cInByb2R1Y3QtY2FyZCByZXZlYWwtdXBcIiBkYXRhLXByb2R1Y3QtaWQ9XCIke2VzY0h0bWwocHJvZHVjdC5pZCl9XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1tZWRpYVwiIGRhdGEtYWN0aW9uPVwib3Blbi1wcm9kdWN0XCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChwcm9kdWN0LmlkKX1cIj5cbiAgICAgICAgPGltZ1xuICAgICAgICAgIHNyYz1cIiR7ZXNjSHRtbChpbWdTcmMpfVwiXG4gICAgICAgICAgYWx0PVwiJHtlc2NIdG1sKHByb2R1Y3QubmFtZSl9XCJcbiAgICAgICAgICBsb2FkaW5nPVwibGF6eVwiXG4gICAgICAgICAgZGVjb2Rpbmc9XCJhc3luY1wiXG4gICAgICAgICAgcmVmZXJyZXJwb2xpY3k9XCJuby1yZWZlcnJlclwiXG4gICAgICAgICAgb25lcnJvcj1cInRoaXMub25lcnJvcj1udWxsO3RoaXMuc3JjPScke2VzY0h0bWwoZmFsbGJhY2tTcmMpfSc7XCJcbiAgICAgICAgLz5cbiAgICAgICAgJHtkaXNjID4gMCA/IGA8c3BhbiBjbGFzcz1cImRpc2NvdW50LXRhZ1wiPi0ke2Rpc2N9JTwvc3Bhbj5gIDogJyd9XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzcz1cIndpc2gtYnRuICR7d2lzaGVkID8gJ2FjdGl2ZScgOiAnJ31cIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJUb2dnbGUgd2lzaGxpc3QgZm9yICR7ZXNjSHRtbChwcm9kdWN0Lm5hbWUpfVwiXG4gICAgICAgICAgZGF0YS1hY3Rpb249XCJ0b2dnbGUtd2lzaFwiXG4gICAgICAgICAgZGF0YS1pZD1cIiR7ZXNjSHRtbChwcm9kdWN0LmlkKX1cIlxuICAgICAgICA+XG4gICAgICAgICAgJHt3aXNoZWQgPyAn4pmlJyA6ICfimaEnfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtYm9keVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1tZXRhXCI+JHtlc2NIdG1sKHByb2R1Y3QuYnJhbmQgfHwgJ1BhemFybyBCRCcpfSDCtyAke2VzY0h0bWwocHJvZHVjdC5jYXRlZ29yeSl9PC9kaXY+XG4gICAgICAgIDxoMyBjbGFzcz1cImNhcmQtdGl0bGVcIiBkYXRhLWFjdGlvbj1cIm9wZW4tcHJvZHVjdFwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocHJvZHVjdC5pZCl9XCI+JHtlc2NIdG1sKHByb2R1Y3QubmFtZSl9PC9oMz5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcmF0aW5nXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFyLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj4ke3JlbmRlclN0YXJzKHByb2R1Y3QucmF0aW5nKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke051bWJlcihwcm9kdWN0LnJhdGluZyB8fCA0LjYpLnRvRml4ZWQoMSl9ICgke3Byb2R1Y3QucmV2aWV3Q291bnQgfHwgMH0pPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcHJpY2Utcm93XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcmljZS1ub3cgdGFidWxhci1udW1zXCI+JHtmb3JtYXRQcmljZShwcm9kdWN0LnByaWNlKX08L3NwYW4+XG4gICAgICAgICAgJHtOdW1iZXIocHJvZHVjdC5vbGRQcmljZSkgPiBOdW1iZXIocHJvZHVjdC5wcmljZSkgPyBgPHNwYW4gY2xhc3M9XCJwcmljZS1vbGQgdGFidWxhci1udW1zXCI+JHtmb3JtYXRQcmljZShwcm9kdWN0Lm9sZFByaWNlKX08L3NwYW4+YCA6ICcnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtYWN0aW9uLXJvd1wiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3M9XCJjYXJkLW9yZGVyLWJ0blwiXG4gICAgICAgICAgICBkYXRhLWFjdGlvbj1cIm9yZGVyLW5vd1wiXG4gICAgICAgICAgICBkYXRhLWlkPVwiJHtlc2NIdG1sKHByb2R1Y3QuaWQpfVwiXG4gICAgICAgICAgICAke291dE9mU3RvY2sgPyAnZGlzYWJsZWQnIDogJyd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgJHtvdXRPZlN0b2NrID8gJ091dCBvZiBTdG9jaycgOiAnT3JkZXIgTm93J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiY2FyZC1jYXJ0LWljb24tYnRuICR7c3RhdGUubGFzdEFkZGVkUHJvZHVjdElkID09PSBwcm9kdWN0LmlkID8gJ2lzLWFkZGVkJyA6ICcnfVwiXG4gICAgICAgICAgICBkYXRhLWFjdGlvbj1cImFkZC1jYXJ0XCJcbiAgICAgICAgICAgIGRhdGEtaWQ9XCIke2VzY0h0bWwocHJvZHVjdC5pZCl9XCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJBZGQgJHtlc2NIdG1sKHByb2R1Y3QubmFtZSl9IHRvIGNhcnRcIlxuICAgICAgICAgICAgdGl0bGU9XCIke291dE9mU3RvY2sgPyAnT3V0IG9mIFN0b2NrJyA6ICdBZGQgdG8gQ2FydCd9XCJcbiAgICAgICAgICAgICR7b3V0T2ZTdG9jayA/ICdkaXNhYmxlZCcgOiAnJ31cbiAgICAgICAgICA+XG4gICAgICAgICAgICAke3N0YXRlLmxhc3RBZGRlZFByb2R1Y3RJZCA9PT0gcHJvZHVjdC5pZFxuICAgICAgICAgICAgICA/IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjIuNFwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxwb2x5bGluZSBwb2ludHM9XCIyMCA2IDkgMTcgNCAxMlwiPjwvcG9seWxpbmU+PC9zdmc+YFxuICAgICAgICAgICAgICA6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48Y2lyY2xlIGN4PVwiOVwiIGN5PVwiMjFcIiByPVwiMVwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XCIyMFwiIGN5PVwiMjFcIiByPVwiMVwiPjwvY2lyY2xlPjxwYXRoIGQ9XCJNMSAxaDRsMi42OCAxMy4zOWEyIDIgMCAwIDAgMiAxLjYxaDkuNzJhMiAyIDAgMCAwIDItMS42MUwyMyA2SDZcIj48L3BhdGg+PC9zdmc+YFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvYXJ0aWNsZT5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckhvcml6b250YWxTY3JvbGxlcihpZCwgdGl0bGUsIHByb2R1Y3RzLCB7IGxpbmtIYXNoID0gJycsIGlzRmxhc2ggPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKCFwcm9kdWN0cy5sZW5ndGgpIHJldHVybiAnJztcbiAgcmV0dXJuIGBcbiAgICA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24tYmxvY2tcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWhlYWRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdGl0bGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+JHtlc2NIdG1sKHRpdGxlKX08L2gyPlxuICAgICAgICAgICR7aXNGbGFzaCA/IGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGFzaC10aW1lclwiIGlkPVwiZmxhc2gtc2FsZS10aW1lclwiIGFyaWEtbGFiZWw9XCJGbGFzaCBzYWxlIGNvdW50ZG93blwiPlxuICAgICAgICAgICAgICA8c3Bhbj5FbmRzIGluPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZsYXNoLWRpZ2l0XCIgaWQ9XCJmcy1ocnNcIj4wODwvc3Bhbj46XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZmxhc2gtZGlnaXRcIiBpZD1cImZzLW1pblwiPjQyPC9zcGFuPjpcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGFzaC1kaWdpdFwiIGlkPVwiZnMtc2VjXCI+MTk8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBgIDogJyd9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAke2xpbmtIYXNoID8gYDxhIGhyZWY9XCIke2VzY0h0bWwobGlua0hhc2gpfVwiIGNsYXNzPVwic2VjdGlvbi1saW5rXCI+VmlldyBBbGwg4oaSPC9hPmAgOiAnJ31cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGVyLXdyYXBcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJzY3JvbGxlci1hcnJvdyBzY3JvbGxlci1wcmV2XCIgZGF0YS1zY3JvbGwtdGFyZ2V0PVwiJHtlc2NIdG1sKGlkKX1cIiBkYXRhLWRpcj1cIi0xXCIgYXJpYS1sYWJlbD1cIlNjcm9sbCBsZWZ0XCI+4oC5PC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LXNjcm9sbGVyXCIgaWQ9XCIke2VzY0h0bWwoaWQpfVwiPlxuICAgICAgICAgICR7cHJvZHVjdHMubWFwKHJlbmRlclByb2R1Y3RDYXJkKS5qb2luKCcnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwic2Nyb2xsZXItYXJyb3cgc2Nyb2xsZXItbmV4dFwiIGRhdGEtc2Nyb2xsLXRhcmdldD1cIiR7ZXNjSHRtbChpZCl9XCIgZGF0YS1kaXI9XCIxXCIgYXJpYS1sYWJlbD1cIlNjcm9sbCByaWdodFwiPuKAujwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICBgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQWRTbG90KHNsb3RLZXksIGV4dHJhQ2xhc3MgPSAnJykge1xuICBjb25zdCBzbG90ID0gc3RhdGUuYWRzPy5zbG90cz8uW3Nsb3RLZXldO1xuICBpZiAoIXNsb3QgfHwgIXNsb3QuZW5hYmxlZCkge1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImFkLXNsb3QgaXMtY29sbGFwc2VkICR7ZXNjSHRtbChleHRyYUNsYXNzKX1cIiBkYXRhLWFkLXNsb3Q9XCIke2VzY0h0bWwoc2xvdEtleSl9XCI+PC9kaXY+YDtcbiAgfVxuICBjb25zdCBoYXNIdG1sID0gQm9vbGVhbihzbG90Lmh0bWxDb2RlICYmIHNsb3QuaHRtbENvZGUudHJpbSgpKTtcbiAgY29uc3QgaGFzSW1hZ2UgPSBCb29sZWFuKHNsb3QuaW1hZ2VVcmwgJiYgc2xvdC5pbWFnZVVybC50cmltKCkpO1xuICBpZiAoIWhhc0h0bWwgJiYgIWhhc0ltYWdlKSB7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiYWQtc2xvdCBpcy1jb2xsYXBzZWQgJHtlc2NIdG1sKGV4dHJhQ2xhc3MpfVwiIGRhdGEtYWQtc2xvdD1cIiR7ZXNjSHRtbChzbG90S2V5KX1cIj48L2Rpdj5gO1xuICB9XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwiYWQtc2xvdCAke2VzY0h0bWwoZXh0cmFDbGFzcyl9XCIgZGF0YS1hZC1zbG90PVwiJHtlc2NIdG1sKHNsb3RLZXkpfVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImFkLXNsb3QtaW5uZXJcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJhZC1sYWJlbFwiPlNwb25zb3JlZDwvc3Bhbj5cbiAgICAgICAgJHtoYXNIdG1sXG4gICAgICAgICAgPyBgPGRpdiBjbGFzcz1cImFkLWh0bWwtd3JhcFwiPiR7c2xvdC5odG1sQ29kZX08L2Rpdj5gXG4gICAgICAgICAgOiBgPGEgaHJlZj1cIiR7ZXNjSHRtbChzbG90LmxpbmtVcmwgfHwgJyMnKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+XG4gICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7ZXNjSHRtbChzbG90LmltYWdlVXJsKX1cIiBhbHQ9XCJQcm9tb3Rpb25hbCBzcG9uc29yIGJhbm5lclwiIGxvYWRpbmc9XCJsYXp5XCIgZGVjb2Rpbmc9XCJhc3luY1wiIHN0eWxlPVwid2lkdGg6MTAwJTttYXgtaGVpZ2h0OjI2MHB4O29iamVjdC1maXQ6Y292ZXI7XCIgLz5cbiAgICAgICAgICAgICA8L2E+YFxuICAgICAgICB9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRW1iZWRWaWRlbyh1cmwpIHtcbiAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuICBjb25zdCBjbGVhbiA9IHVybC50cmltKCk7XG4gIC8vIFlvdVR1YmVcbiAgY29uc3QgeXRNYXRjaCA9IGNsZWFuLm1hdGNoKC8oPzp5b3V0dWJlXFwuY29tXFwvKD86d2F0Y2hcXD92PXxlbWJlZFxcL3xzaG9ydHNcXC8pfHlvdXR1XFwuYmVcXC8pKFthLXpBLVowLTlfLV17MTF9KS8pO1xuICBpZiAoeXRNYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnaWZyYW1lJyxcbiAgICAgIHNyYzogYGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLyR7eXRNYXRjaFsxXX0/YXV0b3BsYXk9MSZtdXRlPTEmcmVsPTBgXG4gICAgfTtcbiAgfVxuICAvLyBGYWNlYm9vayB2aWRlb1xuICBpZiAoY2xlYW4uaW5jbHVkZXMoJ2ZhY2Vib29rLmNvbScpIHx8IGNsZWFuLmluY2x1ZGVzKCdmYi53YXRjaCcpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdpZnJhbWUnLFxuICAgICAgc3JjOiBgaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3BsdWdpbnMvdmlkZW8ucGhwP2hyZWY9JHtlbmNvZGVVUklDb21wb25lbnQoY2xlYW4pfSZzaG93X3RleHQ9ZmFsc2UmYXV0b3BsYXk9dHJ1ZSZtdXRlPXRydWVgXG4gICAgfTtcbiAgfVxuICAvLyBEaXJlY3QgTVA0IC8gV2ViTSB2aWRlb1xuICByZXR1cm4geyB0eXBlOiAndmlkZW8nLCBzcmM6IGNsZWFuIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQcm9kdWN0VmlkZW9TZWN0aW9uKHByb2R1Y3QpIHtcbiAgY29uc3QgdmlkZW9VcmwgPSAocHJvZHVjdC52aWRlb1VybCB8fCAnJykudHJpbSgpO1xuICBjb25zdCBwb3N0ZXIgPSBwcm9kdWN0LnZpZGVvUG9zdGVyIHx8IGdldFByb2R1Y3RJbWFnZShwcm9kdWN0LCAwKTtcblxuICBpZiAoIXZpZGVvVXJsKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXYgY2xhc3M9XCJwZHAtdmlkZW8tY2FyZFwiPlxuICAgICAgICA8aDMgc3R5bGU9XCJtYXJnaW46MCAwIDZweDtmb250LXNpemU6MXJlbTtcIj5Qcm9kdWN0IFZpZGVvPC9oMz5cbiAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MC44NnJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+XG4gICAgICAgICAgTm8gZGVtbyB2aWRlbyB1cGxvYWRlZCBmb3IgdGhpcyBpdGVtIHlldC4gQXNrIG91ciBXaGF0c0FwcCBzdXBwb3J0IHRlYW0gZm9yIGEgbGl2ZSBsb29rIGFueXRpbWUuXG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cblxuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJwZHAtdmlkZW8tY2FyZFwiIGlkPVwicGRwLXZpZGVvLXNlY3Rpb25cIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO21hcmdpbi1ib3R0b206MTBweDtcIj5cbiAgICAgICAgPGgzIHN0eWxlPVwibWFyZ2luOjA7Zm9udC1zaXplOjFyZW07XCI+UHJvZHVjdCBEZW1vIFZpZGVvPC9oMz5cbiAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+TXV0ZWQgYnkgZGVmYXVsdCDCtyBUYXAgdG8gcGxheTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInZpZGVvLWZyYW1lXCIgaWQ9XCJwZHAtdmlkZW8tY29udGFpbmVyXCIgZGF0YS12aWRlby11cmw9XCIke2VzY0h0bWwodmlkZW9VcmwpfVwiIGRhdGEtdmlkZW8tcG9zdGVyPVwiJHtlc2NIdG1sKHBvc3Rlcil9XCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidmlkZW8tcG9zdGVyLWJ0blwiIGRhdGEtYWN0aW9uPVwicGxheS1wcm9kdWN0LXZpZGVvXCIgYXJpYS1sYWJlbD1cIlBsYXkgcHJvZHVjdCBkZW1vIHZpZGVvXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke2VzY0h0bWwocG9zdGVyKX1cIiBhbHQ9XCIke2VzY0h0bWwocHJvZHVjdC5uYW1lKX0gdmlkZW8gcHJldmlld1wiIGxvYWRpbmc9XCJsYXp5XCIgZGVjb2Rpbmc9XCJhc3luY1wiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2aWRlby1wbGF5LWNpcmNsZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPuKWtjwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRydXN0U3RyaXAoKSB7XG4gIHJldHVybiBgXG4gICAgPHNlY3Rpb24gY2xhc3M9XCJ0cnVzdC1zdHJpcFwiIGFyaWEtbGFiZWw9XCJTdG9yZWZyb250IGd1YXJhbnRlZXMgYW5kIHBheW1lbnQgbWV0aG9kc1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInRydXN0LWl0ZW1zXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1pdGVtXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVzdC1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+8J+Ukjwvc3Bhbj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRydXN0LXRpdGxlXCI+U2VjdXJlIFBheW1lbnQ8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1zdWJcIj5WZXJpZmllZCAmIHNhZmUgY2hlY2tvdXQ8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1pdGVtXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVzdC1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+8J+amjwvc3Bhbj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRydXN0LXRpdGxlXCI+RmFzdCBEZWxpdmVyeTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRydXN0LXN1YlwiPjI0LTQ4aCBEaGFrYSDCtyA2NCBEaXN0cmljdHM8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1pdGVtXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVzdC1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+4oap77iPPC9zcGFuPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHJ1c3QtdGl0bGVcIj5FYXN5IFJldHVybnM8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1zdWJcIj43LWRheSByZXBsYWNlbWVudCBndWFyYW50ZWU8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0cnVzdC1pdGVtXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0cnVzdC1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+8J+SrDwvc3Bhbj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRydXN0LXRpdGxlXCI+MjQvNyBTdXBwb3J0PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHJ1c3Qtc3ViXCI+V2hhdHNBcHAgJiBwaG9uZSBoZWxwPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwicGF5bWVudC1iYWRnZXNcIiBhcmlhLWxhYmVsPVwiQWNjZXB0ZWQgcGF5bWVudCBtZXRob2RzIGluIEJhbmdsYWRlc2hcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJwYXktbWFya1wiIHN0eWxlPVwiY29sb3I6I0UyMTM2RTtcIj7il48gYkthc2g8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGF5LW1hcmtcIiBzdHlsZT1cImNvbG9yOiNGNjkyMUU7XCI+4pePIE5hZ2FkPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInBheS1tYXJrXCIgc3R5bGU9XCJjb2xvcjojOEMzNDk0O1wiPuKXjyBSb2NrZXQ8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGF5LW1hcmtcIiBzdHlsZT1cImNvbG9yOiMwRjc2NkU7XCI+8J+StSBDYXNoIG9uIERlbGl2ZXJ5PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICBgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRGJDb25uZWN0aW9uQWxlcnQoKSB7XG4gIGlmIChzdGF0ZS5kYlN0YXR1cyAhPT0gJ2Vycm9yJykgcmV0dXJuICcnO1xuICBjb25zdCBkZXRhaWwgPSBzdGF0ZS5kYkVycm9yIHx8ICdDb25uZWN0aW9uIHRvIEZpcmViYXNlIENsb3VkIEZpcmVzdG9yZSBmYWlsZWQuIFNob3dpbmcgY2FjaGVkIGNhdGFsb2cgZGF0YS4nO1xuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJkYi1hbGVydC1iYW5uZXJcIiByb2xlPVwiYWxlcnRcIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJkYi1hbGVydC1iYW5uZXJfX2JvZHlcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJkYi1hbGVydC1iYW5uZXJfX2ljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj7imqDvuI88L3NwYW4+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRiLWFsZXJ0LWJhbm5lcl9fdGl0bGVcIj5VbmFibGUgdG8gcmVhY2ggdGhlIEZpcmViYXNlIGRhdGFiYXNlIChwYXphcm8tYmQpPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRiLWFsZXJ0LWJhbm5lcl9fbXNnXCI+JHtlc2NIdG1sKGRldGFpbCl9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cInJldHJ5LWRiLWNvbm5lY3Rpb25cIj5cbiAgICAgICAgUmV0cnkgQ29ubmVjdGlvblxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbiJdfQ==