/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/common/editor/editorInput", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/path"], function (require, exports, network_1, uri_1, nls_1, editorInput_1, extensionManagementUtil_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nfb = void 0;
    class $Nfb extends editorInput_1.$tA {
        static { this.ID = 'workbench.extensions.input2'; }
        get typeId() {
            return $Nfb.ID;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
        }
        get resource() {
            return uri_1.URI.from({
                scheme: network_1.Schemas.extension,
                path: (0, path_1.$9d)(this.c.identifier.id, 'extension')
            });
        }
        constructor(c) {
            super();
            this.c = c;
        }
        get extension() { return this.c; }
        getName() {
            return (0, nls_1.localize)(0, null, this.c.displayName);
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return other instanceof $Nfb && (0, extensionManagementUtil_1.$po)(this.c.identifier, other.c.identifier);
        }
    }
    exports.$Nfb = $Nfb;
});
//# sourceMappingURL=extensionsInput.js.map