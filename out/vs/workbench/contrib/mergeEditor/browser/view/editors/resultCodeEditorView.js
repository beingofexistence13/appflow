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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/model", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/workbench/contrib/mergeEditor/browser/view/editorGutter", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "./codeEditorView"], function (require, exports, dom_1, actionbar_1, iconLabels_1, arrays_1, errors_1, lifecycle_1, observable_1, model_1, nls_1, actions_1, configuration_1, contextkey_1, instantiation_1, label_1, lineRange_1, utils_1, colors_1, editorGutter_1, mergeEditor_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultCodeEditorView = void 0;
    let ResultCodeEditorView = class ResultCodeEditorView extends codeEditorView_1.CodeEditorView {
        constructor(viewModel, instantiationService, _labelService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this._labelService = _labelService;
            this.decorations = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = model.resultTextModel;
                const result = new Array();
                const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.join)(model.modifiedBaseRanges.read(reader), model.baseResultDiffs.read(reader), (baseRange, diff) => baseRange.baseRange.touches(diff.inputRange)
                    ? arrays_1.CompareResult.neitherLessOrGreaterThan
                    : lineRange_1.LineRange.compareByStart(baseRange.baseRange, diff.inputRange));
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
                                    color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
                                },
                                overviewRuler: modifiedBaseRange.isConflicting ? {
                                    position: model_1.OverviewRulerLane.Center,
                                    color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
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
                const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
                const isMergeResultEditor = mergeEditor_1.ctxIsMergeResultEditor.bindTo(contextKeyService);
                isMergeResultEditor.set(true);
                this._register((0, lifecycle_1.toDisposable)(() => isMergeResultEditor.reset()));
            });
            this.htmlElements.gutterDiv.style.width = '5px';
            this.htmlElements.root.classList.add(`result`);
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description update checkboxes */
                if (this.checkboxesVisible.read(reader)) {
                    store.add(new editorGutter_1.EditorGutter(this.editor, this.htmlElements.gutterDiv, {
                        getIntersectingGutterItems: (range, reader) => [],
                        createView: (item, target) => { throw new errors_1.BugIndicatingError(); },
                    }));
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update labels & text model */
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(vm.model.resultTextModel);
                (0, dom_1.reset)(this.htmlElements.title, ...(0, iconLabels_1.renderLabelWithIcons)((0, nls_1.localize)('result', 'Result')));
                (0, dom_1.reset)(this.htmlElements.description, ...(0, iconLabels_1.renderLabelWithIcons)(this._labelService.getUriLabel(vm.model.resultTextModel.uri, { relative: true })));
            }));
            const remainingConflictsActionBar = this._register(new actionbar_1.ActionBar(this.htmlElements.detail));
            this._register((0, observable_1.autorun)(reader => {
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
                    ? (0, nls_1.localize)('mergeEditor.remainingConflicts', '{0} Conflict Remaining', count)
                    : (0, nls_1.localize)('mergeEditor.remainingConflict', '{0} Conflicts Remaining ', count);
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
                        ? (0, nls_1.localize)('goToNextConflict', 'Go to next conflict')
                        : (0, nls_1.localize)('allConflictHandled', 'All conflicts handled, the merge can be completed now.'),
                });
            }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
            this._register((0, codeEditorView_1.createSelectionsAutorun)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToResult(baseRange)));
            this._register(instantiationService.createInstance(codeEditorView_1.TitleMenu, actions_1.MenuId.MergeInputResultToolbar, this.htmlElements.toolbar));
        }
    };
    exports.ResultCodeEditorView = ResultCodeEditorView;
    exports.ResultCodeEditorView = ResultCodeEditorView = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, label_1.ILabelService),
        __param(3, configuration_1.IConfigurationService)
    ], ResultCodeEditorView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0Q29kZUVkaXRvclZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL3ZpZXcvZWRpdG9ycy9yZXN1bHRDb2RlRWRpdG9yVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsK0JBQWM7UUFDdkQsWUFDQyxTQUF3RCxFQUNqQyxvQkFBMkMsRUFDbkQsYUFBNkMsRUFDckMsb0JBQTJDO1lBRWxFLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUg3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQW9HNUMsZ0JBQVcsR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNyRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPLEVBQUUsQ0FBQztpQkFDVjtnQkFDRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2dCQUM5QixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO2dCQUN4QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBeUIsQ0FBQztnQkFFbEQsTUFBTSxrQ0FBa0MsR0FBRyxJQUFBLFlBQUksRUFDOUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDckMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQ2xDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsU0FBUyxD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