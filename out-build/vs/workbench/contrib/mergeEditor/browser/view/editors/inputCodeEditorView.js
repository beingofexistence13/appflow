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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/observable", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/model", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "../editorGutter", "./codeEditorView"], function (require, exports, dom_1, iconLabels_1, toggle_1, actions_1, codicons_1, lifecycle_1, numbers_1, observable_1, strings_1, types_1, model_1, nls_1, actions_2, configuration_1, contextView_1, instantiation_1, defaultStyles_1, utils_1, colors_1, editorGutter_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3jb = exports.$2jb = exports.$1jb = void 0;
    let $1jb = class $1jb extends codeEditorView_1.$Wjb {
        constructor(inputNumber, viewModel, instantiationService, contextMenuService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.inputNumber = inputNumber;
            this.otherInputNumber = this.inputNumber === 1 ? 2 : 1;
            this.u = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.modifiedBaseRangeGutterItemInfos` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const inputNumber = this.inputNumber;
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                return model.modifiedBaseRanges.read(reader)
                    .filter((r) => r.getInputDiffs(this.inputNumber).length > 0 && (showNonConflictingChanges || r.isConflicting || !model.isHandled(r).read(reader)))
                    .map((baseRange, idx) => new $2jb(idx.toString(), baseRange, inputNumber, viewModel));
            });
            this.w = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.decorations` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = (this.inputNumber === 1 ? model.input1 : model.input2).textModel;
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const result = new Array();
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                const showDeletionMarkers = this.g.read(reader);
                const diffWithThis = viewModel.baseCodeEditorView.read(reader) !== undefined && viewModel.baseShowDiffAgainst.read(reader) === this.inputNumber;
                const useSimplifiedDecorations = !diffWithThis && this.j.read(reader);
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
                                color: { id: isHandled ? colors_1.$Qjb : colors_1.$Rjb },
                            },
                            overviewRuler: modifiedBaseRange.isConflicting ? {
                                position: model_1.OverviewRulerLane.Center,
                                color: { id: isHandled ? colors_1.$Qjb : colors_1.$Rjb },
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
            this.a.root.classList.add(`input`);
            this.B(new editorGutter_1.$Vjb(this.editor, this.a.gutterDiv, {
                getIntersectingGutterItems: (range, reader) => {
                    if (this.f.read(reader)) {
                        return this.u.read(reader);
                    }
                    else {
                        return [];
                    }
                },
                createView: (item, target) => new $3jb(item, target, contextMenuService),
            }));
            this.B((0, codeEditorView_1.$Xjb)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToInput(this.inputNumber, baseRange)));
            this.B(instantiationService.createInstance(codeEditorView_1.$Yjb, inputNumber === 1 ? actions_2.$Ru.MergeInput1Toolbar : actions_2.$Ru.MergeInput2Toolbar, this.a.toolbar));
            this.B((0, observable_1.autorunOpts)({ debugName: `input${this.inputNumber}: update labels & text model` }, reader => {
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(this.inputNumber === 1 ? vm.model.input1.textModel : vm.model.input2.textModel);
                const title = this.inputNumber === 1
                    ? vm.model.input1.title || (0, nls_1.localize)(0, null)
                    : vm.model.input2.title || (0, nls_1.localize)(1, null);
                const description = this.inputNumber === 1
                    ? vm.model.input1.description
                    : vm.model.input2.description;
                const detail = this.inputNumber === 1
                    ? vm.model.input1.detail
                    : vm.model.input2.detail;
                (0, dom_1.$_O)(this.a.title, ...(0, iconLabels_1.$xQ)(title));
                (0, dom_1.$_O)(this.a.description, ...(description ? (0, iconLabels_1.$xQ)(description) : []));
                (0, dom_1.$_O)(this.a.detail, ...(detail ? (0, iconLabels_1.$xQ)(detail) : []));
            }));
            this.B((0, utils_1.$9ib)(this.editor, this.w));
        }
    };
    exports.$1jb = $1jb;
    exports.$1jb = $1jb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, contextView_1.$WZ),
        __param(4, configuration_1.$8h)
    ], $1jb);
    class $2jb {
        constructor(id, b, f, g) {
            this.id = id;
            this.b = b;
            this.f = f;
            this.g = g;
            this.a = this.g.model;
            this.range = this.b.getInputRange(this.f);
            this.enabled = this.a.isUpToDate;
            this.toggleState = (0, observable_1.derived)(this, reader => {
                const input = this.a
                    .getState(this.b)
                    .read(reader)
                    .getInput(this.f);
                return input === 2 /* InputState.second */ && !this.b.isOrderRelevant
                    ? 1 /* InputState.first */
                    : input;
            });
            this.state = (0, observable_1.derived)(this, reader => {
                const active = this.g.activeModifiedBaseRange.read(reader);
                if (!this.a.hasBaseRange(this.b)) {
                    return { handled: false, focused: false }; // Invalid state, should only be observed temporarily
                }
                return {
                    handled: this.a.isHandled(this.b).read(reader),
                    focused: this.b === active,
                };
            });
        }
        setState(value, tx) {
            this.g.setState(this.b, this.a
                .getState(this.b)
                .get()
                .withInputValue(this.f, value), tx, this.f);
        }
        toggleBothSides() {
            (0, observable_1.transaction)(tx => {
                /** @description Context Menu: toggle both sides */
                const state = this.a
                    .getState(this.b)
                    .get();
                this.a.setState(this.b, state
                    .toggle(this.f)
                    .toggle(this.f === 1 ? 2 : 1), true, tx);
            });
        }
        getContextMenuActions() {
            const state = this.a.getState(this.b).get();
            const handled = this.a.isHandled(this.b).get();
            const update = (newState) => {
                (0, observable_1.transaction)(tx => {
                    /** @description Context Menu: Update Base Range State */
                    return this.g.setState(this.b, newState, tx, this.f);
                });
            };
            function action(id, label, targetState, checked) {
                const action = new actions_1.$gi(id, label, undefined, true, () => {
                    update(targetState);
                });
                action.checked = checked;
                return action;
            }
            const both = state.includesInput1 && state.includesInput2;
            return [
                this.b.input1Diffs.length > 0
                    ? action('mergeEditor.acceptInput1', (0, nls_1.localize)(2, null, this.a.input1.title), state.toggle(1), state.includesInput1)
                    : undefined,
                this.b.input2Diffs.length > 0
                    ? action('mergeEditor.acceptInput2', (0, nls_1.localize)(3, null, this.a.input2.title), state.toggle(2), state.includesInput2)
                    : undefined,
                this.b.isConflicting
                    ? (0, utils_1.$cjb)(action('mergeEditor.acceptBoth', (0, nls_1.localize)(4, null), state.withInputValue(1, !both).withInputValue(2, !both), both), { enabled: this.b.canBeCombined })
                    : undefined,
                new actions_1.$ii(),
                this.b.isConflicting
                    ? (0, utils_1.$cjb)(action('mergeEditor.swap', (0, nls_1.localize)(5, null), state.swap(), false), { enabled: !state.kind && (!both || this.b.isOrderRelevant) })
                    : undefined,
                (0, utils_1.$cjb)(new actions_1.$gi('mergeEditor.markAsHandled', (0, nls_1.localize)(6, null), undefined, true, () => {
                    (0, observable_1.transaction)((tx) => {
                        /** @description Context Menu: Mark as handled */
                        this.a.setHandled(this.b, !handled, tx);
                    });
                }), { checked: handled }),
            ].filter(types_1.$rf);
        }
    }
    exports.$2jb = $2jb;
    class $3jb extends lifecycle_1.$kc {
        constructor(item, target, contextMenuService) {
            super();
            this.f = (0, observable_1.observableValue)(this, false);
            this.a = (0, observable_1.observableValue)(this, item);
            const checkBox = new toggle_1.$KQ({
                isChecked: false,
                title: '',
                icon: codicons_1.$Pj.check,
                ...defaultStyles_1.$m2
            });
            checkBox.domNode.classList.add('accept-conflict-group');
            this.B((0, dom_1.$nO)(checkBox.domNode, dom_1.$3O.MOUSE_DOWN, (e) => {
                const item = this.a.get();
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
            this.B((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox */
                const item = this.a.read(reader);
                const value = item.toggleState.read(reader);
                const iconMap = {
                    [0 /* InputState.excluded */]: { icon: undefined, checked: false, title: (0, nls_1.localize)(7, null) },
                    [3 /* InputState.unrecognized */]: { icon: codicons_1.$Pj.circleFilled, checked: false, title: (0, nls_1.localize)(8, null) },
                    [1 /* InputState.first */]: { icon: codicons_1.$Pj.check, checked: true, title: (0, nls_1.localize)(9, null) },
                    [2 /* InputState.second */]: { icon: codicons_1.$Pj.checkAll, checked: true, title: (0, nls_1.localize)(10, null) },
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
            this.B((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox CSS ClassNames */
                const state = this.a.read(reader).state.read(reader);
                const classNames = [
                    'merge-accept-gutter-marker',
                    state.handled && 'handled',
                    state.focused && 'focused',
                    this.f.read(reader) ? 'multi-line' : 'single-line',
                ];
                target.className = classNames.filter(c => typeof c === 'string').join(' ');
            }));
            this.B(checkBox.onChange(() => {
                (0, observable_1.transaction)(tx => {
                    /** @description Handle Checkbox Change */
                    this.a.get().setState(checkBox.checked, tx);
                });
            }));
            target.appendChild((0, dom_1.h)('div.background', [strings_1.$gf]).root);
            target.appendChild(this.b = (0, dom_1.h)('div.checkbox', [(0, dom_1.h)('div.checkbox-background', [checkBox.domNode])]).root);
        }
        layout(top, height, viewTop, viewHeight) {
            const checkboxHeight = this.b.clientHeight;
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
                effectiveCheckboxTop = (0, numbers_1.$Hl)(effectiveCheckboxTop, preferredViewPortRange[0], preferredViewPortRange[1]);
                effectiveCheckboxTop = (0, numbers_1.$Hl)(effectiveCheckboxTop, preferredParentRange[0], preferredParentRange[1]);
            }
            this.b.style.top = `${effectiveCheckboxTop - top}px`;
            (0, observable_1.transaction)((tx) => {
                /** @description MergeConflictGutterItemView: Update Is Multi Line */
                this.f.set(height > 30, tx);
            });
        }
        update(baseRange) {
            (0, observable_1.transaction)(tx => {
                /** @description MergeConflictGutterItemView: Updating new base range */
                this.a.set(baseRange, tx);
            });
        }
    }
    exports.$3jb = $3jb;
});
//# sourceMappingURL=inputCodeEditorView.js.map