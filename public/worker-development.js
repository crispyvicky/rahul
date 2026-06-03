/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.js":
/*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/**\r\n * Harden document fallback — serve /offline instead of Response.error()\r\n * when network + cache both fail (common after phone calls / flaky mobile data).\r\n */ const DOCUMENT_FALLBACK = \"/offline\";\nconst nativeFallback = self.fallback;\nself.fallback = async (payload)=>{\n    if (nativeFallback) {\n        try {\n            const response = await nativeFallback(payload);\n            if (response && response.type !== \"error\") return response;\n        } catch  {\n        /* fall through */ }\n    }\n    const { destination } = payload;\n    if (destination === \"document\" || destination === \"\") {\n        const cached = await caches.match(DOCUMENT_FALLBACK, {\n            ignoreSearch: true\n        });\n        if (cached) return cached;\n        try {\n            const network = await fetch(DOCUMENT_FALLBACK, {\n                cache: \"no-store\"\n            });\n            if (network.ok) return network;\n        } catch  {\n        /* fall through */ }\n    }\n    return Response.error();\n};\nself.addEventListener(\"push\", (event)=>{\n    let data = {};\n    try {\n        data = event.data ? event.data.json() : {};\n    } catch  {\n        data = {};\n    }\n    const title = data.title || \"RahulFitzz update\";\n    const options = {\n        body: data.body || \"Open app for latest updates.\",\n        icon: data.icon || \"/icon.png\",\n        badge: data.badge || \"/icon.png\",\n        tag: data.tag || \"rf-campaign\",\n        data: {\n            url: data.url || \"/dashboard\"\n        }\n    };\n    event.waitUntil((async ()=>{\n        await self.registration.showNotification(title, options);\n        if (data.campaignId && data.userId) {\n            try {\n                await fetch(\"/api/notifications/campaigns/seen\", {\n                    method: \"POST\",\n                    headers: {\n                        \"Content-Type\": \"application/json\"\n                    },\n                    body: JSON.stringify({\n                        userId: data.userId,\n                        campaignId: data.campaignId\n                    }),\n                    credentials: \"include\"\n                });\n            } catch  {\n            /* non-blocking */ }\n        }\n    })());\n});\nself.addEventListener(\"notificationclick\", (event)=>{\n    event.notification.close();\n    const targetUrl = event.notification?.data?.url || \"/dashboard\";\n    event.waitUntil(self.clients.matchAll({\n        type: \"window\",\n        includeUncontrolled: true\n    }).then((clientsArr)=>{\n        for (const client of clientsArr){\n            if (\"focus\" in client && client.url.includes(targetUrl)) {\n                return client.focus();\n            }\n        }\n        if (self.clients.openWindow) {\n            return self.clients.openWindow(targetUrl);\n        }\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = __webpack_module__.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = __webpack_module__.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, __webpack_module__.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                __webpack_module__.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        __webpack_module__.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    __webpack_module__.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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XFxVc2Vyc1xcYW5rYW1cXE9uZURyaXZlXFxEZXNrdG9wXFxGYW5cXGd5bV9pbmZsdWVuY2VyXFx3b3JrZXJcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBIYXJkZW4gZG9jdW1lbnQgZmFsbGJhY2sg4oCUIHNlcnZlIC9vZmZsaW5lIGluc3RlYWQgb2YgUmVzcG9uc2UuZXJyb3IoKVxyXG4gKiB3aGVuIG5ldHdvcmsgKyBjYWNoZSBib3RoIGZhaWwgKGNvbW1vbiBhZnRlciBwaG9uZSBjYWxscyAvIGZsYWt5IG1vYmlsZSBkYXRhKS5cclxuICovXHJcbmNvbnN0IERPQ1VNRU5UX0ZBTExCQUNLID0gXCIvb2ZmbGluZVwiO1xyXG5jb25zdCBuYXRpdmVGYWxsYmFjayA9IHNlbGYuZmFsbGJhY2s7XHJcblxyXG5zZWxmLmZhbGxiYWNrID0gYXN5bmMgKHBheWxvYWQpID0+IHtcclxuICBpZiAobmF0aXZlRmFsbGJhY2spIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbmF0aXZlRmFsbGJhY2socGF5bG9hZCk7XHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50eXBlICE9PSBcImVycm9yXCIpIHJldHVybiByZXNwb25zZTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBmYWxsIHRocm91Z2ggKi9cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHsgZGVzdGluYXRpb24gfSA9IHBheWxvYWQ7XHJcbiAgaWYgKGRlc3RpbmF0aW9uID09PSBcImRvY3VtZW50XCIgfHwgZGVzdGluYXRpb24gPT09IFwiXCIpIHtcclxuICAgIGNvbnN0IGNhY2hlZCA9IGF3YWl0IGNhY2hlcy5tYXRjaChET0NVTUVOVF9GQUxMQkFDSywgeyBpZ25vcmVTZWFyY2g6IHRydWUgfSk7XHJcbiAgICBpZiAoY2FjaGVkKSByZXR1cm4gY2FjaGVkO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbmV0d29yayA9IGF3YWl0IGZldGNoKERPQ1VNRU5UX0ZBTExCQUNLLCB7IGNhY2hlOiBcIm5vLXN0b3JlXCIgfSk7XHJcbiAgICAgIGlmIChuZXR3b3JrLm9rKSByZXR1cm4gbmV0d29yaztcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvKiBmYWxsIHRocm91Z2ggKi9cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBSZXNwb25zZS5lcnJvcigpO1xyXG59O1xyXG5cclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwicHVzaFwiLCAoZXZlbnQpID0+IHtcclxuICBsZXQgZGF0YSA9IHt9O1xyXG4gIHRyeSB7XHJcbiAgICBkYXRhID0gZXZlbnQuZGF0YSA/IGV2ZW50LmRhdGEuanNvbigpIDoge307XHJcbiAgfSBjYXRjaCB7XHJcbiAgICBkYXRhID0ge307XHJcbiAgfVxyXG5cclxuICBjb25zdCB0aXRsZSA9IGRhdGEudGl0bGUgfHwgXCJSYWh1bEZpdHp6IHVwZGF0ZVwiO1xyXG4gIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICBib2R5OiBkYXRhLmJvZHkgfHwgXCJPcGVuIGFwcCBmb3IgbGF0ZXN0IHVwZGF0ZXMuXCIsXHJcbiAgICBpY29uOiBkYXRhLmljb24gfHwgXCIvaWNvbi5wbmdcIixcclxuICAgIGJhZGdlOiBkYXRhLmJhZGdlIHx8IFwiL2ljb24ucG5nXCIsXHJcbiAgICB0YWc6IGRhdGEudGFnIHx8IFwicmYtY2FtcGFpZ25cIixcclxuICAgIGRhdGE6IHtcclxuICAgICAgdXJsOiBkYXRhLnVybCB8fCBcIi9kYXNoYm9hcmRcIixcclxuICAgIH0sXHJcbiAgfTtcclxuXHJcbiAgZXZlbnQud2FpdFVudGlsKFxyXG4gICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgYXdhaXQgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbih0aXRsZSwgb3B0aW9ucyk7XHJcbiAgICAgIGlmIChkYXRhLmNhbXBhaWduSWQgJiYgZGF0YS51c2VySWQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgZmV0Y2goXCIvYXBpL25vdGlmaWNhdGlvbnMvY2FtcGFpZ25zL3NlZW5cIiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICB1c2VySWQ6IGRhdGEudXNlcklkLFxyXG4gICAgICAgICAgICAgIGNhbXBhaWduSWQ6IGRhdGEuY2FtcGFpZ25JZCxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgLyogbm9uLWJsb2NraW5nICovXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KSgpXHJcbiAgKTtcclxufSk7XHJcblxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJub3RpZmljYXRpb25jbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcclxuICBjb25zdCB0YXJnZXRVcmwgPSBldmVudC5ub3RpZmljYXRpb24/LmRhdGE/LnVybCB8fCBcIi9kYXNoYm9hcmRcIjtcclxuXHJcbiAgZXZlbnQud2FpdFVudGlsKFxyXG4gICAgc2VsZi5jbGllbnRzXHJcbiAgICAgIC5tYXRjaEFsbCh7IHR5cGU6IFwid2luZG93XCIsIGluY2x1ZGVVbmNvbnRyb2xsZWQ6IHRydWUgfSlcclxuICAgICAgLnRoZW4oKGNsaWVudHNBcnIpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IGNsaWVudCBvZiBjbGllbnRzQXJyKSB7XHJcbiAgICAgICAgICBpZiAoXCJmb2N1c1wiIGluIGNsaWVudCAmJiBjbGllbnQudXJsLmluY2x1ZGVzKHRhcmdldFVybCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2VsZi5jbGllbnRzLm9wZW5XaW5kb3cpIHtcclxuICAgICAgICAgIHJldHVybiBzZWxmLmNsaWVudHMub3BlbldpbmRvdyh0YXJnZXRVcmwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICApO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbIkRPQ1VNRU5UX0ZBTExCQUNLIiwibmF0aXZlRmFsbGJhY2siLCJzZWxmIiwiZmFsbGJhY2siLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJ0eXBlIiwiZGVzdGluYXRpb24iLCJjYWNoZWQiLCJjYWNoZXMiLCJtYXRjaCIsImlnbm9yZVNlYXJjaCIsIm5ldHdvcmsiLCJmZXRjaCIsImNhY2hlIiwib2siLCJSZXNwb25zZSIsImVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZGF0YSIsImpzb24iLCJ0aXRsZSIsIm9wdGlvbnMiLCJib2R5IiwiaWNvbiIsImJhZGdlIiwidGFnIiwidXJsIiwid2FpdFVudGlsIiwicmVnaXN0cmF0aW9uIiwic2hvd05vdGlmaWNhdGlvbiIsImNhbXBhaWduSWQiLCJ1c2VySWQiLCJtZXRob2QiLCJoZWFkZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsImNyZWRlbnRpYWxzIiwibm90aWZpY2F0aW9uIiwiY2xvc2UiLCJ0YXJnZXRVcmwiLCJjbGllbnRzIiwibWF0Y2hBbGwiLCJpbmNsdWRlVW5jb250cm9sbGVkIiwidGhlbiIsImNsaWVudHNBcnIiLCJjbGllbnQiLCJpbmNsdWRlcyIsImZvY3VzIiwib3BlbldpbmRvdyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./worker/index.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.js");
/******/ 	
/******/ })()
;