import { a as cn } from "./utils-CKTu_cjh.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-WOQGXp6f.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm text-cream placeholder:text-muted", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("w-full rounded-lg border border-line bg-void-2 px-3 py-2.5 text-sm text-cream placeholder:text-muted", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("block text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
//#endregion
export { Label as n, Textarea as r, Input as t };
