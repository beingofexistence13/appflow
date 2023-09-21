/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path"], function (require, exports, event_1, lifecycle_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ufc = void 0;
    class $Ufc {
        constructor() {
            this.onDidChangeFormatters = new event_1.$fd().event;
        }
        registerCachedFormatter(formatter) {
            throw new Error('Method not implemented.');
        }
        getUriLabel(resource, options) {
            return (0, path_1.$7d)(resource.fsPath);
        }
        getUriBasenameLabel(resource) {
            return (0, path_1.$ae)(resource.fsPath);
        }
        getWorkspaceLabel(workspace, options) {
            return '';
        }
        getHostLabel(scheme, authority) {
            return '';
        }
        getHostTooltip() {
            return '';
        }
        getSeparator(scheme, authority) {
            return '/';
        }
        registerFormatter(formatter) {
            return lifecycle_1.$kc.None;
        }
    }
    exports.$Ufc = $Ufc;
});
//# sourceMappingURL=mockLabelService.js.map