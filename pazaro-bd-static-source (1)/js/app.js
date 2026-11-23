// Pazaro BD — Application Entry, Router & Interactive Controllers (Pure Vanilla JS)
import { state, subscribeState, initRealtimeSync, applyThemeVariables, addToCart, updateCartQty, removeFromCart, toggleWishlist, recordRecentlyViewed, placeOrder, trackOrders, submitCustomerReview, reportBlogIssue, markOrdersSeen, subscribeNewsletter, formatPrice, resolveCategoryRename, retryDatabaseConnection, refreshLocalOrdersStatus, onToast, showToast } from "/src/js/store.js";
import { renderHeader, renderFooter, renderHomeView, renderCatalogView, renderProductDetailView, renderCartDrawer, renderCheckoutView, renderTrackOrderView, renderBlogView, renderStaticInfoView, renderMaintenanceView, renderAccountView } from "/src/js/storefront.js";
import { renderAdSlot, parseEmbedVideo, escHtml, renderDbConnectionAlert } from "/src/js/ui-components.js";
import { getDistrictsByDivision } from "/src/js/bd-locations.js";
import { initCheckoutMap, destroyCheckoutMap, focusDistrictOnMap, locateCurrentPositionOnMap } from "/src/js/map-picker.js";
import { renderAdminView, adminUiState, handleAdminAction, handleAdminFormSubmit, handleAdminFileUpload, updateOrderStatus } from "/src/js/admin.js";
import { getCustomerSession, isCustomerAdmin, ensureDefaultAdminAccount, customerAuthUi, signInCustomer, signUpCustomer, signOutCustomer, updateCustomerProfile, changeCustomerPassword, resizeAvatarFileToDataUrl, renderAuthGateView } from "/src/js/customer-auth.js";
const ui = {
	route: "home",
	param: "",
	heroSlideIdx: 0,
	cartOpen: false,
	deliveryZone: "inside",
	searchQuery: "",
	catalogCategory: "All",
	catalogSort: "featured",
	pdpImgIdx: 0,
	pdpOption: "",
	pdpQty: 1,
	checkout: {
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
	},
	confirmedReceipt: null,
	trackQuery: "",
	trackResults: null,
	account: {
		tab: "overview",
		division: "",
		district: "",
		error: "",
		passError: ""
	}
};
const appEl = document.getElementById("app");
function parseRoute() {
	const path = window.location.pathname;
	const hash = window.location.hash.replace(/^#/, "");
	if (path === "/admin" || path.startsWith("/admin/") || hash === "admin" || hash.startsWith("admin/")) {
		ui.route = "admin";
		ui.param = "";
		return;
	}
	const clean = hash || "home";
	const [seg, ...rest] = clean.split("/");
	const tail = decodeURIComponent(rest.join("/"));
	switch (seg) {
		case "product":
			ui.route = "product";
			if (ui.param !== tail) {
				ui.param = tail;
				ui.pdpImgIdx = 0;
				ui.pdpOption = "";
				ui.pdpQty = 1;
				recordRecentlyViewed(tail);
			}
			break;
		case "category":
			ui.route = "categories";
			ui.catalogCategory = tail || "All";
			break;
		case "categories":
			ui.route = "categories";
			ui.catalogCategory = "All";
			break;
		case "deals":
		case "new-arrivals":
		case "best-sellers":
		case "top-tech":
		case "wishlist":
		case "search":
			if (ui.route !== seg) {
				ui.catalogCategory = "All";
			}
			ui.route = seg;
			if (seg === "search" && tail) ui.searchQuery = tail;
			break;
		case "checkout": {
			const enteringCheckout = ui.route !== "checkout";
			ui.route = "checkout";
			if (enteringCheckout) {
				const session = getCustomerSession();
				if (session) {
					if (!ui.checkout.customerName && session.fullName) ui.checkout.customerName = session.fullName;
					if (!ui.checkout.phone && session.phone) ui.checkout.phone = session.phone;
					if (!ui.checkout.address && session.address) ui.checkout.address = session.address;
					if (session.division && !ui.checkout.mapLat) {
						ui.checkout.division = session.division;
						const dists = getDistrictsByDivision(session.division);
						ui.checkout.district = dists.includes(session.district) ? session.district : dists[0] || ui.checkout.district;
					}
					if (session.preferredPayment) {
						ui.checkout.paymentMethod = session.preferredPayment;
					}
				}
			}
			break;
		}
		case "account":
			ui.route = "account";
			if ([
				"overview",
				"cart",
				"orders",
				"settings"
			].includes(tail)) {
				ui.account.tab = tail;
			}
			refreshLocalOrdersStatus().then((updated) => {
				if (updated && ui.route === "account") render();
			});
			break;
		case "track-order":
			ui.route = "track-order";
			if (tail) {
				ui.trackQuery = tail;
				trackOrders(tail).then((res) => {
					ui.trackResults = res;
					render();
				});
			}
			break;
		case "blog":
			ui.route = "blog";
			ui.param = tail;
			break;
		case "help-center":
		case "returns-refunds":
		case "contact-us":
		case "about-us":
			ui.route = seg;
			break;
		default:
			ui.route = "home";
			ui.param = "";
	}
}
function updateSeoTitle() {
	const site = state.general?.siteName || "Pazaro BD";
	const tag = state.general?.tagline || "Your Bazaar, Smarter";
	let title = `${site} — ${tag}`;
	if (ui.route === "product") {
		const p = state.products.find((item) => item.id === ui.param);
		if (p) title = `${p.name} (${formatPrice(p.price)}) · ${site}`;
	} else if (ui.route === "admin") {
		title = `Admin Panel · ${site}`;
	} else if (ui.route === "blog") {
		title = `Blog · ${site}`;
	} else if (ui.route === "track-order") {
		title = `Track Order · ${site}`;
	} else if (ui.route === "checkout") {
		title = `Checkout · ${site}`;
	} else if (ui.route === "account") {
		title = `My Account & Settings · ${site}`;
	}
	document.title = title;
}
let heroAutoTimer = null;
let heroSuppressClickUntil = 0;
function clearHeroAutoTimer() {
	if (heroAutoTimer) {
		clearInterval(heroAutoTimer);
		heroAutoTimer = null;
	}
}
function goToHeroSlide(targetIdx) {
	const slider = document.getElementById("hero-slider");
	const track = document.getElementById("hero-track");
	const slides = state.theme?.heroSlides || [];
	const count = slides.length;
	if (!count) return;
	const nextIdx = (targetIdx % count + count) % count;
	ui.heroSlideIdx = nextIdx;
	if (!slider || !track) {
		render();
		return;
	}
	slider.dataset.activeIndex = String(nextIdx);
	track.style.transition = "";
	track.style.transform = `translate3d(-${nextIdx * 100}%, 0, 0)`;
	const slideEls = slider.querySelectorAll(".hero-slide");
	slideEls.forEach((sEl, idx) => {
		const isNow = idx === nextIdx;
		sEl.classList.toggle("active", isNow);
		sEl.classList.toggle("is-active", isNow);
	});
	slider.querySelectorAll(".hero-dot").forEach((dot, idx) => {
		dot.classList.toggle("active", idx === nextIdx);
	});
	const counter = document.getElementById("hero-slide-counter");
	if (counter) {
		counter.textContent = `${String(nextIdx + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
	}
}
function render(force = false) {
	if (!appEl) return;
	clearHeroAutoTimer();
	updateSeoTitle();
	// Protected Unified Sign In Gate (allows /admin to show Firebase Email/Password Admin Login directly)
	const session = getCustomerSession();
	if (!session && !state.isAdmin && ui.route !== "admin") {
		destroyCheckoutMap();
		const activeInput = document.activeElement?.closest(".auth-gate-card input");
		if (activeInput && !force) return;
		document.title = `Sign In · ${state.general?.siteName || "Pazaro BD"}`;
		appEl.innerHTML = `${renderAuthGateView()}<div class="toast-container" id="toast-container"></div>`;
		return;
	}
	if (ui.route === "admin") {
		destroyCheckoutMap();
		if (adminUiState.tab === "orders" && state.newOrdersCount > 0) {
			markOrdersSeen();
		}
		appEl.innerHTML = `${renderAdminView()}<div class="toast-container" id="toast-container"></div>`;
		return;
	}
	if (state.general?.maintenanceMode && !state.isAdmin) {
		destroyCheckoutMap();
		appEl.innerHTML = `${renderHeader(ui.route, ui.searchQuery)}${renderMaintenanceView()}${renderFooter(ui.route)}<div class="toast-container" id="toast-container"></div>`;
		return;
	}
	if (!force && ui.route === "account" && document.activeElement?.closest(".account-page input, .account-page select, .account-page textarea")) {
		return;
	}
	if (ui.catalogCategory && ui.catalogCategory !== "All" && !state.categories.some((c) => c.name === ui.catalogCategory)) {
		const mappedCat = resolveCategoryRename(ui.catalogCategory);
		if (mappedCat && mappedCat !== ui.catalogCategory) {
			ui.catalogCategory = mappedCat;
		}
	}
	let bodyHtml = "";
	if (ui.route === "home") {
		bodyHtml = renderHomeView(ui.heroSlideIdx);
	} else if (ui.route === "categories") {
		bodyHtml = renderCatalogView({
			title: ui.catalogCategory === "All" ? "All Products" : ui.catalogCategory,
			categoryFilter: ui.catalogCategory,
			mode: "all",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "deals") {
		bodyHtml = renderCatalogView({
			title: "Flash Deals & Offers",
			categoryFilter: ui.catalogCategory,
			mode: "deals",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "new-arrivals") {
		bodyHtml = renderCatalogView({
			title: "New Arrivals",
			categoryFilter: ui.catalogCategory,
			mode: "new",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "best-sellers") {
		bodyHtml = renderCatalogView({
			title: "Best Sellers",
			categoryFilter: ui.catalogCategory,
			mode: "bestsellers",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "top-tech") {
		bodyHtml = renderCatalogView({
			title: "Top Tech Picks",
			categoryFilter: ui.catalogCategory,
			mode: "top-tech",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "wishlist") {
		bodyHtml = renderCatalogView({
			title: "Saved Wishlist",
			categoryFilter: "All",
			mode: "wishlist",
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "search") {
		bodyHtml = renderCatalogView({
			title: ui.searchQuery ? `Search: "${ui.searchQuery}"` : "Search Catalog",
			categoryFilter: ui.catalogCategory,
			mode: "all",
			searchQuery: ui.searchQuery,
			sortBy: ui.catalogSort
		});
	} else if (ui.route === "product") {
		bodyHtml = renderProductDetailView(ui.param, ui.pdpImgIdx, ui.pdpOption, ui.pdpQty);
	} else if (ui.route === "checkout") {
		bodyHtml = renderCheckoutView(ui.checkout, ui.confirmedReceipt);
	} else if (ui.route === "account") {
		bodyHtml = renderAccountView(ui.account);
	} else if (ui.route === "track-order") {
		bodyHtml = renderTrackOrderView(ui.trackQuery, ui.trackResults);
	} else if (ui.route === "blog") {
		bodyHtml = renderBlogView(ui.param || null);
	} else {
		bodyHtml = renderStaticInfoView(ui.route);
	}
	const leftRail = renderAdSlot("ad_side_left", "side-rail-ad" + (state.ads?.slots?.ad_side_left?.enabled ? " has-ad" : ""));
	const rightRail = renderAdSlot("ad_side_right", "side-rail-ad" + (state.ads?.slots?.ad_side_right?.enabled ? " has-ad" : ""));
	appEl.innerHTML = `
    ${renderHeader(ui.route, ui.searchQuery)}
    <div class="page-with-rails">
      ${leftRail}
      <div class="main-content-shell">
        <div class="container">${renderDbConnectionAlert()}</div>
        ${bodyHtml}
      </div>
      ${rightRail}
    </div>
    ${renderFooter(ui.route)}
    ${renderCartDrawer(ui.cartOpen, ui.deliveryZone)}
    <div class="toast-container" id="toast-container"></div>
  `;
	setupAfterRender();
}
function setupAfterRender() {
	// 1. Scroll Reveal IntersectionObserver
	const cards = document.querySelectorAll(".reveal-up");
	if ("IntersectionObserver" in window) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					io.unobserve(entry.target);
				}
			});
		}, { threshold: .06 });
		cards.forEach((c) => io.observe(c));
	} else {
		cards.forEach((c) => c.classList.add("is-visible"));
	}
	// 2. Desktop Mouse-Drag Scrolling + Arrow State Sync across top subnav, categories, and product rows
	document.querySelectorAll(".subnav-scroll, .cat-scroller, .product-scroller").forEach((scroller) => {
		const wrap = scroller.closest(".scroller-wrap");
		const prevBtn = wrap ? wrap.querySelector("[data-scroll-target][data-dir=\"-1\"]") : null;
		const nextBtn = wrap ? wrap.querySelector("[data-scroll-target][data-dir=\"1\"]") : null;
		const updateArrowState = () => {
			if (!wrap) return;
			const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
			const hasOverflow = maxScroll > 4;
			wrap.classList.toggle("is-overflowing", hasOverflow);
			if (prevBtn instanceof HTMLButtonElement) {
				prevBtn.disabled = !hasOverflow || scroller.scrollLeft <= 2;
			}
			if (nextBtn instanceof HTMLButtonElement) {
				nextBtn.disabled = !hasOverflow || scroller.scrollLeft >= maxScroll - 2;
			}
		};
		let isDown = false;
		let startX = 0;
		let startScrollLeft = 0;
		let hasDragged = false;
		let suppressClickUntil = 0;
		scroller.addEventListener("dragstart", (e) => {
			e.preventDefault();
		});
		scroller.addEventListener("click", (e) => {
			if (Date.now() < suppressClickUntil) {
				e.preventDefault();
				e.stopPropagation();
			}
		}, true);
		scroller.addEventListener("mousedown", (e) => {
			if (e.button !== 0) return;
			if (e.target.closest("input, select, textarea, .scroller-arrow, .subnav-arrow")) return;
			isDown = true;
			hasDragged = false;
			startX = e.clientX;
			startScrollLeft = scroller.scrollLeft;
		});
		const onMouseMove = (e) => {
			if (!isDown) return;
			const dx = e.clientX - startX;
			if (!hasDragged && Math.abs(dx) > 5) {
				hasDragged = true;
				scroller.classList.add("is-dragging");
				scroller.style.scrollBehavior = "auto";
				scroller.style.scrollSnapType = "none";
			}
			if (hasDragged) {
				e.preventDefault();
				scroller.scrollLeft = startScrollLeft - dx * 1.15;
			}
		};
		const onMouseUp = () => {
			if (!isDown) return;
			isDown = false;
			if (hasDragged) {
				suppressClickUntil = Date.now() + 200;
				scroller.classList.remove("is-dragging");
				scroller.style.scrollBehavior = "";
				scroller.style.scrollSnapType = "";
				updateArrowState();
			}
			hasDragged = false;
		};
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", updateArrowState, { passive: true });
		scroller.addEventListener("scroll", updateArrowState, { passive: true });
		const scrollerCleanup = new MutationObserver(() => {
			if (!document.body.contains(scroller)) {
				window.removeEventListener("mousemove", onMouseMove);
				window.removeEventListener("mouseup", onMouseUp);
				window.removeEventListener("resize", updateArrowState);
				scrollerCleanup.disconnect();
			}
		});
		scrollerCleanup.observe(appEl, {
			childList: true,
			subtree: true
		});
		requestAnimationFrame(updateArrowState);
	});
	// 3. Interactive Mouse Drag + Touch Swipe + Auto-play on Hero Slider
	const hero = document.getElementById("hero-slider");
	const heroTrack = document.getElementById("hero-track");
	if (hero && heroTrack) {
		const count = state.theme?.heroSlides?.length || 1;
		let isPointerDown = false;
		let isHovered = false;
		let startX = 0;
		let startY = 0;
		let dragOffset = 0;
		let axisLocked = "";
		const applyLiveDrag = (dx) => {
			const w = hero.clientWidth || 1;
			const pctBase = -(ui.heroSlideIdx % count) * 100;
			const pctDelta = dx / w * 100;
			heroTrack.style.transition = "none";
			heroTrack.style.transform = `translate3d(calc(${pctBase}% + ${pctDelta}%), 0, 0)`;
		};
		const finishDrag = (dx) => {
			if (!isPointerDown) return;
			isPointerDown = false;
			hero.classList.remove("is-dragging");
			const w = hero.clientWidth || 320;
			const threshold = Math.min(72, w * .14);
			if (Math.abs(dx) > 10) {
				heroSuppressClickUntil = Date.now() + 260;
			}
			if (count > 1 && Math.abs(dx) > threshold) {
				goToHeroSlide(ui.heroSlideIdx + (dx < 0 ? 1 : -1));
			} else {
				goToHeroSlide(ui.heroSlideIdx);
			}
			dragOffset = 0;
			axisLocked = "";
		};
		// Mouse drag support (left-click & drag anywhere on slide except buttons/controls)
		hero.addEventListener("mousedown", (e) => {
			if (e.button !== 0 || count <= 1) return;
			if (e.target.closest(".hero-nav-btn, .hero-dot, button, input, select")) return;
			isPointerDown = true;
			startX = e.clientX;
			startY = e.clientY;
			dragOffset = 0;
			axisLocked = "x";
			hero.classList.add("is-dragging");
		});
		const onMouseMove = (e) => {
			if (!isPointerDown) return;
			dragOffset = e.clientX - startX;
			if (Math.abs(dragOffset) > 4) {
				e.preventDefault();
				applyLiveDrag(dragOffset);
			}
		};
		const onMouseUp = () => {
			if (isPointerDown) finishDrag(dragOffset);
		};
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		// Touch swipe support (horizontal swipe moves track smoothly, vertical scroll passes through)
		hero.addEventListener("touchstart", (e) => {
			if (count <= 1 || !e.touches.length) return;
			if (e.target.closest(".hero-nav-btn, .hero-dot")) return;
			isPointerDown = true;
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			dragOffset = 0;
			axisLocked = "";
		}, { passive: true });
		hero.addEventListener("touchmove", (e) => {
			if (!isPointerDown || !e.touches.length) return;
			const dx = e.touches[0].clientX - startX;
			const dy = e.touches[0].clientY - startY;
			if (!axisLocked) {
				if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
					axisLocked = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
				}
			}
			if (axisLocked === "x") {
				dragOffset = dx;
				hero.classList.add("is-dragging");
				applyLiveDrag(dx);
			}
		}, { passive: true });
		hero.addEventListener("touchend", () => {
			if (axisLocked === "x") finishDrag(dragOffset);
			else {
				isPointerDown = false;
				axisLocked = "";
			}
		}, { passive: true });
		hero.addEventListener("touchcancel", () => {
			finishDrag(0);
		}, { passive: true });
		hero.addEventListener("mouseenter", () => {
			isHovered = true;
		});
		hero.addEventListener("mouseleave", () => {
			isHovered = false;
		});
		// Clean up global window listeners when hero node leaves DOM on next route/render
		const cleanupObs = new MutationObserver(() => {
			if (!document.body.contains(hero)) {
				window.removeEventListener("mousemove", onMouseMove);
				window.removeEventListener("mouseup", onMouseUp);
				cleanupObs.disconnect();
			}
		});
		cleanupObs.observe(appEl, {
			childList: true,
			subtree: true
		});
		// Gentle auto-advance every 6s when idle on Home
		if (count > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			heroAutoTimer = setInterval(() => {
				if (!document.body.contains(hero)) {
					clearHeroAutoTimer();
					return;
				}
				if (!isPointerDown && !isHovered && !document.hidden) {
					goToHeroSlide(ui.heroSlideIdx + 1);
				}
			}, 6e3);
		}
	}
	// 4. Interactive Checkout Map Picker lifecycle
	if (ui.route === "checkout" && state.cart.length && !ui.confirmedReceipt && state.general?.mapEnabled !== false) {
		const g = state.general || {};
		const hasPin = typeof ui.checkout.mapLat === "number" && typeof ui.checkout.mapLng === "number";
		initCheckoutMap({
			containerId: "checkout-map",
			lat: hasPin ? ui.checkout.mapLat : g.mapDefaultLat ?? 23.8103,
			lng: hasPin ? ui.checkout.mapLng : g.mapDefaultLng ?? 90.4125,
			zoom: hasPin ? 15 : g.mapDefaultZoom ?? 12,
			provider: g.mapProvider || "osm",
			hasExistingPin: hasPin,
			onLocationResolved: applyResolvedCheckoutLocation
		});
	} else {
		destroyCheckoutMap();
	}
}
function applyResolvedCheckoutLocation(resolved) {
	if (!resolved) return;
	ui.checkout.division = resolved.division || ui.checkout.division;
	ui.checkout.district = resolved.district || ui.checkout.district;
	const resolvedAddr = resolved.addressLine || resolved.detailedAddress || "";
	if (resolvedAddr) {
		ui.checkout.address = resolvedAddr;
	}
	if (typeof resolved.lat === "number" && typeof resolved.lng === "number") {
		ui.checkout.mapLat = resolved.lat;
		ui.checkout.mapLng = resolved.lng;
	}
	ui.checkout.mapStatus = `Auto-filled from map: ${ui.checkout.district}, ${ui.checkout.division}`;
	render(true);
	showToast(`Location set: ${ui.checkout.district}, ${ui.checkout.division}`);
}
// --- Global Event Delegation ---
document.addEventListener("click", async (e) => {
	if (Date.now() < heroSuppressClickUntil && e.target.closest("#hero-slider a")) {
		e.preventDefault();
		return;
	}
	const target = e.target.closest("[data-action], [data-scroll-target], #pdp-main-zoom, #back-to-top-btn");
	if (!target) {
		const sugBox = document.getElementById("search-suggestions");
		if (sugBox && !e.target.closest(".header-search-wrap")) {
			sugBox.hidden = true;
		}
		return;
	}
	if (target.id === "back-to-top-btn") {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
		return;
	}
	if (target.id === "pdp-main-zoom") {
		target.classList.toggle("zoomed");
		return;
	}
	if (target.dataset.scrollTarget) {
		const scroller = document.getElementById(target.dataset.scrollTarget);
		if (scroller) {
			const step = Math.max(220, Math.round(scroller.clientWidth * .75));
			scroller.scrollBy({
				left: Number(target.dataset.dir) * step,
				behavior: "smooth"
			});
		}
		return;
	}
	const action = target.dataset.action;
	if (!action) return;
	if (action === "retry-db-connection") {
		if (target instanceof HTMLButtonElement) {
			target.disabled = true;
			target.textContent = "Checking...";
		}
		await retryDatabaseConnection();
		render(true);
		return;
	}
	if (action === "auth-switch-mode") {
		customerAuthUi.mode = target.dataset.mode === "signup" ? "signup" : "signin";
		customerAuthUi.error = "";
		customerAuthUi.showPassword = false;
		customerAuthUi.showConfirmPassword = false;
		render(true);
		return;
	}
	if (action === "auth-toggle-pass" || action === "auth-toggle-confirm") {
		const targetId = target.dataset.target;
		const input = targetId ? document.getElementById(targetId) : null;
		if (input && input instanceof HTMLInputElement) {
			const nextVisible = input.type === "password";
			input.type = nextVisible ? "text" : "password";
			target.textContent = nextVisible ? "Hide" : "Show";
			target.setAttribute("aria-label", nextVisible ? "Hide password" : "Show password");
			if (action === "auth-toggle-pass") {
				customerAuthUi.showPassword = nextVisible;
			} else {
				customerAuthUi.showConfirmPassword = nextVisible;
			}
			input.focus();
		}
		return;
	}
	if (action === "open-account") {
		e.preventDefault();
		ui.cartOpen = false;
		if (window.location.pathname === "/admin") {
			window.history.pushState({}, "", "/#account");
			parseRoute();
			render(true);
		} else {
			window.location.hash = "account";
		}
		window.scrollTo(0, 0);
		return;
	}
	if (action === "account-tab") {
		ui.account.tab = target.dataset.tab || "overview";
		ui.account.error = "";
		ui.account.passError = "";
		render(true);
		return;
	}
	if (action === "account-remove-avatar") {
		try {
			await updateCustomerProfile({ avatarUrl: "" });
			render(true);
		} catch (err) {
			showToast(err.message || "Could not remove profile photo.", true);
		}
		return;
	}
	if (action === "customer-logout") {
		ui.cartOpen = false;
		signOutCustomer();
		if (window.location.pathname === "/admin") {
			window.history.pushState({}, "", "/");
		}
		window.location.hash = "home";
		parseRoute();
		render(true);
		window.scrollTo(0, 0);
		return;
	}
	if (action === "go-admin" || action === "nav-account") {
		e.preventDefault();
		const session = getCustomerSession();
		if (session && !isCustomerAdmin(session) && !state.isAdmin) {
			showToast("Admin access is restricted to administrator accounts.", true);
			return;
		}
		window.history.pushState({}, "", "/admin");
		parseRoute();
		render(true);
		window.scrollTo(0, 0);
		return;
	}
	if (action === "storefront-edit-category") {
		e.preventDefault();
		const session = getCustomerSession();
		if (session && !isCustomerAdmin(session) && !state.isAdmin) {
			showToast("Admin access is restricted to administrator accounts.", true);
			return;
		}
		const preferredName = target.dataset.category || ui.catalogCategory || "";
		const match = preferredName && preferredName !== "All" && state.categories.find((c) => c.name === preferredName) || state.categories[0];
		adminUiState.tab = "products";
		adminUiState.prodCatFilter = preferredName && preferredName !== "All" ? preferredName : "All";
		adminUiState.quickEditCategoryId = match ? match.id : "";
		window.history.pushState({}, "", "/admin");
		parseRoute();
		render(true);
		window.scrollTo(0, 0);
		return;
	}
	if (action === "nav-wishlist") {
		window.location.hash = "wishlist";
		return;
	}
	if (action === "open-cart") {
		ui.cartOpen = true;
		render();
		return;
	}
	if (action === "close-cart") {
		ui.cartOpen = false;
		render();
		return;
	}
	if (action === "go-checkout") {
		ui.cartOpen = false;
		ui.confirmedReceipt = null;
		window.location.hash = "checkout";
		return;
	}
	if (action === "open-category") {
		window.location.hash = `category/${encodeURIComponent(target.dataset.category)}`;
		return;
	}
	if (action === "open-product") {
		window.location.hash = `product/${encodeURIComponent(target.dataset.id)}`;
		window.scrollTo(0, 0);
		return;
	}
	if (action === "open-post") {
		window.location.hash = `blog/${encodeURIComponent(target.dataset.id)}`;
		window.scrollTo(0, 0);
		return;
	}
	if (action === "report-blog-issue") {
		reportBlogIssue(target.dataset.id);
		return;
	}
	if (action === "co-use-location") {
		locateCurrentPositionOnMap((msg, isErr) => {
			ui.checkout.mapStatus = msg;
			const stEl = document.getElementById("co-map-status");
			if (stEl) stEl.textContent = msg;
			if (isErr) showToast(msg, true);
		}, (resolved) => applyResolvedCheckoutLocation(resolved));
		return;
	}
	if (action === "add-cart") {
		addToCart(target.dataset.id, 1);
		return;
	}
	if (action === "order-now") {
		if (addToCart(target.dataset.id, 1)) {
			ui.cartOpen = false;
			ui.confirmedReceipt = null;
			window.location.hash = "checkout";
			window.scrollTo(0, 0);
		}
		return;
	}
	if (action === "toggle-wish") {
		toggleWishlist(target.dataset.id);
		return;
	}
	if (action === "cart-qty") {
		updateCartQty(Number(target.dataset.index), Number(target.dataset.delta));
		return;
	}
	if (action === "cart-remove") {
		removeFromCart(Number(target.dataset.index));
		return;
	}
	if (action === "hero-prev" || action === "hero-next") {
		goToHeroSlide(ui.heroSlideIdx + (action === "hero-next" ? 1 : -1));
		return;
	}
	if (action === "hero-dot") {
		goToHeroSlide(Number(target.dataset.index) || 0);
		return;
	}
	if (action === "pdp-thumb") {
		ui.pdpImgIdx = Number(target.dataset.index) || 0;
		render();
		return;
	}
	if (action === "pdp-option") {
		ui.pdpOption = target.dataset.option;
		render();
		return;
	}
	if (action === "pdp-qty") {
		const prod = state.products.find((p) => p.id === ui.param);
		const maxQ = prod ? Math.max(1, prod.stock || 1) : 99;
		ui.pdpQty = Math.max(1, Math.min(maxQ, ui.pdpQty + Number(target.dataset.delta)));
		render();
		return;
	}
	if (action === "pdp-add-cart") {
		addToCart(target.dataset.id, ui.pdpQty, ui.pdpOption);
		return;
	}
	if (action === "pdp-buy-now") {
		if (addToCart(target.dataset.id, ui.pdpQty, ui.pdpOption)) {
			ui.confirmedReceipt = null;
			window.location.hash = "checkout";
		}
		return;
	}
	if (action === "share-product") {
		const shareUrl = window.location.href;
		if (navigator.share) {
			navigator.share({
				title: target.dataset.name,
				url: shareUrl
			}).catch(() => {});
		} else if (navigator.clipboard) {
			navigator.clipboard.writeText(shareUrl).then(() => showToast("Product link copied!"));
		}
		return;
	}
	if (action === "play-product-video") {
		const box = document.getElementById("pdp-video-container");
		if (!box) return;
		const parsed = parseEmbedVideo(box.dataset.videoUrl);
		if (!parsed) return;
		if (parsed.type === "iframe") {
			box.innerHTML = `<iframe src="${escHtml(parsed.src)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Product Demo Video"></iframe>`;
		} else {
			box.innerHTML = `<video src="${escHtml(parsed.src)}" poster="${escHtml(box.dataset.videoPoster || "")}" controls autoplay muted playsinline></video>`;
		}
		return;
	}
	// Admin actions
	if (ui.route === "admin") {
		const needsRender = await handleAdminAction(action, target);
		if (needsRender) render();
	}
});
// Live search suggestions + inputs
document.addEventListener("input", (e) => {
	const el = e.target;
	if (el.id === "auth-fullname") {
		customerAuthUi.nameDraft = el.value;
		return;
	}
	if (el.id === "auth-signin-identifier" || el.id === "auth-signup-email") {
		customerAuthUi.emailDraft = el.value;
		return;
	}
	if (el.id === "auth-signin-pass" || el.id === "auth-signup-pass") {
		customerAuthUi.passwordDraft = el.value;
		return;
	}
	if (el.id === "auth-signup-confirm") {
		customerAuthUi.confirmPasswordDraft = el.value;
		return;
	}
	if (el.id === "global-search-input") {
		const q = el.value.trim().toLowerCase();
		const sugBox = document.getElementById("search-suggestions");
		if (!sugBox) return;
		if (!q) {
			sugBox.hidden = true;
			return;
		}
		const matches = state.products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q))).slice(0, 6);
		sugBox.hidden = false;
		sugBox.innerHTML = matches.length ? matches.map((p) => `
          <div class="search-suggestion-item" data-action="open-product" data-id="${escHtml(p.id)}">
            <img src="${escHtml(p.images?.[0] || "")}" alt="" onerror="this.style.display='none'" />
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(p.name)}</div>
              <div style="font-size:0.78rem;color:var(--muted);">${escHtml(p.category)} · ${formatPrice(p.price)}</div>
            </div>
          </div>
        `).join("") : `<div style="padding:12px 14px;font-size:0.86rem;color:var(--muted);">No products matching "${escHtml(q)}"</div>`;
	}
	if (el.id === "co-name") {
		ui.checkout.customerName = el.value;
		return;
	}
	if (el.id === "co-phone") {
		ui.checkout.phone = el.value;
		return;
	}
	if (el.id === "co-address") {
		ui.checkout.address = el.value;
		return;
	}
	if (el.id === "co-pay-num") {
		ui.checkout.paymentNumber = el.value;
		return;
	}
	if (el.id === "co-notes") {
		ui.checkout.notes = el.value;
		return;
	}
	if (el.id === "admin-prod-search") {
		adminUiState.prodSearch = el.value;
		render();
		const restored = document.getElementById("admin-prod-search");
		if (restored) {
			restored.focus();
			restored.setSelectionRange(restored.value.length, restored.value.length);
		}
	}
});
document.addEventListener("change", async (e) => {
	const el = e.target;
	if (el.id === "catalog-cat-select") {
		ui.catalogCategory = el.value;
		render();
	} else if (el.id === "catalog-sort-select") {
		ui.catalogSort = el.value;
		render();
	} else if (el.id === "drawer-zone-select") {
		ui.deliveryZone = el.value;
		render();
	} else if (el.id === "co-division") {
		ui.checkout.division = el.value;
		const dists = getDistrictsByDivision(ui.checkout.division);
		ui.checkout.district = dists[0] || "";
		ui.checkout.mapLat = null;
		ui.checkout.mapLng = null;
		ui.checkout.mapStatus = "";
		render(true);
		focusDistrictOnMap(ui.checkout.division, ui.checkout.district);
	} else if (el.id === "co-district") {
		ui.checkout.district = el.value;
		ui.checkout.mapLat = null;
		ui.checkout.mapLng = null;
		ui.checkout.mapStatus = "";
		render(true);
		focusDistrictOnMap(ui.checkout.division, ui.checkout.district);
	} else if (el.id === "co-payment") {
		ui.checkout.paymentMethod = el.value;
		const trx = document.getElementById("co-trx-wrap");
		if (trx) trx.hidden = el.value === "Cash on Delivery";
	} else if (el.id === "account-avatar-input") {
		const file = el.files?.[0];
		if (!file) return;
		try {
			const dataUrl = await resizeAvatarFileToDataUrl(file, 240);
			await updateCustomerProfile({ avatarUrl: dataUrl });
			el.value = "";
			render(true);
		} catch (err) {
			showToast(err.message || "Could not upload profile photo.", true);
			el.value = "";
		}
	} else if (el.id === "acc-division") {
		ui.account.division = el.value;
		const dists = getDistrictsByDivision(el.value);
		ui.account.district = dists[0] || "";
		const distSelect = document.getElementById("acc-district");
		if (distSelect) {
			distSelect.innerHTML = dists.map((d) => `<option value="${escHtml(d)}">${escHtml(d)}</option>`).join("");
		}
	} else if (el.id === "acc-district") {
		ui.account.district = el.value;
	} else if (el.id === "admin-prod-cat") {
		adminUiState.prodCatFilter = el.value;
		render();
	} else if (el.id === "quick-edit-cat-select") {
		adminUiState.quickEditCategoryId = el.value;
		render(true);
	} else if (el.classList.contains("order-status-select")) {
		await updateOrderStatus(el.dataset.id, el.value);
	} else if (el.dataset.uploadTarget) {
		await handleAdminFileUpload(el);
	}
});
document.addEventListener("submit", async (e) => {
	const form = e.target;
	e.preventDefault();
	if (form.id === "customer-signin-form") {
		const identifier = form.querySelector("#auth-signin-identifier")?.value || "";
		const password = form.querySelector("#auth-signin-pass")?.value || "";
		customerAuthUi.emailDraft = identifier;
		customerAuthUi.busy = true;
		customerAuthUi.error = "";
		render(true);
		try {
			await signInCustomer({
				identifier,
				password
			});
			customerAuthUi.busy = false;
			customerAuthUi.emailDraft = "";
			render(true);
			window.scrollTo(0, 0);
		} catch (err) {
			customerAuthUi.busy = false;
			customerAuthUi.error = err.message || "Sign in failed. Please try again.";
			render(true);
		}
		return;
	}
	if (form.id === "customer-signup-form") {
		const fullName = form.querySelector("#auth-fullname")?.value || "";
		const email = form.querySelector("#auth-signup-email")?.value || "";
		const password = form.querySelector("#auth-signup-pass")?.value || "";
		const confirmPassword = form.querySelector("#auth-signup-confirm")?.value || "";
		customerAuthUi.nameDraft = fullName;
		customerAuthUi.emailDraft = email;
		customerAuthUi.busy = true;
		customerAuthUi.error = "";
		render(true);
		try {
			await signUpCustomer({
				fullName,
				email,
				password,
				confirmPassword
			});
			customerAuthUi.busy = false;
			customerAuthUi.nameDraft = "";
			customerAuthUi.emailDraft = "";
			render(true);
			window.scrollTo(0, 0);
		} catch (err) {
			customerAuthUi.busy = false;
			customerAuthUi.error = err.message || "Registration failed. Please try again.";
			render(true);
		}
		return;
	}
	if (form.id === "account-profile-form") {
		try {
			ui.account.error = "";
			const updated = await updateCustomerProfile({
				fullName: form.querySelector("#acc-fullname")?.value || "",
				email: form.querySelector("#acc-email")?.value || "",
				phone: form.querySelector("#acc-phone")?.value || "",
				altPhone: form.querySelector("#acc-alt-phone")?.value || "",
				whatsappNumber: form.querySelector("#acc-whatsapp")?.value || "",
				preferredPayment: form.querySelector("#acc-payment")?.value || "Cash on Delivery",
				division: form.querySelector("#acc-division")?.value || "Dhaka",
				district: form.querySelector("#acc-district")?.value || "Dhaka",
				address: form.querySelector("#acc-address")?.value || "",
				notifyOrders: Boolean(form.querySelector("#acc-notify-orders")?.checked),
				notifyDeals: Boolean(form.querySelector("#acc-notify-deals")?.checked)
			});
			ui.account.division = updated.division;
			ui.account.district = updated.district;
			render(true);
		} catch (err) {
			ui.account.error = err.message || "Failed to save account settings.";
			showToast(ui.account.error, true);
			render(true);
		}
		return;
	}
	if (form.id === "account-password-form") {
		try {
			ui.account.passError = "";
			await changeCustomerPassword({
				currentPassword: form.querySelector("#acc-cur-pass")?.value || "",
				newPassword: form.querySelector("#acc-new-pass")?.value || "",
				confirmPassword: form.querySelector("#acc-conf-pass")?.value || ""
			});
			form.reset();
			render(true);
		} catch (err) {
			ui.account.passError = err.message || "Failed to update password.";
			showToast(ui.account.passError, true);
			render(true);
		}
		return;
	}
	if (form.id === "global-search-form") {
		const q = document.getElementById("global-search-input")?.value.trim() || "";
		ui.searchQuery = q;
		window.location.hash = `search/${encodeURIComponent(q)}`;
		return;
	}
	if (form.id === "newsletter-form") {
		const email = form.querySelector("#newsletter-email").value;
		try {
			await subscribeNewsletter(email);
			form.reset();
		} catch (err) {
			showToast(err.message, true);
		}
		return;
	}
	if (form.id === "pdp-review-form") {
		try {
			await submitCustomerReview({
				productId: form.dataset.productId,
				productName: form.dataset.productName,
				authorName: form.querySelector("#rev-author").value,
				city: form.querySelector("#rev-city").value,
				rating: form.querySelector("#rev-rating").value,
				comment: form.querySelector("#rev-comment").value
			});
			form.reset();
		} catch (err) {
			showToast(err.message || "Could not submit review.", true);
		}
		return;
	}
	if (form.id === "checkout-form") {
		const btn = document.getElementById("co-submit-btn");
		if (btn) btn.disabled = true;
		try {
			const receipt = await placeOrder({
				customerName: form.querySelector("#co-name").value,
				phone: form.querySelector("#co-phone").value,
				division: form.querySelector("#co-division").value,
				district: form.querySelector("#co-district").value,
				upazila: "",
				address: form.querySelector("#co-address").value,
				mapLat: ui.checkout.mapLat,
				mapLng: ui.checkout.mapLng,
				paymentMethod: form.querySelector("#co-payment").value,
				paymentNumber: form.querySelector("#co-pay-num")?.value || "",
				notes: form.querySelector("#co-notes").value
			});
			ui.confirmedReceipt = receipt;
			ui.checkout.mapLat = null;
			ui.checkout.mapLng = null;
			ui.checkout.mapStatus = "";
			ui.checkout.notes = "";
			render();
			window.scrollTo(0, 0);
		} catch (err) {
			showToast(err.message || "Failed to place order.", true);
			if (btn) btn.disabled = false;
		}
		return;
	}
	if (form.id === "track-order-form") {
		const q = form.querySelector("#track-query-input").value.trim();
		ui.trackQuery = q;
		ui.trackResults = await trackOrders(q);
		render();
		return;
	}
	if (ui.route === "admin") {
		const rerender = await handleAdminFormSubmit(form);
		if (rerender) render();
	}
});
// Toast renderer
onToast(({ message, isError }) => {
	const container = document.getElementById("toast-container");
	if (!container) return;
	const el = document.createElement("div");
	el.className = `toast ${isError ? "error" : ""}`;
	el.textContent = message;
	container.appendChild(el);
	setTimeout(() => el.remove(), 3400);
});
// Auto-slide Hero & Flash Sale Countdown & Back-to-top
setInterval(() => {
	if (ui.route === "home") {
		const count = state.theme?.heroSlides?.length || 1;
		if (count > 1) {
			ui.heroSlideIdx = (ui.heroSlideIdx + 1) % count;
			document.querySelectorAll(".hero-slide").forEach((s, idx) => {
				s.classList.toggle("active", idx === ui.heroSlideIdx);
			});
			document.querySelectorAll(".hero-dot").forEach((d, idx) => {
				d.classList.toggle("active", idx === ui.heroSlideIdx);
			});
		}
	}
}, 5500);
// Flash Sale live countdown (resets smoothly every 12 hours UTC+6)
setInterval(() => {
	const hrsEl = document.getElementById("fs-hrs");
	const minEl = document.getElementById("fs-min");
	const secEl = document.getElementById("fs-sec");
	if (!hrsEl || !minEl || !secEl) return;
	const cycle = 12 * 3600;
	const rem = cycle - Math.floor(Date.now() / 1e3) % cycle;
	const h = String(Math.floor(rem / 3600)).padStart(2, "0");
	const m = String(Math.floor(rem % 3600 / 60)).padStart(2, "0");
	const s = String(rem % 60).padStart(2, "0");
	hrsEl.textContent = h;
	minEl.textContent = m;
	secEl.textContent = s;
}, 1e3);
window.addEventListener("scroll", () => {
	const btn = document.getElementById("back-to-top-btn");
	if (btn) btn.classList.toggle("show", window.scrollY > 380);
}, { passive: true });
window.addEventListener("hashchange", () => {
	if (window.location.pathname === "/admin" && window.location.hash && !window.location.hash.startsWith("#admin")) {
		window.history.pushState({}, "", "/" + window.location.hash);
	}
	const prevRoute = ui.route;
	const prevCat = ui.catalogCategory;
	parseRoute();
	render();
	if (ui.route !== prevRoute || ui.catalogCategory !== prevCat) {
		window.scrollTo(0, 0);
	}
});
window.addEventListener("popstate", () => {
	parseRoute();
	render();
});
// Boot Application
ensureDefaultAdminAccount();
applyThemeVariables();
parseRoute();
subscribeState(() => render());
initRealtimeSync();
render();

//# sourceMappingURL=data:application/json;base64,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QUFHLEdBQUc7Q0FDeEQsTUFBTSxJQUFJLE9BQU8sS0FBSyxNQUFPLE1BQU0sT0FBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHO0NBQy9ELE1BQU0sSUFBSSxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUc7Q0FDMUMsTUFBTSxjQUFjO0NBQ3BCLE1BQU0sY0FBYztDQUNwQixNQUFNLGNBQWM7QUFDdEIsR0FBRyxHQUFJO0FBRVAsT0FBTyxpQkFBaUIsZ0JBQWdCO0NBQ3RDLE1BQU0sTUFBTSxTQUFTLGVBQWUsaUJBQWlCO0NBQ3JELElBQUksS0FBSyxJQUFJLFVBQVUsT0FBTyxRQUFRLE9BQU8sVUFBVSxHQUFHO0FBQzVELEdBQUcsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUVwQixPQUFPLGlCQUFpQixvQkFBb0I7Q0FDMUMsSUFBSSxPQUFPLFNBQVMsYUFBYSxZQUFZLE9BQU8sU0FBUyxRQUFRLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxRQUFRLEdBQUc7RUFDL0csT0FBTyxRQUFRLFVBQVUsQ0FBQyxHQUFHLElBQUksTUFBTSxPQUFPLFNBQVMsSUFBSTtDQUM3RDtDQUNBLE1BQU0sWUFBWSxHQUFHO0NBQ3JCLE1BQU0sVUFBVSxHQUFHO0NBQ25CLFdBQVc7Q0FDWCxPQUFPO0NBQ1AsSUFBSSxHQUFHLFVBQVUsYUFBYSxHQUFHLG9CQUFvQixTQUFTO0VBQzVELE9BQU8sU0FBUyxHQUFHLENBQUM7Q0FDdEI7QUFDRixDQUFDO0FBRUQsT0FBTyxpQkFBaUIsa0JBQWtCO0NBQ3hDLFdBQVc7Q0FDWCxPQUFPO0FBQ1QsQ0FBQzs7QUFHRCwwQkFBMEI7QUFDMUIsb0JBQW9CO0FBQ3BCLFdBQVc7QUFDWCxxQkFBcUIsT0FBTyxDQUFDO0FBQzdCLGlCQUFpQjtBQUNqQixPQUFPIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQYXphcm8gQkQg4oCUIEFwcGxpY2F0aW9uIEVudHJ5LCBSb3V0ZXIgJiBJbnRlcmFjdGl2ZSBDb250cm9sbGVycyAoUHVyZSBWYW5pbGxhIEpTKVxuaW1wb3J0IHtcbiAgc3RhdGUsXG4gIHN1YnNjcmliZVN0YXRlLFxuICBpbml0UmVhbHRpbWVTeW5jLFxuICBhcHBseVRoZW1lVmFyaWFibGVzLFxuICBhZGRUb0NhcnQsXG4gIHVwZGF0ZUNhcnRRdHksXG4gIHJlbW92ZUZyb21DYXJ0LFxuICB0b2dnbGVXaXNobGlzdCxcbiAgcmVjb3JkUmVjZW50bHlWaWV3ZWQsXG4gIHBsYWNlT3JkZXIsXG4gIHRyYWNrT3JkZXJzLFxuICBzdWJtaXRDdXN0b21lclJldmlldyxcbiAgcmVwb3J0QmxvZ0lzc3VlLFxuICBtYXJrT3JkZXJzU2VlbixcbiAgc3Vic2NyaWJlTmV3c2xldHRlcixcbiAgZm9ybWF0UHJpY2UsXG4gIHJlc29sdmVDYXRlZ29yeVJlbmFtZSxcbiAgcmV0cnlEYXRhYmFzZUNvbm5lY3Rpb24sXG4gIHJlZnJlc2hMb2NhbE9yZGVyc1N0YXR1cyxcbiAgb25Ub2FzdCxcbiAgc2hvd1RvYXN0XG59IGZyb20gJy4vc3RvcmUuanMnO1xuaW1wb3J0IHtcbiAgcmVuZGVySGVhZGVyLFxuICByZW5kZXJGb290ZXIsXG4gIHJlbmRlckhvbWVWaWV3LFxuICByZW5kZXJDYXRhbG9nVmlldyxcbiAgcmVuZGVyUHJvZHVjdERldGFpbFZpZXcsXG4gIHJlbmRlckNhcnREcmF3ZXIsXG4gIHJlbmRlckNoZWNrb3V0VmlldyxcbiAgcmVuZGVyVHJhY2tPcmRlclZpZXcsXG4gIHJlbmRlckJsb2dWaWV3LFxuICByZW5kZXJTdGF0aWNJbmZvVmlldyxcbiAgcmVuZGVyTWFpbnRlbmFuY2VWaWV3LFxuICByZW5kZXJBY2NvdW50Vmlld1xufSBmcm9tICcuL3N0b3JlZnJvbnQuanMnO1xuaW1wb3J0IHsgcmVuZGVyQWRTbG90LCBwYXJzZUVtYmVkVmlkZW8sIGVzY0h0bWwsIHJlbmRlckRiQ29ubmVjdGlvbkFsZXJ0IH0gZnJvbSAnLi91aS1jb21wb25lbnRzLmpzJztcbmltcG9ydCB7IGdldERpc3RyaWN0c0J5RGl2aXNpb24gfSBmcm9tICcuL2JkLWxvY2F0aW9ucy5qcyc7XG5pbXBvcnQge1xuICBpbml0Q2hlY2tvdXRNYXAsXG4gIGRlc3Ryb3lDaGVja291dE1hcCxcbiAgZm9jdXNEaXN0cmljdE9uTWFwLFxuICBsb2NhdGVDdXJyZW50UG9zaXRpb25Pbk1hcFxufSBmcm9tICcuL21hcC1waWNrZXIuanMnO1xuaW1wb3J0IHtcbiAgcmVuZGVyQWRtaW5WaWV3LFxuICBhZG1pblVpU3RhdGUsXG4gIGhhbmRsZUFkbWluQWN0aW9uLFxuICBoYW5kbGVBZG1pbkZvcm1TdWJtaXQsXG4gIGhhbmRsZUFkbWluRmlsZVVwbG9hZCxcbiAgdXBkYXRlT3JkZXJTdGF0dXNcbn0gZnJvbSAnLi9hZG1pbi5qcyc7XG5pbXBvcnQge1xuICBnZXRDdXN0b21lclNlc3Npb24sXG4gIGlzQ3VzdG9tZXJBZG1pbixcbiAgZW5zdXJlRGVmYXVsdEFkbWluQWNjb3VudCxcbiAgY3VzdG9tZXJBdXRoVWksXG4gIHNpZ25JbkN1c3RvbWVyLFxuICBzaWduVXBDdXN0b21lcixcbiAgc2lnbk91dEN1c3RvbWVyLFxuICB1cGRhdGVDdXN0b21lclByb2ZpbGUsXG4gIGNoYW5nZUN1c3RvbWVyUGFzc3dvcmQsXG4gIHJlc2l6ZUF2YXRhckZpbGVUb0RhdGFVcmwsXG4gIHJlbmRlckF1dGhHYXRlVmlld1xufSBmcm9tICcuL2N1c3RvbWVyLWF1dGguanMnO1xuXG5jb25zdCB1aSA9IHtcbiAgcm91dGU6ICdob21lJyxcbiAgcGFyYW06ICcnLFxuICBoZXJvU2xpZGVJZHg6IDAsXG4gIGNhcnRPcGVuOiBmYWxzZSxcbiAgZGVsaXZlcnlab25lOiAnaW5zaWRlJyxcbiAgc2VhcmNoUXVlcnk6ICcnLFxuICBjYXRhbG9nQ2F0ZWdvcnk6ICdBbGwnLFxuICBjYXRhbG9nU29ydDogJ2ZlYXR1cmVkJyxcbiAgcGRwSW1nSWR4OiAwLFxuICBwZHBPcHRpb246ICcnLFxuICBwZHBRdHk6IDEsXG4gIGNoZWNrb3V0OiB7XG4gICAgZGl2aXNpb246ICdEaGFrYScsXG4gICAgZGlzdHJpY3Q6ICdEaGFrYScsXG4gICAgY3VzdG9tZXJOYW1lOiAnJyxcbiAgICBwaG9uZTogJycsXG4gICAgYWRkcmVzczogJycsXG4gICAgcGF5bWVudE1ldGhvZDogJ0Nhc2ggb24gRGVsaXZlcnknLFxuICAgIHBheW1lbnROdW1iZXI6ICcnLFxuICAgIG5vdGVzOiAnJyxcbiAgICBtYXBMYXQ6IG51bGwsXG4gICAgbWFwTG5nOiBudWxsLFxuICAgIG1hcFN0YXR1czogJydcbiAgfSxcbiAgY29uZmlybWVkUmVjZWlwdDogbnVsbCxcbiAgdHJhY2tRdWVyeTogJycsXG4gIHRyYWNrUmVzdWx0czogbnVsbCxcbiAgYWNjb3VudDoge1xuICAgIHRhYjogJ292ZXJ2aWV3JyxcbiAgICBkaXZpc2lvbjogJycsXG4gICAgZGlzdHJpY3Q6ICcnLFxuICAgIGVycm9yOiAnJyxcbiAgICBwYXNzRXJyb3I6ICcnXG4gIH1cbn07XG5cbmNvbnN0IGFwcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpO1xuXG5mdW5jdGlvbiBwYXJzZVJvdXRlKCkge1xuICBjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMvLCAnJyk7XG5cbiAgaWYgKHBhdGggPT09ICcvYWRtaW4nIHx8IHBhdGguc3RhcnRzV2l0aCgnL2FkbWluLycpIHx8IGhhc2ggPT09ICdhZG1pbicgfHwgaGFzaC5zdGFydHNXaXRoKCdhZG1pbi8nKSkge1xuICAgIHVpLnJvdXRlID0gJ2FkbWluJztcbiAgICB1aS5wYXJhbSA9ICcnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGNsZWFuID0gaGFzaCB8fCAnaG9tZSc7XG4gIGNvbnN0IFtzZWcsIC4uLnJlc3RdID0gY2xlYW4uc3BsaXQoJy8nKTtcbiAgY29uc3QgdGFpbCA9IGRlY29kZVVSSUNvbXBvbmVudChyZXN0LmpvaW4oJy8nKSk7XG5cbiAgc3dpdGNoIChzZWcpIHtcbiAgICBjYXNlICdwcm9kdWN0JzpcbiAgICAgIHVpLnJvdXRlID0gJ3Byb2R1Y3QnO1xuICAgICAgaWYgKHVpLnBhcmFtICE9PSB0YWlsKSB7XG4gICAgICAgIHVpLnBhcmFtID0gdGFpbDtcbiAgICAgICAgdWkucGRwSW1nSWR4ID0gMDtcbiAgICAgICAgdWkucGRwT3B0aW9uID0gJyc7XG4gICAgICAgIHVpLnBkcFF0eSA9IDE7XG4gICAgICAgIHJlY29yZFJlY2VudGx5Vmlld2VkKHRhaWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2F0ZWdvcnknOlxuICAgICAgdWkucm91dGUgPSAnY2F0ZWdvcmllcyc7XG4gICAgICB1aS5jYXRhbG9nQ2F0ZWdvcnkgPSB0YWlsIHx8ICdBbGwnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2F0ZWdvcmllcyc6XG4gICAgICB1aS5yb3V0ZSA9ICdjYXRlZ29yaWVzJztcbiAgICAgIHVpLmNhdGFsb2dDYXRlZ29yeSA9ICdBbGwnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGVhbHMnOlxuICAgIGNhc2UgJ25ldy1hcnJpdmFscyc6XG4gICAgY2FzZSAnYmVzdC1zZWxsZXJzJzpcbiAgICBjYXNlICd0b3AtdGVjaCc6XG4gICAgY2FzZSAnd2lzaGxpc3QnOlxuICAgIGNhc2UgJ3NlYXJjaCc6XG4gICAgICBpZiAodWkucm91dGUgIT09IHNlZykge1xuICAgICAgICB1aS5jYXRhbG9nQ2F0ZWdvcnkgPSAnQWxsJztcbiAgICAgIH1cbiAgICAgIHVpLnJvdXRlID0gc2VnO1xuICAgICAgaWYgKHNlZyA9PT0gJ3NlYXJjaCcgJiYgdGFpbCkgdWkuc2VhcmNoUXVlcnkgPSB0YWlsO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2hlY2tvdXQnOiB7XG4gICAgICBjb25zdCBlbnRlcmluZ0NoZWNrb3V0ID0gdWkucm91dGUgIT09ICdjaGVja291dCc7XG4gICAgICB1aS5yb3V0ZSA9ICdjaGVja291dCc7XG4gICAgICBpZiAoZW50ZXJpbmdDaGVja291dCkge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gZ2V0Q3VzdG9tZXJTZXNzaW9uKCk7XG4gICAgICAgIGlmIChzZXNzaW9uKSB7XG4gICAgICAgICAgaWYgKCF1aS5jaGVja291dC5jdXN0b21lck5hbWUgJiYgc2Vzc2lvbi5mdWxsTmFtZSkgdWkuY2hlY2tvdXQuY3VzdG9tZXJOYW1lID0gc2Vzc2lvbi5mdWxsTmFtZTtcbiAgICAgICAgICBpZiAoIXVpLmNoZWNrb3V0LnBob25lICYmIHNlc3Npb24ucGhvbmUpIHVpLmNoZWNrb3V0LnBob25lID0gc2Vzc2lvbi5waG9uZTtcbiAgICAgICAgICBpZiAoIXVpLmNoZWNrb3V0LmFkZHJlc3MgJiYgc2Vzc2lvbi5hZGRyZXNzKSB1aS5jaGVja291dC5hZGRyZXNzID0gc2Vzc2lvbi5hZGRyZXNzO1xuICAgICAgICAgIGlmIChzZXNzaW9uLmRpdmlzaW9uICYmICF1aS5jaGVja291dC5tYXBMYXQpIHtcbiAgICAgICAgICAgIHVpLmNoZWNrb3V0LmRpdmlzaW9uID0gc2Vzc2lvbi5kaXZpc2lvbjtcbiAgICAgICAgICAgIGNvbnN0IGRpc3RzID0gZ2V0RGlzdHJpY3RzQnlEaXZpc2lvbihzZXNzaW9uLmRpdmlzaW9uKTtcbiAgICAgICAgICAgIHVpLmNoZWNrb3V0LmRpc3RyaWN0ID0gZGlzdHMuaW5jbHVkZXMoc2Vzc2lvbi5kaXN0cmljdClcbiAgICAgICAgICAgICAgPyBzZXNzaW9uLmRpc3RyaWN0XG4gICAgICAgICAgICAgIDogKGRpc3RzWzBdIHx8IHVpLmNoZWNrb3V0LmRpc3RyaWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNlc3Npb24ucHJlZmVycmVkUGF5bWVudCkge1xuICAgICAgICAgICAgdWkuY2hlY2tvdXQucGF5bWVudE1ldGhvZCA9IHNlc3Npb24ucHJlZmVycmVkUGF5bWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdhY2NvdW50JzpcbiAgICAgIHVpLnJvdXRlID0gJ2FjY291bnQnO1xuICAgICAgaWYgKFsnb3ZlcnZpZXcnLCAnY2FydCcsICdvcmRlcnMnLCAnc2V0dGluZ3MnXS5pbmNsdWRlcyh0YWlsKSkge1xuICAgICAgICB1aS5hY2NvdW50LnRhYiA9IHRhaWw7XG4gICAgICB9XG4gICAgICByZWZyZXNoTG9jYWxPcmRlcnNTdGF0dXMoKS50aGVuKCh1cGRhdGVkKSA9PiB7XG4gICAgICAgIGlmICh1cGRhdGVkICYmIHVpLnJvdXRlID09PSAnYWNjb3VudCcpIHJlbmRlcigpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0cmFjay1vcmRlcic6XG4gICAgICB1aS5yb3V0ZSA9ICd0cmFjay1vcmRlcic7XG4gICAgICBpZiAodGFpbCkge1xuICAgICAgICB1aS50cmFja1F1ZXJ5ID0gdGFpbDtcbiAgICAgICAgdHJhY2tPcmRlcnModGFpbCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgdWkudHJhY2tSZXN1bHRzID0gcmVzO1xuICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jsb2cnOlxuICAgICAgdWkucm91dGUgPSAnYmxvZyc7XG4gICAgICB1aS5wYXJhbSA9IHRhaWw7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdoZWxwLWNlbnRlcic6XG4gICAgY2FzZSAncmV0dXJucy1yZWZ1bmRzJzpcbiAgICBjYXNlICdjb250YWN0LXVzJzpcbiAgICBjYXNlICdhYm91dC11cyc6XG4gICAgICB1aS5yb3V0ZSA9IHNlZztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB1aS5yb3V0ZSA9ICdob21lJztcbiAgICAgIHVpLnBhcmFtID0gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlU2VvVGl0bGUoKSB7XG4gIGNvbnN0IHNpdGUgPSBzdGF0ZS5nZW5lcmFsPy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJztcbiAgY29uc3QgdGFnID0gc3RhdGUuZ2VuZXJhbD8udGFnbGluZSB8fCAnWW91ciBCYXphYXIsIFNtYXJ0ZXInO1xuICBsZXQgdGl0bGUgPSBgJHtzaXRlfSDigJQgJHt0YWd9YDtcbiAgaWYgKHVpLnJvdXRlID09PSAncHJvZHVjdCcpIHtcbiAgICBjb25zdCBwID0gc3RhdGUucHJvZHVjdHMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gdWkucGFyYW0pO1xuICAgIGlmIChwKSB0aXRsZSA9IGAke3AubmFtZX0gKCR7Zm9ybWF0UHJpY2UocC5wcmljZSl9KSDCtyAke3NpdGV9YDtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2FkbWluJykge1xuICAgIHRpdGxlID0gYEFkbWluIFBhbmVsIMK3ICR7c2l0ZX1gO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAnYmxvZycpIHtcbiAgICB0aXRsZSA9IGBCbG9nIMK3ICR7c2l0ZX1gO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAndHJhY2stb3JkZXInKSB7XG4gICAgdGl0bGUgPSBgVHJhY2sgT3JkZXIgwrcgJHtzaXRlfWA7XG4gIH0gZWxzZSBpZiAodWkucm91dGUgPT09ICdjaGVja291dCcpIHtcbiAgICB0aXRsZSA9IGBDaGVja291dCDCtyAke3NpdGV9YDtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2FjY291bnQnKSB7XG4gICAgdGl0bGUgPSBgTXkgQWNjb3VudCAmIFNldHRpbmdzIMK3ICR7c2l0ZX1gO1xuICB9XG4gIGRvY3VtZW50LnRpdGxlID0gdGl0bGU7XG59XG5cbmxldCBoZXJvQXV0b1RpbWVyID0gbnVsbDtcbmxldCBoZXJvU3VwcHJlc3NDbGlja1VudGlsID0gMDtcblxuZnVuY3Rpb24gY2xlYXJIZXJvQXV0b1RpbWVyKCkge1xuICBpZiAoaGVyb0F1dG9UaW1lcikge1xuICAgIGNsZWFySW50ZXJ2YWwoaGVyb0F1dG9UaW1lcik7XG4gICAgaGVyb0F1dG9UaW1lciA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ29Ub0hlcm9TbGlkZSh0YXJnZXRJZHgpIHtcbiAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlcm8tc2xpZGVyJyk7XG4gIGNvbnN0IHRyYWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlcm8tdHJhY2snKTtcbiAgY29uc3Qgc2xpZGVzID0gc3RhdGUudGhlbWU/Lmhlcm9TbGlkZXMgfHwgW107XG4gIGNvbnN0IGNvdW50ID0gc2xpZGVzLmxlbmd0aDtcbiAgaWYgKCFjb3VudCkgcmV0dXJuO1xuXG4gIGNvbnN0IG5leHRJZHggPSAoKHRhcmdldElkeCAlIGNvdW50KSArIGNvdW50KSAlIGNvdW50O1xuICB1aS5oZXJvU2xpZGVJZHggPSBuZXh0SWR4O1xuXG4gIGlmICghc2xpZGVyIHx8ICF0cmFjaykge1xuICAgIHJlbmRlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNsaWRlci5kYXRhc2V0LmFjdGl2ZUluZGV4ID0gU3RyaW5nKG5leHRJZHgpO1xuICB0cmFjay5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gIHRyYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgtJHtuZXh0SWR4ICogMTAwfSUsIDAsIDApYDtcblxuICBjb25zdCBzbGlkZUVscyA9IHNsaWRlci5xdWVyeVNlbGVjdG9yQWxsKCcuaGVyby1zbGlkZScpO1xuICBzbGlkZUVscy5mb3JFYWNoKChzRWwsIGlkeCkgPT4ge1xuICAgIGNvbnN0IGlzTm93ID0gaWR4ID09PSBuZXh0SWR4O1xuICAgIHNFbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBpc05vdyk7XG4gICAgc0VsLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScsIGlzTm93KTtcbiAgfSk7XG5cbiAgc2xpZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5oZXJvLWRvdCcpLmZvckVhY2goKGRvdCwgaWR4KSA9PiB7XG4gICAgZG90LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGlkeCA9PT0gbmV4dElkeCk7XG4gIH0pO1xuXG4gIGNvbnN0IGNvdW50ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVyby1zbGlkZS1jb3VudGVyJyk7XG4gIGlmIChjb3VudGVyKSB7XG4gICAgY291bnRlci50ZXh0Q29udGVudCA9IGAke1N0cmluZyhuZXh0SWR4ICsgMSkucGFkU3RhcnQoMiwgJzAnKX0gLyAke1N0cmluZyhjb3VudCkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcihmb3JjZSA9IGZhbHNlKSB7XG4gIGlmICghYXBwRWwpIHJldHVybjtcbiAgY2xlYXJIZXJvQXV0b1RpbWVyKCk7XG4gIHVwZGF0ZVNlb1RpdGxlKCk7XG5cbiAgLy8gUHJvdGVjdGVkIFVuaWZpZWQgU2lnbiBJbiBHYXRlIChhbGxvd3MgL2FkbWluIHRvIHNob3cgRmlyZWJhc2UgRW1haWwvUGFzc3dvcmQgQWRtaW4gTG9naW4gZGlyZWN0bHkpXG4gIGNvbnN0IHNlc3Npb24gPSBnZXRDdXN0b21lclNlc3Npb24oKTtcbiAgaWYgKCFzZXNzaW9uICYmICFzdGF0ZS5pc0FkbWluICYmIHVpLnJvdXRlICE9PSAnYWRtaW4nKSB7XG4gICAgZGVzdHJveUNoZWNrb3V0TWFwKCk7XG4gICAgY29uc3QgYWN0aXZlSW5wdXQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50Py5jbG9zZXN0KCcuYXV0aC1nYXRlLWNhcmQgaW5wdXQnKTtcbiAgICBpZiAoYWN0aXZlSW5wdXQgJiYgIWZvcmNlKSByZXR1cm47XG4gICAgZG9jdW1lbnQudGl0bGUgPSBgU2lnbiBJbiDCtyAke3N0YXRlLmdlbmVyYWw/LnNpdGVOYW1lIHx8ICdQYXphcm8gQkQnfWA7XG4gICAgYXBwRWwuaW5uZXJIVE1MID0gYCR7cmVuZGVyQXV0aEdhdGVWaWV3KCl9PGRpdiBjbGFzcz1cInRvYXN0LWNvbnRhaW5lclwiIGlkPVwidG9hc3QtY29udGFpbmVyXCI+PC9kaXY+YDtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodWkucm91dGUgPT09ICdhZG1pbicpIHtcbiAgICBkZXN0cm95Q2hlY2tvdXRNYXAoKTtcbiAgICBpZiAoYWRtaW5VaVN0YXRlLnRhYiA9PT0gJ29yZGVycycgJiYgc3RhdGUubmV3T3JkZXJzQ291bnQgPiAwKSB7XG4gICAgICBtYXJrT3JkZXJzU2VlbigpO1xuICAgIH1cbiAgICBhcHBFbC5pbm5lckhUTUwgPSBgJHtyZW5kZXJBZG1pblZpZXcoKX08ZGl2IGNsYXNzPVwidG9hc3QtY29udGFpbmVyXCIgaWQ9XCJ0b2FzdC1jb250YWluZXJcIj48L2Rpdj5gO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzdGF0ZS5nZW5lcmFsPy5tYWludGVuYW5jZU1vZGUgJiYgIXN0YXRlLmlzQWRtaW4pIHtcbiAgICBkZXN0cm95Q2hlY2tvdXRNYXAoKTtcbiAgICBhcHBFbC5pbm5lckhUTUwgPSBgJHtyZW5kZXJIZWFkZXIodWkucm91dGUsIHVpLnNlYXJjaFF1ZXJ5KX0ke3JlbmRlck1haW50ZW5hbmNlVmlldygpfSR7cmVuZGVyRm9vdGVyKHVpLnJvdXRlKX08ZGl2IGNsYXNzPVwidG9hc3QtY29udGFpbmVyXCIgaWQ9XCJ0b2FzdC1jb250YWluZXJcIj48L2Rpdj5gO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChcbiAgICAhZm9yY2UgJiZcbiAgICB1aS5yb3V0ZSA9PT0gJ2FjY291bnQnICYmXG4gICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudD8uY2xvc2VzdCgnLmFjY291bnQtcGFnZSBpbnB1dCwgLmFjY291bnQtcGFnZSBzZWxlY3QsIC5hY2NvdW50LXBhZ2UgdGV4dGFyZWEnKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodWkuY2F0YWxvZ0NhdGVnb3J5ICYmIHVpLmNhdGFsb2dDYXRlZ29yeSAhPT0gJ0FsbCcgJiYgIXN0YXRlLmNhdGVnb3JpZXMuc29tZSgoYykgPT4gYy5uYW1lID09PSB1aS5jYXRhbG9nQ2F0ZWdvcnkpKSB7XG4gICAgY29uc3QgbWFwcGVkQ2F0ID0gcmVzb2x2ZUNhdGVnb3J5UmVuYW1lKHVpLmNhdGFsb2dDYXRlZ29yeSk7XG4gICAgaWYgKG1hcHBlZENhdCAmJiBtYXBwZWRDYXQgIT09IHVpLmNhdGFsb2dDYXRlZ29yeSkge1xuICAgICAgdWkuY2F0YWxvZ0NhdGVnb3J5ID0gbWFwcGVkQ2F0O1xuICAgIH1cbiAgfVxuXG4gIGxldCBib2R5SHRtbCA9ICcnO1xuICBpZiAodWkucm91dGUgPT09ICdob21lJykge1xuICAgIGJvZHlIdG1sID0gcmVuZGVySG9tZVZpZXcodWkuaGVyb1NsaWRlSWR4KTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2NhdGVnb3JpZXMnKSB7XG4gICAgYm9keUh0bWwgPSByZW5kZXJDYXRhbG9nVmlldyh7XG4gICAgICB0aXRsZTogdWkuY2F0YWxvZ0NhdGVnb3J5ID09PSAnQWxsJyA/ICdBbGwgUHJvZHVjdHMnIDogdWkuY2F0YWxvZ0NhdGVnb3J5LFxuICAgICAgY2F0ZWdvcnlGaWx0ZXI6IHVpLmNhdGFsb2dDYXRlZ29yeSxcbiAgICAgIG1vZGU6ICdhbGwnLFxuICAgICAgc29ydEJ5OiB1aS5jYXRhbG9nU29ydFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAnZGVhbHMnKSB7XG4gICAgYm9keUh0bWwgPSByZW5kZXJDYXRhbG9nVmlldyh7IHRpdGxlOiAnRmxhc2ggRGVhbHMgJiBPZmZlcnMnLCBjYXRlZ29yeUZpbHRlcjogdWkuY2F0YWxvZ0NhdGVnb3J5LCBtb2RlOiAnZGVhbHMnLCBzb3J0Qnk6IHVpLmNhdGFsb2dTb3J0IH0pO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAnbmV3LWFycml2YWxzJykge1xuICAgIGJvZHlIdG1sID0gcmVuZGVyQ2F0YWxvZ1ZpZXcoeyB0aXRsZTogJ05ldyBBcnJpdmFscycsIGNhdGVnb3J5RmlsdGVyOiB1aS5jYXRhbG9nQ2F0ZWdvcnksIG1vZGU6ICduZXcnLCBzb3J0Qnk6IHVpLmNhdGFsb2dTb3J0IH0pO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAnYmVzdC1zZWxsZXJzJykge1xuICAgIGJvZHlIdG1sID0gcmVuZGVyQ2F0YWxvZ1ZpZXcoeyB0aXRsZTogJ0Jlc3QgU2VsbGVycycsIGNhdGVnb3J5RmlsdGVyOiB1aS5jYXRhbG9nQ2F0ZWdvcnksIG1vZGU6ICdiZXN0c2VsbGVycycsIHNvcnRCeTogdWkuY2F0YWxvZ1NvcnQgfSk7XG4gIH0gZWxzZSBpZiAodWkucm91dGUgPT09ICd0b3AtdGVjaCcpIHtcbiAgICBib2R5SHRtbCA9IHJlbmRlckNhdGFsb2dWaWV3KHsgdGl0bGU6ICdUb3AgVGVjaCBQaWNrcycsIGNhdGVnb3J5RmlsdGVyOiB1aS5jYXRhbG9nQ2F0ZWdvcnksIG1vZGU6ICd0b3AtdGVjaCcsIHNvcnRCeTogdWkuY2F0YWxvZ1NvcnQgfSk7XG4gIH0gZWxzZSBpZiAodWkucm91dGUgPT09ICd3aXNobGlzdCcpIHtcbiAgICBib2R5SHRtbCA9IHJlbmRlckNhdGFsb2dWaWV3KHsgdGl0bGU6ICdTYXZlZCBXaXNobGlzdCcsIGNhdGVnb3J5RmlsdGVyOiAnQWxsJywgbW9kZTogJ3dpc2hsaXN0Jywgc29ydEJ5OiB1aS5jYXRhbG9nU29ydCB9KTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ3NlYXJjaCcpIHtcbiAgICBib2R5SHRtbCA9IHJlbmRlckNhdGFsb2dWaWV3KHtcbiAgICAgIHRpdGxlOiB1aS5zZWFyY2hRdWVyeSA/IGBTZWFyY2g6IFwiJHt1aS5zZWFyY2hRdWVyeX1cImAgOiAnU2VhcmNoIENhdGFsb2cnLFxuICAgICAgY2F0ZWdvcnlGaWx0ZXI6IHVpLmNhdGFsb2dDYXRlZ29yeSxcbiAgICAgIG1vZGU6ICdhbGwnLFxuICAgICAgc2VhcmNoUXVlcnk6IHVpLnNlYXJjaFF1ZXJ5LFxuICAgICAgc29ydEJ5OiB1aS5jYXRhbG9nU29ydFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHVpLnJvdXRlID09PSAncHJvZHVjdCcpIHtcbiAgICBib2R5SHRtbCA9IHJlbmRlclByb2R1Y3REZXRhaWxWaWV3KHVpLnBhcmFtLCB1aS5wZHBJbWdJZHgsIHVpLnBkcE9wdGlvbiwgdWkucGRwUXR5KTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2NoZWNrb3V0Jykge1xuICAgIGJvZHlIdG1sID0gcmVuZGVyQ2hlY2tvdXRWaWV3KHVpLmNoZWNrb3V0LCB1aS5jb25maXJtZWRSZWNlaXB0KTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2FjY291bnQnKSB7XG4gICAgYm9keUh0bWwgPSByZW5kZXJBY2NvdW50Vmlldyh1aS5hY2NvdW50KTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ3RyYWNrLW9yZGVyJykge1xuICAgIGJvZHlIdG1sID0gcmVuZGVyVHJhY2tPcmRlclZpZXcodWkudHJhY2tRdWVyeSwgdWkudHJhY2tSZXN1bHRzKTtcbiAgfSBlbHNlIGlmICh1aS5yb3V0ZSA9PT0gJ2Jsb2cnKSB7XG4gICAgYm9keUh0bWwgPSByZW5kZXJCbG9nVmlldyh1aS5wYXJhbSB8fCBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBib2R5SHRtbCA9IHJlbmRlclN0YXRpY0luZm9WaWV3KHVpLnJvdXRlKTtcbiAgfVxuXG4gIGNvbnN0IGxlZnRSYWlsID0gcmVuZGVyQWRTbG90KCdhZF9zaWRlX2xlZnQnLCAnc2lkZS1yYWlsLWFkJyArIChzdGF0ZS5hZHM/LnNsb3RzPy5hZF9zaWRlX2xlZnQ/LmVuYWJsZWQgPyAnIGhhcy1hZCcgOiAnJykpO1xuICBjb25zdCByaWdodFJhaWwgPSByZW5kZXJBZFNsb3QoJ2FkX3NpZGVfcmlnaHQnLCAnc2lkZS1yYWlsLWFkJyArIChzdGF0ZS5hZHM/LnNsb3RzPy5hZF9zaWRlX3JpZ2h0Py5lbmFibGVkID8gJyBoYXMtYWQnIDogJycpKTtcblxuICBhcHBFbC5pbm5lckhUTUwgPSBgXG4gICAgJHtyZW5kZXJIZWFkZXIodWkucm91dGUsIHVpLnNlYXJjaFF1ZXJ5KX1cbiAgICA8ZGl2IGNsYXNzPVwicGFnZS13aXRoLXJhaWxzXCI+XG4gICAgICAke2xlZnRSYWlsfVxuICAgICAgPGRpdiBjbGFzcz1cIm1haW4tY29udGVudC1zaGVsbFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+JHtyZW5kZXJEYkNvbm5lY3Rpb25BbGVydCgpfTwvZGl2PlxuICAgICAgICAke2JvZHlIdG1sfVxuICAgICAgPC9kaXY+XG4gICAgICAke3JpZ2h0UmFpbH1cbiAgICA8L2Rpdj5cbiAgICAke3JlbmRlckZvb3Rlcih1aS5yb3V0ZSl9XG4gICAgJHtyZW5kZXJDYXJ0RHJhd2VyKHVpLmNhcnRPcGVuLCB1aS5kZWxpdmVyeVpvbmUpfVxuICAgIDxkaXYgY2xhc3M9XCJ0b2FzdC1jb250YWluZXJcIiBpZD1cInRvYXN0LWNvbnRhaW5lclwiPjwvZGl2PlxuICBgO1xuXG4gIHNldHVwQWZ0ZXJSZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gc2V0dXBBZnRlclJlbmRlcigpIHtcbiAgLy8gMS4gU2Nyb2xsIFJldmVhbCBJbnRlcnNlY3Rpb25PYnNlcnZlclxuICBjb25zdCBjYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZXZlYWwtdXAnKTtcbiAgaWYgKCdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4gICAgY29uc3QgaW8gPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgIGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgICAgZW50cnkudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLXZpc2libGUnKTtcbiAgICAgICAgICBpby51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgeyB0aHJlc2hvbGQ6IDAuMDYgfSk7XG4gICAgY2FyZHMuZm9yRWFjaCgoYykgPT4gaW8ub2JzZXJ2ZShjKSk7XG4gIH0gZWxzZSB7XG4gICAgY2FyZHMuZm9yRWFjaCgoYykgPT4gYy5jbGFzc0xpc3QuYWRkKCdpcy12aXNpYmxlJykpO1xuICB9XG5cbiAgLy8gMi4gRGVza3RvcCBNb3VzZS1EcmFnIFNjcm9sbGluZyArIEFycm93IFN0YXRlIFN5bmMgYWNyb3NzIHRvcCBzdWJuYXYsIGNhdGVnb3JpZXMsIGFuZCBwcm9kdWN0IHJvd3NcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnN1Ym5hdi1zY3JvbGwsIC5jYXQtc2Nyb2xsZXIsIC5wcm9kdWN0LXNjcm9sbGVyJykuZm9yRWFjaCgoc2Nyb2xsZXIpID0+IHtcbiAgICBjb25zdCB3cmFwID0gc2Nyb2xsZXIuY2xvc2VzdCgnLnNjcm9sbGVyLXdyYXAnKTtcbiAgICBjb25zdCBwcmV2QnRuID0gd3JhcCA/IHdyYXAucXVlcnlTZWxlY3RvcignW2RhdGEtc2Nyb2xsLXRhcmdldF1bZGF0YS1kaXI9XCItMVwiXScpIDogbnVsbDtcbiAgICBjb25zdCBuZXh0QnRuID0gd3JhcCA/IHdyYXAucXVlcnlTZWxlY3RvcignW2RhdGEtc2Nyb2xsLXRhcmdldF1bZGF0YS1kaXI9XCIxXCJdJykgOiBudWxsO1xuXG4gICAgY29uc3QgdXBkYXRlQXJyb3dTdGF0ZSA9ICgpID0+IHtcbiAgICAgIGlmICghd3JhcCkgcmV0dXJuO1xuICAgICAgY29uc3QgbWF4U2Nyb2xsID0gTWF0aC5tYXgoMCwgc2Nyb2xsZXIuc2Nyb2xsV2lkdGggLSBzY3JvbGxlci5jbGllbnRXaWR0aCk7XG4gICAgICBjb25zdCBoYXNPdmVyZmxvdyA9IG1heFNjcm9sbCA+IDQ7XG4gICAgICB3cmFwLmNsYXNzTGlzdC50b2dnbGUoJ2lzLW92ZXJmbG93aW5nJywgaGFzT3ZlcmZsb3cpO1xuICAgICAgaWYgKHByZXZCdG4gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICBwcmV2QnRuLmRpc2FibGVkID0gIWhhc092ZXJmbG93IHx8IHNjcm9sbGVyLnNjcm9sbExlZnQgPD0gMjtcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0QnRuIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgbmV4dEJ0bi5kaXNhYmxlZCA9ICFoYXNPdmVyZmxvdyB8fCBzY3JvbGxlci5zY3JvbGxMZWZ0ID49IG1heFNjcm9sbCAtIDI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBpc0Rvd24gPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRYID0gMDtcbiAgICBsZXQgc3RhcnRTY3JvbGxMZWZ0ID0gMDtcbiAgICBsZXQgaGFzRHJhZ2dlZCA9IGZhbHNlO1xuICAgIGxldCBzdXBwcmVzc0NsaWNrVW50aWwgPSAwO1xuXG4gICAgc2Nyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIHNjcm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChEYXRlLm5vdygpIDwgc3VwcHJlc3NDbGlja1VudGlsKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH1cbiAgICB9LCB0cnVlKTtcblxuICAgIHNjcm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcbiAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgLnNjcm9sbGVyLWFycm93LCAuc3VibmF2LWFycm93JykpIHJldHVybjtcbiAgICAgIGlzRG93biA9IHRydWU7XG4gICAgICBoYXNEcmFnZ2VkID0gZmFsc2U7XG4gICAgICBzdGFydFggPSBlLmNsaWVudFg7XG4gICAgICBzdGFydFNjcm9sbExlZnQgPSBzY3JvbGxlci5zY3JvbGxMZWZ0O1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xuICAgICAgaWYgKCFpc0Rvd24pIHJldHVybjtcbiAgICAgIGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gc3RhcnRYO1xuICAgICAgaWYgKCFoYXNEcmFnZ2VkICYmIE1hdGguYWJzKGR4KSA+IDUpIHtcbiAgICAgICAgaGFzRHJhZ2dlZCA9IHRydWU7XG4gICAgICAgIHNjcm9sbGVyLmNsYXNzTGlzdC5hZGQoJ2lzLWRyYWdnaW5nJyk7XG4gICAgICAgIHNjcm9sbGVyLnN0eWxlLnNjcm9sbEJlaGF2aW9yID0gJ2F1dG8nO1xuICAgICAgICBzY3JvbGxlci5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9ICdub25lJztcbiAgICAgIH1cbiAgICAgIGlmIChoYXNEcmFnZ2VkKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2Nyb2xsZXIuc2Nyb2xsTGVmdCA9IHN0YXJ0U2Nyb2xsTGVmdCAtIGR4ICogMS4xNTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZVVwID0gKCkgPT4ge1xuICAgICAgaWYgKCFpc0Rvd24pIHJldHVybjtcbiAgICAgIGlzRG93biA9IGZhbHNlO1xuICAgICAgaWYgKGhhc0RyYWdnZWQpIHtcbiAgICAgICAgc3VwcHJlc3NDbGlja1VudGlsID0gRGF0ZS5ub3coKSArIDIwMDtcbiAgICAgICAgc2Nyb2xsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dpbmcnKTtcbiAgICAgICAgc2Nyb2xsZXIuc3R5bGUuc2Nyb2xsQmVoYXZpb3IgPSAnJztcbiAgICAgICAgc2Nyb2xsZXIuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSAnJztcbiAgICAgICAgdXBkYXRlQXJyb3dTdGF0ZSgpO1xuICAgICAgfVxuICAgICAgaGFzRHJhZ2dlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlQXJyb3dTdGF0ZSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgIHNjcm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHVwZGF0ZUFycm93U3RhdGUsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IHNjcm9sbGVyQ2xlYW51cCA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhzY3JvbGxlcikpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlQXJyb3dTdGF0ZSk7XG4gICAgICAgIHNjcm9sbGVyQ2xlYW51cC5kaXNjb25uZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2Nyb2xsZXJDbGVhbnVwLm9ic2VydmUoYXBwRWwsIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZUFycm93U3RhdGUpO1xuICB9KTtcblxuICAvLyAzLiBJbnRlcmFjdGl2ZSBNb3VzZSBEcmFnICsgVG91Y2ggU3dpcGUgKyBBdXRvLXBsYXkgb24gSGVybyBTbGlkZXJcbiAgY29uc3QgaGVybyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZXJvLXNsaWRlcicpO1xuICBjb25zdCBoZXJvVHJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVyby10cmFjaycpO1xuICBpZiAoaGVybyAmJiBoZXJvVHJhY2spIHtcbiAgICBjb25zdCBjb3VudCA9IHN0YXRlLnRoZW1lPy5oZXJvU2xpZGVzPy5sZW5ndGggfHwgMTtcbiAgICBsZXQgaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgIGxldCBpc0hvdmVyZWQgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRYID0gMDtcbiAgICBsZXQgc3RhcnRZID0gMDtcbiAgICBsZXQgZHJhZ09mZnNldCA9IDA7XG4gICAgbGV0IGF4aXNMb2NrZWQgPSAnJzsgLy8gJ3gnIHwgJ3knIHwgJydcblxuICAgIGNvbnN0IGFwcGx5TGl2ZURyYWcgPSAoZHgpID0+IHtcbiAgICAgIGNvbnN0IHcgPSBoZXJvLmNsaWVudFdpZHRoIHx8IDE7XG4gICAgICBjb25zdCBwY3RCYXNlID0gLSh1aS5oZXJvU2xpZGVJZHggJSBjb3VudCkgKiAxMDA7XG4gICAgICBjb25zdCBwY3REZWx0YSA9IChkeCAvIHcpICogMTAwO1xuICAgICAgaGVyb1RyYWNrLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG4gICAgICBoZXJvVHJhY2suc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKGNhbGMoJHtwY3RCYXNlfSUgKyAke3BjdERlbHRhfSUpLCAwLCAwKWA7XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbmlzaERyYWcgPSAoZHgpID0+IHtcbiAgICAgIGlmICghaXNQb2ludGVyRG93bikgcmV0dXJuO1xuICAgICAgaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgICAgaGVyby5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcmFnZ2luZycpO1xuICAgICAgY29uc3QgdyA9IGhlcm8uY2xpZW50V2lkdGggfHwgMzIwO1xuICAgICAgY29uc3QgdGhyZXNob2xkID0gTWF0aC5taW4oNzIsIHcgKiAwLjE0KTtcblxuICAgICAgaWYgKE1hdGguYWJzKGR4KSA+IDEwKSB7XG4gICAgICAgIGhlcm9TdXBwcmVzc0NsaWNrVW50aWwgPSBEYXRlLm5vdygpICsgMjYwO1xuICAgICAgfVxuXG4gICAgICBpZiAoY291bnQgPiAxICYmIE1hdGguYWJzKGR4KSA+IHRocmVzaG9sZCkge1xuICAgICAgICBnb1RvSGVyb1NsaWRlKHVpLmhlcm9TbGlkZUlkeCArIChkeCA8IDAgPyAxIDogLTEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdvVG9IZXJvU2xpZGUodWkuaGVyb1NsaWRlSWR4KTtcbiAgICAgIH1cbiAgICAgIGRyYWdPZmZzZXQgPSAwO1xuICAgICAgYXhpc0xvY2tlZCA9ICcnO1xuICAgIH07XG5cbiAgICAvLyBNb3VzZSBkcmFnIHN1cHBvcnQgKGxlZnQtY2xpY2sgJiBkcmFnIGFueXdoZXJlIG9uIHNsaWRlIGV4Y2VwdCBidXR0b25zL2NvbnRyb2xzKVxuICAgIGhlcm8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMCB8fCBjb3VudCA8PSAxKSByZXR1cm47XG4gICAgICBpZiAoZS50YXJnZXQuY2xvc2VzdCgnLmhlcm8tbmF2LWJ0biwgLmhlcm8tZG90LCBidXR0b24sIGlucHV0LCBzZWxlY3QnKSkgcmV0dXJuO1xuICAgICAgaXNQb2ludGVyRG93biA9IHRydWU7XG4gICAgICBzdGFydFggPSBlLmNsaWVudFg7XG4gICAgICBzdGFydFkgPSBlLmNsaWVudFk7XG4gICAgICBkcmFnT2Zmc2V0ID0gMDtcbiAgICAgIGF4aXNMb2NrZWQgPSAneCc7XG4gICAgICBoZXJvLmNsYXNzTGlzdC5hZGQoJ2lzLWRyYWdnaW5nJyk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XG4gICAgICBpZiAoIWlzUG9pbnRlckRvd24pIHJldHVybjtcbiAgICAgIGRyYWdPZmZzZXQgPSBlLmNsaWVudFggLSBzdGFydFg7XG4gICAgICBpZiAoTWF0aC5hYnMoZHJhZ09mZnNldCkgPiA0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYXBwbHlMaXZlRHJhZyhkcmFnT2Zmc2V0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZVVwID0gKCkgPT4ge1xuICAgICAgaWYgKGlzUG9pbnRlckRvd24pIGZpbmlzaERyYWcoZHJhZ09mZnNldCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG4gICAgLy8gVG91Y2ggc3dpcGUgc3VwcG9ydCAoaG9yaXpvbnRhbCBzd2lwZSBtb3ZlcyB0cmFjayBzbW9vdGhseSwgdmVydGljYWwgc2Nyb2xsIHBhc3NlcyB0aHJvdWdoKVxuICAgIGhlcm8uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgICBpZiAoY291bnQgPD0gMSB8fCAhZS50b3VjaGVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJy5oZXJvLW5hdi1idG4sIC5oZXJvLWRvdCcpKSByZXR1cm47XG4gICAgICBpc1BvaW50ZXJEb3duID0gdHJ1ZTtcbiAgICAgIHN0YXJ0WCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgc3RhcnRZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICBkcmFnT2Zmc2V0ID0gMDtcbiAgICAgIGF4aXNMb2NrZWQgPSAnJztcbiAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG5cbiAgICBoZXJvLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB7XG4gICAgICBpZiAoIWlzUG9pbnRlckRvd24gfHwgIWUudG91Y2hlcy5sZW5ndGgpIHJldHVybjtcbiAgICAgIGNvbnN0IGR4ID0gZS50b3VjaGVzWzBdLmNsaWVudFggLSBzdGFydFg7XG4gICAgICBjb25zdCBkeSA9IGUudG91Y2hlc1swXS5jbGllbnRZIC0gc3RhcnRZO1xuICAgICAgaWYgKCFheGlzTG9ja2VkKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiA4IHx8IE1hdGguYWJzKGR5KSA+IDgpIHtcbiAgICAgICAgICBheGlzTG9ja2VkID0gTWF0aC5hYnMoZHgpID49IE1hdGguYWJzKGR5KSA/ICd4JyA6ICd5JztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGF4aXNMb2NrZWQgPT09ICd4Jykge1xuICAgICAgICBkcmFnT2Zmc2V0ID0gZHg7XG4gICAgICAgIGhlcm8uY2xhc3NMaXN0LmFkZCgnaXMtZHJhZ2dpbmcnKTtcbiAgICAgICAgYXBwbHlMaXZlRHJhZyhkeCk7XG4gICAgICB9XG4gICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXG4gICAgaGVyby5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICgpID0+IHtcbiAgICAgIGlmIChheGlzTG9ja2VkID09PSAneCcpIGZpbmlzaERyYWcoZHJhZ09mZnNldCk7XG4gICAgICBlbHNlIHtcbiAgICAgICAgaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgICAgICBheGlzTG9ja2VkID0gJyc7XG4gICAgICB9XG4gICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXG4gICAgaGVyby5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsICgpID0+IHtcbiAgICAgIGZpbmlzaERyYWcoMCk7XG4gICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXG4gICAgaGVyby5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4geyBpc0hvdmVyZWQgPSB0cnVlOyB9KTtcbiAgICBoZXJvLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7IGlzSG92ZXJlZCA9IGZhbHNlOyB9KTtcblxuICAgIC8vIENsZWFuIHVwIGdsb2JhbCB3aW5kb3cgbGlzdGVuZXJzIHdoZW4gaGVybyBub2RlIGxlYXZlcyBET00gb24gbmV4dCByb3V0ZS9yZW5kZXJcbiAgICBjb25zdCBjbGVhbnVwT2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGhlcm8pKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgICAgY2xlYW51cE9icy5kaXNjb25uZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2xlYW51cE9icy5vYnNlcnZlKGFwcEVsLCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgIC8vIEdlbnRsZSBhdXRvLWFkdmFuY2UgZXZlcnkgNnMgd2hlbiBpZGxlIG9uIEhvbWVcbiAgICBpZiAoY291bnQgPiAxICYmICF3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzKSB7XG4gICAgICBoZXJvQXV0b1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoaGVybykpIHtcbiAgICAgICAgICBjbGVhckhlcm9BdXRvVGltZXIoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1BvaW50ZXJEb3duICYmICFpc0hvdmVyZWQgJiYgIWRvY3VtZW50LmhpZGRlbikge1xuICAgICAgICAgIGdvVG9IZXJvU2xpZGUodWkuaGVyb1NsaWRlSWR4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH0sIDYwMDApO1xuICAgIH1cbiAgfVxuXG4gIC8vIDQuIEludGVyYWN0aXZlIENoZWNrb3V0IE1hcCBQaWNrZXIgbGlmZWN5Y2xlXG4gIGlmICh1aS5yb3V0ZSA9PT0gJ2NoZWNrb3V0JyAmJiBzdGF0ZS5jYXJ0Lmxlbmd0aCAmJiAhdWkuY29uZmlybWVkUmVjZWlwdCAmJiBzdGF0ZS5nZW5lcmFsPy5tYXBFbmFibGVkICE9PSBmYWxzZSkge1xuICAgIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IHt9O1xuICAgIGNvbnN0IGhhc1BpbiA9IHR5cGVvZiB1aS5jaGVja291dC5tYXBMYXQgPT09ICdudW1iZXInICYmIHR5cGVvZiB1aS5jaGVja291dC5tYXBMbmcgPT09ICdudW1iZXInO1xuICAgIGluaXRDaGVja291dE1hcCh7XG4gICAgICBjb250YWluZXJJZDogJ2NoZWNrb3V0LW1hcCcsXG4gICAgICBsYXQ6IGhhc1BpbiA/IHVpLmNoZWNrb3V0Lm1hcExhdCA6IChnLm1hcERlZmF1bHRMYXQgPz8gMjMuODEwMyksXG4gICAgICBsbmc6IGhhc1BpbiA/IHVpLmNoZWNrb3V0Lm1hcExuZyA6IChnLm1hcERlZmF1bHRMbmcgPz8gOTAuNDEyNSksXG4gICAgICB6b29tOiBoYXNQaW4gPyAxNSA6IChnLm1hcERlZmF1bHRab29tID8/IDEyKSxcbiAgICAgIHByb3ZpZGVyOiBnLm1hcFByb3ZpZGVyIHx8ICdvc20nLFxuICAgICAgaGFzRXhpc3RpbmdQaW46IGhhc1BpbixcbiAgICAgIG9uTG9jYXRpb25SZXNvbHZlZDogYXBwbHlSZXNvbHZlZENoZWNrb3V0TG9jYXRpb25cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBkZXN0cm95Q2hlY2tvdXRNYXAoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVJlc29sdmVkQ2hlY2tvdXRMb2NhdGlvbihyZXNvbHZlZCkge1xuICBpZiAoIXJlc29sdmVkKSByZXR1cm47XG4gIHVpLmNoZWNrb3V0LmRpdmlzaW9uID0gcmVzb2x2ZWQuZGl2aXNpb24gfHwgdWkuY2hlY2tvdXQuZGl2aXNpb247XG4gIHVpLmNoZWNrb3V0LmRpc3RyaWN0ID0gcmVzb2x2ZWQuZGlzdHJpY3QgfHwgdWkuY2hlY2tvdXQuZGlzdHJpY3Q7XG4gIGNvbnN0IHJlc29sdmVkQWRkciA9IHJlc29sdmVkLmFkZHJlc3NMaW5lIHx8IHJlc29sdmVkLmRldGFpbGVkQWRkcmVzcyB8fCAnJztcbiAgaWYgKHJlc29sdmVkQWRkcikge1xuICAgIHVpLmNoZWNrb3V0LmFkZHJlc3MgPSByZXNvbHZlZEFkZHI7XG4gIH1cbiAgaWYgKHR5cGVvZiByZXNvbHZlZC5sYXQgPT09ICdudW1iZXInICYmIHR5cGVvZiByZXNvbHZlZC5sbmcgPT09ICdudW1iZXInKSB7XG4gICAgdWkuY2hlY2tvdXQubWFwTGF0ID0gcmVzb2x2ZWQubGF0O1xuICAgIHVpLmNoZWNrb3V0Lm1hcExuZyA9IHJlc29sdmVkLmxuZztcbiAgfVxuICB1aS5jaGVja291dC5tYXBTdGF0dXMgPSBgQXV0by1maWxsZWQgZnJvbSBtYXA6ICR7dWkuY2hlY2tvdXQuZGlzdHJpY3R9LCAke3VpLmNoZWNrb3V0LmRpdmlzaW9ufWA7XG4gIHJlbmRlcih0cnVlKTtcbiAgc2hvd1RvYXN0KGBMb2NhdGlvbiBzZXQ6ICR7dWkuY2hlY2tvdXQuZGlzdHJpY3R9LCAke3VpLmNoZWNrb3V0LmRpdmlzaW9ufWApO1xufVxuXG4vLyAtLS0gR2xvYmFsIEV2ZW50IERlbGVnYXRpb24gLS0tXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XG4gIGlmIChEYXRlLm5vdygpIDwgaGVyb1N1cHByZXNzQ2xpY2tVbnRpbCAmJiBlLnRhcmdldC5jbG9zZXN0KCcjaGVyby1zbGlkZXIgYScpKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hY3Rpb25dLCBbZGF0YS1zY3JvbGwtdGFyZ2V0XSwgI3BkcC1tYWluLXpvb20sICNiYWNrLXRvLXRvcC1idG4nKTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICBjb25zdCBzdWdCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoLXN1Z2dlc3Rpb25zJyk7XG4gICAgaWYgKHN1Z0JveCAmJiAhZS50YXJnZXQuY2xvc2VzdCgnLmhlYWRlci1zZWFyY2gtd3JhcCcpKSB7XG4gICAgICBzdWdCb3guaGlkZGVuID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRhcmdldC5pZCA9PT0gJ2JhY2stdG8tdG9wLWJ0bicpIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oeyB0b3A6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGFyZ2V0LmlkID09PSAncGRwLW1haW4tem9vbScpIHtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgnem9vbWVkJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRhcmdldC5kYXRhc2V0LnNjcm9sbFRhcmdldCkge1xuICAgIGNvbnN0IHNjcm9sbGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0LmRhdGFzZXQuc2Nyb2xsVGFyZ2V0KTtcbiAgICBpZiAoc2Nyb2xsZXIpIHtcbiAgICAgIGNvbnN0IHN0ZXAgPSBNYXRoLm1heCgyMjAsIE1hdGgucm91bmQoc2Nyb2xsZXIuY2xpZW50V2lkdGggKiAwLjc1KSk7XG4gICAgICBzY3JvbGxlci5zY3JvbGxCeSh7IGxlZnQ6IE51bWJlcih0YXJnZXQuZGF0YXNldC5kaXIpICogc3RlcCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBhY3Rpb24gPSB0YXJnZXQuZGF0YXNldC5hY3Rpb247XG4gIGlmICghYWN0aW9uKSByZXR1cm47XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ3JldHJ5LWRiLWNvbm5lY3Rpb24nKSB7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICB0YXJnZXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gJ0NoZWNraW5nLi4uJztcbiAgICB9XG4gICAgYXdhaXQgcmV0cnlEYXRhYmFzZUNvbm5lY3Rpb24oKTtcbiAgICByZW5kZXIodHJ1ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ2F1dGgtc3dpdGNoLW1vZGUnKSB7XG4gICAgY3VzdG9tZXJBdXRoVWkubW9kZSA9IHRhcmdldC5kYXRhc2V0Lm1vZGUgPT09ICdzaWdudXAnID8gJ3NpZ251cCcgOiAnc2lnbmluJztcbiAgICBjdXN0b21lckF1dGhVaS5lcnJvciA9ICcnO1xuICAgIGN1c3RvbWVyQXV0aFVpLnNob3dQYXNzd29yZCA9IGZhbHNlO1xuICAgIGN1c3RvbWVyQXV0aFVpLnNob3dDb25maXJtUGFzc3dvcmQgPSBmYWxzZTtcbiAgICByZW5kZXIodHJ1ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ2F1dGgtdG9nZ2xlLXBhc3MnIHx8IGFjdGlvbiA9PT0gJ2F1dGgtdG9nZ2xlLWNvbmZpcm0nKSB7XG4gICAgY29uc3QgdGFyZ2V0SWQgPSB0YXJnZXQuZGF0YXNldC50YXJnZXQ7XG4gICAgY29uc3QgaW5wdXQgPSB0YXJnZXRJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldElkKSA6IG51bGw7XG4gICAgaWYgKGlucHV0ICYmIGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgY29uc3QgbmV4dFZpc2libGUgPSBpbnB1dC50eXBlID09PSAncGFzc3dvcmQnO1xuICAgICAgaW5wdXQudHlwZSA9IG5leHRWaXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJztcbiAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IG5leHRWaXNpYmxlID8gJ0hpZGUnIDogJ1Nob3cnO1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIG5leHRWaXNpYmxlID8gJ0hpZGUgcGFzc3dvcmQnIDogJ1Nob3cgcGFzc3dvcmQnKTtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdhdXRoLXRvZ2dsZS1wYXNzJykge1xuICAgICAgICBjdXN0b21lckF1dGhVaS5zaG93UGFzc3dvcmQgPSBuZXh0VmlzaWJsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1c3RvbWVyQXV0aFVpLnNob3dDb25maXJtUGFzc3dvcmQgPSBuZXh0VmlzaWJsZTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdvcGVuLWFjY291bnQnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVpLmNhcnRPcGVuID0gZmFsc2U7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy9hZG1pbicpIHtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsICcvI2FjY291bnQnKTtcbiAgICAgIHBhcnNlUm91dGUoKTtcbiAgICAgIHJlbmRlcih0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnYWNjb3VudCc7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnYWNjb3VudC10YWInKSB7XG4gICAgdWkuYWNjb3VudC50YWIgPSB0YXJnZXQuZGF0YXNldC50YWIgfHwgJ292ZXJ2aWV3JztcbiAgICB1aS5hY2NvdW50LmVycm9yID0gJyc7XG4gICAgdWkuYWNjb3VudC5wYXNzRXJyb3IgPSAnJztcbiAgICByZW5kZXIodHJ1ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ2FjY291bnQtcmVtb3ZlLWF2YXRhcicpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdXBkYXRlQ3VzdG9tZXJQcm9maWxlKHsgYXZhdGFyVXJsOiAnJyB9KTtcbiAgICAgIHJlbmRlcih0cnVlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNob3dUb2FzdChlcnIubWVzc2FnZSB8fCAnQ291bGQgbm90IHJlbW92ZSBwcm9maWxlIHBob3RvLicsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnY3VzdG9tZXItbG9nb3V0Jykge1xuICAgIHVpLmNhcnRPcGVuID0gZmFsc2U7XG4gICAgc2lnbk91dEN1c3RvbWVyKCk7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy9hZG1pbicpIHtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsICcvJyk7XG4gICAgfVxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJ2hvbWUnO1xuICAgIHBhcnNlUm91dGUoKTtcbiAgICByZW5kZXIodHJ1ZSk7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdnby1hZG1pbicgfHwgYWN0aW9uID09PSAnbmF2LWFjY291bnQnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHNlc3Npb24gPSBnZXRDdXN0b21lclNlc3Npb24oKTtcbiAgICBpZiAoc2Vzc2lvbiAmJiAhaXNDdXN0b21lckFkbWluKHNlc3Npb24pICYmICFzdGF0ZS5pc0FkbWluKSB7XG4gICAgICBzaG93VG9hc3QoJ0FkbWluIGFjY2VzcyBpcyByZXN0cmljdGVkIHRvIGFkbWluaXN0cmF0b3IgYWNjb3VudHMuJywgdHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsICcvYWRtaW4nKTtcbiAgICBwYXJzZVJvdXRlKCk7XG4gICAgcmVuZGVyKHRydWUpO1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnc3RvcmVmcm9udC1lZGl0LWNhdGVnb3J5Jykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBzZXNzaW9uID0gZ2V0Q3VzdG9tZXJTZXNzaW9uKCk7XG4gICAgaWYgKHNlc3Npb24gJiYgIWlzQ3VzdG9tZXJBZG1pbihzZXNzaW9uKSAmJiAhc3RhdGUuaXNBZG1pbikge1xuICAgICAgc2hvd1RvYXN0KCdBZG1pbiBhY2Nlc3MgaXMgcmVzdHJpY3RlZCB0byBhZG1pbmlzdHJhdG9yIGFjY291bnRzLicsIHRydWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwcmVmZXJyZWROYW1lID0gdGFyZ2V0LmRhdGFzZXQuY2F0ZWdvcnkgfHwgdWkuY2F0YWxvZ0NhdGVnb3J5IHx8ICcnO1xuICAgIGNvbnN0IG1hdGNoID0gKHByZWZlcnJlZE5hbWUgJiYgcHJlZmVycmVkTmFtZSAhPT0gJ0FsbCcgJiYgc3RhdGUuY2F0ZWdvcmllcy5maW5kKChjKSA9PiBjLm5hbWUgPT09IHByZWZlcnJlZE5hbWUpKSB8fCBzdGF0ZS5jYXRlZ29yaWVzWzBdO1xuICAgIGFkbWluVWlTdGF0ZS50YWIgPSAncHJvZHVjdHMnO1xuICAgIGFkbWluVWlTdGF0ZS5wcm9kQ2F0RmlsdGVyID0gcHJlZmVycmVkTmFtZSAmJiBwcmVmZXJyZWROYW1lICE9PSAnQWxsJyA/IHByZWZlcnJlZE5hbWUgOiAnQWxsJztcbiAgICBhZG1pblVpU3RhdGUucXVpY2tFZGl0Q2F0ZWdvcnlJZCA9IG1hdGNoID8gbWF0Y2guaWQgOiAnJztcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCAnL2FkbWluJyk7XG4gICAgcGFyc2VSb3V0ZSgpO1xuICAgIHJlbmRlcih0cnVlKTtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ25hdi13aXNobGlzdCcpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICd3aXNobGlzdCc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ29wZW4tY2FydCcpIHtcbiAgICB1aS5jYXJ0T3BlbiA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ2Nsb3NlLWNhcnQnKSB7XG4gICAgdWkuY2FydE9wZW4gPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnZ28tY2hlY2tvdXQnKSB7XG4gICAgdWkuY2FydE9wZW4gPSBmYWxzZTtcbiAgICB1aS5jb25maXJtZWRSZWNlaXB0ID0gbnVsbDtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICdjaGVja291dCc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ29wZW4tY2F0ZWdvcnknKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBgY2F0ZWdvcnkvJHtlbmNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQuY2F0ZWdvcnkpfWA7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ29wZW4tcHJvZHVjdCcpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGBwcm9kdWN0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRhcmdldC5kYXRhc2V0LmlkKX1gO1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnb3Blbi1wb3N0Jykge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYGJsb2cvJHtlbmNvZGVVUklDb21wb25lbnQodGFyZ2V0LmRhdGFzZXQuaWQpfWA7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdyZXBvcnQtYmxvZy1pc3N1ZScpIHtcbiAgICByZXBvcnRCbG9nSXNzdWUodGFyZ2V0LmRhdGFzZXQuaWQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdjby11c2UtbG9jYXRpb24nKSB7XG4gICAgbG9jYXRlQ3VycmVudFBvc2l0aW9uT25NYXAoXG4gICAgICAobXNnLCBpc0VycikgPT4ge1xuICAgICAgICB1aS5jaGVja291dC5tYXBTdGF0dXMgPSBtc2c7XG4gICAgICAgIGNvbnN0IHN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY28tbWFwLXN0YXR1cycpO1xuICAgICAgICBpZiAoc3RFbCkgc3RFbC50ZXh0Q29udGVudCA9IG1zZztcbiAgICAgICAgaWYgKGlzRXJyKSBzaG93VG9hc3QobXNnLCB0cnVlKTtcbiAgICAgIH0sXG4gICAgICAocmVzb2x2ZWQpID0+IGFwcGx5UmVzb2x2ZWRDaGVja291dExvY2F0aW9uKHJlc29sdmVkKVxuICAgICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkZC1jYXJ0Jykge1xuICAgIGFkZFRvQ2FydCh0YXJnZXQuZGF0YXNldC5pZCwgMSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ29yZGVyLW5vdycpIHtcbiAgICBpZiAoYWRkVG9DYXJ0KHRhcmdldC5kYXRhc2V0LmlkLCAxKSkge1xuICAgICAgdWkuY2FydE9wZW4gPSBmYWxzZTtcbiAgICAgIHVpLmNvbmZpcm1lZFJlY2VpcHQgPSBudWxsO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnY2hlY2tvdXQnO1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAndG9nZ2xlLXdpc2gnKSB7XG4gICAgdG9nZ2xlV2lzaGxpc3QodGFyZ2V0LmRhdGFzZXQuaWQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdjYXJ0LXF0eScpIHtcbiAgICB1cGRhdGVDYXJ0UXR5KE51bWJlcih0YXJnZXQuZGF0YXNldC5pbmRleCksIE51bWJlcih0YXJnZXQuZGF0YXNldC5kZWx0YSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdjYXJ0LXJlbW92ZScpIHtcbiAgICByZW1vdmVGcm9tQ2FydChOdW1iZXIodGFyZ2V0LmRhdGFzZXQuaW5kZXgpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWN0aW9uID09PSAnaGVyby1wcmV2JyB8fCBhY3Rpb24gPT09ICdoZXJvLW5leHQnKSB7XG4gICAgZ29Ub0hlcm9TbGlkZSh1aS5oZXJvU2xpZGVJZHggKyAoYWN0aW9uID09PSAnaGVyby1uZXh0JyA/IDEgOiAtMSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdoZXJvLWRvdCcpIHtcbiAgICBnb1RvSGVyb1NsaWRlKE51bWJlcih0YXJnZXQuZGF0YXNldC5pbmRleCkgfHwgMCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ3BkcC10aHVtYicpIHtcbiAgICB1aS5wZHBJbWdJZHggPSBOdW1iZXIodGFyZ2V0LmRhdGFzZXQuaW5kZXgpIHx8IDA7XG4gICAgcmVuZGVyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ3BkcC1vcHRpb24nKSB7XG4gICAgdWkucGRwT3B0aW9uID0gdGFyZ2V0LmRhdGFzZXQub3B0aW9uO1xuICAgIHJlbmRlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdwZHAtcXR5Jykge1xuICAgIGNvbnN0IHByb2QgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBwLmlkID09PSB1aS5wYXJhbSk7XG4gICAgY29uc3QgbWF4USA9IHByb2QgPyBNYXRoLm1heCgxLCBwcm9kLnN0b2NrIHx8IDEpIDogOTk7XG4gICAgdWkucGRwUXR5ID0gTWF0aC5tYXgoMSwgTWF0aC5taW4obWF4USwgdWkucGRwUXR5ICsgTnVtYmVyKHRhcmdldC5kYXRhc2V0LmRlbHRhKSkpO1xuICAgIHJlbmRlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdwZHAtYWRkLWNhcnQnKSB7XG4gICAgYWRkVG9DYXJ0KHRhcmdldC5kYXRhc2V0LmlkLCB1aS5wZHBRdHksIHVpLnBkcE9wdGlvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ3BkcC1idXktbm93Jykge1xuICAgIGlmIChhZGRUb0NhcnQodGFyZ2V0LmRhdGFzZXQuaWQsIHVpLnBkcFF0eSwgdWkucGRwT3B0aW9uKSkge1xuICAgICAgdWkuY29uZmlybWVkUmVjZWlwdCA9IG51bGw7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICdjaGVja291dCc7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdzaGFyZS1wcm9kdWN0Jykge1xuICAgIGNvbnN0IHNoYXJlVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKG5hdmlnYXRvci5zaGFyZSkge1xuICAgICAgbmF2aWdhdG9yLnNoYXJlKHsgdGl0bGU6IHRhcmdldC5kYXRhc2V0Lm5hbWUsIHVybDogc2hhcmVVcmwgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCkge1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc2hhcmVVcmwpLnRoZW4oKCkgPT4gc2hvd1RvYXN0KCdQcm9kdWN0IGxpbmsgY29waWVkIScpKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdGlvbiA9PT0gJ3BsYXktcHJvZHVjdC12aWRlbycpIHtcbiAgICBjb25zdCBib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGRwLXZpZGVvLWNvbnRhaW5lcicpO1xuICAgIGlmICghYm94KSByZXR1cm47XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VFbWJlZFZpZGVvKGJveC5kYXRhc2V0LnZpZGVvVXJsKTtcbiAgICBpZiAoIXBhcnNlZCkgcmV0dXJuO1xuICAgIGlmIChwYXJzZWQudHlwZSA9PT0gJ2lmcmFtZScpIHtcbiAgICAgIGJveC5pbm5lckhUTUwgPSBgPGlmcmFtZSBzcmM9XCIke2VzY0h0bWwocGFyc2VkLnNyYyl9XCIgYWxsb3c9XCJhdXRvcGxheTsgZW5jcnlwdGVkLW1lZGlhOyBwaWN0dXJlLWluLXBpY3R1cmVcIiBhbGxvd2Z1bGxzY3JlZW4gdGl0bGU9XCJQcm9kdWN0IERlbW8gVmlkZW9cIj48L2lmcmFtZT5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3guaW5uZXJIVE1MID0gYDx2aWRlbyBzcmM9XCIke2VzY0h0bWwocGFyc2VkLnNyYyl9XCIgcG9zdGVyPVwiJHtlc2NIdG1sKGJveC5kYXRhc2V0LnZpZGVvUG9zdGVyIHx8ICcnKX1cIiBjb250cm9scyBhdXRvcGxheSBtdXRlZCBwbGF5c2lubGluZT48L3ZpZGVvPmA7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEFkbWluIGFjdGlvbnNcbiAgaWYgKHVpLnJvdXRlID09PSAnYWRtaW4nKSB7XG4gICAgY29uc3QgbmVlZHNSZW5kZXIgPSBhd2FpdCBoYW5kbGVBZG1pbkFjdGlvbihhY3Rpb24sIHRhcmdldCk7XG4gICAgaWYgKG5lZWRzUmVuZGVyKSByZW5kZXIoKTtcbiAgfVxufSk7XG5cbi8vIExpdmUgc2VhcmNoIHN1Z2dlc3Rpb25zICsgaW5wdXRzXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gIGNvbnN0IGVsID0gZS50YXJnZXQ7XG4gIGlmIChlbC5pZCA9PT0gJ2F1dGgtZnVsbG5hbWUnKSB7IGN1c3RvbWVyQXV0aFVpLm5hbWVEcmFmdCA9IGVsLnZhbHVlOyByZXR1cm47IH1cbiAgaWYgKGVsLmlkID09PSAnYXV0aC1zaWduaW4taWRlbnRpZmllcicgfHwgZWwuaWQgPT09ICdhdXRoLXNpZ251cC1lbWFpbCcpIHsgY3VzdG9tZXJBdXRoVWkuZW1haWxEcmFmdCA9IGVsLnZhbHVlOyByZXR1cm47IH1cbiAgaWYgKGVsLmlkID09PSAnYXV0aC1zaWduaW4tcGFzcycgfHwgZWwuaWQgPT09ICdhdXRoLXNpZ251cC1wYXNzJykgeyBjdXN0b21lckF1dGhVaS5wYXNzd29yZERyYWZ0ID0gZWwudmFsdWU7IHJldHVybjsgfVxuICBpZiAoZWwuaWQgPT09ICdhdXRoLXNpZ251cC1jb25maXJtJykgeyBjdXN0b21lckF1dGhVaS5jb25maXJtUGFzc3dvcmREcmFmdCA9IGVsLnZhbHVlOyByZXR1cm47IH1cblxuICBpZiAoZWwuaWQgPT09ICdnbG9iYWwtc2VhcmNoLWlucHV0Jykge1xuICAgIGNvbnN0IHEgPSBlbC52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBzdWdCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoLXN1Z2dlc3Rpb25zJyk7XG4gICAgaWYgKCFzdWdCb3gpIHJldHVybjtcbiAgICBpZiAoIXEpIHtcbiAgICAgIHN1Z0JveC5oaWRkZW4gPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaGVzID0gc3RhdGUucHJvZHVjdHMuZmlsdGVyKChwKSA9PlxuICAgICAgcC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSkgfHxcbiAgICAgIHAuY2F0ZWdvcnkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSB8fFxuICAgICAgKHAuYnJhbmQgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSkgfHxcbiAgICAgIChwLnRhZ3MgfHwgW10pLnNvbWUoKHQpID0+IHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSlcbiAgICApLnNsaWNlKDAsIDYpO1xuXG4gICAgc3VnQm94LmhpZGRlbiA9IGZhbHNlO1xuICAgIHN1Z0JveC5pbm5lckhUTUwgPSBtYXRjaGVzLmxlbmd0aFxuICAgICAgPyBtYXRjaGVzLm1hcCgocCkgPT4gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtc3VnZ2VzdGlvbi1pdGVtXCIgZGF0YS1hY3Rpb249XCJvcGVuLXByb2R1Y3RcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPlxuICAgICAgICAgICAgPGltZyBzcmM9XCIke2VzY0h0bWwocC5pbWFnZXM/LlswXSB8fCAnJyl9XCIgYWx0PVwiXCIgb25lcnJvcj1cInRoaXMuc3R5bGUuZGlzcGxheT0nbm9uZSdcIiAvPlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6MTttaW4td2lkdGg6MDtcIj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MC44OHJlbTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7XCI+JHtlc2NIdG1sKHAubmFtZSl9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+JHtlc2NIdG1sKHAuY2F0ZWdvcnkpfSDCtyAke2Zvcm1hdFByaWNlKHAucHJpY2UpfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpXG4gICAgICA6IGA8ZGl2IHN0eWxlPVwicGFkZGluZzoxMnB4IDE0cHg7Zm9udC1zaXplOjAuODZyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPk5vIHByb2R1Y3RzIG1hdGNoaW5nIFwiJHtlc2NIdG1sKHEpfVwiPC9kaXY+YDtcbiAgfVxuXG4gIGlmIChlbC5pZCA9PT0gJ2NvLW5hbWUnKSB7IHVpLmNoZWNrb3V0LmN1c3RvbWVyTmFtZSA9IGVsLnZhbHVlOyByZXR1cm47IH1cbiAgaWYgKGVsLmlkID09PSAnY28tcGhvbmUnKSB7IHVpLmNoZWNrb3V0LnBob25lID0gZWwudmFsdWU7IHJldHVybjsgfVxuICBpZiAoZWwuaWQgPT09ICdjby1hZGRyZXNzJykgeyB1aS5jaGVja291dC5hZGRyZXNzID0gZWwudmFsdWU7IHJldHVybjsgfVxuICBpZiAoZWwuaWQgPT09ICdjby1wYXktbnVtJykgeyB1aS5jaGVja291dC5wYXltZW50TnVtYmVyID0gZWwudmFsdWU7IHJldHVybjsgfVxuICBpZiAoZWwuaWQgPT09ICdjby1ub3RlcycpIHsgdWkuY2hlY2tvdXQubm90ZXMgPSBlbC52YWx1ZTsgcmV0dXJuOyB9XG5cbiAgaWYgKGVsLmlkID09PSAnYWRtaW4tcHJvZC1zZWFyY2gnKSB7XG4gICAgYWRtaW5VaVN0YXRlLnByb2RTZWFyY2ggPSBlbC52YWx1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBjb25zdCByZXN0b3JlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1wcm9kLXNlYXJjaCcpO1xuICAgIGlmIChyZXN0b3JlZCkge1xuICAgICAgcmVzdG9yZWQuZm9jdXMoKTtcbiAgICAgIHJlc3RvcmVkLnNldFNlbGVjdGlvblJhbmdlKHJlc3RvcmVkLnZhbHVlLmxlbmd0aCwgcmVzdG9yZWQudmFsdWUubGVuZ3RoKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoZSkgPT4ge1xuICBjb25zdCBlbCA9IGUudGFyZ2V0O1xuICBpZiAoZWwuaWQgPT09ICdjYXRhbG9nLWNhdC1zZWxlY3QnKSB7XG4gICAgdWkuY2F0YWxvZ0NhdGVnb3J5ID0gZWwudmFsdWU7XG4gICAgcmVuZGVyKCk7XG4gIH0gZWxzZSBpZiAoZWwuaWQgPT09ICdjYXRhbG9nLXNvcnQtc2VsZWN0Jykge1xuICAgIHVpLmNhdGFsb2dTb3J0ID0gZWwudmFsdWU7XG4gICAgcmVuZGVyKCk7XG4gIH0gZWxzZSBpZiAoZWwuaWQgPT09ICdkcmF3ZXItem9uZS1zZWxlY3QnKSB7XG4gICAgdWkuZGVsaXZlcnlab25lID0gZWwudmFsdWU7XG4gICAgcmVuZGVyKCk7XG4gIH0gZWxzZSBpZiAoZWwuaWQgPT09ICdjby1kaXZpc2lvbicpIHtcbiAgICB1aS5jaGVja291dC5kaXZpc2lvbiA9IGVsLnZhbHVlO1xuICAgIGNvbnN0IGRpc3RzID0gZ2V0RGlzdHJpY3RzQnlEaXZpc2lvbih1aS5jaGVja291dC5kaXZpc2lvbik7XG4gICAgdWkuY2hlY2tvdXQuZGlzdHJpY3QgPSBkaXN0c1swXSB8fCAnJztcbiAgICB1aS5jaGVja291dC5tYXBMYXQgPSBudWxsO1xuICAgIHVpLmNoZWNrb3V0Lm1hcExuZyA9IG51bGw7XG4gICAgdWkuY2hlY2tvdXQubWFwU3RhdHVzID0gJyc7XG4gICAgcmVuZGVyKHRydWUpO1xuICAgIGZvY3VzRGlzdHJpY3RPbk1hcCh1aS5jaGVja291dC5kaXZpc2lvbiwgdWkuY2hlY2tvdXQuZGlzdHJpY3QpO1xuICB9IGVsc2UgaWYgKGVsLmlkID09PSAnY28tZGlzdHJpY3QnKSB7XG4gICAgdWkuY2hlY2tvdXQuZGlzdHJpY3QgPSBlbC52YWx1ZTtcbiAgICB1aS5jaGVja291dC5tYXBMYXQgPSBudWxsO1xuICAgIHVpLmNoZWNrb3V0Lm1hcExuZyA9IG51bGw7XG4gICAgdWkuY2hlY2tvdXQubWFwU3RhdHVzID0gJyc7XG4gICAgcmVuZGVyKHRydWUpO1xuICAgIGZvY3VzRGlzdHJpY3RPbk1hcCh1aS5jaGVja291dC5kaXZpc2lvbiwgdWkuY2hlY2tvdXQuZGlzdHJpY3QpO1xuICB9IGVsc2UgaWYgKGVsLmlkID09PSAnY28tcGF5bWVudCcpIHtcbiAgICB1aS5jaGVja291dC5wYXltZW50TWV0aG9kID0gZWwudmFsdWU7XG4gICAgY29uc3QgdHJ4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvLXRyeC13cmFwJyk7XG4gICAgaWYgKHRyeCkgdHJ4LmhpZGRlbiA9IGVsLnZhbHVlID09PSAnQ2FzaCBvbiBEZWxpdmVyeSc7XG4gIH0gZWxzZSBpZiAoZWwuaWQgPT09ICdhY2NvdW50LWF2YXRhci1pbnB1dCcpIHtcbiAgICBjb25zdCBmaWxlID0gZWwuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YVVybCA9IGF3YWl0IHJlc2l6ZUF2YXRhckZpbGVUb0RhdGFVcmwoZmlsZSwgMjQwKTtcbiAgICAgIGF3YWl0IHVwZGF0ZUN1c3RvbWVyUHJvZmlsZSh7IGF2YXRhclVybDogZGF0YVVybCB9KTtcbiAgICAgIGVsLnZhbHVlID0gJyc7XG4gICAgICByZW5kZXIodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzaG93VG9hc3QoZXJyLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCB1cGxvYWQgcHJvZmlsZSBwaG90by4nLCB0cnVlKTtcbiAgICAgIGVsLnZhbHVlID0gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKGVsLmlkID09PSAnYWNjLWRpdmlzaW9uJykge1xuICAgIHVpLmFjY291bnQuZGl2aXNpb24gPSBlbC52YWx1ZTtcbiAgICBjb25zdCBkaXN0cyA9IGdldERpc3RyaWN0c0J5RGl2aXNpb24oZWwudmFsdWUpO1xuICAgIHVpLmFjY291bnQuZGlzdHJpY3QgPSBkaXN0c1swXSB8fCAnJztcbiAgICBjb25zdCBkaXN0U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjYy1kaXN0cmljdCcpO1xuICAgIGlmIChkaXN0U2VsZWN0KSB7XG4gICAgICBkaXN0U2VsZWN0LmlubmVySFRNTCA9IGRpc3RzXG4gICAgICAgIC5tYXAoKGQpID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NIdG1sKGQpfVwiPiR7ZXNjSHRtbChkKX08L29wdGlvbj5gKVxuICAgICAgICAuam9pbignJyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGVsLmlkID09PSAnYWNjLWRpc3RyaWN0Jykge1xuICAgIHVpLmFjY291bnQuZGlzdHJpY3QgPSBlbC52YWx1ZTtcbiAgfSBlbHNlIGlmIChlbC5pZCA9PT0gJ2FkbWluLXByb2QtY2F0Jykge1xuICAgIGFkbWluVWlTdGF0ZS5wcm9kQ2F0RmlsdGVyID0gZWwudmFsdWU7XG4gICAgcmVuZGVyKCk7XG4gIH0gZWxzZSBpZiAoZWwuaWQgPT09ICdxdWljay1lZGl0LWNhdC1zZWxlY3QnKSB7XG4gICAgYWRtaW5VaVN0YXRlLnF1aWNrRWRpdENhdGVnb3J5SWQgPSBlbC52YWx1ZTtcbiAgICByZW5kZXIodHJ1ZSk7XG4gIH0gZWxzZSBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcmRlci1zdGF0dXMtc2VsZWN0JykpIHtcbiAgICBhd2FpdCB1cGRhdGVPcmRlclN0YXR1cyhlbC5kYXRhc2V0LmlkLCBlbC52YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZWwuZGF0YXNldC51cGxvYWRUYXJnZXQpIHtcbiAgICBhd2FpdCBoYW5kbGVBZG1pbkZpbGVVcGxvYWQoZWwpO1xuICB9XG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGUpID0+IHtcbiAgY29uc3QgZm9ybSA9IGUudGFyZ2V0O1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdjdXN0b21lci1zaWduaW4tZm9ybScpIHtcbiAgICBjb25zdCBpZGVudGlmaWVyID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcjYXV0aC1zaWduaW4taWRlbnRpZmllcicpPy52YWx1ZSB8fCAnJztcbiAgICBjb25zdCBwYXNzd29yZCA9IGZvcm0ucXVlcnlTZWxlY3RvcignI2F1dGgtc2lnbmluLXBhc3MnKT8udmFsdWUgfHwgJyc7XG4gICAgY3VzdG9tZXJBdXRoVWkuZW1haWxEcmFmdCA9IGlkZW50aWZpZXI7XG4gICAgY3VzdG9tZXJBdXRoVWkuYnVzeSA9IHRydWU7XG4gICAgY3VzdG9tZXJBdXRoVWkuZXJyb3IgPSAnJztcbiAgICByZW5kZXIodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNpZ25JbkN1c3RvbWVyKHsgaWRlbnRpZmllciwgcGFzc3dvcmQgfSk7XG4gICAgICBjdXN0b21lckF1dGhVaS5idXN5ID0gZmFsc2U7XG4gICAgICBjdXN0b21lckF1dGhVaS5lbWFpbERyYWZ0ID0gJyc7XG4gICAgICByZW5kZXIodHJ1ZSk7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjdXN0b21lckF1dGhVaS5idXN5ID0gZmFsc2U7XG4gICAgICBjdXN0b21lckF1dGhVaS5lcnJvciA9IGVyci5tZXNzYWdlIHx8ICdTaWduIGluIGZhaWxlZC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuICAgICAgcmVuZGVyKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2N1c3RvbWVyLXNpZ251cC1mb3JtJykge1xuICAgIGNvbnN0IGZ1bGxOYW1lID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcjYXV0aC1mdWxsbmFtZScpPy52YWx1ZSB8fCAnJztcbiAgICBjb25zdCBlbWFpbCA9IGZvcm0ucXVlcnlTZWxlY3RvcignI2F1dGgtc2lnbnVwLWVtYWlsJyk/LnZhbHVlIHx8ICcnO1xuICAgIGNvbnN0IHBhc3N3b3JkID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcjYXV0aC1zaWdudXAtcGFzcycpPy52YWx1ZSB8fCAnJztcbiAgICBjb25zdCBjb25maXJtUGFzc3dvcmQgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhdXRoLXNpZ251cC1jb25maXJtJyk/LnZhbHVlIHx8ICcnO1xuICAgIGN1c3RvbWVyQXV0aFVpLm5hbWVEcmFmdCA9IGZ1bGxOYW1lO1xuICAgIGN1c3RvbWVyQXV0aFVpLmVtYWlsRHJhZnQgPSBlbWFpbDtcbiAgICBjdXN0b21lckF1dGhVaS5idXN5ID0gdHJ1ZTtcbiAgICBjdXN0b21lckF1dGhVaS5lcnJvciA9ICcnO1xuICAgIHJlbmRlcih0cnVlKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc2lnblVwQ3VzdG9tZXIoeyBmdWxsTmFtZSwgZW1haWwsIHBhc3N3b3JkLCBjb25maXJtUGFzc3dvcmQgfSk7XG4gICAgICBjdXN0b21lckF1dGhVaS5idXN5ID0gZmFsc2U7XG4gICAgICBjdXN0b21lckF1dGhVaS5uYW1lRHJhZnQgPSAnJztcbiAgICAgIGN1c3RvbWVyQXV0aFVpLmVtYWlsRHJhZnQgPSAnJztcbiAgICAgIHJlbmRlcih0cnVlKTtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGN1c3RvbWVyQXV0aFVpLmJ1c3kgPSBmYWxzZTtcbiAgICAgIGN1c3RvbWVyQXV0aFVpLmVycm9yID0gZXJyLm1lc3NhZ2UgfHwgJ1JlZ2lzdHJhdGlvbiBmYWlsZWQuIFBsZWFzZSB0cnkgYWdhaW4uJztcbiAgICAgIHJlbmRlcih0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdhY2NvdW50LXByb2ZpbGUtZm9ybScpIHtcbiAgICB0cnkge1xuICAgICAgdWkuYWNjb3VudC5lcnJvciA9ICcnO1xuICAgICAgY29uc3QgdXBkYXRlZCA9IGF3YWl0IHVwZGF0ZUN1c3RvbWVyUHJvZmlsZSh7XG4gICAgICAgIGZ1bGxOYW1lOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtZnVsbG5hbWUnKT8udmFsdWUgfHwgJycsXG4gICAgICAgIGVtYWlsOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtZW1haWwnKT8udmFsdWUgfHwgJycsXG4gICAgICAgIHBob25lOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtcGhvbmUnKT8udmFsdWUgfHwgJycsXG4gICAgICAgIGFsdFBob25lOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtYWx0LXBob25lJyk/LnZhbHVlIHx8ICcnLFxuICAgICAgICB3aGF0c2FwcE51bWJlcjogZm9ybS5xdWVyeVNlbGVjdG9yKCcjYWNjLXdoYXRzYXBwJyk/LnZhbHVlIHx8ICcnLFxuICAgICAgICBwcmVmZXJyZWRQYXltZW50OiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtcGF5bWVudCcpPy52YWx1ZSB8fCAnQ2FzaCBvbiBEZWxpdmVyeScsXG4gICAgICAgIGRpdmlzaW9uOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtZGl2aXNpb24nKT8udmFsdWUgfHwgJ0RoYWthJyxcbiAgICAgICAgZGlzdHJpY3Q6IGZvcm0ucXVlcnlTZWxlY3RvcignI2FjYy1kaXN0cmljdCcpPy52YWx1ZSB8fCAnRGhha2EnLFxuICAgICAgICBhZGRyZXNzOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtYWRkcmVzcycpPy52YWx1ZSB8fCAnJyxcbiAgICAgICAgbm90aWZ5T3JkZXJzOiBCb29sZWFuKGZvcm0ucXVlcnlTZWxlY3RvcignI2FjYy1ub3RpZnktb3JkZXJzJyk/LmNoZWNrZWQpLFxuICAgICAgICBub3RpZnlEZWFsczogQm9vbGVhbihmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2Mtbm90aWZ5LWRlYWxzJyk/LmNoZWNrZWQpXG4gICAgICB9KTtcbiAgICAgIHVpLmFjY291bnQuZGl2aXNpb24gPSB1cGRhdGVkLmRpdmlzaW9uO1xuICAgICAgdWkuYWNjb3VudC5kaXN0cmljdCA9IHVwZGF0ZWQuZGlzdHJpY3Q7XG4gICAgICByZW5kZXIodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB1aS5hY2NvdW50LmVycm9yID0gZXJyLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBzYXZlIGFjY291bnQgc2V0dGluZ3MuJztcbiAgICAgIHNob3dUb2FzdCh1aS5hY2NvdW50LmVycm9yLCB0cnVlKTtcbiAgICAgIHJlbmRlcih0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdhY2NvdW50LXBhc3N3b3JkLWZvcm0nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHVpLmFjY291bnQucGFzc0Vycm9yID0gJyc7XG4gICAgICBhd2FpdCBjaGFuZ2VDdXN0b21lclBhc3N3b3JkKHtcbiAgICAgICAgY3VycmVudFBhc3N3b3JkOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtY3VyLXBhc3MnKT8udmFsdWUgfHwgJycsXG4gICAgICAgIG5ld1Bhc3N3b3JkOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhY2MtbmV3LXBhc3MnKT8udmFsdWUgfHwgJycsXG4gICAgICAgIGNvbmZpcm1QYXNzd29yZDogZm9ybS5xdWVyeVNlbGVjdG9yKCcjYWNjLWNvbmYtcGFzcycpPy52YWx1ZSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICByZW5kZXIodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB1aS5hY2NvdW50LnBhc3NFcnJvciA9IGVyci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdXBkYXRlIHBhc3N3b3JkLic7XG4gICAgICBzaG93VG9hc3QodWkuYWNjb3VudC5wYXNzRXJyb3IsIHRydWUpO1xuICAgICAgcmVuZGVyKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2dsb2JhbC1zZWFyY2gtZm9ybScpIHtcbiAgICBjb25zdCBxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dsb2JhbC1zZWFyY2gtaW5wdXQnKT8udmFsdWUudHJpbSgpIHx8ICcnO1xuICAgIHVpLnNlYXJjaFF1ZXJ5ID0gcTtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGBzZWFyY2gvJHtlbmNvZGVVUklDb21wb25lbnQocSl9YDtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ25ld3NsZXR0ZXItZm9ybScpIHtcbiAgICBjb25zdCBlbWFpbCA9IGZvcm0ucXVlcnlTZWxlY3RvcignI25ld3NsZXR0ZXItZW1haWwnKS52YWx1ZTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc3Vic2NyaWJlTmV3c2xldHRlcihlbWFpbCk7XG4gICAgICBmb3JtLnJlc2V0KCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzaG93VG9hc3QoZXJyLm1lc3NhZ2UsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ3BkcC1yZXZpZXctZm9ybScpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc3VibWl0Q3VzdG9tZXJSZXZpZXcoe1xuICAgICAgICBwcm9kdWN0SWQ6IGZvcm0uZGF0YXNldC5wcm9kdWN0SWQsXG4gICAgICAgIHByb2R1Y3ROYW1lOiBmb3JtLmRhdGFzZXQucHJvZHVjdE5hbWUsXG4gICAgICAgIGF1dGhvck5hbWU6IGZvcm0ucXVlcnlTZWxlY3RvcignI3Jldi1hdXRob3InKS52YWx1ZSxcbiAgICAgICAgY2l0eTogZm9ybS5xdWVyeVNlbGVjdG9yKCcjcmV2LWNpdHknKS52YWx1ZSxcbiAgICAgICAgcmF0aW5nOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNyZXYtcmF0aW5nJykudmFsdWUsXG4gICAgICAgIGNvbW1lbnQ6IGZvcm0ucXVlcnlTZWxlY3RvcignI3Jldi1jb21tZW50JykudmFsdWVcbiAgICAgIH0pO1xuICAgICAgZm9ybS5yZXNldCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgc2hvd1RvYXN0KGVyci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc3VibWl0IHJldmlldy4nLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdjaGVja291dC1mb3JtJykge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjby1zdWJtaXQtYnRuJyk7XG4gICAgaWYgKGJ0bikgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVjZWlwdCA9IGF3YWl0IHBsYWNlT3JkZXIoe1xuICAgICAgICBjdXN0b21lck5hbWU6IGZvcm0ucXVlcnlTZWxlY3RvcignI2NvLW5hbWUnKS52YWx1ZSxcbiAgICAgICAgcGhvbmU6IGZvcm0ucXVlcnlTZWxlY3RvcignI2NvLXBob25lJykudmFsdWUsXG4gICAgICAgIGRpdmlzaW9uOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNjby1kaXZpc2lvbicpLnZhbHVlLFxuICAgICAgICBkaXN0cmljdDogZm9ybS5xdWVyeVNlbGVjdG9yKCcjY28tZGlzdHJpY3QnKS52YWx1ZSxcbiAgICAgICAgdXBhemlsYTogJycsXG4gICAgICAgIGFkZHJlc3M6IGZvcm0ucXVlcnlTZWxlY3RvcignI2NvLWFkZHJlc3MnKS52YWx1ZSxcbiAgICAgICAgbWFwTGF0OiB1aS5jaGVja291dC5tYXBMYXQsXG4gICAgICAgIG1hcExuZzogdWkuY2hlY2tvdXQubWFwTG5nLFxuICAgICAgICBwYXltZW50TWV0aG9kOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNjby1wYXltZW50JykudmFsdWUsXG4gICAgICAgIHBheW1lbnROdW1iZXI6IGZvcm0ucXVlcnlTZWxlY3RvcignI2NvLXBheS1udW0nKT8udmFsdWUgfHwgJycsXG4gICAgICAgIG5vdGVzOiBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNjby1ub3RlcycpLnZhbHVlXG4gICAgICB9KTtcbiAgICAgIHVpLmNvbmZpcm1lZFJlY2VpcHQgPSByZWNlaXB0O1xuICAgICAgdWkuY2hlY2tvdXQubWFwTGF0ID0gbnVsbDtcbiAgICAgIHVpLmNoZWNrb3V0Lm1hcExuZyA9IG51bGw7XG4gICAgICB1aS5jaGVja291dC5tYXBTdGF0dXMgPSAnJztcbiAgICAgIHVpLmNoZWNrb3V0Lm5vdGVzID0gJyc7XG4gICAgICByZW5kZXIoKTtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNob3dUb2FzdChlcnIubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHBsYWNlIG9yZGVyLicsIHRydWUpO1xuICAgICAgaWYgKGJ0bikgYnRuLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChmb3JtLmlkID09PSAndHJhY2stb3JkZXItZm9ybScpIHtcbiAgICBjb25zdCBxID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcjdHJhY2stcXVlcnktaW5wdXQnKS52YWx1ZS50cmltKCk7XG4gICAgdWkudHJhY2tRdWVyeSA9IHE7XG4gICAgdWkudHJhY2tSZXN1bHRzID0gYXdhaXQgdHJhY2tPcmRlcnMocSk7XG4gICAgcmVuZGVyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHVpLnJvdXRlID09PSAnYWRtaW4nKSB7XG4gICAgY29uc3QgcmVyZW5kZXIgPSBhd2FpdCBoYW5kbGVBZG1pbkZvcm1TdWJtaXQoZm9ybSk7XG4gICAgaWYgKHJlcmVuZGVyKSByZW5kZXIoKTtcbiAgfVxufSk7XG5cbi8vIFRvYXN0IHJlbmRlcmVyXG5vblRvYXN0KCh7IG1lc3NhZ2UsIGlzRXJyb3IgfSkgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QtY29udGFpbmVyJyk7XG4gIGlmICghY29udGFpbmVyKSByZXR1cm47XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmNsYXNzTmFtZSA9IGB0b2FzdCAke2lzRXJyb3IgPyAnZXJyb3InIDogJyd9YDtcbiAgZWwudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpO1xuICBzZXRUaW1lb3V0KCgpID0+IGVsLnJlbW92ZSgpLCAzNDAwKTtcbn0pO1xuXG4vLyBBdXRvLXNsaWRlIEhlcm8gJiBGbGFzaCBTYWxlIENvdW50ZG93biAmIEJhY2stdG8tdG9wXG5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gIGlmICh1aS5yb3V0ZSA9PT0gJ2hvbWUnKSB7XG4gICAgY29uc3QgY291bnQgPSBzdGF0ZS50aGVtZT8uaGVyb1NsaWRlcz8ubGVuZ3RoIHx8IDE7XG4gICAgaWYgKGNvdW50ID4gMSkge1xuICAgICAgdWkuaGVyb1NsaWRlSWR4ID0gKHVpLmhlcm9TbGlkZUlkeCArIDEpICUgY291bnQ7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuaGVyby1zbGlkZScpLmZvckVhY2goKHMsIGlkeCkgPT4ge1xuICAgICAgICBzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGlkeCA9PT0gdWkuaGVyb1NsaWRlSWR4KTtcbiAgICAgIH0pO1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmhlcm8tZG90JykuZm9yRWFjaCgoZCwgaWR4KSA9PiB7XG4gICAgICAgIGQuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgaWR4ID09PSB1aS5oZXJvU2xpZGVJZHgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59LCA1NTAwKTtcblxuLy8gRmxhc2ggU2FsZSBsaXZlIGNvdW50ZG93biAocmVzZXRzIHNtb290aGx5IGV2ZXJ5IDEyIGhvdXJzIFVUQys2KVxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICBjb25zdCBocnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcy1ocnMnKTtcbiAgY29uc3QgbWluRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnMtbWluJyk7XG4gIGNvbnN0IHNlY0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZzLXNlYycpO1xuICBpZiAoIWhyc0VsIHx8ICFtaW5FbCB8fCAhc2VjRWwpIHJldHVybjtcbiAgY29uc3QgY3ljbGUgPSAxMiAqIDM2MDA7XG4gIGNvbnN0IHJlbSA9IGN5Y2xlIC0gKE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICUgY3ljbGUpO1xuICBjb25zdCBoID0gU3RyaW5nKE1hdGguZmxvb3IocmVtIC8gMzYwMCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gIGNvbnN0IG0gPSBTdHJpbmcoTWF0aC5mbG9vcigocmVtICUgMzYwMCkgLyA2MCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gIGNvbnN0IHMgPSBTdHJpbmcocmVtICUgNjApLnBhZFN0YXJ0KDIsICcwJyk7XG4gIGhyc0VsLnRleHRDb250ZW50ID0gaDtcbiAgbWluRWwudGV4dENvbnRlbnQgPSBtO1xuICBzZWNFbC50ZXh0Q29udGVudCA9IHM7XG59LCAxMDAwKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2stdG8tdG9wLWJ0bicpO1xuICBpZiAoYnRuKSBidG4uY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycsIHdpbmRvdy5zY3JvbGxZID4gMzgwKTtcbn0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09ICcvYWRtaW4nICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmICF3aW5kb3cubG9jYXRpb24uaGFzaC5zdGFydHNXaXRoKCcjYWRtaW4nKSkge1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsICcvJyArIHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgfVxuICBjb25zdCBwcmV2Um91dGUgPSB1aS5yb3V0ZTtcbiAgY29uc3QgcHJldkNhdCA9IHVpLmNhdGFsb2dDYXRlZ29yeTtcbiAgcGFyc2VSb3V0ZSgpO1xuICByZW5kZXIoKTtcbiAgaWYgKHVpLnJvdXRlICE9PSBwcmV2Um91dGUgfHwgdWkuY2F0YWxvZ0NhdGVnb3J5ICE9PSBwcmV2Q2F0KSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgKCkgPT4ge1xuICBwYXJzZVJvdXRlKCk7XG4gIHJlbmRlcigpO1xufSk7XG5cbi8vIEJvb3QgQXBwbGljYXRpb25cbmVuc3VyZURlZmF1bHRBZG1pbkFjY291bnQoKTtcbmFwcGx5VGhlbWVWYXJpYWJsZXMoKTtcbnBhcnNlUm91dGUoKTtcbnN1YnNjcmliZVN0YXRlKCgpID0+IHJlbmRlcigpKTtcbmluaXRSZWFsdGltZVN5bmMoKTtcbnJlbmRlcigpO1xuIl19