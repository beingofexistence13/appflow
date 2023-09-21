/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/button/button", "vs/base/common/labels", "vs/platform/theme/browser/defaultStyles", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/nls", "vs/base/common/themables", "vs/base/common/codicons", "vs/base/common/linkedText", "vs/platform/opener/browser/link", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/formattedTextRenderer", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/css!./media/welcomeWidget"], function (require, exports, lifecycle_1, dom_1, htmlContent_1, markdownRenderer_1, button_1, labels_1, defaultStyles_1, actions_1, actionbar_1, nls_1, themables_1, codicons_1, linkedText_1, link_1, iconLabels_1, formattedTextRenderer_1, themeService_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WelcomeWidget = void 0;
    class WelcomeWidget extends lifecycle_1.Disposable {
        constructor(_editor, instantiationService, commandService, telemetryService, openerService) {
            super();
            this._editor = _editor;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.openerService = openerService;
            this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            this._isVisible = false;
            this._rootDomNode = document.createElement('div');
            this._rootDomNode.className = 'welcome-widget';
            this.element = this._rootDomNode.appendChild((0, dom_1.$)('.monaco-dialog-box'));
            this.element.setAttribute('role', 'dialog');
            (0, dom_1.hide)(this._rootDomNode);
            this.messageContainer = this.element.appendChild((0, dom_1.$)('.dialog-message-container'));
        }
        async executeCommand(commandId, ...args) {
            try {
                await this.commandService.executeCommand(commandId, ...args);
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: commandId,
                    from: 'welcomeWidget'
                });
            }
            catch (ex) {
            }
        }
        async render(title, message, buttonText, buttonAction) {
            if (!this._editor._getViewModel()) {
                return;
            }
            await this.buildWidgetContent(title, message, buttonText, buttonAction);
            this._editor.addOverlayWidget(this);
            this._show();
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'welcomeWidgetRendered',
                from: 'welcomeWidget'
            });
        }
        async buildWidgetContent(title, message, buttonText, buttonAction) {
            const actionBar = this._register(new actionbar_1.ActionBar(this.element, {}));
            const action = this._register(new actions_1.Action('dialog.close', (0, nls_1.localize)('dialogClose', "Close Dialog"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.dialogClose), true, async () => {
                this._hide();
            }));
            actionBar.push(action, { icon: true, label: false });
            const renderBody = (message, icon) => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true, supportHtml: true });
                mds.appendMarkdown(`<a class="copilot">$(${icon})</a>`);
                mds.appendMarkdown(message);
                return mds;
            };
            const titleElement = this.messageContainer.appendChild((0, dom_1.$)('#monaco-dialog-message-detail.dialog-message-detail-title'));
            const titleElementMdt = this.markdownRenderer.render(renderBody(title, 'zap'));
            titleElement.appendChild(titleElementMdt.element);
            this.buildStepMarkdownDescription(this.messageContainer, message.split('\n').filter(x => x).map(text => (0, linkedText_1.parseLinkedText)(text)));
            const buttonsRowElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-buttons-row'));
            const buttonContainer = buttonsRowElement.appendChild((0, dom_1.$)('.dialog-buttons'));
            const buttonBar = this._register(new button_1.ButtonBar(buttonContainer));
            const primaryButton = this._register(buttonBar.addButtonWithDescription({ title: true, secondary: false, ...defaultStyles_1.defaultButtonStyles }));
            primaryButton.label = (0, labels_1.mnemonicButtonLabel)(buttonText, true);
            this._register(primaryButton.onDidClick(async () => {
                await this.executeCommand(buttonAction);
            }));
            buttonBar.buttons[0].focus();
        }
        buildStepMarkdownDescription(container, text) {
            for (const linkedText of text) {
                const p = (0, dom_1.append)(container, (0, dom_1.$)('p'));
                for (const node of linkedText.nodes) {
                    if (typeof node === 'string') {
                        const labelWithIcon = (0, iconLabels_1.renderLabelWithIcons)(node);
                        for (const element of labelWithIcon) {
                            if (typeof element === 'string') {
                                p.appendChild((0, formattedTextRenderer_1.renderFormattedText)(element, { inline: true, renderCodeSegments: true }));
                            }
                            else {
                                p.appendChild(element);
                            }
                        }
                    }
                    else {
                        const link = this.instantiationService.createInstance(link_1.Link, p, node, {
                            opener: (href) => {
                                this.telemetryService.publicLog2('workbenchActionExecuted', {
                                    id: 'welcomeWidetLinkAction',
                                    from: 'welcomeWidget'
                                });
                                this.openerService.open(href, { allowCommands: true });
                            }
                        });
                        this._register(link);
                    }
                }
            }
            return container;
        }
        getId() {
            return 'editor.contrib.welcomeWidget';
        }
        getDomNode() {
            return this._rootDomNode;
        }
        getPosition() {
            return {
                preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
            };
        }
        _show() {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._rootDomNode.style.display = 'block';
        }
        _hide() {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._rootDomNode.style.display = 'none';
            this._editor.removeOverlayWidget(this);
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'welcomeWidgetDismissed',
                from: 'welcomeWidget'
            });
        }
    }
    exports.WelcomeWidget = WelcomeWidget;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const addBackgroundColorRule = (selector, color) => {
            if (color) {
                collector.addRule(`.monaco-editor ${selector} { background-color: ${color}; }`);
            }
        };
        const widgetBackground = theme.getColor(colorRegistry_1.editorWidgetBackground);
        addBackgroundColorRule('.welcome-widget', widgetBackground);
        const widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
        if (widgetShadowColor) {
            collector.addRule(`.welcome-widget { box-shadow: 0 0 8px 2px ${widgetShadowColor}; }`);
        }
        const widgetBorderColor = theme.getColor(colorRegistry_1.widgetBorder);
        if (widgetBorderColor) {
            collector.addRule(`.welcome-widget { border-left: 1px solid ${widgetBorderColor}; border-right: 1px solid ${widgetBorderColor}; border-bottom: 1px solid ${widgetBorderColor}; }`);
        }
        const hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
        if (hcBorder) {
            collector.addRule(`.welcome-widget { border: 1px solid ${hcBorder}; }`);
        }
        const foreground = theme.getColor(colorRegistry_1.editorWidgetForeground);
        if (foreground) {
            collector.addRule(`.welcome-widget { color: ${foreground}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZVdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVEaWFsb2cvYnJvd3Nlci93ZWxjb21lV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRCaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFPNUMsWUFDa0IsT0FBb0IsRUFDcEIsb0JBQTJDLEVBQzNDLGNBQStCLEVBQy9CLGdCQUFtQyxFQUNuQyxhQUE2QjtZQUU5QyxLQUFLLEVBQUUsQ0FBQztZQU5TLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDcEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFQOUIscUJBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQStIM0YsZUFBVSxHQUFZLEtBQUssQ0FBQztZQXJIbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDO1lBRS9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBQSxPQUFDLEVBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUU1QyxJQUFBLFVBQUksRUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFeEIsSUFBSSxDQUFDLGdCQUFnQixH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