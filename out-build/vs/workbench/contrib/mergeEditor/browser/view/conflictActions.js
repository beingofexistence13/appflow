/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/config/editorOptions", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/conflictActions", "vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange", "vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget"], function (require, exports, dom_1, iconLabels_1, hash_1, lifecycle_1, observable_1, editorOptions_1, nls_1, modifiedBaseRange_1, fixedZoneWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TSb = exports.$SSb = void 0;
    class $SSb extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.B(this.c.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(19 /* EditorOption.codeLensFontSize */) || e.hasChanged(18 /* EditorOption.codeLensFontFamily */)) {
                    this.f();
                }
            }));
            this.a = '_conflictActionsFactory_' + (0, hash_1.$pi)(this.c.getId()).toString(16);
            this.b = (0, dom_1.$XO)((0, dom_1.$TO)(this.c.getContainerDomNode())
                ? this.c.getContainerDomNode()
                : undefined);
            this.B((0, lifecycle_1.$ic)(() => {
                this.b.remove();
            }));
            this.f();
        }
        f() {
            const { codeLensHeight, fontSize } = this.g();
            const fontFamily = this.c.getOption(18 /* EditorOption.codeLensFontFamily */);
            const editorFontInfo = this.c.getOption(50 /* EditorOption.fontInfo */);
            const fontFamilyVar = `--codelens-font-family${this.a}`;
            const fontFeaturesVar = `--codelens-font-features${this.a}`;
            let newStyle = `
		.${this.a} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-workbench .${this.a} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
            if (fontFamily) {
                newStyle += `${this.a} { font-family: var(${fontFamilyVar}), ${editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily}}`;
            }
            this.b.textContent = newStyle;
            this.c.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily ?? 'inherit');
            this.c.getContainerDomNode().style.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
        }
        g() {
            const lineHeightFactor = Math.max(1.3, this.c.getOption(66 /* EditorOption.lineHeight */) / this.c.getOption(52 /* EditorOption.fontSize */));
            let fontSize = this.c.getOption(19 /* EditorOption.codeLensFontSize */);
            if (!fontSize || fontSize < 5) {
                fontSize = (this.c.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
            }
            return {
                fontSize,
                codeLensHeight: (fontSize * lineHeightFactor) | 0,
            };
        }
        createWidget(viewZoneChangeAccessor, lineNumber, items, viewZoneIdsToCleanUp) {
            const layoutInfo = this.g();
            return new ActionsContentWidget(this.c, viewZoneChangeAccessor, lineNumber, layoutInfo.codeLensHeight + 2, this.a, items, viewZoneIdsToCleanUp);
        }
    }
    exports.$SSb = $SSb;
    class $TSb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.itemsInput1 = this.c(1);
            this.itemsInput2 = this.c(2);
            this.resultItems = (0, observable_1.derived)(this, reader => {
                const viewModel = this.a;
                const modifiedBaseRange = this.b;
                const state = viewModel.model.getState(modifiedBaseRange).read(reader);
                const model = viewModel.model;
                const result = [];
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                    result.push({
                        text: (0, nls_1.localize)(11, null),
                        tooltip: (0, nls_1.localize)(12, null),
                    });
                }
                else if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base) {
                    result.push({
                        text: (0, nls_1.localize)(13, null),
                        tooltip: (0, nls_1.localize)(14, null),
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
                    stateToggles.push(command((0, nls_1.localize)(15, null, model.input1.title), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(1, false), true, tx);
                            model.telemetry.reportRemoveInvoked(1, state.includesInput(2));
                        });
                    }, (0, nls_1.localize)(16, null, model.input1.title)));
                }
                if (state.includesInput2) {
                    stateToggles.push(command((0, nls_1.localize)(17, null, model.input2.title), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(2, false), true, tx);
                            model.telemetry.reportRemoveInvoked(2, state.includesInput(1));
                        });
                    }, (0, nls_1.localize)(18, null, model.input2.title)));
                }
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both &&
                    state.firstInput === 2) {
                    stateToggles.reverse();
                }
                result.push(...stateToggles);
                if (state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                    result.push(command((0, nls_1.localize)(19, null), async () => {
                        (0, observable_1.transaction)((tx) => {
                            model.setState(modifiedBaseRange, modifiedBaseRange_1.ModifiedBaseRangeState.base, true, tx);
                            model.telemetry.reportResetToBaseInvoked();
                        });
                    }, (0, nls_1.localize)(20, null)));
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
        c(inputNumber) {
            return (0, observable_1.derived)(reader => {
                /** @description items */
                const viewModel = this.a;
                const modifiedBaseRange = this.b;
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
                    if (!state.isInputIncluded(otherInputNumber) || !this.a.shouldUseAppendInsteadOfAccept.read(reader)) {
                        result.push(command((0, nls_1.localize)(0, null, inputData.title), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                            });
                        }, (0, nls_1.localize)(1, null, inputData.title)));
                        if (modifiedBaseRange.canBeCombined) {
                            const commandName = modifiedBaseRange.isOrderRelevant
                                ? (0, nls_1.localize)(2, null, inputData.title)
                                : (0, nls_1.localize)(3, null);
                            result.push(command(commandName, async () => {
                                (0, observable_1.transaction)((tx) => {
                                    model.setState(modifiedBaseRange, modifiedBaseRange_1.ModifiedBaseRangeState.base
                                        .withInputValue(inputNumber, true)
                                        .withInputValue(otherInputNumber, true, true), true, tx);
                                    model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                                });
                            }, (0, nls_1.localize)(4, null)));
                        }
                    }
                    else {
                        result.push(command((0, nls_1.localize)(5, null, inputData.title), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                            });
                        }, (0, nls_1.localize)(6, null, inputData.title)));
                        if (modifiedBaseRange.canBeCombined) {
                            result.push(command((0, nls_1.localize)(7, null, inputData.title), async () => {
                                (0, observable_1.transaction)((tx) => {
                                    model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, true), inputNumber, tx);
                                    model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                                });
                            }, (0, nls_1.localize)(8, null)));
                        }
                    }
                    if (!model.isInputHandled(modifiedBaseRange, inputNumber).read(reader)) {
                        result.push(command((0, nls_1.localize)(9, null), async () => {
                            (0, observable_1.transaction)((tx) => {
                                model.setInputHandled(modifiedBaseRange, inputNumber, true, tx);
                            });
                        }, (0, nls_1.localize)(10, null)));
                    }
                }
                return result;
            });
        }
    }
    exports.$TSb = $TSb;
    function command(title, action, tooltip) {
        return {
            text: title,
            action,
            tooltip,
        };
    }
    class ActionsContentWidget extends fixedZoneWidget_1.$RSb {
        constructor(editor, viewZoneAccessor, afterLineNumber, height, className, items, viewZoneIdsToCleanUp) {
            super(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp);
            this.m = (0, dom_1.h)('div.merge-editor-conflict-actions').root;
            this.f.appendChild(this.m);
            this.m.classList.add(className);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update commands */
                const i = items.read(reader);
                this.n(i);
            }));
        }
        n(items) {
            const children = [];
            let isFirst = true;
            for (const item of items) {
                if (isFirst) {
                    isFirst = false;
                }
                else {
                    children.push((0, dom_1.$)('span', undefined, '\u00a0|\u00a0'));
                }
                const title = (0, iconLabels_1.$xQ)(item.text);
                if (item.action) {
                    children.push((0, dom_1.$)('a', { title: item.tooltip, role: 'button', onclick: () => item.action() }, ...title));
                }
                else {
                    children.push((0, dom_1.$)('span', { title: item.tooltip }, ...title));
                }
            }
            (0, dom_1.$_O)(this.m, ...children);
        }
    }
});
//# sourceMappingURL=conflictActions.js.map