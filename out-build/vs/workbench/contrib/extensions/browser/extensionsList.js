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
    exports.$0Tb = exports.$9Tb = void 0;
    const EXTENSION_LIST_ELEMENT_HEIGHT = 72;
    class $9Tb {
        getHeight() { return EXTENSION_LIST_ELEMENT_HEIGHT; }
        getTemplateId() { return 'extension'; }
    }
    exports.$9Tb = $9Tb;
    let $0Tb = class $0Tb {
        constructor(a, b, c, d, f, g, h, i) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
        }
        get templateId() { return 'extension'; }
        renderTemplate(root) {
            const recommendationWidget = this.c.createInstance(extensionsWidgets_1.$VTb, (0, dom_1.$0O)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const preReleaseWidget = this.c.createInstance(extensionsWidgets_1.$WTb, (0, dom_1.$0O)(root, (0, dom_1.$)('.extension-bookmark-container')));
            const element = (0, dom_1.$0O)(root, (0, dom_1.$)('.extension-list-item'));
            const iconContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.$0O)(iconContainer, (0, dom_1.$)('img.icon', { alt: '' }));
            const iconRemoteBadgeWidget = this.c.createInstance(extensionsWidgets_1.$XTb, iconContainer, false);
            const extensionPackBadgeWidget = this.c.createInstance(extensionsWidgets_1.$YTb, iconContainer);
            const details = (0, dom_1.$0O)(element, (0, dom_1.$)('.details'));
            const headerContainer = (0, dom_1.$0O)(details, (0, dom_1.$)('.header-container'));
            const header = (0, dom_1.$0O)(headerContainer, (0, dom_1.$)('.header'));
            const name = (0, dom_1.$0O)(header, (0, dom_1.$)('span.name'));
            const installCount = (0, dom_1.$0O)(header, (0, dom_1.$)('span.install-count'));
            const ratings = (0, dom_1.$0O)(header, (0, dom_1.$)('span.ratings'));
            const syncIgnore = (0, dom_1.$0O)(header, (0, dom_1.$)('span.sync-ignored'));
            const activationStatus = (0, dom_1.$0O)(header, (0, dom_1.$)('span.activation-status'));
            const headerRemoteBadgeWidget = this.c.createInstance(extensionsWidgets_1.$XTb, header, false);
            const description = (0, dom_1.$0O)(details, (0, dom_1.$)('.description.ellipsis'));
            const footer = (0, dom_1.$0O)(details, (0, dom_1.$)('.footer'));
            const publisher = (0, dom_1.$0O)(footer, (0, dom_1.$)('.author.ellipsis'));
            const verifiedPublisherWidget = this.c.createInstance(extensionsWidgets_1.$TTb, (0, dom_1.$0O)(publisher, (0, dom_1.$)(`.verified-publisher`)), true);
            const publisherDisplayName = (0, dom_1.$0O)(publisher, (0, dom_1.$)('.publisher-name.ellipsis'));
            const actionbar = new actionbar_1.$1P(footer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.$qhb) {
                        return new extensionsActions_1.$Chb(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.i);
                    }
                    if (action instanceof extensionsActions_1.$Dhb) {
                        return action.createActionViewItem();
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            });
            actionbar.setFocusable(false);
            actionbar.onDidRun(({ error }) => error && this.d.error(error));
            const extensionStatusIconAction = this.c.createInstance(extensionsActions_1.$9hb);
            const actions = [
                this.c.createInstance(extensionsActions_1.$7hb),
                this.c.createInstance(extensionsActions_1.$Bhb, true),
                this.c.createInstance(extensionsActions_1.$Shb),
                this.c.createInstance(extensionsActions_1.$qhb, 'extensions.updateActions', '', [[this.c.createInstance(extensionsActions_1.$zhb, false)], [this.c.createInstance(extensionsActions_1.$Ahb)]]),
                this.c.createInstance(extensionsActions_1.$shb),
                this.c.createInstance(extensionsActions_1.$thb),
                this.c.createInstance(extensionsActions_1.$Whb),
                this.c.createInstance(extensionsActions_1.$Xhb),
                this.c.createInstance(extensionsActions_1.$vhb, false),
                this.c.createInstance(extensionsActions_1.$whb),
                this.c.createInstance(extensionsActions_1.$xhb),
                extensionStatusIconAction,
                this.c.createInstance(extensionsActions_1.$Khb, true),
                this.c.createInstance(extensionsActions_1.$Jhb, true),
                this.c.createInstance(extensionsActions_1.$Ghb)
            ];
            const extensionHoverWidget = this.c.createInstance(extensionsWidgets_1.$2Tb, { target: root, position: this.b.hoverOptions.position }, extensionStatusIconAction);
            const widgets = [
                recommendationWidget,
                preReleaseWidget,
                iconRemoteBadgeWidget,
                extensionPackBadgeWidget,
                headerRemoteBadgeWidget,
                verifiedPublisherWidget,
                extensionHoverWidget,
                this.c.createInstance(extensionsWidgets_1.$ZTb, syncIgnore),
                this.c.createInstance(extensionsWidgets_1.$1Tb, activationStatus, true),
                this.c.createInstance(extensionsWidgets_1.$RTb, installCount, true),
                this.c.createInstance(extensionsWidgets_1.$STb, ratings, true),
            ];
            const extensionContainers = this.c.createInstance(extensions_1.$Ufb, [...actions, ...widgets]);
            actionbar.push(actions, { icon: true, label: true });
            const disposable = (0, lifecycle_1.$hc)(...actions, ...widgets, actionbar, extensionContainers);
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
            data.extensionDisposables = (0, lifecycle_1.$fc)(data.extensionDisposables);
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
                extension = this.h.local.filter(e => e.server === extension.server && (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))[0] || extension;
            }
            data.extensionDisposables = (0, lifecycle_1.$fc)(data.extensionDisposables);
            const computeEnablement = async () => {
                if (extension.state === 3 /* ExtensionState.Uninstalled */) {
                    if (!!extension.deprecationInfo) {
                        return true;
                    }
                    if (this.h.canSetLanguage(extension)) {
                        return false;
                    }
                    return !(await this.h.canInstall(extension));
                }
                else if (extension.local && !(0, extensions_3.$Zl)(extension.local.manifest)) {
                    const runningExtension = this.f.extensions.filter(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier))[0];
                    return !(runningExtension && extension.server === this.g.getExtensionManagementServer((0, extensions_2.$TF)(runningExtension)));
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
            this.f.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
            data.extensionDisposables.push((0, dom_1.$nO)(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
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
            event_1.Event.filter(this.h.onChange, e => !!e && (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))(() => updatePublisher(), this, data.extensionDisposables);
            data.installCount.style.display = '';
            data.ratings.style.display = '';
            data.extension = extension;
            if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
                data.description.textContent = extension.gallery.properties.localizedLanguages.map(name => name[0].toLocaleUpperCase() + name.slice(1)).join(', ');
            }
            this.a.onFocus(e => {
                if ((0, extensionManagementUtil_1.$po)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(true);
                }
            }, this, data.extensionDisposables);
            this.a.onBlur(e => {
                if ((0, extensionManagementUtil_1.$po)(extension.identifier, e.identifier)) {
                    data.actionbar.setFocusable(false);
                }
            }, this, data.extensionDisposables);
        }
        disposeElement(extension, index, data) {
            data.extensionDisposables = (0, lifecycle_1.$fc)(data.extensionDisposables);
        }
        disposeTemplate(data) {
            data.extensionDisposables = (0, lifecycle_1.$fc)(data.extensionDisposables);
            data.disposables = (0, lifecycle_1.$fc)(data.disposables);
        }
    };
    exports.$0Tb = $0Tb;
    exports.$0Tb = $0Tb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, notification_1.$Yu),
        __param(4, extensions_2.$MF),
        __param(5, extensionManagement_1.$fcb),
        __param(6, extensions_1.$Pfb),
        __param(7, contextView_1.$WZ)
    ], $0Tb);
    (0, themeService_1.$mv)((theme, collector) => {
        const verifiedPublisherIconColor = theme.getColor(extensionsWidgets_1.$6Tb);
        if (verifiedPublisherIconColor) {
            const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(.5).makeOpaque((0, theme_1.$$$)(theme));
            collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled .author .verified-publisher ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$_gb)} { color: ${disabledVerifiedPublisherIconColor}; }`);
        }
    });
});
//# sourceMappingURL=extensionsList.js.map