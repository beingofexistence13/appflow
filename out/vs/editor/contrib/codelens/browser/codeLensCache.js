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
    exports.CodeLensCache = exports.ICodeLensCache = void 0;
    exports.ICodeLensCache = (0, instantiation_1.createDecorator)('ICodeLensCache');
    class CacheItem {
        constructor(lineCount, data) {
            this.lineCount = lineCount;
            this.data = data;
        }
    }
    let CodeLensCache = class CodeLensCache {
        constructor(storageService) {
            this._fakeProvider = new class {
                provideCodeLenses() {
                    throw new Error('not supported');
                }
            };
            this._cache = new map_1.LRUCache(20, 0.75);
            // remove old data
            const oldkey = 'codelens/cache';
            (0, async_1.runWhenIdle)(() => storageService.remove(oldkey, 1 /* StorageScope.WORKSPACE */));
            // restore lens data on start
            const key = 'codelens/cache2';
            const raw = storageService.get(key, 1 /* StorageScope.WORKSPACE */, '{}');
            this._deserialize(raw);
            // store lens data on shutdown
            (0, functional_1.once)(storageService.onWillSaveState)(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    storageService.store(key, this._serialize(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
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
            const copyModel = new codelens_1.CodeLensModel();
            copyModel.add({ lenses: copyItems, dispose: () => { } }, this._fakeProvider);
            const item = new CacheItem(model.getLineCount(), copyModel);
            this._cache.set(model.uri.toString(), item);
        }
        get(model) {
            const item = this._cache.get(model.uri.toString());
            return item && item.lineCount === model.getLineCount() ? item.data : undefined;
        }
        delete(model) {
            this._cache.delete(model.uri.toString());
        }
        // --- persistence
        _serialize() {
            const data = Object.create(null);
            for (const [key, value] of this._cache) {
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
        _deserialize(raw) {
            try {
                const data = JSON.parse(raw);
                for (const key in data) {
                    const element = data[key];
                    const lenses = [];
                    for (const line of element.lines) {
                        lenses.push({ range: new range_1.Range(line, 1, line, 11) });
                    }
                    const model = new codelens_1.CodeLensModel();
                    model.add({ lenses, dispose() { } }, this._fakeProvider);
                    this._cache.set(key, new CacheItem(element.lineCount, model));
                }
            }
            catch {
                // ignore...
            }
        }
    };
    exports.CodeLensCache = CodeLensCache;
    exports.CodeLensCache = CodeLensCache = __decorate([
        __param(0, storage_1.IStorageService)
    ], CodeLensCache);
    (0, extensions_1.registerSingleton)(exports.ICodeLensCache, CodeLensCache, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUxlbnNDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVsZW5zL2Jyb3dzZXIvY29kZUxlbnNDYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwrQkFBZSxFQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0lBY2hGLE1BQU0sU0FBUztRQUVkLFlBQ1UsU0FBaUIsRUFDakIsSUFBbUI7WUFEbkIsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQixTQUFJLEdBQUosSUFBSSxDQUFlO1FBQ3pCLENBQUM7S0FDTDtJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWE7UUFZekIsWUFBNkIsY0FBK0I7WUFSM0Msa0JBQWEsR0FBRyxJQUFJO2dCQUNwQyxpQkFBaUI7b0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7YUFDRCxDQUFDO1lBRWUsV0FBTSxHQUFHLElBQUksY0FBUSxDQUFvQixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFJbkUsa0JBQWtCO1lBQ2xCLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDO1lBQ2hDLElBQUEsbUJBQVcsRUFBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0saUNBQXlCLENBQUMsQ0FBQztZQUV6RSw2QkFBNkI7WUFDN0IsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUM7WUFDOUIsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGtDQUEwQixJQUFJLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXZCLDhCQUE4QjtZQUM5QixJQUFBLGlCQUFJLEVBQUMsY0FBYyxDQUFDLGVB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