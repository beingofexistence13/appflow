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
define(["require", "exports", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls!vs/workbench/contrib/preferences/browser/settingsSearchMenu", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/preferences/common/preferences"], function (require, exports, dropdownActionViewItem_1, suggestController_1, nls_1, contextView_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Db = void 0;
    let $6Db = class $6Db extends dropdownActionViewItem_1.$CR {
        constructor(action, actionRunner, g, contextMenuService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                menuAsChild: true
            });
            this.g = g;
            this.a = suggestController_1.$G6.get(this.g.inputWidget);
        }
        render(container) {
            super.render(container);
        }
        r(queryToAppend, triggerSuggest) {
            this.g.setValue(this.g.getValue().trimEnd() + ' ' + queryToAppend);
            this.g.focus();
            if (triggerSuggest && this.a) {
                this.a.triggerSuggest();
            }
        }
        /**
         * The created action appends a query to the search widget search string. It optionally triggers suggestions.
         */
        N(id, label, tooltip, queryToAppend, triggerSuggest) {
            return {
                id,
                label,
                tooltip,
                class: undefined,
                enabled: true,
                checked: false,
                run: () => { this.r(queryToAppend, triggerSuggest); }
            };
        }
        /**
         * The created action appends a query to the search widget search string, if the query does not exist.
         * Otherwise, it removes the query from the search widget search string.
         * The action does not trigger suggestions after adding or removing the query.
         */
        O(id, label, tooltip, queryToAppend) {
            const splitCurrentQuery = this.g.getValue().split(' ');
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
                        const trimmedCurrentQuery = this.g.getValue().trimEnd();
                        const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + ' ' + queryToAppend : queryToAppend;
                        this.g.setValue(newQuery);
                    }
                    else {
                        const queryWithRemovedTags = this.g.getValue().split(' ')
                            .filter(word => word !== queryToAppend).join(' ');
                        this.g.setValue(queryWithRemovedTags);
                    }
                    this.g.focus();
                }
            };
        }
        getActions() {
            return [
                this.O('modifiedSettingsSearch', (0, nls_1.localize)(0, null), (0, nls_1.localize)(1, null), `@${preferences_1.$ICb}`),
                this.N('extSettingsSearch', (0, nls_1.localize)(2, null), (0, nls_1.localize)(3, null), `@${preferences_1.$JCb}`, true),
                this.N('featuresSettingsSearch', (0, nls_1.localize)(4, null), (0, nls_1.localize)(5, null), `@${preferences_1.$KCb}`, true),
                this.N('tagSettingsSearch', (0, nls_1.localize)(6, null), (0, nls_1.localize)(7, null), `@${preferences_1.$NCb}`, true),
                this.N('langSettingsSearch', (0, nls_1.localize)(8, null), (0, nls_1.localize)(9, null), `@${preferences_1.$MCb}`, true),
                this.O('onlineSettingsSearch', (0, nls_1.localize)(10, null), (0, nls_1.localize)(11, null), '@tag:usesOnlineServices'),
                this.O('policySettingsSearch', (0, nls_1.localize)(12, null), (0, nls_1.localize)(13, null), `@${preferences_1.$OCb}`)
            ];
        }
    };
    exports.$6Db = $6Db;
    exports.$6Db = $6Db = __decorate([
        __param(3, contextView_1.$WZ)
    ], $6Db);
});
//# sourceMappingURL=settingsSearchMenu.js.map