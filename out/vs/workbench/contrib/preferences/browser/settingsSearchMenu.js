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
define(["require", "exports", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/preferences/common/preferences"], function (require, exports, dropdownActionViewItem_1, suggestController_1, nls_1, contextView_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsSearchFilterDropdownMenuActionViewItem = void 0;
    let SettingsSearchFilterDropdownMenuActionViewItem = class SettingsSearchFilterDropdownMenuActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, actionRunner, searchWidget, contextMenuService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                menuAsChild: true
            });
            this.searchWidget = searchWidget;
            this.suggestController = suggestController_1.SuggestController.get(this.searchWidget.inputWidget);
        }
        render(container) {
            super.render(container);
        }
        doSearchWidgetAction(queryToAppend, triggerSuggest) {
            this.searchWidget.setValue(this.searchWidget.getValue().trimEnd() + ' ' + queryToAppend);
            this.searchWidget.focus();
            if (triggerSuggest && this.suggestController) {
                this.suggestController.triggerSuggest();
            }
        }
        /**
         * The created action appends a query to the search widget search string. It optionally triggers suggestions.
         */
        createAction(id, label, tooltip, queryToAppend, triggerSuggest) {
            return {
                id,
                label,
                tooltip,
                class: undefined,
                enabled: true,
                checked: false,
                run: () => { this.doSearchWidgetAction(queryToAppend, triggerSuggest); }
            };
        }
        /**
         * The created action appends a query to the search widget search string, if the query does not exist.
         * Otherwise, it removes the query from the search widget search string.
         * The action does not trigger suggestions after adding or removing the query.
         */
        createToggleAction(id, label, tooltip, queryToAppend) {
            const splitCurrentQuery = this.searchWidget.getValue().split(' ');
            const queryContainsQueryToAppend = splitCurrentQuery.includes(queryToAppend);
            return {
                id,
                label,
                tooltip,
                class: undefined,
                enabled: true,
                checked: queryContainsQueryToAppend,
                run: () => {
                    if (!queryContainsQueryToAppend) {
                        const trimmedCurrentQuery = this.searchWidget.getValue().trimEnd();
                        const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + ' ' + queryToAppend : queryToAppend;
                        this.searchWidget.setValue(newQuery);
                    }
                    else {
                        const queryWithRemovedTags = this.searchWidget.getValue().split(' ')
                            .filter(word => word !== queryToAppend).join(' ');
                        this.searchWidget.setValue(queryWithRemovedTags);
                    }
                    this.searchWidget.focus();
                }
            };
        }
        getActions() {
            return [
                this.createToggleAction('modifiedSettingsSearch', (0, nls_1.localize)('modifiedSettingsSearch', "Modified"), (0, nls_1.localize)('modifiedSettingsSearchTooltip', "Add or remove modified settings filter"), `@${preferences_1.MODIFIED_SETTING_TAG}`),
                this.createAction('extSettingsSearch', (0, nls_1.localize)('extSettingsSearch', "Extension ID..."), (0, nls_1.localize)('extSettingsSearchTooltip', "Add extension ID filter"), `@${preferences_1.EXTENSION_SETTING_TAG}`, true),
                this.createAction('featuresSettingsSearch', (0, nls_1.localize)('featureSettingsSearch', "Feature..."), (0, nls_1.localize)('featureSettingsSearchTooltip', "Add feature filter"), `@${preferences_1.FEATURE_SETTING_TAG}`, true),
                this.createAction('tagSettingsSearch', (0, nls_1.localize)('tagSettingsSearch', "Tag..."), (0, nls_1.localize)('tagSettingsSearchTooltip', "Add tag filter"), `@${preferences_1.GENERAL_TAG_SETTING_TAG}`, true),
                this.createAction('langSettingsSearch', (0, nls_1.localize)('langSettingsSearch', "Language..."), (0, nls_1.localize)('langSettingsSearchTooltip', "Add language ID filter"), `@${preferences_1.LANGUAGE_SETTING_TAG}`, true),
                this.createToggleAction('onlineSettingsSearch', (0, nls_1.localize)('onlineSettingsSearch', "Online services"), (0, nls_1.localize)('onlineSettingsSearchTooltip', "Show settings for online services"), '@tag:usesOnlineServices'),
                this.createToggleAction('policySettingsSearch', (0, nls_1.localize)('policySettingsSearch', "Policy services"), (0, nls_1.localize)('policySettingsSearchTooltip', "Show settings for policy services"), `@${preferences_1.POLICY_SETTING_TAG}`)
            ];
        }
    };
    exports.SettingsSearchFilterDropdownMenuActionViewItem = SettingsSearchFilterDropdownMenuActionViewItem;
    exports.SettingsSearchFilterDropdownMenuActionViewItem = SettingsSearchFilterDropdownMenuActionViewItem = __decorate([
        __param(3, contextView_1.IContextMenuService)
    ], SettingsSearchFilterDropdownMenuActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NTZWFyY2hNZW51LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9zZXR0aW5nc1NlYXJjaE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0sOENBQThDLEdBQXBELE1BQU0sOENBQStDLFNBQVEsbURBQTBCO1FBRzdGLFlBQ0MsTUFBZSxFQUNmLFlBQXVDLEVBQ3RCLFlBQWlDLEVBQzdCLGtCQUF1QztZQUU1RCxLQUFLLENBQUMsTUFBTSxFQUNYLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUN2QyxrQkFBa0IsRUFDbEI7Z0JBQ0MsWUFBWTtnQkFDWixVQUFVLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JBQ3hCLHVCQUF1QixFQUFFLEdBQUcsRUFBRSw4QkFBc0I7Z0JBQ3BELFdBQVcsRUFBRSxJQUFJO2FBQ2pCLENBQ0QsQ0FBQztZQVplLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtZQWNsRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcscUNBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVRLE1BQU0sQ0FBQyxTQUFzQjtZQUNyQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxhQUFxQixFQUFFLGNBQXVCO1lBQzFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxZQUFZLENBQUMs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