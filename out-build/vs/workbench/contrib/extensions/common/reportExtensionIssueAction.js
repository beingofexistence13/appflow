/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/common/reportExtensionIssueAction", "vs/base/common/actions", "vs/workbench/services/issue/common/issue"], function (require, exports, nls, actions_1, issue_1) {
    "use strict";
    var $94b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$94b = void 0;
    let $94b = class $94b extends actions_1.$gi {
        static { $94b_1 = this; }
        static { this.j = 'workbench.extensions.action.reportExtensionIssue'; }
        static { this.m = nls.localize(0, null); }
        // TODO: Consider passing in IExtensionStatus or IExtensionHostProfile for additional data
        constructor(c, f) {
            super($94b_1.j, $94b_1.m, 'extension-action report-issue');
            this.c = c;
            this.f = f;
            this.enabled = c.isBuiltin || (!!c.repository && !!c.repository.url);
        }
        async run() {
            await this.f.openReporter({
                extensionId: this.c.identifier.value,
            });
        }
    };
    exports.$94b = $94b;
    exports.$94b = $94b = $94b_1 = __decorate([
        __param(1, issue_1.$rtb)
    ], $94b);
});
//# sourceMappingURL=reportExtensionIssueAction.js.map