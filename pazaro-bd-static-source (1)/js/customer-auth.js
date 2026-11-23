// Pazaro BD — Modular Customer Authentication Gate Service
// Structured localStorage persistence with salted SHA-256 password hashing & RBAC roles.
// Designed with clean async boundaries so Firebase/Supabase auth can be swapped in directly.
import { state, notifyState, showToast } from "/src/js/store.js";
import { escHtml, renderDbConnectionAlert } from "/src/js/ui-components.js";
import { SEED_GENERAL_SETTINGS } from "/src/js/seed-data.js";
const USERS_KEY = "pazaro_customers_v1";
const SESSION_KEY = "pazaro_customer_session_v1";
const ADMIN_PROFILE_KEY = "pazaro_admin_profile_v1";
// Salted SHA-256 digests for the built-in hidden admin account (never stored in plaintext or localStorage)
const ADMIN_SALT = "pzr_adm_9f4c2e8a1b7d305e";
const ADMIN_ID_HASH = "67a5b4183cf420f7ed8e994b1a83b49c6033e248320905f0ef62da4d463136e9";
const ADMIN_PASS_HASH = "46565d062b8b40a76d8248f247040c058be12c667198c202fbe6e1537baa0e97";
export const customerAuthUi = {
	mode: "signin",
	showPassword: false,
	showConfirmPassword: false,
	error: "",
	busy: false,
	emailDraft: "",
	nameDraft: "",
	passwordDraft: "",
	confirmPasswordDraft: ""
};
function readUsers() {
	try {
		const raw = localStorage.getItem(USERS_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function readAdminProfile() {
	try {
		const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function writeAdminProfile(profile) {
	try {
		localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile || {}));
	} catch {}
}
function normalizePhoneField(val) {
	return String(val || "").trim().slice(0, 30);
}
export function getCustomerSession() {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || !parsed.id || !parsed.role) return null;
		if (parsed.id === "cust-admin-default" || parsed.email === "admin@pazarobd.com") {
			localStorage.removeItem(SESSION_KEY);
			return null;
		}
		if (parsed.id === "admin-root") {
			const admProf = readAdminProfile();
			return {
				...parsed,
				...admProf,
				id: "admin-root",
				role: "admin",
				fullName: admProf.fullName || parsed.fullName || "Admin",
				name: admProf.fullName || parsed.fullName || "Admin"
			};
		}
		const users = readUsers();
		const userMatch = users.find((u) => u.id === parsed.id);
		if (userMatch) {
			return {
				...parsed,
				fullName: userMatch.fullName || parsed.fullName,
				name: userMatch.fullName || parsed.fullName,
				email: userMatch.email || parsed.email || "",
				avatarUrl: userMatch.avatarUrl || parsed.avatarUrl || "",
				phone: userMatch.phone || parsed.phone || "",
				altPhone: userMatch.altPhone || parsed.altPhone || "",
				whatsappNumber: userMatch.whatsappNumber || parsed.whatsappNumber || "",
				division: userMatch.division || parsed.division || "Dhaka",
				district: userMatch.district || parsed.district || "Dhaka",
				address: userMatch.address || parsed.address || "",
				preferredPayment: userMatch.preferredPayment || parsed.preferredPayment || "Cash on Delivery",
				notifyOrders: userMatch.notifyOrders !== false,
				notifyDeals: Boolean(userMatch.notifyDeals)
			};
		}
		return parsed;
	} catch {
		return null;
	}
}
export function isCustomerAdmin(session = getCustomerSession()) {
	if (state.isAdmin) return true;
	return Boolean(session && session.role === "admin");
}
function writeSession(session) {
	if (!session) {
		localStorage.removeItem(SESSION_KEY);
	} else {
		localStorage.setItem(SESSION_KEY, JSON.stringify(session));
	}
}
async function hashPassword(password, salt) {
	const data = new TextEncoder().encode(`${salt}:${password}`);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function makeSalt() {
	const bytes = new Uint8Array(12);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}
/**
* Cleans up any legacy local default admin entries so only regular user accounts
* reside in localStorage.
*/
export async function ensureDefaultAdminAccount() {
	const users = readUsers();
	const filtered = users.filter((u) => u && u.id !== "cust-admin-default" && String(u.email || "").toLowerCase() !== "admin@pazarobd.com");
	if (filtered.length !== users.length) {
		writeUsers(filtered);
	}
}
/**
* Registers a new regular customer account and starts an authenticated session.
* @param {{ fullName: string, email: string, password: string, confirmPassword: string }} input
*/
export async function signUpCustomer({ fullName, email, password, confirmPassword }) {
	await ensureDefaultAdminAccount();
	const cleanName = String(fullName || "").trim();
	const cleanEmail = String(email || "").trim().toLowerCase();
	const pass = String(password || "");
	const confirm = String(confirmPassword || "");
	const reservedEmailHash = await hashPassword(cleanEmail, ADMIN_SALT);
	const reservedNameHash = await hashPassword(cleanName.toLowerCase(), ADMIN_SALT);
	if (reservedEmailHash === ADMIN_ID_HASH || reservedNameHash === ADMIN_ID_HASH) {
		throw new Error("This identifier is reserved and cannot be used for registration.");
	}
	if (cleanName.length < 2) {
		throw new Error("Please enter your full name (at least 2 characters).");
	}
	if (!isValidEmail(cleanEmail)) {
		throw new Error("Please enter a valid email address.");
	}
	if (pass.length < 6) {
		throw new Error("Password must be at least 6 characters long.");
	}
	if (pass !== confirm) {
		throw new Error("Passwords do not match. Please re-enter them carefully.");
	}
	const users = readUsers();
	if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
		throw new Error("An account with this email already exists. Please sign in instead.");
	}
	const salt = makeSalt();
	const passwordHash = await hashPassword(pass, salt);
	const role = "user";
	const newUser = {
		id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
		fullName: cleanName.slice(0, 100),
		email: cleanEmail,
		role,
		salt,
		passwordHash,
		createdAt: new Date().toISOString()
	};
	users.push(newUser);
	writeUsers(users);
	const session = {
		id: newUser.id,
		fullName: newUser.fullName,
		email: newUser.email,
		role: "user",
		loggedInAt: new Date().toISOString()
	};
	writeSession(session);
	customerAuthUi.error = "";
	customerAuthUi.passwordDraft = "";
	customerAuthUi.confirmPasswordDraft = "";
	notifyState();
	showToast(`Welcome to Pazaro BD, ${newUser.fullName}!`);
	return session;
}
/**
* Authenticates a regular user (email/Gmail) or the built-in hidden admin (username/ID)
* through the same unified Sign In form.
* @param {{ identifier: string, password: string }} input
*/
export async function signInCustomer({ identifier, password }) {
	await ensureDefaultAdminAccount();
	const rawId = String(identifier || "").trim();
	const pass = String(password || "");
	if (!rawId || !pass) {
		throw new Error("Invalid email/username or password");
	}
	// Check 1: Hidden built-in Admin Master Key
	const idHash = await hashPassword(rawId, ADMIN_SALT);
	const passHash = await hashPassword(pass, ADMIN_SALT);
	if (idHash === ADMIN_ID_HASH && passHash === ADMIN_PASS_HASH) {
		const admProf = readAdminProfile();
		const adminSession = {
			id: "admin-root",
			name: admProf.fullName || "Admin",
			fullName: admProf.fullName || "Admin",
			email: admProf.email || "",
			avatarUrl: admProf.avatarUrl || "",
			phone: admProf.phone || "",
			altPhone: admProf.altPhone || "",
			whatsappNumber: admProf.whatsappNumber || "",
			division: admProf.division || "Dhaka",
			district: admProf.district || "Dhaka",
			address: admProf.address || "",
			preferredPayment: admProf.preferredPayment || "Cash on Delivery",
			notifyOrders: admProf.notifyOrders !== false,
			notifyDeals: Boolean(admProf.notifyDeals),
			role: "admin",
			loggedInAt: new Date().toISOString()
		};
		writeSession(adminSession);
		customerAuthUi.error = "";
		customerAuthUi.passwordDraft = "";
		customerAuthUi.confirmPasswordDraft = "";
		notifyState();
		showToast(`Welcome back, ${adminSession.fullName}!`);
		return adminSession;
	}
	// Check 2: Regular public users stored in localStorage
	const cleanEmail = rawId.toLowerCase();
	const users = readUsers();
	const found = users.find((u) => String(u.email || "").trim().toLowerCase() === cleanEmail);
	if (found) {
		const passwordMatches = found.salt && found.passwordHash ? await hashPassword(pass, found.salt) === found.passwordHash : found.password === pass;
		if (passwordMatches) {
			const session = {
				id: found.id,
				name: found.fullName,
				fullName: found.fullName,
				email: found.email,
				avatarUrl: found.avatarUrl || "",
				phone: found.phone || "",
				altPhone: found.altPhone || "",
				whatsappNumber: found.whatsappNumber || "",
				division: found.division || "Dhaka",
				district: found.district || "Dhaka",
				address: found.address || "",
				preferredPayment: found.preferredPayment || "Cash on Delivery",
				notifyOrders: found.notifyOrders !== false,
				notifyDeals: Boolean(found.notifyDeals),
				role: "user",
				loggedInAt: new Date().toISOString()
			};
			writeSession(session);
			customerAuthUi.error = "";
			customerAuthUi.passwordDraft = "";
			customerAuthUi.confirmPasswordDraft = "";
			notifyState();
			showToast(`Welcome back, ${found.fullName}!`);
			return session;
		}
	}
	throw new Error("Invalid email/username or password");
}
export async function updateCustomerProfile(updates = {}) {
	const current = getCustomerSession();
	if (!current) throw new Error("Please sign in first.");
	const cleanName = String(updates.fullName ?? current.fullName ?? "").trim().slice(0, 100);
	if (cleanName.length < 2) {
		throw new Error("Please enter a name with at least 2 characters.");
	}
	const profilePatch = {
		fullName: cleanName,
		name: cleanName,
		phone: normalizePhoneField(updates.phone ?? current.phone),
		altPhone: normalizePhoneField(updates.altPhone ?? current.altPhone),
		whatsappNumber: normalizePhoneField(updates.whatsappNumber ?? current.whatsappNumber),
		division: String(updates.division ?? current.division ?? "Dhaka").trim().slice(0, 80),
		district: String(updates.district ?? current.district ?? "Dhaka").trim().slice(0, 80),
		address: String(updates.address ?? current.address ?? "").trim().slice(0, 400),
		preferredPayment: String(updates.preferredPayment ?? current.preferredPayment ?? "Cash on Delivery").trim(),
		notifyOrders: updates.notifyOrders !== undefined ? Boolean(updates.notifyOrders) : current.notifyOrders !== false,
		notifyDeals: updates.notifyDeals !== undefined ? Boolean(updates.notifyDeals) : Boolean(current.notifyDeals),
		avatarUrl: updates.avatarUrl !== undefined ? String(updates.avatarUrl || "") : current.avatarUrl || "",
		updatedAt: new Date().toISOString()
	};
	if (updates.email !== undefined && current.role !== "admin") {
		const nextEmail = String(updates.email || "").trim().toLowerCase();
		if (!isValidEmail(nextEmail)) {
			throw new Error("Please enter a valid email address.");
		}
		const reservedHash = await hashPassword(nextEmail, ADMIN_SALT);
		if (reservedHash === ADMIN_ID_HASH) {
			throw new Error("This email address is reserved.");
		}
		const users = readUsers();
		if (users.some((u) => u.id !== current.id && String(u.email || "").toLowerCase() === nextEmail)) {
			throw new Error("Another account is already using this email address.");
		}
		profilePatch.email = nextEmail;
	}
	if (current.id === "admin-root") {
		const existingAdm = readAdminProfile();
		writeAdminProfile({
			...existingAdm,
			...profilePatch
		});
	} else {
		const users = readUsers();
		const idx = users.findIndex((u) => u.id === current.id);
		if (idx >= 0) {
			users[idx] = {
				...users[idx],
				...profilePatch
			};
			writeUsers(users);
		}
	}
	const nextSession = {
		...current,
		...profilePatch
	};
	writeSession(nextSession);
	notifyState();
	showToast("Account settings saved!");
	return nextSession;
}
export async function changeCustomerPassword({ currentPassword, newPassword, confirmPassword }) {
	const current = getCustomerSession();
	if (!current || current.id === "admin-root") {
		throw new Error("Password changes here apply to registered customer accounts.");
	}
	const users = readUsers();
	const idx = users.findIndex((u) => u.id === current.id);
	if (idx < 0) throw new Error("Account record not found.");
	const found = users[idx];
	const currPass = String(currentPassword || "");
	const nextPass = String(newPassword || "");
	const confPass = String(confirmPassword || "");
	const currentMatches = found.salt && found.passwordHash ? await hashPassword(currPass, found.salt) === found.passwordHash : found.password === currPass;
	if (!currentMatches) {
		throw new Error("Current password is incorrect.");
	}
	if (nextPass.length < 6) {
		throw new Error("New password must be at least 6 characters long.");
	}
	if (nextPass !== confPass) {
		throw new Error("New passwords do not match.");
	}
	const salt = makeSalt();
	const passwordHash = await hashPassword(nextPass, salt);
	users[idx] = {
		...found,
		salt,
		passwordHash,
		updatedAt: new Date().toISOString()
	};
	delete users[idx].password;
	writeUsers(users);
	showToast("Password updated successfully!");
}
export function resizeAvatarFileToDataUrl(file, maxSize = 240) {
	return new Promise((resolve, reject) => {
		if (!file || !file.type?.startsWith("image/")) {
			reject(new Error("Please select a valid image file."));
			return;
		}
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Could not read selected image file."));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(new Error("Could not process selected image."));
			img.onload = () => {
				const size = Math.min(maxSize, Math.max(img.width, img.height));
				const canvas = document.createElement("canvas");
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					resolve(String(reader.result || ""));
					return;
				}
				const side = Math.min(img.width, img.height);
				const sx = (img.width - side) / 2;
				const sy = (img.height - side) / 2;
				ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
				resolve(canvas.toDataURL("image/jpeg", .85));
			};
			img.src = String(reader.result || "");
		};
		reader.readAsDataURL(file);
	});
}
export function signOutCustomer() {
	writeSession(null);
	customerAuthUi.mode = "signin";
	customerAuthUi.error = "";
	customerAuthUi.showPassword = false;
	customerAuthUi.showConfirmPassword = false;
	customerAuthUi.passwordDraft = "";
	customerAuthUi.confirmPasswordDraft = "";
	notifyState();
	showToast("You have been logged out.");
}
export function renderAuthGateView() {
	const g = state.general || SEED_GENERAL_SETTINGS;
	const isSignUp = customerAuthUi.mode === "signup";
	return `
    <div class="auth-gate-shell">
      <div class="auth-gate-card">
        <div class="auth-gate-brand">
          ${g.logoUrl ? `<img src="${escHtml(g.logoUrl)}" alt="${escHtml(g.siteName || "Pazaro BD")} logo" class="auth-gate-logo-img" />` : `<img src="/assets/pazaro-logo.svg" alt="${escHtml(g.siteName || "Pazaro BD")} logo" class="auth-gate-logo-img auth-gate-logo-svg" />`}
          <h1 class="auth-gate-title">${escHtml(g.siteName || "Pazaro BD")}</h1>
          <p class="auth-gate-sub">${escHtml(g.tagline || "Your Bazaar, Smarter")} · Sign in to browse & shop</p>
        </div>

        ${renderDbConnectionAlert()}

        <div class="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected="${!isSignUp}"
            class="auth-tab-btn ${!isSignUp ? "active" : ""}"
            data-action="auth-switch-mode"
            data-mode="signin"
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected="${isSignUp}"
            class="auth-tab-btn ${isSignUp ? "active" : ""}"
            data-action="auth-switch-mode"
            data-mode="signup"
          >
            Sign Up
          </button>
        </div>

        ${customerAuthUi.error ? `
          <div class="auth-error-box" role="alert">
            ${escHtml(customerAuthUi.error)}
          </div>
        ` : ""}

        ${isSignUp ? `
          <form id="customer-signup-form" class="form-grid" novalidate>
            <div>
              <label class="field-label" for="auth-fullname">Full Name</label>
              <input
                class="field-input"
                id="auth-fullname"
                name="fullName"
                type="text"
                required
                autocomplete="name"
                placeholder="e.g. Tanvir Ahmed"
                value="${escHtml(customerAuthUi.nameDraft)}"
              />
            </div>

            <div>
              <label class="field-label" for="auth-signup-email">Email Address</label>
              <input
                class="field-input"
                id="auth-signup-email"
                name="email"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                value="${escHtml(customerAuthUi.emailDraft)}"
              />
            </div>

            <div>
              <label class="field-label" for="auth-signup-pass">Password (min. 6 characters)</label>
              <div class="auth-pass-wrap">
                <input
                  class="field-input"
                  id="auth-signup-pass"
                  name="password"
                  type="${customerAuthUi.showPassword ? "text" : "password"}"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  placeholder="Create a password"
                  value="${escHtml(customerAuthUi.passwordDraft)}"
                />
                <button
                  type="button"
                  class="auth-eye-btn"
                  data-action="auth-toggle-pass"
                  data-target="auth-signup-pass"
                  aria-label="${customerAuthUi.showPassword ? "Hide password" : "Show password"}"
                >
                  ${customerAuthUi.showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label class="field-label" for="auth-signup-confirm">Confirm Password</label>
              <div class="auth-pass-wrap">
                <input
                  class="field-input"
                  id="auth-signup-confirm"
                  name="confirmPassword"
                  type="${customerAuthUi.showConfirmPassword ? "text" : "password"}"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  placeholder="Re-enter your password"
                  value="${escHtml(customerAuthUi.confirmPasswordDraft)}"
                />
                <button
                  type="button"
                  class="auth-eye-btn"
                  data-action="auth-toggle-confirm"
                  data-target="auth-signup-confirm"
                  aria-label="${customerAuthUi.showConfirmPassword ? "Hide confirm password" : "Show confirm password"}"
                >
                  ${customerAuthUi.showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-accent" style="width:100%;" ${customerAuthUi.busy ? "disabled" : ""}>
              ${customerAuthUi.busy ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p class="auth-switch-hint">
            Already have an account?
            <button type="button" class="auth-inline-link" data-action="auth-switch-mode" data-mode="signin">Sign In</button>
          </p>
        ` : `
          <form id="customer-signin-form" class="form-grid" novalidate>
            <div>
              <label class="field-label" for="auth-signin-identifier">Email or Username</label>
              <input
                class="field-input"
                id="auth-signin-identifier"
                name="identifier"
                type="text"
                required
                autocomplete="username"
                placeholder="Enter your email or username"
                value="${escHtml(customerAuthUi.emailDraft)}"
              />
            </div>

            <div>
              <label class="field-label" for="auth-signin-pass">Password</label>
              <div class="auth-pass-wrap">
                <input
                  class="field-input"
                  id="auth-signin-pass"
                  name="password"
                  type="${customerAuthUi.showPassword ? "text" : "password"}"
                  required
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  value="${escHtml(customerAuthUi.passwordDraft)}"
                />
                <button
                  type="button"
                  class="auth-eye-btn"
                  data-action="auth-toggle-pass"
                  data-target="auth-signin-pass"
                  aria-label="${customerAuthUi.showPassword ? "Hide password" : "Show password"}"
                >
                  ${customerAuthUi.showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%;" ${customerAuthUi.busy ? "disabled" : ""}>
              ${customerAuthUi.busy ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p class="auth-switch-hint">
            New to Pazaro BD?
            <button type="button" class="auth-inline-link" data-action="auth-switch-mode" data-mode="signup">Create an account</button>
          </p>
        `}

        <div class="auth-gate-footer">
          <span>Verified delivery across 64 districts in Bangladesh</span>
        </div>
      </div>
    </div>
  `;
}

//# sourceMappingURL=data:application/json;base64,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S2pELFFBQVEsZUFBZSxhQUFhLEVBQUU7Ozs7Ozs7Z0NBT2pDLGVBQWUsZUFBZSxrQkFBa0IsZ0JBQWdCOztvQkFFNUUsZUFBZSxlQUFlLFNBQVMsT0FBTzs7Ozs7Ozs7Ozs7OzBCQVl4QyxlQUFlLHNCQUFzQixTQUFTLFdBQVc7Ozs7OzJCQUt4RCxRQUFRLGVBQWUsb0JBQW9CLEVBQUU7Ozs7Ozs7Z0NBT3hDLGVBQWUsc0JBQXNCLDBCQUEwQix3QkFBd0I7O29CQUVuRyxlQUFlLHNCQUFzQixTQUFTLE9BQU87Ozs7OytFQUtNLGVBQWUsT0FBTyxhQUFhLEdBQUc7Z0JBQ3JHLGVBQWUsT0FBTyx3QkFBd0IsaUJBQWlCOzs7Ozs7OztZQVFuRTs7Ozs7Ozs7Ozs7O3lCQVlhLFFBQVEsZUFBZSxVQUFVLEVBQUU7Ozs7Ozs7Ozs7OzBCQVdsQyxlQUFlLGVBQWUsU0FBUyxXQUFXOzs7OzJCQUlqRCxRQUFRLGVBQWUsYUFBYSxFQUFFOzs7Ozs7O2dDQU9qQyxlQUFlLGVBQWUsa0JBQWtCLGdCQUFnQjs7b0JBRTVFLGVBQWUsZUFBZSxTQUFTLE9BQU87Ozs7O2dGQUtjLGVBQWUsT0FBTyxhQUFhLEdBQUc7Z0JBQ3RHLGVBQWUsT0FBTyxrQkFBa0IsVUFBVTs7Ozs7Ozs7VUFReEQ7Ozs7Ozs7O0FBUVYiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiY3VzdG9tZXItYXV0aC5qcyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQYXphcm8gQkQg4oCUIE1vZHVsYXIgQ3VzdG9tZXIgQXV0aGVudGljYXRpb24gR2F0ZSBTZXJ2aWNlXG4vLyBTdHJ1Y3R1cmVkIGxvY2FsU3RvcmFnZSBwZXJzaXN0ZW5jZSB3aXRoIHNhbHRlZCBTSEEtMjU2IHBhc3N3b3JkIGhhc2hpbmcgJiBSQkFDIHJvbGVzLlxuLy8gRGVzaWduZWQgd2l0aCBjbGVhbiBhc3luYyBib3VuZGFyaWVzIHNvIEZpcmViYXNlL1N1cGFiYXNlIGF1dGggY2FuIGJlIHN3YXBwZWQgaW4gZGlyZWN0bHkuXG5cbmltcG9ydCB7IHN0YXRlLCBub3RpZnlTdGF0ZSwgc2hvd1RvYXN0IH0gZnJvbSAnLi9zdG9yZS5qcyc7XG5pbXBvcnQgeyBlc2NIdG1sLCByZW5kZXJEYkNvbm5lY3Rpb25BbGVydCB9IGZyb20gJy4vdWktY29tcG9uZW50cy5qcyc7XG5pbXBvcnQgeyBTRUVEX0dFTkVSQUxfU0VUVElOR1MgfSBmcm9tICcuL3NlZWQtZGF0YS5qcyc7XG5cbmNvbnN0IFVTRVJTX0tFWSA9ICdwYXphcm9fY3VzdG9tZXJzX3YxJztcbmNvbnN0IFNFU1NJT05fS0VZID0gJ3BhemFyb19jdXN0b21lcl9zZXNzaW9uX3YxJztcbmNvbnN0IEFETUlOX1BST0ZJTEVfS0VZID0gJ3BhemFyb19hZG1pbl9wcm9maWxlX3YxJztcblxuLy8gU2FsdGVkIFNIQS0yNTYgZGlnZXN0cyBmb3IgdGhlIGJ1aWx0LWluIGhpZGRlbiBhZG1pbiBhY2NvdW50IChuZXZlciBzdG9yZWQgaW4gcGxhaW50ZXh0IG9yIGxvY2FsU3RvcmFnZSlcbmNvbnN0IEFETUlOX1NBTFQgPSAncHpyX2FkbV85ZjRjMmU4YTFiN2QzMDVlJztcbmNvbnN0IEFETUlOX0lEX0hBU0ggPSAnNjdhNWI0MTgzY2Y0MjBmN2VkOGU5OTRiMWE4M2I0OWM2MDMzZTI0ODMyMDkwNWYwZWY2MmRhNGQ0NjMxMzZlOSc7XG5jb25zdCBBRE1JTl9QQVNTX0hBU0ggPSAnNDY1NjVkMDYyYjhiNDBhNzZkODI0OGYyNDcwNDBjMDU4YmUxMmM2NjcxOThjMjAyZmJlNmUxNTM3YmFhMGU5Nyc7XG5cbmV4cG9ydCBjb25zdCBjdXN0b21lckF1dGhVaSA9IHtcbiAgbW9kZTogJ3NpZ25pbicsIC8vICdzaWduaW4nIHwgJ3NpZ251cCdcbiAgc2hvd1Bhc3N3b3JkOiBmYWxzZSxcbiAgc2hvd0NvbmZpcm1QYXNzd29yZDogZmFsc2UsXG4gIGVycm9yOiAnJyxcbiAgYnVzeTogZmFsc2UsXG4gIGVtYWlsRHJhZnQ6ICcnLFxuICBuYW1lRHJhZnQ6ICcnLFxuICBwYXNzd29yZERyYWZ0OiAnJyxcbiAgY29uZmlybVBhc3N3b3JkRHJhZnQ6ICcnXG59O1xuXG5mdW5jdGlvbiByZWFkVXNlcnMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oVVNFUlNfS0VZKTtcbiAgICBjb25zdCBwYXJzZWQgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiBbXTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShwYXJzZWQpID8gcGFyc2VkIDogW107XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cml0ZVVzZXJzKHVzZXJzKSB7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFVTRVJTX0tFWSwgSlNPTi5zdHJpbmdpZnkodXNlcnMpKTtcbn1cblxuZnVuY3Rpb24gcmVhZEFkbWluUHJvZmlsZSgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByYXcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShBRE1JTl9QUk9GSUxFX0tFWSk7XG4gICAgcmV0dXJuIHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge307XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVBZG1pblByb2ZpbGUocHJvZmlsZSkge1xuICB0cnkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEFETUlOX1BST0ZJTEVfS0VZLCBKU09OLnN0cmluZ2lmeShwcm9maWxlIHx8IHt9KSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIElnbm9yZSBzdG9yYWdlIHF1b3RhIGlzc3Vlc1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBob25lRmllbGQodmFsKSB7XG4gIHJldHVybiBTdHJpbmcodmFsIHx8ICcnKS50cmltKCkuc2xpY2UoMCwgMzApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VzdG9tZXJTZXNzaW9uKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHJhdyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFU1NJT05fS0VZKTtcbiAgICBpZiAoIXJhdykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpO1xuICAgIGlmICghcGFyc2VkIHx8ICFwYXJzZWQuaWQgfHwgIXBhcnNlZC5yb2xlKSByZXR1cm4gbnVsbDtcbiAgICBpZiAocGFyc2VkLmlkID09PSAnY3VzdC1hZG1pbi1kZWZhdWx0JyB8fCBwYXJzZWQuZW1haWwgPT09ICdhZG1pbkBwYXphcm9iZC5jb20nKSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShTRVNTSU9OX0tFWSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBhcnNlZC5pZCA9PT0gJ2FkbWluLXJvb3QnKSB7XG4gICAgICBjb25zdCBhZG1Qcm9mID0gcmVhZEFkbWluUHJvZmlsZSgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ucGFyc2VkLFxuICAgICAgICAuLi5hZG1Qcm9mLFxuICAgICAgICBpZDogJ2FkbWluLXJvb3QnLFxuICAgICAgICByb2xlOiAnYWRtaW4nLFxuICAgICAgICBmdWxsTmFtZTogYWRtUHJvZi5mdWxsTmFtZSB8fCBwYXJzZWQuZnVsbE5hbWUgfHwgJ0FkbWluJyxcbiAgICAgICAgbmFtZTogYWRtUHJvZi5mdWxsTmFtZSB8fCBwYXJzZWQuZnVsbE5hbWUgfHwgJ0FkbWluJ1xuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdXNlcnMgPSByZWFkVXNlcnMoKTtcbiAgICBjb25zdCB1c2VyTWF0Y2ggPSB1c2Vycy5maW5kKCh1KSA9PiB1LmlkID09PSBwYXJzZWQuaWQpO1xuICAgIGlmICh1c2VyTWF0Y2gpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnBhcnNlZCxcbiAgICAgICAgZnVsbE5hbWU6IHVzZXJNYXRjaC5mdWxsTmFtZSB8fCBwYXJzZWQuZnVsbE5hbWUsXG4gICAgICAgIG5hbWU6IHVzZXJNYXRjaC5mdWxsTmFtZSB8fCBwYXJzZWQuZnVsbE5hbWUsXG4gICAgICAgIGVtYWlsOiB1c2VyTWF0Y2guZW1haWwgfHwgcGFyc2VkLmVtYWlsIHx8ICcnLFxuICAgICAgICBhdmF0YXJVcmw6IHVzZXJNYXRjaC5hdmF0YXJVcmwgfHwgcGFyc2VkLmF2YXRhclVybCB8fCAnJyxcbiAgICAgICAgcGhvbmU6IHVzZXJNYXRjaC5waG9uZSB8fCBwYXJzZWQucGhvbmUgfHwgJycsXG4gICAgICAgIGFsdFBob25lOiB1c2VyTWF0Y2guYWx0UGhvbmUgfHwgcGFyc2VkLmFsdFBob25lIHx8ICcnLFxuICAgICAgICB3aGF0c2FwcE51bWJlcjogdXNlck1hdGNoLndoYXRzYXBwTnVtYmVyIHx8IHBhcnNlZC53aGF0c2FwcE51bWJlciB8fCAnJyxcbiAgICAgICAgZGl2aXNpb246IHVzZXJNYXRjaC5kaXZpc2lvbiB8fCBwYXJzZWQuZGl2aXNpb24gfHwgJ0RoYWthJyxcbiAgICAgICAgZGlzdHJpY3Q6IHVzZXJNYXRjaC5kaXN0cmljdCB8fCBwYXJzZWQuZGlzdHJpY3QgfHwgJ0RoYWthJyxcbiAgICAgICAgYWRkcmVzczogdXNlck1hdGNoLmFkZHJlc3MgfHwgcGFyc2VkLmFkZHJlc3MgfHwgJycsXG4gICAgICAgIHByZWZlcnJlZFBheW1lbnQ6IHVzZXJNYXRjaC5wcmVmZXJyZWRQYXltZW50IHx8IHBhcnNlZC5wcmVmZXJyZWRQYXltZW50IHx8ICdDYXNoIG9uIERlbGl2ZXJ5JyxcbiAgICAgICAgbm90aWZ5T3JkZXJzOiB1c2VyTWF0Y2gubm90aWZ5T3JkZXJzICE9PSBmYWxzZSxcbiAgICAgICAgbm90aWZ5RGVhbHM6IEJvb2xlYW4odXNlck1hdGNoLm5vdGlmeURlYWxzKVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ3VzdG9tZXJBZG1pbihzZXNzaW9uID0gZ2V0Q3VzdG9tZXJTZXNzaW9uKCkpIHtcbiAgaWYgKHN0YXRlLmlzQWRtaW4pIHJldHVybiB0cnVlO1xuICByZXR1cm4gQm9vbGVhbihzZXNzaW9uICYmIHNlc3Npb24ucm9sZSA9PT0gJ2FkbWluJyk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlU2Vzc2lvbihzZXNzaW9uKSB7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFNFU1NJT05fS0VZKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTRVNTSU9OX0tFWSwgSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbikpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICBjb25zdCBkYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGAke3NhbHR9OiR7cGFzc3dvcmR9YCk7XG4gIGNvbnN0IGJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgZGF0YSk7XG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTYWx0KCkge1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDEyKTtcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XG4gIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzLCAoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRFbWFpbChlbWFpbCkge1xuICByZXR1cm4gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC8udGVzdChTdHJpbmcoZW1haWwgfHwgJycpLnRyaW0oKSk7XG59XG5cbi8qKlxuICogQ2xlYW5zIHVwIGFueSBsZWdhY3kgbG9jYWwgZGVmYXVsdCBhZG1pbiBlbnRyaWVzIHNvIG9ubHkgcmVndWxhciB1c2VyIGFjY291bnRzXG4gKiByZXNpZGUgaW4gbG9jYWxTdG9yYWdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlRGVmYXVsdEFkbWluQWNjb3VudCgpIHtcbiAgY29uc3QgdXNlcnMgPSByZWFkVXNlcnMoKTtcbiAgY29uc3QgZmlsdGVyZWQgPSB1c2Vycy5maWx0ZXIoXG4gICAgKHUpID0+IHUgJiYgdS5pZCAhPT0gJ2N1c3QtYWRtaW4tZGVmYXVsdCcgJiYgU3RyaW5nKHUuZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkgIT09ICdhZG1pbkBwYXphcm9iZC5jb20nXG4gICk7XG4gIGlmIChmaWx0ZXJlZC5sZW5ndGggIT09IHVzZXJzLmxlbmd0aCkge1xuICAgIHdyaXRlVXNlcnMoZmlsdGVyZWQpO1xuICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgbmV3IHJlZ3VsYXIgY3VzdG9tZXIgYWNjb3VudCBhbmQgc3RhcnRzIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbi5cbiAqIEBwYXJhbSB7eyBmdWxsTmFtZTogc3RyaW5nLCBlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBjb25maXJtUGFzc3dvcmQ6IHN0cmluZyB9fSBpbnB1dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnblVwQ3VzdG9tZXIoeyBmdWxsTmFtZSwgZW1haWwsIHBhc3N3b3JkLCBjb25maXJtUGFzc3dvcmQgfSkge1xuICBhd2FpdCBlbnN1cmVEZWZhdWx0QWRtaW5BY2NvdW50KCk7XG5cbiAgY29uc3QgY2xlYW5OYW1lID0gU3RyaW5nKGZ1bGxOYW1lIHx8ICcnKS50cmltKCk7XG4gIGNvbnN0IGNsZWFuRW1haWwgPSBTdHJpbmcoZW1haWwgfHwgJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBwYXNzID0gU3RyaW5nKHBhc3N3b3JkIHx8ICcnKTtcbiAgY29uc3QgY29uZmlybSA9IFN0cmluZyhjb25maXJtUGFzc3dvcmQgfHwgJycpO1xuXG4gIGNvbnN0IHJlc2VydmVkRW1haWxIYXNoID0gYXdhaXQgaGFzaFBhc3N3b3JkKGNsZWFuRW1haWwsIEFETUlOX1NBTFQpO1xuICBjb25zdCByZXNlcnZlZE5hbWVIYXNoID0gYXdhaXQgaGFzaFBhc3N3b3JkKGNsZWFuTmFtZS50b0xvd2VyQ2FzZSgpLCBBRE1JTl9TQUxUKTtcbiAgaWYgKHJlc2VydmVkRW1haWxIYXNoID09PSBBRE1JTl9JRF9IQVNIIHx8IHJlc2VydmVkTmFtZUhhc2ggPT09IEFETUlOX0lEX0hBU0gpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgaWRlbnRpZmllciBpcyByZXNlcnZlZCBhbmQgY2Fubm90IGJlIHVzZWQgZm9yIHJlZ2lzdHJhdGlvbi4nKTtcbiAgfVxuXG4gIGlmIChjbGVhbk5hbWUubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVudGVyIHlvdXIgZnVsbCBuYW1lIChhdCBsZWFzdCAyIGNoYXJhY3RlcnMpLicpO1xuICB9XG4gIGlmICghaXNWYWxpZEVtYWlsKGNsZWFuRW1haWwpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLicpO1xuICB9XG4gIGlmIChwYXNzLmxlbmd0aCA8IDYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmcuJyk7XG4gIH1cbiAgaWYgKHBhc3MgIT09IGNvbmZpcm0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2guIFBsZWFzZSByZS1lbnRlciB0aGVtIGNhcmVmdWxseS4nKTtcbiAgfVxuXG4gIGNvbnN0IHVzZXJzID0gcmVhZFVzZXJzKCk7XG4gIGlmICh1c2Vycy5zb21lKCh1KSA9PiB1LmVtYWlsLnRvTG93ZXJDYXNlKCkgPT09IGNsZWFuRW1haWwpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBbiBhY2NvdW50IHdpdGggdGhpcyBlbWFpbCBhbHJlYWR5IGV4aXN0cy4gUGxlYXNlIHNpZ24gaW4gaW5zdGVhZC4nKTtcbiAgfVxuXG4gIGNvbnN0IHNhbHQgPSBtYWtlU2FsdCgpO1xuICBjb25zdCBwYXNzd29yZEhhc2ggPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzcywgc2FsdCk7XG4gIGNvbnN0IHJvbGUgPSAndXNlcic7XG5cbiAgY29uc3QgbmV3VXNlciA9IHtcbiAgICBpZDogYHVzci0ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDYpfWAsXG4gICAgZnVsbE5hbWU6IGNsZWFuTmFtZS5zbGljZSgwLCAxMDApLFxuICAgIGVtYWlsOiBjbGVhbkVtYWlsLFxuICAgIHJvbGUsXG4gICAgc2FsdCxcbiAgICBwYXNzd29yZEhhc2gsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcblxuICB1c2Vycy5wdXNoKG5ld1VzZXIpO1xuICB3cml0ZVVzZXJzKHVzZXJzKTtcblxuICBjb25zdCBzZXNzaW9uID0ge1xuICAgIGlkOiBuZXdVc2VyLmlkLFxuICAgIGZ1bGxOYW1lOiBuZXdVc2VyLmZ1bGxOYW1lLFxuICAgIGVtYWlsOiBuZXdVc2VyLmVtYWlsLFxuICAgIHJvbGU6ICd1c2VyJyxcbiAgICBsb2dnZWRJbkF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcbiAgd3JpdGVTZXNzaW9uKHNlc3Npb24pO1xuICBjdXN0b21lckF1dGhVaS5lcnJvciA9ICcnO1xuICBjdXN0b21lckF1dGhVaS5wYXNzd29yZERyYWZ0ID0gJyc7XG4gIGN1c3RvbWVyQXV0aFVpLmNvbmZpcm1QYXNzd29yZERyYWZ0ID0gJyc7XG4gIG5vdGlmeVN0YXRlKCk7XG4gIHNob3dUb2FzdChgV2VsY29tZSB0byBQYXphcm8gQkQsICR7bmV3VXNlci5mdWxsTmFtZX0hYCk7XG4gIHJldHVybiBzZXNzaW9uO1xufVxuXG4vKipcbiAqIEF1dGhlbnRpY2F0ZXMgYSByZWd1bGFyIHVzZXIgKGVtYWlsL0dtYWlsKSBvciB0aGUgYnVpbHQtaW4gaGlkZGVuIGFkbWluICh1c2VybmFtZS9JRClcbiAqIHRocm91Z2ggdGhlIHNhbWUgdW5pZmllZCBTaWduIEluIGZvcm0uXG4gKiBAcGFyYW0ge3sgaWRlbnRpZmllcjogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nIH19IGlucHV0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduSW5DdXN0b21lcih7IGlkZW50aWZpZXIsIHBhc3N3b3JkIH0pIHtcbiAgYXdhaXQgZW5zdXJlRGVmYXVsdEFkbWluQWNjb3VudCgpO1xuXG4gIGNvbnN0IHJhd0lkID0gU3RyaW5nKGlkZW50aWZpZXIgfHwgJycpLnRyaW0oKTtcbiAgY29uc3QgcGFzcyA9IFN0cmluZyhwYXNzd29yZCB8fCAnJyk7XG5cbiAgaWYgKCFyYXdJZCB8fCAhcGFzcykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBlbWFpbC91c2VybmFtZSBvciBwYXNzd29yZCcpO1xuICB9XG5cbiAgLy8gQ2hlY2sgMTogSGlkZGVuIGJ1aWx0LWluIEFkbWluIE1hc3RlciBLZXlcbiAgY29uc3QgaWRIYXNoID0gYXdhaXQgaGFzaFBhc3N3b3JkKHJhd0lkLCBBRE1JTl9TQUxUKTtcbiAgY29uc3QgcGFzc0hhc2ggPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzcywgQURNSU5fU0FMVCk7XG4gIGlmIChpZEhhc2ggPT09IEFETUlOX0lEX0hBU0ggJiYgcGFzc0hhc2ggPT09IEFETUlOX1BBU1NfSEFTSCkge1xuICAgIGNvbnN0IGFkbVByb2YgPSByZWFkQWRtaW5Qcm9maWxlKCk7XG4gICAgY29uc3QgYWRtaW5TZXNzaW9uID0ge1xuICAgICAgaWQ6ICdhZG1pbi1yb290JyxcbiAgICAgIG5hbWU6IGFkbVByb2YuZnVsbE5hbWUgfHwgJ0FkbWluJyxcbiAgICAgIGZ1bGxOYW1lOiBhZG1Qcm9mLmZ1bGxOYW1lIHx8ICdBZG1pbicsXG4gICAgICBlbWFpbDogYWRtUHJvZi5lbWFpbCB8fCAnJyxcbiAgICAgIGF2YXRhclVybDogYWRtUHJvZi5hdmF0YXJVcmwgfHwgJycsXG4gICAgICBwaG9uZTogYWRtUHJvZi5waG9uZSB8fCAnJyxcbiAgICAgIGFsdFBob25lOiBhZG1Qcm9mLmFsdFBob25lIHx8ICcnLFxuICAgICAgd2hhdHNhcHBOdW1iZXI6IGFkbVByb2Yud2hhdHNhcHBOdW1iZXIgfHwgJycsXG4gICAgICBkaXZpc2lvbjogYWRtUHJvZi5kaXZpc2lvbiB8fCAnRGhha2EnLFxuICAgICAgZGlzdHJpY3Q6IGFkbVByb2YuZGlzdHJpY3QgfHwgJ0RoYWthJyxcbiAgICAgIGFkZHJlc3M6IGFkbVByb2YuYWRkcmVzcyB8fCAnJyxcbiAgICAgIHByZWZlcnJlZFBheW1lbnQ6IGFkbVByb2YucHJlZmVycmVkUGF5bWVudCB8fCAnQ2FzaCBvbiBEZWxpdmVyeScsXG4gICAgICBub3RpZnlPcmRlcnM6IGFkbVByb2Yubm90aWZ5T3JkZXJzICE9PSBmYWxzZSxcbiAgICAgIG5vdGlmeURlYWxzOiBCb29sZWFuKGFkbVByb2Yubm90aWZ5RGVhbHMpLFxuICAgICAgcm9sZTogJ2FkbWluJyxcbiAgICAgIGxvZ2dlZEluQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH07XG4gICAgd3JpdGVTZXNzaW9uKGFkbWluU2Vzc2lvbik7XG4gICAgY3VzdG9tZXJBdXRoVWkuZXJyb3IgPSAnJztcbiAgICBjdXN0b21lckF1dGhVaS5wYXNzd29yZERyYWZ0ID0gJyc7XG4gICAgY3VzdG9tZXJBdXRoVWkuY29uZmlybVBhc3N3b3JkRHJhZnQgPSAnJztcbiAgICBub3RpZnlTdGF0ZSgpO1xuICAgIHNob3dUb2FzdChgV2VsY29tZSBiYWNrLCAke2FkbWluU2Vzc2lvbi5mdWxsTmFtZX0hYCk7XG4gICAgcmV0dXJuIGFkbWluU2Vzc2lvbjtcbiAgfVxuXG4gIC8vIENoZWNrIDI6IFJlZ3VsYXIgcHVibGljIHVzZXJzIHN0b3JlZCBpbiBsb2NhbFN0b3JhZ2VcbiAgY29uc3QgY2xlYW5FbWFpbCA9IHJhd0lkLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHVzZXJzID0gcmVhZFVzZXJzKCk7XG4gIGNvbnN0IGZvdW5kID0gdXNlcnMuZmluZCgodSkgPT4gU3RyaW5nKHUuZW1haWwgfHwgJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBjbGVhbkVtYWlsKTtcbiAgaWYgKGZvdW5kKSB7XG4gICAgY29uc3QgcGFzc3dvcmRNYXRjaGVzID0gZm91bmQuc2FsdCAmJiBmb3VuZC5wYXNzd29yZEhhc2hcbiAgICAgID8gKGF3YWl0IGhhc2hQYXNzd29yZChwYXNzLCBmb3VuZC5zYWx0KSkgPT09IGZvdW5kLnBhc3N3b3JkSGFzaFxuICAgICAgOiBmb3VuZC5wYXNzd29yZCA9PT0gcGFzcztcblxuICAgIGlmIChwYXNzd29yZE1hdGNoZXMpIHtcbiAgICAgIGNvbnN0IHNlc3Npb24gPSB7XG4gICAgICAgIGlkOiBmb3VuZC5pZCxcbiAgICAgICAgbmFtZTogZm91bmQuZnVsbE5hbWUsXG4gICAgICAgIGZ1bGxOYW1lOiBmb3VuZC5mdWxsTmFtZSxcbiAgICAgICAgZW1haWw6IGZvdW5kLmVtYWlsLFxuICAgICAgICBhdmF0YXJVcmw6IGZvdW5kLmF2YXRhclVybCB8fCAnJyxcbiAgICAgICAgcGhvbmU6IGZvdW5kLnBob25lIHx8ICcnLFxuICAgICAgICBhbHRQaG9uZTogZm91bmQuYWx0UGhvbmUgfHwgJycsXG4gICAgICAgIHdoYXRzYXBwTnVtYmVyOiBmb3VuZC53aGF0c2FwcE51bWJlciB8fCAnJyxcbiAgICAgICAgZGl2aXNpb246IGZvdW5kLmRpdmlzaW9uIHx8ICdEaGFrYScsXG4gICAgICAgIGRpc3RyaWN0OiBmb3VuZC5kaXN0cmljdCB8fCAnRGhha2EnLFxuICAgICAgICBhZGRyZXNzOiBmb3VuZC5hZGRyZXNzIHx8ICcnLFxuICAgICAgICBwcmVmZXJyZWRQYXltZW50OiBmb3VuZC5wcmVmZXJyZWRQYXltZW50IHx8ICdDYXNoIG9uIERlbGl2ZXJ5JyxcbiAgICAgICAgbm90aWZ5T3JkZXJzOiBmb3VuZC5ub3RpZnlPcmRlcnMgIT09IGZhbHNlLFxuICAgICAgICBub3RpZnlEZWFsczogQm9vbGVhbihmb3VuZC5ub3RpZnlEZWFscyksXG4gICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgbG9nZ2VkSW5BdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9O1xuICAgICAgd3JpdGVTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgY3VzdG9tZXJBdXRoVWkuZXJyb3IgPSAnJztcbiAgICAgIGN1c3RvbWVyQXV0aFVpLnBhc3N3b3JkRHJhZnQgPSAnJztcbiAgICAgIGN1c3RvbWVyQXV0aFVpLmNvbmZpcm1QYXNzd29yZERyYWZ0ID0gJyc7XG4gICAgICBub3RpZnlTdGF0ZSgpO1xuICAgICAgc2hvd1RvYXN0KGBXZWxjb21lIGJhY2ssICR7Zm91bmQuZnVsbE5hbWV9IWApO1xuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGVtYWlsL3VzZXJuYW1lIG9yIHBhc3N3b3JkJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVDdXN0b21lclByb2ZpbGUodXBkYXRlcyA9IHt9KSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBnZXRDdXN0b21lclNlc3Npb24oKTtcbiAgaWYgKCFjdXJyZW50KSB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBzaWduIGluIGZpcnN0LicpO1xuXG4gIGNvbnN0IGNsZWFuTmFtZSA9IFN0cmluZyh1cGRhdGVzLmZ1bGxOYW1lID8/IGN1cnJlbnQuZnVsbE5hbWUgPz8gJycpLnRyaW0oKS5zbGljZSgwLCAxMDApO1xuICBpZiAoY2xlYW5OYW1lLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBlbnRlciBhIG5hbWUgd2l0aCBhdCBsZWFzdCAyIGNoYXJhY3RlcnMuJyk7XG4gIH1cblxuICBjb25zdCBwcm9maWxlUGF0Y2ggPSB7XG4gICAgZnVsbE5hbWU6IGNsZWFuTmFtZSxcbiAgICBuYW1lOiBjbGVhbk5hbWUsXG4gICAgcGhvbmU6IG5vcm1hbGl6ZVBob25lRmllbGQodXBkYXRlcy5waG9uZSA/PyBjdXJyZW50LnBob25lKSxcbiAgICBhbHRQaG9uZTogbm9ybWFsaXplUGhvbmVGaWVsZCh1cGRhdGVzLmFsdFBob25lID8/IGN1cnJlbnQuYWx0UGhvbmUpLFxuICAgIHdoYXRzYXBwTnVtYmVyOiBub3JtYWxpemVQaG9uZUZpZWxkKHVwZGF0ZXMud2hhdHNhcHBOdW1iZXIgPz8gY3VycmVudC53aGF0c2FwcE51bWJlciksXG4gICAgZGl2aXNpb246IFN0cmluZyh1cGRhdGVzLmRpdmlzaW9uID8/IGN1cnJlbnQuZGl2aXNpb24gPz8gJ0RoYWthJykudHJpbSgpLnNsaWNlKDAsIDgwKSxcbiAgICBkaXN0cmljdDogU3RyaW5nKHVwZGF0ZXMuZGlzdHJpY3QgPz8gY3VycmVudC5kaXN0cmljdCA/PyAnRGhha2EnKS50cmltKCkuc2xpY2UoMCwgODApLFxuICAgIGFkZHJlc3M6IFN0cmluZyh1cGRhdGVzLmFkZHJlc3MgPz8gY3VycmVudC5hZGRyZXNzID8/ICcnKS50cmltKCkuc2xpY2UoMCwgNDAwKSxcbiAgICBwcmVmZXJyZWRQYXltZW50OiBTdHJpbmcodXBkYXRlcy5wcmVmZXJyZWRQYXltZW50ID8/IGN1cnJlbnQucHJlZmVycmVkUGF5bWVudCA/PyAnQ2FzaCBvbiBEZWxpdmVyeScpLnRyaW0oKSxcbiAgICBub3RpZnlPcmRlcnM6IHVwZGF0ZXMubm90aWZ5T3JkZXJzICE9PSB1bmRlZmluZWQgPyBCb29sZWFuKHVwZGF0ZXMubm90aWZ5T3JkZXJzKSA6IGN1cnJlbnQubm90aWZ5T3JkZXJzICE9PSBmYWxzZSxcbiAgICBub3RpZnlEZWFsczogdXBkYXRlcy5ub3RpZnlEZWFscyAhPT0gdW5kZWZpbmVkID8gQm9vbGVhbih1cGRhdGVzLm5vdGlmeURlYWxzKSA6IEJvb2xlYW4oY3VycmVudC5ub3RpZnlEZWFscyksXG4gICAgYXZhdGFyVXJsOiB1cGRhdGVzLmF2YXRhclVybCAhPT0gdW5kZWZpbmVkID8gU3RyaW5nKHVwZGF0ZXMuYXZhdGFyVXJsIHx8ICcnKSA6IChjdXJyZW50LmF2YXRhclVybCB8fCAnJyksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgfTtcblxuICBpZiAodXBkYXRlcy5lbWFpbCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnQucm9sZSAhPT0gJ2FkbWluJykge1xuICAgIGNvbnN0IG5leHRFbWFpbCA9IFN0cmluZyh1cGRhdGVzLmVtYWlsIHx8ICcnKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoIWlzVmFsaWRFbWFpbChuZXh0RW1haWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJlc2VydmVkSGFzaCA9IGF3YWl0IGhhc2hQYXNzd29yZChuZXh0RW1haWwsIEFETUlOX1NBTFQpO1xuICAgIGlmIChyZXNlcnZlZEhhc2ggPT09IEFETUlOX0lEX0hBU0gpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBlbWFpbCBhZGRyZXNzIGlzIHJlc2VydmVkLicpO1xuICAgIH1cbiAgICBjb25zdCB1c2VycyA9IHJlYWRVc2VycygpO1xuICAgIGlmICh1c2Vycy5zb21lKCh1KSA9PiB1LmlkICE9PSBjdXJyZW50LmlkICYmIFN0cmluZyh1LmVtYWlsIHx8ICcnKS50b0xvd2VyQ2FzZSgpID09PSBuZXh0RW1haWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Fub3RoZXIgYWNjb3VudCBpcyBhbHJlYWR5IHVzaW5nIHRoaXMgZW1haWwgYWRkcmVzcy4nKTtcbiAgICB9XG4gICAgcHJvZmlsZVBhdGNoLmVtYWlsID0gbmV4dEVtYWlsO1xuICB9XG5cbiAgaWYgKGN1cnJlbnQuaWQgPT09ICdhZG1pbi1yb290Jykge1xuICAgIGNvbnN0IGV4aXN0aW5nQWRtID0gcmVhZEFkbWluUHJvZmlsZSgpO1xuICAgIHdyaXRlQWRtaW5Qcm9maWxlKHsgLi4uZXhpc3RpbmdBZG0sIC4uLnByb2ZpbGVQYXRjaCB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB1c2VycyA9IHJlYWRVc2VycygpO1xuICAgIGNvbnN0IGlkeCA9IHVzZXJzLmZpbmRJbmRleCgodSkgPT4gdS5pZCA9PT0gY3VycmVudC5pZCk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICB1c2Vyc1tpZHhdID0geyAuLi51c2Vyc1tpZHhdLCAuLi5wcm9maWxlUGF0Y2ggfTtcbiAgICAgIHdyaXRlVXNlcnModXNlcnMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG5leHRTZXNzaW9uID0geyAuLi5jdXJyZW50LCAuLi5wcm9maWxlUGF0Y2ggfTtcbiAgd3JpdGVTZXNzaW9uKG5leHRTZXNzaW9uKTtcbiAgbm90aWZ5U3RhdGUoKTtcbiAgc2hvd1RvYXN0KCdBY2NvdW50IHNldHRpbmdzIHNhdmVkIScpO1xuICByZXR1cm4gbmV4dFNlc3Npb247XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGFuZ2VDdXN0b21lclBhc3N3b3JkKHsgY3VycmVudFBhc3N3b3JkLCBuZXdQYXNzd29yZCwgY29uZmlybVBhc3N3b3JkIH0pIHtcbiAgY29uc3QgY3VycmVudCA9IGdldEN1c3RvbWVyU2Vzc2lvbigpO1xuICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5pZCA9PT0gJ2FkbWluLXJvb3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXNzd29yZCBjaGFuZ2VzIGhlcmUgYXBwbHkgdG8gcmVnaXN0ZXJlZCBjdXN0b21lciBhY2NvdW50cy4nKTtcbiAgfVxuICBjb25zdCB1c2VycyA9IHJlYWRVc2VycygpO1xuICBjb25zdCBpZHggPSB1c2Vycy5maW5kSW5kZXgoKHUpID0+IHUuaWQgPT09IGN1cnJlbnQuaWQpO1xuICBpZiAoaWR4IDwgMCkgdGhyb3cgbmV3IEVycm9yKCdBY2NvdW50IHJlY29yZCBub3QgZm91bmQuJyk7XG5cbiAgY29uc3QgZm91bmQgPSB1c2Vyc1tpZHhdO1xuICBjb25zdCBjdXJyUGFzcyA9IFN0cmluZyhjdXJyZW50UGFzc3dvcmQgfHwgJycpO1xuICBjb25zdCBuZXh0UGFzcyA9IFN0cmluZyhuZXdQYXNzd29yZCB8fCAnJyk7XG4gIGNvbnN0IGNvbmZQYXNzID0gU3RyaW5nKGNvbmZpcm1QYXNzd29yZCB8fCAnJyk7XG5cbiAgY29uc3QgY3VycmVudE1hdGNoZXMgPSBmb3VuZC5zYWx0ICYmIGZvdW5kLnBhc3N3b3JkSGFzaFxuICAgID8gKGF3YWl0IGhhc2hQYXNzd29yZChjdXJyUGFzcywgZm91bmQuc2FsdCkpID09PSBmb3VuZC5wYXNzd29yZEhhc2hcbiAgICA6IGZvdW5kLnBhc3N3b3JkID09PSBjdXJyUGFzcztcblxuICBpZiAoIWN1cnJlbnRNYXRjaGVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHBhc3N3b3JkIGlzIGluY29ycmVjdC4nKTtcbiAgfVxuICBpZiAobmV4dFBhc3MubGVuZ3RoIDwgNikge1xuICAgIHRocm93IG5ldyBFcnJvcignTmV3IHBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmcuJyk7XG4gIH1cbiAgaWYgKG5leHRQYXNzICE9PSBjb25mUGFzcykge1xuICAgIHRocm93IG5ldyBFcnJvcignTmV3IHBhc3N3b3JkcyBkbyBub3QgbWF0Y2guJyk7XG4gIH1cblxuICBjb25zdCBzYWx0ID0gbWFrZVNhbHQoKTtcbiAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgaGFzaFBhc3N3b3JkKG5leHRQYXNzLCBzYWx0KTtcbiAgdXNlcnNbaWR4XSA9IHsgLi4uZm91bmQsIHNhbHQsIHBhc3N3b3JkSGFzaCwgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfTtcbiAgZGVsZXRlIHVzZXJzW2lkeF0ucGFzc3dvcmQ7XG4gIHdyaXRlVXNlcnModXNlcnMpO1xuICBzaG93VG9hc3QoJ1Bhc3N3b3JkIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplQXZhdGFyRmlsZVRvRGF0YVVybChmaWxlLCBtYXhTaXplID0gMjQwKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKCFmaWxlIHx8ICFmaWxlLnR5cGU/LnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdQbGVhc2Ugc2VsZWN0IGEgdmFsaWQgaW1hZ2UgZmlsZS4nKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3QgcmVhZCBzZWxlY3RlZCBpbWFnZSBmaWxlLicpKTtcbiAgICByZWFkZXIub25sb2FkID0gKCkgPT4ge1xuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWcub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBwcm9jZXNzIHNlbGVjdGVkIGltYWdlLicpKTtcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihtYXhTaXplLCBNYXRoLm1heChpbWcud2lkdGgsIGltZy5oZWlnaHQpKTtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBzaXplO1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKCFjdHgpIHtcbiAgICAgICAgICByZXNvbHZlKFN0cmluZyhyZWFkZXIucmVzdWx0IHx8ICcnKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNpZGUgPSBNYXRoLm1pbihpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICBjb25zdCBzeCA9IChpbWcud2lkdGggLSBzaWRlKSAvIDI7XG4gICAgICAgIGNvbnN0IHN5ID0gKGltZy5oZWlnaHQgLSBzaWRlKSAvIDI7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCBzeCwgc3ksIHNpZGUsIHNpZGUsIDAsIDAsIHNpemUsIHNpemUpO1xuICAgICAgICByZXNvbHZlKGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL2pwZWcnLCAwLjg1KSk7XG4gICAgICB9O1xuICAgICAgaW1nLnNyYyA9IFN0cmluZyhyZWFkZXIucmVzdWx0IHx8ICcnKTtcbiAgICB9O1xuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNpZ25PdXRDdXN0b21lcigpIHtcbiAgd3JpdGVTZXNzaW9uKG51bGwpO1xuICBjdXN0b21lckF1dGhVaS5tb2RlID0gJ3NpZ25pbic7XG4gIGN1c3RvbWVyQXV0aFVpLmVycm9yID0gJyc7XG4gIGN1c3RvbWVyQXV0aFVpLnNob3dQYXNzd29yZCA9IGZhbHNlO1xuICBjdXN0b21lckF1dGhVaS5zaG93Q29uZmlybVBhc3N3b3JkID0gZmFsc2U7XG4gIGN1c3RvbWVyQXV0aFVpLnBhc3N3b3JkRHJhZnQgPSAnJztcbiAgY3VzdG9tZXJBdXRoVWkuY29uZmlybVBhc3N3b3JkRHJhZnQgPSAnJztcbiAgbm90aWZ5U3RhdGUoKTtcbiAgc2hvd1RvYXN0KCdZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQuJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBdXRoR2F0ZVZpZXcoKSB7XG4gIGNvbnN0IGcgPSBzdGF0ZS5nZW5lcmFsIHx8IFNFRURfR0VORVJBTF9TRVRUSU5HUztcbiAgY29uc3QgaXNTaWduVXAgPSBjdXN0b21lckF1dGhVaS5tb2RlID09PSAnc2lnbnVwJztcblxuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJhdXRoLWdhdGUtc2hlbGxcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJhdXRoLWdhdGUtY2FyZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXV0aC1nYXRlLWJyYW5kXCI+XG4gICAgICAgICAgJHtnLmxvZ29VcmxcbiAgICAgICAgICAgID8gYDxpbWcgc3JjPVwiJHtlc2NIdG1sKGcubG9nb1VybCl9XCIgYWx0PVwiJHtlc2NIdG1sKGcuc2l0ZU5hbWUgfHwgJ1BhemFybyBCRCcpfSBsb2dvXCIgY2xhc3M9XCJhdXRoLWdhdGUtbG9nby1pbWdcIiAvPmBcbiAgICAgICAgICAgIDogYDxpbWcgc3JjPVwiL2Fzc2V0cy9wYXphcm8tbG9nby5zdmdcIiBhbHQ9XCIke2VzY0h0bWwoZy5zaXRlTmFtZSB8fCAnUGF6YXJvIEJEJyl9IGxvZ29cIiBjbGFzcz1cImF1dGgtZ2F0ZS1sb2dvLWltZyBhdXRoLWdhdGUtbG9nby1zdmdcIiAvPmBcbiAgICAgICAgICB9XG4gICAgICAgICAgPGgxIGNsYXNzPVwiYXV0aC1nYXRlLXRpdGxlXCI+JHtlc2NIdG1sKGcuc2l0ZU5hbWUgfHwgJ1BhemFybyBCRCcpfTwvaDE+XG4gICAgICAgICAgPHAgY2xhc3M9XCJhdXRoLWdhdGUtc3ViXCI+JHtlc2NIdG1sKGcudGFnbGluZSB8fCAnWW91ciBCYXphYXIsIFNtYXJ0ZXInKX0gwrcgU2lnbiBpbiB0byBicm93c2UgJiBzaG9wPC9wPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAke3JlbmRlckRiQ29ubmVjdGlvbkFsZXJ0KCl9XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImF1dGgtdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCIgYXJpYS1sYWJlbD1cIkF1dGhlbnRpY2F0aW9uIG1vZGVcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD1cIiR7IWlzU2lnblVwfVwiXG4gICAgICAgICAgICBjbGFzcz1cImF1dGgtdGFiLWJ0biAkeyFpc1NpZ25VcCA/ICdhY3RpdmUnIDogJyd9XCJcbiAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwiYXV0aC1zd2l0Y2gtbW9kZVwiXG4gICAgICAgICAgICBkYXRhLW1vZGU9XCJzaWduaW5cIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIFNpZ24gSW5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD1cIiR7aXNTaWduVXB9XCJcbiAgICAgICAgICAgIGNsYXNzPVwiYXV0aC10YWItYnRuICR7aXNTaWduVXAgPyAnYWN0aXZlJyA6ICcnfVwiXG4gICAgICAgICAgICBkYXRhLWFjdGlvbj1cImF1dGgtc3dpdGNoLW1vZGVcIlxuICAgICAgICAgICAgZGF0YS1tb2RlPVwic2lnbnVwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBTaWduIFVwXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgICR7Y3VzdG9tZXJBdXRoVWkuZXJyb3IgPyBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImF1dGgtZXJyb3ItYm94XCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAke2VzY0h0bWwoY3VzdG9tZXJBdXRoVWkuZXJyb3IpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgIDogJyd9XG5cbiAgICAgICAgJHtpc1NpZ25VcCA/IGBcbiAgICAgICAgICA8Zm9ybSBpZD1cImN1c3RvbWVyLXNpZ251cC1mb3JtXCIgY2xhc3M9XCJmb3JtLWdyaWRcIiBub3ZhbGlkYXRlPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhdXRoLWZ1bGxuYW1lXCI+RnVsbCBOYW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJmaWVsZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgaWQ9XCJhdXRoLWZ1bGxuYW1lXCJcbiAgICAgICAgICAgICAgICBuYW1lPVwiZnVsbE5hbWVcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm5hbWVcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiBUYW52aXIgQWhtZWRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NIdG1sKGN1c3RvbWVyQXV0aFVpLm5hbWVEcmFmdCl9XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImF1dGgtc2lnbnVwLWVtYWlsXCI+RW1haWwgQWRkcmVzczwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzPVwiZmllbGQtaW5wdXRcIlxuICAgICAgICAgICAgICAgIGlkPVwiYXV0aC1zaWdudXAtZW1haWxcIlxuICAgICAgICAgICAgICAgIG5hbWU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInlvdUBleGFtcGxlLmNvbVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY0h0bWwoY3VzdG9tZXJBdXRoVWkuZW1haWxEcmFmdCl9XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImF1dGgtc2lnbnVwLXBhc3NcIj5QYXNzd29yZCAobWluLiA2IGNoYXJhY3RlcnMpPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImF1dGgtcGFzcy13cmFwXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImZpZWxkLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgIGlkPVwiYXV0aC1zaWdudXAtcGFzc1wiXG4gICAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgdHlwZT1cIiR7Y3VzdG9tZXJBdXRoVWkuc2hvd1Bhc3N3b3JkID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cIlxuICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgIG1pbmxlbmd0aD1cIjZcIlxuICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQ3JlYXRlIGEgcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY0h0bWwoY3VzdG9tZXJBdXRoVWkucGFzc3dvcmREcmFmdCl9XCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJhdXRoLWV5ZS1idG5cIlxuICAgICAgICAgICAgICAgICAgZGF0YS1hY3Rpb249XCJhdXRoLXRvZ2dsZS1wYXNzXCJcbiAgICAgICAgICAgICAgICAgIGRhdGEtdGFyZ2V0PVwiYXV0aC1zaWdudXAtcGFzc1wiXG4gICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiJHtjdXN0b21lckF1dGhVaS5zaG93UGFzc3dvcmQgPyAnSGlkZSBwYXNzd29yZCcgOiAnU2hvdyBwYXNzd29yZCd9XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke2N1c3RvbWVyQXV0aFVpLnNob3dQYXNzd29yZCA/ICdIaWRlJyA6ICdTaG93J31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZmllbGQtbGFiZWxcIiBmb3I9XCJhdXRoLXNpZ251cC1jb25maXJtXCI+Q29uZmlybSBQYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhdXRoLXBhc3Mtd3JhcFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmaWVsZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICBpZD1cImF1dGgtc2lnbnVwLWNvbmZpcm1cIlxuICAgICAgICAgICAgICAgICAgbmFtZT1cImNvbmZpcm1QYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiJHtjdXN0b21lckF1dGhVaS5zaG93Q29uZmlybVBhc3N3b3JkID8gJ3RleHQnIDogJ3Bhc3N3b3JkJ31cIlxuICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgIG1pbmxlbmd0aD1cIjZcIlxuICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUmUtZW50ZXIgeW91ciBwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjSHRtbChjdXN0b21lckF1dGhVaS5jb25maXJtUGFzc3dvcmREcmFmdCl9XCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJhdXRoLWV5ZS1idG5cIlxuICAgICAgICAgICAgICAgICAgZGF0YS1hY3Rpb249XCJhdXRoLXRvZ2dsZS1jb25maXJtXCJcbiAgICAgICAgICAgICAgICAgIGRhdGEtdGFyZ2V0PVwiYXV0aC1zaWdudXAtY29uZmlybVwiXG4gICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiJHtjdXN0b21lckF1dGhVaS5zaG93Q29uZmlybVBhc3N3b3JkID8gJ0hpZGUgY29uZmlybSBwYXNzd29yZCcgOiAnU2hvdyBjb25maXJtIHBhc3N3b3JkJ31cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICR7Y3VzdG9tZXJBdXRoVWkuc2hvd0NvbmZpcm1QYXNzd29yZCA/ICdIaWRlJyA6ICdTaG93J31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLWFjY2VudFwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIiAke2N1c3RvbWVyQXV0aFVpLmJ1c3kgPyAnZGlzYWJsZWQnIDogJyd9PlxuICAgICAgICAgICAgICAke2N1c3RvbWVyQXV0aFVpLmJ1c3kgPyAnQ3JlYXRpbmcgQWNjb3VudC4uLicgOiAnQ3JlYXRlIEFjY291bnQnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9mb3JtPlxuXG4gICAgICAgICAgPHAgY2xhc3M9XCJhdXRoLXN3aXRjaC1oaW50XCI+XG4gICAgICAgICAgICBBbHJlYWR5IGhhdmUgYW4gYWNjb3VudD9cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYXV0aC1pbmxpbmUtbGlua1wiIGRhdGEtYWN0aW9uPVwiYXV0aC1zd2l0Y2gtbW9kZVwiIGRhdGEtbW9kZT1cInNpZ25pblwiPlNpZ24gSW48L2J1dHRvbj5cbiAgICAgICAgICA8L3A+XG4gICAgICAgIGAgOiBgXG4gICAgICAgICAgPGZvcm0gaWQ9XCJjdXN0b21lci1zaWduaW4tZm9ybVwiIGNsYXNzPVwiZm9ybS1ncmlkXCIgbm92YWxpZGF0ZT5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImZpZWxkLWxhYmVsXCIgZm9yPVwiYXV0aC1zaWduaW4taWRlbnRpZmllclwiPkVtYWlsIG9yIFVzZXJuYW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJmaWVsZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgaWQ9XCJhdXRoLXNpZ25pbi1pZGVudGlmaWVyXCJcbiAgICAgICAgICAgICAgICBuYW1lPVwiaWRlbnRpZmllclwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwidXNlcm5hbWVcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgeW91ciBlbWFpbCBvciB1c2VybmFtZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY0h0bWwoY3VzdG9tZXJBdXRoVWkuZW1haWxEcmFmdCl9XCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmaWVsZC1sYWJlbFwiIGZvcj1cImF1dGgtc2lnbmluLXBhc3NcIj5QYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhdXRoLXBhc3Mtd3JhcFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmaWVsZC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICBpZD1cImF1dGgtc2lnbmluLXBhc3NcIlxuICAgICAgICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCIke2N1c3RvbWVyQXV0aFVpLnNob3dQYXNzd29yZCA/ICd0ZXh0JyA6ICdwYXNzd29yZCd9XCJcbiAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJjdXJyZW50LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgeW91ciBwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjSHRtbChjdXN0b21lckF1dGhVaS5wYXNzd29yZERyYWZ0KX1cIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImF1dGgtZXllLWJ0blwiXG4gICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cImF1dGgtdG9nZ2xlLXBhc3NcIlxuICAgICAgICAgICAgICAgICAgZGF0YS10YXJnZXQ9XCJhdXRoLXNpZ25pbi1wYXNzXCJcbiAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCIke2N1c3RvbWVyQXV0aFVpLnNob3dQYXNzd29yZCA/ICdIaWRlIHBhc3N3b3JkJyA6ICdTaG93IHBhc3N3b3JkJ31cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICR7Y3VzdG9tZXJBdXRoVWkuc2hvd1Bhc3N3b3JkID8gJ0hpZGUnIDogJ1Nob3cnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIiAke2N1c3RvbWVyQXV0aFVpLmJ1c3kgPyAnZGlzYWJsZWQnIDogJyd9PlxuICAgICAgICAgICAgICAke2N1c3RvbWVyQXV0aFVpLmJ1c3kgPyAnU2lnbmluZyBJbi4uLicgOiAnU2lnbiBJbid9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgICA8cCBjbGFzcz1cImF1dGgtc3dpdGNoLWhpbnRcIj5cbiAgICAgICAgICAgIE5ldyB0byBQYXphcm8gQkQ/XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImF1dGgtaW5saW5lLWxpbmtcIiBkYXRhLWFjdGlvbj1cImF1dGgtc3dpdGNoLW1vZGVcIiBkYXRhLW1vZGU9XCJzaWdudXBcIj5DcmVhdGUgYW4gYWNjb3VudDwvYnV0dG9uPlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgYH1cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiYXV0aC1nYXRlLWZvb3RlclwiPlxuICAgICAgICAgIDxzcGFuPlZlcmlmaWVkIGRlbGl2ZXJ5IGFjcm9zcyA2NCBkaXN0cmljdHMgaW4gQmFuZ2xhZGVzaDwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbn1cbiJdfQ==