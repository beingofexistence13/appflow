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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/gotoError/browser/markerNavigationService", "vs/nls!vs/editor/contrib/gotoError/browser/gotoError", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "./gotoErrorWidget"], function (require, exports, codicons_1, lifecycle_1, editorExtensions_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, markerNavigationService_1, nls, actions_1, contextkey_1, instantiation_1, iconRegistry_1, gotoErrorWidget_1) {
    "use strict";
    var $d5_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e5 = exports.$d5 = void 0;
    let $d5 = class $d5 {
        static { $d5_1 = this; }
        static { this.ID = 'editor.contrib.markerController'; }
        static get(editor) {
            return editor.getContribution($d5_1.ID);
        }
        constructor(editor, g, h, i, j) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.c = new lifecycle_1.$jc();
            this.a = editor;
            this.b = CONTEXT_MARKERS_NAVIGATION_VISIBLE.bindTo(this.h);
        }
        dispose() {
            this.k();
            this.c.dispose();
        }
        k() {
            this.b.reset();
            this.c.clear();
            this.f = undefined;
            this.d = undefined;
        }
        l(uri) {
            if (this.d && this.d.matches(uri)) {
                return this.d;
            }
            let reusePosition = false;
            if (this.d) {
                reusePosition = true;
                this.k();
            }
            this.d = this.g.getMarkerList(uri);
            if (reusePosition) {
                this.d.move(true, this.a.getModel(), this.a.getPosition());
            }
            this.f = this.j.createInstance(gotoErrorWidget_1.$c5, this.a);
            this.f.onDidClose(() => this.close(), this, this.c);
            this.b.set(true);
            this.c.add(this.d);
            this.c.add(this.f);
            // follow cursor
            this.c.add(this.a.onDidChangeCursorPosition(e => {
                if (!this.d?.selected || !range_1.$ks.containsPosition(this.d?.selected.marker, e.position)) {
                    this.d?.resetIndex();
                }
            }));
            // update markers
            this.c.add(this.d.onDidChange(() => {
                if (!this.f || !this.f.position || !this.d) {
                    return;
                }
                const info = this.d.find(this.a.getModel().uri, this.f.position);
                if (info) {
                    this.f.updateMarker(info.marker);
                }
                else {
                    this.f.showStale();
                }
            }));
            // open related
            this.c.add(this.f.onDidSelectRelatedInformation(related => {
                this.i.openCodeEditor({
                    resource: related.resource,
                    options: { pinned: true, revealIfOpened: true, selection: range_1.$ks.lift(related).collapseToStart() }
                }, this.a);
                this.close(false);
            }));
            this.c.add(this.a.onDidChangeModel(() => this.k()));
            return this.d;
        }
        close(focusEditor = true) {
            this.k();
            if (focusEditor) {
                this.a.focus();
            }
        }
        showAtMarker(marker) {
            if (this.a.hasModel()) {
                const model = this.l(this.a.getModel().uri);
                model.resetIndex();
                model.move(true, this.a.getModel(), new position_1.$js(marker.startLineNumber, marker.startColumn));
                if (model.selected) {
                    this.f.showAtMarker(model.selected.marker, model.selected.index, model.selected.total);
                }
            }
        }
        async nagivate(next, multiFile) {
            if (this.a.hasModel()) {
                const model = this.l(multiFile ? undefined : this.a.getModel().uri);
                model.move(next, this.a.getModel(), this.a.getPosition());
                if (!model.selected) {
                    return;
                }
                if (model.selected.marker.resource.toString() !== this.a.getModel().uri.toString()) {
                    // show in different editor
                    this.k();
                    const otherEditor = await this.i.openCodeEditor({
                        resource: model.selected.marker.resource,
                        options: { pinned: false, revealIfOpened: true, selectionRevealType: 2 /* TextEditorSelectionRevealType.NearTop */, selection: model.selected.marker }
                    }, this.a);
                    if (otherEditor) {
                        $d5_1.get(otherEditor)?.close();
                        $d5_1.get(otherEditor)?.nagivate(next, multiFile);
                    }
                }
                else {
                    // show in this editor
                    this.f.showAtMarker(model.selected.marker, model.selected.index, model.selected.total);
                }
            }
        }
    };
    exports.$d5 = $d5;
    exports.$d5 = $d5 = $d5_1 = __decorate([
        __param(1, markerNavigationService_1.$b5),
        __param(2, contextkey_1.$3i),
        __param(3, codeEditorService_1.$nV),
        __param(4, instantiation_1.$Ah)
    ], $d5);
    class MarkerNavigationAction extends editorExtensions_1.$sV {
        constructor(d, h, opts) {
            super(opts);
            this.d = d;
            this.h = h;
        }
        async run(_accessor, editor) {
            if (editor.hasModel()) {
                $d5.get(editor)?.nagivate(this.d, this.h);
            }
        }
    }
    class $e5 extends MarkerNavigationAction {
        static { this.ID = 'editor.action.marker.next'; }
        static { this.LABEL = nls.localize(0, null); }
        constructor() {
            super(true, false, {
                id: $e5.ID,
                label: $e5.LABEL,
                alias: 'Go to Next Problem (Error, Warning, Info)',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: gotoErrorWidget_1.$c5.TitleMenu,
                    title: $e5.LABEL,
                    icon: (0, iconRegistry_1.$9u)('marker-navigation-next', codicons_1.$Pj.arrowDown, nls.localize(1, null)),
                    group: 'navigation',
                    order: 1
                }
            });
        }
    }
    exports.$e5 = $e5;
    class PrevMarkerAction extends MarkerNavigationAction {
        static { this.ID = 'editor.action.marker.prev'; }
        static { this.LABEL = nls.localize(2, null); }
        constructor() {
            super(false, false, {
                id: PrevMarkerAction.ID,
                label: PrevMarkerAction.LABEL,
                alias: 'Go to Previous Problem (Error, Warning, Info)',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: gotoErrorWidget_1.$c5.TitleMenu,
                    title: PrevMarkerAction.LABEL,
                    icon: (0, iconRegistry_1.$9u)('marker-navigation-previous', codicons_1.$Pj.arrowUp, nls.localize(3, null)),
                    group: 'navigation',
                    order: 2
                }
            });
        }
    }
    class NextMarkerInFilesAction extends MarkerNavigationAction {
        constructor() {
            super(true, true, {
                id: 'editor.action.marker.nextInFiles',
                label: nls.localize(4, null),
                alias: 'Go to Next Problem in Files (Error, Warning, Info)',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarGoMenu,
                    title: nls.localize(5, null),
                    group: '6_problem_nav',
                    order: 1
                }
            });
        }
    }
    class PrevMarkerInFilesAction extends MarkerNavigationAction {
        constructor() {
            super(false, true, {
                id: 'editor.action.marker.prevInFiles',
                label: nls.localize(6, null),
                alias: 'Go to Previous Problem in Files (Error, Warning, Info)',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 1024 /* KeyMod.Shift */ | 66 /* KeyCode.F8 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarGoMenu,
                    title: nls.localize(7, null),
                    group: '6_problem_nav',
                    order: 2
                }
            });
        }
    }
    (0, editorExtensions_1.$AV)($d5.ID, $d5, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)($e5);
    (0, editorExtensions_1.$xV)(PrevMarkerAction);
    (0, editorExtensions_1.$xV)(NextMarkerInFilesAction);
    (0, editorExtensions_1.$xV)(PrevMarkerInFilesAction);
    const CONTEXT_MARKERS_NAVIGATION_VISIBLE = new contextkey_1.$2i('markersNavigationVisible', false);
    const MarkerCommand = editorExtensions_1.$rV.bindToContribution($d5.get);
    (0, editorExtensions_1.$wV)(new MarkerCommand({
        id: 'closeMarkersNavigation',
        precondition: CONTEXT_MARKERS_NAVIGATION_VISIBLE,
        handler: x => x.close(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
});
//# sourceMappingURL=gotoError.js.map