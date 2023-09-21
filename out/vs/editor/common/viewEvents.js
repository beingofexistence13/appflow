/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewZonesChangedEvent = exports.ViewTokensColorsChangedEvent = exports.ViewTokensChangedEvent = exports.ViewThemeChangedEvent = exports.ViewScrollChangedEvent = exports.ViewRevealRangeRequestEvent = exports.VerticalRevealType = exports.ViewLinesInsertedEvent = exports.ViewLinesDeletedEvent = exports.ViewLinesChangedEvent = exports.ViewLineMappingChangedEvent = exports.ViewLanguageConfigurationEvent = exports.ViewFocusChangedEvent = exports.ViewFlushedEvent = exports.ViewDecorationsChangedEvent = exports.ViewCursorStateChangedEvent = exports.ViewConfigurationChangedEvent = exports.ViewCompositionEndEvent = exports.ViewCompositionStartEvent = exports.ViewEventType = void 0;
    var ViewEventType;
    (function (ViewEventType) {
        ViewEventType[ViewEventType["ViewCompositionStart"] = 0] = "ViewCompositionStart";
        ViewEventType[ViewEventType["ViewCompositionEnd"] = 1] = "ViewCompositionEnd";
        ViewEventType[ViewEventType["ViewConfigurationChanged"] = 2] = "ViewConfigurationChanged";
        ViewEventType[ViewEventType["ViewCursorStateChanged"] = 3] = "ViewCursorStateChanged";
        ViewEventType[ViewEventType["ViewDecorationsChanged"] = 4] = "ViewDecorationsChanged";
        ViewEventType[ViewEventType["ViewFlushed"] = 5] = "ViewFlushed";
        ViewEventType[ViewEventType["ViewFocusChanged"] = 6] = "ViewFocusChanged";
        ViewEventType[ViewEventType["ViewLanguageConfigurationChanged"] = 7] = "ViewLanguageConfigurationChanged";
        ViewEventType[ViewEventType["ViewLineMappingChanged"] = 8] = "ViewLineMappingChanged";
        ViewEventType[ViewEventType["ViewLinesChanged"] = 9] = "ViewLinesChanged";
        ViewEventType[ViewEventType["ViewLinesDeleted"] = 10] = "ViewLinesDeleted";
        ViewEventType[ViewEventType["ViewLinesInserted"] = 11] = "ViewLinesInserted";
        ViewEventType[ViewEventType["ViewRevealRangeRequest"] = 12] = "ViewRevealRangeRequest";
        ViewEventType[ViewEventType["ViewScrollChanged"] = 13] = "ViewScrollChanged";
        ViewEventType[ViewEventType["ViewThemeChanged"] = 14] = "ViewThemeChanged";
        ViewEventType[ViewEventType["ViewTokensChanged"] = 15] = "ViewTokensChanged";
        ViewEventType[ViewEventType["ViewTokensColorsChanged"] = 16] = "ViewTokensColorsChanged";
        ViewEventType[ViewEventType["ViewZonesChanged"] = 17] = "ViewZonesChanged";
    })(ViewEventType || (exports.ViewEventType = ViewEventType = {}));
    class ViewCompositionStartEvent {
        constructor() {
            this.type = 0 /* ViewEventType.ViewCompositionStart */;
        }
    }
    exports.ViewCompositionStartEvent = ViewCompositionStartEvent;
    class ViewCompositionEndEvent {
        constructor() {
            this.type = 1 /* ViewEventType.ViewCompositionEnd */;
        }
    }
    exports.ViewCompositionEndEvent = ViewCompositionEndEvent;
    class ViewConfigurationChangedEvent {
        constructor(source) {
            this.type = 2 /* ViewEventType.ViewConfigurationChanged */;
            this._source = source;
        }
        hasChanged(id) {
            return this._source.hasChanged(id);
        }
    }
    exports.ViewConfigurationChangedEvent = ViewConfigurationChangedEvent;
    class ViewCursorStateChangedEvent {
        constructor(selections, modelSelections, reason) {
            this.selections = selections;
            this.modelSelections = modelSelections;
            this.reason = reason;
            this.type = 3 /* ViewEventType.ViewCursorStateChanged */;
        }
    }
    exports.ViewCursorStateChangedEvent = ViewCursorStateChangedEvent;
    class ViewDecorationsChangedEvent {
        constructor(source) {
            this.type = 4 /* ViewEventType.ViewDecorationsChanged */;
            if (source) {
                this.affectsMinimap = source.affectsMinimap;
                this.affectsOverviewRuler = source.affectsOverviewRuler;
                this.affectsGlyphMargin = source.affectsGlyphMargin;
            }
            else {
                this.affectsMinimap = true;
                this.affectsOverviewRuler = true;
                this.affectsGlyphMargin = true;
            }
        }
    }
    exports.ViewDecorationsChangedEvent = ViewDecorationsChangedEvent;
    class ViewFlushedEvent {
        constructor() {
            this.type = 5 /* ViewEventType.ViewFlushed */;
            // Nothing to do
        }
    }
    exports.ViewFlushedEvent = ViewFlushedEvent;
    class ViewFocusChangedEvent {
        constructor(isFocused) {
            this.type = 6 /* ViewEventType.ViewFocusChanged */;
            this.isFocused = isFocused;
        }
    }
    exports.ViewFocusChangedEvent = ViewFocusChangedEvent;
    class ViewLanguageConfigurationEvent {
        constructor() {
            this.type = 7 /* ViewEventType.ViewLanguageConfigurationChanged */;
        }
    }
    exports.ViewLanguageConfigurationEvent = ViewLanguageConfigurationEvent;
    class ViewLineMappingChangedEvent {
        constructor() {
            this.type = 8 /* ViewEventType.ViewLineMappingChanged */;
            // Nothing to do
        }
    }
    exports.ViewLineMappingChangedEvent = ViewLineMappingChangedEvent;
    class ViewLinesChangedEvent {
        constructor(
        /**
         * The first line that has changed.
         */
        fromLineNumber, 
        /**
         * The number of lines that have changed.
         */
        count) {
            this.fromLineNumber = fromLineNumber;
            this.count = count;
            this.type = 9 /* ViewEventType.ViewLinesChanged */;
        }
    }
    exports.ViewLinesChangedEvent = ViewLinesChangedEvent;
    class ViewLinesDeletedEvent {
        constructor(fromLineNumber, toLineNumber) {
            this.type = 10 /* ViewEventType.ViewLinesDeleted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
    }
    exports.ViewLinesDeletedEvent = ViewLinesDeletedEvent;
    class ViewLinesInsertedEvent {
        constructor(fromLineNumber, toLineNumber) {
            this.type = 11 /* ViewEventType.ViewLinesInserted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
    }
    exports.ViewLinesInsertedEvent = ViewLinesInsertedEvent;
    var VerticalRevealType;
    (function (VerticalRevealType) {
        VerticalRevealType[VerticalRevealType["Simple"] = 0] = "Simple";
        VerticalRevealType[VerticalRevealType["Center"] = 1] = "Center";
        VerticalRevealType[VerticalRevealType["CenterIfOutsideViewport"] = 2] = "CenterIfOutsideViewport";
        VerticalRevealType[VerticalRevealType["Top"] = 3] = "Top";
        VerticalRevealType[VerticalRevealType["Bottom"] = 4] = "Bottom";
        VerticalRevealType[VerticalRevealType["NearTop"] = 5] = "NearTop";
        VerticalRevealType[VerticalRevealType["NearTopIfOutsideViewport"] = 6] = "NearTopIfOutsideViewport";
    })(VerticalRevealType || (exports.VerticalRevealType = VerticalRevealType = {}));
    class ViewRevealRangeRequestEvent {
        constructor(
        /**
         * Source of the call that caused the event.
         */
        source, 
        /**
         * Reduce the revealing to a minimum (e.g. avoid scrolling if the bounding box is visible and near the viewport edge).
         */
        minimalReveal, 
        /**
         * Range to be reavealed.
         */
        range, 
        /**
         * Selections to be revealed.
         */
        selections, 
        /**
         * The vertical reveal strategy.
         */
        verticalType, 
        /**
         * If true: there should be a horizontal & vertical revealing.
         * If false: there should be just a vertical revealing.
         */
        revealHorizontal, 
        /**
         * The scroll type.
         */
        scrollType) {
            this.source = source;
            this.minimalReveal = minimalReveal;
            this.range = range;
            this.selections = selections;
            this.verticalType = verticalType;
            this.revealHorizontal = revealHorizontal;
            this.scrollType = scrollType;
            this.type = 12 /* ViewEventType.ViewRevealRangeRequest */;
        }
    }
    exports.ViewRevealRangeRequestEvent = ViewRevealRangeRequestEvent;
    class ViewScrollChangedEvent {
        constructor(source) {
            this.type = 13 /* ViewEventType.ViewScrollChanged */;
            this.scrollWidth = source.scrollWidth;
            this.scrollLeft = source.scrollLeft;
            this.scrollHeight = source.scrollHeight;
            this.scrollTop = source.scrollTop;
            this.scrollWidthChanged = source.scrollWidthChanged;
            this.scrollLeftChanged = source.scrollLeftChanged;
            this.scrollHeightChanged = source.scrollHeightChanged;
            this.scrollTopChanged = source.scrollTopChanged;
        }
    }
    exports.ViewScrollChangedEvent = ViewScrollChangedEvent;
    class ViewThemeChangedEvent {
        constructor(theme) {
            this.theme = theme;
            this.type = 14 /* ViewEventType.ViewThemeChanged */;
        }
    }
    exports.ViewThemeChangedEvent = ViewThemeChangedEvent;
    class ViewTokensChangedEvent {
        constructor(ranges) {
            this.type = 15 /* ViewEventType.ViewTokensChanged */;
            this.ranges = ranges;
        }
    }
    exports.ViewTokensChangedEvent = ViewTokensChangedEvent;
    class ViewTokensColorsChangedEvent {
        constructor() {
            this.type = 16 /* ViewEventType.ViewTokensColorsChanged */;
            // Nothing to do
        }
    }
    exports.ViewTokensColorsChangedEvent = ViewTokensColorsChangedEvent;
    class ViewZonesChangedEvent {
        constructor() {
            this.type = 17 /* ViewEventType.ViewZonesChanged */;
            // Nothing to do
        }
    }
    exports.ViewZonesChangedEvent = ViewZonesChangedEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld0V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsSUFBa0IsYUFtQmpCO0lBbkJELFdBQWtCLGFBQWE7UUFDOUIsaUZBQW9CLENBQUE7UUFDcEIsNkVBQWtCLENBQUE7UUFDbEIseUZBQXdCLENBQUE7UUFDeEIscUZBQXNCLENBQUE7UUFDdEIscUZBQXNCLENBQUE7UUFDdEIsK0RBQVcsQ0FBQTtRQUNYLHlFQUFnQixDQUFBO1FBQ2hCLHlHQUFnQyxDQUFBO1FBQ2hDLHFGQUFzQixDQUFBO1FBQ3RCLHlFQUFnQixDQUFBO1FBQ2hCLDBFQUFnQixDQUFBO1FBQ2hCLDRFQUFpQixDQUFBO1FBQ2pCLHNGQUFzQixDQUFBO1FBQ3RCLDRFQUFpQixDQUFBO1FBQ2pCLDBFQUFnQixDQUFBO1FBQ2hCLDRFQUFpQixDQUFBO1FBQ2pCLHdGQUF1QixDQUFBO1FBQ3ZCLDBFQUFnQixDQUFBO0lBQ2pCLENBQUMsRUFuQmlCLGFBQWEsNkJBQWIsYUFBYSxRQW1COUI7SUFFRCxNQUFhLHlCQUF5QjtRQUVyQztZQURnQixTQUFJLDhDQUFzQztRQUMxQyxDQUFDO0tBQ2pCO0lBSEQsOERBR0M7SUFFRCxNQUFhLHVCQUF1QjtRQUVuQztZQURnQixTQUFJLDRDQUFvQztRQUN4QyxDQUFDO0tBQ2pCO0lBSEQsMERBR0M7SUFFRCxNQUFhLDZCQUE2QjtRQU16QyxZQUFZLE1BQWlDO1lBSjdCLFNBQUksa0RBQTBDO1lBSzdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxVQUFVLENBQUMsRUFBZ0I7WUFDakMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQ0Q7SUFi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