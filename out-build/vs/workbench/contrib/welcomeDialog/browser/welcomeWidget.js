/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/button/button", "vs/base/common/labels", "vs/platform/theme/browser/defaultStyles", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/nls!vs/workbench/contrib/welcomeDialog/browser/welcomeWidget", "vs/base/common/themables", "vs/base/common/codicons", "vs/base/common/linkedText", "vs/platform/opener/browser/link", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/formattedTextRenderer", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/css!./media/welcomeWidget"], function (require, exports, lifecycle_1, dom_1, htmlContent_1, markdownRenderer_1, button_1, labels_1, defaultStyles_1, actions_1, actionbar_1, nls_1, themables_1, codicons_1, linkedText_1, link_1, iconLabels_1, formattedTextRenderer_1, themeService_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$14b = void 0;
    class $14b extends lifecycle_1.$kc {
        constructor(g, h, j, m, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.f = this.h.createInstance(markdownRenderer_1.$K2, {});
            this.t = false;
            this.a = document.createElement('div');
            this.a.className = 'welcome-widget';
            this.b = this.a.appendChild((0, dom_1.$)('.monaco-dialog-box'));
            this.b.setAttribute('role', 'dialog');
            (0, dom_1.$eP)(this.a);
            this.c = this.b.appendChild((0, dom_1.$)('.dialog-message-container'));
        }
        async executeCommand(commandId, ...args) {
            try {
                await this.j.executeCommand(commandId, ...args);
                this.m.publicLog2('workbenchActionExecuted', {
                    id: commandId,
                    from: 'welcomeWidget'
                });
            }
            catch (ex) {
            }
        }
        async render(title, message, buttonText, buttonAction) {
            if (!this.g._getViewModel()) {
                return;
            }
            await this.r(title, message, buttonText, buttonAction);
            this.g.addOverlayWidget(this);
            this.u();
            this.m.publicLog2('workbenchActionExecuted', {
                id: 'welcomeWidgetRendered',
                from: 'welcomeWidget'
            });
        }
        async r(title, message, buttonText, buttonAction) {
            const actionBar = this.B(new actionbar_1.$1P(this.b, {}));
            const action = this.B(new actions_1.$gi('dialog.close', (0, nls_1.localize)(0, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.dialogClose), true, async () => {
                this.w();
            }));
            actionBar.push(action, { icon: true, label: false });
            const renderBody = (message, icon) => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true, supportHtml: true });
                mds.appendMarkdown(`<a class="copilot">$(${icon})</a>`);
                mds.appendMarkdown(message);
                return mds;
            };
            const titleElement = this.c.appendChild((0, dom_1.$)('#monaco-dialog-message-detail.dialog-message-detail-title'));
            const titleElementMdt = this.f.render(renderBody(title, 'zap'));
            titleElement.appendChild(titleElementMdt.element);
            this.s(this.c, message.split('\n').filter(x => x).map(text => (0, linkedText_1.$IS)(text)));
            const buttonsRowElement = this.c.appendChild((0, dom_1.$)('.dialog-buttons-row'));
            const buttonContainer = buttonsRowElement.appendChild((0, dom_1.$)('.dialog-buttons'));
            const buttonBar = this.B(new button_1.$0Q(buttonContainer));
            const primaryButton = this.B(buttonBar.addButtonWithDescription({ title: true, secondary: false, ...defaultStyles_1.$i2 }));
            primaryButton.label = (0, labels_1.$lA)(buttonText, true);
            this.B(primaryButton.onDidClick(async () => {
                await this.executeCommand(buttonAction);
            }));
            buttonBar.buttons[0].focus();
        }
        s(container, text) {
            for (const linkedText of text) {
                const p = (0, dom_1.$0O)(container, (0, dom_1.$)('p'));
                for (const node of linkedText.nodes) {
                    if (typeof node === 'string') {
                        const labelWithIcon = (0, iconLabels_1.$xQ)(node);
                        for (const element of labelWithIcon) {
                            if (typeof element === 'string') {
                                p.appendChild((0, formattedTextRenderer_1.$7P)(element, { inline: true, renderCodeSegments: true }));
                            }
                            else {
                                p.appendChild(element);
                            }
                        }
                    }
                    else {
                        const link = this.h.createInstance(link_1.$40, p, node, {
                            opener: (href) => {
                                this.m.publicLog2('workbenchActionExecuted', {
                                    id: 'welcomeWidetLinkAction',
                                    from: 'welcomeWidget'
                                });
                                this.n.open(href, { allowCommands: true });
                            }
                        });
                        this.B(link);
                    }
                }
            }
            return container;
        }
        getId() {
            return 'editor.contrib.welcomeWidget';
        }
        getDomNode() {
            return this.a;
        }
        getPosition() {
            return {
                preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
            };
        }
        u() {
            if (this.t) {
                return;
            }
            this.t = true;
            this.a.style.display = 'block';
        }
        w() {
            if (!this.t) {
                return;
            }
            this.t = true;
            this.a.style.display = 'none';
            this.g.removeOverlayWidget(this);
            this.m.publicLog2('workbenchActionExecuted', {
                id: 'welcomeWidgetDismissed',
                from: 'welcomeWidget'
            });
        }
    }
    exports.$14b = $14b;
    (0, themeService_1.$mv)((theme, collector) => {
        const addBackgroundColorRule = (selector, color) => {
            if (color) {
                collector.addRule(`.monaco-editor ${selector} { background-color: ${color}; }`);
            }
        };
        const widgetBackground = theme.getColor(colorRegistry_1.$Aw);
        addBackgroundColorRule('.welcome-widget', widgetBackground);
        const widgetShadowColor = theme.getColor(colorRegistry_1.$Kv);
        if (widgetShadowColor) {
            collector.addRule(`.welcome-widget { box-shadow: 0 0 8px 2px ${widgetShadowColor}; }`);
        }
        const widgetBorderColor = theme.getColor(colorRegistry_1.$Lv);
        if (widgetBorderColor) {
            collector.addRule(`.welcome-widget { border-left: 1px solid ${widgetBorderColor}; border-right: 1px solid ${widgetBorderColor}; border-bottom: 1px solid ${widgetBorderColor}; }`);
        }
        const hcBorder = theme.getColor(colorRegistry_1.$Av);
        if (hcBorder) {
            collector.addRule(`.welcome-widget { border: 1px solid ${hcBorder}; }`);
        }
        const foreground = theme.getColor(colorRegistry_1.$Bw);
        if (foreground) {
            collector.addRule(`.welcome-widget { color: ${foreground}; }`);
        }
    });
});
//# sourceMappingURL=welcomeWidget.js.map