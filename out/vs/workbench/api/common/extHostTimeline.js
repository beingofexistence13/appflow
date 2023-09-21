/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/extensions/common/extensions", "vs/base/common/types"], function (require, exports, uri_1, instantiation_1, extHost_protocol_1, lifecycle_1, extHostTypes_1, extHostTypeConverters_1, extensions_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTimeline = exports.IExtHostTimeline = void 0;
    exports.IExtHostTimeline = (0, instantiation_1.createDecorator)('IExtHostTimeline');
    class ExtHostTimeline {
        constructor(mainContext, commands) {
            this._providers = new Map();
            this._itemsBySourceAndUriMap = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTimeline);
            commands.registerArgumentProcessor({
                processArgument: (arg, extension) => {
                    if (arg && arg.$mid === 12 /* MarshalledId.TimelineActionContext */) {
                        if (this._providers.get(arg.source) && extensions_1.ExtensionIdentifier.equals(extension, this._providers.get(arg.source)?.extension)) {
                            const uri = arg.uri === undefined ? undefined : uri_1.URI.revive(arg.uri);
                            return this._itemsBySourceAndUriMap.get(arg.source)?.get(getUriKey(uri))?.get(arg.handle);
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
            const item = this._providers.get(id);
            return item?.provider.provideTimeline(uri_1.URI.revive(uri), options, token);
        }
        registerTimelineProvider(scheme, provider, extensionId, commandConverter) {
            const timelineDisposables = new lifecycle_1.DisposableStore();
            const convertTimelineItem = this.convertTimelineItem(provider.id, commandConverter, timelineDisposables).bind(this);
            let disposable;
            if (provider.onDidChange) {
                disposable = provider.onDidChange(e => this._proxy.$emitTimelineChangeEvent({ uri: undefined, reset: true, ...e, id: provider.id }), this);
            }
            const itemsBySourceAndUriMap = this._itemsBySourceAndUriMap;
            return this.registerTimelineProviderCore({
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
        convertTimelineItem(source, commandConverter, disposables) {
            return (uri, options) => {
                let items;
                if (options?.cacheResults) {
                    let itemsByUri = this._itemsBySourceAndUriMap.get(source);
                    if (itemsByUri === undefined) {
                        itemsByUri = new Map();
                        this._itemsBySourceAndUriMap.set(source, itemsByUri);
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
                        if (iconPath instanceof extHostTypes_1.ThemeIcon) {
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
                    if (extHostTypes_1.MarkdownString.isMarkdownString(props.tooltip)) {
                        tooltip = extHostTypeConverters_1.MarkdownString.from(props.tooltip);
                    }
                    else if ((0, types_1.isString)(props.tooltip)) {
                        tooltip = props.tooltip;
                    }
                    // TODO @jkearl, remove once migration complete.
                    else if (extHostTypes_1.MarkdownString.isMarkdownString(props.detail)) {
                        console.warn('Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip');
                        tooltip = extHostTypeConverters_1.MarkdownString.from(props.detail);
                    }
                    else if ((0, types_1.isString)(props.detail)) {
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
        registerTimelineProviderCore(provider, extension) {
            // console.log(`ExtHostTimeline#registerTimelineProvider: id=${provider.id}`);
            const existing = this._providers.get(provider.id);
            if (existing) {
                throw new Error(`Timeline Provider ${provider.id} already exists.`);
            }
            this._proxy.$registerTimelineProvider({
                id: provider.id,
                label: provider.label,
                scheme: provider.scheme
            });
            this._providers.set(provider.id, { provider, extension });
            return (0, lifecycle_1.toDisposable)(() => {
                for (const sourceMap of this._itemsBySourceAndUriMap.values()) {
                    sourceMap.get(provider.id)?.clear();
                }
                this._providers.delete(provider.id);
                this._proxy.$unregisterTimelineProvider(provider.id);
                provider.dispose();
            });
        }
    }
    exports.ExtHostTimeline = ExtHostTimeline;
    function getUriKey(uri) {
        return uri?.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRpbWVsaW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFRpbWVsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCbkYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLCtCQUFlLEVBQW1CLGtCQUFrQixDQUFDLENBQUM7SUFFdEYsTUFBYSxlQUFlO1FBUzNCLFlBQ0MsV0FBeUIsRUFDekIsUUFBeUI7WUFObEIsZUFBVSxHQUFHLElBQUksR0FBRyxFQUEwRSxDQUFDO1lBRS9GLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUFxRSxDQUFDO1lBTTlHLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFbkUsUUFBUSxDQUFDLHlCQUF5QixDQUFDO2dCQUNsQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUU7b0JBQ25DLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLGdEQUF1QyxFQUFFO3dCQUMzRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxnQ0FBbUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRTs0QkFDekgsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3BFLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FB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