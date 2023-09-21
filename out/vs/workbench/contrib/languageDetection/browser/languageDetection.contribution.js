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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/async", "vs/editor/common/languages/language", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/editor/common/editorContextKeys", "vs/base/common/network", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, editorBrowser_1, nls_1, platform_1, contributions_1, editorService_1, statusbar_1, languageDetectionWorkerService_1, async_1, language_1, keybinding_1, actions_1, notification_1, contextkey_1, notebookContextKeys_1, editorContextKeys_1, network_1, configuration_1) {
    "use strict";
    var LanguageDetectionStatusContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const detectLanguageCommandId = 'editor.detectLanguage';
    let LanguageDetectionStatusContribution = class LanguageDetectionStatusContribution {
        static { LanguageDetectionStatusContribution_1 = this; }
        static { this._id = 'status.languageDetectionStatus'; }
        constructor(_languageDetectionService, _statusBarService, _configurationService, _editorService, _languageService, _keybindingService) {
            this._languageDetectionService = _languageDetectionService;
            this._statusBarService = _statusBarService;
            this._configurationService = _configurationService;
            this._editorService = _editorService;
            this._languageService = _languageService;
            this._keybindingService = _keybindingService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._delayer = new async_1.ThrottledDelayer(1000);
            this._renderDisposables = new lifecycle_1.DisposableStore();
            _editorService.onDidActiveEditorChange(() => this._update(true), this, this._disposables);
            this._update(false);
        }
        dispose() {
            this._disposables.dispose();
            this._delayer.dispose();
            this._combinedEntry?.dispose();
            this._renderDisposables.dispose();
        }
        _update(clear) {
            if (clear) {
                this._combinedEntry?.dispose();
                this._combinedEntry = undefined;
            }
            this._delayer.trigger(() => this._doUpdate());
        }
        async _doUpdate() {
            const editor = (0, editorBrowser_1.getCodeEditor)(this._editorService.activeTextEditorControl);
            this._renderDisposables.clear();
            // update when editor language changes
            editor?.onDidChangeModelLanguage(() => this._update(true), this, this._renderDisposables);
            editor?.onDidChangeModelContent(() => this._update(false), this, this._renderDisposables);
            const editorModel = editor?.getModel();
            const editorUri = editorModel?.uri;
            const existingId = editorModel?.getLanguageId();
            const enablementConfig = this._configurationService.getValue('workbench.editor.languageDetectionHints');
            const enabled = typeof enablementConfig === 'object' && enablementConfig?.untitledEditors;
            const disableLightbulb = !enabled || editorUri?.scheme !== network_1.Schemas.untitled || !existingId;
            if (disableLightbulb || !editorUri) {
                this._combinedEntry?.dispose();
                this._combinedEntry = undefined;
            }
            else {
                const lang = await this._languageDetectionService.detectLanguage(editorUri);
                const skip = { 'jsonc': 'json' };
                const existing = editorModel.getLanguageId();
                if (lang && lang !== existing && skip[existing] !== lang) {
                    const detectedName = this._languageService.getLanguageName(lang) || lang;
                    let tooltip = (0, nls_1.localize)('status.autoDetectLanguage', "Accept Detected Language: {0}", detectedName);
                    const keybinding = this._keybindingService.lookupKeybinding(detectLanguageCommandId);
                    const label = keybinding?.getLabel();
                    if (label) {
                        tooltip += ` (${label})`;
                    }
                    const props = {
                        name: (0, nls_1.localize)('langDetection.name', "Language Detection"),
                        ariaLabel: (0, nls_1.localize)('langDetection.aria', "Change to Detected Language: {0}", lang),
                        tooltip,
                        command: detectLanguageCommandId,
                        text: '$(lightbulb-autofix)',
                    };
                    if (!this._combinedEntry) {
                        this._combinedEntry = this._statusBarService.addEntry(props, LanguageDetectionStatusContribution_1._id, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 1 /* StatusbarAlignment.RIGHT */, compact: true });
                    }
                    else {
                        this._combinedEntry.update(props);
                    }
                }
                else {
                    this._combinedEntry?.dispose();
                    this._combinedEntry = undefined;
                }
            }
        }
    };
    LanguageDetectionStatusContribution = LanguageDetectionStatusContribution_1 = __decorate([
        __param(0, languageDetectionWorkerService_1.ILanguageDetectionService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, editorService_1.IEditorService),
        __param(4, language_1.ILanguageService),
        __param(5, keybinding_1.IKeybindingService)
    ], LanguageDetectionStatusContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LanguageDetectionStatusContribution, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: detectLanguageCommandId,
                title: { value: (0, nls_1.localize)('detectlang', 'Detect Language from Content'), original: 'Detect Language from Content' },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.toNegated(), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.ILanguageDetectionService);
            const editor = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
            const notificationService = accessor.get(notification_1.INotificationService);
            const editorUri = editor?.getModel()?.uri;
            if (editorUri) {
                const lang = await languageDetectionService.detectLanguage(editorUri);
                if (lang) {
                    editor.getModel()?.setLanguage(lang, languageDetectionWorkerService_1.LanguageDetectionLanguageEventSource);
                }
                else {
                    notificationService.warn((0, nls_1.localize)('noDetection', "Unable to detect editor language"));
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VEZXRlY3Rpb24uY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbGFuZ3VhZ2VEZXRlY3Rpb24vYnJvd3Nlci9sYW5ndWFnZURldGVjdGlvbi5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBRXhELElBQU0sbUNBQW1DLEdBQXpDLE1BQU0sbUNBQW1DOztpQkFFaEIsUUFBRyxHQUFHLGdDQUFnQyxBQUFuQyxDQUFvQztRQU8vRCxZQUM0Qix5QkFBcUUsRUFDN0UsaUJBQXFELEVBQ2pELHFCQUE2RCxFQUNwRSxjQUErQyxFQUM3QyxnQkFBbUQsRUFDakQsa0JBQXVEO1lBTC9CLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7WUFDNUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ25ELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFYM0QsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUU5QyxhQUFRLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3Qix1QkFBa0IsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVUzRCxjQUFjLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVPLE9BQU8sQ0FBQyxLQUFjO1lBQzdCLElBQUksS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO2FBQ2hDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVPLEtBQUssQ0FBQyxTQUFTO1lBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUEsNkJBQWEsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFFMUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWhDLHNDQUFzQztZQUN0QyxNQUFNLEVBQUUsd0JBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDMUYsTUFBTSxFQUFFLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUN2QyxNQUFNLFNBQVMsR0FBRyxXQUFXLEVBQUUsR0FBRyxDQUFDO1lBQ25DLE1BQU0sVUFBVSxHQUFHLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQztZQUNoRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQThCLHlDQUF5QyxDQUFDLENBQUM7WUFDckksTUFBTSxPQUFPLEdBQUcsT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLElBQUksZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO1lBQzFGLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFFLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUzRixJQUFJLGdCQUFnQixJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQzthQUNoQztpQkFBTTtnQkFDTixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sSUFBSSxHQUF1QyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztnQkFDckUsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUM3QyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ3pELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO29CQUN6RSxJQUFJLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSwrQkFBK0IsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDbkcsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBQ3JGLE1BQU0sS0FBSyxHQUFHLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxLQUFLLEVBQUU7d0JBQ1YsT0FBTyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUM7cUJBQ3pCO29CQUVELE1BQU0sS0FBSyxHQUFvQjt3QkFDOUIsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDO3dCQUMxRCxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDO3dCQUNuRixPQUFPO3dCQUNQLE9BQU8sRUFBRSx1QkFBdUI7d0JBQ2hDLElBQUksRUFBRSxzQkFBc0I7cUJBQzVCLENBQUM7b0JBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUscUNBQW1DLENBQUMsR0FBRyxvQ0FBNEIsRUFBRSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxrQ0FBMEIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDbE47eUJBQU07d0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2xDO2lCQUNEO3FCQUFNO29CQUNOLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO2lCQUNoQzthQUNEO1FBQ0YsQ0FBQzs7SUFwRkksbUNBQW1DO1FBVXRDLFdBQUEsMERBQXlCLENBQUE7UUFDekIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSwrQkFBa0IsQ0FBQTtPQWZmLG1DQUFtQyxDQXFGeEM7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsbUNBQW1DLGtDQUEwQixDQUFDO0lBR3hLLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFFcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHVCQUF1QjtnQkFDM0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSw4QkFBOEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw4QkFBOEIsRUFBRTtnQkFDbEgsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDhDQUF3QixDQUFDLFNBQVMsRUFBRSxFQUFFLHFDQUFpQixDQUFDLGVBQWUsQ0FBQztnQkFDekcsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLDRDQUF5QiwwQkFBZSxFQUFFLE1BQU0sNkNBQW1DLEVBQUU7YUFDNUcsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSx3QkFBd0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBEQUF5QixDQUFDLENBQUM7WUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBQSw2QkFBYSxFQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUM7WUFDMUMsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEdBQUcsTUFBTSx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksSUFBSSxFQUFFO29CQUNULE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLHFFQUFvQyxDQUFDLENBQUM7aUJBQzNFO3FCQUFNO29CQUNOLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO2lCQUN0RjthQUNEO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQyJ9