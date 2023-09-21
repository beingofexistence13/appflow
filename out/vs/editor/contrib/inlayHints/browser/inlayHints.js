/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, errors_1, lifecycle_1, position_1, range_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asCommandLink = exports.InlayHintsFragments = exports.InlayHintItem = exports.InlayHintAnchor = void 0;
    class InlayHintAnchor {
        constructor(range, direction) {
            this.range = range;
            this.direction = direction;
        }
    }
    exports.InlayHintAnchor = InlayHintAnchor;
    class InlayHintItem {
        constructor(hint, anchor, provider) {
            this.hint = hint;
            this.anchor = anchor;
            this.provider = provider;
            this._isResolved = false;
        }
        with(delta) {
            const result = new InlayHintItem(this.hint, delta.anchor, this.provider);
            result._isResolved = this._isResolved;
            result._currentResolve = this._currentResolve;
            return result;
        }
        async resolve(token) {
            if (typeof this.provider.resolveInlayHint !== 'function') {
                return;
            }
            if (this._currentResolve) {
                // wait for an active resolve operation and try again
                // when that's done.
                await this._currentResolve;
                if (token.isCancellationRequested) {
                    return;
                }
                return this.resolve(token);
            }
            if (!this._isResolved) {
                this._currentResolve = this._doResolve(token)
                    .finally(() => this._currentResolve = undefined);
            }
            await this._currentResolve;
        }
        async _doResolve(token) {
            try {
                const newHint = await Promise.resolve(this.provider.resolveInlayHint(this.hint, token));
                this.hint.tooltip = newHint?.tooltip ?? this.hint.tooltip;
                this.hint.label = newHint?.label ?? this.hint.label;
                this._isResolved = true;
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
                this._isResolved = false;
            }
        }
    }
    exports.InlayHintItem = InlayHintItem;
    class InlayHintsFragments {
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
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
            }));
            await Promise.all(promises.flat());
            if (token.isCancellationRequested || model.isDisposed()) {
                throw new errors_1.CancellationError();
            }
            return new InlayHintsFragments(ranges, data, model);
        }
        constructor(ranges, data, model) {
            this._disposables = new lifecycle_1.DisposableStore();
            this.ranges = ranges;
            this.provider = new Set();
            const items = [];
            for (const [list, provider] of data) {
                this._disposables.add(list);
                this.provider.add(provider);
                for (const hint of list.hints) {
                    // compute the range to which the item should be attached to
                    const position = model.validatePosition(hint.position);
                    let direction = 'before';
                    const wordRange = InlayHintsFragments._getRangeAtPosition(model, position);
                    let range;
                    if (wordRange.getStartPosition().isBefore(position)) {
                        range = range_1.Range.fromPositions(wordRange.getStartPosition(), position);
                        direction = 'after';
                    }
                    else {
                        range = range_1.Range.fromPositions(position, wordRange.getEndPosition());
                        direction = 'before';
                    }
                    items.push(new InlayHintItem(hint, new InlayHintAnchor(range, direction), provider));
                }
            }
            this.items = items.sort((a, b) => position_1.Position.compare(a.hint.position, b.hint.position));
        }
        dispose() {
            this._disposables.dispose();
        }
        static _getRangeAtPosition(model, position) {
            const line = position.lineNumber;
            const word = model.getWordAtPosition(position);
            if (word) {
                // always prefer the word range
                return new range_1.Range(line, word.startColumn, line, word.endColumn);
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
            return new range_1.Range(line, start + 1, line, end + 1);
        }
    }
    exports.InlayHintsFragments = InlayHintsFragments;
    function asCommandLink(command) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.command,
            path: command.id,
            query: command.arguments && encodeURIComponent(JSON.stringify(command.arguments))
        }).toString();
    }
    exports.asCommandLink = asCommandLink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGF5SGludHMvYnJvd3Nlci9pbmxheUhpbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFhLGVBQWU7UUFDM0IsWUFBcUIsS0FBWSxFQUFXLFNBQTZCO1lBQXBELFVBQUssR0FBTCxLQUFLLENBQU87WUFBVyxjQUFTLEdBQVQsU0FBUyxDQUFvQjtRQUFJLENBQUM7S0FDOUU7SUFGRCwwQ0FFQztJQUVELE1BQWEsYUFBYTtRQUt6QixZQUFxQixJQUFlLEVBQVcsTUFBdUIsRUFBVyxRQUE0QjtZQUF4RixTQUFJLEdBQUosSUFBSSxDQUFXO1lBQVcsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7WUFBVyxhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUhyRyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUc0RSxDQUFDO1FBRWxILElBQUksQ0FBQyxLQUFrQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN0QyxNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDOUMsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUF3QjtZQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUU7Z0JBQ3pELE9BQU87YUFDUDtZQUNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDekIscURBQXFEO2dCQUNyRCxvQkFBb0I7Z0JBQ3BCLE1B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