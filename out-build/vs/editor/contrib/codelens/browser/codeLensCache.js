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
define(["require", "exports", "vs/base/common/async", "vs/base/common/functional", "vs/base/common/map", "vs/editor/common/core/range", "vs/editor/contrib/codelens/browser/codelens", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage"], function (require, exports, async_1, functional_1, map_1, range_1, codelens_1, extensions_1, instantiation_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$22 = exports.$12 = void 0;
    exports.$12 = (0, instantiation_1.$Bh)('ICodeLensCache');
    class CacheItem {
        constructor(lineCount, data) {
            this.lineCount = lineCount;
            this.data = data;
        }
    }
    let $22 = class $22 {
        constructor(storageService) {
            this.a = new class {
                provideCodeLenses() {
                    throw new Error('not supported');
                }
            };
            this.b = new map_1.$Ci(20, 0.75);
            // remove old data
            const oldkey = 'codelens/cache';
            (0, async_1.$Wg)(() => storageService.remove(oldkey, 1 /* StorageScope.WORKSPACE */));
            // restore lens data on start
            const key = 'codelens/cache2';
            const raw = storageService.get(key, 1 /* StorageScope.WORKSPACE */, '{}');
            this.f(raw);
            // store lens data on shutdown
            (0, functional_1.$bb)(storageService.onWillSaveState)(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    storageService.store(key, this.c(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
        put(model, data) {
            // create a copy of the model that is without command-ids
            // but with comand-labels
            const copyItems = data.lenses.map(item => {
                return {
                    range: item.symbol.range,
                    command: item.symbol.command && { id: '', title: item.symbol.command?.title },
                };
            });
            const copyModel = new codelens_1.$Y2();
            copyModel.add({ lenses: copyItems, dispose: () => { } }, this.a);
            const item = new CacheItem(model.getLineCount(), copyModel);
            this.b.set(model.uri.toString(), item);
        }
        get(model) {
            const item = this.b.get(model.uri.toString());
            return item && item.lineCount === model.getLineCount() ? item.data : undefined;
        }
        delete(model) {
            this.b.delete(model.uri.toString());
        }
        // --- persistence
        c() {
            const data = Object.create(null);
            for (const [key, value] of this.b) {
                const lines = new Set();
                for (const d of value.data.lenses) {
                    lines.add(d.symbol.range.startLineNumber);
                }
                data[key] = {
                    lineCount: value.lineCount,
                    lines: [...lines.values()]
                };
            }
            return JSON.stringify(data);
        }
        f(raw) {
            try {
                const data = JSON.parse(raw);
                for (const key in data) {
                    const element = data[key];
                    const lenses = [];
                    for (const line of element.lines) {
                        lenses.push({ range: new range_1.$ks(line, 1, line, 11) });
                    }
                    const model = new codelens_1.$Y2();
                    model.add({ lenses, dispose() { } }, this.a);
                    this.b.set(key, new CacheItem(element.lineCount, model));
                }
            }
            catch {
                // ignore...
            }
        }
    };
    exports.$22 = $22;
    exports.$22 = $22 = __decorate([
        __param(0, storage_1.$Vo)
    ], $22);
    (0, extensions_1.$mr)(exports.$12, $22, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=codeLensCache.js.map