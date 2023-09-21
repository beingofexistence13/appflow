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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/platform/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/css!./media/extension"], function (require, exports, dom_1, lifecycle_1, actionbar_1, instantiation_1, event_1, extensions_1, extensionsActions_1, extensionManagementUtil_1, extensionsWidgets_1, extensions_2, extensionManagement_1, notification_1, extensions_3, themeService_1, themables_1, theme_1, contextView_1, extensionsIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Renderer = exports.Delegate = void 0;
    const EXTENSION_LIST_ELEMENT_HEIGHT = 72;
    class Delegate {
        getHeight() { return EXTENSION_LIST_ELEMENT_HEIGHT; }
        getTemplateId() { return 'extension'; }
    }
    exports.Delegate = Delegate;
    let Renderer = class Renderer {
        constructor(extensionViewState, options, instantiationService, notificationService, extensionService, extensionManagementServerService, extensionsWorkbenchService, contextMenuService) {
            this.extensionViewState = extensionViewState;
            this.options = options;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.contextMenuService = contextMenuService;
        }
        get templateId() { return 'extension'; }
        renderTemplate(root) {
            const recommendationWidget = this.instantiationService.createInstance(extensionsWidgets_1.RecommendationWidget, (0, dom_1.append)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const preReleaseWidget = this.instantiationService.createInstance(extensionsWidgets_1.PreReleaseBookmarkWidget, (0, dom_1.append)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const element = (0, dom_1.append)(root, (0, dom_1.$)('.extension-list-item'));
            const iconContainer = (0, dom_1.append)(element, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon', { alt: '' }));
            const iconRemoteBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, iconContainer, false);
            const extensionPackBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionPackCountWidget, iconContainer);
            const details = (0, dom_1.append)(element, (0, dom_1.$)('.details'));
            const headerContainer = (0, dom_1.append)(details, (0, dom_1.$)('.header-container'));
            const header = (0, dom_1.append)(headerContainer, (0, dom_1.$)('.header'));
            const name = (0, dom_1.append)(header, (0, dom_1.$)('span.name'));
            const installCount = (0, dom_1.append)(header, (0, dom_1.$)('span.install-count'));
            const ratings = (0, dom_1.append)(header, (0, dom_1.$)('span.ratings'));
            const syncIgnore = (0, dom_1.append)(header, (0, dom_1.$)('span.sync-ignored'));
            const activationStatus = (0, dom_1.append)(header, (0, dom_1.$)('span.activation-status'));
            const headerRemoteBadgeWidget = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, header, false);
            const description = (0, dom_1.append)(details, (0, dom_1.$)('.description.ellipsis'));
            const footer = (0, dom_1.append)(details, (0, dom_1.$)('.footer'));
            const publisher = (0, dom_1.append)(footer, (0, dom_1.$)('.author.ellipsis'));
            const verifiedPublisherWidget = this.instantiationService.createInstance(extensionsWidgets_1.VerifiedPublisherWidget, (0, dom_1.append)(publisher, (0, dom_1.$)(`.verified-publisher`)), true);
            const publisherDisplayName = (0, dom_1.append)(publisher, (0, dom_1.$)('.publisher-name.ellipsis'));
            const actionbar = new actionbar_1.ActionBar(footer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.ActionWithDropDownAction) {
                        return new extensionsActions_1.ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                    }
                    if (action instanceof extensionsActions_1.ExtensionDropDownAction) {
                        return action.createActionViewItem();
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            });
            actionbar.setFocusable(false);
            actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
            const extensionStatusIconAction = this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusAction);
            const actions = [
                this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.MigrateDeprecatedExtensionAction, true),
                this.instantiationService.createInstance(extensionsActions_1.ReloadAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.updateActions', '', [[this.instantiationService.createInstance(extensionsActions_1.UpdateAction, false)], [this.instantiationService.createInstance(extensionsActions_1.SkipUpdateAction)]]),
                this.instantiationService.createInstance(extensionsActions_1.InstallDropdownAction),
                this.instantiationService.createInstance(extensionsActions_1.InstallingLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.SetLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.ClearLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.RemoteInstallAction, false),
                this.instantiationService.createInstance(extensionsActions_1.LocalInstallAction),
                this.instantiationService.createInstance(extensionsActions_1.WebInstallAction),
                extensionStatusIconAction,
                this.instantiationService.createInstance(extensionsActions_1.SwitchToReleasedVersionAction, true),
                this.instantiationService.createInstance(extensionsActions_1.SwitchToPreReleaseVersionAction, true),
                this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction)
            ];
            const extensionHoverWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionHoverWidget, { target: root, position: this.options.hoverOptions.position }, extensionStatusIconAction);
            const widgets = [
                recommendationWidget,
                preReleaseWidget,
                iconRemoteBadgeWidget,
                extensionPackBadgeWidget,
                headerRemoteBadgeWidget,
                verifiedPublisherWidget,
                extensionHoverWidget,
                this.instantiationService.createInstance(extensionsWidgets_1.SyncIgnoredWidget, syncIgnore),
                this.instantiationService.createInstance(extensionsWidgets_1.ExtensionActivationStatusWidget, activationStatus, true),
                this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, installCount, true),
                this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, ratings, true),
            ];
            const extensionContainers = this.instantiationService.createInstance(extensions_1.ExtensionContainers, [...actions, ...widgets]);
            actionbar.push(actions, { icon: true, label: true });
            const disposable = (0, lifecycle_1.combinedDisposable)(...actions, ...widgets, actionbar, extensionContainers);
            return {
                root, element, icon, name, installCount, ratings, description, publisherDisplayName, disposables: [disposable], actionbar,
                extensionDisposables: [],
                set extension(extension) {
                    extensionContainers.extension = extension;
                }
            };
        }
        renderPlaceholder(index, data) {
            data.element.classList.add('loading');
            data.root.removeAttribute('aria-label');
            data.root.removeAttribute('data-extension-id');
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            data.icon.src = '';
            data.name.textContent = '';
            data.description.textContent = '';
            data.publisherDisplayName.textContent = '';
            data.installCount.style.display = 'none';
            data.ratings.style.display = 'none';
            data.extension = null;
        }
        renderElement(extension, index, data) {
            data.element.classList.remove('loading');
            data.root.setAttribute('data-extension-id', extension.identifier.id);
            if (extension.state !== 3 /* ExtensionState.Uninstalled */ && !extension.server) {
                // Get the extension if it is installed and has no server information
                extension = this.extensionsWorkbenchService.local.filter(e => e.server === extension.server && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0] || extension;
            }
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            const computeEnablement = async () => {
                if (extension.state === 3 /* ExtensionState.Uninstalled */) {
                    if (!!extension.deprecationInfo) {
                        return true;
                    }
                    if (this.extensionsWorkbenchService.canSetLanguage(extension)) {
                        return false;
                    }
                    return !(await this.extensionsWorkbenchService.canInstall(extension));
                }
                else if (extension.local && !(0, extensions_3.isLanguagePackExtension)(extension.local.manifest)) {
                    const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier))[0];
                    return !(runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(runningExtension)));
                }
                return false;
            };
            const updateEnablement = async () => {
                const disabled = await computeEnablement();
                const deprecated = !!extension.deprecationInfo;
                data.element.classList.toggle('deprecated', deprecated);
                data.root.classList.toggle('disabled', disabled);
            };
            updateEnablement();
            this.extensionService.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
            data.extensionDisposables.push((0, dom_1.addDisposableListener)(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = () => data.icon.style.visibility = 'inherit';
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.name.textContent = extension.displayName;
            data.description.textContent = extension.description;
            const updatePublisher = () => {
                data.publisherDisplayName.textContent = extension.publisherDisplayName;
            };
            updatePublisher();
            event_1.Event.filter(this.extensionsWorkbenchService.onChange, e => !!e && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))(() => updatePublisher(), this, data.extensionDisposables);
            data.installCount.style.display = '';
            data.ratings.style.display = '';
            data.extension = extension;
            if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
                data.description.textContent = extension.gallery.properties.localizedLanguages.map(name => name[0].toLocaleUpperCase() + name.slice(1)).join(', ');
            }
            this.extensionViewState.onFocus(e => {
                if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(true);
                }
            }, this, data.extensionDisposables);
            this.extensionViewState.onBlur(e => {
                if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(false);
                }
            }, this, data.extensionDisposables);
        }
        disposeElement(extension, index, data) {
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
        }
        disposeTemplate(data) {
            data.extensionDisposables = (0, lifecycle_1.dispose)(data.extensionDisposables);
            data.disposables = (0, lifecycle_1.dispose)(data.disposables);
        }
    };
    exports.Renderer = Renderer;
    exports.Renderer = Renderer = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, notification_1.INotificationService),
        __param(4, extensions_2.IExtensionService),
        __param(5, extensionManagement_1.IExtensionManagementServerService),
        __param(6, extensions_1.IExtensionsWorkbenchService),
        __param(7, contextView_1.IContextMenuService)
    ], Renderer);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const verifiedPublisherIconColor = theme.getColor(extensionsWidgets_1.extensionVerifiedPublisherIconColor);
        if (verifiedPublisherIconColor) {
            const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(.5).makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
            collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled .author .verified-publisher ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.verifiedPublisherIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0xpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc0xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxNQUFNLDZCQUE2QixHQUFHLEVBQUUsQ0FBQztJQXNCekMsTUFBYSxRQUFRO1FBQ3BCLFNBQVMsS0FBSyxPQUFPLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNyRCxhQUFhLEtBQUssT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0lBSEQsNEJBR0M7SUFRTSxJQUFNLFFBQVEsR0FBZCxNQUFNLFFBQVE7UUFFcEIsWUFDUyxrQkFBd0MsRUFDL0IsT0FBcUMsRUFDZCxvQkFBMkMsRUFDNUMsbUJBQXlDLEVBQzVDLGdCQUFtQyxFQUNuQixnQ0FBbUUsRUFDekUsMEJBQXVELEVBQy9ELGtCQUF1QztZQVByRSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQy9CLFlBQU8sR0FBUCxPQUFPLENBQThCO1lBQ2QseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDbkIscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUN6RSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQy9ELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7UUFDMUUsQ0FBQztRQUVMLElBQUksVUFBVSxLQUFLLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQztRQUV4QyxjQUFjLENBQUMsSUFBaUI7WUFDL0IsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHdDQUFvQixFQUFFLElBQUEsWUFB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