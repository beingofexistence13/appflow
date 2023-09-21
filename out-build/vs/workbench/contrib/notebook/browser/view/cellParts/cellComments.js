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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/editor/common/config/editorOptions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadWidget", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, arrays_1, lifecycle_1, editorOptions_1, configuration_1, contextkey_1, instantiation_1, themeService_1, commentService_1, commentThreadWidget_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3ob = void 0;
    let $3ob = class $3ob extends cellPart_1.$Hnb {
        constructor(j, m, n, r, s, t, u) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.a = false;
            this.b = null;
            this.h = this.B(new lifecycle_1.$jc());
            this.m.classList.add('review-widget');
            this.B(this.r.onDidColorThemeChange(this.F, this));
            // TODO @rebornix onDidChangeLayout (font change)
            // this._register(this.notebookEditor.onDidchangeLa)
            this.F();
        }
        async w(element) {
            if (this.a) {
                return;
            }
            this.a = true;
            const info = await this.D(element);
            if (info) {
                this.y(info.owner, info.thread);
            }
        }
        y(owner, commentThread) {
            this.b?.dispose();
            this.h.clear();
            this.b = this.u.createInstance(commentThreadWidget_1.$Emb, this.m, owner, this.j.textModel.uri, this.n, this.u, commentThread, undefined, undefined, {
                codeBlockFontFamily: this.t.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily
            }, undefined, {
                actionRunner: () => {
                },
                collapse: () => { }
            });
            const layoutInfo = this.j.getLayoutInfo();
            this.b.display(layoutInfo.fontInfo.lineHeight);
            this.F();
            this.h.add(this.b.onDidResize(() => {
                if (this.g?.cellKind === notebookCommon_1.CellKind.Code && this.b) {
                    this.g.commentHeight = this.C(this.b.getDimensions().height);
                }
            }));
        }
        z() {
            this.f.add(this.s.onDidUpdateCommentThreads(async () => {
                if (this.g) {
                    const info = await this.D(this.g);
                    if (!this.b && info) {
                        this.y(info.owner, info.thread);
                        const layoutInfo = this.g.layoutInfo;
                        this.m.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
                        this.g.commentHeight = this.C(this.b.getDimensions().height);
                        return;
                    }
                    if (this.b) {
                        if (!info) {
                            this.b.dispose();
                            this.g.commentHeight = 0;
                            return;
                        }
                        if (this.b.commentThread === info.thread) {
                            this.g.commentHeight = this.C(this.b.getDimensions().height);
                            return;
                        }
                        this.b.updateCommentThread(info.thread);
                        this.g.commentHeight = this.C(this.b.getDimensions().height);
                    }
                }
            }));
        }
        C(bodyHeight) {
            const layoutInfo = this.j.getLayoutInfo();
            const headHeight = Math.ceil(layoutInfo.fontInfo.lineHeight * 1.2);
            const lineHeight = layoutInfo.fontInfo.lineHeight;
            const arrowHeight = Math.round(lineHeight / 3);
            const frameThickness = Math.round(lineHeight / 9) * 2;
            const computedHeight = headHeight + bodyHeight + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */;
            return computedHeight;
        }
        async D(element) {
            if (this.j.hasModel()) {
                const commentInfos = (0, arrays_1.$Fb)(await this.s.getNotebookComments(element.uri));
                if (commentInfos.length && commentInfos[0].threads.length) {
                    return { owner: commentInfos[0].owner, thread: commentInfos[0].threads[0] };
                }
            }
            return null;
        }
        F() {
            const theme = this.r.getColorTheme();
            const fontInfo = this.j.getLayoutInfo().fontInfo;
            this.b?.applyTheme(theme, fontInfo);
        }
        didRenderCell(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Code) {
                this.g = element;
                this.w(element);
                this.z();
            }
        }
        prepareLayout() {
            if (this.g?.cellKind === notebookCommon_1.CellKind.Code && this.b) {
                this.g.commentHeight = this.C(this.b.getDimensions().height);
            }
        }
        updateInternalLayoutNow(element) {
            if (this.g?.cellKind === notebookCommon_1.CellKind.Code && this.b) {
                const layoutInfo = element.layoutInfo;
                this.m.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
            }
        }
    };
    exports.$3ob = $3ob;
    exports.$3ob = $3ob = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, themeService_1.$gv),
        __param(4, commentService_1.$Ilb),
        __param(5, configuration_1.$8h),
        __param(6, instantiation_1.$Ah)
    ], $3ob);
});
//# sourceMappingURL=cellComments.js.map