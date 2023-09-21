/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/customEditor/browser/customEditorInputFactory", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/webviewPanel/browser/webviewEditor", "./customEditorInput", "./customEditors"], function (require, exports, descriptors_1, extensions_1, platform_1, editor_1, contributions_1, editor_2, customEditorInputFactory_1, customEditor_1, webviewEditor_1, customEditorInput_1, customEditors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(customEditor_1.$8eb, customEditors_1.$OTb, 1 /* InstantiationType.Delayed */);
    platform_1.$8m.as(editor_2.$GE.EditorPane)
        .registerEditorPane(editor_1.$_T.create(webviewEditor_1.$gfb, webviewEditor_1.$gfb.ID, 'Webview Editor'), [
        new descriptors_1.$yh(customEditorInput_1.$kfb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorFactory)
        .registerEditorSerializer(customEditorInputFactory_1.$rlb.ID, customEditorInputFactory_1.$rlb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(customEditorInputFactory_1.$slb, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=customEditor.contribution.js.map