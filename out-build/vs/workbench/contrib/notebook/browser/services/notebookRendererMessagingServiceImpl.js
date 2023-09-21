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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extensions"], function (require, exports, event_1, lifecycle_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Eb = void 0;
    let $9Eb = class $9Eb extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            /**
             * Activation promises. Maps renderer IDs to a queue of messages that should
             * be sent once activation finishes, or undefined if activation is complete.
             */
            this.a = new Map();
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.onShouldPostMessage = this.c.event;
        }
        /** @inheritdoc */
        receiveMessage(editorId, rendererId, message) {
            if (editorId === undefined) {
                const sends = [...this.b.values()].map(e => e.receiveMessageHandler?.(rendererId, message));
                return Promise.all(sends).then(s => s.some(s => !!s));
            }
            return this.b.get(editorId)?.receiveMessageHandler?.(rendererId, message) ?? Promise.resolve(false);
        }
        /** @inheritdoc */
        prepare(rendererId) {
            if (this.a.has(rendererId)) {
                return;
            }
            const queue = [];
            this.a.set(rendererId, queue);
            this.f.activateByEvent(`onRenderer:${rendererId}`).then(() => {
                for (const message of queue) {
                    this.c.fire(message);
                }
                this.a.set(rendererId, undefined);
            });
        }
        /** @inheritdoc */
        getScoped(editorId) {
            const existing = this.b.get(editorId);
            if (existing) {
                return existing;
            }
            const messaging = {
                postMessage: (rendererId, message) => this.g(editorId, rendererId, message),
                dispose: () => this.b.delete(editorId),
            };
            this.b.set(editorId, messaging);
            return messaging;
        }
        g(editorId, rendererId, message) {
            if (!this.a.has(rendererId)) {
                this.prepare(rendererId);
            }
            const activation = this.a.get(rendererId);
            const toSend = { rendererId, editorId, message };
            if (activation === undefined) {
                this.c.fire(toSend);
            }
            else {
                activation.push(toSend);
            }
        }
    };
    exports.$9Eb = $9Eb;
    exports.$9Eb = $9Eb = __decorate([
        __param(0, extensions_1.$MF)
    ], $9Eb);
});
//# sourceMappingURL=notebookRendererMessagingServiceImpl.js.map