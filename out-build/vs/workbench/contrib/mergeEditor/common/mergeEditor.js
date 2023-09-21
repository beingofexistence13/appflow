/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_jb = exports.$$jb = exports.$0jb = exports.$9jb = exports.$8jb = exports.$7jb = exports.$6jb = exports.$5jb = exports.$4jb = void 0;
    exports.$4jb = new contextkey_1.$2i('isMergeEditor', false, { type: 'boolean', description: (0, nls_1.localize)(0, null) });
    exports.$5jb = new contextkey_1.$2i('isMergeResultEditor', false, { type: 'boolean', description: (0, nls_1.localize)(1, null) });
    exports.$6jb = new contextkey_1.$2i('mergeEditorLayout', 'mixed', { type: 'string', description: (0, nls_1.localize)(2, null) });
    exports.$7jb = new contextkey_1.$2i('mergeEditorShowBase', false, { type: 'boolean', description: (0, nls_1.localize)(3, null) });
    exports.$8jb = new contextkey_1.$2i('mergeEditorShowBaseAtTop', false, { type: 'boolean', description: (0, nls_1.localize)(4, null) });
    exports.$9jb = new contextkey_1.$2i('mergeEditorShowNonConflictingChanges', false, { type: 'boolean', description: (0, nls_1.localize)(5, null) });
    exports.$0jb = new contextkey_1.$2i('mergeEditorBaseUri', '', { type: 'string', description: (0, nls_1.localize)(6, null) });
    exports.$$jb = new contextkey_1.$2i('mergeEditorResultUri', '', { type: 'string', description: (0, nls_1.localize)(7, null) });
    exports.$_jb = 'mergeEditorCloseWithConflicts';
});
//# sourceMappingURL=mergeEditor.js.map