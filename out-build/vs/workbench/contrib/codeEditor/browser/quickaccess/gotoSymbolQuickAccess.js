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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/actions/common/actions", "vs/base/common/fuzzyScorer", "vs/base/common/filters", "vs/base/common/errors", "vs/workbench/services/outline/browser/outline", "vs/editor/browser/editorBrowser", "vs/workbench/services/editor/common/editorGroupsService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/common/services/languageFeatures"], function (require, exports, nls_1, quickInput_1, editorService_1, platform_1, quickAccess_1, gotoSymbolQuickAccess_1, configuration_1, lifecycle_1, async_1, cancellation_1, actions_1, fuzzyScorer_1, filters_1, errors_1, outline_1, editorBrowser_1, editorGroupsService_1, outlineModel_1, languageFeatures_1) {
    "use strict";
    var $BMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BMb = void 0;
    let $BMb = class $BMb extends gotoSymbolQuickAccess_1.$AMb {
        static { $BMb_1 = this; }
        constructor(z, A, B, languageFeaturesService, C, outlineModelService) {
            super(languageFeaturesService, outlineModelService, {
                openSideBySideDirection: () => this.D.openSideBySideDirection
            });
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.h = this.z.onDidActiveEditorChange;
        }
        //#region DocumentSymbols (text editor required)
        get D() {
            const editorConfig = this.B.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection
            };
        }
        get i() {
            // TODO: this distinction should go away by adopting `IOutlineService`
            // for all editors (either text based ones or not). Currently text based
            // editors are not yet using the new outline service infrastructure but the
            // "classical" document symbols approach.
            if ((0, editorBrowser_1.$kV)(this.z.activeEditorPane?.getControl())) {
                return undefined;
            }
            return this.z.activeTextEditorControl;
        }
        f(context, options) {
            // Check for sideBySide use
            if ((options.keyMods.alt || (this.D.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.z.activeEditor) {
                context.restoreViewState?.(); // since we open to the side, restore view state in this editor
                const editorOptions = {
                    selection: options.range,
                    pinned: options.keyMods.ctrlCmd || this.D.openEditorPinned,
                    preserveFocus: options.preserveFocus
                };
                this.A.sideGroup.openEditor(this.z.activeEditor, editorOptions);
            }
            // Otherwise let parent handle it
            else {
                super.f(context, options);
            }
        }
        //#endregion
        //#region public methods to use this picker from other pickers
        static { this.G = 8000; }
        async getSymbolPicks(model, filter, options, disposables, token) {
            // If the registry does not know the model, we wait for as long as
            // the registry knows it. This helps in cases where a language
            // registry was not activated yet for providing any symbols.
            // To not wait forever, we eventually timeout though.
            const result = await Promise.race([
                this.s(model, disposables),
                (0, async_1.$Hg)($BMb_1.G)
            ]);
            if (!result || token.isCancellationRequested) {
                return [];
            }
            return this.u(this.x(model, token), (0, fuzzyScorer_1.$oq)(filter), options, token);
        }
        //#endregion
        e(picker) {
            if (this.I()) {
                return this.J(picker);
            }
            return super.e(picker);
        }
        I() {
            return this.z.activeEditorPane ? this.C.canCreateOutline(this.z.activeEditorPane) : false;
        }
        J(picker) {
            const pane = this.z.activeEditorPane;
            if (!pane) {
                return lifecycle_1.$kc.None;
            }
            const cts = new cancellation_1.$pd();
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            picker.busy = true;
            this.C.createOutline(pane, 4 /* OutlineTarget.QuickPick */, cts.token).then(outline => {
                if (!outline) {
                    return;
                }
                if (cts.token.isCancellationRequested) {
                    outline.dispose();
                    return;
                }
                disposables.add(outline);
                const viewState = outline.captureViewState();
                disposables.add((0, lifecycle_1.$ic)(() => {
                    if (picker.selectedItems.length === 0) {
                        viewState.dispose();
                    }
                }));
                const entries = outline.config.quickPickDataSource.getQuickPickElements();
                const items = entries.map((entry, idx) => {
                    return {
                        kind: 0 /* SymbolKind.File */,
                        index: idx,
                        score: 0,
                        label: entry.label,
                        description: entry.description,
                        ariaLabel: entry.ariaLabel,
                        iconClasses: entry.iconClasses
                    };
                });
                disposables.add(picker.onDidAccept(() => {
                    picker.hide();
                    const [entry] = picker.selectedItems;
                    if (entry && entries[entry.index]) {
                        outline.reveal(entries[entry.index].element, {}, false);
                    }
                }));
                const updatePickerItems = () => {
                    const filteredItems = items.filter(item => {
                        if (picker.value === '@') {
                            // default, no filtering, scoring...
                            item.score = 0;
                            item.highlights = undefined;
                            return true;
                        }
                        const score = (0, filters_1.$Kj)(picker.value, picker.value.toLowerCase(), 1 /*@-character*/, item.label, item.label.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                        if (!score) {
                            return false;
                        }
                        item.score = score[1];
                        item.highlights = { label: (0, filters_1.$Hj)(score) };
                        return true;
                    });
                    if (filteredItems.length === 0) {
                        const label = (0, nls_1.localize)(0, null);
                        picker.items = [{ label, index: -1, kind: 14 /* SymbolKind.String */ }];
                        picker.ariaLabel = label;
                    }
                    else {
                        picker.items = filteredItems;
                    }
                };
                updatePickerItems();
                disposables.add(picker.onDidChangeValue(updatePickerItems));
                const previewDisposable = new lifecycle_1.$lc();
                disposables.add(previewDisposable);
                disposables.add(picker.onDidChangeActive(() => {
                    const [entry] = picker.activeItems;
                    if (entry && entries[entry.index]) {
                        previewDisposable.value = outline.preview(entries[entry.index].element);
                    }
                    else {
                        previewDisposable.clear();
                    }
                }));
            }).catch(err => {
                (0, errors_1.$Y)(err);
                picker.hide();
            }).finally(() => {
                picker.busy = false;
            });
            return disposables;
        }
    };
    exports.$BMb = $BMb;
    exports.$BMb = $BMb = $BMb_1 = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, configuration_1.$8h),
        __param(3, languageFeatures_1.$hF),
        __param(4, outline_1.$trb),
        __param(5, outlineModel_1.$R8)
    ], $BMb);
    class GotoSymbolAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.gotoSymbol'; }
        constructor() {
            super({
                id: GotoSymbolAction.ID,
                title: {
                    value: (0, nls_1.localize)(1, null),
                    mnemonicTitle: (0, nls_1.localize)(2, null),
                    original: 'Go to Symbol in Editor...'
                },
                f1: true,
                keybinding: {
                    when: undefined,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */
                },
                menu: [{
                        id: actions_1.$Ru.MenubarGoMenu,
                        group: '4_symbol_nav',
                        order: 1
                    }]
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($BMb.PREFIX, { itemActivation: quickInput_1.ItemActivation.NONE });
        }
    }
    (0, actions_1.$Xu)(GotoSymbolAction);
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: $BMb,
        prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX,
        contextKey: 'inFileSymbolsPicker',
        placeholder: (0, nls_1.localize)(3, null),
        helpEntries: [
            {
                description: (0, nls_1.localize)(4, null),
                prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX,
                commandId: GotoSymbolAction.ID,
                commandCenterOrder: 40
            },
            {
                description: (0, nls_1.localize)(5, null),
                prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX_BY_CATEGORY
            }
        ]
    });
});
//# sourceMappingURL=gotoSymbolQuickAccess.js.map