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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "../referencesModel", "./referencesWidget"], function (require, exports, async_1, errors_1, keyCodes_1, lifecycle_1, codeEditorService_1, position_1, range_1, peekView_1, nls, commands_1, configuration_1, contextkey_1, instantiation_1, keybindingsRegistry_1, listService_1, notification_1, storage_1, referencesModel_1, referencesWidget_1) {
    "use strict";
    var $M4_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M4 = exports.$L4 = void 0;
    exports.$L4 = new contextkey_1.$2i('referenceSearchVisible', false, nls.localize(0, null));
    let $M4 = class $M4 {
        static { $M4_1 = this; }
        static { this.ID = 'editor.contrib.referencesController'; }
        static get(editor) {
            return editor.getContribution($M4_1.ID);
        }
        constructor(h, i, contextKeyService, j, k, l, m, n) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = new lifecycle_1.$jc();
            this.e = 0;
            this.f = false;
            this.g = exports.$L4.bindTo(contextKeyService);
        }
        dispose() {
            this.g.reset();
            this.a.dispose();
            this.b?.dispose();
            this.c?.dispose();
            this.b = undefined;
            this.c = undefined;
        }
        toggleWidget(range, modelPromise, peekMode) {
            // close current widget and return early is position didn't change
            let widgetPosition;
            if (this.b) {
                widgetPosition = this.b.position;
            }
            this.closeWidget();
            if (!!widgetPosition && range.containsPosition(widgetPosition)) {
                return;
            }
            this.d = peekMode;
            this.g.set(true);
            // close the widget on model/mode changes
            this.a.add(this.i.onDidChangeModelLanguage(() => { this.closeWidget(); }));
            this.a.add(this.i.onDidChangeModel(() => {
                if (!this.f) {
                    this.closeWidget();
                }
            }));
            const storageKey = 'peekViewLayout';
            const data = referencesWidget_1.$J4.fromJSON(this.m.get(storageKey, 0 /* StorageScope.PROFILE */, '{}'));
            this.b = this.l.createInstance(referencesWidget_1.$K4, this.i, this.h, data);
            this.b.setTitle(nls.localize(1, null));
            this.b.show(range);
            this.a.add(this.b.onDidClose(() => {
                modelPromise.cancel();
                if (this.b) {
                    this.m.store(storageKey, JSON.stringify(this.b.layoutData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    this.b = undefined;
                }
                this.closeWidget();
            }));
            this.a.add(this.b.onDidSelectReference(event => {
                const { element, kind } = event;
                if (!element) {
                    return;
                }
                switch (kind) {
                    case 'open':
                        if (event.source !== 'editor' || !this.n.getValue('editor.stablePeek')) {
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
                            this.o(element, true);
                        }
                        else {
                            this.openReference(element, false, true);
                        }
                        break;
                }
            }));
            const requestId = ++this.e;
            modelPromise.then(model => {
                // still current request? widget still open?
                if (requestId !== this.e || !this.b) {
                    model.dispose();
                    return undefined;
                }
                this.c?.dispose();
                this.c = model;
                // show widget
                return this.b.setModel(this.c).then(() => {
                    if (this.b && this.c && this.i.hasModel()) { // might have been closed
                        // set title
                        if (!this.c.isEmpty) {
                            this.b.setMetaTitle(nls.localize(2, null, this.c.title, this.c.references.length));
                        }
                        else {
                            this.b.setMetaTitle('');
                        }
                        // set 'best' selection
                        const uri = this.i.getModel().uri;
                        const pos = new position_1.$js(range.startLineNumber, range.startColumn);
                        const selection = this.c.nearestReference(uri, pos);
                        if (selection) {
                            return this.b.setSelection(selection).then(() => {
                                if (this.b && this.i.getOption(86 /* EditorOption.peekWidgetDefaultFocus */) === 'editor') {
                                    this.b.focusOnPreviewEditor();
                                }
                            });
                        }
                    }
                    return undefined;
                });
            }, error => {
                this.k.error(error);
            });
        }
        changeFocusBetweenPreviewAndReferences() {
            if (!this.b) {
                // can be called while still resolving...
                return;
            }
            if (this.b.isPreviewEditorFocused()) {
                this.b.focusOnReferenceTree();
            }
            else {
                this.b.focusOnPreviewEditor();
            }
        }
        async goToNextOrPreviousReference(fwd) {
            if (!this.i.hasModel() || !this.c || !this.b) {
                // can be called while still resolving...
                return;
            }
            const currentPosition = this.b.position;
            if (!currentPosition) {
                return;
            }
            const source = this.c.nearestReference(this.i.getModel().uri, currentPosition);
            if (!source) {
                return;
            }
            const target = this.c.nextOrPreviousReference(source, fwd);
            const editorFocus = this.i.hasTextFocus();
            const previewEditorFocus = this.b.isPreviewEditorFocused();
            await this.b.setSelection(target);
            await this.o(target, false);
            if (editorFocus) {
                this.i.focus();
            }
            else if (this.b && previewEditorFocus) {
                this.b.focusOnPreviewEditor();
            }
        }
        async revealReference(reference) {
            if (!this.i.hasModel() || !this.c || !this.b) {
                // can be called while still resolving...
                return;
            }
            await this.b.revealReference(reference);
        }
        closeWidget(focusEditor = true) {
            this.b?.dispose();
            this.c?.dispose();
            this.g.reset();
            this.a.clear();
            this.b = undefined;
            this.c = undefined;
            if (focusEditor) {
                this.i.focus();
            }
            this.e += 1; // Cancel pending requests
        }
        o(ref, pinned) {
            this.b?.hide();
            this.f = true;
            const range = range_1.$ks.lift(ref.range).collapseToStart();
            return this.j.openCodeEditor({
                resource: ref.uri,
                options: { selection: range, selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */, pinned }
            }, this.i).then(openedEditor => {
                this.f = false;
                if (!openedEditor || !this.b) {
                    // something went wrong...
                    this.closeWidget();
                    return;
                }
                if (this.i === openedEditor) {
                    //
                    this.b.show(range);
                    this.b.focusOnReferenceTree();
                }
                else {
                    // we opened a different editor instance which means a different controller instance.
                    // therefore we stop with this controller and continue with the other
                    const other = $M4_1.get(openedEditor);
                    const model = this.c.clone();
                    this.closeWidget();
                    openedEditor.focus();
                    other?.toggleWidget(range, (0, async_1.$ug)(_ => Promise.resolve(model)), this.d ?? false);
                }
            }, (err) => {
                this.f = false;
                (0, errors_1.$Y)(err);
            });
        }
        openReference(ref, sideBySide, pinned) {
            // clear stage
            if (!sideBySide) {
                this.closeWidget();
            }
            const { uri, range } = ref;
            this.j.openCodeEditor({
                resource: uri,
                options: { selection: range, selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */, pinned }
            }, this.i, sideBySide);
        }
    };
    exports.$M4 = $M4;
    exports.$M4 = $M4 = $M4_1 = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, codeEditorService_1.$nV),
        __param(4, notification_1.$Yu),
        __param(5, instantiation_1.$Ah),
        __param(6, storage_1.$Vo),
        __param(7, configuration_1.$8h)
    ], $M4);
    function withController(accessor, fn) {
        const outerEditor = (0, peekView_1.$H3)(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = $M4.get(outerEditor);
        if (controller) {
            fn(controller);
        }
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'togglePeekWidgetFocus',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 60 /* KeyCode.F2 */),
        when: contextkey_1.$Ii.or(exports.$L4, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.changeFocusBetweenPreviewAndReferences();
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'goToNextReference',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
        primary: 62 /* KeyCode.F4 */,
        secondary: [70 /* KeyCode.F12 */],
        when: contextkey_1.$Ii.or(exports.$L4, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.goToNextOrPreviousReference(true);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'goToPreviousReference',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
        primary: 1024 /* KeyMod.Shift */ | 62 /* KeyCode.F4 */,
        secondary: [1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */],
        when: contextkey_1.$Ii.or(exports.$L4, peekView_1.PeekContext.inPeekEditor),
        handler(accessor) {
            withController(accessor, controller => {
                controller.goToNextOrPreviousReference(false);
            });
        }
    });
    // commands that aren't needed anymore because there is now ContextKeyExpr.OR
    commands_1.$Gr.registerCommandAlias('goToNextReferenceFromEmbeddedEditor', 'goToNextReference');
    commands_1.$Gr.registerCommandAlias('goToPreviousReferenceFromEmbeddedEditor', 'goToPreviousReference');
    // close
    commands_1.$Gr.registerCommandAlias('closeReferenceSearchEditor', 'closeReferenceSearch');
    commands_1.$Gr.registerCommand('closeReferenceSearch', accessor => withController(accessor, controller => controller.closeWidget()));
    keybindingsRegistry_1.$Nu.registerKeybindingRule({
        id: 'closeReferenceSearch',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.$Ii.and(peekView_1.PeekContext.inPeekEditor, contextkey_1.$Ii.not('config.editor.stablePeek'))
    });
    keybindingsRegistry_1.$Nu.registerKeybindingRule({
        id: 'closeReferenceSearch',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.$Ii.and(exports.$L4, contextkey_1.$Ii.not('config.editor.stablePeek'))
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'revealReference',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        when: contextkey_1.$Ii.and(exports.$L4, listService_1.$e4, listService_1.$k4.negate(), listService_1.$m4.negate()),
        handler(accessor) {
            const listService = accessor.get(listService_1.$03);
            const focus = listService.lastFocusedList?.getFocus();
            if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.$y4) {
                withController(accessor, controller => controller.revealReference(focus[0]));
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'openReferenceToSide',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        when: contextkey_1.$Ii.and(exports.$L4, listService_1.$e4, listService_1.$k4.negate(), listService_1.$m4.negate()),
        handler(accessor) {
            const listService = accessor.get(listService_1.$03);
            const focus = listService.lastFocusedList?.getFocus();
            if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.$y4) {
                withController(accessor, controller => controller.openReference(focus[0], true, true));
            }
        }
    });
    commands_1.$Gr.registerCommand('openReference', (accessor) => {
        const listService = accessor.get(listService_1.$03);
        const focus = listService.lastFocusedList?.getFocus();
        if (Array.isArray(focus) && focus[0] instanceof referencesModel_1.$y4) {
            withController(accessor, controller => controller.openReference(focus[0], false, true));
        }
    });
});
//# sourceMappingURL=referencesController.js.map