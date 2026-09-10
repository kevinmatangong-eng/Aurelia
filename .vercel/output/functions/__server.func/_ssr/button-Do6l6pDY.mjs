import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as cn } from "./utils-CKTu_cjh.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-Do6l6pDY.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50", {
	variants: {
		variant: {
			primary: "bg-gold text-void hover:opacity-90",
			ghost: "bg-transparent text-cream hover:bg-surface-2",
			outline: "border border-line bg-transparent text-cream hover:border-gold/50 hover:text-gold-soft",
			danger: "bg-danger/15 text-danger hover:bg-danger/25",
			goldline: "border border-gold/40 text-gold hover:bg-gold/10"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-md",
			md: "h-11 px-4 text-sm rounded-lg",
			lg: "h-12 px-5 text-base rounded-lg",
			icon: "size-11 rounded-lg",
			pill: "h-10 px-4 text-sm rounded-full"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
