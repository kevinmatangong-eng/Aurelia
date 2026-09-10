import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Plus, l as Pencil, r as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { n as PageHeader } from "./app-shell-D0EU3kzZ.mjs";
import { _ as saveMemory, o as listMemories, p as removeMemory } from "./api-DENtK9DR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-Do6l6pDY.mjs";
import { t as MEMORY_CATEGORIES } from "./types-C5FoUkPV.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-WOQGXp6f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/memory-CerN1MB8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LABELS = {
	interest: "Interests",
	goal: "Aspirations",
	preference: "Preferences",
	fact: "Facts",
	project: "Projects",
	book: "Books",
	subject: "Subjects",
	person: "People",
	date: "Dates",
	habit: "Habits",
	other: "Other"
};
function MemoryView() {
	const qc = useQueryClient();
	const memories = useQuery({
		queryKey: ["memories"],
		queryFn: () => listMemories()
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const m of memories.data ?? []) {
			const list = map.get(m.category) ?? [];
			list.push(m);
			map.set(m.category, list);
		}
		return map;
	}, [memories.data]);
	const save = useMutation({
		mutationFn: (input) => saveMemory({ data: input }),
		onSuccess: async () => {
			setEditing(null);
			await qc.invalidateQueries({ queryKey: ["memories"] });
		}
	});
	const remove = useMutation({
		mutationFn: (id) => removeMemory({ data: { id } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["memories"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Memory",
				subtitle: "Organized, not dumped into every thought",
				trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					"aria-label": "Add memory",
					onClick: () => setEditing({
						category: "fact",
						key: "",
						value: ""
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-scrollbar flex-1 overflow-y-auto px-4 py-4",
				children: [(memories.data?.length ?? 0) === 0 && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto max-w-sm pt-10 text-center text-sm text-muted",
					children: "She will keep what matters — interests, books, subjects, the people you mention — here. You can also write it yourself."
				}) : null, MEMORY_CATEGORIES.filter((c) => grouped.has(c)).map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim",
						children: LABELS[cat]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: grouped.get(cat).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-xl border border-line bg-surface p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-gold-soft",
											children: m.key
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-cream-dim",
											children: m.value
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-muted hover:text-cream",
										"aria-label": "Edit",
										onClick: () => setEditing(m),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-muted hover:text-danger",
										"aria-label": "Delete",
										onClick: () => remove.mutate(m.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})
								]
							})
						}, m.id))
					})]
				}, cat))]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
				draft: editing,
				saving: save.isPending,
				onClose: () => setEditing(null),
				onSave: (d) => {
					if (!d.key?.trim() || !d.value?.trim()) return;
					save.mutate({
						id: d.id,
						category: d.category || "other",
						key: d.key.trim(),
						value: d.value.trim()
					});
				},
				onChange: setEditing
			}) : null
		]
	});
}
function Editor({ draft, saving, onClose, onSave, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-md rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl",
			onSubmit: (e) => {
				e.preventDefault();
				onSave(draft);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: draft.id ? "Edit memory" : "New memory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5 text-muted" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mem-cat",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "mem-cat",
						value: draft.category ?? "fact",
						onChange: (e) => onChange({
							...draft,
							category: e.target.value
						}),
						className: "mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm text-cream",
						children: MEMORY_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: LABELS[c]
						}, c))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mem-key",
						children: "Key"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "mem-key",
						className: "mt-1",
						value: draft.key ?? "",
						onChange: (e) => onChange({
							...draft,
							key: e.target.value
						}),
						placeholder: "philosophy"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mem-val",
						children: "Value"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "mem-val",
						className: "mt-1 min-h-24",
						value: draft.value ?? "",
						onChange: (e) => onChange({
							...draft,
							value: e.target.value
						}),
						placeholder: "Interested in Camus, absurdism, Nietzsche"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: saving,
						children: "Save"
					})
				]
			})]
		})
	});
}
function MemoryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryView, {});
}
//#endregion
export { MemoryPage as component };
