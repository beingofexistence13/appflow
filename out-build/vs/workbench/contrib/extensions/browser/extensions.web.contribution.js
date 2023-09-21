/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensions.web.contribution", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/browser/browserRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/common/editor"], function (require, exports, nls_1, platform_1, descriptors_1, editor_1, browserRuntimeExtensionsEditor_1, runtimeExtensionsInput_1, editor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Running Extensions
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(browserRuntimeExtensionsEditor_1.$04b, browserRuntimeExtensionsEditor_1.$04b.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.$yh(runtimeExtensionsInput_1.$5Ub)]);
});
//# sourceMappingURL=extensions.web.contribution.js.map