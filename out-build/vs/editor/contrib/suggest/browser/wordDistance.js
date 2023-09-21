/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/editor/contrib/smartSelect/browser/bracketSelections"], function (require, exports, arrays_1, range_1, bracketSelections_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P5 = void 0;
    class $P5 {
        static { this.None = new class extends $P5 {
            distance() { return 0; }
        }; }
        static async create(service, editor) {
            if (!editor.getOption(117 /* EditorOption.suggest */).localityBonus) {
                return $P5.None;
            }
            if (!editor.hasModel()) {
                return $P5.None;
            }
            const model = editor.getModel();
            const position = editor.getPosition();
            if (!service.canComputeWordRanges(model.uri)) {
                return $P5.None;
            }
            const [ranges] = await new bracketSelections_1.$O5().provideSelectionRanges(model, [position]);
            if (ranges.length === 0) {
                return $P5.None;
            }
            const wordRanges = await service.computeWordRanges(model.uri, ranges[0].range);
            if (!wordRanges) {
                return $P5.None;
            }
            // remove current word
            const wordUntilPos = model.getWordUntilPosition(position);
            delete wordRanges[wordUntilPos.word];
            return new class extends $P5 {
                distance(anchor, item) {
                    if (!position.equals(editor.getPosition())) {
                        return 0;
                    }
                    if (item.kind === 17 /* CompletionItemKind.Keyword */) {
                        return 2 << 20;
                    }
                    const word = typeof item.label === 'string' ? item.label : item.label.label;
                    const wordLines = wordRanges[word];
                    if ((0, arrays_1.$Ib)(wordLines)) {
                        return 2 << 20;
                    }
                    const idx = (0, arrays_1.$ub)(wordLines, range_1.$ks.fromPositions(anchor), range_1.$ks.compareRangesUsingStarts);
                    const bestWordRange = idx >= 0 ? wordLines[idx] : wordLines[Math.max(0, ~idx - 1)];
                    let blockDistance = ranges.length;
                    for (const range of ranges) {
                        if (!range_1.$ks.containsRange(range.range, bestWordRange)) {
                            break;
                        }
                        blockDistance -= 1;
                    }
                    return blockDistance;
                }
            };
        }
    }
    exports.$P5 = $P5;
});
//# sourceMappingURL=wordDistance.js.map