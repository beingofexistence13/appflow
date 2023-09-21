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
    exports.EditorTitleControl = void 0;
    let EditorTitleControl = class EditorTitleControl extends themeService_1.Themable {
        get breadcrumbsControl() { return this.breadcrumbsControlFactory?.control; }
        constructor(parent, accessor, group, instantiationService, themeService) {
            super(themeService);
            this.parent = parent;
            this.accessor = accessor;
            this.group = group;
            this.instantiationService = instantiationService;
            this.editorTabsControlDisposable = this._register(new lifecycle_1.DisposableStore());
            this.breadcrumbsControlDisposables = this._register(new lifecycle_1.DisposableStore());
            this.editorTabsControl = this.createEditorTabsControl();
            this.breadcrumbsControlFactory = this.createBreadcrumbsControl();
        }
        createEditorTabsControl() {
            let control;
            if (this.accessor.partOptions.showTabs) {
                control = this.instantiationService.createInstance(multiEditorTabsControl_1.MultiEditorTabsControl, this.parent, this.accessor, this.group);
            }
            else {
                control = this.instantiationService.createInstance(singleEditorTabsControl_1.SingleEditorTabsControl, this.parent, this.accessor, this.group);
            }
            return this.editorTabsControlDisposable.add(control);
        }
        createBreadcrumbsControl() {
            if (!this.accessor.partOptions.showTabs) {
                return undefined; // single tabs have breadcrumbs inlined
            }
            // Breadcrumbs container
            const breadcrumbsContainer = document.createElement('div');
            breadcrumbsContainer.classList.add('breadcrumbs-below-tabs');
            this.parent.appendChild(breadcrumbsContainer);
            const breadcrumbsControlFactory = this.breadcrumbsControlDisposables.add(this.instantiationService.createInstance(breadcrumbsControl_1.BreadcrumbsControlFactory, breadcrumbsContainer, this.group, {
                showFileIcons: true,
                showSymbolIcons: true,
                showDecorationColors: false,
                showPlaceholder: true
            }));
            this.breadcrumbsControlDisposables.add(breadcrumbsControlFactory.onDidEnablementChange(() => this.handleBreadcrumbsEnablementChange()));
            return breadcrumbsControlFactory;
        }
        handleBreadcrumbsEnablementChange() {
            this.group.relayout(); // relayout when breadcrumbs are enable/disabled
        }
        openEditor(editor) {
            const didChange = this.editorTabsControl.openEditor(editor);
            this.handleOpenedEditors(didChange);
        }
        openEditors(editors) {
            const didChange = this.editorTabsControl.openEditors(editors);
            this.handleOpenedEditors(didChange);
        }
        handleOpenedEditors(didChange) {
            if (didChange) {
                this.breadcrumbsControl?.update();
            }
            else {
                this.breadcrumbsControl?.revealLast();
            }
        }
        beforeCloseEditor(editor) {
            return this.editorTabsControl.beforeCloseEditor(editor);
        }
        closeEditor(editor) {
            this.editorTabsControl.closeEditor(editor);
            this.handleClosedEditors();
        }
        closeEditors(editors) {
            this.editorTabsControl.closeEditors(editors);
            this.handleClosedEditors();
        }
        handleClosedEditors() {
            if (!this.group.activeEditor) {
                this.breadcrumbsControl?.update();
            }
        }
        moveEditor(editor, fromIndex, targetIndex) {
            return this.editorTabsControl.moveEditor(editor, fromIndex, targetIndex);
        }
        pinEditor(editor) {
            return this.editorTabsControl.pinEditor(editor);
        }
        stickEditor(editor) {
            return this.editorTabsControl.stickEditor(editor);
        }
        unstickEditor(editor) {
            return this.editorTabsControl.unstickEditor(editor);
        }
        setActive(isActive) {
            return this.editorTabsControl.setActive(isActive);
        }
        updateEditorLabel(editor) {
            return this.editorTabsControl.updateEditorLabel(editor);
        }
        updateEditorDirty(editor) {
            return this.editorTabsControl.updateEditorDirty(editor);
        }
        updateOptions(oldOptions, newOptions) {
            // Update editor tabs control if options changed
            if (oldOptions.showTabs !== newOptions.showTabs) {
                // Clear old
                this.editorTabsControlDisposable.clear();
                this.breadcrumbsControlDisposables.clear();
                (0, dom_1.clearNode)(this.parent);
                // Create new
                this.editorTabsControl = this.createEditorTabsControl();
                this.breadcrumbsControlFactory = this.createBreadcrumbsControl();
            }
            // Forward into editor tabs control
            this.editorTabsControl.updateOptions(oldOptions, newOptions);
        }
        layout(dimensions) {
            // Layout tabs control
            const tabsControlDimension = this.editorTabsControl.layout(dimensions);
            // Layout breadcrumbs if visible
            let breadcrumbsControlDimension = undefined;
            if (this.breadcrumbsControl?.isHidden() === false) {
                breadcrumbsControlDimension = new dom_1.Dimension(dimensions.container.width, breadcrumbsControl_1.BreadcrumbsControl.HEIGHT);
                this.breadcrumbsControl.layout(breadcrumbsControlDimension);
            }
            return new dom_1.Dimension(dimensions.container.width, tabsControlDimension.height + (breadcrumbsControlDimension ? breadcrumbsControlDimension.height : 0));
        }
        getHeight() {
            const tabsControlHeight = this.editorTabsControl.getHeight();
            const breadcrumbsControlHeight = this.breadcrumbsControl?.isHidden() === false ? breadcrumbsControl_1.BreadcrumbsControl.HEIGHT : 0;
            return {
                total: tabsControlHeight + breadcrumbsControlHeight,
                offset: tabsControlHeight
            };
        }
    };
    exports.EditorTitleControl = EditorTitleControl;
    exports.EditorTitleControl = EditorTitleControl = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService)
    ], EditorTitleControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yVGl0bGVDb250cm9sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvclRpdGxlQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2QnpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsdUJBQVE7UUFPL0MsSUFBWSxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXBGLFlBQ1MsTUFBbUIsRUFDbkIsUUFBK0IsRUFDL0IsS0FBdUIsRUFDUixvQkFBbUQsRUFDM0QsWUFBMkI7WUFFMUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBTlosV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNuQixhQUFRLEdBQVIsUUFBUSxDQUF1QjtZQUMvQixVQUFLLEdBQUwsS0FBSyxDQUFrQjtZQUNBLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFWbkUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBR3BFLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVk3RSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2xFLENBQUM7UUFFTyx1QkFBdUI7WUFDOUIsSUFBSSxPQUEwQixDQUFDO1lBQy9CLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFv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