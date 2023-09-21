/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey"], function (require, exports, dom, button_1, htmlContent_1, lifecycle_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PGb = void 0;
    const $ = dom.$;
    class $PGb extends lifecycle_1.$kc {
        constructor(container, followups, a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            const followupsContainer = dom.$0O(container, $('.interactive-session-followups'));
            followups.forEach(followup => this.f(followupsContainer, followup));
        }
        f(container, followup) {
            if (followup.kind === 'command' && followup.when && !this.c.contextMatchesRules(contextkey_1.$Ii.deserialize(followup.when))) {
                return;
            }
            const tooltip = 'tooltip' in followup ? followup.tooltip : undefined;
            const button = this.B(new button_1.$7Q(container, { ...this.a, supportIcons: true, title: tooltip }));
            if (followup.kind === 'reply') {
                button.element.classList.add('interactive-followup-reply');
            }
            else if (followup.kind === 'command') {
                button.element.classList.add('interactive-followup-command');
            }
            const label = followup.kind === 'reply' ?
                '$(sparkle) ' + (followup.title || followup.message) :
                followup.title;
            button.label = new htmlContent_1.$Xj(label, { supportThemeIcons: true });
            this.B(button.onDidClick(() => this.b(followup)));
        }
    }
    exports.$PGb = $PGb;
});
//# sourceMappingURL=chatFollowups.js.map