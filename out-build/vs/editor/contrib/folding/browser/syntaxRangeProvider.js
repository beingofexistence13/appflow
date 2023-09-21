/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "./foldingRanges"], function (require, exports, errors_1, lifecycle_1, foldingRanges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y8 = exports.$x8 = void 0;
    const foldingContext = {};
    const ID_SYNTAX_PROVIDER = 'syntax';
    class $x8 {
        constructor(a, b, handleFoldingRangesChange, c, d // used when all providers return null
        ) {
            this.a = a;
            this.b = b;
            this.handleFoldingRangesChange = handleFoldingRangesChange;
            this.c = c;
            this.d = d;
            this.id = ID_SYNTAX_PROVIDER;
            this.disposables = new lifecycle_1.$jc();
            if (d) {
                this.disposables.add(d);
            }
            for (const provider of b) {
                if (typeof provider.onDidChange === 'function') {
                    this.disposables.add(provider.onDidChange(handleFoldingRangesChange));
                }
            }
        }
        compute(cancellationToken) {
            return collectSyntaxRanges(this.b, this.a, cancellationToken).then(ranges => {
                if (ranges) {
                    const res = $y8(ranges, this.c);
                    return res;
                }
                return this.d?.compute(cancellationToken) ?? null;
            });
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.$x8 = $x8;
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
            }, errors_1.$Z);
        });
        return Promise.all(promises).then(_ => {
            return rangeData;
        });
    }
    class RangesCollector {
        constructor(foldingRangesLimit) {
            this.a = [];
            this.b = [];
            this.c = [];
            this.d = [];
            this.e = [];
            this.f = 0;
            this.g = foldingRangesLimit;
        }
        add(startLineNumber, endLineNumber, type, nestingLevel) {
            if (startLineNumber > foldingRanges_1.$_7 || endLineNumber > foldingRanges_1.$_7) {
                return;
            }
            const index = this.f;
            this.a[index] = startLineNumber;
            this.b[index] = endLineNumber;
            this.c[index] = nestingLevel;
            this.e[index] = type;
            this.f++;
            if (nestingLevel < 30) {
                this.d[nestingLevel] = (this.d[nestingLevel] || 0) + 1;
            }
        }
        toIndentRanges() {
            const limit = this.g.limit;
            if (this.f <= limit) {
                this.g.update(this.f, false);
                const startIndexes = new Uint32Array(this.f);
                const endIndexes = new Uint32Array(this.f);
                for (let i = 0; i < this.f; i++) {
                    startIndexes[i] = this.a[i];
                    endIndexes[i] = this.b[i];
                }
                return new foldingRanges_1.$a8(startIndexes, endIndexes, this.e);
            }
            else {
                this.g.update(this.f, limit);
                let entries = 0;
                let maxLevel = this.d.length;
                for (let i = 0; i < this.d.length; i++) {
                    const n = this.d[i];
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
                for (let i = 0, k = 0; i < this.f; i++) {
                    const level = this.c[i];
                    if (level < maxLevel || (level === maxLevel && entries++ < limit)) {
                        startIndexes[k] = this.a[i];
                        endIndexes[k] = this.b[i];
                        types[k] = this.e[i];
                        k++;
                    }
                }
                return new foldingRanges_1.$a8(startIndexes, endIndexes, types);
            }
        }
    }
    function $y8(rangeData, foldingRangesLimit) {
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
    exports.$y8 = $y8;
});
//# sourceMappingURL=syntaxRangeProvider.js.map