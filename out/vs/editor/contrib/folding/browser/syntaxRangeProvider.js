/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "./foldingRanges"], function (require, exports, errors_1, lifecycle_1, foldingRanges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeRanges = exports.SyntaxRangeProvider = void 0;
    const foldingContext = {};
    const ID_SYNTAX_PROVIDER = 'syntax';
    class SyntaxRangeProvider {
        constructor(editorModel, providers, handleFoldingRangesChange, foldingRangesLimit, fallbackRangeProvider // used when all providers return null
        ) {
            this.editorModel = editorModel;
            this.providers = providers;
            this.handleFoldingRangesChange = handleFoldingRangesChange;
            this.foldingRangesLimit = foldingRangesLimit;
            this.fallbackRangeProvider = fallbackRangeProvider;
            this.id = ID_SYNTAX_PROVIDER;
            this.disposables = new lifecycle_1.DisposableStore();
            if (fallbackRangeProvider) {
                this.disposables.add(fallbackRangeProvider);
            }
            for (const provider of providers) {
                if (typeof provider.onDidChange === 'function') {
                    this.disposables.add(provider.onDidChange(handleFoldingRangesChange));
                }
            }
        }
        compute(cancellationToken) {
            return collectSyntaxRanges(this.providers, this.editorModel, cancellationToken).then(ranges => {
                if (ranges) {
                    const res = sanitizeRanges(ranges, this.foldingRangesLimit);
                    return res;
                }
                return this.fallbackRangeProvider?.compute(cancellationToken) ?? null;
            });
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.SyntaxRangeProvider = SyntaxRangeProvider;
    function collectSyntaxRanges(providers, model, cancellationToken) {
        let rangeData = null;
        const promises = providers.map((provider, i) => {
            return Promise.resolve(provider.provideFoldingRanges(model, foldingContext, cancellationToken)).then(ranges => {
                if (cancellationToken.isCancellationRequested) {
                    return;
                }
                if (Array.isArray(ranges)) {
                    if (!Array.isArray(rangeData)) {
                        rangeData = [];
                    }
                    const nLines = model.getLineCount();
                    for (const r of ranges) {
                        if (r.start > 0 && r.end > r.start && r.end <= nLines) {
                            rangeData.push({ start: r.start, end: r.end, rank: i, kind: r.kind });
                        }
                    }
                }
            }, errors_1.onUnexpectedExternalError);
        });
        return Promise.all(promises).then(_ => {
            return rangeData;
        });
    }
    class RangesCollector {
        constructor(foldingRangesLimit) {
            this._startIndexes = [];
            this._endIndexes = [];
            this._nestingLevels = [];
            this._nestingLevelCounts = [];
            this._types = [];
            this._length = 0;
            this._foldingRangesLimit = foldingRangesLimit;
        }
        add(startLineNumber, endLineNumber, type, nestingLevel) {
            if (startLineNumber > foldingRanges_1.MAX_LINE_NUMBER || endLineNumber > foldingRanges_1.MAX_LINE_NUMBER) {
                return;
            }
            const index = this._length;
            this._startIndexes[index] = startLineNumber;
            this._endIndexes[index] = endLineNumber;
            this._nestingLevels[index] = nestingLevel;
            this._types[index] = type;
            this._length++;
            if (nestingLevel < 30) {
                this._nestingLevelCounts[nestingLevel] = (this._nestingLevelCounts[nestingLevel] || 0) + 1;
            }
        }
        toIndentRanges() {
            const limit = this._foldingRangesLimit.limit;
            if (this._length <= limit) {
                this._foldingRangesLimit.update(this._length, false);
                const startIndexes = new Uint32Array(this._length);
                const endIndexes = new Uint32Array(this._length);
                for (let i = 0; i < this._length; i++) {
                    startIndexes[i] = this._startIndexes[i];
                    endIndexes[i] = this._endIndexes[i];
                }
                return new foldingRanges_1.FoldingRegions(startIndexes, endIndexes, this._types);
            }
            else {
                this._foldingRangesLimit.update(this._length, limit);
                let entries = 0;
                let maxLevel = this._nestingLevelCounts.length;
                for (let i = 0; i < this._nestingLevelCounts.length; i++) {
                    const n = this._nestingLevelCounts[i];
                    if (n) {
                        if (n + entries > limit) {
                            maxLevel = i;
                            break;
                        }
                        entries += n;
                    }
                }
                const startIndexes = new Uint32Array(limit);
                const endIndexes = new Uint32Array(limit);
                const types = [];
                for (let i = 0, k = 0; i < this._length; i++) {
                    const level = this._nestingLevels[i];
                    if (level < maxLevel || (level === maxLevel && entries++ < limit)) {
                        startIndexes[k] = this._startIndexes[i];
                        endIndexes[k] = this._endIndexes[i];
                        types[k] = this._types[i];
                        k++;
                    }
                }
                return new foldingRanges_1.FoldingRegions(startIndexes, endIndexes, types);
            }
        }
    }
    function sanitizeRanges(rangeData, foldingRangesLimit) {
        const sorted = rangeData.sort((d1, d2) => {
            let diff = d1.start - d2.start;
            if (diff === 0) {
                diff = d1.rank - d2.rank;
            }
            return diff;
        });
        const collector = new RangesCollector(foldingRangesLimit);
        let top = undefined;
        const previous = [];
        for (const entry of sorted) {
            if (!top) {
                top = entry;
                collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
            }
            else {
                if (entry.start > top.start) {
                    if (entry.end <= top.end) {
                        previous.push(top);
                        top = entry;
                        collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
                    }
                    else {
                        if (entry.start > top.end) {
                            do {
                                top = previous.pop();
                            } while (top && entry.start > top.end);
                            if (top) {
                                previous.push(top);
                            }
                            top = entry;
                        }
                        collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
                    }
                }
            }
        }
        return collector.toIndentRanges();
    }
    exports.sanitizeRanges = sanitizeRanges;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4UmFuZ2VQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZvbGRpbmcvYnJvd3Nlci9zeW50YXhSYW5nZVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFNLGNBQWMsR0FBbUIsRUFDdEMsQ0FBQztJQUVGLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDO0lBRXBDLE1BQWEsbUJBQW1CO1FBTS9CLFlBQ2tCLFdBQXVCLEVBQ3ZCLFNBQWlDLEVBQ3pDLHlCQUFxQyxFQUM3QixrQkFBd0MsRUFDeEMscUJBQWdELENBQUMsc0NBQXNDOztZQUp2RixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtZQUN2QixjQUFTLEdBQVQsU0FBUyxDQUF3QjtZQUN6Qyw4QkFBeUIsR0FBekIseUJBQXlCLENBQVk7WUFDN0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN4QywwQkFBcUIsR0FBckIscUJBQXFCLENBQTJCO1lBVHpELE9BQUUsR0FBRyxrQkFBa0IsQ0FBQztZQVdoQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3pDLElBQUkscUJBQXFCLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDNUM7WUFFRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDakMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFO29CQUMvQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztpQkFDdEU7YUFDRDtRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsaUJBQW9DO1lBQzNDLE9BQU8sbUJBQW1CLENB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