/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls!vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/platform/actions/common/actions"], function (require, exports, editorExtensions_1, nls_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aFb = exports.$_Eb = void 0;
    const defaultOptions = {
        category: {
            value: (0, nls_1.localize)(0, null),
            original: 'Snippets'
        },
    };
    class $_Eb extends actions_1.$Wu {
        constructor(desc) {
            super({ ...defaultOptions, ...desc });
        }
    }
    exports.$_Eb = $_Eb;
    class $aFb extends editorExtensions_1.$uV {
        constructor(desc) {
            super({ ...defaultOptions, ...desc });
        }
    }
    exports.$aFb = $aFb;
});
//# sourceMappingURL=abstractSnippetsActions.js.map