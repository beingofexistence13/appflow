/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/config/editorOptions", "vs/nls", "vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange", "vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget"], function (require, exports, dom_1, iconLabels_1, hash_1, lifecycle_1, observable_1, editorOptions_1, nls_1, modifiedBaseRange_1, fixedZoneWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionsSource = exports.ConflictActionsFactory = void 0;
    class ConflictActionsFactory extends lifecycle_1.Disposable {
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(19 /* EditorOption.codeLensFontSize */) || e.hasChanged(18 /* EditorOption.codeLensFontFamily */)) {
                    this._updateLensStyle();
                }
            }));
            this._styleClassName = '_conflictActionsFactory_' + (0, hash_1.hash)(this._editor.getId()).toString(16);
            this._styleElement = (0, dom_1.createStyleSheet)((0, dom_1.isInShadowDOM)(this._editor.getContainerDomNode())
                ? this._editor.getContainerDomNode()
                : undefined);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this._styleElement.remove();
            }));
            this._updateLensStyle();
        }
        _updateLensStyle() {
            const { codeLensHeight, fontSize } = this._getLayoutInfo();
            const fontFamily = this._editor.getOption(18 /* EditorOption.codeLensFontFamily */);
            const editorFontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            const fontFamilyVar = `--codelens-font-family${this._styleClassName}`;
            const fontFeaturesVar = `--codelens-font-features${this._styleClassName}`;
            let newStyle = `
		.${this._styleClassName} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-workbench .${this._styleClassName} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
            if (fontFamily) {
                newStyle += `${this._styleClassName} { font-family: var(${fontFamilyVar}), ${editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily}}`;
            }
            this._styleElement.textContent = newStyle;
            this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily ?? 'inherit');
            this._editor.getContainerDomNode().style.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
        }
        _getLayoutInfo() {
            const lineHeightFactor = Math.max(1.3, this._editor.getOption(66 /* EditorOption.lineHeight */) / this._editor.getOption(52 /* EditorOption.fontSize */));
            let fontSize = this._editor.getOption(19 /* EditorOption.codeLensFontSize */);
            if (!fontSize || fontSize < 5) {
                fontSize = (this._editor.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
            }
            return {
                fontSize,
                codeLensHeight: (fontSize * lineHeightFactor) | 0,
            };
        }
        createWidget(viewZoneChangeAccessor, lineNumber, items, viewZoneIdsToCleanUp) {
            const layoutInfo = this._getLayoutInfo();
            return new ActionsContentWidget(this._editor, viewZoneChangeAccessor, lineNumber, layoutInfo.codeLensHeight + 2, this._styleClassName, items, viewZoneIdsToCleanUp);
        }
    }
    exports.ConflictActionsFactory = ConflictActionsFactory;
    class ActionsSource {
        constructor(viewModel, modifiedBaseRange) {
            this.viewModel = viewModel;
            this.modifiedBaseRange = modifiedBaseRange;
            this.itemsInput1 = this.getItemsInput(1);
            this.itemsInput2 = this.getItemsInput(2);
            this.resultItems = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel;
                const modifiedBaseRange = this.modifiedBaseRange;
                const state = viewModel.model.getState(modifiedBaseRange).read(reader);
                const model = viewModel.model;
                const result = [];
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                    result.push({
                        text: (0, nls_1.localize)('manualResolution', "Manual Resolution"),
                        tooltip: (0, nls_1.localize)('manualResolutionTooltip', "This conflict has been resolved manually."),
                    });
                }
                else if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base) {
                    result.push({
                        text: (0, nls_1.localize)('noChangesAccepted', 'No Changes Accepted'),
                        tooltip: (0, nls_1.localize)('noChangesAcceptedTooltip', 'The current resolution of this conflict equals the common ancestor of both the right and left changes.'),
                    });
                }
                else {
                    const labels = [];
                    if (state.includesInput1) {
                        labels.push(model.input1.title);
                    }
                    if (state.includesInput2) {
                        labels.push(model.input2.title);
                    }
                    if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && state.firstInput === 2) {
                        labels.reverse();
                    }
                    result.push({
                        text: `${labels.join(' + ')}`
                    });
                }
                const stateToggles = [];
                if (state.includesInput1) {
                    stateToggles.push(command((0, nls_1.localize)('remove', 'Remove {0}', model.input1.title), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(1, false), true, tx);
                            model.telemetry.reportRemoveInvoked(1, state.includesInput(2));
                        });
                    }, (0, nls_1.localize)('removeTooltip', 'Remove {0} from the result document.', model.input1.title)));
                }
                if (state.includesInput2) {
                    stateToggles.push(command((0, nls_1.localize)('remove', 'Remove {0}', model.input2.title), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(2, false), true, tx);
                            model.telemetry.reportRemoveInvoked(2, state.includesInput(1));
                        });
                    }, (0, nls_1.localize)('removeTooltip', 'Remove {0} from the result document.', model.input2.title)));
                }
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both &&
                    state.firstInput === 2) {
                    stateToggles.reverse();
                }
                result.push(...stateToggles);
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                    result.push(command((0, nls_1.localize)('resetToBase', 'Reset to base'), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, modifiedBaseRange_1.ModifiedBaseRangeState.base, true, tx);
                            model.telemetry.reportResetToBaseInvoked();
                        });
                    }, (0, nls_1.localize)('resetToBaseTooltip', 'Reset this conflict to the common ancestor of both the right and left changes.')));
                }
                return result;
            });
            this.isEmpty = (0, observable_1.derived)(this, reader => {
                return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length + this.resultItems.read(reader).length === 0;
            });
            this.inputIsEmpty = (0, observable_1.derived)(this, reader => {
                return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length === 0;
            });
        }
        getItemsInput(inputNumber) {
            return (0, observable_1.derived)(reader => {
                /** @description items */
                const viewModel = this.viewModel;
                const modifiedBaseRange = this.modifiedBaseRange;
                if (!viewModel.model.hasBaseRange(modifiedBaseRange)) {
                    return [];
                }
                const state = viewModel.model.getState(modifiedBaseRange).read(reader);
                const handled = viewModel.model.isHandled(modifiedBaseRange).read(reader);
                const model = viewModel.model;
                const result = [];
                const inputData = inputNumber === 1 ? viewModel.model.input1 : viewModel.model.input2;
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                if (!modifiedBaseRange.isConflicting && handled && !showNonConflictingChanges) {
                    return [];
                }
                const otherInputNumber = inputNumber === 1 ? 2 : 1;
                if (state.kind !== modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && !state.isInputIncluded(inputNumber)) {
                    if (!state.isInputIncluded(otherInputNumber) || !this.viewModel.shouldUseAppendInsteadOfAccept.read(reader)) {
                        result.push(command((0, nls_1.localize)('accept', "Accept {0}", inputData.title), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                            });
                        }, (0, nls_1.localize)('acceptTooltip', "Accept {0} in the result document.", inputData.title)));
                        if (modifiedBaseRange.canBeCombined) {
                            const commandName = modifiedBaseRange.isOrderRelevant
                                ? (0, nls_1.localize)('acceptBoth0First', "Accept Combination ({0} First)", inputData.title)
                                : (0, nls_1.localize)('acceptBoth', "Accept Combination");
                            result.push(command(commandName, async () => {
                                (0, observable_1.transaction)((tx) => {
                                    model.setState(modifiedBaseRange, modifiedBaseRange_1.ModifiedBaseRangeState.base
                                        .withInputValue(inputNumber, true)
                                        .withInputValue(otherInputNumber, true, true), true, tx);
                                    model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                                });
                            }, (0, nls_1.localize)('acceptBothTooltip', "Accept an automatic combination of both sides in the result document.")));
                        }
                    }
                    else {
                        result.push(command((0, nls_1.localize)('append', "Append {0}", inputData.title), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                            });
                        }, (0, nls_1.localize)('appendTooltip', "Append {0} to the result document.", inputData.title)));
                        if (modifiedBaseRange.canBeCombined) {
                            result.push(command((0, nls_1.localize)('combine', "Accept Combination", inputData.title), async () => {
                                (0, observable_1.transaction)((tx) => {
                                    model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, true), inputNumber, tx);
                                    model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                                });
                            }, (0, nls_1.localize)('acceptBothTooltip', "Accept an automatic combination of both sides in the result document.")));
                        }
                    }
                    if (!model.isInputHandled(modifiedBaseRange, inputNumber).read(reader)) {
                        result.push(command((0, nls_1.localize)('ignore', 'Ignore'), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setInputHandled(modifiedBaseRange, inputNumber, true, tx);
                            });
                        }, (0, nls_1.localize)('markAsHandledTooltip', "Don't take this side of the conflict.")));
                    }
                }
                return result;
            });
        }
    }
    exports.ActionsSource = ActionsSource;
    function command(title, action, tooltip) {
        return {
            text: title,
            action,
            tooltip,
        };
    }
    class ActionsContentWidget extends fixedZoneWidget_1.FixedZoneWidget {
        constructor(editor, viewZoneAccessor, afterLineNumber, height, className, items, viewZoneIdsToCleanUp) {
            super(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp);
            this._domNode = (0, dom_1.h)('div.merge-editor-conflict-actions').root;
            this.widgetDomNode.appendChild(this._domNode);
            this._domNode.classList.add(className);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update commands */
                const i = items.read(reader);
                this.setState(i);
            }));
        }
        setState(items) {
            const children = [];
            let isFirst = true;
            for (const item of items) {
                if (isFirst) {
                    isFirst = false;
                }
                else {
                    children.push((0, dom_1.$)('span', undefined, '\u00a0|\u00a0'));
                }
                const title = (0, iconLabels_1.renderLabelWithIcons)(item.text);
                if (item.action) {
                    children.push((0, dom_1.$)('a', { title: item.tooltip, role: 'button', onclick: () => item.action() }, ...title));
                }
                else {
                    children.push((0, dom_1.$)('span', { title: item.tooltip }, ...title));
                }
            }
            (0, dom_1.reset)(this._domNode, ...children);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmxpY3RBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L2NvbmZsaWN0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxzQkFBdUIsU0FBUSxzQkFBVTtRQUlyRCxZQUE2QixPQUFvQjtZQUNoRCxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBR2hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsQ0FBQyxVQUFVLGdDQUF1QixJQUFJLENBQUMsQ0FBQyxVQUFVLHdDQUErQixJQUFJLENBQUMsQ0FBQyxVQUFVLDBDQUFpQyxFQUFFO29CQUN4SSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDeEI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLGVBQWUsR0FBRywwQkFBMEIsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBQSxzQkFBZ0IsRUFDcEMsSUFBQSxtQkFBYSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3BDLENBQUMsQ0FBQyxTQUFTLENBQ1osQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDaEMsSUFBSSxDQUFD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