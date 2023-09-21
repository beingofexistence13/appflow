/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/decorations", "vs/editor/browser/widget/diffEditor/movedBlocksLines", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, lifecycle_1, observable_1, decorations_1, movedBlocksLines_1, utils_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MZ = void 0;
    class $MZ extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = (0, observable_1.derived)(this, (reader) => {
                const diff = this.b.read(reader)?.diff.read(reader);
                if (!diff) {
                    return null;
                }
                const movedTextToCompare = this.b.read(reader).movedTextToCompare.read(reader);
                const renderIndicators = this.c.renderIndicators.read(reader);
                const showEmptyDecorations = this.c.showEmptyDecorations.read(reader);
                const originalDecorations = [];
                const modifiedDecorations = [];
                if (!movedTextToCompare) {
                    for (const m of diff.mappings) {
                        if (!m.lineRangeMapping.original.isEmpty) {
                            originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: renderIndicators ? decorations_1.$BZ : decorations_1.$DZ });
                        }
                        if (!m.lineRangeMapping.modified.isEmpty) {
                            modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: renderIndicators ? decorations_1.$AZ : decorations_1.$CZ });
                        }
                        if (m.lineRangeMapping.modified.isEmpty || m.lineRangeMapping.original.isEmpty) {
                            if (!m.lineRangeMapping.original.isEmpty) {
                                originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: decorations_1.$IZ });
                            }
                            if (!m.lineRangeMapping.modified.isEmpty) {
                                modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: decorations_1.$FZ });
                            }
                        }
                        else {
                            for (const i of m.lineRangeMapping.innerChanges || []) {
                                // Don't show empty markers outside the line range
                                if (m.lineRangeMapping.original.contains(i.originalRange.startLineNumber)) {
                                    originalDecorations.push({ range: i.originalRange, options: (i.originalRange.isEmpty() && showEmptyDecorations) ? decorations_1.$JZ : decorations_1.$HZ });
                                }
                                if (m.lineRangeMapping.modified.contains(i.modifiedRange.startLineNumber)) {
                                    modifiedDecorations.push({ range: i.modifiedRange, options: (i.modifiedRange.isEmpty() && showEmptyDecorations) ? decorations_1.$GZ : decorations_1.$EZ });
                                }
                            }
                        }
                        if (!m.lineRangeMapping.modified.isEmpty && this.c.shouldRenderRevertArrows.read(reader) && !movedTextToCompare) {
                            modifiedDecorations.push({ range: range_1.$ks.fromPositions(new position_1.$js(m.lineRangeMapping.modified.startLineNumber, 1)), options: decorations_1.$KZ });
                        }
                    }
                }
                if (movedTextToCompare) {
                    for (const m of movedTextToCompare.changes) {
                        const fullRangeOriginal = m.original.toInclusiveRange();
                        if (fullRangeOriginal) {
                            originalDecorations.push({ range: fullRangeOriginal, options: renderIndicators ? decorations_1.$BZ : decorations_1.$DZ });
                        }
                        const fullRangeModified = m.modified.toInclusiveRange();
                        if (fullRangeModified) {
                            modifiedDecorations.push({ range: fullRangeModified, options: renderIndicators ? decorations_1.$AZ : decorations_1.$CZ });
                        }
                        for (const i of m.innerChanges || []) {
                            originalDecorations.push({ range: i.originalRange, options: decorations_1.$HZ });
                            modifiedDecorations.push({ range: i.modifiedRange, options: decorations_1.$EZ });
                        }
                    }
                }
                const activeMovedText = this.b.read(reader).activeMovedText.read(reader);
                for (const m of diff.movedTexts) {
                    originalDecorations.push({
                        range: m.lineRangeMapping.original.toInclusiveRange(), options: {
                            description: 'moved',
                            blockClassName: 'movedOriginal' + (m === activeMovedText ? ' currentMove' : ''),
                            blockPadding: [movedBlocksLines_1.$LZ.movedCodeBlockPadding, 0, movedBlocksLines_1.$LZ.movedCodeBlockPadding, movedBlocksLines_1.$LZ.movedCodeBlockPadding],
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
            this.B((0, utils_1.$9Y)(this.a.original, this.f.map(d => d?.originalDecorations || [])));
            this.B((0, utils_1.$9Y)(this.a.modified, this.f.map(d => d?.modifiedDecorations || [])));
        }
    }
    exports.$MZ = $MZ;
});
//# sourceMappingURL=diffEditorDecorations.js.map