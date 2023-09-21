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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditor.contribution", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/workbench/browser/codeeditor", "vs/workbench/common/configuration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, observable_1, editorExtensions_1, codeEditorService_1, diffEditor_contribution_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, nls_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, notification_1, platform_1, codeeditor_1, configuration_2, accessibleView_1, accessibleViewActions_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DiffEditorHelperContribution = class DiffEditorHelperContribution extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.diffEditorHelper'; }
        constructor(_diffEditor, _instantiationService, _configurationService, _notificationService) {
            super();
            this._diffEditor = _diffEditor;
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._notificationService = _notificationService;
            this._register(createScreenReaderHelp());
            const isEmbeddedDiffEditor = this._diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget;
            if (!isEmbeddedDiffEditor) {
                const computationResult = (0, observable_1.observableFromEvent)(e => this._diffEditor.onDidUpdateDiff(e), () => this._diffEditor.getDiffComputationResult());
                const onlyWhiteSpaceChange = computationResult.map(r => r && !r.identical && r.changes2.length === 0);
                this._register((0, observable_1.autorunWithStore)((reader, store) => {
                    /** @description update state */
                    if (onlyWhiteSpaceChange.read(reader)) {
                        const helperWidget = store.add(this._instantiationService.createInstance(codeeditor_1.FloatingEditorClickWidget, this._diffEditor.getModifiedEditor(), (0, nls_1.localize)('hintWhitespace', "Show Whitespace Differences"), null));
                        store.add(helperWidget.onClick(() => {
                            this._configurationService.updateValue('diffEditor.ignoreTrimWhitespace', false);
                        }));
                        helperWidget.render();
                    }
                }));
                this._register(this._diffEditor.onDidUpdateDiff(() => {
                    const diffComputationResult = this._diffEditor.getDiffComputationResult();
                    if (diffComputationResult && diffComputationResult.quitEarly) {
                        this._notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('hintTimeout', "The diff algorithm was stopped early (after {0} ms.)", this._diffEditor.maxComputationTime), [{
                                label: (0, nls_1.localize)('removeTimeout', "Remove Limit"),
                                run: () => {
                                    this._configurationService.updateValue('diffEditor.maxComputationTime', 0);
                                }
                            }], {});
                    }
                }));
            }
        }
    };
    DiffEditorHelperContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService)
    ], DiffEditorHelperContribution);
    function createScreenReaderHelp() {
        return accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'diff-editor', async (accessor) => {
            const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const next = keybindingService.lookupKeybinding(diffEditor_contribution_1.AccessibleDiffViewerNext.id)?.getAriaLabel();
            const previous = keybindingService.lookupKeybinding(diffEditor_contribution_1.AccessibleDiffViewerPrev.id)?.getAriaLabel();
            if (!(editorService.activeTextEditorControl instanceof diffEditorWidget_1.DiffEditorWidget)) {
                return;
            }
            const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
            if (!codeEditor) {
                return;
            }
            const keys = ['audioCues.diffLineDeleted', 'audioCues.diffLineInserted', 'audioCues.diffLineModified'];
            accessibleViewService.show({
                verbositySettingKey: "accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */,
                provideContent: () => [
                    (0, nls_1.localize)('msg1', "You are in a diff editor."),
                    (0, nls_1.localize)('msg2', "Press {0} or {1} to view the next or previous diff in the diff review mode that is optimized for screen readers.", next, previous),
                    (0, nls_1.localize)('msg3', "To control which audio cues should be played, the following settings can be configured: {0}.", keys.join(', ')),
                ].join('\n\n'),
                onClose: () => {
                    codeEditor.focus();
                },
                options: { type: "help" /* AccessibleViewType.Help */ }
            });
        }, contextkey_1.ContextKeyEqualsExpr.create('isInDiffEditor', true));
    }
    (0, editorExtensions_1.registerDiffEditorContribution)(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);
    platform_1.Registry.as(configuration_2.Extensions.ConfigurationMigration)
        .registerConfigurationMigrations([{
            key: 'diffEditor.experimental.collapseUnchangedRegions',
            migrateFn: (value, accessor) => {
                return [
                    ['diffEditor.hideUnchangedRegions.enabled', { value }],
                    ['diffEditor.experimental.collapseUnchangedRegions', { value: undefined }]
                ];
            }
        }]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvckhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9kaWZmRWRpdG9ySGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBeUJoRyxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVO2lCQUM3QixPQUFFLEdBQUcsaUNBQWlDLEFBQXBDLENBQXFDO1FBRTlELFlBQ2tCLFdBQXdCLEVBQ0QscUJBQTRDLEVBQzVDLHFCQUE0QyxFQUM3QyxvQkFBMEM7WUFFakYsS0FBSyxFQUFFLENBQUM7WUFMUyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM3Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBSWpGLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFdBQVcsWUFBWSxtREFBd0IsQ0FBQztZQUVsRixJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzFCLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO2dCQUMzSSxNQUFNLG9CQUFvQixHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFFB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