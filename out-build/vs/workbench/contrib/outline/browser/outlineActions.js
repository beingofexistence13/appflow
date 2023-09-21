/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/outline/browser/outlineActions", "vs/base/common/codicons", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/views/viewPane", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/outline/browser/outline"], function (require, exports, nls_1, codicons_1, actions_1, viewPane_1, contextkey_1, outline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- commands
    (0, actions_1.$Xu)(class CollapseAll extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.collapse',
                title: (0, nls_1.localize)(0, null),
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id), outline_1.$DZb.isEqualTo(false))
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    (0, actions_1.$Xu)(class ExpandAll extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.expand',
                title: (0, nls_1.localize)(1, null),
                f1: false,
                icon: codicons_1.$Pj.expandAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id), outline_1.$DZb.isEqualTo(true))
                }
            });
        }
        runInView(_accessor, view) {
            view.expandAll();
        }
    });
    (0, actions_1.$Xu)(class FollowCursor extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.followCursor',
                title: (0, nls_1.localize)(2, null),
                f1: false,
                toggled: outline_1.$AZb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'config',
                    order: 1,
                    when: contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.followCursor = !view.outlineViewState.followCursor;
        }
    });
    (0, actions_1.$Xu)(class FilterOnType extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.filterOnType',
                title: (0, nls_1.localize)(3, null),
                f1: false,
                toggled: outline_1.$BZb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'config',
                    order: 2,
                    when: contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.filterOnType = !view.outlineViewState.filterOnType;
        }
    });
    (0, actions_1.$Xu)(class SortByPosition extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByPosition',
                title: (0, nls_1.localize)(4, null),
                f1: false,
                toggled: outline_1.$CZb.isEqualTo(0 /* OutlineSortOrder.ByPosition */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'sort',
                    order: 1,
                    when: contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 0 /* OutlineSortOrder.ByPosition */;
        }
    });
    (0, actions_1.$Xu)(class SortByName extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByName',
                title: (0, nls_1.localize)(5, null),
                f1: false,
                toggled: outline_1.$CZb.isEqualTo(1 /* OutlineSortOrder.ByName */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'sort',
                    order: 2,
                    when: contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 1 /* OutlineSortOrder.ByName */;
        }
    });
    (0, actions_1.$Xu)(class SortByKind extends viewPane_1.$Keb {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByKind',
                title: (0, nls_1.localize)(6, null),
                f1: false,
                toggled: outline_1.$CZb.isEqualTo(2 /* OutlineSortOrder.ByKind */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'sort',
                    order: 3,
                    when: contextkey_1.$Ii.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 2 /* OutlineSortOrder.ByKind */;
        }
    });
});
//# sourceMappingURL=outlineActions.js.map