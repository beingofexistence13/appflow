/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ru = exports.$qu = exports.$pu = exports.$ou = exports.$nu = exports.$mu = exports.$lu = exports.$ku = exports.$ju = exports.RawContentChangedType = void 0;
    /**
     * @internal
     */
    var RawContentChangedType;
    (function (RawContentChangedType) {
        RawContentChangedType[RawContentChangedType["Flush"] = 1] = "Flush";
        RawContentChangedType[RawContentChangedType["LineChanged"] = 2] = "LineChanged";
        RawContentChangedType[RawContentChangedType["LinesDeleted"] = 3] = "LinesDeleted";
        RawContentChangedType[RawContentChangedType["LinesInserted"] = 4] = "LinesInserted";
        RawContentChangedType[RawContentChangedType["EOLChanged"] = 5] = "EOLChanged";
    })(RawContentChangedType || (exports.RawContentChangedType = RawContentChangedType = {}));
    /**
     * An event describing that a model has been reset to a new value.
     * @internal
     */
    class $ju {
        constructor() {
            this.changeType = 1 /* RawContentChangedType.Flush */;
        }
    }
    exports.$ju = $ju;
    /**
     * Represents text injected on a line
     * @internal
     */
    class $ku {
        static applyInjectedText(lineText, injectedTexts) {
            if (!injectedTexts || injectedTexts.length === 0) {
                return lineText;
            }
            let result = '';
            let lastOriginalOffset = 0;
            for (const injectedText of injectedTexts) {
                result += lineText.substring(lastOriginalOffset, injectedText.column - 1);
                lastOriginalOffset = injectedText.column - 1;
                result += injectedText.options.content;
            }
            result += lineText.substring(lastOriginalOffset);
            return result;
        }
        static fromDecorations(decorations) {
            const result = [];
            for (const decoration of decorations) {
                if (decoration.options.before && decoration.options.before.content.length > 0) {
                    result.push(new $ku(decoration.ownerId, decoration.range.startLineNumber, decoration.range.startColumn, decoration.options.before, 0));
                }
                if (decoration.options.after && decoration.options.after.content.length > 0) {
                    result.push(new $ku(decoration.ownerId, decoration.range.endLineNumber, decoration.range.endColumn, decoration.options.after, 1));
                }
            }
            result.sort((a, b) => {
                if (a.lineNumber === b.lineNumber) {
                    if (a.column === b.column) {
                        return a.order - b.order;
                    }
                    return a.column - b.column;
                }
                return a.lineNumber - b.lineNumber;
            });
            return result;
        }
        constructor(ownerId, lineNumber, column, options, order) {
            this.ownerId = ownerId;
            this.lineNumber = lineNumber;
            this.column = column;
            this.options = options;
            this.order = order;
        }
        withText(text) {
            return new $ku(this.ownerId, this.lineNumber, this.column, { ...this.options, content: text }, this.order);
        }
    }
    exports.$ku = $ku;
    /**
     * An event describing that a line has changed in a model.
     * @internal
     */
    class $lu {
        constructor(lineNumber, detail, injectedText) {
            this.changeType = 2 /* RawContentChangedType.LineChanged */;
            this.lineNumber = lineNumber;
            this.detail = detail;
            this.injectedText = injectedText;
        }
    }
    exports.$lu = $lu;
    /**
     * An event describing that line(s) have been deleted in a model.
     * @internal
     */
    class $mu {
        constructor(fromLineNumber, toLineNumber) {
            this.changeType = 3 /* RawContentChangedType.LinesDeleted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
    }
    exports.$mu = $mu;
    /**
     * An event describing that line(s) have been inserted in a model.
     * @internal
     */
    class $nu {
        constructor(fromLineNumber, toLineNumber, detail, injectedTexts) {
            this.changeType = 4 /* RawContentChangedType.LinesInserted */;
            this.injectedTexts = injectedTexts;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
            this.detail = detail;
        }
    }
    exports.$nu = $nu;
    /**
     * An event describing that a model has had its EOL changed.
     * @internal
     */
    class $ou {
        constructor() {
            this.changeType = 5 /* RawContentChangedType.EOLChanged */;
        }
    }
    exports.$ou = $ou;
    /**
     * An event describing a change in the text of a model.
     * @internal
     */
    class $pu {
        constructor(changes, versionId, isUndoing, isRedoing) {
            this.changes = changes;
            this.versionId = versionId;
            this.isUndoing = isUndoing;
            this.isRedoing = isRedoing;
            this.resultingSelection = null;
        }
        containsEvent(type) {
            for (let i = 0, len = this.changes.length; i < len; i++) {
                const change = this.changes[i];
                if (change.changeType === type) {
                    return true;
                }
            }
            return false;
        }
        static merge(a, b) {
            const changes = [].concat(a.changes).concat(b.changes);
            const versionId = b.versionId;
            const isUndoing = (a.isUndoing || b.isUndoing);
            const isRedoing = (a.isRedoing || b.isRedoing);
            return new $pu(changes, versionId, isUndoing, isRedoing);
        }
    }
    exports.$pu = $pu;
    /**
     * An event describing a change in injected text.
     * @internal
     */
    class $qu {
        constructor(changes) {
            this.changes = changes;
        }
    }
    exports.$qu = $qu;
    /**
     * @internal
     */
    class $ru {
        constructor(rawContentChangedEvent, contentChangedEvent) {
            this.rawContentChangedEvent = rawContentChangedEvent;
            this.contentChangedEvent = contentChangedEvent;
        }
        merge(other) {
            const rawContentChangedEvent = $pu.merge(this.rawContentChangedEvent, other.rawContentChangedEvent);
            const contentChangedEvent = $ru.c(this.contentChangedEvent, other.contentChangedEvent);
            return new $ru(rawContentChangedEvent, contentChangedEvent);
        }
        static c(a, b) {
            const changes = [].concat(a.changes).concat(b.changes);
            const eol = b.eol;
            const versionId = b.versionId;
            const isUndoing = (a.isUndoing || b.isUndoing);
            const isRedoing = (a.isRedoing || b.isRedoing);
            const isFlush = (a.isFlush || b.isFlush);
            const isEolChange = a.isEolChange && b.isEolChange; // both must be true to not confuse listeners who skip such edits
            return {
                changes: changes,
                eol: eol,
                isEolChange: isEolChange,
                versionId: versionId,
                isUndoing: isUndoing,
                isRedoing: isRedoing,
                isFlush: isFlush,
            };
        }
    }
    exports.$ru = $ru;
});
//# sourceMappingURL=textModelEvents.js.map