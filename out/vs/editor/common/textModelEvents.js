/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalModelContentChangeEvent = exports.ModelInjectedTextChangedEvent = exports.ModelRawContentChangedEvent = exports.ModelRawEOLChanged = exports.ModelRawLinesInserted = exports.ModelRawLinesDeleted = exports.ModelRawLineChanged = exports.LineInjectedText = exports.ModelRawFlush = exports.RawContentChangedType = void 0;
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
    class ModelRawFlush {
        constructor() {
            this.changeType = 1 /* RawContentChangedType.Flush */;
        }
    }
    exports.ModelRawFlush = ModelRawFlush;
    /**
     * Represents text injected on a line
     * @internal
     */
    class LineInjectedText {
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
                    result.push(new LineInjectedText(decoration.ownerId, decoration.range.startLineNumber, decoration.range.startColumn, decoration.options.before, 0));
                }
                if (decoration.options.after && decoration.options.after.content.length > 0) {
                    result.push(new LineInjectedText(decoration.ownerId, decoration.range.endLineNumber, decoration.range.endColumn, decoration.options.after, 1));
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
            return new LineInjectedText(this.ownerId, this.lineNumber, this.column, { ...this.options, content: text }, this.order);
        }
    }
    exports.LineInjectedText = LineInjectedText;
    /**
     * An event describing that a line has changed in a model.
     * @internal
     */
    class ModelRawLineChanged {
        constructor(lineNumber, detail, injectedText) {
            this.changeType = 2 /* RawContentChangedType.LineChanged */;
            this.lineNumber = lineNumber;
            this.detail = detail;
            this.injectedText = injectedText;
        }
    }
    exports.ModelRawLineChanged = ModelRawLineChanged;
    /**
     * An event describing that line(s) have been deleted in a model.
     * @internal
     */
    class ModelRawLinesDeleted {
        constructor(fromLineNumber, toLineNumber) {
            this.changeType = 3 /* RawContentChangedType.LinesDeleted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
    }
    exports.ModelRawLinesDeleted = ModelRawLinesDeleted;
    /**
     * An event describing that line(s) have been inserted in a model.
     * @internal
     */
    class ModelRawLinesInserted {
        constructor(fromLineNumber, toLineNumber, detail, injectedTexts) {
            this.changeType = 4 /* RawContentChangedType.LinesInserted */;
            this.injectedTexts = injectedTexts;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
            this.detail = detail;
        }
    }
    exports.ModelRawLinesInserted = ModelRawLinesInserted;
    /**
     * An event describing that a model has had its EOL changed.
     * @internal
     */
    class ModelRawEOLChanged {
        constructor() {
            this.changeType = 5 /* RawContentChangedType.EOLChanged */;
        }
    }
    exports.ModelRawEOLChanged = ModelRawEOLChanged;
    /**
     * An event describing a change in the text of a model.
     * @internal
     */
    class ModelRawContentChangedEvent {
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
            return new ModelRawContentChangedEvent(changes, versionId, isUndoing, isRedoing);
        }
    }
    exports.ModelRawContentChangedEvent = ModelRawContentChangedEvent;
    /**
     * An event describing a change in injected text.
     * @internal
     */
    class ModelInjectedTextChangedEvent {
        constructor(changes) {
            this.changes = changes;
        }
    }
    exports.ModelInjectedTextChangedEvent = ModelInjectedTextChangedEvent;
    /**
     * @internal
     */
    class InternalModelContentChangeEvent {
        constructor(rawContentChangedEvent, contentChangedEvent) {
            this.rawContentChangedEvent = rawContentChangedEvent;
            this.contentChangedEvent = contentChangedEvent;
        }
        merge(other) {
            const rawContentChangedEvent = ModelRawContentChangedEvent.merge(this.rawContentChangedEvent, other.rawContentChangedEvent);
            const contentChangedEvent = InternalModelContentChangeEvent._mergeChangeEvents(this.contentChangedEvent, other.contentChangedEvent);
            return new InternalModelContentChangeEvent(rawContentChangedEvent, contentChangedEvent);
        }
        static _mergeChangeEvents(a, b) {
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
    exports.InternalModelContentChangeEvent = InternalModelContentChangeEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsRXZlbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi90ZXh0TW9kZWxFdmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUhoRzs7T0FFRztJQUNILElBQWtCLHFCQU1qQjtJQU5ELFdBQWtCLHFCQUFxQjtRQUN0QyxtRUFBUyxDQUFBO1FBQ1QsK0VBQWUsQ0FBQTtRQUNmLGlGQUFnQixDQUFBO1FBQ2hCLG1GQUFpQixDQUFBO1FBQ2pCLDZFQUFjLENBQUE7SUFDZixDQUFDLEVBTmlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBTXRDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBYSxhQUFhO1FBQTFCO1lBQ2lCLGVBQVUsdUNBQStCO1FBQzFELENBQUM7S0FBQTtJQUZELHNDQUVDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBYSxnQkFBZ0I7UUFDckIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFFBQWdCLEVBQUUsYUFBd0M7WUFDekYsSUFBSSxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakQsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFDRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7WUFDM0IsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7Z0JBQ3pDLE1BQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDdkM7WUFDRCxNQUFNLElBQUksUUFBUSxDQUFD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