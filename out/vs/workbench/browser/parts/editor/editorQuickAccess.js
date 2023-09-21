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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/getIconClasses", "vs/base/common/fuzzyScorer", "vs/base/common/codicons", "vs/base/common/themables", "vs/css!./media/editorquickaccess"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, editorGroupsService_1, editor_1, editorService_1, model_1, language_1, getIconClasses_1, fuzzyScorer_1, codicons_1, themables_1) {
    "use strict";
    var ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1, AllEditorsByAppearanceQuickAccess_1, AllEditorsByMostRecentlyUsedQuickAccess_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AllEditorsByMostRecentlyUsedQuickAccess = exports.AllEditorsByAppearanceQuickAccess = exports.ActiveGroupEditorsByMostRecentlyUsedQuickAccess = exports.BaseEditorQuickAccessProvider = void 0;
    let BaseEditorQuickAccessProvider = class BaseEditorQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        constructor(prefix, editorGroupService, editorService, modelService, languageService) {
            super(prefix, {
                canAcceptInBackground: true,
                noResultsPick: {
                    label: (0, nls_1.localize)('noViewResults', "No matching editors"),
                    groupId: -1
                }
            });
            this.editorGroupService = editorGroupService;
            this.editorService = editorService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.pickState = new class {
                constructor() {
                    this.scorerCache = Object.create(null);
                    this.isQuickNavigating = undefined;
                }
                reset(isQuickNavigating) {
                    // Caches
                    if (!isQuickNavigating) {
                        this.scorerCache = Object.create(null);
                    }
                    // Other
                    this.isQuickNavigating = isQuickNavigating;
                }
            };
        }
        provide(picker, token) {
            // Reset the pick state for this run
            this.pickState.reset(!!picker.quickNavigate);
            // Start picker
            return super.provide(picker, token);
        }
        _getPicks(filter) {
            const query = (0, fuzzyScorer_1.prepareQuery)(filter);
            // Filtering
            const filteredEditorEntries = this.doGetEditorPickItems().filter(entry => {
                if (!query.normalized) {
                    return true;
                }
                // Score on label and description
                const itemScore = (0, fuzzyScorer_1.scoreItemFuzzy)(entry, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache);
                if (!itemScore.score) {
                    return false;
                }
                // Apply highlights
                entry.highlights = { label: itemScore.labelMatch, description: itemScore.descriptionMatch };
                return true;
            });
            // Sorting
            if (query.normalized) {
                const groups = this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).map(group => group.id);
                filteredEditorEntries.sort((entryA, entryB) => {
                    if (entryA.groupId !== entryB.groupId) {
                        return groups.indexOf(entryA.groupId) - groups.indexOf(entryB.groupId); // older groups first
                    }
                    return (0, fuzzyScorer_1.compareItemsByFuzzyScore)(entryA, entryB, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache);
                });
            }
            // Grouping (for more than one group)
            const filteredEditorEntriesWithSeparators = [];
            if (this.editorGroupService.count > 1) {
                let lastGroupId = undefined;
                for (const entry of filteredEditorEntries) {
                    if (typeof lastGroupId !== 'number' || lastGroupId !== entry.groupId) {
                        const group = this.editorGroupService.getGroup(entry.groupId);
                        if (group) {
                            filteredEditorEntriesWithSeparators.push({ type: 'separator', label: group.label });
                        }
                        lastGroupId = entry.groupId;
                    }
                    filteredEditorEntriesWithSeparators.push(entry);
                }
            }
            else {
                filteredEditorEntriesWithSeparators.push(...filteredEditorEntries);
            }
            return filteredEditorEntriesWithSeparators;
        }
        doGetEditorPickItems() {
            const editors = this.doGetEditors();
            const mapGroupIdToGroupAriaLabel = new Map();
            for (const { groupId } of editors) {
                if (!mapGroupIdToGroupAriaLabel.has(groupId)) {
                    const group = this.editorGroupService.getGroup(groupId);
                    if (group) {
                        mapGroupIdToGroupAriaLabel.set(groupId, group.ariaLabel);
                    }
                }
            }
            return this.doGetEditors().map(({ editor, groupId }) => {
                const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                const isDirty = editor.isDirty() && !editor.isSaving();
                const description = editor.getDescription();
                const nameAndDescription = description ? `${editor.getName()} ${description}` : editor.getName();
                return {
                    groupId,
                    resource,
                    label: editor.getName(),
                    ariaLabel: (() => {
                        if (mapGroupIdToGroupAriaLabel.size > 1) {
                            return isDirty ?
                                (0, nls_1.localize)('entryAriaLabelWithGroupDirty', "{0}, unsaved changes, {1}", nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId)) :
                                (0, nls_1.localize)('entryAriaLabelWithGroup', "{0}, {1}", nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId));
                        }
                        return isDirty ? (0, nls_1.localize)('entryAriaLabelDirty', "{0}, unsaved changes", nameAndDescription) : nameAndDescription;
                    })(),
                    description,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, resource).concat(editor.getLabelExtraClasses()),
                    italic: !this.editorGroupService.getGroup(groupId)?.isPinned(editor),
                    buttons: (() => {
                        return [
                            {
                                iconClass: isDirty ? ('dirty-editor ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.closeDirty)) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close),
                                tooltip: (0, nls_1.localize)('closeEditor', "Close Editor"),
                                alwaysVisible: isDirty
                            }
                        ];
                    })(),
                    trigger: async () => {
                        const group = this.editorGroupService.getGroup(groupId);
                        if (group) {
                            await group.closeEditor(editor, { preserveFocus: true });
                            if (!group.contains(editor)) {
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                            }
                        }
                        return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                    },
                    accept: (keyMods, event) => this.editorGroupService.getGroup(groupId)?.openEditor(editor, { preserveFocus: event.inBackground }),
                };
            });
        }
    };
    exports.BaseEditorQuickAccessProvider = BaseEditorQuickAccessProvider;
    exports.BaseEditorQuickAccessProvider = BaseEditorQuickAccessProvider = __decorate([
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, editorService_1.IEditorService),
        __param(3, model_1.IModelService),
        __param(4, language_1.ILanguageService)
    ], BaseEditorQuickAccessProvider);
    //#region Active Editor Group Editors by Most Recently Used
    let ActiveGroupEditorsByMostRecentlyUsedQuickAccess = class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
        static { ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1 = this; }
        static { this.PREFIX = 'edt active '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super(ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        doGetEditors() {
            const group = this.editorGroupService.activeGroup;
            return group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId: group.id }));
        }
    };
    exports.ActiveGroupEditorsByMostRecentlyUsedQuickAccess = ActiveGroupEditorsByMostRecentlyUsedQuickAccess;
    exports.ActiveGroupEditorsByMostRecentlyUsedQuickAccess = ActiveGroupEditorsByMostRecentlyUsedQuickAccess = ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, editorService_1.IEditorService),
        __param(2, model_1.IModelService),
        __param(3, language_1.ILanguageService)
    ], ActiveGroupEditorsByMostRecentlyUsedQuickAccess);
    //#endregion
    //#region All Editors by Appearance
    let AllEditorsByAppearanceQuickAccess = class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
        static { AllEditorsByAppearanceQuickAccess_1 = this; }
        static { this.PREFIX = 'edt '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super(AllEditorsByAppearanceQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        doGetEditors() {
            const entries = [];
            for (const group of this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                for (const editor of group.getEditors(1 /* EditorsOrder.SEQUENTIAL */)) {
                    entries.push({ editor, groupId: group.id });
                }
            }
            return entries;
        }
    };
    exports.AllEditorsByAppearanceQuickAccess = AllEditorsByAppearanceQuickAccess;
    exports.AllEditorsByAppearanceQuickAccess = AllEditorsByAppearanceQuickAccess = AllEditorsByAppearanceQuickAccess_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, editorService_1.IEditorService),
        __param(2, model_1.IModelService),
        __param(3, language_1.ILanguageService)
    ], AllEditorsByAppearanceQuickAccess);
    //#endregion
    //#region All Editors by Most Recently Used
    let AllEditorsByMostRecentlyUsedQuickAccess = class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
        static { AllEditorsByMostRecentlyUsedQuickAccess_1 = this; }
        static { this.PREFIX = 'edt mru '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super(AllEditorsByMostRecentlyUsedQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        doGetEditors() {
            const entries = [];
            for (const editor of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                entries.push(editor);
            }
            return entries;
        }
    };
    exports.AllEditorsByMostRecentlyUsedQuickAccess = AllEditorsByMostRecentlyUsedQuickAccess;
    exports.AllEditorsByMostRecentlyUsedQuickAccess = AllEditorsByMostRecentlyUsedQuickAccess = AllEditorsByMostRecentlyUsedQuickAccess_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, editorService_1.IEditorService),
        __param(2, model_1.IModelService),
        __param(3, language_1.ILanguageService)
    ], AllEditorsByMostRecentlyUsedQuickAccess);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yUXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNCekYsSUFBZSw2QkFBNkIsR0FBNUMsTUFBZSw2QkFBOEIsU0FBUSw2Q0FBK0M7UUFtQjFHLFlBQ0MsTUFBYyxFQUNRLGtCQUEyRCxFQUNqRSxhQUFnRCxFQUNqRCxZQUE0QyxFQUN6QyxlQUFrRDtZQUVwRSxLQUFLLENBQUMsTUFBTSxFQUNYO2dCQUNDLHFCQUFxQixFQUFFLElBQUk7Z0JBQzNCLGFBQWEsRUFBRTtvQkFDZCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLHFCQUFxQixDQUFDO29CQUN2RCxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUNYO2FBQ0QsQ0FDRCxDQUFDO1lBYnVDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDOUMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2hDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQXRCcEQsY0FBUyxHQUFHLElBQUk7Z0JBQUE7b0JBRWhDLGdCQUFXLEdBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BELHNCQUFpQixHQUF3QixTQUFTLENBQUM7Z0JBWXBELENBQUM7Z0JBVkEsS0FBSyxDQUFDLGlCQUEwQjtvQkFFL0IsU0FBUztvQkFDVCxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDdkM7b0JBRUQsUUFBUTtvQkFDUixJQUFJLENBQUMsaUJBQWlCLEdBQUcs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