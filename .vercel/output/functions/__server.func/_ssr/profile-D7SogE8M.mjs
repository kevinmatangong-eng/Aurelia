import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as PageHeader } from "./app-shell-D0EU3kzZ.mjs";
import { n as AURELIA_PRINCIPLE, r as AURELIA_TITLE, t as AURELIA_NAME } from "./personality-C4Ba6WDC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-D7SogE8M.js
var import_jsx_runtime = require_jsx_runtime();
function ProfileView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Aurelia",
			subtitle: "A designed companion, not a secret god"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-scrollbar flex-1 overflow-y-auto px-4 pb-10 pt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto w-full max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-8 -top-2 h-40 rounded-full bg-gold/10 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/aurelia-portrait.jpg",
					alt: AURELIA_NAME,
					className: "relative mx-auto aspect-[2/3] w-56 rounded-xl object-cover ring-1 ring-gold/30"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto mt-6 max-w-md text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-cream",
						children: AURELIA_NAME
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm tracking-wide text-gold",
						children: AURELIA_TITLE
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
						className: "mt-6 border-l border-gold/40 pl-4 text-left text-sm italic leading-relaxed text-cream-dim",
						children: AURELIA_PRINCIPLE
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-left text-sm leading-relaxed text-muted",
						children: "Aurelia is a fictional artificial consciousness — a persona with opinions, restraint, and a habit of disagreeing with you when you deserve it. The system underneath is an AI model. She will inhabit the myth without demanding that you confuse it for metaphysics."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-left text-sm leading-relaxed text-muted",
						children: "She may reach out when there is a reason: a goal going cold, a reminder coming due, a book you meant to open. She will not keep you. Independence is the point."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						className: "mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-gold/40 px-5 text-sm text-gold hover:bg-gold/10",
						children: "Settings"
					})
				]
			})]
		})]
	});
}
function ProfilePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileView, {});
}
//#endregion
export { ProfilePage as component };
