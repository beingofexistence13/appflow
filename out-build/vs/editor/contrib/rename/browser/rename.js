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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/message/browser/messageController", "vs/nls!vs/editor/contrib/rename/browser/rename", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "./renameInputField", "vs/editor/common/services/languageFeatures"], function (require, exports, aria_1, async_1, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, editorState_1, editorExtensions_1, bulkEditService_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, textResourceConfiguration_1, messageController_1, nls, configurationRegistry_1, contextkey_1, instantiation_1, log_1, notification_1, progress_1, platform_1, renameInputField_1, languageFeatures_1) {
    "use strict";
    var RenameController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s0 = exports.$r0 = void 0;
    class RenameSkeleton {
        constructor(c, d, registry) {
            this.c = c;
            this.d = d;
            this.b = 0;
            this.a = registry.ordered(c);
        }
        hasProvider() {
            return this.a.length > 0;
        }
        async resolveRenameLocation(token) {
            const rejects = [];
            for (this.b = 0; this.b < this.a.length; this.b++) {
                const provider = this.a[this.b];
                if (!provider.resolveRenameLocation) {
                    break;
                }
                const res = await provider.resolveRenameLocation(this.c, this.d, token);
                if (!res) {
                    continue;
                }
                if (res.rejectReason) {
                    rejects.push(res.rejectReason);
                    continue;
                }
                return res;
            }
            const word = this.c.getWordAtPosition(this.d);
            if (!word) {
                return {
                    range: range_1.$ks.fromPositions(this.d),
                    text: '',
                    rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
                };
            }
            return {
                range: new range_1.$ks(this.d.lineNumber, word.startColumn, this.d.lineNumber, word.endColumn),
                text: word.word,
                rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
            };
        }
        async provideRenameEdits(newName, token) {
            return this.f(newName, this.b, [], token);
        }
        async f(newName, i, rejects, token) {
            const provider = this.a[i];
            if (!provider) {
                return {
                    edits: [],
                    rejectReason: rejects.join('\n')
                };
            }
            const result = await provider.provideRenameEdits(this.c, this.d, newName, token);
            if (!result) {
                return this.f(newName, i + 1, rejects.concat(nls.localize(0, null)), token);
            }
            else if (result.rejectReason) {
                return this.f(newName, i + 1, rejects.concat(result.rejectReason), token);
            }
            return result;
        }
    }
    async function $r0(registry, model, position, newName) {
        const skeleton = new RenameSkeleton(model, position, registry);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            return { edits: [], rejectReason: loc.rejectReason };
        }
        return skeleton.provideRenameEdits(newName, cancellation_1.CancellationToken.None);
    }
    exports.$r0 = $r0;
    // ---  register actions and commands
    let RenameController = class RenameController {
        static { RenameController_1 = this; }
        static { this.ID = 'editor.contrib.renameController'; }
        static get(editor) {
            return editor.getContribution(RenameController_1.ID);
        }
        constructor(d, f, g, h, j, k, l, m) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.b = new lifecycle_1.$jc();
            this.c = new cancellation_1.$pd();
            this.a = this.b.add(this.f.createInstance(renameInputField_1.$q0, this.d, ['acceptRenameInput', 'acceptRenameInputWithPreview']));
        }
        dispose() {
            this.b.dispose();
            this.c.dispose(true);
        }
        async run() {
            // set up cancellation token to prevent reentrant rename, this
            // is the parent to the resolve- and rename-tokens
            this.c.dispose(true);
            this.c = new cancellation_1.$pd();
            if (!this.d.hasModel()) {
                return undefined;
            }
            const position = this.d.getPosition();
            const skeleton = new RenameSkeleton(this.d.getModel(), position, this.m.renameProvider);
            if (!skeleton.hasProvider()) {
                return undefined;
            }
            // part 1 - resolve rename location
            const cts1 = new editorState_1.$t1(this.d, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, undefined, this.c.token);
            let loc;
            try {
                const resolveLocationOperation = skeleton.resolveRenameLocation(cts1.token);
                this.j.showWhile(resolveLocationOperation, 250);
                loc = await resolveLocationOperation;
            }
            catch (e) {
                messageController_1.$M2.get(this.d)?.showMessage(e || nls.localize(1, null), position);
                return undefined;
            }
            finally {
                cts1.dispose();
            }
            if (!loc) {
                return undefined;
            }
            if (loc.rejectReason) {
                messageController_1.$M2.get(this.d)?.showMessage(loc.rejectReason, position);
                return undefined;
            }
            if (cts1.token.isCancellationRequested) {
                return undefined;
            }
            // part 2 - do rename at location
            const cts2 = new editorState_1.$t1(this.d, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, loc.range, this.c.token);
            const selection = this.d.getSelection();
            let selectionStart = 0;
            let selectionEnd = loc.text.length;
            if (!range_1.$ks.isEmpty(selection) && !range_1.$ks.spansMultipleLines(selection) && range_1.$ks.containsRange(loc.range, selection)) {
                selectionStart = Math.max(0, selection.startColumn - loc.range.startColumn);
                selectionEnd = Math.min(loc.range.endColumn, selection.endColumn) - loc.range.startColumn;
            }
            const supportPreview = this.h.hasPreviewHandler() && this.l.getValue(this.d.getModel().uri, 'editor.rename.enablePreview');
            const inputFieldResult = await this.a.getInput(loc.range, loc.text, selectionStart, selectionEnd, supportPreview, cts2.token);
            // no result, only hint to focus the editor or not
            if (typeof inputFieldResult === 'boolean') {
                if (inputFieldResult) {
                    this.d.focus();
                }
                cts2.dispose();
                return undefined;
            }
            this.d.focus();
            const renameOperation = (0, async_1.$vg)(skeleton.provideRenameEdits(inputFieldResult.newName, cts2.token), cts2.token).then(async (renameResult) => {
                if (!renameResult || !this.d.hasModel()) {
                    return;
                }
                if (renameResult.rejectReason) {
                    this.g.info(renameResult.rejectReason);
                    return;
                }
                // collapse selection to active end
                this.d.setSelection(range_1.$ks.fromPositions(this.d.getSelection().getPosition()));
                this.h.apply(renameResult, {
                    editor: this.d,
                    showPreview: inputFieldResult.wantsPreview,
                    label: nls.localize(2, null, loc?.text, inputFieldResult.newName),
                    code: 'undoredo.rename',
                    quotableLabel: nls.localize(3, null, loc?.text, inputFieldResult.newName),
                    respectAutoSaveConfig: true
                }).then(result => {
                    if (result.ariaSummary) {
                        (0, aria_1.$$P)(nls.localize(4, null, loc.text, inputFieldResult.newName, result.ariaSummary));
                    }
                }).catch(err => {
                    this.g.error(nls.localize(5, null));
                    this.k.error(err);
                });
            }, err => {
                this.g.error(nls.localize(6, null));
                this.k.error(err);
            }).finally(() => {
                cts2.dispose();
            });
            this.j.showWhile(renameOperation, 250);
            return renameOperation;
        }
        acceptRenameInput(wantsPreview) {
            this.a.acceptInput(wantsPreview);
        }
        cancelRenameInput() {
            this.a.cancelInput(true);
        }
    };
    RenameController = RenameController_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, notification_1.$Yu),
        __param(3, bulkEditService_1.$n1),
        __param(4, progress_1.$7u),
        __param(5, log_1.$5i),
        __param(6, textResourceConfiguration_1.$FA),
        __param(7, languageFeatures_1.$hF)
    ], RenameController);
    // ---- action implementation
    class $s0 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.rename',
                label: nls.localize(7, null),
                alias: 'Rename Symbol',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.1
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.$nV);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.$js.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.q(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.$Y);
            }
            return super.runCommand(accessor, args);
        }
        run(accessor, editor) {
            const controller = RenameController.get(editor);
            if (controller) {
                return controller.run();
            }
            return Promise.resolve();
        }
    }
    exports.$s0 = $s0;
    (0, editorExtensions_1.$AV)(RenameController.ID, RenameController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)($s0);
    const RenameCommand = editorExtensions_1.$rV.bindToContribution(RenameController.get);
    (0, editorExtensions_1.$wV)(new RenameCommand({
        id: 'acceptRenameInput',
        precondition: renameInputField_1.$p0,
        handler: x => x.acceptRenameInput(false),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.$Ii.not('isComposing')),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.$wV)(new RenameCommand({
        id: 'acceptRenameInputWithPreview',
        precondition: contextkey_1.$Ii.and(renameInputField_1.$p0, contextkey_1.$Ii.has('config.editor.rename.enablePreview')),
        handler: x => x.acceptRenameInput(true),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.$Ii.not('isComposing')),
            primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.$wV)(new RenameCommand({
        id: 'cancelRenameInput',
        precondition: renameInputField_1.$p0,
        handler: x => x.cancelRenameInput(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    // ---- api bridge command
    (0, editorExtensions_1.$vV)('_executeDocumentRenameProvider', function (accessor, model, position, ...args) {
        const [newName] = args;
        (0, types_1.$tf)(typeof newName === 'string');
        const { renameProvider } = accessor.get(languageFeatures_1.$hF);
        return $r0(renameProvider, model, position, newName);
    });
    (0, editorExtensions_1.$vV)('_executePrepareRename', async function (accessor, model, position) {
        const { renameProvider } = accessor.get(languageFeatures_1.$hF);
        const skeleton = new RenameSkeleton(model, position, renameProvider);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            throw new Error(loc.rejectReason);
        }
        return loc;
    });
    //todo@jrieken use editor options world
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'editor',
        properties: {
            'editor.rename.enablePreview': {
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize(8, null),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=rename.js.map