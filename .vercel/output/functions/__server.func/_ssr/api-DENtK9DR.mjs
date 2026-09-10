import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CbvwpY72.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DENtK9DR.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3c42619e7f61b24127e39d331b8cd15d4a59380d0c57c9cce863d058bff9abef"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((patch) => patch).handler(createSsrRpc("9b8018cd75a01b1b58b3e4ee70e62dfa43babbd47fe306e5f29ab788bd176e08"));
var pingActivity = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("689d27954c269ef84427d335399da3d0695f1254539db8318bfa7625e462348f"));
var listConversations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fbbf6d1b06252e436a7c426dce6d51d6de63d7befe51dd426722ddc560bbb94d"));
var getMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9066a366fe799aa9736d6fb8aff088fd09bc77a426254b750b8c1e3820a17c8d"));
var startConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input = {}) => input).handler(createSsrRpc("b18c93fb2ad95d8a05e91eee82887840dbc42b7b604ed55e1249885062933683"));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d48ec2cbf40447f47d4af53e2f10c32f263978fd097a0bed8eac5fa911f40c5c"));
var regenerateResponse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("478760265483ffd1fdcdc55a2288c244024221c0e1ea2761eec2be8f7c7fad76"));
var removeConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("31e2f18bc4a48f39a15fd396a04ea4ae0c621ab70b3efd64acbc8fa45172e566"));
var clearConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("5fc43eb797cca8b0b63ebad3688968aff487130ddca751b0f67ad66f56d6a6f6"));
var wipeConversations = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("86e20693e45d95d28d2db7df5b4f5a0b2ba699eb748431f5fcb701956a4eace9"));
var listMemories = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("67be160eecac7cd75e9cb0cd140526a8527e84c85007cd5964cc03edbc22bde2"));
var saveMemory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2281a176eae8daacf1f98371944f7df9948dcde459c14aa887a7d71fc15ef533"));
var removeMemory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a3f3fd54e60a10b171b9625c0cfc3cc8597b3b2790d64bacc4fc9135e7187021"));
var wipeMemories = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("02bce1f0dc552be1e3d1e137d2fabd71c30596e03cec19de9ae1edd93c188da2"));
var listGoals = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7b636e07928324f71382dacbda600e927e46276fcf07a2d6fb4ad9c487090321"));
var saveGoal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("30ec1dee937277db4c7fa02d5ad863892a44f0d28bab99c0382913855d4d2b5c"));
var markGoalProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2e5964a18abd521ad56f72bbbfd262bfaeac7c53810e7b896bc1f97bc952514e"));
var removeGoal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7c3da342ca22003569e97092de7313c6a8e25cce303639c7011b67e25550bc54"));
var listReminders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("cea90bb622ebc5434ff4af5e1151bd9f1c6ef4057d5a1b0615d5d145d3d06b5e"));
var saveReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7e3cbf2c2b384bffe707cfcb7200ff8f320f86bb9583a004c2589aec1f72ce7c"));
var toggleReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("e53c4aa819de0623a3febdcf560da84eede567c6873fe2780f280ea289a8a69b"));
var removeReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("20f5f4d195cdbae75d31888347c3622e7107260f7cd9200079ee19b0542baf6a"));
var runProactiveCheck = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input = {}) => input).handler(createSsrRpc("a6131e57ff3f1922a81d4cbb48adbb6db8827ee6a247a224579122b1ba33b3dc"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("0e8285d74f6dad58d997b4627c5cc2d5820e13bd57aee026b8c080ec67eba390"));
//#endregion
export { wipeConversations as C, toggleReminder as S, saveMemory as _, listGoals as a, sendMessage as b, markGoalProgress as c, removeConversation as d, removeGoal as f, saveGoal as g, runProactiveCheck as h, listConversations as i, pingActivity as l, removeReminder as m, getMessages as n, listMemories as o, removeMemory as p, getSettings as r, listReminders as s, clearConversation as t, regenerateResponse as u, saveReminder as v, wipeMemories as w, startConversation as x, saveSettings as y };
