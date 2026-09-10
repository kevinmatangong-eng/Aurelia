import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, m as Outlet } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { t as AppShell } from "./_ssr/app-shell-D0EU3kzZ.mjs";
import { h as runProactiveCheck, i as listConversations, l as pingActivity, r as getSettings } from "./_ssr/api-DENtK9DR.mjs";
import { n as useCurrentUserState } from "./_ssr/use-current-user-DG6UNzh9.mjs";
import { t as RedirectToSignIn } from "./_ssr/gates-legPNADF.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BRpSN08C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SESSION_KEY = "aurelia.sessionStart";
function sessionMinutes() {
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		const start = raw ? Number(raw) : Date.now();
		if (!raw) sessionStorage.setItem(SESSION_KEY, String(start));
		return Math.max(0, Math.round((Date.now() - start) / 6e4));
	} catch {
		return 0;
	}
}
function ProactiveListener() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const lastEval = (0, import_react.useRef)(0);
	const hiddenAt = (0, import_react.useRef)(null);
	const settings = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings(),
		staleTime: 2e4
	});
	(0, import_react.useEffect)(() => {
		try {
			if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, String(Date.now()));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		pingActivity({ data: { timezone: tz } }).then(() => {
			qc.invalidateQueries({ queryKey: ["settings"] });
		});
		const ping = window.setInterval(() => {
			pingActivity({ data: { timezone: tz } });
		}, 12e4);
		return () => window.clearInterval(ping);
	}, [qc]);
	(0, import_react.useEffect)(() => {
		if (!settings.data?.notificationsEnabled) return;
		if (typeof Notification === "undefined") return;
		if (Notification.permission === "default") Notification.requestPermission();
	}, [settings.data?.notificationsEnabled]);
	(0, import_react.useEffect)(() => {
		if (!settings.data?.proactiveEnabled) return;
		const maybeEvaluate = async (forceGapMs) => {
			const now = Date.now();
			if (now - lastEval.current < forceGapMs) return;
			lastEval.current = now;
			try {
				const result = await runProactiveCheck({ data: { sessionMinutes: sessionMinutes() } });
				if (!result.contacted || !result.event) return;
				await qc.invalidateQueries({ queryKey: ["conversations"] });
				const title = result.event.notificationTitle || "Aurelia";
				const body = result.event.message;
				if (settings.data?.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
					const n = new Notification(title, {
						body,
						icon: "/aurelia-avatar.jpg",
						tag: "aurelia-proactive"
					});
					n.onclick = () => {
						window.focus();
						if (result.conversationId) navigate({
							to: "/",
							search: { c: result.conversationId }
						});
						n.close();
					};
				}
				if (result.conversationId && document.visibilityState === "visible") {}
			} catch {}
		};
		const onVis = () => {
			if (document.visibilityState === "hidden") {
				hiddenAt.current = Date.now();
				return;
			}
			const away = hiddenAt.current ? Date.now() - hiddenAt.current : 0;
			hiddenAt.current = null;
			if (away > 6e5) maybeEvaluate(48e4);
		};
		document.addEventListener("visibilitychange", onVis);
		const interval = window.setInterval(() => {
			if (document.visibilityState === "visible") maybeEvaluate(72e4);
		}, 72e4);
		const boot = window.setTimeout(() => {
			maybeEvaluate(12e5);
		}, 25e3);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			window.clearInterval(interval);
			window.clearTimeout(boot);
		};
	}, [
		navigate,
		qc,
		settings.data?.proactiveEnabled,
		settings.data?.notificationsEnabled
	]);
	return null;
}
function ThemeSync() {
	const settings = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings(),
		staleTime: 3e4
	});
	(0, import_react.useEffect)(() => {
		const theme = settings.data?.theme === "dawn" ? "dawn" : "void";
		document.documentElement.dataset.theme = theme;
	}, [settings.data?.theme]);
	return null;
}
function AppLayout() {
	const { user, isPending } = useCurrentUserState();
	const conversations = useQuery({
		queryKey: ["conversations"],
		queryFn: () => listConversations(),
		enabled: Boolean(user)
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-void text-cream",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto mb-4 size-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "halo-ring absolute inset-[-20%] rounded-full border border-gold/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/aurelia-avatar.jpg",
					alt: "",
					className: "size-16 rounded-full object-cover"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-gold",
				children: "Aurelia"
			})]
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const unread = (conversations.data ?? []).some((c) => c.unread);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSync, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProactiveListener, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
			unreadChat: unread,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})
	] });
}
//#endregion
export { AppLayout as component };
