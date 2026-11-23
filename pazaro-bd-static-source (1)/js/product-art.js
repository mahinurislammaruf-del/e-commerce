// Pazaro BD — Lightweight SVG Studio Product Artwork & Local Asset Map
// Ensures zero external image dependencies and <1MB fast initial paint.
export const LOCAL_PHOTOS = {
	heroTech: "/src/assets/images/hero_tech_bazaar_1795275914831.jpg",
	heroWorkspace: "/src/assets/images/hero_laptop_workspace_1795275916941.jpg",
	audioGaming: "/src/assets/images/category_audio_gaming_1795275916413.jpg",
	lifestyleFashion: "/src/assets/images/category_lifestyle_fashion_1795275917718.jpg",
	smartDevices: "/src/assets/images/category_smart_devices_1795275917008.jpg"
};
const PALETTES = {
	Phones: [
		"#0F766E",
		"#134E4A",
		"#CCFBF1"
	],
	Laptops: [
		"#1E293B",
		"#334155",
		"#E2E8F0"
	],
	Headphones: [
		"#0F766E",
		"#115E59",
		"#F0FDFA"
	],
	"Smart Watches": [
		"#1F2937",
		"#0F766E",
		"#FEF3C7"
	],
	Gaming: [
		"#312E81",
		"#1E1B4B",
		"#E0E7FF"
	],
	Accessories: [
		"#0D9488",
		"#115E59",
		"#CCFBF1"
	],
	"Smart Home": [
		"#0F766E",
		"#083D38",
		"#FEF9C3"
	],
	Fashion: [
		"#9A3412",
		"#7C2D12",
		"#FFEDD5"
	],
	Beauty: [
		"#B45309",
		"#78350F",
		"#FEF3C7"
	],
	"Beauty & Skincare": [
		"#0F766E",
		"#115E59",
		"#FDF2F8"
	],
	"Skincare & Serums": [
		"#0F766E",
		"#115E59",
		"#FDF2F8"
	],
	"Home and Living": [
		"#0F766E",
		"#115E59",
		"#F3F0EA"
	],
	Sports: [
		"#1D4ED8",
		"#1E3A8A",
		"#DBEAFE"
	],
	"Toys and Kids": [
		"#D97706",
		"#B45309",
		"#FEF3C7"
	],
	Books: [
		"#083D38",
		"#0F766E",
		"#FAF8F5"
	],
	Groceries: [
		"#B45309",
		"#92400E",
		"#FEF3C7"
	]
};
function escXml(str) {
	return String(str || "").replace(/[<>&'"]/g, (ch) => {
		switch (ch) {
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "&": return "&amp;";
			case "'": return "&apos;";
			case "\"": return "&quot;";
			default: return ch;
		}
	});
}
function getDeviceSilhouette(category, c1, c2) {
	switch (category) {
		case "Phones": return `<rect x="150" y="34" width="100" height="196" rx="18" fill="${c2}" stroke="${c1}" stroke-width="4"/>
              <rect x="160" y="48" width="80" height="164" rx="10" fill="url(#g1)"/>
              <circle cx="176" cy="64" r="6" fill="#0F172A"/><circle cx="192" cy="64" r="6" fill="#0F172A"/>`;
		case "Laptops": return `<rect x="86" y="48" width="228" height="136" rx="10" fill="${c1}"/>
              <rect x="96" y="58" width="208" height="114" rx="4" fill="url(#g1)"/>
              <path d="M58 190h284l-14 18H72z" fill="${c2}"/>`;
		case "Headphones": return `<path d="M135 142a65 65 0 0 1 130 0" fill="none" stroke="${c1}" stroke-width="14" stroke-linecap="round"/>
              <rect x="116" y="132" width="28" height="62" rx="14" fill="${c2}"/>
              <rect x="256" y="132" width="28" height="62" rx="14" fill="${c2}"/>`;
		case "Smart Watches": return `<rect x="172" y="28" width="56" height="204" rx="14" fill="${c2}"/>
              <circle cx="200" cy="130" r="54" fill="${c1}" stroke="#ffffff" stroke-width="4"/>
              <circle cx="200" cy="130" r="42" fill="#0F172A"/>
              <text x="200" y="136" text-anchor="middle" fill="#FBBF24" font-size="20" font-weight="700" font-family="sans-serif">10:09</text>`;
		case "Gaming": return `<rect x="108" y="88" width="184" height="84" rx="40" fill="${c1}"/>
              <circle cx="152" cy="128" r="16" fill="#ffffff" opacity="0.22"/>
              <circle cx="248" cy="118" r="7" fill="#FF6B57"/>
              <circle cx="264" cy="132" r="7" fill="#FBBF24"/>
              <circle cx="232" cy="132" r="7" fill="#34D399"/>`;
		case "Accessories": return `<rect x="140" y="54" width="120" height="156" rx="18" fill="${c1}"/>
              <rect x="156" y="72" width="88" height="22" rx="6" fill="#ffffff" opacity="0.2"/>
              <text x="200" y="156" text-anchor="middle" fill="#FBBF24" font-size="16" font-weight="700" font-family="sans-serif">FAST</text>`;
		case "Smart Home": return `<rect x="152" y="56" width="96" height="132" rx="48" fill="${c1}"/>
              <circle cx="200" cy="106" r="24" fill="#0F172A" stroke="#CCFBF1" stroke-width="4"/>
              <circle cx="200" cy="106" r="9" fill="#FF6B57"/>
              <rect x="174" y="192" width="52" height="14" rx="6" fill="${c2}"/>`;
		case "Fashion": return `<path d="M135 58l35-14 30 16 30-16 35 14 22 46-28 16-14-26v122H155V94l-14 26-28-16z" fill="${c1}"/>
              <path d="M185 58v48" stroke="#FBBF24" stroke-width="3"/>`;
		case "Beauty": return `<rect x="164" y="88" width="72" height="122" rx="14" fill="${c1}"/>
              <rect x="182" y="64" width="36" height="26" rx="4" fill="${c2}"/>
              <rect x="192" y="42" width="16" height="24" rx="6" fill="#1F2937"/>
              <rect x="176" y="126" width="48" height="44" rx="4" fill="#FAF8F5"/>`;
		case "Beauty & Skincare":
		case "Skincare & Serums": return `<rect x="132" y="88" width="66" height="122" rx="14" fill="${c1}"/>
              <rect x="150" y="66" width="30" height="24" rx="4" fill="${c2}"/>
              <rect x="159" y="42" width="12" height="26" rx="6" fill="#1F2937"/>
              <rect x="142" y="124" width="46" height="48" rx="6" fill="#FAF8F5"/>
              <rect x="212" y="142" width="74" height="68" rx="14" fill="#F472B6"/>
              <rect x="216" y="126" width="66" height="20" rx="6" fill="#FBBF24"/>
              <rect x="226" y="162" width="46" height="26" rx="4" fill="#FFFFFF" opacity="0.88"/>`;
		case "Books": return `<rect x="130" y="46" width="140" height="172" rx="8" fill="${c1}"/>
              <rect x="142" y="46" width="8" height="172" fill="#FBBF24"/>
              <rect x="166" y="82" width="80" height="10" rx="4" fill="#ffffff" opacity="0.85"/>
              <rect x="166" y="102" width="60" height="8" rx="4" fill="#ffffff" opacity="0.55"/>`;
		case "Groceries": return `<path d="M150 90h100l-8 122H158z" rx="16" fill="#FBBF24" stroke="${c1}" stroke-width="4"/>
              <rect x="162" y="64" width="76" height="26" rx="8" fill="${c1}"/>
              <circle cx="200" cy="150" r="24" fill="#ffffff" opacity="0.65"/>`;
		default: return `<rect x="128" y="64" width="144" height="136" rx="22" fill="${c1}"/>
              <circle cx="200" cy="132" r="38" fill="#ffffff" opacity="0.2"/>`;
	}
}
/**
* Generates an inline SVG data-URI product card studio render.
* @param {string} title
* @param {string} category
* @param {string} [badge]
*/
export function makeProductSvg(title, category, badge = "") {
	const [c1, c2, bg] = PALETTES[category] || [
		"#0F766E",
		"#083D38",
		"#FAF8F5"
	];
	const shortTitle = escXml(String(title || "Pazaro BD").slice(0, 28));
	const catLabel = escXml(String(category || "Product"));
	const badgeText = escXml(badge);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="${bg}"/>
    <ellipse cx="200" cy="232" rx="110" ry="16" fill="#000000" opacity="0.08"/>
    ${getDeviceSilhouette(category, c1, c2)}
    <text x="200" y="264" text-anchor="middle" fill="#1F2937" font-size="14" font-weight="600" font-family="Poppins, sans-serif">${shortTitle}</text>
    <text x="200" y="284" text-anchor="middle" fill="#6B7280" font-size="11" font-family="Poppins, sans-serif">${catLabel}${badgeText ? " · " + badgeText : ""}</text>
  </svg>`;
	return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6Ijs7QUFHQSxPQUFPLE1BQU0sZUFBZTtDQUMxQixVQUFVO0NBQ1YsZUFBZTtDQUNmLGFBQWE7Q0FDYixrQkFBa0I7Q0FDbEIsY0FBYztBQUNoQjtBQUVBLE1BQU0sV0FBVztDQUNmLFFBQVE7RUFBQztFQUFXO0VBQVc7Q0FBUztDQUN4QyxTQUFTO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDekMsWUFBWTtFQUFDO0VBQVc7RUFBVztDQUFTO0NBQzVDLGlCQUFpQjtFQUFDO0VBQVc7RUFBVztDQUFTO0NBQ2pELFFBQVE7RUFBQztFQUFXO0VBQVc7Q0FBUztDQUN4QyxhQUFhO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDN0MsY0FBYztFQUFDO0VBQVc7RUFBVztDQUFTO0NBQzlDLFNBQVM7RUFBQztFQUFXO0VBQVc7Q0FBUztDQUN6QyxRQUFRO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDeEMscUJBQXFCO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDckQscUJBQXFCO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDckQsbUJBQW1CO0VBQUM7RUFBVztFQUFXO0NBQVM7Q0FDbkQsUUFBUTtFQUFDO0VBQVc7RUFBVztDQUFTO0NBQ3hDLGlCQUFpQjtFQUFDO0VBQVc7RUFBVztDQUFTO0NBQ2pELE9BQU87RUFBQztFQUFXO0VBQVc7Q0FBUztDQUN2QyxXQUFXO0VBQUM7RUFBVztFQUFXO0NBQVM7QUFDN0M7QUFFQSxTQUFTLE9BQU8sS0FBSztDQUNuQixPQUFPLE9BQU8sT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLGFBQWEsT0FBTztFQUNuRCxRQUFRLElBQVI7R0FDRSxLQUFLLEtBQUssT0FBTztHQUNqQixLQUFLLEtBQUssT0FBTztHQUNqQixLQUFLLEtBQUssT0FBTztHQUNqQixLQUFLLEtBQUssT0FBTztHQUNqQixLQUFLLE1BQUssT0FBTztHQUNqQixTQUFTLE9BQU87RUFDbEI7Q0FDRixDQUFDO0FBQ0g7QUFFQSxTQUFTLG9CQUFvQixVQUFVLElBQUksSUFBSTtDQUM3QyxRQUFRLFVBQVI7RUFDRSxLQUFLLFVBQ0gsT0FBTywrREFBK0QsR0FBRyxZQUFZLEdBQUc7OztFQUcxRixLQUFLLFdBQ0gsT0FBTyw4REFBOEQsR0FBRzs7dURBRXZCLEdBQUc7RUFDdEQsS0FBSyxjQUNILE9BQU8sNERBQTRELEdBQUc7MkVBQ0QsR0FBRzsyRUFDSCxHQUFHO0VBQzFFLEtBQUssaUJBQ0gsT0FBTyw4REFBOEQsR0FBRzt1REFDdkIsR0FBRzs7O0VBR3RELEtBQUssVUFDSCxPQUFPLDhEQUE4RCxHQUFHOzs7OztFQUsxRSxLQUFLLGVBQ0gsT0FBTywrREFBK0QsR0FBRzs7O0VBRzNFLEtBQUssY0FDSCxPQUFPLDhEQUE4RCxHQUFHOzs7MEVBR0osR0FBRztFQUN6RSxLQUFLLFdBQ0gsT0FBTyw4RkFBOEYsR0FBRzs7RUFFMUcsS0FBSyxVQUNILE9BQU8sOERBQThELEdBQUc7eUVBQ0wsR0FBRzs7O0VBR3hFLEtBQUs7RUFDTCxLQUFLLHFCQUNILE9BQU8sOERBQThELEdBQUc7eUVBQ0wsR0FBRzs7Ozs7O0VBTXhFLEtBQUssU0FDSCxPQUFPLDhEQUE4RCxHQUFHOzs7O0VBSTFFLEtBQUssYUFDSCxPQUFPLG9FQUFvRSxHQUFHO3lFQUNYLEdBQUc7O0VBRXhFLFNBQ0UsT0FBTywrREFBK0QsR0FBRzs7Q0FFN0U7QUFDRjs7Ozs7OztBQVFBLE9BQU8sU0FBUyxlQUFlLE9BQU8sVUFBVSxRQUFRLElBQUk7Q0FDMUQsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLFNBQVMsYUFBYTtFQUFDO0VBQVc7RUFBVztDQUFTO0NBQzNFLE1BQU0sYUFBYSxPQUFPLE9BQU8sU0FBUyxXQUFXLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0NBQ25FLE1BQU0sV0FBVyxPQUFPLE9BQU8sWUFBWSxTQUFTLENBQUM7Q0FDckQsTUFBTSxZQUFZLE9BQU8sS0FBSztDQUU5QixNQUFNLE1BQU07Ozt3Q0FHMEIsR0FBRzswQ0FDRCxHQUFHOzs7MkNBR0YsR0FBRzs7TUFFeEMsb0JBQW9CLFVBQVUsSUFBSSxFQUFFLEVBQUU7bUlBQ3VGLFdBQVc7aUhBQzdCLFdBQVcsWUFBWSxRQUFRLFlBQVksR0FBRzs7Q0FHN0osT0FBTyxzQ0FBc0MsbUJBQW1CLEdBQUc7QUFDckUiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsicHJvZHVjdC1hcnQuanMiXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiLy8gUGF6YXJvIEJEIOKAlCBMaWdodHdlaWdodCBTVkcgU3R1ZGlvIFByb2R1Y3QgQXJ0d29yayAmIExvY2FsIEFzc2V0IE1hcFxuLy8gRW5zdXJlcyB6ZXJvIGV4dGVybmFsIGltYWdlIGRlcGVuZGVuY2llcyBhbmQgPDFNQiBmYXN0IGluaXRpYWwgcGFpbnQuXG5cbmV4cG9ydCBjb25zdCBMT0NBTF9QSE9UT1MgPSB7XG4gIGhlcm9UZWNoOiAnL3NyYy9hc3NldHMvaW1hZ2VzL2hlcm9fdGVjaF9iYXphYXJfMTc5NTI3NTkxNDgzMS5qcGcnLFxuICBoZXJvV29ya3NwYWNlOiAnL3NyYy9hc3NldHMvaW1hZ2VzL2hlcm9fbGFwdG9wX3dvcmtzcGFjZV8xNzk1Mjc1OTE2OTQxLmpwZycsXG4gIGF1ZGlvR2FtaW5nOiAnL3NyYy9hc3NldHMvaW1hZ2VzL2NhdGVnb3J5X2F1ZGlvX2dhbWluZ18xNzk1Mjc1OTE2NDEzLmpwZycsXG4gIGxpZmVzdHlsZUZhc2hpb246ICcvc3JjL2Fzc2V0cy9pbWFnZXMvY2F0ZWdvcnlfbGlmZXN0eWxlX2Zhc2hpb25fMTc5NTI3NTkxNzcxOC5qcGcnLFxuICBzbWFydERldmljZXM6ICcvc3JjL2Fzc2V0cy9pbWFnZXMvY2F0ZWdvcnlfc21hcnRfZGV2aWNlc18xNzk1Mjc1OTE3MDA4LmpwZydcbn07XG5cbmNvbnN0IFBBTEVUVEVTID0ge1xuICBQaG9uZXM6IFsnIzBGNzY2RScsICcjMTM0RTRBJywgJyNDQ0ZCRjEnXSxcbiAgTGFwdG9wczogWycjMUUyOTNCJywgJyMzMzQxNTUnLCAnI0UyRThGMCddLFxuICBIZWFkcGhvbmVzOiBbJyMwRjc2NkUnLCAnIzExNUU1OScsICcjRjBGREZBJ10sXG4gICdTbWFydCBXYXRjaGVzJzogWycjMUYyOTM3JywgJyMwRjc2NkUnLCAnI0ZFRjNDNyddLFxuICBHYW1pbmc6IFsnIzMxMkU4MScsICcjMUUxQjRCJywgJyNFMEU3RkYnXSxcbiAgQWNjZXNzb3JpZXM6IFsnIzBEOTQ4OCcsICcjMTE1RTU5JywgJyNDQ0ZCRjEnXSxcbiAgJ1NtYXJ0IEhvbWUnOiBbJyMwRjc2NkUnLCAnIzA4M0QzOCcsICcjRkVGOUMzJ10sXG4gIEZhc2hpb246IFsnIzlBMzQxMicsICcjN0MyRDEyJywgJyNGRkVERDUnXSxcbiAgQmVhdXR5OiBbJyNCNDUzMDknLCAnIzc4MzUwRicsICcjRkVGM0M3J10sXG4gICdCZWF1dHkgJiBTa2luY2FyZSc6IFsnIzBGNzY2RScsICcjMTE1RTU5JywgJyNGREYyRjgnXSxcbiAgJ1NraW5jYXJlICYgU2VydW1zJzogWycjMEY3NjZFJywgJyMxMTVFNTknLCAnI0ZERjJGOCddLFxuICAnSG9tZSBhbmQgTGl2aW5nJzogWycjMEY3NjZFJywgJyMxMTVFNTknLCAnI0YzRjBFQSddLFxuICBTcG9ydHM6IFsnIzFENEVEOCcsICcjMUUzQThBJywgJyNEQkVBRkUnXSxcbiAgJ1RveXMgYW5kIEtpZHMnOiBbJyNEOTc3MDYnLCAnI0I0NTMwOScsICcjRkVGM0M3J10sXG4gIEJvb2tzOiBbJyMwODNEMzgnLCAnIzBGNzY2RScsICcjRkFGOEY1J10sXG4gIEdyb2NlcmllczogWycjQjQ1MzA5JywgJyM5MjQwMEUnLCAnI0ZFRjNDNyddXG59O1xuXG5mdW5jdGlvbiBlc2NYbWwoc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyIHx8ICcnKS5yZXBsYWNlKC9bPD4mJ1wiXS9nLCAoY2gpID0+IHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICBjYXNlICc8JzogcmV0dXJuICcmbHQ7JztcbiAgICAgIGNhc2UgJz4nOiByZXR1cm4gJyZndDsnO1xuICAgICAgY2FzZSAnJic6IHJldHVybiAnJmFtcDsnO1xuICAgICAgY2FzZSBcIidcIjogcmV0dXJuICcmYXBvczsnO1xuICAgICAgY2FzZSAnXCInOiByZXR1cm4gJyZxdW90Oyc7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gY2g7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RGV2aWNlU2lsaG91ZXR0ZShjYXRlZ29yeSwgYzEsIGMyKSB7XG4gIHN3aXRjaCAoY2F0ZWdvcnkpIHtcbiAgICBjYXNlICdQaG9uZXMnOlxuICAgICAgcmV0dXJuIGA8cmVjdCB4PVwiMTUwXCIgeT1cIjM0XCIgd2lkdGg9XCIxMDBcIiBoZWlnaHQ9XCIxOTZcIiByeD1cIjE4XCIgZmlsbD1cIiR7YzJ9XCIgc3Ryb2tlPVwiJHtjMX1cIiBzdHJva2Utd2lkdGg9XCI0XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMTYwXCIgeT1cIjQ4XCIgd2lkdGg9XCI4MFwiIGhlaWdodD1cIjE2NFwiIHJ4PVwiMTBcIiBmaWxsPVwidXJsKCNnMSlcIi8+XG4gICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxNzZcIiBjeT1cIjY0XCIgcj1cIjZcIiBmaWxsPVwiIzBGMTcyQVwiLz48Y2lyY2xlIGN4PVwiMTkyXCIgY3k9XCI2NFwiIHI9XCI2XCIgZmlsbD1cIiMwRjE3MkFcIi8+YDtcbiAgICBjYXNlICdMYXB0b3BzJzpcbiAgICAgIHJldHVybiBgPHJlY3QgeD1cIjg2XCIgeT1cIjQ4XCIgd2lkdGg9XCIyMjhcIiBoZWlnaHQ9XCIxMzZcIiByeD1cIjEwXCIgZmlsbD1cIiR7YzF9XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiOTZcIiB5PVwiNThcIiB3aWR0aD1cIjIwOFwiIGhlaWdodD1cIjExNFwiIHJ4PVwiNFwiIGZpbGw9XCJ1cmwoI2cxKVwiLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk01OCAxOTBoMjg0bC0xNCAxOEg3MnpcIiBmaWxsPVwiJHtjMn1cIi8+YDtcbiAgICBjYXNlICdIZWFkcGhvbmVzJzpcbiAgICAgIHJldHVybiBgPHBhdGggZD1cIk0xMzUgMTQyYTY1IDY1IDAgMCAxIDEzMCAwXCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIke2MxfVwiIHN0cm9rZS13aWR0aD1cIjE0XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjExNlwiIHk9XCIxMzJcIiB3aWR0aD1cIjI4XCIgaGVpZ2h0PVwiNjJcIiByeD1cIjE0XCIgZmlsbD1cIiR7YzJ9XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMjU2XCIgeT1cIjEzMlwiIHdpZHRoPVwiMjhcIiBoZWlnaHQ9XCI2MlwiIHJ4PVwiMTRcIiBmaWxsPVwiJHtjMn1cIi8+YDtcbiAgICBjYXNlICdTbWFydCBXYXRjaGVzJzpcbiAgICAgIHJldHVybiBgPHJlY3QgeD1cIjE3MlwiIHk9XCIyOFwiIHdpZHRoPVwiNTZcIiBoZWlnaHQ9XCIyMDRcIiByeD1cIjE0XCIgZmlsbD1cIiR7YzJ9XCIvPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMjAwXCIgY3k9XCIxMzBcIiByPVwiNTRcIiBmaWxsPVwiJHtjMX1cIiBzdHJva2U9XCIjZmZmZmZmXCIgc3Ryb2tlLXdpZHRoPVwiNFwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjIwMFwiIGN5PVwiMTMwXCIgcj1cIjQyXCIgZmlsbD1cIiMwRjE3MkFcIi8+XG4gICAgICAgICAgICAgIDx0ZXh0IHg9XCIyMDBcIiB5PVwiMTM2XCIgdGV4dC1hbmNob3I9XCJtaWRkbGVcIiBmaWxsPVwiI0ZCQkYyNFwiIGZvbnQtc2l6ZT1cIjIwXCIgZm9udC13ZWlnaHQ9XCI3MDBcIiBmb250LWZhbWlseT1cInNhbnMtc2VyaWZcIj4xMDowOTwvdGV4dD5gO1xuICAgIGNhc2UgJ0dhbWluZyc6XG4gICAgICByZXR1cm4gYDxyZWN0IHg9XCIxMDhcIiB5PVwiODhcIiB3aWR0aD1cIjE4NFwiIGhlaWdodD1cIjg0XCIgcng9XCI0MFwiIGZpbGw9XCIke2MxfVwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjE1MlwiIGN5PVwiMTI4XCIgcj1cIjE2XCIgZmlsbD1cIiNmZmZmZmZcIiBvcGFjaXR5PVwiMC4yMlwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjI0OFwiIGN5PVwiMTE4XCIgcj1cIjdcIiBmaWxsPVwiI0ZGNkI1N1wiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjI2NFwiIGN5PVwiMTMyXCIgcj1cIjdcIiBmaWxsPVwiI0ZCQkYyNFwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjIzMlwiIGN5PVwiMTMyXCIgcj1cIjdcIiBmaWxsPVwiIzM0RDM5OVwiLz5gO1xuICAgIGNhc2UgJ0FjY2Vzc29yaWVzJzpcbiAgICAgIHJldHVybiBgPHJlY3QgeD1cIjE0MFwiIHk9XCI1NFwiIHdpZHRoPVwiMTIwXCIgaGVpZ2h0PVwiMTU2XCIgcng9XCIxOFwiIGZpbGw9XCIke2MxfVwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjE1NlwiIHk9XCI3MlwiIHdpZHRoPVwiODhcIiBoZWlnaHQ9XCIyMlwiIHJ4PVwiNlwiIGZpbGw9XCIjZmZmZmZmXCIgb3BhY2l0eT1cIjAuMlwiLz5cbiAgICAgICAgICAgICAgPHRleHQgeD1cIjIwMFwiIHk9XCIxNTZcIiB0ZXh0LWFuY2hvcj1cIm1pZGRsZVwiIGZpbGw9XCIjRkJCRjI0XCIgZm9udC1zaXplPVwiMTZcIiBmb250LXdlaWdodD1cIjcwMFwiIGZvbnQtZmFtaWx5PVwic2Fucy1zZXJpZlwiPkZBU1Q8L3RleHQ+YDtcbiAgICBjYXNlICdTbWFydCBIb21lJzpcbiAgICAgIHJldHVybiBgPHJlY3QgeD1cIjE1MlwiIHk9XCI1NlwiIHdpZHRoPVwiOTZcIiBoZWlnaHQ9XCIxMzJcIiByeD1cIjQ4XCIgZmlsbD1cIiR7YzF9XCIvPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMjAwXCIgY3k9XCIxMDZcIiByPVwiMjRcIiBmaWxsPVwiIzBGMTcyQVwiIHN0cm9rZT1cIiNDQ0ZCRjFcIiBzdHJva2Utd2lkdGg9XCI0XCIvPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMjAwXCIgY3k9XCIxMDZcIiByPVwiOVwiIGZpbGw9XCIjRkY2QjU3XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMTc0XCIgeT1cIjE5MlwiIHdpZHRoPVwiNTJcIiBoZWlnaHQ9XCIxNFwiIHJ4PVwiNlwiIGZpbGw9XCIke2MyfVwiLz5gO1xuICAgIGNhc2UgJ0Zhc2hpb24nOlxuICAgICAgcmV0dXJuIGA8cGF0aCBkPVwiTTEzNSA1OGwzNS0xNCAzMCAxNiAzMC0xNiAzNSAxNCAyMiA0Ni0yOCAxNi0xNC0yNnYxMjJIMTU1Vjk0bC0xNCAyNi0yOC0xNnpcIiBmaWxsPVwiJHtjMX1cIi8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTg1IDU4djQ4XCIgc3Ryb2tlPVwiI0ZCQkYyNFwiIHN0cm9rZS13aWR0aD1cIjNcIi8+YDtcbiAgICBjYXNlICdCZWF1dHknOlxuICAgICAgcmV0dXJuIGA8cmVjdCB4PVwiMTY0XCIgeT1cIjg4XCIgd2lkdGg9XCI3MlwiIGhlaWdodD1cIjEyMlwiIHJ4PVwiMTRcIiBmaWxsPVwiJHtjMX1cIi8+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIxODJcIiB5PVwiNjRcIiB3aWR0aD1cIjM2XCIgaGVpZ2h0PVwiMjZcIiByeD1cIjRcIiBmaWxsPVwiJHtjMn1cIi8+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIxOTJcIiB5PVwiNDJcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMjRcIiByeD1cIjZcIiBmaWxsPVwiIzFGMjkzN1wiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjE3NlwiIHk9XCIxMjZcIiB3aWR0aD1cIjQ4XCIgaGVpZ2h0PVwiNDRcIiByeD1cIjRcIiBmaWxsPVwiI0ZBRjhGNVwiLz5gO1xuICAgIGNhc2UgJ0JlYXV0eSAmIFNraW5jYXJlJzpcbiAgICBjYXNlICdTa2luY2FyZSAmIFNlcnVtcyc6XG4gICAgICByZXR1cm4gYDxyZWN0IHg9XCIxMzJcIiB5PVwiODhcIiB3aWR0aD1cIjY2XCIgaGVpZ2h0PVwiMTIyXCIgcng9XCIxNFwiIGZpbGw9XCIke2MxfVwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjE1MFwiIHk9XCI2NlwiIHdpZHRoPVwiMzBcIiBoZWlnaHQ9XCIyNFwiIHJ4PVwiNFwiIGZpbGw9XCIke2MyfVwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjE1OVwiIHk9XCI0MlwiIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIyNlwiIHJ4PVwiNlwiIGZpbGw9XCIjMUYyOTM3XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMTQyXCIgeT1cIjEyNFwiIHdpZHRoPVwiNDZcIiBoZWlnaHQ9XCI0OFwiIHJ4PVwiNlwiIGZpbGw9XCIjRkFGOEY1XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMjEyXCIgeT1cIjE0MlwiIHdpZHRoPVwiNzRcIiBoZWlnaHQ9XCI2OFwiIHJ4PVwiMTRcIiBmaWxsPVwiI0Y0NzJCNlwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjIxNlwiIHk9XCIxMjZcIiB3aWR0aD1cIjY2XCIgaGVpZ2h0PVwiMjBcIiByeD1cIjZcIiBmaWxsPVwiI0ZCQkYyNFwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjIyNlwiIHk9XCIxNjJcIiB3aWR0aD1cIjQ2XCIgaGVpZ2h0PVwiMjZcIiByeD1cIjRcIiBmaWxsPVwiI0ZGRkZGRlwiIG9wYWNpdHk9XCIwLjg4XCIvPmA7XG4gICAgY2FzZSAnQm9va3MnOlxuICAgICAgcmV0dXJuIGA8cmVjdCB4PVwiMTMwXCIgeT1cIjQ2XCIgd2lkdGg9XCIxNDBcIiBoZWlnaHQ9XCIxNzJcIiByeD1cIjhcIiBmaWxsPVwiJHtjMX1cIi8+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIxNDJcIiB5PVwiNDZcIiB3aWR0aD1cIjhcIiBoZWlnaHQ9XCIxNzJcIiBmaWxsPVwiI0ZCQkYyNFwiLz5cbiAgICAgICAgICAgICAgPHJlY3QgeD1cIjE2NlwiIHk9XCI4MlwiIHdpZHRoPVwiODBcIiBoZWlnaHQ9XCIxMFwiIHJ4PVwiNFwiIGZpbGw9XCIjZmZmZmZmXCIgb3BhY2l0eT1cIjAuODVcIi8+XG4gICAgICAgICAgICAgIDxyZWN0IHg9XCIxNjZcIiB5PVwiMTAyXCIgd2lkdGg9XCI2MFwiIGhlaWdodD1cIjhcIiByeD1cIjRcIiBmaWxsPVwiI2ZmZmZmZlwiIG9wYWNpdHk9XCIwLjU1XCIvPmA7XG4gICAgY2FzZSAnR3JvY2VyaWVzJzpcbiAgICAgIHJldHVybiBgPHBhdGggZD1cIk0xNTAgOTBoMTAwbC04IDEyMkgxNTh6XCIgcng9XCIxNlwiIGZpbGw9XCIjRkJCRjI0XCIgc3Ryb2tlPVwiJHtjMX1cIiBzdHJva2Utd2lkdGg9XCI0XCIvPlxuICAgICAgICAgICAgICA8cmVjdCB4PVwiMTYyXCIgeT1cIjY0XCIgd2lkdGg9XCI3NlwiIGhlaWdodD1cIjI2XCIgcng9XCI4XCIgZmlsbD1cIiR7YzF9XCIvPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMjAwXCIgY3k9XCIxNTBcIiByPVwiMjRcIiBmaWxsPVwiI2ZmZmZmZlwiIG9wYWNpdHk9XCIwLjY1XCIvPmA7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgPHJlY3QgeD1cIjEyOFwiIHk9XCI2NFwiIHdpZHRoPVwiMTQ0XCIgaGVpZ2h0PVwiMTM2XCIgcng9XCIyMlwiIGZpbGw9XCIke2MxfVwiLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjIwMFwiIGN5PVwiMTMyXCIgcj1cIjM4XCIgZmlsbD1cIiNmZmZmZmZcIiBvcGFjaXR5PVwiMC4yXCIvPmA7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYW4gaW5saW5lIFNWRyBkYXRhLVVSSSBwcm9kdWN0IGNhcmQgc3R1ZGlvIHJlbmRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHBhcmFtIHtzdHJpbmd9IGNhdGVnb3J5XG4gKiBAcGFyYW0ge3N0cmluZ30gW2JhZGdlXVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVByb2R1Y3RTdmcodGl0bGUsIGNhdGVnb3J5LCBiYWRnZSA9ICcnKSB7XG4gIGNvbnN0IFtjMSwgYzIsIGJnXSA9IFBBTEVUVEVTW2NhdGVnb3J5XSB8fCBbJyMwRjc2NkUnLCAnIzA4M0QzOCcsICcjRkFGOEY1J107XG4gIGNvbnN0IHNob3J0VGl0bGUgPSBlc2NYbWwoU3RyaW5nKHRpdGxlIHx8ICdQYXphcm8gQkQnKS5zbGljZSgwLCAyOCkpO1xuICBjb25zdCBjYXRMYWJlbCA9IGVzY1htbChTdHJpbmcoY2F0ZWdvcnkgfHwgJ1Byb2R1Y3QnKSk7XG4gIGNvbnN0IGJhZGdlVGV4dCA9IGVzY1htbChiYWRnZSk7XG5cbiAgY29uc3Qgc3ZnID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNDAwIDMwMFwiIHdpZHRoPVwiNDAwXCIgaGVpZ2h0PVwiMzAwXCI+XG4gICAgPGRlZnM+XG4gICAgICA8bGluZWFyR3JhZGllbnQgaWQ9XCJnMVwiIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMVwiIHkyPVwiMVwiPlxuICAgICAgICA8c3RvcCBvZmZzZXQ9XCIwJVwiIHN0b3AtY29sb3I9XCIke2MxfVwiLz5cbiAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMTAwJVwiIHN0b3AtY29sb3I9XCIke2MyfVwiLz5cbiAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gICAgPC9kZWZzPlxuICAgIDxyZWN0IHdpZHRoPVwiNDAwXCIgaGVpZ2h0PVwiMzAwXCIgZmlsbD1cIiR7Ymd9XCIvPlxuICAgIDxlbGxpcHNlIGN4PVwiMjAwXCIgY3k9XCIyMzJcIiByeD1cIjExMFwiIHJ5PVwiMTZcIiBmaWxsPVwiIzAwMDAwMFwiIG9wYWNpdHk9XCIwLjA4XCIvPlxuICAgICR7Z2V0RGV2aWNlU2lsaG91ZXR0ZShjYXRlZ29yeSwgYzEsIGMyKX1cbiAgICA8dGV4dCB4PVwiMjAwXCIgeT1cIjI2NFwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCIgZmlsbD1cIiMxRjI5MzdcIiBmb250LXNpemU9XCIxNFwiIGZvbnQtd2VpZ2h0PVwiNjAwXCIgZm9udC1mYW1pbHk9XCJQb3BwaW5zLCBzYW5zLXNlcmlmXCI+JHtzaG9ydFRpdGxlfTwvdGV4dD5cbiAgICA8dGV4dCB4PVwiMjAwXCIgeT1cIjI4NFwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCIgZmlsbD1cIiM2QjcyODBcIiBmb250LXNpemU9XCIxMVwiIGZvbnQtZmFtaWx5PVwiUG9wcGlucywgc2Fucy1zZXJpZlwiPiR7Y2F0TGFiZWx9JHtiYWRnZVRleHQgPyAnIMK3ICcgKyBiYWRnZVRleHQgOiAnJ308L3RleHQ+XG4gIDwvc3ZnPmA7XG5cbiAgcmV0dXJuICdkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD1VVEYtOCwnICsgZW5jb2RlVVJJQ29tcG9uZW50KHN2Zyk7XG59XG4iXX0=