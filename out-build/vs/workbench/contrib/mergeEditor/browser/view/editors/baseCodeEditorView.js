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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/errors", "vs/base/common/observable", "vs/editor/common/model", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/workbench/contrib/mergeEditor/browser/view/editorGutter", "./codeEditorView"], function (require, exports, dom_1, iconLabels_1, errors_1, observable_1, model_1, nls_1, actions_1, configuration_1, instantiation_1, utils_1, colors_1, editorGutter_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zjb = void 0;
    let $Zjb = class $Zjb extends codeEditorView_1.$Wjb {
        constructor(viewModel, instantiationService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.u = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = model.base;
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                const showDeletionMarkers = this.g.read(reader);
                const result = [];
                for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
                    const range = modifiedBaseRange.baseRange;
                    if (!range) {
                        continue;
                    }
                    const isHandled = model.isHandled(modifiedBaseRange).read(reader);
                    if (!modifiedBaseRange.isConflicting && isHandled && !showNonConflictingChanges) {
                        continue;
                    }
                    const blockClassNames = ['merge-editor-block'];
                    let blockPadding = [0, 0, 0, 0];
                    if (isHandled) {
                        blockClassNames.push('handled');
                    }
                    if (modifiedBaseRange === activeModifiedBaseRange) {
                        blockClassNames.push('focused');
                        blockPadding = [0, 2, 0, 2];
                    }
                    blockClassNames.push('base');
                    const inputToDiffAgainst = viewModel.baseShowDiffAgainst.read(reader);
                    if (inputToDiffAgainst) {
                        for (const diff of modifiedBaseRange.getInputDiffs(inputToDiffAgainst)) {
                            const range = diff.inputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff base`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            for (const diff2 of diff.rangeMappings) {
                                if (showDeletionMarkers || !diff2.inputRange.isEmpty()) {
                                    result.push({
                                        range: diff2.inputRange,
                                        options: {
                                            className: diff2.inputRange.isEmpty() ? `merge-editor-diff-empty-word base` : `merge-editor-diff-word base`,
                                            description: 'Merge Editor',
                                            showIfCollapsed: true,
                                        },
                                    });
                                }
                            }
                        }
                    }
                    result.push({
                        range: range.toInclusiveRangeOrEmpty(),
                        options: {
                            showIfCollapsed: true,
                            blockClassName: blockClassNames.join(' '),
                            blockPadding,
                            blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
                            description: 'Merge Editor',
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
                return result;
            });
            this.B((0, codeEditorView_1.$Xjb)(this, (baseRange, viewModel) => baseRange));
            this.B(instantiationService.createInstance(codeEditorView_1.$Yjb, actions_1.$Ru.MergeBaseToolbar, this.a.title));
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
                this.editor.setModel(vm.model.base);
                (0, dom_1.$_O)(this.a.title, ...(0, iconLabels_1.$xQ)((0, nls_1.localize)(0, null)));
                const baseShowDiffAgainst = vm.baseShowDiffAgainst.read(reader);
                let node = undefined;
                if (baseShowDiffAgainst) {
                    const label = (0, nls_1.localize)(1, null, baseShowDiffAgainst === 1 ? vm.model.input1.title : vm.model.input2.title);
                    const tooltip = (0, nls_1.localize)(2, null);
                    node = (0, dom_1.h)('span', { title: tooltip }, [label]).root;
                }
                (0, dom_1.$_O)(this.a.description, ...(node ? [node] : []));
            }));
            this.B((0, utils_1.$9ib)(this.editor, this.u));
        }
    };
    exports.$Zjb = $Zjb;
    exports.$Zjb = $Zjb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h)
    ], $Zjb);
});
//# sourceMappingURL=baseCodeEditorView.js.map