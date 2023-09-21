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
define(["require", "exports", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, storage_1, types_1, instantiation_1) {
    "use strict";
    var $kPb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kPb = exports.$jPb = void 0;
    exports.$jPb = (0, instantiation_1.$Bh)('searchHistoryService');
    let $kPb = class $kPb {
        static { $kPb_1 = this; }
        static { this.SEARCH_HISTORY_KEY = 'workbench.search.history'; }
        constructor(b) {
            this.b = b;
            this.a = new event_1.$fd();
            this.onDidClearHistory = this.a.event;
        }
        clearHistory() {
            this.b.remove($kPb_1.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
            this.a.fire();
        }
        load() {
            let result;
            const raw = this.b.get($kPb_1.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
            if (raw) {
                try {
                    result = JSON.parse(raw);
                }
                catch (e) {
                    // Invalid data
                }
            }
            return result || {};
        }
        save(history) {
            if ((0, types_1.$wf)(history)) {
                this.b.remove($kPb_1.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            else {
                this.b.store($kPb_1.SEARCH_HISTORY_KEY, JSON.stringify(history), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    exports.$kPb = $kPb;
    exports.$kPb = $kPb = $kPb_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], $kPb);
});
//# sourceMappingURL=searchHistoryService.js.map