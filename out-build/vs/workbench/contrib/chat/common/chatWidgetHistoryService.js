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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento"], function (require, exports, event_1, instantiation_1, storage_1, memento_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RGb = exports.$QGb = void 0;
    exports.$QGb = (0, instantiation_1.$Bh)('IChatWidgetHistoryService');
    let $RGb = class $RGb {
        constructor(storageService) {
            this.c = new event_1.$fd();
            this.onDidClearHistory = this.c.event;
            this.a = new memento_1.$YT('interactive-session', storageService);
            this.b = this.a.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        getHistory(providerId) {
            return this.b.history?.[providerId] ?? [];
        }
        saveHistory(providerId, history) {
            if (!this.b.history) {
                this.b.history = {};
            }
            this.b.history[providerId] = history;
            this.a.saveMemento();
        }
        clearHistory() {
            this.b.history = {};
            this.a.saveMemento();
            this.c.fire();
        }
    };
    exports.$RGb = $RGb;
    exports.$RGb = $RGb = __decorate([
        __param(0, storage_1.$Vo)
    ], $RGb);
});
//# sourceMappingURL=chatWidgetHistoryService.js.map