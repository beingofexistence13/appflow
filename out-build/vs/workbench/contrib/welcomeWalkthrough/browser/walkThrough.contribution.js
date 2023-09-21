/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/walkThrough.contribution", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider", "vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/contributions", "vs/workbench/browser/editor", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls_1, walkThroughInput_1, walkThroughPart_1, walkThroughActions_1, walkThroughContentProvider_1, editorWalkThrough_1, platform_1, editor_1, descriptors_1, actions_1, contributions_1, editor_2, keybindingsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.$8m.as(editor_1.$GE.EditorPane)
        .registerEditorPane(editor_2.$_T.create(walkThroughPart_1.$4Yb, walkThroughPart_1.$4Yb.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.$yh(walkThroughInput_1.$1Yb)]);
    (0, actions_1.$Xu)(editorWalkThrough_1.$0Yb);
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(editorWalkThrough_1.$$Yb.ID, editorWalkThrough_1.$$Yb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(walkThroughContentProvider_1.$ZYb, 2 /* LifecyclePhase.Ready */);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule(walkThroughActions_1.$5Yb);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule(walkThroughActions_1.$6Yb);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule(walkThroughActions_1.$7Yb);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule(walkThroughActions_1.$8Yb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: 'workbench.action.showInteractivePlayground',
            title: (0, nls_1.localize)(1, null)
        },
        order: 3
    });
});
//# sourceMappingURL=walkThrough.contribution.js.map