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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/model", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/workbench/contrib/mergeEditor/browser/view/editorGutter", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "./codeEditorView"], function (require, exports, dom_1, actionbar_1, iconLabels_1, arrays_1, errors_1, lifecycle_1, observable_1, model_1, nls_1, actions_1, configuration_1, contextkey_1, instantiation_1, label_1, lineRange_1, utils_1, colors_1, editorGutter_1, mergeEditor_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$akb = void 0;
    let $akb = class $akb extends codeEditorView_1.$Wjb {
        constructor(viewModel, instantiationService, u, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.u = u;
            this.w = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = model.resultTextModel;
                const result = new Array();
                const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.join)(model.modifiedBaseRanges.read(reader), model.baseResultDiffs.read(reader), (baseRange, diff) => baseRange.baseRange.touches(diff.inputRange)
                    ? arrays_1.CompareResult.neitherLessOrGreaterThan
                    : lineRange_1.$6ib.compareByStart(baseRange.baseRange, diff.inputRange));
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                for (const m of baseRangeWithStoreAndTouchingDiffs) {
                    const modifiedBaseRange = m.left;
                    if (modifiedBaseRange) {
                        const blockClassNames = ['merge-editor-block'];
                        let blockPadding = [0, 0, 0, 0];
                        const isHandled = model.isHandled(modifiedBaseRange).read(reader);
                        if (isHandled) {
                            blockClassNames.push('handled');
                        }
                        if (modifiedBaseRange === activeModifiedBaseRange) {
                            blockClassNames.push('focused');
                            blockPadding = [0, 2, 0, 2];
                        }
                        if (modifiedBaseRange.isConflicting) {
                            blockClassNames.push('conflicting');
                        }
                        blockClassNames.push('result');
                        if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
                            continue;
                        }
                        const range = model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
                        result.push({
                            range: range.toInclusiveRangeOrEmpty(),
                            options: {
                                showIfCollapsed: true,
                                blockClassName: blockClassNames.join(' '),
                                blockPadding,
                                blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
                                description: 'Result Diff',
                                minimap: {
                                    position: model_1.MinimapPosition.Gutter,
                                    color: { id: isHandled ? colors_1.$Qjb : colors_1.$Rjb },
                                },
                                overviewRuler: modifiedBaseRange.isConflicting ? {
                                    position: model_1.OverviewRulerLane.Center,
                                    color: { id: isHandled ? colors_1.$Qjb : colors_1.$Rjb },
                                } : undefined
                            }
                        });
                    }
                    if (!modifiedBaseRange || modifiedBaseRange.isConflicting) {
                        for (const diff of m.rights) {
                            const range = diff.outputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff result`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            if (diff.rangeMappings) {
                                for (const d of diff.rangeMappings) {
                                    result.push({
                                        range: d.outputRange,
                                        options: {
                                            className: `merge-editor-diff-word result`,
                                            description: 'Merge Editor'
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
                return result;
            });
            this.editor.invokeWithinContext(accessor => {
                const contextKeyService = accessor.get(contextkey_1.$3i);
                const isMergeResultEditor = mergeEditor_1.$5jb.bindTo(contextKeyService);
                isMergeResultEditor.set(true);
                this.B((0, lifecycle_1.$ic)(() => isMergeResultEditor.reset()));
            });
            this.a.gutterDiv.style.width = '5px';
            this.a.root.classList.add(`result`);
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description update checkboxes */
                if (this.f.read(reader)) {
                    store.add(new editorGutter_1.$Vjb(this.editor, this.a.gutterDiv, {
                        getIntersectingGutterItems: (range, reader) => [],
                        createView: (item, target) => { throw new errors_1.$ab(); },
                    }));
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update labels & text model */
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(vm.model.resultTextModel);
                (0, dom_1.$_O)(this.a.title, ...(0, iconLabels_1.$xQ)((0, nls_1.localize)(0, null)));
                (0, dom_1.$_O)(this.a.description, ...(0, iconLabels_1.$xQ)(this.u.getUriLabel(vm.model.resultTextModel.uri, { relative: true })));
            }));
            const remainingConflictsActionBar = this.B(new actionbar_1.$1P(this.a.detail));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update remainingConflicts label */
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                const model = vm.model;
                if (!model) {
                    return;
                }
                const count = model.unhandledConflictsCount.read(reader);
                const text = count === 1
                    ? (0, nls_1.localize)(1, null, count)
                    : (0, nls_1.localize)(2, null, count);
                remainingConflictsActionBar.clear();
                remainingConflictsActionBar.push({
                    class: undefined,
                    enabled: count > 0,
                    id: 'nextConflict',
                    label: text,
                    run() {
                        vm.model.telemetry.reportConflictCounterClicked();
                        vm.goToNextModifiedBaseRange(m => !model.isHandled(m).get());
                    },
                    tooltip: count > 0
                        ? (0, nls_1.localize)(3, null)
                        : (0, nls_1.localize)(4, null),
                });
            }));
            this.B((0, utils_1.$9ib)(this.editor, this.w));
            this.B((0, codeEditorView_1.$Xjb)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToResult(baseRange)));
            this.B(instantiationService.createInstance(codeEditorView_1.$Yjb, actions_1.$Ru.MergeInputResultToolbar, this.a.toolbar));
        }
    };
    exports.$akb = $akb;
    exports.$akb = $akb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, label_1.$Vz),
        __param(3, configuration_1.$8h)
    ], $akb);
});
//# sourceMappingURL=resultCodeEditorView.js.map