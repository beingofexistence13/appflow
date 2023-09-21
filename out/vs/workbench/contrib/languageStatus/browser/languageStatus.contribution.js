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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/editor/browser/editorBrowser", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/linkedText", "vs/platform/opener/browser/link", "vs/platform/opener/common/opener", "vs/base/common/htmlContent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/platform/storage/common/storage", "vs/base/common/arrays", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/css!./media/languageStatus"], function (require, exports, dom, iconLabels_1, lifecycle_1, severity_1, editorBrowser_1, nls_1, platform_1, themables_1, contributions_1, editorService_1, languageStatusService_1, statusbar_1, linkedText_1, link_1, opener_1, htmlContent_1, actionbar_1, actions_1, codicons_1, storage_1, arrays_1, uri_1, actions_2, actionCommonCategories_1) {
    "use strict";
    var EditorStatusContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    class LanguageStatusViewModel {
        constructor(combined, dedicated) {
            this.combined = combined;
            this.dedicated = dedicated;
        }
        isEqual(other) {
            return (0, arrays_1.equals)(this.combined, other.combined) && (0, arrays_1.equals)(this.dedicated, other.dedicated);
        }
    }
    let StoredCounter = class StoredCounter {
        constructor(_storageService, _key) {
            this._storageService = _storageService;
            this._key = _key;
        }
        get value() {
            return this._storageService.getNumber(this._key, 0 /* StorageScope.PROFILE */, 0);
        }
        increment() {
            const n = this.value + 1;
            this._storageService.store(this._key, n, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return n;
        }
    };
    StoredCounter = __decorate([
        __param(0, storage_1.IStorageService)
    ], StoredCounter);
    let EditorStatusContribution = class EditorStatusContribution {
        static { EditorStatusContribution_1 = this; }
        static { this._id = 'status.languageStatus'; }
        static { this._keyDedicatedItems = 'languageStatus.dedicated'; }
        constructor(_languageStatusService, _statusBarService, _editorService, _openerService, _storageService) {
            this._languageStatusService = _languageStatusService;
            this._statusBarService = _statusBarService;
            this._editorService = _editorService;
            this._openerService = _openerService;
            this._storageService = _storageService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._dedicated = new Set();
            this._dedicatedEntries = new Map();
            this._renderDisposables = new lifecycle_1.DisposableStore();
            _storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, EditorStatusContribution_1._keyDedicatedItems, this._disposables)(this._handleStorageChange, this, this._disposables);
            this._restoreState();
            this._interactionCounter = new StoredCounter(_storageService, 'languageStatus.interactCount');
            _languageStatusService.onDidChange(this._update, this, this._disposables);
            _editorService.onDidActiveEditorChange(this._update, this, this._disposables);
            this._update();
            _statusBarService.onDidChangeEntryVisibility(e => {
                if (!e.visible && this._dedicated.has(e.id)) {
                    this._dedicated.delete(e.id);
                    this._update();
                    this._storeState();
                }
            }, this._disposables);
        }
        dispose() {
            this._disposables.dispose();
            this._combinedEntry?.dispose();
            (0, lifecycle_1.dispose)(this._dedicatedEntries.values());
            this._renderDisposables.dispose();
        }
        // --- persisting dedicated items
        _handleStorageChange() {
            this._restoreState();
            this._update();
        }
        _restoreState() {
            const raw = this._storageService.get(EditorStatusContribution_1._keyDedicatedItems, 0 /* StorageScope.PROFILE */, '[]');
            try {
                const ids = JSON.parse(raw);
                this._dedicated = new Set(ids);
            }
            catch {
                this._dedicated.clear();
            }
        }
        _storeState() {
            if (this._dedicated.size === 0) {
                this._storageService.remove(EditorStatusContribution_1._keyDedicatedItems, 0 /* StorageScope.PROFILE */);
            }
            else {
                const raw = JSON.stringify(Array.from(this._dedicated.keys()));
                this._storageService.store(EditorStatusContribution_1._keyDedicatedItems, raw, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        // --- language status model and UI
        _createViewModel(editor) {
            if (!editor?.hasModel()) {
                return new LanguageStatusViewModel([], []);
            }
            const all = this._languageStatusService.getLanguageStatus(editor.getModel());
            const combined = [];
            const dedicated = [];
            for (const item of all) {
                if (this._dedicated.has(item.id)) {
                    dedicated.push(item);
                }
                combined.push(item);
            }
            return new LanguageStatusViewModel(combined, dedicated);
        }
        _update() {
            const editor = (0, editorBrowser_1.getCodeEditor)(this._editorService.activeTextEditorControl);
            const model = this._createViewModel(editor);
            if (this._model?.isEqual(model)) {
                return;
            }
            this._renderDisposables.clear();
            this._model = model;
            // update when editor language changes
            editor?.onDidChangeModelLanguage(this._update, this, this._renderDisposables);
            // combined status bar item is a single item which hover shows
            // each status item
            if (model.combined.length === 0) {
                // nothing
                this._combinedEntry?.dispose();
                this._combinedEntry = undefined;
            }
            else {
                const [first] = model.combined;
                const showSeverity = first.severity >= severity_1.default.Warning;
                const text = EditorStatusContribution_1._severityToComboCodicon(first.severity);
                let isOneBusy = false;
                const ariaLabels = [];
                const element = document.createElement('div');
                for (const status of model.combined) {
                    const isPinned = model.dedicated.includes(status);
                    element.appendChild(this._renderStatus(status, showSeverity, isPinned, this._renderDisposables));
                    ariaLabels.push(this._asAriaLabel(status));
                    isOneBusy = isOneBusy || (!isPinned && status.busy); // unpinned items contribute to the busy-indicator of the composite status item
                }
                const props = {
                    name: (0, nls_1.localize)('langStatus.name', "Editor Language Status"),
                    ariaLabel: (0, nls_1.localize)('langStatus.aria', "Editor Language Status: {0}", ariaLabels.join(', next: ')),
                    tooltip: element,
                    command: statusbar_1.ShowTooltipCommand,
                    text: isOneBusy ? `${text}\u00A0\u00A0$(sync~spin)` : text,
                };
                if (!this._combinedEntry) {
                    this._combinedEntry = this._statusBarService.addEntry(props, EditorStatusContribution_1._id, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 0 /* StatusbarAlignment.LEFT */, compact: true });
                }
                else {
                    this._combinedEntry.update(props);
                }
                // animate the status bar icon whenever language status changes, repeat animation
                // when severity is warning or error, don't show animation when showing progress/busy
                const userHasInteractedWithStatus = this._interactionCounter.value >= 3;
                const node = document.querySelector('.monaco-workbench .statusbar DIV#status\\.languageStatus A>SPAN.codicon');
                const container = document.querySelector('.monaco-workbench .statusbar DIV#status\\.languageStatus');
                if (node instanceof HTMLElement && container) {
                    const _wiggle = 'wiggle';
                    const _flash = 'flash';
                    if (!isOneBusy) {
                        // wiggle icon when severe or "new"
                        node.classList.toggle(_wiggle, showSeverity || !userHasInteractedWithStatus);
                        this._renderDisposables.add(dom.addDisposableListener(node, 'animationend', _e => node.classList.remove(_wiggle)));
                        // flash background when severe
                        container.classList.toggle(_flash, showSeverity);
                        this._renderDisposables.add(dom.addDisposableListener(container, 'animationend', _e => container.classList.remove(_flash)));
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
                                this._interactionCounter.increment();
                                observer.disconnect();
                            }
                        });
                        observer.observe(hoverTarget, { childList: true, subtree: true });
                        this._renderDisposables.add((0, lifecycle_1.toDisposable)(() => observer.disconnect()));
                    }
                }
            }
            // dedicated status bar items are shows as-is in the status bar
            const newDedicatedEntries = new Map();
            for (const status of model.dedicated) {
                const props = EditorStatusContribution_1._asStatusbarEntry(status);
                let entry = this._dedicatedEntries.get(status.id);
                if (!entry) {
                    entry = this._statusBarService.addEntry(props, status.id, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 1 /* StatusbarAlignment.RIGHT */ });
                }
                else {
                    entry.update(props);
                    this._dedicatedEntries.delete(status.id);
                }
                newDedicatedEntries.set(status.id, entry);
            }
            (0, lifecycle_1.dispose)(this._dedicatedEntries.values());
            this._dedicatedEntries = newDedicatedEntries;
        }
        _renderStatus(status, showSeverity, isPinned, store) {
            const parent = document.createElement('div');
            parent.classList.add('hover-language-status');
            const severity = document.createElement('div');
            severity.classList.add('severity', `sev${status.severity}`);
            severity.classList.toggle('show', showSeverity);
            const severityText = EditorStatusContribution_1._severityToSingleCodicon(status.severity);
            dom.append(severity, ...(0, iconLabels_1.renderLabelWithIcons)(severityText));
            parent.appendChild(severity);
            const element = document.createElement('div');
            element.classList.add('element');
            parent.appendChild(element);
            const left = document.createElement('div');
            left.classList.add('left');
            element.appendChild(left);
            const label = document.createElement('span');
            label.classList.add('label');
            dom.append(label, ...(0, iconLabels_1.renderLabelWithIcons)(status.busy ? `$(sync~spin)\u00A0\u00A0${status.label}` : status.label));
            left.appendChild(label);
            const detail = document.createElement('span');
            detail.classList.add('detail');
            this._renderTextPlus(detail, status.detail, store);
            left.appendChild(detail);
            const right = document.createElement('div');
            right.classList.add('right');
            element.appendChild(right);
            // -- command (if available)
            const { command } = status;
            if (command) {
                store.add(new link_1.Link(right, {
                    label: command.title,
                    title: command.tooltip,
                    href: uri_1.URI.from({
                        scheme: 'command', path: command.id, query: command.arguments && JSON.stringify(command.arguments)
                    }).toString()
                }, undefined, this._openerService));
            }
            // -- pin
            const actionBar = new actionbar_1.ActionBar(right, {});
            store.add(actionBar);
            let action;
            if (!isPinned) {
                action = new actions_1.Action('pin', (0, nls_1.localize)('pin', "Add to Status Bar"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.pin), true, () => {
                    this._dedicated.add(status.id);
                    this._statusBarService.updateEntryVisibility(status.id, true);
                    this._update();
                    this._storeState();
                });
            }
            else {
                action = new actions_1.Action('unpin', (0, nls_1.localize)('unpin', "Remove from Status Bar"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.pinned), true, () => {
                    this._dedicated.delete(status.id);
                    this._statusBarService.updateEntryVisibility(status.id, false);
                    this._update();
                    this._storeState();
                });
            }
            actionBar.push(action, { icon: true, label: false });
            store.add(action);
            return parent;
        }
        static _severityToComboCodicon(sev) {
            switch (sev) {
                case severity_1.default.Error: return '$(bracket-error)';
                case severity_1.default.Warning: return '$(bracket-dot)';
                default: return '$(bracket)';
            }
        }
        static _severityToSingleCodicon(sev) {
            switch (sev) {
                case severity_1.default.Error: return '$(error)';
                case severity_1.default.Warning: return '$(info)';
                default: return '$(check)';
            }
        }
        _renderTextPlus(target, text, store) {
            for (const node of (0, linkedText_1.parseLinkedText)(text).nodes) {
                if (typeof node === 'string') {
                    const parts = (0, iconLabels_1.renderLabelWithIcons)(node);
                    dom.append(target, ...parts);
                }
                else {
                    store.add(new link_1.Link(target, node, undefined, this._openerService));
                }
            }
        }
        _asAriaLabel(status) {
            if (status.accessibilityInfo) {
                return status.accessibilityInfo.label;
            }
            else if (status.detail) {
                return (0, nls_1.localize)('aria.1', '{0}, {1}', status.label, status.detail);
            }
            else {
                return (0, nls_1.localize)('aria.2', '{0}', status.label);
            }
        }
        // ---
        static _asStatusbarEntry(item) {
            let kind;
            if (item.severity === severity_1.default.Warning) {
                kind = 'warning';
            }
            else if (item.severity === severity_1.default.Error) {
                kind = 'error';
            }
            return {
                name: (0, nls_1.localize)('name.pattern', '{0} (Language Status)', item.name),
                text: item.busy ? `${item.label}\u00A0\u00A0$(sync~spin)` : item.label,
                ariaLabel: item.accessibilityInfo?.label ?? item.label,
                role: item.accessibilityInfo?.role,
                tooltip: item.command?.tooltip || new htmlContent_1.MarkdownString(item.detail, { isTrusted: true, supportThemeIcons: true }),
                kind,
                command: item.command
            };
        }
    };
    EditorStatusContribution = EditorStatusContribution_1 = __decorate([
        __param(0, languageStatusService_1.ILanguageStatusService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, editorService_1.IEditorService),
        __param(3, opener_1.IOpenerService),
        __param(4, storage_1.IStorageService)
    ], EditorStatusContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(EditorStatusContribution, 3 /* LifecyclePhase.Restored */);
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.inlayHints.Reset',
                title: {
                    value: (0, nls_1.localize)('reset', 'Reset Language Status Interaction Counter'),
                    original: 'Reset Language Status Interaction Counter'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).remove('languageStatus.interactCount', 0 /* StorageScope.PROFILE */);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTdGF0dXMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbGFuZ3VhZ2VTdGF0dXMvYnJvd3Nlci9sYW5ndWFnZVN0YXR1cy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLHVCQUF1QjtRQUU1QixZQUNVLFFBQW9DLEVBQ3BDLFNBQXFDO1lBRHJDLGFBQVEsR0FBUixRQUFRLENBQTRCO1lBQ3BDLGNBQVMsR0FBVCxTQUFTLENBQTRCO1FBQzNDLENBQUM7UUFFTCxPQUFPLENBQUMsS0FBOEI7WUFDckMsT0FBTyxJQUFBLGVBQU0sRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFBLGVBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQ0Q7SUFFRCxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO1FBRWxCLFlBQThDLGVBQWdDLEVBQW1CLElBQVk7WUFBL0Qsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQVE7UUFBSSxDQUFDO1FBRWxILElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxTQUFTO1lBQ1IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLDhEQUE4QyxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxDQUFD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