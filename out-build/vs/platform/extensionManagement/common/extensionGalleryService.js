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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/types", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/base/common/stopwatch"], function (require, exports, arrays_1, cancellation_1, errors_1, platform_1, process_1, types_1, uri_1, configuration_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionValidator_1, files_1, log_1, productService_1, request_1, marketplace_1, storage_1, telemetry_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6o = exports.$5o = exports.$4o = void 0;
    const CURRENT_TARGET_PLATFORM = platform_1.$o ? "web" /* TargetPlatform.WEB */ : (0, extensionManagement_1.$Un)(platform_1.$t, process_1.$4d);
    const ACTIVITY_HEADER_NAME = 'X-Market-Search-Activity-Id';
    var Flags;
    (function (Flags) {
        /**
         * None is used to retrieve only the basic extension details.
         */
        Flags[Flags["None"] = 0] = "None";
        /**
         * IncludeVersions will return version information for extensions returned
         */
        Flags[Flags["IncludeVersions"] = 1] = "IncludeVersions";
        /**
         * IncludeFiles will return information about which files were found
         * within the extension that were stored independent of the manifest.
         * When asking for files, versions will be included as well since files
         * are returned as a property of the versions.
         * These files can be retrieved using the path to the file without
         * requiring the entire manifest be downloaded.
         */
        Flags[Flags["IncludeFiles"] = 2] = "IncludeFiles";
        /**
         * Include the Categories and Tags that were added to the extension definition.
         */
        Flags[Flags["IncludeCategoryAndTags"] = 4] = "IncludeCategoryAndTags";
        /**
         * Include the details about which accounts the extension has been shared
         * with if the extension is a private extension.
         */
        Flags[Flags["IncludeSharedAccounts"] = 8] = "IncludeSharedAccounts";
        /**
         * Include properties associated with versions of the extension
         */
        Flags[Flags["IncludeVersionProperties"] = 16] = "IncludeVersionProperties";
        /**
         * Excluding non-validated extensions will remove any extension versions that
         * either are in the process of being validated or have failed validation.
         */
        Flags[Flags["ExcludeNonValidated"] = 32] = "ExcludeNonValidated";
        /**
         * Include the set of installation targets the extension has requested.
         */
        Flags[Flags["IncludeInstallationTargets"] = 64] = "IncludeInstallationTargets";
        /**
         * Include the base uri for assets of this extension
         */
        Flags[Flags["IncludeAssetUri"] = 128] = "IncludeAssetUri";
        /**
         * Include the statistics associated with this extension
         */
        Flags[Flags["IncludeStatistics"] = 256] = "IncludeStatistics";
        /**
         * When retrieving versions from a query, only include the latest
         * version of the extensions that matched. This is useful when the
         * caller doesn't need all the published versions. It will save a
         * significant size in the returned payload.
         */
        Flags[Flags["IncludeLatestVersionOnly"] = 512] = "IncludeLatestVersionOnly";
        /**
         * This flag switches the asset uri to use GetAssetByName instead of CDN
         * When this is used, values of base asset uri and base asset uri fallback are switched
         * When this is used, source of asset files are pointed to Gallery service always even if CDN is available
         */
        Flags[Flags["Unpublished"] = 4096] = "Unpublished";
        /**
         * Include the details if an extension is in conflict list or not
         */
        Flags[Flags["IncludeNameConflictInfo"] = 32768] = "IncludeNameConflictInfo";
    })(Flags || (Flags = {}));
    function flagsToString(...flags) {
        return String(flags.reduce((r, f) => r | f, 0));
    }
    var FilterType;
    (function (FilterType) {
        FilterType[FilterType["Tag"] = 1] = "Tag";
        FilterType[FilterType["ExtensionId"] = 4] = "ExtensionId";
        FilterType[FilterType["Category"] = 5] = "Category";
        FilterType[FilterType["ExtensionName"] = 7] = "ExtensionName";
        FilterType[FilterType["Target"] = 8] = "Target";
        FilterType[FilterType["Featured"] = 9] = "Featured";
        FilterType[FilterType["SearchText"] = 10] = "SearchText";
        FilterType[FilterType["ExcludeWithFlags"] = 12] = "ExcludeWithFlags";
    })(FilterType || (FilterType = {}));
    const AssetType = {
        Icon: 'Microsoft.VisualStudio.Services.Icons.Default',
        Details: 'Microsoft.VisualStudio.Services.Content.Details',
        Changelog: 'Microsoft.VisualStudio.Services.Content.Changelog',
        Manifest: 'Microsoft.VisualStudio.Code.Manifest',
        VSIX: 'Microsoft.VisualStudio.Services.VSIXPackage',
        License: 'Microsoft.VisualStudio.Services.Content.License',
        Repository: 'Microsoft.VisualStudio.Services.Links.Source',
        Signature: 'Microsoft.VisualStudio.Services.VsixSignature'
    };
    const PropertyType = {
        Dependency: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
        ExtensionPack: 'Microsoft.VisualStudio.Code.ExtensionPack',
        Engine: 'Microsoft.VisualStudio.Code.Engine',
        PreRelease: 'Microsoft.VisualStudio.Code.PreRelease',
        LocalizedLanguages: 'Microsoft.VisualStudio.Code.LocalizedLanguages',
        WebExtension: 'Microsoft.VisualStudio.Code.WebExtension',
        SponsorLink: 'Microsoft.VisualStudio.Code.SponsorLink'
    };
    const DefaultPageSize = 10;
    const DefaultQueryState = {
        pageNumber: 1,
        pageSize: DefaultPageSize,
        sortBy: 0 /* SortBy.NoneOrRelevance */,
        sortOrder: 0 /* SortOrder.Default */,
        flags: Flags.None,
        criteria: [],
        assetTypes: []
    };
    class Query {
        constructor(d = DefaultQueryState) {
            this.d = d;
        }
        get pageNumber() { return this.d.pageNumber; }
        get pageSize() { return this.d.pageSize; }
        get sortBy() { return this.d.sortBy; }
        get sortOrder() { return this.d.sortOrder; }
        get flags() { return this.d.flags; }
        get criteria() { return this.d.criteria; }
        withPage(pageNumber, pageSize = this.d.pageSize) {
            return new Query({ ...this.d, pageNumber, pageSize });
        }
        withFilter(filterType, ...values) {
            const criteria = [
                ...this.d.criteria,
                ...values.length ? values.map(value => ({ filterType, value })) : [{ filterType }]
            ];
            return new Query({ ...this.d, criteria });
        }
        withSortBy(sortBy) {
            return new Query({ ...this.d, sortBy });
        }
        withSortOrder(sortOrder) {
            return new Query({ ...this.d, sortOrder });
        }
        withFlags(...flags) {
            return new Query({ ...this.d, flags: flags.reduce((r, f) => r | f, 0) });
        }
        withAssetTypes(...assetTypes) {
            return new Query({ ...this.d, assetTypes });
        }
        withSource(source) {
            return new Query({ ...this.d, source });
        }
        get raw() {
            const { criteria, pageNumber, pageSize, sortBy, sortOrder, flags, assetTypes } = this.d;
            const filters = [{ criteria, pageNumber, pageSize, sortBy, sortOrder }];
            return { filters, assetTypes, flags };
        }
        get searchText() {
            const criterium = this.d.criteria.filter(criterium => criterium.filterType === FilterType.SearchText)[0];
            return criterium && criterium.value ? criterium.value : '';
        }
        get telemetryData() {
            return {
                filterTypes: this.d.criteria.map(criterium => String(criterium.filterType)),
                flags: this.d.flags,
                sortBy: String(this.sortBy),
                sortOrder: String(this.sortOrder),
                pageNumber: String(this.pageNumber),
                source: this.d.source,
                searchTextLength: this.searchText.length
            };
        }
    }
    function getStatistic(statistics, name) {
        const result = (statistics || []).filter(s => s.statisticName === name)[0];
        return result ? result.value : 0;
    }
    function getCoreTranslationAssets(version) {
        const coreTranslationAssetPrefix = 'Microsoft.VisualStudio.Code.Translation.';
        const result = version.files.filter(f => f.assetType.indexOf(coreTranslationAssetPrefix) === 0);
        return result.reduce((result, file) => {
            const asset = getVersionAsset(version, file.assetType);
            if (asset) {
                result.push([file.assetType.substring(coreTranslationAssetPrefix.length), asset]);
            }
            return result;
        }, []);
    }
    function getRepositoryAsset(version) {
        if (version.properties) {
            const results = version.properties.filter(p => p.key === AssetType.Repository);
            const gitRegExp = new RegExp('((git|ssh|http(s)?)|(git@[\\w.]+))(:(//)?)([\\w.@:/\\-~]+)(.git)(/)?');
            const uri = results.filter(r => gitRegExp.test(r.value))[0];
            return uri ? { uri: uri.value, fallbackUri: uri.value } : null;
        }
        return getVersionAsset(version, AssetType.Repository);
    }
    function getDownloadAsset(version) {
        return {
            uri: `${version.fallbackAssetUri}/${AssetType.VSIX}?redirect=true${version.targetPlatform ? `&targetPlatform=${version.targetPlatform}` : ''}`,
            fallbackUri: `${version.fallbackAssetUri}/${AssetType.VSIX}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
        };
    }
    function getVersionAsset(version, type) {
        const result = version.files.filter(f => f.assetType === type)[0];
        return result ? {
            uri: `${version.assetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`,
            fallbackUri: `${version.fallbackAssetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
        } : null;
    }
    function getExtensions(version, property) {
        const values = version.properties ? version.properties.filter(p => p.key === property) : [];
        const value = values.length > 0 && values[0].value;
        return value ? value.split(',').map(v => (0, extensionManagementUtil_1.$to)(v)) : [];
    }
    function getEngine(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.Engine) : [];
        return (values.length > 0 && values[0].value) || '';
    }
    function isPreReleaseVersion(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.PreRelease) : [];
        return values.length > 0 && values[0].value === 'true';
    }
    function getLocalizedLanguages(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.LocalizedLanguages) : [];
        const value = (values.length > 0 && values[0].value) || '';
        return value ? value.split(',') : [];
    }
    function getSponsorLink(version) {
        return version.properties?.find(p => p.key === PropertyType.SponsorLink)?.value;
    }
    function getIsPreview(flags) {
        return flags.indexOf('preview') !== -1;
    }
    function getTargetPlatformForExtensionVersion(version) {
        return version.targetPlatform ? (0, extensionManagement_1.$Tn)(version.targetPlatform) : "undefined" /* TargetPlatform.UNDEFINED */;
    }
    function getAllTargetPlatforms(rawGalleryExtension) {
        const allTargetPlatforms = (0, arrays_1.$Kb)(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
        // Is a web extension only if it has WEB_EXTENSION_TAG
        const isWebExtension = !!rawGalleryExtension.tags?.includes(extensionManagement_1.$On);
        // Include Web Target Platform only if it is a web extension
        const webTargetPlatformIndex = allTargetPlatforms.indexOf("web" /* TargetPlatform.WEB */);
        if (isWebExtension) {
            if (webTargetPlatformIndex === -1) {
                // Web extension but does not has web target platform -> add it
                allTargetPlatforms.push("web" /* TargetPlatform.WEB */);
            }
        }
        else {
            if (webTargetPlatformIndex !== -1) {
                // Not a web extension but has web target platform -> remove it
                allTargetPlatforms.splice(webTargetPlatformIndex, 1);
            }
        }
        return allTargetPlatforms;
    }
    function $4o(versions, preferredTargetPlatform) {
        /* It is expected that versions from Marketplace are sorted by version. So we are just sorting by preferred targetPlatform */
        const fallbackTargetPlatforms = (0, extensionManagement_1.$Xn)(preferredTargetPlatform);
        for (let index = 0; index < versions.length; index++) {
            const version = versions[index];
            if (version.version === versions[index - 1]?.version) {
                let insertionIndex = index;
                const versionTargetPlatform = getTargetPlatformForExtensionVersion(version);
                /* put it at the beginning */
                if (versionTargetPlatform === preferredTargetPlatform) {
                    while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version) {
                        insertionIndex--;
                    }
                }
                /* put it after version with preferred targetPlatform or at the beginning */
                else if (fallbackTargetPlatforms.includes(versionTargetPlatform)) {
                    while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version && getTargetPlatformForExtensionVersion(versions[insertionIndex - 1]) !== preferredTargetPlatform) {
                        insertionIndex--;
                    }
                }
                if (insertionIndex !== index) {
                    versions.splice(index, 1);
                    versions.splice(insertionIndex, 0, version);
                }
            }
        }
        return versions;
    }
    exports.$4o = $4o;
    function setTelemetry(extension, index, querySource) {
        /* __GDPR__FRAGMENT__
        "GalleryExtensionTelemetryData2" : {
            "index" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
            "querySource": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "queryActivityId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        }
        */
        extension.telemetryData = { index, querySource, queryActivityId: extension.queryContext?.[ACTIVITY_HEADER_NAME] };
    }
    function toExtension(galleryExtension, version, allTargetPlatforms, queryContext) {
        const latestVersion = galleryExtension.versions[0];
        const assets = {
            manifest: getVersionAsset(version, AssetType.Manifest),
            readme: getVersionAsset(version, AssetType.Details),
            changelog: getVersionAsset(version, AssetType.Changelog),
            license: getVersionAsset(version, AssetType.License),
            repository: getRepositoryAsset(version),
            download: getDownloadAsset(version),
            icon: getVersionAsset(version, AssetType.Icon),
            signature: getVersionAsset(version, AssetType.Signature),
            coreTranslations: getCoreTranslationAssets(version)
        };
        return {
            identifier: {
                id: (0, extensionManagementUtil_1.$uo)(galleryExtension.publisher.publisherName, galleryExtension.extensionName),
                uuid: galleryExtension.extensionId
            },
            name: galleryExtension.extensionName,
            version: version.version,
            displayName: galleryExtension.displayName,
            publisherId: galleryExtension.publisher.publisherId,
            publisher: galleryExtension.publisher.publisherName,
            publisherDisplayName: galleryExtension.publisher.displayName,
            publisherDomain: galleryExtension.publisher.domain ? { link: galleryExtension.publisher.domain, verified: !!galleryExtension.publisher.isDomainVerified } : undefined,
            publisherSponsorLink: getSponsorLink(latestVersion),
            description: galleryExtension.shortDescription || '',
            installCount: getStatistic(galleryExtension.statistics, 'install'),
            rating: getStatistic(galleryExtension.statistics, 'averagerating'),
            ratingCount: getStatistic(galleryExtension.statistics, 'ratingcount'),
            categories: galleryExtension.categories || [],
            tags: galleryExtension.tags || [],
            releaseDate: Date.parse(galleryExtension.releaseDate),
            lastUpdated: Date.parse(galleryExtension.lastUpdated),
            allTargetPlatforms,
            assets,
            properties: {
                dependencies: getExtensions(version, PropertyType.Dependency),
                extensionPack: getExtensions(version, PropertyType.ExtensionPack),
                engine: getEngine(version),
                localizedLanguages: getLocalizedLanguages(version),
                targetPlatform: getTargetPlatformForExtensionVersion(version),
                isPreReleaseVersion: isPreReleaseVersion(version)
            },
            hasPreReleaseVersion: isPreReleaseVersion(latestVersion),
            hasReleaseVersion: true,
            preview: getIsPreview(galleryExtension.flags),
            isSigned: !!assets.signature,
            queryContext
        };
    }
    let AbstractExtensionGalleryService = class AbstractExtensionGalleryService {
        constructor(storageService, k, l, n, o, q, u, w) {
            this.k = k;
            this.l = l;
            this.n = n;
            this.o = o;
            this.q = q;
            this.u = u;
            this.w = w;
            const config = u.extensionsGallery;
            const isPPEEnabled = config?.servicePPEUrl && w.getValue('_extensionsGallery.enablePPE');
            this.d = isPPEEnabled ? config.servicePPEUrl : config?.serviceUrl;
            this.g = isPPEEnabled ? undefined : config?.searchUrl;
            this.h = config?.controlUrl;
            this.j = (0, marketplace_1.$3o)(u.version, u, this.n, this.w, this.q, storageService, this.o);
        }
        x(path = '') {
            return `${this.d}${path}`;
        }
        isEnabled() {
            return !!this.d;
        }
        async getExtensions(extensionInfos, arg1, arg2) {
            const options = cancellation_1.CancellationToken.isCancellationToken(arg1) ? {} : arg1;
            const token = cancellation_1.CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
            const names = [];
            const ids = [], includePreReleases = [], versions = [];
            let isQueryForReleaseVersionFromPreReleaseVersion = true;
            for (const extensionInfo of extensionInfos) {
                if (extensionInfo.uuid) {
                    ids.push(extensionInfo.uuid);
                }
                else {
                    names.push(extensionInfo.id);
                }
                // Set includePreRelease to true if version is set, because the version can be a pre-release version
                const includePreRelease = !!(extensionInfo.version || extensionInfo.preRelease);
                includePreReleases.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, includePreRelease });
                if (extensionInfo.version) {
                    versions.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, version: extensionInfo.version });
                }
                isQueryForReleaseVersionFromPreReleaseVersion = isQueryForReleaseVersionFromPreReleaseVersion && (!!extensionInfo.hasPreRelease && !includePreRelease);
            }
            if (!ids.length && !names.length) {
                return [];
            }
            let query = new Query().withPage(1, extensionInfos.length);
            if (ids.length) {
                query = query.withFilter(FilterType.ExtensionId, ...ids);
            }
            if (names.length) {
                query = query.withFilter(FilterType.ExtensionName, ...names);
            }
            if (options.queryAllVersions || isQueryForReleaseVersionFromPreReleaseVersion /* Inlcude all versions if every requested extension is for release version and has pre-release version  */) {
                query = query.withFlags(query.flags, Flags.IncludeVersions);
            }
            if (options.source) {
                query = query.withSource(options.source);
            }
            const { extensions } = await this.z(query, { targetPlatform: options.targetPlatform ?? CURRENT_TARGET_PLATFORM, includePreRelease: includePreReleases, versions, compatible: !!options.compatible }, token);
            if (options.source) {
                extensions.forEach((e, index) => setTelemetry(e, index, options.source));
            }
            return extensions;
        }
        async getCompatibleExtension(extension, includePreRelease, targetPlatform) {
            if ((0, extensionManagement_1.$Vn)(extension.allTargetPlatforms, targetPlatform)) {
                return null;
            }
            if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                return extension;
            }
            const query = new Query()
                .withFlags(Flags.IncludeVersions)
                .withPage(1, 1)
                .withFilter(FilterType.ExtensionId, extension.identifier.uuid);
            const { extensions } = await this.z(query, { targetPlatform, compatible: true, includePreRelease }, cancellation_1.CancellationToken.None);
            return extensions[0] || null;
        }
        async isExtensionCompatible(extension, includePreRelease, targetPlatform) {
            if (!(0, extensionManagement_1.$Wn)(extension.properties.targetPlatform, extension.allTargetPlatforms, targetPlatform)) {
                return false;
            }
            if (!includePreRelease && extension.properties.isPreReleaseVersion) {
                // Pre-releases are not allowed when include pre-release flag is not set
                return false;
            }
            let engine = extension.properties.engine;
            if (!engine) {
                const manifest = await this.getManifest(extension, cancellation_1.CancellationToken.None);
                if (!manifest) {
                    throw new Error('Manifest was not found');
                }
                engine = manifest.engines.vscode;
            }
            return (0, extensionValidator_1.$Ho)(engine, this.u.version, this.u.date);
        }
        async y(rawGalleryExtensionVersion, versionType, compatible, allTargetPlatforms, targetPlatform) {
            if (!(0, extensionManagement_1.$Wn)(getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion), allTargetPlatforms, targetPlatform)) {
                return false;
            }
            if (versionType !== 'any' && isPreReleaseVersion(rawGalleryExtensionVersion) !== (versionType === 'prerelease')) {
                return false;
            }
            if (compatible) {
                try {
                    const engine = await this.E(rawGalleryExtensionVersion);
                    if (!(0, extensionValidator_1.$Ho)(engine, this.u.version, this.u.date)) {
                        return false;
                    }
                }
                catch (error) {
                    this.l.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, (0, errors_1.$8)(error));
                    return false;
                }
            }
            return true;
        }
        async query(options, token) {
            let text = options.text || '';
            const pageSize = options.pageSize ?? 50;
            let query = new Query()
                .withPage(1, pageSize);
            if (text) {
                // Use category filter instead of "category:themes"
                text = text.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                    query = query.withFilter(FilterType.Category, category || quotedCategory);
                    return '';
                });
                // Use tag filter instead of "tag:debuggers"
                text = text.replace(/\btag:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedTag, tag) => {
                    query = query.withFilter(FilterType.Tag, tag || quotedTag);
                    return '';
                });
                // Use featured filter
                text = text.replace(/\bfeatured(\s+|\b|$)/g, () => {
                    query = query.withFilter(FilterType.Featured);
                    return '';
                });
                text = text.trim();
                if (text) {
                    text = text.length < 200 ? text : text.substring(0, 200);
                    query = query.withFilter(FilterType.SearchText, text);
                }
                query = query.withSortBy(0 /* SortBy.NoneOrRelevance */);
            }
            else if (options.ids) {
                query = query.withFilter(FilterType.ExtensionId, ...options.ids);
            }
            else if (options.names) {
                query = query.withFilter(FilterType.ExtensionName, ...options.names);
            }
            else {
                query = query.withSortBy(4 /* SortBy.InstallCount */);
            }
            if (typeof options.sortBy === 'number') {
                query = query.withSortBy(options.sortBy);
            }
            if (typeof options.sortOrder === 'number') {
                query = query.withSortOrder(options.sortOrder);
            }
            if (options.source) {
                query = query.withSource(options.source);
            }
            const runQuery = async (query, token) => {
                const { extensions, total } = await this.z(query, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options.includePreRelease }, token);
                extensions.forEach((e, index) => setTelemetry(e, ((query.pageNumber - 1) * query.pageSize) + index, options.source));
                return { extensions, total };
            };
            const { extensions, total } = await runQuery(query, token);
            const getPage = async (pageIndex, ct) => {
                if (ct.isCancellationRequested) {
                    throw new errors_1.$3();
                }
                const { extensions } = await runQuery(query.withPage(pageIndex + 1), ct);
                return extensions;
            };
            return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
        }
        async z(query, criteria, token) {
            const flags = query.flags;
            /**
             * If both version flags (IncludeLatestVersionOnly and IncludeVersions) are included, then only include latest versions (IncludeLatestVersionOnly) flag.
             */
            if (!!(query.flags & Flags.IncludeLatestVersionOnly) && !!(query.flags & Flags.IncludeVersions)) {
                query = query.withFlags(query.flags & ~Flags.IncludeVersions, Flags.IncludeLatestVersionOnly);
            }
            /**
             * If version flags (IncludeLatestVersionOnly and IncludeVersions) are not included, default is to query for latest versions (IncludeLatestVersionOnly).
             */
            if (!(query.flags & Flags.IncludeLatestVersionOnly) && !(query.flags & Flags.IncludeVersions)) {
                query = query.withFlags(query.flags, Flags.IncludeLatestVersionOnly);
            }
            /**
             * If versions criteria exist, then remove IncludeLatestVersionOnly flag and add IncludeVersions flag.
             */
            if (criteria.versions?.length) {
                query = query.withFlags(query.flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions);
            }
            /**
             * Add necessary extension flags
             */
            query = query.withFlags(query.flags, Flags.IncludeAssetUri, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeStatistics, Flags.IncludeVersionProperties);
            const { galleryExtensions: rawGalleryExtensions, total, context } = await this.B(query, token);
            const hasAllVersions = !(query.flags & Flags.IncludeLatestVersionOnly);
            if (hasAllVersions) {
                const extensions = [];
                for (const rawGalleryExtension of rawGalleryExtensions) {
                    const extension = await this.A(rawGalleryExtension, criteria, context);
                    if (extension) {
                        extensions.push(extension);
                    }
                }
                return { extensions, total };
            }
            const result = [];
            const needAllVersions = new Map();
            for (let index = 0; index < rawGalleryExtensions.length; index++) {
                const rawGalleryExtension = rawGalleryExtensions[index];
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.$uo)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
                const includePreRelease = (0, types_1.$pf)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.$po)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
                if (criteria.compatible && (0, extensionManagement_1.$Vn)(getAllTargetPlatforms(rawGalleryExtension), criteria.targetPlatform)) {
                    /** Skip if requested for a web-compatible extension and it is not a web extension.
                     * All versions are not needed in this case
                    */
                    continue;
                }
                const extension = await this.A(rawGalleryExtension, criteria, context);
                if (!extension
                    /** Need all versions if the extension is a pre-release version but
                     * 		- the query is to look for a release version or
                     * 		- the extension has no release version
                     * Get all versions to get or check the release version
                    */
                    || (extension.properties.isPreReleaseVersion && (!includePreRelease || !extension.hasReleaseVersion))
                    /**
                     * Need all versions if the extension is a release version with a different target platform than requested and also has a pre-release version
                     * Because, this is a platform specific extension and can have a newer release version supporting this platform.
                     * See https://github.com/microsoft/vscode/issues/139628
                    */
                    || (!extension.properties.isPreReleaseVersion && extension.properties.targetPlatform !== criteria.targetPlatform && extension.hasPreReleaseVersion)) {
                    needAllVersions.set(rawGalleryExtension.extensionId, index);
                }
                else {
                    result.push([index, extension]);
                }
            }
            if (needAllVersions.size) {
                const stopWatch = new stopwatch_1.$bd();
                const query = new Query()
                    .withFlags(flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions)
                    .withPage(1, needAllVersions.size)
                    .withFilter(FilterType.ExtensionId, ...needAllVersions.keys());
                const { extensions } = await this.z(query, criteria, token);
                this.o.publicLog2('galleryService:additionalQuery', {
                    duration: stopWatch.elapsed(),
                    count: needAllVersions.size
                });
                for (const extension of extensions) {
                    const index = needAllVersions.get(extension.identifier.uuid);
                    result.push([index, extension]);
                }
            }
            return { extensions: result.sort((a, b) => a[0] - b[0]).map(([, extension]) => extension), total };
        }
        async A(rawGalleryExtension, criteria, queryContext) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.$uo)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
            const version = criteria.versions?.find(extensionIdentifierWithVersion => (0, extensionManagementUtil_1.$po)(extensionIdentifierWithVersion, extensionIdentifier))?.version;
            const includePreRelease = (0, types_1.$pf)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.$po)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
            const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
            const rawGalleryExtensionVersions = $4o(rawGalleryExtension.versions, criteria.targetPlatform);
            if (criteria.compatible && (0, extensionManagement_1.$Vn)(allTargetPlatforms, criteria.targetPlatform)) {
                return null;
            }
            for (let index = 0; index < rawGalleryExtensionVersions.length; index++) {
                const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index];
                if (version && rawGalleryExtensionVersion.version !== version) {
                    continue;
                }
                // Allow any version if includePreRelease flag is set otherwise only release versions are allowed
                if (await this.y(rawGalleryExtensionVersion, includePreRelease ? 'any' : 'release', criteria.compatible, allTargetPlatforms, criteria.targetPlatform)) {
                    return toExtension(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, queryContext);
                }
                if (version && rawGalleryExtensionVersion.version === version) {
                    return null;
                }
            }
            if (version || criteria.compatible) {
                return null;
            }
            /**
             * Fallback: Return the latest version
             * This can happen when the extension does not have a release version or does not have a version compatible with the given target platform.
             */
            return toExtension(rawGalleryExtension, rawGalleryExtension.versions[0], allTargetPlatforms);
        }
        async B(query, token) {
            if (!this.isEnabled()) {
                throw new Error('No extension gallery service configured.');
            }
            query = query
                /* Always exclude non validated extensions */
                .withFlags(query.flags, Flags.ExcludeNonValidated)
                .withFilter(FilterType.Target, 'Microsoft.VisualStudio.Code')
                /* Always exclude unpublished extensions */
                .withFilter(FilterType.ExcludeWithFlags, flagsToString(Flags.Unpublished));
            const commonHeaders = await this.j;
            const data = JSON.stringify(query.raw);
            const headers = {
                ...commonHeaders,
                'Content-Type': 'application/json',
                'Accept': 'application/json;api-version=3.0-preview.1',
                'Accept-Encoding': 'gzip',
                'Content-Length': String(data.length),
            };
            const stopWatch = new stopwatch_1.$bd();
            let context, error, total = 0;
            try {
                context = await this.k.request({
                    type: 'POST',
                    url: this.g && query.criteria.some(c => c.filterType === FilterType.SearchText) ? this.g : this.x('/extensionquery'),
                    data,
                    headers
                }, token);
                if (context.res.statusCode && context.res.statusCode >= 400 && context.res.statusCode < 500) {
                    return { galleryExtensions: [], total };
                }
                const result = await (0, request_1.$Oo)(context);
                if (result) {
                    const r = result.results[0];
                    const galleryExtensions = r.extensions;
                    const resultCount = r.resultMetadata && r.resultMetadata.filter(m => m.metadataType === 'ResultCount')[0];
                    total = resultCount && resultCount.metadataItems.filter(i => i.name === 'TotalCount')[0].count || 0;
                    return {
                        galleryExtensions,
                        total,
                        context: {
                            [ACTIVITY_HEADER_NAME]: context.res.headers['activityid']
                        }
                    };
                }
                return { galleryExtensions: [], total };
            }
            catch (e) {
                error = e;
                throw e;
            }
            finally {
                this.o.publicLog2('galleryService:query', {
                    ...query.telemetryData,
                    requestBodySize: String(data.length),
                    duration: stopWatch.elapsed(),
                    success: !!context && (0, request_1.$Ko)(context),
                    responseBodySize: context?.res.headers['Content-Length'],
                    statusCode: context ? String(context.res.statusCode) : undefined,
                    errorCode: error
                        ? (0, errors_1.$2)(error) ? 'canceled' : (0, errors_1.$8)(error).startsWith('XHR timeout') ? 'timeout' : 'failed'
                        : undefined,
                    count: String(total)
                });
            }
        }
        async reportStatistic(publisher, name, version, type) {
            if (!this.isEnabled()) {
                return undefined;
            }
            const url = platform_1.$o ? this.x(`/itemName/${publisher}.${name}/version/${version}/statType/${type === "install" /* StatisticType.Install */ ? '1' : '3'}/vscodewebextension`) : this.x(`/publishers/${publisher}/extensions/${name}/${version}/stats?statType=${type}`);
            const Accept = platform_1.$o ? 'api-version=6.1-preview.1' : '*/*;api-version=4.0-preview.1';
            const commonHeaders = await this.j;
            const headers = { ...commonHeaders, Accept };
            try {
                await this.k.request({
                    type: 'POST',
                    url,
                    headers
                }, cancellation_1.CancellationToken.None);
            }
            catch (error) { /* Ignore */ }
        }
        async download(extension, location, operation) {
            this.l.trace('ExtensionGalleryService#download', extension.identifier.id);
            const data = (0, extensionManagementUtil_1.$xo)(extension);
            const startTime = new Date().getTime();
            /* __GDPR__
                "galleryService:downloadVSIX" : {
                    "owner": "sandy081",
                    "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            const log = (duration) => this.o.publicLog('galleryService:downloadVSIX', { ...data, duration });
            const operationParam = operation === 2 /* InstallOperation.Install */ ? 'install' : operation === 3 /* InstallOperation.Update */ ? 'update' : '';
            const downloadAsset = operationParam ? {
                uri: `${extension.assets.download.uri}${uri_1.URI.parse(extension.assets.download.uri).query ? '&' : '?'}${operationParam}=true`,
                fallbackUri: `${extension.assets.download.fallbackUri}${uri_1.URI.parse(extension.assets.download.fallbackUri).query ? '&' : '?'}${operationParam}=true`
            } : extension.assets.download;
            const headers = extension.queryContext?.[ACTIVITY_HEADER_NAME] ? { [ACTIVITY_HEADER_NAME]: extension.queryContext[ACTIVITY_HEADER_NAME] } : undefined;
            const context = await this.D(downloadAsset, headers ? { headers } : undefined);
            await this.q.writeFile(location, context.stream);
            log(new Date().getTime() - startTime);
        }
        async downloadSignatureArchive(extension, location) {
            if (!extension.assets.signature) {
                throw new Error('No signature asset found');
            }
            this.l.trace('ExtensionGalleryService#downloadSignatureArchive', extension.identifier.id);
            const context = await this.D(extension.assets.signature);
            await this.q.writeFile(location, context.stream);
        }
        async getReadme(extension, token) {
            if (extension.assets.readme) {
                const context = await this.D(extension.assets.readme, {}, token);
                const content = await (0, request_1.$No)(context);
                return content || '';
            }
            return '';
        }
        async getManifest(extension, token) {
            if (extension.assets.manifest) {
                const context = await this.D(extension.assets.manifest, {}, token);
                const text = await (0, request_1.$No)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async C(rawExtensionVersion, token) {
            const manifestAsset = getVersionAsset(rawExtensionVersion, AssetType.Manifest);
            if (!manifestAsset) {
                throw new Error('Manifest was not found');
            }
            const headers = { 'Accept-Encoding': 'gzip' };
            const context = await this.D(manifestAsset, { headers });
            return await (0, request_1.$Oo)(context);
        }
        async getCoreTranslation(extension, languageId) {
            const asset = extension.assets.coreTranslations.filter(t => t[0] === languageId.toUpperCase())[0];
            if (asset) {
                const context = await this.D(asset[1]);
                const text = await (0, request_1.$No)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async getChangelog(extension, token) {
            if (extension.assets.changelog) {
                const context = await this.D(extension.assets.changelog, {}, token);
                const content = await (0, request_1.$No)(context);
                return content || '';
            }
            return '';
        }
        async getAllCompatibleVersions(extension, includePreRelease, targetPlatform) {
            let query = new Query()
                .withFlags(Flags.IncludeVersions, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeVersionProperties)
                .withPage(1, 1);
            if (extension.identifier.uuid) {
                query = query.withFilter(FilterType.ExtensionId, extension.identifier.uuid);
            }
            else {
                query = query.withFilter(FilterType.ExtensionName, extension.identifier.id);
            }
            const { galleryExtensions } = await this.B(query, cancellation_1.CancellationToken.None);
            if (!galleryExtensions.length) {
                return [];
            }
            const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
            if ((0, extensionManagement_1.$Vn)(allTargetPlatforms, targetPlatform)) {
                return [];
            }
            const validVersions = [];
            await Promise.all(galleryExtensions[0].versions.map(async (version) => {
                try {
                    if (await this.y(version, includePreRelease ? 'any' : 'release', true, allTargetPlatforms, targetPlatform)) {
                        validVersions.push(version);
                    }
                }
                catch (error) { /* Ignore error and skip version */ }
            }));
            const result = [];
            const seen = new Set();
            for (const version of $4o(validVersions, targetPlatform)) {
                if (!seen.has(version.version)) {
                    seen.add(version.version);
                    result.push({ version: version.version, date: version.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version) });
                }
            }
            return result;
        }
        async D(asset, options = {}, token = cancellation_1.CancellationToken.None) {
            const commonHeaders = await this.j;
            const baseOptions = { type: 'GET' };
            const headers = { ...commonHeaders, ...(options.headers || {}) };
            options = { ...options, ...baseOptions, headers };
            const url = asset.uri;
            const fallbackUrl = asset.fallbackUri;
            const firstOptions = { ...options, url };
            try {
                const context = await this.k.request(firstOptions, token);
                if (context.res.statusCode === 200) {
                    return context;
                }
                const message = await (0, request_1.$No)(context);
                throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
            }
            catch (err) {
                if ((0, errors_1.$2)(err)) {
                    throw err;
                }
                const message = (0, errors_1.$8)(err);
                this.o.publicLog2('galleryService:cdnFallback', { url, message });
                const fallbackOptions = { ...options, url: fallbackUrl };
                return this.k.request(fallbackOptions, token);
            }
        }
        async E(rawExtensionVersion) {
            let engine = getEngine(rawExtensionVersion);
            if (!engine) {
                const manifest = await this.C(rawExtensionVersion, cancellation_1.CancellationToken.None);
                if (!manifest) {
                    throw new Error('Manifest was not found');
                }
                engine = manifest.engines.vscode;
            }
            return engine;
        }
        async getExtensionsControlManifest() {
            if (!this.isEnabled()) {
                throw new Error('No extension gallery service configured.');
            }
            if (!this.h) {
                return { malicious: [], deprecated: {}, search: [] };
            }
            const context = await this.k.request({ type: 'GET', url: this.h }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode !== 200) {
                throw new Error('Could not get extensions report.');
            }
            const result = await (0, request_1.$Oo)(context);
            const malicious = [];
            const deprecated = {};
            const search = [];
            if (result) {
                for (const id of result.malicious) {
                    malicious.push({ id });
                }
                if (result.migrateToPreRelease) {
                    for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
                        if (!preReleaseExtensionInfo.engine || (0, extensionValidator_1.$Ho)(preReleaseExtensionInfo.engine, this.u.version, this.u.date)) {
                            deprecated[unsupportedPreReleaseExtensionId.toLowerCase()] = {
                                disallowInstall: true,
                                extension: {
                                    id: preReleaseExtensionInfo.id,
                                    displayName: preReleaseExtensionInfo.displayName,
                                    autoMigrate: { storage: !!preReleaseExtensionInfo.migrateStorage },
                                    preRelease: true
                                }
                            };
                        }
                    }
                }
                if (result.deprecated) {
                    for (const [deprecatedExtensionId, deprecationInfo] of Object.entries(result.deprecated)) {
                        if (deprecationInfo) {
                            deprecated[deprecatedExtensionId.toLowerCase()] = (0, types_1.$pf)(deprecationInfo) ? {} : deprecationInfo;
                        }
                    }
                }
                if (result.search) {
                    for (const s of result.search) {
                        search.push(s);
                    }
                }
            }
            return { malicious, deprecated, search };
        }
    };
    AbstractExtensionGalleryService = __decorate([
        __param(1, request_1.$Io),
        __param(2, log_1.$5i),
        __param(3, environment_1.$Ih),
        __param(4, telemetry_1.$9k),
        __param(5, files_1.$6j),
        __param(6, productService_1.$kj),
        __param(7, configuration_1.$8h)
    ], AbstractExtensionGalleryService);
    let $5o = class $5o extends AbstractExtensionGalleryService {
        constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.$5o = $5o;
    exports.$5o = $5o = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, request_1.$Io),
        __param(2, log_1.$5i),
        __param(3, environment_1.$Ih),
        __param(4, telemetry_1.$9k),
        __param(5, files_1.$6j),
        __param(6, productService_1.$kj),
        __param(7, configuration_1.$8h)
    ], $5o);
    let $6o = class $6o extends AbstractExtensionGalleryService {
        constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(undefined, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.$6o = $6o;
    exports.$6o = $6o = __decorate([
        __param(0, request_1.$Io),
        __param(1, log_1.$5i),
        __param(2, environment_1.$Ih),
        __param(3, telemetry_1.$9k),
        __param(4, files_1.$6j),
        __param(5, productService_1.$kj),
        __param(6, configuration_1.$8h)
    ], $6o);
});
//# sourceMappingURL=extensionGalleryService.js.map