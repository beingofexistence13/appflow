/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dO = exports.$cO = void 0;
    let hasDifferentOriginAncestorFlag = false;
    let sameOriginWindowChainCache = null;
    function getParentWindowIfSameOrigin(w) {
        if (!w.parent || w.parent === w) {
            return null;
        }
        // Cannot really tell if we have access to the parent window unless we try to access something in it
        try {
            const location = w.location;
            const parentLocation = w.parent.location;
            if (location.origin !== 'null' && parentLocation.origin !== 'null' && location.origin !== parentLocation.origin) {
                hasDifferentOriginAncestorFlag = true;
                return null;
            }
        }
        catch (e) {
            hasDifferentOriginAncestorFlag = true;
            return null;
        }
        return w.parent;
    }
    class $cO {
        /**
         * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
         * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
         * To distinguish if at one point the current execution environment is running inside a window with a different origin, see hasDifferentOriginAncestor()
         */
        static getSameOriginWindowChain() {
            if (!sameOriginWindowChainCache) {
                sameOriginWindowChainCache = [];
                let w = window;
                let parent;
                do {
                    parent = getParentWindowIfSameOrigin(w);
                    if (parent) {
                        sameOriginWindowChainCache.push({
                            window: w,
                            iframeElement: w.frameElement || null
                        });
                    }
                    else {
                        sameOriginWindowChainCache.push({
                            window: w,
                            iframeElement: null
                        });
                    }
                    w = parent;
                } while (w);
            }
            return sameOriginWindowChainCache.slice(0);
        }
        /**
         * Returns true if the current execution environment is chained in a list of iframes which at one point ends in a window with a different origin.
         * Returns false if the current execution environment is not running inside an iframe or if the entire chain of iframes have the same origin.
         */
        static hasDifferentOriginAncestor() {
            if (!sameOriginWindowChainCache) {
                this.getSameOriginWindowChain();
            }
            return hasDifferentOriginAncestorFlag;
        }
        /**
         * Returns the position of `childWindow` relative to `ancestorWindow`
         */
        static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
            if (!ancestorWindow || childWindow === ancestorWindow) {
                return {
                    top: 0,
                    left: 0
                };
            }
            let top = 0, left = 0;
            const windowChain = this.getSameOriginWindowChain();
            for (const windowChainEl of windowChain) {
                top += windowChainEl.window.scrollY;
                left += windowChainEl.window.scrollX;
                if (windowChainEl.window === ancestorWindow) {
                    break;
                }
                if (!windowChainEl.iframeElement) {
                    break;
                }
                const boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
                top += boundingRect.top;
                left += boundingRect.left;
            }
            return {
                top: top,
                left: left
            };
        }
    }
    exports.$cO = $cO;
    /**
     * Returns a sha-256 composed of `parentOrigin` and `salt` converted to base 32
     */
    async function $dO(parentOrigin, salt) {
        // This same code is also inlined at `src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html`
        if (!crypto.subtle) {
            throw new Error(`'crypto.subtle' is not available so webviews will not work. This is likely because the editor is not running in a secure context (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).`);
        }
        const strData = JSON.stringify({ parentOrigin, salt });
        const encoder = new TextEncoder();
        const arrData = encoder.encode(strData);
        const hash = await crypto.subtle.digest('sha-256', arrData);
        return sha256AsBase32(hash);
    }
    exports.$dO = $dO;
    function sha256AsBase32(bytes) {
        const array = Array.from(new Uint8Array(bytes));
        const hexArray = array.map(b => b.toString(16).padStart(2, '0')).join('');
        // sha256 has 256 bits, so we need at most ceil(lg(2^256-1)/lg(32)) = 52 chars to represent it in base 32
        return BigInt(`0x${hexArray}`).toString(32).padStart(52, '0');
    }
});
//# sourceMappingURL=iframe.js.map