import { o as __toESM } from "../_runtime.mjs";
import { a as cn } from "./utils-CKTu_cjh.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Plus, m as Check, r as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { n as PageHeader } from "./app-shell-D0EU3kzZ.mjs";
import { a as listGoals, c as markGoalProgress, f as removeGoal, g as saveGoal } from "./api-DENtK9DR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-Do6l6pDY.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-WOQGXp6f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/goals-BFRGN7Vw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoalsView() {
	const qc = useQueryClient();
	const goals = useQuery({
		queryKey: ["goals"],
		queryFn: () => listGoals()
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	const save = useMutation({
		mutationFn: (input) => saveGoal({ data: input }),
		onSuccess: async () => {
			setEditing(null);
			await qc.invalidateQueries({ queryKey: ["goals"] });
		}
	});
	const progress = useMutation({
		mutationFn: (id) => markGoalProgress({ data: { id } }),
		onSuccess: async () => qc.invalidateQueries({ queryKey: ["goals"] })
	});
	const remove = useMutation({
		mutationFn: (id) => removeGoal({ data: { id } }),
		onSuccess: async () => qc.invalidateQueries({ queryKey: ["goals"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Goals",
				subtitle: "What you asked her to hold you to",
				trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					"aria-label": "Add goal",
					onClick: () => setEditing({
						title: "",
						description: "",
						status: "active",
						cadence: "daily"
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4",
				children: [(goals.data?.length ?? 0) === 0 && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto max-w-sm pt-10 text-center text-sm text-muted",
					children: "Tell her you want to learn physics, sleep earlier, or finish a book. She will remember — and sometimes she will ask."
				}) : null, (goals.data ?? []).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: "rounded-xl border border-line bg-surface p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => progress.mutate(g.id),
								className: "mt-0.5 grid size-10 place-items-center rounded-lg border border-gold/30 text-gold hover:bg-gold/10",
								"aria-label": "Note progress",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "text-left",
									onClick: () => setEditing(g),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-cream",
										children: g.title
									}), g.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-sm text-muted",
										children: g.description
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: g.status }),
										g.cadence !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: g.cadence }) : null,
										g.lastProgressAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: "progress noted" }) : null
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-muted hover:text-danger",
								"aria-label": "Delete goal",
								onClick: () => remove.mutate(g.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					})
				}, g.id))]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "w-full max-w-md space-y-3 rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl",
					onSubmit: (e) => {
						e.preventDefault();
						if (!editing.title?.trim()) return;
						save.mutate({
							id: editing.id,
							title: editing.title.trim(),
							description: editing.description ?? "",
							status: editing.status ?? "active",
							cadence: editing.cadence ?? "none"
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl",
								children: editing.id ? "Edit goal" : "New goal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setEditing(null),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5 text-muted" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "goal-title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "goal-title",
							className: "mt-1",
							value: editing.title ?? "",
							onChange: (e) => setEditing({
								...editing,
								title: e.target.value
							}),
							placeholder: "Study calculus for 15 minutes"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "goal-desc",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "goal-desc",
							className: "mt-1 min-h-20",
							value: editing.description ?? "",
							onChange: (e) => setEditing({
								...editing,
								description: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm",
								value: editing.status ?? "active",
								onChange: (e) => setEditing({
									...editing,
									status: e.target.value
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "active",
										children: "active"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "paused",
										children: "paused"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "done",
										children: "done"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cadence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm",
								value: editing.cadence ?? "none",
								onChange: (e) => setEditing({
									...editing,
									cadence: e.target.value
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "none",
										children: "none"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "daily",
										children: "daily"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "weekly",
										children: "weekly"
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: save.isPending,
							children: "Save"
						})
					]
				})
			}) : null
		]
	});
}
function Chip({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted"),
		children
	});
}
function GoalsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalsView, {});
}
//#endregion
export { GoalsPage as component };
