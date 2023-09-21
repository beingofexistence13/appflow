/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log"], function (require, exports, browser_1, dom_1, async_1, lifecycle_1, layoutService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b4b = void 0;
    let $b4b = class $b4b extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = new Map(); // unsupported in web (only in-memory)
            this.h = ''; // unsupported in web (only in-memory)
            this.j = []; // unsupported in web (only in-memory)
            if (browser_1.$8N || browser_1.$9N) {
                this.g();
            }
        }
        // In Safari, it has the following note:
        //
        // "The request to write to the clipboard must be triggered during a user gesture.
        // A call to clipboard.write or clipboard.writeText outside the scope of a user
        // gesture(such as "click" or "touch" event handlers) will result in the immediate
        // rejection of the promise returned by the API call."
        // From: https://webkit.org/blog/10855/async-clipboard-api/
        //
        // Since extensions run in a web worker, and handle gestures in an asynchronous way,
        // they are not classified by Safari as "in response to a user gesture" and will reject.
        //
        // This function sets up some handlers to work around that behavior.
        g() {
            const handler = () => {
                const currentWritePromise = new async_1.$2g();
                // Cancel the previous promise since we just created a new one in response to this new event
                if (this.f && !this.f.isSettled) {
                    this.f.cancel();
                }
                this.f = currentWritePromise;
                // The ctor of ClipboardItem allows you to pass in a promise that will resolve to a string.
                // This allows us to pass in a Promise that will either be cancelled by another event or
                // resolved with the contents of the first call to this.writeText.
                // see https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem/ClipboardItem#parameters
                navigator.clipboard.write([new ClipboardItem({
                        'text/plain': currentWritePromise.p,
                    })]).catch(async (err) => {
                    if (!(err instanceof Error) || err.name !== 'NotAllowedError' || !currentWritePromise.isRejected) {
                        this.c.error(err);
                    }
                });
            };
            if (this.b.hasContainer) {
                this.B((0, dom_1.$nO)(this.b.container, 'click', handler));
                this.B((0, dom_1.$nO)(this.b.container, 'keydown', handler));
            }
        }
        async writeText(text, type) {
            // With type: only in-memory is supported
            if (type) {
                this.a.set(type, text);
                return;
            }
            if (this.f) {
                // For Safari, we complete this Promise which allows the call to `navigator.clipboard.write()`
                // above to resolve and successfully copy to the clipboard. If we let this continue, Safari
                // would throw an error because this call stack doesn't appear to originate from a user gesture.
                return this.f.complete(text);
            }
            // Guard access to navigator.clipboard with try/catch
            // as we have seen DOMExceptions in certain browsers
            // due to security policies.
            try {
                return await navigator.clipboard.writeText(text);
            }
            catch (error) {
                console.error(error);
            }
            // Fallback to textarea and execCommand solution
            const activeElement = document.activeElement;
            const textArea = document.body.appendChild((0, dom_1.$)('textarea', { 'aria-hidden': true }));
            textArea.style.height = '1px';
            textArea.style.width = '1px';
            textArea.style.position = 'absolute';
            textArea.value = text;
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            if (activeElement instanceof HTMLElement) {
                activeElement.focus();
            }
            document.body.removeChild(textArea);
            return;
        }
        async readText(type) {
            // With type: only in-memory is supported
            if (type) {
                return this.a.get(type) || '';
            }
            // Guard access to navigator.clipboard with try/catch
            // as we have seen DOMExceptions in certain browsers
            // due to security policies.
            try {
                return await navigator.clipboard.readText();
            }
            catch (error) {
                console.error(error);
                return '';
            }
        }
        async readFindText() {
            return this.h;
        }
        async writeFindText(text) {
            this.h = text;
        }
        async writeResources(resources) {
            this.j = resources;
        }
        async readResources() {
            return this.j;
        }
        async hasResources() {
            return this.j.length > 0;
        }
    };
    exports.$b4b = $b4b;
    exports.$b4b = $b4b = __decorate([
        __param(0, layoutService_1.$XT),
        __param(1, log_1.$5i)
    ], $b4b);
});
//# sourceMappingURL=clipboardService.js.map