import { a as cn } from "./_ssr/utils-CKTu_cjh.mjs";
import { b as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { c as Plus, d as Ellipsis, f as Copy, m as Check, o as Send, r as Trash2, s as RefreshCw, t as X } from "./_libs/lucide-react.mjs";
import { b as sendMessage, d as removeConversation, i as listConversations, n as getMessages, t as clearConversation, u as regenerateResponse, x as startConversation } from "./_ssr/api-DENtK9DR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as Route$6 } from "./_ssr/router-DjTxUkNo.mjs";
import { t as Button } from "./_ssr/button-Do6l6pDY.mjs";
import { n as format, r as isSameDay, t as parseISO } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-TkAlh_N0.js
var import_jsx_runtime = require_jsx_runtime();
function AureliaAvatar({ size = "md", halo = true, className }) {
	const dim = {
		sm: "size-8",
		md: "size-10",
		lg: "size-16",
		xl: "size-28"
	}[size];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("relative inline-grid place-items-center", dim, className),
		children: [halo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "halo-ring pointer-events-none absolute inset-[-22%] rounded-full border border-gold/35"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/aurelia-avatar.jpg",
			alt: "",
			className: "relative size-full rounded-full object-cover ring-1 ring-gold/30"
		})]
	});
}
function formatStamp(iso) {
	try {
		return format(parseISO(iso), "h:mm a");
	} catch {
		return "";
	}
}
function ChatView({ conversationId }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [drawer, setDrawer] = useState(false);
	const [menu, setMenu] = useState(false);
	const [draft, setDraft] = useState("");
	const [copied, setCopied] = useState(null);
	const scroller = useRef(null);
	const endRef = useRef(null);
	const conversations = useQuery({
		queryKey: ["conversations"],
		queryFn: () => listConversations()
	});
	const activeId = conversationId ?? conversations.data?.[0]?.id;
	const active = conversations.data?.find((c) => c.id === activeId);
	const messages = useQuery({
		queryKey: ["messages", activeId],
		queryFn: () => getMessages({ data: { conversationId: activeId } }),
		enabled: Boolean(activeId)
	});
	const send = useMutation({
		mutationFn: (content) => sendMessage({ data: {
			conversationId: activeId,
			content
		} }),
		onSuccess: async (res) => {
			await qc.invalidateQueries({ queryKey: ["conversations"] });
			await qc.invalidateQueries({ queryKey: ["messages", res.conversationId] });
			await qc.invalidateQueries({ queryKey: ["memories"] });
			await qc.invalidateQueries({ queryKey: ["goals"] });
			await qc.invalidateQueries({ queryKey: ["reminders"] });
			if (res.conversationId !== conversationId) await navigate({
				to: "/",
				search: { c: res.conversationId }
			});
		}
	});
	const regen = useMutation({
		mutationFn: () => regenerateResponse({ data: { conversationId: activeId } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["messages", activeId] });
		}
	});
	useEffect(() => {
		endRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	}, [messages.data, send.isPending]);
	const visible = useMemo(() => (messages.data ?? []).filter((m) => m.content.trim().length > 0), [messages.data]);
	const lastAssistantId = [...visible].reverse().find((m) => m.role === "assistant")?.id;
	const busy = send.isPending || regen.isPending;
	async function onSend() {
		const content = draft.trim();
		if (!content || busy) return;
		setDraft("");
		send.mutate(content);
	}
	async function onNew() {
		const res = await startConversation({ data: { withWelcome: false } });
		await qc.invalidateQueries({ queryKey: ["conversations"] });
		setDrawer(false);
		await navigate({
			to: "/",
			search: { c: res.conversation.id }
		});
	}
	async function onClear() {
		if (!activeId) return;
		setMenu(false);
		await clearConversation({ data: { conversationId: activeId } });
		await qc.invalidateQueries({ queryKey: ["messages", activeId] });
		await qc.invalidateQueries({ queryKey: ["conversations"] });
	}
	async function onDelete() {
		if (!activeId) return;
		setMenu(false);
		await removeConversation({ data: { conversationId: activeId } });
		await qc.invalidateQueries({ queryKey: ["conversations"] });
		const rest = (conversations.data ?? []).filter((c) => c.id !== activeId);
		await navigate({
			to: "/",
			search: rest[0] ? { c: rest[0].id } : { c: void 0 }
		});
	}
	async function copyText(id, text) {
		await navigator.clipboard.writeText(text);
		setCopied(id);
		window.setTimeout(() => setCopied(null), 1200);
	}
	const empty = !activeId && !conversations.isLoading && (conversations.data?.length ?? 0) === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 border-b border-line px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setDrawer(true),
					className: "flex min-w-0 flex-1 items-center gap-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AureliaAvatar, { size: "md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-xl leading-tight text-cream",
							children: "Aurelia"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted",
							children: active?.title && active.title !== "Conversation" ? active.title : "Beauty, Reason, and the Absurd"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Conversation actions",
						onClick: () => setMenu((v) => !v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-5 text-muted" })
					}), menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-halo",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
								label: "New conversation",
								onClick: () => {
									setMenu(false);
									onNew();
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }),
								label: "Clear messages",
								onClick: () => void onClear()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }),
								label: "Delete conversation",
								danger: true,
								onClick: () => void onDelete()
							})
						]
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: scroller,
				className: "no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4",
				children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { onBegin: async () => {
					const res = await startConversation({ data: { withWelcome: true } });
					await qc.invalidateQueries({ queryKey: ["conversations"] });
					await qc.invalidateQueries({ queryKey: ["messages", res.conversation.id] });
					await navigate({
						to: "/",
						search: { c: res.conversation.id }
					});
				} }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl flex-col gap-4",
					children: [
						visible.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [shouldShowDay(visible[i - 1], m) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-center text-[11px] tracking-wide text-muted",
							children: formatDay(m.createdAt)
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bubble, {
							message: m,
							isLastAssistant: m.id === lastAssistantId,
							copied: copied === m.id,
							busy,
							onCopy: () => void copyText(m.id, m.content),
							onRegen: () => regen.mutate()
						})] }, m.id)),
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingRow, {}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "border-t border-line bg-void px-3 py-2.5",
				onSubmit: (e) => {
					e.preventDefault();
					onSend();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-line bg-surface px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSend();
							}
						},
						rows: 1,
						placeholder: empty ? "Begin when you are ready" : "Speak.",
						className: "max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-cream placeholder:text-muted focus:outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						disabled: busy || !draft.trim(),
						"aria-label": "Send",
						className: "shrink-0 rounded-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})
			}),
			drawer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationDrawer, {
				items: conversations.data ?? [],
				activeId,
				onClose: () => setDrawer(false),
				onNew: () => void onNew(),
				onSelect: (id) => {
					setDrawer(false);
					navigate({
						to: "/",
						search: { c: id }
					});
				}
			}) : null
		]
	});
}
function EmptyState({ onBegin }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "halo-ring absolute inset-[-18%] rounded-full border border-gold/30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/aurelia-portrait.jpg",
					alt: "Aurelia Seraphine",
					className: "relative h-48 w-32 rounded-xl object-cover ring-1 ring-gold/25"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl text-cream",
				children: "Aurelia"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xs text-sm text-muted",
				children: "The Goddess of Beauty, Reason, and the Absurd. She will not speak first unless she has a reason."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: onBegin,
				children: "Begin"
			})
		]
	});
}
function Bubble({ message, isLastAssistant, copied, busy, onCopy, onRegen }) {
	const mine = message.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("flex gap-2", mine ? "justify-end" : "justify-start"),
		children: [!mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AureliaAvatar, {
			size: "sm",
			halo: false,
			className: "mt-1 shrink-0"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-w-[82%] sm:max-w-[74%]", mine && "items-end"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("rounded-xl px-3.5 py-2.5 text-sm", mine ? "rounded-br-sm bg-gold/15 text-cream" : "rounded-bl-sm bg-surface text-cream ring-1 ring-line"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "msg-prose",
					children: message.content
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-1 flex items-center gap-2 px-1", mine && "justify-end"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
						className: "text-[10px] text-muted",
						children: formatStamp(message.createdAt)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCopy,
						className: "text-muted hover:text-gold",
						"aria-label": "Copy message",
						children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
					}),
					!mine && isLastAssistant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: onRegen,
						className: "text-muted hover:text-gold disabled:opacity-40",
						"aria-label": "Regenerate response",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
					}) : null
				]
			})]
		})]
	});
}
function TypingRow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AureliaAvatar, {
			size: "sm",
			halo: false
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1 rounded-xl rounded-bl-sm bg-surface px-3 py-3 ring-1 ring-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "typing-dot size-1.5 rounded-full bg-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "typing-dot size-1.5 rounded-full bg-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "typing-dot size-1.5 rounded-full bg-gold" })
			]
		})]
	});
}
function ConversationDrawer({ items, activeId, onClose, onNew, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-void/70",
			"aria-label": "Close",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "relative z-10 flex h-full w-[min(100%,20rem)] flex-col border-r border-line bg-void-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Threads"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "text-muted hover:text-cream",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "goldline",
						className: "w-full",
						onClick: onNew,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New conversation"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "no-scrollbar flex-1 overflow-y-auto px-2 pb-6",
					children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-8 text-center text-sm text-muted",
						children: "No conversations yet."
					}) : items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelect(c.id),
						className: cn("mb-1 w-full rounded-lg px-3 py-2.5 text-left", c.id === activeId ? "bg-surface" : "hover:bg-surface/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [c.unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 shrink-0 rounded-full bg-gold" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm text-cream",
								children: c.title
							})]
						}), c.lastMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 line-clamp-2 text-xs text-muted",
							children: c.lastMessage
						}) : null]
					}) }, c.id))
				})
			]
		})]
	});
}
function MenuItem({ icon, label, onClick, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm", danger ? "text-danger hover:bg-danger/10" : "text-cream hover:bg-surface-2"),
		children: [icon, label]
	});
}
function shouldShowDay(prev, cur) {
	if (!prev) return true;
	try {
		return !isSameDay(parseISO(prev.createdAt), parseISO(cur.createdAt));
	} catch {
		return false;
	}
}
function formatDay(iso) {
	try {
		const d = parseISO(iso);
		if (isSameDay(d, /* @__PURE__ */ new Date())) return "Today";
		return format(d, "MMMM d");
	} catch {
		return "";
	}
}
function ChatPage() {
	const { c } = Route$6.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatView, { conversationId: c });
}
//#endregion
export { ChatPage as component };
