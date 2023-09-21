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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/base/browser/dom", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/base/common/uri", "vs/workbench/common/views", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/log/common/log", "vs/workbench/browser/parts/views/treeView", "vs/workbench/services/userDataProfile/browser/settingsResource", "vs/workbench/services/userDataProfile/browser/keybindingsResource", "vs/workbench/services/userDataProfile/browser/snippetsResource", "vs/workbench/services/userDataProfile/browser/tasksResource", "vs/workbench/services/userDataProfile/browser/extensionsResource", "vs/workbench/services/userDataProfile/browser/globalStateResource", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/browser/ui/button/button", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/base/common/uuid", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/progress/common/progress", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/network", "vs/base/common/cancellation", "vs/base/common/severity", "vs/platform/clipboard/common/clipboardService", "vs/platform/url/common/url", "vs/platform/request/common/request", "vs/platform/product/common/productService", "vs/base/common/types", "vs/base/common/actions", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/htmlContent", "vs/base/browser/markdownRenderer", "vs/workbench/services/log/common/logConstants", "vs/base/browser/ui/selectBox/selectBox", "vs/css!./media/userDataProfileView"], function (require, exports, nls_1, extensions_1, instantiation_1, notification_1, event_1, DOM, userDataProfile_1, lifecycle_1, dialogs_1, uriIdentity_1, textfiles_1, files_1, uri_1, views_1, userDataProfile_2, contextkey_1, platform_1, descriptors_1, viewPaneContainer_1, log_1, treeView_1, settingsResource_1, keybindingsResource_1, snippetsResource_1, tasksResource_1, extensionsResource_1, globalStateResource_1, inMemoryFilesystemProvider_1, button_1, keybinding_1, contextView_1, configuration_1, opener_1, themeService_1, telemetry_1, defaultStyles_1, uuid_1, editorService_1, errors_1, progress_1, extensions_2, quickInput_1, buffer_1, resources_1, strings_1, network_1, cancellation_1, severity_1, clipboardService_1, url_1, request_1, productService_1, types_1, actions_1, platform_2, actions_2, codicons_1, async_1, extensionManagement_1, extensionManagementUtil_1, htmlContent_1, markdownRenderer_1, logConstants_1, selectBox_1) {
    "use strict";
    var UserDataProfileImportExportService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfileImportExportService = void 0;
    function isUserDataProfileTemplate(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && (candidate.name && typeof candidate.name === 'string')
            && ((0, types_1.isUndefined)(candidate.shortName) || typeof candidate.shortName === 'string')
            && ((0, types_1.isUndefined)(candidate.settings) || typeof candidate.settings === 'string')
            && ((0, types_1.isUndefined)(candidate.globalState) || typeof candidate.globalState === 'string')
            && ((0, types_1.isUndefined)(candidate.extensions) || typeof candidate.extensions === 'string'));
    }
    const EXPORT_PROFILE_PREVIEW_VIEW = 'workbench.views.profiles.export.preview';
    const IMPORT_PROFILE_PREVIEW_VIEW = 'workbench.views.profiles.import.preview';
    let UserDataProfileImportExportService = class UserDataProfileImportExportService extends lifecycle_1.Disposable {
        static { UserDataProfileImportExportService_1 = this; }
        static { this.PROFILE_URL_AUTHORITY_PREFIX = 'profile-'; }
        constructor(instantiationService, userDataProfileService, viewsService, editorService, contextKeyService, userDataProfileManagementService, userDataProfilesService, extensionService, extensionManagementService, quickInputService, notificationService, progressService, dialogService, clipboardService, openerService, requestService, urlService, productService, uriIdentityService, telemetryService, contextViewService, logService) {
            super();
            this.instantiationService = instantiationService;
            this.userDataProfileService = userDataProfileService;
            this.viewsService = viewsService;
            this.editorService = editorService;
            this.userDataProfileManagementService = userDataProfileManagementService;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionService = extensionService;
            this.extensionManagementService = extensionManagementService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.dialogService = dialogService;
            this.clipboardService = clipboardService;
            this.openerService = openerService;
            this.requestService = requestService;
            this.productService = productService;
            this.uriIdentityService = uriIdentityService;
            this.telemetryService = telemetryService;
            this.contextViewService = contextViewService;
            this.logService = logService;
            this.profileContentHandlers = new Map();
            this.registerProfileContentHandler(network_1.Schemas.file, this.fileUserDataProfileContentHandler = instantiationService.createInstance(FileUserDataProfileContentHandler));
            this.isProfileExportInProgressContextKey = userDataProfile_1.IS_PROFILE_EXPORT_IN_PROGRESS_CONTEXT.bindTo(contextKeyService);
            this.isProfileImportInProgressContextKey = userDataProfile_1.IS_PROFILE_IMPORT_IN_PROGRESS_CONTEXT.bindTo(contextKeyService);
            this.viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: 'userDataProfiles',
                title: userDataProfile_1.PROFILES_TITLE,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, ['userDataProfiles', { mergeViewWithContainerWhenSingleView: true }]),
                icon: userDataProfile_1.defaultUserDataProfileIcon,
                hideIfEmpty: true,
            }, 0 /* ViewContainerLocation.Sidebar */);
            urlService.registerHandler(this);
        }
        isProfileURL(uri) {
            return uri.authority === userDataProfile_1.PROFILE_URL_AUTHORITY || new RegExp(`^${UserDataProfileImportExportService_1.PROFILE_URL_AUTHORITY_PREFIX}`).test(uri.authority);
        }
        async handleURL(uri) {
            if (this.isProfileURL(uri)) {
                try {
                    await this.importProfile(uri);
                }
                catch (error) {
                    this.notificationService.error((0, nls_1.localize)('profile import error', "Error while importing profile: {0}", (0, errors_1.getErrorMessage)(error)));
                }
                return true;
            }
            return false;
        }
        registerProfileContentHandler(id, profileContentHandler) {
            if (this.profileContentHandlers.has(id)) {
                throw new Error(`Profile content handler with id '${id}' already registered.`);
            }
            this.profileContentHandlers.set(id, profileContentHandler);
            return (0, lifecycle_1.toDisposable)(() => this.unregisterProfileContentHandler(id));
        }
        unregisterProfileContentHandler(id) {
            this.profileContentHandlers.delete(id);
        }
        async exportProfile() {
            if (this.isProfileExportInProgressContextKey.get()) {
                this.logService.warn('Profile export already in progress.');
                return;
            }
            return this.showProfileContents();
        }
        async importProfile(uri, options) {
            if (this.isProfileImportInProgressContextKey.get()) {
                this.notificationService.warn('Profile import already in progress.');
                return;
            }
            this.isProfileImportInProgressContextKey.set(true);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, lifecycle_1.toDisposable)(() => this.isProfileImportInProgressContextKey.set(false)));
            try {
                const mode = options?.mode ?? 'preview';
                const profileTemplate = await this.progressService.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    command: logConstants_1.showWindowLogActionId,
                    title: (0, nls_1.localize)('resolving uri', "{0}: Resolving profile content...", options?.mode ? (0, nls_1.localize)('preview profile', "Preview Profile") : (0, nls_1.localize)('import profile', "Create Profile")),
                }, () => this.resolveProfileTemplate(uri, options));
                if (!profileTemplate) {
                    return;
                }
                if (mode === 'preview') {
                    await this.previewProfile(profileTemplate, options);
                }
                else if (mode === 'apply') {
                    await this.createAndSwitch(profileTemplate, false, true, options, (0, nls_1.localize)('create profile', "Create Profile"));
                }
                else if (mode === 'both') {
                    await this.importAndPreviewProfile(uri, profileTemplate, options);
                }
            }
            finally {
                disposables.dispose();
            }
        }
        createProfile(from) {
            return this.saveProfile(undefined, from);
        }
        editProfile(profile) {
            return this.saveProfile(profile);
        }
        async saveProfile(profile, source) {
            const createProfileTelemetryData = { source: source instanceof uri_1.URI ? 'template' : (0, userDataProfile_2.isUserDataProfile)(source) ? 'profile' : source ? 'external' : undefined };
            if (profile) {
                this.telemetryService.publicLog2('userDataProfile.startEdit');
            }
            else {
                this.telemetryService.publicLog2('userDataProfile.startCreate', createProfileTelemetryData);
            }
            const disposables = new lifecycle_1.DisposableStore();
            const title = profile ? (0, nls_1.localize)('save profile', "Edit {0} Profile...", profile.name) : (0, nls_1.localize)('create new profle', "Create New Profile...");
            const settings = { id: "settings" /* ProfileResourceType.Settings */, label: (0, nls_1.localize)('settings', "Settings"), picked: !profile?.useDefaultFlags?.settings };
            const keybindings = { id: "keybindings" /* ProfileResourceType.Keybindings */, label: (0, nls_1.localize)('keybindings', "Keyboard Shortcuts"), picked: !profile?.useDefaultFlags?.keybindings };
            const snippets = { id: "snippets" /* ProfileResourceType.Snippets */, label: (0, nls_1.localize)('snippets', "User Snippets"), picked: !profile?.useDefaultFlags?.snippets };
            const tasks = { id: "tasks" /* ProfileResourceType.Tasks */, label: (0, nls_1.localize)('tasks', "User Tasks"), picked: !profile?.useDefaultFlags?.tasks };
            const extensions = { id: "extensions" /* ProfileResourceType.Extensions */, label: (0, nls_1.localize)('extensions', "Extensions"), picked: !profile?.useDefaultFlags?.extensions };
            const resources = [settings, keybindings, snippets, tasks, extensions];
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.title = title;
            quickPick.placeholder = (0, nls_1.localize)('name placeholder', "Profile name");
            quickPick.value = profile?.name ?? (isUserDataProfileTemplate(source) ? this.generateProfileName(source.name) : '');
            quickPick.canSelectMany = true;
            quickPick.matchOnDescription = false;
            quickPick.matchOnDetail = false;
            quickPick.matchOnLabel = false;
            quickPick.sortByLabel = false;
            quickPick.hideCountBadge = true;
            quickPick.ok = false;
            quickPick.customButton = true;
            quickPick.hideCheckAll = true;
            quickPick.ignoreFocusOut = true;
            quickPick.customLabel = profile ? (0, nls_1.localize)('save', "Save") : (0, nls_1.localize)('create', "Create");
            quickPick.description = (0, nls_1.localize)('customise the profile', "Choose what to configure in your Profile:");
            quickPick.items = [...resources];
            const update = () => {
                quickPick.items = resources;
                quickPick.selectedItems = resources.filter(item => item.picked);
            };
            update();
            const validate = () => {
                if (!profile && this.userDataProfilesService.profiles.some(p => p.name === quickPick.value)) {
                    quickPick.validationMessage = (0, nls_1.localize)('profileExists', "Profile with name {0} already exists.", quickPick.value);
                    quickPick.severity = severity_1.default.Warning;
                    return;
                }
                if (resources.every(resource => !resource.picked)) {
                    quickPick.validationMessage = (0, nls_1.localize)('invalid configurations', "The profile should contain at least one configuration.");
                    quickPick.severity = severity_1.default.Warning;
                    return;
                }
                quickPick.severity = severity_1.default.Ignore;
                quickPick.validationMessage = undefined;
            };
            disposables.add(quickPick.onDidChangeSelection(items => {
                let needUpdate = false;
                for (const resource of resources) {
                    resource.picked = items.includes(resource);
                    const description = resource.picked ? undefined : (0, nls_1.localize)('use default profile', "Using Default Profile");
                    if (resource.description !== description) {
                        resource.description = description;
                        needUpdate = true;
                    }
                }
                if (needUpdate) {
                    update();
                }
                validate();
            }));
            disposables.add(quickPick.onDidChangeValue(validate));
            let result;
            disposables.add(event_1.Event.any(quickPick.onDidCustom, quickPick.onDidAccept)(() => {
                const name = quickPick.value.trim();
                if (!name) {
                    quickPick.validationMessage = (0, nls_1.localize)('name required', "Profile name is required and must be a non-empty value.");
                    quickPick.severity = severity_1.default.Error;
                }
                if (quickPick.validationMessage) {
                    return;
                }
                result = { name, items: quickPick.selectedItems };
                quickPick.hide();
                quickPick.severity = severity_1.default.Ignore;
                quickPick.validationMessage = undefined;
            }));
            if (!profile && !isUserDataProfileTemplate(source)) {
                const domNode = DOM.$('.profile-type-widget');
                DOM.append(domNode, DOM.$('.profile-type-create-label', undefined, (0, nls_1.localize)('create from', "Copy from:")));
                const separator = { text: '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', isDisabled: true };
                const profileOptions = [];
                profileOptions.push({ text: (0, nls_1.localize)('empty profile', "None") });
                const templates = await this.userDataProfileManagementService.getBuiltinProfileTemplates();
                if (templates.length) {
                    profileOptions.push({ ...separator, decoratorRight: (0, nls_1.localize)('from templates', "Profile Templates") });
                    for (const template of templates) {
                        profileOptions.push({ text: template.name, id: template.url, source: uri_1.URI.parse(template.url) });
                    }
                }
                profileOptions.push({ ...separator, decoratorRight: (0, nls_1.localize)('from existing profiles', "Existing Profiles") });
                for (const profile of this.userDataProfilesService.profiles) {
                    profileOptions.push({ text: profile.name, id: profile.id, source: profile });
                }
                const findOptionIndex = () => {
                    const index = profileOptions.findIndex(option => {
                        if (source instanceof uri_1.URI) {
                            return option.source instanceof uri_1.URI && this.uriIdentityService.extUri.isEqual(option.source, source);
                        }
                        else if ((0, userDataProfile_2.isUserDataProfile)(source)) {
                            return option.id === source.id;
                        }
                        return false;
                    });
                    return index > -1 ? index : 0;
                };
                const initialIndex = findOptionIndex();
                const selectBox = disposables.add(this.instantiationService.createInstance(selectBox_1.SelectBox, profileOptions, initialIndex, this.contextViewService, defaultStyles_1.defaultSelectBoxStyles, { useCustomDrawn: true }));
                selectBox.render(DOM.append(domNode, DOM.$('.profile-type-select-container')));
                quickPick.widget = domNode;
                if (profileOptions[initialIndex].source) {
                    quickPick.value = this.generateProfileName(profileOptions[initialIndex].text);
                }
                const updateOptions = () => {
                    const option = profileOptions[findOptionIndex()];
                    for (const resource of resources) {
                        resource.picked = option.source && !(option.source instanceof uri_1.URI) ? !option.source?.useDefaultFlags?.[resource.id] : true;
                    }
                    update();
                };
                updateOptions();
                disposables.add(selectBox.onDidSelect(({ index }) => {
                    source = profileOptions[index].source;
                    updateOptions();
                }));
            }
            quickPick.show();
            await new Promise((c, e) => {
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
            });
            if (!result) {
                if (profile) {
                    this.telemetryService.publicLog2('userDataProfile.cancelEdit');
                }
                else {
                    this.telemetryService.publicLog2('userDataProfile.cancelCreate', createProfileTelemetryData);
                }
                return;
            }
            try {
                const useDefaultFlags = result.items.length === resources.length
                    ? undefined
                    : {
                        settings: !result.items.includes(settings),
                        keybindings: !result.items.includes(keybindings),
                        snippets: !result.items.includes(snippets),
                        tasks: !result.items.includes(tasks),
                        extensions: !result.items.includes(extensions)
                    };
                if (profile) {
                    await this.userDataProfileManagementService.updateProfile(profile, { name: result.name, useDefaultFlags: profile.useDefaultFlags && !useDefaultFlags ? {} : useDefaultFlags });
                }
                else {
                    if (source instanceof uri_1.URI) {
                        this.telemetryService.publicLog2('userDataProfile.createFromTemplate', createProfileTelemetryData);
                        await this.importProfile(source, { mode: 'apply', name: result.name, useDefaultFlags });
                    }
                    else if ((0, userDataProfile_2.isUserDataProfile)(source)) {
                        this.telemetryService.publicLog2('userDataProfile.createFromProfile', createProfileTelemetryData);
                        await this.createFromProfile(source, result.name, { useDefaultFlags });
                    }
                    else if (isUserDataProfileTemplate(source)) {
                        source.name = result.name;
                        this.telemetryService.publicLog2('userDataProfile.createFromExternalTemplate', createProfileTelemetryData);
                        await this.createAndSwitch(source, false, true, { useDefaultFlags }, (0, nls_1.localize)('create profile', "Create Profile"));
                    }
                    else {
                        this.telemetryService.publicLog2('userDataProfile.createEmptyProfile', createProfileTelemetryData);
                        await this.userDataProfileManagementService.createAndEnterProfile(result.name, { useDefaultFlags });
                    }
                }
            }
            catch (error) {
                this.notificationService.error(error);
            }
        }
        async showProfileContents() {
            const view = this.viewsService.getViewWithId(EXPORT_PROFILE_PREVIEW_VIEW);
            if (view) {
                this.viewsService.openView(view.id, true);
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const userDataProfilesExportState = disposables.add(this.instantiationService.createInstance(UserDataProfileExportState, this.userDataProfileService.currentProfile));
                const barrier = new async_1.Barrier();
                const exportAction = new BarrierAction(barrier, new actions_1.Action('export', (0, nls_1.localize)('export', "Export"), undefined, true, async () => {
                    exportAction.enabled = false;
                    try {
                        await this.doExportProfile(userDataProfilesExportState);
                    }
                    catch (error) {
                        this.notificationService.error(error);
                        throw error;
                    }
                }), this.notificationService);
                const closeAction = new BarrierAction(barrier, new actions_1.Action('close', (0, nls_1.localize)('close', "Close")), this.notificationService);
                await this.showProfilePreviewView(EXPORT_PROFILE_PREVIEW_VIEW, userDataProfilesExportState.profile.name, exportAction, closeAction, true, userDataProfilesExportState);
                disposables.add(this.userDataProfileService.onDidChangeCurrentProfile(e => barrier.open()));
                await barrier.wait();
                await this.hideProfilePreviewView(EXPORT_PROFILE_PREVIEW_VIEW);
            }
            finally {
                disposables.dispose();
            }
        }
        async createFromProfile(profile, name, options) {
            const userDataProfilesExportState = this.instantiationService.createInstance(UserDataProfileExportState, profile);
            try {
                const profileTemplate = await userDataProfilesExportState.getProfileTemplate(name, undefined);
                await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    delay: 500,
                    sticky: true,
                }, async (progress) => {
                    const reportProgress = (message) => progress.report({ message: (0, nls_1.localize)('create from profile', "Create Profile: {0}", message) });
                    const profile = await this.doCreateProfile(profileTemplate, false, false, { useDefaultFlags: options?.useDefaultFlags }, reportProgress);
                    if (profile) {
                        reportProgress((0, nls_1.localize)('progress extensions', "Applying Extensions..."));
                        await this.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).copy(this.userDataProfileService.currentProfile, profile, false);
                        reportProgress((0, nls_1.localize)('switching profile', "Switching Profile..."));
                        await this.userDataProfileManagementService.switchProfile(profile);
                    }
                });
            }
            finally {
                userDataProfilesExportState.dispose();
            }
        }
        async createTroubleshootProfile() {
            const userDataProfilesExportState = this.instantiationService.createInstance(UserDataProfileExportState, this.userDataProfileService.currentProfile);
            try {
                const profileTemplate = await userDataProfilesExportState.getProfileTemplate((0, nls_1.localize)('troubleshoot issue', "Troubleshoot Issue"), undefined);
                await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    delay: 1000,
                    sticky: true,
                }, async (progress) => {
                    const reportProgress = (message) => progress.report({ message: (0, nls_1.localize)('troubleshoot profile progress', "Setting up Troubleshoot Profile: {0}", message) });
                    const profile = await this.doCreateProfile(profileTemplate, true, false, { useDefaultFlags: this.userDataProfileService.currentProfile.useDefaultFlags }, reportProgress);
                    if (profile) {
                        reportProgress((0, nls_1.localize)('progress extensions', "Applying Extensions..."));
                        await this.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).copy(this.userDataProfileService.currentProfile, profile, true);
                        reportProgress((0, nls_1.localize)('switching profile', "Switching Profile..."));
                        await this.userDataProfileManagementService.switchProfile(profile);
                    }
                });
            }
            finally {
                userDataProfilesExportState.dispose();
            }
        }
        async doExportProfile(userDataProfilesExportState) {
            const profile = await userDataProfilesExportState.getProfileToExport();
            if (!profile) {
                return;
            }
            this.isProfileExportInProgressContextKey.set(true);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, lifecycle_1.toDisposable)(() => this.isProfileExportInProgressContextKey.set(false)));
            try {
                await this.progressService.withProgress({
                    location: EXPORT_PROFILE_PREVIEW_VIEW,
                    title: (0, nls_1.localize)('profiles.exporting', "{0}: Exporting...", userDataProfile_1.PROFILES_CATEGORY.value),
                }, async (progress) => {
                    const id = await this.pickProfileContentHandler(profile.name);
                    if (!id) {
                        return;
                    }
                    const profileContentHandler = this.profileContentHandlers.get(id);
                    if (!profileContentHandler) {
                        return;
                    }
                    const saveResult = await profileContentHandler.saveProfile(profile.name.replace('/', '-'), JSON.stringify(profile), cancellation_1.CancellationToken.None);
                    if (!saveResult) {
                        return;
                    }
                    const message = (0, nls_1.localize)('export success', "Profile '{0}' was exported successfully.", profile.name);
                    if (profileContentHandler.extensionId) {
                        const buttons = [];
                        const link = this.productService.webUrl ? `${this.productService.webUrl}/${userDataProfile_1.PROFILE_URL_AUTHORITY}/${id}/${saveResult.id}` : (0, userDataProfile_1.toUserDataProfileUri)(`/${id}/${saveResult.id}`, this.productService).toString();
                        buttons.push({
                            label: (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy Link"),
                            run: () => this.clipboardService.writeText(link)
                        });
                        if (this.productService.webUrl) {
                            buttons.push({
                                label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open Link"),
                                run: async () => {
                                    await this.openerService.open(link);
                                }
                            });
                        }
                        else {
                            buttons.push({
                                label: (0, nls_1.localize)({ key: 'open in', comment: ['&& denotes a mnemonic'] }, "&&Open in {0}", profileContentHandler.name),
                                run: async () => {
                                    await this.openerService.open(saveResult.link.toString());
                                }
                            });
                        }
                        await this.dialogService.prompt({
                            type: severity_1.default.Info,
                            message,
                            buttons,
                            cancelButton: (0, nls_1.localize)('close', "Close")
                        });
                    }
                    else {
                        await this.dialogService.info(message);
                    }
                });
            }
            finally {
                disposables.dispose();
            }
        }
        async resolveProfileTemplate(uri, options) {
            const profileContent = await this.resolveProfileContent(uri);
            if (profileContent === null) {
                return null;
            }
            const profileTemplate = JSON.parse(profileContent);
            if (!isUserDataProfileTemplate(profileTemplate)) {
                throw new Error('Invalid profile content.');
            }
            if (options?.name) {
                profileTemplate.name = options.name;
            }
            return profileTemplate;
        }
        async importAndPreviewProfile(uri, profileTemplate, options) {
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const userDataProfileImportState = disposables.add(this.instantiationService.createInstance(UserDataProfileImportState, profileTemplate));
                profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                const importedProfile = await this.createAndSwitch(profileTemplate, true, false, options, (0, nls_1.localize)('preview profile', "Preview Profile"));
                if (!importedProfile) {
                    return;
                }
                const barrier = new async_1.Barrier();
                const importAction = this.getCreateAction(barrier, userDataProfileImportState);
                const primaryAction = platform_2.isWeb
                    ? new actions_1.Action('importInDesktop', (0, nls_1.localize)('import in desktop', "Create Profile in {0}", this.productService.nameLong), undefined, true, async () => this.openerService.open(uri, { openExternal: true }))
                    : importAction;
                const secondaryAction = platform_2.isWeb
                    ? importAction
                    : new BarrierAction(barrier, new actions_1.Action('close', (0, nls_1.localize)('close', "Close")), this.notificationService);
                const view = await this.showProfilePreviewView(IMPORT_PROFILE_PREVIEW_VIEW, importedProfile.name, primaryAction, secondaryAction, false, userDataProfileImportState);
                const message = new htmlContent_1.MarkdownString();
                message.appendMarkdown((0, nls_1.localize)('preview profile message', "By default, extensions aren't installed when previewing a profile on the web. You can still install them manually before importing the profile. "));
                message.appendMarkdown(`[${(0, nls_1.localize)('learn more', "Learn more")}](https://aka.ms/vscode-extension-marketplace#_can-i-trust-extensions-from-the-marketplace).`);
                view.setMessage(message);
                const that = this;
                const disposable = disposables.add((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: 'previewProfile.installExtensions',
                            title: (0, nls_1.localize)('install extensions title', "Install Extensions"),
                            icon: codicons_1.Codicon.cloudDownload,
                            menu: {
                                id: actions_2.MenuId.ViewItemContext,
                                group: 'inline',
                                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', IMPORT_PROFILE_PREVIEW_VIEW), contextkey_1.ContextKeyExpr.equals('viewItem', "extensions" /* ProfileResourceType.Extensions */)),
                            }
                        });
                    }
                    async run() {
                        return that.progressService.withProgress({
                            location: IMPORT_PROFILE_PREVIEW_VIEW,
                        }, async (progress) => {
                            view.setMessage(undefined);
                            const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                            if (profileTemplate.extensions) {
                                await that.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).apply(profileTemplate.extensions, importedProfile);
                            }
                            disposable.dispose();
                        });
                    }
                }));
                disposables.add(event_1.Event.debounce(this.extensionManagementService.onDidInstallExtensions, () => undefined, 100)(async () => {
                    const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                    if (profileTemplate.extensions) {
                        const profileExtensions = await that.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).getProfileExtensions(profileTemplate.extensions);
                        const installed = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
                        if (profileExtensions.every(e => installed.some(i => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, i.identifier)))) {
                            disposable.dispose();
                        }
                    }
                }));
                await barrier.wait();
                await this.hideProfilePreviewView(IMPORT_PROFILE_PREVIEW_VIEW);
            }
            finally {
                disposables.dispose();
            }
        }
        async previewProfile(profileTemplate, options) {
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const userDataProfileImportState = disposables.add(this.instantiationService.createInstance(UserDataProfileImportState, profileTemplate));
                if (userDataProfileImportState.isEmpty()) {
                    await this.createAndSwitch(profileTemplate, false, true, options, (0, nls_1.localize)('create profile', "Create Profile"));
                }
                else {
                    const barrier = new async_1.Barrier();
                    const cancelAction = new BarrierAction(barrier, new actions_1.Action('cancel', (0, nls_1.localize)('cancel', "Cancel")), this.notificationService);
                    const importAction = this.getCreateAction(barrier, userDataProfileImportState, cancelAction);
                    await this.showProfilePreviewView(IMPORT_PROFILE_PREVIEW_VIEW, profileTemplate.name, importAction, cancelAction, false, userDataProfileImportState);
                    await barrier.wait();
                    await this.hideProfilePreviewView(IMPORT_PROFILE_PREVIEW_VIEW);
                }
            }
            finally {
                disposables.dispose();
            }
        }
        getCreateAction(barrier, userDataProfileImportState, cancelAction) {
            const importAction = new BarrierAction(barrier, new actions_1.Action('title', (0, nls_1.localize)('import', "Create Profile"), undefined, true, async () => {
                importAction.enabled = false;
                if (cancelAction) {
                    cancelAction.enabled = false;
                }
                const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                return this.saveProfile(undefined, profileTemplate);
            }), this.notificationService);
            return importAction;
        }
        async createAndSwitch(profileTemplate, temporaryProfile, extensions, options, title) {
            return this.progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                delay: 500,
                sticky: true,
            }, async (progress) => {
                title = `${title} (${profileTemplate.name})`;
                progress.report({ message: title });
                const reportProgress = (message) => progress.report({ message: `${title}: ${message}` });
                const profile = await this.doCreateProfile(profileTemplate, temporaryProfile, extensions, options, reportProgress);
                if (profile) {
                    reportProgress((0, nls_1.localize)('switching profile', "Switching Profile..."));
                    await this.userDataProfileManagementService.switchProfile(profile);
                }
                return profile;
            });
        }
        async doCreateProfile(profileTemplate, temporaryProfile, extensions, options, progress) {
            const profile = await this.getProfileToImport(profileTemplate, temporaryProfile, options);
            if (!profile) {
                return undefined;
            }
            if (profileTemplate.settings && !profile.useDefaultFlags?.settings) {
                progress((0, nls_1.localize)('progress settings', "Applying Settings..."));
                await this.instantiationService.createInstance(settingsResource_1.SettingsResource).apply(profileTemplate.settings, profile);
            }
            if (profileTemplate.keybindings && !profile.useDefaultFlags?.keybindings) {
                progress((0, nls_1.localize)('progress keybindings', "Applying Keyboard Shortcuts..."));
                await this.instantiationService.createInstance(keybindingsResource_1.KeybindingsResource).apply(profileTemplate.keybindings, profile);
            }
            if (profileTemplate.tasks && !profile.useDefaultFlags?.tasks) {
                progress((0, nls_1.localize)('progress tasks', "Applying Tasks..."));
                await this.instantiationService.createInstance(tasksResource_1.TasksResource).apply(profileTemplate.tasks, profile);
            }
            if (profileTemplate.snippets && !profile.useDefaultFlags?.snippets) {
                progress((0, nls_1.localize)('progress snippets', "Applying Snippets..."));
                await this.instantiationService.createInstance(snippetsResource_1.SnippetsResource).apply(profileTemplate.snippets, profile);
            }
            if (profileTemplate.globalState && !profile.useDefaultFlags?.globalState) {
                progress((0, nls_1.localize)('progress global state', "Applying State..."));
                await this.instantiationService.createInstance(globalStateResource_1.GlobalStateResource).apply(profileTemplate.globalState, profile);
            }
            if (profileTemplate.extensions && extensions && !profile.useDefaultFlags?.extensions) {
                progress((0, nls_1.localize)('progress extensions', "Applying Extensions..."));
                await this.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).apply(profileTemplate.extensions, profile);
            }
            return profile;
        }
        async resolveProfileContent(resource) {
            if (await this.fileUserDataProfileContentHandler.canHandle(resource)) {
                return this.fileUserDataProfileContentHandler.readProfile(resource, cancellation_1.CancellationToken.None);
            }
            if (this.isProfileURL(resource)) {
                let handlerId, idOrUri;
                if (resource.authority === userDataProfile_1.PROFILE_URL_AUTHORITY) {
                    idOrUri = this.uriIdentityService.extUri.basename(resource);
                    handlerId = this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(resource));
                }
                else {
                    handlerId = resource.authority.substring(UserDataProfileImportExportService_1.PROFILE_URL_AUTHORITY_PREFIX.length);
                    idOrUri = uri_1.URI.parse(resource.path.substring(1));
                }
                await this.extensionService.activateByEvent(`onProfile:${handlerId}`);
                const profileContentHandler = this.profileContentHandlers.get(handlerId);
                if (profileContentHandler) {
                    return profileContentHandler.readProfile(idOrUri, cancellation_1.CancellationToken.None);
                }
            }
            await this.extensionService.activateByEvent('onProfile');
            for (const profileContentHandler of this.profileContentHandlers.values()) {
                const content = await profileContentHandler.readProfile(resource, cancellation_1.CancellationToken.None);
                if (content !== null) {
                    return content;
                }
            }
            const context = await this.requestService.request({ type: 'GET', url: resource.toString(true) }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode === 200) {
                return await (0, request_1.asText)(context);
            }
            else {
                const message = await (0, request_1.asText)(context);
                throw new Error(`Failed to get profile from URL: ${resource.toString()}. Status code: ${context.res.statusCode}. Message: ${message}`);
            }
        }
        async pickProfileContentHandler(name) {
            await this.extensionService.activateByEvent('onProfile');
            if (this.profileContentHandlers.size === 1) {
                return this.profileContentHandlers.keys().next().value;
            }
            const options = [];
            for (const [id, profileContentHandler] of this.profileContentHandlers) {
                options.push({ id, label: profileContentHandler.name, description: profileContentHandler.description });
            }
            const result = await this.quickInputService.pick(options.reverse(), {
                title: (0, nls_1.localize)('select profile content handler', "Export '{0}' profile as...", name),
                hideInput: true
            });
            return result?.id;
        }
        async getProfileToImport(profileTemplate, temp, options) {
            const profileName = profileTemplate.name;
            const profile = this.userDataProfilesService.profiles.find(p => p.name === profileName);
            if (profile) {
                if (temp) {
                    return this.userDataProfilesService.createNamedProfile(`${profileName} ${this.getProfileNameIndex(profileName)}`, { ...options, shortName: profileTemplate.shortName, transient: temp });
                }
                let ImportProfileChoice;
                (function (ImportProfileChoice) {
                    ImportProfileChoice[ImportProfileChoice["Overwrite"] = 0] = "Overwrite";
                    ImportProfileChoice[ImportProfileChoice["CreateNew"] = 1] = "CreateNew";
                    ImportProfileChoice[ImportProfileChoice["Cancel"] = 2] = "Cancel";
                })(ImportProfileChoice || (ImportProfileChoice = {}));
                const { result } = await this.dialogService.prompt({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)('profile already exists', "Profile with name '{0}' already exists. Do you want to overwrite it?", profileName),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'overwrite', comment: ['&& denotes a mnemonic'] }, "&&Overwrite"),
                            run: () => ImportProfileChoice.Overwrite
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'create new', comment: ['&& denotes a mnemonic'] }, "&&Create New Profile"),
                            run: () => ImportProfileChoice.CreateNew
                        },
                    ],
                    cancelButton: {
                        run: () => ImportProfileChoice.Cancel
                    }
                });
                if (result === ImportProfileChoice.Overwrite) {
                    return profile;
                }
                if (result === ImportProfileChoice.Cancel) {
                    return undefined;
                }
                // Create new profile
                const name = await this.quickInputService.input({
                    placeHolder: (0, nls_1.localize)('name', "Profile name"),
                    title: (0, nls_1.localize)('create new title', "Create New Profile"),
                    value: `${profileName} ${this.getProfileNameIndex(profileName)}`,
                    validateInput: async (value) => {
                        if (this.userDataProfilesService.profiles.some(p => p.name === value)) {
                            return (0, nls_1.localize)('profileExists', "Profile with name {0} already exists.", value);
                        }
                        return undefined;
                    }
                });
                if (!name) {
                    return undefined;
                }
                return this.userDataProfilesService.createNamedProfile(name);
            }
            else {
                return this.userDataProfilesService.createNamedProfile(profileName, { ...options, shortName: profileTemplate.shortName, transient: temp });
            }
        }
        generateProfileName(profileName) {
            const existingProfile = this.userDataProfilesService.profiles.find(p => p.name === profileName);
            return existingProfile ? `${profileName} ${this.getProfileNameIndex(profileName)}` : profileName;
        }
        getProfileNameIndex(name) {
            const nameRegEx = new RegExp(`${(0, strings_1.escapeRegExpCharacters)(name)}\\s(\\d+)`);
            let nameIndex = 0;
            for (const profile of this.userDataProfilesService.profiles) {
                const matches = nameRegEx.exec(profile.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            return nameIndex + 1;
        }
        async showProfilePreviewView(id, name, primary, secondary, refreshAction, userDataProfilesData) {
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, id, name);
            if (refreshAction) {
                treeView.showRefreshAction = true;
            }
            const actionRunner = new actions_1.ActionRunner();
            const descriptor = {
                id,
                name,
                ctorDescriptor: new descriptors_1.SyncDescriptor(UserDataProfilePreviewViewPane, [userDataProfilesData, primary, secondary, actionRunner]),
                canToggleVisibility: false,
                canMoveView: false,
                treeView,
                collapsed: false,
            };
            viewsRegistry.registerViews([descriptor], this.viewContainer);
            return (await this.viewsService.openView(id, true));
        }
        async hideProfilePreviewView(id) {
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            const viewDescriptor = viewsRegistry.getView(id);
            if (viewDescriptor) {
                viewDescriptor.treeView.dispose();
                viewsRegistry.deregisterViews([viewDescriptor], this.viewContainer);
            }
            await this.closeAllImportExportPreviewEditors();
        }
        async closeAllImportExportPreviewEditors() {
            const editorsToColse = this.editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(({ editor }) => editor.resource?.scheme === USER_DATA_PROFILE_EXPORT_SCHEME || editor.resource?.scheme === USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME || editor.resource?.scheme === USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME);
            if (editorsToColse.length) {
                await this.editorService.closeEditors(editorsToColse);
            }
        }
        async setProfile(profile) {
            await this.progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                title: (0, nls_1.localize)('profiles.applying', "{0}: Applying...", userDataProfile_1.PROFILES_CATEGORY.value),
            }, async (progress) => {
                if (profile.settings) {
                    await this.instantiationService.createInstance(settingsResource_1.SettingsResource).apply(profile.settings, this.userDataProfileService.currentProfile);
                }
                if (profile.globalState) {
                    await this.instantiationService.createInstance(globalStateResource_1.GlobalStateResource).apply(profile.globalState, this.userDataProfileService.currentProfile);
                }
                if (profile.extensions) {
                    await this.instantiationService.createInstance(extensionsResource_1.ExtensionsResource).apply(profile.extensions, this.userDataProfileService.currentProfile);
                }
            });
            this.notificationService.info((0, nls_1.localize)('applied profile', "{0}: Applied successfully.", userDataProfile_1.PROFILES_CATEGORY.value));
        }
    };
    exports.UserDataProfileImportExportService = UserDataProfileImportExportService;
    exports.UserDataProfileImportExportService = UserDataProfileImportExportService = UserDataProfileImportExportService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, views_1.IViewsService),
        __param(3, editorService_1.IEditorService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, userDataProfile_1.IUserDataProfileManagementService),
        __param(6, userDataProfile_2.IUserDataProfilesService),
        __param(7, extensions_2.IExtensionService),
        __param(8, extensionManagement_1.IExtensionManagementService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, notification_1.INotificationService),
        __param(11, progress_1.IProgressService),
        __param(12, dialogs_1.IDialogService),
        __param(13, clipboardService_1.IClipboardService),
        __param(14, opener_1.IOpenerService),
        __param(15, request_1.IRequestService),
        __param(16, url_1.IURLService),
        __param(17, productService_1.IProductService),
        __param(18, uriIdentity_1.IUriIdentityService),
        __param(19, telemetry_1.ITelemetryService),
        __param(20, contextView_1.IContextViewService),
        __param(21, log_1.ILogService)
    ], UserDataProfileImportExportService);
    let FileUserDataProfileContentHandler = class FileUserDataProfileContentHandler {
        constructor(fileDialogService, uriIdentityService, fileService, textFileService) {
            this.fileDialogService = fileDialogService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.name = (0, nls_1.localize)('local', "Local");
            this.description = (0, nls_1.localize)('file', "file");
        }
        async saveProfile(name, content, token) {
            const link = await this.fileDialogService.showSaveDialog({
                title: (0, nls_1.localize)('export profile dialog', "Save Profile"),
                filters: userDataProfile_1.PROFILE_FILTER,
                defaultUri: this.uriIdentityService.extUri.joinPath(await this.fileDialogService.defaultFilePath(), `${name}.${userDataProfile_1.PROFILE_EXTENSION}`),
            });
            if (!link) {
                return null;
            }
            await this.textFileService.create([{ resource: link, value: content, options: { overwrite: true } }]);
            return { link, id: link.toString() };
        }
        async canHandle(uri) {
            return uri.scheme !== network_1.Schemas.http && uri.scheme !== network_1.Schemas.https && await this.fileService.canHandleResource(uri);
        }
        async readProfile(uri, token) {
            if (await this.canHandle(uri)) {
                return (await this.fileService.readFile(uri, undefined, token)).value.toString();
            }
            return null;
        }
        async selectProfile() {
            const profileLocation = await this.fileDialogService.showOpenDialog({
                canSelectFolders: false,
                canSelectFiles: true,
                canSelectMany: false,
                filters: userDataProfile_1.PROFILE_FILTER,
                title: (0, nls_1.localize)('select profile', "Select Profile"),
            });
            return profileLocation ? profileLocation[0] : null;
        }
    };
    FileUserDataProfileContentHandler = __decorate([
        __param(0, dialogs_1.IFileDialogService),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService)
    ], FileUserDataProfileContentHandler);
    let UserDataProfilePreviewViewPane = class UserDataProfilePreviewViewPane extends treeView_1.TreeViewPane {
        constructor(userDataProfileData, primaryAction, secondaryAction, actionRunner, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
            this.userDataProfileData = userDataProfileData;
            this.primaryAction = primaryAction;
            this.secondaryAction = secondaryAction;
            this.actionRunner = actionRunner;
            this.totalTreeItemsCount = 0;
            this.renderDisposables = this._register(new lifecycle_1.DisposableStore());
        }
        renderTreeView(container) {
            this.treeView.dataProvider = this.userDataProfileData;
            super.renderTreeView(DOM.append(container, DOM.$('.profile-view-tree-container')));
            this.messageContainer = DOM.append(container, DOM.$('.profile-view-message-container.hide'));
            this.createButtons(container);
            this._register(this.treeView.onDidChangeCheckboxState(() => this.updateConfirmButtonEnablement()));
            this.computeAndLayout();
            this._register(event_1.Event.any(this.userDataProfileData.onDidChangeRoots, this.treeView.onDidCollapseItem, this.treeView.onDidExpandItem)(() => this.computeAndLayout()));
        }
        async computeAndLayout() {
            const roots = await this.userDataProfileData.getRoots();
            const children = await Promise.all(roots.map(async (root) => {
                let expanded = root.collapsibleState === views_1.TreeItemCollapsibleState.Expanded;
                try {
                    expanded = !this.treeView.isCollapsed(root);
                }
                catch (error) { /* Ignore because element might not be added yet */ }
                if (expanded) {
                    const children = await root.getChildren();
                    return children ?? [];
                }
                return [];
            }));
            this.totalTreeItemsCount = roots.length + children.flat().length;
            this.updateConfirmButtonEnablement();
            if (this.dimension) {
                this.layoutTreeView(this.dimension.height, this.dimension.width);
            }
        }
        createButtons(container) {
            this.buttonsContainer = DOM.append(container, DOM.$('.profile-view-buttons-container'));
            this.primaryButton = this._register(new button_1.Button(this.buttonsContainer, { ...defaultStyles_1.defaultButtonStyles }));
            this.primaryButton.element.classList.add('profile-view-button');
            this.primaryButton.label = this.primaryAction.label;
            this.primaryButton.enabled = this.primaryAction.enabled;
            this._register(this.primaryButton.onDidClick(() => this.actionRunner.run(this.primaryAction)));
            this._register(this.primaryAction.onDidChange(e => {
                if (e.enabled !== undefined) {
                    this.primaryButton.enabled = e.enabled;
                }
            }));
            this.secondaryButton = this._register(new button_1.Button(this.buttonsContainer, { secondary: true, ...defaultStyles_1.defaultButtonStyles }));
            this.secondaryButton.label = this.secondaryAction.label;
            this.secondaryButton.element.classList.add('profile-view-button');
            this.secondaryButton.enabled = this.secondaryAction.enabled;
            this._register(this.secondaryButton.onDidClick(() => this.actionRunner.run(this.secondaryAction)));
            this._register(this.secondaryAction.onDidChange(e => {
                if (e.enabled !== undefined) {
                    this.secondaryButton.enabled = e.enabled;
                }
            }));
        }
        layoutTreeView(height, width) {
            this.dimension = new DOM.Dimension(width, height);
            let messageContainerHeight = 0;
            if (!this.messageContainer.classList.contains('hide')) {
                messageContainerHeight = DOM.getClientArea(this.messageContainer).height;
            }
            const buttonContainerHeight = 108;
            this.buttonsContainer.style.height = `${buttonContainerHeight}px`;
            this.buttonsContainer.style.width = `${width}px`;
            super.layoutTreeView(Math.min(height - buttonContainerHeight - messageContainerHeight, 22 * this.totalTreeItemsCount), width);
        }
        updateConfirmButtonEnablement() {
            this.primaryButton.enabled = this.primaryAction.enabled && this.userDataProfileData.isEnabled();
        }
        setMessage(message) {
            this.messageContainer.classList.toggle('hide', !message);
            DOM.clearNode(this.messageContainer);
            if (message) {
                this.renderDisposables.clear();
                const rendered = this.renderDisposables.add((0, markdownRenderer_1.renderMarkdown)(message, {
                    actionHandler: {
                        callback: (content) => {
                            this.openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        },
                        disposables: this.renderDisposables
                    }
                }));
                DOM.append(this.messageContainer, rendered.element);
            }
        }
        refresh() {
            return this.treeView.refresh();
        }
    };
    UserDataProfilePreviewViewPane = __decorate([
        __param(5, keybinding_1.IKeybindingService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, opener_1.IOpenerService),
        __param(12, themeService_1.IThemeService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, notification_1.INotificationService)
    ], UserDataProfilePreviewViewPane);
    const USER_DATA_PROFILE_EXPORT_SCHEME = 'userdataprofileexport';
    const USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME = 'userdataprofileexportpreview';
    const USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME = 'userdataprofileimportpreview';
    let UserDataProfileImportExportState = class UserDataProfileImportExportState extends lifecycle_1.Disposable {
        constructor(quickInputService) {
            super();
            this.quickInputService = quickInputService;
            this._onDidChangeRoots = this._register(new event_1.Emitter());
            this.onDidChangeRoots = this._onDidChangeRoots.event;
            this.roots = [];
        }
        async getChildren(element) {
            if (element) {
                const children = await element.getChildren();
                if (children) {
                    for (const child of children) {
                        if (child.parent.checkbox && child.checkbox) {
                            child.checkbox.isChecked = child.parent.checkbox.isChecked && child.checkbox.isChecked;
                        }
                    }
                }
                return children;
            }
            else {
                this.rootsPromise = undefined;
                this._onDidChangeRoots.fire();
                return this.getRoots();
            }
        }
        getRoots() {
            if (!this.rootsPromise) {
                this.rootsPromise = (async () => {
                    this.roots = await this.fetchRoots();
                    for (const root of this.roots) {
                        root.checkbox = {
                            isChecked: !root.isFromDefaultProfile(),
                            tooltip: (0, nls_1.localize)('select', "Select {0}", root.label.label),
                            accessibilityInformation: {
                                label: (0, nls_1.localize)('select', "Select {0}", root.label.label),
                            }
                        };
                        if (root.isFromDefaultProfile()) {
                            root.description = (0, nls_1.localize)('from default', "From Default Profile");
                        }
                    }
                    return this.roots;
                })();
            }
            return this.rootsPromise;
        }
        isEnabled(resourceType) {
            if (resourceType !== undefined) {
                return this.roots.some(root => root.type === resourceType && this.isSelected(root));
            }
            return this.roots.some(root => this.isSelected(root));
        }
        async getProfileTemplate(name, shortName) {
            const roots = await this.getRoots();
            let settings;
            let keybindings;
            let tasks;
            let snippets;
            let extensions;
            let globalState;
            for (const root of roots) {
                if (!this.isSelected(root)) {
                    continue;
                }
                if (root instanceof settingsResource_1.SettingsResourceTreeItem) {
                    settings = await root.getContent();
                }
                else if (root instanceof keybindingsResource_1.KeybindingsResourceTreeItem) {
                    keybindings = await root.getContent();
                }
                else if (root instanceof tasksResource_1.TasksResourceTreeItem) {
                    tasks = await root.getContent();
                }
                else if (root instanceof snippetsResource_1.SnippetsResourceTreeItem) {
                    snippets = await root.getContent();
                }
                else if (root instanceof extensionsResource_1.ExtensionsResourceTreeItem) {
                    extensions = await root.getContent();
                }
                else if (root instanceof globalStateResource_1.GlobalStateResourceTreeItem) {
                    globalState = await root.getContent();
                }
            }
            return {
                name,
                shortName,
                settings,
                keybindings,
                tasks,
                snippets,
                extensions,
                globalState
            };
        }
        isSelected(treeItem) {
            if (treeItem.checkbox) {
                return treeItem.checkbox.isChecked || !!treeItem.children?.some(child => child.checkbox?.isChecked);
            }
            return true;
        }
    };
    UserDataProfileImportExportState = __decorate([
        __param(0, quickInput_1.IQuickInputService)
    ], UserDataProfileImportExportState);
    let UserDataProfileExportState = class UserDataProfileExportState extends UserDataProfileImportExportState {
        constructor(profile, quickInputService, fileService, instantiationService) {
            super(quickInputService);
            this.profile = profile;
            this.fileService = fileService;
            this.instantiationService = instantiationService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
        }
        async fetchRoots() {
            this.disposables.clear();
            this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_EXPORT_SCHEME, this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            const previewFileSystemProvider = this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME, previewFileSystemProvider));
            const roots = [];
            const exportPreviewProfle = this.createExportPreviewProfile(this.profile);
            const settingsResource = this.instantiationService.createInstance(settingsResource_1.SettingsResource);
            const settingsContent = await settingsResource.getContent(this.profile);
            await settingsResource.apply(settingsContent, exportPreviewProfle);
            const settingsResourceTreeItem = this.instantiationService.createInstance(settingsResource_1.SettingsResourceTreeItem, exportPreviewProfle);
            if (await settingsResourceTreeItem.hasContent()) {
                roots.push(settingsResourceTreeItem);
            }
            const keybindingsResource = this.instantiationService.createInstance(keybindingsResource_1.KeybindingsResource);
            const keybindingsContent = await keybindingsResource.getContent(this.profile);
            await keybindingsResource.apply(keybindingsContent, exportPreviewProfle);
            const keybindingsResourceTreeItem = this.instantiationService.createInstance(keybindingsResource_1.KeybindingsResourceTreeItem, exportPreviewProfle);
            if (await keybindingsResourceTreeItem.hasContent()) {
                roots.push(keybindingsResourceTreeItem);
            }
            const snippetsResource = this.instantiationService.createInstance(snippetsResource_1.SnippetsResource);
            const snippetsContent = await snippetsResource.getContent(this.profile);
            await snippetsResource.apply(snippetsContent, exportPreviewProfle);
            const snippetsResourceTreeItem = this.instantiationService.createInstance(snippetsResource_1.SnippetsResourceTreeItem, exportPreviewProfle);
            if (await snippetsResourceTreeItem.hasContent()) {
                roots.push(snippetsResourceTreeItem);
            }
            const tasksResource = this.instantiationService.createInstance(tasksResource_1.TasksResource);
            const tasksContent = await tasksResource.getContent(this.profile);
            await tasksResource.apply(tasksContent, exportPreviewProfle);
            const tasksResourceTreeItem = this.instantiationService.createInstance(tasksResource_1.TasksResourceTreeItem, exportPreviewProfle);
            if (await tasksResourceTreeItem.hasContent()) {
                roots.push(tasksResourceTreeItem);
            }
            const globalStateResource = (0, resources_1.joinPath)(exportPreviewProfle.globalStorageHome, 'globalState.json').with({ scheme: USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME });
            const globalStateResourceTreeItem = this.instantiationService.createInstance(globalStateResource_1.GlobalStateResourceExportTreeItem, exportPreviewProfle, globalStateResource);
            const content = await globalStateResourceTreeItem.getContent();
            if (content) {
                await this.fileService.writeFile(globalStateResource, buffer_1.VSBuffer.fromString(JSON.stringify(JSON.parse(content), null, '\t')));
                roots.push(globalStateResourceTreeItem);
            }
            const extensionsResourceTreeItem = this.instantiationService.createInstance(extensionsResource_1.ExtensionsResourceExportTreeItem, exportPreviewProfle);
            if (await extensionsResourceTreeItem.hasContent()) {
                roots.push(extensionsResourceTreeItem);
            }
            previewFileSystemProvider.setReadOnly(true);
            return roots;
        }
        createExportPreviewProfile(profile) {
            return {
                id: profile.id,
                name: profile.name,
                location: profile.location,
                isDefault: profile.isDefault,
                shortName: profile.shortName,
                globalStorageHome: profile.globalStorageHome,
                settingsResource: profile.settingsResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
                keybindingsResource: profile.keybindingsResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
                tasksResource: profile.tasksResource.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
                snippetsHome: profile.snippetsHome.with({ scheme: USER_DATA_PROFILE_EXPORT_SCHEME }),
                extensionsResource: profile.extensionsResource,
                cacheHome: profile.cacheHome,
                useDefaultFlags: profile.useDefaultFlags,
                isTransient: profile.isTransient
            };
        }
        async getProfileToExport() {
            let name = this.profile.name;
            if (this.profile.isDefault) {
                name = await this.quickInputService.input({
                    placeHolder: (0, nls_1.localize)('export profile name', "Name the profile"),
                    title: (0, nls_1.localize)('export profile title', "Export Profile"),
                    async validateInput(input) {
                        if (!input.trim()) {
                            return (0, nls_1.localize)('profile name required', "Profile name must be provided.");
                        }
                        return undefined;
                    },
                });
                if (!name) {
                    return null;
                }
            }
            return super.getProfileTemplate(name, this.profile.shortName);
        }
    };
    UserDataProfileExportState = __decorate([
        __param(1, quickInput_1.IQuickInputService),
        __param(2, files_1.IFileService),
        __param(3, instantiation_1.IInstantiationService)
    ], UserDataProfileExportState);
    let UserDataProfileImportState = class UserDataProfileImportState extends UserDataProfileImportExportState {
        constructor(profile, fileService, quickInputService, instantiationService) {
            super(quickInputService);
            this.profile = profile;
            this.fileService = fileService;
            this.instantiationService = instantiationService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
        }
        async fetchRoots() {
            this.disposables.clear();
            const inMemoryProvider = this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME, inMemoryProvider));
            const roots = [];
            const importPreviewProfle = (0, userDataProfile_2.toUserDataProfile)((0, uuid_1.generateUuid)(), this.profile.name, uri_1.URI.file('/root').with({ scheme: USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME }), uri_1.URI.file('/cache').with({ scheme: USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME }));
            if (this.profile.settings) {
                const settingsResource = this.instantiationService.createInstance(settingsResource_1.SettingsResource);
                await settingsResource.apply(this.profile.settings, importPreviewProfle);
                const settingsResourceTreeItem = this.instantiationService.createInstance(settingsResource_1.SettingsResourceTreeItem, importPreviewProfle);
                if (await settingsResourceTreeItem.hasContent()) {
                    roots.push(settingsResourceTreeItem);
                }
            }
            if (this.profile.keybindings) {
                const keybindingsResource = this.instantiationService.createInstance(keybindingsResource_1.KeybindingsResource);
                await keybindingsResource.apply(this.profile.keybindings, importPreviewProfle);
                const keybindingsResourceTreeItem = this.instantiationService.createInstance(keybindingsResource_1.KeybindingsResourceTreeItem, importPreviewProfle);
                if (await keybindingsResourceTreeItem.hasContent()) {
                    roots.push(keybindingsResourceTreeItem);
                }
            }
            if (this.profile.snippets) {
                const snippetsResource = this.instantiationService.createInstance(snippetsResource_1.SnippetsResource);
                await snippetsResource.apply(this.profile.snippets, importPreviewProfle);
                const snippetsResourceTreeItem = this.instantiationService.createInstance(snippetsResource_1.SnippetsResourceTreeItem, importPreviewProfle);
                if (await snippetsResourceTreeItem.hasContent()) {
                    roots.push(snippetsResourceTreeItem);
                }
            }
            if (this.profile.tasks) {
                const tasksResource = this.instantiationService.createInstance(tasksResource_1.TasksResource);
                await tasksResource.apply(this.profile.tasks, importPreviewProfle);
                const tasksResourceTreeItem = this.instantiationService.createInstance(tasksResource_1.TasksResourceTreeItem, importPreviewProfle);
                if (await tasksResourceTreeItem.hasContent()) {
                    roots.push(tasksResourceTreeItem);
                }
            }
            if (this.profile.globalState) {
                const globalStateResource = (0, resources_1.joinPath)(importPreviewProfle.globalStorageHome, 'globalState.json');
                const content = buffer_1.VSBuffer.fromString(JSON.stringify(JSON.parse(this.profile.globalState), null, '\t'));
                if (content) {
                    await this.fileService.writeFile(globalStateResource, content);
                    roots.push(this.instantiationService.createInstance(globalStateResource_1.GlobalStateResourceImportTreeItem, this.profile.globalState, globalStateResource));
                }
            }
            if (this.profile.extensions) {
                const extensionsResourceTreeItem = this.instantiationService.createInstance(extensionsResource_1.ExtensionsResourceImportTreeItem, this.profile.extensions);
                if (await extensionsResourceTreeItem.hasContent()) {
                    roots.push(extensionsResourceTreeItem);
                }
            }
            inMemoryProvider.setReadOnly(true);
            return roots;
        }
        isEmpty() {
            return !(this.profile.settings || this.profile.keybindings || this.profile.tasks || this.profile.snippets || this.profile.globalState || this.profile.extensions);
        }
        async getProfileTemplateToImport() {
            return this.getProfileTemplate(this.profile.name, this.profile.shortName);
        }
    };
    UserDataProfileImportState = __decorate([
        __param(1, files_1.IFileService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, instantiation_1.IInstantiationService)
    ], UserDataProfileImportState);
    class BarrierAction extends actions_1.Action {
        constructor(barrier, action, notificationService) {
            super(action.id, action.label, action.class, action.enabled, async () => {
                try {
                    await action.run();
                }
                catch (error) {
                    notificationService.error(error);
                    throw error;
                }
                barrier.open();
            });
        }
    }
    (0, extensions_1.registerSingleton)(userDataProfile_1.IUserDataProfileImportExportService, UserDataProfileImportExportService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlSW1wb3J0RXhwb3J0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci91c2VyRGF0YVByb2ZpbGVJbXBvcnRFeHBvcnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrRmhHLFNBQVMseUJBQXlCLENBQUMsS0FBYztRQUNoRCxNQUFNLFNBQVMsR0FBRyxLQUE2QyxDQUFDO1FBRWhFLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVE7ZUFDaEQsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLE9BQU8sU0FBUyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7ZUFDdEQsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUM7ZUFDN0UsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7ZUFDM0UsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLFdBQVcsS0FBSyxRQUFRLENBQUM7ZUFDakYsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxNQUFNLDJCQUEyQixHQUFHLHlDQUF5QyxDQUFDO0lBQzlFLE1BQU0sMkJBQTJCLEdBQUcseUNBQXlDLENBQUM7SUFFdkUsSUFBTSxrQ0FBa0MsR0FBeEMs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