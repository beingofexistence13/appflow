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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/observable", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/model", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "../editorGutter", "./codeEditorView"], function (require, exports, dom_1, iconLabels_1, toggle_1, actions_1, codicons_1, lifecycle_1, numbers_1, observable_1, strings_1, types_1, model_1, nls_1, actions_2, configuration_1, contextView_1, instantiation_1, defaultStyles_1, utils_1, colors_1, editorGutter_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeConflictGutterItemView = exports.ModifiedBaseRangeGutterItemModel = exports.InputCodeEditorView = void 0;
    let InputCodeEditorView = class InputCodeEditorView extends codeEditorView_1.CodeEditorView {
        constructor(inputNumber, viewModel, instantiationService, contextMenuService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.inputNumber = inputNumber;
            this.otherInputNumber = this.inputNumber === 1 ? 2 : 1;
            this.modifiedBaseRangeGutterItemInfos = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.modifiedBaseRangeGutterItemInfos` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const inputNumber = this.inputNumber;
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                return model.modifiedBaseRanges.read(reader)
                    .filter((r) => r.getInputDiffs(this.inputNumber).length > 0 && (showNonConflictingChanges || r.isConflicting || !model.isHandled(r).read(reader)))
                    .map((baseRange, idx) => new ModifiedBaseRangeGutterItemModel(idx.toString(), baseRange, inputNumber, viewModel));
            });
            this.decorations = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.decorations` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = (this.inputNumber === 1 ? model.input1 : model.input2).textModel;
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const result = new Array();
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                const showDeletionMarkers = this.showDeletionMarkers.read(reader);
                const diffWithThis = viewModel.baseCodeEditorView.read(reader) !== undefined && viewModel.baseShowDiffAgainst.read(reader) === this.inputNumber;
                const useSimplifiedDecorations = !diffWithThis && this.useSimplifiedDecorations.read(reader);
                for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
                    const range = modifiedBaseRange.getInputRange(this.inputNumber);
                    if (!range) {
                        continue;
                    }
                    const blockClassNames = ['merge-editor-block'];
                    let blockPadding = [0, 0, 0, 0];
                    const isHandled = model.isInputHandled(modifiedBaseRange, this.inputNumber).read(reader);
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
                    const inputClassName = this.inputNumber === 1 ? 'input i1' : 'input i2';
                    blockClassNames.push(inputClassName);
                    if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
                        continue;
                    }
                    if (useSimplifiedDecorations && !isHandled) {
                        blockClassNames.push('use-simplified-decorations');
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
                                color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
                            },
                            overviewRuler: modifiedBaseRange.isConflicting ? {
                                position: model_1.OverviewRulerLane.Center,
                                color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
                            } : undefined
                        }
                    });
                    if (!useSimplifiedDecorations && (modifiedBaseRange.isConflicting || !model.isHandled(modifiedBaseRange).read(reader))) {
                        const inputDiffs = modifiedBaseRange.getInputDiffs(this.inputNumber);
                        for (const diff of inputDiffs) {
                            const range = diff.outputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff ${inputClassName}`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            if (diff.rangeMappings) {
                                for (const d of diff.rangeMappings) {
                                    if (showDeletionMarkers || !d.outputRange.isEmpty()) {
                                        result.push({
                                            range: d.outputRange,
                                            options: {
                                                className: d.outputRange.isEmpty() ? `merge-editor-diff-empty-word ${inputClassName}` : `merge-editor-diff-word ${inputClassName}`,
                                                description: 'Merge Editor',
                                                showIfCollapsed: true,
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                return result;
            });
            this.htmlElements.root.classList.add(`input`);
            this._register(new editorGutter_1.EditorGutter(this.editor, this.htmlElements.gutterDiv, {
                getIntersectingGutterItems: (range, reader) => {
                    if (this.checkboxesVisible.read(reader)) {
                        return this.modifiedBaseRangeGutterItemInfos.read(reader);
                    }
                    else {
                        return [];
                    }
                },
                createView: (item, target) => new MergeConflictGutterItemView(item, target, contextMenuService),
            }));
            this._register((0, codeEditorView_1.createSelectionsAutorun)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToInput(this.inputNumber, baseRange)));
            this._register(instantiationService.createInstance(codeEditorView_1.TitleMenu, inputNumber === 1 ? actions_2.MenuId.MergeInput1Toolbar : actions_2.MenuId.MergeInput2Toolbar, this.htmlElements.toolbar));
            this._register((0, observable_1.autorunOpts)({ debugName: `input${this.inputNumber}: update labels & text model` }, reader => {
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(this.inputNumber === 1 ? vm.model.input1.textModel : vm.model.input2.textModel);
                const title = this.inputNumber === 1
                    ? vm.model.input1.title || (0, nls_1.localize)('input1', 'Input 1')
                    : vm.model.input2.title || (0, nls_1.localize)('input2', 'Input 2');
                const description = this.inputNumber === 1
                    ? vm.model.input1.description
                    : vm.model.input2.description;
                const detail = this.inputNumber === 1
                    ? vm.model.input1.detail
                    : vm.model.input2.detail;
                (0, dom_1.reset)(this.htmlElements.title, ...(0, iconLabels_1.renderLabelWithIcons)(title));
                (0, dom_1.reset)(this.htmlElements.description, ...(description ? (0, iconLabels_1.renderLabelWithIcons)(description) : []));
                (0, dom_1.reset)(this.htmlElements.detail, ...(detail ? (0, iconLabels_1.renderLabelWithIcons)(detail) : []));
            }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
        }
    };
    exports.InputCodeEditorView = InputCodeEditorView;
    exports.InputCodeEditorView = InputCodeEditorView = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService)
    ], InputCodeEditorView);
    class ModifiedBaseRangeGutterItemModel {
        constructor(id, baseRange, inputNumber, viewModel) {
            this.id = id;
            this.baseRange = baseRange;
            this.inputNumber = inputNumber;
            this.viewModel = viewModel;
            this.model = this.viewModel.model;
            this.range = this.baseRange.getInputRange(this.inputNumber);
            this.enabled = this.model.isUpToDate;
            this.toggleState = (0, observable_1.derived)(this, reader => {
                const input = this.model
                    .getState(this.baseRange)
                    .read(reader)
                    .getInput(this.inputNumber);
                return input === 2 /* InputState.second */ && !this.baseRange.isOrderRelevant
                    ? 1 /* InputState.first */
                    : input;
            });
            this.state = (0, observable_1.derived)(this, reader => {
                const active = this.viewModel.activeModifiedBaseRange.read(reader);
                if (!this.model.hasBaseRange(this.baseRange)) {
                    return { handled: false, focused: false }; // Invalid state, should only be observed temporarily
                }
                return {
                    handled: this.model.isHandled(this.baseRange).read(reader),
                    focused: this.baseRange === active,
                };
            });
        }
        setState(value, tx) {
            this.viewModel.setState(this.baseRange, this.model
                .getState(this.baseRange)
                .get()
                .withInputValue(this.inputNumber, value), tx, this.inputNumber);
        }
        toggleBothSides() {
            (0, observable_1.transaction)(tx => {
                /** @description Context Menu: toggle both sides */
                const state = this.model
                    .getState(this.baseRange)
                    .get();
                this.model.setState(this.baseRange, state
                    .toggle(this.inputNumber)
                    .toggle(this.inputNumber === 1 ? 2 : 1), true, tx);
            });
        }
        getContextMenuActions() {
            const state = this.model.getState(this.baseRange).get();
            const handled = this.model.isHandled(this.baseRange).get();
            const update = (newState) => {
                (0, observable_1.transaction)(tx => {
                    /** @description Context Menu: Update Base Range State */
                    return this.viewModel.setState(this.baseRange, newState, tx, this.inputNumber);
                });
            };
            function action(id, label, targetState, checked) {
                const action = new actions_1.Action(id, label, undefined, true, () => {
                    update(targetState);
                });
                action.checked = checked;
                return action;
            }
            const both = state.includesInput1 && state.includesInput2;
            return [
                this.baseRange.input1Diffs.length > 0
                    ? action('mergeEditor.acceptInput1', (0, nls_1.localize)('mergeEditor.accept', 'Accept {0}', this.model.input1.title), state.toggle(1), state.includesInput1)
                    : undefined,
                this.baseRange.input2Diffs.length > 0
                    ? action('mergeEditor.acceptInput2', (0, nls_1.localize)('mergeEditor.accept', 'Accept {0}', this.model.input2.title), state.toggle(2), state.includesInput2)
                    : undefined,
                this.baseRange.isConflicting
                    ? (0, utils_1.setFields)(action('mergeEditor.acceptBoth', (0, nls_1.localize)('mergeEditor.acceptBoth', 'Accept Both'), state.withInputValue(1, !both).withInputValue(2, !both), both), { enabled: this.baseRange.canBeCombined })
                    : undefined,
                new actions_1.Separator(),
                this.baseRange.isConflicting
                    ? (0, utils_1.setFields)(action('mergeEditor.swap', (0, nls_1.localize)('mergeEditor.swap', 'Swap'), state.swap(), false), { enabled: !state.kind && (!both || this.baseRange.isOrderRelevant) })
                    : undefined,
                (0, utils_1.setFields)(new actions_1.Action('mergeEditor.markAsHandled', (0, nls_1.localize)('mergeEditor.markAsHandled', 'Mark as Handled'), undefined, true, () => {
                    (0, observable_1.transaction)((tx) => {
                        /** @description Context Menu: Mark as handled */
                        this.model.setHandled(this.baseRange, !handled, tx);
                    });
                }), { checked: handled }),
            ].filter(types_1.isDefined);
        }
    }
    exports.ModifiedBaseRangeGutterItemModel = ModifiedBaseRangeGutterItemModel;
    class MergeConflictGutterItemView extends lifecycle_1.Disposable {
        constructor(item, target, contextMenuService) {
            super();
            this.isMultiLine = (0, observable_1.observableValue)(this, false);
            this.item = (0, observable_1.observableValue)(this, item);
            const checkBox = new toggle_1.Toggle({
                isChecked: false,
                title: '',
                icon: codicons_1.Codicon.check,
                ...defaultStyles_1.defaultToggleStyles
            });
            checkBox.domNode.classList.add('accept-conflict-group');
            this._register((0, dom_1.addDisposableListener)(checkBox.domNode, dom_1.EventType.MOUSE_DOWN, (e) => {
                const item = this.item.get();
                if (!item) {
                    return;
                }
                if (e.button === /* Right */ 2) {
                    e.stopPropagation();
                    e.preventDefault();
                    contextMenuService.showContextMenu({
                        getAnchor: () => checkBox.domNode,
                        getActions: () => item.getContextMenuActions(),
                    });
                }
                else if (e.button === /* Middle */ 1) {
                    e.stopPropagation();
                    e.preventDefault();
                    item.toggleBothSides();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox */
                const item = this.item.read(reader);
                const value = item.toggleState.read(reader);
                const iconMap = {
                    [0 /* InputState.excluded */]: { icon: undefined, checked: false, title: (0, nls_1.localize)('accept.excluded', "Accept") },
                    [3 /* InputState.unrecognized */]: { icon: codicons_1.Codicon.circleFilled, checked: false, title: (0, nls_1.localize)('accept.conflicting', "Accept (result is dirty)") },
                    [1 /* InputState.first */]: { icon: codicons_1.Codicon.check, checked: true, title: (0, nls_1.localize)('accept.first', "Undo accept") },
                    [2 /* InputState.second */]: { icon: codicons_1.Codicon.checkAll, checked: true, title: (0, nls_1.localize)('accept.second', "Undo accept (currently second)") },
                };
                const state = iconMap[value];
                checkBox.setIcon(state.icon);
                checkBox.checked = state.checked;
                checkBox.setTitle(state.title);
                if (!item.enabled.read(reader)) {
                    checkBox.disable();
                }
                else {
                    checkBox.enable();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox CSS ClassNames */
                const state = this.item.read(reader).state.read(reader);
                const classNames = [
                    'merge-accept-gutter-marker',
                    state.handled && 'handled',
                    state.focused && 'focused',
                    this.isMultiLine.read(reader) ? 'multi-line' : 'single-line',
                ];
                target.className = classNames.filter(c => typeof c === 'string').join(' ');
            }));
            this._register(checkBox.onChange(() => {
                (0, observable_1.transaction)(tx => {
                    /** @description Handle Checkbox Change */
                    this.item.get().setState(checkBox.checked, tx);
                });
            }));
            target.appendChild((0, dom_1.h)('div.background', [strings_1.noBreakWhitespace]).root);
            target.appendChild(this.checkboxDiv = (0, dom_1.h)('div.checkbox', [(0, dom_1.h)('div.checkbox-background', [checkBox.domNode])]).root);
        }
        layout(top, height, viewTop, viewHeight) {
            const checkboxHeight = this.checkboxDiv.clientHeight;
            const middleHeight = height / 2 - checkboxHeight / 2;
            const margin = checkboxHeight;
            let effectiveCheckboxTop = top + middleHeight;
            const preferredViewPortRange = [
                margin,
                viewTop + viewHeight - margin - checkboxHeight
            ];
            const preferredParentRange = [
                top + margin,
                top + height - checkboxHeight - margin
            ];
            if (preferredParentRange[0] < preferredParentRange[1]) {
                effectiveCheckboxTop = (0, numbers_1.clamp)(effectiveCheckboxTop, preferredViewPortRange[0], preferredViewPortRange[1]);
                effectiveCheckboxTop = (0, numbers_1.clamp)(effectiveCheckboxTop, preferredParentRange[0], preferredParentRange[1]);
            }
            this.checkboxDiv.style.top = `${effectiveCheckboxTop - top}px`;
            (0, observable_1.transaction)((tx) => {
                /** @description MergeConflictGutterItemView: Update Is Multi Line */
                this.isMultiLine.set(height > 30, tx);
            });
        }
        update(baseRange) {
            (0, observable_1.transaction)(tx => {
                /** @description MergeConflictGutterItemView: Updating new base range */
                this.item.set(baseRange, tx);
            });
        }
    }
    exports.MergeConflictGutterItemView = MergeConflictGutterItemView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRDb2RlRWRpdG9yVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvdmlldy9lZGl0b3JzL2lucHV0Q29kZUVkaXRvclZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLCtCQUFjO1FBR3RELFlBQ2lCLFdBQWtCLEVBQ2xDLFNBQXdELEVBQ2pDLG9CQUEyQyxFQUM3QyxrQkFBdUMsRUFDckMsb0JBQTJDO1lBRWxFLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQU43QyxnQkFBVyxHQUFYLFdBQVcsQ0FBTztZQUhuQixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFxRWpELHFDQUFnQyxHQUFHLElBQUEsd0JBQVcsRUFBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLElBQUksQ0FBQyxXQUFXLG1DQUFtQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BKLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUFFLE9BQU8sRUFBRSxDQUFDO2lCQUFFO2dCQUM5QixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2dCQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUVyQyxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JB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