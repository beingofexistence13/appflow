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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "./scm", "vs/platform/log/common/log", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/base/common/history", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/iterator", "vs/platform/workspace/common/workspace"], function (require, exports, lifecycle_1, event_1, scm_1, log_1, contextkey_1, storage_1, history_1, map_1, uri_1, iterator_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wPb = void 0;
    class SCMInput {
        get value() {
            return this.a;
        }
        get placeholder() {
            return this.c;
        }
        set placeholder(placeholder) {
            this.c = placeholder;
            this.d.fire(placeholder);
        }
        get enabled() {
            return this.f;
        }
        set enabled(enabled) {
            this.f = enabled;
            this.g.fire(enabled);
        }
        get visible() {
            return this.h;
        }
        set visible(visible) {
            this.h = visible;
            this.i.fire(visible);
        }
        setFocus() {
            this.j.fire();
        }
        showValidationMessage(message, type) {
            this.k.fire({ message: message, type: type });
        }
        get validateInput() {
            return this.l;
        }
        set validateInput(validateInput) {
            this.l = validateInput;
            this.m.fire();
        }
        constructor(repository, p) {
            this.repository = repository;
            this.p = p;
            this.a = '';
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.c = '';
            this.d = new event_1.$fd();
            this.onDidChangePlaceholder = this.d.event;
            this.f = true;
            this.g = new event_1.$fd();
            this.onDidChangeEnablement = this.g.event;
            this.h = true;
            this.i = new event_1.$fd();
            this.onDidChangeVisibility = this.i.event;
            this.j = new event_1.$fd();
            this.onDidChangeFocus = this.j.event;
            this.k = new event_1.$fd();
            this.onDidChangeValidationMessage = this.k.event;
            this.l = () => Promise.resolve(undefined);
            this.m = new event_1.$fd();
            this.onDidChangeValidateInput = this.m.event;
            this.o = false;
            if (this.repository.provider.rootUri) {
                this.n = p.getHistory(this.repository.provider.label, this.repository.provider.rootUri);
                this.p.onWillSaveHistory(event => {
                    if (this.n.isAtEnd()) {
                        this.q();
                    }
                    if (this.o) {
                        event.historyDidIndeedChange();
                    }
                    this.o = false;
                });
            }
            else { // in memory only
                this.n = new history_1.$qR([''], 100);
            }
            this.a = this.n.current();
        }
        setValue(value, transient, reason) {
            if (value === this.a) {
                return;
            }
            if (!transient) {
                this.q();
                this.n.add(value);
                this.o = true;
            }
            this.a = value;
            this.b.fire({ value, reason });
        }
        showNextHistoryValue() {
            if (this.n.isAtEnd()) {
                return;
            }
            else if (!this.n.has(this.value)) {
                this.q();
                this.n.resetCursor();
            }
            const value = this.n.next();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryNext);
        }
        showPreviousHistoryValue() {
            if (this.n.isAtEnd()) {
                this.q();
            }
            else if (!this.n.has(this.a)) {
                this.q();
                this.n.resetCursor();
            }
            const value = this.n.previous();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryPrevious);
        }
        q() {
            const oldValue = this.n.replaceLast(this.a);
            this.o = this.o || (oldValue !== this.a);
        }
    }
    class SCMRepository {
        get selected() {
            return this.a;
        }
        constructor(id, provider, c, inputHistory) {
            this.id = id;
            this.provider = provider;
            this.c = c;
            this.a = false;
            this.b = new event_1.$fd();
            this.onDidChangeSelection = this.b.event;
            this.input = new SCMInput(this, inputHistory);
        }
        setSelected(selected) {
            if (this.a === selected) {
                return;
            }
            this.a = selected;
            this.b.fire(selected);
        }
        dispose() {
            this.c.dispose();
            this.provider.dispose();
        }
    }
    class WillSaveHistoryEvent {
        constructor() {
            this.a = false;
        }
        get didChangeHistory() { return this.a; }
        historyDidIndeedChange() { this.a = true; }
    }
    let SCMInputHistory = class SCMInputHistory {
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.a = new lifecycle_1.$jc();
            this.b = new Map();
            this.c = this.a.add(new event_1.$fd());
            this.onWillSaveHistory = this.c.event;
            this.b = new Map();
            const entries = this.d.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
            for (const [providerLabel, rootUri, history] of entries) {
                let providerHistories = this.b.get(providerLabel);
                if (!providerHistories) {
                    providerHistories = new map_1.$zi();
                    this.b.set(providerLabel, providerHistories);
                }
                providerHistories.set(rootUri, new history_1.$qR(history, 100));
            }
            if (this.h()) {
                this.g();
            }
            this.a.add(this.d.onDidChangeValue(1 /* StorageScope.WORKSPACE */, 'scm.history', this.a)(e => {
                if (e.external && e.key === 'scm.history') {
                    const raw = this.d.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
                    for (const [providerLabel, uri, rawHistory] of raw) {
                        const history = this.getHistory(providerLabel, uri);
                        for (const value of iterator_1.Iterable.reverse(rawHistory)) {
                            history.prepend(value);
                        }
                    }
                }
            }));
            this.a.add(this.d.onWillSaveState(_ => {
                const event = new WillSaveHistoryEvent();
                this.c.fire(event);
                if (event.didChangeHistory) {
                    this.g();
                }
            }));
        }
        g() {
            const raw = [];
            for (const [providerLabel, providerHistories] of this.b) {
                for (const [rootUri, history] of providerHistories) {
                    if (!(history.size === 1 && history.current() === '')) {
                        raw.push([providerLabel, rootUri, [...history]]);
                    }
                }
            }
            this.d.store('scm.history', raw, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        getHistory(providerLabel, rootUri) {
            let providerHistories = this.b.get(providerLabel);
            if (!providerHistories) {
                providerHistories = new map_1.$zi();
                this.b.set(providerLabel, providerHistories);
            }
            let history = providerHistories.get(rootUri);
            if (!history) {
                history = new history_1.$qR([''], 100);
                providerHistories.set(rootUri, history);
            }
            return history;
        }
        // Migrates from Application scope storage to Workspace scope.
        // TODO@joaomoreno: Change from January 2024 onwards such that the only code is to remove all `scm/input:` storage keys
        h() {
            let didSomethingChange = false;
            const machineKeys = iterator_1.Iterable.filter(this.d.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */), key => key.startsWith('scm/input:'));
            for (const key of machineKeys) {
                try {
                    const legacyHistory = JSON.parse(this.d.get(key, -1 /* StorageScope.APPLICATION */, ''));
                    const match = /^scm\/input:([^:]+):(.+)$/.exec(key);
                    if (!match || !Array.isArray(legacyHistory?.history) || !Number.isInteger(legacyHistory?.timestamp)) {
                        this.d.remove(key, -1 /* StorageScope.APPLICATION */);
                        continue;
                    }
                    const [, providerLabel, rootPath] = match;
                    const rootUri = uri_1.URI.file(rootPath);
                    if (this.f.getWorkspaceFolder(rootUri)) {
                        const history = this.getHistory(providerLabel, rootUri);
                        for (const entry of iterator_1.Iterable.reverse(legacyHistory.history)) {
                            history.prepend(entry);
                        }
                        didSomethingChange = true;
                        this.d.remove(key, -1 /* StorageScope.APPLICATION */);
                    }
                }
                catch {
                    this.d.remove(key, -1 /* StorageScope.APPLICATION */);
                }
            }
            return didSomethingChange;
        }
        dispose() {
            this.a.dispose();
        }
    };
    SCMInputHistory = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, workspace_1.$Kh)
    ], SCMInputHistory);
    let $wPb = class $wPb {
        get repositories() { return this._repositories.values(); }
        get repositoryCount() { return this._repositories.size; }
        constructor(f, workspaceContextService, contextKeyService, storageService) {
            this.f = f;
            this._repositories = new Map(); // used in tests
            this.c = new event_1.$fd();
            this.onDidAddRepository = this.c.event;
            this.d = new event_1.$fd();
            this.onDidRemoveRepository = this.d.event;
            this.a = new SCMInputHistory(storageService, workspaceContextService);
            this.b = contextKeyService.createKey('scm.providerCount', 0);
        }
        registerSCMProvider(provider) {
            this.f.trace('SCMService#registerSCMProvider');
            if (this._repositories.has(provider.id)) {
                throw new Error(`SCM Provider ${provider.id} already exists.`);
            }
            const disposable = (0, lifecycle_1.$ic)(() => {
                this._repositories.delete(provider.id);
                this.d.fire(repository);
                this.b.set(this._repositories.size);
            });
            const repository = new SCMRepository(provider.id, provider, disposable, this.a);
            this._repositories.set(provider.id, repository);
            this.c.fire(repository);
            this.b.set(this._repositories.size);
            return repository;
        }
        getRepository(id) {
            return this._repositories.get(id);
        }
    };
    exports.$wPb = $wPb;
    exports.$wPb = $wPb = __decorate([
        __param(0, log_1.$5i),
        __param(1, workspace_1.$Kh),
        __param(2, contextkey_1.$3i),
        __param(3, storage_1.$Vo)
    ], $wPb);
});
//# sourceMappingURL=scmService.js.map