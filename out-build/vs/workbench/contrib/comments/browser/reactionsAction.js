/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/reactionsAction", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/uri", "vs/base/browser/ui/actionbar/actionViewItems"], function (require, exports, nls, dom, actions_1, uri_1, actionViewItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xmb = exports.$wmb = exports.$vmb = void 0;
    class $vmb extends actions_1.$gi {
        static { this.ID = 'toolbar.toggle.pickReactions'; }
        constructor(toggleDropdownMenu, title) {
            super($vmb.ID, title || nls.localize(0, null), 'toggle-reactions', true);
            this.a = [];
            this.b = toggleDropdownMenu;
        }
        run() {
            this.b();
            return Promise.resolve(true);
        }
        get menuActions() {
            return this.a;
        }
        set menuActions(actions) {
            this.a = actions;
        }
    }
    exports.$vmb = $vmb;
    class $wmb extends actionViewItems_1.$NQ {
        constructor(action) {
            super(null, action, {});
        }
        w() {
            if (!this.H) {
                return;
            }
            const action = this.action;
            if (action.class) {
                this.H.classList.add(action.class);
            }
            if (!action.icon) {
                const reactionLabel = dom.$0O(this.H, dom.$('span.reaction-label'));
                reactionLabel.innerText = action.label;
            }
            else {
                const reactionIcon = dom.$0O(this.H, dom.$('.reaction-icon'));
                const uri = uri_1.URI.revive(action.icon);
                reactionIcon.style.backgroundImage = dom.$nP(uri);
                reactionIcon.title = action.label;
            }
            if (action.count) {
                const reactionCount = dom.$0O(this.H, dom.$('span.reaction-count'));
                reactionCount.innerText = `${action.count}`;
            }
        }
        z() {
            const action = this.action;
            const toggleMessage = action.enabled ? nls.localize(1, null) : '';
            if (action.count === undefined) {
                return nls.localize(2, null, toggleMessage, action.label);





            }
            else if (action.count === 1) {
                return nls.localize(3, null, toggleMessage, action.label);






            }
            else if (action.count > 1) {
                return nls.localize(4, null, toggleMessage, action.count, action.label);






            }
            return undefined;
        }
    }
    exports.$wmb = $wmb;
    class $xmb extends actions_1.$gi {
        static { this.ID = 'toolbar.toggle.reaction'; }
        constructor(id, label = '', cssClass = '', enabled = true, actionCallback, icon, count) {
            super($xmb.ID, label, cssClass, enabled, actionCallback);
            this.icon = icon;
            this.count = count;
        }
    }
    exports.$xmb = $xmb;
});
//# sourceMappingURL=reactionsAction.js.map