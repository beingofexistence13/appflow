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
define(["require", "exports", "vs/nls!vs/workbench/services/userDataProfile/browser/userDataProfileImportExportService", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/base/browser/dom", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/base/common/uri", "vs/workbench/common/views", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/log/common/log", "vs/workbench/browser/parts/views/treeView", "vs/workbench/services/userDataProfile/browser/settingsResource", "vs/workbench/services/userDataProfile/browser/keybindingsResource", "vs/workbench/services/userDataProfile/browser/snippetsResource", "vs/workbench/services/userDataProfile/browser/tasksResource", "vs/workbench/services/userDataProfile/browser/extensionsResource", "vs/workbench/services/userDataProfile/browser/globalStateResource", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/browser/ui/button/button", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/base/common/uuid", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/progress/common/progress", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/network", "vs/base/common/cancellation", "vs/base/common/severity", "vs/platform/clipboard/common/clipboardService", "vs/platform/url/common/url", "vs/platform/request/common/request", "vs/platform/product/common/productService", "vs/base/common/types", "vs/base/common/actions", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/htmlContent", "vs/base/browser/markdownRenderer", "vs/workbench/services/log/common/logConstants", "vs/base/browser/ui/selectBox/selectBox", "vs/css!./media/userDataProfileView"], function (require, exports, nls_1, extensions_1, instantiation_1, notification_1, event_1, DOM, userDataProfile_1, lifecycle_1, dialogs_1, uriIdentity_1, textfiles_1, files_1, uri_1, views_1, userDataProfile_2, contextkey_1, platform_1, descriptors_1, viewPaneContainer_1, log_1, treeView_1, settingsResource_1, keybindingsResource_1, snippetsResource_1, tasksResource_1, extensionsResource_1, globalStateResource_1, inMemoryFilesystemProvider_1, button_1, keybinding_1, contextView_1, configuration_1, opener_1, themeService_1, telemetry_1, defaultStyles_1, uuid_1, editorService_1, errors_1, progress_1, extensions_2, quickInput_1, buffer_1, resources_1, strings_1, network_1, cancellation_1, severity_1, clipboardService_1, url_1, request_1, productService_1, types_1, actions_1, platform_2, actions_2, codicons_1, async_1, extensionManagement_1, extensionManagementUtil_1, htmlContent_1, markdownRenderer_1, logConstants_1, selectBox_1) {
    "use strict";
    var $sAb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sAb = void 0;
    function isUserDataProfileTemplate(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && (candidate.name && typeof candidate.name === 'string')
            && ((0, types_1.$qf)(candidate.shortName) || typeof candidate.shortName === 'string')
            && ((0, types_1.$qf)(candidate.settings) || typeof candidate.settings === 'string')
            && ((0, types_1.$qf)(candidate.globalState) || typeof candidate.globalState === 'string')
            && ((0, types_1.$qf)(candidate.extensions) || typeof candidate.extensions === 'string'));
    }
    const EXPORT_PROFILE_PREVIEW_VIEW = 'workbench.views.profiles.export.preview';
    const IMPORT_PROFILE_PREVIEW_VIEW = 'workbench.views.profiles.import.preview';
    let $sAb = class $sAb extends lifecycle_1.$kc {
        static { $sAb_1 = this; }
        static { this.a = 'profile-'; }
        constructor(m, n, r, s, contextKeyService, t, u, w, y, z, C, D, F, G, H, I, urlService, J, L, M, N, O) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.b = new Map();
            this.registerProfileContentHandler(network_1.Schemas.file, this.j = m.createInstance(FileUserDataProfileContentHandler));
            this.f = userDataProfile_1.$TJ.bindTo(contextKeyService);
            this.g = userDataProfile_1.$UJ.bindTo(contextKeyService);
            this.h = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: 'userDataProfiles',
                title: userDataProfile_1.$LJ,
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, ['userDataProfiles', { mergeViewWithContainerWhenSingleView: true }]),
                icon: userDataProfile_1.$IJ,
                hideIfEmpty: true,
            }, 0 /* ViewContainerLocation.Sidebar */);
            urlService.registerHandler(this);
        }
        P(uri) {
            return uri.authority === userDataProfile_1.$FJ || new RegExp(`^${$sAb_1.a}`).test(uri.authority);
        }
        async handleURL(uri) {
            if (this.P(uri)) {
                try {
                    await this.importProfile(uri);
                }
                catch (error) {
                    this.C.error((0, nls_1.localize)(0, null, (0, errors_1.$8)(error)));
                }
                return true;
            }
            return false;
        }
        registerProfileContentHandler(id, profileContentHandler) {
            if (this.b.has(id)) {
                throw new Error(`Profile content handler with id '${id}' already registered.`);
            }
            this.b.set(id, profileContentHandler);
            return (0, lifecycle_1.$ic)(() => this.unregisterProfileContentHandler(id));
        }
        unregisterProfileContentHandler(id) {
            this.b.delete(id);
        }
        async exportProfile() {
            if (this.f.get()) {
                this.O.warn('Profile export already in progress.');
                return;
            }
            return this.showProfileContents();
        }
        async importProfile(uri, options) {
            if (this.g.get()) {
                this.C.warn('Profile import already in progress.');
                return;
            }
            this.g.set(true);
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, lifecycle_1.$ic)(() => this.g.set(false)));
            try {
                const mode = options?.mode ?? 'preview';
                const profileTemplate = await this.D.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    command: logConstants_1.$nhb,
                    title: (0, nls_1.localize)(1, null, options?.mode ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null)),
                }, () => this.U(uri, options));
                if (!profileTemplate) {
                    return;
                }
                if (mode === 'preview') {
                    await this.X(profileTemplate, options);
                }
                else if (mode === 'apply') {
                    await this.Z(profileTemplate, false, true, options, (0, nls_1.localize)(4, null));
                }
                else if (mode === 'both') {
                    await this.W(uri, profileTemplate, options);
                }
            }
            finally {
                disposables.dispose();
            }
        }
        createProfile(from) {
            return this.Q(undefined, from);
        }
        editProfile(profile) {
            return this.Q(profile);
        }
        async Q(profile, source) {
            const createProfileTelemetryData = { source: source instanceof uri_1.URI ? 'template' : (0, userDataProfile_2.$Dk)(source) ? 'profile' : source ? 'external' : undefined };
            if (profile) {
                this.M.publicLog2('userDataProfile.startEdit');
            }
            else {
                this.M.publicLog2('userDataProfile.startCreate', createProfileTelemetryData);
            }
            const disposables = new lifecycle_1.$jc();
            const title = profile ? (0, nls_1.localize)(5, null, profile.name) : (0, nls_1.localize)(6, null);
            const settings = { id: "settings" /* ProfileResourceType.Settings */, label: (0, nls_1.localize)(7, null), picked: !profile?.useDefaultFlags?.settings };
            const keybindings = { id: "keybindings" /* ProfileResourceType.Keybindings */, label: (0, nls_1.localize)(8, null), picked: !profile?.useDefaultFlags?.keybindings };
            const snippets = { id: "snippets" /* ProfileResourceType.Snippets */, label: (0, nls_1.localize)(9, null), picked: !profile?.useDefaultFlags?.snippets };
            const tasks = { id: "tasks" /* ProfileResourceType.Tasks */, label: (0, nls_1.localize)(10, null), picked: !profile?.useDefaultFlags?.tasks };
            const extensions = { id: "extensions" /* ProfileResourceType.Extensions */, label: (0, nls_1.localize)(11, null), picked: !profile?.useDefaultFlags?.extensions };
            const resources = [settings, keybindings, snippets, tasks, extensions];
            const quickPick = this.z.createQuickPick();
            quickPick.title = title;
            quickPick.placeholder = (0, nls_1.localize)(12, null);
            quickPick.value = profile?.name ?? (isUserDataProfileTemplate(source) ? this.eb(source.name) : '');
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
            quickPick.customLabel = profile ? (0, nls_1.localize)(13, null) : (0, nls_1.localize)(14, null);
            quickPick.description = (0, nls_1.localize)(15, null);
            quickPick.items = [...resources];
            const update = () => {
                quickPick.items = resources;
                quickPick.selectedItems = resources.filter(item => item.picked);
            };
            update();
            const validate = () => {
                if (!profile && this.u.profiles.some(p => p.name === quickPick.value)) {
                    quickPick.validationMessage = (0, nls_1.localize)(16, null, quickPick.value);
                    quickPick.severity = severity_1.default.Warning;
                    return;
                }
                if (resources.every(resource => !resource.picked)) {
                    quickPick.validationMessage = (0, nls_1.localize)(17, null);
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
                    const description = resource.picked ? undefined : (0, nls_1.localize)(18, null);
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
                    quickPick.validationMessage = (0, nls_1.localize)(19, null);
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
                DOM.$0O(domNode, DOM.$('.profile-type-create-label', undefined, (0, nls_1.localize)(20, null)));
                const separator = { text: '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', isDisabled: true };
                const profileOptions = [];
                profileOptions.push({ text: (0, nls_1.localize)(21, null) });
                const templates = await this.t.getBuiltinProfileTemplates();
                if (templates.length) {
                    profileOptions.push({ ...separator, decoratorRight: (0, nls_1.localize)(22, null) });
                    for (const template of templates) {
                        profileOptions.push({ text: template.name, id: template.url, source: uri_1.URI.parse(template.url) });
                    }
                }
                profileOptions.push({ ...separator, decoratorRight: (0, nls_1.localize)(23, null) });
                for (const profile of this.u.profiles) {
                    profileOptions.push({ text: profile.name, id: profile.id, source: profile });
                }
                const findOptionIndex = () => {
                    const index = profileOptions.findIndex(option => {
                        if (source instanceof uri_1.URI) {
                            return option.source instanceof uri_1.URI && this.L.extUri.isEqual(option.source, source);
                        }
                        else if ((0, userDataProfile_2.$Dk)(source)) {
                            return option.id === source.id;
                        }
                        return false;
                    });
                    return index > -1 ? index : 0;
                };
                const initialIndex = findOptionIndex();
                const selectBox = disposables.add(this.m.createInstance(selectBox_1.$HQ, profileOptions, initialIndex, this.N, defaultStyles_1.$B2, { useCustomDrawn: true }));
                selectBox.render(DOM.$0O(domNode, DOM.$('.profile-type-select-container')));
                quickPick.widget = domNode;
                if (profileOptions[initialIndex].source) {
                    quickPick.value = this.eb(profileOptions[initialIndex].text);
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
                    this.M.publicLog2('userDataProfile.cancelEdit');
                }
                else {
                    this.M.publicLog2('userDataProfile.cancelCreate', createProfileTelemetryData);
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
                    await this.t.updateProfile(profile, { name: result.name, useDefaultFlags: profile.useDefaultFlags && !useDefaultFlags ? {} : useDefaultFlags });
                }
                else {
                    if (source instanceof uri_1.URI) {
                        this.M.publicLog2('userDataProfile.createFromTemplate', createProfileTelemetryData);
                        await this.importProfile(source, { mode: 'apply', name: result.name, useDefaultFlags });
                    }
                    else if ((0, userDataProfile_2.$Dk)(source)) {
                        this.M.publicLog2('userDataProfile.createFromProfile', createProfileTelemetryData);
                        await this.R(source, result.name, { useDefaultFlags });
                    }
                    else if (isUserDataProfileTemplate(source)) {
                        source.name = result.name;
                        this.M.publicLog2('userDataProfile.createFromExternalTemplate', createProfileTelemetryData);
                        await this.Z(source, false, true, { useDefaultFlags }, (0, nls_1.localize)(24, null));
                    }
                    else {
                        this.M.publicLog2('userDataProfile.createEmptyProfile', createProfileTelemetryData);
                        await this.t.createAndEnterProfile(result.name, { useDefaultFlags });
                    }
                }
            }
            catch (error) {
                this.C.error(error);
            }
        }
        async showProfileContents() {
            const view = this.r.getViewWithId(EXPORT_PROFILE_PREVIEW_VIEW);
            if (view) {
                this.r.openView(view.id, true);
                return;
            }
            const disposables = new lifecycle_1.$jc();
            try {
                const userDataProfilesExportState = disposables.add(this.m.createInstance(UserDataProfileExportState, this.n.currentProfile));
                const barrier = new async_1.$Fg();
                const exportAction = new BarrierAction(barrier, new actions_1.$gi('export', (0, nls_1.localize)(25, null), undefined, true, async () => {
                    exportAction.enabled = false;
                    try {
                        await this.S(userDataProfilesExportState);
                    }
                    catch (error) {
                        this.C.error(error);
                        throw error;
                    }
                }), this.C);
                const closeAction = new BarrierAction(barrier, new actions_1.$gi('close', (0, nls_1.localize)(26, null)), this.C);
                await this.gb(EXPORT_PROFILE_PREVIEW_VIEW, userDataProfilesExportState.profile.name, exportAction, closeAction, true, userDataProfilesExportState);
                disposables.add(this.n.onDidChangeCurrentProfile(e => barrier.open()));
                await barrier.wait();
                await this.hb(EXPORT_PROFILE_PREVIEW_VIEW);
            }
            finally {
                disposables.dispose();
            }
        }
        async R(profile, name, options) {
            const userDataProfilesExportState = this.m.createInstance(UserDataProfileExportState, profile);
            try {
                const profileTemplate = await userDataProfilesExportState.getProfileTemplate(name, undefined);
                await this.D.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    delay: 500,
                    sticky: true,
                }, async (progress) => {
                    const reportProgress = (message) => progress.report({ message: (0, nls_1.localize)(27, null, message) });
                    const profile = await this.ab(profileTemplate, false, false, { useDefaultFlags: options?.useDefaultFlags }, reportProgress);
                    if (profile) {
                        reportProgress((0, nls_1.localize)(28, null));
                        await this.m.createInstance(extensionsResource_1.$iAb).copy(this.n.currentProfile, profile, false);
                        reportProgress((0, nls_1.localize)(29, null));
                        await this.t.switchProfile(profile);
                    }
                });
            }
            finally {
                userDataProfilesExportState.dispose();
            }
        }
        async createTroubleshootProfile() {
            const userDataProfilesExportState = this.m.createInstance(UserDataProfileExportState, this.n.currentProfile);
            try {
                const profileTemplate = await userDataProfilesExportState.getProfileTemplate((0, nls_1.localize)(30, null), undefined);
                await this.D.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    delay: 1000,
                    sticky: true,
                }, async (progress) => {
                    const reportProgress = (message) => progress.report({ message: (0, nls_1.localize)(31, null, message) });
                    const profile = await this.ab(profileTemplate, true, false, { useDefaultFlags: this.n.currentProfile.useDefaultFlags }, reportProgress);
                    if (profile) {
                        reportProgress((0, nls_1.localize)(32, null));
                        await this.m.createInstance(extensionsResource_1.$iAb).copy(this.n.currentProfile, profile, true);
                        reportProgress((0, nls_1.localize)(33, null));
                        await this.t.switchProfile(profile);
                    }
                });
            }
            finally {
                userDataProfilesExportState.dispose();
            }
        }
        async S(userDataProfilesExportState) {
            const profile = await userDataProfilesExportState.getProfileToExport();
            if (!profile) {
                return;
            }
            this.f.set(true);
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, lifecycle_1.$ic)(() => this.f.set(false)));
            try {
                await this.D.withProgress({
                    location: EXPORT_PROFILE_PREVIEW_VIEW,
                    title: (0, nls_1.localize)(34, null, userDataProfile_1.$MJ.value),
                }, async (progress) => {
                    const id = await this.cb(profile.name);
                    if (!id) {
                        return;
                    }
                    const profileContentHandler = this.b.get(id);
                    if (!profileContentHandler) {
                        return;
                    }
                    const saveResult = await profileContentHandler.saveProfile(profile.name.replace('/', '-'), JSON.stringify(profile), cancellation_1.CancellationToken.None);
                    if (!saveResult) {
                        return;
                    }
                    const message = (0, nls_1.localize)(35, null, profile.name);
                    if (profileContentHandler.extensionId) {
                        const buttons = [];
                        const link = this.J.webUrl ? `${this.J.webUrl}/${userDataProfile_1.$FJ}/${id}/${saveResult.id}` : (0, userDataProfile_1.$GJ)(`/${id}/${saveResult.id}`, this.J).toString();
                        buttons.push({
                            label: (0, nls_1.localize)(36, null),
                            run: () => this.G.writeText(link)
                        });
                        if (this.J.webUrl) {
                            buttons.push({
                                label: (0, nls_1.localize)(37, null),
                                run: async () => {
                                    await this.H.open(link);
                                }
                            });
                        }
                        else {
                            buttons.push({
                                label: (0, nls_1.localize)(38, null, profileContentHandler.name),
                                run: async () => {
                                    await this.H.open(saveResult.link.toString());
                                }
                            });
                        }
                        await this.F.prompt({
                            type: severity_1.default.Info,
                            message,
                            buttons,
                            cancelButton: (0, nls_1.localize)(39, null)
                        });
                    }
                    else {
                        await this.F.info(message);
                    }
                });
            }
            finally {
                disposables.dispose();
            }
        }
        async U(uri, options) {
            const profileContent = await this.bb(uri);
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
        async W(uri, profileTemplate, options) {
            const disposables = new lifecycle_1.$jc();
            try {
                const userDataProfileImportState = disposables.add(this.m.createInstance(UserDataProfileImportState, profileTemplate));
                profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                const importedProfile = await this.Z(profileTemplate, true, false, options, (0, nls_1.localize)(40, null));
                if (!importedProfile) {
                    return;
                }
                const barrier = new async_1.$Fg();
                const importAction = this.Y(barrier, userDataProfileImportState);
                const primaryAction = platform_2.$o
                    ? new actions_1.$gi('importInDesktop', (0, nls_1.localize)(41, null, this.J.nameLong), undefined, true, async () => this.H.open(uri, { openExternal: true }))
                    : importAction;
                const secondaryAction = platform_2.$o
                    ? importAction
                    : new BarrierAction(barrier, new actions_1.$gi('close', (0, nls_1.localize)(42, null)), this.C);
                const view = await this.gb(IMPORT_PROFILE_PREVIEW_VIEW, importedProfile.name, primaryAction, secondaryAction, false, userDataProfileImportState);
                const message = new htmlContent_1.$Xj();
                message.appendMarkdown((0, nls_1.localize)(43, null));
                message.appendMarkdown(`[${(0, nls_1.localize)(44, null)}](https://aka.ms/vscode-extension-marketplace#_can-i-trust-extensions-from-the-marketplace).`);
                view.setMessage(message);
                const that = this;
                const disposable = disposables.add((0, actions_2.$Xu)(class extends actions_2.$Wu {
                    constructor() {
                        super({
                            id: 'previewProfile.installExtensions',
                            title: (0, nls_1.localize)(45, null),
                            icon: codicons_1.$Pj.cloudDownload,
                            menu: {
                                id: actions_2.$Ru.ViewItemContext,
                                group: 'inline',
                                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', IMPORT_PROFILE_PREVIEW_VIEW), contextkey_1.$Ii.equals('viewItem', "extensions" /* ProfileResourceType.Extensions */)),
                            }
                        });
                    }
                    async run() {
                        return that.D.withProgress({
                            location: IMPORT_PROFILE_PREVIEW_VIEW,
                        }, async (progress) => {
                            view.setMessage(undefined);
                            const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                            if (profileTemplate.extensions) {
                                await that.m.createInstance(extensionsResource_1.$iAb).apply(profileTemplate.extensions, importedProfile);
                            }
                            disposable.dispose();
                        });
                    }
                }));
                disposables.add(event_1.Event.debounce(this.y.onDidInstallExtensions, () => undefined, 100)(async () => {
                    const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                    if (profileTemplate.extensions) {
                        const profileExtensions = await that.m.createInstance(extensionsResource_1.$iAb).getProfileExtensions(profileTemplate.extensions);
                        const installed = await this.y.getInstalled(1 /* ExtensionType.User */);
                        if (profileExtensions.every(e => installed.some(i => (0, extensionManagementUtil_1.$po)(e.identifier, i.identifier)))) {
                            disposable.dispose();
                        }
                    }
                }));
                await barrier.wait();
                await this.hb(IMPORT_PROFILE_PREVIEW_VIEW);
            }
            finally {
                disposables.dispose();
            }
        }
        async X(profileTemplate, options) {
            const disposables = new lifecycle_1.$jc();
            try {
                const userDataProfileImportState = disposables.add(this.m.createInstance(UserDataProfileImportState, profileTemplate));
                if (userDataProfileImportState.isEmpty()) {
                    await this.Z(profileTemplate, false, true, options, (0, nls_1.localize)(46, null));
                }
                else {
                    const barrier = new async_1.$Fg();
                    const cancelAction = new BarrierAction(barrier, new actions_1.$gi('cancel', (0, nls_1.localize)(47, null)), this.C);
                    const importAction = this.Y(barrier, userDataProfileImportState, cancelAction);
                    await this.gb(IMPORT_PROFILE_PREVIEW_VIEW, profileTemplate.name, importAction, cancelAction, false, userDataProfileImportState);
                    await barrier.wait();
                    await this.hb(IMPORT_PROFILE_PREVIEW_VIEW);
                }
            }
            finally {
                disposables.dispose();
            }
        }
        Y(barrier, userDataProfileImportState, cancelAction) {
            const importAction = new BarrierAction(barrier, new actions_1.$gi('title', (0, nls_1.localize)(48, null), undefined, true, async () => {
                importAction.enabled = false;
                if (cancelAction) {
                    cancelAction.enabled = false;
                }
                const profileTemplate = await userDataProfileImportState.getProfileTemplateToImport();
                return this.Q(undefined, profileTemplate);
            }), this.C);
            return importAction;
        }
        async Z(profileTemplate, temporaryProfile, extensions, options, title) {
            return this.D.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                delay: 500,
                sticky: true,
            }, async (progress) => {
                title = `${title} (${profileTemplate.name})`;
                progress.report({ message: title });
                const reportProgress = (message) => progress.report({ message: `${title}: ${message}` });
                const profile = await this.ab(profileTemplate, temporaryProfile, extensions, options, reportProgress);
                if (profile) {
                    reportProgress((0, nls_1.localize)(49, null));
                    await this.t.switchProfile(profile);
                }
                return profile;
            });
        }
        async ab(profileTemplate, temporaryProfile, extensions, options, progress) {
            const profile = await this.db(profileTemplate, temporaryProfile, options);
            if (!profile) {
                return undefined;
            }
            if (profileTemplate.settings && !profile.useDefaultFlags?.settings) {
                progress((0, nls_1.localize)(50, null));
                await this.m.createInstance(settingsResource_1.$2zb).apply(profileTemplate.settings, profile);
            }
            if (profileTemplate.keybindings && !profile.useDefaultFlags?.keybindings) {
                progress((0, nls_1.localize)(51, null));
                await this.m.createInstance(keybindingsResource_1.$5zb).apply(profileTemplate.keybindings, profile);
            }
            if (profileTemplate.tasks && !profile.useDefaultFlags?.tasks) {
                progress((0, nls_1.localize)(52, null));
                await this.m.createInstance(tasksResource_1.$$zb).apply(profileTemplate.tasks, profile);
            }
            if (profileTemplate.snippets && !profile.useDefaultFlags?.snippets) {
                progress((0, nls_1.localize)(53, null));
                await this.m.createInstance(snippetsResource_1.$8zb).apply(profileTemplate.snippets, profile);
            }
            if (profileTemplate.globalState && !profile.useDefaultFlags?.globalState) {
                progress((0, nls_1.localize)(54, null));
                await this.m.createInstance(globalStateResource_1.$nAb).apply(profileTemplate.globalState, profile);
            }
            if (profileTemplate.extensions && extensions && !profile.useDefaultFlags?.extensions) {
                progress((0, nls_1.localize)(55, null));
                await this.m.createInstance(extensionsResource_1.$iAb).apply(profileTemplate.extensions, profile);
            }
            return profile;
        }
        async bb(resource) {
            if (await this.j.canHandle(resource)) {
                return this.j.readProfile(resource, cancellation_1.CancellationToken.None);
            }
            if (this.P(resource)) {
                let handlerId, idOrUri;
                if (resource.authority === userDataProfile_1.$FJ) {
                    idOrUri = this.L.extUri.basename(resource);
                    handlerId = this.L.extUri.basename(this.L.extUri.dirname(resource));
                }
                else {
                    handlerId = resource.authority.substring($sAb_1.a.length);
                    idOrUri = uri_1.URI.parse(resource.path.substring(1));
                }
                await this.w.activateByEvent(`onProfile:${handlerId}`);
                const profileContentHandler = this.b.get(handlerId);
                if (profileContentHandler) {
                    return profileContentHandler.readProfile(idOrUri, cancellation_1.CancellationToken.None);
                }
            }
            await this.w.activateByEvent('onProfile');
            for (const profileContentHandler of this.b.values()) {
                const content = await profileContentHandler.readProfile(resource, cancellation_1.CancellationToken.None);
                if (content !== null) {
                    return content;
                }
            }
            const context = await this.I.request({ type: 'GET', url: resource.toString(true) }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode === 200) {
                return await (0, request_1.$Mo)(context);
            }
            else {
                const message = await (0, request_1.$Mo)(context);
                throw new Error(`Failed to get profile from URL: ${resource.toString()}. Status code: ${context.res.statusCode}. Message: ${message}`);
            }
        }
        async cb(name) {
            await this.w.activateByEvent('onProfile');
            if (this.b.size === 1) {
                return this.b.keys().next().value;
            }
            const options = [];
            for (const [id, profileContentHandler] of this.b) {
                options.push({ id, label: profileContentHandler.name, description: profileContentHandler.description });
            }
            const result = await this.z.pick(options.reverse(), {
                title: (0, nls_1.localize)(56, null, name),
                hideInput: true
            });
            return result?.id;
        }
        async db(profileTemplate, temp, options) {
            const profileName = profileTemplate.name;
            const profile = this.u.profiles.find(p => p.name === profileName);
            if (profile) {
                if (temp) {
                    return this.u.createNamedProfile(`${profileName} ${this.fb(profileName)}`, { ...options, shortName: profileTemplate.shortName, transient: temp });
                }
                let ImportProfileChoice;
                (function (ImportProfileChoice) {
                    ImportProfileChoice[ImportProfileChoice["Overwrite"] = 0] = "Overwrite";
                    ImportProfileChoice[ImportProfileChoice["CreateNew"] = 1] = "CreateNew";
                    ImportProfileChoice[ImportProfileChoice["Cancel"] = 2] = "Cancel";
                })(ImportProfileChoice || (ImportProfileChoice = {}));
                const { result } = await this.F.prompt({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)(57, null, profileName),
                    buttons: [
                        {
                            label: (0, nls_1.localize)(58, null),
                            run: () => ImportProfileChoice.Overwrite
                        },
                        {
                            label: (0, nls_1.localize)(59, null),
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
                const name = await this.z.input({
                    placeHolder: (0, nls_1.localize)(60, null),
                    title: (0, nls_1.localize)(61, null),
                    value: `${profileName} ${this.fb(profileName)}`,
                    validateInput: async (value) => {
                        if (this.u.profiles.some(p => p.name === value)) {
                            return (0, nls_1.localize)(62, null, value);
                        }
                        return undefined;
                    }
                });
                if (!name) {
                    return undefined;
                }
                return this.u.createNamedProfile(name);
            }
            else {
                return this.u.createNamedProfile(profileName, { ...options, shortName: profileTemplate.shortName, transient: temp });
            }
        }
        eb(profileName) {
            const existingProfile = this.u.profiles.find(p => p.name === profileName);
            return existingProfile ? `${profileName} ${this.fb(profileName)}` : profileName;
        }
        fb(name) {
            const nameRegEx = new RegExp(`${(0, strings_1.$qe)(name)}\\s(\\d+)`);
            let nameIndex = 0;
            for (const profile of this.u.profiles) {
                const matches = nameRegEx.exec(profile.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            return nameIndex + 1;
        }
        async gb(id, name, primary, secondary, refreshAction, userDataProfilesData) {
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            const treeView = this.m.createInstance(treeView_1.$0ub, id, name);
            if (refreshAction) {
                treeView.showRefreshAction = true;
            }
            const actionRunner = new actions_1.$hi();
            const descriptor = {
                id,
                name,
                ctorDescriptor: new descriptors_1.$yh(UserDataProfilePreviewViewPane, [userDataProfilesData, primary, secondary, actionRunner]),
                canToggleVisibility: false,
                canMoveView: false,
                treeView,
                collapsed: false,
            };
            viewsRegistry.registerViews([descriptor], this.h);
            return (await this.r.openView(id, true));
        }
        async hb(id) {
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            const viewDescriptor = viewsRegistry.getView(id);
            if (viewDescriptor) {
                viewDescriptor.treeView.dispose();
                viewsRegistry.deregisterViews([viewDescriptor], this.h);
            }
            await this.ib();
        }
        async ib() {
            const editorsToColse = this.s.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(({ editor }) => editor.resource?.scheme === USER_DATA_PROFILE_EXPORT_SCHEME || editor.resource?.scheme === USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME || editor.resource?.scheme === USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME);
            if (editorsToColse.length) {
                await this.s.closeEditors(editorsToColse);
            }
        }
        async setProfile(profile) {
            await this.D.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                title: (0, nls_1.localize)(63, null, userDataProfile_1.$MJ.value),
            }, async (progress) => {
                if (profile.settings) {
                    await this.m.createInstance(settingsResource_1.$2zb).apply(profile.settings, this.n.currentProfile);
                }
                if (profile.globalState) {
                    await this.m.createInstance(globalStateResource_1.$nAb).apply(profile.globalState, this.n.currentProfile);
                }
                if (profile.extensions) {
                    await this.m.createInstance(extensionsResource_1.$iAb).apply(profile.extensions, this.n.currentProfile);
                }
            });
            this.C.info((0, nls_1.localize)(64, null, userDataProfile_1.$MJ.value));
        }
    };
    exports.$sAb = $sAb;
    exports.$sAb = $sAb = $sAb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, userDataProfile_1.$CJ),
        __param(2, views_1.$$E),
        __param(3, editorService_1.$9C),
        __param(4, contextkey_1.$3i),
        __param(5, userDataProfile_1.$DJ),
        __param(6, userDataProfile_2.$Ek),
        __param(7, extensions_2.$MF),
        __param(8, extensionManagement_1.$2n),
        __param(9, quickInput_1.$Gq),
        __param(10, notification_1.$Yu),
        __param(11, progress_1.$2u),
        __param(12, dialogs_1.$oA),
        __param(13, clipboardService_1.$UZ),
        __param(14, opener_1.$NT),
        __param(15, request_1.$Io),
        __param(16, url_1.$IT),
        __param(17, productService_1.$kj),
        __param(18, uriIdentity_1.$Ck),
        __param(19, telemetry_1.$9k),
        __param(20, contextView_1.$VZ),
        __param(21, log_1.$5i)
    ], $sAb);
    let FileUserDataProfileContentHandler = class FileUserDataProfileContentHandler {
        constructor(a, b, d, f) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.name = (0, nls_1.localize)(65, null);
            this.description = (0, nls_1.localize)(66, null);
        }
        async saveProfile(name, content, token) {
            const link = await this.a.showSaveDialog({
                title: (0, nls_1.localize)(67, null),
                filters: userDataProfile_1.$OJ,
                defaultUri: this.b.extUri.joinPath(await this.a.defaultFilePath(), `${name}.${userDataProfile_1.$NJ}`),
            });
            if (!link) {
                return null;
            }
            await this.f.create([{ resource: link, value: content, options: { overwrite: true } }]);
            return { link, id: link.toString() };
        }
        async canHandle(uri) {
            return uri.scheme !== network_1.Schemas.http && uri.scheme !== network_1.Schemas.https && await this.d.canHandleResource(uri);
        }
        async readProfile(uri, token) {
            if (await this.canHandle(uri)) {
                return (await this.d.readFile(uri, undefined, token)).value.toString();
            }
            return null;
        }
        async selectProfile() {
            const profileLocation = await this.a.showOpenDialog({
                canSelectFolders: false,
                canSelectFiles: true,
                canSelectMany: false,
                filters: userDataProfile_1.$OJ,
                title: (0, nls_1.localize)(68, null),
            });
            return profileLocation ? profileLocation[0] : null;
        }
    };
    FileUserDataProfileContentHandler = __decorate([
        __param(0, dialogs_1.$qA),
        __param(1, uriIdentity_1.$Ck),
        __param(2, files_1.$6j),
        __param(3, textfiles_1.$JD)
    ], FileUserDataProfileContentHandler);
    let UserDataProfilePreviewViewPane = class UserDataProfilePreviewViewPane extends treeView_1.$7ub {
        constructor(Yb, Zb, $b, ac, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.Xb = 0;
            this.gc = this.B(new lifecycle_1.$jc());
        }
        n(container) {
            this.f.dataProvider = this.Yb;
            super.n(DOM.$0O(container, DOM.$('.profile-view-tree-container')));
            this.sb = DOM.$0O(container, DOM.$('.profile-view-message-container.hide'));
            this.dc(container);
            this.B(this.f.onDidChangeCheckboxState(() => this.fc()));
            this.cc();
            this.B(event_1.Event.any(this.Yb.onDidChangeRoots, this.f.onDidCollapseItem, this.f.onDidExpandItem)(() => this.cc()));
        }
        async cc() {
            const roots = await this.Yb.getRoots();
            const children = await Promise.all(roots.map(async (root) => {
                let expanded = root.collapsibleState === views_1.TreeItemCollapsibleState.Expanded;
                try {
                    expanded = !this.f.isCollapsed(root);
                }
                catch (error) { /* Ignore because element might not be added yet */ }
                if (expanded) {
                    const children = await root.getChildren();
                    return children ?? [];
                }
                return [];
            }));
            this.Xb = roots.length + children.flat().length;
            this.fc();
            if (this.Wb) {
                this.t(this.Wb.height, this.Wb.width);
            }
        }
        dc(container) {
            this.a = DOM.$0O(container, DOM.$('.profile-view-buttons-container'));
            this.b = this.B(new button_1.$7Q(this.a, { ...defaultStyles_1.$i2 }));
            this.b.element.classList.add('profile-view-button');
            this.b.label = this.Zb.label;
            this.b.enabled = this.Zb.enabled;
            this.B(this.b.onDidClick(() => this.ac.run(this.Zb)));
            this.B(this.Zb.onDidChange(e => {
                if (e.enabled !== undefined) {
                    this.b.enabled = e.enabled;
                }
            }));
            this.ab = this.B(new button_1.$7Q(this.a, { secondary: true, ...defaultStyles_1.$i2 }));
            this.ab.label = this.$b.label;
            this.ab.element.classList.add('profile-view-button');
            this.ab.enabled = this.$b.enabled;
            this.B(this.ab.onDidClick(() => this.ac.run(this.$b)));
            this.B(this.$b.onDidChange(e => {
                if (e.enabled !== undefined) {
                    this.ab.enabled = e.enabled;
                }
            }));
        }
        t(height, width) {
            this.Wb = new DOM.$BO(width, height);
            let messageContainerHeight = 0;
            if (!this.sb.classList.contains('hide')) {
                messageContainerHeight = DOM.$AO(this.sb).height;
            }
            const buttonContainerHeight = 108;
            this.a.style.height = `${buttonContainerHeight}px`;
            this.a.style.width = `${width}px`;
            super.t(Math.min(height - buttonContainerHeight - messageContainerHeight, 22 * this.Xb), width);
        }
        fc() {
            this.b.enabled = this.Zb.enabled && this.Yb.isEnabled();
        }
        setMessage(message) {
            this.sb.classList.toggle('hide', !message);
            DOM.$lO(this.sb);
            if (message) {
                this.gc.clear();
                const rendered = this.gc.add((0, markdownRenderer_1.$zQ)(message, {
                    actionHandler: {
                        callback: (content) => {
                            this.Cb.open(content, { allowCommands: true }).catch(errors_1.$Y);
                        },
                        disposables: this.gc
                    }
                }));
                DOM.$0O(this.sb, rendered.element);
            }
        }
        refresh() {
            return this.f.refresh();
        }
    };
    UserDataProfilePreviewViewPane = __decorate([
        __param(5, keybinding_1.$2D),
        __param(6, contextView_1.$WZ),
        __param(7, configuration_1.$8h),
        __param(8, contextkey_1.$3i),
        __param(9, views_1.$_E),
        __param(10, instantiation_1.$Ah),
        __param(11, opener_1.$NT),
        __param(12, themeService_1.$gv),
        __param(13, telemetry_1.$9k),
        __param(14, notification_1.$Yu)
    ], UserDataProfilePreviewViewPane);
    const USER_DATA_PROFILE_EXPORT_SCHEME = 'userdataprofileexport';
    const USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME = 'userdataprofileexportpreview';
    const USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME = 'userdataprofileimportpreview';
    let UserDataProfileImportExportState = class UserDataProfileImportExportState extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeRoots = this.a.event;
            this.f = [];
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
                this.g = undefined;
                this.a.fire();
                return this.getRoots();
            }
        }
        getRoots() {
            if (!this.g) {
                this.g = (async () => {
                    this.f = await this.j();
                    for (const root of this.f) {
                        root.checkbox = {
                            isChecked: !root.isFromDefaultProfile(),
                            tooltip: (0, nls_1.localize)(69, null, root.label.label),
                            accessibilityInformation: {
                                label: (0, nls_1.localize)(70, null, root.label.label),
                            }
                        };
                        if (root.isFromDefaultProfile()) {
                            root.description = (0, nls_1.localize)(71, null);
                        }
                    }
                    return this.f;
                })();
            }
            return this.g;
        }
        isEnabled(resourceType) {
            if (resourceType !== undefined) {
                return this.f.some(root => root.type === resourceType && this.h(root));
            }
            return this.f.some(root => this.h(root));
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
                if (!this.h(root)) {
                    continue;
                }
                if (root instanceof settingsResource_1.$3zb) {
                    settings = await root.getContent();
                }
                else if (root instanceof keybindingsResource_1.$6zb) {
                    keybindings = await root.getContent();
                }
                else if (root instanceof tasksResource_1.$_zb) {
                    tasks = await root.getContent();
                }
                else if (root instanceof snippetsResource_1.$9zb) {
                    snippets = await root.getContent();
                }
                else if (root instanceof extensionsResource_1.$jAb) {
                    extensions = await root.getContent();
                }
                else if (root instanceof globalStateResource_1.$oAb) {
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
        h(treeItem) {
            if (treeItem.checkbox) {
                return treeItem.checkbox.isChecked || !!treeItem.children?.some(child => child.checkbox?.isChecked);
            }
            return true;
        }
    };
    UserDataProfileImportExportState = __decorate([
        __param(0, quickInput_1.$Gq)
    ], UserDataProfileImportExportState);
    let UserDataProfileExportState = class UserDataProfileExportState extends UserDataProfileImportExportState {
        constructor(profile, quickInputService, n, r) {
            super(quickInputService);
            this.profile = profile;
            this.n = n;
            this.r = r;
            this.m = this.B(new lifecycle_1.$jc());
        }
        async j() {
            this.m.clear();
            this.m.add(this.n.registerProvider(USER_DATA_PROFILE_EXPORT_SCHEME, this.B(new inMemoryFilesystemProvider_1.$rAb())));
            const previewFileSystemProvider = this.B(new inMemoryFilesystemProvider_1.$rAb());
            this.m.add(this.n.registerProvider(USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME, previewFileSystemProvider));
            const roots = [];
            const exportPreviewProfle = this.t(this.profile);
            const settingsResource = this.r.createInstance(settingsResource_1.$2zb);
            const settingsContent = await settingsResource.getContent(this.profile);
            await settingsResource.apply(settingsContent, exportPreviewProfle);
            const settingsResourceTreeItem = this.r.createInstance(settingsResource_1.$3zb, exportPreviewProfle);
            if (await settingsResourceTreeItem.hasContent()) {
                roots.push(settingsResourceTreeItem);
            }
            const keybindingsResource = this.r.createInstance(keybindingsResource_1.$5zb);
            const keybindingsContent = await keybindingsResource.getContent(this.profile);
            await keybindingsResource.apply(keybindingsContent, exportPreviewProfle);
            const keybindingsResourceTreeItem = this.r.createInstance(keybindingsResource_1.$6zb, exportPreviewProfle);
            if (await keybindingsResourceTreeItem.hasContent()) {
                roots.push(keybindingsResourceTreeItem);
            }
            const snippetsResource = this.r.createInstance(snippetsResource_1.$8zb);
            const snippetsContent = await snippetsResource.getContent(this.profile);
            await snippetsResource.apply(snippetsContent, exportPreviewProfle);
            const snippetsResourceTreeItem = this.r.createInstance(snippetsResource_1.$9zb, exportPreviewProfle);
            if (await snippetsResourceTreeItem.hasContent()) {
                roots.push(snippetsResourceTreeItem);
            }
            const tasksResource = this.r.createInstance(tasksResource_1.$$zb);
            const tasksContent = await tasksResource.getContent(this.profile);
            await tasksResource.apply(tasksContent, exportPreviewProfle);
            const tasksResourceTreeItem = this.r.createInstance(tasksResource_1.$_zb, exportPreviewProfle);
            if (await tasksResourceTreeItem.hasContent()) {
                roots.push(tasksResourceTreeItem);
            }
            const globalStateResource = (0, resources_1.$ig)(exportPreviewProfle.globalStorageHome, 'globalState.json').with({ scheme: USER_DATA_PROFILE_EXPORT_PREVIEW_SCHEME });
            const globalStateResourceTreeItem = this.r.createInstance(globalStateResource_1.$pAb, exportPreviewProfle, globalStateResource);
            const content = await globalStateResourceTreeItem.getContent();
            if (content) {
                await this.n.writeFile(globalStateResource, buffer_1.$Fd.fromString(JSON.stringify(JSON.parse(content), null, '\t')));
                roots.push(globalStateResourceTreeItem);
            }
            const extensionsResourceTreeItem = this.r.createInstance(extensionsResource_1.$kAb, exportPreviewProfle);
            if (await extensionsResourceTreeItem.hasContent()) {
                roots.push(extensionsResourceTreeItem);
            }
            previewFileSystemProvider.setReadOnly(true);
            return roots;
        }
        t(profile) {
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
                name = await this.b.input({
                    placeHolder: (0, nls_1.localize)(72, null),
                    title: (0, nls_1.localize)(73, null),
                    async validateInput(input) {
                        if (!input.trim()) {
                            return (0, nls_1.localize)(74, null);
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
        __param(1, quickInput_1.$Gq),
        __param(2, files_1.$6j),
        __param(3, instantiation_1.$Ah)
    ], UserDataProfileExportState);
    let UserDataProfileImportState = class UserDataProfileImportState extends UserDataProfileImportExportState {
        constructor(profile, n, quickInputService, r) {
            super(quickInputService);
            this.profile = profile;
            this.n = n;
            this.r = r;
            this.m = this.B(new lifecycle_1.$jc());
        }
        async j() {
            this.m.clear();
            const inMemoryProvider = this.B(new inMemoryFilesystemProvider_1.$rAb());
            this.m.add(this.n.registerProvider(USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME, inMemoryProvider));
            const roots = [];
            const importPreviewProfle = (0, userDataProfile_2.$Gk)((0, uuid_1.$4f)(), this.profile.name, uri_1.URI.file('/root').with({ scheme: USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME }), uri_1.URI.file('/cache').with({ scheme: USER_DATA_PROFILE_IMPORT_PREVIEW_SCHEME }));
            if (this.profile.settings) {
                const settingsResource = this.r.createInstance(settingsResource_1.$2zb);
                await settingsResource.apply(this.profile.settings, importPreviewProfle);
                const settingsResourceTreeItem = this.r.createInstance(settingsResource_1.$3zb, importPreviewProfle);
                if (await settingsResourceTreeItem.hasContent()) {
                    roots.push(settingsResourceTreeItem);
                }
            }
            if (this.profile.keybindings) {
                const keybindingsResource = this.r.createInstance(keybindingsResource_1.$5zb);
                await keybindingsResource.apply(this.profile.keybindings, importPreviewProfle);
                const keybindingsResourceTreeItem = this.r.createInstance(keybindingsResource_1.$6zb, importPreviewProfle);
                if (await keybindingsResourceTreeItem.hasContent()) {
                    roots.push(keybindingsResourceTreeItem);
                }
            }
            if (this.profile.snippets) {
                const snippetsResource = this.r.createInstance(snippetsResource_1.$8zb);
                await snippetsResource.apply(this.profile.snippets, importPreviewProfle);
                const snippetsResourceTreeItem = this.r.createInstance(snippetsResource_1.$9zb, importPreviewProfle);
                if (await snippetsResourceTreeItem.hasContent()) {
                    roots.push(snippetsResourceTreeItem);
                }
            }
            if (this.profile.tasks) {
                const tasksResource = this.r.createInstance(tasksResource_1.$$zb);
                await tasksResource.apply(this.profile.tasks, importPreviewProfle);
                const tasksResourceTreeItem = this.r.createInstance(tasksResource_1.$_zb, importPreviewProfle);
                if (await tasksResourceTreeItem.hasContent()) {
                    roots.push(tasksResourceTreeItem);
                }
            }
            if (this.profile.globalState) {
                const globalStateResource = (0, resources_1.$ig)(importPreviewProfle.globalStorageHome, 'globalState.json');
                const content = buffer_1.$Fd.fromString(JSON.stringify(JSON.parse(this.profile.globalState), null, '\t'));
                if (content) {
                    await this.n.writeFile(globalStateResource, content);
                    roots.push(this.r.createInstance(globalStateResource_1.$qAb, this.profile.globalState, globalStateResource));
                }
            }
            if (this.profile.extensions) {
                const extensionsResourceTreeItem = this.r.createInstance(extensionsResource_1.$lAb, this.profile.extensions);
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
        __param(1, files_1.$6j),
        __param(2, quickInput_1.$Gq),
        __param(3, instantiation_1.$Ah)
    ], UserDataProfileImportState);
    class BarrierAction extends actions_1.$gi {
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
    (0, extensions_1.$mr)(userDataProfile_1.$HJ, $sAb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataProfileImportExportService.js.map