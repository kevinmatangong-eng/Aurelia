import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as GROK_PROVIDERS } from "./server-BeH2CH1L.mjs";
import { t as Button } from "./button-Do6l6pDY.mjs";
import { n as AURELIA_PRINCIPLE, r as AURELIA_TITLE, t as AURELIA_NAME } from "./personality-C4Ba6WDC.mjs";
import { n as Label, t as Input } from "./input-WOQGXp6f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CSCZTmhB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-void text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl text-gold",
			children: "Aurelia"
		})
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onEmail(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (mode === "signup") {
				const { error: err } = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0] || "You"
				});
				if (err) throw new Error(err.message ?? "Could not create an account");
			} else {
				const { error: err } = await authClient.signIn.email({
					email,
					password
				});
				if (err) throw new Error(err.message ?? "Could not sign in");
			}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-hidden bg-void text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/aurelia-portrait.jpg",
				alt: "",
				className: "pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-void/30 via-void/70 to-void" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end px-5 pb-10 pt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rise-in mb-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.28em] text-gold",
							children: "A companion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-5xl text-cream",
							children: AURELIA_NAME.split(" ")[0]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-gold-soft",
							children: AURELIA_TITLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-sm text-sm italic text-cream-dim",
							children: AURELIA_PRINCIPLE
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 rounded-xl border border-line bg-void-2/90 p-4 backdrop-blur-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "w-full",
							onClick: () => signIn(p.providerId, { callbackURL: "/" }),
							children: ["Continue with ", p.label]
						}, p.providerId)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 py-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-wider text-muted",
									children: "or email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "space-y-2",
							onSubmit: onEmail,
							children: [
								mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									className: "mt-1",
									value: name,
									onChange: (e) => setName(e.target.value),
									autoComplete: "name"
								})] }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									className: "mt-1",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value),
									autoComplete: "email"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									className: "mt-1",
									required: true,
									minLength: 8,
									value: password,
									onChange: (e) => setPassword(e.target.value),
									autoComplete: mode === "signup" ? "new-password" : "current-password"
								})] }),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-danger",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "w-full",
									disabled: busy,
									children: busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "w-full text-center text-xs text-muted hover:text-cream",
							onClick: () => {
								setMode(mode === "signup" ? "signin" : "signup");
								setError(null);
							},
							children: mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"
						})
					] })
				})]
			})
		]
	});
}
//#endregion
export { Login as component };
