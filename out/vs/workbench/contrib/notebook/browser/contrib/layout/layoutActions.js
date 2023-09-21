/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, actions_1, configuration_1, coreActions_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleCellToolbarPositionAction = void 0;
    const TOGGLE_CELL_TOOLBAR_POSITION = 'notebook.toggleCellToolbarPosition';
    class ToggleCellToolbarPositionAction extends actions_1.Action2 {
        constructor() {
            super({
                id: TOGGLE_CELL_TOOLBAR_POSITION,
                title: { value: (0, nls_1.localize)('notebook.toggleCellToolbarPosition', "Toggle Cell Toolbar Position"), original: 'Toggle Cell Toolbar Position' },
                menu: [{
                        id: actions_1.MenuId.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: false
            });
        }
        async run(accessor, context) {
            const editor = context && context.ui ? context.notebookEditor : undefined;
            if (editor && editor.hasModel()) {
                // from toolbar
                const viewType = editor.textModel.viewType;
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const toolbarPosition = configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarLocation);
                const newConfig = this.togglePosition(viewType, toolbarPosition);
                await configurationService.updateValue(notebookCommon_1.NotebookSetting.cellToolbarLocation, newConfig);
            }
        }
        togglePosition(viewType, toolbarPosition) {
            if (typeof toolbarPosition === 'string') {
                // legacy
                if (['left', 'right', 'hidden'].indexOf(toolbarPosition) >= 0) {
                    // valid position
                    const newViewValue = toolbarPosition === 'right' ? 'left' : 'right';
                    const config = {
                        default: toolbarPosition
                    };
                    config[viewType] = newViewValue;
                    return config;
                }
                else {
                    // invalid position
                    const config = {
                        default: 'right',
                    };
                    config[viewType] = 'left';
                    return config;
                }
            }
            else {
                const oldValue = toolbarPosition[viewType] ?? toolbarPosition['default'] ?? 'right';
                const newViewValue = oldValue === 'right' ? 'left' : 'right';
                const newConfig = {
                    ...toolbarPosition
                };
                newConfig[viewType] = newViewValue;
                return newConfig;
            }
        }
    }
    exports.ToggleCellToolbarPositionAction = ToggleCellToolbarPositionAction;
    (0, actions_1.registerAction2)(ToggleCellToolbarPositionAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9sYXlvdXQvbGF5b3V0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBTSw0QkFBNEIsR0FBRyxvQ0FBb0MsQ0FBQztJQUUxRSxNQUFhLCtCQUFnQyxTQUFRLGlCQUFPO1FBQzNEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ2hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQ0FBb0MsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw4QkFBOEIsRUFBRTtnQkFDMUksSUFBSSxFQUFFLENBQUM7d0JBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsaUJBQWlCO3dCQUM1QixLQUFLLEVBQUUsTUFBTTt3QkFDYixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2dCQUNGLFFBQVEsRUFBRSx1Q0FBeUI7Z0JBQ25DLEVBQUUsRUFBRSxLQUFLO2FBQ1QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxPQUFZO1lBQ2pELE1BQU0sTUFBTSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxPQUFrQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3RHLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDaEMsZUFBZTtnQkFDZixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztnQkFDM0MsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBcUMsZ0NBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUMvSCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDakUsTUFBTSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsZ0NBQWUsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUN2RjtRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsUUFBZ0IsRUFBRSxlQUFtRDtZQUNuRixJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsRUFBRTtnQkFDeEMsU0FBUztnQkFDVCxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM5RCxpQkFBaUI7b0JBQ2pCLE1BQU0sWUFBWSxHQUFHLGVBQWUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNwRSxNQUFNLE1BQU0sR0FBOEI7d0JBQ3pDLE9BQU8sRUFBRSxlQUFlO3FCQUN4QixDQUFDO29CQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxZQUFZLENBQUM7b0JBQ2hDLE9BQU8sTUFBTSxDQUFDO2lCQUNkO3FCQUFNO29CQUNOLG1CQUFtQjtvQkFDbkIsTUFBTSxNQUFNLEdBQThCO3dCQUN6QyxPQUFPLEVBQUUsT0FBTztxQkFDaEIsQ0FBQztvQkFDRixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO29CQUMxQixPQUFPLE1BQU0sQ0FBQztpQkFDZDthQUNEO2lCQUFNO2dCQUNOLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDO2dCQUNwRixNQUFNLFlBQVksR0FBRyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDN0QsTUFBTSxTQUFTLEdBQUc7b0JBQ2pCLEdBQUcsZUFBZTtpQkFDbEIsQ0FBQztnQkFDRixTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsWUFBWSxDQUFDO2dCQUNuQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtRQUVGLENBQUM7S0FDRDtJQXpERCwwRUF5REM7SUFDRCxJQUFBLHlCQUFlLEVBQUMsK0JBQStCLENBQUMsQ0FBQyJ9