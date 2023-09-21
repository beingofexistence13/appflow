/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/extensions/common/extensions", "vs/base/common/types"], function (require, exports, uri_1, instantiation_1, extHost_protocol_1, lifecycle_1, extHostTypes_1, extHostTypeConverters_1, extensions_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jcc = exports.$Icc = void 0;
    exports.$Icc = (0, instantiation_1.$Bh)('IExtHostTimeline');
    class $Jcc {
        constructor(mainContext, commands) {
            this.b = new Map();
            this.c = new Map();
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadTimeline);
            commands.registerArgumentProcessor({
                processArgument: (arg, extension) => {
                    if (arg && arg.$mid === 12 /* MarshalledId.TimelineActionContext */) {
                        if (this.b.get(arg.source) && extensions_1.$Vl.equals(extension, this.b.get(arg.source)?.extension)) {
                            const uri = arg.uri === undefined ? undefined : uri_1.URI.revive(arg.uri);
                            return this.c.get(arg.source)?.get(getUriKey(uri))?.get(arg.handle);
                        }
                        else {
                            return undefined;
                        }
                    }
                    return arg;
                }
            });
        }
        async $getTimeline(id, uri, options, token) {
            const item = this.b.get(id);
            return item?.provider.provideTimeline(uri_1.URI.revive(uri), options, token);
        }
        registerTimelineProvider(scheme, provider, extensionId, commandConverter) {
            const timelineDisposables = new lifecycle_1.$jc();
            const convertTimelineItem = this.d(provider.id, commandConverter, timelineDisposables).bind(this);
            let disposable;
            if (provider.onDidChange) {
                disposable = provider.onDidChange(e => this.a.$emitTimelineChangeEvent({ uri: undefined, reset: true, ...e, id: provider.id }), this);
            }
            const itemsBySourceAndUriMap = this.c;
            return this.f({
                ...provider,
                scheme: scheme,
                onDidChange: undefined,
                async provideTimeline(uri, options, token) {
                    if (options?.resetCache) {
                        timelineDisposables.clear();
                        // For now, only allow the caching of a single Uri
                        // itemsBySourceAndUriMap.get(provider.id)?.get(getUriKey(uri))?.clear();
                        itemsBySourceAndUriMap.get(provider.id)?.clear();
                    }
                    const result = await provider.provideTimeline(uri, options, token);
                    if (result === undefined || result === null) {
                        return undefined;
                    }
                    // TODO: Should we bother converting all the data if we aren't caching? Meaning it is being requested by an extension?
                    const convertItem = convertTimelineItem(uri, options);
                    return {
                        ...result,
                        source: provider.id,
                        items: result.items.map(convertItem)
                    };
                },
                dispose() {
                    for (const sourceMap of itemsBySourceAndUriMap.values()) {
                        sourceMap.get(provider.id)?.clear();
                    }
                    disposable?.dispose();
                    timelineDisposables.dispose();
                }
            }, extensionId);
        }
        d(source, commandConverter, disposables) {
            return (uri, options) => {
                let items;
                if (options?.cacheResults) {
                    let itemsByUri = this.c.get(source);
                    if (itemsByUri === undefined) {
                        itemsByUri = new Map();
                        this.c.set(source, itemsByUri);
                    }
                    const uriKey = getUriKey(uri);
                    items = itemsByUri.get(uriKey);
                    if (items === undefined) {
                        items = new Map();
                        itemsByUri.set(uriKey, items);
                    }
                }
                return (item) => {
                    const { iconPath, ...props } = item;
                    const handle = `${source}|${item.id ?? item.timestamp}`;
                    items?.set(handle, item);
                    let icon;
                    let iconDark;
                    let themeIcon;
                    if (item.iconPath) {
                        if (iconPath instanceof extHostTypes_1.$WK) {
                            themeIcon = { id: iconPath.id, color: iconPath.color };
                        }
                        else if (uri_1.URI.isUri(iconPath)) {
                            icon = iconPath;
                            iconDark = iconPath;
                        }
                        else {
                            ({ light: icon, dark: iconDark } = iconPath);
                        }
                    }
                    let tooltip;
                    if (extHostTypes_1.$qK.isMarkdownString(props.tooltip)) {
                        tooltip = extHostTypeConverters_1.MarkdownString.from(props.tooltip);
                    }
                    else if ((0, types_1.$jf)(props.tooltip)) {
                        tooltip = props.tooltip;
                    }
                    // TODO @jkearl, remove once migration complete.
                    else if (extHostTypes_1.$qK.isMarkdownString(props.detail)) {
                        console.warn('Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip');
                        tooltip = extHostTypeConverters_1.MarkdownString.from(props.detail);
                    }
                    else if ((0, types_1.$jf)(props.detail)) {
                        console.warn('Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip');
                        tooltip = props.detail;
                    }
                    return {
                        ...props,
                        id: props.id ?? undefined,
                        handle: handle,
                        source: source,
                        command: item.command ? commandConverter.toInternal(item.command, disposables) : undefined,
                        icon: icon,
                        iconDark: iconDark,
                        themeIcon: themeIcon,
                        tooltip,
                        accessibilityInformation: item.accessibilityInformation
                    };
                };
            };
        }
        f(provider, extension) {
            // console.log(`ExtHostTimeline#registerTimelineProvider: id=${provider.id}`);
            const existing = this.b.get(provider.id);
            if (existing) {
                throw new Error(`Timeline Provider ${provider.id} already exists.`);
            }
            this.a.$registerTimelineProvider({
                id: provider.id,
                label: provider.label,
                scheme: provider.scheme
            });
            this.b.set(provider.id, { provider, extension });
            return (0, lifecycle_1.$ic)(() => {
                for (const sourceMap of this.c.values()) {
                    sourceMap.get(provider.id)?.clear();
                }
                this.b.delete(provider.id);
                this.a.$unregisterTimelineProvider(provider.id);
                provider.dispose();
            });
        }
    }
    exports.$Jcc = $Jcc;
    function getUriKey(uri) {
        return uri?.toString();
    }
});
//# sourceMappingURL=extHostTimeline.js.map