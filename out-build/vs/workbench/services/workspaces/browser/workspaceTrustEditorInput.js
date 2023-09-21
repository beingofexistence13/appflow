/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls!vs/workbench/services/workspaces/browser/workspaceTrustEditorInput", "vs/workbench/common/editor/editorInput"], function (require, exports, network_1, uri_1, nls_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H1b = void 0;
    class $H1b extends editorInput_1.$tA {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeWorkspaceTrust,
                path: `workspaceTrustEditor`
            });
        }
        static { this.ID = 'workbench.input.workspaceTrust'; }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
        }
        get typeId() {
            return $H1b.ID;
        }
        matches(otherInput) {
            return super.matches(otherInput) || otherInput instanceof $H1b;
        }
        getName() {
            return (0, nls_1.localize)(0, null);
        }
    }
    exports.$H1b = $H1b;
});
//# sourceMappingURL=workspaceTrustEditorInput.js.map