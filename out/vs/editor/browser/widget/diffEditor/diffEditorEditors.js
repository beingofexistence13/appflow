var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/overviewRulerPart", "vs/editor/common/config/editorOptions", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding"], function (require, exports, event_1, lifecycle_1, observable_1, overviewRulerPart_1, editorOptions_1, nls_1, instantiation_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorEditors = void 0;
    let DiffEditorEditors = class DiffEditorEditors extends lifecycle_1.Disposable {
        get onDidContentSizeChange() { return this._onDidContentSizeChange.event; }
        constructor(originalEditorElement, modifiedEditorElement, _options, codeEditorWidgetOptions, _createInnerEditor, _instantiationService, _keybindingService) {
            super();
            this.originalEditorElement = originalEditorElement;
            this.modifiedEditorElement = modifiedEditorElement;
            this._options = _options;
            this._createInnerEditor = _createInnerEditor;
            this._instantiationService = _instantiationService;
            this._keybindingService = _keybindingService;
            this._onDidContentSizeChange = this._register(new event_1.Emitter());
            this.original = this._register(this._createLeftHandSideEditor(_options.editorOptions.get(), codeEditorWidgetOptions.originalEditor || {}));
            this.modified = this._register(this._createRightHandSideEditor(_options.editorOptions.get(), codeEditorWidgetOptions.modifiedEditor || {}));
            this.modifiedModel = (0, observable_1.observableFromEvent)(this.modified.onDidChangeModel, () => this.modified.getModel());
            this._register((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary: () => ({}),
                handleChange: (ctx, changeSummary) => {
                    if (ctx.didChange(_options.editorOptions)) {
                        Object.assign(changeSummary, ctx.change.changedOptions);
                    }
                    return true;
                }
            }, (reader, changeSummary) => {
                /** @description update editor options */
                _options.editorOptions.read(reader);
                this._options.renderSideBySide.read(reader);
                this.modified.updateOptions(this._adjustOptionsForRightHandSide(reader, changeSummary));
                this.original.updateOptions(this._adjustOptionsForLeftHandSide(reader, changeSummary));
            }));
        }
        _createLeftHandSideEditor(options, codeEditorWidgetOptions) {
            const leftHandSideOptions = this._adjustOptionsForLeftHandSide(undefined, options);
            const editor = this._constructInnerEditor(this._instantiationService, this.originalEditorElement, leftHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffLeftEditor', true);
            return editor;
        }
        _createRightHandSideEditor(options, codeEditorWidgetOptions) {
            const rightHandSideOptions = this._adjustOptionsForRightHandSide(undefined, options);
            const editor = this._constructInnerEditor(this._instantiationService, this.modifiedEditorElement, rightHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffRightEditor', true);
            return editor;
        }
        _constructInnerEditor(instantiationService, container, options, editorWidgetOptions) {
            const editor = this._createInnerEditor(instantiationService, container, options, editorWidgetOptions);
            this._register(editor.onDidContentSizeChange(e => {
                const width = this.original.getContentWidth() + this.modified.getContentWidth() + overviewRulerPart_1.OverviewRulerPart.ENTIRE_DIFF_OVERVIEW_WIDTH;
                const height = Math.max(this.modified.getContentHeight(), this.original.getContentHeight());
                this._onDidContentSizeChange.fire({
                    contentHeight: height,
                    contentWidth: width,
                    contentHeightChanged: e.contentHeightChanged,
                    contentWidthChanged: e.contentWidthChanged
                });
            }));
            return editor;
        }
        _adjustOptionsForLeftHandSide(_reader, changedOptions) {
            const result = this._adjustOptionsForSubEditor(changedOptions);
            if (!this._options.renderSideBySide.get()) {
                // never wrap hidden editor
                result.wordWrapOverride1 = 'off';
                result.wordWrapOverride2 = 'off';
                result.stickyScroll = { enabled: false };
                // Disable unicode highlighting for the original side in inline mode, as they are not shown anyway.
                result.unicodeHighlight = { nonBasicASCII: false, ambiguousCharacters: false, invisibleCharacters: false };
            }
            else {
                result.unicodeHighlight = this._options.editorOptions.get().unicodeHighlight || {};
                result.wordWrapOverride1 = this._options.diffWordWrap.get();
            }
            if (changedOptions.originalAriaLabel) {
                result.ariaLabel = changedOptions.originalAriaLabel;
            }
            result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
            result.readOnly = !this._options.originalEditable.get();
            result.dropIntoEditor = { enabled: !result.readOnly };
            result.extraEditorClassName = 'original-in-monaco-diff-editor';
            return result;
        }
        _adjustOptionsForRightHandSide(reader, changedOptions) {
            const result = this._adjustOptionsForSubEditor(changedOptions);
            if (changedOptions.modifiedAriaLabel) {
                result.ariaLabel = changedOptions.modifiedAriaLabel;
            }
            result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
            result.wordWrapOverride1 = this._options.diffWordWrap.get();
            result.revealHorizontalRightPadding = editorOptions_1.EditorOptions.revealHorizontalRightPadding.defaultValue + overviewRulerPart_1.OverviewRulerPart.ENTIRE_DIFF_OVERVIEW_WIDTH;
            result.scrollbar.verticalHasArrows = false;
            result.extraEditorClassName = 'modified-in-monaco-diff-editor';
            return result;
        }
        _adjustOptionsForSubEditor(options) {
            const clonedOptions = {
                ...options,
                dimension: {
                    height: 0,
                    width: 0
                },
            };
            clonedOptions.inDiffEditor = true;
            clonedOptions.automaticLayout = false;
            // Clone scrollbar options before changing them
            clonedOptions.scrollbar = { ...(clonedOptions.scrollbar || {}) };
            clonedOptions.scrollbar.vertical = 'visible';
            clonedOptions.folding = false;
            clonedOptions.codeLens = this._options.diffCodeLens.get();
            clonedOptions.fixedOverflowWidgets = true;
            // Clone minimap options before changing them
            clonedOptions.minimap = { ...(clonedOptions.minimap || {}) };
            clonedOptions.minimap.enabled = false;
            if (this._options.hideUnchangedRegions.get()) {
                clonedOptions.stickyScroll = { enabled: false };
            }
            else {
                clonedOptions.stickyScroll = this._options.editorOptions.get().stickyScroll;
            }
            return clonedOptions;
        }
        _updateAriaLabel(ariaLabel) {
            if (!ariaLabel) {
                ariaLabel = '';
            }
            const ariaNavigationTip = (0, nls_1.localize)('diff-aria-navigation-tip', ' use {0} to open the accessibility help.', this._keybindingService.lookupKeybinding('editor.action.accessibilityHelp')?.getAriaLabel());
            if (this._options.accessibilityVerbose.get()) {
                return ariaLabel + ariaNavigationTip;
            }
            else if (ariaLabel) {
                return ariaLabel.replaceAll(ariaNavigationTip, '');
            }
            return '';
        }
    };
    exports.DiffEditorEditors = DiffEditorEditors;
    exports.DiffEditorEditors = DiffEditorEditors = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, keybinding_1.IKeybindingService)
    ], DiffEditorEditors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvckVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kaWZmRWRpdG9yRWRpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBb0JPLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFLaEQsSUFBVyxzQkFBc0IsS0FBSyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBSWxGLFlBQ2tCLHFCQUFrQyxFQUNsQyxxQkFBa0MsRUFDbEMsUUFBMkIsRUFDNUMsdUJBQXFELEVBQ3BDLGtCQUErTCxFQUN6TCxxQkFBNkQsRUFDaEUsa0JBQXVEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBUlMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFhO1lBQ2xDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBYTtZQUNsQyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUUzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTZLO1lBQ3hLLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQVozRCw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE0QixDQUFDLENBQUM7WUFnQmxHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FB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