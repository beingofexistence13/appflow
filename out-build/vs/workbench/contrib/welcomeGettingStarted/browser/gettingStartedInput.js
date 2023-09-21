/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/common/editor/editorInput", "vs/base/common/uri", "vs/base/common/network", "vs/css!./media/gettingStarted"], function (require, exports, nls_1, editorInput_1, uri_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MYb = exports.$LYb = void 0;
    exports.$LYb = 'workbench.editors.gettingStartedInput';
    class $MYb extends editorInput_1.$tA {
        static { this.ID = exports.$LYb; }
        static { this.RESOURCE = uri_1.URI.from({ scheme: network_1.Schemas.walkThrough, authority: 'vscode_getting_started_page' }); }
        get typeId() {
            return $MYb.ID;
        }
        get editorId() {
            return this.typeId;
        }
        toUntyped() {
            return {
                resource: $MYb.RESOURCE,
                options: {
                    override: $MYb.ID,
                    pinned: false
                }
            };
        }
        get resource() {
            return $MYb.RESOURCE;
        }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof $MYb) {
                return other.selectedCategory === this.selectedCategory;
            }
            return false;
        }
        constructor(options) {
            super();
            this.selectedCategory = options.selectedCategory;
            this.selectedStep = options.selectedStep;
            this.showTelemetryNotice = !!options.showTelemetryNotice;
        }
        getName() {
            return (0, nls_1.localize)(0, null);
        }
    }
    exports.$MYb = $MYb;
});
//# sourceMappingURL=gettingStartedInput.js.map