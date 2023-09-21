/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/assert", "vs/editor/common/services/editorWorker", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, assert_1, editorWorker_1, configuration_1, lineRange_1, mapping_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toRangeMapping = exports.toLineRange = exports.MergeDiffComputer = void 0;
    let MergeDiffComputer = class MergeDiffComputer {
        constructor(editorWorkerService, configurationService) {
            this.editorWorkerService = editorWorkerService;
            this.configurationService = configurationService;
            this.mergeAlgorithm = (0, utils_1.observableConfigValue)('mergeEditor.diffAlgorithm', 'advanced', this.configurationService)
                .map(v => v === 'smart' ? 'legacy' : v === 'experimental' ? 'advanced' : v);
        }
        async computeDiff(textModel1, textModel2, reader) {
            const diffAlgorithm = this.mergeAlgorithm.read(reader);
            const result = await this.editorWorkerService.computeDiff(textModel1.uri, textModel2.uri, {
                ignoreTrimWhitespace: false,
                maxComputationTimeMs: 0,
                computeMoves: false,
            }, diffAlgorithm);
            if (!result) {
                throw new Error('Diff computation failed');
            }
            if (textModel1.isDisposed() || textModel2.isDisposed()) {
                return { diffs: null };
            }
            const changes = result.changes.map(c => new mapping_1.DetailedLineRangeMapping(toLineRange(c.original), textModel1, toLineRange(c.modified), textModel2, c.innerChanges?.map(ic => toRangeMapping(ic))));
            (0, assert_1.assertFn)(() => {
                for (const c of changes) {
                    const inputRange = c.inputRange;
                    const outputRange = c.outputRange;
                    const inputTextModel = c.inputTextModel;
                    const outputTextModel = c.outputTextModel;
                    for (const map of c.rangeMappings) {
                        let inputRangesValid = inputRange.startLineNumber - 1 <= map.inputRange.startLineNumber
                            && map.inputRange.endLineNumber <= inputRange.endLineNumberExclusive;
                        if (inputRangesValid && map.inputRange.startLineNumber === inputRange.startLineNumber - 1) {
                            inputRangesValid = map.inputRange.endColumn >= inputTextModel.getLineMaxColumn(map.inputRange.startLineNumber);
                        }
                        if (inputRangesValid && map.inputRange.endLineNumber === inputRange.endLineNumberExclusive) {
                            inputRangesValid = map.inputRange.endColumn === 1;
                        }
                        let outputRangesValid = outputRange.startLineNumber - 1 <= map.outputRange.startLineNumber
                            && map.outputRange.endLineNumber <= outputRange.endLineNumberExclusive;
                        if (outputRangesValid && map.outputRange.startLineNumber === outputRange.startLineNumber - 1) {
                            outputRangesValid = map.outputRange.endColumn >= outputTextModel.getLineMaxColumn(map.outputRange.endLineNumber);
                        }
                        if (outputRangesValid && map.outputRange.endLineNumber === outputRange.endLineNumberExclusive) {
                            outputRangesValid = map.outputRange.endColumn === 1;
                        }
                        if (!inputRangesValid || !outputRangesValid) {
                            return false;
                        }
                    }
                }
                return changes.length === 0 || (changes[0].inputRange.startLineNumber === changes[0].outputRange.startLineNumber &&
                    (0, assert_1.checkAdjacentItems)(changes, (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive &&
                        // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                        m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber &&
                        m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber));
            });
            return {
                diffs: changes
            };
        }
    };
    exports.MergeDiffComputer = MergeDiffComputer;
    exports.MergeDiffComputer = MergeDiffComputer = __decorate([
        __param(0, editorWorker_1.IEditorWorkerService),
        __param(1, configuration_1.IConfigurationService)
    ], MergeDiffComputer);
    function toLineRange(range) {
        return new lineRange_1.LineRange(range.startLineNumber, range.length);
    }
    exports.toLineRange = toLineRange;
    function toRangeMapping(mapping) {
        return new mapping_1.RangeMapping(mapping.originalRange, mapping.modifiedRange);
    }
    exports.toRangeMapping = toRangeMapping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkNvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tb2RlbC9kaWZmQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjtRQUs3QixZQUN1QixtQkFBMEQsRUFDekQsb0JBQTREO1lBRDVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQU5uRSxtQkFBYyxHQUFHLElBQUEsNkJBQXFCLEVBQ3RELDJCQUEyQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUM7aUJBQ2xFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQU03RSxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFzQixFQUFFLFVBQXNCLEVBQUUsTUFBZTtZQUNoRixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQ3hELFVBQVUsQ0FBQyxHQUFHLEVBQ2QsVUFBVSxDQUFDLEdBQUcsRUFDZDtnQkFDQyxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixZQUFZLEVBQUUsS0FBSzthQUNuQixFQUNELGFBQWEsQ0FDYixDQUFDO1lB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