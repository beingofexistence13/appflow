/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles"], function (require, exports, button_1, lifecycle_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9lb = void 0;
    class $9lb {
        constructor(e, f, g) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = [];
            this.c = new lifecycle_1.$jc();
            this.d = [];
        }
        setActions(menu, hasOnlySecondaryActions = false) {
            this.c.clear();
            this.a.forEach(b => b.remove());
            this.a = [];
            const groups = menu.getActions({ shouldForwardArgs: true });
            let isPrimary = !hasOnlySecondaryActions;
            for (const group of groups) {
                const [, actions] = group;
                this.d = actions;
                for (const action of actions) {
                    const button = new button_1.$7Q(this.e, { secondary: !isPrimary, ...defaultStyles_1.$i2 });
                    isPrimary = false;
                    this.a.push(button.element);
                    this.c.add(button);
                    this.c.add(button.onDidClick(() => this.f(action)));
                    button.enabled = action.enabled;
                    button.label = action.label;
                    if ((this.g !== undefined) && (this.a.length >= this.g)) {
                        console.warn(`An extension has contributed more than the allowable number of actions to a comments menu.`);
                        return;
                    }
                }
            }
        }
        triggerDefaultAction() {
            if (this.d.length) {
                const lastAction = this.d[0];
                if (lastAction.enabled) {
                    return this.f(lastAction);
                }
            }
        }
        dispose() {
            this.c.dispose();
        }
    }
    exports.$9lb = $9lb;
});
//# sourceMappingURL=commentFormActions.js.map