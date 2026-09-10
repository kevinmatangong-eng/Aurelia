import { a as cn } from "./utils-CKTu_cjh.mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Sparkles, h as BookOpen, i as Target, p as Clock, u as MessageCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-D0EU3kzZ.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Chat",
		icon: MessageCircle
	},
	{
		to: "/memory",
		label: "Memory",
		icon: Sparkles
	},
	{
		to: "/goals",
		label: "Goals",
		icon: Target
	},
	{
		to: "/reminders",
		label: "Reminders",
		icon: Clock
	},
	{
		to: "/profile",
		label: "Aurelia",
		icon: BookOpen
	}
];
function AppShell({ children, unreadChat = false }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-void text-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "sticky bottom-0 z-30 border-t border-line bg-void/95 backdrop-blur-md",
			style: { paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-5 px-1 pt-1",
				children: NAV.map((item) => {
					const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide", active ? "text-gold" : "text-muted hover:text-cream-dim"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.2 : 1.7
							}), item.to === "/" && unreadChat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-1 -top-0.5 size-1.5 rounded-full bg-gold" }) : null]
						}), item.label]
					}) }, item.to);
				})
			})
		})]
	});
}
function PageHeader({ title, subtitle, trailing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-center gap-3 border-b border-line px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-medium leading-tight text-cream",
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: subtitle
			}) : null]
		}), trailing]
	});
}
//#endregion
export { PageHeader as n, AppShell as t };
