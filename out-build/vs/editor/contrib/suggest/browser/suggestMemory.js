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
    var $q6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r6 = exports.$q6 = exports.$p6 = exports.$o6 = exports.$n6 = exports.$m6 = void 0;
    class $m6 {
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
    exports.$m6 = $m6;
    class $n6 extends $m6 {
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
    exports.$n6 = $n6;
    class $o6 extends $m6 {
        constructor() {
            super('recentlyUsed');
            this.c = new map_1.$Ci(300, 0.66);
            this.d = 0;
        }
        memorize(model, pos, item) {
            const key = `${model.getLanguageId()}/${item.textLabel}`;
            this.c.set(key, {
                touch: this.d++,
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
                const item = this.c.peek(key);
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
            return this.c.toJSON();
        }
        fromJSON(data) {
            this.c.clear();
            const seq = 0;
            for (const [key, value] of data) {
                value.touch = seq;
                value.type = typeof value.type === 'number' ? value.type : languages_1.CompletionItemKinds.fromString(value.type);
                this.c.set(key, value);
            }
            this.d = this.c.size;
        }
    }
    exports.$o6 = $o6;
    class $p6 extends $m6 {
        constructor() {
            super('recentlyUsedByPrefix');
            this.c = ternarySearchTree_1.$Hh.forStrings();
            this.d = 0;
        }
        memorize(model, pos, item) {
            const { word } = model.getWordUntilPosition(pos);
            const key = `${model.getLanguageId()}/${word}`;
            this.c.set(key, {
                type: item.completion.kind,
                insertText: item.completion.insertText,
                touch: this.d++
            });
        }
        select(model, pos, items) {
            const { word } = model.getWordUntilPosition(pos);
            if (!word) {
                return super.select(model, pos, items);
            }
            const key = `${model.getLanguageId()}/${word}`;
            let item = this.c.get(key);
            if (!item) {
                item = this.c.findSubstr(key);
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
            this.c.forEach((value, key) => entries.push([key, value]));
            // sort by last recently used (touch), then
            // take the top 200 item and normalize their
            // touch
            entries
                .sort((a, b) => -(a[1].touch - b[1].touch))
                .forEach((value, i) => value[1].touch = i);
            return entries.slice(0, 200);
        }
        fromJSON(data) {
            this.c.clear();
            if (data.length > 0) {
                this.d = data[0][1].touch + 1;
                for (const [key, value] of data) {
                    value.type = typeof value.type === 'number' ? value.type : languages_1.CompletionItemKinds.fromString(value.type);
                    this.c.set(key, value);
                }
            }
        }
    }
    exports.$p6 = $p6;
    let $q6 = class $q6 {
        static { $q6_1 = this; }
        static { this.c = new Map([
            ['recentlyUsedByPrefix', $p6],
            ['recentlyUsed', $o6],
            ['first', $n6]
        ]); }
        static { this.d = 'suggest/memories'; }
        constructor(j, k) {
            this.j = j;
            this.k = k;
            this.g = new lifecycle_1.$jc();
            this.f = new async_1.$Sg(() => this.m(), 500);
            this.g.add(j.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.m();
                }
            }));
        }
        dispose() {
            this.g.dispose();
            this.f.dispose();
        }
        memorize(model, pos, item) {
            this.l(model, pos).memorize(model, pos, item);
            this.f.schedule();
        }
        select(model, pos, items) {
            return this.l(model, pos).select(model, pos, items);
        }
        l(model, pos) {
            const mode = this.k.getValue('editor.suggestSelection', {
                overrideIdentifier: model.getLanguageIdAtPosition(pos.lineNumber, pos.column),
                resource: model.uri
            });
            if (this.h?.name !== mode) {
                this.m();
                const ctor = $q6_1.c.get(mode) || $n6;
                this.h = new ctor();
                try {
                    const share = this.k.getValue('editor.suggest.shareSuggestSelections');
                    const scope = share ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
                    const raw = this.j.get(`${$q6_1.d}/${mode}`, scope);
                    if (raw) {
                        this.h.fromJSON(JSON.parse(raw));
                    }
                }
                catch (e) {
                    // things can go wrong with JSON...
                }
            }
            return this.h;
        }
        m() {
            if (this.h) {
                const share = this.k.getValue('editor.suggest.shareSuggestSelections');
                const scope = share ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
                const raw = JSON.stringify(this.h);
                this.j.store(`${$q6_1.d}/${this.h.name}`, raw, scope, 1 /* StorageTarget.MACHINE */);
            }
        }
    };
    exports.$q6 = $q6;
    exports.$q6 = $q6 = $q6_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, configuration_1.$8h)
    ], $q6);
    exports.$r6 = (0, instantiation_1.$Bh)('ISuggestMemories');
    (0, extensions_1.$mr)(exports.$r6, $q6, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=suggestMemory.js.map