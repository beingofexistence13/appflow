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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, actions_1, lifecycle_1, platform_1, editorExtensions_1, actions_2, contextkey_1, contextView_1, instantiation_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorLineNumberContextMenu = exports.GutterActionsRegistry = exports.GutterActionsRegistryImpl = void 0;
    class GutterActionsRegistryImpl {
        constructor() {
            this._registeredGutterActionsGenerators = new Set();
        }
        /**
         *
         * This exists solely to allow the debug and test contributions to add actions to the gutter context menu
         * which cannot be trivially expressed using when clauses and therefore cannot be statically registered.
         * If you want an action to show up in the gutter context menu, you should generally use MenuId.EditorLineNumberMenu instead.
         */
        registerGutterActionsGenerator(gutterActionsGenerator) {
            this._registeredGutterActionsGenerators.add(gutterActionsGenerator);
            return {
                dispose: () => {
                    this._registeredGutterActionsGenerators.delete(gutterActionsGenerator);
                }
            };
        }
        getGutterActionsGenerators() {
            return Array.from(this._registeredGutterActionsGenerators.values());
        }
    }
    exports.GutterActionsRegistryImpl = GutterActionsRegistryImpl;
    platform_2.Registry.add('gutterActionsRegistry', new GutterActionsRegistryImpl());
    exports.GutterActionsRegistry = platform_2.Registry.as('gutterActionsRegistry');
    let EditorLineNumberContextMenu = class EditorLineNumberContextMenu extends lifecycle_1.Disposable {
        static { this.ID = 'workbench.contrib.editorLineNumberContextMenu'; }
        constructor(editor, contextMenuService, menuService, contextKeyService, instantiationService) {
            super();
            this.editor = editor;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this._register(this.editor.onMouseDown((e) => this.doShow(e, false)));
        }
        show(e) {
            this.doShow(e, true);
        }
        doShow(e, force) {
            const model = this.editor.getModel();
            // on macOS ctrl+click is interpreted as right click
            if (!e.event.rightButton && !(platform_1.isMacintosh && e.event.leftButton && e.event.ctrlKey) && !force
                || e.target.type !== 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ && e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                || !e.target.position || !model) {
                return;
            }
            const lineNumber = e.target.position.lineNumber;
            const contextKeyService = this.contextKeyService.createOverlay([['editorLineNumber', lineNumber]]);
            const menu = this.menuService.createMenu(actions_2.MenuId.EditorLineNumberContext, contextKeyService);
            const allActions = [];
            this.instantiationService.invokeFunction(accessor => {
                for (const generator of exports.GutterActionsRegistry.getGutterActionsGenerators()) {
                    const collectedActions = new Map();
                    generator({ lineNumber, editor: this.editor, accessor }, {
                        push: (action, group = 'navigation') => {
                            const actions = (collectedActions.get(group) ?? []);
                            actions.push(action);
                            collectedActions.set(group, actions);
                        }
                    });
                    for (const [group, actions] of collectedActions.entries()) {
                        allActions.push([group, actions]);
                    }
                }
                allActions.sort((a, b) => a[0].localeCompare(b[0]));
                const menuActions = menu.getActions({ arg: { lineNumber, uri: model.uri }, shouldForwardArgs: true });
                allActions.push(...menuActions);
                // if the current editor selections do not contain the target line number,
                // set the selection to the clicked line number
                if (e.target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */) {
                    const currentSelections = this.editor.getSelections();
                    const lineRange = {
                        startLineNumber: lineNumber,
                        endLineNumber: lineNumber,
                        startColumn: 1,
                        endColumn: model.getLineLength(lineNumber) + 1
                    };
                    const containsSelection = currentSelections?.some(selection => !selection.isEmpty() && selection.intersectRanges(lineRange) !== null);
                    if (!containsSelection) {
                        this.editor.setSelection(lineRange, "api" /* TextEditorSelectionSource.PROGRAMMATIC */);
                    }
                }
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.event,
                    getActions: () => actions_1.Separator.join(...allActions.map((a) => a[1])),
                    onHide: () => menu.dispose(),
                });
            });
        }
    };
    exports.EditorLineNumberContextMenu = EditorLineNumberContextMenu;
    exports.EditorLineNumberContextMenu = EditorLineNumberContextMenu = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, actions_2.IMenuService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService)
    ], EditorLineNumberContextMenu);
    (0, editorExtensions_1.registerEditorContribution)(EditorLineNumberContextMenu.ID, EditorLineNumberContextMenu, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yTGluZU51bWJlck1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvZWRpdG9yTGluZU51bWJlck1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyxNQUFhLHlCQUF5QjtRQUF0QztZQUNTLHVDQUFrQyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBb0J0RixDQUFDO1FBbEJBOzs7OztXQUtHO1FBQ0ksOEJBQThCLENBQUMsc0JBQStDO1lBQ3BGLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNwRSxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN4RSxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFTSwwQkFBMEI7WUFDaEMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDRDtJQXJCRCw4REFxQkM7SUFFRCxtQkFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLHlCQUF5QixFQUFFLENBQUMsQ0FBQztJQUMxRCxRQUFBLHFCQUFxQixHQUE4QixtQkFBUSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRTlGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7aUJBQzFDLE9BQUUsR0FBRywrQ0FBK0MsQUFBbEQsQ0FBbUQ7UUFFckUsWUFDa0IsTUFBbUIsRUFDRSxrQkFBdUMsRUFDOUMsV0FBeUIsRUFDbkIsaUJBQXFDLEVBQ2xDLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQU5TLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDRSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUluRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBb0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFGLENBQUM7UUFFTSxJQUFJLENBQUMsQ0FBb0I7WUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUVPLE1BQU0sQ0FBQyxDQUFvQixFQUFFLEtBQWM7WUFDbEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVyQyxvREFBb0Q7WUFDcEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxzQkFBVyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO21CQUN6RixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksZ0RBQXdDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdEQUF3QzttQkFDOUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFDOUI7Z0JBQ0QsT0FBTzthQUNQO1lBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBRWhELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGdCQUFNLENBQUMsdUJBQXVCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUU1RixNQUFNLFVBQVUsR0FBaUUsRUFBRSxDQUFDO1lBRXBGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ25ELEtBQUssTUFBTSxTQUFTLElBQUksNkJBQXFCLENBQUMsMEJBQTBCLEVBQUUsRUFBRTtvQkFDM0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztvQkFDdEQsU0FBUyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFO3dCQUN4RCxJQUFJLEVBQUUsQ0FBQyxNQUFlLEVBQUUsUUFBZ0IsWUFBWSxFQUFFLEVBQUU7NEJBQ3ZELE1BQU0sT0FBTyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOzRCQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNyQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN0QyxDQUFDO3FCQUNELENBQUMsQ0FBQztvQkFDSCxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQzFELFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztxQkFDbEM7aUJBQ0Q7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztnQkFFaEMsMEVBQTBFO2dCQUMxRSwrQ0FBK0M7Z0JBQy9DLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdEQUF3QyxFQUFFO29CQUMxRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3RELE1BQU0sU0FBUyxHQUFHO3dCQUNqQixlQUFlLEVBQUUsVUFBVTt3QkFDM0IsYUFBYSxFQUFFLFVBQVU7d0JBQ3pCLFdBQVcsRUFBRSxDQUFDO3dCQUNkLFNBQVMsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7cUJBQzlDLENBQUM7b0JBQ0YsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO29CQUN0SSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMscURBQXlDLENBQUM7cUJBQzVFO2lCQUNEO2dCQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7b0JBQ3ZDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSztvQkFDeEIsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLG1CQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2lCQUM1QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBaEZXLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBS3JDLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxzQkFBWSxDQUFBO1FBQ1osV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO09BUlgsMkJBQTJCLENBaUZ2QztJQUVELElBQUEsNkNBQTBCLEVBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFFLDJCQUEyQiwyREFBbUQsQ0FBQyJ9