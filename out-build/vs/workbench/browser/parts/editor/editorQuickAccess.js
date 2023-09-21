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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/getIconClasses", "vs/base/common/fuzzyScorer", "vs/base/common/codicons", "vs/base/common/themables", "vs/css!./media/editorquickaccess"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, editorGroupsService_1, editor_1, editorService_1, model_1, language_1, getIconClasses_1, fuzzyScorer_1, codicons_1, themables_1) {
    "use strict";
    var $aub_1, $bub_1, $cub_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cub = exports.$bub = exports.$aub = exports.$_tb = void 0;
    let $_tb = class $_tb extends pickerQuickAccess_1.$sqb {
        constructor(prefix, b, h, j, m) {
            super(prefix, {
                canAcceptInBackground: true,
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null),
                    groupId: -1
                }
            });
            this.b = b;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = new class {
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
            this.a.reset(!!picker.quickNavigate);
            // Start picker
            return super.provide(picker, token);
        }
        g(filter) {
            const query = (0, fuzzyScorer_1.$oq)(filter);
            // Filtering
            const filteredEditorEntries = this.r().filter(entry => {
                if (!query.normalized) {
                    return true;
                }
                // Score on label and description
                const itemScore = (0, fuzzyScorer_1.$mq)(entry, query, true, quickInput_1.$Fq, this.a.scorerCache);
                if (!itemScore.score) {
                    return false;
                }
                // Apply highlights
                entry.highlights = { label: itemScore.labelMatch, description: itemScore.descriptionMatch };
                return true;
            });
            // Sorting
            if (query.normalized) {
                const groups = this.b.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).map(group => group.id);
                filteredEditorEntries.sort((entryA, entryB) => {
                    if (entryA.groupId !== entryB.groupId) {
                        return groups.indexOf(entryA.groupId) - groups.indexOf(entryB.groupId); // older groups first
                    }
                    return (0, fuzzyScorer_1.$nq)(entryA, entryB, query, true, quickInput_1.$Fq, this.a.scorerCache);
                });
            }
            // Grouping (for more than one group)
            const filteredEditorEntriesWithSeparators = [];
            if (this.b.count > 1) {
                let lastGroupId = undefined;
                for (const entry of filteredEditorEntries) {
                    if (typeof lastGroupId !== 'number' || lastGroupId !== entry.groupId) {
                        const group = this.b.getGroup(entry.groupId);
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
        r() {
            const editors = this.s();
            const mapGroupIdToGroupAriaLabel = new Map();
            for (const { groupId } of editors) {
                if (!mapGroupIdToGroupAriaLabel.has(groupId)) {
                    const group = this.b.getGroup(groupId);
                    if (group) {
                        mapGroupIdToGroupAriaLabel.set(groupId, group.ariaLabel);
                    }
                }
            }
            return this.s().map(({ editor, groupId }) => {
                const resource = editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
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
                                (0, nls_1.localize)(1, null, nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId)) :
                                (0, nls_1.localize)(2, null, nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId));
                        }
                        return isDirty ? (0, nls_1.localize)(3, null, nameAndDescription) : nameAndDescription;
                    })(),
                    description,
                    iconClasses: (0, getIconClasses_1.$x6)(this.j, this.m, resource).concat(editor.getLabelExtraClasses()),
                    italic: !this.b.getGroup(groupId)?.isPinned(editor),
                    buttons: (() => {
                        return [
                            {
                                iconClass: isDirty ? ('dirty-editor ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.closeDirty)) : themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close),
                                tooltip: (0, nls_1.localize)(4, null),
                                alwaysVisible: isDirty
                            }
                        ];
                    })(),
                    trigger: async () => {
                        const group = this.b.getGroup(groupId);
                        if (group) {
                            await group.closeEditor(editor, { preserveFocus: true });
                            if (!group.contains(editor)) {
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                            }
                        }
                        return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                    },
                    accept: (keyMods, event) => this.b.getGroup(groupId)?.openEditor(editor, { preserveFocus: event.inBackground }),
                };
            });
        }
    };
    exports.$_tb = $_tb;
    exports.$_tb = $_tb = __decorate([
        __param(1, editorGroupsService_1.$5C),
        __param(2, editorService_1.$9C),
        __param(3, model_1.$yA),
        __param(4, language_1.$ct)
    ], $_tb);
    //#region Active Editor Group Editors by Most Recently Used
    let $aub = class $aub extends $_tb {
        static { $aub_1 = this; }
        static { this.PREFIX = 'edt active '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super($aub_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        s() {
            const group = this.b.activeGroup;
            return group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId: group.id }));
        }
    };
    exports.$aub = $aub;
    exports.$aub = $aub = $aub_1 = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, editorService_1.$9C),
        __param(2, model_1.$yA),
        __param(3, language_1.$ct)
    ], $aub);
    //#endregion
    //#region All Editors by Appearance
    let $bub = class $bub extends $_tb {
        static { $bub_1 = this; }
        static { this.PREFIX = 'edt '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super($bub_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        s() {
            const entries = [];
            for (const group of this.b.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                for (const editor of group.getEditors(1 /* EditorsOrder.SEQUENTIAL */)) {
                    entries.push({ editor, groupId: group.id });
                }
            }
            return entries;
        }
    };
    exports.$bub = $bub;
    exports.$bub = $bub = $bub_1 = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, editorService_1.$9C),
        __param(2, model_1.$yA),
        __param(3, language_1.$ct)
    ], $bub);
    //#endregion
    //#region All Editors by Most Recently Used
    let $cub = class $cub extends $_tb {
        static { $cub_1 = this; }
        static { this.PREFIX = 'edt mru '; }
        constructor(editorGroupService, editorService, modelService, languageService) {
            super($cub_1.PREFIX, editorGroupService, editorService, modelService, languageService);
        }
        s() {
            const entries = [];
            for (const editor of this.h.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                entries.push(editor);
            }
            return entries;
        }
    };
    exports.$cub = $cub;
    exports.$cub = $cub = $cub_1 = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, editorService_1.$9C),
        __param(2, model_1.$yA),
        __param(3, language_1.$ct)
    ], $cub);
});
//#endregion
//# sourceMappingURL=editorQuickAccess.js.map