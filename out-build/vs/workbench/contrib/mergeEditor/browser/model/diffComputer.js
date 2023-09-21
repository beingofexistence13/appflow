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
    exports.$wjb = exports.$vjb = exports.$ujb = void 0;
    let $ujb = class $ujb {
        constructor(b, d) {
            this.b = b;
            this.d = d;
            this.a = (0, utils_1.$fjb)('mergeEditor.diffAlgorithm', 'advanced', this.d)
                .map(v => v === 'smart' ? 'legacy' : v === 'experimental' ? 'advanced' : v);
        }
        async computeDiff(textModel1, textModel2, reader) {
            const diffAlgorithm = this.a.read(reader);
            const result = await this.b.computeDiff(textModel1.uri, textModel2.uri, {
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
            const changes = result.changes.map(c => new mapping_1.$rjb($vjb(c.original), textModel1, $vjb(c.modified), textModel2, c.innerChanges?.map(ic => $wjb(ic))));
            (0, assert_1.$xc)(() => {
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
                    (0, assert_1.$yc)(changes, (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive &&
                        // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                        m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber &&
                        m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber));
            });
            return {
                diffs: changes
            };
        }
    };
    exports.$ujb = $ujb;
    exports.$ujb = $ujb = __decorate([
        __param(0, editorWorker_1.$4Y),
        __param(1, configuration_1.$8h)
    ], $ujb);
    function $vjb(range) {
        return new lineRange_1.$6ib(range.startLineNumber, range.length);
    }
    exports.$vjb = $vjb;
    function $wjb(mapping) {
        return new mapping_1.$sjb(mapping.originalRange, mapping.modifiedRange);
    }
    exports.$wjb = $wjb;
});
//# sourceMappingURL=diffComputer.js.map