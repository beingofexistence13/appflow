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
    exports.$2Fb = exports.$1Fb = exports.$ZFb = void 0;
    class $ZFb {
        constructor() {
            this.c = new Set();
        }
        /**
         *
         * This exists solely to allow the debug and test contributions to add actions to the gutter context menu
         * which cannot be trivially expressed using when clauses and therefore cannot be statically registered.
         * If you want an action to show up in the gutter context menu, you should generally use MenuId.EditorLineNumberMenu instead.
         */
        registerGutterActionsGenerator(gutterActionsGenerator) {
            this.c.add(gutterActionsGenerator);
            return {
                dispose: () => {
                    this.c.delete(gutterActionsGenerator);
                }
            };
        }
        getGutterActionsGenerators() {
            return Array.from(this.c.values());
        }
    }
    exports.$ZFb = $ZFb;
    platform_2.$8m.add('gutterActionsRegistry', new $ZFb());
    exports.$1Fb = platform_2.$8m.as('gutterActionsRegistry');
    let $2Fb = class $2Fb extends lifecycle_1.$kc {
        static { this.ID = 'workbench.contrib.editorLineNumberContextMenu'; }
        constructor(c, f, g, h, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.B(this.c.onMouseDown((e) => this.m(e, false)));
        }
        show(e) {
            this.m(e, true);
        }
        m(e, force) {
            const model = this.c.getModel();
            // on macOS ctrl+click is interpreted as right click
            if (!e.event.rightButton && !(platform_1.$j && e.event.leftButton && e.event.ctrlKey) && !force
                || e.target.type !== 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ && e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */
                || !e.target.position || !model) {
                return;
            }
            const lineNumber = e.target.position.lineNumber;
            const contextKeyService = this.h.createOverlay([['editorLineNumber', lineNumber]]);
            const menu = this.g.createMenu(actions_2.$Ru.EditorLineNumberContext, contextKeyService);
            const allActions = [];
            this.j.invokeFunction(accessor => {
                for (const generator of exports.$1Fb.getGutterActionsGenerators()) {
                    const collectedActions = new Map();
                    generator({ lineNumber, editor: this.c, accessor }, {
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
                    const currentSelections = this.c.getSelections();
                    const lineRange = {
                        startLineNumber: lineNumber,
                        endLineNumber: lineNumber,
                        startColumn: 1,
                        endColumn: model.getLineLength(lineNumber) + 1
                    };
                    const containsSelection = currentSelections?.some(selection => !selection.isEmpty() && selection.intersectRanges(lineRange) !== null);
                    if (!containsSelection) {
                        this.c.setSelection(lineRange, "api" /* TextEditorSelectionSource.PROGRAMMATIC */);
                    }
                }
                this.f.showContextMenu({
                    getAnchor: () => e.event,
                    getActions: () => actions_1.$ii.join(...allActions.map((a) => a[1])),
                    onHide: () => menu.dispose(),
                });
            });
        }
    };
    exports.$2Fb = $2Fb;
    exports.$2Fb = $2Fb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, actions_2.$Su),
        __param(3, contextkey_1.$3i),
        __param(4, instantiation_1.$Ah)
    ], $2Fb);
    (0, editorExtensions_1.$AV)($2Fb.ID, $2Fb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=editorLineNumberMenu.js.map