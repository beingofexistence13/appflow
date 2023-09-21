/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/menu/menu", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom_1, mouseEvent_1, menu_1, actions_1, errors_1, lifecycle_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextMenuHandler = void 0;
    class ContextMenuHandler {
        constructor(contextViewService, telemetryService, notificationService, keybindingService) {
            this.contextViewService = contextViewService;
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
            this.keybindingService = keybindingService;
            this.focusToReturn = null;
            this.lastContainer = null;
            this.block = null;
            this.blockDisposable = null;
            this.options = { blockMouse: true };
        }
        configure(options) {
            this.options = options;
        }
        showContextMenu(delegate) {
            const actions = delegate.getActions();
            if (!actions.length) {
                return; // Don't render an empty context menu
            }
            this.focusToReturn = document.activeElement;
            let menu;
            const shadowRootElement = (0, dom_1.isHTMLElement)(delegate.domForShadowRoot) ? delegate.domForShadowRoot : undefined;
            this.contextViewService.showContextView({
                getAnchor: () => delegate.getAnchor(),
                canRelayout: false,
                anchorAlignment: delegate.anchorAlignment,
                anchorAxisAlignment: delegate.anchorAxisAlignment,
                render: (container) => {
                    this.lastContainer = container;
                    const className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                    if (className) {
                        container.className += ' ' + className;
                    }
                    // Render invisible div to block mouse interaction in the rest of the UI
                    if (this.options.blockMouse) {
                        this.block = container.appendChild((0, dom_1.$)('.context-view-block'));
                        this.block.style.position = 'fixed';
                        this.block.style.cursor = 'initial';
                        this.block.style.left = '0';
                        this.block.style.top = '0';
                        this.block.style.width = '100%';
                        this.block.style.height = '100%';
                        this.block.style.zIndex = '-1';
                        this.blockDisposable?.dispose();
                        this.blockDisposable = (0, dom_1.addDisposableListener)(this.block, dom_1.EventType.MOUSE_DOWN, e => e.stopPropagation());
                    }
                    const menuDisposables = new lifecycle_1.DisposableStore();
                    const actionRunner = delegate.actionRunner || new actions_1.ActionRunner();
                    actionRunner.onWillRun(evt => this.onActionRun(evt, !delegate.skipTelemetry), this, menuDisposables);
                    actionRunner.onDidRun(this.onDidActionRun, this, menuDisposables);
                    menu = new menu_1.Menu(container, actions, {
                        actionViewItemProvider: delegate.getActionViewItem,
                        context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                        actionRunner,
                        getKeyBinding: delegate.getKeyBinding ? delegate.getKeyBinding : action => this.keybindingService.lookupKeybinding(action.id)
                    }, defaultStyles_1.defaultMenuStyles);
                    menu.onDidCancel(() => this.contextViewService.hideContextView(true), null, menuDisposables);
                    menu.onDidBlur(() => this.contextViewService.hideContextView(true), null, menuDisposables);
                    menuDisposables.add((0, dom_1.addDisposableListener)(window, dom_1.EventType.BLUR, () => this.contextViewService.hideContextView(true)));
                    menuDisposables.add((0, dom_1.addDisposableListener)(window, dom_1.EventType.MOUSE_DOWN, (e) => {
                        if (e.defaultPrevented) {
                            return;
                        }
                        const event = new mouseEvent_1.StandardMouseEvent(e);
                        let element = event.target;
                        // Don't do anything as we are likely creating a context menu
                        if (event.rightButton) {
                            return;
                        }
                        while (element) {
                            if (element === container) {
                                return;
                            }
                            element = element.parentElement;
                        }
                        this.contextViewService.hideContextView(true);
                    }));
                    return (0, lifecycle_1.combinedDisposable)(menuDisposables, menu);
                },
                focus: () => {
                    menu?.focus(!!delegate.autoSelectFirstItem);
                },
                onHide: (didCancel) => {
                    delegate.onHide?.(!!didCancel);
                    if (this.block) {
                        this.block.remove();
                        this.block = null;
                    }
                    this.blockDisposable?.dispose();
                    this.blockDisposable = null;
                    if (!!this.lastContainer && ((0, dom_1.getActiveElement)() === this.lastContainer || (0, dom_1.isAncestor)((0, dom_1.getActiveElement)(), this.lastContainer))) {
                        this.focusToReturn?.focus();
                    }
                    this.lastContainer = null;
                }
            }, shadowRootElement, !!shadowRootElement);
        }
        onActionRun(e, logTelemetry) {
            if (logTelemetry) {
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'contextMenu' });
            }
            this.contextViewService.hideContextView(false);
        }
        onDidActionRun(e) {
            if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                this.notificationService.error(e.error);
            }
        }
    }
    exports.ContextMenuHandler = ContextMenuHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dE1lbnVIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29udGV4dHZpZXcvYnJvd3Nlci9jb250ZXh0TWVudUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFhLGtCQUFrQjtRQU85QixZQUNTLGtCQUF1QyxFQUN2QyxnQkFBbUMsRUFDbkMsbUJBQXlDLEVBQ3pDLGlCQUFxQztZQUhyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3ZDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDbkMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUN6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBVnRDLGtCQUFhLEdBQXVCLElBQUksQ0FBQztZQUN6QyxrQkFBYSxHQUF1QixJQUFJLENBQUM7WUFDekMsVUFBSyxHQUF1QixJQUFJLENBQUM7WUFDakMsb0JBQWUsR0FBdUIsSUFBSSxDQUFDO1lBQzNDLFlBQU8sR0FBK0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFPL0QsQ0FBQztRQUVMLFNBQVMsQ0FBQyxPQUFtQztZQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN4QixDQUFDO1FBRUQsZUFBZSxDQUFDLFFBQThCO1lBQzdDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsT0FBTyxDQUFDLHFDQUFxQzthQUM3QztZQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQTRCLENBQUM7WUFFM0QsSUFBSSxJQUFzQixDQUFDO1lBRTNCLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxtQkFBYSxFQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMzRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO2dCQUN2QyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDckMsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLGVBQWUsRUFBRSxRQUFRLENBQUMsZUFBZTtnQkFDekMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLG1CQUFtQjtnQkFFakQsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUMvQixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBRS9FLElBQUksU0FBUyxFQUFFO3dCQUNkLFNBQVMsQ0FBQyxTQUFTLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQztxQkFDdkM7b0JBRUQsd0VBQXdFO29CQUN4RSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO3dCQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBQSxPQUFDLEVBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO3dCQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO3dCQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO3dCQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO3dCQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO3dCQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO3dCQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3dCQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO3dCQUUvQixJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDO3dCQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxlQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7cUJBQ3pHO29CQUVELE1BQU0sZUFBZSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO29CQUU5QyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxJQUFJLElBQUksc0JBQVksRUFBRSxDQUFDO29CQUNqRSxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUNyRyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUNsRSxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRTt3QkFDbkMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLGlCQUFpQjt3QkFDbEQsT0FBTyxFQUFFLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7d0JBQ3pFLFlBQVk7d0JBQ1osYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7cUJBQzdILEVBQ0EsaUNBQWlCLENBQ2pCLENBQUM7b0JBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDM0YsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLE1BQU0sRUFBRSxlQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4SCxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsTUFBTSxFQUFFLGVBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTt3QkFDekYsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7NEJBQ3ZCLE9BQU87eUJBQ1A7d0JBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxPQUFPLEdBQXVCLEtBQUssQ0FBQyxNQUFNLENBQUM7d0JBRS9DLDZEQUE2RDt3QkFDN0QsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFOzRCQUN0QixPQUFPO3lCQUNQO3dCQUVELE9BQU8sT0FBTyxFQUFFOzRCQUNmLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtnQ0FDMUIsT0FBTzs2QkFDUDs0QkFFRCxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQzt5QkFDaEM7d0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFSixPQUFPLElBQUEsOEJBQWtCLEVBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUVELEtBQUssRUFBRSxHQUFHLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQzdDLENBQUM7Z0JBRUQsTUFBTSxFQUFFLENBQUMsU0FBbUIsRUFBRSxFQUFFO29CQUMvQixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUUvQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7cUJBQ2xCO29CQUVELElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUU1QixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBQSxzQkFBZ0IsR0FBRSxLQUFLLElBQUksQ0FBQyxhQUFhLElBQUksSUFBQSxnQkFBVSxFQUFDLElBQUEsc0JBQWdCLEdBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRTt3QkFDOUgsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQztxQkFDNUI7b0JBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLENBQUM7YUFDRCxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTyxXQUFXLENBQUMsQ0FBWSxFQUFFLFlBQXFCO1lBQ3RELElBQUksWUFBWSxFQUFFO2dCQUNqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQzthQUMzSztZQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVPLGNBQWMsQ0FBQyxDQUFZO1lBQ2xDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUEsNEJBQW1CLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QztRQUNGLENBQUM7S0FDRDtJQTNJRCxnREEySUMifQ==