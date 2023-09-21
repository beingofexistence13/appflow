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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditor.contribution", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/nls!vs/workbench/contrib/codeEditor/browser/diffEditorHelper", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/workbench/browser/codeeditor", "vs/workbench/common/configuration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, observable_1, editorExtensions_1, codeEditorService_1, diffEditor_contribution_1, diffEditorWidget_1, embeddedCodeEditorWidget_1, nls_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, notification_1, platform_1, codeeditor_1, configuration_2, accessibleView_1, accessibleViewActions_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DiffEditorHelperContribution = class DiffEditorHelperContribution extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.diffEditorHelper'; }
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.B(createScreenReaderHelp());
            const isEmbeddedDiffEditor = this.a instanceof embeddedCodeEditorWidget_1.$x3;
            if (!isEmbeddedDiffEditor) {
                const computationResult = (0, observable_1.observableFromEvent)(e => this.a.onDidUpdateDiff(e), () => this.a.getDiffComputationResult());
                const onlyWhiteSpaceChange = computationResult.map(r => r && !r.identical && r.changes2.length === 0);
                this.B((0, observable_1.autorunWithStore)((reader, store) => {
                    /** @description update state */
                    if (onlyWhiteSpaceChange.read(reader)) {
                        const helperWidget = store.add(this.b.createInstance(codeeditor_1.$rrb, this.a.getModifiedEditor(), (0, nls_1.localize)(0, null), null));
                        store.add(helperWidget.onClick(() => {
                            this.c.updateValue('diffEditor.ignoreTrimWhitespace', false);
                        }));
                        helperWidget.render();
                    }
                }));
                this.B(this.a.onDidUpdateDiff(() => {
                    const diffComputationResult = this.a.getDiffComputationResult();
                    if (diffComputationResult && diffComputationResult.quitEarly) {
                        this.f.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(1, null, this.a.maxComputationTime), [{
                                label: (0, nls_1.localize)(2, null),
                                run: () => {
                                    this.c.updateValue('diffEditor.maxComputationTime', 0);
                                }
                            }], {});
                    }
                }));
            }
        }
    };
    DiffEditorHelperContribution = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, notification_1.$Yu)
    ], DiffEditorHelperContribution);
    function createScreenReaderHelp() {
        return accessibleViewActions_1.$tGb.addImplementation(105, 'diff-editor', async (accessor) => {
            const accessibleViewService = accessor.get(accessibleView_1.$wqb);
            const editorService = accessor.get(editorService_1.$9C);
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const keybindingService = accessor.get(keybinding_1.$2D);
            const next = keybindingService.lookupKeybinding(diffEditor_contribution_1.$b1.id)?.getAriaLabel();
            const previous = keybindingService.lookupKeybinding(diffEditor_contribution_1.$c1.id)?.getAriaLabel();
            if (!(editorService.activeTextEditorControl instanceof diffEditorWidget_1.$6Z)) {
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
                    (0, nls_1.localize)(3, null),
                    (0, nls_1.localize)(4, null, next, previous),
                    (0, nls_1.localize)(5, null, keys.join(', ')),
                ].join('\n\n'),
                onClose: () => {
                    codeEditor.focus();
                },
                options: { type: "help" /* AccessibleViewType.Help */ }
            });
        }, contextkey_1.$Oi.create('isInDiffEditor', true));
    }
    (0, editorExtensions_1.$BV)(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);
    platform_1.$8m.as(configuration_2.$az.ConfigurationMigration)
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
//# sourceMappingURL=diffEditorHelper.js.map