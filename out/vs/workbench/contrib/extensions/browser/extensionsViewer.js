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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/base/common/cancellation", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/platform/theme/common/colorRegistry", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/workbench/contrib/extensions/browser/extensionsViews"], function (require, exports, dom, nls_1, lifecycle_1, actions_1, extensions_1, event_1, instantiation_1, listService_1, configuration_1, contextkey_1, themeService_1, cancellation_1, arrays_1, extensionsList_1, colorRegistry_1, keyboardEvent_1, mouseEvent_1, extensionsViews_1) {
    "use strict";
    var ExtensionRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getExtensions = exports.ExtensionData = exports.ExtensionsTree = exports.ExtensionsGridView = void 0;
    let ExtensionsGridView = class ExtensionsGridView extends lifecycle_1.Disposable {
        constructor(parent, delegate, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.element = dom.append(parent, dom.$('.extensions-grid-view'));
            this.renderer = this.instantiationService.createInstance(extensionsList_1.Renderer, { onFocus: event_1.Event.None, onBlur: event_1.Event.None }, { hoverOptions: { position() { return 2 /* HoverPosition.BELOW */; } } });
            this.delegate = delegate;
            this.disposableStore = this._register(new lifecycle_1.DisposableStore());
        }
        setExtensions(extensions) {
            this.disposableStore.clear();
            extensions.forEach((e, index) => this.renderExtension(e, index));
        }
        renderExtension(extension, index) {
            const extensionContainer = dom.append(this.element, dom.$('.extension-container'));
            extensionContainer.style.height = `${this.delegate.getHeight()}px`;
            extensionContainer.setAttribute('tabindex', '0');
            const template = this.renderer.renderTemplate(extensionContainer);
            this.disposableStore.add((0, lifecycle_1.toDisposable)(() => this.renderer.disposeTemplate(template)));
            const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
            openExtensionAction.extension = extension;
            template.name.setAttribute('tabindex', '0');
            const handleEvent = (e) => {
                if (e instanceof keyboardEvent_1.StandardKeyboardEvent && e.keyCode !== 3 /* KeyCode.Enter */) {
                    return;
                }
                openExtensionAction.run(e.ctrlKey || e.metaKey);
                e.stopPropagation();
                e.preventDefault();
            };
            this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.CLICK, (e) => handleEvent(new mouseEvent_1.StandardMouseEvent(e))));
            this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.disposableStore.add(dom.addDisposableListener(extensionContainer, dom.EventType.KEY_DOWN, (e) => handleEvent(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.renderer.renderElement(extension, index, template);
        }
    };
    exports.ExtensionsGridView = ExtensionsGridView;
    exports.ExtensionsGridView = ExtensionsGridView = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], ExtensionsGridView);
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
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        get templateId() {
            return ExtensionRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('extension');
            const icon = dom.append(container, dom.$('img.icon'));
            const details = dom.append(container, dom.$('.details'));
            const header = dom.append(details, dom.$('.header'));
            const name = dom.append(header, dom.$('span.name'));
            const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
            const extensionDisposables = [dom.addDisposableListener(name, 'click', (e) => {
                    openExtensionAction.run(e.ctrlKey || e.metaKey);
                    e.stopPropagation();
                    e.preventDefault();
                })];
            const identifier = dom.append(header, dom.$('span.identifier'));
            const footer = dom.append(details, dom.$('.footer'));
            const author = dom.append(footer, dom.$('.author'));
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
            data.extensionDisposables.push(dom.addDisposableListener(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
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
            templateData.extensionDisposables = (0, lifecycle_1.dispose)(templateData.extensionDisposables);
        }
    };
    ExtensionRenderer = ExtensionRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ExtensionRenderer);
    class UnknownExtensionRenderer {
        static { this.TEMPLATE_ID = 'unknown-extension-template'; }
        get templateId() {
            return UnknownExtensionRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const messageContainer = dom.append(container, dom.$('div.unknown-extension'));
            dom.append(messageContainer, dom.$('span.error-marker')).textContent = (0, nls_1.localize)('error', "Error");
            dom.append(messageContainer, dom.$('span.message')).textContent = (0, nls_1.localize)('Unknown Extension', "Unknown Extension:");
            const identifier = dom.append(messageContainer, dom.$('span.message'));
            return { identifier };
        }
        renderElement(node, index, data) {
            data.identifier.textContent = node.element.extension.identifier.id;
        }
        disposeTemplate(data) {
        }
    }
    let OpenExtensionAction = class OpenExtensionAction extends actions_1.Action {
        constructor(extensionsWorkdbenchService) {
            super('extensions.action.openExtension', '');
            this.extensionsWorkdbenchService = extensionsWorkdbenchService;
        }
        set extension(extension) {
            this._extension = extension;
        }
        run(sideByside) {
            if (this._extension) {
                return this.extensionsWorkdbenchService.open(this._extension, { sideByside });
            }
            return Promise.resolve();
        }
    };
    OpenExtensionAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], OpenExtensionAction);
    let ExtensionsTree = class ExtensionsTree extends listService_1.WorkbenchAsyncDataTree {
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
                        return (0, extensionsViews_1.getAriaLabelForExtension)(extensionData.extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('extensions', "Extensions");
                    }
                }
            }, instantiationService, contextKeyService, listService, configurationService);
            this.setInput(input);
            this.disposables.add(this.onDidChangeSelection(event => {
                if (event.browserEvent && event.browserEvent instanceof KeyboardEvent) {
                    extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
                }
            }));
        }
    };
    exports.ExtensionsTree = ExtensionsTree;
    exports.ExtensionsTree = ExtensionsTree = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensions_1.IExtensionsWorkbenchService)
    ], ExtensionsTree);
    class ExtensionData {
        constructor(extension, parent, getChildrenExtensionIds, extensionsWorkbenchService) {
            this.extension = extension;
            this.parent = parent;
            this.getChildrenExtensionIds = getChildrenExtensionIds;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.childrenExtensionIds = this.getChildrenExtensionIds(extension);
        }
        get hasChildren() {
            return (0, arrays_1.isNonEmptyArray)(this.childrenExtensionIds);
        }
        async getChildren() {
            if (this.hasChildren) {
                const result = await getExtensions(this.childrenExtensionIds, this.extensionsWorkbenchService);
                return result.map(extension => new ExtensionData(extension, this, this.getChildrenExtensionIds, this.extensionsWorkbenchService));
            }
            return null;
        }
    }
    exports.ExtensionData = ExtensionData;
    async function getExtensions(extensions, extensionsWorkbenchService) {
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
    exports.getExtensions = getExtensions;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const focusBackground = theme.getColor(colorRegistry_1.listFocusBackground);
        if (focusBackground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { background-color: ${focusBackground}; outline: none; }`);
        }
        const focusForeground = theme.getColor(colorRegistry_1.listFocusForeground);
        if (focusForeground) {
            collector.addRule(`.extensions-grid-view .extension-container:focus { color: ${focusForeground}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
        if (foregroundColor && editorBackgroundColor) {
            const authorForeground = foregroundColor.transparent(.9).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container:not(.disabled) .author { color: ${authorForeground}; }`);
            const disabledExtensionForeground = foregroundColor.transparent(.5).makeOpaque(editorBackgroundColor);
            collector.addRule(`.extensions-grid-view .extension-container.disabled { color: ${disabledExtensionForeground}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zVmlld2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUFPakQsWUFDQyxNQUFtQixFQUNuQixRQUFrQixFQUNzQixvQkFBMkM7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFGZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUduRixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLFFBQVEsS0FBSyxtQ0FBMkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEwsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELGFBQWEsQ0FBQyxVQUF3QjtZQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdCLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FB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