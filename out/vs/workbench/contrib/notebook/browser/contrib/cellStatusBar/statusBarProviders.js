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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/editor/common/languages/language", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService"], function (require, exports, lifecycle_1, map_1, language_1, nls_1, configuration_1, instantiation_1, keybinding_1, platform_1, contributions_1, notebookBrowser_1, notebookCellStatusBarService_1, notebookCommon_1, notebookKernelService_1, notebookService_1, languageDetectionWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let CellStatusBarLanguagePickerProvider = class CellStatusBarLanguagePickerProvider {
        constructor(_notebookService, _languageService) {
            this._notebookService = _notebookService;
            this._languageService = _languageService;
            this.viewType = '*';
        }
        async provideCellStatusBarItems(uri, index, _token) {
            const doc = this._notebookService.getNotebookTextModel(uri);
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
                const registeredId = this._languageService.getLanguageIdByLanguageName(cell.language);
                if (registeredId) {
                    displayLanguage = this._languageService.getLanguageName(displayLanguage) ?? displayLanguage;
                }
                else {
                    // add unregistered lanugage warning item
                    const searchTooltip = (0, nls_1.localize)('notebook.cell.status.searchLanguageExtensions', "Unknown cell language. Click to search for '{0}' extensions", cell.language);
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
                command: notebookBrowser_1.CHANGE_CELL_LANGUAGE,
                tooltip: (0, nls_1.localize)('notebook.cell.status.language', "Select Cell Language Mode"),
                alignment: 2 /* CellStatusbarAlignment.Right */,
                priority: -Number.MAX_SAFE_INTEGER
            });
            return {
                items: statusBarItems
            };
        }
    };
    CellStatusBarLanguagePickerProvider = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, language_1.ILanguageService)
    ], CellStatusBarLanguagePickerProvider);
    let CellStatusBarLanguageDetectionProvider = class CellStatusBarLanguageDetectionProvider {
        constructor(_notebookService, _notebookKernelService, _languageService, _configurationService, _languageDetectionService, _keybindingService) {
            this._notebookService = _notebookService;
            this._notebookKernelService = _notebookKernelService;
            this._languageService = _languageService;
            this._configurationService = _configurationService;
            this._languageDetectionService = _languageDetectionService;
            this._keybindingService = _keybindingService;
            this.viewType = '*';
            this.cache = new map_1.ResourceMap();
        }
        async provideCellStatusBarItems(uri, index, token) {
            const doc = this._notebookService.getNotebookTextModel(uri);
            const cell = doc?.cells[index];
            if (!cell) {
                return;
            }
            const enablementConfig = this._configurationService.getValue('workbench.editor.languageDetectionHints');
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
                (this._languageService.getLanguageIdByLanguageName(cell.language) || cell.language);
            if (!this.cache.has(cellUri)) {
                this.cache.set(cellUri, {
                    cellLanguage: currentLanguageId,
                    updateTimestamp: 0,
                    contentVersion: 1, // dont run for the initial contents, only on update
                });
            }
            const cached = this.cache.get(cellUri);
            if (cached.cellLanguage !== currentLanguageId || (cached.updateTimestamp < Date.now() - 1000 && cached.contentVersion !== contentVersion)) {
                cached.updateTimestamp = Date.now();
                cached.cellLanguage = currentLanguageId;
                cached.contentVersion = contentVersion;
                const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(doc);
                if (kernel) {
                    const supportedLangs = [...kernel.supportedLanguages, 'markdown'];
                    cached.guess = await this._languageDetectionService.detectLanguage(cell.uri, supportedLangs);
                }
            }
            const items = [];
            if (cached.guess && currentLanguageId !== cached.guess) {
                const detectedName = this._languageService.getLanguageName(cached.guess) || cached.guess;
                let tooltip = (0, nls_1.localize)('notebook.cell.status.autoDetectLanguage', "Accept Detected Language: {0}", detectedName);
                const keybinding = this._keybindingService.lookupKeybinding(notebookBrowser_1.DETECT_CELL_LANGUAGE);
                const label = keybinding?.getLabel();
                if (label) {
                    tooltip += ` (${label})`;
                }
                items.push({
                    text: '$(lightbulb-autofix)',
                    command: notebookBrowser_1.DETECT_CELL_LANGUAGE,
                    tooltip,
                    alignment: 2 /* CellStatusbarAlignment.Right */,
                    priority: -Number.MAX_SAFE_INTEGER + 1
                });
            }
            return { items };
        }
    };
    CellStatusBarLanguageDetectionProvider = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, language_1.ILanguageService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, languageDetectionWorkerService_1.ILanguageDetectionService),
        __param(5, keybinding_1.IKeybindingService)
    ], CellStatusBarLanguageDetectionProvider);
    let BuiltinCellStatusBarProviders = class BuiltinCellStatusBarProviders extends lifecycle_1.Disposable {
        constructor(instantiationService, notebookCellStatusBarService) {
            super();
            const builtinProviders = [
                CellStatusBarLanguagePickerProvider,
                CellStatusBarLanguageDetectionProvider,
            ];
            builtinProviders.forEach(p => {
                this._register(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
            });
        }
    };
    BuiltinCellStatusBarProviders = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookCellStatusBarService_1.INotebookCellStatusBarService)
    ], BuiltinCellStatusBarProviders);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyUHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2NlbGxTdGF0dXNCYXIvc3RhdHVzQmFyUHJvdmlkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBcUJoRyxJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFtQztRQUl4QyxZQUNtQixnQkFBbUQsRUFDbkQsZ0JBQW1EO1lBRGxDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUo3RCxhQUFRLEdBQUcsR0FBRyxDQUFDO1FBS3BCLENBQUM7UUFFTCxLQUFLLENBQUMseUJBQXlCLENBQUMsR0FBUSxFQUFFLEtBQWEsRUFBRSxNQUF5QjtZQUNqRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU87YUFDUDtZQUVELE1BQU0sY0FBYyxHQUFpQyxFQUFFLENBQUM7WUFDeEQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUsseUJBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RDLGVBQWUsR0FBRyxVQUFVLENBQUM7YUFDN0I7aUJBQU07Z0JBQ04sTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEYsSUFBSSxZQUFZLEVBQUU7b0JBQ2pCLGVB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