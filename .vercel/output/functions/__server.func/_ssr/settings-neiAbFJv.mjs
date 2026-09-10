import { a as cn } from "./utils-CKTu_cjh.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as PageHeader } from "./app-shell-D0EU3kzZ.mjs";
import { C as wipeConversations, h as runProactiveCheck, r as getSettings, w as wipeMemories, y as saveSettings } from "./api-DENtK9DR.mjs";
import { n as UserButton } from "./gates-legPNADF.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-Do6l6pDY.mjs";
import { n as Label, t as Input } from "./input-WOQGXp6f.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-neiAbFJv.js
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-line bg-void-2 transition-colors", "data-[state=checked]:bg-gold data-[state=checked]:border-gold", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block size-5 translate-x-1 rounded-full bg-cream shadow-sm transition-transform", "data-[state=checked]:translate-x-6 data-[state=checked]:bg-void") })
	});
}
function SettingsView() {
	const qc = useQueryClient();
	const settings = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings()
	}).data;
	const save = useMutation({
		mutationFn: (patch) => saveSettings({ data: patch }),
		onSuccess: async (next) => {
			qc.setQueryData(["settings"], next);
		}
	});
	const patch = (partial) => {
		if (!settings) return;
		save.mutate(partial);
	};
	const consider = useMutation({
		mutationFn: () => runProactiveCheck({ data: {
			force: true,
			sessionMinutes: 5
		} }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
	const wipeM = useMutation({
		mutationFn: () => wipeMemories(),
		onSuccess: async () => qc.invalidateQueries({ queryKey: ["memories"] })
	});
	const wipeC = useMutation({
		mutationFn: () => wipeConversations(),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["conversations"] });
			await qc.invalidateQueries({ queryKey: ["messages"] });
		}
	});
	if (!settings) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, { title: "Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-6 text-sm text-muted",
			children: "Loading your preferences…"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			subtitle: "You remain in control"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim",
					children: "Account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-line bg-surface px-3 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim",
					children: "Mind"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Memory",
							hint: "She may store what you tell her, organized by category.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings.memoryEnabled,
								onCheckedChange: (v) => patch({ memoryEnabled: v })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Personality intensity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs tabular-nums text-gold",
									children: settings.personalityIntensity
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								value: settings.personalityIntensity,
								onChange: (e) => patch({ personalityIntensity: Number(e.target.value) }),
								className: "w-full accent-gold"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Reserved at the left. Literary and teasing at the right."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Model" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-cream",
								children: settings.model
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Thinking runs on the server. Keys never live in the app."
							})
						] })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim",
					children: "Proactive presence"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Let her reach out",
							hint: "Only when she judges it worthwhile.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings.proactiveEnabled,
								onCheckedChange: (v) => patch({ proactiveEnabled: v })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Notifications",
							hint: "Browser notifications when a thread begins without you.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings.notificationsEnabled,
								onCheckedChange: (v) => patch({ notificationsEnabled: v })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Notification sound",
							hint: "Reserved for devices that honor it.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings.notificationSound,
								onCheckedChange: (v) => patch({ notificationSound: v })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "freq",
							children: "How often she may consider it"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "freq",
							className: "mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm",
							value: settings.proactiveFrequency,
							onChange: (e) => patch({ proactiveFrequency: e.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "quiet",
									children: "Quiet — at most once a day"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "thoughtful",
									children: "Thoughtful — a few times, if earned"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "present",
									children: "Present — more willing, still not noisy"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "qh-s",
								children: "Quiet hours start"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "qh-s",
								type: "time",
								className: "mt-1",
								value: settings.quietHoursStart,
								onChange: (e) => patch({ quietHoursStart: e.target.value })
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "qh-e",
								children: "Quiet hours end"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "qh-e",
								type: "time",
								className: "mt-1",
								value: settings.quietHoursEnd,
								onChange: (e) => patch({ quietHoursEnd: e.target.value })
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Important during quiet hours",
							hint: "Only high-priority reasons (a due reminder you asked her to protect).",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings.allowImportantDuringQuiet,
								onCheckedChange: (v) => patch({ allowImportantDuringQuiet: v })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "goldline",
							className: "w-full",
							disabled: consider.isPending,
							onClick: () => consider.mutate(),
							children: consider.isPending ? "She is considering…" : consider.data?.contacted ? "She reached out — open Chat" : consider.data ? "She chose silence" : "Invite her attention"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "She still decides. This only asks whether there is a reason now — it is not a command to speak."
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim",
					children: "Appearance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-line bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "theme",
						children: "Theme"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "theme",
						className: "mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm",
						value: settings.theme,
						onChange: (e) => patch({ theme: e.target.value }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "void",
							children: "Void"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "dawn",
							children: "Dawn"
						})]
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-danger",
					children: "Danger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-xl border border-line bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						className: "w-full",
						onClick: () => {
							if (window.confirm("Delete every memory she holds?")) wipeM.mutate();
						},
						children: "Delete all memories"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						className: "w-full",
						onClick: () => {
							if (window.confirm("Delete every conversation?")) wipeC.mutate();
						},
						children: "Delete all conversations"
					})]
				})] })
			]
		})]
	});
}
function Row({ title, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cream",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: hint
			})]
		}), children]
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {});
}
//#endregion
export { SettingsPage as component };
