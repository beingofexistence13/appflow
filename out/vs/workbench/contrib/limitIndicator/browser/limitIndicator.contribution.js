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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/editor/browser/editorBrowser", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/nls", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/colorPicker/browser/colorDetector"], function (require, exports, lifecycle_1, severity_1, editorBrowser_1, editorService_1, languageStatusService_1, platform_1, contributions_1, nls, folding_1, colorDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LimitIndicatorContribution = void 0;
    const openSettingsCommand = 'workbench.action.openSettings';
    const configureSettingsLabel = nls.localize('status.button.configure', "Configure");
    /**
     * Uses that language status indicator to show information which language features have been limited for performance reasons.
     * Currently this is used for folding ranges and for color decorators.
     */
    let LimitIndicatorContribution = class LimitIndicatorContribution extends lifecycle_1.Disposable {
        constructor(editorService, languageStatusService) {
            super();
            const accessors = [new ColorDecorationAccessor(), new FoldingRangeAccessor()];
            const statusEntries = accessors.map(indicator => new LanguageStatusEntry(languageStatusService, indicator));
            statusEntries.forEach(entry => this._register(entry));
            let control;
            const onActiveEditorChanged = () => {
                const activeControl = editorService.activeTextEditorControl;
                if (activeControl === control) {
                    return;
                }
                control = activeControl;
                const editor = (0, editorBrowser_1.getCodeEditor)(activeControl);
                statusEntries.forEach(statusEntry => statusEntry.onActiveEditorChanged(editor));
            };
            this._register(editorService.onDidActiveEditorChange(onActiveEditorChanged));
            onActiveEditorChanged();
        }
    };
    exports.LimitIndicatorContribution = LimitIndicatorContribution;
    exports.LimitIndicatorContribution = LimitIndicatorContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, languageStatusService_1.ILanguageStatusService)
    ], LimitIndicatorContribution);
    class ColorDecorationAccessor {
        constructor() {
            this.id = 'decoratorsLimitInfo';
            this.name = nls.localize('colorDecoratorsStatusItem.name', 'Color Decorator Status');
            this.label = nls.localize('status.limitedColorDecorators.short', 'Color Decorators');
            this.source = nls.localize('colorDecoratorsStatusItem.source', 'Color Decorators');
            this.settingsId = 'editor.colorDecoratorsLimit';
        }
        getLimitReporter(editor) {
            return colorDetector_1.ColorDetector.get(editor)?.limitReporter;
        }
    }
    class FoldingRangeAccessor {
        constructor() {
            this.id = 'foldingLimitInfo';
            this.name = nls.localize('foldingRangesStatusItem.name', 'Folding Status');
            this.label = nls.localize('status.limitedFoldingRanges.short', 'Folding Ranges');
            this.source = nls.localize('foldingRangesStatusItem.source', 'Folding');
            this.settingsId = 'editor.foldingMaximumRegions';
        }
        getLimitReporter(editor) {
            return folding_1.FoldingController.get(editor)?.limitReporter;
        }
    }
    class LanguageStatusEntry {
        constructor(languageStatusService, accessor) {
            this.languageStatusService = languageStatusService;
            this.accessor = accessor;
        }
        onActiveEditorChanged(editor) {
            if (this._indicatorChangeListener) {
                this._indicatorChangeListener.dispose();
                this._indicatorChangeListener = undefined;
            }
            let info;
            if (editor) {
                info = this.accessor.getLimitReporter(editor);
            }
            this.updateStatusItem(info);
            if (info) {
                this._indicatorChangeListener = info.onDidChange(_ => {
                    this.updateStatusItem(info);
                });
                return true;
            }
            return false;
        }
        updateStatusItem(info) {
            if (this._limitStatusItem) {
                this._limitStatusItem.dispose();
                this._limitStatusItem = undefined;
            }
            if (info && info.limited !== false) {
                const status = {
                    id: this.accessor.id,
                    selector: '*',
                    name: this.accessor.name,
                    severity: severity_1.default.Warning,
                    label: this.accessor.label,
                    detail: nls.localize('status.limited.details', 'only {0} shown for performance reasons', info.limited),
                    command: { id: openSettingsCommand, arguments: [this.accessor.settingsId], title: configureSettingsLabel },
                    accessibilityInfo: undefined,
                    source: this.accessor.source,
                    busy: false
                };
                this._limitStatusItem = this.languageStatusService.addStatus(status);
            }
        }
        dispose() {
            this._limitStatusItem?.dispose;
            this._limitStatusItem = undefined;
            this._indicatorChangeListener?.dispose;
            this._indicatorChangeListener = undefined;
        }
    }
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LimitIndicatorContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRJbmRpY2F0b3IuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbGltaXRJbmRpY2F0b3IvYnJvd3Nlci9saW1pdEluZGljYXRvci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRyxNQUFNLG1CQUFtQixHQUFHLCtCQUErQixDQUFDO0lBQzVELE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUVwRjs7O09BR0c7SUFDSSxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO1FBRXpELFlBQ2lCLGFBQTZCLEVBQ3JCLHFCQUE2QztZQUVyRSxLQUFLLEVBQUUsQ0FBQztZQUVSLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSx1QkFBdUIsRUFBRSxFQUFFLElBQUksb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDNUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUV0RCxJQUFJLE9BQVksQ0FBQztZQUVqQixNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRTtnQkFDbEMsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLHVCQUF1QixDQUFDO2dCQUM1RCxJQUFJLGFBQWEsS0FBSyxPQUFPLEVBQUU7b0JBQzlCLE9BQU87aUJBQ1A7Z0JBQ0QsT0FBTyxHQUFHLGFBQWEsQ0FBQztn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