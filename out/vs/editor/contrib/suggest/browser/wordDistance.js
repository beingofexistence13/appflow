/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/editor/contrib/smartSelect/browser/bracketSelections"], function (require, exports, arrays_1, range_1, bracketSelections_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordDistance = void 0;
    class WordDistance {
        static { this.None = new class extends WordDistance {
            distance() { return 0; }
        }; }
        static async create(service, editor) {
            if (!editor.getOption(117 /* EditorOption.suggest */).localityBonus) {
                return WordDistance.None;
            }
            if (!editor.hasModel()) {
                return WordDistance.None;
            }
            const model = editor.getModel();
            const position = editor.getPosition();
            if (!service.canComputeWordRanges(model.uri)) {
                return WordDistance.None;
            }
            const [ranges] = await new bracketSelections_1.BracketSelectionRangeProvider().provideSelectionRanges(model, [position]);
            if (ranges.length === 0) {
                return WordDistance.None;
            }
            const wordRanges = await service.computeWordRanges(model.uri, ranges[0].range);
            if (!wordRanges) {
                return WordDistance.None;
            }
            // remove current word
            const wordUntilPos = model.getWordUntilPosition(position);
            delete wordRanges[wordUntilPos.word];
            return new class extends WordDistance {
                distance(anchor, item) {
                    if (!position.equals(editor.getPosition())) {
                        return 0;
                    }
                    if (item.kind === 17 /* CompletionItemKind.Keyword */) {
                        return 2 << 20;
                    }
                    const word = typeof item.label === 'string' ? item.label : item.label.label;
                    const wordLines = wordRanges[word];
                    if ((0, arrays_1.isFalsyOrEmpty)(wordLines)) {
                        return 2 << 20;
                    }
                    const idx = (0, arrays_1.binarySearch)(wordLines, range_1.Range.fromPositions(anchor), range_1.Range.compareRangesUsingStarts);
                    const bestWordRange = idx >= 0 ? wordLines[idx] : wordLines[Math.max(0, ~idx - 1)];
                    let blockDistance = ranges.length;
                    for (const range of ranges) {
                        if (!range_1.Range.containsRange(range.range, bestWordRange)) {
                            break;
                        }
                        blockDistance -= 1;
                    }
                    return blockDistance;
                }
            };
        }
    }
    exports.WordDistance = WordDistance;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZERpc3RhbmNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL3dvcmREaXN0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBc0IsWUFBWTtpQkFFakIsU0FBSSxHQUFHLElBQUksS0FBTSxTQUFRLFlBQVk7WUFDcEQsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QixDQUFDO1FBRUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBNkIsRUFBRSxNQUFtQjtZQUVyRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsZ0NBQXNCLENBQUMsYUFBYSxFQUFFO2dCQUMxRCxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUN2QixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXRDLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLGlEQUE2QixFQUFFLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUM7YUFDekI7WUFFRCxzQkFBc0I7WUFDdEIsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFELE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQyxPQUFPLElBQUksS0FBTSxTQUFRLFlBQVk7Z0JBQ3BDLFFBQVEsQ0FBQyxNQUFpQixFQUFFLElBQW9CO29CQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTt3QkFDM0MsT0FBTyxDQUFDLENBQUM7cUJBQ1Q7b0JBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSx3Q0FBK0IsRUFBRTt3QkFDN0MsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUNmO29CQUNELE1BQU0sSUFBSSxHQUFHLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO29CQUM1RSxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLElBQUksSUFBQSx1QkFBYyxFQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUM5QixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7cUJBQ2Y7b0JBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxxQkFBWSxFQUFDLFNBQVMsRUFBRSxhQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUNqRyxNQUFNLGFBQWEsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuRixJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO29CQUNsQyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTt3QkFDM0IsSUFBSSxDQUFDLGFBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsRUFBRTs0QkFDckQsTUFBTTt5QkFDTjt3QkFDRCxhQUFhLElBQUksQ0FBQyxDQUFDO3FCQUNuQjtvQkFDRCxPQUFPLGFBQWEsQ0FBQztnQkFDdEIsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDOztJQTlERixvQ0FpRUMifQ==