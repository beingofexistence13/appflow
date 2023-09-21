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
    exports.SCMService = void 0;
    class SCMInput {
        get value() {
            return this._value;
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this._onDidChangePlaceholder.fire(placeholder);
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            this._enabled = enabled;
            this._onDidChangeEnablement.fire(enabled);
        }
        get visible() {
            return this._visible;
        }
        set visible(visible) {
            this._visible = visible;
            this._onDidChangeVisibility.fire(visible);
        }
        setFocus() {
            this._onDidChangeFocus.fire();
        }
        showValidationMessage(message, type) {
            this._onDidChangeValidationMessage.fire({ message: message, type: type });
        }
        get validateInput() {
            return this._validateInput;
        }
        set validateInput(validateInput) {
            this._validateInput = validateInput;
            this._onDidChangeValidateInput.fire();
        }
        constructor(repository, history) {
            this.repository = repository;
            this.history = history;
            this._value = '';
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._placeholder = '';
            this._onDidChangePlaceholder = new event_1.Emitter();
            this.onDidChangePlaceholder = this._onDidChangePlaceholder.event;
            this._enabled = true;
            this._onDidChangeEnablement = new event_1.Emitter();
            this.onDidChangeEnablement = this._onDidChangeEnablement.event;
            this._visible = true;
            this._onDidChangeVisibility = new event_1.Emitter();
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._onDidChangeValidationMessage = new event_1.Emitter();
            this.onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
            this._validateInput = () => Promise.resolve(undefined);
            this._onDidChangeValidateInput = new event_1.Emitter();
            this.onDidChangeValidateInput = this._onDidChangeValidateInput.event;
            this.didChangeHistory = false;
            if (this.repository.provider.rootUri) {
                this.historyNavigator = history.getHistory(this.repository.provider.label, this.repository.provider.rootUri);
                this.history.onWillSaveHistory(event => {
                    if (this.historyNavigator.isAtEnd()) {
                        this.saveValue();
                    }
                    if (this.didChangeHistory) {
                        event.historyDidIndeedChange();
                    }
                    this.didChangeHistory = false;
                });
            }
            else { // in memory only
                this.historyNavigator = new history_1.HistoryNavigator2([''], 100);
            }
            this._value = this.historyNavigator.current();
        }
        setValue(value, transient, reason) {
            if (value === this._value) {
                return;
            }
            if (!transient) {
                this.saveValue();
                this.historyNavigator.add(value);
                this.didChangeHistory = true;
            }
            this._value = value;
            this._onDidChange.fire({ value, reason });
        }
        showNextHistoryValue() {
            if (this.historyNavigator.isAtEnd()) {
                return;
            }
            else if (!this.historyNavigator.has(this.value)) {
                this.saveValue();
                this.historyNavigator.resetCursor();
            }
            const value = this.historyNavigator.next();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryNext);
        }
        showPreviousHistoryValue() {
            if (this.historyNavigator.isAtEnd()) {
                this.saveValue();
            }
            else if (!this.historyNavigator.has(this._value)) {
                this.saveValue();
                this.historyNavigator.resetCursor();
            }
            const value = this.historyNavigator.previous();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryPrevious);
        }
        saveValue() {
            const oldValue = this.historyNavigator.replaceLast(this._value);
            this.didChangeHistory = this.didChangeHistory || (oldValue !== this._value);
        }
    }
    class SCMRepository {
        get selected() {
            return this._selected;
        }
        constructor(id, provider, disposable, inputHistory) {
            this.id = id;
            this.provider = provider;
            this.disposable = disposable;
            this._selected = false;
            this._onDidChangeSelection = new event_1.Emitter();
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this.input = new SCMInput(this, inputHistory);
        }
        setSelected(selected) {
            if (this._selected === selected) {
                return;
            }
            this._selected = selected;
            this._onDidChangeSelection.fire(selected);
        }
        dispose() {
            this.disposable.dispose();
            this.provider.dispose();
        }
    }
    class WillSaveHistoryEvent {
        constructor() {
            this._didChangeHistory = false;
        }
        get didChangeHistory() { return this._didChangeHistory; }
        historyDidIndeedChange() { this._didChangeHistory = true; }
    }
    let SCMInputHistory = class SCMInputHistory {
        constructor(storageService, workspaceContextService) {
            this.storageService = storageService;
            this.workspaceContextService = workspaceContextService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.histories = new Map();
            this._onWillSaveHistory = this.disposables.add(new event_1.Emitter());
            this.onWillSaveHistory = this._onWillSaveHistory.event;
            this.histories = new Map();
            const entries = this.storageService.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
            for (const [providerLabel, rootUri, history] of entries) {
                let providerHistories = this.histories.get(providerLabel);
                if (!providerHistories) {
                    providerHistories = new map_1.ResourceMap();
                    this.histories.set(providerLabel, providerHistories);
                }
                providerHistories.set(rootUri, new history_1.HistoryNavigator2(history, 100));
            }
            if (this.migrateStorage()) {
                this.saveToStorage();
            }
            this.disposables.add(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, 'scm.history', this.disposables)(e => {
                if (e.external && e.key === 'scm.history') {
                    const raw = this.storageService.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
                    for (const [providerLabel, uri, rawHistory] of raw) {
                        const history = this.getHistory(providerLabel, uri);
                        for (const value of iterator_1.Iterable.reverse(rawHistory)) {
                            history.prepend(value);
                        }
                    }
                }
            }));
            this.disposables.add(this.storageService.onWillSaveState(_ => {
                const event = new WillSaveHistoryEvent();
                this._onWillSaveHistory.fire(event);
                if (event.didChangeHistory) {
                    this.saveToStorage();
                }
            }));
        }
        saveToStorage() {
            const raw = [];
            for (const [providerLabel, providerHistories] of this.histories) {
                for (const [rootUri, history] of providerHistories) {
                    if (!(history.size === 1 && history.current() === '')) {
                        raw.push([providerLabel, rootUri, [...history]]);
                    }
                }
            }
            this.storageService.store('scm.history', raw, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        getHistory(providerLabel, rootUri) {
            let providerHistories = this.histories.get(providerLabel);
            if (!providerHistories) {
                providerHistories = new map_1.ResourceMap();
                this.histories.set(providerLabel, providerHistories);
            }
            let history = providerHistories.get(rootUri);
            if (!history) {
                history = new history_1.HistoryNavigator2([''], 100);
                providerHistories.set(rootUri, history);
            }
            return history;
        }
        // Migrates from Application scope storage to Workspace scope.
        // TODO@joaomoreno: Change from January 2024 onwards such that the only code is to remove all `scm/input:` storage keys
        migrateStorage() {
            let didSomethingChange = false;
            const machineKeys = iterator_1.Iterable.filter(this.storageService.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */), key => key.startsWith('scm/input:'));
            for (const key of machineKeys) {
                try {
                    const legacyHistory = JSON.parse(this.storageService.get(key, -1 /* StorageScope.APPLICATION */, ''));
                    const match = /^scm\/input:([^:]+):(.+)$/.exec(key);
                    if (!match || !Array.isArray(legacyHistory?.history) || !Number.isInteger(legacyHistory?.timestamp)) {
                        this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                        continue;
                    }
                    const [, providerLabel, rootPath] = match;
                    const rootUri = uri_1.URI.file(rootPath);
                    if (this.workspaceContextService.getWorkspaceFolder(rootUri)) {
                        const history = this.getHistory(providerLabel, rootUri);
                        for (const entry of iterator_1.Iterable.reverse(legacyHistory.history)) {
                            history.prepend(entry);
                        }
                        didSomethingChange = true;
                        this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                    }
                }
                catch {
                    this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                }
            }
            return didSomethingChange;
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    SCMInputHistory = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], SCMInputHistory);
    let SCMService = class SCMService {
        get repositories() { return this._repositories.values(); }
        get repositoryCount() { return this._repositories.size; }
        constructor(logService, workspaceContextService, contextKeyService, storageService) {
            this.logService = logService;
            this._repositories = new Map(); // used in tests
            this._onDidAddProvider = new event_1.Emitter();
            this.onDidAddRepository = this._onDidAddProvider.event;
            this._onDidRemoveProvider = new event_1.Emitter();
            this.onDidRemoveRepository = this._onDidRemoveProvider.event;
            this.inputHistory = new SCMInputHistory(storageService, workspaceContextService);
            this.providerCount = contextKeyService.createKey('scm.providerCount', 0);
        }
        registerSCMProvider(provider) {
            this.logService.trace('SCMService#registerSCMProvider');
            if (this._repositories.has(provider.id)) {
                throw new Error(`SCM Provider ${provider.id} already exists.`);
            }
            const disposable = (0, lifecycle_1.toDisposable)(() => {
                this._repositories.delete(provider.id);
                this._onDidRemoveProvider.fire(repository);
                this.providerCount.set(this._repositories.size);
            });
            const repository = new SCMRepository(provider.id, provider, disposable, this.inputHistory);
            this._repositories.set(provider.id, repository);
            this._onDidAddProvider.fire(repository);
            this.providerCount.set(this._repositories.size);
            return repository;
        }
        getRepository(id) {
            return this._repositories.get(id);
        }
    };
    exports.SCMService = SCMService;
    exports.SCMService = SCMService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, storage_1.IStorageService)
    ], SCMService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9jb21tb24vc2NtU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlaEcsTUFBTSxRQUFRO1FBSWIsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFPRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksV0FBVyxDQUFDLFdBQW1CO1lBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQU9ELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBSSxPQUFPLENBQUMsT0FBZ0I7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBT0QsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFnQjtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFLRCxRQUFRO1lBQ1AsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFLRCxxQkFBcUIsQ0FBQyxPQUFpQyxFQUFF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