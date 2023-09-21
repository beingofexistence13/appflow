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
    exports.CellComments = void 0;
    let CellComments = class CellComments extends cellPart_1.CellContentPart {
        constructor(notebookEditor, container, contextKeyService, themeService, commentService, configurationService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.container = container;
            this.contextKeyService = contextKeyService;
            this.themeService = themeService;
            this.commentService = commentService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this._initialized = false;
            this._commentThreadWidget = null;
            this.commentTheadDisposables = this._register(new lifecycle_1.DisposableStore());
            this.container.classList.add('review-widget');
            this._register(this.themeService.onDidColorThemeChange(this._applyTheme, this));
            // TODO @rebornix onDidChangeLayout (font change)
            // this._register(this.notebookEditor.onDidchangeLa)
            this._applyTheme();
        }
        async initialize(element) {
            if (this._initialized) {
                return;
            }
            this._initialized = true;
            const info = await this._getCommentThreadForCell(element);
            if (info) {
                this._createCommentTheadWidget(info.owner, info.thread);
            }
        }
        _createCommentTheadWidget(owner, commentThread) {
            this._commentThreadWidget?.dispose();
            this.commentTheadDisposables.clear();
            this._commentThreadWidget = this.instantiationService.createInstance(commentThreadWidget_1.CommentThreadWidget, this.container, owner, this.notebookEditor.textModel.uri, this.contextKeyService, this.instantiationService, commentThread, undefined, undefined, {
                codeBlockFontFamily: this.configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily
            }, undefined, {
                actionRunner: () => {
                },
                collapse: () => { }
            });
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            this._commentThreadWidget.display(layoutInfo.fontInfo.lineHeight);
            this._applyTheme();
            this.commentTheadDisposables.add(this._commentThreadWidget.onDidResize(() => {
                if (this.currentElement?.cellKind === notebookCommon_1.CellKind.Code && this._commentThreadWidget) {
                    this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                }
            }));
        }
        _bindListeners() {
            this.cellDisposables.add(this.commentService.onDidUpdateCommentThreads(async () => {
                if (this.currentElement) {
                    const info = await this._getCommentThreadForCell(this.currentElement);
                    if (!this._commentThreadWidget && info) {
                        this._createCommentTheadWidget(info.owner, info.thread);
                        const layoutInfo = this.currentElement.layoutInfo;
                        this.container.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
                        this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                        return;
                    }
                    if (this._commentThreadWidget) {
                        if (!info) {
                            this._commentThreadWidget.dispose();
                            this.currentElement.commentHeight = 0;
                            return;
                        }
                        if (this._commentThreadWidget.commentThread === info.thread) {
                            this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                            return;
                        }
                        this._commentThreadWidget.updateCommentThread(info.thread);
                        this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                    }
                }
            }));
        }
        _calculateCommentThreadHeight(bodyHeight) {
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const headHeight = Math.ceil(layoutInfo.fontInfo.lineHeight * 1.2);
            const lineHeight = layoutInfo.fontInfo.lineHeight;
            const arrowHeight = Math.round(lineHeight / 3);
            const frameThickness = Math.round(lineHeight / 9) * 2;
            const computedHeight = headHeight + bodyHeight + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */;
            return computedHeight;
        }
        async _getCommentThreadForCell(element) {
            if (this.notebookEditor.hasModel()) {
                const commentInfos = (0, arrays_1.coalesce)(await this.commentService.getNotebookComments(element.uri));
                if (commentInfos.length && commentInfos[0].threads.length) {
                    return { owner: commentInfos[0].owner, thread: commentInfos[0].threads[0] };
                }
            }
            return null;
        }
        _applyTheme() {
            const theme = this.themeService.getColorTheme();
            const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
            this._commentThreadWidget?.applyTheme(theme, fontInfo);
        }
        didRenderCell(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Code) {
                this.currentElement = element;
                this.initialize(element);
                this._bindListeners();
            }
        }
        prepareLayout() {
            if (this.currentElement?.cellKind === notebookCommon_1.CellKind.Code && this._commentThreadWidget) {
                this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
            }
        }
        updateInternalLayoutNow(element) {
            if (this.currentElement?.cellKind === notebookCommon_1.CellKind.Code && this._commentThreadWidget) {
                const layoutInfo = element.layoutInfo;
                this.container.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
            }
        }
    };
    exports.CellComments = CellComments;
    exports.CellComments = CellComments = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, themeService_1.IThemeService),
        __param(4, commentService_1.ICommentService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService)
    ], CellComments);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENvbW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsQ29tbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0J6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsMEJBQWU7UUFNaEQsWUFDa0IsY0FBdUMsRUFDdkMsU0FBc0IsRUFFbkIsaUJBQXNELEVBQzNELFlBQTRDLEVBQzFDLGNBQWdELEVBQzFDLG9CQUE0RCxFQUM1RCxvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFUUyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFDdkMsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUVGLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDekIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQWI1RSxpQkFBWSxHQUFZLEtBQUssQ0FBQztZQUM5Qix5QkFBb0IsR0FBMkMsSUFBSSxDQUFDO1lBRTNELDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQWFoRixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRixpREFBaUQ7WUFDakQsb0RBQW9EO1lBQ3BELElBQUksQ0FBQyxX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