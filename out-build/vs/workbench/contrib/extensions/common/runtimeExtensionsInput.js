/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/base/common/uri", "vs/workbench/common/editor/editorInput"], function (require, exports, nls, uri_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Ub = void 0;
    class $5Ub extends editorInput_1.$tA {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: 'runtime-extensions',
                path: 'default'
            });
        }
        static { this.ID = 'workbench.runtimeExtensions.input'; }
        get typeId() {
            return $5Ub.ID;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
        }
        static get instance() {
            if (!$5Ub._instance || $5Ub._instance.isDisposed()) {
                $5Ub._instance = new $5Ub();
            }
            return $5Ub._instance;
        }
        getName() {
            return nls.localize(0, null);
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            return other instanceof $5Ub;
        }
    }
    exports.$5Ub = $5Ub;
});
//# sourceMappingURL=runtimeExtensionsInput.js.map