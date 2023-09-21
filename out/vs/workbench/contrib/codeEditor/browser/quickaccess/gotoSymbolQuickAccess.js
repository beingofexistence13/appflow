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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/actions/common/actions", "vs/base/common/fuzzyScorer", "vs/base/common/filters", "vs/base/common/errors", "vs/workbench/services/outline/browser/outline", "vs/editor/browser/editorBrowser", "vs/workbench/services/editor/common/editorGroupsService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/common/services/languageFeatures"], function (require, exports, nls_1, quickInput_1, editorService_1, platform_1, quickAccess_1, gotoSymbolQuickAccess_1, configuration_1, lifecycle_1, async_1, cancellation_1, actions_1, fuzzyScorer_1, filters_1, errors_1, outline_1, editorBrowser_1, editorGroupsService_1, outlineModel_1, languageFeatures_1) {
    "use strict";
    var GotoSymbolQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoSymbolQuickAccessProvider = void 0;
    let GotoSymbolQuickAccessProvider = class GotoSymbolQuickAccessProvider extends gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider {
        static { GotoSymbolQuickAccessProvider_1 = this; }
        constructor(editorService, editorGroupService, configurationService, languageFeaturesService, outlineService, outlineModelService) {
            super(languageFeaturesService, outlineModelService, {
                openSideBySideDirection: () => this.configuration.openSideBySideDirection
            });
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.outlineService = outlineService;
            this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
        }
        //#region DocumentSymbols (text editor required)
        get configuration() {
            const editorConfig = this.configurationService.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection
            };
        }
        get activeTextEditorControl() {
            // TODO: this distinction should go away by adopting `IOutlineService`
            // for all editors (either text based ones or not). Currently text based
            // editors are not yet using the new outline service infrastructure but the
            // "classical" document symbols approach.
            if ((0, editorBrowser_1.isCompositeEditor)(this.editorService.activeEditorPane?.getControl())) {
                return undefined;
            }
            return this.editorService.activeTextEditorControl;
        }
        gotoLocation(context, options) {
            // Check for sideBySide use
            if ((options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.editorService.activeEditor) {
                context.restoreViewState?.(); // since we open to the side, restore view state in this editor
                const editorOptions = {
                    selection: options.range,
                    pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
                    preserveFocus: options.preserveFocus
                };
                this.editorGroupService.sideGroup.openEditor(this.editorService.activeEditor, editorOptions);
            }
            // Otherwise let parent handle it
            else {
                super.gotoLocation(context, options);
            }
        }
        //#endregion
        //#region public methods to use this picker from other pickers
        static { this.SYMBOL_PICKS_TIMEOUT = 8000; }
        async getSymbolPicks(model, filter, options, disposables, token) {
            // If the registry does not know the model, we wait for as long as
            // the registry knows it. This helps in cases where a language
            // registry was not activated yet for providing any symbols.
            // To not wait forever, we eventually timeout though.
            const result = await Promise.race([
                this.waitForLanguageSymbolRegistry(model, disposables),
                (0, async_1.timeout)(GotoSymbolQuickAccessProvider_1.SYMBOL_PICKS_TIMEOUT)
            ]);
            if (!result || token.isCancellationRequested) {
                return [];
            }
            return this.doGetSymbolPicks(this.getDocumentSymbols(model, token), (0, fuzzyScorer_1.prepareQuery)(filter), options, token);
        }
        //#endregion
        provideWithoutTextEditor(picker) {
            if (this.canPickWithOutlineService()) {
                return this.doGetOutlinePicks(picker);
            }
            return super.provideWithoutTextEditor(picker);
        }
        canPickWithOutlineService() {
            return this.editorService.activeEditorPane ? this.outlineService.canCreateOutline(this.editorService.activeEditorPane) : false;
        }
        doGetOutlinePicks(picker) {
            const pane = this.editorService.activeEditorPane;
            if (!pane) {
                return lifecycle_1.Disposable.None;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            picker.busy = true;
            this.outlineService.createOutline(pane, 4 /* OutlineTarget.QuickPick */, cts.token).then(outline => {
                if (!outline) {
                    return;
                }
                if (cts.token.isCancellationRequested) {
                    outline.dispose();
                    return;
                }
                disposables.add(outline);
                const viewState = outline.captureViewState();
                disposables.add((0, lifecycle_1.toDisposable)(() => {
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
                        const score = (0, filters_1.fuzzyScore)(picker.value, picker.value.toLowerCase(), 1 /*@-character*/, item.label, item.label.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                        if (!score) {
                            return false;
                        }
                        item.score = score[1];
                        item.highlights = { label: (0, filters_1.createMatches)(score) };
                        return true;
                    });
                    if (filteredItems.length === 0) {
                        const label = (0, nls_1.localize)('empty', 'No matching entries');
                        picker.items = [{ label, index: -1, kind: 14 /* SymbolKind.String */ }];
                        picker.ariaLabel = label;
                    }
                    else {
                        picker.items = filteredItems;
                    }
                };
                updatePickerItems();
                disposables.add(picker.onDidChangeValue(updatePickerItems));
                const previewDisposable = new lifecycle_1.MutableDisposable();
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
                (0, errors_1.onUnexpectedError)(err);
                picker.hide();
            }).finally(() => {
                picker.busy = false;
            });
            return disposables;
        }
    };
    exports.GotoSymbolQuickAccessProvider = GotoSymbolQuickAccessProvider;
    exports.GotoSymbolQuickAccessProvider = GotoSymbolQuickAccessProvider = GotoSymbolQuickAccessProvider_1 = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, outline_1.IOutlineService),
        __param(5, outlineModel_1.IOutlineModelService)
    ], GotoSymbolQuickAccessProvider);
    class GotoSymbolAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.gotoSymbol'; }
        constructor() {
            super({
                id: GotoSymbolAction.ID,
                title: {
                    value: (0, nls_1.localize)('gotoSymbol', "Go to Symbol in Editor..."),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miGotoSymbolInEditor', comment: ['&& denotes a mnemonic'] }, "Go to &&Symbol in Editor..."),
                    original: 'Go to Symbol in Editor...'
                },
                f1: true,
                keybinding: {
                    when: undefined,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */
                },
                menu: [{
                        id: actions_1.MenuId.MenubarGoMenu,
                        group: '4_symbol_nav',
                        order: 1
                    }]
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(GotoSymbolQuickAccessProvider.PREFIX, { itemActivation: quickInput_1.ItemActivation.NONE });
        }
    }
    (0, actions_1.registerAction2)(GotoSymbolAction);
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: GotoSymbolQuickAccessProvider,
        prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX,
        contextKey: 'inFileSymbolsPicker',
        placeholder: (0, nls_1.localize)('gotoSymbolQuickAccessPlaceholder', "Type the name of a symbol to go to."),
        helpEntries: [
            {
                description: (0, nls_1.localize)('gotoSymbolQuickAccess', "Go to Symbol in Editor"),
                prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX,
                commandId: GotoSymbolAction.ID,
                commandCenterOrder: 40
            },
            {
                description: (0, nls_1.localize)('gotoSymbolByCategoryQuickAccess', "Go to Symbol in Editor by Category"),
                prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY
            }
        ]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ290b1N5bWJvbFF1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3F1aWNrYWNjZXNzL2dvdG9TeW1ib2xRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBK0J6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLDZEQUFxQzs7UUFJdkYsWUFDaUIsYUFBOEMsRUFDeEMsa0JBQXlELEVBQ3hELG9CQUE0RCxFQUN6RCx1QkFBaUQsRUFDMUQsY0FBZ0QsRUFDM0MsbUJBQXlDO1lBRS9ELEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRTtnQkFDbkQsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUI7YUFDekUsQ0FBQyxDQUFDO1lBVDhCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBUC9DLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUM7UUFhbkcsQ0FBQztRQUVELGdEQUFnRDtRQUVoRCxJQUFZLGFBQWE7WUFDeEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBaUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO1lBRTNHLE9BQU87Z0JBQ04sZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLEVBQUUsMEJBQTBCLElBQUksQ0FBQyxZQUFZLEVBQUUsYUFBYTtnQkFDM0YsdUJBQXVCLEVBQUUsWUFBWSxFQUFFLHVCQUF1QjthQUM5RCxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQWMsdUJBQXVCO1lBRXBDLHNFQUFzRTtZQUN0RSx3RUFBd0U7WUFDeEUsMkVBQTJFO1lBQzNFLHlDQUF5QztZQUN6QyxJQUFJLElBQUEsaUNBQWlCLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUN6RSxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztRQUNuRCxDQUFDO1FBRWtCLFlBQVksQ0FBQyxPQUFzQyxFQUFFLE9BQWlHO1lBRXhLLDJCQUEyQjtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFO2dCQUM1SixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUMsK0RBQStEO2dCQUU3RixNQUFNLGFBQWEsR0FBdUI7b0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztvQkFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCO29CQUN0RSxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7aUJBQ3BDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDN0Y7WUFFRCxpQ0FBaUM7aUJBQzVCO2dCQUNKLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3JDO1FBQ0YsQ0FBQztRQUVELFlBQVk7UUFFWiw4REFBOEQ7aUJBRXRDLHlCQUFvQixHQUFHLElBQUksQUFBUCxDQUFRO1FBRXBELEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBaUIsRUFBRSxNQUFjLEVBQUUsT0FBeUMsRUFBRSxXQUE0QixFQUFFLEtBQXdCO1lBRXhKLGtFQUFrRTtZQUNsRSw4REFBOEQ7WUFDOUQsNERBQTREO1lBQzVELHFEQUFxRDtZQUNyRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDO2dCQUN0RCxJQUFBLGVBQU8sRUFBQywrQkFBNkIsQ0FBQyxvQkFBb0IsQ0FBQzthQUMzRCxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtnQkFDN0MsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBQSwwQkFBWSxFQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRyxDQUFDO1FBRUQsWUFBWTtRQUVPLHdCQUF3QixDQUFDLE1BQTRDO1lBQ3ZGLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsT0FBTyxLQUFLLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVPLHlCQUF5QjtZQUNoQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDaEksQ0FBQztRQUVPLGlCQUFpQixDQUFDLE1BQTRDO1lBQ3JFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7WUFDakQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDO2FBQ3ZCO1lBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBRTFDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZELE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBRW5CLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksbUNBQTJCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTFGLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2IsT0FBTztpQkFDUDtnQkFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUU7b0JBQ3RDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbEIsT0FBTztpQkFDUDtnQkFFRCxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV6QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDN0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO29CQUNqQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDdEMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO3FCQUNwQjtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFFMUUsTUFBTSxLQUFLLEdBQStCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7b0JBQ3BFLE9BQU87d0JBQ04sSUFBSSx5QkFBaUI7d0JBQ3JCLEtBQUssRUFBRSxHQUFHO3dCQUNWLEtBQUssRUFBRSxDQUFDO3dCQUNSLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzt3QkFDbEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO3dCQUM5QixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7d0JBQzFCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztxQkFDOUIsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFFSCxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO29CQUN2QyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7b0JBQ3JDLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUN4RDtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxFQUFFO29CQUM5QixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN6QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssR0FBRyxFQUFFOzRCQUN6QixvQ0FBb0M7NEJBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzRCQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDOzRCQUM1QixPQUFPLElBQUksQ0FBQzt5QkFDWjt3QkFDRCxNQUFNLEtBQUssR0FBRyxJQUFBLG9CQUFVLEVBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDcEwsSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDWCxPQUFPLEtBQUssQ0FBQzt5QkFDYjt3QkFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLHVCQUFhLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDbEQsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7d0JBQ3ZELE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSw0QkFBbUIsRUFBRSxDQUFDLENBQUM7d0JBQy9ELE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO3FCQUN6Qjt5QkFBTTt3QkFDTixNQUFNLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQztxQkFDN0I7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUNGLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BCLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFFNUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLDZCQUFpQixFQUFFLENBQUM7Z0JBQ2xELFdBQVcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFFbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO29CQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztvQkFDbkMsSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDbEMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDeEU7eUJBQU07d0JBQ04saUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7cUJBQzFCO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2QsSUFBQSwwQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDZixNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7O0lBdk1XLHNFQUE2Qjs0Q0FBN0IsNkJBQTZCO1FBS3ZDLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsMENBQW9CLENBQUE7UUFDcEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDJDQUF3QixDQUFBO1FBQ3hCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsbUNBQW9CLENBQUE7T0FWViw2QkFBNkIsQ0F3TXpDO0lBRUQsTUFBTSxnQkFBaUIsU0FBUSxpQkFBTztpQkFFckIsT0FBRSxHQUFHLDZCQUE2QixDQUFDO1FBRW5EO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN2QixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQztvQkFDMUQsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSw2QkFBNkIsQ0FBQztvQkFDM0gsUUFBUSxFQUFFLDJCQUEyQjtpQkFDckM7Z0JBQ0QsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLElBQUksRUFBRSxTQUFTO29CQUNmLE1BQU0sNkNBQW1DO29CQUN6QyxPQUFPLEVBQUUsbURBQTZCLHdCQUFlO2lCQUNyRDtnQkFDRCxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixLQUFLLEVBQUUsY0FBYzt3QkFDckIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLEVBQUUsY0FBYyxFQUFFLDJCQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsSSxDQUFDOztJQUdGLElBQUEseUJBQWUsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRWxDLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztRQUNoRyxJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLE1BQU0sRUFBRSw2REFBcUMsQ0FBQyxNQUFNO1FBQ3BELFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGtDQUFrQyxFQUFFLHFDQUFxQyxDQUFDO1FBQ2hHLFdBQVcsRUFBRTtZQUNaO2dCQUNDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSx3QkFBd0IsQ0FBQztnQkFDeEUsTUFBTSxFQUFFLDZEQUFxQyxDQUFDLE1BQU07Z0JBQ3BELFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM5QixrQkFBa0IsRUFBRSxFQUFFO2FBQ3RCO1lBQ0Q7Z0JBQ0MsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGlDQUFpQyxFQUFFLG9DQUFvQyxDQUFDO2dCQUM5RixNQUFNLEVBQUUsNkRBQXFDLENBQUMsa0JBQWtCO2FBQ2hFO1NBQ0Q7S0FDRCxDQUFDLENBQUMifQ==