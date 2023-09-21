/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/editor/contrib/gotoSymbol/browser/referencesModel", "vs/editor/contrib/gotoSymbol/browser/symbolNavigation", "vs/editor/contrib/message/browser/messageController", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/editor/contrib/gotoSymbol/browser/goToCommands", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "./goToSymbol", "vs/editor/common/services/languageFeatures", "vs/base/common/iterator", "vs/platform/contextkey/common/contextkeys"], function (require, exports, aria_1, async_1, keyCodes_1, types_1, uri_1, editorState_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, corePosition, range_1, editorContextKeys_1, languages_1, referencesController_1, referencesModel_1, symbolNavigation_1, messageController_1, peekView_1, nls, actions_1, commands_1, contextkey_1, instantiation_1, notification_1, progress_1, goToSymbol_1, languageFeatures_1, iterator_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W4 = exports.$V4 = exports.$U4 = void 0;
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, {
        submenu: actions_1.$Ru.EditorContextPeek,
        title: nls.localize(0, null),
        group: 'navigation',
        order: 100
    });
    class $U4 {
        static is(thing) {
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            if (thing instanceof $U4) {
                return true;
            }
            if (corePosition.$js.isIPosition(thing.position) && thing.model) {
                return true;
            }
            return false;
        }
        constructor(model, position) {
            this.model = model;
            this.position = position;
        }
    }
    exports.$U4 = $U4;
    class $V4 extends editorExtensions_1.$uV {
        static { this.d = new Map(); }
        static { this.e = new Set(); }
        static all() {
            return $V4.d.values();
        }
        static f(opts) {
            const result = { ...opts, f1: true };
            // patch context menu when clause
            if (result.menu) {
                for (const item of iterator_1.Iterable.wrap(result.menu)) {
                    if (item.id === actions_1.$Ru.EditorContext || item.id === actions_1.$Ru.EditorContextPeek) {
                        item.when = contextkey_1.$Ii.and(opts.precondition, item.when);
                    }
                }
            }
            return result;
        }
        constructor(configuration, opts) {
            super($V4.f(opts));
            this.configuration = configuration;
            $V4.d.set(opts.id, this);
        }
        runEditorCommand(accessor, editor, arg, range) {
            if (!editor.hasModel()) {
                return Promise.resolve(undefined);
            }
            const notificationService = accessor.get(notification_1.$Yu);
            const editorService = accessor.get(codeEditorService_1.$nV);
            const progressService = accessor.get(progress_1.$7u);
            const symbolNavService = accessor.get(symbolNavigation_1.$O4);
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
            const instaService = accessor.get(instantiation_1.$Ah);
            const model = editor.getModel();
            const position = editor.getPosition();
            const anchor = $U4.is(arg) ? arg : new $U4(model, position);
            const cts = new editorState_1.$t1(editor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
            const promise = (0, async_1.$vg)(this.g(languageFeaturesService, anchor.model, anchor.position, cts.token), cts.token).then(async (references) => {
                if (!references || cts.token.isCancellationRequested) {
                    return;
                }
                (0, aria_1.$$P)(references.ariaMessage);
                let altAction;
                if (references.referenceAt(model.uri, position)) {
                    const altActionId = this.j(editor);
                    if (!$V4.e.has(altActionId) && $V4.d.has(altActionId)) {
                        altAction = $V4.d.get(altActionId);
                    }
                }
                const referenceCount = references.references.length;
                if (referenceCount === 0) {
                    // no result -> show message
                    if (!this.configuration.muteMessage) {
                        const info = model.getWordAtPosition(position);
                        messageController_1.$M2.get(editor)?.showMessage(this.h(info), position);
                    }
                }
                else if (referenceCount === 1 && altAction) {
                    // already at the only result, run alternative
                    $V4.e.add(this.desc.id);
                    instaService.invokeFunction((accessor) => altAction.runEditorCommand(accessor, editor, arg, range).finally(() => {
                        $V4.e.delete(this.desc.id);
                    }));
                }
                else {
                    // normal results handling
                    return this.l(editorService, symbolNavService, editor, references, range);
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
        async l(editorService, symbolNavService, editor, model, range) {
            const gotoLocation = this.k(editor);
            if (!(editor instanceof embeddedCodeEditorWidget_1.$w3) && (this.configuration.openInPeek || (gotoLocation === 'peek' && model.references.length > 1))) {
                this.n(editor, model, range);
            }
            else {
                const next = model.firstReference();
                const peek = model.references.length > 1 && gotoLocation === 'gotoAndPeek';
                const targetEditor = await this.m(editor, editorService, next, this.configuration.openToSide, !peek);
                if (peek && targetEditor) {
                    this.n(targetEditor, model, range);
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
        async m(editor, editorService, reference, sideBySide, highlight) {
            // range is the target-selection-range when we have one
            // and the fallback is the 'full' range
            let range = undefined;
            if ((0, languages_1.$8s)(reference)) {
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
                    selection: range_1.$ks.collapseToStart(range),
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
        n(target, model, range) {
            const controller = referencesController_1.$M4.get(target);
            if (controller && target.hasModel()) {
                controller.toggleWidget(range ?? target.getSelection(), (0, async_1.$ug)(_ => Promise.resolve(model)), this.configuration.openInPeek);
            }
            else {
                model.dispose();
            }
        }
    }
    exports.$V4 = $V4;
    //#region --- DEFINITION
    class $W4 extends $V4 {
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$P4)(languageFeaturesService.definitionProvider, model, position, token), nls.localize(1, null));
        }
        h(info) {
            return info && info.word
                ? nls.localize(2, null, info.word)
                : nls.localize(3, null);
        }
        j(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDefinitionCommand;
        }
        k(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDefinitions;
        }
    }
    exports.$W4 = $W4;
    (0, actions_1.$Xu)(class GoToDefinitionAction extends $W4 {
        static { this.id = 'editor.action.revealDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDefinitionAction.id,
                title: {
                    value: nls.localize(4, null),
                    original: 'Go to Definition',
                    mnemonicTitle: nls.localize(5, null)
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.$23),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }],
                menu: [{
                        id: actions_1.$Ru.EditorContext,
                        group: 'navigation',
                        order: 1.1
                    }, {
                        id: actions_1.$Ru.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 2,
                    }]
            });
            commands_1.$Gr.registerCommandAlias('editor.action.goToDeclaration', GoToDefinitionAction.id);
        }
    });
    (0, actions_1.$Xu)(class OpenDefinitionToSideAction extends $W4 {
        static { this.id = 'editor.action.revealDefinitionAside'; }
        constructor() {
            super({
                openToSide: true,
                openInPeek: false,
                muteMessage: false
            }, {
                id: OpenDefinitionToSideAction.id,
                title: {
                    value: nls.localize(6, null),
                    original: 'Open Definition to the Side'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.$23),
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
            commands_1.$Gr.registerCommandAlias('editor.action.openDeclarationToTheSide', OpenDefinitionToSideAction.id);
        }
    });
    (0, actions_1.$Xu)(class PeekDefinitionAction extends $W4 {
        static { this.id = 'editor.action.peekDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekDefinitionAction.id,
                title: {
                    value: nls.localize(7, null),
                    original: 'Peek Definition'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 70 /* KeyCode.F12 */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 68 /* KeyCode.F10 */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'peek',
                    order: 2
                }
            });
            commands_1.$Gr.registerCommandAlias('editor.action.previewDeclaration', PeekDefinitionAction.id);
        }
    });
    //#endregion
    //#region --- DECLARATION
    class DeclarationAction extends $V4 {
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$Q4)(languageFeaturesService.declarationProvider, model, position, token), nls.localize(8, null));
        }
        h(info) {
            return info && info.word
                ? nls.localize(9, null, info.word)
                : nls.localize(10, null);
        }
        j(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDeclarationCommand;
        }
        k(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDeclarations;
        }
    }
    (0, actions_1.$Xu)(class GoToDeclarationAction extends DeclarationAction {
        static { this.id = 'editor.action.revealDeclaration'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDeclarationAction.id,
                title: {
                    value: nls.localize(11, null),
                    original: 'Go to Declaration',
                    mnemonicTitle: nls.localize(12, null)
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: [{
                        id: actions_1.$Ru.EditorContext,
                        group: 'navigation',
                        order: 1.3
                    }, {
                        id: actions_1.$Ru.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }],
            });
        }
        h(info) {
            return info && info.word
                ? nls.localize(13, null, info.word)
                : nls.localize(14, null);
        }
    });
    (0, actions_1.$Xu)(class PeekDeclarationAction extends DeclarationAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.peekDeclaration',
                title: {
                    value: nls.localize(15, null),
                    original: 'Peek Declaration'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'peek',
                    order: 3
                }
            });
        }
    });
    //#endregion
    //#region --- TYPE DEFINITION
    class TypeDefinitionAction extends $V4 {
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$S4)(languageFeaturesService.typeDefinitionProvider, model, position, token), nls.localize(16, null));
        }
        h(info) {
            return info && info.word
                ? nls.localize(17, null, info.word)
                : nls.localize(18, null);
        }
        j(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeTypeDefinitionCommand;
        }
        k(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleTypeDefinitions;
        }
    }
    (0, actions_1.$Xu)(class GoToTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.goToTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToTypeDefinitionAction.ID,
                title: {
                    value: nls.localize(19, null),
                    original: 'Go to Type Definition',
                    mnemonicTitle: nls.localize(20, null)
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.$Ru.EditorContext,
                        group: 'navigation',
                        order: 1.4
                    }, {
                        id: actions_1.$Ru.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }]
            });
        }
    });
    (0, actions_1.$Xu)(class PeekTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.peekTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekTypeDefinitionAction.ID,
                title: {
                    value: nls.localize(21, null),
                    original: 'Peek Type Definition'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'peek',
                    order: 4
                }
            });
        }
    });
    //#endregion
    //#region --- IMPLEMENTATION
    class ImplementationAction extends $V4 {
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$R4)(languageFeaturesService.implementationProvider, model, position, token), nls.localize(22, null));
        }
        h(info) {
            return info && info.word
                ? nls.localize(23, null, info.word)
                : nls.localize(24, null);
        }
        j(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeImplementationCommand;
        }
        k(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleImplementations;
        }
    }
    (0, actions_1.$Xu)(class GoToImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.goToImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToImplementationAction.ID,
                title: {
                    value: nls.localize(25, null),
                    original: 'Go to Implementations',
                    mnemonicTitle: nls.localize(26, null)
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.$Ru.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.$Ru.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 4,
                    }]
            });
        }
    });
    (0, actions_1.$Xu)(class PeekImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.peekImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekImplementationAction.ID,
                title: {
                    value: nls.localize(27, null),
                    original: 'Peek Implementations'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'peek',
                    order: 5
                }
            });
        }
    });
    //#endregion
    //#region --- REFERENCES
    class ReferencesAction extends $V4 {
        h(info) {
            return info
                ? nls.localize(28, null, info.word)
                : nls.localize(29, null);
        }
        j(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeReferenceCommand;
        }
        k(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
    }
    (0, actions_1.$Xu)(class GoToReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: 'editor.action.goToReferences',
                title: {
                    value: nls.localize(30, null),
                    original: 'Go to References',
                    mnemonicTitle: nls.localize(31, null)
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.$Ru.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.$Ru.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 5,
                    }]
            });
        }
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$T4)(languageFeaturesService.referenceProvider, model, position, true, token), nls.localize(32, null));
        }
    });
    (0, actions_1.$Xu)(class PeekReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.referenceSearch.trigger',
                title: {
                    value: nls.localize(33, null),
                    original: 'Peek References'
                },
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.$Ru.EditorContextPeek,
                    group: 'peek',
                    order: 6
                }
            });
        }
        async g(languageFeaturesService, model, position, token) {
            return new referencesModel_1.$B4(await (0, goToSymbol_1.$T4)(languageFeaturesService.referenceProvider, model, position, false, token), nls.localize(34, null));
        }
    });
    //#endregion
    //#region --- GENERIC goto symbols command
    class GenericGoToLocationAction extends $V4 {
        constructor(config, o, p) {
            super(config, {
                id: 'editor.action.goToLocation',
                title: {
                    value: nls.localize(35, null),
                    original: 'Go to Any Symbol'
                },
                precondition: contextkey_1.$Ii.and(peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
            });
            this.o = o;
            this.p = p;
        }
        async g(languageFeaturesService, _model, _position, _token) {
            return new referencesModel_1.$B4(this.o, nls.localize(36, null));
        }
        h(info) {
            return info && nls.localize(37, null, info.word) || '';
        }
        k(editor) {
            return this.p ?? editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
        j() { return ''; }
    }
    commands_1.$Gr.registerCommand({
        id: 'editor.action.goToLocations',
        description: {
            description: 'Go to locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.$js.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto' },
                { name: 'noResultsMessage', description: 'Human readable message that shows when locations is empty.' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple, noResultsMessage, openInPeek) => {
            (0, types_1.$tf)(uri_1.URI.isUri(resource));
            (0, types_1.$tf)(corePosition.$js.isIPosition(position));
            (0, types_1.$tf)(Array.isArray(references));
            (0, types_1.$tf)(typeof multiple === 'undefined' || typeof multiple === 'string');
            (0, types_1.$tf)(typeof openInPeek === 'undefined' || typeof openInPeek === 'boolean');
            const editorService = accessor.get(codeEditorService_1.$nV);
            const editor = await editorService.openCodeEditor({ resource }, editorService.getFocusedCodeEditor());
            if ((0, editorBrowser_1.$iV)(editor)) {
                editor.setPosition(position);
                editor.revealPositionInCenterIfOutsideViewport(position, 0 /* ScrollType.Smooth */);
                return editor.invokeWithinContext(accessor => {
                    const command = new class extends GenericGoToLocationAction {
                        h(info) {
                            return noResultsMessage || super.h(info);
                        }
                    }({
                        muteMessage: !Boolean(noResultsMessage),
                        openInPeek: Boolean(openInPeek),
                        openToSide: false
                    }, references, multiple);
                    accessor.get(instantiation_1.$Ah).invokeFunction(command.run.bind(command), editor);
                });
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'editor.action.peekLocations',
        description: {
            description: 'Peek locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.$js.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple) => {
            accessor.get(commands_1.$Fr).executeCommand('editor.action.goToLocations', resource, position, references, multiple, undefined, true);
        }
    });
    //#endregion
    //#region --- REFERENCE search special commands
    commands_1.$Gr.registerCommand({
        id: 'editor.action.findReferences',
        handler: (accessor, resource, position) => {
            (0, types_1.$tf)(uri_1.URI.isUri(resource));
            (0, types_1.$tf)(corePosition.$js.isIPosition(position));
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            return codeEditorService.openCodeEditor({ resource }, codeEditorService.getFocusedCodeEditor()).then(control => {
                if (!(0, editorBrowser_1.$iV)(control) || !control.hasModel()) {
                    return undefined;
                }
                const controller = referencesController_1.$M4.get(control);
                if (!controller) {
                    return undefined;
                }
                const references = (0, async_1.$ug)(token => (0, goToSymbol_1.$T4)(languageFeaturesService.referenceProvider, control.getModel(), corePosition.$js.lift(position), false, token).then(references => new referencesModel_1.$B4(references, nls.localize(38, null))));
                const range = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column);
                return Promise.resolve(controller.toggleWidget(range, references, false));
            });
        }
    });
    // use NEW command
    commands_1.$Gr.registerCommandAlias('editor.action.showReferences', 'editor.action.peekLocations');
});
//#endregion
//# sourceMappingURL=goToCommands.js.map