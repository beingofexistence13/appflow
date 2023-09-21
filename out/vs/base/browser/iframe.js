/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parentOriginHash = exports.IframeUtils = void 0;
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
    class IframeUtils {
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
    exports.IframeUtils = IframeUtils;
    /**
     * Returns a sha-256 composed of `parentOrigin` and `salt` converted to base 32
     */
    async function parentOriginHash(parentOrigin, salt) {
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
    exports.parentOriginHash = parentOriginHash;
    function sha256AsBase32(bytes) {
        const array = Array.from(new Uint8Array(bytes));
        const hexArray = array.map(b => b.toString(16).padStart(2, '0')).join('');
        // sha256 has 256 bits, so we need at most ceil(lg(2^256-1)/lg(32)) = 52 chars to represent it in base 32
        return BigInt(`0x${hexArray}`).toString(32).padStart(52, '0');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2lmcmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLElBQUksOEJBQThCLEdBQVksS0FBSyxDQUFDO0lBQ3BELElBQUksMEJBQTBCLEdBQWlDLElBQUksQ0FBQztJQUVwRSxTQUFTLDJCQUEyQixDQUFDLENBQVM7UUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELG9HQUFvRztRQUNwRyxJQUFJO1lBQ0gsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM1QixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUN6QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssY0FBYyxDQUFDLE1BQU0sRUFBRTtnQkFDaEgsOEJBQThCLEdBQUcsSUFBSSxDQUFDO2dCQUN0QyxPQUFPLElBQUksQ0FBQzthQUNaO1NBQ0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLDhCQUE4QixHQUFHLElBQUksQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFhLFdBQVc7UUFFdkI7Ozs7V0FJRztRQUNJLE1BQU0sQ0FBQyx3QkFBd0I7WUFDckMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNoQywwQkFBMEIsR0FBRyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxHQUFrQixNQUFNLENBQUM7Z0JBQzlCLElBQUksTUFBcUIsQ0FBQztnQkFDMUIsR0FBRztvQkFDRixNQUFNLEdBQUcsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLElBQUksTUFBTSxFQUFFO3dCQUNYLDBCQUEwQixDQUFDLElBQUksQ0FBQzs0QkFDL0IsTUFBTSxFQUFFLENBQUM7NEJBQ1QsYUFBYSxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksSUFBSTt5QkFDckMsQ0FBQyxDQUFDO3FCQUNIO3lCQUFNO3dCQUNOLDBCQUEwQixDQUFDLElBQUksQ0FBQzs0QkFDL0IsTUFBTSxFQUFFLENBQUM7NEJBQ1QsYUFBYSxFQUFFLElBQUk7eUJBQ25CLENBQUMsQ0FBQztxQkFDSDtvQkFDRCxDQUFDLEdBQUcsTUFBTSxDQUFDO2lCQUNYLFFBQVEsQ0FBQyxFQUFFO2FBQ1o7WUFDRCxPQUFPLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLDBCQUEwQjtZQUN2QyxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ2hDO1lBQ0QsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsZ0RBQWdELENBQUMsV0FBbUIsRUFBRSxjQUE2QjtZQUVoSCxJQUFJLENBQUMsY0FBYyxJQUFJLFdBQVcsS0FBSyxjQUFjLEVBQUU7Z0JBQ3RELE9BQU87b0JBQ04sR0FBRyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLENBQUM7aUJBQ1AsQ0FBQzthQUNGO1lBRUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7WUFFdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFFcEQsS0FBSyxNQUFNLGFBQWEsSUFBSSxXQUFXLEVBQUU7Z0JBRXhDLEdBQUcsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDcEMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUVyQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssY0FBYyxFQUFFO29CQUM1QyxNQUFNO2lCQUNOO2dCQUVELElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFO29CQUNqQyxNQUFNO2lCQUNOO2dCQUVELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDekUsR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUM7Z0JBQ3hCLElBQUksSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDO2FBQzFCO1lBRUQsT0FBTztnQkFDTixHQUFHLEVBQUUsR0FBRztnQkFDUixJQUFJLEVBQUUsSUFBSTthQUNWLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFqRkQsa0NBaUZDO0lBRUQ7O09BRUc7SUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsWUFBb0IsRUFBRSxJQUFZO1FBQ3hFLG9IQUFvSDtRQUNwSCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLDJNQUEyTSxDQUFDLENBQUM7U0FDN047UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVELE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFYRCw0Q0FXQztJQUVELFNBQVMsY0FBYyxDQUFDLEtBQWtCO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLHlHQUF5RztRQUN6RyxPQUFPLE1BQU0sQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0QsQ0FBQyJ9