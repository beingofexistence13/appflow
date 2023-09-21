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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/exceptionWidget", "vs/base/browser/dom", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/workbench/contrib/debug/common/debug", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/debug/browser/linkDetector", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/theme/common/iconRegistry", "vs/css!./media/exceptionWidget"], function (require, exports, nls, dom, zoneWidget_1, debug_1, async_1, themeService_1, themables_1, colorRegistry_1, instantiation_1, linkDetector_1, actionbar_1, actions_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ARb = void 0;
    const $ = dom.$;
    // theming
    const debugExceptionWidgetBorder = (0, colorRegistry_1.$sv)('debugExceptionWidget.border', { dark: '#a31515', light: '#a31515', hcDark: '#a31515', hcLight: '#a31515' }, nls.localize(0, null));
    const debugExceptionWidgetBackground = (0, colorRegistry_1.$sv)('debugExceptionWidget.background', { dark: '#420b0d', light: '#f1dfde', hcDark: '#420b0d', hcLight: '#f1dfde' }, nls.localize(1, null));
    let $ARb = class $ARb extends zoneWidget_1.$z3 {
        constructor(editor, b, c, themeService, d) {
            super(editor, { showFrame: true, showArrow: true, isAccessible: true, frameWidth: 1, className: 'exception-widget-container' });
            this.b = b;
            this.c = c;
            this.d = d;
            this.h(themeService.getColorTheme());
            this.o.add(themeService.onDidColorThemeChange(this.h.bind(this)));
            this.create();
            const onDidLayoutChangeScheduler = new async_1.$Sg(() => this.G(undefined, undefined), 50);
            this.o.add(this.editor.onDidLayoutChange(() => onDidLayoutChangeScheduler.schedule()));
            this.o.add(onDidLayoutChangeScheduler);
        }
        h(theme) {
            this.a = theme.getColor(debugExceptionWidgetBackground);
            const frameColor = theme.getColor(debugExceptionWidgetBorder);
            this.style({
                arrowColor: frameColor,
                frameColor: frameColor
            }); // style() will trigger _applyStyles
        }
        q() {
            if (this.container) {
                this.container.style.backgroundColor = this.a ? this.a.toString() : '';
            }
            super.q();
        }
        E(container) {
            this.D('exception-widget');
            // Set the font size and line height to the one from the editor configuration.
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            container.style.fontSize = `${fontInfo.fontSize}px`;
            container.style.lineHeight = `${fontInfo.lineHeight}px`;
            container.tabIndex = 0;
            const title = $('.title');
            const label = $('.label');
            dom.$0O(title, label);
            const actions = $('.actions');
            dom.$0O(title, actions);
            label.textContent = this.b.id ? nls.localize(2, null, this.b.id) : nls.localize(3, null);
            let ariaLabel = label.textContent;
            const actionBar = new actionbar_1.$1P(actions);
            actionBar.push(new actions_1.$gi('editor.closeExceptionWidget', nls.localize(4, null), themables_1.ThemeIcon.asClassName(iconRegistry_1.$_u), true, async () => {
                const contribution = this.editor.getContribution(debug_1.$hH);
                contribution?.closeExceptionWidget();
            }), { label: false, icon: true });
            dom.$0O(container, title);
            if (this.b.description) {
                const description = $('.description');
                description.textContent = this.b.description;
                ariaLabel += ', ' + this.b.description;
                dom.$0O(container, description);
            }
            if (this.b.details && this.b.details.stackTrace) {
                const stackTrace = $('.stack-trace');
                const linkDetector = this.d.createInstance(linkDetector_1.$2Pb);
                const linkedStackTrace = linkDetector.linkify(this.b.details.stackTrace, true, this.c ? this.c.root : undefined);
                stackTrace.appendChild(linkedStackTrace);
                dom.$0O(container, stackTrace);
                ariaLabel += ', ' + this.b.details.stackTrace;
            }
            container.setAttribute('aria-label', ariaLabel);
        }
        G(_heightInPixel, _widthInPixel) {
            // Reload the height with respect to the exception text content and relayout it to match the line count.
            this.container.style.height = 'initial';
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            const arrowHeight = Math.round(lineHeight / 3);
            const computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
            this.H(computedLinesNumber);
        }
        focus() {
            // Focus into the container for accessibility purposes so the exception and stack trace gets read
            this.container?.focus();
        }
        hasFocus() {
            return dom.$NO(document.activeElement, this.container);
        }
    };
    exports.$ARb = $ARb;
    exports.$ARb = $ARb = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, instantiation_1.$Ah)
    ], $ARb);
});
//# sourceMappingURL=exceptionWidget.js.map