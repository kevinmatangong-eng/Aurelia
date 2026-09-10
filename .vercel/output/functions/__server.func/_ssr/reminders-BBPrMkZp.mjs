import { o as __toESM } from "../_runtime.mjs";
import { a as cn } from "./utils-CKTu_cjh.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Plus, r as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { n as PageHeader } from "./app-shell-D0EU3kzZ.mjs";
import { S as toggleReminder, m as removeReminder, s as listReminders, v as saveReminder } from "./api-DENtK9DR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-Do6l6pDY.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-WOQGXp6f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reminders-BBPrMkZp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RemindersView() {
	const qc = useQueryClient();
	const reminders = useQuery({
		queryKey: ["reminders"],
		queryFn: () => listReminders()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [due, setDue] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => saveReminder({ data: {
			title: title.trim(),
			notes,
			dueAt: due ? new Date(due).toISOString() : null
		} }),
		onSuccess: async () => {
			setOpen(false);
			setTitle("");
			setNotes("");
			setDue("");
			await qc.invalidateQueries({ queryKey: ["reminders"] });
		}
	});
	const toggle = useMutation({
		mutationFn: (input) => toggleReminder({ data: input }),
		onSuccess: async () => qc.invalidateQueries({ queryKey: ["reminders"] })
	});
	const remove = useMutation({
		mutationFn: (id) => removeReminder({ data: { id } }),
		onSuccess: async () => qc.invalidateQueries({ queryKey: ["reminders"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Reminders",
				subtitle: "Things that should not slip",
				trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					"aria-label": "Add reminder",
					onClick: () => setOpen(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4",
				children: [(reminders.data?.length ?? 0) === 0 && !open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto max-w-sm pt-10 text-center text-sm text-muted",
					children: "Camus tonight. Derivatives before bed. A letter you meant to send. She can hold the time."
				}) : null, (reminders.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("flex items-start gap-3 rounded-xl border border-line bg-surface p-3", r.completed && "opacity-50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: r.completed,
							onChange: (e) => toggle.mutate({
								id: r.id,
								completed: e.target.checked
							}),
							className: "mt-1 size-5 accent-gold",
							"aria-label": r.completed ? "Mark incomplete" : "Mark complete"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("text-sm text-cream", r.completed && "line-through"),
									children: r.title
								}),
								r.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-sm text-muted",
									children: r.notes
								}) : null,
								r.dueAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-gold-dim",
									children: new Date(r.dueAt).toLocaleString()
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-muted hover:text-danger",
							"aria-label": "Delete reminder",
							onClick: () => remove.mutate(r.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, r.id))]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "w-full max-w-md space-y-3 rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl",
					onSubmit: (e) => {
						e.preventDefault();
						if (!title.trim()) return;
						save.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl",
								children: "New reminder"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOpen(false),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5 text-muted" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rem-title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rem-title",
							className: "mt-1",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rem-notes",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "rem-notes",
							className: "mt-1 min-h-20",
							value: notes,
							onChange: (e) => setNotes(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rem-due",
							children: "Due"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rem-due",
							type: "datetime-local",
							className: "mt-1",
							value: due,
							onChange: (e) => setDue(e.target.value)
						})] }),
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
function RemindersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RemindersView, {});
}
//#endregion
export { RemindersPage as component };
