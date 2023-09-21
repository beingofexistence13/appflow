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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/color", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, browser, DOM, fastDomNode_1, color_1, lifecycle_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZEb = void 0;
    const MINIMUM_SLIDER_SIZE = 20;
    let $ZEb = class $ZEb extends themeService_1.$nv {
        constructor(notebookEditor, width, container, themeService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.width = width;
            this.g = [];
            this.j = 2;
            this.m = null;
            this.s = null;
            this.r = null;
            this.t = null;
            this.u = this.B(new lifecycle_1.$jc());
            this.y = null;
            this.c = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.c.setPosition('relative');
            this.c.setLayerHinting(true);
            this.c.setContain('strict');
            container.appendChild(this.c.domNode);
            this.f = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.f.setClassName('diffViewport');
            this.f.setPosition('absolute');
            this.f.setWidth(width);
            container.appendChild(this.f.domNode);
            this.B(browser.$WN.onDidChange(() => {
                this.D();
            }));
            this.B(this.n.onDidColorThemeChange(e => {
                const colorChanged = this.C(e);
                if (colorChanged) {
                    this.D();
                }
            }));
            this.C(this.n.getColorTheme());
            this.B(this.notebookEditor.onDidScroll(() => {
                this.H();
            }));
            this.B(DOM.$oO(container, DOM.$3O.POINTER_DOWN, (e) => {
                this.notebookEditor.delegateVerticalScrollbarPointerDown(e);
            }));
        }
        C(theme) {
            const newInsertColor = theme.getColor(colorRegistry_1.$lx) || (theme.getColor(colorRegistry_1.$fx) || colorRegistry_1.$dx).transparent(2);
            const newRemoveColor = theme.getColor(colorRegistry_1.$mx) || (theme.getColor(colorRegistry_1.$gx) || colorRegistry_1.$ex).transparent(2);
            const hasChanges = !newInsertColor.equals(this.m) || !newRemoveColor.equals(this.s);
            this.m = newInsertColor;
            this.s = newRemoveColor;
            if (this.m) {
                this.r = color_1.$Os.Format.CSS.formatHexA(this.m);
            }
            if (this.s) {
                this.t = color_1.$Os.Format.CSS.formatHexA(this.s);
            }
            return hasChanges;
        }
        layout() {
            this.G();
        }
        updateViewModels(elements, eventDispatcher) {
            this.u.clear();
            this.g = elements;
            if (eventDispatcher) {
                this.u.add(eventDispatcher.onDidChangeLayout(() => {
                    this.D();
                }));
                this.u.add(eventDispatcher.onDidChangeCellLayout(() => {
                    this.D();
                }));
            }
            this.D();
        }
        D() {
            if (this.y === null) {
                this.y = DOM.$uO(this.F.bind(this), 16);
            }
        }
        F() {
            this.y = null;
            this.G();
        }
        G() {
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const height = layoutInfo.height;
            const contentHeight = this.g.map(view => view.layoutInfo.totalHeight).reduce((a, b) => a + b, 0);
            const ratio = browser.$WN.value;
            this.c.setWidth(this.width);
            this.c.setHeight(height);
            this.c.domNode.width = this.width * ratio;
            this.c.domNode.height = height * ratio;
            const ctx = this.c.domNode.getContext('2d');
            ctx.clearRect(0, 0, this.width * ratio, height * ratio);
            this.J(ctx, this.width * ratio, height * ratio, contentHeight * ratio, ratio);
            this.H();
        }
        H() {
            const layout = this.I();
            if (!layout) {
                this.f.setTop(0);
                this.f.setHeight(0);
            }
            else {
                this.f.setTop(layout.top);
                this.f.setHeight(layout.height);
            }
        }
        I() {
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            if (!layoutInfo) {
                return null;
            }
            const scrollTop = this.notebookEditor.getScrollTop();
            const scrollHeight = this.notebookEditor.getScrollHeight();
            const computedAvailableSize = Math.max(0, layoutInfo.height);
            const computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * 0);
            const visibleSize = layoutInfo.height;
            const computedSliderSize = Math.round(Math.max(MINIMUM_SLIDER_SIZE, Math.floor(visibleSize * computedRepresentableSize / scrollHeight)));
            const computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollHeight - visibleSize);
            const computedSliderPosition = Math.round(scrollTop * computedSliderRatio);
            return {
                height: computedSliderSize,
                top: computedSliderPosition
            };
        }
        J(ctx, width, height, scrollHeight, ratio) {
            if (!this.r || !this.t) {
                // no op when colors are not yet known
                return;
            }
            const laneWidth = width / this.j;
            let currentFrom = 0;
            for (let i = 0; i < this.g.length; i++) {
                const element = this.g[i];
                const cellHeight = Math.round((element.layoutInfo.totalHeight / scrollHeight) * ratio * height);
                switch (element.type) {
                    case 'insert':
                        ctx.fillStyle = this.r;
                        ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                        break;
                    case 'delete':
                        ctx.fillStyle = this.t;
                        ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                        break;
                    case 'unchanged':
                        break;
                    case 'modified':
                        ctx.fillStyle = this.t;
                        ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                        ctx.fillStyle = this.r;
                        ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                        break;
                }
                currentFrom += cellHeight;
            }
        }
        dispose() {
            if (this.y !== null) {
                this.y.dispose();
                this.y = null;
            }
            super.dispose();
        }
    };
    exports.$ZEb = $ZEb;
    exports.$ZEb = $ZEb = __decorate([
        __param(3, themeService_1.$gv)
    ], $ZEb);
});
//# sourceMappingURL=notebookDiffOverviewRuler.js.map