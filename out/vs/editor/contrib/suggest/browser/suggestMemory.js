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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/ternarySearchTree", "vs/editor/common/languages", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage"], function (require, exports, async_1, lifecycle_1, map_1, ternarySearchTree_1, languages_1, configuration_1, extensions_1, instantiation_1, storage_1) {
    "use strict";
    var SuggestMemoryService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISuggestMemoryService = exports.SuggestMemoryService = exports.PrefixMemory = exports.LRUMemory = exports.NoMemory = exports.Memory = void 0;
    class Memory {
        constructor(name) {
            this.name = name;
        }
        select(model, pos, items) {
            if (items.length === 0) {
                return 0;
            }
            const topScore = items[0].score[0];
            for (let i = 0; i < items.length; i++) {
                const { score, completion: suggestion } = items[i];
                if (score[0] !== topScore) {
                    // stop when leaving the group of top matches
                    break;
                }
                if (suggestion.preselect) {
                    // stop when seeing an auto-select-item
                    return i;
                }
            }
            return 0;
        }
    }
    exports.Memory = Memory;
    class NoMemory extends Memory {
        constructor() {
            super('first');
        }
        memorize(model, pos, item) {
            // no-op
        }
        toJSON() {
            return undefined;
        }
        fromJSON() {
            //
        }
    }
    exports.NoMemory = NoMemory;
    class LRUMemory extends Memory {
        constructor() {
            super('recentlyUsed');
            this._cache = new map_1.LRUCache(300, 0.66);
            this._seq = 0;
        }
        memorize(model, pos, item) {
            const key = `${model.getLanguageId()}/${item.textLabel}`;
            this._cache.set(key, {
                touch: this._seq++,
                type: item.completion.kind,
                insertText: item.completion.insertText
            });
        }
        select(model, pos, items) {
            if (items.length === 0) {
                return 0;
            }
            const lineSuffix = model.getLineContent(pos.lineNumber).substr(pos.column - 10, pos.column - 1);
            if (/\s$/.test(lineSuffix)) {
                return super.select(model, pos, items);
            }
            const topScore = items[0].score[0];
            let indexPreselect = -1;
            let indexRecency = -1;
            let seq = -1;
            for (let i = 0; i < items.length; i++) {
                if (items[i].score[0] !== topScore) {
                    // consider only top items
                    break;
                }
                const key = `${model.getLanguageId()}/${items[i].textLabel}`;
                const item = this._cache.peek(key);
                if (item && item.touch > seq && item.type === items[i].completion.kind && item.insertText === items[i].completion.insertText) {
                    seq = item.touch;
                    indexRecency = i;
                }
                if (items[i].completion.preselect && indexPreselect === -1) {
                    // stop when seeing an auto-select-item
                    return indexPreselect = i;
                }
            }
            if (indexRecency !== -1) {
                return indexRecency;
            }
            else if (indexPreselect !== -1) {
                return indexPreselect;
            }
            else {
                return 0;
            }
        }
        toJSON() {
            return this._cache.toJSON();
        }
        fromJSON(data) {
            this._cache.clear();
            const seq = 0;
            for (const [key, value] of data) {
                value.touch = seq;
                value.type = typeof value.type === 'number' ? value.type : languages_1.CompletionItemKinds.fromString(value.type);
                this._cache.set(key, value);
            }
            this._seq = this._cache.size;
        }
    }
    exports.LRUMemory = LRUMemory;
    class PrefixMemory extends Memory {
        constructor() {
            super('recentlyUsedByPrefix');
            this._trie = ternarySearchTree_1.TernarySearchTree.forStrings();
            this._seq = 0;
        }
        memorize(model, pos, item) {
            const { word } = model.getWordUntilPosition(pos);
            const key = `${model.getLanguageId()}/${word}`;
            this._trie.set(key, {
                type: item.completion.kind,
                insertText: item.completion.insertText,
                touch: this._seq++
            });
        }
        select(model, pos, items) {
            const { word } = model.getWordUntilPosition(pos);
            if (!word) {
                return super.select(model, pos, items);
            }
            const key = `${model.getLanguageId()}/${word}`;
            let item = this._trie.get(key);
            if (!item) {
                item = this._trie.findSubstr(key);
            }
            if (item) {
                for (let i = 0; i < items.length; i++) {
                    const { kind, insertText } = items[i].completion;
                    if (kind === item.type && insertText === item.insertText) {
                        return i;
                    }
                }
            }
            return super.select(model, pos, items);
        }
        toJSON() {
            const entries = [];
            this._trie.forEach((value, key) => entries.push([key, value]));
            // sort by last recently used (touch), then
            // take the top 200 item and normalize their
            // touch
            entries
                .sort((a, b) => -(a[1].touch - b[1].touch))
                .forEach((value, i) => value[1].touch = i);
            return entries.slice(0, 200);
        }
        fromJSON(data) {
            this._trie.clear();
            if (data.length > 0) {
                this._seq = data[0][1].touch + 1;
                for (const [key, value] of data) {
                    value.type = typeof value.type === 'number' ? value.type : languages_1.CompletionItemKinds.fromString(value.type);
                    this._trie.set(key, value);
                }
            }
        }
    }
    exports.PrefixMemory = PrefixMemory;
    let SuggestMemoryService = class SuggestMemoryService {
        static { SuggestMemoryService_1 = this; }
        static { this._strategyCtors = new Map([
            ['recentlyUsedByPrefix', PrefixMemory],
            ['recentlyUsed', LRUMemory],
            ['first', NoMemory]
        ]); }
        static { this._storagePrefix = 'suggest/memories'; }
        constructor(_storageService, _configService) {
            this._storageService = _storageService;
            this._configService = _configService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._persistSoon = new async_1.RunOnceScheduler(() => this._saveState(), 500);
            this._disposables.add(_storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this._saveState();
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._persistSoon.dispose();
        }
        memorize(model, pos, item) {
            this._withStrategy(model, pos).memorize(model, pos, item);
            this._persistSoon.schedule();
        }
        select(model, pos, items) {
            return this._withStrategy(model, pos).select(model, pos, items);
        }
        _withStrategy(model, pos) {
            const mode = this._configService.getValue('editor.suggestSelection', {
                overrideIdentifier: model.getLanguageIdAtPosition(pos.lineNumber, pos.column),
                resource: model.uri
            });
            if (this._strategy?.name !== mode) {
                this._saveState();
                const ctor = SuggestMemoryService_1._strategyCtors.get(mode) || NoMemory;
                this._strategy = new ctor();
                try {
                    const share = this._configService.getValue('editor.suggest.shareSuggestSelections');
                    const scope = share ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
                    const raw = this._storageService.get(`${SuggestMemoryService_1._storagePrefix}/${mode}`, scope);
                    if (raw) {
                        this._strategy.fromJSON(JSON.parse(raw));
                    }
                }
                catch (e) {
                    // things can go wrong with JSON...
                }
            }
            return this._strategy;
        }
        _saveState() {
            if (this._strategy) {
                const share = this._configService.getValue('editor.suggest.shareSuggestSelections');
                const scope = share ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
                const raw = JSON.stringify(this._strategy);
                this._storageService.store(`${SuggestMemoryService_1._storagePrefix}/${this._strategy.name}`, raw, scope, 1 /* StorageTarget.MACHINE */);
            }
        }
    };
    exports.SuggestMemoryService = SuggestMemoryService;
    exports.SuggestMemoryService = SuggestMemoryService = SuggestMemoryService_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, configuration_1.IConfigurationService)
    ], SuggestMemoryService);
    exports.ISuggestMemoryService = (0, instantiation_1.createDecorator)('ISuggestMemories');
    (0, extensions_1.registerSingleton)(exports.ISuggestMemoryService, SuggestMemoryService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE1lbW9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0TWVtb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLE1BQXNCLE1BQU07UUFFM0IsWUFBcUIsSUFBYTtZQUFiLFNBQUksR0FBSixJQUFJLENBQVM7UUFBSSxDQUFDO1FBRXZDLE1BQU0sQ0FBQyxLQUFpQixFQUFFLEdBQWMsRUFBRSxLQUF1QjtZQUNoRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixPQUFPLENBQUMsQ0FBQzthQUNUO1lBQ0QsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQzFCLDZDQUE2QztvQkFDN0MsTUFBTTtpQkFDTjtnQkFDRCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUU7b0JBQ3pCLHVDQUF1QztvQkFDdkMsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7YUFDRDtZQUNELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQU9EO0lBNUJELHdCQTRCQztJQUVELE1BQWEsUUFBUyxTQUFRLE1BQU07UUFFbkM7WUFDQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUVELFFBQVEsQ0FB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