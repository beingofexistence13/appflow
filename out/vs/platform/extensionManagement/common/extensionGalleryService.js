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
    exports.ExtensionGalleryServiceWithNoStorageService = exports.ExtensionGalleryService = exports.sortExtensionVersions = void 0;
    const CURRENT_TARGET_PLATFORM = platform_1.isWeb ? "web" /* TargetPlatform.WEB */ : (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
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
        constructor(state = DefaultQueryState) {
            this.state = state;
        }
        get pageNumber() { return this.state.pageNumber; }
        get pageSize() { return this.state.pageSize; }
        get sortBy() { return this.state.sortBy; }
        get sortOrder() { return this.state.sortOrder; }
        get flags() { return this.state.flags; }
        get criteria() { return this.state.criteria; }
        withPage(pageNumber, pageSize = this.state.pageSize) {
            return new Query({ ...this.state, pageNumber, pageSize });
        }
        withFilter(filterType, ...values) {
            const criteria = [
                ...this.state.criteria,
                ...values.length ? values.map(value => ({ filterType, value })) : [{ filterType }]
            ];
            return new Query({ ...this.state, criteria });
        }
        withSortBy(sortBy) {
            return new Query({ ...this.state, sortBy });
        }
        withSortOrder(sortOrder) {
            return new Query({ ...this.state, sortOrder });
        }
        withFlags(...flags) {
            return new Query({ ...this.state, flags: flags.reduce((r, f) => r | f, 0) });
        }
        withAssetTypes(...assetTypes) {
            return new Query({ ...this.state, assetTypes });
        }
        withSource(source) {
            return new Query({ ...this.state, source });
        }
        get raw() {
            const { criteria, pageNumber, pageSize, sortBy, sortOrder, flags, assetTypes } = this.state;
            const filters = [{ criteria, pageNumber, pageSize, sortBy, sortOrder }];
            return { filters, assetTypes, flags };
        }
        get searchText() {
            const criterium = this.state.criteria.filter(criterium => criterium.filterType === FilterType.SearchText)[0];
            return criterium && criterium.value ? criterium.value : '';
        }
        get telemetryData() {
            return {
                filterTypes: this.state.criteria.map(criterium => String(criterium.filterType)),
                flags: this.state.flags,
                sortBy: String(this.sortBy),
                sortOrder: String(this.sortOrder),
                pageNumber: String(this.pageNumber),
                source: this.state.source,
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
        return value ? value.split(',').map(v => (0, extensionManagementUtil_1.adoptToGalleryExtensionId)(v)) : [];
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
        return version.targetPlatform ? (0, extensionManagement_1.toTargetPlatform)(version.targetPlatform) : "undefined" /* TargetPlatform.UNDEFINED */;
    }
    function getAllTargetPlatforms(rawGalleryExtension) {
        const allTargetPlatforms = (0, arrays_1.distinct)(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
        // Is a web extension only if it has WEB_EXTENSION_TAG
        const isWebExtension = !!rawGalleryExtension.tags?.includes(extensionManagement_1.WEB_EXTENSION_TAG);
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
    function sortExtensionVersions(versions, preferredTargetPlatform) {
        /* It is expected that versions from Marketplace are sorted by version. So we are just sorting by preferred targetPlatform */
        const fallbackTargetPlatforms = (0, extensionManagement_1.getFallbackTargetPlarforms)(preferredTargetPlatform);
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
    exports.sortExtensionVersions = sortExtensionVersions;
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
                id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher.publisherName, galleryExtension.extensionName),
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
        constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            this.requestService = requestService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            this.fileService = fileService;
            this.productService = productService;
            this.configurationService = configurationService;
            const config = productService.extensionsGallery;
            const isPPEEnabled = config?.servicePPEUrl && configurationService.getValue('_extensionsGallery.enablePPE');
            this.extensionsGalleryUrl = isPPEEnabled ? config.servicePPEUrl : config?.serviceUrl;
            this.extensionsGallerySearchUrl = isPPEEnabled ? undefined : config?.searchUrl;
            this.extensionsControlUrl = config?.controlUrl;
            this.commonHeadersPromise = (0, marketplace_1.resolveMarketplaceHeaders)(productService.version, productService, this.environmentService, this.configurationService, this.fileService, storageService, this.telemetryService);
        }
        api(path = '') {
            return `${this.extensionsGalleryUrl}${path}`;
        }
        isEnabled() {
            return !!this.extensionsGalleryUrl;
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
            const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform: options.targetPlatform ?? CURRENT_TARGET_PLATFORM, includePreRelease: includePreReleases, versions, compatible: !!options.compatible }, token);
            if (options.source) {
                extensions.forEach((e, index) => setTelemetry(e, index, options.source));
            }
            return extensions;
        }
        async getCompatibleExtension(extension, includePreRelease, targetPlatform) {
            if ((0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(extension.allTargetPlatforms, targetPlatform)) {
                return null;
            }
            if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                return extension;
            }
            const query = new Query()
                .withFlags(Flags.IncludeVersions)
                .withPage(1, 1)
                .withFilter(FilterType.ExtensionId, extension.identifier.uuid);
            const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform, compatible: true, includePreRelease }, cancellation_1.CancellationToken.None);
            return extensions[0] || null;
        }
        async isExtensionCompatible(extension, includePreRelease, targetPlatform) {
            if (!(0, extensionManagement_1.isTargetPlatformCompatible)(extension.properties.targetPlatform, extension.allTargetPlatforms, targetPlatform)) {
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
            return (0, extensionValidator_1.isEngineValid)(engine, this.productService.version, this.productService.date);
        }
        async isValidVersion(rawGalleryExtensionVersion, versionType, compatible, allTargetPlatforms, targetPlatform) {
            if (!(0, extensionManagement_1.isTargetPlatformCompatible)(getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion), allTargetPlatforms, targetPlatform)) {
                return false;
            }
            if (versionType !== 'any' && isPreReleaseVersion(rawGalleryExtensionVersion) !== (versionType === 'prerelease')) {
                return false;
            }
            if (compatible) {
                try {
                    const engine = await this.getEngine(rawGalleryExtensionVersion);
                    if (!(0, extensionValidator_1.isEngineValid)(engine, this.productService.version, this.productService.date)) {
                        return false;
                    }
                }
                catch (error) {
                    this.logService.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, (0, errors_1.getErrorMessage)(error));
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
                const { extensions, total } = await this.queryGalleryExtensions(query, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options.includePreRelease }, token);
                extensions.forEach((e, index) => setTelemetry(e, ((query.pageNumber - 1) * query.pageSize) + index, options.source));
                return { extensions, total };
            };
            const { extensions, total } = await runQuery(query, token);
            const getPage = async (pageIndex, ct) => {
                if (ct.isCancellationRequested) {
                    throw new errors_1.CancellationError();
                }
                const { extensions } = await runQuery(query.withPage(pageIndex + 1), ct);
                return extensions;
            };
            return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
        }
        async queryGalleryExtensions(query, criteria, token) {
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
            const { galleryExtensions: rawGalleryExtensions, total, context } = await this.queryRawGalleryExtensions(query, token);
            const hasAllVersions = !(query.flags & Flags.IncludeLatestVersionOnly);
            if (hasAllVersions) {
                const extensions = [];
                for (const rawGalleryExtension of rawGalleryExtensions) {
                    const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
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
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
                const includePreRelease = (0, types_1.isBoolean)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
                if (criteria.compatible && (0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(getAllTargetPlatforms(rawGalleryExtension), criteria.targetPlatform)) {
                    /** Skip if requested for a web-compatible extension and it is not a web extension.
                     * All versions are not needed in this case
                    */
                    continue;
                }
                const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
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
                const stopWatch = new stopwatch_1.StopWatch();
                const query = new Query()
                    .withFlags(flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions)
                    .withPage(1, needAllVersions.size)
                    .withFilter(FilterType.ExtensionId, ...needAllVersions.keys());
                const { extensions } = await this.queryGalleryExtensions(query, criteria, token);
                this.telemetryService.publicLog2('galleryService:additionalQuery', {
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
        async toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, queryContext) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
            const version = criteria.versions?.find(extensionIdentifierWithVersion => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithVersion, extensionIdentifier))?.version;
            const includePreRelease = (0, types_1.isBoolean)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
            const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
            const rawGalleryExtensionVersions = sortExtensionVersions(rawGalleryExtension.versions, criteria.targetPlatform);
            if (criteria.compatible && (0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(allTargetPlatforms, criteria.targetPlatform)) {
                return null;
            }
            for (let index = 0; index < rawGalleryExtensionVersions.length; index++) {
                const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index];
                if (version && rawGalleryExtensionVersion.version !== version) {
                    continue;
                }
                // Allow any version if includePreRelease flag is set otherwise only release versions are allowed
                if (await this.isValidVersion(rawGalleryExtensionVersion, includePreRelease ? 'any' : 'release', criteria.compatible, allTargetPlatforms, criteria.targetPlatform)) {
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
        async queryRawGalleryExtensions(query, token) {
            if (!this.isEnabled()) {
                throw new Error('No extension gallery service configured.');
            }
            query = query
                /* Always exclude non validated extensions */
                .withFlags(query.flags, Flags.ExcludeNonValidated)
                .withFilter(FilterType.Target, 'Microsoft.VisualStudio.Code')
                /* Always exclude unpublished extensions */
                .withFilter(FilterType.ExcludeWithFlags, flagsToString(Flags.Unpublished));
            const commonHeaders = await this.commonHeadersPromise;
            const data = JSON.stringify(query.raw);
            const headers = {
                ...commonHeaders,
                'Content-Type': 'application/json',
                'Accept': 'application/json;api-version=3.0-preview.1',
                'Accept-Encoding': 'gzip',
                'Content-Length': String(data.length),
            };
            const stopWatch = new stopwatch_1.StopWatch();
            let context, error, total = 0;
            try {
                context = await this.requestService.request({
                    type: 'POST',
                    url: this.extensionsGallerySearchUrl && query.criteria.some(c => c.filterType === FilterType.SearchText) ? this.extensionsGallerySearchUrl : this.api('/extensionquery'),
                    data,
                    headers
                }, token);
                if (context.res.statusCode && context.res.statusCode >= 400 && context.res.statusCode < 500) {
                    return { galleryExtensions: [], total };
                }
                const result = await (0, request_1.asJson)(context);
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
                this.telemetryService.publicLog2('galleryService:query', {
                    ...query.telemetryData,
                    requestBodySize: String(data.length),
                    duration: stopWatch.elapsed(),
                    success: !!context && (0, request_1.isSuccess)(context),
                    responseBodySize: context?.res.headers['Content-Length'],
                    statusCode: context ? String(context.res.statusCode) : undefined,
                    errorCode: error
                        ? (0, errors_1.isCancellationError)(error) ? 'canceled' : (0, errors_1.getErrorMessage)(error).startsWith('XHR timeout') ? 'timeout' : 'failed'
                        : undefined,
                    count: String(total)
                });
            }
        }
        async reportStatistic(publisher, name, version, type) {
            if (!this.isEnabled()) {
                return undefined;
            }
            const url = platform_1.isWeb ? this.api(`/itemName/${publisher}.${name}/version/${version}/statType/${type === "install" /* StatisticType.Install */ ? '1' : '3'}/vscodewebextension`) : this.api(`/publishers/${publisher}/extensions/${name}/${version}/stats?statType=${type}`);
            const Accept = platform_1.isWeb ? 'api-version=6.1-preview.1' : '*/*;api-version=4.0-preview.1';
            const commonHeaders = await this.commonHeadersPromise;
            const headers = { ...commonHeaders, Accept };
            try {
                await this.requestService.request({
                    type: 'POST',
                    url,
                    headers
                }, cancellation_1.CancellationToken.None);
            }
            catch (error) { /* Ignore */ }
        }
        async download(extension, location, operation) {
            this.logService.trace('ExtensionGalleryService#download', extension.identifier.id);
            const data = (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(extension);
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
            const log = (duration) => this.telemetryService.publicLog('galleryService:downloadVSIX', { ...data, duration });
            const operationParam = operation === 2 /* InstallOperation.Install */ ? 'install' : operation === 3 /* InstallOperation.Update */ ? 'update' : '';
            const downloadAsset = operationParam ? {
                uri: `${extension.assets.download.uri}${uri_1.URI.parse(extension.assets.download.uri).query ? '&' : '?'}${operationParam}=true`,
                fallbackUri: `${extension.assets.download.fallbackUri}${uri_1.URI.parse(extension.assets.download.fallbackUri).query ? '&' : '?'}${operationParam}=true`
            } : extension.assets.download;
            const headers = extension.queryContext?.[ACTIVITY_HEADER_NAME] ? { [ACTIVITY_HEADER_NAME]: extension.queryContext[ACTIVITY_HEADER_NAME] } : undefined;
            const context = await this.getAsset(downloadAsset, headers ? { headers } : undefined);
            await this.fileService.writeFile(location, context.stream);
            log(new Date().getTime() - startTime);
        }
        async downloadSignatureArchive(extension, location) {
            if (!extension.assets.signature) {
                throw new Error('No signature asset found');
            }
            this.logService.trace('ExtensionGalleryService#downloadSignatureArchive', extension.identifier.id);
            const context = await this.getAsset(extension.assets.signature);
            await this.fileService.writeFile(location, context.stream);
        }
        async getReadme(extension, token) {
            if (extension.assets.readme) {
                const context = await this.getAsset(extension.assets.readme, {}, token);
                const content = await (0, request_1.asTextOrError)(context);
                return content || '';
            }
            return '';
        }
        async getManifest(extension, token) {
            if (extension.assets.manifest) {
                const context = await this.getAsset(extension.assets.manifest, {}, token);
                const text = await (0, request_1.asTextOrError)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async getManifestFromRawExtensionVersion(rawExtensionVersion, token) {
            const manifestAsset = getVersionAsset(rawExtensionVersion, AssetType.Manifest);
            if (!manifestAsset) {
                throw new Error('Manifest was not found');
            }
            const headers = { 'Accept-Encoding': 'gzip' };
            const context = await this.getAsset(manifestAsset, { headers });
            return await (0, request_1.asJson)(context);
        }
        async getCoreTranslation(extension, languageId) {
            const asset = extension.assets.coreTranslations.filter(t => t[0] === languageId.toUpperCase())[0];
            if (asset) {
                const context = await this.getAsset(asset[1]);
                const text = await (0, request_1.asTextOrError)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async getChangelog(extension, token) {
            if (extension.assets.changelog) {
                const context = await this.getAsset(extension.assets.changelog, {}, token);
                const content = await (0, request_1.asTextOrError)(context);
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
            const { galleryExtensions } = await this.queryRawGalleryExtensions(query, cancellation_1.CancellationToken.None);
            if (!galleryExtensions.length) {
                return [];
            }
            const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
            if ((0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(allTargetPlatforms, targetPlatform)) {
                return [];
            }
            const validVersions = [];
            await Promise.all(galleryExtensions[0].versions.map(async (version) => {
                try {
                    if (await this.isValidVersion(version, includePreRelease ? 'any' : 'release', true, allTargetPlatforms, targetPlatform)) {
                        validVersions.push(version);
                    }
                }
                catch (error) { /* Ignore error and skip version */ }
            }));
            const result = [];
            const seen = new Set();
            for (const version of sortExtensionVersions(validVersions, targetPlatform)) {
                if (!seen.has(version.version)) {
                    seen.add(version.version);
                    result.push({ version: version.version, date: version.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version) });
                }
            }
            return result;
        }
        async getAsset(asset, options = {}, token = cancellation_1.CancellationToken.None) {
            const commonHeaders = await this.commonHeadersPromise;
            const baseOptions = { type: 'GET' };
            const headers = { ...commonHeaders, ...(options.headers || {}) };
            options = { ...options, ...baseOptions, headers };
            const url = asset.uri;
            const fallbackUrl = asset.fallbackUri;
            const firstOptions = { ...options, url };
            try {
                const context = await this.requestService.request(firstOptions, token);
                if (context.res.statusCode === 200) {
                    return context;
                }
                const message = await (0, request_1.asTextOrError)(context);
                throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
            }
            catch (err) {
                if ((0, errors_1.isCancellationError)(err)) {
                    throw err;
                }
                const message = (0, errors_1.getErrorMessage)(err);
                this.telemetryService.publicLog2('galleryService:cdnFallback', { url, message });
                const fallbackOptions = { ...options, url: fallbackUrl };
                return this.requestService.request(fallbackOptions, token);
            }
        }
        async getEngine(rawExtensionVersion) {
            let engine = getEngine(rawExtensionVersion);
            if (!engine) {
                const manifest = await this.getManifestFromRawExtensionVersion(rawExtensionVersion, cancellation_1.CancellationToken.None);
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
            if (!this.extensionsControlUrl) {
                return { malicious: [], deprecated: {}, search: [] };
            }
            const context = await this.requestService.request({ type: 'GET', url: this.extensionsControlUrl }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode !== 200) {
                throw new Error('Could not get extensions report.');
            }
            const result = await (0, request_1.asJson)(context);
            const malicious = [];
            const deprecated = {};
            const search = [];
            if (result) {
                for (const id of result.malicious) {
                    malicious.push({ id });
                }
                if (result.migrateToPreRelease) {
                    for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
                        if (!preReleaseExtensionInfo.engine || (0, extensionValidator_1.isEngineValid)(preReleaseExtensionInfo.engine, this.productService.version, this.productService.date)) {
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
                            deprecated[deprecatedExtensionId.toLowerCase()] = (0, types_1.isBoolean)(deprecationInfo) ? {} : deprecationInfo;
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
        __param(1, request_1.IRequestService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, configuration_1.IConfigurationService)
    ], AbstractExtensionGalleryService);
    let ExtensionGalleryService = class ExtensionGalleryService extends AbstractExtensionGalleryService {
        constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.ExtensionGalleryService = ExtensionGalleryService;
    exports.ExtensionGalleryService = ExtensionGalleryService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, request_1.IRequestService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, configuration_1.IConfigurationService)
    ], ExtensionGalleryService);
    let ExtensionGalleryServiceWithNoStorageService = class ExtensionGalleryServiceWithNoStorageService extends AbstractExtensionGalleryService {
        constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(undefined, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.ExtensionGalleryServiceWithNoStorageService = ExtensionGalleryServiceWithNoStorageService;
    exports.ExtensionGalleryServiceWithNoStorageService = ExtensionGalleryServiceWithNoStorageService = __decorate([
        __param(0, request_1.IRequestService),
        __param(1, log_1.ILogService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, files_1.IFileService),
        __param(5, productService_1.IProductService),
        __param(6, configuration_1.IConfigurationService)
    ], ExtensionGalleryServiceWithNoStorageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uR2FsbGVyeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25HYWxsZXJ5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQmhHLE1BQU0sdUJBQXVCLEdBQUcsZ0JBQUssQ0FBQyxDQUFDLGdDQUFvQixDQUFDLENBQUMsSUFBQSx1Q0FBaUIsRUFBQyxtQkFBUSxFQUFFLGNBQUksQ0FBQyxDQUFDO0lBQy9GLE1BQU0sb0JBQW9CLEdBQUcsNkJBQTZCLENBQUM7SUFzRTNELElBQUssS0E4RUo7SUE5RUQsV0FBSyxLQUFLO1FBRVQ7O1dBRUc7UUFDSCxpQ0FBVSxDQUFBO1FBRVY7O1dBRUc7UUFDSCx1REFBcUIsQ0FBQTtRQUVyQjs7Ozs7OztXQU9HO1FBQ0gsaURBQWtCLENBQUE7UUFFbEI7O1dBRUc7UUFDSCxxRUFBNEIsQ0FBQTtRQUU1Qjs7O1dBR0c7UUFDSCxtRUFBMkIsQ0FBQTtRQUUzQjs7V0FFRztRQUNILDBFQUErQixDQUFBO1FBRS9COzs7V0FHRztRQUNILGdFQUEwQixDQUFBO1FBRTFCOztXQUVHO1FBQ0gsOEVBQWlDLENBQUE7UUFFakM7O1dBRUc7UUFDSCx5REFBc0IsQ0FBQTtRQUV0Qjs7V0FFRztRQUNILDZEQUF5QixDQUFBO1FBRXpCOzs7OztXQUtHO1FBQ0gsMkVBQWdDLENBQUE7UUFFaEM7Ozs7V0FJRztRQUNILGtEQUFvQixDQUFBO1FBRXBCOztXQUVHO1FBQ0gsMkVBQWdDLENBQUE7SUFDakMsQ0FBQyxFQTlFSSxLQUFLLEtBQUwsS0FBSyxRQThFVDtJQUVELFNBQVMsYUFBYSxDQUFDLEdBQUcsS0FBYztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxF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