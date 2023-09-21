/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/editor/contrib/gotoSymbol/browser/referencesModel", "vs/editor/contrib/gotoSymbol/browser/symbolNavigation", "vs/editor/contrib/message/browser/messageController", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "./goToSymbol", "vs/editor/common/services/languageFeatures", "vs/base/common/iterator", "vs/platform/contextkey/common/contextkeys"], function (require, exports, aria_1, async_1, keyCodes_1, types_1, uri_1, editorState_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, corePosition, range_1, editorContextKeys_1, languages_1, referencesController_1, referencesModel_1, symbolNavigation_1, messageController_1, peekView_1, nls, actions_1, commands_1, contextkey_1, instantiation_1, notification_1, progress_1, goToSymbol_1, languageFeatures_1, iterator_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefinitionAction = exports.SymbolNavigationAction = exports.SymbolNavigationAnchor = void 0;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        submenu: actions_1.MenuId.EditorContextPeek,
        title: nls.localize('peek.submenu', "Peek"),
        group: 'navigation',
        order: 100
    });
    class SymbolNavigationAnchor {
        static is(thing) {
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            if (thing instanceof SymbolNavigationAnchor) {
                return true;
            }
            if (corePosition.Position.isIPosition(thing.position) && thing.model) {
                return true;
            }
            return false;
        }
        constructor(model, position) {
            this.model = model;
            this.position = position;
        }
    }
    exports.SymbolNavigationAnchor = SymbolNavigationAnchor;
    class SymbolNavigationAction extends editorExtensions_1.EditorAction2 {
        static { this._allSymbolNavigationCommands = new Map(); }
        static { this._activeAlternativeCommands = new Set(); }
        static all() {
            return SymbolNavigationAction._allSymbolNavigationCommands.values();
        }
        static _patchConfig(opts) {
            const result = { ...opts, f1: true };
            // patch context menu when clause
            if (result.menu) {
                for (const item of iterator_1.Iterable.wrap(result.menu)) {
                    if (item.id === actions_1.MenuId.EditorContext || item.id === actions_1.MenuId.EditorContextPeek) {
                        item.when = contextkey_1.ContextKeyExpr.and(opts.precondition, item.when);
                    }
                }
            }
            return result;
        }
        constructor(configuration, opts) {
            super(SymbolNavigationAction._patchConfig(opts));
            this.configuration = configuration;
            SymbolNavigationAction._allSymbolNavigationCommands.set(opts.id, this);
        }
        runEditorCommand(accessor, editor, arg, range) {
            if (!editor.hasModel()) {
                return Promise.resolve(undefined);
            }
            const notificationService = accessor.get(notification_1.INotificationService);
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const progressService = accessor.get(progress_1.IEditorProgressService);
            const symbolNavService = accessor.get(symbolNavigation_1.ISymbolNavigationService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const model = editor.getModel();
            const position = editor.getPosition();
            const anchor = SymbolNavigationAnchor.is(arg) ? arg : new SymbolNavigationAnchor(model, position);
            const cts = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
            const promise = (0, async_1.raceCancellation)(this._getLocationModel(languageFeaturesService, anchor.model, anchor.position, cts.token), cts.token).then(async (references) => {
                if (!references || cts.token.isCancellationRequested) {
                    return;
                }
                (0, aria_1.alert)(references.ariaMessage);
                let altAction;
                if (references.referenceAt(model.uri, position)) {
                    const altActionId = this._getAlternativeCommand(editor);
                    if (!SymbolNavigationAction._activeAlternativeCommands.has(altActionId) && SymbolNavigationAction._allSymbolNavigationCommands.has(altActionId)) {
                        altAction = SymbolNavigationAction._allSymbolNavigationCommands.get(altActionId);
                    }
                }
                const referenceCount = references.references.length;
                if (referenceCount === 0) {
                    // no result -> show message
                    if (!this.configuration.muteMessage) {
                        const info = model.getWordAtPosition(position);
                        messageController_1.MessageController.get(editor)?.showMessage(this._getNoResultFoundMessage(info), position);
                    }
                }
                else if (referenceCount === 1 && altAction) {
                    // already at the only result, run alternative
                    SymbolNavigationAction._activeAlternativeCommands.add(this.desc.id);
                    instaService.invokeFunction((accessor) => altAction.runEditorCommand(accessor, editor, arg, range).finally(() => {
                        SymbolNavigationAction._activeAlternativeCommands.delete(this.desc.id);
                    }));
                }
                else {
                    // normal results handling
                    return this._onResult(editorService, symbolNavService, editor, references, range);
                }
            }, (err) => {
                // report an error
                notificationService.error(err);
            }).finally(() => {
                cts.dispose();
            });
            progressService.showWhile(promise, 250);
            return promise;
        }
        async _onResult(editorService, symbolNavService, editor, model, range) {
            const gotoLocation = this._getGoToPreference(editor);
            if (!(editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) && (this.configuration.openInPeek || (gotoLocation === 'peek' && model.references.length > 1))) {
                this._openInPeek(editor, model, range);
            }
            else {
                const next = model.firstReference();
                const peek = model.references.length > 1 && gotoLocation === 'gotoAndPeek';
                const targetEditor = await this._openReference(editor, editorService, next, this.configuration.openToSide, !peek);
                if (peek && targetEditor) {
                    this._openInPeek(targetEditor, model, range);
                }
                else {
                    model.dispose();
                }
                // keep remaining locations around when using
                // 'goto'-mode
                if (gotoLocation === 'goto') {
                    symbolNavService.put(next);
                }
            }
        }
        async _openReference(editor, editorService, reference, sideBySide, highlight) {
            // range is the target-selection-range when we have one
            // and the fallback is the 'full' range
            let range = undefined;
            if ((0, languages_1.isLocationLink)(reference)) {
                range = reference.targetSelectionRange;
            }
            if (!range) {
                range = reference.range;
            }
            if (!range) {
                return undefined;
            }
            const targetEditor = await editorService.openCodeEditor({
                resource: reference.uri,
                options: {
                    selection: range_1.Range.collapseToStart(range),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */,
                    selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */
                }
            }, editor, sideBySide);
            if (!targetEditor) {
                return undefined;
            }
            if (highlight) {
                const modelNow = targetEditor.getModel();
                const decorations = targetEditor.createDecorationsCollection([{ range, options: { description: 'symbol-navigate-action-highlight', className: 'symbolHighlight' } }]);
                setTimeout(() => {
                    if (targetEditor.getModel() === modelNow) {
                        decorations.clear();
                    }
                }, 350);
            }
            return targetEditor;
        }
        _openInPeek(target, model, range) {
            const controller = referencesController_1.ReferencesController.get(target);
            if (controller && target.hasModel()) {
                controller.toggleWidget(range ?? target.getSelection(), (0, async_1.createCancelablePromise)(_ => Promise.resolve(model)), this.configuration.openInPeek);
            }
            else {
                model.dispose();
            }
        }
    }
    exports.SymbolNavigationAction = SymbolNavigationAction;
    //#region --- DEFINITION
    class DefinitionAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getDefinitionsAtPosition)(languageFeaturesService.definitionProvider, model, position, token), nls.localize('def.title', 'Definitions'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('noResultWord', "No definition found for '{0}'", info.word)
                : nls.localize('generic.noResults', "No definition found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDefinitionCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDefinitions;
        }
    }
    exports.DefinitionAction = DefinitionAction;
    (0, actions_1.registerAction2)(class GoToDefinitionAction extends DefinitionAction {
        static { this.id = 'editor.action.revealDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDefinitionAction.id,
                title: {
                    value: nls.localize('actions.goToDecl.label', "Go to Definition"),
                    original: 'Go to Definition',
                    mnemonicTitle: nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.IsWebContext),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }],
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.1
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 2,
                    }]
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.goToDeclaration', GoToDefinitionAction.id);
        }
    });
    (0, actions_1.registerAction2)(class OpenDefinitionToSideAction extends DefinitionAction {
        static { this.id = 'editor.action.revealDefinitionAside'; }
        constructor() {
            super({
                openToSide: true,
                openInPeek: false,
                muteMessage: false
            }, {
                id: OpenDefinitionToSideAction.id,
                title: {
                    value: nls.localize('actions.goToDeclToSide.label', "Open Definition to the Side"),
                    original: 'Open Definition to the Side'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.IsWebContext),
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.openDeclarationToTheSide', OpenDefinitionToSideAction.id);
        }
    });
    (0, actions_1.registerAction2)(class PeekDefinitionAction extends DefinitionAction {
        static { this.id = 'editor.action.peekDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekDefinitionAction.id,
                title: {
                    value: nls.localize('actions.previewDecl.label', "Peek Definition"),
                    original: 'Peek Definition'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 70 /* KeyCode.F12 */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 68 /* KeyCode.F10 */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 2
                }
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.previewDeclaration', PeekDefinitionAction.id);
        }
    });
    //#endregion
    //#region --- DECLARATION
    class DeclarationAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getDeclarationsAtPosition)(languageFeaturesService.declarationProvider, model, position, token), nls.localize('decl.title', 'Declarations'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('decl.noResultWord', "No declaration found for '{0}'", info.word)
                : nls.localize('decl.generic.noResults', "No declaration found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDeclarationCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDeclarations;
        }
    }
    (0, actions_1.registerAction2)(class GoToDeclarationAction extends DeclarationAction {
        static { this.id = 'editor.action.revealDeclaration'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDeclarationAction.id,
                title: {
                    value: nls.localize('actions.goToDeclaration.label', "Go to Declaration"),
                    original: 'Go to Declaration',
                    mnemonicTitle: nls.localize({ key: 'miGotoDeclaration', comment: ['&& denotes a mnemonic'] }, "Go to &&Declaration")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.3
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }],
            });
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('decl.noResultWord', "No declaration found for '{0}'", info.word)
                : nls.localize('decl.generic.noResults', "No declaration found");
        }
    });
    (0, actions_1.registerAction2)(class PeekDeclarationAction extends DeclarationAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.peekDeclaration',
                title: {
                    value: nls.localize('actions.peekDecl.label', "Peek Declaration"),
                    original: 'Peek Declaration'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 3
                }
            });
        }
    });
    //#endregion
    //#region --- TYPE DEFINITION
    class TypeDefinitionAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getTypeDefinitionsAtPosition)(languageFeaturesService.typeDefinitionProvider, model, position, token), nls.localize('typedef.title', 'Type Definitions'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('goToTypeDefinition.noResultWord', "No type definition found for '{0}'", info.word)
                : nls.localize('goToTypeDefinition.generic.noResults', "No type definition found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeTypeDefinitionCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleTypeDefinitions;
        }
    }
    (0, actions_1.registerAction2)(class GoToTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.goToTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToTypeDefinitionAction.ID,
                title: {
                    value: nls.localize('actions.goToTypeDefinition.label', "Go to Type Definition"),
                    original: 'Go to Type Definition',
                    mnemonicTitle: nls.localize({ key: 'miGotoTypeDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Type Definition")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.4
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }]
            });
        }
    });
    (0, actions_1.registerAction2)(class PeekTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.peekTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekTypeDefinitionAction.ID,
                title: {
                    value: nls.localize('actions.peekTypeDefinition.label', "Peek Type Definition"),
                    original: 'Peek Type Definition'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 4
                }
            });
        }
    });
    //#endregion
    //#region --- IMPLEMENTATION
    class ImplementationAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getImplementationsAtPosition)(languageFeaturesService.implementationProvider, model, position, token), nls.localize('impl.title', 'Implementations'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('goToImplementation.noResultWord', "No implementation found for '{0}'", info.word)
                : nls.localize('goToImplementation.generic.noResults', "No implementation found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeImplementationCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleImplementations;
        }
    }
    (0, actions_1.registerAction2)(class GoToImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.goToImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToImplementationAction.ID,
                title: {
                    value: nls.localize('actions.goToImplementation.label', "Go to Implementations"),
                    original: 'Go to Implementations',
                    mnemonicTitle: nls.localize({ key: 'miGotoImplementation', comment: ['&& denotes a mnemonic'] }, "Go to &&Implementations")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 4,
                    }]
            });
        }
    });
    (0, actions_1.registerAction2)(class PeekImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.peekImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekImplementationAction.ID,
                title: {
                    value: nls.localize('actions.peekImplementation.label', "Peek Implementations"),
                    original: 'Peek Implementations'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 5
                }
            });
        }
    });
    //#endregion
    //#region --- REFERENCES
    class ReferencesAction extends SymbolNavigationAction {
        _getNoResultFoundMessage(info) {
            return info
                ? nls.localize('references.no', "No references found for '{0}'", info.word)
                : nls.localize('references.noGeneric', "No references found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeReferenceCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
    }
    (0, actions_1.registerAction2)(class GoToReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: 'editor.action.goToReferences',
                title: {
                    value: nls.localize('goToReferences.label', "Go to References"),
                    original: 'Go to References',
                    mnemonicTitle: nls.localize({ key: 'miGotoReference', comment: ['&& denotes a mnemonic'] }, "Go to &&References")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 5,
                    }]
            });
        }
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, model, position, true, token), nls.localize('ref.title', 'References'));
        }
    });
    (0, actions_1.registerAction2)(class PeekReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.referenceSearch.trigger',
                title: {
                    value: nls.localize('references.action.label', "Peek References"),
                    original: 'Peek References'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 6
                }
            });
        }
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, model, position, false, token), nls.localize('ref.title', 'References'));
        }
    });
    //#endregion
    //#region --- GENERIC goto symbols command
    class GenericGoToLocationAction extends SymbolNavigationAction {
        constructor(config, _references, _gotoMultipleBehaviour) {
            super(config, {
                id: 'editor.action.goToLocation',
                title: {
                    value: nls.localize('label.generic', "Go to Any Symbol"),
                    original: 'Go to Any Symbol'
                },
                precondition: contextkey_1.ContextKeyExpr.and(peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
            });
            this._references = _references;
            this._gotoMultipleBehaviour = _gotoMultipleBehaviour;
        }
        async _getLocationModel(languageFeaturesService, _model, _position, _token) {
            return new referencesModel_1.ReferencesModel(this._references, nls.localize('generic.title', 'Locations'));
        }
        _getNoResultFoundMessage(info) {
            return info && nls.localize('generic.noResult', "No results for '{0}'", info.word) || '';
        }
        _getGoToPreference(editor) {
            return this._gotoMultipleBehaviour ?? editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
        _getAlternativeCommand() { return ''; }
    }
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.goToLocations',
        description: {
            description: 'Go to locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.Position.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto' },
                { name: 'noResultsMessage', description: 'Human readable message that shows when locations is empty.' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple, noResultsMessage, openInPeek) => {
            (0, types_1.assertType)(uri_1.URI.isUri(resource));
            (0, types_1.assertType)(corePosition.Position.isIPosition(position));
            (0, types_1.assertType)(Array.isArray(references));
            (0, types_1.assertType)(typeof multiple === 'undefined' || typeof multiple === 'string');
            (0, types_1.assertType)(typeof openInPeek === 'undefined' || typeof openInPeek === 'boolean');
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const editor = await editorService.openCodeEditor({ resource }, editorService.getFocusedCodeEditor());
            if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                editor.setPosition(position);
                editor.revealPositionInCenterIfOutsideViewport(position, 0 /* ScrollType.Smooth */);
                return editor.invokeWithinContext(accessor => {
                    const command = new class extends GenericGoToLocationAction {
                        _getNoResultFoundMessage(info) {
                            return noResultsMessage || super._getNoResultFoundMessage(info);
                        }
                    }({
                        muteMessage: !Boolean(noResultsMessage),
                        openInPeek: Boolean(openInPeek),
                        openToSide: false
                    }, references, multiple);
                    accessor.get(instantiation_1.IInstantiationService).invokeFunction(command.run.bind(command), editor);
                });
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.peekLocations',
        description: {
            description: 'Peek locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.Position.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple) => {
            accessor.get(commands_1.ICommandService).executeCommand('editor.action.goToLocations', resource, position, references, multiple, undefined, true);
        }
    });
    //#endregion
    //#region --- REFERENCE search special commands
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.findReferences',
        handler: (accessor, resource, position) => {
            (0, types_1.assertType)(uri_1.URI.isUri(resource));
            (0, types_1.assertType)(corePosition.Position.isIPosition(position));
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            return codeEditorService.openCodeEditor({ resource }, codeEditorService.getFocusedCodeEditor()).then(control => {
                if (!(0, editorBrowser_1.isCodeEditor)(control) || !control.hasModel()) {
                    return undefined;
                }
                const controller = referencesController_1.ReferencesController.get(control);
                if (!controller) {
                    return undefined;
                }
                const references = (0, async_1.createCancelablePromise)(token => (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, control.getModel(), corePosition.Position.lift(position), false, token).then(references => new referencesModel_1.ReferencesModel(references, nls.localize('ref.title', 'References'))));
                const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                return Promise.resolve(controller.toggleWidget(range, references, false));
            });
        }
    });
    // use NEW command
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.showReferences', 'editor.action.peekLocations');
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29Ub0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZ290b1N5bWJvbC9icm93c2VyL2dvVG9Db21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3Q2hHLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsYUFBYSxFQUFnQjtRQUMvRCxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxpQkFBaUI7UUFDakMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztRQUMzQyxLQUFLLEVBQUUsWUFBWTtRQUNuQixLQUFLLEVBQUUsR0FBRztLQUNWLENBQUMsQ0FBQztJQVFILE1BQWEsc0JBQXNCO1FBRWxDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBVTtZQUNuQixJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDeEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELElBQUksS0FBSyxZQUFZLHNCQUFzQixFQUFFO2dCQUM1QyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBMEIsS0FBTSxDQUFDLFFBQVEsQ0FBQyxJQUE2QixLQUFNLENBQUMsS0FBSyxFQUFFO2dCQUN6SCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsWUFBcUIsS0FBaUIsRUFBVyxRQUErQjtZQUEzRCxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVcsYUFBUSxHQUFSLFFBQVEsQ0FBdUI7UUFBSSxDQUFDO0tBQ3JGO0lBaEJELHdEQWdCQztJQUVELE1BQXNCLHNCQUF1QixTQUFRLGdDQUFhO2lCQUVsRCxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztpQkFD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