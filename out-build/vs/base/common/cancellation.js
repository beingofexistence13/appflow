/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pd = exports.CancellationToken = void 0;
    const shortcutEvent = Object.freeze(function (callback, context) {
        const handle = setTimeout(callback.bind(context), 0);
        return { dispose() { clearTimeout(handle); } };
    });
    var CancellationToken;
    (function (CancellationToken) {
        function isCancellationToken(thing) {
            if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
                return true;
            }
            if (thing instanceof MutableToken) {
                return true;
            }
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            return typeof thing.isCancellationRequested === 'boolean'
                && typeof thing.onCancellationRequested === 'function';
        }
        CancellationToken.isCancellationToken = isCancellationToken;
        CancellationToken.None = Object.freeze({
            isCancellationRequested: false,
            onCancellationRequested: event_1.Event.None
        });
        CancellationToken.Cancelled = Object.freeze({
            isCancellationRequested: true,
            onCancellationRequested: shortcutEvent
        });
    })(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
    class MutableToken {
        constructor() {
            this.a = false;
            this.b = null;
        }
        cancel() {
            if (!this.a) {
                this.a = true;
                if (this.b) {
                    this.b.fire(undefined);
                    this.dispose();
                }
            }
        }
        get isCancellationRequested() {
            return this.a;
        }
        get onCancellationRequested() {
            if (this.a) {
                return shortcutEvent;
            }
            if (!this.b) {
                this.b = new event_1.$fd();
            }
            return this.b.event;
        }
        dispose() {
            if (this.b) {
                this.b.dispose();
                this.b = null;
            }
        }
    }
    class $pd {
        constructor(parent) {
            this.f = undefined;
            this.g = undefined;
            this.g = parent && parent.onCancellationRequested(this.cancel, this);
        }
        get token() {
            if (!this.f) {
                // be lazy and create the token only when
                // actually needed
                this.f = new MutableToken();
            }
            return this.f;
        }
        cancel() {
            if (!this.f) {
                // save an object by returning the default
                // cancelled token when cancellation happens
                // before someone asks for the token
                this.f = CancellationToken.Cancelled;
            }
            else if (this.f instanceof MutableToken) {
                // actually cancel
                this.f.cancel();
            }
        }
        dispose(cancel = false) {
            if (cancel) {
                this.cancel();
            }
            this.g?.dispose();
            if (!this.f) {
                // ensure to initialize with an empty token if we had none
                this.f = CancellationToken.None;
            }
            else if (this.f instanceof MutableToken) {
                // actually dispose
                this.f.dispose();
            }
        }
    }
    exports.$pd = $pd;
});
//# sourceMappingURL=cancellation.js.map