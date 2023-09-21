/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, errors_1, lifecycle_1, position_1, range_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n9 = exports.$m9 = exports.$l9 = exports.$k9 = void 0;
    class $k9 {
        constructor(range, direction) {
            this.range = range;
            this.direction = direction;
        }
    }
    exports.$k9 = $k9;
    class $l9 {
        constructor(hint, anchor, provider) {
            this.hint = hint;
            this.anchor = anchor;
            this.provider = provider;
            this.c = false;
        }
        with(delta) {
            const result = new $l9(this.hint, delta.anchor, this.provider);
            result.c = this.c;
            result.d = this.d;
            return result;
        }
        async resolve(token) {
            if (typeof this.provider.resolveInlayHint !== 'function') {
                return;
            }
            if (this.d) {
                // wait for an active resolve operation and try again
                // when that's done.
                await this.d;
                if (token.isCancellationRequested) {
                    return;
                }
                return this.resolve(token);
            }
            if (!this.c) {
                this.d = this.e(token)
                    .finally(() => this.d = undefined);
            }
            await this.d;
        }
        async e(token) {
            try {
                const newHint = await Promise.resolve(this.provider.resolveInlayHint(this.hint, token));
                this.hint.tooltip = newHint?.tooltip ?? this.hint.tooltip;
                this.hint.label = newHint?.label ?? this.hint.label;
                this.c = true;
            }
            catch (err) {
                (0, errors_1.$Z)(err);
                this.c = false;
            }
        }
    }
    exports.$l9 = $l9;
    class $m9 {
        static async create(registry, model, ranges, token) {
            const data = [];
            const promises = registry.ordered(model).reverse().map(provider => ranges.map(async (range) => {
                try {
                    const result = await provider.provideInlayHints(model, range, token);
                    if (result?.hints.length) {
                        data.push([result, provider]);
                    }
                }
                catch (err) {
                    (0, errors_1.$Z)(err);
                }
            }));
            await Promise.all(promises.flat());
            if (token.isCancellationRequested || model.isDisposed()) {
                throw new errors_1.$3();
            }
            return new $m9(ranges, data, model);
        }
        constructor(ranges, data, model) {
            this.c = new lifecycle_1.$jc();
            this.ranges = ranges;
            this.provider = new Set();
            const items = [];
            for (const [list, provider] of data) {
                this.c.add(list);
                this.provider.add(provider);
                for (const hint of list.hints) {
                    // compute the range to which the item should be attached to
                    const position = model.validatePosition(hint.position);
                    let direction = 'before';
                    const wordRange = $m9.d(model, position);
                    let range;
                    if (wordRange.getStartPosition().isBefore(position)) {
                        range = range_1.$ks.fromPositions(wordRange.getStartPosition(), position);
                        direction = 'after';
                    }
                    else {
                        range = range_1.$ks.fromPositions(position, wordRange.getEndPosition());
                        direction = 'before';
                    }
                    items.push(new $l9(hint, new $k9(range, direction), provider));
                }
            }
            this.items = items.sort((a, b) => position_1.$js.compare(a.hint.position, b.hint.position));
        }
        dispose() {
            this.c.dispose();
        }
        static d(model, position) {
            const line = position.lineNumber;
            const word = model.getWordAtPosition(position);
            if (word) {
                // always prefer the word range
                return new range_1.$ks(line, word.startColumn, line, word.endColumn);
            }
            model.tokenization.tokenizeIfCheap(line);
            const tokens = model.tokenization.getLineTokens(line);
            const offset = position.column - 1;
            const idx = tokens.findTokenIndexAtOffset(offset);
            let start = tokens.getStartOffset(idx);
            let end = tokens.getEndOffset(idx);
            if (end - start === 1) {
                // single character token, when at its end try leading/trailing token instead
                if (start === offset && idx > 1) {
                    // leading token
                    start = tokens.getStartOffset(idx - 1);
                    end = tokens.getEndOffset(idx - 1);
                }
                else if (end === offset && idx < tokens.getCount() - 1) {
                    // trailing token
                    start = tokens.getStartOffset(idx + 1);
                    end = tokens.getEndOffset(idx + 1);
                }
            }
            return new range_1.$ks(line, start + 1, line, end + 1);
        }
    }
    exports.$m9 = $m9;
    function $n9(command) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.command,
            path: command.id,
            query: command.arguments && encodeURIComponent(JSON.stringify(command.arguments))
        }).toString();
    }
    exports.$n9 = $n9;
});
//# sourceMappingURL=inlayHints.js.map