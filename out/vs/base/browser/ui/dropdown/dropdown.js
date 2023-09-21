/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/actions", "vs/base/common/event", "vs/css!./dropdown"], function (require, exports, dom_1, keyboardEvent_1, touch_1, actions_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropdownMenu = void 0;
    class BaseDropdown extends actions_1.ActionRunner {
        constructor(container, options) {
            super();
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._element = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-dropdown'));
            this._label = (0, dom_1.append)(this._element, (0, dom_1.$)('.dropdown-label'));
            let labelRenderer = options.labelRenderer;
            if (!labelRenderer) {
                labelRenderer = (container) => {
                    container.textContent = options.label || '';
                    return null;
                };
            }
            for (const event of [dom_1.EventType.CLICK, dom_1.EventType.MOUSE_DOWN, touch_1.EventType.Tap]) {
                this._register((0, dom_1.addDisposableListener)(this.element, event, e => dom_1.EventHelper.stop(e, true))); // prevent default click behaviour to trigger
            }
            for (const event of [dom_1.EventType.MOUSE_DOWN, touch_1.EventType.Tap]) {
                this._register((0, dom_1.addDisposableListener)(this._label, event, e => {
                    if (e instanceof MouseEvent && (e.detail > 1 || e.button !== 0)) {
                        // prevent right click trigger to allow separate context menu (https://github.com/microsoft/vscode/issues/151064)
                        // prevent multiple clicks to open multiple context menus (https://github.com/microsoft/vscode/issues/41363)
                        return;
                    }
                    if (this.visible) {
                        this.hide();
                    }
                    else {
                        this.show();
                    }
                }));
            }
            this._register((0, dom_1.addDisposableListener)(this._label, dom_1.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom_1.EventHelper.stop(e, true); // https://github.com/microsoft/vscode/issues/57997
                    if (this.visible) {
                        this.hide();
                    }
                    else {
                        this.show();
                    }
                }
            }));
            const cleanupFn = labelRenderer(this._label);
            if (cleanupFn) {
                this._register(cleanupFn);
            }
            this._register(touch_1.Gesture.addTarget(this._label));
        }
        get element() {
            return this._element;
        }
        get label() {
            return this._label;
        }
        set tooltip(tooltip) {
            if (this._label) {
                this._label.title = tooltip;
            }
        }
        show() {
            if (!this.visible) {
                this.visible = true;
                this._onDidChangeVisibility.fire(true);
            }
        }
        hide() {
            if (this.visible) {
                this.visible = false;
                this._onDidChangeVisibility.fire(false);
            }
        }
        isVisible() {
            return !!this.visible;
        }
        onEvent(_e, activeElement) {
            this.hide();
        }
        dispose() {
            super.dispose();
            this.hide();
            if (this.boxContainer) {
                this.boxContainer.remove();
                this.boxContainer = undefined;
            }
            if (this.contents) {
                this.contents.remove();
                this.contents = undefined;
            }
            if (this._label) {
                this._label.remove();
                this._label = undefined;
            }
        }
    }
    class DropdownMenu extends BaseDropdown {
        constructor(container, _options) {
            super(container, _options);
            this._options = _options;
            this._actions = [];
            this.actions = _options.actions || [];
        }
        set menuOptions(options) {
            this._menuOptions = options;
        }
        get menuOptions() {
            return this._menuOptions;
        }
        get actions() {
            if (this._options.actionProvider) {
                return this._options.actionProvider.getActions();
            }
            return this._actions;
        }
        set actions(actions) {
            this._actions = actions;
        }
        show() {
            super.show();
            this.element.classList.add('active');
            this._options.contextMenuProvider.showContextMenu({
                getAnchor: () => this.element,
                getActions: () => this.actions,
                getActionsContext: () => this.menuOptions ? this.menuOptions.context : null,
                getActionViewItem: (action, options) => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action, options) : undefined,
                getKeyBinding: action => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : undefined,
                getMenuClassName: () => this._options.menuClassName || '',
                onHide: () => this.onHide(),
                actionRunner: this.menuOptions ? this.menuOptions.actionRunner : undefined,
                anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : 0 /* AnchorAlignment.LEFT */,
                domForShadowRoot: this._options.menuAsChild ? this.element : undefined,
                skipTelemetry: this._options.skipTelemetry
            });
        }
        hide() {
            super.hide();
        }
        onHide() {
            this.hide();
            this.element.classList.remove('active');
        }
    }
    exports.DropdownMenu = DropdownMenu;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcGRvd24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvZHJvcGRvd24vZHJvcGRvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxNQUFNLFlBQWEsU0FBUSxzQkFBWTtRQVV0QyxZQUFZLFNBQXNCLEVBQUUsT0FBNkI7WUFDaEUsS0FBSyxFQUFFLENBQUM7WUFKRCwyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFXLENBQUMsQ0FBQztZQUMvRCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBS2xFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUV6RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBQSxPQUFDLEVBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBRTFELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDMUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbkIsYUFBYSxHQUFHLENBQUMsU0FBc0IsRUFBc0IsRUFBRTtvQkFDOUQsU0FBUyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFFNUMsT0FBTyxJQUFJLENBQUM7Z0JBQ2IsQ0FBQyxDQUFDO2FBQ0Y7WUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLENBQUMsZUFBUyxDQUFDLEtBQUssRUFBRSxlQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNkNBQTZDO2FBQ3pJO1lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLGVBQVMsQ0FBQyxVQUFVLEVBQUUsaUJBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDNUQsSUFBSSxDQUFDLFlBQVksVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDaEUsaUhBQWlIO3dCQUNqSCw0R0FBNEc7d0JBQzVHLE9BQU87cUJBQ1A7b0JBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNqQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7cUJBQ1o7eUJBQU07d0JBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUNaO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZFLE1BQU0sS0FBSyxHQUFHLElBQUkscUNBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksS0FBSyxDQUFDLE1BQU0sdUJBQWUsSUFBSSxLQUFLLENBQUMsTUFBTSx3QkFBZSxFQUFFO29CQUMvRCxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxtREFBbUQ7b0JBRTlFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDakIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUNaO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDWjtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdDLElBQUksU0FBUyxFQUFFO2dCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDMUI7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFlO1lBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkM7UUFDRixDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDeEM7UUFDRixDQUFDO1FBRUQsU0FBUztZQUNSLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdkIsQ0FBQztRQUVTLE9BQU8sQ0FBQyxFQUFTLEVBQUUsYUFBMEI7WUFDdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUVRLE9BQU87WUFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRVosSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7YUFDMUI7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztLQUNEO0lBZUQsTUFBYSxZQUFhLFNBQVEsWUFBWTtRQUk3QyxZQUFZLFNBQXNCLEVBQW1CLFFBQThCO1lBQ2xGLEtBQUssQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFEeUIsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7WUFGM0UsYUFBUSxHQUF1QixFQUFFLENBQUM7WUFLekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUMsT0FBaUM7WUFDaEQsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBWSxPQUFPO1lBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDakQ7WUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQVksT0FBTyxDQUFDLE9BQTJCO1lBQzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFFUSxJQUFJO1lBQ1osS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDO2dCQUNqRCxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU87Z0JBQzdCLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDOUIsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQzNFLGlCQUFpQixFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDMUssYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQ2hJLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxJQUFJLEVBQUU7Z0JBQ3pELE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUMzQixZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzFFLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLDZCQUFxQjtnQkFDM0YsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQ3RFLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWE7YUFDMUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLElBQUk7WUFDWixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRU8sTUFBTTtZQUNiLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUExREQsb0NBMERDIn0=