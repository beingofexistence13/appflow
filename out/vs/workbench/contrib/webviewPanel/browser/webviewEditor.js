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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uuid", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/browser/editorDropService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, DOM, event_1, lifecycle_1, platform_1, uuid_1, nls, contextkey_1, storage_1, telemetry_1, themeService_1, editorPane_1, webviewWindowDragMonitor_1, webviewEditorInput_1, editorDropService_1, editorGroupsService_1, editorService_1, host_1, layoutService_1) {
    "use strict";
    var WebviewEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewEditor = exports.CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = void 0;
    /**
     * Tracks the id of the actively focused webview.
     */
    exports.CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new contextkey_1.RawContextKey('activeWebviewPanelId', '', {
        type: 'string',
        description: nls.localize('context.activeWebviewId', "The viewType of the currently active webview panel."),
    });
    let WebviewEditor = class WebviewEditor extends editorPane_1.EditorPane {
        static { WebviewEditor_1 = this; }
        static { this.ID = 'WebviewEditor'; }
        get onDidFocus() { return this._onDidFocusWebview.event; }
        constructor(telemetryService, themeService, storageService, editorGroupsService, _editorService, _workbenchLayoutService, _editorDropService, _hostService, _contextKeyService) {
            super(WebviewEditor_1.ID, telemetryService, themeService, storageService);
            this._editorService = _editorService;
            this._workbenchLayoutService = _workbenchLayoutService;
            this._editorDropService = _editorDropService;
            this._hostService = _hostService;
            this._contextKeyService = _contextKeyService;
            this._visible = false;
            this._isDisposed = false;
            this._webviewVisibleDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onFocusWindowHandler = this._register(new lifecycle_1.MutableDisposable());
            this._onDidFocusWebview = this._register(new event_1.Emitter());
            this._scopedContextKeyService = this._register(new lifecycle_1.MutableDisposable());
            this._register(event_1.Event.any(editorGroupsService.onDidScroll, editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup, editorGroupsService.onDidMoveGroup)(() => {
                if (this.webview && this._visible) {
                    this.synchronizeWebviewContainerDimensions(this.webview);
                }
            }));
        }
        get webview() {
            return this.input instanceof webviewEditorInput_1.WebviewInput ? this.input.webview : undefined;
        }
        get scopedContextKeyService() {
            return this._scopedContextKeyService.value;
        }
        createEditor(parent) {
            const element = document.createElement('div');
            this._element = element;
            this._element.id = `webview-editor-element-${(0, uuid_1.generateUuid)()}`;
            parent.appendChild(element);
            this._scopedContextKeyService.value = this._contextKeyService.createScoped(element);
        }
        dispose() {
            this._isDisposed = true;
            this._element?.remove();
            this._element = undefined;
            super.dispose();
        }
        layout(dimension) {
            this._dimension = dimension;
            if (this.webview && this._visible) {
                this.synchronizeWebviewContainerDimensions(this.webview, dimension);
            }
        }
        focus() {
            super.focus();
            if (!this._onFocusWindowHandler.value && !platform_1.isWeb) {
                // Make sure we restore focus when switching back to a VS Code window
                this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus(focused => {
                    if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        this.focus();
                    }
                });
            }
            this.webview?.focus();
        }
        setEditorVisible(visible, group) {
            this._visible = visible;
            if (this.input instanceof webviewEditorInput_1.WebviewInput && this.webview) {
                if (visible) {
                    this.claimWebview(this.input);
                }
                else {
                    this.webview.release(this);
                }
            }
            super.setEditorVisible(visible, group);
        }
        clearInput() {
            if (this.webview) {
                this.webview.release(this);
                this._webviewVisibleDisposables.clear();
            }
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            if (this.input && input.matches(this.input)) {
                return;
            }
            const alreadyOwnsWebview = input instanceof webviewEditorInput_1.WebviewInput && input.webview === this.webview;
            if (this.webview && !alreadyOwnsWebview) {
                this.webview.release(this);
            }
            await super.setInput(input, options, context, token);
            await input.resolve(options);
            if (token.isCancellationRequested || this._isDisposed) {
                return;
            }
            if (input instanceof webviewEditorInput_1.WebviewInput) {
                if (this.group) {
                    input.updateGroup(this.group.id);
                }
                if (!alreadyOwnsWebview) {
                    this.claimWebview(input);
                }
                if (this._dimension) {
                    this.layout(this._dimension);
                }
            }
        }
        claimWebview(input) {
            input.webview.claim(this, this.scopedContextKeyService);
            if (this._element) {
                this._element.setAttribute('aria-flowto', input.webview.container.id);
                DOM.setParentFlowTo(input.webview.container, this._element);
            }
            this._webviewVisibleDisposables.clear();
            // Webviews are not part of the normal editor dom, so we have to register our own drag and drop handler on them.
            this._webviewVisibleDisposables.add(this._editorDropService.createEditorDropTarget(input.webview.container, {
                containsGroup: (group) => this.group?.id === group.id
            }));
            this._webviewVisibleDisposables.add(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this.webview));
            this.synchronizeWebviewContainerDimensions(input.webview);
            this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
        }
        synchronizeWebviewContainerDimensions(webview, dimension) {
            if (!this._element?.isConnected) {
                return;
            }
            const rootContainer = this._workbenchLayoutService.getContainer("workbench.parts.editor" /* Parts.EDITOR_PART */);
            webview.layoutWebviewOverElement(this._element.parentElement, dimension, rootContainer);
        }
        trackFocus(webview) {
            const store = new lifecycle_1.DisposableStore();
            // Track focus in webview content
            const webviewContentFocusTracker = DOM.trackFocus(webview.container);
            store.add(webviewContentFocusTracker);
            store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
            // Track focus in webview element
            store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
            return store;
        }
    };
    exports.WebviewEditor = WebviewEditor;
    exports.WebviewEditor = WebviewEditor = WebviewEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, editorService_1.IEditorService),
        __param(5, layoutService_1.IWorkbenchLayoutService),
        __param(6, editorDropService_1.IEditorDropService),
        __param(7, host_1.IHostService),
        __param(8, contextkey_1.IContextKeyService)
    ], WebviewEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlYnZpZXdQYW5lbC9icm93c2VyL3dlYnZpZXdFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCaEc7O09BRUc7SUFDVSxRQUFBLCtCQUErQixHQUFHLElBQUksMEJBQWEsQ0FBUyxzQkFBc0IsRUFBRSxFQUFFLEVBQUU7UUFDcEcsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxxREFBcUQsQ0FBQztLQUMzRyxDQUFDLENBQUM7SUFFSSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsdUJBQVU7O2lCQUVyQixPQUFFLEdBQUcsZUFBZSxBQUFsQixDQUFtQjtRQVc1QyxJQUFvQixVQUFVLEtBQWlCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFJdEYsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3pCLGNBQStCLEVBQzFCLG1CQUF5QyxFQUMvQyxjQUErQyxFQUN0Qyx1QkFBaUUsRUFDdEUsa0JBQXVELEVBQzdELFlBQTJDLEVBQ3JDLGtCQUF1RDtZQUUzRSxLQUFLLENBQUMsZUFBYSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFOdkMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3JCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDckQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUM1QyxpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBcEJwRSxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pC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