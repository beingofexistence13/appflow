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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "../referencesModel", "./referencesWidget"], function (require, exports, async_1, errors_1, keyCodes_1, lifecycle_1, codeEditorService_1, position_1, range_1, peekView_1, nls, commands_1, configuration_1, contextkey_1, instantiation_1, keybindingsRegistry_1, listService_1, notification_1, storage_1, referencesModel_1, referencesWidget_1) {
    "use strict";
    var ReferencesController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReferencesController = exports.ctxReferenceSearchVisible = void 0;
    exports.ctxReferenceSearchVisible = new contextkey_1.RawContextKey('referenceSearchVisible', false, nls.localize('referenceSearchVisible', "Whether reference peek is visible, like 'Peek References' or 'Peek Definition'"));
    let ReferencesController = class ReferencesController {
        static { ReferencesController_1 = this; }
        static { this.ID = 'editor.contrib.referencesController'; }
        static get(editor) {
            return editor.getContribution(ReferencesController_1.ID);
        }
        constructor(_defaultTreeKeyboardSupport, _editor, contextKeyService, _editorService, _notificationService, _instantiationService, _storageService, _configurationService) {
            this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
            this._editor = _editor;
            this._editorService = _editorService;
            this._notificationService = _notificationService;
            this._instantiationService = _instantiationService;
            this._storageService = _storageService;
            this._configurationService = _configurationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._requestIdPool = 0;
            this._ignoreModelChangeEvent = false;
            this._referenceSearchVisible = exports.ctxReferenceSearchVisible.bindTo(contextKeyService);
        }
        dispose() {
            this._referenceSearchVisible.reset();
            this._disposables.dispose();
            this._widget?.dispose();
            this._model?.dispose();
            this._widget = undefined;
            this._model = undefined;
        }
        toggleWidget(range, modelPromise, peekMode) {
            // close current widget and return early is position didn't change
            let widgetPosition;
            if (this._widget) {
                widgetPosition = this._widget.position;
            }
            this.closeWidget();
            if (!!widgetPosition && range.containsPosition(widgetPosition)) {
                return;
            }
            this._peekMode = peekMode;
            this._referenceSearchVisible.set(true);
            // close the widget on model/mode changes
            this._disposables.add(this._editor.onDidChangeModelLanguage(() => { this.closeWidget(); }));
            this._disposables.add(this._editor.onDidChangeModel(() => {
                if (!this._ignoreModelChangeEvent) {
                    this.closeWidget();
                }
            }));
            const storageKey = 'peekViewLayout';
            const data = referencesWidget_1.LayoutData.fromJSON(this._storageService.get(storageKey, 0 /* StorageScope.PROFILE */, '{}'));
            this._widget = this._instantiationService.createInstance(referencesWidget_1.ReferenceWidget, this._editor, this._defaultTreeKeyboardSupport, data);
            this._widget.setTitle(nls.localize('labelLoading', "Loading..."));
            this._widget.show(range);
            this._disposables.add(this._widget.onDidClose(() => {
                modelPromise.cancel();
                if (this._widget) {
                    this._storageService.store(storageKey, JSON.stringify(this._widget.layoutData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    this._widget = undefined;
                }
                this.closeWidget();
            }));
            this._disposables.add(this._widget.onDidSelectReference(event => {
                const { element, kind } = event;
                if (!element) {
                    return;
                }
                switch (kind) {
                    case 'open':
                        if (event.source !== 'editor' || !this._configurationService.getValue('editor.stablePeek')) {
                            // when stable peek is configured we don't close
                            // the peek window on selecting the editor
                            this.openReference(element, false, false);
                        }
                        break;
                    case 'side':
                        this.openReference(element, true, false);
                        break;
                    case 'goto':
                        if (peekMode) {
                            this._gotoReference(element, true);
                        }
                        else {
                            this.openReference(element, false, true);
                        }
                        break;
                }
            }));
            const requestId = ++this._requestIdPool;
            modelPromise.then(model => {
                // still current request? widget still open?
                if (requestId !== this._requestIdPool || !this._widget) {
                    model.dispose();
                    return undefined;
                }
                this._model?.dispose();
                this._model = model;
                // show widget
                return this._widget.setModel(this._model).then(() => {
                    if (this._widget && this._model && this._editor.hasModel()) { // might have been closed
                        // set title
                        if (!this._model.isEmpty) {
                            this._widget.setMetaTitle(nls.localize('metaTitle.N', "{0} ({1})", this._model.title, this._model.references.length));
                        }
                        else {
                            this._widget.setMetaTitle('');
                        }
                        // set 'best' selection
                        const uri = this._editor.getModel().uri;
                        const pos = new position_1.Position(range.startLineNumber, range.startColumn);
                        const selection = this._model.nearestReference(uri, pos);
                        if (selection) {
                            return this._widget.setSelection(selection).then(() => {
                                if (this._widget && this._editor.getOption(86 /* EditorOption.peekWidgetDefaultFocus */) === 'editor') {
                                    this._widget.focusOnPreviewEditor();
                                }
                            });
                        }
                    }
                    return undefined;
                });
            }, error => {
                this._notificationService.error(error);
            });
        }
        changeFocusBetweenPreviewAndReferences() {
            if (!this._widget) {
                // can be called while still resolving...
                return;
            }
            if (this._widget.isPreviewEditorFocused()) {
                this._widget.focusOnReferenceTree();
            }
            else {
                this._widget.focusOnPreviewEditor();
            }
        }
        async goToNextOrPreviousReference(fwd) {
            if (!this._editor.hasModel() || !this._model || !this._widget) {
                // can be called while still resolving...
                return;
            }
            const currentPosition = this._widget.position;
            if (!currentPosition) {
                return;
            }
            const source = this._model.nearestReference(this._editor.getModel().uri, currentPosition);
            if (!source) {
                return;
            }
            const target = this._model.nextOrPreviousReference(source, fwd);
            const editorFocus = this._editor.hasTextFocus();
            const previewEditorFocus = this._widget.isPreviewEditorFocused();
            await this._widget.setSelection(target);
            await this._gotoReference(target, false);
            if (editorFocus) {
                this._editor.focus();
            }
            else if (this._widget && previewEditorFocus) {
                this._widget.focusOnPreviewEditor();
            }
        }
        async revealReference(reference) {
            if (!this._editor.hasModel() || !this._model || !this._widget) {
                // can be called while still resolving...
                return;
            }
            await this._widget.revealReference(reference);
        }
        closeWidget(focusEditor = true) {
            this._widget?.dispose();
            this._model?.dispose();
            this._referenceSearchVisible.reset();
            this._disposables.clear();
            this._widget = undefined;
            this._model = undefined;
            if (focusEditor) {
                this._editor.focus();
            }
            this._requestIdPool += 1; // Cancel pending requests
        }
        _gotoReference(ref, pinned) {
            this._widget?.hide();
            this._ignoreModelChangeEvent = true;
            const range = range_1.Range.lift(ref.range).collapseToStart();
            return this._editorService.openCodeEditor({
                resource: ref.uri,
                options: { selection: range, selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */, pinned }
            }, this._editor).then(openedEditor => {
                this._ignoreModelChangeEvent = false;
                if (!openedEditor || !this._widget) {
                    // something went wrong...
                    this.closeWidget();
                    return;
                }
                if (this._editor === openedEditor) {
                    //
                    this._widget.show(range);
                    this._widget.focusOnReferenceTree();
                }
                else {
                    // we opened a different editor instance which means a different controller instance.
                    // therefore we stop with this controller and continue with the other
                    const other = ReferencesController_1.get(openedEditor);
                    const model = this._model.clone();
                    this.closeWidget();
                    openedEditor.focus();
                    other?.toggleWidget(range, (0, async_1.createCancelablePromise)(_ => Promise.resolve(model)), this._peekMode ?? false);
                }
            }, (err) => {
                this._ignoreModelChangeEvent = false;
                (0, errors_1.onUnexpectedError)(err);
            });
        }
        openReference(ref, sideBySide, pinned) {
            // clear stage
            if (!sideBySide) {
                this.closeWidget();
            }
            const { uri, range } = ref;
            this._editorService.openCodeEditor({
                resource: uri,
                options: { selection: range, selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */, pinned }
            }, this._editor, sideBySide);
        }
    };
    exports.ReferencesController = ReferencesController;
    exports.ReferencesController = ReferencesController = ReferencesController_1 = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, notification_1.INotificationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, storage_1.IStorageService),
        __param(7, configuration_1.IConfigurationService)
    ], ReferencesController);
    function withController(accessor, fn) {
        const outerEditor = (0, peekView_1.getOuterEditor)(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = ReferencesController.get(outerEditor);
        if (controller) {
            fn(controller);
        }
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'togglePeekWidgetFocus',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 60 /* KeyCode.F2 */),
        when: contextkey_1.ContextKeyExpr.or(exports.ctxReferenceSearchVisible, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.changeFocusBetweenPreviewAndReferences();
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'goToNextReference',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
        primary: 62 /* KeyCode.F4 */,
        secondary: [70 /* KeyCode.F12 */],
        when: contextkey_1.ContextKeyExpr.or(exports.ctxReferenceSearchVisible, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.goToNextOrPreviousReference(true);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'goToPreviousReference',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
        primary: 1024 /* KeyMod.Shift */ | 62 /* KeyCode.F4 */,
        secondary: [1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */],
        when: contextkey_1.ContextKeyExpr.or(exports.ctxReferenceSearchVisible, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.goToNextOrPreviousReference(false);
            });
        }
    });
    // commands that aren't needed anymore because there is now ContextKeyExpr.OR
    commands_1.CommandsRegistry.registerCommandAlias('goToNextReferenceFromEmbeddedEditor', 'goToNextReference');
    commands_1.CommandsRegistry.registerCommandAlias('goToPreviousReferenceFromEmbeddedEditor', 'goToPreviousReference');
    // close
    commands_1.CommandsRegistry.registerCommandAlias('closeReferenceSearchEditor', 'closeReferenceSearch');
    commands_1.CommandsRegistry.registerCommand('closeReferenceSearch', accessor => withController(accessor, controller => controller.closeWidget()));
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: 'closeReferenceSearch',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.ContextKeyExpr.and(peekView_1.PeekContext.inPeekEditor, contextkey_1.ContextKeyExpr.not('config.editor.stablePeek'))
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: 'closeReferenceSearch',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.ContextKeyExpr.and(exports.ctxReferenceSearchVisible, contextkey_1.ContextKeyExpr.not('config.editor.stablePeek'))
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'revealReference',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        when: contextkey_1.ContextKeyExpr.and(exports.ctxReferenceSearchVisible, listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchTreeElementCanCollapse.negate(), listService_1.WorkbenchTreeElementCanExpand.negate()),
        handler(accessor) {
            const listService = accessor.get(listService_1.IListService);
            const focus = listService.lastFocusedList?.getFocus();
            if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.OneReference) {
                withController(accessor, controller => controller.revealReference(focus[0]));
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'openReferenceToSide',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        when: contextkey_1.ContextKeyExpr.and(exports.ctxReferenceSearchVisible, listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchTreeElementCanCollapse.negate(), listService_1.WorkbenchTreeElementCanExpand.negate()),
        handler(accessor) {
            const listService = accessor.get(listService_1.IListService);
            const focus = listService.lastFocusedList?.getFocus();
            if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.OneReference) {
                withController(accessor, controller => controller.openReference(focus[0], true, true));
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand('openReference', (accessor) => {
        const listService = accessor.get(listService_1.IListService);
        const focus = listService.lastFocusedList?.getFocus();
        if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.OneReference) {
            withController(accessor, controller => controller.openReference(focus[0], false, true));
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9nb3RvU3ltYm9sL2Jyb3dzZXIvcGVlay9yZWZlcmVuY2VzQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMkJuRixRQUFBLHlCQUF5QixHQUFHLElBQUksMEJBQWEsQ0FBVSx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxnRkFBZ0YsQ0FBQyxDQUFDLENBQUM7SUFFeE4sSUFBZSxvQkFBb0IsR0FBbkMsTUFBZSxvQkFBb0I7O2lCQUV6QixPQUFFLEdBQUcscUNBQXFDLEFBQXhDLENBQXlDO1FBWTNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDN0IsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUF1QixzQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsWUFDa0IsMkJBQW9DLEVBQ3BDLE9BQW9CLEVBQ2pCLGlCQUFxQyxFQUNyQyxjQUFtRCxFQUNqRCxvQkFBMkQsRUFDMUQscUJBQTZELEVBQ25FLGVBQWlELEVBQzNDLHFCQUE2RDtZQVBuRSxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQVM7WUFDcEMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUVBLG1CQUFjLEdBQWQsY0FBYyxDQUFvQjtZQUNoQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ3pDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDbEQsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQzFCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUF0QnBFLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFLOUMsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDbkIs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