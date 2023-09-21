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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/nls!vs/workbench/contrib/languageDetection/browser/languageDetection.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/async", "vs/editor/common/languages/language", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/editor/common/editorContextKeys", "vs/base/common/network", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, editorBrowser_1, nls_1, platform_1, contributions_1, editorService_1, statusbar_1, languageDetectionWorkerService_1, async_1, language_1, keybinding_1, actions_1, notification_1, contextkey_1, notebookContextKeys_1, editorContextKeys_1, network_1, configuration_1) {
    "use strict";
    var LanguageDetectionStatusContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const detectLanguageCommandId = 'editor.detectLanguage';
    let LanguageDetectionStatusContribution = class LanguageDetectionStatusContribution {
        static { LanguageDetectionStatusContribution_1 = this; }
        static { this.a = 'status.languageDetectionStatus'; }
        constructor(f, g, h, i, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.b = new lifecycle_1.$jc();
            this.d = new async_1.$Eg(1000);
            this.e = new lifecycle_1.$jc();
            i.onDidActiveEditorChange(() => this.l(true), this, this.b);
            this.l(false);
        }
        dispose() {
            this.b.dispose();
            this.d.dispose();
            this.c?.dispose();
            this.e.dispose();
        }
        l(clear) {
            if (clear) {
                this.c?.dispose();
                this.c = undefined;
            }
            this.d.trigger(() => this.m());
        }
        async m() {
            const editor = (0, editorBrowser_1.$lV)(this.i.activeTextEditorControl);
            this.e.clear();
            // update when editor language changes
            editor?.onDidChangeModelLanguage(() => this.l(true), this, this.e);
            editor?.onDidChangeModelContent(() => this.l(false), this, this.e);
            const editorModel = editor?.getModel();
            const editorUri = editorModel?.uri;
            const existingId = editorModel?.getLanguageId();
            const enablementConfig = this.h.getValue('workbench.editor.languageDetectionHints');
            const enabled = typeof enablementConfig === 'object' && enablementConfig?.untitledEditors;
            const disableLightbulb = !enabled || editorUri?.scheme !== network_1.Schemas.untitled || !existingId;
            if (disableLightbulb || !editorUri) {
                this.c?.dispose();
                this.c = undefined;
            }
            else {
                const lang = await this.f.detectLanguage(editorUri);
                const skip = { 'jsonc': 'json' };
                const existing = editorModel.getLanguageId();
                if (lang && lang !== existing && skip[existing] !== lang) {
                    const detectedName = this.j.getLanguageName(lang) || lang;
                    let tooltip = (0, nls_1.localize)(0, null, detectedName);
                    const keybinding = this.k.lookupKeybinding(detectLanguageCommandId);
                    const label = keybinding?.getLabel();
                    if (label) {
                        tooltip += ` (${label})`;
                    }
                    const props = {
                        name: (0, nls_1.localize)(1, null),
                        ariaLabel: (0, nls_1.localize)(2, null, lang),
                        tooltip,
                        command: detectLanguageCommandId,
                        text: '$(lightbulb-autofix)',
                    };
                    if (!this.c) {
                        this.c = this.g.addEntry(props, LanguageDetectionStatusContribution_1.a, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 1 /* StatusbarAlignment.RIGHT */, compact: true });
                    }
                    else {
                        this.c.update(props);
                    }
                }
                else {
                    this.c?.dispose();
                    this.c = undefined;
                }
            }
        }
    };
    LanguageDetectionStatusContribution = LanguageDetectionStatusContribution_1 = __decorate([
        __param(0, languageDetectionWorkerService_1.$zA),
        __param(1, statusbar_1.$6$),
        __param(2, configuration_1.$8h),
        __param(3, editorService_1.$9C),
        __param(4, language_1.$ct),
        __param(5, keybinding_1.$2D)
    ], LanguageDetectionStatusContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LanguageDetectionStatusContribution, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: detectLanguageCommandId,
                title: { value: (0, nls_1.localize)(3, null), original: 'Detect Language from Content' },
                f1: true,
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.toNegated(), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.$zA);
            const editor = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
            const notificationService = accessor.get(notification_1.$Yu);
            const editorUri = editor?.getModel()?.uri;
            if (editorUri) {
                const lang = await languageDetectionService.detectLanguage(editorUri);
                if (lang) {
                    editor.getModel()?.setLanguage(lang, languageDetectionWorkerService_1.$AA);
                }
                else {
                    notificationService.warn((0, nls_1.localize)(4, null));
                }
            }
        }
    });
});
//# sourceMappingURL=languageDetection.contribution.js.map