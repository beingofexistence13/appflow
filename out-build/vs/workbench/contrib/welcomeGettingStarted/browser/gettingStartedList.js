/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/event", "vs/base/common/arrays"], function (require, exports, lifecycle_1, dom_1, scrollableElement_1, event_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NYb = void 0;
    class $NYb extends lifecycle_1.$kc {
        constructor(u) {
            super();
            this.u = u;
            this.c = new event_1.$fd();
            this.f = this.c.event;
            this.r = false;
            this.t = new Set();
            this.s = u.contextService;
            this.m = undefined;
            this.itemCount = 0;
            this.h = (0, dom_1.$)('ul');
            this.j = this.B(new scrollableElement_1.$UP(this.h, {}));
            this.B(this.f(() => this.j.scanDomNode()));
            this.g = (0, dom_1.$)('.index-list.' + u.klass, {}, (0, dom_1.$)('h2', {}, u.title), this.j.getDomNode());
            this.B(this.s.onDidChangeContext(e => {
                if (e.affectsSome(this.t)) {
                    this.rerender();
                }
            }));
        }
        getDomElement() {
            return this.g;
        }
        layout(size) {
            this.j.scanDomNode();
        }
        onDidChange(listener) {
            this.B(this.f(listener));
        }
        register(d) { if (this.r) {
            d.dispose();
        }
        else {
            this.B(d);
        } }
        dispose() {
            this.r = true;
            super.dispose();
        }
        setLimit(limit) {
            this.u.limit = limit;
            this.setEntries(this.m);
        }
        rerender() {
            this.setEntries(this.m);
        }
        setEntries(entries) {
            let entryList = entries ?? [];
            this.itemCount = 0;
            const ranker = this.u.rankElement;
            if (ranker) {
                entryList = entryList.filter(e => ranker(e) !== null);
                entryList.sort((a, b) => ranker(b) - ranker(a));
            }
            const activeEntries = entryList.filter(e => !e.when || this.s.contextMatchesRules(e.when));
            const limitedEntries = activeEntries.slice(0, this.u.limit);
            const toRender = limitedEntries.map(e => e.id);
            if (this.m === entries && (0, arrays_1.$sb)(toRender, this.n)) {
                return;
            }
            this.m = entries;
            this.t.clear();
            entryList.forEach(e => {
                const keys = e.when?.keys();
                keys?.forEach(key => this.t.add(key));
            });
            this.n = toRender;
            this.itemCount = limitedEntries.length;
            while (this.h.firstChild) {
                this.h.removeChild(this.h.firstChild);
            }
            this.itemCount = limitedEntries.length;
            for (const entry of limitedEntries) {
                const rendered = this.u.renderElement(entry);
                this.h.appendChild(rendered);
            }
            if (activeEntries.length > limitedEntries.length && this.u.more) {
                this.h.appendChild(this.u.more);
            }
            else if (entries !== undefined && this.itemCount === 0 && this.u.empty) {
                this.h.appendChild(this.u.empty);
            }
            else if (this.u.footer) {
                this.h.appendChild(this.u.footer);
            }
            this.c.fire();
        }
    }
    exports.$NYb = $NYb;
});
//# sourceMappingURL=gettingStartedList.js.map