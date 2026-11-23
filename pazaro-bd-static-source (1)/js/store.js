// Pazaro BD — State Management, Real-Time Firestore Sync & Business Logic
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, writeBatch, serverTimestamp } from "/node_modules/.vite/deps/firebase_firestore.js?v=f12522c3";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, sendEmailVerification, reload } from "/node_modules/.vite/deps/firebase_auth.js?v=05cbd489";
import { ref, uploadBytes, getDownloadURL } from "/node_modules/.vite/deps/firebase_storage.js?v=d314065b";
import { db, auth, googleProvider, storage, firebaseConfigured, testConnection, formatFirestoreErrorMessage, OperationType, handleFirestoreError } from "/src/firebase-config.js";
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_REVIEWS, SEED_POSTS, SEED_GENERAL_SETTINGS, SEED_THEME_SETTINGS, SEED_ADS_SETTINGS } from "/src/js/seed-data.js";
const CACHE_KEY = "pazaro_catalog_cache_v1";
const CART_KEY = "pazaro_cart_v1";
const WISH_KEY = "pazaro_wishlist_v1";
const RECENT_KEY = "pazaro_recent_v1";
const LOCAL_ORDERS_KEY = "pazaro_local_orders_v1";
const ADMIN_ORDERS_CACHE_KEY = "pazaro_admin_orders_cache_v1";
const UNSEEN_ORDERS_KEY = "pazaro_unseen_orders_v1";
const BLOG_REPORTS_KEY = "pazaro_blog_reports_v1";
const SEEDED_FLAG_KEY = "pazaro_seeded_firestore_v1";
const DELETED_PRODUCTS_KEY = "pazaro_deleted_products_v1";
const LOCAL_CAT_OVERRIDES_KEY = "pazaro_local_cat_overrides_v1";
const BEAUTY_MERGE_KEY = "pazaro_beauty_skincare_merge_v2";
const BEAUTY_MERGE_FS_KEY = "pazaro_beauty_skincare_merge_fs_v2";
const BEAUTY_CATEGORY_ID = "cat-beauty";
const LEGACY_SKINCARE_CATEGORY_ID = "cat-skincare-serums";
const BEAUTY_UNIFIED_NAME = "Beauty & Skincare";
const BEAUTY_UNIFIED_NAME_BN = "বিউটি, স্কিনকেয়ার ও সিরাম";
const SKINCARE_PRODUCT_IDS = [
	"prod-vitamin-c-glow-serum",
	"prod-niacinamide-10-zinc-serum",
	"prod-brightening-day-cream",
	"prod-collagen-night-repair-cream",
	"prod-hydra-matte-sunscreen",
	"prod-rose-lip-cheek-tint"
];
function loadJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function saveJson(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
const cached = loadJson(CACHE_KEY, {});
const cachedAdminOrders = loadJson(ADMIN_ORDERS_CACHE_KEY, []);
const cachedUnseenIds = loadJson(UNSEEN_ORDERS_KEY, []);
const cachedBlogReports = loadJson(BLOG_REPORTS_KEY, {});
function mergePostsWithReports(posts) {
	const reports = loadJson(BLOG_REPORTS_KEY, {});
	return (posts || []).map((p) => {
		const rep = reports[p.id];
		if (!rep) return p;
		return {
			...p,
			issueFlag: Boolean(p.issueFlag || rep.issueFlag),
			issueNote: p.issueNote || rep.issueNote || ""
		};
	});
}
function getDeletedProductIdSet() {
	const raw = loadJson(DELETED_PRODUCTS_KEY, []);
	return new Set(Array.isArray(raw) ? raw.map(String) : []);
}
function markProductDeletedLocally(id) {
	const set = getDeletedProductIdSet();
	set.add(String(id));
	saveJson(DELETED_PRODUCTS_KEY, Array.from(set));
}
function unmarkProductDeletedLocally(id) {
	const set = getDeletedProductIdSet();
	if (set.delete(String(id))) {
		saveJson(DELETED_PRODUCTS_KEY, Array.from(set));
	}
}
function getLocalCatOverrides() {
	const raw = loadJson(LOCAL_CAT_OVERRIDES_KEY, {});
	return {
		editedById: raw && typeof raw.editedById === "object" && raw.editedById ? raw.editedById : {},
		renamedFrom: raw && typeof raw.renamedFrom === "object" && raw.renamedFrom ? raw.renamedFrom : {},
		deletedIds: Array.isArray(raw?.deletedIds) ? raw.deletedIds.map(String) : []
	};
}
export function resolveCategoryRename(name) {
	const clean = String(name || "");
	if (!clean) return clean;
	const ov = getLocalCatOverrides();
	return ov.renamedFrom[clean] || clean;
}
function normalizeThemeSettings(rawTheme) {
	if (!rawTheme || typeof rawTheme !== "object") return { ...SEED_THEME_SETTINGS };
	const merged = {
		...SEED_THEME_SETTINGS,
		...rawTheme
	};
	const incomingSlides = Array.isArray(rawTheme.heroSlides) ? rawTheme.heroSlides : [];
	const shouldUpgradeDefaults = !rawTheme.heroSlidesCustomized && incomingSlides.length <= 2;
	if (!incomingSlides.length && !rawTheme.heroSlidesCustomized) {
		merged.heroSlides = [...SEED_THEME_SETTINGS.heroSlides];
	} else if (shouldUpgradeDefaults) {
		const byId = new Map(SEED_THEME_SETTINGS.heroSlides.map((s) => [s.id, s]));
		const upgradedFirst = incomingSlides.map((s, idx) => {
			const def = byId.get(s.id) || SEED_THEME_SETTINGS.heroSlides[idx] || {};
			return {
				...def,
				...s,
				featuredProductId: s.featuredProductId ?? def.featuredProductId ?? "",
				badgeText: s.badgeText ?? def.badgeText ?? "",
				animStyle: s.animStyle || def.animStyle || "float"
			};
		});
		const usedIds = new Set(upgradedFirst.map((s) => s.id));
		const extras = SEED_THEME_SETTINGS.heroSlides.filter((s) => !usedIds.has(s.id));
		merged.heroSlides = [...upgradedFirst, ...extras];
	}
	return merged;
}
function buildInitialCatalog() {
	let products = Array.isArray(cached.products) ? [...cached.products] : [...SEED_PRODUCTS];
	let categories = Array.isArray(cached.categories) ? [...cached.categories] : [...SEED_CATEGORIES];
	if (!localStorage.getItem(BEAUTY_MERGE_KEY)) {
		const deletedProdIds = getDeletedProductIdSet();
		const catOv = getLocalCatOverrides();
		let ovChanged = false;
		if (catOv.editedById[LEGACY_SKINCARE_CATEGORY_ID]) {
			delete catOv.editedById[LEGACY_SKINCARE_CATEGORY_ID];
			ovChanged = true;
		}
		if (catOv.editedById[BEAUTY_CATEGORY_ID]?.name === "Beauty") {
			catOv.editedById[BEAUTY_CATEGORY_ID] = {
				...catOv.editedById[BEAUTY_CATEGORY_ID],
				name: BEAUTY_UNIFIED_NAME,
				nameBn: BEAUTY_UNIFIED_NAME_BN,
				icon: "🧴"
			};
			ovChanged = true;
		}
		if (ovChanged) saveJson(LOCAL_CAT_OVERRIDES_KEY, catOv);
		const deletedCatIds = new Set(catOv.deletedIds || []);
		const seedById = new Map(SEED_CATEGORIES.map((sc) => [sc.id, sc]));
		categories = categories.filter((c) => c.id !== LEGACY_SKINCARE_CATEGORY_ID).map((c) => {
			if (c.id === BEAUTY_CATEGORY_ID && (c.name === "Beauty" || c.name === "Skincare & Serums")) {
				return {
					...c,
					name: BEAUTY_UNIFIED_NAME,
					nameBn: BEAUTY_UNIFIED_NAME_BN,
					icon: c.icon === "✨" || !c.icon ? "🧴" : c.icon,
					sortOrder: 9
				};
			}
			const seedMatch = seedById.get(c.id);
			if (seedMatch && Number(c.sortOrder) === seedMatch.sortOrder + 1 && seedMatch.sortOrder >= 10) {
				return {
					...c,
					sortOrder: seedMatch.sortOrder
				};
			}
			return c;
		});
		if (!deletedCatIds.has(BEAUTY_CATEGORY_ID) && !categories.some((c) => c.id === BEAUTY_CATEGORY_ID)) {
			const seedCat = seedById.get(BEAUTY_CATEGORY_ID);
			if (seedCat) {
				const override = catOv.editedById[BEAUTY_CATEGORY_ID];
				categories.push(override ? {
					...seedCat,
					...override
				} : { ...seedCat });
			}
		}
		categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
		const targetCategory = resolveCategoryRename(BEAUTY_UNIFIED_NAME);
		const seedProdById = new Map(SEED_PRODUCTS.map((sp) => [sp.id, sp]));
		products = products.map((p) => {
			if (p.category === "Beauty" || p.category === "Skincare & Serums") {
				const seedMatch = seedProdById.get(p.id);
				const nextImages = seedMatch && Array.isArray(p.images) && String(p.images[0] || "").startsWith("data:image/svg+xml") ? seedMatch.images : p.images;
				return {
					...p,
					category: targetCategory,
					images: nextImages
				};
			}
			return p;
		});
		SKINCARE_PRODUCT_IDS.forEach((pid) => {
			if (deletedProdIds.has(pid) || products.some((p) => p.id === pid)) return;
			const seedProd = seedProdById.get(pid);
			if (seedProd) {
				products.push({
					...seedProd,
					category: targetCategory
				});
			}
		});
		try {
			localStorage.setItem(BEAUTY_MERGE_KEY, "1");
		} catch {}
		saveJson(CACHE_KEY, {
			...cached,
			products,
			categories
		});
	}
	return {
		products,
		categories
	};
}
const initialCatalog = buildInitialCatalog();
export const state = {
	loading: false,
	firestoreConnected: false,
	dbStatus: firebaseConfigured ? "connecting" : "error",
	dbError: firebaseConfigured ? "" : "Firebase configuration is missing or incomplete.",
	products: initialCatalog.products,
	categories: initialCatalog.categories,
	posts: mergePostsWithReports(Array.isArray(cached.posts) ? cached.posts : [...SEED_POSTS]),
	reviews: Array.isArray(cached.reviews) ? cached.reviews : [...SEED_REVIEWS],
	orders: Array.isArray(cachedAdminOrders) ? cachedAdminOrders : [],
	subscribers: [],
	general: cached.general ? {
		...SEED_GENERAL_SETTINGS,
		...cached.general
	} : { ...SEED_GENERAL_SETTINGS },
	theme: normalizeThemeSettings(cached.theme),
	ads: cached.ads ? {
		...SEED_ADS_SETTINGS,
		...cached.ads
	} : { ...SEED_ADS_SETTINGS },
	cart: loadJson(CART_KEY, []),
	wishlist: loadJson(WISH_KEY, []),
	recentlyViewed: loadJson(RECENT_KEY, []),
	authUser: null,
	authReady: false,
	isAdmin: false,
	authVerificationRequired: false,
	newOrdersCount: Array.isArray(cachedUnseenIds) ? cachedUnseenIds.length : 0,
	unseenOrderIds: new Set(Array.isArray(cachedUnseenIds) ? cachedUnseenIds : []),
	firestoreProductIds: new Set(),
	blogReports: cachedBlogReports || {},
	lastAddedProductId: ""
};
const listeners = new Set();
let notifyTimer = null;
export function subscribeState(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
export function notifyState() {
	if (notifyTimer) return;
	notifyTimer = requestAnimationFrame(() => {
		notifyTimer = null;
		listeners.forEach((fn) => fn(state));
	});
}
function persistCatalogCache() {
	saveJson(CACHE_KEY, {
		products: state.products,
		categories: state.categories,
		posts: state.posts,
		reviews: state.reviews,
		general: state.general,
		theme: state.theme,
		ads: state.ads
	});
}
export function applyThemeVariables() {
	const root = document.documentElement;
	const t = state.theme || SEED_THEME_SETTINGS;
	const g = state.general || SEED_GENERAL_SETTINGS;
	root.style.setProperty("--primary", t.primaryColor || "#0F766E");
	root.style.setProperty("--accent", t.accentColor || "#FF6B57");
	root.style.setProperty("--bg", t.bgColor || "#FAF8F5");
	if (g.faviconUrl) {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		link.href = g.faviconUrl;
	}
}
export function formatPrice(num) {
	const sym = state.general?.currencySymbol || "৳";
	const val = Math.round(Number(num) || 0);
	return `${sym}${val.toLocaleString("en-US")}`;
}
export function calcDiscountPercent(price, oldPrice) {
	const p = Number(price) || 0;
	const o = Number(oldPrice) || 0;
	if (!o || o <= p) return 0;
	return Math.round((o - p) / o * 100);
}
export function slugify(text) {
	return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "item";
}
export function sanitizeId(id) {
	return String(id || "").replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || `id-${Date.now()}`;
}
export async function sha256Hex(str) {
	const normalized = String(str || "").replace(/\D/g, "");
	const data = new TextEncoder().encode(normalized || String(str));
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
// --- Toast Notification System ---
const toastListeners = new Set();
export function onToast(fn) {
	toastListeners.add(fn);
	return () => toastListeners.delete(fn);
}
export function showToast(message, isError = false) {
	toastListeners.forEach((fn) => fn({
		message,
		isError
	}));
}
// Soft Web Audio chime for new admin orders
function playOrderChime() {
	try {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(587.33, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .14);
		gain.gain.setValueAtTime(.08, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .45);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + .46);
	} catch {}
}
// --- Cart, Wishlist, Recently Viewed ---
export function addToCart(productId, qty = 1, option = "") {
	const prod = state.products.find((p) => p.id === productId);
	if (!prod) return false;
	if ((prod.stock || 0) <= 0) {
		showToast("Sorry, this item is currently out of stock.", true);
		return false;
	}
	const chosenOption = option || Array.isArray(prod.options) && prod.options[0] || "";
	const existing = state.cart.find((c) => c.productId === productId && c.option === chosenOption);
	if (existing) {
		existing.qty = Math.min(prod.stock || 99, existing.qty + qty);
	} else {
		state.cart.push({
			productId: prod.id,
			name: prod.name,
			price: Number(prod.price) || 0,
			image: prod.images && prod.images[0] || "",
			option: chosenOption,
			qty: Math.min(prod.stock || 99, Math.max(1, qty))
		});
	}
	saveJson(CART_KEY, state.cart);
	state.lastAddedProductId = prod.id;
	notifyState();
	setTimeout(() => {
		if (state.lastAddedProductId === prod.id) {
			state.lastAddedProductId = "";
			notifyState();
		}
	}, 900);
	const cartIcon = document.getElementById("header-cart-btn");
	if (cartIcon) {
		cartIcon.classList.remove("cart-bounce");
		void cartIcon.offsetWidth;
		cartIcon.classList.add("cart-bounce");
	}
	showToast(`Added "${prod.name}" to cart`);
	return true;
}
export function updateCartQty(index, delta) {
	const item = state.cart[index];
	if (!item) return;
	const prod = state.products.find((p) => p.id === item.productId);
	const maxStock = prod ? Math.max(1, prod.stock || 1) : 99;
	const next = item.qty + delta;
	if (next <= 0) {
		state.cart.splice(index, 1);
	} else {
		item.qty = Math.min(maxStock, next);
	}
	saveJson(CART_KEY, state.cart);
	notifyState();
}
export function removeFromCart(index) {
	state.cart.splice(index, 1);
	saveJson(CART_KEY, state.cart);
	notifyState();
}
export function clearCart() {
	state.cart = [];
	saveJson(CART_KEY, state.cart);
	notifyState();
}
export function getCartTotals(zone = "inside") {
	const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
	const g = state.general || SEED_GENERAL_SETTINGS;
	const freeMin = Number(g.freeDeliveryMin) || 0;
	let delivery = zone === "inside" ? Number(g.insideDhakaFee ?? 60) : Number(g.outsideDhakaFee ?? 120);
	if (subtotal === 0 || freeMin > 0 && subtotal >= freeMin) {
		delivery = 0;
	}
	return {
		subtotal,
		delivery,
		total: subtotal + delivery,
		itemCount: state.cart.reduce((sum, item) => sum + item.qty, 0)
	};
}
export function toggleWishlist(productId) {
	const idx = state.wishlist.indexOf(productId);
	if (idx >= 0) {
		state.wishlist.splice(idx, 1);
		showToast("Removed from wishlist");
	} else {
		state.wishlist.push(productId);
		showToast("Saved to wishlist");
	}
	saveJson(WISH_KEY, state.wishlist);
	notifyState();
}
export function recordRecentlyViewed(productId) {
	state.recentlyViewed = [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 10);
	saveJson(RECENT_KEY, state.recentlyViewed);
}
// --- Firestore Real-Time Listeners ---
let adminOrdersUnsub = null;
let adminPostsUnsub = null;
let adminSubsUnsub = null;
let publicUnsubs = [];
let knownOrderIds = new Set();
let ordersInitialized = false;
function markDbConnected() {
	if (!state.firestoreConnected || state.dbStatus !== "connected" || state.dbError) {
		state.firestoreConnected = true;
		state.dbStatus = "connected";
		state.dbError = "";
		state.loading = false;
		notifyState();
	}
}
function markDbUnreachable(err, opType, path) {
	handleFirestoreError(err, opType, path);
	state.firestoreConnected = false;
	state.dbStatus = "error";
	state.dbError = formatFirestoreErrorMessage(err);
	state.loading = false;
	notifyState();
}
export async function retryDatabaseConnection() {
	state.dbStatus = "connecting";
	state.dbError = "";
	notifyState();
	const res = await testConnection();
	if (res.ok) {
		markDbConnected();
		initRealtimeSync();
		showToast("Connected to Firebase Firestore (pazaro-bd).");
		return true;
	}
	state.firestoreConnected = false;
	state.dbStatus = "error";
	state.dbError = res.message || "Unable to reach Firebase database.";
	state.loading = false;
	notifyState();
	return false;
}
export function initRealtimeSync() {
	publicUnsubs.forEach((unsub) => {
		try {
			if (typeof unsub === "function") unsub();
		} catch {}
	});
	publicUnsubs = [];
	testConnection().then((res) => {
		if (!res.ok) {
			state.firestoreConnected = false;
			state.dbStatus = "error";
			state.dbError = res.message;
			state.loading = false;
			notifyState();
		} else {
			markDbConnected();
		}
	});
	// 1. Products listener
	publicUnsubs.push(onSnapshot(collection(db, "products"), (snap) => {
		markDbConnected();
		if (!snap.empty || state.firestoreProductIds.size > 0) {
			const deletedIds = !state.isAdmin ? getDeletedProductIdSet() : new Set();
			const catOv = !state.isAdmin ? getLocalCatOverrides() : { renamedFrom: {} };
			const items = [];
			const idSet = new Set();
			const fsMerged = localStorage.getItem(BEAUTY_MERGE_FS_KEY) === "true" || snap.docs.some((d) => d.data().category === BEAUTY_UNIFIED_NAME) && !snap.docs.some((d) => d.data().category === "Skincare & Serums" || d.data().category === "Beauty");
			if (fsMerged) {
				try {
					localStorage.setItem(BEAUTY_MERGE_FS_KEY, "true");
				} catch {}
			}
			const seedProdById = new Map(SEED_PRODUCTS.map((sp) => [sp.id, sp]));
			snap.forEach((d) => {
				idSet.add(d.id);
				if (deletedIds.has(String(d.id))) return;
				const data = d.data();
				let rawCat = data.category;
				let images = data.images;
				if (!fsMerged && (rawCat === "Beauty" || rawCat === "Skincare & Serums")) {
					rawCat = BEAUTY_UNIFIED_NAME;
					const seedMatch = seedProdById.get(d.id);
					if (seedMatch && Array.isArray(images) && String(images[0] || "").startsWith("data:image/svg+xml")) {
						images = seedMatch.images;
					}
				}
				const mappedCat = catOv.renamedFrom[rawCat] || rawCat;
				items.push({
					...data,
					images,
					category: mappedCat,
					id: d.id
				});
			});
			if (!fsMerged) {
				SKINCARE_PRODUCT_IDS.forEach((pid) => {
					if (deletedIds.has(pid) || items.some((p) => p.id === pid)) return;
					const seedProd = seedProdById.get(pid);
					if (seedProd) {
						const mappedCat = catOv.renamedFrom[seedProd.category] || seedProd.category;
						items.push({
							...seedProd,
							category: mappedCat
						});
					}
				});
			}
			state.products = items;
			state.firestoreProductIds = idSet;
			persistCatalogCache();
			notifyState();
		}
	}, (err) => markDbUnreachable(err, OperationType.LIST, "products")));
	// 2. Categories listener
	publicUnsubs.push(onSnapshot(collection(db, "categories"), (snap) => {
		markDbConnected();
		if (!snap.empty) {
			const catOv = !state.isAdmin ? getLocalCatOverrides() : {
				editedById: {},
				deletedIds: []
			};
			const deletedSet = new Set(catOv.deletedIds || []);
			const fsCatMerged = snap.docs.some((d) => d.id === BEAUTY_CATEGORY_ID && d.data().name === BEAUTY_UNIFIED_NAME) && !snap.docs.some((d) => d.id === LEGACY_SKINCARE_CATEGORY_ID);
			if (fsCatMerged) {
				try {
					localStorage.setItem(BEAUTY_MERGE_FS_KEY, "true");
				} catch {}
			}
			const fsMerged = fsCatMerged || localStorage.getItem(BEAUTY_MERGE_FS_KEY) === "true";
			const seedById = new Map(SEED_CATEGORIES.map((sc) => [sc.id, sc]));
			const byId = new Map();
			snap.docs.forEach((d) => {
				if (deletedSet.has(String(d.id))) return;
				if (!fsMerged && d.id === LEGACY_SKINCARE_CATEGORY_ID) return;
				let base = {
					...d.data(),
					id: d.id
				};
				if (!fsMerged) {
					if (d.id === BEAUTY_CATEGORY_ID && (base.name === "Beauty" || base.name === "Skincare & Serums")) {
						base = {
							...base,
							name: BEAUTY_UNIFIED_NAME,
							nameBn: BEAUTY_UNIFIED_NAME_BN,
							icon: base.icon === "✨" || !base.icon ? "🧴" : base.icon,
							sortOrder: 9
						};
					} else {
						const seedMatch = seedById.get(d.id);
						if (seedMatch && Number(base.sortOrder) === seedMatch.sortOrder + 1 && seedMatch.sortOrder >= 10) {
							base = {
								...base,
								sortOrder: seedMatch.sortOrder
							};
						}
					}
				}
				const override = catOv.editedById[d.id];
				byId.set(d.id, override ? {
					...base,
					...override
				} : base);
			});
			Object.values(catOv.editedById || {}).forEach((ovCat) => {
				if (ovCat?.id && ovCat.id !== LEGACY_SKINCARE_CATEGORY_ID && !deletedSet.has(String(ovCat.id)) && !byId.has(ovCat.id)) {
					byId.set(ovCat.id, ovCat);
				}
			});
			const cats = Array.from(byId.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
			state.categories = cats;
			persistCatalogCache();
			notifyState();
		}
	}, (err) => markDbUnreachable(err, OperationType.LIST, "categories")));
	// 3. Published Blog Posts listener
	const pubPostsQ = query(collection(db, "posts"), where("published", "==", true));
	publicUnsubs.push(onSnapshot(pubPostsQ, (snap) => {
		markDbConnected();
		if (!snap.empty && !state.isAdmin) {
			const incoming = snap.docs.map((d) => ({
				...d.data(),
				id: d.id
			}));
			const localDrafts = state.posts.filter((p) => p.published === false);
			const merged = [...incoming];
			localDrafts.forEach((d) => {
				if (!merged.some((m) => m.id === d.id)) merged.push(d);
			});
			state.posts = mergePostsWithReports(merged);
			persistCatalogCache();
			notifyState();
		}
	}, (err) => markDbUnreachable(err, OperationType.LIST, "posts")));
	// 4. Reviews listener
	publicUnsubs.push(onSnapshot(collection(db, "reviews"), (snap) => {
		markDbConnected();
		if (!snap.empty) {
			state.reviews = snap.docs.map((d) => ({
				approved: true,
				...d.data(),
				id: d.id
			}));
			persistCatalogCache();
			notifyState();
		}
	}, (err) => markDbUnreachable(err, OperationType.LIST, "reviews")));
	// 5. Settings listener (general, theme, ads)
	publicUnsubs.push(onSnapshot(collection(db, "settings"), (snap) => {
		markDbConnected();
		snap.forEach((d) => {
			if (d.id === "general") state.general = {
				...SEED_GENERAL_SETTINGS,
				...d.data()
			};
			if (d.id === "theme") state.theme = normalizeThemeSettings(d.data());
			if (d.id === "ads") state.ads = {
				...SEED_ADS_SETTINGS,
				...d.data()
			};
		});
		applyThemeVariables();
		persistCatalogCache();
		notifyState();
	}, (err) => markDbUnreachable(err, OperationType.LIST, "settings")));
	// 6. Auth State Observer
	publicUnsubs.push(onAuthStateChanged(auth, async (user) => {
		state.authUser = user;
		state.authReady = true;
		state.authVerificationRequired = Boolean(user && !user.emailVerified);
		if (user) {
			let verifiedAdmin = user.email === "mahinurislammaruf@gmail.com" && user.emailVerified;
			if (!verifiedAdmin && user.emailVerified) {
				try {
					const adminDoc = await getDoc(doc(db, "admins", user.uid));
					if (adminDoc.exists()) verifiedAdmin = true;
				} catch {
					verifiedAdmin = false;
				}
			}
			state.isAdmin = verifiedAdmin;
			if (verifiedAdmin) {
				attachAdminListeners();
				autoSeedIfEmpty().then(() => syncBeautySkincareMergeToFirestoreIfNeeded());
			} else {
				detachAdminListeners();
			}
		} else {
			state.isAdmin = false;
			state.authVerificationRequired = false;
			detachAdminListeners();
		}
		notifyState();
	}));
}
export function markOrdersSeen() {
	state.unseenOrderIds.clear();
	state.newOrdersCount = 0;
	saveJson(UNSEEN_ORDERS_KEY, []);
	notifyState();
}
function mergeOrdersWithLocalCache(firestoreList) {
	const localOrders = loadJson(ADMIN_ORDERS_CACHE_KEY, []);
	const byId = new Map();
	(firestoreList || []).forEach((o) => byId.set(o.id, o));
	(localOrders || []).forEach((o) => {
		if (!byId.has(o.id)) byId.set(o.id, o);
	});
	return Array.from(byId.values()).sort((a, b) => {
		const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
		const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
		return tb - ta;
	});
}
function attachAdminListeners() {
	if (!adminOrdersUnsub) {
		adminOrdersUnsub = onSnapshot(collection(db, "orders"), (snap) => {
			const list = snap.docs.map((d) => ({
				...d.data(),
				id: d.id
			}));
			const merged = mergeOrdersWithLocalCache(list);
			if (ordersInitialized) {
				let addedNew = false;
				merged.forEach((ord) => {
					if (!knownOrderIds.has(ord.id)) {
						state.unseenOrderIds.add(ord.id);
						addedNew = true;
					}
				});
				if (addedNew) {
					state.newOrdersCount = state.unseenOrderIds.size;
					saveJson(UNSEEN_ORDERS_KEY, Array.from(state.unseenOrderIds));
					playOrderChime();
					showToast("New customer order received!");
				}
			}
			knownOrderIds = new Set(merged.map((o) => o.id));
			ordersInitialized = true;
			state.orders = merged;
			saveJson(ADMIN_ORDERS_CACHE_KEY, merged.slice(0, 100));
			notifyState();
		}, (err) => handleFirestoreError(err, OperationType.LIST, "orders"));
	}
	if (!adminPostsUnsub) {
		adminPostsUnsub = onSnapshot(collection(db, "posts"), (snap) => {
			if (!snap.empty) {
				state.posts = mergePostsWithReports(snap.docs.map((d) => ({
					...d.data(),
					id: d.id
				})));
				persistCatalogCache();
				notifyState();
			}
		}, (err) => handleFirestoreError(err, OperationType.LIST, "posts"));
	}
	if (!adminSubsUnsub) {
		adminSubsUnsub = onSnapshot(collection(db, "subscribers"), (snap) => {
			state.subscribers = snap.docs.map((d) => ({
				...d.data(),
				id: d.id
			}));
			notifyState();
		}, (err) => handleFirestoreError(err, OperationType.LIST, "subscribers"));
	}
}
function detachAdminListeners() {
	if (adminOrdersUnsub) {
		adminOrdersUnsub();
		adminOrdersUnsub = null;
	}
	if (adminPostsUnsub) {
		adminPostsUnsub();
		adminPostsUnsub = null;
	}
	if (adminSubsUnsub) {
		adminSubsUnsub();
		adminSubsUnsub = null;
	}
	state.orders = loadJson(ADMIN_ORDERS_CACHE_KEY, []);
	state.subscribers = [];
	ordersInitialized = false;
}
async function autoSeedIfEmpty() {
	if (localStorage.getItem(SEEDED_FLAG_KEY) === "true") {
		// Still check if products collection is actually empty on server
		try {
			const snap = await getDocs(collection(db, "products"));
			if (!snap.empty) return;
		} catch {
			return;
		}
	}
	try {
		const snap = await getDocs(collection(db, "products"));
		if (snap.empty) {
			await seedDemoDataToFirestore(false);
		}
		localStorage.setItem(SEEDED_FLAG_KEY, "true");
	} catch (err) {
		handleFirestoreError(err, OperationType.LIST, "products");
	}
}
async function syncBeautySkincareMergeToFirestoreIfNeeded() {
	if (localStorage.getItem(BEAUTY_MERGE_FS_KEY) === "true") return;
	try {
		const [catSnap, prodSnap] = await Promise.all([getDocs(collection(db, "categories")), getDocs(collection(db, "products"))]);
		if (catSnap.empty && prodSnap.empty) return;
		const catById = new Map(catSnap.docs.map((d) => [d.id, d.data()]));
		const prodById = new Map(prodSnap.docs.map((d) => [d.id, d.data()]));
		const seedById = new Map(SEED_CATEGORIES.map((sc) => [sc.id, sc]));
		const seedProdById = new Map(SEED_PRODUCTS.map((sp) => [sp.id, sp]));
		const hasLegacyCat = catById.has(LEGACY_SKINCARE_CATEGORY_ID);
		const hasLegacyProdCat = prodSnap.docs.some((d) => d.data().category === "Beauty" || d.data().category === "Skincare & Serums");
		const allSeedPresent = SKINCARE_PRODUCT_IDS.every((id) => prodById.has(id));
		const beautyDoc = catById.get(BEAUTY_CATEGORY_ID);
		if (!hasLegacyCat && !hasLegacyProdCat && allSeedPresent && beautyDoc?.name === BEAUTY_UNIFIED_NAME) {
			localStorage.setItem(BEAUTY_MERGE_FS_KEY, "true");
			return;
		}
		const catOv = getLocalCatOverrides();
		const deletedCatSet = new Set(catOv.deletedIds || []);
		const deletedProdSet = getDeletedProductIdSet();
		const batch = writeBatch(db);
		let hasWrites = false;
		if (hasLegacyCat) {
			batch.delete(doc(db, "categories", LEGACY_SKINCARE_CATEGORY_ID));
			hasWrites = true;
		}
		if (!deletedCatSet.has(BEAUTY_CATEGORY_ID)) {
			const seedBeauty = seedById.get(BEAUTY_CATEGORY_ID);
			if (!beautyDoc || beautyDoc.name === "Beauty" || beautyDoc.name === "Skincare & Serums") {
				const override = catOv.editedById[BEAUTY_CATEGORY_ID];
				const nextCat = override && override.name !== "Beauty" ? {
					...seedBeauty,
					...override
				} : seedBeauty;
				batch.set(doc(db, "categories", BEAUTY_CATEGORY_ID), {
					...nextCat,
					updatedAt: serverTimestamp()
				}, { merge: true });
				hasWrites = true;
			}
		}
		catSnap.docs.forEach((d) => {
			const seedMatch = seedById.get(d.id);
			if (seedMatch && seedMatch.sortOrder >= 10 && Number(d.data().sortOrder) === seedMatch.sortOrder + 1) {
				batch.update(doc(db, "categories", d.id), {
					sortOrder: seedMatch.sortOrder,
					updatedAt: serverTimestamp()
				});
				hasWrites = true;
			}
		});
		const targetCategory = resolveCategoryRename(BEAUTY_UNIFIED_NAME);
		prodSnap.docs.forEach((d) => {
			const data = d.data();
			if (data.category === "Beauty" || data.category === "Skincare & Serums") {
				const updateData = {
					category: targetCategory,
					updatedAt: serverTimestamp()
				};
				const seedMatch = seedProdById.get(d.id);
				if (seedMatch && Array.isArray(data.images) && String(data.images[0] || "").startsWith("data:image/svg+xml")) {
					updateData.images = seedMatch.images;
				}
				batch.update(doc(db, "products", d.id), updateData);
				hasWrites = true;
			}
		});
		SKINCARE_PRODUCT_IDS.forEach((pid) => {
			if (prodById.has(pid) || deletedProdSet.has(pid)) return;
			const seedProd = seedProdById.get(pid);
			if (seedProd) {
				batch.set(doc(db, "products", pid), {
					...seedProd,
					category: targetCategory,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
				hasWrites = true;
			}
		});
		if (hasWrites) {
			await batch.commit();
		}
		localStorage.setItem(BEAUTY_MERGE_FS_KEY, "true");
	} catch (err) {
		handleFirestoreError(err, OperationType.WRITE, "beauty-skincare-merge");
	}
}
export async function seedDemoDataToFirestore(showNotification = true) {
	try {
		const batch = writeBatch(db);
		SEED_CATEGORIES.forEach((cat) => {
			batch.set(doc(db, "categories", cat.id), {
				...cat,
				updatedAt: serverTimestamp()
			});
		});
		batch.delete(doc(db, "categories", LEGACY_SKINCARE_CATEGORY_ID));
		SEED_PRODUCTS.forEach((prod) => {
			batch.set(doc(db, "products", prod.id), {
				...prod,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});
		});
		SEED_POSTS.forEach((post) => {
			batch.set(doc(db, "posts", post.id), {
				...post,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});
		});
		SEED_REVIEWS.forEach((rev) => {
			batch.set(doc(db, "reviews", rev.id), {
				...rev,
				createdAt: serverTimestamp()
			});
		});
		batch.set(doc(db, "settings", "general"), {
			...SEED_GENERAL_SETTINGS,
			updatedAt: serverTimestamp()
		});
		batch.set(doc(db, "settings", "theme"), {
			...SEED_THEME_SETTINGS,
			updatedAt: serverTimestamp()
		});
		batch.set(doc(db, "settings", "ads"), {
			...SEED_ADS_SETTINGS,
			updatedAt: serverTimestamp()
		});
		await batch.commit();
		saveJson(DELETED_PRODUCTS_KEY, []);
		saveJson(LOCAL_CAT_OVERRIDES_KEY, {
			editedById: {},
			renamedFrom: {},
			deletedIds: []
		});
		localStorage.setItem(SEEDED_FLAG_KEY, "true");
		localStorage.setItem(BEAUTY_MERGE_KEY, "1");
		localStorage.setItem(BEAUTY_MERGE_FS_KEY, "true");
		if (showNotification) showToast(`All ${SEED_PRODUCTS.length} demo products, categories, posts, reviews & settings synced to Firestore.`);
	} catch (err) {
		handleFirestoreError(err, OperationType.WRITE, "seed");
		if (showNotification) showToast("Failed to seed Firestore. Check admin permissions.", true);
	}
}
// --- Auth Actions ---
export async function loginAdminEmail(email, password) {
	const cred = await signInWithEmailAndPassword(auth, email, password);
	return cred.user;
}
export async function loginAdminGoogle() {
	const cred = await signInWithPopup(auth, googleProvider);
	return cred.user;
}
export async function sendAdminVerificationEmail() {
	if (!auth.currentUser) throw new Error("No signed-in user.");
	await sendEmailVerification(auth.currentUser);
	showToast(`Verification email sent to ${auth.currentUser.email}.`);
}
export async function refreshAuthVerification() {
	if (!auth.currentUser) return false;
	await reload(auth.currentUser);
	const user = auth.currentUser;
	state.authUser = user;
	state.authVerificationRequired = Boolean(user && !user.emailVerified);
	let verifiedAdmin = user.email === "mahinurislammaruf@gmail.com" && user.emailVerified;
	if (!verifiedAdmin && user.emailVerified) {
		try {
			const adminDoc = await getDoc(doc(db, "admins", user.uid));
			if (adminDoc.exists()) verifiedAdmin = true;
		} catch {
			verifiedAdmin = false;
		}
	}
	state.isAdmin = verifiedAdmin;
	if (verifiedAdmin) {
		attachAdminListeners();
		autoSeedIfEmpty().then(() => syncBeautySkincareMergeToFirestoreIfNeeded());
		showToast("Admin Firebase account verified!");
	} else if (!user.emailVerified) {
		showToast("Email is still unverified. Check your inbox or Firebase Console.", true);
	}
	notifyState();
	return verifiedAdmin;
}
export async function logoutAdmin() {
	await signOut(auth);
	state.isAdmin = false;
	state.authVerificationRequired = false;
	notifyState();
}
// --- Public Customer Actions ---
export async function placeOrder({ customerName, phone, division, district, upazila = "", address, mapLat = null, mapLng = null, paymentMethod, paymentNumber, notes }) {
	if (!state.cart.length) throw new Error("Your cart is empty.");
	const cleanName = String(customerName || "").trim();
	const cleanPhone = String(phone || "").trim();
	const cleanDivision = String(division || "").trim();
	const cleanDistrict = String(district || "").trim();
	const cleanUpazila = String(upazila || "").trim();
	const cleanAddress = String(address || "").trim();
	if (cleanName.length < 2) throw new Error("Please enter your full name.");
	if (cleanPhone.replace(/\D/g, "").length < 6) throw new Error("Please enter a valid mobile number.");
	if (!cleanDivision || !cleanDistrict) {
		throw new Error("Please select your Division and District.");
	}
	if (cleanAddress.length < 4) throw new Error("Please enter your full detailed delivery address.");
	const zone = cleanDistrict === "Dhaka" ? "inside" : "outside";
	const totals = getCartTotals(zone);
	const rand = Math.floor(1e3 + Math.random() * 9e3);
	const orderCode = `PB-2026-${rand}`;
	const orderId = orderCode;
	const phoneHash = await sha256Hex(cleanPhone);
	const orderItems = state.cart.map((item) => ({
		productId: item.productId,
		name: item.name,
		price: Number(item.price),
		qty: Number(item.qty),
		option: item.option || ""
	}));
	const orderPayload = {
		id: orderId,
		orderCode,
		customerName: cleanName.slice(0, 120),
		phone: cleanPhone.slice(0, 30),
		phoneHash,
		division: cleanDivision.slice(0, 80),
		district: cleanDistrict.slice(0, 80),
		upazila: cleanUpazila.slice(0, 80),
		address: cleanAddress.slice(0, 500),
		paymentMethod,
		paymentNumber: (paymentNumber || "").trim().slice(0, 40),
		items: orderItems,
		subtotal: totals.subtotal,
		deliveryCharge: totals.delivery,
		total: totals.total,
		status: "Pending",
		notes: (notes || "").trim().slice(0, 500),
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	};
	if (typeof mapLat === "number" && Number.isFinite(mapLat) && typeof mapLng === "number" && Number.isFinite(mapLng)) {
		orderPayload.mapLat = Number(mapLat.toFixed(6));
		orderPayload.mapLng = Number(mapLng.toFixed(6));
	}
	const batch = writeBatch(db);
	batch.set(doc(db, "orders", orderId), orderPayload);
	batch.set(doc(db, "orderTracking", orderId), {
		id: orderId,
		orderCode,
		division: cleanDivision.slice(0, 80),
		district: cleanDistrict.slice(0, 80),
		upazila: cleanUpazila.slice(0, 80),
		itemCount: totals.itemCount,
		total: totals.total,
		paymentMethod,
		status: "Pending",
		phoneHash,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
	// Update phoneLookup for tracking by phone
	try {
		const lookupRef = doc(db, "phoneLookups", phoneHash);
		const existingLookup = await getDoc(lookupRef);
		const existingCodes = existingLookup.exists() && Array.isArray(existingLookup.data().orderCodes) ? existingLookup.data().orderCodes : [];
		const nextCodes = [orderCode, ...existingCodes.filter((c) => c !== orderCode)].slice(0, 20);
		batch.set(lookupRef, {
			orderCodes: nextCodes,
			updatedAt: serverTimestamp()
		});
	} catch {}
	// Update stock/unitsSold in Firestore only when signed in as verified Admin (public writes on /products are blocked by security rules)
	for (const item of orderItems) {
		const prod = state.products.find((p) => p.id === item.productId);
		if (!prod) continue;
		const nextStock = Math.max(0, (prod.stock || 0) - item.qty);
		const nextSold = (prod.unitsSold || 0) + item.qty;
		if (state.isAdmin && state.firestoreProductIds.has(item.productId) && prod.stock >= item.qty) {
			const prodRef = doc(db, "products", item.productId);
			batch.update(prodRef, {
				stock: nextStock,
				unitsSold: nextSold,
				updatedAt: serverTimestamp()
			});
		} else {
			prod.stock = nextStock;
			prod.unitsSold = nextSold;
		}
	}
	let firestoreSaved = false;
	try {
		await batch.commit();
		firestoreSaved = true;
	} catch (err) {
		handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
		// Keep checkout resilient offline while surfacing warning only if non-network
		if (!navigator.onLine) {
			firestoreSaved = false;
		} else {
			throw err;
		}
	}
	const nowIso = new Date().toISOString();
	const localFullOrder = {
		...orderPayload,
		createdAt: nowIso,
		updatedAt: nowIso,
		syncedToFirestore: firestoreSaved
	};
	const existingAdminOrders = loadJson(ADMIN_ORDERS_CACHE_KEY, []);
	const nextAdminOrders = [localFullOrder, ...existingAdminOrders.filter((o) => o.id !== orderId)].slice(0, 100);
	saveJson(ADMIN_ORDERS_CACHE_KEY, nextAdminOrders);
	state.orders = mergeOrdersWithLocalCache(state.orders);
	state.unseenOrderIds.add(orderId);
	state.newOrdersCount = state.unseenOrderIds.size;
	saveJson(UNSEEN_ORDERS_KEY, Array.from(state.unseenOrderIds));
	persistCatalogCache();
	// Save non-sensitive local tracking receipt (including ordered items for Account Order History)
	const receipt = {
		orderCode,
		customerName: cleanName.slice(0, 120),
		division: cleanDivision,
		district: cleanDistrict,
		upazila: cleanUpazila,
		items: orderItems.map((i) => ({
			productId: i.productId,
			name: i.name,
			price: i.price,
			qty: i.qty,
			option: i.option || "",
			image: i.image || ""
		})),
		itemCount: totals.itemCount,
		subtotal: totals.subtotal,
		deliveryCharge: totals.delivery,
		total: totals.total,
		paymentMethod,
		status: "Pending",
		phoneHash,
		createdAt: nowIso
	};
	const localOrders = loadJson(LOCAL_ORDERS_KEY, []);
	saveJson(LOCAL_ORDERS_KEY, [receipt, ...localOrders].slice(0, 30));
	clearCart();
	notifyState();
	return receipt;
}
export function getLocalOrders() {
	const receipts = loadJson(LOCAL_ORDERS_KEY, []);
	if (!Array.isArray(receipts)) return [];
	const adminByCode = new Map((state.orders || []).map((o) => [String(o.orderCode || o.id), o]));
	return receipts.map((r) => {
		const live = adminByCode.get(String(r.orderCode || ""));
		if (!live) return r;
		return {
			...r,
			status: live.status || r.status,
			items: Array.isArray(r.items) && r.items.length ? r.items : live.items || r.items || []
		};
	});
}
export async function refreshLocalOrdersStatus() {
	const receipts = loadJson(LOCAL_ORDERS_KEY, []);
	if (!Array.isArray(receipts) || !receipts.length) return [];
	let changed = false;
	const updated = await Promise.all(receipts.map(async (r) => {
		if (!r?.orderCode) return r;
		try {
			const snap = await getDoc(doc(db, "orderTracking", String(r.orderCode)));
			if (snap.exists()) {
				const serverStatus = snap.data().status;
				if (serverStatus && serverStatus !== r.status) {
					changed = true;
					return {
						...r,
						status: serverStatus
					};
				}
			}
		} catch {}
		return r;
	}));
	if (changed) {
		saveJson(LOCAL_ORDERS_KEY, updated);
		notifyState();
	}
	return updated;
}
export async function trackOrders(queryInput) {
	const clean = String(queryInput || "").trim();
	if (!clean) return [];
	const results = [];
	const normalizedCode = clean.toUpperCase();
	// 1. Try direct Order ID lookup
	if (/^[a-zA-Z0-9_-]{3,40}$/.test(normalizedCode)) {
		try {
			const snap = await getDoc(doc(db, "orderTracking", normalizedCode));
			if (snap.exists()) {
				results.push({
					...snap.data(),
					id: snap.id
				});
			}
		} catch (err) {
			handleFirestoreError(err, OperationType.GET, `orderTracking/${normalizedCode}`);
		}
	}
	// 2. Try phone hash lookup if digits >= 6
	const digits = clean.replace(/\D/g, "");
	if (!results.length && digits.length >= 6) {
		try {
			const pHash = await sha256Hex(digits);
			const lookupSnap = await getDoc(doc(db, "phoneLookups", pHash));
			if (lookupSnap.exists()) {
				const codes = lookupSnap.data().orderCodes || [];
				for (const code of codes.slice(0, 5)) {
					const trackSnap = await getDoc(doc(db, "orderTracking", code));
					if (trackSnap.exists()) {
						results.push({
							...trackSnap.data(),
							id: trackSnap.id
						});
					}
				}
			}
		} catch (err) {
			handleFirestoreError(err, OperationType.GET, "phoneLookups");
		}
	}
	// 3. Fallback to local browser receipts if offline or newly placed
	if (!results.length) {
		const local = loadJson(LOCAL_ORDERS_KEY, []);
		const pHash = digits.length >= 6 ? await sha256Hex(digits) : "";
		local.forEach((item) => {
			if (item.orderCode.toUpperCase() === normalizedCode || pHash && item.phoneHash === pHash) {
				results.push(item);
			}
		});
	}
	return results;
}
export async function submitCustomerReview({ productId, productName, authorName, city, rating, comment }) {
	const id = `rev-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
	const payload = {
		id,
		productId: productId || "",
		productName: productName || "",
		authorName: authorName.trim().slice(0, 100),
		city: (city || "Bangladesh").trim().slice(0, 80),
		rating: Math.max(1, Math.min(5, parseInt(rating, 10) || 5)),
		approved: true,
		comment: comment.trim().slice(0, 1500),
		createdAt: serverTimestamp()
	};
	try {
		await setDoc(doc(db, "reviews", id), payload);
		state.reviews = [{
			...payload,
			createdAt: new Date().toISOString()
		}, ...state.reviews.filter((r) => r.id !== id)];
		persistCatalogCache();
		notifyState();
		showToast("Thank you! Your review has been published.");
	} catch (err) {
		handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
		throw err;
	}
}
export function reportBlogIssue(postId, note = "Reader reported an issue or outdated info.") {
	const cleanNote = String(note || "").trim().slice(0, 400) || "Reader reported an issue.";
	const reports = loadJson(BLOG_REPORTS_KEY, {});
	reports[postId] = {
		issueFlag: true,
		issueNote: cleanNote,
		reportedAt: new Date().toISOString()
	};
	saveJson(BLOG_REPORTS_KEY, reports);
	state.blogReports = reports;
	state.posts = mergePostsWithReports(state.posts);
	persistCatalogCache();
	notifyState();
	showToast("Issue flagged for review by our editorial team.");
}
export async function subscribeNewsletter(email) {
	const clean = String(email || "").trim().toLowerCase();
	if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
		throw new Error("Please enter a valid email address.");
	}
	const id = `sub-${sanitizeId(clean)}`;
	try {
		await setDoc(doc(db, "subscribers", id), {
			email: clean,
			createdAt: serverTimestamp()
		});
		showToast("Subscribed! Welcome to Pazaro BD updates.");
	} catch (err) {
		handleFirestoreError(err, OperationType.CREATE, `subscribers/${id}`);
		throw err;
	}
}
// --- Admin CRUD Actions ---
export async function uploadAssetToStorage(file, folder = "uploads") {
	if (!file) throw new Error("No file selected.");
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storageRef = ref(storage, `pazarobd/${folder}/${Date.now()}-${safeName}`);
	const snap = await uploadBytes(storageRef, file);
	return getDownloadURL(snap.ref);
}
export async function saveProduct(productData, isNew = false) {
	const id = isNew ? sanitizeId(`prod-${slugify(productData.name)}-${Date.now().toString(36).slice(-4)}`) : productData.id;
	const basePayload = {
		id,
		name: String(productData.name || "").trim().slice(0, 200),
		slug: slugify(productData.name),
		brand: String(productData.brand || "").trim().slice(0, 100),
		category: String(productData.category || "Phones").trim().slice(0, 100),
		price: Math.max(0, Number(productData.price) || 0),
		oldPrice: Math.max(0, Number(productData.oldPrice) || 0),
		stock: Math.max(0, parseInt(productData.stock, 10) || 0),
		unitsSold: Math.max(0, parseInt(productData.unitsSold, 10) || 0),
		sku: String(productData.sku || "").trim().slice(0, 80),
		rating: Math.max(0, Math.min(5, Number(productData.rating) || 4.7)),
		reviewCount: Math.max(0, parseInt(productData.reviewCount, 10) || 0),
		shortDescription: String(productData.shortDescription || "").trim().slice(0, 500),
		fullDescription: String(productData.fullDescription || "").trim().slice(0, 8e3),
		features: (productData.features || []).slice(0, 20),
		specs: (productData.specs || []).slice(0, 30),
		options: (productData.options || []).slice(0, 20),
		tags: (productData.tags || []).slice(0, 20),
		images: (productData.images || []).filter(Boolean).slice(0, 5),
		videoUrl: String(productData.videoUrl || "").trim().slice(0, 1e3),
		videoPoster: String(productData.videoPoster || "").trim().slice(0, 1e3),
		deliveryInfo: String(productData.deliveryInfo || "Inside Dhaka ৳60 (24-48h). Outside Dhaka ৳120 (2-4 days).").slice(0, 500),
		returnPolicy: String(productData.returnPolicy || "7-day easy replacement on unopened or defective items.").slice(0, 500),
		isFeatured: Boolean(productData.isFeatured),
		isFlashSale: Boolean(productData.isFlashSale),
		isTrending: Boolean(productData.isTrending),
		isNewArrival: Boolean(productData.isNewArrival)
	};
	unmarkProductDeletedLocally(id);
	if (state.isAdmin) {
		const payload = {
			...basePayload,
			updatedAt: serverTimestamp()
		};
		if (isNew) payload.createdAt = serverTimestamp();
		try {
			await setDoc(doc(db, "products", id), payload, { merge: true });
			showToast(isNew ? "Product added & synced live!" : "Product updated & synced live!");
			return id;
		} catch (err) {
			handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
			throw err;
		}
	} else {
		const idx = state.products.findIndex((p) => p.id === id);
		if (idx >= 0) state.products[idx] = {
			...state.products[idx],
			...basePayload
		};
		else state.products.unshift(basePayload);
		persistCatalogCache();
		notifyState();
		showToast(isNew ? "Product added (saved locally)." : "Product updated (saved locally).");
		return id;
	}
}
export async function deleteProduct(productId) {
	const targetId = String(productId || "");
	if (!targetId) return;
	if (state.isAdmin) {
		try {
			await deleteDoc(doc(db, "products", targetId));
			unmarkProductDeletedLocally(targetId);
		} catch (err) {
			handleFirestoreError(err, OperationType.DELETE, `products/${targetId}`);
			throw err;
		}
	} else {
		markProductDeletedLocally(targetId);
	}
	state.products = state.products.filter((p) => String(p.id) !== targetId);
	state.firestoreProductIds.delete(targetId);
	if (state.cart.some((c) => String(c.productId) === targetId)) {
		state.cart = state.cart.filter((c) => String(c.productId) !== targetId);
		saveJson(CART_KEY, state.cart);
	}
	if (state.wishlist.some((id) => String(id) === targetId)) {
		state.wishlist = state.wishlist.filter((id) => String(id) !== targetId);
		saveJson(WISH_KEY, state.wishlist);
	}
	if (state.recentlyViewed.some((id) => String(id) === targetId)) {
		state.recentlyViewed = state.recentlyViewed.filter((id) => String(id) !== targetId);
		saveJson(RECENT_KEY, state.recentlyViewed);
	}
	persistCatalogCache();
	notifyState();
	showToast("Product deleted.");
}
export async function saveCategory(catData, isNew = false) {
	const id = isNew ? sanitizeId(`cat-${slugify(catData.name)}-${Date.now().toString(36).slice(-3)}`) : catData.id;
	const existingCat = !isNew ? state.categories.find((c) => c.id === id) : null;
	const oldName = existingCat?.name || "";
	const newName = String(catData.name || "").trim().slice(0, 100);
	if (!newName) throw new Error("Category name is required.");
	const basePayload = {
		id,
		name: newName,
		nameBn: String(catData.nameBn ?? existingCat?.nameBn ?? "").trim().slice(0, 120),
		icon: String(catData.icon ?? existingCat?.icon ?? "🛍️").trim().slice(0, 60),
		imageUrl: String(catData.imageUrl ?? existingCat?.imageUrl ?? "").trim().slice(0, 1e3),
		sortOrder: parseInt(catData.sortOrder ?? existingCat?.sortOrder, 10) || 1
	};
	const renamed = Boolean(!isNew && oldName && oldName !== newName);
	if (state.isAdmin) {
		try {
			const batch = writeBatch(db);
			batch.set(doc(db, "categories", id), {
				...basePayload,
				updatedAt: serverTimestamp()
			}, { merge: true });
			if (renamed) {
				state.products.forEach((p) => {
					if (p.category === oldName && state.firestoreProductIds.has(p.id)) {
						batch.update(doc(db, "products", p.id), {
							category: newName,
							updatedAt: serverTimestamp()
						});
					}
				});
			}
			await batch.commit();
			const ov = getLocalCatOverrides();
			delete ov.editedById[id];
			if (renamed) delete ov.renamedFrom[oldName];
			saveJson(LOCAL_CAT_OVERRIDES_KEY, ov);
		} catch (err) {
			handleFirestoreError(err, OperationType.WRITE, `categories/${id}`);
			throw err;
		}
	} else {
		const ov = getLocalCatOverrides();
		ov.editedById[id] = basePayload;
		ov.deletedIds = ov.deletedIds.filter((delId) => delId !== String(id));
		if (renamed) {
			Object.keys(ov.renamedFrom).forEach((orig) => {
				if (ov.renamedFrom[orig] === oldName) ov.renamedFrom[orig] = newName;
			});
			ov.renamedFrom[oldName] = newName;
		}
		saveJson(LOCAL_CAT_OVERRIDES_KEY, ov);
	}
	const idx = state.categories.findIndex((c) => c.id === id);
	if (idx >= 0) state.categories[idx] = basePayload;
	else state.categories.push(basePayload);
	state.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
	if (renamed) {
		state.products = state.products.map((p) => p.category === oldName ? {
			...p,
			category: newName
		} : p);
	}
	persistCatalogCache();
	notifyState();
	showToast(renamed ? `Category renamed to "${newName}" & updated products.` : "Category saved.");
	return {
		id,
		oldName,
		newName,
		renamed
	};
}
export async function deleteCategory(catId) {
	const targetId = String(catId || "");
	if (!targetId) return;
	if (state.isAdmin) {
		try {
			await deleteDoc(doc(db, "categories", targetId));
		} catch (err) {
			handleFirestoreError(err, OperationType.DELETE, `categories/${targetId}`);
			throw err;
		}
	} else {
		const ov = getLocalCatOverrides();
		delete ov.editedById[targetId];
		if (!ov.deletedIds.includes(targetId)) ov.deletedIds.push(targetId);
		saveJson(LOCAL_CAT_OVERRIDES_KEY, ov);
	}
	state.categories = state.categories.filter((c) => String(c.id) !== targetId);
	persistCatalogCache();
	notifyState();
	showToast("Category deleted.");
}
export async function updateOrderStatus(orderId, newStatus) {
	const order = state.orders.find((o) => o.id === orderId);
	if (!order) return;
	const prevStatus = order.status;
	if (prevStatus === newStatus) return;
	const becomingCancelled = prevStatus !== "Cancelled" && newStatus === "Cancelled";
	const unCancelling = prevStatus === "Cancelled" && newStatus !== "Cancelled";
	if (state.isAdmin && order.syncedToFirestore !== false) {
		const batch = writeBatch(db);
		batch.update(doc(db, "orders", orderId), {
			status: newStatus,
			updatedAt: serverTimestamp()
		});
		batch.set(doc(db, "orderTracking", orderId), {
			id: orderId,
			orderCode: order.orderCode,
			division: order.division || "",
			district: order.district,
			upazila: order.upazila || "",
			itemCount: (order.items || []).reduce((s, i) => s + (i.qty || 1), 0),
			total: order.total,
			paymentMethod: order.paymentMethod,
			status: newStatus,
			phoneHash: order.phoneHash || "",
			createdAt: order.createdAt || serverTimestamp(),
			updatedAt: serverTimestamp()
		}, { merge: true });
		if (becomingCancelled || unCancelling) {
			for (const item of order.items || []) {
				const prod = state.products.find((p) => p.id === item.productId);
				if (prod && state.firestoreProductIds.has(prod.id)) {
					const qty = Number(item.qty) || 1;
					const nextStock = becomingCancelled ? (prod.stock || 0) + qty : Math.max(0, (prod.stock || 0) - qty);
					const nextSold = becomingCancelled ? Math.max(0, (prod.unitsSold || 0) - qty) : (prod.unitsSold || 0) + qty;
					batch.update(doc(db, "products", prod.id), {
						stock: nextStock,
						unitsSold: nextSold,
						updatedAt: serverTimestamp()
					});
				}
			}
		}
		try {
			await batch.commit();
			showToast(`Order ${order.orderCode} updated to ${newStatus}`);
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
			throw err;
		}
	}
	order.status = newStatus;
	if (becomingCancelled || unCancelling) {
		for (const item of order.items || []) {
			const prod = state.products.find((p) => p.id === item.productId);
			if (prod) {
				const qty = Number(item.qty) || 1;
				prod.stock = becomingCancelled ? (prod.stock || 0) + qty : Math.max(0, (prod.stock || 0) - qty);
				prod.unitsSold = becomingCancelled ? Math.max(0, (prod.unitsSold || 0) - qty) : (prod.unitsSold || 0) + qty;
			}
		}
		persistCatalogCache();
	}
	saveJson(ADMIN_ORDERS_CACHE_KEY, state.orders);
	notifyState();
	showToast(`Order ${order.orderCode} updated to ${newStatus}`);
}
export async function deleteOrder(orderId) {
	if (state.isAdmin) {
		try {
			const batch = writeBatch(db);
			batch.delete(doc(db, "orders", orderId));
			batch.delete(doc(db, "orderTracking", orderId));
			await batch.commit();
		} catch (err) {
			handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
			throw err;
		}
	}
	state.orders = state.orders.filter((o) => o.id !== orderId);
	state.unseenOrderIds.delete(orderId);
	state.newOrdersCount = state.unseenOrderIds.size;
	saveJson(UNSEEN_ORDERS_KEY, Array.from(state.unseenOrderIds));
	saveJson(ADMIN_ORDERS_CACHE_KEY, state.orders);
	notifyState();
	showToast("Order deleted.");
}
export async function savePost(postData, isNew = false) {
	const id = isNew ? sanitizeId(`post-${slugify(postData.title)}-${Date.now().toString(36).slice(-4)}`) : postData.id;
	const basePayload = {
		id,
		title: String(postData.title || "").trim().slice(0, 200),
		slug: slugify(postData.title),
		category: String(postData.category || "Buying Guide").trim().slice(0, 80),
		coverImage: String(postData.coverImage || "").trim().slice(0, 1e3),
		excerpt: String(postData.excerpt || "").trim().slice(0, 400),
		body: String(postData.body || "").trim().slice(0, 25e3),
		tags: (postData.tags || []).slice(0, 15),
		published: Boolean(postData.published),
		issueFlag: Boolean(postData.issueFlag),
		issueNote: String(postData.issueNote || "").trim().slice(0, 500)
	};
	// Update local report map cleanly
	const reports = loadJson(BLOG_REPORTS_KEY, {});
	if (!basePayload.issueFlag) {
		delete reports[id];
	} else {
		reports[id] = {
			issueFlag: true,
			issueNote: basePayload.issueNote,
			reportedAt: new Date().toISOString()
		};
	}
	saveJson(BLOG_REPORTS_KEY, reports);
	state.blogReports = reports;
	if (state.isAdmin) {
		const payload = {
			...basePayload,
			updatedAt: serverTimestamp()
		};
		if (isNew) payload.createdAt = serverTimestamp();
		try {
			await setDoc(doc(db, "posts", id), payload, { merge: true });
			showToast(isNew ? "Blog post created." : "Blog post updated.");
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.WRITE, `posts/${id}`);
			throw err;
		}
	}
	const idx = state.posts.findIndex((p) => p.id === id);
	if (idx >= 0) state.posts[idx] = {
		...state.posts[idx],
		...basePayload
	};
	else state.posts.unshift(basePayload);
	persistCatalogCache();
	notifyState();
	showToast(isNew ? "Blog post created." : "Blog post updated.");
}
export async function deletePost(postId) {
	const reports = loadJson(BLOG_REPORTS_KEY, {});
	delete reports[postId];
	saveJson(BLOG_REPORTS_KEY, reports);
	state.blogReports = reports;
	if (state.isAdmin) {
		try {
			await deleteDoc(doc(db, "posts", postId));
			showToast("Blog post deleted.");
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
			throw err;
		}
	}
	state.posts = state.posts.filter((p) => p.id !== postId);
	persistCatalogCache();
	notifyState();
	showToast("Blog post deleted.");
}
export async function saveReview(reviewData, isNew = false) {
	const id = isNew ? sanitizeId(`rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`) : reviewData.id;
	const prod = state.products.find((p) => p.id === reviewData.productId);
	const basePayload = {
		id,
		productId: String(reviewData.productId || "").trim().slice(0, 128),
		productName: String(reviewData.productName || prod?.name || "General Store").trim().slice(0, 200),
		authorName: String(reviewData.authorName || "").trim().slice(0, 100),
		city: String(reviewData.city || "Bangladesh").trim().slice(0, 80),
		rating: Math.max(1, Math.min(5, parseInt(reviewData.rating, 10) || 5)),
		comment: String(reviewData.comment || "").trim().slice(0, 1500),
		approved: reviewData.approved !== false
	};
	if (state.isAdmin) {
		const existing = state.reviews.find((r) => r.id === id);
		const payload = {
			...basePayload,
			createdAt: isNew || !existing?.createdAt ? serverTimestamp() : existing.createdAt,
			updatedAt: serverTimestamp()
		};
		try {
			await setDoc(doc(db, "reviews", id), payload, { merge: true });
			showToast(isNew ? "Review added!" : "Review updated!");
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.WRITE, `reviews/${id}`);
			throw err;
		}
	}
	const idx = state.reviews.findIndex((r) => r.id === id);
	const localItem = {
		...basePayload,
		createdAt: idx >= 0 ? state.reviews[idx].createdAt : new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
	if (idx >= 0) state.reviews[idx] = localItem;
	else state.reviews.unshift(localItem);
	persistCatalogCache();
	notifyState();
	showToast(isNew ? "Review added!" : "Review updated!");
}
export async function toggleReviewApproval(reviewId) {
	const rev = state.reviews.find((r) => r.id === reviewId);
	if (!rev) return;
	await saveReview({
		...rev,
		approved: rev.approved === false
	}, false);
}
export async function deleteReview(reviewId) {
	if (state.isAdmin) {
		try {
			await deleteDoc(doc(db, "reviews", reviewId));
			showToast("Review deleted.");
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
			throw err;
		}
	}
	state.reviews = state.reviews.filter((r) => r.id !== reviewId);
	persistCatalogCache();
	notifyState();
	showToast("Review deleted.");
}
export async function saveSettingsDoc(settingId, data) {
	if (state.isAdmin) {
		const payload = {
			...data,
			id: settingId,
			updatedAt: serverTimestamp()
		};
		try {
			await setDoc(doc(db, "settings", settingId), payload, { merge: true });
			showToast("Settings saved & applied live!");
			return;
		} catch (err) {
			handleFirestoreError(err, OperationType.WRITE, `settings/${settingId}`);
			throw err;
		}
	}
	if (settingId === "general") state.general = {
		...SEED_GENERAL_SETTINGS,
		...data,
		id: "general"
	};
	if (settingId === "theme") state.theme = normalizeThemeSettings({
		...data,
		id: "theme"
	});
	if (settingId === "ads") state.ads = {
		...SEED_ADS_SETTINGS,
		...data,
		id: "ads"
	};
	applyThemeVariables();
	persistCatalogCache();
	notifyState();
	showToast("Settings saved & applied!");
}
export async function addAdminUid(uid, email) {
	const cleanUid = sanitizeId(uid);
	try {
		await setDoc(doc(db, "admins", cleanUid), {
			email: String(email || "").trim().slice(0, 160),
			role: "admin",
			createdAt: serverTimestamp()
		});
		showToast("Admin UID granted access.");
	} catch (err) {
		handleFirestoreError(err, OperationType.WRITE, `admins/${cleanUid}`);
		throw err;
	}
}

//# sourceMappingURL=data:application/json;base64,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RyxTQUFTLEVBQUUsT0FBTyxLQUFLLENBQUM7R0FDckUsVUFBVSxnQ0FBZ0M7R0FDMUM7RUFDRixTQUFTLEtBQUs7R0FDWixxQkFBcUIsS0FBSyxjQUFjLE9BQU8sWUFBWSxXQUFXO0dBQ3RFLE1BQU07RUFDUjtDQUNGO0NBQ0EsSUFBSSxjQUFjLFdBQVcsTUFBTSxVQUFVO0VBQUUsR0FBRztFQUF1QixHQUFHO0VBQU0sSUFBSTtDQUFVO0NBQ2hHLElBQUksY0FBYyxTQUFTLE1BQU0sUUFBUSx1QkFBdUI7RUFBRSxHQUFHO0VBQU0sSUFBSTtDQUFRLENBQUM7Q0FDeEYsSUFBSSxjQUFjLE9BQU8sTUFBTSxNQUFNO0VBQUUsR0FBRztFQUFtQixHQUFHO0VBQU0sSUFBSTtDQUFNO0NBQ2hGLG9CQUFvQjtDQUNwQixvQkFBb0I7Q0FDcEIsWUFBWTtDQUNaLFVBQVUsMkJBQTJCO0FBQ3ZDO0FBRUEsT0FBTyxlQUFlLFlBQVksS0FBSyxPQUFPO0NBQzVDLE1BQU0sV0FBVyxXQUFXLEdBQUc7Q0FDL0IsSUFBSTtFQUNGLE1BQU0sT0FBTyxJQUFJLElBQUksVUFBVSxRQUFRLEdBQUc7R0FDeEMsT0FBTyxPQUFPLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUc7R0FDOUMsTUFBTTtHQUNOLFdBQVcsZ0JBQWdCO0VBQzdCLENBQUM7RUFDRCxVQUFVLDJCQUEyQjtDQUN2QyxTQUFTLEtBQUs7RUFDWixxQkFBcUIsS0FBSyxjQUFjLE9BQU8sVUFBVSxVQUFVO0VBQ25FLE1BQU07Q0FDUjtBQUNGIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInN0b3JlLmpzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbIi8vIFBhemFybyBCRCDigJQgU3RhdGUgTWFuYWdlbWVudCwgUmVhbC1UaW1lIEZpcmVzdG9yZSBTeW5jICYgQnVzaW5lc3MgTG9naWNcbmltcG9ydCB7XG4gIGNvbGxlY3Rpb24sXG4gIGRvYyxcbiAgZ2V0RG9jLFxuICBnZXREb2NzLFxuICBzZXREb2MsXG4gIHVwZGF0ZURvYyxcbiAgZGVsZXRlRG9jLFxuICBxdWVyeSxcbiAgd2hlcmUsXG4gIG9uU25hcHNob3QsXG4gIHdyaXRlQmF0Y2gsXG4gIHNlcnZlclRpbWVzdGFtcFxufSBmcm9tICdmaXJlYmFzZS9maXJlc3RvcmUnO1xuaW1wb3J0IHtcbiAgb25BdXRoU3RhdGVDaGFuZ2VkLFxuICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgc2lnbkluV2l0aFBvcHVwLFxuICBzaWduT3V0LFxuICBzZW5kRW1haWxWZXJpZmljYXRpb24sXG4gIHJlbG9hZFxufSBmcm9tICdmaXJlYmFzZS9hdXRoJztcbmltcG9ydCB7IHJlZiwgdXBsb2FkQnl0ZXMsIGdldERvd25sb2FkVVJMIH0gZnJvbSAnZmlyZWJhc2Uvc3RvcmFnZSc7XG5pbXBvcnQge1xuICBkYixcbiAgYXV0aCxcbiAgZ29vZ2xlUHJvdmlkZXIsXG4gIHN0b3JhZ2UsXG4gIGZpcmViYXNlQ29uZmlndXJlZCxcbiAgdGVzdENvbm5lY3Rpb24sXG4gIGZvcm1hdEZpcmVzdG9yZUVycm9yTWVzc2FnZSxcbiAgT3BlcmF0aW9uVHlwZSxcbiAgaGFuZGxlRmlyZXN0b3JlRXJyb3Jcbn0gZnJvbSAnLi4vZmlyZWJhc2UtY29uZmlnLmpzJztcbmltcG9ydCB7XG4gIFNFRURfQ0FURUdPUklFUyxcbiAgU0VFRF9QUk9EVUNUUyxcbiAgU0VFRF9SRVZJRVdTLFxuICBTRUVEX1BPU1RTLFxuICBTRUVEX0dFTkVSQUxfU0VUVElOR1MsXG4gIFNFRURfVEhFTUVfU0VUVElOR1MsXG4gIFNFRURfQURTX1NFVFRJTkdTXG59IGZyb20gJy4vc2VlZC1kYXRhLmpzJztcblxuY29uc3QgQ0FDSEVfS0VZID0gJ3BhemFyb19jYXRhbG9nX2NhY2hlX3YxJztcbmNvbnN0IENBUlRfS0VZID0gJ3BhemFyb19jYXJ0X3YxJztcbmNvbnN0IFdJU0hfS0VZID0gJ3BhemFyb193aXNobGlzdF92MSc7XG5jb25zdCBSRUNFTlRfS0VZID0gJ3BhemFyb19yZWNlbnRfdjEnO1xuY29uc3QgTE9DQUxfT1JERVJTX0tFWSA9ICdwYXphcm9fbG9jYWxfb3JkZXJzX3YxJztcbmNvbnN0IEFETUlOX09SREVSU19DQUNIRV9LRVkgPSAncGF6YXJvX2FkbWluX29yZGVyc19jYWNoZV92MSc7XG5jb25zdCBVTlNFRU5fT1JERVJTX0tFWSA9ICdwYXphcm9fdW5zZWVuX29yZGVyc192MSc7XG5jb25zdCBCTE9HX1JFUE9SVFNfS0VZID0gJ3BhemFyb19ibG9nX3JlcG9ydHNfdjEnO1xuY29uc3QgU0VFREVEX0ZMQUdfS0VZID0gJ3BhemFyb19zZWVkZWRfZmlyZXN0b3JlX3YxJztcbmNvbnN0IERFTEVURURfUFJPRFVDVFNfS0VZID0gJ3BhemFyb19kZWxldGVkX3Byb2R1Y3RzX3YxJztcbmNvbnN0IExPQ0FMX0NBVF9PVkVSUklERVNfS0VZID0gJ3BhemFyb19sb2NhbF9jYXRfb3ZlcnJpZGVzX3YxJztcbmNvbnN0IEJFQVVUWV9NRVJHRV9LRVkgPSAncGF6YXJvX2JlYXV0eV9za2luY2FyZV9tZXJnZV92Mic7XG5jb25zdCBCRUFVVFlfTUVSR0VfRlNfS0VZID0gJ3BhemFyb19iZWF1dHlfc2tpbmNhcmVfbWVyZ2VfZnNfdjInO1xuY29uc3QgQkVBVVRZX0NBVEVHT1JZX0lEID0gJ2NhdC1iZWF1dHknO1xuY29uc3QgTEVHQUNZX1NLSU5DQVJFX0NBVEVHT1JZX0lEID0gJ2NhdC1za2luY2FyZS1zZXJ1bXMnO1xuY29uc3QgQkVBVVRZX1VOSUZJRURfTkFNRSA9ICdCZWF1dHkgJiBTa2luY2FyZSc7XG5jb25zdCBCRUFVVFlfVU5JRklFRF9OQU1FX0JOID0gJ+CmrOCmv+CmieCmn+Cmvywg4Ka44KeN4KaV4Ka/4Kao4KaV4KeH4Kef4Ka+4KawIOCmkyDgprjgpr/gprDgpr7gpq4nO1xuY29uc3QgU0tJTkNBUkVfUFJPRFVDVF9JRFMgPSBbXG4gICdwcm9kLXZpdGFtaW4tYy1nbG93LXNlcnVtJyxcbiAgJ3Byb2QtbmlhY2luYW1pZGUtMTAtemluYy1zZXJ1bScsXG4gICdwcm9kLWJyaWdodGVuaW5nLWRheS1jcmVhbScsXG4gICdwcm9kLWNvbGxhZ2VuLW5pZ2h0LXJlcGFpci1jcmVhbScsXG4gICdwcm9kLWh5ZHJhLW1hdHRlLXN1bnNjcmVlbicsXG4gICdwcm9kLXJvc2UtbGlwLWNoZWVrLXRpbnQnXG5dO1xuXG5mdW5jdGlvbiBsb2FkSnNvbihrZXksIGZhbGxiYWNrKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICByZXR1cm4gcmF3ID8gSlNPTi5wYXJzZShyYXcpIDogZmFsbGJhY2s7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxsYmFjaztcbiAgfVxufVxuXG5mdW5jdGlvbiBzYXZlSnNvbihrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBJZ25vcmUgcXVvdGEgbGltaXRzXG4gIH1cbn1cblxuY29uc3QgY2FjaGVkID0gbG9hZEpzb24oQ0FDSEVfS0VZLCB7fSk7XG5jb25zdCBjYWNoZWRBZG1pbk9yZGVycyA9IGxvYWRKc29uKEFETUlOX09SREVSU19DQUNIRV9LRVksIFtdKTtcbmNvbnN0IGNhY2hlZFVuc2VlbklkcyA9IGxvYWRKc29uKFVOU0VFTl9PUkRFUlNfS0VZLCBbXSk7XG5jb25zdCBjYWNoZWRCbG9nUmVwb3J0cyA9IGxvYWRKc29uKEJMT0dfUkVQT1JUU19LRVksIHt9KTtcblxuZnVuY3Rpb24gbWVyZ2VQb3N0c1dpdGhSZXBvcnRzKHBvc3RzKSB7XG4gIGNvbnN0IHJlcG9ydHMgPSBsb2FkSnNvbihCTE9HX1JFUE9SVFNfS0VZLCB7fSk7XG4gIHJldHVybiAocG9zdHMgfHwgW10pLm1hcCgocCkgPT4ge1xuICAgIGNvbnN0IHJlcCA9IHJlcG9ydHNbcC5pZF07XG4gICAgaWYgKCFyZXApIHJldHVybiBwO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5wLFxuICAgICAgaXNzdWVGbGFnOiBCb29sZWFuKHAuaXNzdWVGbGFnIHx8IHJlcC5pc3N1ZUZsYWcpLFxuICAgICAgaXNzdWVOb3RlOiBwLmlzc3VlTm90ZSB8fCByZXAuaXNzdWVOb3RlIHx8ICcnXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERlbGV0ZWRQcm9kdWN0SWRTZXQoKSB7XG4gIGNvbnN0IHJhdyA9IGxvYWRKc29uKERFTEVURURfUFJPRFVDVFNfS0VZLCBbXSk7XG4gIHJldHVybiBuZXcgU2V0KEFycmF5LmlzQXJyYXkocmF3KSA/IHJhdy5tYXAoU3RyaW5nKSA6IFtdKTtcbn1cblxuZnVuY3Rpb24gbWFya1Byb2R1Y3REZWxldGVkTG9jYWxseShpZCkge1xuICBjb25zdCBzZXQgPSBnZXREZWxldGVkUHJvZHVjdElkU2V0KCk7XG4gIHNldC5hZGQoU3RyaW5nKGlkKSk7XG4gIHNhdmVKc29uKERFTEVURURfUFJPRFVDVFNfS0VZLCBBcnJheS5mcm9tKHNldCkpO1xufVxuXG5mdW5jdGlvbiB1bm1hcmtQcm9kdWN0RGVsZXRlZExvY2FsbHkoaWQpIHtcbiAgY29uc3Qgc2V0ID0gZ2V0RGVsZXRlZFByb2R1Y3RJZFNldCgpO1xuICBpZiAoc2V0LmRlbGV0ZShTdHJpbmcoaWQpKSkge1xuICAgIHNhdmVKc29uKERFTEVURURfUFJPRFVDVFNfS0VZLCBBcnJheS5mcm9tKHNldCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsQ2F0T3ZlcnJpZGVzKCkge1xuICBjb25zdCByYXcgPSBsb2FkSnNvbihMT0NBTF9DQVRfT1ZFUlJJREVTX0tFWSwge30pO1xuICByZXR1cm4ge1xuICAgIGVkaXRlZEJ5SWQ6IHJhdyAmJiB0eXBlb2YgcmF3LmVkaXRlZEJ5SWQgPT09ICdvYmplY3QnICYmIHJhdy5lZGl0ZWRCeUlkID8gcmF3LmVkaXRlZEJ5SWQgOiB7fSxcbiAgICByZW5hbWVkRnJvbTogcmF3ICYmIHR5cGVvZiByYXcucmVuYW1lZEZyb20gPT09ICdvYmplY3QnICYmIHJhdy5yZW5hbWVkRnJvbSA/IHJhdy5yZW5hbWVkRnJvbSA6IHt9LFxuICAgIGRlbGV0ZWRJZHM6IEFycmF5LmlzQXJyYXkocmF3Py5kZWxldGVkSWRzKSA/IHJhdy5kZWxldGVkSWRzLm1hcChTdHJpbmcpIDogW11cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDYXRlZ29yeVJlbmFtZShuYW1lKSB7XG4gIGNvbnN0IGNsZWFuID0gU3RyaW5nKG5hbWUgfHwgJycpO1xuICBpZiAoIWNsZWFuKSByZXR1cm4gY2xlYW47XG4gIGNvbnN0IG92ID0gZ2V0TG9jYWxDYXRPdmVycmlkZXMoKTtcbiAgcmV0dXJuIG92LnJlbmFtZWRGcm9tW2NsZWFuXSB8fCBjbGVhbjtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVGhlbWVTZXR0aW5ncyhyYXdUaGVtZSkge1xuICBpZiAoIXJhd1RoZW1lIHx8IHR5cGVvZiByYXdUaGVtZSAhPT0gJ29iamVjdCcpIHJldHVybiB7IC4uLlNFRURfVEhFTUVfU0VUVElOR1MgfTtcbiAgY29uc3QgbWVyZ2VkID0geyAuLi5TRUVEX1RIRU1FX1NFVFRJTkdTLCAuLi5yYXdUaGVtZSB9O1xuICBjb25zdCBpbmNvbWluZ1NsaWRlcyA9IEFycmF5LmlzQXJyYXkocmF3VGhlbWUuaGVyb1NsaWRlcykgPyByYXdUaGVtZS5oZXJvU2xpZGVzIDogW107XG4gIGNvbnN0IHNob3VsZFVwZ3JhZGVEZWZhdWx0cyA9ICFyYXdUaGVtZS5oZXJvU2xpZGVzQ3VzdG9taXplZCAmJiBpbmNvbWluZ1NsaWRlcy5sZW5ndGggPD0gMjtcblxuICBpZiAoIWluY29taW5nU2xpZGVzLmxlbmd0aCAmJiAhcmF3VGhlbWUuaGVyb1NsaWRlc0N1c3RvbWl6ZWQpIHtcbiAgICBtZXJnZWQuaGVyb1NsaWRlcyA9IFsuLi5TRUVEX1RIRU1FX1NFVFRJTkdTLmhlcm9TbGlkZXNdO1xuICB9IGVsc2UgaWYgKHNob3VsZFVwZ3JhZGVEZWZhdWx0cykge1xuICAgIGNvbnN0IGJ5SWQgPSBuZXcgTWFwKFNFRURfVEhFTUVfU0VUVElOR1MuaGVyb1NsaWRlcy5tYXAoKHMpID0+IFtzLmlkLCBzXSkpO1xuICAgIGNvbnN0IHVwZ3JhZGVkRmlyc3QgPSBpbmNvbWluZ1NsaWRlcy5tYXAoKHMsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgZGVmID0gYnlJZC5nZXQocy5pZCkgfHwgU0VFRF9USEVNRV9TRVRUSU5HUy5oZXJvU2xpZGVzW2lkeF0gfHwge307XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kZWYsXG4gICAgICAgIC4uLnMsXG4gICAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiBzLmZlYXR1cmVkUHJvZHVjdElkID8/IGRlZi5mZWF0dXJlZFByb2R1Y3RJZCA/PyAnJyxcbiAgICAgICAgYmFkZ2VUZXh0OiBzLmJhZGdlVGV4dCA/PyBkZWYuYmFkZ2VUZXh0ID8/ICcnLFxuICAgICAgICBhbmltU3R5bGU6IHMuYW5pbVN0eWxlIHx8IGRlZi5hbmltU3R5bGUgfHwgJ2Zsb2F0J1xuICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCB1c2VkSWRzID0gbmV3IFNldCh1cGdyYWRlZEZpcnN0Lm1hcCgocykgPT4gcy5pZCkpO1xuICAgIGNvbnN0IGV4dHJhcyA9IFNFRURfVEhFTUVfU0VUVElOR1MuaGVyb1NsaWRlcy5maWx0ZXIoKHMpID0+ICF1c2VkSWRzLmhhcyhzLmlkKSk7XG4gICAgbWVyZ2VkLmhlcm9TbGlkZXMgPSBbLi4udXBncmFkZWRGaXJzdCwgLi4uZXh0cmFzXTtcbiAgfVxuICByZXR1cm4gbWVyZ2VkO1xufVxuXG5mdW5jdGlvbiBidWlsZEluaXRpYWxDYXRhbG9nKCkge1xuICBsZXQgcHJvZHVjdHMgPSBBcnJheS5pc0FycmF5KGNhY2hlZC5wcm9kdWN0cykgPyBbLi4uY2FjaGVkLnByb2R1Y3RzXSA6IFsuLi5TRUVEX1BST0RVQ1RTXTtcbiAgbGV0IGNhdGVnb3JpZXMgPSBBcnJheS5pc0FycmF5KGNhY2hlZC5jYXRlZ29yaWVzKSA/IFsuLi5jYWNoZWQuY2F0ZWdvcmllc10gOiBbLi4uU0VFRF9DQVRFR09SSUVTXTtcblxuICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKEJFQVVUWV9NRVJHRV9LRVkpKSB7XG4gICAgY29uc3QgZGVsZXRlZFByb2RJZHMgPSBnZXREZWxldGVkUHJvZHVjdElkU2V0KCk7XG4gICAgY29uc3QgY2F0T3YgPSBnZXRMb2NhbENhdE92ZXJyaWRlcygpO1xuICAgIGxldCBvdkNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAoY2F0T3YuZWRpdGVkQnlJZFtMRUdBQ1lfU0tJTkNBUkVfQ0FURUdPUllfSURdKSB7XG4gICAgICBkZWxldGUgY2F0T3YuZWRpdGVkQnlJZFtMRUdBQ1lfU0tJTkNBUkVfQ0FURUdPUllfSURdO1xuICAgICAgb3ZDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNhdE92LmVkaXRlZEJ5SWRbQkVBVVRZX0NBVEVHT1JZX0lEXT8ubmFtZSA9PT0gJ0JlYXV0eScpIHtcbiAgICAgIGNhdE92LmVkaXRlZEJ5SWRbQkVBVVRZX0NBVEVHT1JZX0lEXSA9IHtcbiAgICAgICAgLi4uY2F0T3YuZWRpdGVkQnlJZFtCRUFVVFlfQ0FURUdPUllfSURdLFxuICAgICAgICBuYW1lOiBCRUFVVFlfVU5JRklFRF9OQU1FLFxuICAgICAgICBuYW1lQm46IEJFQVVUWV9VTklGSUVEX05BTUVfQk4sXG4gICAgICAgIGljb246ICfwn6e0J1xuICAgICAgfTtcbiAgICAgIG92Q2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvdkNoYW5nZWQpIHNhdmVKc29uKExPQ0FMX0NBVF9PVkVSUklERVNfS0VZLCBjYXRPdik7XG5cbiAgICBjb25zdCBkZWxldGVkQ2F0SWRzID0gbmV3IFNldChjYXRPdi5kZWxldGVkSWRzIHx8IFtdKTtcbiAgICBjb25zdCBzZWVkQnlJZCA9IG5ldyBNYXAoU0VFRF9DQVRFR09SSUVTLm1hcCgoc2MpID0+IFtzYy5pZCwgc2NdKSk7XG5cbiAgICBjYXRlZ29yaWVzID0gY2F0ZWdvcmllc1xuICAgICAgLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gTEVHQUNZX1NLSU5DQVJFX0NBVEVHT1JZX0lEKVxuICAgICAgLm1hcCgoYykgPT4ge1xuICAgICAgICBpZiAoYy5pZCA9PT0gQkVBVVRZX0NBVEVHT1JZX0lEICYmIChjLm5hbWUgPT09ICdCZWF1dHknIHx8IGMubmFtZSA9PT0gJ1NraW5jYXJlICYgU2VydW1zJykpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uYyxcbiAgICAgICAgICAgIG5hbWU6IEJFQVVUWV9VTklGSUVEX05BTUUsXG4gICAgICAgICAgICBuYW1lQm46IEJFQVVUWV9VTklGSUVEX05BTUVfQk4sXG4gICAgICAgICAgICBpY29uOiBjLmljb24gPT09ICfinKgnIHx8ICFjLmljb24gPyAn8J+ntCcgOiBjLmljb24sXG4gICAgICAgICAgICBzb3J0T3JkZXI6IDlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlZWRNYXRjaCA9IHNlZWRCeUlkLmdldChjLmlkKTtcbiAgICAgICAgaWYgKHNlZWRNYXRjaCAmJiBOdW1iZXIoYy5zb3J0T3JkZXIpID09PSBzZWVkTWF0Y2guc29ydE9yZGVyICsgMSAmJiBzZWVkTWF0Y2guc29ydE9yZGVyID49IDEwKSB7XG4gICAgICAgICAgcmV0dXJuIHsgLi4uYywgc29ydE9yZGVyOiBzZWVkTWF0Y2guc29ydE9yZGVyIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9KTtcblxuICAgIGlmICghZGVsZXRlZENhdElkcy5oYXMoQkVBVVRZX0NBVEVHT1JZX0lEKSAmJiAhY2F0ZWdvcmllcy5zb21lKChjKSA9PiBjLmlkID09PSBCRUFVVFlfQ0FURUdPUllfSUQpKSB7XG4gICAgICBjb25zdCBzZWVkQ2F0ID0gc2VlZEJ5SWQuZ2V0KEJFQVVUWV9DQVRFR09SWV9JRCk7XG4gICAgICBpZiAoc2VlZENhdCkge1xuICAgICAgICBjb25zdCBvdmVycmlkZSA9IGNhdE92LmVkaXRlZEJ5SWRbQkVBVVRZX0NBVEVHT1JZX0lEXTtcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKG92ZXJyaWRlID8geyAuLi5zZWVkQ2F0LCAuLi5vdmVycmlkZSB9IDogeyAuLi5zZWVkQ2F0IH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXRlZ29yaWVzLnNvcnQoKGEsIGIpID0+IChhLnNvcnRPcmRlciB8fCAwKSAtIChiLnNvcnRPcmRlciB8fCAwKSk7XG5cbiAgICBjb25zdCB0YXJnZXRDYXRlZ29yeSA9IHJlc29sdmVDYXRlZ29yeVJlbmFtZShCRUFVVFlfVU5JRklFRF9OQU1FKTtcbiAgICBjb25zdCBzZWVkUHJvZEJ5SWQgPSBuZXcgTWFwKFNFRURfUFJPRFVDVFMubWFwKChzcCkgPT4gW3NwLmlkLCBzcF0pKTtcbiAgICBwcm9kdWN0cyA9IHByb2R1Y3RzLm1hcCgocCkgPT4ge1xuICAgICAgaWYgKHAuY2F0ZWdvcnkgPT09ICdCZWF1dHknIHx8IHAuY2F0ZWdvcnkgPT09ICdTa2luY2FyZSAmIFNlcnVtcycpIHtcbiAgICAgICAgY29uc3Qgc2VlZE1hdGNoID0gc2VlZFByb2RCeUlkLmdldChwLmlkKTtcbiAgICAgICAgY29uc3QgbmV4dEltYWdlcyA9XG4gICAgICAgICAgc2VlZE1hdGNoICYmIEFycmF5LmlzQXJyYXkocC5pbWFnZXMpICYmIFN0cmluZyhwLmltYWdlc1swXSB8fCAnJykuc3RhcnRzV2l0aCgnZGF0YTppbWFnZS9zdmcreG1sJylcbiAgICAgICAgICAgID8gc2VlZE1hdGNoLmltYWdlc1xuICAgICAgICAgICAgOiBwLmltYWdlcztcbiAgICAgICAgcmV0dXJuIHsgLi4ucCwgY2F0ZWdvcnk6IHRhcmdldENhdGVnb3J5LCBpbWFnZXM6IG5leHRJbWFnZXMgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICAgIH0pO1xuXG4gICAgU0tJTkNBUkVfUFJPRFVDVF9JRFMuZm9yRWFjaCgocGlkKSA9PiB7XG4gICAgICBpZiAoZGVsZXRlZFByb2RJZHMuaGFzKHBpZCkgfHwgcHJvZHVjdHMuc29tZSgocCkgPT4gcC5pZCA9PT0gcGlkKSkgcmV0dXJuO1xuICAgICAgY29uc3Qgc2VlZFByb2QgPSBzZWVkUHJvZEJ5SWQuZ2V0KHBpZCk7XG4gICAgICBpZiAoc2VlZFByb2QpIHtcbiAgICAgICAgcHJvZHVjdHMucHVzaCh7IC4uLnNlZWRQcm9kLCBjYXRlZ29yeTogdGFyZ2V0Q2F0ZWdvcnkgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oQkVBVVRZX01FUkdFX0tFWSwgJzEnKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBzdG9yYWdlIHF1b3RhIGVycm9yc1xuICAgIH1cbiAgICBzYXZlSnNvbihDQUNIRV9LRVksIHtcbiAgICAgIC4uLmNhY2hlZCxcbiAgICAgIHByb2R1Y3RzLFxuICAgICAgY2F0ZWdvcmllc1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHsgcHJvZHVjdHMsIGNhdGVnb3JpZXMgfTtcbn1cblxuY29uc3QgaW5pdGlhbENhdGFsb2cgPSBidWlsZEluaXRpYWxDYXRhbG9nKCk7XG5cbmV4cG9ydCBjb25zdCBzdGF0ZSA9IHtcbiAgbG9hZGluZzogZmFsc2UsXG4gIGZpcmVzdG9yZUNvbm5lY3RlZDogZmFsc2UsXG4gIGRiU3RhdHVzOiBmaXJlYmFzZUNvbmZpZ3VyZWQgPyAnY29ubmVjdGluZycgOiAnZXJyb3InLCAvLyAnY29ubmVjdGluZycgfCAnY29ubmVjdGVkJyB8ICdlcnJvcidcbiAgZGJFcnJvcjogZmlyZWJhc2VDb25maWd1cmVkID8gJycgOiAnRmlyZWJhc2UgY29uZmlndXJhdGlvbiBpcyBtaXNzaW5nIG9yIGluY29tcGxldGUuJyxcbiAgcHJvZHVjdHM6IGluaXRpYWxDYXRhbG9nLnByb2R1Y3RzLFxuICBjYXRlZ29yaWVzOiBpbml0aWFsQ2F0YWxvZy5jYXRlZ29yaWVzLFxuICBwb3N0czogbWVyZ2VQb3N0c1dpdGhSZXBvcnRzKEFycmF5LmlzQXJyYXkoY2FjaGVkLnBvc3RzKSA/IGNhY2hlZC5wb3N0cyA6IFsuLi5TRUVEX1BPU1RTXSksXG4gIHJldmlld3M6IEFycmF5LmlzQXJyYXkoY2FjaGVkLnJldmlld3MpID8gY2FjaGVkLnJldmlld3MgOiBbLi4uU0VFRF9SRVZJRVdTXSxcbiAgb3JkZXJzOiBBcnJheS5pc0FycmF5KGNhY2hlZEFkbWluT3JkZXJzKSA/IGNhY2hlZEFkbWluT3JkZXJzIDogW10sXG4gIHN1YnNjcmliZXJzOiBbXSxcbiAgZ2VuZXJhbDogY2FjaGVkLmdlbmVyYWwgPyB7IC4uLlNFRURfR0VORVJBTF9TRVRUSU5HUywgLi4uY2FjaGVkLmdlbmVyYWwgfSA6IHsgLi4uU0VFRF9HRU5FUkFMX1NFVFRJTkdTIH0sXG4gIHRoZW1lOiBub3JtYWxpemVUaGVtZVNldHRpbmdzKGNhY2hlZC50aGVtZSksXG4gIGFkczogY2FjaGVkLmFkcyA/IHsgLi4uU0VFRF9BRFNfU0VUVElOR1MsIC4uLmNhY2hlZC5hZHMgfSA6IHsgLi4uU0VFRF9BRFNfU0VUVElOR1MgfSxcbiAgY2FydDogbG9hZEpzb24oQ0FSVF9LRVksIFtdKSxcbiAgd2lzaGxpc3Q6IGxvYWRKc29uKFdJU0hfS0VZLCBbXSksXG4gIHJlY2VudGx5Vmlld2VkOiBsb2FkSnNvbihSRUNFTlRfS0VZLCBbXSksXG4gIGF1dGhVc2VyOiBudWxsLFxuICBhdXRoUmVhZHk6IGZhbHNlLFxuICBpc0FkbWluOiBmYWxzZSxcbiAgYXV0aFZlcmlmaWNhdGlvblJlcXVpcmVkOiBmYWxzZSxcbiAgbmV3T3JkZXJzQ291bnQ6IEFycmF5LmlzQXJyYXkoY2FjaGVkVW5zZWVuSWRzKSA/IGNhY2hlZFVuc2Vlbklkcy5sZW5ndGggOiAwLFxuICB1bnNlZW5PcmRlcklkczogbmV3IFNldChBcnJheS5pc0FycmF5KGNhY2hlZFVuc2VlbklkcykgPyBjYWNoZWRVbnNlZW5JZHMgOiBbXSksXG4gIGZpcmVzdG9yZVByb2R1Y3RJZHM6IG5ldyBTZXQoKSxcbiAgYmxvZ1JlcG9ydHM6IGNhY2hlZEJsb2dSZXBvcnRzIHx8IHt9LFxuICBsYXN0QWRkZWRQcm9kdWN0SWQ6ICcnXG59O1xuXG5jb25zdCBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5sZXQgbm90aWZ5VGltZXIgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc3Vic2NyaWJlU3RhdGUoZm4pIHtcbiAgbGlzdGVuZXJzLmFkZChmbik7XG4gIHJldHVybiAoKSA9PiBsaXN0ZW5lcnMuZGVsZXRlKGZuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGlmeVN0YXRlKCkge1xuICBpZiAobm90aWZ5VGltZXIpIHJldHVybjtcbiAgbm90aWZ5VGltZXIgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIG5vdGlmeVRpbWVyID0gbnVsbDtcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IGZuKHN0YXRlKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCkge1xuICBzYXZlSnNvbihDQUNIRV9LRVksIHtcbiAgICBwcm9kdWN0czogc3RhdGUucHJvZHVjdHMsXG4gICAgY2F0ZWdvcmllczogc3RhdGUuY2F0ZWdvcmllcyxcbiAgICBwb3N0czogc3RhdGUucG9zdHMsXG4gICAgcmV2aWV3czogc3RhdGUucmV2aWV3cyxcbiAgICBnZW5lcmFsOiBzdGF0ZS5nZW5lcmFsLFxuICAgIHRoZW1lOiBzdGF0ZS50aGVtZSxcbiAgICBhZHM6IHN0YXRlLmFkc1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGhlbWVWYXJpYWJsZXMoKSB7XG4gIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGNvbnN0IHQgPSBzdGF0ZS50aGVtZSB8fCBTRUVEX1RIRU1FX1NFVFRJTkdTO1xuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tcHJpbWFyeScsIHQucHJpbWFyeUNvbG9yIHx8ICcjMEY3NjZFJyk7XG4gIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tYWNjZW50JywgdC5hY2NlbnRDb2xvciB8fCAnI0ZGNkI1NycpO1xuICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLWJnJywgdC5iZ0NvbG9yIHx8ICcjRkFGOEY1Jyk7XG5cbiAgaWYgKGcuZmF2aWNvblVybCkge1xuICAgIGxldCBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImxpbmtbcmVsfj0naWNvbiddXCIpO1xuICAgIGlmICghbGluaykge1xuICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgIGxpbmsucmVsID0gJ2ljb24nO1xuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICB9XG4gICAgbGluay5ocmVmID0gZy5mYXZpY29uVXJsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRQcmljZShudW0pIHtcbiAgY29uc3Qgc3ltID0gc3RhdGUuZ2VuZXJhbD8uY3VycmVuY3lTeW1ib2wgfHwgJ+Cnsyc7XG4gIGNvbnN0IHZhbCA9IE1hdGgucm91bmQoTnVtYmVyKG51bSkgfHwgMCk7XG4gIHJldHVybiBgJHtzeW19JHt2YWwudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJyl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNEaXNjb3VudFBlcmNlbnQocHJpY2UsIG9sZFByaWNlKSB7XG4gIGNvbnN0IHAgPSBOdW1iZXIocHJpY2UpIHx8IDA7XG4gIGNvbnN0IG8gPSBOdW1iZXIob2xkUHJpY2UpIHx8IDA7XG4gIGlmICghbyB8fCBvIDw9IHApIHJldHVybiAwO1xuICByZXR1cm4gTWF0aC5yb3VuZCgoKG8gLSBwKSAvIG8pICogMTAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNsdWdpZnkodGV4dCkge1xuICByZXR1cm4gU3RyaW5nKHRleHQgfHwgJycpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpXG4gICAgLnNsaWNlKDAsIDEwMCkgfHwgJ2l0ZW0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJZChpZCkge1xuICByZXR1cm4gU3RyaW5nKGlkIHx8ICcnKVxuICAgIC5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAnLScpXG4gICAgLnJlcGxhY2UoLy0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpXG4gICAgLnNsaWNlKDAsIDEyMCkgfHwgYGlkLSR7RGF0ZS5ub3coKX1gO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hhMjU2SGV4KHN0cikge1xuICBjb25zdCBub3JtYWxpemVkID0gU3RyaW5nKHN0ciB8fCAnJykucmVwbGFjZSgvXFxEL2csICcnKTtcbiAgY29uc3QgZGF0YSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShub3JtYWxpemVkIHx8IFN0cmluZyhzdHIpKTtcbiAgY29uc3QgaGFzaEJ1ZmZlciA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgZGF0YSk7XG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2hCdWZmZXIpKVxuICAgIC5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgLmpvaW4oJycpO1xufVxuXG4vLyAtLS0gVG9hc3QgTm90aWZpY2F0aW9uIFN5c3RlbSAtLS1cbmNvbnN0IHRvYXN0TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuZXhwb3J0IGZ1bmN0aW9uIG9uVG9hc3QoZm4pIHtcbiAgdG9hc3RMaXN0ZW5lcnMuYWRkKGZuKTtcbiAgcmV0dXJuICgpID0+IHRvYXN0TGlzdGVuZXJzLmRlbGV0ZShmbik7XG59XG5leHBvcnQgZnVuY3Rpb24gc2hvd1RvYXN0KG1lc3NhZ2UsIGlzRXJyb3IgPSBmYWxzZSkge1xuICB0b2FzdExpc3RlbmVycy5mb3JFYWNoKChmbikgPT4gZm4oeyBtZXNzYWdlLCBpc0Vycm9yIH0pKTtcbn1cblxuLy8gU29mdCBXZWIgQXVkaW8gY2hpbWUgZm9yIG5ldyBhZG1pbiBvcmRlcnNcbmZ1bmN0aW9uIHBsYXlPcmRlckNoaW1lKCkge1xuICB0cnkge1xuICAgIGNvbnN0IEF1ZGlvQ3R4ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuICAgIGlmICghQXVkaW9DdHgpIHJldHVybjtcbiAgICBjb25zdCBjdHggPSBuZXcgQXVkaW9DdHgoKTtcbiAgICBjb25zdCBvc2MgPSBjdHguY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgIGNvbnN0IGdhaW4gPSBjdHguY3JlYXRlR2FpbigpO1xuICAgIG9zYy50eXBlID0gJ3NpbmUnO1xuICAgIG9zYy5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoNTg3LjMzLCBjdHguY3VycmVudFRpbWUpO1xuICAgIG9zYy5mcmVxdWVuY3kuZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSg4ODAsIGN0eC5jdXJyZW50VGltZSArIDAuMTQpO1xuICAgIGdhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjA4LCBjdHguY3VycmVudFRpbWUpO1xuICAgIGdhaW4uZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDAuMDAxLCBjdHguY3VycmVudFRpbWUgKyAwLjQ1KTtcbiAgICBvc2MuY29ubmVjdChnYWluKTtcbiAgICBnYWluLmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgICBvc2Muc3RhcnQoKTtcbiAgICBvc2Muc3RvcChjdHguY3VycmVudFRpbWUgKyAwLjQ2KTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gSWdub3JlIGF1dG9wbGF5IHJlc3RyaWN0aW9uIGJlZm9yZSB1c2VyIGludGVyYWN0aW9uXG4gIH1cbn1cblxuLy8gLS0tIENhcnQsIFdpc2hsaXN0LCBSZWNlbnRseSBWaWV3ZWQgLS0tXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9DYXJ0KHByb2R1Y3RJZCwgcXR5ID0gMSwgb3B0aW9uID0gJycpIHtcbiAgY29uc3QgcHJvZCA9IHN0YXRlLnByb2R1Y3RzLmZpbmQoKHApID0+IHAuaWQgPT09IHByb2R1Y3RJZCk7XG4gIGlmICghcHJvZCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoKHByb2Quc3RvY2sgfHwgMCkgPD0gMCkge1xuICAgIHNob3dUb2FzdCgnU29ycnksIHRoaXMgaXRlbSBpcyBjdXJyZW50bHkgb3V0IG9mIHN0b2NrLicsIHRydWUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBjaG9zZW5PcHRpb24gPSBvcHRpb24gfHwgKEFycmF5LmlzQXJyYXkocHJvZC5vcHRpb25zKSAmJiBwcm9kLm9wdGlvbnNbMF0pIHx8ICcnO1xuICBjb25zdCBleGlzdGluZyA9IHN0YXRlLmNhcnQuZmluZCgoYykgPT4gYy5wcm9kdWN0SWQgPT09IHByb2R1Y3RJZCAmJiBjLm9wdGlvbiA9PT0gY2hvc2VuT3B0aW9uKTtcbiAgaWYgKGV4aXN0aW5nKSB7XG4gICAgZXhpc3RpbmcucXR5ID0gTWF0aC5taW4ocHJvZC5zdG9jayB8fCA5OSwgZXhpc3RpbmcucXR5ICsgcXR5KTtcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5jYXJ0LnB1c2goe1xuICAgICAgcHJvZHVjdElkOiBwcm9kLmlkLFxuICAgICAgbmFtZTogcHJvZC5uYW1lLFxuICAgICAgcHJpY2U6IE51bWJlcihwcm9kLnByaWNlKSB8fCAwLFxuICAgICAgaW1hZ2U6IChwcm9kLmltYWdlcyAmJiBwcm9kLmltYWdlc1swXSkgfHwgJycsXG4gICAgICBvcHRpb246IGNob3Nlbk9wdGlvbixcbiAgICAgIHF0eTogTWF0aC5taW4ocHJvZC5zdG9jayB8fCA5OSwgTWF0aC5tYXgoMSwgcXR5KSlcbiAgICB9KTtcbiAgfVxuICBzYXZlSnNvbihDQVJUX0tFWSwgc3RhdGUuY2FydCk7XG4gIHN0YXRlLmxhc3RBZGRlZFByb2R1Y3RJZCA9IHByb2QuaWQ7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlmIChzdGF0ZS5sYXN0QWRkZWRQcm9kdWN0SWQgPT09IHByb2QuaWQpIHtcbiAgICAgIHN0YXRlLmxhc3RBZGRlZFByb2R1Y3RJZCA9ICcnO1xuICAgICAgbm90aWZ5U3RhdGUoKTtcbiAgICB9XG4gIH0sIDkwMCk7XG4gIGNvbnN0IGNhcnRJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlYWRlci1jYXJ0LWJ0bicpO1xuICBpZiAoY2FydEljb24pIHtcbiAgICBjYXJ0SWNvbi5jbGFzc0xpc3QucmVtb3ZlKCdjYXJ0LWJvdW5jZScpO1xuICAgIHZvaWQgY2FydEljb24ub2Zmc2V0V2lkdGg7XG4gICAgY2FydEljb24uY2xhc3NMaXN0LmFkZCgnY2FydC1ib3VuY2UnKTtcbiAgfVxuICBzaG93VG9hc3QoYEFkZGVkIFwiJHtwcm9kLm5hbWV9XCIgdG8gY2FydGApO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNhcnRRdHkoaW5kZXgsIGRlbHRhKSB7XG4gIGNvbnN0IGl0ZW0gPSBzdGF0ZS5jYXJ0W2luZGV4XTtcbiAgaWYgKCFpdGVtKSByZXR1cm47XG4gIGNvbnN0IHByb2QgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBwLmlkID09PSBpdGVtLnByb2R1Y3RJZCk7XG4gIGNvbnN0IG1heFN0b2NrID0gcHJvZCA/IE1hdGgubWF4KDEsIHByb2Quc3RvY2sgfHwgMSkgOiA5OTtcbiAgY29uc3QgbmV4dCA9IGl0ZW0ucXR5ICsgZGVsdGE7XG4gIGlmIChuZXh0IDw9IDApIHtcbiAgICBzdGF0ZS5jYXJ0LnNwbGljZShpbmRleCwgMSk7XG4gIH0gZWxzZSB7XG4gICAgaXRlbS5xdHkgPSBNYXRoLm1pbihtYXhTdG9jaywgbmV4dCk7XG4gIH1cbiAgc2F2ZUpzb24oQ0FSVF9LRVksIHN0YXRlLmNhcnQpO1xuICBub3RpZnlTdGF0ZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRnJvbUNhcnQoaW5kZXgpIHtcbiAgc3RhdGUuY2FydC5zcGxpY2UoaW5kZXgsIDEpO1xuICBzYXZlSnNvbihDQVJUX0tFWSwgc3RhdGUuY2FydCk7XG4gIG5vdGlmeVN0YXRlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNhcnQoKSB7XG4gIHN0YXRlLmNhcnQgPSBbXTtcbiAgc2F2ZUpzb24oQ0FSVF9LRVksIHN0YXRlLmNhcnQpO1xuICBub3RpZnlTdGF0ZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FydFRvdGFscyh6b25lID0gJ2luc2lkZScpIHtcbiAgY29uc3Qgc3VidG90YWwgPSBzdGF0ZS5jYXJ0LnJlZHVjZSgoc3VtLCBpdGVtKSA9PiBzdW0gKyBpdGVtLnByaWNlICogaXRlbS5xdHksIDApO1xuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIGNvbnN0IGZyZWVNaW4gPSBOdW1iZXIoZy5mcmVlRGVsaXZlcnlNaW4pIHx8IDA7XG4gIGxldCBkZWxpdmVyeSA9IHpvbmUgPT09ICdpbnNpZGUnID8gTnVtYmVyKGcuaW5zaWRlRGhha2FGZWUgPz8gNjApIDogTnVtYmVyKGcub3V0c2lkZURoYWthRmVlID8/IDEyMCk7XG4gIGlmIChzdWJ0b3RhbCA9PT0gMCB8fCAoZnJlZU1pbiA+IDAgJiYgc3VidG90YWwgPj0gZnJlZU1pbikpIHtcbiAgICBkZWxpdmVyeSA9IDA7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzdWJ0b3RhbCxcbiAgICBkZWxpdmVyeSxcbiAgICB0b3RhbDogc3VidG90YWwgKyBkZWxpdmVyeSxcbiAgICBpdGVtQ291bnQ6IHN0YXRlLmNhcnQucmVkdWNlKChzdW0sIGl0ZW0pID0+IHN1bSArIGl0ZW0ucXR5LCAwKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlV2lzaGxpc3QocHJvZHVjdElkKSB7XG4gIGNvbnN0IGlkeCA9IHN0YXRlLndpc2hsaXN0LmluZGV4T2YocHJvZHVjdElkKTtcbiAgaWYgKGlkeCA+PSAwKSB7XG4gICAgc3RhdGUud2lzaGxpc3Quc3BsaWNlKGlkeCwgMSk7XG4gICAgc2hvd1RvYXN0KCdSZW1vdmVkIGZyb20gd2lzaGxpc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS53aXNobGlzdC5wdXNoKHByb2R1Y3RJZCk7XG4gICAgc2hvd1RvYXN0KCdTYXZlZCB0byB3aXNobGlzdCcpO1xuICB9XG4gIHNhdmVKc29uKFdJU0hfS0VZLCBzdGF0ZS53aXNobGlzdCk7XG4gIG5vdGlmeVN0YXRlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRSZWNlbnRseVZpZXdlZChwcm9kdWN0SWQpIHtcbiAgc3RhdGUucmVjZW50bHlWaWV3ZWQgPSBbcHJvZHVjdElkLCAuLi5zdGF0ZS5yZWNlbnRseVZpZXdlZC5maWx0ZXIoKGlkKSA9PiBpZCAhPT0gcHJvZHVjdElkKV0uc2xpY2UoMCwgMTApO1xuICBzYXZlSnNvbihSRUNFTlRfS0VZLCBzdGF0ZS5yZWNlbnRseVZpZXdlZCk7XG59XG5cbi8vIC0tLSBGaXJlc3RvcmUgUmVhbC1UaW1lIExpc3RlbmVycyAtLS1cbmxldCBhZG1pbk9yZGVyc1Vuc3ViID0gbnVsbDtcbmxldCBhZG1pblBvc3RzVW5zdWIgPSBudWxsO1xubGV0IGFkbWluU3Vic1Vuc3ViID0gbnVsbDtcbmxldCBwdWJsaWNVbnN1YnMgPSBbXTtcbmxldCBrbm93bk9yZGVySWRzID0gbmV3IFNldCgpO1xubGV0IG9yZGVyc0luaXRpYWxpemVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIG1hcmtEYkNvbm5lY3RlZCgpIHtcbiAgaWYgKCFzdGF0ZS5maXJlc3RvcmVDb25uZWN0ZWQgfHwgc3RhdGUuZGJTdGF0dXMgIT09ICdjb25uZWN0ZWQnIHx8IHN0YXRlLmRiRXJyb3IpIHtcbiAgICBzdGF0ZS5maXJlc3RvcmVDb25uZWN0ZWQgPSB0cnVlO1xuICAgIHN0YXRlLmRiU3RhdHVzID0gJ2Nvbm5lY3RlZCc7XG4gICAgc3RhdGUuZGJFcnJvciA9ICcnO1xuICAgIHN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICBub3RpZnlTdGF0ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcmtEYlVucmVhY2hhYmxlKGVyciwgb3BUeXBlLCBwYXRoKSB7XG4gIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgb3BUeXBlLCBwYXRoKTtcbiAgc3RhdGUuZmlyZXN0b3JlQ29ubmVjdGVkID0gZmFsc2U7XG4gIHN0YXRlLmRiU3RhdHVzID0gJ2Vycm9yJztcbiAgc3RhdGUuZGJFcnJvciA9IGZvcm1hdEZpcmVzdG9yZUVycm9yTWVzc2FnZShlcnIpO1xuICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XG4gIG5vdGlmeVN0YXRlKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeURhdGFiYXNlQ29ubmVjdGlvbigpIHtcbiAgc3RhdGUuZGJTdGF0dXMgPSAnY29ubmVjdGluZyc7XG4gIHN0YXRlLmRiRXJyb3IgPSAnJztcbiAgbm90aWZ5U3RhdGUoKTtcbiAgY29uc3QgcmVzID0gYXdhaXQgdGVzdENvbm5lY3Rpb24oKTtcbiAgaWYgKHJlcy5vaykge1xuICAgIG1hcmtEYkNvbm5lY3RlZCgpO1xuICAgIGluaXRSZWFsdGltZVN5bmMoKTtcbiAgICBzaG93VG9hc3QoJ0Nvbm5lY3RlZCB0byBGaXJlYmFzZSBGaXJlc3RvcmUgKHBhemFyby1iZCkuJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgc3RhdGUuZmlyZXN0b3JlQ29ubmVjdGVkID0gZmFsc2U7XG4gIHN0YXRlLmRiU3RhdHVzID0gJ2Vycm9yJztcbiAgc3RhdGUuZGJFcnJvciA9IHJlcy5tZXNzYWdlIHx8ICdVbmFibGUgdG8gcmVhY2ggRmlyZWJhc2UgZGF0YWJhc2UuJztcbiAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xuICBub3RpZnlTdGF0ZSgpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0UmVhbHRpbWVTeW5jKCkge1xuICBwdWJsaWNVbnN1YnMuZm9yRWFjaCgodW5zdWIpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiB1bnN1YiA9PT0gJ2Z1bmN0aW9uJykgdW5zdWIoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSB1bnN1YnNjcmliZSBlcnJvclxuICAgIH1cbiAgfSk7XG4gIHB1YmxpY1Vuc3VicyA9IFtdO1xuXG4gIHRlc3RDb25uZWN0aW9uKCkudGhlbigocmVzKSA9PiB7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIHN0YXRlLmZpcmVzdG9yZUNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgc3RhdGUuZGJTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgc3RhdGUuZGJFcnJvciA9IHJlcy5tZXNzYWdlO1xuICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgbm90aWZ5U3RhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya0RiQ29ubmVjdGVkKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyAxLiBQcm9kdWN0cyBsaXN0ZW5lclxuICBwdWJsaWNVbnN1YnMucHVzaChcbiAgICBvblNuYXBzaG90KFxuICAgICAgY29sbGVjdGlvbihkYiwgJ3Byb2R1Y3RzJyksXG4gICAgICAoc25hcCkgPT4ge1xuICAgICAgICBtYXJrRGJDb25uZWN0ZWQoKTtcbiAgICAgICAgaWYgKCFzbmFwLmVtcHR5IHx8IHN0YXRlLmZpcmVzdG9yZVByb2R1Y3RJZHMuc2l6ZSA+IDApIHtcbiAgICAgICAgICBjb25zdCBkZWxldGVkSWRzID0gIXN0YXRlLmlzQWRtaW4gPyBnZXREZWxldGVkUHJvZHVjdElkU2V0KCkgOiBuZXcgU2V0KCk7XG4gICAgICAgICAgY29uc3QgY2F0T3YgPSAhc3RhdGUuaXNBZG1pbiA/IGdldExvY2FsQ2F0T3ZlcnJpZGVzKCkgOiB7IHJlbmFtZWRGcm9tOiB7fSB9O1xuICAgICAgICAgIGNvbnN0IGl0ZW1zID0gW107XG4gICAgICAgICAgY29uc3QgaWRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgY29uc3QgZnNNZXJnZWQgPVxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oQkVBVVRZX01FUkdFX0ZTX0tFWSkgPT09ICd0cnVlJyB8fFxuICAgICAgICAgICAgKHNuYXAuZG9jcy5zb21lKChkKSA9PiBkLmRhdGEoKS5jYXRlZ29yeSA9PT0gQkVBVVRZX1VOSUZJRURfTkFNRSkgJiZcbiAgICAgICAgICAgICAgIXNuYXAuZG9jcy5zb21lKChkKSA9PiBkLmRhdGEoKS5jYXRlZ29yeSA9PT0gJ1NraW5jYXJlICYgU2VydW1zJyB8fCBkLmRhdGEoKS5jYXRlZ29yeSA9PT0gJ0JlYXV0eScpKTtcblxuICAgICAgICAgIGlmIChmc01lcmdlZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oQkVBVVRZX01FUkdFX0ZTX0tFWSwgJ3RydWUnKTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBJZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzZWVkUHJvZEJ5SWQgPSBuZXcgTWFwKFNFRURfUFJPRFVDVFMubWFwKChzcCkgPT4gW3NwLmlkLCBzcF0pKTtcbiAgICAgICAgICBzbmFwLmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgICAgIGlkU2V0LmFkZChkLmlkKTtcbiAgICAgICAgICAgIGlmIChkZWxldGVkSWRzLmhhcyhTdHJpbmcoZC5pZCkpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZC5kYXRhKCk7XG4gICAgICAgICAgICBsZXQgcmF3Q2F0ID0gZGF0YS5jYXRlZ29yeTtcbiAgICAgICAgICAgIGxldCBpbWFnZXMgPSBkYXRhLmltYWdlcztcbiAgICAgICAgICAgIGlmICghZnNNZXJnZWQgJiYgKHJhd0NhdCA9PT0gJ0JlYXV0eScgfHwgcmF3Q2F0ID09PSAnU2tpbmNhcmUgJiBTZXJ1bXMnKSkge1xuICAgICAgICAgICAgICByYXdDYXQgPSBCRUFVVFlfVU5JRklFRF9OQU1FO1xuICAgICAgICAgICAgICBjb25zdCBzZWVkTWF0Y2ggPSBzZWVkUHJvZEJ5SWQuZ2V0KGQuaWQpO1xuICAgICAgICAgICAgICBpZiAoc2VlZE1hdGNoICYmIEFycmF5LmlzQXJyYXkoaW1hZ2VzKSAmJiBTdHJpbmcoaW1hZ2VzWzBdIHx8ICcnKS5zdGFydHNXaXRoKCdkYXRhOmltYWdlL3N2Zyt4bWwnKSkge1xuICAgICAgICAgICAgICAgIGltYWdlcyA9IHNlZWRNYXRjaC5pbWFnZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZENhdCA9IGNhdE92LnJlbmFtZWRGcm9tW3Jhd0NhdF0gfHwgcmF3Q2F0O1xuICAgICAgICAgICAgaXRlbXMucHVzaCh7IC4uLmRhdGEsIGltYWdlcywgY2F0ZWdvcnk6IG1hcHBlZENhdCwgaWQ6IGQuaWQgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoIWZzTWVyZ2VkKSB7XG4gICAgICAgICAgICBTS0lOQ0FSRV9QUk9EVUNUX0lEUy5mb3JFYWNoKChwaWQpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGRlbGV0ZWRJZHMuaGFzKHBpZCkgfHwgaXRlbXMuc29tZSgocCkgPT4gcC5pZCA9PT0gcGlkKSkgcmV0dXJuO1xuICAgICAgICAgICAgICBjb25zdCBzZWVkUHJvZCA9IHNlZWRQcm9kQnlJZC5nZXQocGlkKTtcbiAgICAgICAgICAgICAgaWYgKHNlZWRQcm9kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwcGVkQ2F0ID0gY2F0T3YucmVuYW1lZEZyb21bc2VlZFByb2QuY2F0ZWdvcnldIHx8IHNlZWRQcm9kLmNhdGVnb3J5O1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goeyAuLi5zZWVkUHJvZCwgY2F0ZWdvcnk6IG1hcHBlZENhdCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3RhdGUucHJvZHVjdHMgPSBpdGVtcztcbiAgICAgICAgICBzdGF0ZS5maXJlc3RvcmVQcm9kdWN0SWRzID0gaWRTZXQ7XG4gICAgICAgICAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICAgICAgICAgIG5vdGlmeVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBtYXJrRGJVbnJlYWNoYWJsZShlcnIsIE9wZXJhdGlvblR5cGUuTElTVCwgJ3Byb2R1Y3RzJylcbiAgICApXG4gICk7XG5cbiAgLy8gMi4gQ2F0ZWdvcmllcyBsaXN0ZW5lclxuICBwdWJsaWNVbnN1YnMucHVzaChcbiAgICBvblNuYXBzaG90KFxuICAgICAgY29sbGVjdGlvbihkYiwgJ2NhdGVnb3JpZXMnKSxcbiAgICAgIChzbmFwKSA9PiB7XG4gICAgICAgIG1hcmtEYkNvbm5lY3RlZCgpO1xuICAgICAgICBpZiAoIXNuYXAuZW1wdHkpIHtcbiAgICAgICAgICBjb25zdCBjYXRPdiA9ICFzdGF0ZS5pc0FkbWluID8gZ2V0TG9jYWxDYXRPdmVycmlkZXMoKSA6IHsgZWRpdGVkQnlJZDoge30sIGRlbGV0ZWRJZHM6IFtdIH07XG4gICAgICAgICAgY29uc3QgZGVsZXRlZFNldCA9IG5ldyBTZXQoY2F0T3YuZGVsZXRlZElkcyB8fCBbXSk7XG4gICAgICAgICAgY29uc3QgZnNDYXRNZXJnZWQgPVxuICAgICAgICAgICAgc25hcC5kb2NzLnNvbWUoKGQpID0+IGQuaWQgPT09IEJFQVVUWV9DQVRFR09SWV9JRCAmJiBkLmRhdGEoKS5uYW1lID09PSBCRUFVVFlfVU5JRklFRF9OQU1FKSAmJlxuICAgICAgICAgICAgIXNuYXAuZG9jcy5zb21lKChkKSA9PiBkLmlkID09PSBMRUdBQ1lfU0tJTkNBUkVfQ0FURUdPUllfSUQpO1xuICAgICAgICAgIGlmIChmc0NhdE1lcmdlZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oQkVBVVRZX01FUkdFX0ZTX0tFWSwgJ3RydWUnKTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBJZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZnNNZXJnZWQgPSBmc0NhdE1lcmdlZCB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShCRUFVVFlfTUVSR0VfRlNfS0VZKSA9PT0gJ3RydWUnO1xuICAgICAgICAgIGNvbnN0IHNlZWRCeUlkID0gbmV3IE1hcChTRUVEX0NBVEVHT1JJRVMubWFwKChzYykgPT4gW3NjLmlkLCBzY10pKTtcblxuICAgICAgICAgIGNvbnN0IGJ5SWQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgc25hcC5kb2NzLmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkU2V0LmhhcyhTdHJpbmcoZC5pZCkpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoIWZzTWVyZ2VkICYmIGQuaWQgPT09IExFR0FDWV9TS0lOQ0FSRV9DQVRFR09SWV9JRCkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSB7IC4uLmQuZGF0YSgpLCBpZDogZC5pZCB9O1xuICAgICAgICAgICAgaWYgKCFmc01lcmdlZCkge1xuICAgICAgICAgICAgICBpZiAoZC5pZCA9PT0gQkVBVVRZX0NBVEVHT1JZX0lEICYmIChiYXNlLm5hbWUgPT09ICdCZWF1dHknIHx8IGJhc2UubmFtZSA9PT0gJ1NraW5jYXJlICYgU2VydW1zJykpIHtcbiAgICAgICAgICAgICAgICBiYXNlID0ge1xuICAgICAgICAgICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICAgICAgICAgIG5hbWU6IEJFQVVUWV9VTklGSUVEX05BTUUsXG4gICAgICAgICAgICAgICAgICBuYW1lQm46IEJFQVVUWV9VTklGSUVEX05BTUVfQk4sXG4gICAgICAgICAgICAgICAgICBpY29uOiBiYXNlLmljb24gPT09ICfinKgnIHx8ICFiYXNlLmljb24gPyAn8J+ntCcgOiBiYXNlLmljb24sXG4gICAgICAgICAgICAgICAgICBzb3J0T3JkZXI6IDlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlZWRNYXRjaCA9IHNlZWRCeUlkLmdldChkLmlkKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VlZE1hdGNoICYmIE51bWJlcihiYXNlLnNvcnRPcmRlcikgPT09IHNlZWRNYXRjaC5zb3J0T3JkZXIgKyAxICYmIHNlZWRNYXRjaC5zb3J0T3JkZXIgPj0gMTApIHtcbiAgICAgICAgICAgICAgICAgIGJhc2UgPSB7IC4uLmJhc2UsIHNvcnRPcmRlcjogc2VlZE1hdGNoLnNvcnRPcmRlciB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgb3ZlcnJpZGUgPSBjYXRPdi5lZGl0ZWRCeUlkW2QuaWRdO1xuICAgICAgICAgICAgYnlJZC5zZXQoZC5pZCwgb3ZlcnJpZGUgPyB7IC4uLmJhc2UsIC4uLm92ZXJyaWRlIH0gOiBiYXNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBPYmplY3QudmFsdWVzKGNhdE92LmVkaXRlZEJ5SWQgfHwge30pLmZvckVhY2goKG92Q2F0KSA9PiB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIG92Q2F0Py5pZCAmJlxuICAgICAgICAgICAgICBvdkNhdC5pZCAhPT0gTEVHQUNZX1NLSU5DQVJFX0NBVEVHT1JZX0lEICYmXG4gICAgICAgICAgICAgICFkZWxldGVkU2V0LmhhcyhTdHJpbmcob3ZDYXQuaWQpKSAmJlxuICAgICAgICAgICAgICAhYnlJZC5oYXMob3ZDYXQuaWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgYnlJZC5zZXQob3ZDYXQuaWQsIG92Q2F0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBjYXRzID0gQXJyYXkuZnJvbShieUlkLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiAoYS5zb3J0T3JkZXIgfHwgMCkgLSAoYi5zb3J0T3JkZXIgfHwgMCkpO1xuICAgICAgICAgIHN0YXRlLmNhdGVnb3JpZXMgPSBjYXRzO1xuICAgICAgICAgIHBlcnNpc3RDYXRhbG9nQ2FjaGUoKTtcbiAgICAgICAgICBub3RpZnlTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKGVycikgPT4gbWFya0RiVW5yZWFjaGFibGUoZXJyLCBPcGVyYXRpb25UeXBlLkxJU1QsICdjYXRlZ29yaWVzJylcbiAgICApXG4gICk7XG5cbiAgLy8gMy4gUHVibGlzaGVkIEJsb2cgUG9zdHMgbGlzdGVuZXJcbiAgY29uc3QgcHViUG9zdHNRID0gcXVlcnkoY29sbGVjdGlvbihkYiwgJ3Bvc3RzJyksIHdoZXJlKCdwdWJsaXNoZWQnLCAnPT0nLCB0cnVlKSk7XG4gIHB1YmxpY1Vuc3Vicy5wdXNoKFxuICAgIG9uU25hcHNob3QoXG4gICAgICBwdWJQb3N0c1EsXG4gICAgICAoc25hcCkgPT4ge1xuICAgICAgICBtYXJrRGJDb25uZWN0ZWQoKTtcbiAgICAgICAgaWYgKCFzbmFwLmVtcHR5ICYmICFzdGF0ZS5pc0FkbWluKSB7XG4gICAgICAgICAgY29uc3QgaW5jb21pbmcgPSBzbmFwLmRvY3MubWFwKChkKSA9PiAoeyAuLi5kLmRhdGEoKSwgaWQ6IGQuaWQgfSkpO1xuICAgICAgICAgIGNvbnN0IGxvY2FsRHJhZnRzID0gc3RhdGUucG9zdHMuZmlsdGVyKChwKSA9PiBwLnB1Ymxpc2hlZCA9PT0gZmFsc2UpO1xuICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFsuLi5pbmNvbWluZ107XG4gICAgICAgICAgbG9jYWxEcmFmdHMuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFtZXJnZWQuc29tZSgobSkgPT4gbS5pZCA9PT0gZC5pZCkpIG1lcmdlZC5wdXNoKGQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHN0YXRlLnBvc3RzID0gbWVyZ2VQb3N0c1dpdGhSZXBvcnRzKG1lcmdlZCk7XG4gICAgICAgICAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICAgICAgICAgIG5vdGlmeVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBtYXJrRGJVbnJlYWNoYWJsZShlcnIsIE9wZXJhdGlvblR5cGUuTElTVCwgJ3Bvc3RzJylcbiAgICApXG4gICk7XG5cbiAgLy8gNC4gUmV2aWV3cyBsaXN0ZW5lclxuICBwdWJsaWNVbnN1YnMucHVzaChcbiAgICBvblNuYXBzaG90KFxuICAgICAgY29sbGVjdGlvbihkYiwgJ3Jldmlld3MnKSxcbiAgICAgIChzbmFwKSA9PiB7XG4gICAgICAgIG1hcmtEYkNvbm5lY3RlZCgpO1xuICAgICAgICBpZiAoIXNuYXAuZW1wdHkpIHtcbiAgICAgICAgICBzdGF0ZS5yZXZpZXdzID0gc25hcC5kb2NzLm1hcCgoZCkgPT4gKHsgYXBwcm92ZWQ6IHRydWUsIC4uLmQuZGF0YSgpLCBpZDogZC5pZCB9KSk7XG4gICAgICAgICAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICAgICAgICAgIG5vdGlmeVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBtYXJrRGJVbnJlYWNoYWJsZShlcnIsIE9wZXJhdGlvblR5cGUuTElTVCwgJ3Jldmlld3MnKVxuICAgIClcbiAgKTtcblxuICAvLyA1LiBTZXR0aW5ncyBsaXN0ZW5lciAoZ2VuZXJhbCwgdGhlbWUsIGFkcylcbiAgcHVibGljVW5zdWJzLnB1c2goXG4gICAgb25TbmFwc2hvdChcbiAgICAgIGNvbGxlY3Rpb24oZGIsICdzZXR0aW5ncycpLFxuICAgICAgKHNuYXApID0+IHtcbiAgICAgICAgbWFya0RiQ29ubmVjdGVkKCk7XG4gICAgICAgIHNuYXAuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICAgIGlmIChkLmlkID09PSAnZ2VuZXJhbCcpIHN0YXRlLmdlbmVyYWwgPSB7IC4uLlNFRURfR0VORVJBTF9TRVRUSU5HUywgLi4uZC5kYXRhKCkgfTtcbiAgICAgICAgICBpZiAoZC5pZCA9PT0gJ3RoZW1lJykgc3RhdGUudGhlbWUgPSBub3JtYWxpemVUaGVtZVNldHRpbmdzKGQuZGF0YSgpKTtcbiAgICAgICAgICBpZiAoZC5pZCA9PT0gJ2FkcycpIHN0YXRlLmFkcyA9IHsgLi4uU0VFRF9BRFNfU0VUVElOR1MsIC4uLmQuZGF0YSgpIH07XG4gICAgICAgIH0pO1xuICAgICAgICBhcHBseVRoZW1lVmFyaWFibGVzKCk7XG4gICAgICAgIHBlcnNpc3RDYXRhbG9nQ2FjaGUoKTtcbiAgICAgICAgbm90aWZ5U3RhdGUoKTtcbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBtYXJrRGJVbnJlYWNoYWJsZShlcnIsIE9wZXJhdGlvblR5cGUuTElTVCwgJ3NldHRpbmdzJylcbiAgICApXG4gICk7XG5cbiAgLy8gNi4gQXV0aCBTdGF0ZSBPYnNlcnZlclxuICBwdWJsaWNVbnN1YnMucHVzaChcbiAgICBvbkF1dGhTdGF0ZUNoYW5nZWQoYXV0aCwgYXN5bmMgKHVzZXIpID0+IHtcbiAgICAgIHN0YXRlLmF1dGhVc2VyID0gdXNlcjtcbiAgICAgIHN0YXRlLmF1dGhSZWFkeSA9IHRydWU7XG4gICAgICBzdGF0ZS5hdXRoVmVyaWZpY2F0aW9uUmVxdWlyZWQgPSBCb29sZWFuKHVzZXIgJiYgIXVzZXIuZW1haWxWZXJpZmllZCk7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICBsZXQgdmVyaWZpZWRBZG1pbiA9IHVzZXIuZW1haWwgPT09ICdtYWhpbnVyaXNsYW1tYXJ1ZkBnbWFpbC5jb20nICYmIHVzZXIuZW1haWxWZXJpZmllZDtcbiAgICAgICAgaWYgKCF2ZXJpZmllZEFkbWluICYmIHVzZXIuZW1haWxWZXJpZmllZCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhZG1pbkRvYyA9IGF3YWl0IGdldERvYyhkb2MoZGIsICdhZG1pbnMnLCB1c2VyLnVpZCkpO1xuICAgICAgICAgICAgaWYgKGFkbWluRG9jLmV4aXN0cygpKSB2ZXJpZmllZEFkbWluID0gdHJ1ZTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHZlcmlmaWVkQWRtaW4gPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuaXNBZG1pbiA9IHZlcmlmaWVkQWRtaW47XG4gICAgICAgIGlmICh2ZXJpZmllZEFkbWluKSB7XG4gICAgICAgICAgYXR0YWNoQWRtaW5MaXN0ZW5lcnMoKTtcbiAgICAgICAgICBhdXRvU2VlZElmRW1wdHkoKS50aGVuKCgpID0+IHN5bmNCZWF1dHlTa2luY2FyZU1lcmdlVG9GaXJlc3RvcmVJZk5lZWRlZCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZXRhY2hBZG1pbkxpc3RlbmVycygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5pc0FkbWluID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLmF1dGhWZXJpZmljYXRpb25SZXF1aXJlZCA9IGZhbHNlO1xuICAgICAgICBkZXRhY2hBZG1pbkxpc3RlbmVycygpO1xuICAgICAgfVxuICAgICAgbm90aWZ5U3RhdGUoKTtcbiAgICB9KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya09yZGVyc1NlZW4oKSB7XG4gIHN0YXRlLnVuc2Vlbk9yZGVySWRzLmNsZWFyKCk7XG4gIHN0YXRlLm5ld09yZGVyc0NvdW50ID0gMDtcbiAgc2F2ZUpzb24oVU5TRUVOX09SREVSU19LRVksIFtdKTtcbiAgbm90aWZ5U3RhdGUoKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VPcmRlcnNXaXRoTG9jYWxDYWNoZShmaXJlc3RvcmVMaXN0KSB7XG4gIGNvbnN0IGxvY2FsT3JkZXJzID0gbG9hZEpzb24oQURNSU5fT1JERVJTX0NBQ0hFX0tFWSwgW10pO1xuICBjb25zdCBieUlkID0gbmV3IE1hcCgpO1xuICAoZmlyZXN0b3JlTGlzdCB8fCBbXSkuZm9yRWFjaCgobykgPT4gYnlJZC5zZXQoby5pZCwgbykpO1xuICAobG9jYWxPcmRlcnMgfHwgW10pLmZvckVhY2goKG8pID0+IHtcbiAgICBpZiAoIWJ5SWQuaGFzKG8uaWQpKSBieUlkLnNldChvLmlkLCBvKTtcbiAgfSk7XG4gIHJldHVybiBBcnJheS5mcm9tKGJ5SWQudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICBjb25zdCB0YSA9IGEuY3JlYXRlZEF0Py50b01pbGxpcyA/IGEuY3JlYXRlZEF0LnRvTWlsbGlzKCkgOiBuZXcgRGF0ZShhLmNyZWF0ZWRBdCB8fCAwKS5nZXRUaW1lKCk7XG4gICAgY29uc3QgdGIgPSBiLmNyZWF0ZWRBdD8udG9NaWxsaXMgPyBiLmNyZWF0ZWRBdC50b01pbGxpcygpIDogbmV3IERhdGUoYi5jcmVhdGVkQXQgfHwgMCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiB0YiAtIHRhO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoQWRtaW5MaXN0ZW5lcnMoKSB7XG4gIGlmICghYWRtaW5PcmRlcnNVbnN1Yikge1xuICAgIGFkbWluT3JkZXJzVW5zdWIgPSBvblNuYXBzaG90KFxuICAgICAgY29sbGVjdGlvbihkYiwgJ29yZGVycycpLFxuICAgICAgKHNuYXApID0+IHtcbiAgICAgICAgY29uc3QgbGlzdCA9IHNuYXAuZG9jcy5tYXAoKGQpID0+ICh7IC4uLmQuZGF0YSgpLCBpZDogZC5pZCB9KSk7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlT3JkZXJzV2l0aExvY2FsQ2FjaGUobGlzdCk7XG5cbiAgICAgICAgaWYgKG9yZGVyc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgbGV0IGFkZGVkTmV3ID0gZmFsc2U7XG4gICAgICAgICAgbWVyZ2VkLmZvckVhY2goKG9yZCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFrbm93bk9yZGVySWRzLmhhcyhvcmQuaWQpKSB7XG4gICAgICAgICAgICAgIHN0YXRlLnVuc2Vlbk9yZGVySWRzLmFkZChvcmQuaWQpO1xuICAgICAgICAgICAgICBhZGRlZE5ldyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGFkZGVkTmV3KSB7XG4gICAgICAgICAgICBzdGF0ZS5uZXdPcmRlcnNDb3VudCA9IHN0YXRlLnVuc2Vlbk9yZGVySWRzLnNpemU7XG4gICAgICAgICAgICBzYXZlSnNvbihVTlNFRU5fT1JERVJTX0tFWSwgQXJyYXkuZnJvbShzdGF0ZS51bnNlZW5PcmRlcklkcykpO1xuICAgICAgICAgICAgcGxheU9yZGVyQ2hpbWUoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnTmV3IGN1c3RvbWVyIG9yZGVyIHJlY2VpdmVkIScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBrbm93bk9yZGVySWRzID0gbmV3IFNldChtZXJnZWQubWFwKChvKSA9PiBvLmlkKSk7XG4gICAgICAgIG9yZGVyc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgc3RhdGUub3JkZXJzID0gbWVyZ2VkO1xuICAgICAgICBzYXZlSnNvbihBRE1JTl9PUkRFUlNfQ0FDSEVfS0VZLCBtZXJnZWQuc2xpY2UoMCwgMTAwKSk7XG4gICAgICAgIG5vdGlmeVN0YXRlKCk7XG4gICAgICB9LFxuICAgICAgKGVycikgPT4gaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLkxJU1QsICdvcmRlcnMnKVxuICAgICk7XG4gIH1cblxuICBpZiAoIWFkbWluUG9zdHNVbnN1Yikge1xuICAgIGFkbWluUG9zdHNVbnN1YiA9IG9uU25hcHNob3QoXG4gICAgICBjb2xsZWN0aW9uKGRiLCAncG9zdHMnKSxcbiAgICAgIChzbmFwKSA9PiB7XG4gICAgICAgIGlmICghc25hcC5lbXB0eSkge1xuICAgICAgICAgIHN0YXRlLnBvc3RzID0gbWVyZ2VQb3N0c1dpdGhSZXBvcnRzKHNuYXAuZG9jcy5tYXAoKGQpID0+ICh7IC4uLmQuZGF0YSgpLCBpZDogZC5pZCB9KSkpO1xuICAgICAgICAgIHBlcnNpc3RDYXRhbG9nQ2FjaGUoKTtcbiAgICAgICAgICBub3RpZnlTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKGVycikgPT4gaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLkxJU1QsICdwb3N0cycpXG4gICAgKTtcbiAgfVxuXG4gIGlmICghYWRtaW5TdWJzVW5zdWIpIHtcbiAgICBhZG1pblN1YnNVbnN1YiA9IG9uU25hcHNob3QoXG4gICAgICBjb2xsZWN0aW9uKGRiLCAnc3Vic2NyaWJlcnMnKSxcbiAgICAgIChzbmFwKSA9PiB7XG4gICAgICAgIHN0YXRlLnN1YnNjcmliZXJzID0gc25hcC5kb2NzLm1hcCgoZCkgPT4gKHsgLi4uZC5kYXRhKCksIGlkOiBkLmlkIH0pKTtcbiAgICAgICAgbm90aWZ5U3RhdGUoKTtcbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuTElTVCwgJ3N1YnNjcmliZXJzJylcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRldGFjaEFkbWluTGlzdGVuZXJzKCkge1xuICBpZiAoYWRtaW5PcmRlcnNVbnN1YikgeyBhZG1pbk9yZGVyc1Vuc3ViKCk7IGFkbWluT3JkZXJzVW5zdWIgPSBudWxsOyB9XG4gIGlmIChhZG1pblBvc3RzVW5zdWIpIHsgYWRtaW5Qb3N0c1Vuc3ViKCk7IGFkbWluUG9zdHNVbnN1YiA9IG51bGw7IH1cbiAgaWYgKGFkbWluU3Vic1Vuc3ViKSB7IGFkbWluU3Vic1Vuc3ViKCk7IGFkbWluU3Vic1Vuc3ViID0gbnVsbDsgfVxuICBzdGF0ZS5vcmRlcnMgPSBsb2FkSnNvbihBRE1JTl9PUkRFUlNfQ0FDSEVfS0VZLCBbXSk7XG4gIHN0YXRlLnN1YnNjcmliZXJzID0gW107XG4gIG9yZGVyc0luaXRpYWxpemVkID0gZmFsc2U7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGF1dG9TZWVkSWZFbXB0eSgpIHtcbiAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFRURFRF9GTEFHX0tFWSkgPT09ICd0cnVlJykge1xuICAgIC8vIFN0aWxsIGNoZWNrIGlmIHByb2R1Y3RzIGNvbGxlY3Rpb24gaXMgYWN0dWFsbHkgZW1wdHkgb24gc2VydmVyXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXAgPSBhd2FpdCBnZXREb2NzKGNvbGxlY3Rpb24oZGIsICdwcm9kdWN0cycpKTtcbiAgICAgIGlmICghc25hcC5lbXB0eSkgcmV0dXJuO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IHNuYXAgPSBhd2FpdCBnZXREb2NzKGNvbGxlY3Rpb24oZGIsICdwcm9kdWN0cycpKTtcbiAgICBpZiAoc25hcC5lbXB0eSkge1xuICAgICAgYXdhaXQgc2VlZERlbW9EYXRhVG9GaXJlc3RvcmUoZmFsc2UpO1xuICAgIH1cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTRUVERURfRkxBR19LRVksICd0cnVlJyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5MSVNULCAncHJvZHVjdHMnKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQmVhdXR5U2tpbmNhcmVNZXJnZVRvRmlyZXN0b3JlSWZOZWVkZWQoKSB7XG4gIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShCRUFVVFlfTUVSR0VfRlNfS0VZKSA9PT0gJ3RydWUnKSByZXR1cm47XG4gIHRyeSB7XG4gICAgY29uc3QgW2NhdFNuYXAsIHByb2RTbmFwXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIGdldERvY3MoY29sbGVjdGlvbihkYiwgJ2NhdGVnb3JpZXMnKSksXG4gICAgICBnZXREb2NzKGNvbGxlY3Rpb24oZGIsICdwcm9kdWN0cycpKVxuICAgIF0pO1xuICAgIGlmIChjYXRTbmFwLmVtcHR5ICYmIHByb2RTbmFwLmVtcHR5KSByZXR1cm47XG5cbiAgICBjb25zdCBjYXRCeUlkID0gbmV3IE1hcChjYXRTbmFwLmRvY3MubWFwKChkKSA9PiBbZC5pZCwgZC5kYXRhKCldKSk7XG4gICAgY29uc3QgcHJvZEJ5SWQgPSBuZXcgTWFwKHByb2RTbmFwLmRvY3MubWFwKChkKSA9PiBbZC5pZCwgZC5kYXRhKCldKSk7XG4gICAgY29uc3Qgc2VlZEJ5SWQgPSBuZXcgTWFwKFNFRURfQ0FURUdPUklFUy5tYXAoKHNjKSA9PiBbc2MuaWQsIHNjXSkpO1xuICAgIGNvbnN0IHNlZWRQcm9kQnlJZCA9IG5ldyBNYXAoU0VFRF9QUk9EVUNUUy5tYXAoKHNwKSA9PiBbc3AuaWQsIHNwXSkpO1xuXG4gICAgY29uc3QgaGFzTGVnYWN5Q2F0ID0gY2F0QnlJZC5oYXMoTEVHQUNZX1NLSU5DQVJFX0NBVEVHT1JZX0lEKTtcbiAgICBjb25zdCBoYXNMZWdhY3lQcm9kQ2F0ID0gcHJvZFNuYXAuZG9jcy5zb21lKFxuICAgICAgKGQpID0+IGQuZGF0YSgpLmNhdGVnb3J5ID09PSAnQmVhdXR5JyB8fCBkLmRhdGEoKS5jYXRlZ29yeSA9PT0gJ1NraW5jYXJlICYgU2VydW1zJ1xuICAgICk7XG4gICAgY29uc3QgYWxsU2VlZFByZXNlbnQgPSBTS0lOQ0FSRV9QUk9EVUNUX0lEUy5ldmVyeSgoaWQpID0+IHByb2RCeUlkLmhhcyhpZCkpO1xuICAgIGNvbnN0IGJlYXV0eURvYyA9IGNhdEJ5SWQuZ2V0KEJFQVVUWV9DQVRFR09SWV9JRCk7XG5cbiAgICBpZiAoIWhhc0xlZ2FjeUNhdCAmJiAhaGFzTGVnYWN5UHJvZENhdCAmJiBhbGxTZWVkUHJlc2VudCAmJiBiZWF1dHlEb2M/Lm5hbWUgPT09IEJFQVVUWV9VTklGSUVEX05BTUUpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEJFQVVUWV9NRVJHRV9GU19LRVksICd0cnVlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2F0T3YgPSBnZXRMb2NhbENhdE92ZXJyaWRlcygpO1xuICAgIGNvbnN0IGRlbGV0ZWRDYXRTZXQgPSBuZXcgU2V0KGNhdE92LmRlbGV0ZWRJZHMgfHwgW10pO1xuICAgIGNvbnN0IGRlbGV0ZWRQcm9kU2V0ID0gZ2V0RGVsZXRlZFByb2R1Y3RJZFNldCgpO1xuICAgIGNvbnN0IGJhdGNoID0gd3JpdGVCYXRjaChkYik7XG4gICAgbGV0IGhhc1dyaXRlcyA9IGZhbHNlO1xuXG4gICAgaWYgKGhhc0xlZ2FjeUNhdCkge1xuICAgICAgYmF0Y2guZGVsZXRlKGRvYyhkYiwgJ2NhdGVnb3JpZXMnLCBMRUdBQ1lfU0tJTkNBUkVfQ0FURUdPUllfSUQpKTtcbiAgICAgIGhhc1dyaXRlcyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFkZWxldGVkQ2F0U2V0LmhhcyhCRUFVVFlfQ0FURUdPUllfSUQpKSB7XG4gICAgICBjb25zdCBzZWVkQmVhdXR5ID0gc2VlZEJ5SWQuZ2V0KEJFQVVUWV9DQVRFR09SWV9JRCk7XG4gICAgICBpZiAoIWJlYXV0eURvYyB8fCBiZWF1dHlEb2MubmFtZSA9PT0gJ0JlYXV0eScgfHwgYmVhdXR5RG9jLm5hbWUgPT09ICdTa2luY2FyZSAmIFNlcnVtcycpIHtcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGUgPSBjYXRPdi5lZGl0ZWRCeUlkW0JFQVVUWV9DQVRFR09SWV9JRF07XG4gICAgICAgIGNvbnN0IG5leHRDYXQgPSBvdmVycmlkZSAmJiBvdmVycmlkZS5uYW1lICE9PSAnQmVhdXR5J1xuICAgICAgICAgID8geyAuLi5zZWVkQmVhdXR5LCAuLi5vdmVycmlkZSB9XG4gICAgICAgICAgOiBzZWVkQmVhdXR5O1xuICAgICAgICBiYXRjaC5zZXQoZG9jKGRiLCAnY2F0ZWdvcmllcycsIEJFQVVUWV9DQVRFR09SWV9JRCksIHtcbiAgICAgICAgICAuLi5uZXh0Q2F0LFxuICAgICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgICAgfSwgeyBtZXJnZTogdHJ1ZSB9KTtcbiAgICAgICAgaGFzV3JpdGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYXRTbmFwLmRvY3MuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgY29uc3Qgc2VlZE1hdGNoID0gc2VlZEJ5SWQuZ2V0KGQuaWQpO1xuICAgICAgaWYgKHNlZWRNYXRjaCAmJiBzZWVkTWF0Y2guc29ydE9yZGVyID49IDEwICYmIE51bWJlcihkLmRhdGEoKS5zb3J0T3JkZXIpID09PSBzZWVkTWF0Y2guc29ydE9yZGVyICsgMSkge1xuICAgICAgICBiYXRjaC51cGRhdGUoZG9jKGRiLCAnY2F0ZWdvcmllcycsIGQuaWQpLCB7XG4gICAgICAgICAgc29ydE9yZGVyOiBzZWVkTWF0Y2guc29ydE9yZGVyLFxuICAgICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgICAgfSk7XG4gICAgICAgIGhhc1dyaXRlcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB0YXJnZXRDYXRlZ29yeSA9IHJlc29sdmVDYXRlZ29yeVJlbmFtZShCRUFVVFlfVU5JRklFRF9OQU1FKTtcbiAgICBwcm9kU25hcC5kb2NzLmZvckVhY2goKGQpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBkLmRhdGEoKTtcbiAgICAgIGlmIChkYXRhLmNhdGVnb3J5ID09PSAnQmVhdXR5JyB8fCBkYXRhLmNhdGVnb3J5ID09PSAnU2tpbmNhcmUgJiBTZXJ1bXMnKSB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZURhdGEgPSB7XG4gICAgICAgICAgY2F0ZWdvcnk6IHRhcmdldENhdGVnb3J5LFxuICAgICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2VlZE1hdGNoID0gc2VlZFByb2RCeUlkLmdldChkLmlkKTtcbiAgICAgICAgaWYgKHNlZWRNYXRjaCAmJiBBcnJheS5pc0FycmF5KGRhdGEuaW1hZ2VzKSAmJiBTdHJpbmcoZGF0YS5pbWFnZXNbMF0gfHwgJycpLnN0YXJ0c1dpdGgoJ2RhdGE6aW1hZ2Uvc3ZnK3htbCcpKSB7XG4gICAgICAgICAgdXBkYXRlRGF0YS5pbWFnZXMgPSBzZWVkTWF0Y2guaW1hZ2VzO1xuICAgICAgICB9XG4gICAgICAgIGJhdGNoLnVwZGF0ZShkb2MoZGIsICdwcm9kdWN0cycsIGQuaWQpLCB1cGRhdGVEYXRhKTtcbiAgICAgICAgaGFzV3JpdGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIFNLSU5DQVJFX1BST0RVQ1RfSURTLmZvckVhY2goKHBpZCkgPT4ge1xuICAgICAgaWYgKHByb2RCeUlkLmhhcyhwaWQpIHx8IGRlbGV0ZWRQcm9kU2V0LmhhcyhwaWQpKSByZXR1cm47XG4gICAgICBjb25zdCBzZWVkUHJvZCA9IHNlZWRQcm9kQnlJZC5nZXQocGlkKTtcbiAgICAgIGlmIChzZWVkUHJvZCkge1xuICAgICAgICBiYXRjaC5zZXQoZG9jKGRiLCAncHJvZHVjdHMnLCBwaWQpLCB7XG4gICAgICAgICAgLi4uc2VlZFByb2QsXG4gICAgICAgICAgY2F0ZWdvcnk6IHRhcmdldENhdGVnb3J5LFxuICAgICAgICAgIGNyZWF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCksXG4gICAgICAgICAgdXBkYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgICAgICB9KTtcbiAgICAgICAgaGFzV3JpdGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChoYXNXcml0ZXMpIHtcbiAgICAgIGF3YWl0IGJhdGNoLmNvbW1pdCgpO1xuICAgIH1cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShCRUFVVFlfTUVSR0VfRlNfS0VZLCAndHJ1ZScpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuV1JJVEUsICdiZWF1dHktc2tpbmNhcmUtbWVyZ2UnKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VlZERlbW9EYXRhVG9GaXJlc3RvcmUoc2hvd05vdGlmaWNhdGlvbiA9IHRydWUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBiYXRjaCA9IHdyaXRlQmF0Y2goZGIpO1xuICAgIFNFRURfQ0FURUdPUklFUy5mb3JFYWNoKChjYXQpID0+IHtcbiAgICAgIGJhdGNoLnNldChkb2MoZGIsICdjYXRlZ29yaWVzJywgY2F0LmlkKSwgeyAuLi5jYXQsIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCkgfSk7XG4gICAgfSk7XG4gICAgYmF0Y2guZGVsZXRlKGRvYyhkYiwgJ2NhdGVnb3JpZXMnLCBMRUdBQ1lfU0tJTkNBUkVfQ0FURUdPUllfSUQpKTtcbiAgICBTRUVEX1BST0RVQ1RTLmZvckVhY2goKHByb2QpID0+IHtcbiAgICAgIGJhdGNoLnNldChkb2MoZGIsICdwcm9kdWN0cycsIHByb2QuaWQpLCB7XG4gICAgICAgIC4uLnByb2QsXG4gICAgICAgIGNyZWF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCksXG4gICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFNFRURfUE9TVFMuZm9yRWFjaCgocG9zdCkgPT4ge1xuICAgICAgYmF0Y2guc2V0KGRvYyhkYiwgJ3Bvc3RzJywgcG9zdC5pZCksIHtcbiAgICAgICAgLi4ucG9zdCxcbiAgICAgICAgY3JlYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgU0VFRF9SRVZJRVdTLmZvckVhY2goKHJldikgPT4ge1xuICAgICAgYmF0Y2guc2V0KGRvYyhkYiwgJ3Jldmlld3MnLCByZXYuaWQpLCB7XG4gICAgICAgIC4uLnJldixcbiAgICAgICAgY3JlYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgYmF0Y2guc2V0KGRvYyhkYiwgJ3NldHRpbmdzJywgJ2dlbmVyYWwnKSwgeyAuLi5TRUVEX0dFTkVSQUxfU0VUVElOR1MsIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCkgfSk7XG4gICAgYmF0Y2guc2V0KGRvYyhkYiwgJ3NldHRpbmdzJywgJ3RoZW1lJyksIHsgLi4uU0VFRF9USEVNRV9TRVRUSU5HUywgdXBkYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKSB9KTtcbiAgICBiYXRjaC5zZXQoZG9jKGRiLCAnc2V0dGluZ3MnLCAnYWRzJyksIHsgLi4uU0VFRF9BRFNfU0VUVElOR1MsIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCkgfSk7XG5cbiAgICBhd2FpdCBiYXRjaC5jb21taXQoKTtcbiAgICBzYXZlSnNvbihERUxFVEVEX1BST0RVQ1RTX0tFWSwgW10pO1xuICAgIHNhdmVKc29uKExPQ0FMX0NBVF9PVkVSUklERVNfS0VZLCB7IGVkaXRlZEJ5SWQ6IHt9LCByZW5hbWVkRnJvbToge30sIGRlbGV0ZWRJZHM6IFtdIH0pO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNFRURFRF9GTEFHX0tFWSwgJ3RydWUnKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShCRUFVVFlfTUVSR0VfS0VZLCAnMScpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEJFQVVUWV9NRVJHRV9GU19LRVksICd0cnVlJyk7XG4gICAgaWYgKHNob3dOb3RpZmljYXRpb24pIHNob3dUb2FzdChgQWxsICR7U0VFRF9QUk9EVUNUUy5sZW5ndGh9IGRlbW8gcHJvZHVjdHMsIGNhdGVnb3JpZXMsIHBvc3RzLCByZXZpZXdzICYgc2V0dGluZ3Mgc3luY2VkIHRvIEZpcmVzdG9yZS5gKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLldSSVRFLCAnc2VlZCcpO1xuICAgIGlmIChzaG93Tm90aWZpY2F0aW9uKSBzaG93VG9hc3QoJ0ZhaWxlZCB0byBzZWVkIEZpcmVzdG9yZS4gQ2hlY2sgYWRtaW4gcGVybWlzc2lvbnMuJywgdHJ1ZSk7XG4gIH1cbn1cblxuLy8gLS0tIEF1dGggQWN0aW9ucyAtLS1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dpbkFkbWluRW1haWwoZW1haWwsIHBhc3N3b3JkKSB7XG4gIGNvbnN0IGNyZWQgPSBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChhdXRoLCBlbWFpbCwgcGFzc3dvcmQpO1xuICByZXR1cm4gY3JlZC51c2VyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW5BZG1pbkdvb2dsZSgpIHtcbiAgY29uc3QgY3JlZCA9IGF3YWl0IHNpZ25JbldpdGhQb3B1cChhdXRoLCBnb29nbGVQcm92aWRlcik7XG4gIHJldHVybiBjcmVkLnVzZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kQWRtaW5WZXJpZmljYXRpb25FbWFpbCgpIHtcbiAgaWYgKCFhdXRoLmN1cnJlbnRVc2VyKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNpZ25lZC1pbiB1c2VyLicpO1xuICBhd2FpdCBzZW5kRW1haWxWZXJpZmljYXRpb24oYXV0aC5jdXJyZW50VXNlcik7XG4gIHNob3dUb2FzdChgVmVyaWZpY2F0aW9uIGVtYWlsIHNlbnQgdG8gJHthdXRoLmN1cnJlbnRVc2VyLmVtYWlsfS5gKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hBdXRoVmVyaWZpY2F0aW9uKCkge1xuICBpZiAoIWF1dGguY3VycmVudFVzZXIpIHJldHVybiBmYWxzZTtcbiAgYXdhaXQgcmVsb2FkKGF1dGguY3VycmVudFVzZXIpO1xuICBjb25zdCB1c2VyID0gYXV0aC5jdXJyZW50VXNlcjtcbiAgc3RhdGUuYXV0aFVzZXIgPSB1c2VyO1xuICBzdGF0ZS5hdXRoVmVyaWZpY2F0aW9uUmVxdWlyZWQgPSBCb29sZWFuKHVzZXIgJiYgIXVzZXIuZW1haWxWZXJpZmllZCk7XG4gIGxldCB2ZXJpZmllZEFkbWluID0gdXNlci5lbWFpbCA9PT0gJ21haGludXJpc2xhbW1hcnVmQGdtYWlsLmNvbScgJiYgdXNlci5lbWFpbFZlcmlmaWVkO1xuICBpZiAoIXZlcmlmaWVkQWRtaW4gJiYgdXNlci5lbWFpbFZlcmlmaWVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFkbWluRG9jID0gYXdhaXQgZ2V0RG9jKGRvYyhkYiwgJ2FkbWlucycsIHVzZXIudWlkKSk7XG4gICAgICBpZiAoYWRtaW5Eb2MuZXhpc3RzKCkpIHZlcmlmaWVkQWRtaW4gPSB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdmVyaWZpZWRBZG1pbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBzdGF0ZS5pc0FkbWluID0gdmVyaWZpZWRBZG1pbjtcbiAgaWYgKHZlcmlmaWVkQWRtaW4pIHtcbiAgICBhdHRhY2hBZG1pbkxpc3RlbmVycygpO1xuICAgIGF1dG9TZWVkSWZFbXB0eSgpLnRoZW4oKCkgPT4gc3luY0JlYXV0eVNraW5jYXJlTWVyZ2VUb0ZpcmVzdG9yZUlmTmVlZGVkKCkpO1xuICAgIHNob3dUb2FzdCgnQWRtaW4gRmlyZWJhc2UgYWNjb3VudCB2ZXJpZmllZCEnKTtcbiAgfSBlbHNlIGlmICghdXNlci5lbWFpbFZlcmlmaWVkKSB7XG4gICAgc2hvd1RvYXN0KCdFbWFpbCBpcyBzdGlsbCB1bnZlcmlmaWVkLiBDaGVjayB5b3VyIGluYm94IG9yIEZpcmViYXNlIENvbnNvbGUuJywgdHJ1ZSk7XG4gIH1cbiAgbm90aWZ5U3RhdGUoKTtcbiAgcmV0dXJuIHZlcmlmaWVkQWRtaW47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dvdXRBZG1pbigpIHtcbiAgYXdhaXQgc2lnbk91dChhdXRoKTtcbiAgc3RhdGUuaXNBZG1pbiA9IGZhbHNlO1xuICBzdGF0ZS5hdXRoVmVyaWZpY2F0aW9uUmVxdWlyZWQgPSBmYWxzZTtcbiAgbm90aWZ5U3RhdGUoKTtcbn1cblxuLy8gLS0tIFB1YmxpYyBDdXN0b21lciBBY3Rpb25zIC0tLVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBsYWNlT3JkZXIoe1xuICBjdXN0b21lck5hbWUsXG4gIHBob25lLFxuICBkaXZpc2lvbixcbiAgZGlzdHJpY3QsXG4gIHVwYXppbGEgPSAnJyxcbiAgYWRkcmVzcyxcbiAgbWFwTGF0ID0gbnVsbCxcbiAgbWFwTG5nID0gbnVsbCxcbiAgcGF5bWVudE1ldGhvZCxcbiAgcGF5bWVudE51bWJlcixcbiAgbm90ZXNcbn0pIHtcbiAgaWYgKCFzdGF0ZS5jYXJ0Lmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdZb3VyIGNhcnQgaXMgZW1wdHkuJyk7XG4gIGNvbnN0IGNsZWFuTmFtZSA9IFN0cmluZyhjdXN0b21lck5hbWUgfHwgJycpLnRyaW0oKTtcbiAgY29uc3QgY2xlYW5QaG9uZSA9IFN0cmluZyhwaG9uZSB8fCAnJykudHJpbSgpO1xuICBjb25zdCBjbGVhbkRpdmlzaW9uID0gU3RyaW5nKGRpdmlzaW9uIHx8ICcnKS50cmltKCk7XG4gIGNvbnN0IGNsZWFuRGlzdHJpY3QgPSBTdHJpbmcoZGlzdHJpY3QgfHwgJycpLnRyaW0oKTtcbiAgY29uc3QgY2xlYW5VcGF6aWxhID0gU3RyaW5nKHVwYXppbGEgfHwgJycpLnRyaW0oKTtcbiAgY29uc3QgY2xlYW5BZGRyZXNzID0gU3RyaW5nKGFkZHJlc3MgfHwgJycpLnRyaW0oKTtcblxuICBpZiAoY2xlYW5OYW1lLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVudGVyIHlvdXIgZnVsbCBuYW1lLicpO1xuICBpZiAoY2xlYW5QaG9uZS5yZXBsYWNlKC9cXEQvZywgJycpLmxlbmd0aCA8IDYpIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVudGVyIGEgdmFsaWQgbW9iaWxlIG51bWJlci4nKTtcbiAgaWYgKCFjbGVhbkRpdmlzaW9uIHx8ICFjbGVhbkRpc3RyaWN0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2Ugc2VsZWN0IHlvdXIgRGl2aXNpb24gYW5kIERpc3RyaWN0LicpO1xuICB9XG4gIGlmIChjbGVhbkFkZHJlc3MubGVuZ3RoIDwgNCkgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgZW50ZXIgeW91ciBmdWxsIGRldGFpbGVkIGRlbGl2ZXJ5IGFkZHJlc3MuJyk7XG5cbiAgY29uc3Qgem9uZSA9IGNsZWFuRGlzdHJpY3QgPT09ICdEaGFrYScgPyAnaW5zaWRlJyA6ICdvdXRzaWRlJztcbiAgY29uc3QgdG90YWxzID0gZ2V0Q2FydFRvdGFscyh6b25lKTtcblxuICBjb25zdCByYW5kID0gTWF0aC5mbG9vcigxMDAwICsgTWF0aC5yYW5kb20oKSAqIDkwMDApO1xuICBjb25zdCBvcmRlckNvZGUgPSBgUEItMjAyNi0ke3JhbmR9YDtcbiAgY29uc3Qgb3JkZXJJZCA9IG9yZGVyQ29kZTtcbiAgY29uc3QgcGhvbmVIYXNoID0gYXdhaXQgc2hhMjU2SGV4KGNsZWFuUGhvbmUpO1xuXG4gIGNvbnN0IG9yZGVySXRlbXMgPSBzdGF0ZS5jYXJ0Lm1hcCgoaXRlbSkgPT4gKHtcbiAgICBwcm9kdWN0SWQ6IGl0ZW0ucHJvZHVjdElkLFxuICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICBwcmljZTogTnVtYmVyKGl0ZW0ucHJpY2UpLFxuICAgIHF0eTogTnVtYmVyKGl0ZW0ucXR5KSxcbiAgICBvcHRpb246IGl0ZW0ub3B0aW9uIHx8ICcnXG4gIH0pKTtcblxuICBjb25zdCBvcmRlclBheWxvYWQgPSB7XG4gICAgaWQ6IG9yZGVySWQsXG4gICAgb3JkZXJDb2RlLFxuICAgIGN1c3RvbWVyTmFtZTogY2xlYW5OYW1lLnNsaWNlKDAsIDEyMCksXG4gICAgcGhvbmU6IGNsZWFuUGhvbmUuc2xpY2UoMCwgMzApLFxuICAgIHBob25lSGFzaCxcbiAgICBkaXZpc2lvbjogY2xlYW5EaXZpc2lvbi5zbGljZSgwLCA4MCksXG4gICAgZGlzdHJpY3Q6IGNsZWFuRGlzdHJpY3Quc2xpY2UoMCwgODApLFxuICAgIHVwYXppbGE6IGNsZWFuVXBhemlsYS5zbGljZSgwLCA4MCksXG4gICAgYWRkcmVzczogY2xlYW5BZGRyZXNzLnNsaWNlKDAsIDUwMCksXG4gICAgcGF5bWVudE1ldGhvZCxcbiAgICBwYXltZW50TnVtYmVyOiAocGF5bWVudE51bWJlciB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDQwKSxcbiAgICBpdGVtczogb3JkZXJJdGVtcyxcbiAgICBzdWJ0b3RhbDogdG90YWxzLnN1YnRvdGFsLFxuICAgIGRlbGl2ZXJ5Q2hhcmdlOiB0b3RhbHMuZGVsaXZlcnksXG4gICAgdG90YWw6IHRvdGFscy50b3RhbCxcbiAgICBzdGF0dXM6ICdQZW5kaW5nJyxcbiAgICBub3RlczogKG5vdGVzIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgNTAwKSxcbiAgICBjcmVhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpLFxuICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgfTtcblxuICBpZiAodHlwZW9mIG1hcExhdCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKG1hcExhdCkgJiYgdHlwZW9mIG1hcExuZyA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKG1hcExuZykpIHtcbiAgICBvcmRlclBheWxvYWQubWFwTGF0ID0gTnVtYmVyKG1hcExhdC50b0ZpeGVkKDYpKTtcbiAgICBvcmRlclBheWxvYWQubWFwTG5nID0gTnVtYmVyKG1hcExuZy50b0ZpeGVkKDYpKTtcbiAgfVxuXG4gIGNvbnN0IGJhdGNoID0gd3JpdGVCYXRjaChkYik7XG4gIGJhdGNoLnNldChkb2MoZGIsICdvcmRlcnMnLCBvcmRlcklkKSwgb3JkZXJQYXlsb2FkKTtcblxuICBiYXRjaC5zZXQoZG9jKGRiLCAnb3JkZXJUcmFja2luZycsIG9yZGVySWQpLCB7XG4gICAgaWQ6IG9yZGVySWQsXG4gICAgb3JkZXJDb2RlLFxuICAgIGRpdmlzaW9uOiBjbGVhbkRpdmlzaW9uLnNsaWNlKDAsIDgwKSxcbiAgICBkaXN0cmljdDogY2xlYW5EaXN0cmljdC5zbGljZSgwLCA4MCksXG4gICAgdXBhemlsYTogY2xlYW5VcGF6aWxhLnNsaWNlKDAsIDgwKSxcbiAgICBpdGVtQ291bnQ6IHRvdGFscy5pdGVtQ291bnQsXG4gICAgdG90YWw6IHRvdGFscy50b3RhbCxcbiAgICBwYXltZW50TWV0aG9kLFxuICAgIHN0YXR1czogJ1BlbmRpbmcnLFxuICAgIHBob25lSGFzaCxcbiAgICBjcmVhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpLFxuICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgfSk7XG5cbiAgLy8gVXBkYXRlIHBob25lTG9va3VwIGZvciB0cmFja2luZyBieSBwaG9uZVxuICB0cnkge1xuICAgIGNvbnN0IGxvb2t1cFJlZiA9IGRvYyhkYiwgJ3Bob25lTG9va3VwcycsIHBob25lSGFzaCk7XG4gICAgY29uc3QgZXhpc3RpbmdMb29rdXAgPSBhd2FpdCBnZXREb2MobG9va3VwUmVmKTtcbiAgICBjb25zdCBleGlzdGluZ0NvZGVzID0gZXhpc3RpbmdMb29rdXAuZXhpc3RzKCkgJiYgQXJyYXkuaXNBcnJheShleGlzdGluZ0xvb2t1cC5kYXRhKCkub3JkZXJDb2RlcylcbiAgICAgID8gZXhpc3RpbmdMb29rdXAuZGF0YSgpLm9yZGVyQ29kZXNcbiAgICAgIDogW107XG4gICAgY29uc3QgbmV4dENvZGVzID0gW29yZGVyQ29kZSwgLi4uZXhpc3RpbmdDb2Rlcy5maWx0ZXIoKGMpID0+IGMgIT09IG9yZGVyQ29kZSldLnNsaWNlKDAsIDIwKTtcbiAgICBiYXRjaC5zZXQobG9va3VwUmVmLCB7XG4gICAgICBvcmRlckNvZGVzOiBuZXh0Q29kZXMsXG4gICAgICB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpXG4gICAgfSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIE5vbi1ibG9ja2luZ1xuICB9XG5cbiAgLy8gVXBkYXRlIHN0b2NrL3VuaXRzU29sZCBpbiBGaXJlc3RvcmUgb25seSB3aGVuIHNpZ25lZCBpbiBhcyB2ZXJpZmllZCBBZG1pbiAocHVibGljIHdyaXRlcyBvbiAvcHJvZHVjdHMgYXJlIGJsb2NrZWQgYnkgc2VjdXJpdHkgcnVsZXMpXG4gIGZvciAoY29uc3QgaXRlbSBvZiBvcmRlckl0ZW1zKSB7XG4gICAgY29uc3QgcHJvZCA9IHN0YXRlLnByb2R1Y3RzLmZpbmQoKHApID0+IHAuaWQgPT09IGl0ZW0ucHJvZHVjdElkKTtcbiAgICBpZiAoIXByb2QpIGNvbnRpbnVlO1xuICAgIGNvbnN0IG5leHRTdG9jayA9IE1hdGgubWF4KDAsIChwcm9kLnN0b2NrIHx8IDApIC0gaXRlbS5xdHkpO1xuICAgIGNvbnN0IG5leHRTb2xkID0gKHByb2QudW5pdHNTb2xkIHx8IDApICsgaXRlbS5xdHk7XG4gICAgaWYgKHN0YXRlLmlzQWRtaW4gJiYgc3RhdGUuZmlyZXN0b3JlUHJvZHVjdElkcy5oYXMoaXRlbS5wcm9kdWN0SWQpICYmIHByb2Quc3RvY2sgPj0gaXRlbS5xdHkpIHtcbiAgICAgIGNvbnN0IHByb2RSZWYgPSBkb2MoZGIsICdwcm9kdWN0cycsIGl0ZW0ucHJvZHVjdElkKTtcbiAgICAgIGJhdGNoLnVwZGF0ZShwcm9kUmVmLCB7XG4gICAgICAgIHN0b2NrOiBuZXh0U3RvY2ssXG4gICAgICAgIHVuaXRzU29sZDogbmV4dFNvbGQsXG4gICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9kLnN0b2NrID0gbmV4dFN0b2NrO1xuICAgICAgcHJvZC51bml0c1NvbGQgPSBuZXh0U29sZDtcbiAgICB9XG4gIH1cblxuICBsZXQgZmlyZXN0b3JlU2F2ZWQgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBiYXRjaC5jb21taXQoKTtcbiAgICBmaXJlc3RvcmVTYXZlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5XUklURSwgYG9yZGVycy8ke29yZGVySWR9YCk7XG4gICAgLy8gS2VlcCBjaGVja291dCByZXNpbGllbnQgb2ZmbGluZSB3aGlsZSBzdXJmYWNpbmcgd2FybmluZyBvbmx5IGlmIG5vbi1uZXR3b3JrXG4gICAgaWYgKCFuYXZpZ2F0b3Iub25MaW5lKSB7XG4gICAgICBmaXJlc3RvcmVTYXZlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgbm93SXNvID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICBjb25zdCBsb2NhbEZ1bGxPcmRlciA9IHtcbiAgICAuLi5vcmRlclBheWxvYWQsXG4gICAgY3JlYXRlZEF0OiBub3dJc28sXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gICAgc3luY2VkVG9GaXJlc3RvcmU6IGZpcmVzdG9yZVNhdmVkXG4gIH07XG4gIGNvbnN0IGV4aXN0aW5nQWRtaW5PcmRlcnMgPSBsb2FkSnNvbihBRE1JTl9PUkRFUlNfQ0FDSEVfS0VZLCBbXSk7XG4gIGNvbnN0IG5leHRBZG1pbk9yZGVycyA9IFtsb2NhbEZ1bGxPcmRlciwgLi4uZXhpc3RpbmdBZG1pbk9yZGVycy5maWx0ZXIoKG8pID0+IG8uaWQgIT09IG9yZGVySWQpXS5zbGljZSgwLCAxMDApO1xuICBzYXZlSnNvbihBRE1JTl9PUkRFUlNfQ0FDSEVfS0VZLCBuZXh0QWRtaW5PcmRlcnMpO1xuICBzdGF0ZS5vcmRlcnMgPSBtZXJnZU9yZGVyc1dpdGhMb2NhbENhY2hlKHN0YXRlLm9yZGVycyk7XG4gIHN0YXRlLnVuc2Vlbk9yZGVySWRzLmFkZChvcmRlcklkKTtcbiAgc3RhdGUubmV3T3JkZXJzQ291bnQgPSBzdGF0ZS51bnNlZW5PcmRlcklkcy5zaXplO1xuICBzYXZlSnNvbihVTlNFRU5fT1JERVJTX0tFWSwgQXJyYXkuZnJvbShzdGF0ZS51bnNlZW5PcmRlcklkcykpO1xuICBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCk7XG5cbiAgLy8gU2F2ZSBub24tc2Vuc2l0aXZlIGxvY2FsIHRyYWNraW5nIHJlY2VpcHQgKGluY2x1ZGluZyBvcmRlcmVkIGl0ZW1zIGZvciBBY2NvdW50IE9yZGVyIEhpc3RvcnkpXG4gIGNvbnN0IHJlY2VpcHQgPSB7XG4gICAgb3JkZXJDb2RlLFxuICAgIGN1c3RvbWVyTmFtZTogY2xlYW5OYW1lLnNsaWNlKDAsIDEyMCksXG4gICAgZGl2aXNpb246IGNsZWFuRGl2aXNpb24sXG4gICAgZGlzdHJpY3Q6IGNsZWFuRGlzdHJpY3QsXG4gICAgdXBhemlsYTogY2xlYW5VcGF6aWxhLFxuICAgIGl0ZW1zOiBvcmRlckl0ZW1zLm1hcCgoaSkgPT4gKHtcbiAgICAgIHByb2R1Y3RJZDogaS5wcm9kdWN0SWQsXG4gICAgICBuYW1lOiBpLm5hbWUsXG4gICAgICBwcmljZTogaS5wcmljZSxcbiAgICAgIHF0eTogaS5xdHksXG4gICAgICBvcHRpb246IGkub3B0aW9uIHx8ICcnLFxuICAgICAgaW1hZ2U6IGkuaW1hZ2UgfHwgJydcbiAgICB9KSksXG4gICAgaXRlbUNvdW50OiB0b3RhbHMuaXRlbUNvdW50LFxuICAgIHN1YnRvdGFsOiB0b3RhbHMuc3VidG90YWwsXG4gICAgZGVsaXZlcnlDaGFyZ2U6IHRvdGFscy5kZWxpdmVyeSxcbiAgICB0b3RhbDogdG90YWxzLnRvdGFsLFxuICAgIHBheW1lbnRNZXRob2QsXG4gICAgc3RhdHVzOiAnUGVuZGluZycsXG4gICAgcGhvbmVIYXNoLFxuICAgIGNyZWF0ZWRBdDogbm93SXNvXG4gIH07XG4gIGNvbnN0IGxvY2FsT3JkZXJzID0gbG9hZEpzb24oTE9DQUxfT1JERVJTX0tFWSwgW10pO1xuICBzYXZlSnNvbihMT0NBTF9PUkRFUlNfS0VZLCBbcmVjZWlwdCwgLi4ubG9jYWxPcmRlcnNdLnNsaWNlKDAsIDMwKSk7XG5cbiAgY2xlYXJDYXJ0KCk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHJldHVybiByZWNlaXB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxPcmRlcnMoKSB7XG4gIGNvbnN0IHJlY2VpcHRzID0gbG9hZEpzb24oTE9DQUxfT1JERVJTX0tFWSwgW10pO1xuICBpZiAoIUFycmF5LmlzQXJyYXkocmVjZWlwdHMpKSByZXR1cm4gW107XG4gIGNvbnN0IGFkbWluQnlDb2RlID0gbmV3IE1hcCgoc3RhdGUub3JkZXJzIHx8IFtdKS5tYXAoKG8pID0+IFtTdHJpbmcoby5vcmRlckNvZGUgfHwgby5pZCksIG9dKSk7XG4gIHJldHVybiByZWNlaXB0cy5tYXAoKHIpID0+IHtcbiAgICBjb25zdCBsaXZlID0gYWRtaW5CeUNvZGUuZ2V0KFN0cmluZyhyLm9yZGVyQ29kZSB8fCAnJykpO1xuICAgIGlmICghbGl2ZSkgcmV0dXJuIHI7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnIsXG4gICAgICBzdGF0dXM6IGxpdmUuc3RhdHVzIHx8IHIuc3RhdHVzLFxuICAgICAgaXRlbXM6IEFycmF5LmlzQXJyYXkoci5pdGVtcykgJiYgci5pdGVtcy5sZW5ndGggPyByLml0ZW1zIDogKGxpdmUuaXRlbXMgfHwgci5pdGVtcyB8fCBbXSlcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hMb2NhbE9yZGVyc1N0YXR1cygpIHtcbiAgY29uc3QgcmVjZWlwdHMgPSBsb2FkSnNvbihMT0NBTF9PUkRFUlNfS0VZLCBbXSk7XG4gIGlmICghQXJyYXkuaXNBcnJheShyZWNlaXB0cykgfHwgIXJlY2VpcHRzLmxlbmd0aCkgcmV0dXJuIFtdO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBjb25zdCB1cGRhdGVkID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgcmVjZWlwdHMubWFwKGFzeW5jIChyKSA9PiB7XG4gICAgICBpZiAoIXI/Lm9yZGVyQ29kZSkgcmV0dXJuIHI7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzbmFwID0gYXdhaXQgZ2V0RG9jKGRvYyhkYiwgJ29yZGVyVHJhY2tpbmcnLCBTdHJpbmcoci5vcmRlckNvZGUpKSk7XG4gICAgICAgIGlmIChzbmFwLmV4aXN0cygpKSB7XG4gICAgICAgICAgY29uc3Qgc2VydmVyU3RhdHVzID0gc25hcC5kYXRhKCkuc3RhdHVzO1xuICAgICAgICAgIGlmIChzZXJ2ZXJTdGF0dXMgJiYgc2VydmVyU3RhdHVzICE9PSByLnN0YXR1cykge1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5yLCBzdGF0dXM6IHNlcnZlclN0YXR1cyB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIE5vbi1ibG9ja2luZyBmYWxsYmFjayB0byBjYWNoZWQgcmVjZWlwdFxuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSlcbiAgKTtcbiAgaWYgKGNoYW5nZWQpIHtcbiAgICBzYXZlSnNvbihMT0NBTF9PUkRFUlNfS0VZLCB1cGRhdGVkKTtcbiAgICBub3RpZnlTdGF0ZSgpO1xuICB9XG4gIHJldHVybiB1cGRhdGVkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhY2tPcmRlcnMocXVlcnlJbnB1dCkge1xuICBjb25zdCBjbGVhbiA9IFN0cmluZyhxdWVyeUlucHV0IHx8ICcnKS50cmltKCk7XG4gIGlmICghY2xlYW4pIHJldHVybiBbXTtcblxuICBjb25zdCByZXN1bHRzID0gW107XG4gIGNvbnN0IG5vcm1hbGl6ZWRDb2RlID0gY2xlYW4udG9VcHBlckNhc2UoKTtcblxuICAvLyAxLiBUcnkgZGlyZWN0IE9yZGVyIElEIGxvb2t1cFxuICBpZiAoL15bYS16QS1aMC05Xy1dezMsNDB9JC8udGVzdChub3JtYWxpemVkQ29kZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc25hcCA9IGF3YWl0IGdldERvYyhkb2MoZGIsICdvcmRlclRyYWNraW5nJywgbm9ybWFsaXplZENvZGUpKTtcbiAgICAgIGlmIChzbmFwLmV4aXN0cygpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7IC4uLnNuYXAuZGF0YSgpLCBpZDogc25hcC5pZCB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5HRVQsIGBvcmRlclRyYWNraW5nLyR7bm9ybWFsaXplZENvZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgLy8gMi4gVHJ5IHBob25lIGhhc2ggbG9va3VwIGlmIGRpZ2l0cyA+PSA2XG4gIGNvbnN0IGRpZ2l0cyA9IGNsZWFuLnJlcGxhY2UoL1xcRC9nLCAnJyk7XG4gIGlmICghcmVzdWx0cy5sZW5ndGggJiYgZGlnaXRzLmxlbmd0aCA+PSA2KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBIYXNoID0gYXdhaXQgc2hhMjU2SGV4KGRpZ2l0cyk7XG4gICAgICBjb25zdCBsb29rdXBTbmFwID0gYXdhaXQgZ2V0RG9jKGRvYyhkYiwgJ3Bob25lTG9va3VwcycsIHBIYXNoKSk7XG4gICAgICBpZiAobG9va3VwU25hcC5leGlzdHMoKSkge1xuICAgICAgICBjb25zdCBjb2RlcyA9IGxvb2t1cFNuYXAuZGF0YSgpLm9yZGVyQ29kZXMgfHwgW107XG4gICAgICAgIGZvciAoY29uc3QgY29kZSBvZiBjb2Rlcy5zbGljZSgwLCA1KSkge1xuICAgICAgICAgIGNvbnN0IHRyYWNrU25hcCA9IGF3YWl0IGdldERvYyhkb2MoZGIsICdvcmRlclRyYWNraW5nJywgY29kZSkpO1xuICAgICAgICAgIGlmICh0cmFja1NuYXAuZXhpc3RzKCkpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IC4uLnRyYWNrU25hcC5kYXRhKCksIGlkOiB0cmFja1NuYXAuaWQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuR0VULCAncGhvbmVMb29rdXBzJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gMy4gRmFsbGJhY2sgdG8gbG9jYWwgYnJvd3NlciByZWNlaXB0cyBpZiBvZmZsaW5lIG9yIG5ld2x5IHBsYWNlZFxuICBpZiAoIXJlc3VsdHMubGVuZ3RoKSB7XG4gICAgY29uc3QgbG9jYWwgPSBsb2FkSnNvbihMT0NBTF9PUkRFUlNfS0VZLCBbXSk7XG4gICAgY29uc3QgcEhhc2ggPSBkaWdpdHMubGVuZ3RoID49IDYgPyBhd2FpdCBzaGEyNTZIZXgoZGlnaXRzKSA6ICcnO1xuICAgIGxvY2FsLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtLm9yZGVyQ29kZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkQ29kZSB8fCAocEhhc2ggJiYgaXRlbS5waG9uZUhhc2ggPT09IHBIYXNoKSkge1xuICAgICAgICByZXN1bHRzLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Ym1pdEN1c3RvbWVyUmV2aWV3KHsgcHJvZHVjdElkLCBwcm9kdWN0TmFtZSwgYXV0aG9yTmFtZSwgY2l0eSwgcmF0aW5nLCBjb21tZW50IH0pIHtcbiAgY29uc3QgaWQgPSBgcmV2LSR7RGF0ZS5ub3coKX0tJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwKX1gO1xuICBjb25zdCBwYXlsb2FkID0ge1xuICAgIGlkLFxuICAgIHByb2R1Y3RJZDogcHJvZHVjdElkIHx8ICcnLFxuICAgIHByb2R1Y3ROYW1lOiBwcm9kdWN0TmFtZSB8fCAnJyxcbiAgICBhdXRob3JOYW1lOiBhdXRob3JOYW1lLnRyaW0oKS5zbGljZSgwLCAxMDApLFxuICAgIGNpdHk6IChjaXR5IHx8ICdCYW5nbGFkZXNoJykudHJpbSgpLnNsaWNlKDAsIDgwKSxcbiAgICByYXRpbmc6IE1hdGgubWF4KDEsIE1hdGgubWluKDUsIHBhcnNlSW50KHJhdGluZywgMTApIHx8IDUpKSxcbiAgICBhcHByb3ZlZDogdHJ1ZSxcbiAgICBjb21tZW50OiBjb21tZW50LnRyaW0oKS5zbGljZSgwLCAxNTAwKSxcbiAgICBjcmVhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpXG4gIH07XG4gIHRyeSB7XG4gICAgYXdhaXQgc2V0RG9jKGRvYyhkYiwgJ3Jldmlld3MnLCBpZCksIHBheWxvYWQpO1xuICAgIHN0YXRlLnJldmlld3MgPSBbeyAuLi5wYXlsb2FkLCBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9LCAuLi5zdGF0ZS5yZXZpZXdzLmZpbHRlcigocikgPT4gci5pZCAhPT0gaWQpXTtcbiAgICBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCk7XG4gICAgbm90aWZ5U3RhdGUoKTtcbiAgICBzaG93VG9hc3QoJ1RoYW5rIHlvdSEgWW91ciByZXZpZXcgaGFzIGJlZW4gcHVibGlzaGVkLicpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuQ1JFQVRFLCBgcmV2aWV3cy8ke2lkfWApO1xuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0QmxvZ0lzc3VlKHBvc3RJZCwgbm90ZSA9ICdSZWFkZXIgcmVwb3J0ZWQgYW4gaXNzdWUgb3Igb3V0ZGF0ZWQgaW5mby4nKSB7XG4gIGNvbnN0IGNsZWFuTm90ZSA9IFN0cmluZyhub3RlIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgNDAwKSB8fCAnUmVhZGVyIHJlcG9ydGVkIGFuIGlzc3VlLic7XG4gIGNvbnN0IHJlcG9ydHMgPSBsb2FkSnNvbihCTE9HX1JFUE9SVFNfS0VZLCB7fSk7XG4gIHJlcG9ydHNbcG9zdElkXSA9IHsgaXNzdWVGbGFnOiB0cnVlLCBpc3N1ZU5vdGU6IGNsZWFuTm90ZSwgcmVwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH07XG4gIHNhdmVKc29uKEJMT0dfUkVQT1JUU19LRVksIHJlcG9ydHMpO1xuICBzdGF0ZS5ibG9nUmVwb3J0cyA9IHJlcG9ydHM7XG4gIHN0YXRlLnBvc3RzID0gbWVyZ2VQb3N0c1dpdGhSZXBvcnRzKHN0YXRlLnBvc3RzKTtcbiAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICBub3RpZnlTdGF0ZSgpO1xuICBzaG93VG9hc3QoJ0lzc3VlIGZsYWdnZWQgZm9yIHJldmlldyBieSBvdXIgZWRpdG9yaWFsIHRlYW0uJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWJzY3JpYmVOZXdzbGV0dGVyKGVtYWlsKSB7XG4gIGNvbnN0IGNsZWFuID0gU3RyaW5nKGVtYWlsIHx8ICcnKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgaWYgKCEvXlteQFxcc10rQFteQFxcc10rXFwuW15AXFxzXSskLy50ZXN0KGNsZWFuKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy4nKTtcbiAgfVxuICBjb25zdCBpZCA9IGBzdWItJHtzYW5pdGl6ZUlkKGNsZWFuKX1gO1xuICB0cnkge1xuICAgIGF3YWl0IHNldERvYyhkb2MoZGIsICdzdWJzY3JpYmVycycsIGlkKSwge1xuICAgICAgZW1haWw6IGNsZWFuLFxuICAgICAgY3JlYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgIH0pO1xuICAgIHNob3dUb2FzdCgnU3Vic2NyaWJlZCEgV2VsY29tZSB0byBQYXphcm8gQkQgdXBkYXRlcy4nKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLkNSRUFURSwgYHN1YnNjcmliZXJzLyR7aWR9YCk7XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbi8vIC0tLSBBZG1pbiBDUlVEIEFjdGlvbnMgLS0tXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBsb2FkQXNzZXRUb1N0b3JhZ2UoZmlsZSwgZm9sZGVyID0gJ3VwbG9hZHMnKSB7XG4gIGlmICghZmlsZSkgdGhyb3cgbmV3IEVycm9yKCdObyBmaWxlIHNlbGVjdGVkLicpO1xuICBjb25zdCBzYWZlTmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOS5fLV0vZywgJ18nKTtcbiAgY29uc3Qgc3RvcmFnZVJlZiA9IHJlZihzdG9yYWdlLCBgcGF6YXJvYmQvJHtmb2xkZXJ9LyR7RGF0ZS5ub3coKX0tJHtzYWZlTmFtZX1gKTtcbiAgY29uc3Qgc25hcCA9IGF3YWl0IHVwbG9hZEJ5dGVzKHN0b3JhZ2VSZWYsIGZpbGUpO1xuICByZXR1cm4gZ2V0RG93bmxvYWRVUkwoc25hcC5yZWYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2R1Y3QocHJvZHVjdERhdGEsIGlzTmV3ID0gZmFsc2UpIHtcbiAgY29uc3QgaWQgPSBpc05ldyA/IHNhbml0aXplSWQoYHByb2QtJHtzbHVnaWZ5KHByb2R1Y3REYXRhLm5hbWUpfS0ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpLnNsaWNlKC00KX1gKSA6IHByb2R1Y3REYXRhLmlkO1xuICBjb25zdCBiYXNlUGF5bG9hZCA9IHtcbiAgICBpZCxcbiAgICBuYW1lOiBTdHJpbmcocHJvZHVjdERhdGEubmFtZSB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDIwMCksXG4gICAgc2x1Zzogc2x1Z2lmeShwcm9kdWN0RGF0YS5uYW1lKSxcbiAgICBicmFuZDogU3RyaW5nKHByb2R1Y3REYXRhLmJyYW5kIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgMTAwKSxcbiAgICBjYXRlZ29yeTogU3RyaW5nKHByb2R1Y3REYXRhLmNhdGVnb3J5IHx8ICdQaG9uZXMnKS50cmltKCkuc2xpY2UoMCwgMTAwKSxcbiAgICBwcmljZTogTWF0aC5tYXgoMCwgTnVtYmVyKHByb2R1Y3REYXRhLnByaWNlKSB8fCAwKSxcbiAgICBvbGRQcmljZTogTWF0aC5tYXgoMCwgTnVtYmVyKHByb2R1Y3REYXRhLm9sZFByaWNlKSB8fCAwKSxcbiAgICBzdG9jazogTWF0aC5tYXgoMCwgcGFyc2VJbnQocHJvZHVjdERhdGEuc3RvY2ssIDEwKSB8fCAwKSxcbiAgICB1bml0c1NvbGQ6IE1hdGgubWF4KDAsIHBhcnNlSW50KHByb2R1Y3REYXRhLnVuaXRzU29sZCwgMTApIHx8IDApLFxuICAgIHNrdTogU3RyaW5nKHByb2R1Y3REYXRhLnNrdSB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDgwKSxcbiAgICByYXRpbmc6IE1hdGgubWF4KDAsIE1hdGgubWluKDUsIE51bWJlcihwcm9kdWN0RGF0YS5yYXRpbmcpIHx8IDQuNykpLFxuICAgIHJldmlld0NvdW50OiBNYXRoLm1heCgwLCBwYXJzZUludChwcm9kdWN0RGF0YS5yZXZpZXdDb3VudCwgMTApIHx8IDApLFxuICAgIHNob3J0RGVzY3JpcHRpb246IFN0cmluZyhwcm9kdWN0RGF0YS5zaG9ydERlc2NyaXB0aW9uIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgNTAwKSxcbiAgICBmdWxsRGVzY3JpcHRpb246IFN0cmluZyhwcm9kdWN0RGF0YS5mdWxsRGVzY3JpcHRpb24gfHwgJycpLnRyaW0oKS5zbGljZSgwLCA4MDAwKSxcbiAgICBmZWF0dXJlczogKHByb2R1Y3REYXRhLmZlYXR1cmVzIHx8IFtdKS5zbGljZSgwLCAyMCksXG4gICAgc3BlY3M6IChwcm9kdWN0RGF0YS5zcGVjcyB8fCBbXSkuc2xpY2UoMCwgMzApLFxuICAgIG9wdGlvbnM6IChwcm9kdWN0RGF0YS5vcHRpb25zIHx8IFtdKS5zbGljZSgwLCAyMCksXG4gICAgdGFnczogKHByb2R1Y3REYXRhLnRhZ3MgfHwgW10pLnNsaWNlKDAsIDIwKSxcbiAgICBpbWFnZXM6IChwcm9kdWN0RGF0YS5pbWFnZXMgfHwgW10pLmZpbHRlcihCb29sZWFuKS5zbGljZSgwLCA1KSxcbiAgICB2aWRlb1VybDogU3RyaW5nKHByb2R1Y3REYXRhLnZpZGVvVXJsIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgMTAwMCksXG4gICAgdmlkZW9Qb3N0ZXI6IFN0cmluZyhwcm9kdWN0RGF0YS52aWRlb1Bvc3RlciB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDEwMDApLFxuICAgIGRlbGl2ZXJ5SW5mbzogU3RyaW5nKHByb2R1Y3REYXRhLmRlbGl2ZXJ5SW5mbyB8fCAnSW5zaWRlIERoYWthIOCnszYwICgyNC00OGgpLiBPdXRzaWRlIERoYWthIOCnszEyMCAoMi00IGRheXMpLicpLnNsaWNlKDAsIDUwMCksXG4gICAgcmV0dXJuUG9saWN5OiBTdHJpbmcocHJvZHVjdERhdGEucmV0dXJuUG9saWN5IHx8ICc3LWRheSBlYXN5IHJlcGxhY2VtZW50IG9uIHVub3BlbmVkIG9yIGRlZmVjdGl2ZSBpdGVtcy4nKS5zbGljZSgwLCA1MDApLFxuICAgIGlzRmVhdHVyZWQ6IEJvb2xlYW4ocHJvZHVjdERhdGEuaXNGZWF0dXJlZCksXG4gICAgaXNGbGFzaFNhbGU6IEJvb2xlYW4ocHJvZHVjdERhdGEuaXNGbGFzaFNhbGUpLFxuICAgIGlzVHJlbmRpbmc6IEJvb2xlYW4ocHJvZHVjdERhdGEuaXNUcmVuZGluZyksXG4gICAgaXNOZXdBcnJpdmFsOiBCb29sZWFuKHByb2R1Y3REYXRhLmlzTmV3QXJyaXZhbClcbiAgfTtcblxuICB1bm1hcmtQcm9kdWN0RGVsZXRlZExvY2FsbHkoaWQpO1xuXG4gIGlmIChzdGF0ZS5pc0FkbWluKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHsgLi4uYmFzZVBheWxvYWQsIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKCkgfTtcbiAgICBpZiAoaXNOZXcpIHBheWxvYWQuY3JlYXRlZEF0ID0gc2VydmVyVGltZXN0YW1wKCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldERvYyhkb2MoZGIsICdwcm9kdWN0cycsIGlkKSwgcGF5bG9hZCwgeyBtZXJnZTogdHJ1ZSB9KTtcbiAgICAgIHNob3dUb2FzdChpc05ldyA/ICdQcm9kdWN0IGFkZGVkICYgc3luY2VkIGxpdmUhJyA6ICdQcm9kdWN0IHVwZGF0ZWQgJiBzeW5jZWQgbGl2ZSEnKTtcbiAgICAgIHJldHVybiBpZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5XUklURSwgYHByb2R1Y3RzLyR7aWR9YCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGlkeCA9IHN0YXRlLnByb2R1Y3RzLmZpbmRJbmRleCgocCkgPT4gcC5pZCA9PT0gaWQpO1xuICAgIGlmIChpZHggPj0gMCkgc3RhdGUucHJvZHVjdHNbaWR4XSA9IHsgLi4uc3RhdGUucHJvZHVjdHNbaWR4XSwgLi4uYmFzZVBheWxvYWQgfTtcbiAgICBlbHNlIHN0YXRlLnByb2R1Y3RzLnVuc2hpZnQoYmFzZVBheWxvYWQpO1xuICAgIHBlcnNpc3RDYXRhbG9nQ2FjaGUoKTtcbiAgICBub3RpZnlTdGF0ZSgpO1xuICAgIHNob3dUb2FzdChpc05ldyA/ICdQcm9kdWN0IGFkZGVkIChzYXZlZCBsb2NhbGx5KS4nIDogJ1Byb2R1Y3QgdXBkYXRlZCAoc2F2ZWQgbG9jYWxseSkuJyk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVQcm9kdWN0KHByb2R1Y3RJZCkge1xuICBjb25zdCB0YXJnZXRJZCA9IFN0cmluZyhwcm9kdWN0SWQgfHwgJycpO1xuICBpZiAoIXRhcmdldElkKSByZXR1cm47XG5cbiAgaWYgKHN0YXRlLmlzQWRtaW4pIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZGVsZXRlRG9jKGRvYyhkYiwgJ3Byb2R1Y3RzJywgdGFyZ2V0SWQpKTtcbiAgICAgIHVubWFya1Byb2R1Y3REZWxldGVkTG9jYWxseSh0YXJnZXRJZCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuREVMRVRFLCBgcHJvZHVjdHMvJHt0YXJnZXRJZH1gKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWFya1Byb2R1Y3REZWxldGVkTG9jYWxseSh0YXJnZXRJZCk7XG4gIH1cblxuICBzdGF0ZS5wcm9kdWN0cyA9IHN0YXRlLnByb2R1Y3RzLmZpbHRlcigocCkgPT4gU3RyaW5nKHAuaWQpICE9PSB0YXJnZXRJZCk7XG4gIHN0YXRlLmZpcmVzdG9yZVByb2R1Y3RJZHMuZGVsZXRlKHRhcmdldElkKTtcblxuICBpZiAoc3RhdGUuY2FydC5zb21lKChjKSA9PiBTdHJpbmcoYy5wcm9kdWN0SWQpID09PSB0YXJnZXRJZCkpIHtcbiAgICBzdGF0ZS5jYXJ0ID0gc3RhdGUuY2FydC5maWx0ZXIoKGMpID0+IFN0cmluZyhjLnByb2R1Y3RJZCkgIT09IHRhcmdldElkKTtcbiAgICBzYXZlSnNvbihDQVJUX0tFWSwgc3RhdGUuY2FydCk7XG4gIH1cbiAgaWYgKHN0YXRlLndpc2hsaXN0LnNvbWUoKGlkKSA9PiBTdHJpbmcoaWQpID09PSB0YXJnZXRJZCkpIHtcbiAgICBzdGF0ZS53aXNobGlzdCA9IHN0YXRlLndpc2hsaXN0LmZpbHRlcigoaWQpID0+IFN0cmluZyhpZCkgIT09IHRhcmdldElkKTtcbiAgICBzYXZlSnNvbihXSVNIX0tFWSwgc3RhdGUud2lzaGxpc3QpO1xuICB9XG4gIGlmIChzdGF0ZS5yZWNlbnRseVZpZXdlZC5zb21lKChpZCkgPT4gU3RyaW5nKGlkKSA9PT0gdGFyZ2V0SWQpKSB7XG4gICAgc3RhdGUucmVjZW50bHlWaWV3ZWQgPSBzdGF0ZS5yZWNlbnRseVZpZXdlZC5maWx0ZXIoKGlkKSA9PiBTdHJpbmcoaWQpICE9PSB0YXJnZXRJZCk7XG4gICAgc2F2ZUpzb24oUkVDRU5UX0tFWSwgc3RhdGUucmVjZW50bHlWaWV3ZWQpO1xuICB9XG5cbiAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICBub3RpZnlTdGF0ZSgpO1xuICBzaG93VG9hc3QoJ1Byb2R1Y3QgZGVsZXRlZC4nKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVDYXRlZ29yeShjYXREYXRhLCBpc05ldyA9IGZhbHNlKSB7XG4gIGNvbnN0IGlkID0gaXNOZXcgPyBzYW5pdGl6ZUlkKGBjYXQtJHtzbHVnaWZ5KGNhdERhdGEubmFtZSl9LSR7RGF0ZS5ub3coKS50b1N0cmluZygzNikuc2xpY2UoLTMpfWApIDogY2F0RGF0YS5pZDtcbiAgY29uc3QgZXhpc3RpbmdDYXQgPSAhaXNOZXcgPyBzdGF0ZS5jYXRlZ29yaWVzLmZpbmQoKGMpID0+IGMuaWQgPT09IGlkKSA6IG51bGw7XG4gIGNvbnN0IG9sZE5hbWUgPSBleGlzdGluZ0NhdD8ubmFtZSB8fCAnJztcbiAgY29uc3QgbmV3TmFtZSA9IFN0cmluZyhjYXREYXRhLm5hbWUgfHwgJycpLnRyaW0oKS5zbGljZSgwLCAxMDApO1xuICBpZiAoIW5ld05hbWUpIHRocm93IG5ldyBFcnJvcignQ2F0ZWdvcnkgbmFtZSBpcyByZXF1aXJlZC4nKTtcblxuICBjb25zdCBiYXNlUGF5bG9hZCA9IHtcbiAgICBpZCxcbiAgICBuYW1lOiBuZXdOYW1lLFxuICAgIG5hbWVCbjogU3RyaW5nKGNhdERhdGEubmFtZUJuID8/IGV4aXN0aW5nQ2F0Py5uYW1lQm4gPz8gJycpLnRyaW0oKS5zbGljZSgwLCAxMjApLFxuICAgIGljb246IFN0cmluZyhjYXREYXRhLmljb24gPz8gZXhpc3RpbmdDYXQ/Lmljb24gPz8gJ/Cfm43vuI8nKS50cmltKCkuc2xpY2UoMCwgNjApLFxuICAgIGltYWdlVXJsOiBTdHJpbmcoY2F0RGF0YS5pbWFnZVVybCA/PyBleGlzdGluZ0NhdD8uaW1hZ2VVcmwgPz8gJycpLnRyaW0oKS5zbGljZSgwLCAxMDAwKSxcbiAgICBzb3J0T3JkZXI6IHBhcnNlSW50KGNhdERhdGEuc29ydE9yZGVyID8/IGV4aXN0aW5nQ2F0Py5zb3J0T3JkZXIsIDEwKSB8fCAxXG4gIH07XG5cbiAgY29uc3QgcmVuYW1lZCA9IEJvb2xlYW4oIWlzTmV3ICYmIG9sZE5hbWUgJiYgb2xkTmFtZSAhPT0gbmV3TmFtZSk7XG5cbiAgaWYgKHN0YXRlLmlzQWRtaW4pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYmF0Y2ggPSB3cml0ZUJhdGNoKGRiKTtcbiAgICAgIGJhdGNoLnNldChkb2MoZGIsICdjYXRlZ29yaWVzJywgaWQpLCB7IC4uLmJhc2VQYXlsb2FkLCB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpIH0sIHsgbWVyZ2U6IHRydWUgfSk7XG4gICAgICBpZiAocmVuYW1lZCkge1xuICAgICAgICBzdGF0ZS5wcm9kdWN0cy5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgICAgaWYgKHAuY2F0ZWdvcnkgPT09IG9sZE5hbWUgJiYgc3RhdGUuZmlyZXN0b3JlUHJvZHVjdElkcy5oYXMocC5pZCkpIHtcbiAgICAgICAgICAgIGJhdGNoLnVwZGF0ZShkb2MoZGIsICdwcm9kdWN0cycsIHAuaWQpLCB7XG4gICAgICAgICAgICAgIGNhdGVnb3J5OiBuZXdOYW1lLFxuICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYXdhaXQgYmF0Y2guY29tbWl0KCk7XG4gICAgICBjb25zdCBvdiA9IGdldExvY2FsQ2F0T3ZlcnJpZGVzKCk7XG4gICAgICBkZWxldGUgb3YuZWRpdGVkQnlJZFtpZF07XG4gICAgICBpZiAocmVuYW1lZCkgZGVsZXRlIG92LnJlbmFtZWRGcm9tW29sZE5hbWVdO1xuICAgICAgc2F2ZUpzb24oTE9DQUxfQ0FUX09WRVJSSURFU19LRVksIG92KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5XUklURSwgYGNhdGVnb3JpZXMvJHtpZH1gKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgb3YgPSBnZXRMb2NhbENhdE92ZXJyaWRlcygpO1xuICAgIG92LmVkaXRlZEJ5SWRbaWRdID0gYmFzZVBheWxvYWQ7XG4gICAgb3YuZGVsZXRlZElkcyA9IG92LmRlbGV0ZWRJZHMuZmlsdGVyKChkZWxJZCkgPT4gZGVsSWQgIT09IFN0cmluZyhpZCkpO1xuICAgIGlmIChyZW5hbWVkKSB7XG4gICAgICBPYmplY3Qua2V5cyhvdi5yZW5hbWVkRnJvbSkuZm9yRWFjaCgob3JpZykgPT4ge1xuICAgICAgICBpZiAob3YucmVuYW1lZEZyb21bb3JpZ10gPT09IG9sZE5hbWUpIG92LnJlbmFtZWRGcm9tW29yaWddID0gbmV3TmFtZTtcbiAgICAgIH0pO1xuICAgICAgb3YucmVuYW1lZEZyb21bb2xkTmFtZV0gPSBuZXdOYW1lO1xuICAgIH1cbiAgICBzYXZlSnNvbihMT0NBTF9DQVRfT1ZFUlJJREVTX0tFWSwgb3YpO1xuICB9XG5cbiAgY29uc3QgaWR4ID0gc3RhdGUuY2F0ZWdvcmllcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGlkKTtcbiAgaWYgKGlkeCA+PSAwKSBzdGF0ZS5jYXRlZ29yaWVzW2lkeF0gPSBiYXNlUGF5bG9hZDtcbiAgZWxzZSBzdGF0ZS5jYXRlZ29yaWVzLnB1c2goYmFzZVBheWxvYWQpO1xuICBzdGF0ZS5jYXRlZ29yaWVzLnNvcnQoKGEsIGIpID0+IChhLnNvcnRPcmRlciB8fCAwKSAtIChiLnNvcnRPcmRlciB8fCAwKSk7XG5cbiAgaWYgKHJlbmFtZWQpIHtcbiAgICBzdGF0ZS5wcm9kdWN0cyA9IHN0YXRlLnByb2R1Y3RzLm1hcCgocCkgPT4gKHAuY2F0ZWdvcnkgPT09IG9sZE5hbWUgPyB7IC4uLnAsIGNhdGVnb3J5OiBuZXdOYW1lIH0gOiBwKSk7XG4gIH1cblxuICBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdChyZW5hbWVkID8gYENhdGVnb3J5IHJlbmFtZWQgdG8gXCIke25ld05hbWV9XCIgJiB1cGRhdGVkIHByb2R1Y3RzLmAgOiAnQ2F0ZWdvcnkgc2F2ZWQuJyk7XG4gIHJldHVybiB7IGlkLCBvbGROYW1lLCBuZXdOYW1lLCByZW5hbWVkIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVDYXRlZ29yeShjYXRJZCkge1xuICBjb25zdCB0YXJnZXRJZCA9IFN0cmluZyhjYXRJZCB8fCAnJyk7XG4gIGlmICghdGFyZ2V0SWQpIHJldHVybjtcblxuICBpZiAoc3RhdGUuaXNBZG1pbikge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBkZWxldGVEb2MoZG9jKGRiLCAnY2F0ZWdvcmllcycsIHRhcmdldElkKSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuREVMRVRFLCBgY2F0ZWdvcmllcy8ke3RhcmdldElkfWApO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBvdiA9IGdldExvY2FsQ2F0T3ZlcnJpZGVzKCk7XG4gICAgZGVsZXRlIG92LmVkaXRlZEJ5SWRbdGFyZ2V0SWRdO1xuICAgIGlmICghb3YuZGVsZXRlZElkcy5pbmNsdWRlcyh0YXJnZXRJZCkpIG92LmRlbGV0ZWRJZHMucHVzaCh0YXJnZXRJZCk7XG4gICAgc2F2ZUpzb24oTE9DQUxfQ0FUX09WRVJSSURFU19LRVksIG92KTtcbiAgfVxuXG4gIHN0YXRlLmNhdGVnb3JpZXMgPSBzdGF0ZS5jYXRlZ29yaWVzLmZpbHRlcigoYykgPT4gU3RyaW5nKGMuaWQpICE9PSB0YXJnZXRJZCk7XG4gIHBlcnNpc3RDYXRhbG9nQ2FjaGUoKTtcbiAgbm90aWZ5U3RhdGUoKTtcbiAgc2hvd1RvYXN0KCdDYXRlZ29yeSBkZWxldGVkLicpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlT3JkZXJTdGF0dXMob3JkZXJJZCwgbmV3U3RhdHVzKSB7XG4gIGNvbnN0IG9yZGVyID0gc3RhdGUub3JkZXJzLmZpbmQoKG8pID0+IG8uaWQgPT09IG9yZGVySWQpO1xuICBpZiAoIW9yZGVyKSByZXR1cm47XG4gIGNvbnN0IHByZXZTdGF0dXMgPSBvcmRlci5zdGF0dXM7XG4gIGlmIChwcmV2U3RhdHVzID09PSBuZXdTdGF0dXMpIHJldHVybjtcblxuICBjb25zdCBiZWNvbWluZ0NhbmNlbGxlZCA9IHByZXZTdGF0dXMgIT09ICdDYW5jZWxsZWQnICYmIG5ld1N0YXR1cyA9PT0gJ0NhbmNlbGxlZCc7XG4gIGNvbnN0IHVuQ2FuY2VsbGluZyA9IHByZXZTdGF0dXMgPT09ICdDYW5jZWxsZWQnICYmIG5ld1N0YXR1cyAhPT0gJ0NhbmNlbGxlZCc7XG5cbiAgaWYgKHN0YXRlLmlzQWRtaW4gJiYgb3JkZXIuc3luY2VkVG9GaXJlc3RvcmUgIT09IGZhbHNlKSB7XG4gICAgY29uc3QgYmF0Y2ggPSB3cml0ZUJhdGNoKGRiKTtcbiAgICBiYXRjaC51cGRhdGUoZG9jKGRiLCAnb3JkZXJzJywgb3JkZXJJZCksIHtcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxuICAgICAgdXBkYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgIH0pO1xuXG4gICAgYmF0Y2guc2V0KFxuICAgICAgZG9jKGRiLCAnb3JkZXJUcmFja2luZycsIG9yZGVySWQpLFxuICAgICAge1xuICAgICAgICBpZDogb3JkZXJJZCxcbiAgICAgICAgb3JkZXJDb2RlOiBvcmRlci5vcmRlckNvZGUsXG4gICAgICAgIGRpdmlzaW9uOiBvcmRlci5kaXZpc2lvbiB8fCAnJyxcbiAgICAgICAgZGlzdHJpY3Q6IG9yZGVyLmRpc3RyaWN0LFxuICAgICAgICB1cGF6aWxhOiBvcmRlci51cGF6aWxhIHx8ICcnLFxuICAgICAgICBpdGVtQ291bnQ6IChvcmRlci5pdGVtcyB8fCBbXSkucmVkdWNlKChzLCBpKSA9PiBzICsgKGkucXR5IHx8IDEpLCAwKSxcbiAgICAgICAgdG90YWw6IG9yZGVyLnRvdGFsLFxuICAgICAgICBwYXltZW50TWV0aG9kOiBvcmRlci5wYXltZW50TWV0aG9kLFxuICAgICAgICBzdGF0dXM6IG5ld1N0YXR1cyxcbiAgICAgICAgcGhvbmVIYXNoOiBvcmRlci5waG9uZUhhc2ggfHwgJycsXG4gICAgICAgIGNyZWF0ZWRBdDogb3JkZXIuY3JlYXRlZEF0IHx8IHNlcnZlclRpbWVzdGFtcCgpLFxuICAgICAgICB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpXG4gICAgICB9LFxuICAgICAgeyBtZXJnZTogdHJ1ZSB9XG4gICAgKTtcblxuICAgIGlmIChiZWNvbWluZ0NhbmNlbGxlZCB8fCB1bkNhbmNlbGxpbmcpIHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBvcmRlci5pdGVtcyB8fCBbXSkge1xuICAgICAgICBjb25zdCBwcm9kID0gc3RhdGUucHJvZHVjdHMuZmluZCgocCkgPT4gcC5pZCA9PT0gaXRlbS5wcm9kdWN0SWQpO1xuICAgICAgICBpZiAocHJvZCAmJiBzdGF0ZS5maXJlc3RvcmVQcm9kdWN0SWRzLmhhcyhwcm9kLmlkKSkge1xuICAgICAgICAgIGNvbnN0IHF0eSA9IE51bWJlcihpdGVtLnF0eSkgfHwgMTtcbiAgICAgICAgICBjb25zdCBuZXh0U3RvY2sgPSBiZWNvbWluZ0NhbmNlbGxlZCA/IChwcm9kLnN0b2NrIHx8IDApICsgcXR5IDogTWF0aC5tYXgoMCwgKHByb2Quc3RvY2sgfHwgMCkgLSBxdHkpO1xuICAgICAgICAgIGNvbnN0IG5leHRTb2xkID0gYmVjb21pbmdDYW5jZWxsZWQgPyBNYXRoLm1heCgwLCAocHJvZC51bml0c1NvbGQgfHwgMCkgLSBxdHkpIDogKHByb2QudW5pdHNTb2xkIHx8IDApICsgcXR5O1xuICAgICAgICAgIGJhdGNoLnVwZGF0ZShkb2MoZGIsICdwcm9kdWN0cycsIHByb2QuaWQpLCB7XG4gICAgICAgICAgICBzdG9jazogbmV4dFN0b2NrLFxuICAgICAgICAgICAgdW5pdHNTb2xkOiBuZXh0U29sZCxcbiAgICAgICAgICAgIHVwZGF0ZWRBdDogc2VydmVyVGltZXN0YW1wKClcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBiYXRjaC5jb21taXQoKTtcbiAgICAgIHNob3dUb2FzdChgT3JkZXIgJHtvcmRlci5vcmRlckNvZGV9IHVwZGF0ZWQgdG8gJHtuZXdTdGF0dXN9YCk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuVVBEQVRFLCBgb3JkZXJzLyR7b3JkZXJJZH1gKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICBvcmRlci5zdGF0dXMgPSBuZXdTdGF0dXM7XG4gIGlmIChiZWNvbWluZ0NhbmNlbGxlZCB8fCB1bkNhbmNlbGxpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygb3JkZXIuaXRlbXMgfHwgW10pIHtcbiAgICAgIGNvbnN0IHByb2QgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBwLmlkID09PSBpdGVtLnByb2R1Y3RJZCk7XG4gICAgICBpZiAocHJvZCkge1xuICAgICAgICBjb25zdCBxdHkgPSBOdW1iZXIoaXRlbS5xdHkpIHx8IDE7XG4gICAgICAgIHByb2Quc3RvY2sgPSBiZWNvbWluZ0NhbmNlbGxlZCA/IChwcm9kLnN0b2NrIHx8IDApICsgcXR5IDogTWF0aC5tYXgoMCwgKHByb2Quc3RvY2sgfHwgMCkgLSBxdHkpO1xuICAgICAgICBwcm9kLnVuaXRzU29sZCA9IGJlY29taW5nQ2FuY2VsbGVkID8gTWF0aC5tYXgoMCwgKHByb2QudW5pdHNTb2xkIHx8IDApIC0gcXR5KSA6IChwcm9kLnVuaXRzU29sZCB8fCAwKSArIHF0eTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICB9XG4gIHNhdmVKc29uKEFETUlOX09SREVSU19DQUNIRV9LRVksIHN0YXRlLm9yZGVycyk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdChgT3JkZXIgJHtvcmRlci5vcmRlckNvZGV9IHVwZGF0ZWQgdG8gJHtuZXdTdGF0dXN9YCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVPcmRlcihvcmRlcklkKSB7XG4gIGlmIChzdGF0ZS5pc0FkbWluKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJhdGNoID0gd3JpdGVCYXRjaChkYik7XG4gICAgICBiYXRjaC5kZWxldGUoZG9jKGRiLCAnb3JkZXJzJywgb3JkZXJJZCkpO1xuICAgICAgYmF0Y2guZGVsZXRlKGRvYyhkYiwgJ29yZGVyVHJhY2tpbmcnLCBvcmRlcklkKSk7XG4gICAgICBhd2FpdCBiYXRjaC5jb21taXQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5ERUxFVEUsIGBvcmRlcnMvJHtvcmRlcklkfWApO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuICBzdGF0ZS5vcmRlcnMgPSBzdGF0ZS5vcmRlcnMuZmlsdGVyKChvKSA9PiBvLmlkICE9PSBvcmRlcklkKTtcbiAgc3RhdGUudW5zZWVuT3JkZXJJZHMuZGVsZXRlKG9yZGVySWQpO1xuICBzdGF0ZS5uZXdPcmRlcnNDb3VudCA9IHN0YXRlLnVuc2Vlbk9yZGVySWRzLnNpemU7XG4gIHNhdmVKc29uKFVOU0VFTl9PUkRFUlNfS0VZLCBBcnJheS5mcm9tKHN0YXRlLnVuc2Vlbk9yZGVySWRzKSk7XG4gIHNhdmVKc29uKEFETUlOX09SREVSU19DQUNIRV9LRVksIHN0YXRlLm9yZGVycyk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdCgnT3JkZXIgZGVsZXRlZC4nKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQb3N0KHBvc3REYXRhLCBpc05ldyA9IGZhbHNlKSB7XG4gIGNvbnN0IGlkID0gaXNOZXcgPyBzYW5pdGl6ZUlkKGBwb3N0LSR7c2x1Z2lmeShwb3N0RGF0YS50aXRsZSl9LSR7RGF0ZS5ub3coKS50b1N0cmluZygzNikuc2xpY2UoLTQpfWApIDogcG9zdERhdGEuaWQ7XG4gIGNvbnN0IGJhc2VQYXlsb2FkID0ge1xuICAgIGlkLFxuICAgIHRpdGxlOiBTdHJpbmcocG9zdERhdGEudGl0bGUgfHwgJycpLnRyaW0oKS5zbGljZSgwLCAyMDApLFxuICAgIHNsdWc6IHNsdWdpZnkocG9zdERhdGEudGl0bGUpLFxuICAgIGNhdGVnb3J5OiBTdHJpbmcocG9zdERhdGEuY2F0ZWdvcnkgfHwgJ0J1eWluZyBHdWlkZScpLnRyaW0oKS5zbGljZSgwLCA4MCksXG4gICAgY292ZXJJbWFnZTogU3RyaW5nKHBvc3REYXRhLmNvdmVySW1hZ2UgfHwgJycpLnRyaW0oKS5zbGljZSgwLCAxMDAwKSxcbiAgICBleGNlcnB0OiBTdHJpbmcocG9zdERhdGEuZXhjZXJwdCB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDQwMCksXG4gICAgYm9keTogU3RyaW5nKHBvc3REYXRhLmJvZHkgfHwgJycpLnRyaW0oKS5zbGljZSgwLCAyNTAwMCksXG4gICAgdGFnczogKHBvc3REYXRhLnRhZ3MgfHwgW10pLnNsaWNlKDAsIDE1KSxcbiAgICBwdWJsaXNoZWQ6IEJvb2xlYW4ocG9zdERhdGEucHVibGlzaGVkKSxcbiAgICBpc3N1ZUZsYWc6IEJvb2xlYW4ocG9zdERhdGEuaXNzdWVGbGFnKSxcbiAgICBpc3N1ZU5vdGU6IFN0cmluZyhwb3N0RGF0YS5pc3N1ZU5vdGUgfHwgJycpLnRyaW0oKS5zbGljZSgwLCA1MDApXG4gIH07XG5cbiAgLy8gVXBkYXRlIGxvY2FsIHJlcG9ydCBtYXAgY2xlYW5seVxuICBjb25zdCByZXBvcnRzID0gbG9hZEpzb24oQkxPR19SRVBPUlRTX0tFWSwge30pO1xuICBpZiAoIWJhc2VQYXlsb2FkLmlzc3VlRmxhZykge1xuICAgIGRlbGV0ZSByZXBvcnRzW2lkXTtcbiAgfSBlbHNlIHtcbiAgICByZXBvcnRzW2lkXSA9IHsgaXNzdWVGbGFnOiB0cnVlLCBpc3N1ZU5vdGU6IGJhc2VQYXlsb2FkLmlzc3VlTm90ZSwgcmVwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH07XG4gIH1cbiAgc2F2ZUpzb24oQkxPR19SRVBPUlRTX0tFWSwgcmVwb3J0cyk7XG4gIHN0YXRlLmJsb2dSZXBvcnRzID0gcmVwb3J0cztcblxuICBpZiAoc3RhdGUuaXNBZG1pbikge1xuICAgIGNvbnN0IHBheWxvYWQgPSB7IC4uLmJhc2VQYXlsb2FkLCB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpIH07XG4gICAgaWYgKGlzTmV3KSBwYXlsb2FkLmNyZWF0ZWRBdCA9IHNlcnZlclRpbWVzdGFtcCgpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZXREb2MoZG9jKGRiLCAncG9zdHMnLCBpZCksIHBheWxvYWQsIHsgbWVyZ2U6IHRydWUgfSk7XG4gICAgICBzaG93VG9hc3QoaXNOZXcgPyAnQmxvZyBwb3N0IGNyZWF0ZWQuJyA6ICdCbG9nIHBvc3QgdXBkYXRlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5XUklURSwgYHBvc3RzLyR7aWR9YCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaWR4ID0gc3RhdGUucG9zdHMuZmluZEluZGV4KChwKSA9PiBwLmlkID09PSBpZCk7XG4gIGlmIChpZHggPj0gMCkgc3RhdGUucG9zdHNbaWR4XSA9IHsgLi4uc3RhdGUucG9zdHNbaWR4XSwgLi4uYmFzZVBheWxvYWQgfTtcbiAgZWxzZSBzdGF0ZS5wb3N0cy51bnNoaWZ0KGJhc2VQYXlsb2FkKTtcbiAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICBub3RpZnlTdGF0ZSgpO1xuICBzaG93VG9hc3QoaXNOZXcgPyAnQmxvZyBwb3N0IGNyZWF0ZWQuJyA6ICdCbG9nIHBvc3QgdXBkYXRlZC4nKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVBvc3QocG9zdElkKSB7XG4gIGNvbnN0IHJlcG9ydHMgPSBsb2FkSnNvbihCTE9HX1JFUE9SVFNfS0VZLCB7fSk7XG4gIGRlbGV0ZSByZXBvcnRzW3Bvc3RJZF07XG4gIHNhdmVKc29uKEJMT0dfUkVQT1JUU19LRVksIHJlcG9ydHMpO1xuICBzdGF0ZS5ibG9nUmVwb3J0cyA9IHJlcG9ydHM7XG5cbiAgaWYgKHN0YXRlLmlzQWRtaW4pIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZGVsZXRlRG9jKGRvYyhkYiwgJ3Bvc3RzJywgcG9zdElkKSk7XG4gICAgICBzaG93VG9hc3QoJ0Jsb2cgcG9zdCBkZWxldGVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLkRFTEVURSwgYHBvc3RzLyR7cG9zdElkfWApO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuICBzdGF0ZS5wb3N0cyA9IHN0YXRlLnBvc3RzLmZpbHRlcigocCkgPT4gcC5pZCAhPT0gcG9zdElkKTtcbiAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICBub3RpZnlTdGF0ZSgpO1xuICBzaG93VG9hc3QoJ0Jsb2cgcG9zdCBkZWxldGVkLicpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJldmlldyhyZXZpZXdEYXRhLCBpc05ldyA9IGZhbHNlKSB7XG4gIGNvbnN0IGlkID0gaXNOZXcgPyBzYW5pdGl6ZUlkKGByZXYtJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA1KX1gKSA6IHJldmlld0RhdGEuaWQ7XG4gIGNvbnN0IHByb2QgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBwLmlkID09PSByZXZpZXdEYXRhLnByb2R1Y3RJZCk7XG4gIGNvbnN0IGJhc2VQYXlsb2FkID0ge1xuICAgIGlkLFxuICAgIHByb2R1Y3RJZDogU3RyaW5nKHJldmlld0RhdGEucHJvZHVjdElkIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgMTI4KSxcbiAgICBwcm9kdWN0TmFtZTogU3RyaW5nKHJldmlld0RhdGEucHJvZHVjdE5hbWUgfHwgcHJvZD8ubmFtZSB8fCAnR2VuZXJhbCBTdG9yZScpLnRyaW0oKS5zbGljZSgwLCAyMDApLFxuICAgIGF1dGhvck5hbWU6IFN0cmluZyhyZXZpZXdEYXRhLmF1dGhvck5hbWUgfHwgJycpLnRyaW0oKS5zbGljZSgwLCAxMDApLFxuICAgIGNpdHk6IFN0cmluZyhyZXZpZXdEYXRhLmNpdHkgfHwgJ0JhbmdsYWRlc2gnKS50cmltKCkuc2xpY2UoMCwgODApLFxuICAgIHJhdGluZzogTWF0aC5tYXgoMSwgTWF0aC5taW4oNSwgcGFyc2VJbnQocmV2aWV3RGF0YS5yYXRpbmcsIDEwKSB8fCA1KSksXG4gICAgY29tbWVudDogU3RyaW5nKHJldmlld0RhdGEuY29tbWVudCB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDE1MDApLFxuICAgIGFwcHJvdmVkOiByZXZpZXdEYXRhLmFwcHJvdmVkICE9PSBmYWxzZVxuICB9O1xuXG4gIGlmIChzdGF0ZS5pc0FkbWluKSB7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBzdGF0ZS5yZXZpZXdzLmZpbmQoKHIpID0+IHIuaWQgPT09IGlkKTtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgLi4uYmFzZVBheWxvYWQsXG4gICAgICBjcmVhdGVkQXQ6IGlzTmV3IHx8ICFleGlzdGluZz8uY3JlYXRlZEF0ID8gc2VydmVyVGltZXN0YW1wKCkgOiBleGlzdGluZy5jcmVhdGVkQXQsXG4gICAgICB1cGRhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc2V0RG9jKGRvYyhkYiwgJ3Jldmlld3MnLCBpZCksIHBheWxvYWQsIHsgbWVyZ2U6IHRydWUgfSk7XG4gICAgICBzaG93VG9hc3QoaXNOZXcgPyAnUmV2aWV3IGFkZGVkIScgOiAnUmV2aWV3IHVwZGF0ZWQhJyk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuV1JJVEUsIGByZXZpZXdzLyR7aWR9YCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaWR4ID0gc3RhdGUucmV2aWV3cy5maW5kSW5kZXgoKHIpID0+IHIuaWQgPT09IGlkKTtcbiAgY29uc3QgbG9jYWxJdGVtID0ge1xuICAgIC4uLmJhc2VQYXlsb2FkLFxuICAgIGNyZWF0ZWRBdDogaWR4ID49IDAgPyBzdGF0ZS5yZXZpZXdzW2lkeF0uY3JlYXRlZEF0IDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIH07XG4gIGlmIChpZHggPj0gMCkgc3RhdGUucmV2aWV3c1tpZHhdID0gbG9jYWxJdGVtO1xuICBlbHNlIHN0YXRlLnJldmlld3MudW5zaGlmdChsb2NhbEl0ZW0pO1xuICBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdChpc05ldyA/ICdSZXZpZXcgYWRkZWQhJyA6ICdSZXZpZXcgdXBkYXRlZCEnKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVJldmlld0FwcHJvdmFsKHJldmlld0lkKSB7XG4gIGNvbnN0IHJldiA9IHN0YXRlLnJldmlld3MuZmluZCgocikgPT4gci5pZCA9PT0gcmV2aWV3SWQpO1xuICBpZiAoIXJldikgcmV0dXJuO1xuICBhd2FpdCBzYXZlUmV2aWV3KHsgLi4ucmV2LCBhcHByb3ZlZDogcmV2LmFwcHJvdmVkID09PSBmYWxzZSB9LCBmYWxzZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVSZXZpZXcocmV2aWV3SWQpIHtcbiAgaWYgKHN0YXRlLmlzQWRtaW4pIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZGVsZXRlRG9jKGRvYyhkYiwgJ3Jldmlld3MnLCByZXZpZXdJZCkpO1xuICAgICAgc2hvd1RvYXN0KCdSZXZpZXcgZGVsZXRlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGhhbmRsZUZpcmVzdG9yZUVycm9yKGVyciwgT3BlcmF0aW9uVHlwZS5ERUxFVEUsIGByZXZpZXdzLyR7cmV2aWV3SWR9YCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG4gIHN0YXRlLnJldmlld3MgPSBzdGF0ZS5yZXZpZXdzLmZpbHRlcigocikgPT4gci5pZCAhPT0gcmV2aWV3SWQpO1xuICBwZXJzaXN0Q2F0YWxvZ0NhY2hlKCk7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdCgnUmV2aWV3IGRlbGV0ZWQuJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU2V0dGluZ3NEb2Moc2V0dGluZ0lkLCBkYXRhKSB7XG4gIGlmIChzdGF0ZS5pc0FkbWluKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICBpZDogc2V0dGluZ0lkLFxuICAgICAgdXBkYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldERvYyhkb2MoZGIsICdzZXR0aW5ncycsIHNldHRpbmdJZCksIHBheWxvYWQsIHsgbWVyZ2U6IHRydWUgfSk7XG4gICAgICBzaG93VG9hc3QoJ1NldHRpbmdzIHNhdmVkICYgYXBwbGllZCBsaXZlIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyLCBPcGVyYXRpb25UeXBlLldSSVRFLCBgc2V0dGluZ3MvJHtzZXR0aW5nSWR9YCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG4gIGlmIChzZXR0aW5nSWQgPT09ICdnZW5lcmFsJykgc3RhdGUuZ2VuZXJhbCA9IHsgLi4uU0VFRF9HRU5FUkFMX1NFVFRJTkdTLCAuLi5kYXRhLCBpZDogJ2dlbmVyYWwnIH07XG4gIGlmIChzZXR0aW5nSWQgPT09ICd0aGVtZScpIHN0YXRlLnRoZW1lID0gbm9ybWFsaXplVGhlbWVTZXR0aW5ncyh7IC4uLmRhdGEsIGlkOiAndGhlbWUnIH0pO1xuICBpZiAoc2V0dGluZ0lkID09PSAnYWRzJykgc3RhdGUuYWRzID0geyAuLi5TRUVEX0FEU19TRVRUSU5HUywgLi4uZGF0YSwgaWQ6ICdhZHMnIH07XG4gIGFwcGx5VGhlbWVWYXJpYWJsZXMoKTtcbiAgcGVyc2lzdENhdGFsb2dDYWNoZSgpO1xuICBub3RpZnlTdGF0ZSgpO1xuICBzaG93VG9hc3QoJ1NldHRpbmdzIHNhdmVkICYgYXBwbGllZCEnKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEFkbWluVWlkKHVpZCwgZW1haWwpIHtcbiAgY29uc3QgY2xlYW5VaWQgPSBzYW5pdGl6ZUlkKHVpZCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgc2V0RG9jKGRvYyhkYiwgJ2FkbWlucycsIGNsZWFuVWlkKSwge1xuICAgICAgZW1haWw6IFN0cmluZyhlbWFpbCB8fCAnJykudHJpbSgpLnNsaWNlKDAsIDE2MCksXG4gICAgICByb2xlOiAnYWRtaW4nLFxuICAgICAgY3JlYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKVxuICAgIH0pO1xuICAgIHNob3dUb2FzdCgnQWRtaW4gVUlEIGdyYW50ZWQgYWNjZXNzLicpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnIsIE9wZXJhdGlvblR5cGUuV1JJVEUsIGBhZG1pbnMvJHtjbGVhblVpZH1gKTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cbiJdfQ==