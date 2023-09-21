/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHostTypes", "./extHost.protocol", "vs/nls!vs/workbench/api/common/extHostStatusBar", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types"], function (require, exports, extHostTypes_1, extHost_protocol_1, nls_1, lifecycle_1, extHostTypeConverters_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6bc = exports.$5bc = void 0;
    class $5bc {
        static { this.a = 0; }
        static { this.b = new Map([
            ['statusBarItem.errorBackground', new extHostTypes_1.$XK('statusBarItem.errorForeground')],
            ['statusBarItem.warningBackground', new extHostTypes_1.$XK('statusBarItem.warningForeground')]
        ]); }
        #proxy;
        #commands;
        constructor(proxy, commands, staticItems, extension, id, alignment = extHostTypes_1.StatusBarAlignment.Left, priority) {
            this.i = false;
            this.k = '';
            this.q = new lifecycle_1.$jc();
            this.#proxy = proxy;
            this.#commands = commands;
            if (id && extension) {
                this.c = (0, extHostTypes_1.$AK)(extension.identifier, id);
                // if new item already exists mark it as visible and copy properties
                // this can only happen when an item was contributed by an extension
                const item = staticItems.get(this.c);
                if (item) {
                    alignment = item.alignLeft ? extHostTypes_1.StatusBarAlignment.Left : extHostTypes_1.StatusBarAlignment.Right;
                    priority = item.priority;
                    this.j = true;
                    this.name = item.name;
                    this.text = item.text;
                    this.tooltip = item.tooltip;
                    this.command = item.command;
                    this.accessibilityInformation = item.accessibilityInformation;
                }
            }
            else {
                this.c = String($5bc.a++);
            }
            this.e = extension;
            this.f = id;
            this.g = alignment;
            this.h = this.u(priority);
        }
        u(priority) {
            if (!(0, types_1.$nf)(priority)) {
                return undefined; // using this method to catch `NaN` too!
            }
            // Our RPC mechanism use JSON to serialize data which does
            // not support `Infinity` so we need to fill in the number
            // equivalent as close as possible.
            // https://github.com/microsoft/vscode/issues/133317
            if (priority === Number.POSITIVE_INFINITY) {
                return Number.MAX_VALUE;
            }
            if (priority === Number.NEGATIVE_INFINITY) {
                return -Number.MAX_VALUE;
            }
            return priority;
        }
        get id() {
            return this.f ?? this.e.identifier.value;
        }
        get alignment() {
            return this.g;
        }
        get priority() {
            return this.h;
        }
        get text() {
            return this.k;
        }
        get name() {
            return this.m;
        }
        get tooltip() {
            return this.l;
        }
        get color() {
            return this.n;
        }
        get backgroundColor() {
            return this.o;
        }
        get command() {
            return this.r?.fromApi;
        }
        get accessibilityInformation() {
            return this.t;
        }
        set text(text) {
            this.k = text;
            this.v();
        }
        set name(name) {
            this.m = name;
            this.v();
        }
        set tooltip(tooltip) {
            this.l = tooltip;
            this.v();
        }
        set color(color) {
            this.n = color;
            this.v();
        }
        set backgroundColor(color) {
            if (color && !$5bc.b.has(color.id)) {
                color = undefined;
            }
            this.o = color;
            this.v();
        }
        set command(command) {
            if (this.r?.fromApi === command) {
                return;
            }
            if (this.p) {
                this.q.add(this.p);
            }
            this.p = new lifecycle_1.$jc();
            if (typeof command === 'string') {
                this.r = {
                    fromApi: command,
                    internal: this.#commands.toInternal({ title: '', command }, this.p),
                };
            }
            else if (command) {
                this.r = {
                    fromApi: command,
                    internal: this.#commands.toInternal(command, this.p),
                };
            }
            else {
                this.r = undefined;
            }
            this.v();
        }
        set accessibilityInformation(accessibilityInformation) {
            this.t = accessibilityInformation;
            this.v();
        }
        show() {
            this.j = true;
            this.v();
        }
        hide() {
            clearTimeout(this.s);
            this.j = false;
            this.#proxy.$disposeEntry(this.c);
        }
        v() {
            if (this.i || !this.j) {
                return;
            }
            clearTimeout(this.s);
            // Defer the update so that multiple changes to setters dont cause a redraw each
            this.s = setTimeout(() => {
                this.s = undefined;
                // If the id is not set, derive it from the extension identifier,
                // otherwise make sure to prefix it with the extension identifier
                // to get a more unique value across extensions.
                let id;
                if (this.e) {
                    if (this.f) {
                        id = `${this.e.identifier.value}.${this.f}`;
                    }
                    else {
                        id = this.e.identifier.value;
                    }
                }
                else {
                    id = this.f;
                }
                // If the name is not set, derive it from the extension descriptor
                let name;
                if (this.m) {
                    name = this.m;
                }
                else {
                    name = (0, nls_1.localize)(0, null, this.e.displayName || this.e.name);
                }
                // If a background color is set, the foreground is determined
                let color = this.n;
                if (this.o) {
                    color = $5bc.b.get(this.o.id);
                }
                const tooltip = extHostTypeConverters_1.MarkdownString.fromStrict(this.l);
                // Set to status bar
                this.#proxy.$setEntry(this.c, id, this.e?.identifier.value, name, this.k, tooltip, this.r?.internal, color, this.o, this.g === extHostTypes_1.StatusBarAlignment.Left, this.h, this.t);
                // clean-up state commands _after_ updating the UI
                this.q.clear();
            }, 0);
        }
        dispose() {
            this.hide();
            this.i = true;
        }
    }
    exports.$5bc = $5bc;
    class StatusBarMessage {
        constructor(statusBar) {
            this.b = [];
            this.a = statusBar.createStatusBarEntry(undefined, 'status.extensionMessage', extHostTypes_1.StatusBarAlignment.Left, Number.MIN_VALUE);
            this.a.name = (0, nls_1.localize)(1, null);
        }
        dispose() {
            this.b.length = 0;
            this.a.dispose();
        }
        setMessage(message) {
            const data = { message }; // use object to not confuse equal strings
            this.b.unshift(data);
            this.c();
            return new extHostTypes_1.$3J(() => {
                const idx = this.b.indexOf(data);
                if (idx >= 0) {
                    this.b.splice(idx, 1);
                    this.c();
                }
            });
        }
        c() {
            if (this.b.length > 0) {
                this.a.text = this.b[0].message;
                this.a.show();
            }
            else {
                this.a.hide();
            }
        }
    }
    class $6bc {
        constructor(mainContext, commands) {
            this.e = new Map();
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadStatusBar);
            this.b = commands;
            this.c = new StatusBarMessage(this);
        }
        $acceptStaticEntries(added) {
            for (const item of added) {
                this.e.set(item.entryId, item);
            }
        }
        createStatusBarEntry(extension, id, alignment, priority) {
            return new $5bc(this.a, this.b, this.e, extension, id, alignment, priority);
        }
        setStatusBarMessage(text, timeoutOrThenable) {
            const d = this.c.setMessage(text);
            let handle;
            if (typeof timeoutOrThenable === 'number') {
                handle = setTimeout(() => d.dispose(), timeoutOrThenable);
            }
            else if (typeof timeoutOrThenable !== 'undefined') {
                timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
            }
            return new extHostTypes_1.$3J(() => {
                d.dispose();
                clearTimeout(handle);
            });
        }
    }
    exports.$6bc = $6bc;
});
//# sourceMappingURL=extHostStatusBar.js.map