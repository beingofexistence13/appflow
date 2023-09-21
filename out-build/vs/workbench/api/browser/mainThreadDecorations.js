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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/decorations/common/decorations", "vs/base/common/cancellation"], function (require, exports, uri_1, event_1, lifecycle_1, extHost_protocol_1, extHostCustomers_1, decorations_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hcb = void 0;
    class DecorationRequestsQueue {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.a = 0;
            this.b = new Map();
            this.c = new Map();
            //
        }
        enqueue(uri, token) {
            const id = ++this.a;
            const result = new Promise(resolve => {
                this.b.set(id, { id, uri });
                this.c.set(id, resolve);
                this.g();
            });
            const sub = token.onCancellationRequested(() => {
                this.b.delete(id);
                this.c.delete(id);
            });
            return result.finally(() => sub.dispose());
        }
        g() {
            if (typeof this.d === 'number') {
                // already queued
                return;
            }
            this.d = setTimeout(() => {
                // make request
                const requests = this.b;
                const resolver = this.c;
                this.e.$provideDecorations(this.f, [...requests.values()], cancellation_1.CancellationToken.None).then(data => {
                    for (const [id, resolve] of resolver) {
                        resolve(data[id]);
                    }
                });
                // reset
                this.b = new Map();
                this.c = new Map();
                this.d = undefined;
            }, 0);
        }
    }
    let $Hcb = class $Hcb {
        constructor(context, c) {
            this.c = c;
            this.a = new Map();
            this.b = context.getProxy(extHost_protocol_1.$2J.ExtHostDecorations);
        }
        dispose() {
            this.a.forEach(value => (0, lifecycle_1.$fc)(value));
            this.a.clear();
        }
        $registerDecorationProvider(handle, label) {
            const emitter = new event_1.$fd();
            const queue = new DecorationRequestsQueue(this.b, handle);
            const registration = this.c.registerDecorationsProvider({
                label,
                onDidChange: emitter.event,
                provideDecorations: async (uri, token) => {
                    const data = await queue.enqueue(uri, token);
                    if (!data) {
                        return undefined;
                    }
                    const [bubble, tooltip, letter, themeColor] = data;
                    return {
                        weight: 10,
                        bubble: bubble ?? false,
                        color: themeColor?.id,
                        tooltip,
                        letter
                    };
                }
            });
            this.a.set(handle, [emitter, registration]);
        }
        $onDidChange(handle, resources) {
            const provider = this.a.get(handle);
            if (provider) {
                const [emitter] = provider;
                emitter.fire(resources && resources.map(r => uri_1.URI.revive(r)));
            }
        }
        $unregisterDecorationProvider(handle) {
            const provider = this.a.get(handle);
            if (provider) {
                (0, lifecycle_1.$fc)(provider);
                this.a.delete(handle);
            }
        }
    };
    exports.$Hcb = $Hcb;
    exports.$Hcb = $Hcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadDecorations),
        __param(1, decorations_1.$Gcb)
    ], $Hcb);
});
//# sourceMappingURL=mainThreadDecorations.js.map