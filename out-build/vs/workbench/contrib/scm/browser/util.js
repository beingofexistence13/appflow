/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/arrays", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom"], function (require, exports, actions_1, menuEntryActionViewItem_1, arrays_1, actionViewItems_1, iconLabels_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IPb = exports.$HPb = exports.$GPb = exports.$FPb = exports.$EPb = exports.$DPb = exports.$CPb = exports.$BPb = exports.$APb = exports.$zPb = exports.$yPb = void 0;
    function $yPb(element) {
        return Array.isArray(element) && element.every(r => $zPb(r));
    }
    exports.$yPb = $yPb;
    function $zPb(element) {
        return !!element.provider && !!element.input;
    }
    exports.$zPb = $zPb;
    function $APb(element) {
        return !!element.validateInput && typeof element.value === 'string';
    }
    exports.$APb = $APb;
    function $BPb(element) {
        return element.type === 'actionButton';
    }
    exports.$BPb = $BPb;
    function $CPb(element) {
        return !!element.provider && !!element.elements;
    }
    exports.$CPb = $CPb;
    function $DPb(element) {
        return !!element.sourceUri && $CPb(element.resourceGroup);
    }
    exports.$DPb = $DPb;
    const compareActions = (a, b) => a.id === b.id && a.enabled === b.enabled;
    function $EPb(menu, callback, primaryGroup) {
        let cachedPrimary = [];
        let cachedSecondary = [];
        const updateActions = () => {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
            if ((0, arrays_1.$sb)(cachedPrimary, primary, compareActions) && (0, arrays_1.$sb)(cachedSecondary, secondary, compareActions)) {
                return;
            }
            cachedPrimary = primary;
            cachedSecondary = secondary;
            callback(primary, secondary);
        };
        updateActions();
        return menu.onDidChange(updateActions);
    }
    exports.$EPb = $EPb;
    function $FPb(menu, actionBar) {
        return $EPb(menu, (primary) => {
            actionBar.clear();
            actionBar.push(primary, { icon: true, label: false });
        }, 'inline');
    }
    exports.$FPb = $FPb;
    function $GPb(menu) {
        const primary = [];
        const actions = [];
        (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, 'inline');
        return actions;
    }
    exports.$GPb = $GPb;
    class $HPb extends actions_1.$gi {
        constructor(c, f) {
            super(`statusbaraction{${c.id}}`, c.title, '', true);
            this.c = c;
            this.f = f;
            this.tooltip = c.tooltip || '';
        }
        run() {
            return this.f.executeCommand(this.c.id, ...(this.c.arguments || []));
        }
    }
    exports.$HPb = $HPb;
    class StatusBarActionViewItem extends actionViewItems_1.$NQ {
        constructor(action) {
            super(null, action, {});
        }
        w() {
            if (this.m.label && this.H) {
                (0, dom_1.$_O)(this.H, ...(0, iconLabels_1.$xQ)(this.action.label));
            }
        }
    }
    function $IPb(instaService) {
        return action => {
            if (action instanceof $HPb) {
                return new StatusBarActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.$F3)(instaService, action);
        };
    }
    exports.$IPb = $IPb;
});
//# sourceMappingURL=util.js.map