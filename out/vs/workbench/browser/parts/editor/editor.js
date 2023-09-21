/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/types"], function (require, exports, dom_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fillActiveEditorViewState = exports.getEditorPartOptions = exports.impactsEditorPartOptions = exports.DEFAULT_EDITOR_PART_OPTIONS = exports.DEFAULT_EDITOR_MAX_DIMENSIONS = exports.DEFAULT_EDITOR_MIN_DIMENSIONS = void 0;
    exports.DEFAULT_EDITOR_MIN_DIMENSIONS = new dom_1.Dimension(220, 70);
    exports.DEFAULT_EDITOR_MAX_DIMENSIONS = new dom_1.Dimension(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    exports.DEFAULT_EDITOR_PART_OPTIONS = {
        showTabs: true,
        highlightModifiedTabs: false,
        tabCloseButton: 'right',
        tabSizing: 'fit',
        tabSizingFixedMinWidth: 50,
        tabSizingFixedMaxWidth: 160,
        pinnedTabSizing: 'normal',
        tabHeight: 'normal',
        preventPinnedEditorClose: 'keyboardAndMouse',
        titleScrollbarSizing: 'default',
        focusRecentEditorAfterClose: true,
        showIcons: true,
        hasIcons: true,
        enablePreview: true,
        openPositioning: 'right',
        openSideBySideDirection: 'right',
        closeEmptyGroups: true,
        labelFormat: 'default',
        splitSizing: 'auto',
        splitOnDragAndDrop: true,
        centeredLayoutFixedWidth: false,
        doubleClickTabToToggleEditorGroupSizes: true,
    };
    function impactsEditorPartOptions(event) {
        return event.affectsConfiguration('workbench.editor') || event.affectsConfiguration('workbench.iconTheme');
    }
    exports.impactsEditorPartOptions = impactsEditorPartOptions;
    function getEditorPartOptions(configurationService, themeService) {
        const options = {
            ...exports.DEFAULT_EDITOR_PART_OPTIONS,
            hasIcons: themeService.getFileIconTheme().hasFileIcons
        };
        const config = configurationService.getValue();
        if (config?.workbench?.editor) {
            // Assign all primitive configuration over
            Object.assign(options, config.workbench.editor);
            // Special handle array types and convert to Set
            if ((0, types_1.isObject)(config.workbench.editor.autoLockGroups)) {
                options.autoLockGroups = new Set();
                for (const [editorId, enablement] of Object.entries(config.workbench.editor.autoLockGroups)) {
                    if (enablement === true) {
                        options.autoLockGroups.add(editorId);
                    }
                }
            }
            else {
                options.autoLockGroups = undefined;
            }
        }
        return options;
    }
    exports.getEditorPartOptions = getEditorPartOptions;
    function fillActiveEditorViewState(group, expectedActiveEditor, presetOptions) {
        if (!expectedActiveEditor || !group.activeEditor || expectedActiveEditor.matches(group.activeEditor)) {
            const options = {
                ...presetOptions,
                viewState: group.activeEditorPane?.getViewState()
            };
            return options;
        }
        return presetOptions || Object.create(null);
    }
    exports.fillActiveEditorViewState = fillActiveEditorViewState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQm5GLFFBQUEsNkJBQTZCLEdBQUcsSUFBSSxlQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELFFBQUEsNkJBQTZCLEdBQUcsSUFBSSxlQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRWxHLFFBQUEsMkJBQTJCLEdBQXVCO1FBQzlELFFBQVEsRUFBRSxJQUFJO1FBQ2QscUJBQXFCLEVBQUUsS0FBSztRQUM1QixjQUFjLEVBQUUsT0FBTztRQUN2QixTQUFTLEVBQUUsS0FBSztRQUNoQixzQkFBc0IsRUFBRSxFQUFFO1FBQzFCLHNCQUFzQixFQUFFLEdBQUc7UUFDM0IsZUFBZSxFQUFFLFFBQVE7UUFDekIsU0FBUyxFQUFFLFFBQVE7UUFDbkIsd0JBQXdCLEVBQUUsa0JBQWtCO1FBQzVDLG9CQUFvQixFQUFFLFNBQVM7UUFDL0IsMkJBQTJCLEVBQUUsSUFBSTtRQUNqQyxTQUFTLEVBQUUsSUFBSTtRQUNmLFFBQVEsRUFBRSxJQUFJO1FBQ2QsYUFBYSxFQUFFLElBQUk7UUFDbkIsZUFBZSxFQUFFLE9BQU87UUFDeEIsdUJBQXVCLEVBQUUsT0FBTztRQUNoQyxnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLFdBQVcsRUFBRSxTQUFTO1FBQ3RCLFdBQVcsRUFBRSxNQUFNO1FBQ25CLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsd0JBQXdCLEVBQUUsS0FBSztRQUMvQixzQ0FBc0MsRUFBRSxJQUFJO0tBQzVDLENBQUM7SUFFRixTQUFnQix3QkFBd0IsQ0FBQyxLQUFnQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzVHLENBQUM7SUFGRCw0REFFQztJQUVELFNBQWdCLG9CQUFvQixDQUFDLG9CQUEyQyxFQUFFLFlBQTJCO1FBQzVHLE1BQU0sT0FBTyxHQUFHO1lBQ2YsR0FBRyxtQ0FBMkI7WUFDOUIsUUFBUSxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVk7U0FDdEQsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBaUMsQ0FBQztRQUM5RSxJQUFJLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO1lBRTlCLDBDQUEwQztZQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhELGdEQUFnRDtZQUNoRCxJQUFJLElBQUEsZ0JBQVEsRUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDckQsT0FBTyxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUVuQyxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDNUYsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO3dCQUN4QixPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDckM7aUJBQ0Q7YUFDRDtpQkFBTTtnQkFDTixPQUFPLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQzthQUNuQztTQUNEO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQTNCRCxvREEyQkM7SUF1RUQsU0FBZ0IseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxvQkFBa0MsRUFBRSxhQUE4QjtRQUNoSSxJQUFJLENBQUMsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDckcsTUFBTSxPQUFPLEdBQW1CO2dCQUMvQixHQUFHLGFBQWE7Z0JBQ2hCLFNBQVMsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFO2FBQ2pELENBQUM7WUFFRixPQUFPLE9BQU8sQ0FBQztTQUNmO1FBRUQsT0FBTyxhQUFhLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBWEQsOERBV0MifQ==