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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService"], function (require, exports, lifecycle_1, map_1, language_1, nls_1, configuration_1, instantiation_1, keybinding_1, platform_1, contributions_1, notebookBrowser_1, notebookCellStatusBarService_1, notebookCommon_1, notebookKernelService_1, notebookService_1, languageDetectionWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let CellStatusBarLanguagePickerProvider = class CellStatusBarLanguagePickerProvider {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.viewType = '*';
        }
        async provideCellStatusBarItems(uri, index, _token) {
            const doc = this.a.getNotebookTextModel(uri);
            const cell = doc?.cells[index];
            if (!cell) {
                return;
            }
            const statusBarItems = [];
            let displayLanguage = cell.language;
            if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                displayLanguage = 'markdown';
            }
            else {
                const registeredId = this.b.getLanguageIdByLanguageName(cell.language);
                if (registeredId) {
                    displayLanguage = this.b.getLanguageName(displayLanguage) ?? displayLanguage;
                }
                else {
                    // add unregistered lanugage warning item
                    const searchTooltip = (0, nls_1.localize)(0, null, cell.language);
                    statusBarItems.push({
                        text: `$(dialog-warning)`,
                        command: { id: 'workbench.extensions.search', arguments: [`@tag:${cell.language}`], title: 'Search Extensions' },
                        tooltip: searchTooltip,
                        alignment: 2 /* CellStatusbarAlignment.Right */,
                        priority: -Number.MAX_SAFE_INTEGER + 1
                    });
                }
            }
            statusBarItems.push({
                text: displayLanguage,
                command: notebookBrowser_1.$Sbb,
                tooltip: (0, nls_1.localize)(1, null),
                alignment: 2 /* CellStatusbarAlignment.Right */,
                priority: -Number.MAX_SAFE_INTEGER
            });
            return {
                items: statusBarItems
            };
        }
    };
    CellStatusBarLanguagePickerProvider = __decorate([
        __param(0, notebookService_1.$ubb),
        __param(1, language_1.$ct)
    ], CellStatusBarLanguagePickerProvider);
    let CellStatusBarLanguageDetectionProvider = class CellStatusBarLanguageDetectionProvider {
        constructor(b, c, d, e, f, g) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.viewType = '*';
            this.a = new map_1.$zi();
        }
        async provideCellStatusBarItems(uri, index, token) {
            const doc = this.b.getNotebookTextModel(uri);
            const cell = doc?.cells[index];
            if (!cell) {
                return;
            }
            const enablementConfig = this.e.getValue('workbench.editor.languageDetectionHints');
            const enabled = typeof enablementConfig === 'object' && enablementConfig?.notebookEditors;
            if (!enabled) {
                return;
            }
            const cellUri = cell.uri;
            const contentVersion = cell.textModel?.getVersionId();
            if (!contentVersion) {
                return;
            }
            const currentLanguageId = cell.cellKind === notebookCommon_1.CellKind.Markup ?
                'markdown' :
                (this.d.getLanguageIdByLanguageName(cell.language) || cell.language);
            if (!this.a.has(cellUri)) {
                this.a.set(cellUri, {
                    cellLanguage: currentLanguageId,
                    updateTimestamp: 0,
                    contentVersion: 1, // dont run for the initial contents, only on update
                });
            }
            const cached = this.a.get(cellUri);
            if (cached.cellLanguage !== currentLanguageId || (cached.updateTimestamp < Date.now() - 1000 && cached.contentVersion !== contentVersion)) {
                cached.updateTimestamp = Date.now();
                cached.cellLanguage = currentLanguageId;
                cached.contentVersion = contentVersion;
                const kernel = this.c.getSelectedOrSuggestedKernel(doc);
                if (kernel) {
                    const supportedLangs = [...kernel.supportedLanguages, 'markdown'];
                    cached.guess = await this.f.detectLanguage(cell.uri, supportedLangs);
                }
            }
            const items = [];
            if (cached.guess && currentLanguageId !== cached.guess) {
                const detectedName = this.d.getLanguageName(cached.guess) || cached.guess;
                let tooltip = (0, nls_1.localize)(2, null, detectedName);
                const keybinding = this.g.lookupKeybinding(notebookBrowser_1.$Rbb);
                const label = keybinding?.getLabel();
                if (label) {
                    tooltip += ` (${label})`;
                }
                items.push({
                    text: '$(lightbulb-autofix)',
                    command: notebookBrowser_1.$Rbb,
                    tooltip,
                    alignment: 2 /* CellStatusbarAlignment.Right */,
                    priority: -Number.MAX_SAFE_INTEGER + 1
                });
            }
            return { items };
        }
    };
    CellStatusBarLanguageDetectionProvider = __decorate([
        __param(0, notebookService_1.$ubb),
        __param(1, notebookKernelService_1.$Bbb),
        __param(2, language_1.$ct),
        __param(3, configuration_1.$8h),
        __param(4, languageDetectionWorkerService_1.$zA),
        __param(5, keybinding_1.$2D)
    ], CellStatusBarLanguageDetectionProvider);
    let BuiltinCellStatusBarProviders = class BuiltinCellStatusBarProviders extends lifecycle_1.$kc {
        constructor(instantiationService, notebookCellStatusBarService) {
            super();
            const builtinProviders = [
                CellStatusBarLanguagePickerProvider,
                CellStatusBarLanguageDetectionProvider,
            ];
            builtinProviders.forEach(p => {
                this.B(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
            });
        }
    };
    BuiltinCellStatusBarProviders = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notebookCellStatusBarService_1.$Qmb)
    ], BuiltinCellStatusBarProviders);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=statusBarProviders.js.map