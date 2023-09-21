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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/views", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewView/browser/webviewViewService", "vs/workbench/services/activity/common/activity", "vs/workbench/services/extensions/common/extensions"], function (require, exports, dom_1, cancellation_1, event_1, lifecycle_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, themeService_1, viewPane_1, memento_1, views_1, webview_1, webviewWindowDragMonitor_1, webviewViewService_1, activity_1, extensions_1) {
    "use strict";
    var WebviewViewPane_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewViewPane = void 0;
    const storageKeys = {
        webviewState: 'webviewState',
    };
    let WebviewViewPane = class WebviewViewPane extends viewPane_1.ViewPane {
        static { WebviewViewPane_1 = this; }
        static getOriginStore(storageService) {
            this._originStore ??= new webview_1.ExtensionKeyedWebviewOriginStore('webviewViews.origins', storageService);
            return this._originStore;
        }
        constructor(options, configurationService, contextKeyService, contextMenuService, instantiationService, keybindingService, openerService, telemetryService, themeService, viewDescriptorService, activityService, extensionService, progressService, storageService, viewService, webviewService, webviewViewService) {
            super({ ...options, titleMenuId: actions_1.MenuId.ViewTitle, showActions: viewPane_1.ViewPaneShowActions.WhenExpanded }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.activityService = activityService;
            this.extensionService = extensionService;
            this.progressService = progressService;
            this.storageService = storageService;
            this.viewService = viewService;
            this.webviewService = webviewService;
            this.webviewViewService = webviewViewService;
            this._webview = this._register(new lifecycle_1.MutableDisposable());
            this._webviewDisposables = this._register(new lifecycle_1.DisposableStore());
            this._activated = false;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this.extensionId = options.fromExtensionId;
            this.defaultTitle = this.title;
            this.memento = new memento_1.Memento(`webviewView.${this.id}`, storageService);
            this.viewState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
            this._register(this.webviewViewService.onNewResolverRegistered(e => {
                if (e.viewType === this.id) {
                    // Potentially re-activate if we have a new resolver
                    this.updateTreeVisibility();
                }
            }));
            this.updateTreeVisibility();
        }
        dispose() {
            this._onDispose.fire();
            clearTimeout(this._repositionTimeout);
            super.dispose();
        }
        focus() {
            super.focus();
            this._webview.value?.focus();
        }
        renderBody(container) {
            super.renderBody(container);
            this._container = container;
            this._rootContainer = undefined;
            if (!this._resizeObserver) {
                this._resizeObserver = new ResizeObserver(() => {
                    setTimeout(() => {
                        this.layoutWebview();
                    }, 0);
                });
                this._register((0, lifecycle_1.toDisposable)(() => {
                    this._resizeObserver.disconnect();
                }));
                this._resizeObserver.observe(container);
            }
        }
        saveState() {
            if (this._webview.value) {
                this.viewState[storageKeys.webviewState] = this._webview.value.state;
            }
            this.memento.saveMemento();
            super.saveState();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.layoutWebview(new dom_1.Dimension(width, height));
        }
        updateTreeVisibility() {
            if (this.isBodyVisible()) {
                this.activate();
                this._webview.value?.claim(this, undefined);
            }
            else {
                this._webview.value?.release(this);
            }
        }
        activate() {
            if (this._activated) {
                return;
            }
            this._activated = true;
            const origin = this.extensionId ? WebviewViewPane_1.getOriginStore(this.storageService).getOrigin(this.id, this.extensionId) : undefined;
            const webview = this.webviewService.createWebviewOverlay({
                origin,
                providedViewType: this.id,
                title: this.title,
                options: { purpose: "webviewView" /* WebviewContentPurpose.WebviewView */ },
                contentOptions: {},
                extension: this.extensionId ? { id: this.extensionId } : undefined
            });
            webview.state = this.viewState[storageKeys.webviewState];
            this._webview.value = webview;
            if (this._container) {
                this.layoutWebview();
            }
            this._webviewDisposables.add((0, lifecycle_1.toDisposable)(() => {
                this._webview.value?.release(this);
            }));
            this._webviewDisposables.add(webview.onDidUpdateState(() => {
                this.viewState[storageKeys.webviewState] = webview.state;
            }));
            // Re-dispatch all drag events back to the drop target to support view drag drop
            for (const event of [dom_1.EventType.DRAG, dom_1.EventType.DRAG_END, dom_1.EventType.DRAG_ENTER, dom_1.EventType.DRAG_LEAVE, dom_1.EventType.DRAG_START]) {
                this._webviewDisposables.add((0, dom_1.addDisposableListener)(this._webview.value.container, event, e => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.dropTargetElement.dispatchEvent(new DragEvent(e.type, e));
                }));
            }
            this._webviewDisposables.add(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this._webview.value));
            const source = this._webviewDisposables.add(new cancellation_1.CancellationTokenSource());
            this.withProgress(async () => {
                await this.extensionService.activateByEvent(`onView:${this.id}`);
                const self = this;
                const webviewView = {
                    webview,
                    onDidChangeVisibility: this.onDidChangeBodyVisibility,
                    onDispose: this.onDispose,
                    get title() { return self.setTitle; },
                    set title(value) { self.updateTitle(value); },
                    get description() { return self.titleDescription; },
                    set description(value) { self.updateTitleDescription(value); },
                    get badge() { return self.badge; },
                    set badge(badge) { self.updateBadge(badge); },
                    dispose: () => {
                        // Only reset and clear the webview itself. Don't dispose of the view container
                        this._activated = false;
                        this._webview.clear();
                        this._webviewDisposables.clear();
                    },
                    show: (preserveFocus) => {
                        this.viewService.openView(this.id, !preserveFocus);
                    }
                };
                await this.webviewViewService.resolve(this.id, webviewView, source.token);
            });
        }
        updateTitle(value) {
            this.setTitle = value;
            super.updateTitle(typeof value === 'string' ? value : this.defaultTitle);
        }
        updateBadge(badge) {
            if (this.badge?.value === badge?.value &&
                this.badge?.tooltip === badge?.tooltip) {
                return;
            }
            if (this.activity) {
                this.activity.dispose();
                this.activity = undefined;
            }
            this.badge = badge;
            if (badge) {
                const activity = {
                    badge: new activity_1.NumberBadge(badge.value, () => badge.tooltip),
                    priority: 150
                };
                this.activityService.showViewActivity(this.id, activity);
            }
        }
        async withProgress(task) {
            return this.progressService.withProgress({ location: this.id, delay: 500 }, task);
        }
        onDidScrollRoot() {
            this.layoutWebview();
        }
        doLayoutWebview(dimension) {
            const webviewEntry = this._webview.value;
            if (!this._container || !webviewEntry) {
                return;
            }
            if (!this._rootContainer || !this._rootContainer.isConnected) {
                this._rootContainer = this.findRootContainer(this._container);
            }
            webviewEntry.layoutWebviewOverElement(this._container, dimension, this._rootContainer);
        }
        layoutWebview(dimension) {
            this.doLayoutWebview(dimension);
            // Temporary fix for https://github.com/microsoft/vscode/issues/110450
            // There is an animation that lasts about 200ms, update the webview positioning once this animation is complete.
            clearTimeout(this._repositionTimeout);
            this._repositionTimeout = setTimeout(() => this.doLayoutWebview(dimension), 200);
        }
        findRootContainer(container) {
            return (0, dom_1.findParentWithClass)(container, 'monaco-scrollable-element') ?? undefined;
        }
    };
    exports.WebviewViewPane = WebviewViewPane;
    exports.WebviewViewPane = WebviewViewPane = WebviewViewPane_1 = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, opener_1.IOpenerService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, themeService_1.IThemeService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, activity_1.IActivityService),
        __param(11, extensions_1.IExtensionService),
        __param(12, progress_1.IProgressService),
        __param(13, storage_1.IStorageService),
        __param(14, views_1.IViewsService),
        __param(15, webview_1.IWebviewService),
        __param(16, webviewViewService_1.IWebviewViewService)
    ], WebviewViewPane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1ZpZXdQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1ZpZXcvYnJvd3Nlci93ZWJ2aWV3Vmlld1BhbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCaEcsTUFBTSxXQUFXLEdBQUc7UUFDbkIsWUFBWSxFQUFFLGNBQWM7S0FDbkIsQ0FBQztJQUVKLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsbUJBQVE7O1FBSXBDLE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBK0I7WUFDNUQsSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLDBDQUFnQyxDQUFDLHNCQUFzQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ25HLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBc0JELFlBQ0MsT0FBNEIsRUFDTCxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQzFCLGdCQUFtQyxFQUN2QyxZQUEyQixFQUNsQixxQkFBNkMsRUFDbkQsZUFBa0QsRUFDakQsZ0JBQW9ELEVBQ3JELGVBQWtELEVBQ25ELGNBQWdELEVBQ2xELFdBQTJDLEVBQ3pDLGNBQWdELEVBQzVDLGtCQUF3RDtZQUU3RSxLQUFLLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxXQUFXLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLDhCQUFtQixDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQVI3TyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbEMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2pDLGdCQUFXLEdBQVgsV0FBVyxDQUFlO1lBQ3hCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBckM3RCxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFtQixDQUFDLENBQUM7WUFDcEUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLGVBQVUsR0FBRyxLQUFLLENBQUM7WUF3RFYsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDeEUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUVsRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDekQsY0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBdEIxQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRS9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLGVBQWUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLCtEQUErQyxDQUFDO1lBRXhGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVsRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbEUsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQzNCLG9EQUFvRDtvQkFDcEQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7aUJBQzVCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFRUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUV2QixZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFUSxLQUFLO1lBQ2IsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVrQixVQUFVLENBQUMsU0FBc0I7WUFDbkQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU1QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztZQUVoQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxHQUFHLEVBQUU7b0JBQzlDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUN0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO29CQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3hDO1FBQ0YsQ0FBQztRQUVlLFNBQVM7WUFDeEIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMzQixLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUVrQixVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7WUFDMUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGVBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO2dCQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25DO1FBQ0YsQ0FBQztRQUVPLFFBQVE7WUFDZixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGlCQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN2SSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDO2dCQUN4RCxNQUFNO2dCQUNOLGdCQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRSxFQUFFLE9BQU8sdURBQW1DLEVBQUU7Z0JBQ3ZELGNBQWMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQ2xFLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1lBRTlCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3JCO1lBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUMxRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosZ0ZBQWdGO1lBQ2hGLEtBQUssTUFBTSxLQUFLLElBQUksQ0FBQyxlQUFTLENBQUMsSUFBSSxFQUFFLGVBQVMsQ0FBQyxRQUFRLEVBQUUsZUFBUyxDQUFDLFVBQVUsRUFBRSxlQUFTLENBQUMsVUFBVSxFQUFFLGVBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDM0gsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQzdGLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUM7b0JBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksbURBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDLENBQUM7WUFFM0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDNUIsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWpFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDbEIsTUFBTSxXQUFXLEdBQWdCO29CQUNoQyxPQUFPO29CQUNQLHFCQUFxQixFQUFFLElBQUksQ0FBQyx5QkFBeUI7b0JBQ3JELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFFekIsSUFBSSxLQUFLLEtBQXlCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELElBQUksS0FBSyxDQUFDLEtBQXlCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWpFLElBQUksV0FBVyxLQUF5QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZFLElBQUksV0FBVyxDQUFDLEtBQXlCLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFbEYsSUFBSSxLQUFLLEtBQTZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzFELElBQUksS0FBSyxDQUFDLEtBQTZCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXJFLE9BQU8sRUFBRSxHQUFHLEVBQUU7d0JBQ2IsK0VBQStFO3dCQUMvRSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQyxDQUFDO29CQUVELElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFO3dCQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3BELENBQUM7aUJBQ0QsQ0FBQztnQkFFRixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVrQixXQUFXLENBQUMsS0FBeUI7WUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFUyxXQUFXLENBQUMsS0FBNkI7WUFFbEQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxLQUFLLEVBQUUsS0FBSztnQkFDckMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssS0FBSyxFQUFFLE9BQU8sRUFBRTtnQkFDeEMsT0FBTzthQUNQO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQzthQUMxQjtZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sUUFBUSxHQUFHO29CQUNoQixLQUFLLEVBQUUsSUFBSSxzQkFBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztvQkFDeEQsUUFBUSxFQUFFLEdBQUc7aUJBQ2IsQ0FBQztnQkFDRixJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDekQ7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUF5QjtZQUNuRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFFUSxlQUFlO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU8sZUFBZSxDQUFDLFNBQXFCO1lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDOUQ7WUFFRCxZQUFZLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFTyxhQUFhLENBQUMsU0FBcUI7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoQyxzRUFBc0U7WUFDdEUsZ0hBQWdIO1lBQ2hILFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVPLGlCQUFpQixDQUFDLFNBQXNCO1lBQy9DLE9BQU8sSUFBQSx5QkFBbUIsRUFBQyxTQUFTLEVBQUUsMkJBQTJCLENBQUMsSUFBSSxTQUFTLENBQUM7UUFDakYsQ0FBQztLQUNELENBQUE7SUEzUVksMENBQWU7OEJBQWYsZUFBZTtRQStCekIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSw4QkFBc0IsQ0FBQTtRQUN0QixZQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFlBQUEsOEJBQWlCLENBQUE7UUFDakIsWUFBQSwyQkFBZ0IsQ0FBQTtRQUNoQixZQUFBLHlCQUFlLENBQUE7UUFDZixZQUFBLHFCQUFhLENBQUE7UUFDYixZQUFBLHlCQUFlLENBQUE7UUFDZixZQUFBLHdDQUFtQixDQUFBO09BOUNULGVBQWUsQ0EyUTNCIn0=