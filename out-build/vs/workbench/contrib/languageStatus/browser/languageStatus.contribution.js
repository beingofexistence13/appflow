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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/editor/browser/editorBrowser", "vs/nls!vs/workbench/contrib/languageStatus/browser/languageStatus.contribution", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/linkedText", "vs/platform/opener/browser/link", "vs/platform/opener/common/opener", "vs/base/common/htmlContent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/platform/storage/common/storage", "vs/base/common/arrays", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/css!./media/languageStatus"], function (require, exports, dom, iconLabels_1, lifecycle_1, severity_1, editorBrowser_1, nls_1, platform_1, themables_1, contributions_1, editorService_1, languageStatusService_1, statusbar_1, linkedText_1, link_1, opener_1, htmlContent_1, actionbar_1, actions_1, codicons_1, storage_1, arrays_1, uri_1, actions_2, actionCommonCategories_1) {
    "use strict";
    var EditorStatusContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    class LanguageStatusViewModel {
        constructor(combined, dedicated) {
            this.combined = combined;
            this.dedicated = dedicated;
        }
        isEqual(other) {
            return (0, arrays_1.$sb)(this.combined, other.combined) && (0, arrays_1.$sb)(this.dedicated, other.dedicated);
        }
    }
    let StoredCounter = class StoredCounter {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get value() {
            return this.a.getNumber(this.b, 0 /* StorageScope.PROFILE */, 0);
        }
        increment() {
            const n = this.value + 1;
            this.a.store(this.b, n, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return n;
        }
    };
    StoredCounter = __decorate([
        __param(0, storage_1.$Vo)
    ], StoredCounter);
    let EditorStatusContribution = class EditorStatusContribution {
        static { EditorStatusContribution_1 = this; }
        static { this.a = 'status.languageStatus'; }
        static { this.b = 'languageStatus.dedicated'; }
        constructor(k, l, m, o, p) {
            this.k = k;
            this.l = l;
            this.m = m;
            this.o = o;
            this.p = p;
            this.c = new lifecycle_1.$jc();
            this.f = new Set();
            this.i = new Map();
            this.j = new lifecycle_1.$jc();
            p.onDidChangeValue(0 /* StorageScope.PROFILE */, EditorStatusContribution_1.b, this.c)(this.q, this, this.c);
            this.r();
            this.d = new StoredCounter(p, 'languageStatus.interactCount');
            k.onDidChange(this.u, this, this.c);
            m.onDidActiveEditorChange(this.u, this, this.c);
            this.u();
            l.onDidChangeEntryVisibility(e => {
                if (!e.visible && this.f.has(e.id)) {
                    this.f.delete(e.id);
                    this.u();
                    this.s();
                }
            }, this.c);
        }
        dispose() {
            this.c.dispose();
            this.h?.dispose();
            (0, lifecycle_1.$fc)(this.i.values());
            this.j.dispose();
        }
        // --- persisting dedicated items
        q() {
            this.r();
            this.u();
        }
        r() {
            const raw = this.p.get(EditorStatusContribution_1.b, 0 /* StorageScope.PROFILE */, '[]');
            try {
                const ids = JSON.parse(raw);
                this.f = new Set(ids);
            }
            catch {
                this.f.clear();
            }
        }
        s() {
            if (this.f.size === 0) {
                this.p.remove(EditorStatusContribution_1.b, 0 /* StorageScope.PROFILE */);
            }
            else {
                const raw = JSON.stringify(Array.from(this.f.keys()));
                this.p.store(EditorStatusContribution_1.b, raw, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        // --- language status model and UI
        t(editor) {
            if (!editor?.hasModel()) {
                return new LanguageStatusViewModel([], []);
            }
            const all = this.k.getLanguageStatus(editor.getModel());
            const combined = [];
            const dedicated = [];
            for (const item of all) {
                if (this.f.has(item.id)) {
                    dedicated.push(item);
                }
                combined.push(item);
            }
            return new LanguageStatusViewModel(combined, dedicated);
        }
        u() {
            const editor = (0, editorBrowser_1.$lV)(this.m.activeTextEditorControl);
            const model = this.t(editor);
            if (this.g?.isEqual(model)) {
                return;
            }
            this.j.clear();
            this.g = model;
            // update when editor language changes
            editor?.onDidChangeModelLanguage(this.u, this, this.j);
            // combined status bar item is a single item which hover shows
            // each status item
            if (model.combined.length === 0) {
                // nothing
                this.h?.dispose();
                this.h = undefined;
            }
            else {
                const [first] = model.combined;
                const showSeverity = first.severity >= severity_1.default.Warning;
                const text = EditorStatusContribution_1.w(first.severity);
                let isOneBusy = false;
                const ariaLabels = [];
                const element = document.createElement('div');
                for (const status of model.combined) {
                    const isPinned = model.dedicated.includes(status);
                    element.appendChild(this.v(status, showSeverity, isPinned, this.j));
                    ariaLabels.push(this.z(status));
                    isOneBusy = isOneBusy || (!isPinned && status.busy); // unpinned items contribute to the busy-indicator of the composite status item
                }
                const props = {
                    name: (0, nls_1.localize)(0, null),
                    ariaLabel: (0, nls_1.localize)(1, null, ariaLabels.join(', next: ')),
                    tooltip: element,
                    command: statusbar_1.$9$,
                    text: isOneBusy ? `${text}\u00A0\u00A0$(sync~spin)` : text,
                };
                if (!this.h) {
                    this.h = this.l.addEntry(props, EditorStatusContribution_1.a, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 0 /* StatusbarAlignment.LEFT */, compact: true });
                }
                else {
                    this.h.update(props);
                }
                // animate the status bar icon whenever language status changes, repeat animation
                // when severity is warning or error, don't show animation when showing progress/busy
                const userHasInteractedWithStatus = this.d.value >= 3;
                const node = document.querySelector('.monaco-workbench .statusbar DIV#status\\.languageStatus A>SPAN.codicon');
                const container = document.querySelector('.monaco-workbench .statusbar DIV#status\\.languageStatus');
                if (node instanceof HTMLElement && container) {
                    const _wiggle = 'wiggle';
                    const _flash = 'flash';
                    if (!isOneBusy) {
                        // wiggle icon when severe or "new"
                        node.classList.toggle(_wiggle, showSeverity || !userHasInteractedWithStatus);
                        this.j.add(dom.$nO(node, 'animationend', _e => node.classList.remove(_wiggle)));
                        // flash background when severe
                        container.classList.toggle(_flash, showSeverity);
                        this.j.add(dom.$nO(container, 'animationend', _e => container.classList.remove(_flash)));
                    }
                    else {
                        node.classList.remove(_wiggle);
                        container.classList.remove(_flash);
                    }
                }
                // track when the hover shows (this is automagic and DOM mutation spying is needed...)
                //  use that as signal that the user has interacted/learned language status items work
                if (!userHasInteractedWithStatus) {
                    const hoverTarget = document.querySelector('.monaco-workbench .context-view');
                    if (hoverTarget instanceof HTMLElement) {
                        const observer = new MutationObserver(() => {
                            if (document.contains(element)) {
                                this.d.increment();
                                observer.disconnect();
                            }
                        });
                        observer.observe(hoverTarget, { childList: true, subtree: true });
                        this.j.add((0, lifecycle_1.$ic)(() => observer.disconnect()));
                    }
                }
            }
            // dedicated status bar items are shows as-is in the status bar
            const newDedicatedEntries = new Map();
            for (const status of model.dedicated) {
                const props = EditorStatusContribution_1.A(status);
                let entry = this.i.get(status.id);
                if (!entry) {
                    entry = this.l.addEntry(props, status.id, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 1 /* StatusbarAlignment.RIGHT */ });
                }
                else {
                    entry.update(props);
                    this.i.delete(status.id);
                }
                newDedicatedEntries.set(status.id, entry);
            }
            (0, lifecycle_1.$fc)(this.i.values());
            this.i = newDedicatedEntries;
        }
        v(status, showSeverity, isPinned, store) {
            const parent = document.createElement('div');
            parent.classList.add('hover-language-status');
            const severity = document.createElement('div');
            severity.classList.add('severity', `sev${status.severity}`);
            severity.classList.toggle('show', showSeverity);
            const severityText = EditorStatusContribution_1.x(status.severity);
            dom.$0O(severity, ...(0, iconLabels_1.$xQ)(severityText));
            parent.appendChild(severity);
            const element = document.createElement('div');
            element.classList.add('element');
            parent.appendChild(element);
            const left = document.createElement('div');
            left.classList.add('left');
            element.appendChild(left);
            const label = document.createElement('span');
            label.classList.add('label');
            dom.$0O(label, ...(0, iconLabels_1.$xQ)(status.busy ? `$(sync~spin)\u00A0\u00A0${status.label}` : status.label));
            left.appendChild(label);
            const detail = document.createElement('span');
            detail.classList.add('detail');
            this.y(detail, status.detail, store);
            left.appendChild(detail);
            const right = document.createElement('div');
            right.classList.add('right');
            element.appendChild(right);
            // -- command (if available)
            const { command } = status;
            if (command) {
                store.add(new link_1.$40(right, {
                    label: command.title,
                    title: command.tooltip,
                    href: uri_1.URI.from({
                        scheme: 'command', path: command.id, query: command.arguments && JSON.stringify(command.arguments)
                    }).toString()
                }, undefined, this.o));
            }
            // -- pin
            const actionBar = new actionbar_1.$1P(right, {});
            store.add(actionBar);
            let action;
            if (!isPinned) {
                action = new actions_1.$gi('pin', (0, nls_1.localize)(2, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.pin), true, () => {
                    this.f.add(status.id);
                    this.l.updateEntryVisibility(status.id, true);
                    this.u();
                    this.s();
                });
            }
            else {
                action = new actions_1.$gi('unpin', (0, nls_1.localize)(3, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.pinned), true, () => {
                    this.f.delete(status.id);
                    this.l.updateEntryVisibility(status.id, false);
                    this.u();
                    this.s();
                });
            }
            actionBar.push(action, { icon: true, label: false });
            store.add(action);
            return parent;
        }
        static w(sev) {
            switch (sev) {
                case severity_1.default.Error: return '$(bracket-error)';
                case severity_1.default.Warning: return '$(bracket-dot)';
                default: return '$(bracket)';
            }
        }
        static x(sev) {
            switch (sev) {
                case severity_1.default.Error: return '$(error)';
                case severity_1.default.Warning: return '$(info)';
                default: return '$(check)';
            }
        }
        y(target, text, store) {
            for (const node of (0, linkedText_1.$IS)(text).nodes) {
                if (typeof node === 'string') {
                    const parts = (0, iconLabels_1.$xQ)(node);
                    dom.$0O(target, ...parts);
                }
                else {
                    store.add(new link_1.$40(target, node, undefined, this.o));
                }
            }
        }
        z(status) {
            if (status.accessibilityInfo) {
                return status.accessibilityInfo.label;
            }
            else if (status.detail) {
                return (0, nls_1.localize)(4, null, status.label, status.detail);
            }
            else {
                return (0, nls_1.localize)(5, null, status.label);
            }
        }
        // ---
        static A(item) {
            let kind;
            if (item.severity === severity_1.default.Warning) {
                kind = 'warning';
            }
            else if (item.severity === severity_1.default.Error) {
                kind = 'error';
            }
            return {
                name: (0, nls_1.localize)(6, null, item.name),
                text: item.busy ? `${item.label}\u00A0\u00A0$(sync~spin)` : item.label,
                ariaLabel: item.accessibilityInfo?.label ?? item.label,
                role: item.accessibilityInfo?.role,
                tooltip: item.command?.tooltip || new htmlContent_1.$Xj(item.detail, { isTrusted: true, supportThemeIcons: true }),
                kind,
                command: item.command
            };
        }
    };
    EditorStatusContribution = EditorStatusContribution_1 = __decorate([
        __param(0, languageStatusService_1.$6I),
        __param(1, statusbar_1.$6$),
        __param(2, editorService_1.$9C),
        __param(3, opener_1.$NT),
        __param(4, storage_1.$Vo)
    ], EditorStatusContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(EditorStatusContribution, 3 /* LifecyclePhase.Restored */);
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: 'editor.inlayHints.Reset',
                title: {
                    value: (0, nls_1.localize)(7, null),
                    original: 'Reset Language Status Interaction Counter'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.$Vo).remove('languageStatus.interactCount', 0 /* StorageScope.PROFILE */);
        }
    });
});
//# sourceMappingURL=languageStatus.contribution.js.map