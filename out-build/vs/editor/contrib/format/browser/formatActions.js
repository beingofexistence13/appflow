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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/characterClassifier", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/format/browser/formattingEdit", "vs/nls!vs/editor/contrib/format/browser/formatActions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress"], function (require, exports, arrays_1, cancellation_1, errors_1, keyCodes_1, lifecycle_1, editorExtensions_1, codeEditorService_1, characterClassifier_1, range_1, editorContextKeys_1, editorWorker_1, languageFeatures_1, format_1, formattingEdit_1, nls, commands_1, contextkey_1, instantiation_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M8 = void 0;
    let $M8 = class $M8 {
        static { this.ID = 'editor.contrib.autoFormat'; }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$jc();
            this.a.add(d.onTypeFormattingEditProvider.onDidChange(this.g, this));
            this.a.add(c.onDidChangeModel(() => this.g()));
            this.a.add(c.onDidChangeModelLanguage(() => this.g()));
            this.a.add(c.onDidChangeConfiguration(e => {
                if (e.hasChanged(56 /* EditorOption.formatOnType */)) {
                    this.g();
                }
            }));
            this.g();
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
        }
        g() {
            // clean up
            this.b.clear();
            // we are disabled
            if (!this.c.getOption(56 /* EditorOption.formatOnType */)) {
                return;
            }
            // no model
            if (!this.c.hasModel()) {
                return;
            }
            const model = this.c.getModel();
            // no support
            const [support] = this.d.onTypeFormattingEditProvider.ordered(model);
            if (!support || !support.autoFormatTriggerCharacters) {
                return;
            }
            // register typing listeners that will trigger the format
            const triggerChars = new characterClassifier_1.$Is();
            for (const ch of support.autoFormatTriggerCharacters) {
                triggerChars.add(ch.charCodeAt(0));
            }
            this.b.add(this.c.onDidType((text) => {
                const lastCharCode = text.charCodeAt(text.length - 1);
                if (triggerChars.has(lastCharCode)) {
                    this.h(String.fromCharCode(lastCharCode));
                }
            }));
        }
        h(ch) {
            if (!this.c.hasModel()) {
                return;
            }
            if (this.c.getSelections().length > 1 || !this.c.getSelection().isEmpty()) {
                return;
            }
            const model = this.c.getModel();
            const position = this.c.getPosition();
            const cts = new cancellation_1.$pd();
            // install a listener that checks if edits happens before the
            // position on which we format right now. If so, we won't
            // apply the format edits
            const unbind = this.c.onDidChangeModelContent((e) => {
                if (e.isFlush) {
                    // a model.setValue() was called
                    // cancel only once
                    cts.cancel();
                    unbind.dispose();
                    return;
                }
                for (let i = 0, len = e.changes.length; i < len; i++) {
                    const change = e.changes[i];
                    if (change.range.endLineNumber <= position.lineNumber) {
                        // cancel only once
                        cts.cancel();
                        unbind.dispose();
                        return;
                    }
                }
            });
            (0, format_1.$L8)(this.f, this.d, model, position, ch, model.getFormattingOptions(), cts.token).then(edits => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                if ((0, arrays_1.$Jb)(edits)) {
                    formattingEdit_1.$B8.execute(this.c, edits, true);
                    (0, format_1.$C8)(edits);
                }
            }).finally(() => {
                unbind.dispose();
            });
        }
    };
    exports.$M8 = $M8;
    exports.$M8 = $M8 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, editorWorker_1.$4Y)
    ], $M8);
    let FormatOnPaste = class FormatOnPaste {
        static { this.ID = 'editor.contrib.formatOnPaste'; }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$jc();
            this.a.add(c.onDidChangeConfiguration(() => this.g()));
            this.a.add(c.onDidChangeModel(() => this.g()));
            this.a.add(c.onDidChangeModelLanguage(() => this.g()));
            this.a.add(d.documentRangeFormattingEditProvider.onDidChange(this.g, this));
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
        }
        g() {
            // clean up
            this.b.clear();
            // we are disabled
            if (!this.c.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.c.hasModel()) {
                return;
            }
            // no formatter
            if (!this.d.documentRangeFormattingEditProvider.has(this.c.getModel())) {
                return;
            }
            this.b.add(this.c.onDidPaste(({ range }) => this.h(range)));
        }
        h(range) {
            if (!this.c.hasModel()) {
                return;
            }
            if (this.c.getSelections().length > 1) {
                return;
            }
            this.f.invokeFunction(format_1.$F8, this.c, range, 2 /* FormattingMode.Silent */, progress_1.$4u.None, cancellation_1.CancellationToken.None).catch(errors_1.$Y);
        }
    };
    FormatOnPaste = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, instantiation_1.$Ah)
    ], FormatOnPaste);
    class FormatDocumentAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.formatDocument',
                label: nls.localize(0, null),
                alias: 'Format Document',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.notInCompositeEditor, editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor, editor) {
            if (editor.hasModel()) {
                const instaService = accessor.get(instantiation_1.$Ah);
                const progressService = accessor.get(progress_1.$7u);
                await progressService.showWhile(instaService.invokeFunction(format_1.$H8, editor, 1 /* FormattingMode.Explicit */, progress_1.$4u.None, cancellation_1.CancellationToken.None), 250);
            }
        }
    }
    class FormatSelectionAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.formatSelection',
                label: nls.localize(1, null),
                alias: 'Format Selection',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    when: editorContextKeys_1.EditorContextKeys.hasNonEmptySelection,
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.$Ah);
            const model = editor.getModel();
            const ranges = editor.getSelections().map(range => {
                return range.isEmpty()
                    ? new range_1.$ks(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber))
                    : range;
            });
            const progressService = accessor.get(progress_1.$7u);
            await progressService.showWhile(instaService.invokeFunction(format_1.$F8, editor, ranges, 1 /* FormattingMode.Explicit */, progress_1.$4u.None, cancellation_1.CancellationToken.None), 250);
        }
    }
    (0, editorExtensions_1.$AV)($M8.ID, $M8, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$AV)(FormatOnPaste.ID, FormatOnPaste, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)(FormatDocumentAction);
    (0, editorExtensions_1.$xV)(FormatSelectionAction);
    // this is the old format action that does both (format document OR format selection)
    // and we keep it here such that existing keybinding configurations etc will still work
    commands_1.$Gr.registerCommand('editor.action.format', async (accessor) => {
        const editor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
        if (!editor || !editor.hasModel()) {
            return;
        }
        const commandService = accessor.get(commands_1.$Fr);
        if (editor.getSelection().isEmpty()) {
            await commandService.executeCommand('editor.action.formatDocument');
        }
        else {
            await commandService.executeCommand('editor.action.formatSelection');
        }
    });
});
//# sourceMappingURL=formatActions.js.map