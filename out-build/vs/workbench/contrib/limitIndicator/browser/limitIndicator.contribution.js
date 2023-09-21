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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/editor/browser/editorBrowser", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/nls!vs/workbench/contrib/limitIndicator/browser/limitIndicator.contribution", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/colorPicker/browser/colorDetector"], function (require, exports, lifecycle_1, severity_1, editorBrowser_1, editorService_1, languageStatusService_1, platform_1, contributions_1, nls, folding_1, colorDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oYb = void 0;
    const openSettingsCommand = 'workbench.action.openSettings';
    const configureSettingsLabel = nls.localize(0, null);
    /**
     * Uses that language status indicator to show information which language features have been limited for performance reasons.
     * Currently this is used for folding ranges and for color decorators.
     */
    let $oYb = class $oYb extends lifecycle_1.$kc {
        constructor(editorService, languageStatusService) {
            super();
            const accessors = [new ColorDecorationAccessor(), new FoldingRangeAccessor()];
            const statusEntries = accessors.map(indicator => new LanguageStatusEntry(languageStatusService, indicator));
            statusEntries.forEach(entry => this.B(entry));
            let control;
            const onActiveEditorChanged = () => {
                const activeControl = editorService.activeTextEditorControl;
                if (activeControl === control) {
                    return;
                }
                control = activeControl;
                const editor = (0, editorBrowser_1.$lV)(activeControl);
                statusEntries.forEach(statusEntry => statusEntry.onActiveEditorChanged(editor));
            };
            this.B(editorService.onDidActiveEditorChange(onActiveEditorChanged));
            onActiveEditorChanged();
        }
    };
    exports.$oYb = $oYb;
    exports.$oYb = $oYb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, languageStatusService_1.$6I)
    ], $oYb);
    class ColorDecorationAccessor {
        constructor() {
            this.id = 'decoratorsLimitInfo';
            this.name = nls.localize(1, null);
            this.label = nls.localize(2, null);
            this.source = nls.localize(3, null);
            this.settingsId = 'editor.colorDecoratorsLimit';
        }
        getLimitReporter(editor) {
            return colorDetector_1.$e3.get(editor)?.limitReporter;
        }
    }
    class FoldingRangeAccessor {
        constructor() {
            this.id = 'foldingLimitInfo';
            this.name = nls.localize(4, null);
            this.label = nls.localize(5, null);
            this.source = nls.localize(6, null);
            this.settingsId = 'editor.foldingMaximumRegions';
        }
        getLimitReporter(editor) {
            return folding_1.$z8.get(editor)?.limitReporter;
        }
    }
    class LanguageStatusEntry {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        onActiveEditorChanged(editor) {
            if (this.b) {
                this.b.dispose();
                this.b = undefined;
            }
            let info;
            if (editor) {
                info = this.d.getLimitReporter(editor);
            }
            this.e(info);
            if (info) {
                this.b = info.onDidChange(_ => {
                    this.e(info);
                });
                return true;
            }
            return false;
        }
        e(info) {
            if (this.a) {
                this.a.dispose();
                this.a = undefined;
            }
            if (info && info.limited !== false) {
                const status = {
                    id: this.d.id,
                    selector: '*',
                    name: this.d.name,
                    severity: severity_1.default.Warning,
                    label: this.d.label,
                    detail: nls.localize(7, null, info.limited),
                    command: { id: openSettingsCommand, arguments: [this.d.settingsId], title: configureSettingsLabel },
                    accessibilityInfo: undefined,
                    source: this.d.source,
                    busy: false
                };
                this.a = this.c.addStatus(status);
            }
        }
        dispose() {
            this.a?.dispose;
            this.a = undefined;
            this.b?.dispose;
            this.b = undefined;
        }
    }
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($oYb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=limitIndicator.contribution.js.map