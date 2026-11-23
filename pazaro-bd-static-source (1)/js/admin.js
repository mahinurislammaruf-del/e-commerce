// Pazaro BD — Full Admin Panel (/admin)
import { state, formatPrice, loginAdminEmail, loginAdminGoogle, logoutAdmin, sendAdminVerificationEmail, refreshAuthVerification, saveProduct, deleteProduct, saveCategory, deleteCategory, updateOrderStatus, deleteOrder, savePost, deletePost, saveReview, toggleReviewApproval, deleteReview, markOrdersSeen, saveSettingsDoc, addAdminUid, uploadAssetToStorage, seedDemoDataToFirestore, showToast } from "/src/js/store.js";
import { escHtml, getProductImage, getStockBadge, renderDbConnectionAlert } from "/src/js/ui-components.js";
import { SEED_GENERAL_SETTINGS, SEED_THEME_SETTINGS, SEED_ADS_SETTINGS } from "/src/js/seed-data.js";
import { downloadSourceZip } from "/src/js/zip-export.js";
import { getCustomerSession, isCustomerAdmin, signOutCustomer } from "/src/js/customer-auth.js";
export const adminUiState = {
	tab: "dashboard",
	chartDays: 7,
	prodSearch: "",
	prodCatFilter: "All",
	reviewFilter: "all",
	editingProduct: null,
	editingCategory: null,
	quickEditCategoryId: "",
	confirmDialog: null,
	editingPost: null,
	editingReview: null,
	mobileMenuOpen: false,
	loginError: "",
	showPass: false
};
const ADMIN_TABS = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: "📊"
	},
	{
		id: "products",
		label: "Products",
		icon: "📦"
	},
	{
		id: "categories",
		label: "Categories",
		icon: "🗂️"
	},
	{
		id: "orders",
		label: "Orders",
		icon: "🧾"
	},
	{
		id: "blog",
		label: "Blog",
		icon: "✍️"
	},
	{
		id: "reviews",
		label: "Reviews",
		icon: "⭐"
	},
	{
		id: "banners",
		label: "Banners & Theme",
		icon: "🎨"
	},
	{
		id: "branding",
		label: "Logo & Branding",
		icon: "🏷️"
	},
	{
		id: "ads",
		label: "Ads",
		icon: "📢"
	},
	{
		id: "settings",
		label: "Settings",
		icon: "⚙️"
	},
	{
		id: "backup",
		label: "Source & Backup",
		icon: "💾"
	}
];
function getOrderTimestamp(ord) {
	if (!ord?.createdAt) return Date.now();
	if (typeof ord.createdAt.toMillis === "function") return ord.createdAt.toMillis();
	const ms = new Date(ord.createdAt).getTime();
	return Number.isNaN(ms) ? Date.now() : ms;
}
export function renderAdminView() {
	const custSession = getCustomerSession();
	const hasCustomerAdmin = isCustomerAdmin(custSession);
	// Strict RBAC: allow unauthenticated visitors to see Firebase Admin Login; block regular storefront users
	if (!hasCustomerAdmin && !state.isAdmin) {
		if (!custSession) {
			return renderAdminLogin();
		}
		const signedInLabel = custSession?.email || custSession?.fullName || "Guest";
		return `
      <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
        <div class="card-panel" style="max-width:460px;text-align:center;padding:32px 24px;">
          <div style="font-size:2.4rem;margin-bottom:8px;">🔒</div>
          <h1 style="margin:0 0 8px;">Access Denied</h1>
          <p style="color:var(--muted);font-size:0.92rem;margin:0 0 18px;">
            The Admin Panel is restricted to authorized administrators only. Signed-in user <strong>${escHtml(signedInLabel)}</strong> has a standard user account.
          </p>
          <a href="#home" class="btn btn-primary">Return to Storefront</a>
        </div>
      </main>
    `;
	}
	const g = state.general || SEED_GENERAL_SETTINGS;
	const activeEmail = state.authUser?.email || (custSession?.role === "admin" ? custSession.fullName || "Admin" : custSession?.email) || "Admin";
	const hasOutOfStock = state.products.some((p) => Number(p.stock) <= 0);
	const blogAlertsCount = state.posts.filter((p) => p.issueFlag || p.published === false || !p.body || p.body.trim().length < 20 || !p.excerpt).length;
	const hiddenReviewsCount = state.reviews.filter((r) => r.approved === false).length;
	return `
    <div class="admin-shell">
      <aside class="admin-sidebar ${adminUiState.mobileMenuOpen ? "mobile-open" : ""}">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px 16px;border-bottom:1px solid rgba(255,255,255,0.12);margin-bottom:8px;">
          <a href="#home" style="font-weight:700;font-size:1.15rem;color:#ffffff;">${escHtml(g.siteName || "Pazaro BD")}</a>
          <button type="button" class="icon-btn" style="display:inline-flex;color:#fff;" data-action="admin-close-menu" aria-label="Close sidebar">✕</button>
        </div>

        ${ADMIN_TABS.map((t) => {
		let rightBadge = "";
		let cornerDot = "";
		if (t.id === "products" && hasOutOfStock) {
			cornerDot = "<span class=\"admin-oos-dot\" title=\"Out of stock products alert\" aria-label=\"Out of stock alert\"></span>";
		}
		if (t.id === "orders" && state.newOrdersCount > 0) {
			rightBadge = `<span class="admin-nav-badge admin-badge-orders">${state.newOrdersCount} New</span>`;
		} else if (t.id === "blog" && blogAlertsCount > 0) {
			rightBadge = `<span class="admin-nav-badge admin-badge-warn">${blogAlertsCount} Alert${blogAlertsCount > 1 ? "s" : ""}</span>`;
		} else if (t.id === "reviews" && hiddenReviewsCount > 0) {
			rightBadge = `<span class="admin-nav-badge admin-badge-warn">${hiddenReviewsCount} Hidden</span>`;
		}
		return `
            <button type="button" class="admin-nav-btn ${adminUiState.tab === t.id ? "active" : ""}" data-action="admin-tab" data-tab="${t.id}">
              <span>${t.icon} ${escHtml(t.label)}</span>
              ${rightBadge}
              ${cornerDot}
            </button>
          `;
	}).join("")}

        <div style="margin-top:auto;padding-top:14px;border-top:1px solid rgba(255,255,255,0.12);display:grid;gap:8px;">
          <a href="#home" class="admin-nav-btn">🛍️ View Live Storefront</a>
          <button type="button" class="admin-nav-btn" data-action="admin-logout">🚪 Logout</button>
        </div>
      </aside>

      <div>
        <header class="admin-topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="btn btn-sm btn-outline" data-action="admin-toggle-menu" aria-label="Menu">☰ Menu</button>
            <strong style="font-size:1.05rem;">${escHtml(ADMIN_TABS.find((t) => t.id === adminUiState.tab)?.label || "Admin")}</strong>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.82rem;color:var(--muted);">${escHtml(activeEmail)}</span>
            <a href="#home" class="btn btn-sm btn-outline">Storefront</a>
            <button type="button" class="btn btn-sm btn-outline" data-action="admin-logout">Logout</button>
          </div>
        </header>

        <div class="admin-main">
          ${renderDbConnectionAlert()}
          ${!state.isAdmin ? `
            <div class="card-panel" style="margin-bottom:16px;display:grid;gap:12px;background:#fffbeb;border:1px solid rgba(251,191,36,0.5);">
              ${state.authUser && state.authVerificationRequired ? `
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                  <div style="font-size:0.86rem;">
                    <strong>Email Verification Required</strong> · Signed in as <strong>${escHtml(state.authUser.email || state.authUser.uid)}</strong>. Verify your email address to unlock live Firestore &amp; Storage writes.
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    <button type="button" class="btn btn-sm btn-primary" data-action="admin-send-verify">Send Verification Email</button>
                    <button type="button" class="btn btn-sm btn-outline" data-action="admin-refresh-verify">I've Verified — Refresh</button>
                    <button type="button" class="btn btn-sm btn-outline" data-action="admin-firebase-signout">Sign Out Firebase</button>
                  </div>
                </div>
              ` : state.authUser ? `
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                  <div style="font-size:0.86rem;">
                    <strong>Firebase Auth Account (${escHtml(state.authUser.email || state.authUser.uid)})</strong> does not have Firestore Admin role yet. Add UID <code style="user-select:all;">${escHtml(state.authUser.uid)}</code> to Firestore <code>admins/${escHtml(state.authUser.uid)}</code> to enable live cloud writes.
                  </div>
                  <button type="button" class="btn btn-sm btn-outline" data-action="admin-firebase-signout">Switch Firebase Account</button>
                </div>
              ` : `
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                  <div style="font-size:0.86rem;">
                    <strong>Connect Firebase Admin Auth</strong> · Sign in with your Firebase Email &amp; Password (or Google Owner account) to save products, categories, orders, blog posts &amp; Storage images directly to Firestore.
                  </div>
                  <button type="button" class="btn btn-sm btn-outline" data-action="admin-google-login">Sign In with Google</button>
                </div>
                ${adminUiState.loginError ? `
                  <div style="background:#fef2f2;color:#b91c1c;padding:9px 12px;border-radius:10px;font-size:0.84rem;">
                    ${escHtml(adminUiState.loginError)}
                  </div>
                ` : ""}
                <form id="admin-login-form" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                  <input class="field-input" id="admin-email" type="email" required placeholder="Admin Firebase email" style="flex:1 1 200px;" />
                  <div style="position:relative;flex:1 1 180px;">
                    <input class="field-input" id="admin-pass" type="${adminUiState.showPass ? "text" : "password"}" required placeholder="Password" style="padding-right:58px;" />
                    <button type="button" data-action="toggle-pass-vis" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;cursor:pointer;font-size:0.8rem;color:var(--primary);font-weight:600;">
                      ${adminUiState.showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button type="submit" class="btn btn-sm btn-primary">Login with Email</button>
                </form>
              `}
            </div>
          ` : ""}
          ${renderActiveAdminTab()}
        </div>
      </div>
    </div>

    ${adminUiState.editingProduct ? renderProductEditorModal(adminUiState.editingProduct) : ""}
    ${adminUiState.editingCategory ? renderCategoryEditorModal(adminUiState.editingCategory) : ""}
    ${adminUiState.quickEditCategoryId ? renderQuickEditCategoryModal(adminUiState.quickEditCategoryId) : ""}
    ${adminUiState.editingPost ? renderPostEditorModal(adminUiState.editingPost) : ""}
    ${adminUiState.editingReview ? renderReviewEditorModal(adminUiState.editingReview) : ""}
    ${adminUiState.confirmDialog ? renderConfirmDeleteModal(adminUiState.confirmDialog) : ""}
  `;
}
function renderAdminLogin() {
	const g = state.general || SEED_GENERAL_SETTINGS;
	return `
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div class="card-panel" style="width:min(420px,100%);padding:28px;">
        <div style="text-align:center;margin-bottom:20px;">
          ${g.logoUrl ? `<img src="${escHtml(g.logoUrl)}" alt="${escHtml(g.siteName)}" style="height:46px;margin:0 auto 10px;" />` : `<img src="/assets/pazaro-logo.svg" alt="${escHtml(g.siteName || "Pazaro BD")} logo" style="height:52px;width:52px;margin:0 auto 10px;display:block;" />`}
          <h1 style="margin:0 0 4px;font-size:1.4rem;">${escHtml(g.siteName || "Pazaro BD")} Admin</h1>
          <p style="margin:0;color:var(--muted);font-size:0.88rem;">Sign in with Firebase Email &amp; Password to manage products, orders, blog &amp; settings.</p>
        </div>

        ${renderDbConnectionAlert()}

        ${state.authUser && state.authVerificationRequired ? `
          <div style="background:#fffbeb;border:1px solid rgba(251,191,36,0.6);color:#92400e;padding:12px;border-radius:10px;font-size:0.84rem;margin-bottom:14px;display:grid;gap:8px;">
            <div><strong>Verify your email first:</strong> ${escHtml(state.authUser.email || "")} is signed in, but security rules require a verified email.</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <button type="button" class="btn btn-sm btn-primary" data-action="admin-send-verify">Send Verification Email</button>
              <button type="button" class="btn btn-sm btn-outline" data-action="admin-refresh-verify">Refresh Status</button>
            </div>
          </div>
        ` : ""}

        ${adminUiState.loginError ? `
          <div style="background:#fef2f2;color:#b91c1c;padding:10px 12px;border-radius:10px;font-size:0.85rem;margin-bottom:14px;">
            ${escHtml(adminUiState.loginError)}
          </div>
        ` : ""}

        <form id="admin-login-form" class="form-grid">
          <div>
            <label class="field-label" for="admin-email">Email</label>
            <input class="field-input" id="admin-email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label class="field-label" for="admin-pass">Password</label>
            <div style="position:relative;">
              <input class="field-input" id="admin-pass" type="${adminUiState.showPass ? "text" : "password"}" required placeholder="••••••••" style="padding-right:64px;" />
              <button type="button" data-action="toggle-pass-vis" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;cursor:pointer;font-size:0.82rem;color:var(--primary);font-weight:600;">
                ${adminUiState.showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Login with Email</button>
        </form>

        <div style="text-align:center;margin:14px 0;font-size:0.82rem;color:var(--muted);">or</div>

        <button type="button" class="btn btn-outline" style="width:100%;" data-action="admin-google-login">
          Continue with Google (Owner)
        </button>

        <div style="text-align:center;margin-top:16px;">
          <a href="#home" style="font-size:0.85rem;color:var(--primary);font-weight:600;">← Return to Storefront</a>
        </div>
      </div>
    </main>
  `;
}
function renderActiveAdminTab() {
	switch (adminUiState.tab) {
		case "dashboard": return renderDashboardTab();
		case "products": return renderProductsTab();
		case "categories": return renderCategoriesTab();
		case "orders": return renderOrdersTab();
		case "blog": return renderBlogTab();
		case "reviews": return renderReviewsTab();
		case "banners": return renderBannersThemeTab();
		case "branding": return renderBrandingTab();
		case "ads": return renderAdsTab();
		case "settings": return renderSettingsTab();
		case "backup": return renderBackupTab();
		default: return renderDashboardTab();
	}
}
function renderDashboardTab() {
	const prods = state.products;
	const activeOrders = state.orders.filter((o) => o.status !== "Cancelled");
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const newToday = state.orders.filter((o) => getOrderTimestamp(o) >= todayStart.getTime()).length;
	const totalSales = activeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
	const orderUnits = activeOrders.reduce((s, o) => s + (o.items || []).reduce((k, i) => k + (Number(i.qty) || 1), 0), 0);
	const prodDemoUnits = prods.reduce((s, p) => s + (Number(p.unitsSold) || 0), 0);
	const totalUnitsSold = Math.max(orderUnits, prodDemoUnits);
	const totalStock = prods.reduce((s, p) => s + (Number(p.stock) || 0), 0);
	const lowStockList = prods.filter((p) => (p.stock || 0) > 0 && p.stock <= 5);
	const outStockCount = prods.filter((p) => (p.stock || 0) <= 0).length;
	const bestSellers = [...prods].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0)).slice(0, 5);
	const latestOrders = state.orders.slice(0, 5);
	// Build SVG Sales Chart for last 7 or 30 days
	const days = adminUiState.chartDays;
	const buckets = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() - i);
		const next = d.getTime() + 864e5;
		const sum = activeOrders.filter((o) => {
			const ts = getOrderTimestamp(o);
			return ts >= d.getTime() && ts < next;
		}).reduce((acc, o) => acc + (Number(o.total) || 0), 0);
		buckets.push({
			label: `${d.getDate()}/${d.getMonth() + 1}`,
			value: sum
		});
	}
	const maxVal = Math.max(1e3, ...buckets.map((b) => b.value));
	return `
    <div style="display:grid;gap:20px;">
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Total Products</div><div class="kpi-value">${prods.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Orders</div><div class="kpi-value">${state.orders.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">New Orders Today</div><div class="kpi-value">${newToday}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Sales</div><div class="kpi-value" style="color:var(--primary);">${formatPrice(totalSales)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Units Sold</div><div class="kpi-value">${totalUnitsSold}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Stock Units</div><div class="kpi-value">${totalStock}</div></div>
        <div class="kpi-card"><div class="kpi-label">Low Stock Products</div><div class="kpi-value" style="color:#b45309;">${lowStockList.length}</div></div>
        <div class="kpi-card">
          ${outStockCount > 0 ? "<span class=\"admin-oos-dot\" title=\"Out of stock products alert\"></span>" : ""}
          <div class="kpi-label">Out of Stock</div>
          <div class="kpi-value" style="color:#b91c1c;">${outStockCount}</div>
        </div>
      </div>

      <div class="card-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
          <h2 style="margin:0;font-size:1.1rem;">Sales Overview (Last ${days} Days)</h2>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-sm ${days === 7 ? "btn-primary" : "btn-outline"}" data-action="chart-days" data-days="7">7 Days</button>
            <button type="button" class="btn btn-sm ${days === 30 ? "btn-primary" : "btn-outline"}" data-action="chart-days" data-days="30">30 Days</button>
          </div>
        </div>
        <svg viewBox="0 0 700 180" style="width:100%;height:180px;display:block;">
          ${buckets.map((b, i) => {
		const w = 680 / buckets.length;
		const barH = Math.max(4, Math.round(b.value / maxVal * 135));
		const x = 10 + i * w + w * .15;
		const y = 150 - barH;
		return `
              <rect x="${x}" y="${y}" width="${Math.max(4, w * .7)}" height="${barH}" rx="4" fill="var(--primary)">
                <title>${b.label}: ${formatPrice(b.value)}</title>
              </rect>
              ${days === 7 || i % 5 === 0 ? `<text x="${x + w * .35}" y="170" text-anchor="middle" font-size="10" fill="#6b7280">${b.label}</text>` : ""}
            `;
	}).join("")}
        </svg>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;">
        <div class="card-panel">
          <h2 style="margin:0 0 12px;font-size:1.05rem;">Best Selling Products</h2>
          <div style="display:grid;gap:10px;">
            ${bestSellers.map((p) => `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:0.88rem;padding-bottom:8px;border-bottom:1px solid var(--border);">
                <span style="font-weight:600;">${escHtml(p.name)}</span>
                <span class="tabular-nums" style="white-space:nowrap;color:var(--primary);font-weight:700;">${p.unitsSold || 0} sold · ${formatPrice((p.unitsSold || 0) * p.price)}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="card-panel">
          <h2 style="margin:0 0 12px;font-size:1.05rem;">Low Stock Alerts (&le; 5 units)</h2>
          ${lowStockList.length ? `<div style="display:grid;gap:8px;">
                ${lowStockList.map((p) => `
                  <div style="display:flex;justify-content:space-between;font-size:0.88rem;padding-bottom:6px;border-bottom:1px solid var(--border);">
                    <span>${escHtml(p.name)}</span>
                    <strong class="status-Pending">${p.stock} left</strong>
                  </div>
                `).join("")}
              </div>` : "<p style=\"color:var(--muted);font-size:0.9rem;\">All products have healthy inventory levels.</p>"}
        </div>
      </div>

      <div class="card-panel">
        <h2 style="margin:0 0 12px;font-size:1.05rem;">Latest 5 Orders</h2>
        ${latestOrders.length ? `<div class="admin-table-wrap" style="box-shadow:none;">
              <table class="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>District</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  ${latestOrders.map((o) => `
                    <tr>
                      <td class="tabular-nums"><strong>${escHtml(o.orderCode)}</strong></td>
                      <td>${escHtml(o.customerName)}<br><small style="color:var(--muted);">${escHtml(o.phone)}</small></td>
                      <td>${escHtml([
		o.upazila,
		o.district,
		o.division
	].filter(Boolean).join(", ") || o.district)}</td>
                      <td class="tabular-nums"><strong>${formatPrice(o.total)}</strong></td>
                      <td><span class="status-text status-${escHtml(o.status)}">${escHtml(o.status)}</span></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>` : "<p style=\"color:var(--muted);font-size:0.9rem;\">No customer orders yet. Orders placed on the storefront appear here in real time.</p>"}
      </div>
    </div>
  `;
}
function renderProductsTab() {
	const q = adminUiState.prodSearch.toLowerCase();
	const cat = adminUiState.prodCatFilter;
	const filtered = state.products.filter((p) => {
		const matchCat = cat === "All" || p.category === cat;
		const matchQ = !q || p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
		return matchCat && matchQ;
	});
	return `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;">
        <div style="display:flex;flex-wrap:wrap;gap:10px;flex:1;align-items:center;">
          <input class="field-input" id="admin-prod-search" style="max-width:260px;" placeholder="Search products..." value="${escHtml(adminUiState.prodSearch)}" />
          <div style="display:inline-flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <select class="field-select" id="admin-prod-cat" style="width:auto;min-width:185px;max-width:230px;">
              <option value="All">All Categories</option>
              ${state.categories.map((c) => `<option value="${escHtml(c.name)}" ${cat === c.name ? "selected" : ""}>${escHtml(c.name)}</option>`).join("")}
            </select>
            <button type="button" class="btn btn-sm btn-outline" data-action="admin-quick-edit-cat" title="Rename or edit a category">✏️ Edit Category</button>
          </div>
        </div>
        <button type="button" class="btn btn-accent" data-action="admin-add-product">+ Add Product</button>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Product</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${filtered.map((p) => {
		const st = getStockBadge(p.stock);
		return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img src="${escHtml(getProductImage(p, 0))}" alt="" style="width:44px;height:44px;border-radius:8px;object-fit:cover;background:var(--bg);" />
                      <div>
                        <strong>${escHtml(p.name)}</strong>
                        <div style="font-size:0.78rem;color:var(--muted);">${escHtml(p.category)} · ${escHtml(p.brand || "")}</div>
                      </div>
                    </div>
                  </td>
                  <td class="tabular-nums"><strong>${formatPrice(p.price)}</strong></td>
                  <td class="tabular-nums">${p.stock}</td>
                  <td class="tabular-nums">${p.unitsSold || 0}</td>
                  <td><span class="status-text ${st.cls}">${escHtml(st.label)}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button type="button" class="btn btn-sm btn-outline" data-action="admin-edit-product" data-id="${escHtml(p.id)}">Edit</button>
                      <button type="button" class="btn btn-sm btn-danger" data-action="admin-del-product" data-id="${escHtml(p.id)}">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
	}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderProductEditorModal(prodOrNew) {
	const isNew = prodOrNew === "new";
	const p = isNew ? {
		name: "",
		category: state.categories[0]?.name || "Phones",
		brand: "",
		price: 0,
		oldPrice: 0,
		stock: 10,
		unitsSold: 0,
		sku: "",
		rating: 4.8,
		reviewCount: 0,
		shortDescription: "",
		fullDescription: "",
		features: [],
		specs: [{
			key: "Warranty",
			value: "1 Year Official"
		}],
		options: [],
		tags: [],
		images: [
			"",
			"",
			"",
			"",
			""
		],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka ৳60 (24-48h). Outside Dhaka ৳120 (2-4 days).",
		returnPolicy: "7-day easy replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	} : prodOrNew;
	const imgs = Array.isArray(p.images) ? [
		...p.images,
		"",
		"",
		"",
		"",
		""
	].slice(0, 5) : [
		"",
		"",
		"",
		"",
		""
	];
	const specs = Array.isArray(p.specs) && p.specs.length ? p.specs : [{
		key: "",
		value: ""
	}];
	return `
    <div class="modal-overlay">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <h2 style="margin:0;">${isNew ? "Add New Product" : "Edit Product"}</h2>
          <button type="button" class="btn btn-sm btn-outline" data-action="admin-close-modal">Close</button>
        </div>

        <form id="admin-product-form" data-is-new="${isNew}" data-id="${escHtml(p.id || "")}" class="form-grid">
          <div class="form-row-2">
            <div><label class="field-label">Product Name *</label><input class="field-input" name="name" required value="${escHtml(p.name)}" /></div>
            <div><label class="field-label">Category *</label>
              <select class="field-select" name="category">
                ${state.categories.map((c) => `<option value="${escHtml(c.name)}" ${p.category === c.name ? "selected" : ""}>${escHtml(c.name)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div><label class="field-label">Brand</label><input class="field-input" name="brand" value="${escHtml(p.brand || "")}" /></div>
            <div><label class="field-label">SKU</label><input class="field-input" name="sku" value="${escHtml(p.sku || "")}" /></div>
          </div>

          <div class="form-row-2">
            <div><label class="field-label">Price (৳) *</label><input class="field-input" type="number" name="price" required min="0" value="${Number(p.price) || 0}" /></div>
            <div><label class="field-label">Old Price (৳)</label><input class="field-input" type="number" name="oldPrice" min="0" value="${Number(p.oldPrice) || 0}" /></div>
          </div>

          <div class="form-row-2">
            <div><label class="field-label">Stock Quantity *</label><input class="field-input" type="number" name="stock" required min="0" value="${Number(p.stock) || 0}" /></div>
            <div><label class="field-label">Rating (1.0 - 5.0)</label><input class="field-input" type="number" step="0.1" min="1" max="5" name="rating" value="${Number(p.rating) || 4.7}" /></div>
          </div>

          <div><label class="field-label">Short Description</label><input class="field-input" name="shortDescription" value="${escHtml(p.shortDescription || "")}" /></div>
          <div><label class="field-label">Full Description</label><textarea class="field-textarea" name="fullDescription">${escHtml(p.fullDescription || "")}</textarea></div>
          <div><label class="field-label">Key Features (one per line)</label><textarea class="field-textarea" name="features">${escHtml((p.features || []).join("\n"))}</textarea></div>

          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label class="field-label" style="margin:0;">Specifications</label>
              <button type="button" class="btn btn-sm btn-outline" data-action="add-spec-row">+ Add Row</button>
            </div>
            <div id="spec-rows-container" style="display:grid;gap:8px;">
              ${specs.map((s) => `
                <div class="spec-row" style="display:flex;gap:8px;">
                  <input class="field-input spec-key" placeholder="Spec name (e.g. Display)" value="${escHtml(s.key || "")}" />
                  <input class="field-input spec-val" placeholder="Value (e.g. 6.7&quot; AMOLED)" value="${escHtml(s.value || "")}" />
                  <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="form-row-2">
            <div><label class="field-label">Color / Size Options (comma-separated)</label><input class="field-input" name="options" value="${escHtml((p.options || []).join(", "))}" /></div>
            <div><label class="field-label">Tags (comma-separated)</label><input class="field-input" name="tags" value="${escHtml((p.tags || []).join(", "))}" /></div>
          </div>

          <div>
            <label class="field-label">Product Images (Up to 5 — Paste URL or Upload)</label>
            <div style="display:grid;gap:8px;">
              ${imgs.map((url, idx) => `
                <div style="display:flex;gap:8px;align-items:center;">
                  <input class="field-input prod-img-input" data-img-index="${idx}" placeholder="Image URL ${idx + 1}" value="${escHtml(url)}" />
                  <label class="btn btn-sm btn-outline" style="cursor:pointer;">
                    Upload <input type="file" accept="image/*" hidden data-upload-target="prod-img-${idx}" />
                  </label>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="form-row-2">
            <div>
              <label class="field-label">Product Video (MP4/WebM Upload or YouTube/FB URL)</label>
              <div style="display:flex;gap:8px;">
                <input class="field-input" name="videoUrl" id="prod-video-url" placeholder="https://youtube.com/... or .mp4" value="${escHtml(p.videoUrl || "")}" />
                <label class="btn btn-sm btn-outline" style="cursor:pointer;">
                  Upload <input type="file" accept="video/mp4,video/webm" hidden data-upload-target="prod-video" />
                </label>
              </div>
            </div>
            <div>
              <label class="field-label">Video Poster Image (Optional)</label>
              <div style="display:flex;gap:8px;">
                <input class="field-input" name="videoPoster" id="prod-video-poster" value="${escHtml(p.videoPoster || "")}" />
                <label class="btn btn-sm btn-outline" style="cursor:pointer;">
                  Upload <input type="file" accept="image/*" hidden data-upload-target="prod-poster" />
                </label>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:14px;padding:10px;background:var(--bg);border-radius:10px;">
            <label><input type="checkbox" name="isFeatured" ${p.isFeatured ? "checked" : ""} /> Featured</label>
            <label><input type="checkbox" name="isFlashSale" ${p.isFlashSale ? "checked" : ""} /> Flash Sale</label>
            <label><input type="checkbox" name="isTrending" ${p.isTrending ? "checked" : ""} /> Trending</label>
            <label><input type="checkbox" name="isNewArrival" ${p.isNewArrival ? "checked" : ""} /> New Arrival</label>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-outline" data-action="admin-close-modal">Cancel</button>
            <button type="submit" class="btn btn-accent">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function renderCategoriesTab() {
	return `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;">Categories (${state.categories.length})</h2>
        <button type="button" class="btn btn-accent" data-action="admin-add-cat">+ Add Category</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Order</th><th>Icon</th><th>English Name</th><th>Bangla Name</th><th>Actions</th></tr></thead>
          <tbody>
            ${state.categories.map((c, idx) => `
              <tr>
                <td class="tabular-nums">${c.sortOrder || idx + 1}</td>
                <td>${c.imageUrl ? `<img src="${escHtml(c.imageUrl)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />` : escHtml(c.icon || "🛍️")}</td>
                <td><strong>${escHtml(c.name)}</strong></td>
                <td style="font-family:'Hind Siliguri',sans-serif;">${escHtml(c.nameBn || "")}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button type="button" class="btn btn-sm btn-outline" data-action="cat-move" data-id="${escHtml(c.id)}" data-dir="-1">↑</button>
                    <button type="button" class="btn btn-sm btn-outline" data-action="cat-move" data-id="${escHtml(c.id)}" data-dir="1">↓</button>
                    <button type="button" class="btn btn-sm btn-outline" data-action="admin-edit-cat" data-id="${escHtml(c.id)}">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger" data-action="admin-del-cat" data-id="${escHtml(c.id)}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderCategoryEditorModal(catOrNew) {
	const isNew = catOrNew === "new";
	const c = isNew ? {
		name: "",
		nameBn: "",
		icon: "🛍️",
		imageUrl: "",
		sortOrder: state.categories.length + 1
	} : catOrNew;
	return `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width:500px;">
        <h2 style="margin:0 0 14px;">${isNew ? "Add Category" : "Edit Category"}</h2>
        <form id="admin-cat-form" data-is-new="${isNew}" data-id="${escHtml(c.id || "")}" class="form-grid">
          <div><label class="field-label">English Name *</label><input class="field-input" name="name" required value="${escHtml(c.name)}" /></div>
          <div><label class="field-label">Bangla Name</label><input class="field-input" name="nameBn" value="${escHtml(c.nameBn || "")}" /></div>
          <div class="form-row-2">
            <div><label class="field-label">Emoji Icon</label><input class="field-input" name="icon" value="${escHtml(c.icon || "🛍️")}" /></div>
            <div><label class="field-label">Sort Order</label><input class="field-input" type="number" name="sortOrder" value="${c.sortOrder || 1}" /></div>
          </div>
          <div>
            <label class="field-label">Category Image URL (Optional)</label>
            <div style="display:flex;gap:8px;">
              <input class="field-input" name="imageUrl" id="cat-img-url" value="${escHtml(c.imageUrl || "")}" />
              <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="cat-img" /></label>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-outline" data-action="admin-close-modal">Cancel</button>
            <button type="submit" class="btn btn-accent">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function renderQuickEditCategoryModal(selectedCatId) {
	if (!state.categories.length) {
		return `
      <div class="modal-overlay">
        <div class="modal-card" style="max-width:440px;text-align:center;">
          <h2 style="margin:0 0 10px;">Edit Category</h2>
          <p style="color:var(--muted);margin:0 0 16px;">No categories exist yet. Add a category first.</p>
          <button type="button" class="btn btn-primary" data-action="admin-close-modal">Close</button>
        </div>
      </div>
    `;
	}
	const activeCat = state.categories.find((c) => c.id === selectedCatId) || state.categories[0];
	const assignedCount = state.products.filter((p) => p.category === activeCat.name).length;
	return `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width:520px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <h2 style="margin:0;">Edit Category</h2>
          <button type="button" class="btn btn-sm btn-outline" data-action="admin-close-modal">Close</button>
        </div>
        <form id="admin-quick-cat-form" data-id="${escHtml(activeCat.id)}" class="form-grid">
          <div>
            <label class="field-label" for="quick-edit-cat-select">Select Existing Category *</label>
            <select class="field-select" id="quick-edit-cat-select" name="categoryId">
              ${state.categories.map((c) => `
                <option value="${escHtml(c.id)}" ${c.id === activeCat.id ? "selected" : ""}>
                  ${escHtml(c.icon || "🛍️")} ${escHtml(c.name)}${c.nameBn ? ` (${escHtml(c.nameBn)})` : ""}
                </option>
              `).join("")}
            </select>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:5px;">
              Currently assigned to <strong>${assignedCount}</strong> product${assignedCount === 1 ? "" : "s"}. Renaming updates all assigned products & filters automatically.
            </div>
          </div>

          <div>
            <label class="field-label" for="quick-cat-name">Category Title (English) *</label>
            <input class="field-input" id="quick-cat-name" name="name" required value="${escHtml(activeCat.name)}" />
          </div>

          <div class="form-row-2">
            <div>
              <label class="field-label" for="quick-cat-bn">Bangla Name</label>
              <input class="field-input" id="quick-cat-bn" name="nameBn" value="${escHtml(activeCat.nameBn || "")}" />
            </div>
            <div>
              <label class="field-label" for="quick-cat-icon">Emoji Icon</label>
              <input class="field-input" id="quick-cat-icon" name="icon" value="${escHtml(activeCat.icon || "🛍️")}" />
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
            <button type="button" class="btn btn-outline" data-action="admin-close-modal">Cancel</button>
            <button type="submit" class="btn btn-accent">Save Category Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function renderConfirmDeleteModal(cfg) {
	return `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width:440px;">
        <h2 style="margin:0 0 8px;font-size:1.2rem;color:#b91c1c;">${escHtml(cfg.title || "Confirm Delete")}</h2>
        <p style="margin:0 0 20px;color:var(--text);font-size:0.93rem;line-height:1.5;">${escHtml(cfg.message || "Are you sure you want to delete this item? This action cannot be undone.")}</p>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" class="btn btn-outline" data-action="admin-cancel-delete">Cancel</button>
          <button type="button" class="btn btn-danger" data-action="admin-confirm-delete">${escHtml(cfg.confirmLabel || "Delete")}</button>
        </div>
      </div>
    </div>
  `;
}
function renderOrdersTab() {
	const statuses = [
		"Pending",
		"Confirmed",
		"Shipped",
		"Delivered",
		"Cancelled"
	];
	return `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <h2 style="margin:0;">Orders (${state.orders.length})</h2>
        <span style="font-size:0.85rem;color:var(--muted);">Real-time Sync · Division / District / Upazila Verified · Cancelling restores stock</span>
      </div>
      ${state.orders.length ? `<div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Order</th><th>Customer & Full Shipping Address</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${state.orders.map((o) => {
		const fullArea = [
			o.upazila,
			o.district,
			o.division
		].filter(Boolean).join(", ");
		const hasCoords = typeof o.mapLat === "number" && typeof o.mapLng === "number";
		return `
                    <tr>
                      <td class="tabular-nums"><strong>${escHtml(o.orderCode)}</strong><br><small style="color:var(--muted);">${new Date(getOrderTimestamp(o)).toLocaleDateString()}</small></td>
                      <td>
                        <strong>${escHtml(o.customerName)}</strong><br>${escHtml(o.phone)}<br>
                        <small style="color:var(--muted);">${escHtml(o.address)}${fullArea ? `, ${escHtml(fullArea)}` : ""}</small>
                        ${hasCoords ? `<div><a href="https://www.openstreetmap.org/?mlat=${o.mapLat}&mlon=${o.mapLng}#map=16/${o.mapLat}/${o.mapLng}" target="_blank" rel="noopener" style="font-size:0.74rem;color:var(--primary);font-weight:600;">📍 Map Pin (${o.mapLat.toFixed(4)}, ${o.mapLng.toFixed(4)})</a></div>` : ""}
                      </td>
                      <td>${(o.items || []).map((i) => `<div>${escHtml(i.name)} × ${i.qty}</div>`).join("")}</td>
                      <td class="tabular-nums"><strong>${formatPrice(o.total)}</strong></td>
                      <td>${escHtml(o.paymentMethod)}${o.paymentNumber ? `<br><small>${escHtml(o.paymentNumber)}</small>` : ""}</td>
                      <td>
                        <select class="field-select order-status-select" data-id="${escHtml(o.id)}" style="min-height:38px;font-size:0.84rem;">
                          ${statuses.map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
                        </select>
                      </td>
                      <td><button type="button" class="btn btn-sm btn-danger" data-action="admin-del-order" data-id="${escHtml(o.id)}">Delete</button></td>
                    </tr>
                  `;
	}).join("")}
              </tbody>
            </table>
          </div>` : "<div class=\"card-panel\" style=\"text-align:center;padding:36px;\">No orders yet. Place a test order from the storefront checkout to see live updates here!</div>"}
    </div>
  `;
}
function renderBlogTab() {
	return `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <h2 style="margin:0;">Blog Posts (${state.posts.length})</h2>
        <button type="button" class="btn btn-accent" data-action="admin-add-post">+ Write Post</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Title & Issue Alerts</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${state.posts.map((p) => {
		const isIncomplete = !p.body || p.body.trim().length < 20 || !p.excerpt;
		return `
                <tr>
                  <td>
                    <strong>${escHtml(p.title)}</strong>
                    ${p.issueFlag ? `<div style="margin-top:4px;font-size:0.76rem;color:#b91c1c;font-weight:600;">🚩 Flagged Issue${p.issueNote ? `: ${escHtml(p.issueNote)}` : ""}</div>` : ""}
                    ${isIncomplete ? `<div style="margin-top:2px;font-size:0.76rem;color:#b45309;font-weight:600;">⚠️ Incomplete content or excerpt</div>` : ""}
                  </td>
                  <td>${escHtml(p.category)}</td>
                  <td><span class="status-text ${p.published !== false ? "status-Confirmed" : "status-Pending"}">${p.published !== false ? "Published" : "Draft"}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                      ${p.issueFlag ? `<button type="button" class="btn btn-sm btn-outline" data-action="admin-clear-post-issue" data-id="${escHtml(p.id)}">Resolve</button>` : ""}
                      <button type="button" class="btn btn-sm btn-outline" data-action="admin-edit-post" data-id="${escHtml(p.id)}">Edit</button>
                      <button type="button" class="btn btn-sm btn-danger" data-action="admin-del-post" data-id="${escHtml(p.id)}">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
	}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderPostEditorModal(postOrNew) {
	const isNew = postOrNew === "new";
	const p = isNew ? {
		title: "",
		category: "Buying Guide",
		coverImage: "",
		excerpt: "",
		body: "",
		tags: [],
		published: true,
		issueFlag: false,
		issueNote: ""
	} : postOrNew;
	return `
    <div class="modal-overlay">
      <div class="modal-card">
        <h2 style="margin:0 0 14px;">${isNew ? "Write Blog Post" : "Edit Blog Post"}</h2>
        <form id="admin-post-form" data-is-new="${isNew}" data-id="${escHtml(p.id || "")}" class="form-grid">
          <div class="form-row-2">
            <div><label class="field-label">Post Title *</label><input class="field-input" name="title" required value="${escHtml(p.title)}" /></div>
            <div><label class="field-label">Category</label><input class="field-input" name="category" value="${escHtml(p.category || "Buying Guide")}" /></div>
          </div>
          <div>
            <label class="field-label">Cover Image URL or Upload</label>
            <div style="display:flex;gap:8px;">
              <input class="field-input" name="coverImage" id="post-cover-url" value="${escHtml(p.coverImage || "")}" />
              <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="post-cover" /></label>
            </div>
          </div>
          <div><label class="field-label">Short Excerpt</label><input class="field-input" name="excerpt" value="${escHtml(p.excerpt || "")}" /></div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label class="field-label" style="margin:0;">Body (Rich HTML supported)</label>
              <div style="display:flex;gap:6px;">
                <button type="button" class="btn btn-sm btn-outline" data-action="rich-tag" data-tag="strong">Bold</button>
                <button type="button" class="btn btn-sm btn-outline" data-action="rich-tag" data-tag="h3">Heading</button>
                <button type="button" class="btn btn-sm btn-outline" data-action="rich-tag" data-tag="p">Paragraph</button>
              </div>
            </div>
            <textarea class="field-textarea" id="post-body-textarea" name="body" style="min-height:180px;">${escHtml(p.body || "")}</textarea>
          </div>
          <div class="form-row-2">
            <div><label class="field-label">Tags (comma-separated)</label><input class="field-input" name="tags" value="${escHtml((p.tags || []).join(", "))}" /></div>
            <div style="display:flex;align-items:center;gap:16px;padding-top:22px;flex-wrap:wrap;">
              <label><input type="checkbox" name="published" ${p.published !== false ? "checked" : ""} /> Published on Storefront</label>
              <label style="color:#b91c1c;"><input type="checkbox" name="issueFlag" ${p.issueFlag ? "checked" : ""} /> Flag Issue</label>
            </div>
          </div>
          <div>
            <label class="field-label">Issue / Editorial Note (Optional)</label>
            <input class="field-input" name="issueNote" placeholder="Describe issue to resolve..." value="${escHtml(p.issueNote || "")}" />
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-outline" data-action="admin-close-modal">Cancel</button>
            <button type="submit" class="btn btn-accent">Save Post</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function renderReviewsTab() {
	const filter = adminUiState.reviewFilter || "all";
	const filtered = state.reviews.filter((r) => {
		if (filter === "approved") return r.approved !== false;
		if (filter === "hidden") return r.approved === false;
		return true;
	});
	return `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <h2 style="margin:0;">Customer Reviews & Ratings (${state.reviews.length})</h2>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}" data-action="admin-review-filter" data-filter="all">All (${state.reviews.length})</button>
            <button type="button" class="btn btn-sm ${filter === "approved" ? "btn-primary" : "btn-outline"}" data-action="admin-review-filter" data-filter="approved">Approved (${state.reviews.filter((r) => r.approved !== false).length})</button>
            <button type="button" class="btn btn-sm ${filter === "hidden" ? "btn-primary" : "btn-outline"}" data-action="admin-review-filter" data-filter="hidden">Hidden (${state.reviews.filter((r) => r.approved === false).length})</button>
          </div>
        </div>
        <button type="button" class="btn btn-accent" data-action="admin-add-review">+ Add Review</button>
      </div>

      ${filtered.length ? `<div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review Comment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${filtered.map((r) => {
		const isApproved = r.approved !== false;
		const stars = "★".repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)));
		return `
                    <tr>
                      <td><strong>${escHtml(r.authorName)}</strong><br><small style="color:var(--muted);">${escHtml(r.city || "Bangladesh")}</small></td>
                      <td>${escHtml(r.productName || "General Store")}</td>
                      <td><span style="color:var(--amber);font-size:0.95rem;">${stars}</span> <small class="tabular-nums">(${r.rating}/5)</small></td>
                      <td style="max-width:340px;">${escHtml(r.comment || "")}</td>
                      <td><span class="status-text ${isApproved ? "status-Confirmed" : "status-Pending"}">${isApproved ? "Approved" : "Hidden"}</span></td>
                      <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                          <button type="button" class="btn btn-sm btn-outline" data-action="admin-toggle-review" data-id="${escHtml(r.id)}">${isApproved ? "Hide" : "Approve"}</button>
                          <button type="button" class="btn btn-sm btn-outline" data-action="admin-edit-review" data-id="${escHtml(r.id)}">Edit</button>
                          <button type="button" class="btn btn-sm btn-danger" data-action="admin-del-review" data-id="${escHtml(r.id)}">Delete</button>
                        </div>
                      </td>
                    </tr>
                  `;
	}).join("")}
              </tbody>
            </table>
          </div>` : `<div class="card-panel" style="text-align:center;padding:36px;">No reviews match this filter yet.</div>`}
    </div>
  `;
}
function renderReviewEditorModal(revOrNew) {
	const isNew = revOrNew === "new";
	const r = isNew ? {
		productId: state.products[0]?.id || "",
		productName: state.products[0]?.name || "",
		authorName: "",
		city: "Dhaka",
		rating: 5,
		comment: "",
		approved: true
	} : revOrNew;
	return `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width:560px;">
        <h2 style="margin:0 0 14px;">${isNew ? "Add Customer Review" : "Edit Customer Review"}</h2>
        <form id="admin-review-form" data-is-new="${isNew}" data-id="${escHtml(r.id || "")}" class="form-grid">
          <div>
            <label class="field-label">Product</label>
            <select class="field-select" name="productId">
              <option value="">General Store Review</option>
              ${state.products.map((p) => `<option value="${escHtml(p.id)}" ${r.productId === p.id ? "selected" : ""}>${escHtml(p.name)}</option>`).join("")}
            </select>
          </div>
          <div class="form-row-2">
            <div><label class="field-label">Customer Name *</label><input class="field-input" name="authorName" required value="${escHtml(r.authorName || "")}" /></div>
            <div><label class="field-label">City / District</label><input class="field-input" name="city" value="${escHtml(r.city || "Dhaka")}" /></div>
          </div>
          <div class="form-row-2">
            <div>
              <label class="field-label">Rating *</label>
              <select class="field-select" name="rating">
                ${[
		5,
		4,
		3,
		2,
		1
	].map((n) => `<option value="${n}" ${Number(r.rating) === n ? "selected" : ""}>${"★".repeat(n)} (${n}/5)</option>`).join("")}
              </select>
            </div>
            <div style="display:flex;align-items:center;padding-top:24px;">
              <label><input type="checkbox" name="approved" ${r.approved !== false ? "checked" : ""} /> Approved (Visible on Storefront)</label>
            </div>
          </div>
          <div>
            <label class="field-label">Review Comment *</label>
            <textarea class="field-textarea" name="comment" required>${escHtml(r.comment || "")}</textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-outline" data-action="admin-close-modal">Cancel</button>
            <button type="submit" class="btn btn-accent">Save Review</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
function renderBannersThemeTab() {
	const t = state.theme || SEED_THEME_SETTINGS;
	return `
    <form id="admin-theme-form" class="form-grid" style="gap:20px;">
      <div class="card-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="margin:0;font-size:1.1rem;">Theme Colors (Live Update)</h2>
          <button type="button" class="btn btn-sm btn-outline" data-action="reset-theme-colors">Reset Defaults</button>
        </div>
        <div class="form-row-2" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
          <div><label class="field-label">Primary Color</label><input type="color" class="field-input" name="primaryColor" value="${escHtml(t.primaryColor || "#0F766E")}" style="padding:4px;" /></div>
          <div><label class="field-label">Accent Color</label><input type="color" class="field-input" name="accentColor" value="${escHtml(t.accentColor || "#FF6B57")}" style="padding:4px;" /></div>
          <div><label class="field-label">Background Color</label><input type="color" class="field-input" name="bgColor" value="${escHtml(t.bgColor || "#FAF8F5")}" style="padding:4px;" /></div>
        </div>
      </div>

      <div class="card-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <h2 style="margin:0;font-size:1.1rem;">Hero Slides (${(t.heroSlides || []).length})</h2>
            <p style="margin:2px 0 0;font-size:0.82rem;color:var(--muted);">Supports touch &amp; mouse swipe, custom animations, and optional animated Featured Product showcase inside each slide.</p>
          </div>
          <button type="button" class="btn btn-sm btn-outline" data-action="add-hero-slide">+ Add Slide</button>
        </div>
        <div id="hero-slides-list" style="display:grid;gap:14px;">
          ${(t.heroSlides || []).map((s, idx) => `
            <div class="hero-slide-editor" style="padding:14px;background:var(--bg);border-radius:12px;display:grid;gap:10px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>Slide ${idx + 1}</strong>
                <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.hero-slide-editor').remove()">Remove</button>
              </div>
              <div class="form-row-2">
                <input class="field-input hs-headline" placeholder="Headline" value="${escHtml(s.headline || "")}" />
                <input class="field-input hs-kicker" placeholder="Kicker (top label)" value="${escHtml(s.kicker || "")}" />
              </div>
              <input class="field-input hs-subtext" placeholder="Subtext" value="${escHtml(s.subtext || "")}" />
              <div class="form-row-2">
                <input class="field-input hs-btn-text" placeholder="Button Text" value="${escHtml(s.buttonText || "Shop Now")}" />
                <input class="field-input hs-btn-link" placeholder="Button Link (e.g. #deals)" value="${escHtml(s.buttonLink || "#deals")}" />
              </div>
              <div class="form-row-2" style="grid-template-columns:repeat(auto-fit,minmax(175px,1fr));">
                <div>
                  <label class="field-label">Animated Featured Product</label>
                  <select class="field-select hs-product">
                    <option value="">None (Banner Image Only)</option>
                    ${state.products.map((p) => `
                      <option value="${escHtml(p.id)}" ${String(s.featuredProductId || "") === String(p.id) ? "selected" : ""}>
                        ${escHtml(p.name)} (${formatPrice(p.price)})
                      </option>
                    `).join("")}
                  </select>
                </div>
                <div>
                  <label class="field-label">Highlight Badge Text</label>
                  <input class="field-input hs-badge" placeholder="e.g. Flash Deal · Save ৳2,500" value="${escHtml(s.badgeText || "")}" />
                </div>
                <div>
                  <label class="field-label">Slide Transition Style</label>
                  <select class="field-select hs-anim">
                    <option value="glide" ${!s.animStyle || s.animStyle === "glide" || s.animStyle === "float" ? "selected" : ""}>Smooth Parallax Glide</option>
                    <option value="zoom" ${s.animStyle === "zoom" ? "selected" : ""}>Cinematic Slow Zoom</option>
                    <option value="fade" ${s.animStyle === "fade" || s.animStyle === "pulse" ? "selected" : ""}>Soft Editorial Reveal</option>
                    <option value="orbit" ${s.animStyle === "orbit" ? "selected" : ""}>Gentle Depth Drift</option>
                  </select>
                </div>
              </div>
              <div style="display:flex;gap:8px;">
                <input class="field-input hs-img" id="hs-img-${idx}" placeholder="Background / Banner Image URL" value="${escHtml(s.imageUrl || "")}" />
                <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="hs-img-${idx}" /></label>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="card-panel">
        <h2 style="margin:0 0 12px;font-size:1.1rem;">Promo Banner Tiles</h2>
        <div style="display:grid;gap:14px;">
          ${(t.promoTiles || []).map((pt, idx) => `
            <div class="promo-tile-editor" style="padding:14px;background:var(--bg);border-radius:12px;display:grid;gap:10px;">
              <strong>Promo Tile ${idx + 1}</strong>
              <div class="form-row-2">
                <input class="field-input pt-title" placeholder="Title" value="${escHtml(pt.title || "")}" />
                <input class="field-input pt-sub" placeholder="Subtext" value="${escHtml(pt.subtext || "")}" />
              </div>
              <div class="form-row-2">
                <input class="field-input pt-btn" placeholder="Button Text" value="${escHtml(pt.buttonText || "Explore")}" />
                <input class="field-input pt-link" placeholder="Link" value="${escHtml(pt.link || "#deals")}" />
              </div>
              <div style="display:flex;gap:8px;">
                <input class="field-input pt-img" id="pt-img-${idx}" placeholder="Image URL" value="${escHtml(pt.imageUrl || "")}" />
                <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="pt-img-${idx}" /></label>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <button type="submit" class="btn btn-accent">Save Banners & Theme</button>
    </form>
  `;
}
function renderBrandingTab() {
	const g = state.general || SEED_GENERAL_SETTINGS;
	return `
    <form id="admin-branding-form" class="card-panel form-grid">
      <h2 style="margin:0;">Logo & Branding</h2>
      <div class="form-row-2">
        <div>
          <label class="field-label">Logo URL (leave empty for styled "Pazaro BD" text)</label>
          <div style="display:flex;gap:8px;">
            <input class="field-input" name="logoUrl" id="brand-logo-url" value="${escHtml(g.logoUrl || "")}" />
            <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="brand-logo" /></label>
          </div>
        </div>
        <div>
          <label class="field-label">Favicon URL</label>
          <div style="display:flex;gap:8px;">
            <input class="field-input" name="faviconUrl" id="brand-fav-url" value="${escHtml(g.faviconUrl || "")}" />
            <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="brand-fav" /></label>
          </div>
        </div>
      </div>
      <div class="form-row-2">
        <div><label class="field-label">Site Name</label><input class="field-input" name="siteName" value="${escHtml(g.siteName || "Pazaro BD")}" /></div>
        <div><label class="field-label">Tagline</label><input class="field-input" name="tagline" value="${escHtml(g.tagline || "Your Bazaar, Smarter")}" /></div>
      </div>
      <div class="form-row-2">
        <div><label class="field-label">Phone</label><input class="field-input" name="phone" value="${escHtml(g.phone || "")}" /></div>
        <div><label class="field-label">WhatsApp Number (digits with 880)</label><input class="field-input" name="whatsapp" value="${escHtml(g.whatsapp || "")}" /></div>
      </div>
      <div class="form-row-2">
        <div><label class="field-label">Support Email</label><input class="field-input" name="email" value="${escHtml(g.email || "")}" /></div>
        <div><label class="field-label">Office Address</label><input class="field-input" name="address" value="${escHtml(g.address || "")}" /></div>
      </div>
      <div class="form-row-2" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
        <div><label class="field-label">Facebook URL</label><input class="field-input" name="facebookUrl" value="${escHtml(g.facebookUrl || "")}" /></div>
        <div><label class="field-label">Instagram URL</label><input class="field-input" name="instagramUrl" value="${escHtml(g.instagramUrl || "")}" /></div>
        <div><label class="field-label">YouTube URL</label><input class="field-input" name="youtubeUrl" value="${escHtml(g.youtubeUrl || "")}" /></div>
      </div>
      <button type="submit" class="btn btn-accent">Save Branding</button>
    </form>
  `;
}
function renderAdsTab() {
	const slots = state.ads?.slots || SEED_ADS_SETTINGS.slots;
	const meta = [
		{
			key: "ad_hero_leaderboard",
			label: "Hero Leaderboard (Below Hero Slider)"
		},
		{
			key: "ad_mid_rectangle",
			label: "Mid-Page Rectangle (Between Scrollers)"
		},
		{
			key: "ad_footer_banner",
			label: "Footer Banner (Above Footer)"
		},
		{
			key: "ad_side_left",
			label: "Desktop Left Side Rail (Hidden on Mobile)"
		},
		{
			key: "ad_side_right",
			label: "Desktop Right Side Rail (Hidden on Mobile)"
		},
		{
			key: "ad_product_page",
			label: "Product Detail Page Ad Slot"
		},
		{
			key: "ad_blog_post",
			label: "Blog Post Ad Slot"
		}
	];
	return `
    <form id="admin-ads-form" class="form-grid">
      <div class="card-panel">
        <h2 style="margin:0 0 6px;">Ad Spaces Manager</h2>
        <p style="margin:0 0 14px;color:var(--muted);font-size:0.88rem;">Empty or switched-off slots collapse cleanly to zero space on the storefront.</p>
        <div style="display:grid;gap:14px;">
          ${meta.map((m) => {
		const s = slots[m.key] || {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		};
		return `
              <div class="ad-slot-editor" data-slot="${m.key}" style="padding:14px;background:var(--bg);border-radius:12px;display:grid;gap:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong>${escHtml(m.label)}</strong>
                  <label><input type="checkbox" class="ad-enabled" ${s.enabled ? "checked" : ""} /> Enabled</label>
                </div>
                <div class="form-row-2">
                  <div style="display:flex;gap:8px;">
                    <input class="field-input ad-img" id="ad-img-${m.key}" placeholder="Banner Image URL" value="${escHtml(s.imageUrl || "")}" />
                    <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="ad-img-${m.key}" /></label>
                  </div>
                  <input class="field-input ad-link" placeholder="Click Target URL" value="${escHtml(s.linkUrl || "")}" />
                </div>
                <textarea class="field-textarea ad-html" style="min-height:68px;" placeholder="Or paste custom Ad Network HTML/script snippet...">${escHtml(s.htmlCode || "")}</textarea>
              </div>
            `;
	}).join("")}
        </div>
        <button type="submit" class="btn btn-accent" style="margin-top:16px;">Save Ad Settings</button>
      </div>
    </form>
  `;
}
function renderSettingsTab() {
	const g = state.general || SEED_GENERAL_SETTINGS;
	return `
    <div style="display:grid;gap:20px;">
      <form id="admin-settings-form" class="card-panel form-grid">
        <h2 style="margin:0;">Storefront & Delivery Settings</h2>
        <div class="form-row-2">
          <div><label class="field-label">Inside Dhaka Delivery (৳)</label><input class="field-input" type="number" min="0" name="insideDhakaFee" value="${Number(g.insideDhakaFee ?? 60)}" /></div>
          <div><label class="field-label">Outside Dhaka Delivery (৳)</label><input class="field-input" type="number" min="0" name="outsideDhakaFee" value="${Number(g.outsideDhakaFee ?? 120)}" /></div>
        </div>
        <div class="form-row-2">
          <div><label class="field-label">Free Delivery Minimum Order (৳, 0 = off)</label><input class="field-input" type="number" min="0" name="freeDeliveryMin" value="${Number(g.freeDeliveryMin ?? 5e3)}" /></div>
          <div><label class="field-label">Currency Symbol</label><input class="field-input" name="currencySymbol" value="${escHtml(g.currencySymbol || "৳")}" /></div>
        </div>

        <hr style="border:0;border-top:1px solid var(--border);margin:4px 0;" />
        <h3 style="margin:0;font-size:1rem;">Checkout Interactive Map & Auto-Fill Settings</h3>
        <div>
          <label style="display:inline-flex;align-items:center;gap:8px;font-weight:600;">
            <input type="checkbox" name="mapEnabled" ${g.mapEnabled !== false ? "checked" : ""} /> Enable Interactive Checkout Map Picker & GPS Auto-Fill
          </label>
        </div>
        <div class="form-row-2">
          <div>
            <label class="field-label">Map Tile Provider</label>
            <select class="field-select" name="mapProvider">
              <option value="osm" ${(g.mapProvider || "osm") === "osm" ? "selected" : ""}>OpenStreetMap Standard</option>
              <option value="osm-hot" ${g.mapProvider === "osm-hot" ? "selected" : ""}>OpenStreetMap HOT</option>
              <option value="carto" ${g.mapProvider === "carto" ? "selected" : ""}>Carto Voyager Clean</option>
            </select>
          </div>
          <div>
            <label class="field-label">Default Map Zoom Level (6 - 18)</label>
            <input class="field-input" type="number" min="6" max="18" name="mapDefaultZoom" value="${Number(g.mapDefaultZoom ?? 12)}" />
          </div>
        </div>
        <div class="form-row-2">
          <div><label class="field-label">Default Map Center Latitude</label><input class="field-input" type="number" step="0.0001" name="mapDefaultLat" value="${Number(g.mapDefaultLat ?? 23.8103)}" /></div>
          <div><label class="field-label">Default Map Center Longitude</label><input class="field-input" type="number" step="0.0001" name="mapDefaultLng" value="${Number(g.mapDefaultLng ?? 90.4125)}" /></div>
        </div>

        <hr style="border:0;border-top:1px solid var(--border);margin:4px 0;" />
        <div><label class="field-label">Footer Copyright Text</label><input class="field-input" name="footerText" value="${escHtml(g.footerText || "")}" /></div>
        <div>
          <label style="display:inline-flex;align-items:center;gap:8px;font-weight:600;">
            <input type="checkbox" name="maintenanceMode" ${g.maintenanceMode ? "checked" : ""} /> Enable Maintenance Mode on Public Storefront
          </label>
        </div>
        <button type="submit" class="btn btn-accent">Save Settings</button>
      </form>

      <form id="admin-add-uid-form" class="card-panel form-grid">
        <h2 style="margin:0;">Grant Additional Admin Access</h2>
        <p style="margin:0;color:var(--muted);font-size:0.86rem;">Add a Firebase Auth User UID so another team member can log into /admin.</p>
        <div class="form-row-2">
          <input class="field-input" id="grant-uid" required placeholder="Firebase User UID" />
          <input class="field-input" id="grant-email" type="email" required placeholder="Admin Email" />
        </div>
        <button type="submit" class="btn btn-primary">Grant Admin Role</button>
      </form>
    </div>
  `;
}
function renderBackupTab() {
	return `
    <div style="display:grid;gap:18px;">
      <div class="card-panel">
        <h2 style="margin:0 0 8px;">Download Full Source Package</h2>
        <p style="margin:0 0 14px;color:var(--muted);font-size:0.9rem;">
          Download a complete static ZIP archive (HTML, CSS, Vanilla JS, Firebase Config, _redirects & README) ready for GitHub, Netlify, or Cloudflare Pages.
        </p>
        <button type="button" class="btn btn-accent" data-action="download-zip">📦 Download Full Source Package (.zip)</button>
      </div>

      <div class="card-panel">
        <h2 style="margin:0 0 8px;">CSV Data Exports & Demo Sync</h2>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <button type="button" class="btn btn-primary" data-action="export-products-csv">Export Products CSV</button>
          <button type="button" class="btn btn-primary" data-action="export-orders-csv">Export Orders CSV</button>
          <button type="button" class="btn btn-outline" data-action="seed-demo-now">Sync Demo Data to Firestore</button>
        </div>
      </div>
    </div>
  `;
}
export function exportCsv(filename, headers, rows) {
	const esc = (v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
	const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
	const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export async function handleAdminAction(action, el) {
	if (action === "admin-toggle-menu") {
		adminUiState.mobileMenuOpen = !adminUiState.mobileMenuOpen;
		return true;
	}
	if (action === "admin-close-menu") {
		adminUiState.mobileMenuOpen = false;
		return true;
	}
	if (action === "admin-tab") {
		adminUiState.tab = el.dataset.tab;
		adminUiState.mobileMenuOpen = false;
		if (adminUiState.tab === "orders") {
			markOrdersSeen();
		}
		return true;
	}
	if (action === "toggle-pass-vis") {
		adminUiState.showPass = !adminUiState.showPass;
		const passInput = document.getElementById("admin-pass");
		if (passInput && passInput instanceof HTMLInputElement) {
			passInput.type = adminUiState.showPass ? "text" : "password";
			el.textContent = adminUiState.showPass ? "Hide" : "Show";
		}
		return false;
	}
	if (action === "admin-google-login") {
		try {
			adminUiState.loginError = "";
			await loginAdminGoogle();
		} catch (err) {
			adminUiState.loginError = err.message || "Google sign-in failed.";
		}
		return true;
	}
	if (action === "admin-send-verify") {
		try {
			await sendAdminVerificationEmail();
		} catch (err) {
			showToast(err.message || "Could not send verification email.", true);
		}
		return true;
	}
	if (action === "admin-refresh-verify") {
		try {
			await refreshAuthVerification();
		} catch (err) {
			showToast(err.message || "Could not refresh verification status.", true);
		}
		return true;
	}
	if (action === "admin-firebase-signout") {
		await logoutAdmin();
		return true;
	}
	if (action === "admin-logout") {
		await logoutAdmin();
		signOutCustomer();
		window.history.pushState({}, "", "/");
		window.location.hash = "home";
		return true;
	}
	if (action === "chart-days") {
		adminUiState.chartDays = Number(el.dataset.days) || 7;
		return true;
	}
	if (action === "admin-add-product") {
		adminUiState.editingProduct = "new";
		return true;
	}
	if (action === "admin-edit-product") {
		adminUiState.editingProduct = state.products.find((p) => p.id === el.dataset.id) || null;
		return true;
	}
	if (action === "admin-del-product") {
		const p = state.products.find((item) => String(item.id) === String(el.dataset.id));
		if (p) {
			adminUiState.confirmDialog = {
				kind: "product",
				id: p.id,
				title: "Delete Product",
				message: `Delete "${p.name}" permanently? It will be removed from the storefront catalog and active carts.`,
				confirmLabel: "Yes, Delete Product"
			};
		}
		return true;
	}
	if (action === "admin-quick-edit-cat") {
		const activeName = adminUiState.prodCatFilter && adminUiState.prodCatFilter !== "All" ? adminUiState.prodCatFilter : "";
		const match = activeName && state.categories.find((c) => c.name === activeName) || state.categories[0];
		adminUiState.quickEditCategoryId = match ? match.id : "";
		if (!match) showToast("No categories available to edit yet.", true);
		return true;
	}
	if (action === "admin-add-cat") {
		adminUiState.editingCategory = "new";
		return true;
	}
	if (action === "admin-edit-cat") {
		adminUiState.editingCategory = state.categories.find((c) => c.id === el.dataset.id) || null;
		return true;
	}
	if (action === "admin-del-cat") {
		const c = state.categories.find((item) => item.id === el.dataset.id);
		if (c) {
			adminUiState.confirmDialog = {
				kind: "category",
				id: c.id,
				title: "Delete Category",
				message: `Delete category "${c.name}"?`,
				confirmLabel: "Yes, Delete Category"
			};
		}
		return true;
	}
	if (action === "cat-move") {
		const idx = state.categories.findIndex((c) => c.id === el.dataset.id);
		const dir = Number(el.dataset.dir);
		const swapIdx = idx + dir;
		if (idx >= 0 && swapIdx >= 0 && swapIdx < state.categories.length) {
			const a = state.categories[idx];
			const b = state.categories[swapIdx];
			await saveCategory({
				...a,
				sortOrder: swapIdx + 1
			}, false);
			await saveCategory({
				...b,
				sortOrder: idx + 1
			}, false);
		}
		return true;
	}
	if (action === "admin-del-order") {
		adminUiState.confirmDialog = {
			kind: "order",
			id: el.dataset.id,
			title: "Delete Order",
			message: "Delete this order permanently?",
			confirmLabel: "Yes, Delete Order"
		};
		return true;
	}
	if (action === "admin-add-post") {
		adminUiState.editingPost = "new";
		return true;
	}
	if (action === "admin-edit-post") {
		adminUiState.editingPost = state.posts.find((p) => p.id === el.dataset.id) || null;
		return true;
	}
	if (action === "admin-clear-post-issue") {
		const p = state.posts.find((item) => item.id === el.dataset.id);
		if (p) {
			await savePost({
				...p,
				issueFlag: false,
				issueNote: ""
			}, false);
		}
		return true;
	}
	if (action === "admin-del-post") {
		adminUiState.confirmDialog = {
			kind: "post",
			id: el.dataset.id,
			title: "Delete Blog Post",
			message: "Delete this blog post permanently?",
			confirmLabel: "Yes, Delete Post"
		};
		return true;
	}
	if (action === "admin-review-filter") {
		adminUiState.reviewFilter = el.dataset.filter || "all";
		return true;
	}
	if (action === "admin-add-review") {
		adminUiState.editingReview = "new";
		return true;
	}
	if (action === "admin-edit-review") {
		adminUiState.editingReview = state.reviews.find((r) => r.id === el.dataset.id) || null;
		return true;
	}
	if (action === "admin-toggle-review") {
		await toggleReviewApproval(el.dataset.id);
		return true;
	}
	if (action === "admin-del-review") {
		adminUiState.confirmDialog = {
			kind: "review",
			id: el.dataset.id,
			title: "Delete Review",
			message: "Delete this customer review permanently?",
			confirmLabel: "Yes, Delete Review"
		};
		return true;
	}
	if (action === "admin-cancel-delete") {
		adminUiState.confirmDialog = null;
		return true;
	}
	if (action === "admin-confirm-delete") {
		const cfg = adminUiState.confirmDialog;
		adminUiState.confirmDialog = null;
		if (!cfg) return true;
		try {
			if (cfg.kind === "product") await deleteProduct(cfg.id);
			else if (cfg.kind === "category") await deleteCategory(cfg.id);
			else if (cfg.kind === "order") await deleteOrder(cfg.id);
			else if (cfg.kind === "post") await deletePost(cfg.id);
			else if (cfg.kind === "review") await deleteReview(cfg.id);
		} catch (err) {
			showToast(err.message || "Delete failed.", true);
		}
		return true;
	}
	if (action === "admin-close-modal") {
		adminUiState.editingProduct = null;
		adminUiState.editingCategory = null;
		adminUiState.quickEditCategoryId = "";
		adminUiState.confirmDialog = null;
		adminUiState.editingPost = null;
		adminUiState.editingReview = null;
		return true;
	}
	if (action === "add-spec-row") {
		const box = document.getElementById("spec-rows-container");
		if (box) {
			const row = document.createElement("div");
			row.className = "spec-row";
			row.style.cssText = "display:flex;gap:8px;";
			row.innerHTML = `
        <input class="field-input spec-key" placeholder="Spec name" />
        <input class="field-input spec-val" placeholder="Spec value" />
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>
      `;
			box.appendChild(row);
		}
		return false;
	}
	if (action === "rich-tag") {
		const ta = document.getElementById("post-body-textarea");
		const tag = el.dataset.tag;
		if (ta && tag) {
			const start = ta.selectionStart;
			const end = ta.selectionEnd;
			const sel = ta.value.slice(start, end) || "Text here";
			const ins = `<${tag}>${sel}</${tag}>`;
			ta.setRangeText(ins, start, end, "end");
			ta.focus();
		}
		return false;
	}
	if (action === "add-hero-slide") {
		const list = document.getElementById("hero-slides-list");
		if (list) {
			const idx = list.children.length;
			const productOptions = state.products.map((p) => `<option value="${escHtml(p.id)}">${escHtml(p.name)} (${formatPrice(p.price)})</option>`).join("");
			const div = document.createElement("div");
			div.className = "hero-slide-editor";
			div.style.cssText = "padding:14px;background:var(--bg);border-radius:12px;display:grid;gap:10px;border:1px solid var(--border);";
			div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;"><strong>New Slide (${idx + 1})</strong><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.hero-slide-editor').remove()">Remove</button></div>
        <div class="form-row-2"><input class="field-input hs-headline" placeholder="Headline" /><input class="field-input hs-kicker" placeholder="Kicker (top label)" /></div>
        <input class="field-input hs-subtext" placeholder="Subtext" />
        <div class="form-row-2"><input class="field-input hs-btn-text" value="Shop Now" placeholder="Button Text" /><input class="field-input hs-btn-link" value="#deals" placeholder="Button Link" /></div>
        <div class="form-row-2" style="grid-template-columns:repeat(auto-fit,minmax(175px,1fr));">
          <div>
            <label class="field-label">Animated Featured Product</label>
            <select class="field-select hs-product">
              <option value="">None (Banner Image Only)</option>
              ${productOptions}
            </select>
          </div>
          <div>
            <label class="field-label">Highlight Badge Text</label>
            <input class="field-input hs-badge" placeholder="e.g. Hot Deal" />
          </div>
          <div>
            <label class="field-label">Slide Transition Style</label>
            <select class="field-select hs-anim">
              <option value="glide">Smooth Parallax Glide</option>
              <option value="zoom">Cinematic Slow Zoom</option>
              <option value="fade">Soft Editorial Reveal</option>
              <option value="orbit">Gentle Depth Drift</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <input class="field-input hs-img" id="hs-img-${idx}" placeholder="Background / Banner Image URL" />
          <label class="btn btn-sm btn-outline" style="cursor:pointer;">Upload <input type="file" accept="image/*" hidden data-upload-target="hs-img-${idx}" /></label>
        </div>
      `;
			list.appendChild(div);
		}
		return false;
	}
	if (action === "reset-theme-colors") {
		await saveSettingsDoc("theme", {
			...state.theme,
			primaryColor: "#0F766E",
			accentColor: "#FF6B57",
			bgColor: "#FAF8F5"
		});
		return true;
	}
	if (action === "download-zip") {
		showToast("Building full static ZIP package...");
		await downloadSourceZip();
		return false;
	}
	if (action === "export-products-csv") {
		exportCsv("pazarobd-products.csv", [
			"ID",
			"Name",
			"Category",
			"Brand",
			"Price (BDT)",
			"Old Price",
			"Stock",
			"Units Sold",
			"SKU"
		], state.products.map((p) => [
			p.id,
			p.name,
			p.category,
			p.brand,
			p.price,
			p.oldPrice || "",
			p.stock,
			p.unitsSold || 0,
			p.sku || ""
		]));
		return false;
	}
	if (action === "export-orders-csv") {
		exportCsv("pazarobd-orders.csv", [
			"Order Code",
			"Customer",
			"Phone",
			"Division",
			"District",
			"Upazila/Thana",
			"Address",
			"Payment",
			"Subtotal",
			"Delivery",
			"Total (BDT)",
			"Status"
		], state.orders.map((o) => [
			o.orderCode,
			o.customerName,
			o.phone,
			o.division || "",
			o.district,
			o.upazila || "",
			o.address,
			o.paymentMethod,
			o.subtotal,
			o.deliveryCharge,
			o.total,
			o.status
		]));
		return false;
	}
	if (action === "seed-demo-now") {
		await seedDemoDataToFirestore(true);
		return true;
	}
	return false;
}
export async function handleAdminFormSubmit(form) {
	if (form.id === "admin-login-form") {
		const email = form.querySelector("#admin-email")?.value.trim() || "";
		const pass = form.querySelector("#admin-pass")?.value || "";
		try {
			adminUiState.loginError = "";
			await loginAdminEmail(email, pass);
			if (state.authUser && !state.authUser.emailVerified) {
				adminUiState.loginError = "Signed in, but this email is not verified yet. Send a verification email above to enable live Firestore writes.";
			} else {
				showToast("Signed in to Firebase Admin Auth.");
			}
		} catch (err) {
			const code = err?.code || "";
			if (code === "auth/operation-not-allowed") {
				adminUiState.loginError = "Email/Password sign-in is not enabled in Firebase Console yet. Enable it under Authentication -> Sign-in method, or use Google Sign-In.";
			} else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
				adminUiState.loginError = "Invalid admin email or password. Verify the user exists in Firebase Authentication (pazaro-bd).";
			} else if (code === "auth/too-many-requests") {
				adminUiState.loginError = "Too many failed sign-in attempts. Please wait a few minutes and try again.";
			} else if (code === "auth/network-request-failed") {
				adminUiState.loginError = "Network error reaching Firebase Authentication. Check your internet connection and retry.";
			} else {
				adminUiState.loginError = err.message || "Invalid email or password.";
			}
		}
		return true;
	}
	if (form.id === "admin-product-form") {
		const fd = new FormData(form);
		const isNew = form.dataset.isNew === "true";
		const specRows = Array.from(form.querySelectorAll(".spec-row")).map((r) => ({
			key: r.querySelector(".spec-key").value.trim(),
			value: r.querySelector(".spec-val").value.trim()
		})).filter((s) => s.key && s.value);
		const images = Array.from(form.querySelectorAll(".prod-img-input")).map((i) => i.value.trim()).filter(Boolean);
		await saveProduct({
			id: form.dataset.id,
			name: fd.get("name"),
			category: fd.get("category"),
			brand: fd.get("brand"),
			sku: fd.get("sku"),
			price: Number(fd.get("price")),
			oldPrice: Number(fd.get("oldPrice")),
			stock: parseInt(String(fd.get("stock")), 10),
			rating: Number(fd.get("rating")),
			shortDescription: fd.get("shortDescription"),
			fullDescription: fd.get("fullDescription"),
			features: String(fd.get("features") || "").split("\n").map((s) => s.trim()).filter(Boolean),
			specs: specRows,
			options: String(fd.get("options") || "").split(",").map((s) => s.trim()).filter(Boolean),
			tags: String(fd.get("tags") || "").split(",").map((s) => s.trim()).filter(Boolean),
			images,
			videoUrl: fd.get("videoUrl"),
			videoPoster: fd.get("videoPoster"),
			isFeatured: Boolean(fd.get("isFeatured")),
			isFlashSale: Boolean(fd.get("isFlashSale")),
			isTrending: Boolean(fd.get("isTrending")),
			isNewArrival: Boolean(fd.get("isNewArrival"))
		}, isNew);
		adminUiState.editingProduct = null;
		return true;
	}
	if (form.id === "admin-cat-form") {
		const fd = new FormData(form);
		const res = await saveCategory({
			id: form.dataset.id,
			name: fd.get("name"),
			nameBn: fd.get("nameBn"),
			icon: fd.get("icon"),
			imageUrl: fd.get("imageUrl"),
			sortOrder: parseInt(String(fd.get("sortOrder")), 10) || 1
		}, form.dataset.isNew === "true");
		if (res?.renamed && adminUiState.prodCatFilter === res.oldName) {
			adminUiState.prodCatFilter = res.newName;
		}
		adminUiState.editingCategory = null;
		return true;
	}
	if (form.id === "admin-quick-cat-form") {
		const fd = new FormData(form);
		const targetId = String(fd.get("categoryId") || form.dataset.id || "");
		const existingCat = state.categories.find((c) => c.id === targetId);
		if (existingCat) {
			const res = await saveCategory({
				...existingCat,
				name: fd.get("name"),
				nameBn: fd.get("nameBn"),
				icon: fd.get("icon")
			}, false);
			if (res?.renamed && adminUiState.prodCatFilter === res.oldName) {
				adminUiState.prodCatFilter = res.newName;
			}
		}
		adminUiState.quickEditCategoryId = "";
		return true;
	}
	if (form.id === "admin-post-form") {
		const fd = new FormData(form);
		await savePost({
			id: form.dataset.id,
			title: fd.get("title"),
			category: fd.get("category"),
			coverImage: fd.get("coverImage"),
			excerpt: fd.get("excerpt"),
			body: fd.get("body"),
			tags: String(fd.get("tags") || "").split(",").map((s) => s.trim()).filter(Boolean),
			published: Boolean(fd.get("published")),
			issueFlag: Boolean(fd.get("issueFlag")),
			issueNote: fd.get("issueNote")
		}, form.dataset.isNew === "true");
		adminUiState.editingPost = null;
		return true;
	}
	if (form.id === "admin-review-form") {
		const fd = new FormData(form);
		const productId = String(fd.get("productId") || "").trim();
		const prod = state.products.find((p) => p.id === productId);
		await saveReview({
			id: form.dataset.id,
			productId,
			productName: prod?.name || "General Store",
			authorName: fd.get("authorName"),
			city: fd.get("city"),
			rating: Number(fd.get("rating")) || 5,
			comment: fd.get("comment"),
			approved: Boolean(fd.get("approved"))
		}, form.dataset.isNew === "true");
		adminUiState.editingReview = null;
		return true;
	}
	if (form.id === "admin-theme-form") {
		const fd = new FormData(form);
		const heroSlides = Array.from(form.querySelectorAll(".hero-slide-editor")).map((el, idx) => ({
			id: `slide-${idx + 1}`,
			headline: el.querySelector(".hs-headline")?.value.trim() || "",
			kicker: el.querySelector(".hs-kicker")?.value.trim() || "",
			subtext: el.querySelector(".hs-subtext")?.value.trim() || "",
			buttonText: el.querySelector(".hs-btn-text")?.value.trim() || "Shop Now",
			buttonLink: el.querySelector(".hs-btn-link")?.value.trim() || "#deals",
			imageUrl: el.querySelector(".hs-img")?.value.trim() || "",
			featuredProductId: el.querySelector(".hs-product")?.value.trim() || "",
			badgeText: el.querySelector(".hs-badge")?.value.trim() || "",
			animStyle: el.querySelector(".hs-anim")?.value.trim() || "float"
		}));
		const promoTiles = Array.from(form.querySelectorAll(".promo-tile-editor")).map((el, idx) => ({
			id: `promo-${idx + 1}`,
			title: el.querySelector(".pt-title").value.trim(),
			subtext: el.querySelector(".pt-sub").value.trim(),
			buttonText: el.querySelector(".pt-btn").value.trim(),
			link: el.querySelector(".pt-link").value.trim(),
			imageUrl: el.querySelector(".pt-img").value.trim()
		}));
		await saveSettingsDoc("theme", {
			heroVersion: 2,
			heroSlidesCustomized: true,
			primaryColor: fd.get("primaryColor"),
			accentColor: fd.get("accentColor"),
			bgColor: fd.get("bgColor"),
			heroSlides,
			promoTiles
		});
		return true;
	}
	if (form.id === "admin-branding-form") {
		const fd = new FormData(form);
		await saveSettingsDoc("general", {
			...state.general,
			logoUrl: fd.get("logoUrl"),
			faviconUrl: fd.get("faviconUrl"),
			siteName: fd.get("siteName"),
			tagline: fd.get("tagline"),
			phone: fd.get("phone"),
			whatsapp: fd.get("whatsapp"),
			email: fd.get("email"),
			address: fd.get("address"),
			facebookUrl: fd.get("facebookUrl"),
			instagramUrl: fd.get("instagramUrl"),
			youtubeUrl: fd.get("youtubeUrl")
		});
		return true;
	}
	if (form.id === "admin-ads-form") {
		const slots = {};
		form.querySelectorAll(".ad-slot-editor").forEach((el) => {
			slots[el.dataset.slot] = {
				enabled: el.querySelector(".ad-enabled").checked,
				imageUrl: el.querySelector(".ad-img").value.trim(),
				linkUrl: el.querySelector(".ad-link").value.trim(),
				htmlCode: el.querySelector(".ad-html").value.trim()
			};
		});
		await saveSettingsDoc("ads", { slots });
		return true;
	}
	if (form.id === "admin-settings-form") {
		const fd = new FormData(form);
		await saveSettingsDoc("general", {
			...state.general,
			insideDhakaFee: Number(fd.get("insideDhakaFee")) || 0,
			outsideDhakaFee: Number(fd.get("outsideDhakaFee")) || 0,
			freeDeliveryMin: Number(fd.get("freeDeliveryMin")) || 0,
			currencySymbol: fd.get("currencySymbol") || "৳",
			mapEnabled: Boolean(fd.get("mapEnabled")),
			mapProvider: String(fd.get("mapProvider") || "osm"),
			mapDefaultLat: Number(fd.get("mapDefaultLat")) || 23.8103,
			mapDefaultLng: Number(fd.get("mapDefaultLng")) || 90.4125,
			mapDefaultZoom: Math.max(6, Math.min(18, parseInt(String(fd.get("mapDefaultZoom") || 12), 10) || 12)),
			footerText: fd.get("footerText"),
			maintenanceMode: Boolean(fd.get("maintenanceMode"))
		});
		return true;
	}
	if (form.id === "admin-add-uid-form") {
		const uid = form.querySelector("#grant-uid").value.trim();
		const email = form.querySelector("#grant-email").value.trim();
		if (uid && email) await addAdminUid(uid, email);
		form.reset();
		return true;
	}
	return false;
}
export async function handleAdminFileUpload(input) {
	const file = input.files?.[0];
	if (!file) return;
	const target = input.dataset.uploadTarget;
	showToast("Uploading to Firebase Storage...");
	try {
		const url = await uploadAssetToStorage(file, target.includes("video") ? "videos" : "images");
		if (target.startsWith("prod-img-")) {
			const idx = target.replace("prod-img-", "");
			const el = document.querySelector(`.prod-img-input[data-img-index="${idx}"]`);
			if (el) el.value = url;
		} else if (target === "prod-video") {
			const el = document.getElementById("prod-video-url");
			if (el) el.value = url;
		} else if (target === "prod-poster") {
			const el = document.getElementById("prod-video-poster");
			if (el) el.value = url;
		} else if (target === "cat-img") {
			const el = document.getElementById("cat-img-url");
			if (el) el.value = url;
		} else if (target === "post-cover") {
			const el = document.getElementById("post-cover-url");
			if (el) el.value = url;
		} else if (target === "brand-logo") {
			const el = document.getElementById("brand-logo-url");
			if (el) el.value = url;
		} else if (target === "brand-fav") {
			const el = document.getElementById("brand-fav-url");
			if (el) el.value = url;
		} else {
			const el = document.getElementById(target);
			if (el) el.value = url;
		}
		showToast("Upload complete!");
	} catch (err) {
		showToast(err.message || "Upload failed.", true);
	}
}
export { updateOrderStatus };

//# sourceMappingURL=data:application/json;base64,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YztHQUNsQyxNQUFNLEtBQUssU0FBUyxlQUFlLGdCQUFnQjtHQUNuRCxJQUFJLElBQUksR0FBRyxRQUFRO0VBQ3JCLE9BQU8sSUFBSSxXQUFXLGFBQWE7R0FDakMsTUFBTSxLQUFLLFNBQVMsZUFBZSxlQUFlO0dBQ2xELElBQUksSUFBSSxHQUFHLFFBQVE7RUFDckIsT0FBTztHQUNMLE1BQU0sS0FBSyxTQUFTLGVBQWUsTUFBTTtHQUN6QyxJQUFJLElBQUksR0FBRyxRQUFRO0VBQ3JCO0VBQ0EsVUFBVSxrQkFBa0I7Q0FDOUIsU0FBUyxLQUFLO0VBQ1osVUFBVSxJQUFJLFdBQVcsa0JBQWtCLElBQUk7Q0FDakQ7QUFDRjtBQUVBLFNBQVMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiYWRtaW4uanMiXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiLy8gUGF6YXJvIEJEIOKAlCBGdWxsIEFkbWluIFBhbmVsICgvYWRtaW4pXG5pbXBvcnQge1xuICBzdGF0ZSxcbiAgZm9ybWF0UHJpY2UsXG4gIGxvZ2luQWRtaW5FbWFpbCxcbiAgbG9naW5BZG1pbkdvb2dsZSxcbiAgbG9nb3V0QWRtaW4sXG4gIHNlbmRBZG1pblZlcmlmaWNhdGlvbkVtYWlsLFxuICByZWZyZXNoQXV0aFZlcmlmaWNhdGlvbixcbiAgc2F2ZVByb2R1Y3QsXG4gIGRlbGV0ZVByb2R1Y3QsXG4gIHNhdmVDYXRlZ29yeSxcbiAgZGVsZXRlQ2F0ZWdvcnksXG4gIHVwZGF0ZU9yZGVyU3RhdHVzLFxuICBkZWxldGVPcmRlcixcbiAgc2F2ZVBvc3QsXG4gIGRlbGV0ZVBvc3QsXG4gIHNhdmVSZXZpZXcsXG4gIHRvZ2dsZVJldmlld0FwcHJvdmFsLFxuICBkZWxldGVSZXZpZXcsXG4gIG1hcmtPcmRlcnNTZWVuLFxuICBzYXZlU2V0dGluZ3NEb2MsXG4gIGFkZEFkbWluVWlkLFxuICB1cGxvYWRBc3NldFRvU3RvcmFnZSxcbiAgc2VlZERlbW9EYXRhVG9GaXJlc3RvcmUsXG4gIHNob3dUb2FzdFxufSBmcm9tICcuL3N0b3JlLmpzJztcbmltcG9ydCB7IGVzY0h0bWwsIGdldFByb2R1Y3RJbWFnZSwgZ2V0U3RvY2tCYWRnZSwgcmVuZGVyRGJDb25uZWN0aW9uQWxlcnQgfSBmcm9tICcuL3VpLWNvbXBvbmVudHMuanMnO1xuaW1wb3J0IHsgU0VFRF9HRU5FUkFMX1NFVFRJTkdTLCBTRUVEX1RIRU1FX1NFVFRJTkdTLCBTRUVEX0FEU19TRVRUSU5HUyB9IGZyb20gJy4vc2VlZC1kYXRhLmpzJztcbmltcG9ydCB7IGRvd25sb2FkU291cmNlWmlwIH0gZnJvbSAnLi96aXAtZXhwb3J0LmpzJztcbmltcG9ydCB7IGdldEN1c3RvbWVyU2Vzc2lvbiwgaXNDdXN0b21lckFkbWluLCBzaWduT3V0Q3VzdG9tZXIgfSBmcm9tICcuL2N1c3RvbWVyLWF1dGguanMnO1xuXG5leHBvcnQgY29uc3QgYWRtaW5VaVN0YXRlID0ge1xuICB0YWI6ICdkYXNoYm9hcmQnLFxuICBjaGFydERheXM6IDcsXG4gIHByb2RTZWFyY2g6ICcnLFxuICBwcm9kQ2F0RmlsdGVyOiAnQWxsJyxcbiAgcmV2aWV3RmlsdGVyOiAnYWxsJyxcbiAgZWRpdGluZ1Byb2R1Y3Q6IG51bGwsIC8vIG51bGwgfCAnbmV3JyB8IHByb2R1Y3RPYmpcbiAgZWRpdGluZ0NhdGVnb3J5OiBudWxsLFxuICBxdWlja0VkaXRDYXRlZ29yeUlkOiAnJywgLy8gbm9uLWVtcHR5IG9wZW5zIEVkaXQgQ2F0ZWdvcnkgc2VsZWN0b3IgbW9kYWxcbiAgY29uZmlybURpYWxvZzogbnVsbCwgLy8geyB0aXRsZSwgbWVzc2FnZSwgY29uZmlybUxhYmVsLCBraW5kLCBpZCB9XG4gIGVkaXRpbmdQb3N0OiBudWxsLFxuICBlZGl0aW5nUmV2aWV3OiBudWxsLFxuICBtb2JpbGVNZW51T3BlbjogZmFsc2UsXG4gIGxvZ2luRXJyb3I6ICcnLFxuICBzaG93UGFzczogZmFsc2Vcbn07XG5cbmNvbnN0IEFETUlOX1RBQlMgPSBbXG4gIHsgaWQ6ICdkYXNoYm9hcmQnLCBsYWJlbDogJ0Rhc2hib2FyZCcsIGljb246ICfwn5OKJyB9LFxuICB7IGlkOiAncHJvZHVjdHMnLCBsYWJlbDogJ1Byb2R1Y3RzJywgaWNvbjogJ/Cfk6YnIH0sXG4gIHsgaWQ6ICdjYXRlZ29yaWVzJywgbGFiZWw6ICdDYXRlZ29yaWVzJywgaWNvbjogJ/Cfl4LvuI8nIH0sXG4gIHsgaWQ6ICdvcmRlcnMnLCBsYWJlbDogJ09yZGVycycsIGljb246ICfwn6e+JyB9LFxuICB7IGlkOiAnYmxvZycsIGxhYmVsOiAnQmxvZycsIGljb246ICfinI3vuI8nIH0sXG4gIHsgaWQ6ICdyZXZpZXdzJywgbGFiZWw6ICdSZXZpZXdzJywgaWNvbjogJ+KtkCcgfSxcbiAgeyBpZDogJ2Jhbm5lcnMnLCBsYWJlbDogJ0Jhbm5lcnMgJiBUaGVtZScsIGljb246ICfwn46oJyB9LFxuICB7IGlkOiAnYnJhbmRpbmcnLCBsYWJlbDogJ0xvZ28gJiBCcmFuZGluZycsIGljb246ICfwn4+377iPJyB9LFxuICB7IGlkOiAnYWRzJywgbGFiZWw6ICdBZHMnLCBpY29uOiAn8J+ToicgfSxcbiAgeyBpZDogJ3NldHRpbmdzJywgbGFiZWw6ICdTZXR0aW5ncycsIGljb246ICfimpnvuI8nIH0sXG4gIHsgaWQ6ICdiYWNrdXAnLCBsYWJlbDogJ1NvdXJjZSAmIEJhY2t1cCcsIGljb246ICfwn5K+JyB9XG5dO1xuXG5mdW5jdGlvbiBnZXRPcmRlclRpbWVzdGFtcChvcmQpIHtcbiAgaWYgKCFvcmQ/LmNyZWF0ZWRBdCkgcmV0dXJuIERhdGUubm93KCk7XG4gIGlmICh0eXBlb2Ygb3JkLmNyZWF0ZWRBdC50b01pbGxpcyA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG9yZC5jcmVhdGVkQXQudG9NaWxsaXMoKTtcbiAgY29uc3QgbXMgPSBuZXcgRGF0ZShvcmQuY3JlYXRlZEF0KS5nZXRUaW1lKCk7XG4gIHJldHVybiBOdW1iZXIuaXNOYU4obXMpID8gRGF0ZS5ub3coKSA6IG1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQWRtaW5WaWV3KCkge1xuICBjb25zdCBjdXN0U2Vzc2lvbiA9IGdldEN1c3RvbWVyU2Vzc2lvbigpO1xuICBjb25zdCBoYXNDdXN0b21lckFkbWluID0gaXNDdXN0b21lckFkbWluKGN1c3RTZXNzaW9uKTtcblxuICAvLyBTdHJpY3QgUkJBQzogYWxsb3cgdW5hdXRoZW50aWNhdGVkIHZpc2l0b3JzIHRvIHNlZSBGaXJlYmFzZSBBZG1pbiBMb2dpbjsgYmxvY2sgcmVndWxhciBzdG9yZWZyb250IHVzZXJzXG4gIGlmICghaGFzQ3VzdG9tZXJBZG1pbiAmJiAhc3RhdGUuaXNBZG1pbikge1xuICAgIGlmICghY3VzdFNlc3Npb24pIHtcbiAgICAgIHJldHVybiByZW5kZXJBZG1pbkxvZ2luKCk7XG4gICAgfVxuICAgIGNvbnN0IHNpZ25lZEluTGFiZWwgPSBjdXN0U2Vzc2lvbj8uZW1haWwgfHwgY3VzdFNlc3Npb24/LmZ1bGxOYW1lIHx8ICdHdWVzdCc7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxtYWluIHN0eWxlPVwibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzoyNHB4O1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiIHN0eWxlPVwibWF4LXdpZHRoOjQ2MHB4O3RleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6MzJweCAyNHB4O1wiPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6Mi40cmVtO21hcmdpbi1ib3R0b206OHB4O1wiPvCflJI8L2Rpdj5cbiAgICAgICAgICA8aDEgc3R5bGU9XCJtYXJnaW46MCAwIDhweDtcIj5BY2Nlc3MgRGVuaWVkPC9oMT5cbiAgICAgICAgICA8cCBzdHlsZT1cImNvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6MC45MnJlbTttYXJnaW46MCAwIDE4cHg7XCI+XG4gICAgICAgICAgICBUaGUgQWRtaW4gUGFuZWwgaXMgcmVzdHJpY3RlZCB0byBhdXRob3JpemVkIGFkbWluaXN0cmF0b3JzIG9ubHkuIFNpZ25lZC1pbiB1c2VyIDxzdHJvbmc+JHtlc2NIdG1sKHNpZ25lZEluTGFiZWwpfTwvc3Ryb25nPiBoYXMgYSBzdGFuZGFyZCB1c2VyIGFjY291bnQuXG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+UmV0dXJuIHRvIFN0b3JlZnJvbnQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgIGA7XG4gIH1cblxuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIGNvbnN0IGFjdGl2ZUVtYWlsID0gc3RhdGUuYXV0aFVzZXI/LmVtYWlsIHx8IChjdXN0U2Vzc2lvbj8ucm9sZSA9PT0gJ2FkbWluJyA/IChjdXN0U2Vzc2lvbi5mdWxsTmFtZSB8fCAnQWRtaW4nKSA6IGN1c3RTZXNzaW9uPy5lbWFpbCkgfHwgJ0FkbWluJztcbiAgY29uc3QgaGFzT3V0T2ZTdG9jayA9IHN0YXRlLnByb2R1Y3RzLnNvbWUoKHApID0+IE51bWJlcihwLnN0b2NrKSA8PSAwKTtcbiAgY29uc3QgYmxvZ0FsZXJ0c0NvdW50ID0gc3RhdGUucG9zdHMuZmlsdGVyKChwKSA9PiBwLmlzc3VlRmxhZyB8fCBwLnB1Ymxpc2hlZCA9PT0gZmFsc2UgfHwgIXAuYm9keSB8fCBwLmJvZHkudHJpbSgpLmxlbmd0aCA8IDIwIHx8ICFwLmV4Y2VycHQpLmxlbmd0aDtcbiAgY29uc3QgaGlkZGVuUmV2aWV3c0NvdW50ID0gc3RhdGUucmV2aWV3cy5maWx0ZXIoKHIpID0+IHIuYXBwcm92ZWQgPT09IGZhbHNlKS5sZW5ndGg7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwiYWRtaW4tc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzcz1cImFkbWluLXNpZGViYXIgJHthZG1pblVpU3RhdGUubW9iaWxlTWVudU9wZW4gPyAnbW9iaWxlLW9wZW4nIDogJyd9XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO3BhZGRpbmc6NHB4IDhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xMik7bWFyZ2luLWJvdHRvbTo4cHg7XCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiNob21lXCIgc3R5bGU9XCJmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjEuMTVyZW07Y29sb3I6I2ZmZmZmZjtcIj4ke2VzY0h0bWwoZy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJyl9PC9hPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWNvbi1idG5cIiBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWZsZXg7Y29sb3I6I2ZmZjtcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1lbnVcIiBhcmlhLWxhYmVsPVwiQ2xvc2Ugc2lkZWJhclwiPuKclTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAke0FETUlOX1RBQlMubWFwKCh0KSA9PiB7XG4gICAgICAgICAgbGV0IHJpZ2h0QmFkZ2UgPSAnJztcbiAgICAgICAgICBsZXQgY29ybmVyRG90ID0gJyc7XG4gICAgICAgICAgaWYgKHQuaWQgPT09ICdwcm9kdWN0cycgJiYgaGFzT3V0T2ZTdG9jaykge1xuICAgICAgICAgICAgY29ybmVyRG90ID0gJzxzcGFuIGNsYXNzPVwiYWRtaW4tb29zLWRvdFwiIHRpdGxlPVwiT3V0IG9mIHN0b2NrIHByb2R1Y3RzIGFsZXJ0XCIgYXJpYS1sYWJlbD1cIk91dCBvZiBzdG9jayBhbGVydFwiPjwvc3Bhbj4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodC5pZCA9PT0gJ29yZGVycycgJiYgc3RhdGUubmV3T3JkZXJzQ291bnQgPiAwKSB7XG4gICAgICAgICAgICByaWdodEJhZGdlID0gYDxzcGFuIGNsYXNzPVwiYWRtaW4tbmF2LWJhZGdlIGFkbWluLWJhZGdlLW9yZGVyc1wiPiR7c3RhdGUubmV3T3JkZXJzQ291bnR9IE5ldzwvc3Bhbj5gO1xuICAgICAgICAgIH0gZWxzZSBpZiAodC5pZCA9PT0gJ2Jsb2cnICYmIGJsb2dBbGVydHNDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHJpZ2h0QmFkZ2UgPSBgPHNwYW4gY2xhc3M9XCJhZG1pbi1uYXYtYmFkZ2UgYWRtaW4tYmFkZ2Utd2FyblwiPiR7YmxvZ0FsZXJ0c0NvdW50fSBBbGVydCR7YmxvZ0FsZXJ0c0NvdW50ID4gMSA/ICdzJyA6ICcnfTwvc3Bhbj5gO1xuICAgICAgICAgIH0gZWxzZSBpZiAodC5pZCA9PT0gJ3Jldmlld3MnICYmIGhpZGRlblJldmlld3NDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHJpZ2h0QmFkZ2UgPSBgPHNwYW4gY2xhc3M9XCJhZG1pbi1uYXYtYmFkZ2UgYWRtaW4tYmFkZ2Utd2FyblwiPiR7aGlkZGVuUmV2aWV3c0NvdW50fSBIaWRkZW48L3NwYW4+YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYWRtaW4tbmF2LWJ0biAke2FkbWluVWlTdGF0ZS50YWIgPT09IHQuaWQgPyAnYWN0aXZlJyA6ICcnfVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tdGFiXCIgZGF0YS10YWI9XCIke3QuaWR9XCI+XG4gICAgICAgICAgICAgIDxzcGFuPiR7dC5pY29ufSAke2VzY0h0bWwodC5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgICAgICAke3JpZ2h0QmFkZ2V9XG4gICAgICAgICAgICAgICR7Y29ybmVyRG90fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgYDtcbiAgICAgICAgfSkuam9pbignJyl9XG5cbiAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6YXV0bztwYWRkaW5nLXRvcDoxNHB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xMik7ZGlzcGxheTpncmlkO2dhcDo4cHg7XCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiNob21lXCIgY2xhc3M9XCJhZG1pbi1uYXYtYnRuXCI+8J+bje+4jyBWaWV3IExpdmUgU3RvcmVmcm9udDwvYT5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImFkbWluLW5hdi1idG5cIiBkYXRhLWFjdGlvbj1cImFkbWluLWxvZ291dFwiPvCfmqogTG9nb3V0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hc2lkZT5cblxuICAgICAgPGRpdj5cbiAgICAgICAgPGhlYWRlciBjbGFzcz1cImFkbWluLXRvcGJhclwiPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi10b2dnbGUtbWVudVwiIGFyaWEtbGFiZWw9XCJNZW51XCI+4piwIE1lbnU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxzdHJvbmcgc3R5bGU9XCJmb250LXNpemU6MS4wNXJlbTtcIj4ke2VzY0h0bWwoQURNSU5fVEFCUy5maW5kKCh0KSA9PiB0LmlkID09PSBhZG1pblVpU3RhdGUudGFiKT8ubGFiZWwgfHwgJ0FkbWluJyl9PC9zdHJvbmc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7XCI+XG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTowLjgycmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj4ke2VzY0h0bWwoYWN0aXZlRW1haWwpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiPlN0b3JlZnJvbnQ8L2E+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWxvZ291dFwiPkxvZ291dDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiYWRtaW4tbWFpblwiPlxuICAgICAgICAgICR7cmVuZGVyRGJDb25uZWN0aW9uQWxlcnQoKX1cbiAgICAgICAgICAkeyFzdGF0ZS5pc0FkbWluID8gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIiBzdHlsZT1cIm1hcmdpbi1ib3R0b206MTZweDtkaXNwbGF5OmdyaWQ7Z2FwOjEycHg7YmFja2dyb3VuZDojZmZmYmViO2JvcmRlcjoxcHggc29saWQgcmdiYSgyNTEsMTkxLDM2LDAuNSk7XCI+XG4gICAgICAgICAgICAgICR7c3RhdGUuYXV0aFVzZXIgJiYgc3RhdGUuYXV0aFZlcmlmaWNhdGlvblJlcXVpcmVkID8gYFxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjg2cmVtO1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkVtYWlsIFZlcmlmaWNhdGlvbiBSZXF1aXJlZDwvc3Ryb25nPiDCtyBTaWduZWQgaW4gYXMgPHN0cm9uZz4ke2VzY0h0bWwoc3RhdGUuYXV0aFVzZXIuZW1haWwgfHwgc3RhdGUuYXV0aFVzZXIudWlkKX08L3N0cm9uZz4uIFZlcmlmeSB5b3VyIGVtYWlsIGFkZHJlc3MgdG8gdW5sb2NrIGxpdmUgRmlyZXN0b3JlICZhbXA7IFN0b3JhZ2Ugd3JpdGVzLlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDo4cHg7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tcHJpbWFyeVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tc2VuZC12ZXJpZnlcIj5TZW5kIFZlcmlmaWNhdGlvbiBFbWFpbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLXJlZnJlc2gtdmVyaWZ5XCI+SSd2ZSBWZXJpZmllZCDigJQgUmVmcmVzaDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWZpcmViYXNlLXNpZ25vdXRcIj5TaWduIE91dCBGaXJlYmFzZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIGAgOiBzdGF0ZS5hdXRoVXNlciA/IGBcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjtnYXA6MTBweDtcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6MC44NnJlbTtcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5GaXJlYmFzZSBBdXRoIEFjY291bnQgKCR7ZXNjSHRtbChzdGF0ZS5hdXRoVXNlci5lbWFpbCB8fCBzdGF0ZS5hdXRoVXNlci51aWQpfSk8L3N0cm9uZz4gZG9lcyBub3QgaGF2ZSBGaXJlc3RvcmUgQWRtaW4gcm9sZSB5ZXQuIEFkZCBVSUQgPGNvZGUgc3R5bGU9XCJ1c2VyLXNlbGVjdDphbGw7XCI+JHtlc2NIdG1sKHN0YXRlLmF1dGhVc2VyLnVpZCl9PC9jb2RlPiB0byBGaXJlc3RvcmUgPGNvZGU+YWRtaW5zLyR7ZXNjSHRtbChzdGF0ZS5hdXRoVXNlci51aWQpfTwvY29kZT4gdG8gZW5hYmxlIGxpdmUgY2xvdWQgd3JpdGVzLlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWZpcmViYXNlLXNpZ25vdXRcIj5Td2l0Y2ggRmlyZWJhc2UgQWNjb3VudDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgIDogYFxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjg2cmVtO1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNvbm5lY3QgRmlyZWJhc2UgQWRtaW4gQXV0aDwvc3Ryb25nPiDCtyBTaWduIGluIHdpdGggeW91ciBGaXJlYmFzZSBFbWFpbCAmYW1wOyBQYXNzd29yZCAob3IgR29vZ2xlIE93bmVyIGFjY291bnQpIHRvIHNhdmUgcHJvZHVjdHMsIGNhdGVnb3JpZXMsIG9yZGVycywgYmxvZyBwb3N0cyAmYW1wOyBTdG9yYWdlIGltYWdlcyBkaXJlY3RseSB0byBGaXJlc3RvcmUuXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZ29vZ2xlLWxvZ2luXCI+U2lnbiBJbiB3aXRoIEdvb2dsZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICR7YWRtaW5VaVN0YXRlLmxvZ2luRXJyb3IgPyBgXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZDojZmVmMmYyO2NvbG9yOiNiOTFjMWM7cGFkZGluZzo5cHggMTJweDtib3JkZXItcmFkaXVzOjEwcHg7Zm9udC1zaXplOjAuODRyZW07XCI+XG4gICAgICAgICAgICAgICAgICAgICR7ZXNjSHRtbChhZG1pblVpU3RhdGUubG9naW5FcnJvcil9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgIDogJyd9XG4gICAgICAgICAgICAgICAgPGZvcm0gaWQ9XCJhZG1pbi1sb2dpbi1mb3JtXCIgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDthbGlnbi1pdGVtczpjZW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWRtaW4tZW1haWxcIiB0eXBlPVwiZW1haWxcIiByZXF1aXJlZCBwbGFjZWhvbGRlcj1cIkFkbWluIEZpcmViYXNlIGVtYWlsXCIgc3R5bGU9XCJmbGV4OjEgMSAyMDBweDtcIiAvPlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cInBvc2l0aW9uOnJlbGF0aXZlO2ZsZXg6MSAxIDE4MHB4O1wiPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWRtaW4tcGFzc1wiIHR5cGU9XCIke2FkbWluVWlTdGF0ZS5zaG93UGFzcyA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJQYXNzd29yZFwiIHN0eWxlPVwicGFkZGluZy1yaWdodDo1OHB4O1wiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXBhc3MtdmlzXCIgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtyaWdodDo4cHg7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZTowLjhyZW07Y29sb3I6dmFyKC0tcHJpbWFyeSk7Zm9udC13ZWlnaHQ6NjAwO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICR7YWRtaW5VaVN0YXRlLnNob3dQYXNzID8gJ0hpZGUnIDogJ1Nob3cnfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5XCI+TG9naW4gd2l0aCBFbWFpbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgYH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIGAgOiAnJ31cbiAgICAgICAgICAke3JlbmRlckFjdGl2ZUFkbWluVGFiKCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICAke2FkbWluVWlTdGF0ZS5lZGl0aW5nUHJvZHVjdCA/IHJlbmRlclByb2R1Y3RFZGl0b3JNb2RhbChhZG1pblVpU3RhdGUuZWRpdGluZ1Byb2R1Y3QpIDogJyd9XG4gICAgJHthZG1pblVpU3RhdGUuZWRpdGluZ0NhdGVnb3J5ID8gcmVuZGVyQ2F0ZWdvcnlFZGl0b3JNb2RhbChhZG1pblVpU3RhdGUuZWRpdGluZ0NhdGVnb3J5KSA6ICcnfVxuICAgICR7YWRtaW5VaVN0YXRlLnF1aWNrRWRpdENhdGVnb3J5SWQgPyByZW5kZXJRdWlja0VkaXRDYXRlZ29yeU1vZGFsKGFkbWluVWlTdGF0ZS5xdWlja0VkaXRDYXRlZ29yeUlkKSA6ICcnfVxuICAgICR7YWRtaW5VaVN0YXRlLmVkaXRpbmdQb3N0ID8gcmVuZGVyUG9zdEVkaXRvck1vZGFsKGFkbWluVWlTdGF0ZS5lZGl0aW5nUG9zdCkgOiAnJ31cbiAgICAke2FkbWluVWlTdGF0ZS5lZGl0aW5nUmV2aWV3ID8gcmVuZGVyUmV2aWV3RWRpdG9yTW9kYWwoYWRtaW5VaVN0YXRlLmVkaXRpbmdSZXZpZXcpIDogJyd9XG4gICAgJHthZG1pblVpU3RhdGUuY29uZmlybURpYWxvZyA/IHJlbmRlckNvbmZpcm1EZWxldGVNb2RhbChhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZykgOiAnJ31cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQWRtaW5Mb2dpbigpIHtcbiAgY29uc3QgZyA9IHN0YXRlLmdlbmVyYWwgfHwgU0VFRF9HRU5FUkFMX1NFVFRJTkdTO1xuICByZXR1cm4gYFxuICAgIDxtYWluIHN0eWxlPVwibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzoyMHB4O1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIiBzdHlsZT1cIndpZHRoOm1pbig0MjBweCwxMDAlKTtwYWRkaW5nOjI4cHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW4tYm90dG9tOjIwcHg7XCI+XG4gICAgICAgICAgJHtnLmxvZ29VcmxcbiAgICAgICAgICAgID8gYDxpbWcgc3JjPVwiJHtlc2NIdG1sKGcubG9nb1VybCl9XCIgYWx0PVwiJHtlc2NIdG1sKGcuc2l0ZU5hbWUpfVwiIHN0eWxlPVwiaGVpZ2h0OjQ2cHg7bWFyZ2luOjAgYXV0byAxMHB4O1wiIC8+YFxuICAgICAgICAgICAgOiBgPGltZyBzcmM9XCIvYXNzZXRzL3BhemFyby1sb2dvLnN2Z1wiIGFsdD1cIiR7ZXNjSHRtbChnLnNpdGVOYW1lIHx8ICdQYXphcm8gQkQnKX0gbG9nb1wiIHN0eWxlPVwiaGVpZ2h0OjUycHg7d2lkdGg6NTJweDttYXJnaW46MCBhdXRvIDEwcHg7ZGlzcGxheTpibG9jaztcIiAvPmBcbiAgICAgICAgICB9XG4gICAgICAgICAgPGgxIHN0eWxlPVwibWFyZ2luOjAgMCA0cHg7Zm9udC1zaXplOjEuNHJlbTtcIj4ke2VzY0h0bWwoZy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJyl9IEFkbWluPC9oMT5cbiAgICAgICAgICA8cCBzdHlsZT1cIm1hcmdpbjowO2NvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6MC44OHJlbTtcIj5TaWduIGluIHdpdGggRmlyZWJhc2UgRW1haWwgJmFtcDsgUGFzc3dvcmQgdG8gbWFuYWdlIHByb2R1Y3RzLCBvcmRlcnMsIGJsb2cgJmFtcDsgc2V0dGluZ3MuPC9wPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAke3JlbmRlckRiQ29ubmVjdGlvbkFsZXJ0KCl9XG5cbiAgICAgICAgJHtzdGF0ZS5hdXRoVXNlciAmJiBzdGF0ZS5hdXRoVmVyaWZpY2F0aW9uUmVxdWlyZWQgPyBgXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImJhY2tncm91bmQ6I2ZmZmJlYjtib3JkZXI6MXB4IHNvbGlkIHJnYmEoMjUxLDE5MSwzNiwwLjYpO2NvbG9yOiM5MjQwMGU7cGFkZGluZzoxMnB4O2JvcmRlci1yYWRpdXM6MTBweDtmb250LXNpemU6MC44NHJlbTttYXJnaW4tYm90dG9tOjE0cHg7ZGlzcGxheTpncmlkO2dhcDo4cHg7XCI+XG4gICAgICAgICAgICA8ZGl2PjxzdHJvbmc+VmVyaWZ5IHlvdXIgZW1haWwgZmlyc3Q6PC9zdHJvbmc+ICR7ZXNjSHRtbChzdGF0ZS5hdXRoVXNlci5lbWFpbCB8fCAnJyl9IGlzIHNpZ25lZCBpbiwgYnV0IHNlY3VyaXR5IHJ1bGVzIHJlcXVpcmUgYSB2ZXJpZmllZCBlbWFpbC48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJhZG1pbi1zZW5kLXZlcmlmeVwiPlNlbmQgVmVyaWZpY2F0aW9uIEVtYWlsPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tcmVmcmVzaC12ZXJpZnlcIj5SZWZyZXNoIFN0YXR1czwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIGAgOiAnJ31cblxuICAgICAgICAke2FkbWluVWlTdGF0ZS5sb2dpbkVycm9yID8gYFxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJiYWNrZ3JvdW5kOiNmZWYyZjI7Y29sb3I6I2I5MWMxYztwYWRkaW5nOjEwcHggMTJweDtib3JkZXItcmFkaXVzOjEwcHg7Zm9udC1zaXplOjAuODVyZW07bWFyZ2luLWJvdHRvbToxNHB4O1wiPlxuICAgICAgICAgICAgJHtlc2NIdG1sKGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCA6ICcnfVxuXG4gICAgICAgIDxmb3JtIGlkPVwiYWRtaW4tbG9naW4tZm9ybVwiIGNsYXNzPVwiZm9ybS1ncmlkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYWRtaW4tZW1haWxcIj5FbWFpbDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWRtaW4tZW1haWxcIiB0eXBlPVwiZW1haWxcIiByZXF1aXJlZCBwbGFjZWhvbGRlcj1cInlvdUBleGFtcGxlLmNvbVwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYWRtaW4tcGFzc1wiPlBhc3N3b3JkPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZTtcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBpZD1cImFkbWluLXBhc3NcIiB0eXBlPVwiJHthZG1pblVpU3RhdGUuc2hvd1Bhc3MgPyAndGV4dCcgOiAncGFzc3dvcmQnfVwiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPVwi4oCi4oCi4oCi4oCi4oCi4oCi4oCi4oCiXCIgc3R5bGU9XCJwYWRkaW5nLXJpZ2h0OjY0cHg7XCIgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtcGFzcy12aXNcIiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO3JpZ2h0OjhweDt0b3A6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC01MCUpO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjAuODJyZW07Y29sb3I6dmFyKC0tcHJpbWFyeSk7Zm9udC13ZWlnaHQ6NjAwO1wiPlxuICAgICAgICAgICAgICAgICR7YWRtaW5VaVN0YXRlLnNob3dQYXNzID8gJ0hpZGUnIDogJ1Nob3cnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO1wiPkxvZ2luIHdpdGggRW1haWw8L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuXG4gICAgICAgIDxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW46MTRweCAwO2ZvbnQtc2l6ZTowLjgycmVtO2NvbG9yOnZhcigtLW11dGVkKTtcIj5vcjwvZGl2PlxuXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJ3aWR0aDoxMDAlO1wiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZ29vZ2xlLWxvZ2luXCI+XG4gICAgICAgICAgQ29udGludWUgd2l0aCBHb29nbGUgKE93bmVyKVxuICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICA8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLXRvcDoxNnB4O1wiPlxuICAgICAgICAgIDxhIGhyZWY9XCIjaG9tZVwiIHN0eWxlPVwiZm9udC1zaXplOjAuODVyZW07Y29sb3I6dmFyKC0tcHJpbWFyeSk7Zm9udC13ZWlnaHQ6NjAwO1wiPuKGkCBSZXR1cm4gdG8gU3RvcmVmcm9udDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L21haW4+XG4gIGA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFjdGl2ZUFkbWluVGFiKCkge1xuICBzd2l0Y2ggKGFkbWluVWlTdGF0ZS50YWIpIHtcbiAgICBjYXNlICdkYXNoYm9hcmQnOiByZXR1cm4gcmVuZGVyRGFzaGJvYXJkVGFiKCk7XG4gICAgY2FzZSAncHJvZHVjdHMnOiByZXR1cm4gcmVuZGVyUHJvZHVjdHNUYWIoKTtcbiAgICBjYXNlICdjYXRlZ29yaWVzJzogcmV0dXJuIHJlbmRlckNhdGVnb3JpZXNUYWIoKTtcbiAgICBjYXNlICdvcmRlcnMnOiByZXR1cm4gcmVuZGVyT3JkZXJzVGFiKCk7XG4gICAgY2FzZSAnYmxvZyc6IHJldHVybiByZW5kZXJCbG9nVGFiKCk7XG4gICAgY2FzZSAncmV2aWV3cyc6IHJldHVybiByZW5kZXJSZXZpZXdzVGFiKCk7XG4gICAgY2FzZSAnYmFubmVycyc6IHJldHVybiByZW5kZXJCYW5uZXJzVGhlbWVUYWIoKTtcbiAgICBjYXNlICdicmFuZGluZyc6IHJldHVybiByZW5kZXJCcmFuZGluZ1RhYigpO1xuICAgIGNhc2UgJ2Fkcyc6IHJldHVybiByZW5kZXJBZHNUYWIoKTtcbiAgICBjYXNlICdzZXR0aW5ncyc6IHJldHVybiByZW5kZXJTZXR0aW5nc1RhYigpO1xuICAgIGNhc2UgJ2JhY2t1cCc6IHJldHVybiByZW5kZXJCYWNrdXBUYWIoKTtcbiAgICBkZWZhdWx0OiByZXR1cm4gcmVuZGVyRGFzaGJvYXJkVGFiKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyRGFzaGJvYXJkVGFiKCkge1xuICBjb25zdCBwcm9kcyA9IHN0YXRlLnByb2R1Y3RzO1xuICBjb25zdCBhY3RpdmVPcmRlcnMgPSBzdGF0ZS5vcmRlcnMuZmlsdGVyKChvKSA9PiBvLnN0YXR1cyAhPT0gJ0NhbmNlbGxlZCcpO1xuICBjb25zdCB0b2RheVN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgdG9kYXlTdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgY29uc3QgbmV3VG9kYXkgPSBzdGF0ZS5vcmRlcnMuZmlsdGVyKChvKSA9PiBnZXRPcmRlclRpbWVzdGFtcChvKSA+PSB0b2RheVN0YXJ0LmdldFRpbWUoKSkubGVuZ3RoO1xuXG4gIGNvbnN0IHRvdGFsU2FsZXMgPSBhY3RpdmVPcmRlcnMucmVkdWNlKChzLCBvKSA9PiBzICsgKE51bWJlcihvLnRvdGFsKSB8fCAwKSwgMCk7XG4gIGNvbnN0IG9yZGVyVW5pdHMgPSBhY3RpdmVPcmRlcnMucmVkdWNlKChzLCBvKSA9PiBzICsgKG8uaXRlbXMgfHwgW10pLnJlZHVjZSgoaywgaSkgPT4gayArIChOdW1iZXIoaS5xdHkpIHx8IDEpLCAwKSwgMCk7XG4gIGNvbnN0IHByb2REZW1vVW5pdHMgPSBwcm9kcy5yZWR1Y2UoKHMsIHApID0+IHMgKyAoTnVtYmVyKHAudW5pdHNTb2xkKSB8fCAwKSwgMCk7XG4gIGNvbnN0IHRvdGFsVW5pdHNTb2xkID0gTWF0aC5tYXgob3JkZXJVbml0cywgcHJvZERlbW9Vbml0cyk7XG5cbiAgY29uc3QgdG90YWxTdG9jayA9IHByb2RzLnJlZHVjZSgocywgcCkgPT4gcyArIChOdW1iZXIocC5zdG9jaykgfHwgMCksIDApO1xuICBjb25zdCBsb3dTdG9ja0xpc3QgPSBwcm9kcy5maWx0ZXIoKHApID0+IChwLnN0b2NrIHx8IDApID4gMCAmJiBwLnN0b2NrIDw9IDUpO1xuICBjb25zdCBvdXRTdG9ja0NvdW50ID0gcHJvZHMuZmlsdGVyKChwKSA9PiAocC5zdG9jayB8fCAwKSA8PSAwKS5sZW5ndGg7XG5cbiAgY29uc3QgYmVzdFNlbGxlcnMgPSBbLi4ucHJvZHNdXG4gICAgLnNvcnQoKGEsIGIpID0+IChiLnVuaXRzU29sZCB8fCAwKSAtIChhLnVuaXRzU29sZCB8fCAwKSlcbiAgICAuc2xpY2UoMCwgNSk7XG5cbiAgY29uc3QgbGF0ZXN0T3JkZXJzID0gc3RhdGUub3JkZXJzLnNsaWNlKDAsIDUpO1xuXG4gIC8vIEJ1aWxkIFNWRyBTYWxlcyBDaGFydCBmb3IgbGFzdCA3IG9yIDMwIGRheXNcbiAgY29uc3QgZGF5cyA9IGFkbWluVWlTdGF0ZS5jaGFydERheXM7XG4gIGNvbnN0IGJ1Y2tldHMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IGRheXMgLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xuICAgIGQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3QgbmV4dCA9IGQuZ2V0VGltZSgpICsgODY0MDAwMDA7XG4gICAgY29uc3Qgc3VtID0gYWN0aXZlT3JkZXJzXG4gICAgICAuZmlsdGVyKChvKSA9PiB7XG4gICAgICAgIGNvbnN0IHRzID0gZ2V0T3JkZXJUaW1lc3RhbXAobyk7XG4gICAgICAgIHJldHVybiB0cyA+PSBkLmdldFRpbWUoKSAmJiB0cyA8IG5leHQ7XG4gICAgICB9KVxuICAgICAgLnJlZHVjZSgoYWNjLCBvKSA9PiBhY2MgKyAoTnVtYmVyKG8udG90YWwpIHx8IDApLCAwKTtcbiAgICBidWNrZXRzLnB1c2goe1xuICAgICAgbGFiZWw6IGAke2QuZ2V0RGF0ZSgpfS8ke2QuZ2V0TW9udGgoKSArIDF9YCxcbiAgICAgIHZhbHVlOiBzdW1cbiAgICB9KTtcbiAgfVxuICBjb25zdCBtYXhWYWwgPSBNYXRoLm1heCgxMDAwLCAuLi5idWNrZXRzLm1hcCgoYikgPT4gYi52YWx1ZSkpO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MjBweDtcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJrcGktZ3JpZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+VG90YWwgUHJvZHVjdHM8L2Rpdj48ZGl2IGNsYXNzPVwia3BpLXZhbHVlXCI+JHtwcm9kcy5sZW5ndGh9PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJrcGktY2FyZFwiPjxkaXYgY2xhc3M9XCJrcGktbGFiZWxcIj5Ub3RhbCBPcmRlcnM8L2Rpdj48ZGl2IGNsYXNzPVwia3BpLXZhbHVlXCI+JHtzdGF0ZS5vcmRlcnMubGVuZ3RofTwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+TmV3IE9yZGVycyBUb2RheTwvZGl2PjxkaXYgY2xhc3M9XCJrcGktdmFsdWVcIj4ke25ld1RvZGF5fTwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+VG90YWwgU2FsZXM8L2Rpdj48ZGl2IGNsYXNzPVwia3BpLXZhbHVlXCIgc3R5bGU9XCJjb2xvcjp2YXIoLS1wcmltYXJ5KTtcIj4ke2Zvcm1hdFByaWNlKHRvdGFsU2FsZXMpfTwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+VG90YWwgVW5pdHMgU29sZDwvZGl2PjxkaXYgY2xhc3M9XCJrcGktdmFsdWVcIj4ke3RvdGFsVW5pdHNTb2xkfTwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+VG90YWwgU3RvY2sgVW5pdHM8L2Rpdj48ZGl2IGNsYXNzPVwia3BpLXZhbHVlXCI+JHt0b3RhbFN0b2NrfTwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLWNhcmRcIj48ZGl2IGNsYXNzPVwia3BpLWxhYmVsXCI+TG93IFN0b2NrIFByb2R1Y3RzPC9kaXY+PGRpdiBjbGFzcz1cImtwaS12YWx1ZVwiIHN0eWxlPVwiY29sb3I6I2I0NTMwOTtcIj4ke2xvd1N0b2NrTGlzdC5sZW5ndGh9PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJrcGktY2FyZFwiPlxuICAgICAgICAgICR7b3V0U3RvY2tDb3VudCA+IDAgPyAnPHNwYW4gY2xhc3M9XCJhZG1pbi1vb3MtZG90XCIgdGl0bGU9XCJPdXQgb2Ygc3RvY2sgcHJvZHVjdHMgYWxlcnRcIj48L3NwYW4+JyA6ICcnfVxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJrcGktbGFiZWxcIj5PdXQgb2YgU3RvY2s8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwia3BpLXZhbHVlXCIgc3R5bGU9XCJjb2xvcjojYjkxYzFjO1wiPiR7b3V0U3RvY2tDb3VudH08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLWJvdHRvbToxNHB4O2ZsZXgtd3JhcDp3cmFwO2dhcDoxMHB4O1wiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO2ZvbnQtc2l6ZToxLjFyZW07XCI+U2FsZXMgT3ZlcnZpZXcgKExhc3QgJHtkYXlzfSBEYXlzKTwvaDI+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtnYXA6OHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtICR7ZGF5cyA9PT0gNyA/ICdidG4tcHJpbWFyeScgOiAnYnRuLW91dGxpbmUnfVwiIGRhdGEtYWN0aW9uPVwiY2hhcnQtZGF5c1wiIGRhdGEtZGF5cz1cIjdcIj43IERheXM8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSAke2RheXMgPT09IDMwID8gJ2J0bi1wcmltYXJ5JyA6ICdidG4tb3V0bGluZSd9XCIgZGF0YS1hY3Rpb249XCJjaGFydC1kYXlzXCIgZGF0YS1kYXlzPVwiMzBcIj4zMCBEYXlzPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgNzAwIDE4MFwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTgwcHg7ZGlzcGxheTpibG9jaztcIj5cbiAgICAgICAgICAke2J1Y2tldHMubWFwKChiLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3ID0gNjgwIC8gYnVja2V0cy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBiYXJIID0gTWF0aC5tYXgoNCwgTWF0aC5yb3VuZCgoYi52YWx1ZSAvIG1heFZhbCkgKiAxMzUpKTtcbiAgICAgICAgICAgIGNvbnN0IHggPSAxMCArIGkgKiB3ICsgdyAqIDAuMTU7XG4gICAgICAgICAgICBjb25zdCB5ID0gMTUwIC0gYmFySDtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIke3h9XCIgeT1cIiR7eX1cIiB3aWR0aD1cIiR7TWF0aC5tYXgoNCwgdyAqIDAuNyl9XCIgaGVpZ2h0PVwiJHtiYXJIfVwiIHJ4PVwiNFwiIGZpbGw9XCJ2YXIoLS1wcmltYXJ5KVwiPlxuICAgICAgICAgICAgICAgIDx0aXRsZT4ke2IubGFiZWx9OiAke2Zvcm1hdFByaWNlKGIudmFsdWUpfTwvdGl0bGU+XG4gICAgICAgICAgICAgIDwvcmVjdD5cbiAgICAgICAgICAgICAgJHtkYXlzID09PSA3IHx8IGkgJSA1ID09PSAwID8gYDx0ZXh0IHg9XCIke3ggKyB3ICogMC4zNX1cIiB5PVwiMTcwXCIgdGV4dC1hbmNob3I9XCJtaWRkbGVcIiBmb250LXNpemU9XCIxMFwiIGZpbGw9XCIjNmI3MjgwXCI+JHtiLmxhYmVsfTwvdGV4dD5gIDogJyd9XG4gICAgICAgICAgICBgO1xuICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KDMwMHB4LDFmcikpO2dhcDoxOHB4O1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTJweDtmb250LXNpemU6MS4wNXJlbTtcIj5CZXN0IFNlbGxpbmcgUHJvZHVjdHM8L2gyPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjEwcHg7XCI+XG4gICAgICAgICAgICAke2Jlc3RTZWxsZXJzLm1hcCgocCkgPT4gYFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtmb250LXNpemU6MC44OHJlbTtwYWRkaW5nLWJvdHRvbTo4cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtcIj4ke2VzY0h0bWwocC5uYW1lKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIiBzdHlsZT1cIndoaXRlLXNwYWNlOm5vd3JhcDtjb2xvcjp2YXIoLS1wcmltYXJ5KTtmb250LXdlaWdodDo3MDA7XCI+JHtwLnVuaXRzU29sZCB8fCAwfSBzb2xkIMK3ICR7Zm9ybWF0UHJpY2UoKHAudW5pdHNTb2xkIHx8IDApICogcC5wcmljZSl9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTJweDtmb250LXNpemU6MS4wNXJlbTtcIj5Mb3cgU3RvY2sgQWxlcnRzICgmbGU7IDUgdW5pdHMpPC9oMj5cbiAgICAgICAgICAke2xvd1N0b2NrTGlzdC5sZW5ndGhcbiAgICAgICAgICAgID8gYDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgICAke2xvd1N0b2NrTGlzdC5tYXAoKHApID0+IGBcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47Zm9udC1zaXplOjAuODhyZW07cGFkZGluZy1ib3R0b206NnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7ZXNjSHRtbChwLm5hbWUpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInN0YXR1cy1QZW5kaW5nXCI+JHtwLnN0b2NrfSBsZWZ0PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICAgICAgOiAnPHAgc3R5bGU9XCJjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOjAuOXJlbTtcIj5BbGwgcHJvZHVjdHMgaGF2ZSBoZWFsdGh5IGludmVudG9yeSBsZXZlbHMuPC9wPidcbiAgICAgICAgICB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTJweDtmb250LXNpemU6MS4wNXJlbTtcIj5MYXRlc3QgNSBPcmRlcnM8L2gyPlxuICAgICAgICAke2xhdGVzdE9yZGVycy5sZW5ndGhcbiAgICAgICAgICA/IGA8ZGl2IGNsYXNzPVwiYWRtaW4tdGFibGUtd3JhcFwiIHN0eWxlPVwiYm94LXNoYWRvdzpub25lO1wiPlxuICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJhZG1pbi10YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD48dHI+PHRoPk9yZGVyPC90aD48dGg+Q3VzdG9tZXI8L3RoPjx0aD5EaXN0cmljdDwvdGg+PHRoPlRvdGFsPC90aD48dGg+U3RhdHVzPC90aD48L3RyPjwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgJHtsYXRlc3RPcmRlcnMubWFwKChvKSA9PiBgXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj48c3Ryb25nPiR7ZXNjSHRtbChvLm9yZGVyQ29kZSl9PC9zdHJvbmc+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtlc2NIdG1sKG8uY3VzdG9tZXJOYW1lKX08YnI+PHNtYWxsIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO1wiPiR7ZXNjSHRtbChvLnBob25lKX08L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPiR7ZXNjSHRtbChbby51cGF6aWxhLCBvLmRpc3RyaWN0LCBvLmRpdmlzaW9uXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKSB8fCBvLmRpc3RyaWN0KX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInRhYnVsYXItbnVtc1wiPjxzdHJvbmc+JHtmb3JtYXRQcmljZShvLnRvdGFsKX08L3N0cm9uZz48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy10ZXh0IHN0YXR1cy0ke2VzY0h0bWwoby5zdGF0dXMpfVwiPiR7ZXNjSHRtbChvLnN0YXR1cyl9PC9zcGFuPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICAgIDogJzxwIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTowLjlyZW07XCI+Tm8gY3VzdG9tZXIgb3JkZXJzIHlldC4gT3JkZXJzIHBsYWNlZCBvbiB0aGUgc3RvcmVmcm9udCBhcHBlYXIgaGVyZSBpbiByZWFsIHRpbWUuPC9wPidcbiAgICAgICAgfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb2R1Y3RzVGFiKCkge1xuICBjb25zdCBxID0gYWRtaW5VaVN0YXRlLnByb2RTZWFyY2gudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgY2F0ID0gYWRtaW5VaVN0YXRlLnByb2RDYXRGaWx0ZXI7XG4gIGNvbnN0IGZpbHRlcmVkID0gc3RhdGUucHJvZHVjdHMuZmlsdGVyKChwKSA9PiB7XG4gICAgY29uc3QgbWF0Y2hDYXQgPSBjYXQgPT09ICdBbGwnIHx8IHAuY2F0ZWdvcnkgPT09IGNhdDtcbiAgICBjb25zdCBtYXRjaFEgPSAhcSB8fCBwLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSB8fCAocC5icmFuZCB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSB8fCAocC5za3UgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSk7XG4gICAgcmV0dXJuIG1hdGNoQ2F0ICYmIG1hdGNoUTtcbiAgfSk7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dhcDoxNnB4O1wiPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6MTBweDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjEwcHg7ZmxleDoxO2FsaWduLWl0ZW1zOmNlbnRlcjtcIj5cbiAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiYWRtaW4tcHJvZC1zZWFyY2hcIiBzdHlsZT1cIm1heC13aWR0aDoyNjBweDtcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaCBwcm9kdWN0cy4uLlwiIHZhbHVlPVwiJHtlc2NIdG1sKGFkbWluVWlTdGF0ZS5wcm9kU2VhcmNoKX1cIiAvPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1mbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDo4cHg7YWxpZ24taXRlbXM6Y2VudGVyO1wiPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwiYWRtaW4tcHJvZC1jYXRcIiBzdHlsZT1cIndpZHRoOmF1dG87bWluLXdpZHRoOjE4NXB4O21heC13aWR0aDoyMzBweDtcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIkFsbFwiPkFsbCBDYXRlZ29yaWVzPC9vcHRpb24+XG4gICAgICAgICAgICAgICR7c3RhdGUuY2F0ZWdvcmllcy5tYXAoKGMpID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NIdG1sKGMubmFtZSl9XCIgJHtjYXQgPT09IGMubmFtZSA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NIdG1sKGMubmFtZSl9PC9vcHRpb24+YCkuam9pbignJyl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tcXVpY2stZWRpdC1jYXRcIiB0aXRsZT1cIlJlbmFtZSBvciBlZGl0IGEgY2F0ZWdvcnlcIj7inI/vuI8gRWRpdCBDYXRlZ29yeTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tYWRkLXByb2R1Y3RcIj4rIEFkZCBQcm9kdWN0PC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImFkbWluLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiYWRtaW4tdGFibGVcIj5cbiAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICA8dHI+PHRoPlByb2R1Y3Q8L3RoPjx0aD5QcmljZTwvdGg+PHRoPlN0b2NrPC90aD48dGg+U29sZDwvdGg+PHRoPlN0YXR1czwvdGg+PHRoPkFjdGlvbnM8L3RoPjwvdHI+XG4gICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAke2ZpbHRlcmVkLm1hcCgocCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdCA9IGdldFN0b2NrQmFkZ2UocC5zdG9jayk7XG4gICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7ZXNjSHRtbChnZXRQcm9kdWN0SW1hZ2UocCwgMCkpfVwiIGFsdD1cIlwiIHN0eWxlPVwid2lkdGg6NDRweDtoZWlnaHQ6NDRweDtib3JkZXItcmFkaXVzOjhweDtvYmplY3QtZml0OmNvdmVyO2JhY2tncm91bmQ6dmFyKC0tYmcpO1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+JHtlc2NIdG1sKHAubmFtZSl9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjAuNzhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPiR7ZXNjSHRtbChwLmNhdGVnb3J5KX0gwrcgJHtlc2NIdG1sKHAuYnJhbmQgfHwgJycpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj48c3Ryb25nPiR7Zm9ybWF0UHJpY2UocC5wcmljZSl9PC9zdHJvbmc+PC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInRhYnVsYXItbnVtc1wiPiR7cC5zdG9ja308L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwidGFidWxhci1udW1zXCI+JHtwLnVuaXRzU29sZCB8fCAwfTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQ+PHNwYW4gY2xhc3M9XCJzdGF0dXMtdGV4dCAke3N0LmNsc31cIj4ke2VzY0h0bWwoc3QubGFiZWwpfTwvc3Bhbj48L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo2cHg7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1lZGl0LXByb2R1Y3RcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPkVkaXQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWRhbmdlclwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZGVsLXByb2R1Y3RcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPkRlbGV0ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvZHVjdEVkaXRvck1vZGFsKHByb2RPck5ldykge1xuICBjb25zdCBpc05ldyA9IHByb2RPck5ldyA9PT0gJ25ldyc7XG4gIGNvbnN0IHAgPSBpc05ld1xuICAgID8ge1xuICAgICAgICBuYW1lOiAnJywgY2F0ZWdvcnk6IHN0YXRlLmNhdGVnb3JpZXNbMF0/Lm5hbWUgfHwgJ1Bob25lcycsIGJyYW5kOiAnJywgcHJpY2U6IDAsIG9sZFByaWNlOiAwLFxuICAgICAgICBzdG9jazogMTAsIHVuaXRzU29sZDogMCwgc2t1OiAnJywgcmF0aW5nOiA0LjgsIHJldmlld0NvdW50OiAwLCBzaG9ydERlc2NyaXB0aW9uOiAnJywgZnVsbERlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgZmVhdHVyZXM6IFtdLCBzcGVjczogW3sga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzEgWWVhciBPZmZpY2lhbCcgfV0sIG9wdGlvbnM6IFtdLCB0YWdzOiBbXSxcbiAgICAgICAgaW1hZ2VzOiBbJycsICcnLCAnJywgJycsICcnXSwgdmlkZW9Vcmw6ICcnLCB2aWRlb1Bvc3RlcjogJycsXG4gICAgICAgIGRlbGl2ZXJ5SW5mbzogJ0luc2lkZSBEaGFrYSDgp7M2MCAoMjQtNDhoKS4gT3V0c2lkZSBEaGFrYSDgp7MxMjAgKDItNCBkYXlzKS4nLFxuICAgICAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSBlYXN5IHJlcGxhY2VtZW50LicsXG4gICAgICAgIGlzRmVhdHVyZWQ6IGZhbHNlLCBpc0ZsYXNoU2FsZTogZmFsc2UsIGlzVHJlbmRpbmc6IGZhbHNlLCBpc05ld0Fycml2YWw6IHRydWVcbiAgICAgIH1cbiAgICA6IHByb2RPck5ldztcbiAgY29uc3QgaW1ncyA9IEFycmF5LmlzQXJyYXkocC5pbWFnZXMpID8gWy4uLnAuaW1hZ2VzLCAnJywgJycsICcnLCAnJywgJyddLnNsaWNlKDAsIDUpIDogWycnLCAnJywgJycsICcnLCAnJ107XG4gIGNvbnN0IHNwZWNzID0gQXJyYXkuaXNBcnJheShwLnNwZWNzKSAmJiBwLnNwZWNzLmxlbmd0aCA/IHAuc3BlY3MgOiBbeyBrZXk6ICcnLCB2YWx1ZTogJycgfV07XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtb3ZlcmxheVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLWJvdHRvbToxNHB4O1wiPlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO1wiPiR7aXNOZXcgPyAnQWRkIE5ldyBQcm9kdWN0JyA6ICdFZGl0IFByb2R1Y3QnfTwvaDI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1jbG9zZS1tb2RhbFwiPkNsb3NlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxmb3JtIGlkPVwiYWRtaW4tcHJvZHVjdC1mb3JtXCIgZGF0YS1pcy1uZXc9XCIke2lzTmV3fVwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocC5pZCB8fCAnJyl9XCIgY2xhc3M9XCJmb3JtLWdyaWRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlByb2R1Y3QgTmFtZSAqPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJuYW1lXCIgcmVxdWlyZWQgdmFsdWU9XCIke2VzY0h0bWwocC5uYW1lKX1cIiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkNhdGVnb3J5ICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZmllbGQtc2VsZWN0XCIgbmFtZT1cImNhdGVnb3J5XCI+XG4gICAgICAgICAgICAgICAgJHtzdGF0ZS5jYXRlZ29yaWVzLm1hcCgoYykgPT4gYDxvcHRpb24gdmFsdWU9XCIke2VzY0h0bWwoYy5uYW1lKX1cIiAke3AuY2F0ZWdvcnkgPT09IGMubmFtZSA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NIdG1sKGMubmFtZSl9PC9vcHRpb24+YCkuam9pbignJyl9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkJyYW5kPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJicmFuZFwiIHZhbHVlPVwiJHtlc2NIdG1sKHAuYnJhbmQgfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+U0tVPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJza3VcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwLnNrdSB8fCAnJyl9XCIgLz48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UHJpY2UgKOCnsykgKjwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cInByaWNlXCIgcmVxdWlyZWQgbWluPVwiMFwiIHZhbHVlPVwiJHtOdW1iZXIocC5wcmljZSkgfHwgMH1cIiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPk9sZCBQcmljZSAo4KezKTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cIm9sZFByaWNlXCIgbWluPVwiMFwiIHZhbHVlPVwiJHtOdW1iZXIocC5vbGRQcmljZSkgfHwgMH1cIiAvPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5TdG9jayBRdWFudGl0eSAqPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwic3RvY2tcIiByZXF1aXJlZCBtaW49XCIwXCIgdmFsdWU9XCIke051bWJlcihwLnN0b2NrKSB8fCAwfVwiIC8+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UmF0aW5nICgxLjAgLSA1LjApPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4xXCIgbWluPVwiMVwiIG1heD1cIjVcIiBuYW1lPVwicmF0aW5nXCIgdmFsdWU9XCIke051bWJlcihwLnJhdGluZykgfHwgNC43fVwiIC8+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+U2hvcnQgRGVzY3JpcHRpb248L2xhYmVsPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cInNob3J0RGVzY3JpcHRpb25cIiB2YWx1ZT1cIiR7ZXNjSHRtbChwLnNob3J0RGVzY3JpcHRpb24gfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkZ1bGwgRGVzY3JpcHRpb248L2xhYmVsPjx0ZXh0YXJlYSBjbGFzcz1cImZpZWxkLXRleHRhcmVhXCIgbmFtZT1cImZ1bGxEZXNjcmlwdGlvblwiPiR7ZXNjSHRtbChwLmZ1bGxEZXNjcmlwdGlvbiB8fCAnJyl9PC90ZXh0YXJlYT48L2Rpdj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+S2V5IEZlYXR1cmVzIChvbmUgcGVyIGxpbmUpPC9sYWJlbD48dGV4dGFyZWEgY2xhc3M9XCJmaWVsZC10ZXh0YXJlYVwiIG5hbWU9XCJmZWF0dXJlc1wiPiR7ZXNjSHRtbCgocC5mZWF0dXJlcyB8fCBbXSkuam9pbignXFxuJykpfTwvdGV4dGFyZWE+PC9kaXY+XG5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLWJvdHRvbTo2cHg7XCI+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgc3R5bGU9XCJtYXJnaW46MDtcIj5TcGVjaWZpY2F0aW9uczwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRkLXNwZWMtcm93XCI+KyBBZGQgUm93PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJzcGVjLXJvd3MtY29udGFpbmVyXCIgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgJHtzcGVjcy5tYXAoKHMpID0+IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlYy1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDtnYXA6OHB4O1wiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgc3BlYy1rZXlcIiBwbGFjZWhvbGRlcj1cIlNwZWMgbmFtZSAoZS5nLiBEaXNwbGF5KVwiIHZhbHVlPVwiJHtlc2NIdG1sKHMua2V5IHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgc3BlYy12YWxcIiBwbGFjZWhvbGRlcj1cIlZhbHVlIChlLmcuIDYuNyZxdW90OyBBTU9MRUQpXCIgdmFsdWU9XCIke2VzY0h0bWwocy52YWx1ZSB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCIgb25jbGljaz1cInRoaXMucGFyZW50RWxlbWVudC5yZW1vdmUoKVwiPsOXPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkNvbG9yIC8gU2l6ZSBPcHRpb25zIChjb21tYS1zZXBhcmF0ZWQpPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJvcHRpb25zXCIgdmFsdWU9XCIke2VzY0h0bWwoKHAub3B0aW9ucyB8fCBbXSkuam9pbignLCAnKSl9XCIgLz48L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5UYWdzIChjb21tYS1zZXBhcmF0ZWQpPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJ0YWdzXCIgdmFsdWU9XCIke2VzY0h0bWwoKHAudGFncyB8fCBbXSkuam9pbignLCAnKSl9XCIgLz48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlByb2R1Y3QgSW1hZ2VzIChVcCB0byA1IOKAlCBQYXN0ZSBVUkwgb3IgVXBsb2FkKTwvbGFiZWw+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dhcDo4cHg7XCI+XG4gICAgICAgICAgICAgICR7aW1ncy5tYXAoKHVybCwgaWR4KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtnYXA6OHB4O2FsaWduLWl0ZW1zOmNlbnRlcjtcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IHByb2QtaW1nLWlucHV0XCIgZGF0YS1pbWctaW5kZXg9XCIke2lkeH1cIiBwbGFjZWhvbGRlcj1cIkltYWdlIFVSTCAke2lkeCArIDF9XCIgdmFsdWU9XCIke2VzY0h0bWwodXJsKX1cIiAvPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICAgIFVwbG9hZCA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgaGlkZGVuIGRhdGEtdXBsb2FkLXRhcmdldD1cInByb2QtaW1nLSR7aWR4fVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UHJvZHVjdCBWaWRlbyAoTVA0L1dlYk0gVXBsb2FkIG9yIFlvdVR1YmUvRkIgVVJMKTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJ2aWRlb1VybFwiIGlkPVwicHJvZC12aWRlby11cmxcIiBwbGFjZWhvbGRlcj1cImh0dHBzOi8veW91dHViZS5jb20vLi4uIG9yIC5tcDRcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwLnZpZGVvVXJsIHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBzdHlsZT1cImN1cnNvcjpwb2ludGVyO1wiPlxuICAgICAgICAgICAgICAgICAgVXBsb2FkIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cInZpZGVvL21wNCx2aWRlby93ZWJtXCIgaGlkZGVuIGRhdGEtdXBsb2FkLXRhcmdldD1cInByb2QtdmlkZW9cIiAvPlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlZpZGVvIFBvc3RlciBJbWFnZSAoT3B0aW9uYWwpPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtnYXA6OHB4O1wiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cInZpZGVvUG9zdGVyXCIgaWQ9XCJwcm9kLXZpZGVvLXBvc3RlclwiIHZhbHVlPVwiJHtlc2NIdG1sKHAudmlkZW9Qb3N0ZXIgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICBVcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJwcm9kLXBvc3RlclwiIC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjE0cHg7cGFkZGluZzoxMHB4O2JhY2tncm91bmQ6dmFyKC0tYmcpO2JvcmRlci1yYWRpdXM6MTBweDtcIj5cbiAgICAgICAgICAgIDxsYWJlbD48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImlzRmVhdHVyZWRcIiAke3AuaXNGZWF0dXJlZCA/ICdjaGVja2VkJyA6ICcnfSAvPiBGZWF0dXJlZDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJpc0ZsYXNoU2FsZVwiICR7cC5pc0ZsYXNoU2FsZSA/ICdjaGVja2VkJyA6ICcnfSAvPiBGbGFzaCBTYWxlPC9sYWJlbD5cbiAgICAgICAgICAgIDxsYWJlbD48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImlzVHJlbmRpbmdcIiAke3AuaXNUcmVuZGluZyA/ICdjaGVja2VkJyA6ICcnfSAvPiBUcmVuZGluZzwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJpc05ld0Fycml2YWxcIiAke3AuaXNOZXdBcnJpdmFsID8gJ2NoZWNrZWQnIDogJyd9IC8+IE5ldyBBcnJpdmFsPC9sYWJlbD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1vZGFsXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBQcm9kdWN0PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDYXRlZ29yaWVzVGFiKCkge1xuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjE2cHg7XCI+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtcIj5cbiAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjA7XCI+Q2F0ZWdvcmllcyAoJHtzdGF0ZS5jYXRlZ29yaWVzLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tYWRkLWNhdFwiPisgQWRkIENhdGVnb3J5PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJhZG1pbi10YWJsZS13cmFwXCI+XG4gICAgICAgIDx0YWJsZSBjbGFzcz1cImFkbWluLXRhYmxlXCI+XG4gICAgICAgICAgPHRoZWFkPjx0cj48dGg+T3JkZXI8L3RoPjx0aD5JY29uPC90aD48dGg+RW5nbGlzaCBOYW1lPC90aD48dGg+QmFuZ2xhIE5hbWU8L3RoPjx0aD5BY3Rpb25zPC90aD48L3RyPjwvdGhlYWQ+XG4gICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgJHtzdGF0ZS5jYXRlZ29yaWVzLm1hcCgoYywgaWR4KSA9PiBgXG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj4ke2Muc29ydE9yZGVyIHx8IGlkeCArIDF9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtjLmltYWdlVXJsID8gYDxpbWcgc3JjPVwiJHtlc2NIdG1sKGMuaW1hZ2VVcmwpfVwiIHN0eWxlPVwid2lkdGg6MzZweDtoZWlnaHQ6MzZweDtib3JkZXItcmFkaXVzOjUwJTtvYmplY3QtZml0OmNvdmVyO1wiIC8+YCA6IGVzY0h0bWwoYy5pY29uIHx8ICfwn5uN77iPJyl9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+PHN0cm9uZz4ke2VzY0h0bWwoYy5uYW1lKX08L3N0cm9uZz48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT1cImZvbnQtZmFtaWx5OidIaW5kIFNpbGlndXJpJyxzYW5zLXNlcmlmO1wiPiR7ZXNjSHRtbChjLm5hbWVCbiB8fCAnJyl9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo2cHg7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiY2F0LW1vdmVcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKGMuaWQpfVwiIGRhdGEtZGlyPVwiLTFcIj7ihpE8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJjYXQtbW92ZVwiIGRhdGEtaWQ9XCIke2VzY0h0bWwoYy5pZCl9XCIgZGF0YS1kaXI9XCIxXCI+4oaTPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZWRpdC1jYXRcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKGMuaWQpfVwiPkVkaXQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1kYW5nZXJcIiBkYXRhLWFjdGlvbj1cImFkbWluLWRlbC1jYXRcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKGMuaWQpfVwiPkRlbGV0ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcnlFZGl0b3JNb2RhbChjYXRPck5ldykge1xuICBjb25zdCBpc05ldyA9IGNhdE9yTmV3ID09PSAnbmV3JztcbiAgY29uc3QgYyA9IGlzTmV3ID8geyBuYW1lOiAnJywgbmFtZUJuOiAnJywgaWNvbjogJ/Cfm43vuI8nLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogc3RhdGUuY2F0ZWdvcmllcy5sZW5ndGggKyAxIH0gOiBjYXRPck5ldztcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtb3ZlcmxheVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIiBzdHlsZT1cIm1heC13aWR0aDo1MDBweDtcIj5cbiAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjAgMCAxNHB4O1wiPiR7aXNOZXcgPyAnQWRkIENhdGVnb3J5JyA6ICdFZGl0IENhdGVnb3J5J308L2gyPlxuICAgICAgICA8Zm9ybSBpZD1cImFkbWluLWNhdC1mb3JtXCIgZGF0YS1pcy1uZXc9XCIke2lzTmV3fVwiIGRhdGEtaWQ9XCIke2VzY0h0bWwoYy5pZCB8fCAnJyl9XCIgY2xhc3M9XCJmb3JtLWdyaWRcIj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+RW5nbGlzaCBOYW1lICo8L2xhYmVsPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cIm5hbWVcIiByZXF1aXJlZCB2YWx1ZT1cIiR7ZXNjSHRtbChjLm5hbWUpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkJhbmdsYSBOYW1lPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJuYW1lQm5cIiB2YWx1ZT1cIiR7ZXNjSHRtbChjLm5hbWVCbiB8fCAnJyl9XCIgLz48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkVtb2ppIEljb248L2xhYmVsPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImljb25cIiB2YWx1ZT1cIiR7ZXNjSHRtbChjLmljb24gfHwgJ/Cfm43vuI8nKX1cIiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlNvcnQgT3JkZXI8L2xhYmVsPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJzb3J0T3JkZXJcIiB2YWx1ZT1cIiR7Yy5zb3J0T3JkZXIgfHwgMX1cIiAvPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkNhdGVnb3J5IEltYWdlIFVSTCAoT3B0aW9uYWwpPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwiaW1hZ2VVcmxcIiBpZD1cImNhdC1pbWctdXJsXCIgdmFsdWU9XCIke2VzY0h0bWwoYy5pbWFnZVVybCB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXI7XCI+VXBsb2FkIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBoaWRkZW4gZGF0YS11cGxvYWQtdGFyZ2V0PVwiY2F0LWltZ1wiIC8+PC9sYWJlbD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1vZGFsXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBDYXRlZ29yeTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Zvcm0+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUXVpY2tFZGl0Q2F0ZWdvcnlNb2RhbChzZWxlY3RlZENhdElkKSB7XG4gIGlmICghc3RhdGUuY2F0ZWdvcmllcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLW92ZXJsYXlcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIiBzdHlsZT1cIm1heC13aWR0aDo0NDBweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj5cbiAgICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MCAwIDEwcHg7XCI+RWRpdCBDYXRlZ29yeTwvaDI+XG4gICAgICAgICAgPHAgc3R5bGU9XCJjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luOjAgMCAxNnB4O1wiPk5vIGNhdGVnb3JpZXMgZXhpc3QgeWV0LiBBZGQgYSBjYXRlZ29yeSBmaXJzdC48L3A+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1vZGFsXCI+Q2xvc2U8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG4gIGNvbnN0IGFjdGl2ZUNhdCA9IHN0YXRlLmNhdGVnb3JpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gc2VsZWN0ZWRDYXRJZCkgfHwgc3RhdGUuY2F0ZWdvcmllc1swXTtcbiAgY29uc3QgYXNzaWduZWRDb3VudCA9IHN0YXRlLnByb2R1Y3RzLmZpbHRlcigocCkgPT4gcC5jYXRlZ29yeSA9PT0gYWN0aXZlQ2F0Lm5hbWUpLmxlbmd0aDtcblxuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1vdmVybGF5XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY2FyZFwiIHN0eWxlPVwibWF4LXdpZHRoOjUyMHB4O1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjttYXJnaW4tYm90dG9tOjE0cHg7XCI+XG4gICAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjA7XCI+RWRpdCBDYXRlZ29yeTwvaDI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1jbG9zZS1tb2RhbFwiPkNsb3NlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8Zm9ybSBpZD1cImFkbWluLXF1aWNrLWNhdC1mb3JtXCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChhY3RpdmVDYXQuaWQpfVwiIGNsYXNzPVwiZm9ybS1ncmlkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicXVpY2stZWRpdC1jYXQtc2VsZWN0XCI+U2VsZWN0IEV4aXN0aW5nIENhdGVnb3J5ICo8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIGlkPVwicXVpY2stZWRpdC1jYXQtc2VsZWN0XCIgbmFtZT1cImNhdGVnb3J5SWRcIj5cbiAgICAgICAgICAgICAgJHtzdGF0ZS5jYXRlZ29yaWVzLm1hcCgoYykgPT4gYFxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIke2VzY0h0bWwoYy5pZCl9XCIgJHtjLmlkID09PSBhY3RpdmVDYXQuaWQgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgICAgICAgJHtlc2NIdG1sKGMuaWNvbiB8fCAn8J+bje+4jycpfSAke2VzY0h0bWwoYy5uYW1lKX0ke2MubmFtZUJuID8gYCAoJHtlc2NIdG1sKGMubmFtZUJuKX0pYCA6ICcnfVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tdG9wOjVweDtcIj5cbiAgICAgICAgICAgICAgQ3VycmVudGx5IGFzc2lnbmVkIHRvIDxzdHJvbmc+JHthc3NpZ25lZENvdW50fTwvc3Ryb25nPiBwcm9kdWN0JHthc3NpZ25lZENvdW50ID09PSAxID8gJycgOiAncyd9LiBSZW5hbWluZyB1cGRhdGVzIGFsbCBhc3NpZ25lZCBwcm9kdWN0cyAmIGZpbHRlcnMgYXV0b21hdGljYWxseS5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicXVpY2stY2F0LW5hbWVcIj5DYXRlZ29yeSBUaXRsZSAoRW5nbGlzaCkgKjwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwicXVpY2stY2F0LW5hbWVcIiBuYW1lPVwibmFtZVwiIHJlcXVpcmVkIHZhbHVlPVwiJHtlc2NIdG1sKGFjdGl2ZUNhdC5uYW1lKX1cIiAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicXVpY2stY2F0LWJuXCI+QmFuZ2xhIE5hbWU8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwicXVpY2stY2F0LWJuXCIgbmFtZT1cIm5hbWVCblwiIHZhbHVlPVwiJHtlc2NIdG1sKGFjdGl2ZUNhdC5uYW1lQm4gfHwgJycpfVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwicXVpY2stY2F0LWljb25cIj5FbW9qaSBJY29uPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBpZD1cInF1aWNrLWNhdC1pY29uXCIgbmFtZT1cImljb25cIiB2YWx1ZT1cIiR7ZXNjSHRtbChhY3RpdmVDYXQuaWNvbiB8fCAn8J+bje+4jycpfVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2dhcDoxMHB4O21hcmdpbi10b3A6NHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1vZGFsXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBDYXRlZ29yeSBDaGFuZ2VzPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb25maXJtRGVsZXRlTW9kYWwoY2ZnKSB7XG4gIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLW92ZXJsYXlcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jYXJkXCIgc3R5bGU9XCJtYXgtd2lkdGg6NDQwcHg7XCI+XG4gICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgOHB4O2ZvbnQtc2l6ZToxLjJyZW07Y29sb3I6I2I5MWMxYztcIj4ke2VzY0h0bWwoY2ZnLnRpdGxlIHx8ICdDb25maXJtIERlbGV0ZScpfTwvaDI+XG4gICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjAgMCAyMHB4O2NvbG9yOnZhcigtLXRleHQpO2ZvbnQtc2l6ZTowLjkzcmVtO2xpbmUtaGVpZ2h0OjEuNTtcIj4ke2VzY0h0bWwoY2ZnLm1lc3NhZ2UgfHwgJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBpdGVtPyBUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLicpfTwvcD5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7Z2FwOjEwcHg7XCI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNhbmNlbC1kZWxldGVcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1jb25maXJtLWRlbGV0ZVwiPiR7ZXNjSHRtbChjZmcuY29uZmlybUxhYmVsIHx8ICdEZWxldGUnKX08L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyT3JkZXJzVGFiKCkge1xuICBjb25zdCBzdGF0dXNlcyA9IFsnUGVuZGluZycsICdDb25maXJtZWQnLCAnU2hpcHBlZCcsICdEZWxpdmVyZWQnLCAnQ2FuY2VsbGVkJ107XG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTZweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO2ZsZXgtd3JhcDp3cmFwO2dhcDoxMHB4O1wiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtcIj5PcmRlcnMgKCR7c3RhdGUub3JkZXJzLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MC44NXJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7XCI+UmVhbC10aW1lIFN5bmMgwrcgRGl2aXNpb24gLyBEaXN0cmljdCAvIFVwYXppbGEgVmVyaWZpZWQgwrcgQ2FuY2VsbGluZyByZXN0b3JlcyBzdG9jazwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgJHtzdGF0ZS5vcmRlcnMubGVuZ3RoXG4gICAgICAgID8gYDxkaXYgY2xhc3M9XCJhZG1pbi10YWJsZS13cmFwXCI+XG4gICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJhZG1pbi10YWJsZVwiPlxuICAgICAgICAgICAgICA8dGhlYWQ+PHRyPjx0aD5PcmRlcjwvdGg+PHRoPkN1c3RvbWVyICYgRnVsbCBTaGlwcGluZyBBZGRyZXNzPC90aD48dGg+SXRlbXM8L3RoPjx0aD5Ub3RhbDwvdGg+PHRoPlBheW1lbnQ8L3RoPjx0aD5TdGF0dXM8L3RoPjx0aD5BY3Rpb248L3RoPjwvdHI+PC90aGVhZD5cbiAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICR7c3RhdGUub3JkZXJzLm1hcCgobykgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbEFyZWEgPSBbby51cGF6aWxhLCBvLmRpc3RyaWN0LCBvLmRpdmlzaW9uXS5maWx0ZXIoQm9vbGVhbikuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc0Nvb3JkcyA9IHR5cGVvZiBvLm1hcExhdCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIG8ubWFwTG5nID09PSAnbnVtYmVyJztcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj48c3Ryb25nPiR7ZXNjSHRtbChvLm9yZGVyQ29kZSl9PC9zdHJvbmc+PGJyPjxzbWFsbCBzdHlsZT1cImNvbG9yOnZhcigtLW11dGVkKTtcIj4ke25ldyBEYXRlKGdldE9yZGVyVGltZXN0YW1wKG8pKS50b0xvY2FsZURhdGVTdHJpbmcoKX08L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4ke2VzY0h0bWwoby5jdXN0b21lck5hbWUpfTwvc3Ryb25nPjxicj4ke2VzY0h0bWwoby5waG9uZSl9PGJyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO1wiPiR7ZXNjSHRtbChvLmFkZHJlc3MpfSR7ZnVsbEFyZWEgPyBgLCAke2VzY0h0bWwoZnVsbEFyZWEpfWAgOiAnJ308L3NtYWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgJHtoYXNDb29yZHMgPyBgPGRpdj48YSBocmVmPVwiaHR0cHM6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvP21sYXQ9JHtvLm1hcExhdH0mbWxvbj0ke28ubWFwTG5nfSNtYXA9MTYvJHtvLm1hcExhdH0vJHtvLm1hcExuZ31cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiIHN0eWxlPVwiZm9udC1zaXplOjAuNzRyZW07Y29sb3I6dmFyKC0tcHJpbWFyeSk7Zm9udC13ZWlnaHQ6NjAwO1wiPvCfk40gTWFwIFBpbiAoJHtvLm1hcExhdC50b0ZpeGVkKDQpfSwgJHtvLm1hcExuZy50b0ZpeGVkKDQpfSk8L2E+PC9kaXY+YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPiR7KG8uaXRlbXMgfHwgW10pLm1hcCgoaSkgPT4gYDxkaXY+JHtlc2NIdG1sKGkubmFtZSl9IMOXICR7aS5xdHl9PC9kaXY+YCkuam9pbignJyl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0YWJ1bGFyLW51bXNcIj48c3Ryb25nPiR7Zm9ybWF0UHJpY2Uoby50b3RhbCl9PC9zdHJvbmc+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtlc2NIdG1sKG8ucGF5bWVudE1ldGhvZCl9JHtvLnBheW1lbnROdW1iZXIgPyBgPGJyPjxzbWFsbD4ke2VzY0h0bWwoby5wYXltZW50TnVtYmVyKX08L3NtYWxsPmAgOiAnJ308L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3Qgb3JkZXItc3RhdHVzLXNlbGVjdFwiIGRhdGEtaWQ9XCIke2VzY0h0bWwoby5pZCl9XCIgc3R5bGU9XCJtaW4taGVpZ2h0OjM4cHg7Zm9udC1zaXplOjAuODRyZW07XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICR7c3RhdHVzZXMubWFwKChzKSA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7c31cIiAke28uc3RhdHVzID09PSBzID8gJ3NlbGVjdGVkJyA6ICcnfT4ke3N9PC9vcHRpb24+YCkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZD48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWRhbmdlclwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZGVsLW9yZGVyXCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChvLmlkKX1cIj5EZWxldGU8L2J1dHRvbj48L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgPC9kaXY+YFxuICAgICAgICA6ICc8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzozNnB4O1wiPk5vIG9yZGVycyB5ZXQuIFBsYWNlIGEgdGVzdCBvcmRlciBmcm9tIHRoZSBzdG9yZWZyb250IGNoZWNrb3V0IHRvIHNlZSBsaXZlIHVwZGF0ZXMgaGVyZSE8L2Rpdj4nXG4gICAgICB9XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckJsb2dUYWIoKSB7XG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTZweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO2ZsZXgtd3JhcDp3cmFwO2dhcDoxMHB4O1wiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtcIj5CbG9nIFBvc3RzICgke3N0YXRlLnBvc3RzLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tYWRkLXBvc3RcIj4rIFdyaXRlIFBvc3Q8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImFkbWluLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiYWRtaW4tdGFibGVcIj5cbiAgICAgICAgICA8dGhlYWQ+PHRyPjx0aD5UaXRsZSAmIElzc3VlIEFsZXJ0czwvdGg+PHRoPkNhdGVnb3J5PC90aD48dGg+U3RhdHVzPC90aD48dGg+QWN0aW9uczwvdGg+PC90cj48L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICR7c3RhdGUucG9zdHMubWFwKChwKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGlzSW5jb21wbGV0ZSA9ICFwLmJvZHkgfHwgcC5ib2R5LnRyaW0oKS5sZW5ndGggPCAyMCB8fCAhcC5leGNlcnB0O1xuICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4ke2VzY0h0bWwocC50aXRsZSl9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICR7cC5pc3N1ZUZsYWcgPyBgPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6NHB4O2ZvbnQtc2l6ZTowLjc2cmVtO2NvbG9yOiNiOTFjMWM7Zm9udC13ZWlnaHQ6NjAwO1wiPvCfmqkgRmxhZ2dlZCBJc3N1ZSR7cC5pc3N1ZU5vdGUgPyBgOiAke2VzY0h0bWwocC5pc3N1ZU5vdGUpfWAgOiAnJ308L2Rpdj5gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICR7aXNJbmNvbXBsZXRlID8gYDxkaXYgc3R5bGU9XCJtYXJnaW4tdG9wOjJweDtmb250LXNpemU6MC43NnJlbTtjb2xvcjojYjQ1MzA5O2ZvbnQtd2VpZ2h0OjYwMDtcIj7imqDvuI8gSW5jb21wbGV0ZSBjb250ZW50IG9yIGV4Y2VycHQ8L2Rpdj5gIDogJyd9XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPiR7ZXNjSHRtbChwLmNhdGVnb3J5KX08L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPjxzcGFuIGNsYXNzPVwic3RhdHVzLXRleHQgJHtwLnB1Ymxpc2hlZCAhPT0gZmFsc2UgPyAnc3RhdHVzLUNvbmZpcm1lZCcgOiAnc3RhdHVzLVBlbmRpbmcnfVwiPiR7cC5wdWJsaXNoZWQgIT09IGZhbHNlID8gJ1B1Ymxpc2hlZCcgOiAnRHJhZnQnfTwvc3Bhbj48L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo2cHg7ZmxleC13cmFwOndyYXA7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgJHtwLmlzc3VlRmxhZyA/IGA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsZWFyLXBvc3QtaXNzdWVcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPlJlc29sdmU8L2J1dHRvbj5gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1lZGl0LXBvc3RcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPkVkaXQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWRhbmdlclwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tZGVsLXBvc3RcIiBkYXRhLWlkPVwiJHtlc2NIdG1sKHAuaWQpfVwiPkRlbGV0ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9zdEVkaXRvck1vZGFsKHBvc3RPck5ldykge1xuICBjb25zdCBpc05ldyA9IHBvc3RPck5ldyA9PT0gJ25ldyc7XG4gIGNvbnN0IHAgPSBpc05ld1xuICAgID8geyB0aXRsZTogJycsIGNhdGVnb3J5OiAnQnV5aW5nIEd1aWRlJywgY292ZXJJbWFnZTogJycsIGV4Y2VycHQ6ICcnLCBib2R5OiAnJywgdGFnczogW10sIHB1Ymxpc2hlZDogdHJ1ZSwgaXNzdWVGbGFnOiBmYWxzZSwgaXNzdWVOb3RlOiAnJyB9XG4gICAgOiBwb3N0T3JOZXc7XG4gIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLW92ZXJsYXlcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jYXJkXCI+XG4gICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgMTRweDtcIj4ke2lzTmV3ID8gJ1dyaXRlIEJsb2cgUG9zdCcgOiAnRWRpdCBCbG9nIFBvc3QnfTwvaDI+XG4gICAgICAgIDxmb3JtIGlkPVwiYWRtaW4tcG9zdC1mb3JtXCIgZGF0YS1pcy1uZXc9XCIke2lzTmV3fVwiIGRhdGEtaWQ9XCIke2VzY0h0bWwocC5pZCB8fCAnJyl9XCIgY2xhc3M9XCJmb3JtLWdyaWRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlBvc3QgVGl0bGUgKjwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwidGl0bGVcIiByZXF1aXJlZCB2YWx1ZT1cIiR7ZXNjSHRtbChwLnRpdGxlKX1cIiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkNhdGVnb3J5PC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJjYXRlZ29yeVwiIHZhbHVlPVwiJHtlc2NIdG1sKHAuY2F0ZWdvcnkgfHwgJ0J1eWluZyBHdWlkZScpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+Q292ZXIgSW1hZ2UgVVJMIG9yIFVwbG9hZDwvbGFiZWw+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo4cHg7XCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImNvdmVySW1hZ2VcIiBpZD1cInBvc3QtY292ZXItdXJsXCIgdmFsdWU9XCIke2VzY0h0bWwocC5jb3ZlckltYWdlIHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIj5VcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJwb3N0LWNvdmVyXCIgLz48L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlNob3J0IEV4Y2VycHQ8L2xhYmVsPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImV4Y2VycHRcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwLmV4Y2VycHQgfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO21hcmdpbi1ib3R0b206NnB4O1wiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIHN0eWxlPVwibWFyZ2luOjA7XCI+Qm9keSAoUmljaCBIVE1MIHN1cHBvcnRlZCk8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo2cHg7XCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJyaWNoLXRhZ1wiIGRhdGEtdGFnPVwic3Ryb25nXCI+Qm9sZDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwicmljaC10YWdcIiBkYXRhLXRhZz1cImgzXCI+SGVhZGluZzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwicmljaC10YWdcIiBkYXRhLXRhZz1cInBcIj5QYXJhZ3JhcGg8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cImZpZWxkLXRleHRhcmVhXCIgaWQ9XCJwb3N0LWJvZHktdGV4dGFyZWFcIiBuYW1lPVwiYm9keVwiIHN0eWxlPVwibWluLWhlaWdodDoxODBweDtcIj4ke2VzY0h0bWwocC5ib2R5IHx8ICcnKX08L3RleHRhcmVhPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+VGFncyAoY29tbWEtc2VwYXJhdGVkKTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwidGFnc1wiIHZhbHVlPVwiJHtlc2NIdG1sKChwLnRhZ3MgfHwgW10pLmpvaW4oJywgJykpfVwiIC8+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTZweDtwYWRkaW5nLXRvcDoyMnB4O2ZsZXgtd3JhcDp3cmFwO1wiPlxuICAgICAgICAgICAgICA8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJwdWJsaXNoZWRcIiAke3AucHVibGlzaGVkICE9PSBmYWxzZSA/ICdjaGVja2VkJyA6ICcnfSAvPiBQdWJsaXNoZWQgb24gU3RvcmVmcm9udDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT1cImNvbG9yOiNiOTFjMWM7XCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJpc3N1ZUZsYWdcIiAke3AuaXNzdWVGbGFnID8gJ2NoZWNrZWQnIDogJyd9IC8+IEZsYWcgSXNzdWU8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+SXNzdWUgLyBFZGl0b3JpYWwgTm90ZSAoT3B0aW9uYWwpPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImlzc3VlTm90ZVwiIHBsYWNlaG9sZGVyPVwiRGVzY3JpYmUgaXNzdWUgdG8gcmVzb2x2ZS4uLlwiIHZhbHVlPVwiJHtlc2NIdG1sKHAuaXNzdWVOb3RlIHx8ICcnKX1cIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2dhcDoxMHB4O1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWNsb3NlLW1vZGFsXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBQb3N0PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSZXZpZXdzVGFiKCkge1xuICBjb25zdCBmaWx0ZXIgPSBhZG1pblVpU3RhdGUucmV2aWV3RmlsdGVyIHx8ICdhbGwnO1xuICBjb25zdCBmaWx0ZXJlZCA9IHN0YXRlLnJldmlld3MuZmlsdGVyKChyKSA9PiB7XG4gICAgaWYgKGZpbHRlciA9PT0gJ2FwcHJvdmVkJykgcmV0dXJuIHIuYXBwcm92ZWQgIT09IGZhbHNlO1xuICAgIGlmIChmaWx0ZXIgPT09ICdoaWRkZW4nKSByZXR1cm4gci5hcHByb3ZlZCA9PT0gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBgXG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTZweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO1wiPkN1c3RvbWVyIFJldmlld3MgJiBSYXRpbmdzICgke3N0YXRlLnJldmlld3MubGVuZ3RofSk8L2gyPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDttYXJnaW4tdG9wOjEwcHg7ZmxleC13cmFwOndyYXA7XCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gJHtmaWx0ZXIgPT09ICdhbGwnID8gJ2J0bi1wcmltYXJ5JyA6ICdidG4tb3V0bGluZSd9XCIgZGF0YS1hY3Rpb249XCJhZG1pbi1yZXZpZXctZmlsdGVyXCIgZGF0YS1maWx0ZXI9XCJhbGxcIj5BbGwgKCR7c3RhdGUucmV2aWV3cy5sZW5ndGh9KTwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtICR7ZmlsdGVyID09PSAnYXBwcm92ZWQnID8gJ2J0bi1wcmltYXJ5JyA6ICdidG4tb3V0bGluZSd9XCIgZGF0YS1hY3Rpb249XCJhZG1pbi1yZXZpZXctZmlsdGVyXCIgZGF0YS1maWx0ZXI9XCJhcHByb3ZlZFwiPkFwcHJvdmVkICgke3N0YXRlLnJldmlld3MuZmlsdGVyKChyKSA9PiByLmFwcHJvdmVkICE9PSBmYWxzZSkubGVuZ3RofSk8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSAke2ZpbHRlciA9PT0gJ2hpZGRlbicgPyAnYnRuLXByaW1hcnknIDogJ2J0bi1vdXRsaW5lJ31cIiBkYXRhLWFjdGlvbj1cImFkbWluLXJldmlldy1maWx0ZXJcIiBkYXRhLWZpbHRlcj1cImhpZGRlblwiPkhpZGRlbiAoJHtzdGF0ZS5yZXZpZXdzLmZpbHRlcigocikgPT4gci5hcHByb3ZlZCA9PT0gZmFsc2UpLmxlbmd0aH0pPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCIgZGF0YS1hY3Rpb249XCJhZG1pbi1hZGQtcmV2aWV3XCI+KyBBZGQgUmV2aWV3PC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgJHtmaWx0ZXJlZC5sZW5ndGhcbiAgICAgICAgPyBgPGRpdiBjbGFzcz1cImFkbWluLXRhYmxlLXdyYXBcIj5cbiAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cImFkbWluLXRhYmxlXCI+XG4gICAgICAgICAgICAgIDx0aGVhZD48dHI+PHRoPkN1c3RvbWVyPC90aD48dGg+UHJvZHVjdDwvdGg+PHRoPlJhdGluZzwvdGg+PHRoPlJldmlldyBDb21tZW50PC90aD48dGg+U3RhdHVzPC90aD48dGg+QWN0aW9uczwvdGg+PC90cj48L3RoZWFkPlxuICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgJHtmaWx0ZXJlZC5tYXAoKHIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQXBwcm92ZWQgPSByLmFwcHJvdmVkICE9PSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJzID0gJ+KYhScucmVwZWF0KE1hdGgubWF4KDEsIE1hdGgubWluKDUsIE51bWJlcihyLnJhdGluZykgfHwgNSkpKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+PHN0cm9uZz4ke2VzY0h0bWwoci5hdXRob3JOYW1lKX08L3N0cm9uZz48YnI+PHNtYWxsIHN0eWxlPVwiY29sb3I6dmFyKC0tbXV0ZWQpO1wiPiR7ZXNjSHRtbChyLmNpdHkgfHwgJ0JhbmdsYWRlc2gnKX08L3NtYWxsPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkPiR7ZXNjSHRtbChyLnByb2R1Y3ROYW1lIHx8ICdHZW5lcmFsIFN0b3JlJyl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+PHNwYW4gc3R5bGU9XCJjb2xvcjp2YXIoLS1hbWJlcik7Zm9udC1zaXplOjAuOTVyZW07XCI+JHtzdGFyc308L3NwYW4+IDxzbWFsbCBjbGFzcz1cInRhYnVsYXItbnVtc1wiPigke3IucmF0aW5nfS81KTwvc21hbGw+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9XCJtYXgtd2lkdGg6MzQwcHg7XCI+JHtlc2NIdG1sKHIuY29tbWVudCB8fCAnJyl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+PHNwYW4gY2xhc3M9XCJzdGF0dXMtdGV4dCAke2lzQXBwcm92ZWQgPyAnc3RhdHVzLUNvbmZpcm1lZCcgOiAnc3RhdHVzLVBlbmRpbmcnfVwiPiR7aXNBcHByb3ZlZCA/ICdBcHByb3ZlZCcgOiAnSGlkZGVuJ308L3NwYW4+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo2cHg7ZmxleC13cmFwOndyYXA7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRtaW4tdG9nZ2xlLXJldmlld1wiIGRhdGEtaWQ9XCIke2VzY0h0bWwoci5pZCl9XCI+JHtpc0FwcHJvdmVkID8gJ0hpZGUnIDogJ0FwcHJvdmUnfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cImFkbWluLWVkaXQtcmV2aWV3XCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChyLmlkKX1cIj5FZGl0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1kZWwtcmV2aWV3XCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChyLmlkKX1cIj5EZWxldGU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICA8L2Rpdj5gXG4gICAgICAgIDogYDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjM2cHg7XCI+Tm8gcmV2aWV3cyBtYXRjaCB0aGlzIGZpbHRlciB5ZXQuPC9kaXY+YFxuICAgICAgfVxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSZXZpZXdFZGl0b3JNb2RhbChyZXZPck5ldykge1xuICBjb25zdCBpc05ldyA9IHJldk9yTmV3ID09PSAnbmV3JztcbiAgY29uc3QgciA9IGlzTmV3XG4gICAgPyB7IHByb2R1Y3RJZDogc3RhdGUucHJvZHVjdHNbMF0/LmlkIHx8ICcnLCBwcm9kdWN0TmFtZTogc3RhdGUucHJvZHVjdHNbMF0/Lm5hbWUgfHwgJycsIGF1dGhvck5hbWU6ICcnLCBjaXR5OiAnRGhha2EnLCByYXRpbmc6IDUsIGNvbW1lbnQ6ICcnLCBhcHByb3ZlZDogdHJ1ZSB9XG4gICAgOiByZXZPck5ldztcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtb3ZlcmxheVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIiBzdHlsZT1cIm1heC13aWR0aDo1NjBweDtcIj5cbiAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjAgMCAxNHB4O1wiPiR7aXNOZXcgPyAnQWRkIEN1c3RvbWVyIFJldmlldycgOiAnRWRpdCBDdXN0b21lciBSZXZpZXcnfTwvaDI+XG4gICAgICAgIDxmb3JtIGlkPVwiYWRtaW4tcmV2aWV3LWZvcm1cIiBkYXRhLWlzLW5ldz1cIiR7aXNOZXd9XCIgZGF0YS1pZD1cIiR7ZXNjSHRtbChyLmlkIHx8ICcnKX1cIiBjbGFzcz1cImZvcm0tZ3JpZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlByb2R1Y3Q8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIG5hbWU9XCJwcm9kdWN0SWRcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkdlbmVyYWwgU3RvcmUgUmV2aWV3PC9vcHRpb24+XG4gICAgICAgICAgICAgICR7c3RhdGUucHJvZHVjdHMubWFwKChwKSA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjSHRtbChwLmlkKX1cIiAke3IucHJvZHVjdElkID09PSBwLmlkID8gJ3NlbGVjdGVkJyA6ICcnfT4ke2VzY0h0bWwocC5uYW1lKX08L29wdGlvbj5gKS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+Q3VzdG9tZXIgTmFtZSAqPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJhdXRob3JOYW1lXCIgcmVxdWlyZWQgdmFsdWU9XCIke2VzY0h0bWwoci5hdXRob3JOYW1lIHx8ICcnKX1cIiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkNpdHkgLyBEaXN0cmljdDwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwiY2l0eVwiIHZhbHVlPVwiJHtlc2NIdG1sKHIuY2l0eSB8fCAnRGhha2EnKX1cIiAvPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlJhdGluZyAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdFwiIG5hbWU9XCJyYXRpbmdcIj5cbiAgICAgICAgICAgICAgICAke1s1LCA0LCAzLCAyLCAxXS5tYXAoKG4pID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtufVwiICR7TnVtYmVyKHIucmF0aW5nKSA9PT0gbiA/ICdzZWxlY3RlZCcgOiAnJ30+JHsn4piFJy5yZXBlYXQobil9ICgke259LzUpPC9vcHRpb24+YCkuam9pbignJyl9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtwYWRkaW5nLXRvcDoyNHB4O1wiPlxuICAgICAgICAgICAgICA8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJhcHByb3ZlZFwiICR7ci5hcHByb3ZlZCAhPT0gZmFsc2UgPyAnY2hlY2tlZCcgOiAnJ30gLz4gQXBwcm92ZWQgKFZpc2libGUgb24gU3RvcmVmcm9udCk8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+UmV2aWV3IENvbW1lbnQgKjwvbGFiZWw+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJmaWVsZC10ZXh0YXJlYVwiIG5hbWU9XCJjb21tZW50XCIgcmVxdWlyZWQ+JHtlc2NIdG1sKHIuY29tbWVudCB8fCAnJyl9PC90ZXh0YXJlYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZDtnYXA6MTBweDtcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJhZG1pbi1jbG9zZS1tb2RhbFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiPlNhdmUgUmV2aWV3PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJCYW5uZXJzVGhlbWVUYWIoKSB7XG4gIGNvbnN0IHQgPSBzdGF0ZS50aGVtZSB8fCBTRUVEX1RIRU1FX1NFVFRJTkdTO1xuICByZXR1cm4gYFxuICAgIDxmb3JtIGlkPVwiYWRtaW4tdGhlbWUtZm9ybVwiIGNsYXNzPVwiZm9ybS1ncmlkXCIgc3R5bGU9XCJnYXA6MjBweDtcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO21hcmdpbi1ib3R0b206MTJweDtcIj5cbiAgICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MS4xcmVtO1wiPlRoZW1lIENvbG9ycyAoTGl2ZSBVcGRhdGUpPC9oMj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBkYXRhLWFjdGlvbj1cInJlc2V0LXRoZW1lLWNvbG9yc1wiPlJlc2V0IERlZmF1bHRzPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiIHN0eWxlPVwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgoMTYwcHgsMWZyKSk7XCI+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlByaW1hcnkgQ29sb3I8L2xhYmVsPjxpbnB1dCB0eXBlPVwiY29sb3JcIiBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cInByaW1hcnlDb2xvclwiIHZhbHVlPVwiJHtlc2NIdG1sKHQucHJpbWFyeUNvbG9yIHx8ICcjMEY3NjZFJyl9XCIgc3R5bGU9XCJwYWRkaW5nOjRweDtcIiAvPjwvZGl2PlxuICAgICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5BY2NlbnQgQ29sb3I8L2xhYmVsPjxpbnB1dCB0eXBlPVwiY29sb3JcIiBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImFjY2VudENvbG9yXCIgdmFsdWU9XCIke2VzY0h0bWwodC5hY2NlbnRDb2xvciB8fCAnI0ZGNkI1NycpfVwiIHN0eWxlPVwicGFkZGluZzo0cHg7XCIgLz48L2Rpdj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+QmFja2dyb3VuZCBDb2xvcjwvbGFiZWw+PGlucHV0IHR5cGU9XCJjb2xvclwiIGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwiYmdDb2xvclwiIHZhbHVlPVwiJHtlc2NIdG1sKHQuYmdDb2xvciB8fCAnI0ZBRjhGNScpfVwiIHN0eWxlPVwicGFkZGluZzo0cHg7XCIgLz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXA7Z2FwOjEwcHg7bWFyZ2luLWJvdHRvbToxMnB4O1wiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MS4xcmVtO1wiPkhlcm8gU2xpZGVzICgkeyh0Lmhlcm9TbGlkZXMgfHwgW10pLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjJweCAwIDA7Zm9udC1zaXplOjAuODJyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO1wiPlN1cHBvcnRzIHRvdWNoICZhbXA7IG1vdXNlIHN3aXBlLCBjdXN0b20gYW5pbWF0aW9ucywgYW5kIG9wdGlvbmFsIGFuaW1hdGVkIEZlYXR1cmVkIFByb2R1Y3Qgc2hvd2Nhc2UgaW5zaWRlIGVhY2ggc2xpZGUuPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIGRhdGEtYWN0aW9uPVwiYWRkLWhlcm8tc2xpZGVcIj4rIEFkZCBTbGlkZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD1cImhlcm8tc2xpZGVzLWxpc3RcIiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTRweDtcIj5cbiAgICAgICAgICAkeyh0Lmhlcm9TbGlkZXMgfHwgW10pLm1hcCgocywgaWR4KSA9PiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVyby1zbGlkZS1lZGl0b3JcIiBzdHlsZT1cInBhZGRpbmc6MTRweDtiYWNrZ3JvdW5kOnZhcigtLWJnKTtib3JkZXItcmFkaXVzOjEycHg7ZGlzcGxheTpncmlkO2dhcDoxMHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtcIj5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5TbGlkZSAke2lkeCArIDF9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1kYW5nZXJcIiBvbmNsaWNrPVwidGhpcy5jbG9zZXN0KCcuaGVyby1zbGlkZS1lZGl0b3InKS5yZW1vdmUoKVwiPlJlbW92ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBocy1oZWFkbGluZVwiIHBsYWNlaG9sZGVyPVwiSGVhZGxpbmVcIiB2YWx1ZT1cIiR7ZXNjSHRtbChzLmhlYWRsaW5lIHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IGhzLWtpY2tlclwiIHBsYWNlaG9sZGVyPVwiS2lja2VyICh0b3AgbGFiZWwpXCIgdmFsdWU9XCIke2VzY0h0bWwocy5raWNrZXIgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBocy1zdWJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJTdWJ0ZXh0XCIgdmFsdWU9XCIke2VzY0h0bWwocy5zdWJ0ZXh0IHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IGhzLWJ0bi10ZXh0XCIgcGxhY2Vob2xkZXI9XCJCdXR0b24gVGV4dFwiIHZhbHVlPVwiJHtlc2NIdG1sKHMuYnV0dG9uVGV4dCB8fCAnU2hvcCBOb3cnKX1cIiAvPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IGhzLWJ0bi1saW5rXCIgcGxhY2Vob2xkZXI9XCJCdXR0b24gTGluayAoZS5nLiAjZGVhbHMpXCIgdmFsdWU9XCIke2VzY0h0bWwocy5idXR0b25MaW5rIHx8ICcjZGVhbHMnKX1cIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIiBzdHlsZT1cImdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KDE3NXB4LDFmcikpO1wiPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkFuaW1hdGVkIEZlYXR1cmVkIFByb2R1Y3Q8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdCBocy1wcm9kdWN0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Ob25lIChCYW5uZXIgSW1hZ2UgT25seSk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgJHtzdGF0ZS5wcm9kdWN0cy5tYXAoKHApID0+IGBcbiAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiJHtlc2NIdG1sKHAuaWQpfVwiICR7U3RyaW5nKHMuZmVhdHVyZWRQcm9kdWN0SWQgfHwgJycpID09PSBTdHJpbmcocC5pZCkgPyAnc2VsZWN0ZWQnIDogJyd9PlxuICAgICAgICAgICAgICAgICAgICAgICAgJHtlc2NIdG1sKHAubmFtZSl9ICgke2Zvcm1hdFByaWNlKHAucHJpY2UpfSlcbiAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5IaWdobGlnaHQgQmFkZ2UgVGV4dDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBocy1iYWRnZVwiIHBsYWNlaG9sZGVyPVwiZS5nLiBGbGFzaCBEZWFsIMK3IFNhdmUg4KezMiw1MDBcIiB2YWx1ZT1cIiR7ZXNjSHRtbChzLmJhZGdlVGV4dCB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5TbGlkZSBUcmFuc2l0aW9uIFN0eWxlPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3QgaHMtYW5pbVwiPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZ2xpZGVcIiAkeyghcy5hbmltU3R5bGUgfHwgcy5hbmltU3R5bGUgPT09ICdnbGlkZScgfHwgcy5hbmltU3R5bGUgPT09ICdmbG9hdCcpID8gJ3NlbGVjdGVkJyA6ICcnfT5TbW9vdGggUGFyYWxsYXggR2xpZGU8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInpvb21cIiAke3MuYW5pbVN0eWxlID09PSAnem9vbScgPyAnc2VsZWN0ZWQnIDogJyd9PkNpbmVtYXRpYyBTbG93IFpvb208L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImZhZGVcIiAkeyhzLmFuaW1TdHlsZSA9PT0gJ2ZhZGUnIHx8IHMuYW5pbVN0eWxlID09PSAncHVsc2UnKSA/ICdzZWxlY3RlZCcgOiAnJ30+U29mdCBFZGl0b3JpYWwgUmV2ZWFsPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJvcmJpdFwiICR7cy5hbmltU3R5bGUgPT09ICdvcmJpdCcgPyAnc2VsZWN0ZWQnIDogJyd9PkdlbnRsZSBEZXB0aCBEcmlmdDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo4cHg7XCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgaHMtaW1nXCIgaWQ9XCJocy1pbWctJHtpZHh9XCIgcGxhY2Vob2xkZXI9XCJCYWNrZ3JvdW5kIC8gQmFubmVyIEltYWdlIFVSTFwiIHZhbHVlPVwiJHtlc2NIdG1sKHMuaW1hZ2VVcmwgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tb3V0bGluZVwiIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXI7XCI+VXBsb2FkIDxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBoaWRkZW4gZGF0YS11cGxvYWQtdGFyZ2V0PVwiaHMtaW1nLSR7aWR4fVwiIC8+PC9sYWJlbD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjAgMCAxMnB4O2ZvbnQtc2l6ZToxLjFyZW07XCI+UHJvbW8gQmFubmVyIFRpbGVzPC9oMj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6Z3JpZDtnYXA6MTRweDtcIj5cbiAgICAgICAgICAkeyh0LnByb21vVGlsZXMgfHwgW10pLm1hcCgocHQsIGlkeCkgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb21vLXRpbGUtZWRpdG9yXCIgc3R5bGU9XCJwYWRkaW5nOjE0cHg7YmFja2dyb3VuZDp2YXIoLS1iZyk7Ym9yZGVyLXJhZGl1czoxMnB4O2Rpc3BsYXk6Z3JpZDtnYXA6MTBweDtcIj5cbiAgICAgICAgICAgICAgPHN0cm9uZz5Qcm9tbyBUaWxlICR7aWR4ICsgMX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBwdC10aXRsZVwiIHBsYWNlaG9sZGVyPVwiVGl0bGVcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwdC50aXRsZSB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBwdC1zdWJcIiBwbGFjZWhvbGRlcj1cIlN1YnRleHRcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwdC5zdWJ0ZXh0IHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBwdC1idG5cIiBwbGFjZWhvbGRlcj1cIkJ1dHRvbiBUZXh0XCIgdmFsdWU9XCIke2VzY0h0bWwocHQuYnV0dG9uVGV4dCB8fCAnRXhwbG9yZScpfVwiIC8+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgcHQtbGlua1wiIHBsYWNlaG9sZGVyPVwiTGlua1wiIHZhbHVlPVwiJHtlc2NIdG1sKHB0LmxpbmsgfHwgJyNkZWFscycpfVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo4cHg7XCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgcHQtaW1nXCIgaWQ9XCJwdC1pbWctJHtpZHh9XCIgcGxhY2Vob2xkZXI9XCJJbWFnZSBVUkxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChwdC5pbWFnZVVybCB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIj5VcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJwdC1pbWctJHtpZHh9XCIgLz48L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIGApLmpvaW4oJycpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBCYW5uZXJzICYgVGhlbWU8L2J1dHRvbj5cbiAgICA8L2Zvcm0+XG4gIGA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckJyYW5kaW5nVGFiKCkge1xuICBjb25zdCBnID0gc3RhdGUuZ2VuZXJhbCB8fCBTRUVEX0dFTkVSQUxfU0VUVElOR1M7XG4gIHJldHVybiBgXG4gICAgPGZvcm0gaWQ9XCJhZG1pbi1icmFuZGluZy1mb3JtXCIgY2xhc3M9XCJjYXJkLXBhbmVsIGZvcm0tZ3JpZFwiPlxuICAgICAgPGgyIHN0eWxlPVwibWFyZ2luOjA7XCI+TG9nbyAmIEJyYW5kaW5nPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5Mb2dvIFVSTCAobGVhdmUgZW1wdHkgZm9yIHN0eWxlZCBcIlBhemFybyBCRFwiIHRleHQpPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2dhcDo4cHg7XCI+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJsb2dvVXJsXCIgaWQ9XCJicmFuZC1sb2dvLXVybFwiIHZhbHVlPVwiJHtlc2NIdG1sKGcubG9nb1VybCB8fCAnJyl9XCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImJ0biBidG4tc20gYnRuLW91dGxpbmVcIiBzdHlsZT1cImN1cnNvcjpwb2ludGVyO1wiPlVwbG9hZCA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgaGlkZGVuIGRhdGEtdXBsb2FkLXRhcmdldD1cImJyYW5kLWxvZ29cIiAvPjwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+RmF2aWNvbiBVUkw8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0XCIgbmFtZT1cImZhdmljb25VcmxcIiBpZD1cImJyYW5kLWZhdi11cmxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChnLmZhdmljb25VcmwgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIj5VcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJicmFuZC1mYXZcIiAvPjwvbGFiZWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+U2l0ZSBOYW1lPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJzaXRlTmFtZVwiIHZhbHVlPVwiJHtlc2NIdG1sKGcuc2l0ZU5hbWUgfHwgJ1BhemFybyBCRCcpfVwiIC8+PC9kaXY+XG4gICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5UYWdsaW5lPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJ0YWdsaW5lXCIgdmFsdWU9XCIke2VzY0h0bWwoZy50YWdsaW5lIHx8ICdZb3VyIEJhemFhciwgU21hcnRlcicpfVwiIC8+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5QaG9uZTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwicGhvbmVcIiB2YWx1ZT1cIiR7ZXNjSHRtbChnLnBob25lIHx8ICcnKX1cIiAvPjwvZGl2PlxuICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+V2hhdHNBcHAgTnVtYmVyIChkaWdpdHMgd2l0aCA4ODApPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJ3aGF0c2FwcFwiIHZhbHVlPVwiJHtlc2NIdG1sKGcud2hhdHNhcHAgfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5TdXBwb3J0IEVtYWlsPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJlbWFpbFwiIHZhbHVlPVwiJHtlc2NIdG1sKGcuZW1haWwgfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5PZmZpY2UgQWRkcmVzczwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwiYWRkcmVzc1wiIHZhbHVlPVwiJHtlc2NIdG1sKGcuYWRkcmVzcyB8fCAnJyl9XCIgLz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIiBzdHlsZT1cImdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KDE4MHB4LDFmcikpO1wiPlxuICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+RmFjZWJvb2sgVVJMPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJmYWNlYm9va1VybFwiIHZhbHVlPVwiJHtlc2NIdG1sKGcuZmFjZWJvb2tVcmwgfHwgJycpfVwiIC8+PC9kaXY+XG4gICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5JbnN0YWdyYW0gVVJMPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJpbnN0YWdyYW1VcmxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChnLmluc3RhZ3JhbVVybCB8fCAnJyl9XCIgLz48L2Rpdj5cbiAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPllvdVR1YmUgVVJMPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJ5b3V0dWJlVXJsXCIgdmFsdWU9XCIke2VzY0h0bWwoZy55b3V0dWJlVXJsIHx8ICcnKX1cIiAvPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCI+U2F2ZSBCcmFuZGluZzwvYnV0dG9uPlxuICAgIDwvZm9ybT5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQWRzVGFiKCkge1xuICBjb25zdCBzbG90cyA9IHN0YXRlLmFkcz8uc2xvdHMgfHwgU0VFRF9BRFNfU0VUVElOR1Muc2xvdHM7XG4gIGNvbnN0IG1ldGEgPSBbXG4gICAgeyBrZXk6ICdhZF9oZXJvX2xlYWRlcmJvYXJkJywgbGFiZWw6ICdIZXJvIExlYWRlcmJvYXJkIChCZWxvdyBIZXJvIFNsaWRlciknIH0sXG4gICAgeyBrZXk6ICdhZF9taWRfcmVjdGFuZ2xlJywgbGFiZWw6ICdNaWQtUGFnZSBSZWN0YW5nbGUgKEJldHdlZW4gU2Nyb2xsZXJzKScgfSxcbiAgICB7IGtleTogJ2FkX2Zvb3Rlcl9iYW5uZXInLCBsYWJlbDogJ0Zvb3RlciBCYW5uZXIgKEFib3ZlIEZvb3RlciknIH0sXG4gICAgeyBrZXk6ICdhZF9zaWRlX2xlZnQnLCBsYWJlbDogJ0Rlc2t0b3AgTGVmdCBTaWRlIFJhaWwgKEhpZGRlbiBvbiBNb2JpbGUpJyB9LFxuICAgIHsga2V5OiAnYWRfc2lkZV9yaWdodCcsIGxhYmVsOiAnRGVza3RvcCBSaWdodCBTaWRlIFJhaWwgKEhpZGRlbiBvbiBNb2JpbGUpJyB9LFxuICAgIHsga2V5OiAnYWRfcHJvZHVjdF9wYWdlJywgbGFiZWw6ICdQcm9kdWN0IERldGFpbCBQYWdlIEFkIFNsb3QnIH0sXG4gICAgeyBrZXk6ICdhZF9ibG9nX3Bvc3QnLCBsYWJlbDogJ0Jsb2cgUG9zdCBBZCBTbG90JyB9XG4gIF07XG5cbiAgcmV0dXJuIGBcbiAgICA8Zm9ybSBpZD1cImFkbWluLWFkcy1mb3JtXCIgY2xhc3M9XCJmb3JtLWdyaWRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowIDAgNnB4O1wiPkFkIFNwYWNlcyBNYW5hZ2VyPC9oMj5cbiAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDE0cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTowLjg4cmVtO1wiPkVtcHR5IG9yIHN3aXRjaGVkLW9mZiBzbG90cyBjb2xsYXBzZSBjbGVhbmx5IHRvIHplcm8gc3BhY2Ugb24gdGhlIHN0b3JlZnJvbnQuPC9wPlxuICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dhcDoxNHB4O1wiPlxuICAgICAgICAgICR7bWV0YS5tYXAoKG0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSBzbG90c1ttLmtleV0gfHwgeyBlbmFibGVkOiBmYWxzZSwgaW1hZ2VVcmw6ICcnLCBsaW5rVXJsOiAnJywgaHRtbENvZGU6ICcnIH07XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWQtc2xvdC1lZGl0b3JcIiBkYXRhLXNsb3Q9XCIke20ua2V5fVwiIHN0eWxlPVwicGFkZGluZzoxNHB4O2JhY2tncm91bmQ6dmFyKC0tYmcpO2JvcmRlci1yYWRpdXM6MTJweDtkaXNwbGF5OmdyaWQ7Z2FwOjEwcHg7XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nPiR7ZXNjSHRtbChtLmxhYmVsKX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbD48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1lbmFibGVkXCIgJHtzLmVuYWJsZWQgPyAnY2hlY2tlZCcgOiAnJ30gLz4gRW5hYmxlZDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDtcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgYWQtaW1nXCIgaWQ9XCJhZC1pbWctJHttLmtleX1cIiBwbGFjZWhvbGRlcj1cIkJhbm5lciBJbWFnZSBVUkxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChzLmltYWdlVXJsIHx8ICcnKX1cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIj5VcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJhZC1pbWctJHttLmtleX1cIiAvPjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IGFkLWxpbmtcIiBwbGFjZWhvbGRlcj1cIkNsaWNrIFRhcmdldCBVUkxcIiB2YWx1ZT1cIiR7ZXNjSHRtbChzLmxpbmtVcmwgfHwgJycpfVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwiZmllbGQtdGV4dGFyZWEgYWQtaHRtbFwiIHN0eWxlPVwibWluLWhlaWdodDo2OHB4O1wiIHBsYWNlaG9sZGVyPVwiT3IgcGFzdGUgY3VzdG9tIEFkIE5ldHdvcmsgSFRNTC9zY3JpcHQgc25pcHBldC4uLlwiPiR7ZXNjSHRtbChzLmh0bWxDb2RlIHx8ICcnKX08L3RleHRhcmVhPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGA7XG4gICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tYWNjZW50XCIgc3R5bGU9XCJtYXJnaW4tdG9wOjE2cHg7XCI+U2F2ZSBBZCBTZXR0aW5nczwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9mb3JtPlxuICBgO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTZXR0aW5nc1RhYigpIHtcbiAgY29uc3QgZyA9IHN0YXRlLmdlbmVyYWwgfHwgU0VFRF9HRU5FUkFMX1NFVFRJTkdTO1xuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjIwcHg7XCI+XG4gICAgICA8Zm9ybSBpZD1cImFkbWluLXNldHRpbmdzLWZvcm1cIiBjbGFzcz1cImNhcmQtcGFuZWwgZm9ybS1ncmlkXCI+XG4gICAgICAgIDxoMiBzdHlsZT1cIm1hcmdpbjowO1wiPlN0b3JlZnJvbnQgJiBEZWxpdmVyeSBTZXR0aW5nczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkluc2lkZSBEaGFrYSBEZWxpdmVyeSAo4KezKTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIG5hbWU9XCJpbnNpZGVEaGFrYUZlZVwiIHZhbHVlPVwiJHtOdW1iZXIoZy5pbnNpZGVEaGFrYUZlZSA/PyA2MCl9XCIgLz48L2Rpdj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+T3V0c2lkZSBEaGFrYSBEZWxpdmVyeSAo4KezKTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIG5hbWU9XCJvdXRzaWRlRGhha2FGZWVcIiB2YWx1ZT1cIiR7TnVtYmVyKGcub3V0c2lkZURoYWthRmVlID8/IDEyMCl9XCIgLz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkZyZWUgRGVsaXZlcnkgTWluaW11bSBPcmRlciAo4KezLCAwID0gb2ZmKTwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIG5hbWU9XCJmcmVlRGVsaXZlcnlNaW5cIiB2YWx1ZT1cIiR7TnVtYmVyKGcuZnJlZURlbGl2ZXJ5TWluID8/IDUwMDApfVwiIC8+PC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkN1cnJlbmN5IFN5bWJvbDwvbGFiZWw+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBuYW1lPVwiY3VycmVuY3lTeW1ib2xcIiB2YWx1ZT1cIiR7ZXNjSHRtbChnLmN1cnJlbmN5U3ltYm9sIHx8ICfgp7MnKX1cIiAvPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8aHIgc3R5bGU9XCJib3JkZXI6MDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO21hcmdpbjo0cHggMDtcIiAvPlxuICAgICAgICA8aDMgc3R5bGU9XCJtYXJnaW46MDtmb250LXNpemU6MXJlbTtcIj5DaGVja291dCBJbnRlcmFjdGl2ZSBNYXAgJiBBdXRvLUZpbGwgU2V0dGluZ3M8L2gzPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxsYWJlbCBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC13ZWlnaHQ6NjAwO1wiPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJtYXBFbmFibGVkXCIgJHtnLm1hcEVuYWJsZWQgIT09IGZhbHNlID8gJ2NoZWNrZWQnIDogJyd9IC8+IEVuYWJsZSBJbnRlcmFjdGl2ZSBDaGVja291dCBNYXAgUGlja2VyICYgR1BTIEF1dG8tRmlsbFxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPk1hcCBUaWxlIFByb3ZpZGVyPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmaWVsZC1zZWxlY3RcIiBuYW1lPVwibWFwUHJvdmlkZXJcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIm9zbVwiICR7KGcubWFwUHJvdmlkZXIgfHwgJ29zbScpID09PSAnb3NtJyA/ICdzZWxlY3RlZCcgOiAnJ30+T3BlblN0cmVldE1hcCBTdGFuZGFyZDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwib3NtLWhvdFwiICR7Zy5tYXBQcm92aWRlciA9PT0gJ29zbS1ob3QnID8gJ3NlbGVjdGVkJyA6ICcnfT5PcGVuU3RyZWV0TWFwIEhPVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiY2FydG9cIiAke2cubWFwUHJvdmlkZXIgPT09ICdjYXJ0bycgPyAnc2VsZWN0ZWQnIDogJyd9PkNhcnRvIFZveWFnZXIgQ2xlYW48L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPkRlZmF1bHQgTWFwIFpvb20gTGV2ZWwgKDYgLSAxOCk8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiNlwiIG1heD1cIjE4XCIgbmFtZT1cIm1hcERlZmF1bHRab29tXCIgdmFsdWU9XCIke051bWJlcihnLm1hcERlZmF1bHRab29tID8/IDEyKX1cIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+RGVmYXVsdCBNYXAgQ2VudGVyIExhdGl0dWRlPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wMDAxXCIgbmFtZT1cIm1hcERlZmF1bHRMYXRcIiB2YWx1ZT1cIiR7TnVtYmVyKGcubWFwRGVmYXVsdExhdCA/PyAyMy44MTAzKX1cIiAvPjwvZGl2PlxuICAgICAgICAgIDxkaXY+PGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIj5EZWZhdWx0IE1hcCBDZW50ZXIgTG9uZ2l0dWRlPC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wMDAxXCIgbmFtZT1cIm1hcERlZmF1bHRMbmdcIiB2YWx1ZT1cIiR7TnVtYmVyKGcubWFwRGVmYXVsdExuZyA/PyA5MC40MTI1KX1cIiAvPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8aHIgc3R5bGU9XCJib3JkZXI6MDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO21hcmdpbjo0cHggMDtcIiAvPlxuICAgICAgICA8ZGl2PjxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+Rm9vdGVyIENvcHlyaWdodCBUZXh0PC9sYWJlbD48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIG5hbWU9XCJmb290ZXJUZXh0XCIgdmFsdWU9XCIke2VzY0h0bWwoZy5mb290ZXJUZXh0IHx8ICcnKX1cIiAvPjwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxsYWJlbCBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC13ZWlnaHQ6NjAwO1wiPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJtYWludGVuYW5jZU1vZGVcIiAke2cubWFpbnRlbmFuY2VNb2RlID8gJ2NoZWNrZWQnIDogJyd9IC8+IEVuYWJsZSBNYWludGVuYW5jZSBNb2RlIG9uIFB1YmxpYyBTdG9yZWZyb250XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1hY2NlbnRcIj5TYXZlIFNldHRpbmdzPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG5cbiAgICAgIDxmb3JtIGlkPVwiYWRtaW4tYWRkLXVpZC1mb3JtXCIgY2xhc3M9XCJjYXJkLXBhbmVsIGZvcm0tZ3JpZFwiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MDtcIj5HcmFudCBBZGRpdGlvbmFsIEFkbWluIEFjY2VzczwvaDI+XG4gICAgICAgIDxwIHN0eWxlPVwibWFyZ2luOjA7Y29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTowLjg2cmVtO1wiPkFkZCBhIEZpcmViYXNlIEF1dGggVXNlciBVSUQgc28gYW5vdGhlciB0ZWFtIG1lbWJlciBjYW4gbG9nIGludG8gL2FkbWluLjwvcD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj5cbiAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dFwiIGlkPVwiZ3JhbnQtdWlkXCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJGaXJlYmFzZSBVc2VyIFVJRFwiIC8+XG4gICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXRcIiBpZD1cImdyYW50LWVtYWlsXCIgdHlwZT1cImVtYWlsXCIgcmVxdWlyZWQgcGxhY2Vob2xkZXI9XCJBZG1pbiBFbWFpbFwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkdyYW50IEFkbWluIFJvbGU8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQmFja3VwVGFiKCkge1xuICByZXR1cm4gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z2FwOjE4cHg7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MCAwIDhweDtcIj5Eb3dubG9hZCBGdWxsIFNvdXJjZSBQYWNrYWdlPC9oMj5cbiAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW46MCAwIDE0cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTowLjlyZW07XCI+XG4gICAgICAgICAgRG93bmxvYWQgYSBjb21wbGV0ZSBzdGF0aWMgWklQIGFyY2hpdmUgKEhUTUwsIENTUywgVmFuaWxsYSBKUywgRmlyZWJhc2UgQ29uZmlnLCBfcmVkaXJlY3RzICYgUkVBRE1FKSByZWFkeSBmb3IgR2l0SHViLCBOZXRsaWZ5LCBvciBDbG91ZGZsYXJlIFBhZ2VzLlxuICAgICAgICA8L3A+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1hY2NlbnRcIiBkYXRhLWFjdGlvbj1cImRvd25sb2FkLXppcFwiPvCfk6YgRG93bmxvYWQgRnVsbCBTb3VyY2UgUGFja2FnZSAoLnppcCk8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1wYW5lbFwiPlxuICAgICAgICA8aDIgc3R5bGU9XCJtYXJnaW46MCAwIDhweDtcIj5DU1YgRGF0YSBFeHBvcnRzICYgRGVtbyBTeW5jPC9oMj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6MTBweDtcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGRhdGEtYWN0aW9uPVwiZXhwb3J0LXByb2R1Y3RzLWNzdlwiPkV4cG9ydCBQcm9kdWN0cyBDU1Y8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGRhdGEtYWN0aW9uPVwiZXhwb3J0LW9yZGVycy1jc3ZcIj5FeHBvcnQgT3JkZXJzIENTVjwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1vdXRsaW5lXCIgZGF0YS1hY3Rpb249XCJzZWVkLWRlbW8tbm93XCI+U3luYyBEZW1vIERhdGEgdG8gRmlyZXN0b3JlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRDc3YoZmlsZW5hbWUsIGhlYWRlcnMsIHJvd3MpIHtcbiAgY29uc3QgZXNjID0gKHYpID0+IGBcIiR7U3RyaW5nKHYgPz8gJycpLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xuICBjb25zdCBsaW5lcyA9IFtoZWFkZXJzLm1hcChlc2MpLmpvaW4oJywnKSwgLi4ucm93cy5tYXAoKHIpID0+IHIubWFwKGVzYykuam9pbignLCcpKV07XG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbbGluZXMuam9pbignXFxuJyldLCB7IHR5cGU6ICd0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04OycgfSk7XG4gIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGEuaHJlZiA9IHVybDtcbiAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICBhLmNsaWNrKCk7XG4gIGEucmVtb3ZlKCk7XG4gIHNldFRpbWVvdXQoKCkgPT4gVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpLCAxNTAwKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFkbWluQWN0aW9uKGFjdGlvbiwgZWwpIHtcbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLXRvZ2dsZS1tZW51Jykge1xuICAgIGFkbWluVWlTdGF0ZS5tb2JpbGVNZW51T3BlbiA9ICFhZG1pblVpU3RhdGUubW9iaWxlTWVudU9wZW47XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWNsb3NlLW1lbnUnKSB7XG4gICAgYWRtaW5VaVN0YXRlLm1vYmlsZU1lbnVPcGVuID0gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLXRhYicpIHtcbiAgICBhZG1pblVpU3RhdGUudGFiID0gZWwuZGF0YXNldC50YWI7XG4gICAgYWRtaW5VaVN0YXRlLm1vYmlsZU1lbnVPcGVuID0gZmFsc2U7XG4gICAgaWYgKGFkbWluVWlTdGF0ZS50YWIgPT09ICdvcmRlcnMnKSB7XG4gICAgICBtYXJrT3JkZXJzU2VlbigpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAndG9nZ2xlLXBhc3MtdmlzJykge1xuICAgIGFkbWluVWlTdGF0ZS5zaG93UGFzcyA9ICFhZG1pblVpU3RhdGUuc2hvd1Bhc3M7XG4gICAgY29uc3QgcGFzc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLXBhc3MnKTtcbiAgICBpZiAocGFzc0lucHV0ICYmIHBhc3NJbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgIHBhc3NJbnB1dC50eXBlID0gYWRtaW5VaVN0YXRlLnNob3dQYXNzID8gJ3RleHQnIDogJ3Bhc3N3b3JkJztcbiAgICAgIGVsLnRleHRDb250ZW50ID0gYWRtaW5VaVN0YXRlLnNob3dQYXNzID8gJ0hpZGUnIDogJ1Nob3cnO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWdvb2dsZS1sb2dpbicpIHtcbiAgICB0cnkge1xuICAgICAgYWRtaW5VaVN0YXRlLmxvZ2luRXJyb3IgPSAnJztcbiAgICAgIGF3YWl0IGxvZ2luQWRtaW5Hb29nbGUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gZXJyLm1lc3NhZ2UgfHwgJ0dvb2dsZSBzaWduLWluIGZhaWxlZC4nO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tc2VuZC12ZXJpZnknKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNlbmRBZG1pblZlcmlmaWNhdGlvbkVtYWlsKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzaG93VG9hc3QoZXJyLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBzZW5kIHZlcmlmaWNhdGlvbiBlbWFpbC4nLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLXJlZnJlc2gtdmVyaWZ5Jykge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZWZyZXNoQXV0aFZlcmlmaWNhdGlvbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgc2hvd1RvYXN0KGVyci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgcmVmcmVzaCB2ZXJpZmljYXRpb24gc3RhdHVzLicsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tZmlyZWJhc2Utc2lnbm91dCcpIHtcbiAgICBhd2FpdCBsb2dvdXRBZG1pbigpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1sb2dvdXQnKSB7XG4gICAgYXdhaXQgbG9nb3V0QWRtaW4oKTtcbiAgICBzaWduT3V0Q3VzdG9tZXIoKTtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCAnLycpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJ2hvbWUnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdjaGFydC1kYXlzJykge1xuICAgIGFkbWluVWlTdGF0ZS5jaGFydERheXMgPSBOdW1iZXIoZWwuZGF0YXNldC5kYXlzKSB8fCA3O1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1hZGQtcHJvZHVjdCcpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1Byb2R1Y3QgPSAnbmV3JztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tZWRpdC1wcm9kdWN0Jykge1xuICAgIGFkbWluVWlTdGF0ZS5lZGl0aW5nUHJvZHVjdCA9IHN0YXRlLnByb2R1Y3RzLmZpbmQoKHApID0+IHAuaWQgPT09IGVsLmRhdGFzZXQuaWQpIHx8IG51bGw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWRlbC1wcm9kdWN0Jykge1xuICAgIGNvbnN0IHAgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChpdGVtKSA9PiBTdHJpbmcoaXRlbS5pZCkgPT09IFN0cmluZyhlbC5kYXRhc2V0LmlkKSk7XG4gICAgaWYgKHApIHtcbiAgICAgIGFkbWluVWlTdGF0ZS5jb25maXJtRGlhbG9nID0ge1xuICAgICAgICBraW5kOiAncHJvZHVjdCcsXG4gICAgICAgIGlkOiBwLmlkLFxuICAgICAgICB0aXRsZTogJ0RlbGV0ZSBQcm9kdWN0JyxcbiAgICAgICAgbWVzc2FnZTogYERlbGV0ZSBcIiR7cC5uYW1lfVwiIHBlcm1hbmVudGx5PyBJdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgc3RvcmVmcm9udCBjYXRhbG9nIGFuZCBhY3RpdmUgY2FydHMuYCxcbiAgICAgICAgY29uZmlybUxhYmVsOiAnWWVzLCBEZWxldGUgUHJvZHVjdCdcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1xdWljay1lZGl0LWNhdCcpIHtcbiAgICBjb25zdCBhY3RpdmVOYW1lID0gYWRtaW5VaVN0YXRlLnByb2RDYXRGaWx0ZXIgJiYgYWRtaW5VaVN0YXRlLnByb2RDYXRGaWx0ZXIgIT09ICdBbGwnXG4gICAgICA/IGFkbWluVWlTdGF0ZS5wcm9kQ2F0RmlsdGVyXG4gICAgICA6ICcnO1xuICAgIGNvbnN0IG1hdGNoID0gKGFjdGl2ZU5hbWUgJiYgc3RhdGUuY2F0ZWdvcmllcy5maW5kKChjKSA9PiBjLm5hbWUgPT09IGFjdGl2ZU5hbWUpKSB8fCBzdGF0ZS5jYXRlZ29yaWVzWzBdO1xuICAgIGFkbWluVWlTdGF0ZS5xdWlja0VkaXRDYXRlZ29yeUlkID0gbWF0Y2ggPyBtYXRjaC5pZCA6ICcnO1xuICAgIGlmICghbWF0Y2gpIHNob3dUb2FzdCgnTm8gY2F0ZWdvcmllcyBhdmFpbGFibGUgdG8gZWRpdCB5ZXQuJywgdHJ1ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWFkZC1jYXQnKSB7XG4gICAgYWRtaW5VaVN0YXRlLmVkaXRpbmdDYXRlZ29yeSA9ICduZXcnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1lZGl0LWNhdCcpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ0NhdGVnb3J5ID0gc3RhdGUuY2F0ZWdvcmllcy5maW5kKChjKSA9PiBjLmlkID09PSBlbC5kYXRhc2V0LmlkKSB8fCBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1kZWwtY2F0Jykge1xuICAgIGNvbnN0IGMgPSBzdGF0ZS5jYXRlZ29yaWVzLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGVsLmRhdGFzZXQuaWQpO1xuICAgIGlmIChjKSB7XG4gICAgICBhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZyA9IHtcbiAgICAgICAga2luZDogJ2NhdGVnb3J5JyxcbiAgICAgICAgaWQ6IGMuaWQsXG4gICAgICAgIHRpdGxlOiAnRGVsZXRlIENhdGVnb3J5JyxcbiAgICAgICAgbWVzc2FnZTogYERlbGV0ZSBjYXRlZ29yeSBcIiR7Yy5uYW1lfVwiP2AsXG4gICAgICAgIGNvbmZpcm1MYWJlbDogJ1llcywgRGVsZXRlIENhdGVnb3J5J1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2NhdC1tb3ZlJykge1xuICAgIGNvbnN0IGlkeCA9IHN0YXRlLmNhdGVnb3JpZXMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBlbC5kYXRhc2V0LmlkKTtcbiAgICBjb25zdCBkaXIgPSBOdW1iZXIoZWwuZGF0YXNldC5kaXIpO1xuICAgIGNvbnN0IHN3YXBJZHggPSBpZHggKyBkaXI7XG4gICAgaWYgKGlkeCA+PSAwICYmIHN3YXBJZHggPj0gMCAmJiBzd2FwSWR4IDwgc3RhdGUuY2F0ZWdvcmllcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGEgPSBzdGF0ZS5jYXRlZ29yaWVzW2lkeF07XG4gICAgICBjb25zdCBiID0gc3RhdGUuY2F0ZWdvcmllc1tzd2FwSWR4XTtcbiAgICAgIGF3YWl0IHNhdmVDYXRlZ29yeSh7IC4uLmEsIHNvcnRPcmRlcjogc3dhcElkeCArIDEgfSwgZmFsc2UpO1xuICAgICAgYXdhaXQgc2F2ZUNhdGVnb3J5KHsgLi4uYiwgc29ydE9yZGVyOiBpZHggKyAxIH0sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWRlbC1vcmRlcicpIHtcbiAgICBhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZyA9IHtcbiAgICAgIGtpbmQ6ICdvcmRlcicsXG4gICAgICBpZDogZWwuZGF0YXNldC5pZCxcbiAgICAgIHRpdGxlOiAnRGVsZXRlIE9yZGVyJyxcbiAgICAgIG1lc3NhZ2U6ICdEZWxldGUgdGhpcyBvcmRlciBwZXJtYW5lbnRseT8nLFxuICAgICAgY29uZmlybUxhYmVsOiAnWWVzLCBEZWxldGUgT3JkZXInXG4gICAgfTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tYWRkLXBvc3QnKSB7XG4gICAgYWRtaW5VaVN0YXRlLmVkaXRpbmdQb3N0ID0gJ25ldyc7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWVkaXQtcG9zdCcpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1Bvc3QgPSBzdGF0ZS5wb3N0cy5maW5kKChwKSA9PiBwLmlkID09PSBlbC5kYXRhc2V0LmlkKSB8fCBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1jbGVhci1wb3N0LWlzc3VlJykge1xuICAgIGNvbnN0IHAgPSBzdGF0ZS5wb3N0cy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBlbC5kYXRhc2V0LmlkKTtcbiAgICBpZiAocCkge1xuICAgICAgYXdhaXQgc2F2ZVBvc3QoeyAuLi5wLCBpc3N1ZUZsYWc6IGZhbHNlLCBpc3N1ZU5vdGU6ICcnIH0sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWRlbC1wb3N0Jykge1xuICAgIGFkbWluVWlTdGF0ZS5jb25maXJtRGlhbG9nID0ge1xuICAgICAga2luZDogJ3Bvc3QnLFxuICAgICAgaWQ6IGVsLmRhdGFzZXQuaWQsXG4gICAgICB0aXRsZTogJ0RlbGV0ZSBCbG9nIFBvc3QnLFxuICAgICAgbWVzc2FnZTogJ0RlbGV0ZSB0aGlzIGJsb2cgcG9zdCBwZXJtYW5lbnRseT8nLFxuICAgICAgY29uZmlybUxhYmVsOiAnWWVzLCBEZWxldGUgUG9zdCdcbiAgICB9O1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1yZXZpZXctZmlsdGVyJykge1xuICAgIGFkbWluVWlTdGF0ZS5yZXZpZXdGaWx0ZXIgPSBlbC5kYXRhc2V0LmZpbHRlciB8fCAnYWxsJztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tYWRkLXJldmlldycpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1JldmlldyA9ICduZXcnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1lZGl0LXJldmlldycpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1JldmlldyA9IHN0YXRlLnJldmlld3MuZmluZCgocikgPT4gci5pZCA9PT0gZWwuZGF0YXNldC5pZCkgfHwgbnVsbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tdG9nZ2xlLXJldmlldycpIHtcbiAgICBhd2FpdCB0b2dnbGVSZXZpZXdBcHByb3ZhbChlbC5kYXRhc2V0LmlkKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRtaW4tZGVsLXJldmlldycpIHtcbiAgICBhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZyA9IHtcbiAgICAgIGtpbmQ6ICdyZXZpZXcnLFxuICAgICAgaWQ6IGVsLmRhdGFzZXQuaWQsXG4gICAgICB0aXRsZTogJ0RlbGV0ZSBSZXZpZXcnLFxuICAgICAgbWVzc2FnZTogJ0RlbGV0ZSB0aGlzIGN1c3RvbWVyIHJldmlldyBwZXJtYW5lbnRseT8nLFxuICAgICAgY29uZmlybUxhYmVsOiAnWWVzLCBEZWxldGUgUmV2aWV3J1xuICAgIH07XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2FkbWluLWNhbmNlbC1kZWxldGUnKSB7XG4gICAgYWRtaW5VaVN0YXRlLmNvbmZpcm1EaWFsb2cgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1jb25maXJtLWRlbGV0ZScpIHtcbiAgICBjb25zdCBjZmcgPSBhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZztcbiAgICBhZG1pblVpU3RhdGUuY29uZmlybURpYWxvZyA9IG51bGw7XG4gICAgaWYgKCFjZmcpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBpZiAoY2ZnLmtpbmQgPT09ICdwcm9kdWN0JykgYXdhaXQgZGVsZXRlUHJvZHVjdChjZmcuaWQpO1xuICAgICAgZWxzZSBpZiAoY2ZnLmtpbmQgPT09ICdjYXRlZ29yeScpIGF3YWl0IGRlbGV0ZUNhdGVnb3J5KGNmZy5pZCk7XG4gICAgICBlbHNlIGlmIChjZmcua2luZCA9PT0gJ29yZGVyJykgYXdhaXQgZGVsZXRlT3JkZXIoY2ZnLmlkKTtcbiAgICAgIGVsc2UgaWYgKGNmZy5raW5kID09PSAncG9zdCcpIGF3YWl0IGRlbGV0ZVBvc3QoY2ZnLmlkKTtcbiAgICAgIGVsc2UgaWYgKGNmZy5raW5kID09PSAncmV2aWV3JykgYXdhaXQgZGVsZXRlUmV2aWV3KGNmZy5pZCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzaG93VG9hc3QoZXJyLm1lc3NhZ2UgfHwgJ0RlbGV0ZSBmYWlsZWQuJywgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZG1pbi1jbG9zZS1tb2RhbCcpIHtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1Byb2R1Y3QgPSBudWxsO1xuICAgIGFkbWluVWlTdGF0ZS5lZGl0aW5nQ2F0ZWdvcnkgPSBudWxsO1xuICAgIGFkbWluVWlTdGF0ZS5xdWlja0VkaXRDYXRlZ29yeUlkID0gJyc7XG4gICAgYWRtaW5VaVN0YXRlLmNvbmZpcm1EaWFsb2cgPSBudWxsO1xuICAgIGFkbWluVWlTdGF0ZS5lZGl0aW5nUG9zdCA9IG51bGw7XG4gICAgYWRtaW5VaVN0YXRlLmVkaXRpbmdSZXZpZXcgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdhZGQtc3BlYy1yb3cnKSB7XG4gICAgY29uc3QgYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwZWMtcm93cy1jb250YWluZXInKTtcbiAgICBpZiAoYm94KSB7XG4gICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHJvdy5jbGFzc05hbWUgPSAnc3BlYy1yb3cnO1xuICAgICAgcm93LnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpmbGV4O2dhcDo4cHg7JztcbiAgICAgIHJvdy5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IHNwZWMta2V5XCIgcGxhY2Vob2xkZXI9XCJTcGVjIG5hbWVcIiAvPlxuICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBzcGVjLXZhbFwiIHBsYWNlaG9sZGVyPVwiU3BlYyB2YWx1ZVwiIC8+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCIgb25jbGljaz1cInRoaXMucGFyZW50RWxlbWVudC5yZW1vdmUoKVwiPsOXPC9idXR0b24+XG4gICAgICBgO1xuICAgICAgYm94LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAncmljaC10YWcnKSB7XG4gICAgY29uc3QgdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zdC1ib2R5LXRleHRhcmVhJyk7XG4gICAgY29uc3QgdGFnID0gZWwuZGF0YXNldC50YWc7XG4gICAgaWYgKHRhICYmIHRhZykge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0YS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIGNvbnN0IGVuZCA9IHRhLnNlbGVjdGlvbkVuZDtcbiAgICAgIGNvbnN0IHNlbCA9IHRhLnZhbHVlLnNsaWNlKHN0YXJ0LCBlbmQpIHx8ICdUZXh0IGhlcmUnO1xuICAgICAgY29uc3QgaW5zID0gYDwke3RhZ30+JHtzZWx9PC8ke3RhZ30+YDtcbiAgICAgIHRhLnNldFJhbmdlVGV4dChpbnMsIHN0YXJ0LCBlbmQsICdlbmQnKTtcbiAgICAgIHRhLmZvY3VzKCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnYWRkLWhlcm8tc2xpZGUnKSB7XG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZXJvLXNsaWRlcy1saXN0Jyk7XG4gICAgaWYgKGxpc3QpIHtcbiAgICAgIGNvbnN0IGlkeCA9IGxpc3QuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgY29uc3QgcHJvZHVjdE9wdGlvbnMgPSBzdGF0ZS5wcm9kdWN0cy5tYXAoKHApID0+IChcbiAgICAgICAgYDxvcHRpb24gdmFsdWU9XCIke2VzY0h0bWwocC5pZCl9XCI+JHtlc2NIdG1sKHAubmFtZSl9ICgke2Zvcm1hdFByaWNlKHAucHJpY2UpfSk8L29wdGlvbj5gXG4gICAgICApKS5qb2luKCcnKTtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmNsYXNzTmFtZSA9ICdoZXJvLXNsaWRlLWVkaXRvcic7XG4gICAgICBkaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjE0cHg7YmFja2dyb3VuZDp2YXIoLS1iZyk7Ym9yZGVyLXJhZGl1czoxMnB4O2Rpc3BsYXk6Z3JpZDtnYXA6MTBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7JztcbiAgICAgIGRpdi5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO1wiPjxzdHJvbmc+TmV3IFNsaWRlICgke2lkeCArIDF9KTwvc3Ryb25nPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCIgb25jbGljaz1cInRoaXMuY2xvc2VzdCgnLmhlcm8tc2xpZGUtZWRpdG9yJykucmVtb3ZlKClcIj5SZW1vdmU8L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tcm93LTJcIj48aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBocy1oZWFkbGluZVwiIHBsYWNlaG9sZGVyPVwiSGVhZGxpbmVcIiAvPjxpbnB1dCBjbGFzcz1cImZpZWxkLWlucHV0IGhzLWtpY2tlclwiIHBsYWNlaG9sZGVyPVwiS2lja2VyICh0b3AgbGFiZWwpXCIgLz48L2Rpdj5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgaHMtc3VidGV4dFwiIHBsYWNlaG9sZGVyPVwiU3VidGV4dFwiIC8+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXJvdy0yXCI+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgaHMtYnRuLXRleHRcIiB2YWx1ZT1cIlNob3AgTm93XCIgcGxhY2Vob2xkZXI9XCJCdXR0b24gVGV4dFwiIC8+PGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgaHMtYnRuLWxpbmtcIiB2YWx1ZT1cIiNkZWFsc1wiIHBsYWNlaG9sZGVyPVwiQnV0dG9uIExpbmtcIiAvPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1yb3ctMlwiIHN0eWxlPVwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgoMTc1cHgsMWZyKSk7XCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+QW5pbWF0ZWQgRmVhdHVyZWQgUHJvZHVjdDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZmllbGQtc2VsZWN0IGhzLXByb2R1Y3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPk5vbmUgKEJhbm5lciBJbWFnZSBPbmx5KTwvb3B0aW9uPlxuICAgICAgICAgICAgICAke3Byb2R1Y3RPcHRpb25zfVxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCI+SGlnaGxpZ2h0IEJhZGdlIFRleHQ8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZmllbGQtaW5wdXQgaHMtYmFkZ2VcIiBwbGFjZWhvbGRlcj1cImUuZy4gSG90IERlYWxcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiPlNsaWRlIFRyYW5zaXRpb24gU3R5bGU8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImZpZWxkLXNlbGVjdCBocy1hbmltXCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJnbGlkZVwiPlNtb290aCBQYXJhbGxheCBHbGlkZTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiem9vbVwiPkNpbmVtYXRpYyBTbG93IFpvb208L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImZhZGVcIj5Tb2Z0IEVkaXRvcmlhbCBSZXZlYWw8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIm9yYml0XCI+R2VudGxlIERlcHRoIERyaWZ0PC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7Z2FwOjhweDtcIj5cbiAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmaWVsZC1pbnB1dCBocy1pbWdcIiBpZD1cImhzLWltZy0ke2lkeH1cIiBwbGFjZWhvbGRlcj1cIkJhY2tncm91bmQgLyBCYW5uZXIgSW1hZ2UgVVJMXCIgLz5cbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1vdXRsaW5lXCIgc3R5bGU9XCJjdXJzb3I6cG9pbnRlcjtcIj5VcGxvYWQgPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIGhpZGRlbiBkYXRhLXVwbG9hZC10YXJnZXQ9XCJocy1pbWctJHtpZHh9XCIgLz48L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG4gICAgICBsaXN0LmFwcGVuZENoaWxkKGRpdik7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAncmVzZXQtdGhlbWUtY29sb3JzJykge1xuICAgIGF3YWl0IHNhdmVTZXR0aW5nc0RvYygndGhlbWUnLCB7XG4gICAgICAuLi5zdGF0ZS50aGVtZSxcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwRjc2NkUnLFxuICAgICAgYWNjZW50Q29sb3I6ICcjRkY2QjU3JyxcbiAgICAgIGJnQ29sb3I6ICcjRkFGOEY1J1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdkb3dubG9hZC16aXAnKSB7XG4gICAgc2hvd1RvYXN0KCdCdWlsZGluZyBmdWxsIHN0YXRpYyBaSVAgcGFja2FnZS4uLicpO1xuICAgIGF3YWl0IGRvd25sb2FkU291cmNlWmlwKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChhY3Rpb24gPT09ICdleHBvcnQtcHJvZHVjdHMtY3N2Jykge1xuICAgIGV4cG9ydENzdihcbiAgICAgICdwYXphcm9iZC1wcm9kdWN0cy5jc3YnLFxuICAgICAgWydJRCcsICdOYW1lJywgJ0NhdGVnb3J5JywgJ0JyYW5kJywgJ1ByaWNlIChCRFQpJywgJ09sZCBQcmljZScsICdTdG9jaycsICdVbml0cyBTb2xkJywgJ1NLVSddLFxuICAgICAgc3RhdGUucHJvZHVjdHMubWFwKChwKSA9PiBbcC5pZCwgcC5uYW1lLCBwLmNhdGVnb3J5LCBwLmJyYW5kLCBwLnByaWNlLCBwLm9sZFByaWNlIHx8ICcnLCBwLnN0b2NrLCBwLnVuaXRzU29sZCB8fCAwLCBwLnNrdSB8fCAnJ10pXG4gICAgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGFjdGlvbiA9PT0gJ2V4cG9ydC1vcmRlcnMtY3N2Jykge1xuICAgIGV4cG9ydENzdihcbiAgICAgICdwYXphcm9iZC1vcmRlcnMuY3N2JyxcbiAgICAgIFsnT3JkZXIgQ29kZScsICdDdXN0b21lcicsICdQaG9uZScsICdEaXZpc2lvbicsICdEaXN0cmljdCcsICdVcGF6aWxhL1RoYW5hJywgJ0FkZHJlc3MnLCAnUGF5bWVudCcsICdTdWJ0b3RhbCcsICdEZWxpdmVyeScsICdUb3RhbCAoQkRUKScsICdTdGF0dXMnXSxcbiAgICAgIHN0YXRlLm9yZGVycy5tYXAoKG8pID0+IFtvLm9yZGVyQ29kZSwgby5jdXN0b21lck5hbWUsIG8ucGhvbmUsIG8uZGl2aXNpb24gfHwgJycsIG8uZGlzdHJpY3QsIG8udXBhemlsYSB8fCAnJywgby5hZGRyZXNzLCBvLnBheW1lbnRNZXRob2QsIG8uc3VidG90YWwsIG8uZGVsaXZlcnlDaGFyZ2UsIG8udG90YWwsIG8uc3RhdHVzXSlcbiAgICApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoYWN0aW9uID09PSAnc2VlZC1kZW1vLW5vdycpIHtcbiAgICBhd2FpdCBzZWVkRGVtb0RhdGFUb0ZpcmVzdG9yZSh0cnVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVBZG1pbkZvcm1TdWJtaXQoZm9ybSkge1xuICBpZiAoZm9ybS5pZCA9PT0gJ2FkbWluLWxvZ2luLWZvcm0nKSB7XG4gICAgY29uc3QgZW1haWwgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNhZG1pbi1lbWFpbCcpPy52YWx1ZS50cmltKCkgfHwgJyc7XG4gICAgY29uc3QgcGFzcyA9IGZvcm0ucXVlcnlTZWxlY3RvcignI2FkbWluLXBhc3MnKT8udmFsdWUgfHwgJyc7XG4gICAgdHJ5IHtcbiAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gJyc7XG4gICAgICBhd2FpdCBsb2dpbkFkbWluRW1haWwoZW1haWwsIHBhc3MpO1xuICAgICAgaWYgKHN0YXRlLmF1dGhVc2VyICYmICFzdGF0ZS5hdXRoVXNlci5lbWFpbFZlcmlmaWVkKSB7XG4gICAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gJ1NpZ25lZCBpbiwgYnV0IHRoaXMgZW1haWwgaXMgbm90IHZlcmlmaWVkIHlldC4gU2VuZCBhIHZlcmlmaWNhdGlvbiBlbWFpbCBhYm92ZSB0byBlbmFibGUgbGl2ZSBGaXJlc3RvcmUgd3JpdGVzLic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaG93VG9hc3QoJ1NpZ25lZCBpbiB0byBGaXJlYmFzZSBBZG1pbiBBdXRoLicpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgY29kZSA9IGVycj8uY29kZSB8fCAnJztcbiAgICAgIGlmIChjb2RlID09PSAnYXV0aC9vcGVyYXRpb24tbm90LWFsbG93ZWQnKSB7XG4gICAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gJ0VtYWlsL1Bhc3N3b3JkIHNpZ24taW4gaXMgbm90IGVuYWJsZWQgaW4gRmlyZWJhc2UgQ29uc29sZSB5ZXQuIEVuYWJsZSBpdCB1bmRlciBBdXRoZW50aWNhdGlvbiAtPiBTaWduLWluIG1ldGhvZCwgb3IgdXNlIEdvb2dsZSBTaWduLUluLic7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUgPT09ICdhdXRoL2ludmFsaWQtY3JlZGVudGlhbCcgfHwgY29kZSA9PT0gJ2F1dGgvd3JvbmctcGFzc3dvcmQnIHx8IGNvZGUgPT09ICdhdXRoL3VzZXItbm90LWZvdW5kJykge1xuICAgICAgICBhZG1pblVpU3RhdGUubG9naW5FcnJvciA9ICdJbnZhbGlkIGFkbWluIGVtYWlsIG9yIHBhc3N3b3JkLiBWZXJpZnkgdGhlIHVzZXIgZXhpc3RzIGluIEZpcmViYXNlIEF1dGhlbnRpY2F0aW9uIChwYXphcm8tYmQpLic7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUgPT09ICdhdXRoL3Rvby1tYW55LXJlcXVlc3RzJykge1xuICAgICAgICBhZG1pblVpU3RhdGUubG9naW5FcnJvciA9ICdUb28gbWFueSBmYWlsZWQgc2lnbi1pbiBhdHRlbXB0cy4gUGxlYXNlIHdhaXQgYSBmZXcgbWludXRlcyBhbmQgdHJ5IGFnYWluLic7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUgPT09ICdhdXRoL25ldHdvcmstcmVxdWVzdC1mYWlsZWQnKSB7XG4gICAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gJ05ldHdvcmsgZXJyb3IgcmVhY2hpbmcgRmlyZWJhc2UgQXV0aGVudGljYXRpb24uIENoZWNrIHlvdXIgaW50ZXJuZXQgY29ubmVjdGlvbiBhbmQgcmV0cnkuJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkbWluVWlTdGF0ZS5sb2dpbkVycm9yID0gZXJyLm1lc3NhZ2UgfHwgJ0ludmFsaWQgZW1haWwgb3IgcGFzc3dvcmQuJztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2FkbWluLXByb2R1Y3QtZm9ybScpIHtcbiAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBjb25zdCBpc05ldyA9IGZvcm0uZGF0YXNldC5pc05ldyA9PT0gJ3RydWUnO1xuICAgIGNvbnN0IHNwZWNSb3dzID0gQXJyYXkuZnJvbShmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zcGVjLXJvdycpKVxuICAgICAgLm1hcCgocikgPT4gKHtcbiAgICAgICAga2V5OiByLnF1ZXJ5U2VsZWN0b3IoJy5zcGVjLWtleScpLnZhbHVlLnRyaW0oKSxcbiAgICAgICAgdmFsdWU6IHIucXVlcnlTZWxlY3RvcignLnNwZWMtdmFsJykudmFsdWUudHJpbSgpXG4gICAgICB9KSlcbiAgICAgIC5maWx0ZXIoKHMpID0+IHMua2V5ICYmIHMudmFsdWUpO1xuICAgIGNvbnN0IGltYWdlcyA9IEFycmF5LmZyb20oZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZC1pbWctaW5wdXQnKSkubWFwKChpKSA9PiBpLnZhbHVlLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgYXdhaXQgc2F2ZVByb2R1Y3Qoe1xuICAgICAgaWQ6IGZvcm0uZGF0YXNldC5pZCxcbiAgICAgIG5hbWU6IGZkLmdldCgnbmFtZScpLFxuICAgICAgY2F0ZWdvcnk6IGZkLmdldCgnY2F0ZWdvcnknKSxcbiAgICAgIGJyYW5kOiBmZC5nZXQoJ2JyYW5kJyksXG4gICAgICBza3U6IGZkLmdldCgnc2t1JyksXG4gICAgICBwcmljZTogTnVtYmVyKGZkLmdldCgncHJpY2UnKSksXG4gICAgICBvbGRQcmljZTogTnVtYmVyKGZkLmdldCgnb2xkUHJpY2UnKSksXG4gICAgICBzdG9jazogcGFyc2VJbnQoU3RyaW5nKGZkLmdldCgnc3RvY2snKSksIDEwKSxcbiAgICAgIHJhdGluZzogTnVtYmVyKGZkLmdldCgncmF0aW5nJykpLFxuICAgICAgc2hvcnREZXNjcmlwdGlvbjogZmQuZ2V0KCdzaG9ydERlc2NyaXB0aW9uJyksXG4gICAgICBmdWxsRGVzY3JpcHRpb246IGZkLmdldCgnZnVsbERlc2NyaXB0aW9uJyksXG4gICAgICBmZWF0dXJlczogU3RyaW5nKGZkLmdldCgnZmVhdHVyZXMnKSB8fCAnJykuc3BsaXQoJ1xcbicpLm1hcCgocykgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgICAgIHNwZWNzOiBzcGVjUm93cyxcbiAgICAgIG9wdGlvbnM6IFN0cmluZyhmZC5nZXQoJ29wdGlvbnMnKSB8fCAnJykuc3BsaXQoJywnKS5tYXAoKHMpID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbiksXG4gICAgICB0YWdzOiBTdHJpbmcoZmQuZ2V0KCd0YWdzJykgfHwgJycpLnNwbGl0KCcsJykubWFwKChzKSA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pLFxuICAgICAgaW1hZ2VzLFxuICAgICAgdmlkZW9Vcmw6IGZkLmdldCgndmlkZW9VcmwnKSxcbiAgICAgIHZpZGVvUG9zdGVyOiBmZC5nZXQoJ3ZpZGVvUG9zdGVyJyksXG4gICAgICBpc0ZlYXR1cmVkOiBCb29sZWFuKGZkLmdldCgnaXNGZWF0dXJlZCcpKSxcbiAgICAgIGlzRmxhc2hTYWxlOiBCb29sZWFuKGZkLmdldCgnaXNGbGFzaFNhbGUnKSksXG4gICAgICBpc1RyZW5kaW5nOiBCb29sZWFuKGZkLmdldCgnaXNUcmVuZGluZycpKSxcbiAgICAgIGlzTmV3QXJyaXZhbDogQm9vbGVhbihmZC5nZXQoJ2lzTmV3QXJyaXZhbCcpKVxuICAgIH0sIGlzTmV3KTtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1Byb2R1Y3QgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdhZG1pbi1jYXQtZm9ybScpIHtcbiAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBzYXZlQ2F0ZWdvcnkoe1xuICAgICAgaWQ6IGZvcm0uZGF0YXNldC5pZCxcbiAgICAgIG5hbWU6IGZkLmdldCgnbmFtZScpLFxuICAgICAgbmFtZUJuOiBmZC5nZXQoJ25hbWVCbicpLFxuICAgICAgaWNvbjogZmQuZ2V0KCdpY29uJyksXG4gICAgICBpbWFnZVVybDogZmQuZ2V0KCdpbWFnZVVybCcpLFxuICAgICAgc29ydE9yZGVyOiBwYXJzZUludChTdHJpbmcoZmQuZ2V0KCdzb3J0T3JkZXInKSksIDEwKSB8fCAxXG4gICAgfSwgZm9ybS5kYXRhc2V0LmlzTmV3ID09PSAndHJ1ZScpO1xuICAgIGlmIChyZXM/LnJlbmFtZWQgJiYgYWRtaW5VaVN0YXRlLnByb2RDYXRGaWx0ZXIgPT09IHJlcy5vbGROYW1lKSB7XG4gICAgICBhZG1pblVpU3RhdGUucHJvZENhdEZpbHRlciA9IHJlcy5uZXdOYW1lO1xuICAgIH1cbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ0NhdGVnb3J5ID0gbnVsbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChmb3JtLmlkID09PSAnYWRtaW4tcXVpY2stY2F0LWZvcm0nKSB7XG4gICAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG4gICAgY29uc3QgdGFyZ2V0SWQgPSBTdHJpbmcoZmQuZ2V0KCdjYXRlZ29yeUlkJykgfHwgZm9ybS5kYXRhc2V0LmlkIHx8ICcnKTtcbiAgICBjb25zdCBleGlzdGluZ0NhdCA9IHN0YXRlLmNhdGVnb3JpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gdGFyZ2V0SWQpO1xuICAgIGlmIChleGlzdGluZ0NhdCkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgc2F2ZUNhdGVnb3J5KHtcbiAgICAgICAgLi4uZXhpc3RpbmdDYXQsXG4gICAgICAgIG5hbWU6IGZkLmdldCgnbmFtZScpLFxuICAgICAgICBuYW1lQm46IGZkLmdldCgnbmFtZUJuJyksXG4gICAgICAgIGljb246IGZkLmdldCgnaWNvbicpXG4gICAgICB9LCBmYWxzZSk7XG4gICAgICBpZiAocmVzPy5yZW5hbWVkICYmIGFkbWluVWlTdGF0ZS5wcm9kQ2F0RmlsdGVyID09PSByZXMub2xkTmFtZSkge1xuICAgICAgICBhZG1pblVpU3RhdGUucHJvZENhdEZpbHRlciA9IHJlcy5uZXdOYW1lO1xuICAgICAgfVxuICAgIH1cbiAgICBhZG1pblVpU3RhdGUucXVpY2tFZGl0Q2F0ZWdvcnlJZCA9ICcnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdhZG1pbi1wb3N0LWZvcm0nKSB7XG4gICAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG4gICAgYXdhaXQgc2F2ZVBvc3Qoe1xuICAgICAgaWQ6IGZvcm0uZGF0YXNldC5pZCxcbiAgICAgIHRpdGxlOiBmZC5nZXQoJ3RpdGxlJyksXG4gICAgICBjYXRlZ29yeTogZmQuZ2V0KCdjYXRlZ29yeScpLFxuICAgICAgY292ZXJJbWFnZTogZmQuZ2V0KCdjb3ZlckltYWdlJyksXG4gICAgICBleGNlcnB0OiBmZC5nZXQoJ2V4Y2VycHQnKSxcbiAgICAgIGJvZHk6IGZkLmdldCgnYm9keScpLFxuICAgICAgdGFnczogU3RyaW5nKGZkLmdldCgndGFncycpIHx8ICcnKS5zcGxpdCgnLCcpLm1hcCgocykgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKSxcbiAgICAgIHB1Ymxpc2hlZDogQm9vbGVhbihmZC5nZXQoJ3B1Ymxpc2hlZCcpKSxcbiAgICAgIGlzc3VlRmxhZzogQm9vbGVhbihmZC5nZXQoJ2lzc3VlRmxhZycpKSxcbiAgICAgIGlzc3VlTm90ZTogZmQuZ2V0KCdpc3N1ZU5vdGUnKVxuICAgIH0sIGZvcm0uZGF0YXNldC5pc05ldyA9PT0gJ3RydWUnKTtcbiAgICBhZG1pblVpU3RhdGUuZWRpdGluZ1Bvc3QgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGZvcm0uaWQgPT09ICdhZG1pbi1yZXZpZXctZm9ybScpIHtcbiAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBjb25zdCBwcm9kdWN0SWQgPSBTdHJpbmcoZmQuZ2V0KCdwcm9kdWN0SWQnKSB8fCAnJykudHJpbSgpO1xuICAgIGNvbnN0IHByb2QgPSBzdGF0ZS5wcm9kdWN0cy5maW5kKChwKSA9PiBwLmlkID09PSBwcm9kdWN0SWQpO1xuICAgIGF3YWl0IHNhdmVSZXZpZXcoe1xuICAgICAgaWQ6IGZvcm0uZGF0YXNldC5pZCxcbiAgICAgIHByb2R1Y3RJZCxcbiAgICAgIHByb2R1Y3ROYW1lOiBwcm9kPy5uYW1lIHx8ICdHZW5lcmFsIFN0b3JlJyxcbiAgICAgIGF1dGhvck5hbWU6IGZkLmdldCgnYXV0aG9yTmFtZScpLFxuICAgICAgY2l0eTogZmQuZ2V0KCdjaXR5JyksXG4gICAgICByYXRpbmc6IE51bWJlcihmZC5nZXQoJ3JhdGluZycpKSB8fCA1LFxuICAgICAgY29tbWVudDogZmQuZ2V0KCdjb21tZW50JyksXG4gICAgICBhcHByb3ZlZDogQm9vbGVhbihmZC5nZXQoJ2FwcHJvdmVkJykpXG4gICAgfSwgZm9ybS5kYXRhc2V0LmlzTmV3ID09PSAndHJ1ZScpO1xuICAgIGFkbWluVWlTdGF0ZS5lZGl0aW5nUmV2aWV3ID0gbnVsbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChmb3JtLmlkID09PSAnYWRtaW4tdGhlbWUtZm9ybScpIHtcbiAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBjb25zdCBoZXJvU2xpZGVzID0gQXJyYXkuZnJvbShmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5oZXJvLXNsaWRlLWVkaXRvcicpKS5tYXAoKGVsLCBpZHgpID0+ICh7XG4gICAgICBpZDogYHNsaWRlLSR7aWR4ICsgMX1gLFxuICAgICAgaGVhZGxpbmU6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5ocy1oZWFkbGluZScpPy52YWx1ZS50cmltKCkgfHwgJycsXG4gICAgICBraWNrZXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5ocy1raWNrZXInKT8udmFsdWUudHJpbSgpIHx8ICcnLFxuICAgICAgc3VidGV4dDogZWwucXVlcnlTZWxlY3RvcignLmhzLXN1YnRleHQnKT8udmFsdWUudHJpbSgpIHx8ICcnLFxuICAgICAgYnV0dG9uVGV4dDogZWwucXVlcnlTZWxlY3RvcignLmhzLWJ0bi10ZXh0Jyk/LnZhbHVlLnRyaW0oKSB8fCAnU2hvcCBOb3cnLFxuICAgICAgYnV0dG9uTGluazogZWwucXVlcnlTZWxlY3RvcignLmhzLWJ0bi1saW5rJyk/LnZhbHVlLnRyaW0oKSB8fCAnI2RlYWxzJyxcbiAgICAgIGltYWdlVXJsOiBlbC5xdWVyeVNlbGVjdG9yKCcuaHMtaW1nJyk/LnZhbHVlLnRyaW0oKSB8fCAnJyxcbiAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiBlbC5xdWVyeVNlbGVjdG9yKCcuaHMtcHJvZHVjdCcpPy52YWx1ZS50cmltKCkgfHwgJycsXG4gICAgICBiYWRnZVRleHQ6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5ocy1iYWRnZScpPy52YWx1ZS50cmltKCkgfHwgJycsXG4gICAgICBhbmltU3R5bGU6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5ocy1hbmltJyk/LnZhbHVlLnRyaW0oKSB8fCAnZmxvYXQnXG4gICAgfSkpO1xuICAgIGNvbnN0IHByb21vVGlsZXMgPSBBcnJheS5mcm9tKGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLnByb21vLXRpbGUtZWRpdG9yJykpLm1hcCgoZWwsIGlkeCkgPT4gKHtcbiAgICAgIGlkOiBgcHJvbW8tJHtpZHggKyAxfWAsXG4gICAgICB0aXRsZTogZWwucXVlcnlTZWxlY3RvcignLnB0LXRpdGxlJykudmFsdWUudHJpbSgpLFxuICAgICAgc3VidGV4dDogZWwucXVlcnlTZWxlY3RvcignLnB0LXN1YicpLnZhbHVlLnRyaW0oKSxcbiAgICAgIGJ1dHRvblRleHQ6IGVsLnF1ZXJ5U2VsZWN0b3IoJy5wdC1idG4nKS52YWx1ZS50cmltKCksXG4gICAgICBsaW5rOiBlbC5xdWVyeVNlbGVjdG9yKCcucHQtbGluaycpLnZhbHVlLnRyaW0oKSxcbiAgICAgIGltYWdlVXJsOiBlbC5xdWVyeVNlbGVjdG9yKCcucHQtaW1nJykudmFsdWUudHJpbSgpXG4gICAgfSkpO1xuICAgIGF3YWl0IHNhdmVTZXR0aW5nc0RvYygndGhlbWUnLCB7XG4gICAgICBoZXJvVmVyc2lvbjogMixcbiAgICAgIGhlcm9TbGlkZXNDdXN0b21pemVkOiB0cnVlLFxuICAgICAgcHJpbWFyeUNvbG9yOiBmZC5nZXQoJ3ByaW1hcnlDb2xvcicpLFxuICAgICAgYWNjZW50Q29sb3I6IGZkLmdldCgnYWNjZW50Q29sb3InKSxcbiAgICAgIGJnQ29sb3I6IGZkLmdldCgnYmdDb2xvcicpLFxuICAgICAgaGVyb1NsaWRlcyxcbiAgICAgIHByb21vVGlsZXNcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChmb3JtLmlkID09PSAnYWRtaW4tYnJhbmRpbmctZm9ybScpIHtcbiAgICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBhd2FpdCBzYXZlU2V0dGluZ3NEb2MoJ2dlbmVyYWwnLCB7XG4gICAgICAuLi5zdGF0ZS5nZW5lcmFsLFxuICAgICAgbG9nb1VybDogZmQuZ2V0KCdsb2dvVXJsJyksXG4gICAgICBmYXZpY29uVXJsOiBmZC5nZXQoJ2Zhdmljb25VcmwnKSxcbiAgICAgIHNpdGVOYW1lOiBmZC5nZXQoJ3NpdGVOYW1lJyksXG4gICAgICB0YWdsaW5lOiBmZC5nZXQoJ3RhZ2xpbmUnKSxcbiAgICAgIHBob25lOiBmZC5nZXQoJ3Bob25lJyksXG4gICAgICB3aGF0c2FwcDogZmQuZ2V0KCd3aGF0c2FwcCcpLFxuICAgICAgZW1haWw6IGZkLmdldCgnZW1haWwnKSxcbiAgICAgIGFkZHJlc3M6IGZkLmdldCgnYWRkcmVzcycpLFxuICAgICAgZmFjZWJvb2tVcmw6IGZkLmdldCgnZmFjZWJvb2tVcmwnKSxcbiAgICAgIGluc3RhZ3JhbVVybDogZmQuZ2V0KCdpbnN0YWdyYW1VcmwnKSxcbiAgICAgIHlvdXR1YmVVcmw6IGZkLmdldCgneW91dHViZVVybCcpXG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2FkbWluLWFkcy1mb3JtJykge1xuICAgIGNvbnN0IHNsb3RzID0ge307XG4gICAgZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcuYWQtc2xvdC1lZGl0b3InKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgc2xvdHNbZWwuZGF0YXNldC5zbG90XSA9IHtcbiAgICAgICAgZW5hYmxlZDogZWwucXVlcnlTZWxlY3RvcignLmFkLWVuYWJsZWQnKS5jaGVja2VkLFxuICAgICAgICBpbWFnZVVybDogZWwucXVlcnlTZWxlY3RvcignLmFkLWltZycpLnZhbHVlLnRyaW0oKSxcbiAgICAgICAgbGlua1VybDogZWwucXVlcnlTZWxlY3RvcignLmFkLWxpbmsnKS52YWx1ZS50cmltKCksXG4gICAgICAgIGh0bWxDb2RlOiBlbC5xdWVyeVNlbGVjdG9yKCcuYWQtaHRtbCcpLnZhbHVlLnRyaW0oKVxuICAgICAgfTtcbiAgICB9KTtcbiAgICBhd2FpdCBzYXZlU2V0dGluZ3NEb2MoJ2FkcycsIHsgc2xvdHMgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2FkbWluLXNldHRpbmdzLWZvcm0nKSB7XG4gICAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG4gICAgYXdhaXQgc2F2ZVNldHRpbmdzRG9jKCdnZW5lcmFsJywge1xuICAgICAgLi4uc3RhdGUuZ2VuZXJhbCxcbiAgICAgIGluc2lkZURoYWthRmVlOiBOdW1iZXIoZmQuZ2V0KCdpbnNpZGVEaGFrYUZlZScpKSB8fCAwLFxuICAgICAgb3V0c2lkZURoYWthRmVlOiBOdW1iZXIoZmQuZ2V0KCdvdXRzaWRlRGhha2FGZWUnKSkgfHwgMCxcbiAgICAgIGZyZWVEZWxpdmVyeU1pbjogTnVtYmVyKGZkLmdldCgnZnJlZURlbGl2ZXJ5TWluJykpIHx8IDAsXG4gICAgICBjdXJyZW5jeVN5bWJvbDogZmQuZ2V0KCdjdXJyZW5jeVN5bWJvbCcpIHx8ICfgp7MnLFxuICAgICAgbWFwRW5hYmxlZDogQm9vbGVhbihmZC5nZXQoJ21hcEVuYWJsZWQnKSksXG4gICAgICBtYXBQcm92aWRlcjogU3RyaW5nKGZkLmdldCgnbWFwUHJvdmlkZXInKSB8fCAnb3NtJyksXG4gICAgICBtYXBEZWZhdWx0TGF0OiBOdW1iZXIoZmQuZ2V0KCdtYXBEZWZhdWx0TGF0JykpIHx8IDIzLjgxMDMsXG4gICAgICBtYXBEZWZhdWx0TG5nOiBOdW1iZXIoZmQuZ2V0KCdtYXBEZWZhdWx0TG5nJykpIHx8IDkwLjQxMjUsXG4gICAgICBtYXBEZWZhdWx0Wm9vbTogTWF0aC5tYXgoNiwgTWF0aC5taW4oMTgsIHBhcnNlSW50KFN0cmluZyhmZC5nZXQoJ21hcERlZmF1bHRab29tJykgfHwgMTIpLCAxMCkgfHwgMTIpKSxcbiAgICAgIGZvb3RlclRleHQ6IGZkLmdldCgnZm9vdGVyVGV4dCcpLFxuICAgICAgbWFpbnRlbmFuY2VNb2RlOiBCb29sZWFuKGZkLmdldCgnbWFpbnRlbmFuY2VNb2RlJykpXG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoZm9ybS5pZCA9PT0gJ2FkbWluLWFkZC11aWQtZm9ybScpIHtcbiAgICBjb25zdCB1aWQgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNncmFudC11aWQnKS52YWx1ZS50cmltKCk7XG4gICAgY29uc3QgZW1haWwgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJyNncmFudC1lbWFpbCcpLnZhbHVlLnRyaW0oKTtcbiAgICBpZiAodWlkICYmIGVtYWlsKSBhd2FpdCBhZGRBZG1pblVpZCh1aWQsIGVtYWlsKTtcbiAgICBmb3JtLnJlc2V0KCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVBZG1pbkZpbGVVcGxvYWQoaW5wdXQpIHtcbiAgY29uc3QgZmlsZSA9IGlucHV0LmZpbGVzPy5bMF07XG4gIGlmICghZmlsZSkgcmV0dXJuO1xuICBjb25zdCB0YXJnZXQgPSBpbnB1dC5kYXRhc2V0LnVwbG9hZFRhcmdldDtcbiAgc2hvd1RvYXN0KCdVcGxvYWRpbmcgdG8gRmlyZWJhc2UgU3RvcmFnZS4uLicpO1xuICB0cnkge1xuICAgIGNvbnN0IHVybCA9IGF3YWl0IHVwbG9hZEFzc2V0VG9TdG9yYWdlKGZpbGUsIHRhcmdldC5pbmNsdWRlcygndmlkZW8nKSA/ICd2aWRlb3MnIDogJ2ltYWdlcycpO1xuICAgIGlmICh0YXJnZXQuc3RhcnRzV2l0aCgncHJvZC1pbWctJykpIHtcbiAgICAgIGNvbnN0IGlkeCA9IHRhcmdldC5yZXBsYWNlKCdwcm9kLWltZy0nLCAnJyk7XG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcm9kLWltZy1pbnB1dFtkYXRhLWltZy1pbmRleD1cIiR7aWR4fVwiXWApO1xuICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IHVybDtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gJ3Byb2QtdmlkZW8nKSB7XG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9kLXZpZGVvLXVybCcpO1xuICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IHVybDtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PT0gJ3Byb2QtcG9zdGVyJykge1xuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZC12aWRlby1wb3N0ZXInKTtcbiAgICAgIGlmIChlbCkgZWwudmFsdWUgPSB1cmw7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09ICdjYXQtaW1nJykge1xuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0LWltZy11cmwnKTtcbiAgICAgIGlmIChlbCkgZWwudmFsdWUgPSB1cmw7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09ICdwb3N0LWNvdmVyJykge1xuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zdC1jb3Zlci11cmwnKTtcbiAgICAgIGlmIChlbCkgZWwudmFsdWUgPSB1cmw7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09ICdicmFuZC1sb2dvJykge1xuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnJhbmQtbG9nby11cmwnKTtcbiAgICAgIGlmIChlbCkgZWwudmFsdWUgPSB1cmw7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT09ICdicmFuZC1mYXYnKSB7XG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdicmFuZC1mYXYtdXJsJyk7XG4gICAgICBpZiAoZWwpIGVsLnZhbHVlID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldCk7XG4gICAgICBpZiAoZWwpIGVsLnZhbHVlID0gdXJsO1xuICAgIH1cbiAgICBzaG93VG9hc3QoJ1VwbG9hZCBjb21wbGV0ZSEnKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgc2hvd1RvYXN0KGVyci5tZXNzYWdlIHx8ICdVcGxvYWQgZmFpbGVkLicsIHRydWUpO1xuICB9XG59XG5cbmV4cG9ydCB7IHVwZGF0ZU9yZGVyU3RhdHVzIH07XG4iXX0=