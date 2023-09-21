/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/browser/browserRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/common/editor"], function (require, exports, nls_1, platform_1, descriptors_1, editor_1, browserRuntimeExtensionsEditor_1, runtimeExtensionsInput_1, editor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Running Extensions
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(browserRuntimeExtensionsEditor_1.RuntimeExtensionsEditor, browserRuntimeExtensionsEditor_1.RuntimeExtensionsEditor.ID, (0, nls_1.localize)('runtimeExtension', "Running Extensions")), [new descriptors_1.SyncDescriptor(runtimeExtensionsInput_1.RuntimeExtensionsInput)]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy53ZWIuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnMud2ViLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxxQkFBcUI7SUFDckIsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQUMsd0RBQXVCLEVBQUUsd0RBQXVCLENBQUMsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUMsRUFDcEksQ0FBQyxJQUFJLDRCQUFjLENBQUMsK0NBQXNCLENBQUMsQ0FBQyxDQUM1QyxDQUFDIn0=