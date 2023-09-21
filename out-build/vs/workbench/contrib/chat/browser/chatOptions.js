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
    var $VGb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VGb = void 0;
    let $VGb = class $VGb extends lifecycle_1.$kc {
        static { $VGb_1 = this; }
        static { this.a = 1.4; }
        get configuration() {
            return this.c;
        }
        static { this.f = [
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
        constructor(viewId, g, h, j, m, n, r) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.B(this.n.onDidColorThemeChange(e => this.s()));
            this.B(this.r.onDidChangeLocation(e => {
                if (e.views.some(v => v.id === viewId)) {
                    this.s();
                }
            }));
            this.B(this.m.onDidChangeConfiguration(e => {
                if ($VGb_1.f.some(id => e.affectsConfiguration(id))) {
                    this.s();
                }
            }));
            this.s();
        }
        s() {
            const editorConfig = this.m.getValue('editor');
            // TODO shouldn't the setting keys be more specific?
            const chatEditorConfig = this.m.getValue('chat')?.editor;
            const accessibilitySupport = this.m.getValue('editor.accessibilitySupport');
            this.c = {
                foreground: this.n.getColorTheme().getColor(this.g),
                inputEditor: {
                    backgroundColor: this.n.getColorTheme().getColor(this.h),
                    accessibilitySupport,
                },
                resultEditor: {
                    backgroundColor: this.n.getColorTheme().getColor(this.j),
                    fontSize: chatEditorConfig.fontSize,
                    fontFamily: chatEditorConfig.fontFamily === 'default' ? editorConfig.fontFamily : chatEditorConfig.fontFamily,
                    fontWeight: chatEditorConfig.fontWeight,
                    lineHeight: chatEditorConfig.lineHeight ? chatEditorConfig.lineHeight : $VGb_1.a * chatEditorConfig.fontSize,
                    bracketPairColorization: {
                        enabled: this.m.getValue('editor.bracketPairColorization.enabled'),
                        independentColorPoolPerBracketType: this.m.getValue('editor.bracketPairColorization.independentColorPoolPerBracketType'),
                    },
                    wordWrap: chatEditorConfig.wordWrap,
                    fontLigatures: editorConfig.fontLigatures,
                }
            };
            this.b.fire();
        }
    };
    exports.$VGb = $VGb;
    exports.$VGb = $VGb = $VGb_1 = __decorate([
        __param(4, configuration_1.$8h),
        __param(5, themeService_1.$gv),
        __param(6, views_1.$_E)
    ], $VGb);
});
//# sourceMappingURL=chatOptions.js.map