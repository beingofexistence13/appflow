/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "./extHost.protocol", "vs/base/common/uri", "vs/workbench/api/common/extHostTypes", "vs/base/common/errors", "vs/base/common/arrays", "vs/base/common/severity", "vs/base/common/themables", "vs/workbench/services/extensions/common/extensions", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, cancellation_1, event_1, lifecycle_1, extHost_protocol_1, uri_1, extHostTypes_1, errors_1, arrays_1, severity_1, themables_1, extensions_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2bc = void 0;
    function $2bc(mainContext, workspace, commands) {
        const proxy = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadQuickOpen);
        class ExtHostQuickOpenImpl {
            constructor(workspace, commands) {
                this.e = new Map();
                this.f = 0;
                this.a = workspace;
                this.b = commands;
            }
            showQuickPick(extension, itemsOrItemsPromise, options, token = cancellation_1.CancellationToken.None) {
                // clear state from last invocation
                this.c = undefined;
                const itemsPromise = Promise.resolve(itemsOrItemsPromise);
                const instance = ++this.f;
                const quickPickWidget = proxy.$show(instance, {
                    title: options?.title,
                    placeHolder: options?.placeHolder,
                    matchOnDescription: options?.matchOnDescription,
                    matchOnDetail: options?.matchOnDetail,
                    ignoreFocusLost: options?.ignoreFocusOut,
                    canPickMany: options?.canPickMany,
                }, token);
                const widgetClosedMarker = {};
                const widgetClosedPromise = quickPickWidget.then(() => widgetClosedMarker);
                return Promise.race([widgetClosedPromise, itemsPromise]).then(result => {
                    if (result === widgetClosedMarker) {
                        return undefined;
                    }
                    const allowedTooltips = (0, extensions_1.$PF)(extension, 'quickPickItemTooltip');
                    return itemsPromise.then(items => {
                        const pickItems = [];
                        for (let handle = 0; handle < items.length; handle++) {
                            const item = items[handle];
                            if (typeof item === 'string') {
                                pickItems.push({ label: item, handle });
                            }
                            else if (item.kind === extHostTypes_1.QuickPickItemKind.Separator) {
                                pickItems.push({ type: 'separator', label: item.label });
                            }
                            else {
                                if (item.tooltip && !allowedTooltips) {
                                    console.warn(`Extension '${extension.identifier.value}' uses a tooltip which is proposed API that is only available when running out of dev or with the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
                                }
                                const icon = (item.iconPath) ? getIconPathOrClass(item.iconPath) : undefined;
                                pickItems.push({
                                    label: item.label,
                                    iconPath: icon?.iconPath,
                                    iconClass: icon?.iconClass,
                                    description: item.description,
                                    detail: item.detail,
                                    picked: item.picked,
                                    alwaysShow: item.alwaysShow,
                                    tooltip: allowedTooltips ? extHostTypeConverters_1.MarkdownString.fromStrict(item.tooltip) : undefined,
                                    handle
                                });
                            }
                        }
                        // handle selection changes
                        if (options && typeof options.onDidSelectItem === 'function') {
                            this.c = (handle) => {
                                options.onDidSelectItem(items[handle]);
                            };
                        }
                        // show items
                        proxy.$setItems(instance, pickItems);
                        return quickPickWidget.then(handle => {
                            if (typeof handle === 'number') {
                                return items[handle];
                            }
                            else if (Array.isArray(handle)) {
                                return handle.map(h => items[h]);
                            }
                            return undefined;
                        });
                    });
                }).then(undefined, err => {
                    if ((0, errors_1.$2)(err)) {
                        return undefined;
                    }
                    proxy.$setError(instance, err);
                    return Promise.reject(err);
                });
            }
            $onItemSelected(handle) {
                this.c?.(handle);
            }
            // ---- input
            showInput(options, token = cancellation_1.CancellationToken.None) {
                // global validate fn used in callback below
                this.d = options?.validateInput;
                return proxy.$input(options, typeof this.d === 'function', token)
                    .then(undefined, err => {
                    if ((0, errors_1.$2)(err)) {
                        return undefined;
                    }
                    return Promise.reject(err);
                });
            }
            async $validateInput(input) {
                if (!this.d) {
                    return;
                }
                const result = await this.d(input);
                if (!result || typeof result === 'string') {
                    return result;
                }
                let severity;
                switch (result.severity) {
                    case extHostTypes_1.InputBoxValidationSeverity.Info:
                        severity = severity_1.default.Info;
                        break;
                    case extHostTypes_1.InputBoxValidationSeverity.Warning:
                        severity = severity_1.default.Warning;
                        break;
                    case extHostTypes_1.InputBoxValidationSeverity.Error:
                        severity = severity_1.default.Error;
                        break;
                    default:
                        severity = result.message ? severity_1.default.Error : severity_1.default.Ignore;
                        break;
                }
                return {
                    content: result.message,
                    severity
                };
            }
            // ---- workspace folder picker
            async showWorkspaceFolderPick(options, token = cancellation_1.CancellationToken.None) {
                const selectedFolder = await this.b.executeCommand('_workbench.pickWorkspaceFolder', [options]);
                if (!selectedFolder) {
                    return undefined;
                }
                const workspaceFolders = await this.a.getWorkspaceFolders2();
                if (!workspaceFolders) {
                    return undefined;
                }
                return workspaceFolders.find(folder => folder.uri.toString() === selectedFolder.uri.toString());
            }
            // ---- QuickInput
            createQuickPick(extension) {
                const session = new ExtHostQuickPick(extension, () => this.e.delete(session._id));
                this.e.set(session._id, session);
                return session;
            }
            createInputBox(extension) {
                const session = new ExtHostInputBox(extension, () => this.e.delete(session._id));
                this.e.set(session._id, session);
                return session;
            }
            $onDidChangeValue(sessionId, value) {
                const session = this.e.get(sessionId);
                session?._fireDidChangeValue(value);
            }
            $onDidAccept(sessionId) {
                const session = this.e.get(sessionId);
                session?._fireDidAccept();
            }
            $onDidChangeActive(sessionId, handles) {
                const session = this.e.get(sessionId);
                if (session instanceof ExtHostQuickPick) {
                    session._fireDidChangeActive(handles);
                }
            }
            $onDidChangeSelection(sessionId, handles) {
                const session = this.e.get(sessionId);
                if (session instanceof ExtHostQuickPick) {
                    session._fireDidChangeSelection(handles);
                }
            }
            $onDidTriggerButton(sessionId, handle) {
                const session = this.e.get(sessionId);
                session?._fireDidTriggerButton(handle);
            }
            $onDidTriggerItemButton(sessionId, itemHandle, buttonHandle) {
                const session = this.e.get(sessionId);
                if (session instanceof ExtHostQuickPick) {
                    session._fireDidTriggerItemButton(itemHandle, buttonHandle);
                }
            }
            $onDidHide(sessionId) {
                const session = this.e.get(sessionId);
                session?._fireDidHide();
            }
        }
        class ExtHostQuickInput {
            static { this.a = 1; }
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this._id = ExtHostQuickPick.a++;
                this.e = false;
                this.f = false;
                this.g = true;
                this.j = false;
                this.k = true;
                this.l = '';
                this.n = [];
                this.o = new Map();
                this.p = new event_1.$fd();
                this.q = new event_1.$fd();
                this.r = new event_1.$fd();
                this.s = new event_1.$fd();
                this.u = { id: this._id };
                this.v = false;
                this.w = [
                    this.r,
                    this.s,
                    this.p,
                    this.q
                ];
                this.onDidChangeValue = this.q.event;
                this.onDidAccept = this.p.event;
                this.onDidTriggerButton = this.r.event;
                this.onDidHide = this.s.event;
            }
            get title() {
                return this.b;
            }
            set title(title) {
                this.b = title;
                this.z({ title });
            }
            get step() {
                return this.c;
            }
            set step(step) {
                this.c = step;
                this.z({ step });
            }
            get totalSteps() {
                return this.d;
            }
            set totalSteps(totalSteps) {
                this.d = totalSteps;
                this.z({ totalSteps });
            }
            get enabled() {
                return this.g;
            }
            set enabled(enabled) {
                this.g = enabled;
                this.z({ enabled });
            }
            get busy() {
                return this.j;
            }
            set busy(busy) {
                this.j = busy;
                this.z({ busy });
            }
            get ignoreFocusOut() {
                return this.k;
            }
            set ignoreFocusOut(ignoreFocusOut) {
                this.k = ignoreFocusOut;
                this.z({ ignoreFocusOut });
            }
            get value() {
                return this.l;
            }
            set value(value) {
                this.l = value;
                this.z({ value });
            }
            get placeholder() {
                return this.m;
            }
            set placeholder(placeholder) {
                this.m = placeholder;
                this.z({ placeholder });
            }
            get buttons() {
                return this.n;
            }
            set buttons(buttons) {
                this.n = buttons.slice();
                this.o.clear();
                buttons.forEach((button, i) => {
                    const handle = button === extHostTypes_1.$kL.Back ? -1 : i;
                    this.o.set(handle, button);
                });
                this.z({
                    buttons: buttons.map((button, i) => {
                        return {
                            ...getIconPathOrClass(button.iconPath),
                            tooltip: button.tooltip,
                            handle: button === extHostTypes_1.$kL.Back ? -1 : i,
                        };
                    })
                });
            }
            show() {
                this.e = true;
                this.f = true;
                this.z({ visible: true });
            }
            hide() {
                this.e = false;
                this.z({ visible: false });
            }
            _fireDidAccept() {
                this.p.fire();
            }
            _fireDidChangeValue(value) {
                this.l = value;
                this.q.fire(value);
            }
            _fireDidTriggerButton(handle) {
                const button = this.o.get(handle);
                if (button) {
                    this.r.fire(button);
                }
            }
            _fireDidHide() {
                if (this.f) {
                    // if this._visible is true, it means that .show() was called between
                    // .hide() and .onDidHide. To ensure the correct number of onDidHide events
                    // are emitted, we set this._expectingHide to this value so that
                    // the next time .hide() is called, we can emit the event again.
                    // Example:
                    // .show() -> .hide() -> .show() -> .hide() should emit 2 onDidHide events.
                    // .show() -> .hide() -> .hide() should emit 1 onDidHide event.
                    // Fixes #135747
                    this.f = this.e;
                    this.s.fire();
                }
            }
            dispose() {
                if (this.v) {
                    return;
                }
                this.v = true;
                this._fireDidHide();
                this.w = (0, lifecycle_1.$fc)(this.w);
                if (this.t) {
                    clearTimeout(this.t);
                    this.t = undefined;
                }
                this.y();
                proxy.$dispose(this._id);
            }
            z(properties) {
                if (this.v) {
                    return;
                }
                for (const key of Object.keys(properties)) {
                    const value = properties[key];
                    this.u[key] = value === undefined ? null : value;
                }
                if ('visible' in this.u) {
                    if (this.t) {
                        clearTimeout(this.t);
                        this.t = undefined;
                    }
                    this.A();
                }
                else if (this.e && !this.t) {
                    // Defer the update so that multiple changes to setters dont cause a redraw each
                    this.t = setTimeout(() => {
                        this.t = undefined;
                        this.A();
                    }, 0);
                }
            }
            A() {
                proxy.$createOrUpdate(this.u);
                this.u = { id: this._id };
            }
        }
        function getIconUris(iconPath) {
            if (iconPath instanceof extHostTypes_1.$WK) {
                return { id: iconPath.id };
            }
            const dark = getDarkIconUri(iconPath);
            const light = getLightIconUri(iconPath);
            // Tolerate strings: https://github.com/microsoft/vscode/issues/110432#issuecomment-726144556
            return {
                dark: typeof dark === 'string' ? uri_1.URI.file(dark) : dark,
                light: typeof light === 'string' ? uri_1.URI.file(light) : light
            };
        }
        function getLightIconUri(iconPath) {
            return typeof iconPath === 'object' && 'light' in iconPath ? iconPath.light : iconPath;
        }
        function getDarkIconUri(iconPath) {
            return typeof iconPath === 'object' && 'dark' in iconPath ? iconPath.dark : iconPath;
        }
        function getIconPathOrClass(icon) {
            const iconPathOrIconClass = getIconUris(icon);
            let iconPath;
            let iconClass;
            if ('id' in iconPathOrIconClass) {
                iconClass = themables_1.ThemeIcon.asClassName(iconPathOrIconClass);
            }
            else {
                iconPath = iconPathOrIconClass;
            }
            return {
                iconPath,
                iconClass
            };
        }
        class ExtHostQuickPick extends ExtHostQuickInput {
            constructor(O, onDispose) {
                super(O.identifier, onDispose);
                this.O = O;
                this.B = [];
                this.C = new Map();
                this.D = new Map();
                this.E = false;
                this.F = true;
                this.G = true;
                this.H = true;
                this.I = false;
                this.J = [];
                this.K = new event_1.$fd();
                this.L = [];
                this.M = new event_1.$fd();
                this.N = new event_1.$fd();
                this.onDidChangeActive = this.K.event;
                this.onDidChangeSelection = this.M.event;
                this.onDidTriggerItemButton = this.N.event;
                this.w.push(this.K, this.M, this.N);
                this.z({ type: 'quickPick' });
            }
            get items() {
                return this.B;
            }
            set items(items) {
                this.B = items.slice();
                this.C.clear();
                this.D.clear();
                items.forEach((item, i) => {
                    this.C.set(i, item);
                    this.D.set(item, i);
                });
                const allowedTooltips = (0, extensions_1.$PF)(this.O, 'quickPickItemTooltip');
                const pickItems = [];
                for (let handle = 0; handle < items.length; handle++) {
                    const item = items[handle];
                    if (item.kind === extHostTypes_1.QuickPickItemKind.Separator) {
                        pickItems.push({ type: 'separator', label: item.label });
                    }
                    else {
                        if (item.tooltip && !allowedTooltips) {
                            console.warn(`Extension '${this.O.identifier.value}' uses a tooltip which is proposed API that is only available when running out of dev or with the following command line switch: --enable-proposed-api ${this.O.identifier.value}`);
                        }
                        const icon = (item.iconPath) ? getIconPathOrClass(item.iconPath) : undefined;
                        pickItems.push({
                            handle,
                            label: item.label,
                            iconPath: icon?.iconPath,
                            iconClass: icon?.iconClass,
                            description: item.description,
                            detail: item.detail,
                            picked: item.picked,
                            alwaysShow: item.alwaysShow,
                            tooltip: allowedTooltips ? extHostTypeConverters_1.MarkdownString.fromStrict(item.tooltip) : undefined,
                            buttons: item.buttons?.map((button, i) => {
                                return {
                                    ...getIconPathOrClass(button.iconPath),
                                    tooltip: button.tooltip,
                                    handle: i
                                };
                            }),
                        });
                    }
                }
                this.z({
                    items: pickItems,
                });
            }
            get canSelectMany() {
                return this.E;
            }
            set canSelectMany(canSelectMany) {
                this.E = canSelectMany;
                this.z({ canSelectMany });
            }
            get matchOnDescription() {
                return this.F;
            }
            set matchOnDescription(matchOnDescription) {
                this.F = matchOnDescription;
                this.z({ matchOnDescription });
            }
            get matchOnDetail() {
                return this.G;
            }
            set matchOnDetail(matchOnDetail) {
                this.G = matchOnDetail;
                this.z({ matchOnDetail });
            }
            get sortByLabel() {
                return this.H;
            }
            set sortByLabel(sortByLabel) {
                this.H = sortByLabel;
                this.z({ sortByLabel });
            }
            get keepScrollPosition() {
                return this.I;
            }
            set keepScrollPosition(keepScrollPosition) {
                this.I = keepScrollPosition;
                this.z({ keepScrollPosition });
            }
            get activeItems() {
                return this.J;
            }
            set activeItems(activeItems) {
                this.J = activeItems.filter(item => this.D.has(item));
                this.z({ activeItems: this.J.map(item => this.D.get(item)) });
            }
            get selectedItems() {
                return this.L;
            }
            set selectedItems(selectedItems) {
                this.L = selectedItems.filter(item => this.D.has(item));
                this.z({ selectedItems: this.L.map(item => this.D.get(item)) });
            }
            _fireDidChangeActive(handles) {
                const items = (0, arrays_1.$Fb)(handles.map(handle => this.C.get(handle)));
                this.J = items;
                this.K.fire(items);
            }
            _fireDidChangeSelection(handles) {
                const items = (0, arrays_1.$Fb)(handles.map(handle => this.C.get(handle)));
                this.L = items;
                this.M.fire(items);
            }
            _fireDidTriggerItemButton(itemHandle, buttonHandle) {
                const item = this.C.get(itemHandle);
                if (!item || !item.buttons || !item.buttons.length) {
                    return;
                }
                const button = item.buttons[buttonHandle];
                if (button) {
                    this.N.fire({
                        button,
                        item
                    });
                }
            }
        }
        class ExtHostInputBox extends ExtHostQuickInput {
            constructor(extension, onDispose) {
                super(extension.identifier, onDispose);
                this.B = false;
                this.z({ type: 'inputBox' });
            }
            get password() {
                return this.B;
            }
            set password(password) {
                this.B = password;
                this.z({ password });
            }
            get prompt() {
                return this.C;
            }
            set prompt(prompt) {
                this.C = prompt;
                this.z({ prompt });
            }
            get valueSelection() {
                return this.D;
            }
            set valueSelection(valueSelection) {
                this.D = valueSelection;
                this.z({ valueSelection });
            }
            get validationMessage() {
                return this.E;
            }
            set validationMessage(validationMessage) {
                this.E = validationMessage;
                if (!validationMessage) {
                    this.z({ validationMessage: undefined, severity: severity_1.default.Ignore });
                }
                else if (typeof validationMessage === 'string') {
                    this.z({ validationMessage, severity: severity_1.default.Error });
                }
                else {
                    this.z({ validationMessage: validationMessage.message, severity: validationMessage.severity ?? severity_1.default.Error });
                }
            }
        }
        return new ExtHostQuickOpenImpl(workspace, commands);
    }
    exports.$2bc = $2bc;
});
//# sourceMappingURL=extHostQuickOpen.js.map