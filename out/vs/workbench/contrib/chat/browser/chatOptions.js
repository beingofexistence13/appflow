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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/workbench/common/views"], function (require, exports, event_1, lifecycle_1, configuration_1, themeService_1, views_1) {
    "use strict";
    var ChatEditorOptions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatEditorOptions = void 0;
    let ChatEditorOptions = class ChatEditorOptions extends lifecycle_1.Disposable {
        static { ChatEditorOptions_1 = this; }
        static { this.lineHeightEm = 1.4; }
        get configuration() {
            return this._config;
        }
        static { this.relevantSettingIds = [
            'chat.editor.lineHeight',
            'chat.editor.fontSize',
            'chat.editor.fontFamily',
            'chat.editor.fontWeight',
            'chat.editor.wordWrap',
            'editor.cursorBlinking',
            'editor.fontLigatures',
            'editor.accessibilitySupport',
            'editor.bracketPairColorization.enabled',
            'editor.bracketPairColorization.independentColorPoolPerBracketType',
        ]; }
        constructor(viewId, foreground, inputEditorBackgroundColor, resultEditorBackgroundColor, configurationService, themeService, viewDescriptorService) {
            super();
            this.foreground = foreground;
            this.inputEditorBackgroundColor = inputEditorBackgroundColor;
            this.resultEditorBackgroundColor = resultEditorBackgroundColor;
            this.configurationService = configurationService;
            this.themeService = themeService;
            this.viewDescriptorService = viewDescriptorService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this.themeService.onDidColorThemeChange(e => this.update()));
            this._register(this.viewDescriptorService.onDidChangeLocation(e => {
                if (e.views.some(v => v.id === viewId)) {
                    this.update();
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (ChatEditorOptions_1.relevantSettingIds.some(id => e.affectsConfiguration(id))) {
                    this.update();
                }
            }));
            this.update();
        }
        update() {
            const editorConfig = this.configurationService.getValue('editor');
            // TODO shouldn't the setting keys be more specific?
            const chatEditorConfig = this.configurationService.getValue('chat')?.editor;
            const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
            this._config = {
                foreground: this.themeService.getColorTheme().getColor(this.foreground),
                inputEditor: {
                    backgroundColor: this.themeService.getColorTheme().getColor(this.inputEditorBackgroundColor),
                    accessibilitySupport,
                },
                resultEditor: {
                    backgroundColor: this.themeService.getColorTheme().getColor(this.resultEditorBackgroundColor),
                    fontSize: chatEditorConfig.fontSize,
                    fontFamily: chatEditorConfig.fontFamily === 'default' ? editorConfig.fontFamily : chatEditorConfig.fontFamily,
                    fontWeight: chatEditorConfig.fontWeight,
                    lineHeight: chatEditorConfig.lineHeight ? chatEditorConfig.lineHeight : ChatEditorOptions_1.lineHeightEm * chatEditorConfig.fontSize,
                    bracketPairColorization: {
                        enabled: this.configurationService.getValue('editor.bracketPairColorization.enabled'),
                        independentColorPoolPerBracketType: this.configurationService.getValue('editor.bracketPairColorization.independentColorPoolPerBracketType'),
                    },
                    wordWrap: chatEditorConfig.wordWrap,
                    fontLigatures: editorConfig.fontLigatures,
                }
            };
            this._onDidChange.fire();
        }
    };
    exports.ChatEditorOptions = ChatEditorOptions;
    exports.ChatEditorOptions = ChatEditorOptions = ChatEditorOptions_1 = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, views_1.IViewDescriptorService)
    ], ChatEditorOptions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdE9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStDekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBVTs7aUJBQ3hCLGlCQUFZLEdBQUcsR0FBRyxBQUFOLENBQU87UUFNM0MsSUFBVyxhQUFhO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO2lCQUV1Qix1QkFBa0IsR0FBRztZQUM1Qyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLHdCQUF3QjtZQUN4Qix3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLHVCQUF1QjtZQUN2QixzQkFBc0I7WUFDdEIsNkJBQTZCO1lBQzdCLHdDQUF3QztZQUN4QyxtRUFBbUU7U0FDbkUsQUFYeUMsQ0FXeEM7UUFFRixZQUNDLE1BQTBCLEVBQ1QsVUFBa0IsRUFDbEIsMEJBQWtDLEVBQ2xDLDJCQUFtQyxFQUM3QixvQkFBNEQsRUFDcEUsWUFBNEMsRUFDbkMscUJBQThEO1lBRXRGLEtBQUssRUFBRSxDQUFDO1lBUFMsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUNsQiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQVE7WUFDbEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFRO1lBQ1oseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNuRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNsQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBNUJ0RSxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENB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