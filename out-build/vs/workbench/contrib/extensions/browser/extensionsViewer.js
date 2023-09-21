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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsViewer", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/base/common/cancellation", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/platform/theme/common/colorRegistry", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/workbench/contrib/extensions/browser/extensionsViews"], function (require, exports, dom, nls_1, lifecycle_1, actions_1, extensions_1, event_1, instantiation_1, listService_1, configuration_1, contextkey_1, themeService_1, cancellation_1, arrays_1, extensionsList_1, colorRegistry_1, keyboardEvent_1, mouseEvent_1, extensionsViews_1) {
    "use strict";
    var ExtensionRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wUb = exports.$vUb = exports.$uUb = exports.$tUb = void 0;
    let $tUb = class $tUb extends lifecycle_1.$kc {
        constructor(parent, delegate, f) {
            super();
            this.f = f;
            this.element = dom.$0O(parent, dom.$('.extensions-grid-view'));
            this.a = this.f.createInstance(extensionsList_1.$0Tb, { onFocus: event_1.Event.None, onBlur: event_1.Event.None }, { hoverOptions: { position() { return 2 /* HoverPosition.BELOW */; } } });
            this.b = delegate;
            this.c = this.B(new lifecycle_1.$jc());
        }
        setExtensions(extensions) {
            this.c.clear();
            extensions.forEach((e, index) => this.g(e, index));
        }
        g(extension, index) {
            const extensionContainer = dom.$0O(this.element, dom.$('.extension-container'));
            extensionContainer.style.height = `${this.b.getHeight()}px`;
            extensionContainer.setAttribute('tabindex', '0');
            const template = this.a.renderTemplate(extensionContainer);
            this.c.add((0, lifecycle_1.$ic)(() => this.a.disposeTemplate(template)));
            const openExtensionAction = this.f.createInstance(OpenExtensionAction);
            openExtensionAction.extension = extension;
            template.name.setAttribute('tabindex', '0');
            const handleEvent = (e) => {
                if (e instanceof keyboardEvent_1.$jO && e.keyCode !== 3 /* KeyCode.Enter */) {
                    return;
                }
                openExtensionAction.run(e.ctrlKey || e.metaKey);
                e.stopPropagation();
                e.preventDefault();
            };
            this.c.add(dom.$nO(template.name, dom.$3O.CLICK, (e) => handleEvent(new mouseEvent_1.$eO(e))));
            this.c.add(dom.$nO(template.name, dom.$3O.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.$jO(e))));
            this.c.add(dom.$nO(extensionContainer, dom.$3O.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.$jO(e))));
            this.a.renderElement(extension, index, template);
        }
    };
    exports.$tUb = $tUb;
    exports.$tUb = $tUb = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $tUb);
    class AsyncDataSource {
        hasChildren({ hasChildren }) {
            return hasChildren;
        }
        getChildren(extensionData) {
            return extensionData.getChildren();
        }
    }
    class VirualDelegate {
        getHeight(element) {
            return 62;
        }
        getTemplateId({ extension }) {
            return extension ? ExtensionRenderer.TEMPLATE_ID : UnknownExtensionRenderer.TEMPLATE_ID;
        }
    }
    let ExtensionRenderer = class ExtensionRenderer {
        static { ExtensionRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'extension-template'; }
        constructor(a) {
            this.a = a;
        }
        get templateId() {
            return ExtensionRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('extension');
            const icon = dom.$0O(container, dom.$('img.icon'));
            const details = dom.$0O(container, dom.$('.details'));
            const header = dom.$0O(details, dom.$('.header'));
            const name = dom.$0O(header, dom.$('span.name'));
            const openExtensionAction = this.a.createInstance(OpenExtensionAction);
            const extensionDisposables = [dom.$nO(name, 'click', (e) => {
                    openExtensionAction.run(e.ctrlKey || e.metaKey);
                    e.stopPropagation();
                    e.preventDefault();
                })];
            const identifier = dom.$0O(header, dom.$('span.identifier'));
            const footer = dom.$0O(details, dom.$('.footer'));
            const author = dom.$0O(footer, dom.$('.author'));
            return {
                icon,
                name,
                identifier,
                author,
                extensionDisposables,
                set extensionData(extensionData) {
                    openExtensionAction.extension = extensionData.extension;
                }
            };
        }
        renderElement(node, index, data) {
            const extension = node.element.extension;
            data.extensionDisposables.push(dom.$nO(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = () => data.icon.style.visibility = 'inherit';
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.name.textContent = extension.displayName;
            data.identifier.textContent = extension.identifier.id;
            data.author.textContent = extension.publisherDisplayName;
            data.extensionData = node.element;
        }
        disposeTemplate(templateData) {
            templateData.extensionDisposables = (0, lifecycle_1.$fc)(templateData.extensionDisposables);
        }
    };
    ExtensionRenderer = ExtensionRenderer_1 = __decorate([
        __param(0, instantiation_1.$Ah)
    ], ExtensionRenderer);
    class UnknownExtensionRenderer {
        static { this.TEMPLATE_ID = 'unknown-extension-template'; }
        get templateId() {
            return UnknownExtensionRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const messageContainer = dom.$0O(container, dom.$('div.unknown-extension'));
            dom.$0O(messageContainer, dom.$('span.error-marker')).textContent = (0, nls_1.localize)(0, null);
            dom.$0O(messageContainer, dom.$('span.message')).textContent = (0, nls_1.localize)(1, null);
            const identifier = dom.$0O(messageContainer, dom.$('span.message'));
            return { identifier };
        }
        renderElement(node, index, data) {
            data.identifier.textContent = node.element.extension.identifier.id;
        }
        disposeTemplate(data) {
        }
    }
    let OpenExtensionAction = class OpenExtensionAction extends actions_1.$gi {
        constructor(b) {
            super('extensions.action.openExtension', '');
            this.b = b;
        }
        set extension(extension) {
            this.a = extension;
        }
        run(sideByside) {
            if (this.a) {
                return this.b.open(this.a, { sideByside });
            }
            return Promise.resolve();
        }
    };
    OpenExtensionAction = __decorate([
        __param(0, extensions_1.$Pfb)
    ], OpenExtensionAction);
    let $uUb = class $uUb extends listService_1.$w4 {
        constructor(input, container, overrideStyles, contextKeyService, listService, instantiationService, configurationService, extensionsWorkdbenchService) {
            const delegate = new VirualDelegate();
            const dataSource = new AsyncDataSource();
            const renderers = [instantiationService.createInstance(ExtensionRenderer), instantiationService.createInstance(UnknownExtensionRenderer)];
            const identityProvider = {
                getId({ extension, parent }) {
                    return parent ? this.getId(parent) + '/' + extension.identifier.id : extension.identifier.id;
                }
            };
            super('ExtensionsTree', container, delegate, renderers, dataSource, {
                indent: 40,
                identityProvider,
                multipleSelectionSupport: false,
                overrideStyles,
                accessibilityProvider: {
                    getAriaLabel(extensionData) {
                        return (0, extensionsViews_1.$sUb)(extensionData.extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(2, null);
                    }
                }
            }, instantiationService, contextKeyService, listService, configurationService);
            this.setInput(input);
            this.t.add(this.onDidChangeSelection(event => {
                if (event.browserEvent && event.browserEvent instanceof KeyboardEvent) {
                    extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
                }
            }));
        }
    };
    exports.$uUb = $uUb;
    exports.$uUb = $uUb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, listService_1.$03),
        __param(5, instantiation_1.$Ah),
        __param(6, configuration_1.$8h),
        __param(7, extensions_1.$Pfb)
    ], $uUb);
    class $vUb {
        constructor(extension, parent, getChildrenExtensionIds, extensionsWorkbenchService) {
            this.extension = extension;
            this.parent = parent;
            this.a = getChildrenExtensionIds;
            this.c = extensionsWorkbenchService;
            this.b = this.a(extension);
        }
        get hasChildren() {
            return (0, arrays_1.$Jb)(this.b);
        }
        async getChildren() {
            if (this.hasChildren) {
                const result = await $wUb(this.b, this.c);
                return result.map(extension => new $vUb(extension, this, this.a, this.c));
            }
            return null;
        }
    }
    exports.$vUb = $vUb;
    async function $wUb(extensions, extensionsWorkbenchService) {
        const localById = extensionsWorkbenchService.local.reduce((result, e) => { result.set(e.identifier.id.toLowerCase(), e); return result; }, new Map());
        const result = [];
        const toQuery = [];
        for (const extensionId of extensions) {
            const id = extensionId.toLowerCase();
            const local = localById.get(id);
            if (local) {
                result.push(local);
            }
            else {
                toQuery.push(id);
            }
        }
        if (toQuery.length) {
            const galleryResult = await extensionsWorkbenchService.getExtensions(toQuery.map(id => ({ id })), cancellation_1.CancellationToken.None);
            result.push(...galleryResult);
        }
        return result;
    }
    exports.$wUb = $wUb;
    (0, themeService_1.$mv)((theme, collector) => {
        const focusBackground = theme.getColor(colorRegistry_1.$ux);
        if (focusBackground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { background-color: ${focusBackground}; outline: none; }`);
        }
        const focusForeground = theme.getColor(colorRegistry_1.$vx);
        if (focusForeground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { color: ${focusForeground}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.$uv);
        const editorBackgroundColor = theme.getColor(colorRegistry_1.$ww);
        if (foregroundColor && editorBackgroundColor) {
            const authorForeground = foregroundColor.transparent(.9).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container:not(.disabled) .author { color: ${authorForeground}; }`);
            const disabledExtensionForeground = foregroundColor.transparent(.5).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container.disabled { color: ${disabledExtensionForeground}; }`);
        }
    });
});
//# sourceMappingURL=extensionsViewer.js.map