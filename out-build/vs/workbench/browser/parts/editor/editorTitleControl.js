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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/breadcrumbsControl", "vs/workbench/browser/parts/editor/multiEditorTabsControl", "vs/workbench/browser/parts/editor/singleEditorTabsControl", "vs/base/common/lifecycle", "vs/css!./media/editortitlecontrol"], function (require, exports, dom_1, instantiation_1, themeService_1, breadcrumbsControl_1, multiEditorTabsControl_1, singleEditorTabsControl_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pxb = void 0;
    let $Pxb = class $Pxb extends themeService_1.$nv {
        get g() { return this.c?.control; }
        constructor(j, m, r, s, themeService) {
            super(themeService);
            this.j = j;
            this.m = m;
            this.r = r;
            this.s = s;
            this.b = this.B(new lifecycle_1.$jc());
            this.f = this.B(new lifecycle_1.$jc());
            this.a = this.t();
            this.c = this.u();
        }
        t() {
            let control;
            if (this.m.partOptions.showTabs) {
                control = this.s.createInstance(multiEditorTabsControl_1.$Nxb, this.j, this.m, this.r);
            }
            else {
                control = this.s.createInstance(singleEditorTabsControl_1.$Oxb, this.j, this.m, this.r);
            }
            return this.b.add(control);
        }
        u() {
            if (!this.m.partOptions.showTabs) {
                return undefined; // single tabs have breadcrumbs inlined
            }
            // Breadcrumbs container
            const breadcrumbsContainer = document.createElement('div');
            breadcrumbsContainer.classList.add('breadcrumbs-below-tabs');
            this.j.appendChild(breadcrumbsContainer);
            const breadcrumbsControlFactory = this.f.add(this.s.createInstance(breadcrumbsControl_1.$Kxb, breadcrumbsContainer, this.r, {
                showFileIcons: true,
                showSymbolIcons: true,
                showDecorationColors: false,
                showPlaceholder: true
            }));
            this.f.add(breadcrumbsControlFactory.onDidEnablementChange(() => this.y()));
            return breadcrumbsControlFactory;
        }
        y() {
            this.r.relayout(); // relayout when breadcrumbs are enable/disabled
        }
        openEditor(editor) {
            const didChange = this.a.openEditor(editor);
            this.C(didChange);
        }
        openEditors(editors) {
            const didChange = this.a.openEditors(editors);
            this.C(didChange);
        }
        C(didChange) {
            if (didChange) {
                this.g?.update();
            }
            else {
                this.g?.revealLast();
            }
        }
        beforeCloseEditor(editor) {
            return this.a.beforeCloseEditor(editor);
        }
        closeEditor(editor) {
            this.a.closeEditor(editor);
            this.D();
        }
        closeEditors(editors) {
            this.a.closeEditors(editors);
            this.D();
        }
        D() {
            if (!this.r.activeEditor) {
                this.g?.update();
            }
        }
        moveEditor(editor, fromIndex, targetIndex) {
            return this.a.moveEditor(editor, fromIndex, targetIndex);
        }
        pinEditor(editor) {
            return this.a.pinEditor(editor);
        }
        stickEditor(editor) {
            return this.a.stickEditor(editor);
        }
        unstickEditor(editor) {
            return this.a.unstickEditor(editor);
        }
        setActive(isActive) {
            return this.a.setActive(isActive);
        }
        updateEditorLabel(editor) {
            return this.a.updateEditorLabel(editor);
        }
        updateEditorDirty(editor) {
            return this.a.updateEditorDirty(editor);
        }
        updateOptions(oldOptions, newOptions) {
            // Update editor tabs control if options changed
            if (oldOptions.showTabs !== newOptions.showTabs) {
                // Clear old
                this.b.clear();
                this.f.clear();
                (0, dom_1.$lO)(this.j);
                // Create new
                this.a = this.t();
                this.c = this.u();
            }
            // Forward into editor tabs control
            this.a.updateOptions(oldOptions, newOptions);
        }
        layout(dimensions) {
            // Layout tabs control
            const tabsControlDimension = this.a.layout(dimensions);
            // Layout breadcrumbs if visible
            let breadcrumbsControlDimension = undefined;
            if (this.g?.isHidden() === false) {
                breadcrumbsControlDimension = new dom_1.$BO(dimensions.container.width, breadcrumbsControl_1.$Jxb.HEIGHT);
                this.g.layout(breadcrumbsControlDimension);
            }
            return new dom_1.$BO(dimensions.container.width, tabsControlDimension.height + (breadcrumbsControlDimension ? breadcrumbsControlDimension.height : 0));
        }
        getHeight() {
            const tabsControlHeight = this.a.getHeight();
            const breadcrumbsControlHeight = this.g?.isHidden() === false ? breadcrumbsControl_1.$Jxb.HEIGHT : 0;
            return {
                total: tabsControlHeight + breadcrumbsControlHeight,
                offset: tabsControlHeight
            };
        }
    };
    exports.$Pxb = $Pxb;
    exports.$Pxb = $Pxb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, themeService_1.$gv)
    ], $Pxb);
});
//# sourceMappingURL=editorTitleControl.js.map