/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/base/common/actions"], function (require, exports, event_1, lifecycle_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$li = exports.$ki = exports.$ji = exports.$ii = exports.$hi = exports.$gi = void 0;
    class $gi extends lifecycle_1.$kc {
        constructor(id, label = '', cssClass = '', enabled = true, actionCallback) {
            super();
            this.h = this.B(new event_1.$fd());
            this.onDidChange = this.h.event;
            this.w = true;
            this.j = id;
            this.m = label;
            this.u = cssClass;
            this.w = enabled;
            this.C = actionCallback;
        }
        get id() {
            return this.j;
        }
        get label() {
            return this.m;
        }
        set label(value) {
            this.D(value);
        }
        D(value) {
            if (this.m !== value) {
                this.m = value;
                this.h.fire({ label: value });
            }
        }
        get tooltip() {
            return this.n || '';
        }
        set tooltip(value) {
            this.F(value);
        }
        F(value) {
            if (this.n !== value) {
                this.n = value;
                this.h.fire({ tooltip: value });
            }
        }
        get class() {
            return this.u;
        }
        set class(value) {
            this.G(value);
        }
        G(value) {
            if (this.u !== value) {
                this.u = value;
                this.h.fire({ class: value });
            }
        }
        get enabled() {
            return this.w;
        }
        set enabled(value) {
            this.H(value);
        }
        H(value) {
            if (this.w !== value) {
                this.w = value;
                this.h.fire({ enabled: value });
            }
        }
        get checked() {
            return this.z;
        }
        set checked(value) {
            this.I(value);
        }
        I(value) {
            if (this.z !== value) {
                this.z = value;
                this.h.fire({ checked: value });
            }
        }
        async run(event, data) {
            if (this.C) {
                await this.C(event);
            }
        }
    }
    exports.$gi = $gi;
    class $hi extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = this.B(new event_1.$fd());
            this.onWillRun = this.f.event;
            this.m = this.B(new event_1.$fd());
            this.onDidRun = this.m.event;
        }
        async run(action, context) {
            if (!action.enabled) {
                return;
            }
            this.f.fire({ action });
            let error = undefined;
            try {
                await this.u(action, context);
            }
            catch (e) {
                error = e;
            }
            this.m.fire({ action, error });
        }
        async u(action, context) {
            await action.run(context);
        }
    }
    exports.$hi = $hi;
    class $ii {
        constructor() {
            this.id = $ii.ID;
            this.label = '';
            this.tooltip = '';
            this.class = 'separator';
            this.enabled = false;
            this.checked = false;
        }
        /**
         * Joins all non-empty lists of actions with separators.
         */
        static join(...actionLists) {
            let out = [];
            for (const list of actionLists) {
                if (!list.length) {
                    // skip
                }
                else if (out.length) {
                    out = [...out, new $ii(), ...list];
                }
                else {
                    out = list;
                }
            }
            return out;
        }
        static { this.ID = 'vs.actions.separator'; }
        async run() { }
    }
    exports.$ii = $ii;
    class $ji {
        get actions() { return this.a; }
        constructor(id, label, actions, cssClass) {
            this.tooltip = '';
            this.enabled = true;
            this.checked = undefined;
            this.id = id;
            this.label = label;
            this.class = cssClass;
            this.a = actions;
        }
        async run() { }
    }
    exports.$ji = $ji;
    class $ki extends $gi {
        static { this.ID = 'vs.actions.empty'; }
        constructor() {
            super($ki.ID, nls.localize(0, null), undefined, false);
        }
    }
    exports.$ki = $ki;
    function $li(props) {
        return {
            id: props.id,
            label: props.label,
            class: undefined,
            enabled: props.enabled ?? true,
            checked: props.checked ?? false,
            run: async (...args) => props.run(),
            tooltip: props.label
        };
    }
    exports.$li = $li;
});
//# sourceMappingURL=actions.js.map