/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/decorations", "vs/editor/browser/widget/diffEditor/movedBlocksLines", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, lifecycle_1, observable_1, decorations_1, movedBlocksLines_1, utils_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorDecorations = void 0;
    class DiffEditorDecorations extends lifecycle_1.Disposable {
        constructor(_editors, _diffModel, _options) {
            super();
            this._editors = _editors;
            this._diffModel = _diffModel;
            this._options = _options;
            this._decorations = (0, observable_1.derived)(this, (reader) => {
                const diff = this._diffModel.read(reader)?.diff.read(reader);
                if (!diff) {
                    return null;
                }
                const movedTextToCompare = this._diffModel.read(reader).movedTextToCompare.read(reader);
                const renderIndicators = this._options.renderIndicators.read(reader);
                const showEmptyDecorations = this._options.showEmptyDecorations.read(reader);
                const originalDecorations = [];
                const modifiedDecorations = [];
                if (!movedTextToCompare) {
                    for (const m of diff.mappings) {
                        if (!m.lineRangeMapping.original.isEmpty) {
                            originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: renderIndicators ? decorations_1.diffLineDeleteDecorationBackgroundWithIndicator : decorations_1.diffLineDeleteDecorationBackground });
                        }
                        if (!m.lineRangeMapping.modified.isEmpty) {
                            modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: renderIndicators ? decorations_1.diffLineAddDecorationBackgroundWithIndicator : decorations_1.diffLineAddDecorationBackground });
                        }
                        if (m.lineRangeMapping.modified.isEmpty || m.lineRangeMapping.original.isEmpty) {
                            if (!m.lineRangeMapping.original.isEmpty) {
                                originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: decorations_1.diffWholeLineDeleteDecoration });
                            }
                            if (!m.lineRangeMapping.modified.isEmpty) {
                                modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: decorations_1.diffWholeLineAddDecoration });
                            }
                        }
                        else {
                            for (const i of m.lineRangeMapping.innerChanges || []) {
                                // Don't show empty markers outside the line range
                                if (m.lineRangeMapping.original.contains(i.originalRange.startLineNumber)) {
                                    originalDecorations.push({ range: i.originalRange, options: (i.originalRange.isEmpty() && showEmptyDecorations) ? decorations_1.diffDeleteDecorationEmpty : decorations_1.diffDeleteDecoration });
                                }
                                if (m.lineRangeMapping.modified.contains(i.modifiedRange.startLineNumber)) {
                                    modifiedDecorations.push({ range: i.modifiedRange, options: (i.modifiedRange.isEmpty() && showEmptyDecorations) ? decorations_1.diffAddDecorationEmpty : decorations_1.diffAddDecoration });
                                }
                            }
                        }
                        if (!m.lineRangeMapping.modified.isEmpty && this._options.shouldRenderRevertArrows.read(reader) && !movedTextToCompare) {
                            modifiedDecorations.push({ range: range_1.Range.fromPositions(new position_1.Position(m.lineRangeMapping.modified.startLineNumber, 1)), options: decorations_1.arrowRevertChange });
                        }
                    }
                }
                if (movedTextToCompare) {
                    for (const m of movedTextToCompare.changes) {
                        const fullRangeOriginal = m.original.toInclusiveRange();
                        if (fullRangeOriginal) {
                            originalDecorations.push({ range: fullRangeOriginal, options: renderIndicators ? decorations_1.diffLineDeleteDecorationBackgroundWithIndicator : decorations_1.diffLineDeleteDecorationBackground });
                        }
                        const fullRangeModified = m.modified.toInclusiveRange();
                        if (fullRangeModified) {
                            modifiedDecorations.push({ range: fullRangeModified, options: renderIndicators ? decorations_1.diffLineAddDecorationBackgroundWithIndicator : decorations_1.diffLineAddDecorationBackground });
                        }
                        for (const i of m.innerChanges || []) {
                            originalDecorations.push({ range: i.originalRange, options: decorations_1.diffDeleteDecoration });
                            modifiedDecorations.push({ range: i.modifiedRange, options: decorations_1.diffAddDecoration });
                        }
                    }
                }
                const activeMovedText = this._diffModel.read(reader).activeMovedText.read(reader);
                for (const m of diff.movedTexts) {
                    originalDecorations.push({
                        range: m.lineRangeMapping.original.toInclusiveRange(), options: {
                            description: 'moved',
                            blockClassName: 'movedOriginal' + (m === activeMovedText ? ' currentMove' : ''),
                            blockPadding: [movedBlocksLines_1.MovedBlocksLinesPart.movedCodeBlockPadding, 0, movedBlocksLines_1.MovedBlocksLinesPart.movedCodeBlockPadding, movedBlocksLines_1.MovedBlocksLinesPart.movedCodeBlockPadding],
                        }
                    });
                    modifiedDecorations.push({
                        range: m.lineRangeMapping.modified.toInclusiveRange(), options: {
                            description: 'moved',
                            blockClassName: 'movedModified' + (m === activeMovedText ? ' currentMove' : ''),
                            blockPadding: [4, 0, 4, 4],
                        }
                    });
                }
                return { originalDecorations, modifiedDecorations };
            });
            this._register((0, utils_1.applyObservableDecorations)(this._editors.original, this._decorations.map(d => d?.originalDecorations || [])));
            this._register((0, utils_1.applyObservableDecorations)(this._editors.modified, this._decorations.map(d => d?.modifiedDecorations || [])));
        }
    }
    exports.DiffEditorDecorations = DiffEditorDecorations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvckRlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2RpZmZFZGl0b3IvZGlmZkVkaXRvckRlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLHFCQUFzQixTQUFRLHNCQUFVO1FBQ3BELFlBQ2tCLFFBQTJCLEVBQzNCLFVBQXdELEVBQ3hELFFBQTJCO1lBRTVDLEtBQUssRUFBRSxDQUFDO1lBSlMsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDM0IsZUFBVSxHQUFWLFVBQVUsQ0FBOEM7WUFDeEQsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFRNUIsaUJBQVksR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRTdFLE1BQU0sbUJBQW1CLEdBQTRCLEVBQUUsQ0FB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