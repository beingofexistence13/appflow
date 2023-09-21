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
    exports.NotebookRendererMessagingService = void 0;
    let NotebookRendererMessagingService = class NotebookRendererMessagingService extends lifecycle_1.Disposable {
        constructor(extensionService) {
            super();
            this.extensionService = extensionService;
            /**
             * Activation promises. Maps renderer IDs to a queue of messages that should
             * be sent once activation finishes, or undefined if activation is complete.
             */
            this.activations = new Map();
            this.scopedMessaging = new Map();
            this.postMessageEmitter = this._register(new event_1.Emitter());
            this.onShouldPostMessage = this.postMessageEmitter.event;
        }
        /** @inheritdoc */
        receiveMessage(editorId, rendererId, message) {
            if (editorId === undefined) {
                const sends = [...this.scopedMessaging.values()].map(e => e.receiveMessageHandler?.(rendererId, message));
                return Promise.all(sends).then(s => s.some(s => !!s));
            }
            return this.scopedMessaging.get(editorId)?.receiveMessageHandler?.(rendererId, message) ?? Promise.resolve(false);
        }
        /** @inheritdoc */
        prepare(rendererId) {
            if (this.activations.has(rendererId)) {
                return;
            }
            const queue = [];
            this.activations.set(rendererId, queue);
            this.extensionService.activateByEvent(`onRenderer:${rendererId}`).then(() => {
                for (const message of queue) {
                    this.postMessageEmitter.fire(message);
                }
                this.activations.set(rendererId, undefined);
            });
        }
        /** @inheritdoc */
        getScoped(editorId) {
            const existing = this.scopedMessaging.get(editorId);
            if (existing) {
                return existing;
            }
            const messaging = {
                postMessage: (rendererId, message) => this.postMessage(editorId, rendererId, message),
                dispose: () => this.scopedMessaging.delete(editorId),
            };
            this.scopedMessaging.set(editorId, messaging);
            return messaging;
        }
        postMessage(editorId, rendererId, message) {
            if (!this.activations.has(rendererId)) {
                this.prepare(rendererId);
            }
            const activation = this.activations.get(rendererId);
            const toSend = { rendererId, editorId, message };
            if (activation === undefined) {
                this.postMessageEmitter.fire(toSend);
            }
            else {
                activation.push(toSend);
            }
        }
    };
    exports.NotebookRendererMessagingService = NotebookRendererMessagingService;
    exports.NotebookRendererMessagingService = NotebookRendererMessagingService = __decorate([
        __param(0, extensions_1.IExtensionService)
    ], NotebookRendererMessagingService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tSZW5kZXJlck1lc3NhZ2luZ1NlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9zZXJ2aWNlcy9ub3RlYm9va1JlbmRlcmVyTWVzc2FnaW5nU2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsc0JBQVU7UUFXL0QsWUFDb0IsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBRjRCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFWeEU7OztlQUdHO1lBQ2MsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBd0QsQ0FBQztZQUM5RSxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFtRCxDQUFDO1lBQzdFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlCLENBQUMsQ0FBQztZQUNuRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1FBTXBFLENBQUM7UUFFRCxrQkFBa0I7UUFDWCxjQUFjLENBQUMsUUFBNEIsRUFBRSxVQUFrQixFQUFFLE9BQWdCO1lBQ3ZGLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDMUcsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENB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