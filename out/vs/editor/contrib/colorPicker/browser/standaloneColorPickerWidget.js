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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/contrib/colorPicker/browser/colorHoverParticipant", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/hover/browser/contentHover", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/editor/common/services/languageFeatures", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/model", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider", "vs/base/browser/dom", "vs/css!./colorPicker"], function (require, exports, lifecycle_1, colorHoverParticipant_1, instantiation_1, contentHover_1, keybinding_1, event_1, languageFeatures_1, editorExtensions_1, editorContextKeys_1, contextkey_1, model_1, languageConfigurationRegistry_1, defaultDocumentColorProvider_1, dom) {
    "use strict";
    var StandaloneColorPickerController_1, StandaloneColorPickerWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneColorPickerWidget = exports.StandaloneColorPickerController = void 0;
    let StandaloneColorPickerController = class StandaloneColorPickerController extends lifecycle_1.Disposable {
        static { StandaloneColorPickerController_1 = this; }
        static { this.ID = 'editor.contrib.standaloneColorPickerController'; }
        constructor(_editor, _contextKeyService, _modelService, _keybindingService, _instantiationService, _languageFeatureService, _languageConfigurationService) {
            super();
            this._editor = _editor;
            this._modelService = _modelService;
            this._keybindingService = _keybindingService;
            this._instantiationService = _instantiationService;
            this._languageFeatureService = _languageFeatureService;
            this._languageConfigurationService = _languageConfigurationService;
            this._standaloneColorPickerWidget = null;
            this._standaloneColorPickerVisible = editorContextKeys_1.EditorContextKeys.standaloneColorPickerVisible.bindTo(_contextKeyService);
            this._standaloneColorPickerFocused = editorContextKeys_1.EditorContextKeys.standaloneColorPickerFocused.bindTo(_contextKeyService);
        }
        showOrFocus() {
            if (!this._editor.hasModel()) {
                return;
            }
            if (!this._standaloneColorPickerVisible.get()) {
                this._standaloneColorPickerWidget = new StandaloneColorPickerWidget(this._editor, this._standaloneColorPickerVisible, this._standaloneColorPickerFocused, this._instantiationService, this._modelService, this._keybindingService, this._languageFeatureService, this._languageConfigurationService);
            }
            else if (!this._standaloneColorPickerFocused.get()) {
                this._standaloneColorPickerWidget?.focus();
            }
        }
        hide() {
            this._standaloneColorPickerFocused.set(false);
            this._standaloneColorPickerVisible.set(false);
            this._standaloneColorPickerWidget?.hide();
            this._editor.focus();
        }
        insertColor() {
            this._standaloneColorPickerWidget?.updateEditor();
            this.hide();
        }
        static get(editor) {
            return editor.getContribution(StandaloneColorPickerController_1.ID);
        }
    };
    exports.StandaloneColorPickerController = StandaloneColorPickerController;
    exports.StandaloneColorPickerController = StandaloneColorPickerController = StandaloneColorPickerController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, model_1.IModelService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, languageFeatures_1.ILanguageFeaturesService),
        __param(6, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StandaloneColorPickerController);
    (0, editorExtensions_1.registerEditorContribution)(StandaloneColorPickerController.ID, StandaloneColorPickerController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    const PADDING = 8;
    const CLOSE_BUTTON_WIDTH = 22;
    let StandaloneColorPickerWidget = class StandaloneColorPickerWidget extends lifecycle_1.Disposable {
        static { StandaloneColorPickerWidget_1 = this; }
        static { this.ID = 'editor.contrib.standaloneColorPickerWidget'; }
        constructor(_editor, _standaloneColorPickerVisible, _standaloneColorPickerFocused, _instantiationService, _modelService, _keybindingService, _languageFeaturesService, _languageConfigurationService) {
            super();
            this._editor = _editor;
            this._standaloneColorPickerVisible = _standaloneColorPickerVisible;
            this._standaloneColorPickerFocused = _standaloneColorPickerFocused;
            this._modelService = _modelService;
            this._keybindingService = _keybindingService;
            this._languageFeaturesService = _languageFeaturesService;
            this._languageConfigurationService = _languageConfigurationService;
            this.allowEditorOverflow = true;
            this._position = undefined;
            this._body = document.createElement('div');
            this._colorHover = null;
            this._selectionSetInEditor = false;
            this._onResult = this._register(new event_1.Emitter());
            this.onResult = this._onResult.event;
            this._standaloneColorPickerVisible.set(true);
            this._standaloneColorPickerParticipant = _instantiationService.createInstance(colorHoverParticipant_1.StandaloneColorPickerParticipant, this._editor);
            this._position = this._editor._getViewModel()?.getPrimaryCursorState().modelState.position;
            const editorSelection = this._editor.getSelection();
            const selection = editorSelection ?
                {
                    startLineNumber: editorSelection.startLineNumber,
                    startColumn: editorSelection.startColumn,
                    endLineNumber: editorSelection.endLineNumber,
                    endColumn: editorSelection.endColumn
                } : { startLineNumber: 0, endLineNumber: 0, endColumn: 0, startColumn: 0 };
            const focusTracker = this._register(dom.trackFocus(this._body));
            this._register(focusTracker.onDidBlur(_ => {
                this.hide();
            }));
            this._register(focusTracker.onDidFocus(_ => {
                this.focus();
            }));
            // When the cursor position changes, hide the color picker
            this._register(this._editor.onDidChangeCursorPosition(() => {
                // Do not hide the color picker when the cursor changes position due to the keybindings
                if (!this._selectionSetInEditor) {
                    this.hide();
                }
                else {
                    this._selectionSetInEditor = false;
                }
            }));
            this._register(this._editor.onMouseMove((e) => {
                const classList = e.target.element?.classList;
                if (classList && classList.contains('colorpicker-color-decoration')) {
                    this.hide();
                }
            }));
            this._register(this.onResult((result) => {
                this._render(result.value, result.foundInEditor);
            }));
            this._start(selection);
            this._body.style.zIndex = '50';
            this._editor.addContentWidget(this);
        }
        updateEditor() {
            if (this._colorHover) {
                this._standaloneColorPickerParticipant.updateEditorModel(this._colorHover);
            }
        }
        getId() {
            return StandaloneColorPickerWidget_1.ID;
        }
        getDomNode() {
            return this._body;
        }
        getPosition() {
            if (!this._position) {
                return null;
            }
            const positionPreference = this._editor.getOption(60 /* EditorOption.hover */).above;
            return {
                position: this._position,
                secondaryPosition: this._position,
                preference: positionPreference ? [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */] : [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */],
                positionAffinity: 2 /* PositionAffinity.None */
            };
        }
        hide() {
            this.dispose();
            this._standaloneColorPickerVisible.set(false);
            this._standaloneColorPickerFocused.set(false);
            this._editor.removeContentWidget(this);
            this._editor.focus();
        }
        focus() {
            this._standaloneColorPickerFocused.set(true);
            this._body.focus();
        }
        async _start(selection) {
            const computeAsyncResult = await this._computeAsync(selection);
            if (!computeAsyncResult) {
                return;
            }
            this._onResult.fire(new StandaloneColorPickerResult(computeAsyncResult.result, computeAsyncResult.foundInEditor));
        }
        async _computeAsync(range) {
            if (!this._editor.hasModel()) {
                return null;
            }
            const colorInfo = {
                range: range,
                color: { red: 0, green: 0, blue: 0, alpha: 1 }
            };
            const colorHoverResult = await this._standaloneColorPickerParticipant.createColorHover(colorInfo, new defaultDocumentColorProvider_1.DefaultDocumentColorProvider(this._modelService, this._languageConfigurationService), this._languageFeaturesService.colorProvider);
            if (!colorHoverResult) {
                return null;
            }
            return { result: colorHoverResult.colorHover, foundInEditor: colorHoverResult.foundInEditor };
        }
        _render(colorHover, foundInEditor) {
            const fragment = document.createDocumentFragment();
            const statusBar = this._register(new contentHover_1.EditorHoverStatusBar(this._keybindingService));
            let colorPickerWidget;
            const context = {
                fragment,
                statusBar,
                setColorPicker: (widget) => colorPickerWidget = widget,
                onContentsChanged: () => { },
                hide: () => this.hide()
            };
            this._colorHover = colorHover;
            this._register(this._standaloneColorPickerParticipant.renderHoverParts(context, [colorHover]));
            if (colorPickerWidget === undefined) {
                return;
            }
            this._body.classList.add('standalone-colorpicker-body');
            this._body.style.maxHeight = Math.max(this._editor.getLayoutInfo().height / 4, 250) + 'px';
            this._body.style.maxWidth = Math.max(this._editor.getLayoutInfo().width * 0.66, 500) + 'px';
            this._body.tabIndex = 0;
            this._body.appendChild(fragment);
            colorPickerWidget.layout();
            const colorPickerBody = colorPickerWidget.body;
            const saturationBoxWidth = colorPickerBody.saturationBox.domNode.clientWidth;
            const widthOfOriginalColorBox = colorPickerBody.domNode.clientWidth - saturationBoxWidth - CLOSE_BUTTON_WIDTH - PADDING;
            const enterButton = colorPickerWidget.body.enterButton;
            enterButton?.onClicked(() => {
                this.updateEditor();
                this.hide();
            });
            const colorPickerHeader = colorPickerWidget.header;
            const pickedColorNode = colorPickerHeader.pickedColorNode;
            pickedColorNode.style.width = saturationBoxWidth + PADDING + 'px';
            const originalColorNode = colorPickerHeader.originalColorNode;
            originalColorNode.style.width = widthOfOriginalColorBox + 'px';
            const closeButton = colorPickerWidget.header.closeButton;
            closeButton?.onClicked(() => {
                this.hide();
            });
            // When found in the editor, highlight the selection in the editor
            if (foundInEditor) {
                if (enterButton) {
                    enterButton.button.textContent = 'Replace';
                }
                this._selectionSetInEditor = true;
                this._editor.setSelection(colorHover.range);
            }
            this._editor.layoutContentWidget(this);
        }
    };
    exports.StandaloneColorPickerWidget = StandaloneColorPickerWidget;
    exports.StandaloneColorPickerWidget = StandaloneColorPickerWidget = StandaloneColorPickerWidget_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, model_1.IModelService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, languageFeatures_1.ILanguageFeaturesService),
        __param(7, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StandaloneColorPickerWidget);
    class StandaloneColorPickerResult {
        // The color picker result consists of: an array of color results and a boolean indicating if the color was found in the editor
        constructor(value, foundInEditor) {
            this.value = value;
            this.foundInEditor = foundInEditor;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvbG9yUGlja2VyV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29sb3JQaWNrZXIvYnJvd3Nlci9zdGFuZGFsb25lQ29sb3JQaWNrZXJXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSxzQkFBVTs7aUJBRWhELE9BQUUsR0FBRyxnREFBZ0QsQUFBbkQsQ0FBb0Q7UUFLcEUsWUFDa0IsT0FBb0IsRUFDakIsa0JBQXNDLEVBQzNDLGFBQTZDLEVBQ3hDLGtCQUF1RCxFQUNwRCxxQkFBNkQsRUFDMUQsdUJBQWtFLEVBQzdELDZCQUE2RTtZQUU1RyxLQUFLLEVBQUUsQ0FBQztZQVJTLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFFTCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ25DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDekMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUM1QyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBWHJHLGlDQUE0QixHQUF1QyxJQUFJLENBQUM7WUFjL0UsSUFBSSxDQUFDLDZCQUE2QixHQUFHLHFDQUFpQixDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQy9HLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxxQ0FBaUIsQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoSCxDQUFDO1FBRU0sV0FBVztZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0IsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7YUFDclM7aUJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDckQsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEtBQUssRUFBRSxDQUFDO2FBQzNDO1FBQ0YsQ0FBQztRQUVNLElBQUk7WUFDVixJQUFJLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLElBQUksRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVNLFdBQVc7WUFDakIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLFlBQVksRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFFTSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBa0MsaUNBQStCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEcsQ0FBQzs7SUE5Q1csMEVBQStCOzhDQUEvQiwrQkFBK0I7UUFTekMsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLDZEQUE2QixDQUFBO09BZG5CLCtCQUErQixDQStDM0M7SUFFRCxJQUFBLDZDQUEwQixFQUFDLCtCQUErQixDQUFDLEVBQUUsRUFBRSwrQkFBK0IsMkRBQW1ELENBQUM7SUFFbEosTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBRXZCLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7O2lCQUUxQyxPQUFFLEdBQUcsNENBQTRDLEFBQS9DLENBQWdEO1FBYWxFLFlBQ2tCLE9BQW9CLEVBQ3BCLDZCQUFtRCxFQUNuRCw2QkFBbUQsRUFDN0MscUJBQTRDLEVBQ3BELGFBQTZDLEVBQ3hDLGtCQUF1RCxFQUNqRCx3QkFBbUUsRUFDOUQsNkJBQTZFO1lBRTVHLEtBQUssRUFBRSxDQUFDO1lBVFMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNwQixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQXNCO1lBQ25ELGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBc0I7WUFFcEMsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNoQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQzdDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFwQnBHLHdCQUFtQixHQUFHLElBQUksQ0FBQztZQUVuQixjQUFTLEdBQXlCLFNBQVMsQ0FBQztZQUdyRCxVQUFLLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsZ0JBQVcsR0FBc0MsSUFBSSxDQUFDO1lBQ3RELDBCQUFxQixHQUFZLEtBQUssQ0FBQztZQUU5QixjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBK0IsQ0FBQyxDQUFDO1lBQ3hFLGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQWEvQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsd0RBQWdDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDM0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsQ0FBQztnQkFDbEM7b0JBQ0MsZUFBZSxFQUFFLGVBQWUsQ0FBQyxlQUFlO29CQUNoRCxXQUFXLEVBQUUsZUFBZSxDQUFDLFdBQVc7b0JBQ3hDLGFBQWEsRUFBRSxlQUFlLENBQUMsYUFBYTtvQkFDNUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxTQUFTO2lCQUNwQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM1RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osMERBQTBEO1lBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFELHVGQUF1RjtnQkFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNaO3FCQUFNO29CQUNOLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7aUJBQ25DO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO2dCQUM5QyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDLEVBQUU7b0JBQ3BFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDWjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVNLFlBQVk7WUFDbEIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixJQUFJLENBQUMsaUNBQWlDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzNFO1FBQ0YsQ0FBQztRQUVNLEtBQUs7WUFDWCxPQUFPLDZCQUEyQixDQUFDLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRU0sVUFBVTtZQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbkIsQ0FBQztRQUVNLFdBQVc7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw2QkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFDNUUsT0FBTztnQkFDTixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3hCLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUNqQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLDhGQUE4RSxDQUFDLENBQUMsQ0FBQyw4RkFBOEU7Z0JBQ2hNLGdCQUFnQiwrQkFBdUI7YUFDdkMsQ0FBQztRQUNILENBQUM7UUFFTSxJQUFJO1lBQ1YsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFpQjtZQUNyQyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQTJCLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDbkgsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBYTtZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE1BQU0sU0FBUyxHQUFzQjtnQkFDcEMsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTthQUM5QyxDQUFDO1lBQ0YsTUFBTSxnQkFBZ0IsR0FBOEUsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksMkRBQTRCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcFQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQy9GLENBQUM7UUFFTyxPQUFPLENBQUMsVUFBc0MsRUFBRSxhQUFzQjtZQUM3RSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNuRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbUNBQW9CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLGlCQUFnRCxDQUFDO1lBRXJELE1BQU0sT0FBTyxHQUE4QjtnQkFDMUMsUUFBUTtnQkFDUixTQUFTO2dCQUNULGNBQWMsRUFBRSxDQUFDLE1BQXlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixHQUFHLE1BQU07Z0JBQ3pFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQzVCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2FBQ3ZCLENBQUM7WUFFRixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0YsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1RixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFM0IsTUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1lBQy9DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQzdFLE1BQU0sdUJBQXVCLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsT0FBTyxDQUFDO1lBQ3hILE1BQU0sV0FBVyxHQUF3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzVFLFdBQVcsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUMzQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7WUFDbkQsTUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxDQUFDO1lBQzFELGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGtCQUFrQixHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbEUsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztZQUM5RCxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLHVCQUF1QixHQUFHLElBQUksQ0FBQztZQUMvRCxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ3pELFdBQVcsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUMzQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUNILGtFQUFrRTtZQUNsRSxJQUFJLGFBQWEsRUFBRTtnQkFDbEIsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztpQkFDM0M7Z0JBQ0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDOztJQXJMVyxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQW1CckMsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsMkNBQXdCLENBQUE7UUFDeEIsV0FBQSw2REFBNkIsQ0FBQTtPQXZCbkIsMkJBQTJCLENBc0x2QztJQUVELE1BQU0sMkJBQTJCO1FBQ2hDLCtIQUErSDtRQUMvSCxZQUNpQixLQUFpQyxFQUNqQyxhQUFzQjtZQUR0QixVQUFLLEdBQUwsS0FBSyxDQUE0QjtZQUNqQyxrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUNuQyxDQUFDO0tBQ0wifQ==