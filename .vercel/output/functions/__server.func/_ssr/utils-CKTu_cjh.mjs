import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CKTu_cjh.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function nid() {
	return crypto.randomUUID();
}
function asIso(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return String(value);
}
function asIsoRequired(value) {
	return asIso(value) ?? (/* @__PURE__ */ new Date()).toISOString();
}
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function asNumber(value, fallback = 0) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const n = Number(value);
		if (Number.isFinite(n)) return n;
	}
	return fallback;
}
function truncate(text, max = 80) {
	const t = text.replace(/\s+/g, " ").trim();
	if (t.length <= max) return t;
	return `${t.slice(0, max - 1).trimEnd()}…`;
}
//#endregion
export { cn as a, asNumber as i, asIso as n, nid as o, asIsoRequired as r, truncate as s, asBool as t };
