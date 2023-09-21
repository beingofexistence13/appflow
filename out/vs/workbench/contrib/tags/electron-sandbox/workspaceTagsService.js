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
define(["require", "exports", "vs/base/browser/hash", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/uri", "vs/base/common/network", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tags/common/workspaceTags", "vs/workbench/contrib/tags/electron-sandbox/workspaceTags", "vs/base/common/strings", "vs/workbench/contrib/tags/common/javaWorkspaceTags"], function (require, exports, hash_1, files_1, workspace_1, environmentService_1, textfiles_1, uri_1, network_1, extensions_1, workspaceTags_1, workspaceTags_2, strings_1, javaWorkspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTagsService = void 0;
    const MetaModulesToLookFor = [
        // Azure packages
        '@azure',
        '@azure/ai',
        '@azure/core',
        '@azure/cosmos',
        '@azure/event',
        '@azure/identity',
        '@azure/keyvault',
        '@azure/search',
        '@azure/storage'
    ];
    const ModulesToLookFor = [
        // Packages that suggest a node server
        'express',
        'sails',
        'koa',
        'hapi',
        'socket.io',
        'restify',
        'next',
        'nuxt',
        '@nestjs/core',
        'strapi',
        'gatsby',
        // JS frameworks
        'react',
        'react-native',
        'react-native-macos',
        'react-native-windows',
        'rnpm-plugin-windows',
        '@angular/core',
        '@ionic',
        'vue',
        'tns-core-modules',
        '@nativescript/core',
        'electron',
        // Other interesting packages
        'aws-sdk',
        'aws-amplify',
        'azure',
        'azure-storage',
        'firebase',
        '@google-cloud/common',
        'heroku-cli',
        // Office and Sharepoint packages
        '@microsoft/teams-js',
        '@microsoft/office-js',
        '@microsoft/office-js-helpers',
        '@types/office-js',
        '@types/office-runtime',
        'office-ui-fabric-react',
        '@uifabric/icons',
        '@uifabric/merge-styles',
        '@uifabric/styling',
        '@uifabric/experiments',
        '@uifabric/utilities',
        '@microsoft/rush',
        'lerna',
        'just-task',
        'beachball',
        // Playwright packages
        'playwright',
        'playwright-cli',
        '@playwright/test',
        'playwright-core',
        'playwright-chromium',
        'playwright-firefox',
        'playwright-webkit',
        // Other interesting browser testing packages
        'cypress',
        'nightwatch',
        'protractor',
        'puppeteer',
        'selenium-webdriver',
        'webdriverio',
        'gherkin',
        // AzureSDK packages
        '@azure/app-configuration',
        '@azure/cosmos-sign',
        '@azure/cosmos-language-service',
        '@azure/synapse-spark',
        '@azure/synapse-monitoring',
        '@azure/synapse-managed-private-endpoints',
        '@azure/synapse-artifacts',
        '@azure/synapse-access-control',
        '@azure/ai-metrics-advisor',
        '@azure/service-bus',
        '@azure/keyvault-secrets',
        '@azure/keyvault-keys',
        '@azure/keyvault-certificates',
        '@azure/keyvault-admin',
        '@azure/digital-twins-core',
        '@azure/cognitiveservices-anomalydetector',
        '@azure/ai-anomaly-detector',
        '@azure/core-xml',
        '@azure/core-tracing',
        '@azure/core-paging',
        '@azure/core-https',
        '@azure/core-client',
        '@azure/core-asynciterator-polyfill',
        '@azure/core-arm',
        '@azure/amqp-common',
        '@azure/core-lro',
        '@azure/logger',
        '@azure/core-http',
        '@azure/core-auth',
        '@azure/core-amqp',
        '@azure/abort-controller',
        '@azure/eventgrid',
        '@azure/storage-file-datalake',
        '@azure/search-documents',
        '@azure/storage-file',
        '@azure/storage-datalake',
        '@azure/storage-queue',
        '@azure/storage-file-share',
        '@azure/storage-blob-changefeed',
        '@azure/storage-blob',
        '@azure/cognitiveservices-formrecognizer',
        '@azure/ai-form-recognizer',
        '@azure/cognitiveservices-textanalytics',
        '@azure/ai-text-analytics',
        '@azure/event-processor-host',
        '@azure/schema-registry-avro',
        '@azure/schema-registry',
        '@azure/eventhubs-checkpointstore-blob',
        '@azure/event-hubs',
        '@azure/communication-signaling',
        '@azure/communication-calling',
        '@azure/communication-sms',
        '@azure/communication-common',
        '@azure/communication-chat',
        '@azure/communication-administration',
        '@azure/attestation',
        '@azure/data-tables'
    ];
    const PyMetaModulesToLookFor = [
        'azure-ai',
        'azure-cognitiveservices',
        'azure-core',
        'azure-cosmos',
        'azure-event',
        'azure-identity',
        'azure-keyvault',
        'azure-mgmt',
        'azure-ml',
        'azure-search',
        'azure-storage'
    ];
    const PyModulesToLookFor = [
        'azure',
        'azure-ai-language-conversations',
        'azure-ai-language-questionanswering',
        'azure-ai-ml',
        'azure-ai-translation-document',
        'azure-appconfiguration',
        'azure-loganalytics',
        'azure-synapse-nspkg',
        'azure-synapse-spark',
        'azure-synapse-artifacts',
        'azure-synapse-accesscontrol',
        'azure-synapse',
        'azure-cognitiveservices-vision-nspkg',
        'azure-cognitiveservices-search-nspkg',
        'azure-cognitiveservices-nspkg',
        'azure-cognitiveservices-language-nspkg',
        'azure-cognitiveservices-knowledge-nspkg',
        'azure-monitor',
        'azure-ai-metricsadvisor',
        'azure-servicebus',
        'azureml-sdk',
        'azure-keyvault-nspkg',
        'azure-keyvault-secrets',
        'azure-keyvault-keys',
        'azure-keyvault-certificates',
        'azure-keyvault-administration',
        'azure-digitaltwins-nspkg',
        'azure-digitaltwins-core',
        'azure-cognitiveservices-anomalydetector',
        'azure-ai-anomalydetector',
        'azure-applicationinsights',
        'azure-core-tracing-opentelemetry',
        'azure-core-tracing-opencensus',
        'azure-nspkg',
        'azure-common',
        'azure-eventgrid',
        'azure-storage-file-datalake',
        'azure-search-nspkg',
        'azure-search-documents',
        'azure-storage-nspkg',
        'azure-storage-file',
        'azure-storage-common',
        'azure-storage-queue',
        'azure-storage-file-share',
        'azure-storage-blob-changefeed',
        'azure-storage-blob',
        'azure-cognitiveservices-formrecognizer',
        'azure-ai-formrecognizer',
        'azure-ai-nspkg',
        'azure-cognitiveservices-language-textanalytics',
        'azure-ai-textanalytics',
        'azure-schemaregistry-avroserializer',
        'azure-schemaregistry',
        'azure-eventhub-checkpointstoreblob-aio',
        'azure-eventhub-checkpointstoreblob',
        'azure-eventhub',
        'azure-servicefabric',
        'azure-communication-nspkg',
        'azure-communication-sms',
        'azure-communication-chat',
        'azure-communication-administration',
        'azure-security-attestation',
        'azure-data-nspkg',
        'azure-data-tables',
        'azure-devtools',
        'azure-elasticluster',
        'azure-functions',
        'azure-graphrbac',
        'azure-iothub-device-client',
        'azure-shell',
        'azure-translator',
        'adal',
        'pydocumentdb',
        'botbuilder-core',
        'botbuilder-schema',
        'botframework-connector',
        'playwright'
    ];
    const GoModulesToLookFor = [
        'github.com/Azure/azure-sdk-for-go/sdk/storage/azblob',
        'github.com/Azure/azure-sdk-for-go/sdk/storage/azfile',
        'github.com/Azure/azure-sdk-for-go/sdk/storage/azqueue',
        'github.com/Azure/azure-sdk-for-go/sdk/tracing/azotel',
        'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azadmin',
        'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azcertificates',
        'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azkeys',
        'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azsecrets',
        'github.com/Azure/azure-sdk-for-go/sdk/monitor/azquery',
        'github.com/Azure/azure-sdk-for-go/sdk/messaging/azeventhubs',
        'github.com/Azure/azure-sdk-for-go/sdk/messaging/azservicebus',
        'github.com/Azure/azure-sdk-for-go/sdk/data/azappconfig',
        'github.com/Azure/azure-sdk-for-go/sdk/data/azcosmos',
        'github.com/Azure/azure-sdk-for-go/sdk/data/aztables',
        'github.com/Azure/azure-sdk-for-go/sdk/containers/azcontainerregistry',
        'github.com/Azure/azure-sdk-for-go/sdk/cognitiveservices/azopenai',
        'github.com/Azure/azure-sdk-for-go/sdk/azidentity',
        'github.com/Azure/azure-sdk-for-go/sdk/azcore'
    ];
    let WorkspaceTagsService = class WorkspaceTagsService {
        constructor(fileService, contextService, environmentService, textFileService) {
            this.fileService = fileService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.textFileService = textFileService;
        }
        async getTags() {
            if (!this._tags) {
                this._tags = await this.resolveWorkspaceTags();
            }
            return this._tags;
        }
        async getTelemetryWorkspaceId(workspace, state) {
            function createHash(uri) {
                return (0, hash_1.sha1Hex)(uri.scheme === network_1.Schemas.file ? uri.fsPath : uri.toString());
            }
            let workspaceId;
            switch (state) {
                case 1 /* WorkbenchState.EMPTY */:
                    workspaceId = undefined;
                    break;
                case 2 /* WorkbenchState.FOLDER */:
                    workspaceId = await createHash(workspace.folders[0].uri);
                    break;
                case 3 /* WorkbenchState.WORKSPACE */:
                    if (workspace.configuration) {
                        workspaceId = await createHash(workspace.configuration);
                    }
            }
            return workspaceId;
        }
        getHashedRemotesFromUri(workspaceUri, stripEndingDotGit = false) {
            const path = workspaceUri.path;
            const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
            return this.fileService.exists(uri).then(exists => {
                if (!exists) {
                    return [];
                }
                return this.textFileService.read(uri, { acceptTextOnly: true }).then(content => (0, workspaceTags_2.getHashedRemotesFromConfig)(content.value, stripEndingDotGit), err => [] // ignore missing or binary file
                );
            });
        }
        /* __GDPR__FRAGMENT__
            "WorkspaceTags" : {
                "workbench.filesToOpenOrCreate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workbench.filesToDiff" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workbench.filesToMerge" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "workspace.roots" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.empty" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.grunt" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gulp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.jake" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.tsconfig" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.jsconfig" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.config.xml" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.vsc.extension" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.asp<NUMBER>" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.sln" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.unity" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.express" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.sails" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.koa" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.hapi" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.socket.io" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.restify" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.next" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.nuxt" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@nestjs/core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.strapi" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.gatsby" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.rnpm-plugin-windows" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.react" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@angular/core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.vue" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.aws-sdk" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.aws-amplify-sdk" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/ai" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cosmos" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/event" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/identity" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/keyvault" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/search" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.azure-storage" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@google-cloud/common" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.firebase" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.heroku-cli" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@microsoft/teams-js" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@microsoft/office-js" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@microsoft/office-js-helpers" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@types/office-js" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@types/office-runtime" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.office-ui-fabric-react" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@uifabric/icons" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@uifabric/merge-styles" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@uifabric/styling" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@uifabric/experiments" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@uifabric/utilities" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@microsoft/rush" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.lerna" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.just-task" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.beachball" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.electron" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright-cli" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@playwright/test" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright-core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright-chromium" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright-firefox" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.playwright-webkit" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.cypress" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.nightwatch" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.protractor" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.puppeteer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.selenium-webdriver" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.webdriverio" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.gherkin" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/app-configuration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cosmos-sign" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cosmos-language-service" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/synapse-spark" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/synapse-monitoring" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/synapse-managed-private-endpoints" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/synapse-artifacts" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/synapse-access-control" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/ai-metrics-advisor" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/service-bus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/keyvault-secrets" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/keyvault-keys" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/keyvault-certificates" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/keyvault-admin" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/digital-twins-core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cognitiveservices-anomalydetector" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/ai-anomaly-detector" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-xml" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-tracing" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-paging" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-https" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-client" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-asynciterator-polyfill" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-arm" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/amqp-common" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-lro" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/logger" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-http" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-auth" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/core-amqp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/abort-controller" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/eventgrid" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-file-datalake" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/search-documents" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-file" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-datalake" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-queue" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-file-share" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-blob-changefeed" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/storage-blob" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cognitiveservices-formrecognizer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/ai-form-recognizer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/cognitiveservices-textanalytics" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/ai-text-analytics" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/event-processor-host" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/schema-registry-avro" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/schema-registry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/eventhubs-checkpointstore-blob" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/event-hubs" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-signaling" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-calling" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-sms" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-common" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-chat" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/communication-administration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/attestation" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.@azure/data-tables" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.react-native-macos" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.npm.react-native-windows" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.bower" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.yeoman.code.ext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.cordova.high" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.cordova.low" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.xamarin.android" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.xamarin.ios" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.android.cpp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.reactNative" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.ionic" : { "classification" : "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": "true" },
                "workspace.nativeScript" : { "classification" : "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": "true" },
                "workspace.java.pom" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.java.gradle" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.java.android" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.javaee" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.jdbc" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.jpa" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.lombok" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.mockito" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.redis" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.springboot" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.sql" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.gradle.unittest" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.javaee" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.jdbc" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.jpa" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.lombok" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.mockito" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.redis" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.springboot" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.sql" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.pom.unittest" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.requirements" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.requirements.star" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.Pipfile" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.conda" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.setup": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.pyproject": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.manage": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.setupcfg": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.app": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.any-azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.pulumi-azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-language-conversations" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-language-questionanswering" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-ml" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-translation-document" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cosmos" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-devtools" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-elasticluster" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-event" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-eventgrid" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-functions" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-graphrbac" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-identity" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-iothub-device-client" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-loganalytics" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-mgmt" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ml" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-monitor" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-search" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-servicebus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-servicefabric" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-shell" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-translator" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.adal" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.pydocumentdb" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.botbuilder-core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.botbuilder-schema" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.botframework-connector" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.playwright" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-synapse-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-synapse-spark" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-synapse-artifacts" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-synapse-accesscontrol" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-synapse" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-vision-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-search-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-language-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-knowledge-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-metricsadvisor" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azureml-sdk" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault-secrets" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault-keys" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault-certificates" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-keyvault-administration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-digitaltwins-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-digitaltwins-core" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-anomalydetector" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-anomalydetector" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-applicationinsights" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-core-tracing-opentelemetry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-core-tracing-opencensus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-common" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-eventgrid" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-file-datalake" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-search-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-search-documents" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-file" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-common" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-queue" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-file-share" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-blob-changefeed" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-storage-blob" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-formrecognizer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-formrecognizer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-cognitiveservices-language-textanalytics" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-ai-textanalytics" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-schemaregistry-avroserializer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-schemaregistry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-eventhub-checkpointstoreblob-aio" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-eventhub-checkpointstoreblob" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-eventhub" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-communication-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-communication-sms" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-communication-chat" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-communication-administration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-security-attestation" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-data-nspkg" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.py.azure-data-tables" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/storage/azblob" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/storage/azfile" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/storage/azqueue" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/tracing/azotel" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azadmin" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azcertificates" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azkeys" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azsecrets" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/monitor/azquery" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/messaging/azeventhubs" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/messaging/azservicebus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/data/azappconfig" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/data/azcosmos" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/data/aztables" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/containers/azcontainerregistry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/cognitiveservices/azopenai" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/azidentity" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "workspace.go.mod.github.com/Azure/azure-sdk-for-go/sdk/azcore" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            }
        */
        async resolveWorkspaceTags() {
            const tags = Object.create(null);
            const state = this.contextService.getWorkbenchState();
            const workspace = this.contextService.getWorkspace();
            tags['workspace.id'] = await this.getTelemetryWorkspaceId(workspace, state);
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
            tags['workbench.filesToOpenOrCreate'] = filesToOpenOrCreate && filesToOpenOrCreate.length || 0;
            tags['workbench.filesToDiff'] = filesToDiff && filesToDiff.length || 0;
            tags['workbench.filesToMerge'] = filesToMerge && filesToMerge.length || 0;
            const isEmpty = state === 1 /* WorkbenchState.EMPTY */;
            tags['workspace.roots'] = isEmpty ? 0 : workspace.folders.length;
            tags['workspace.empty'] = isEmpty;
            const folders = !isEmpty ? workspace.folders.map(folder => folder.uri) : undefined;
            if (!folders || !folders.length) {
                return Promise.resolve(tags);
            }
            const aiGeneratedWorkspaces = uri_1.URI.joinPath(this.environmentService.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
            await this.fileService.exists(aiGeneratedWorkspaces).then(async (result) => {
                if (result) {
                    try {
                        const content = await this.fileService.readFile(aiGeneratedWorkspaces);
                        const workspaces = JSON.parse(content.value.toString());
                        if (workspaces.indexOf(workspace.folders[0].uri.toString()) > -1) {
                            tags['aiGenerated'] = true;
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving file contents
                    }
                }
            });
            return this.fileService.resolveAll(folders.map(resource => ({ resource }))).then((files) => {
                const names = [].concat(...files.map(result => result.success ? (result.stat.children || []) : [])).map(c => c.name);
                const nameSet = names.reduce((s, n) => s.add(n.toLowerCase()), new Set());
                tags['workspace.grunt'] = nameSet.has('gruntfile.js');
                tags['workspace.gulp'] = nameSet.has('gulpfile.js');
                tags['workspace.jake'] = nameSet.has('jakefile.js');
                tags['workspace.tsconfig'] = nameSet.has('tsconfig.json');
                tags['workspace.jsconfig'] = nameSet.has('jsconfig.json');
                tags['workspace.config.xml'] = nameSet.has('config.xml');
                tags['workspace.vsc.extension'] = nameSet.has('vsc-extension-quickstart.md');
                tags['workspace.ASP5'] = nameSet.has('project.json') && this.searchArray(names, /^.+\.cs$/i);
                tags['workspace.sln'] = this.searchArray(names, /^.+\.sln$|^.+\.csproj$/i);
                tags['workspace.unity'] = nameSet.has('assets') && nameSet.has('library') && nameSet.has('projectsettings');
                tags['workspace.npm'] = nameSet.has('package.json') || nameSet.has('node_modules');
                tags['workspace.bower'] = nameSet.has('bower.json') || nameSet.has('bower_components');
                tags['workspace.java.pom'] = nameSet.has('pom.xml');
                tags['workspace.java.gradle'] = nameSet.has('build.gradle') || nameSet.has('settings.gradle') || nameSet.has('build.gradle.kts') || nameSet.has('settings.gradle.kts') || nameSet.has('gradlew') || nameSet.has('gradlew.bat');
                tags['workspace.yeoman.code.ext'] = nameSet.has('vsc-extension-quickstart.md');
                tags['workspace.py.requirements'] = nameSet.has('requirements.txt');
                tags['workspace.py.requirements.star'] = this.searchArray(names, /^(.*)requirements(.*)\.txt$/i);
                tags['workspace.py.Pipfile'] = nameSet.has('pipfile');
                tags['workspace.py.conda'] = this.searchArray(names, /^environment(\.yml$|\.yaml$)/i);
                tags['workspace.py.setup'] = nameSet.has('setup.py');
                tags['workspace.py.manage'] = nameSet.has('manage.py');
                tags['workspace.py.setupcfg'] = nameSet.has('setup.cfg');
                tags['workspace.py.app'] = nameSet.has('app.py');
                tags['workspace.py.pyproject'] = nameSet.has('pyproject.toml');
                tags['workspace.go.mod'] = nameSet.has('go.mod');
                const mainActivity = nameSet.has('mainactivity.cs') || nameSet.has('mainactivity.fs');
                const appDelegate = nameSet.has('appdelegate.cs') || nameSet.has('appdelegate.fs');
                const androidManifest = nameSet.has('androidmanifest.xml');
                const platforms = nameSet.has('platforms');
                const plugins = nameSet.has('plugins');
                const www = nameSet.has('www');
                const properties = nameSet.has('properties');
                const resources = nameSet.has('resources');
                const jni = nameSet.has('jni');
                if (tags['workspace.config.xml'] &&
                    !tags['workspace.language.cs'] && !tags['workspace.language.vb'] && !tags['workspace.language.aspx']) {
                    if (platforms && plugins && www) {
                        tags['workspace.cordova.high'] = true;
                    }
                    else {
                        tags['workspace.cordova.low'] = true;
                    }
                }
                if (tags['workspace.config.xml'] &&
                    !tags['workspace.language.cs'] && !tags['workspace.language.vb'] && !tags['workspace.language.aspx']) {
                    if (nameSet.has('ionic.config.json')) {
                        tags['workspace.ionic'] = true;
                    }
                }
                if (mainActivity && properties && resources) {
                    tags['workspace.xamarin.android'] = true;
                }
                if (appDelegate && resources) {
                    tags['workspace.xamarin.ios'] = true;
                }
                if (androidManifest && jni) {
                    tags['workspace.android.cpp'] = true;
                }
                function getFilePromises(filename, fileService, textFileService, contentHandler) {
                    return !nameSet.has(filename) ? [] : folders.map(workspaceUri => {
                        const uri = workspaceUri.with({ path: `${workspaceUri.path !== '/' ? workspaceUri.path : ''}/${filename}` });
                        return fileService.exists(uri).then(exists => {
                            if (!exists) {
                                return undefined;
                            }
                            return textFileService.read(uri, { acceptTextOnly: true }).then(contentHandler);
                        }, err => {
                            // Ignore missing file
                        });
                    });
                }
                function addPythonTags(packageName) {
                    if (PyModulesToLookFor.indexOf(packageName) > -1) {
                        tags['workspace.py.' + packageName] = true;
                    }
                    for (const metaModule of PyMetaModulesToLookFor) {
                        if (packageName.startsWith(metaModule)) {
                            tags['workspace.py.' + metaModule] = true;
                        }
                    }
                    if (!tags['workspace.py.any-azure']) {
                        tags['workspace.py.any-azure'] = /azure/i.test(packageName);
                    }
                }
                const requirementsTxtPromises = getFilePromises('requirements.txt', this.fileService, this.textFileService, content => {
                    const dependencies = (0, strings_1.splitLines)(content.value);
                    for (const dependency of dependencies) {
                        // Dependencies in requirements.txt can have 3 formats: `foo==3.1, foo>=3.1, foo`
                        const format1 = dependency.split('==');
                        const format2 = dependency.split('>=');
                        const packageName = (format1.length === 2 ? format1[0] : format2[0]).trim();
                        addPythonTags(packageName);
                    }
                });
                const pipfilePromises = getFilePromises('pipfile', this.fileService, this.textFileService, content => {
                    let dependencies = (0, strings_1.splitLines)(content.value);
                    // We're only interested in the '[packages]' section of the Pipfile
                    dependencies = dependencies.slice(dependencies.indexOf('[packages]') + 1);
                    for (const dependency of dependencies) {
                        if (dependency.trim().indexOf('[') > -1) {
                            break;
                        }
                        // All dependencies in Pipfiles follow the format: `<package> = <version, or git repo, or something else>`
                        if (dependency.indexOf('=') === -1) {
                            continue;
                        }
                        const packageName = dependency.split('=')[0].trim();
                        addPythonTags(packageName);
                    }
                });
                const packageJsonPromises = getFilePromises('package.json', this.fileService, this.textFileService, content => {
                    try {
                        const packageJsonContents = JSON.parse(content.value);
                        const dependencies = Object.keys(packageJsonContents['dependencies'] || {}).concat(Object.keys(packageJsonContents['devDependencies'] || {}));
                        for (const dependency of dependencies) {
                            if (dependency.startsWith('react-native')) {
                                tags['workspace.reactNative'] = true;
                            }
                            else if ('tns-core-modules' === dependency || '@nativescript/core' === dependency) {
                                tags['workspace.nativescript'] = true;
                            }
                            else if (ModulesToLookFor.indexOf(dependency) > -1) {
                                tags['workspace.npm.' + dependency] = true;
                            }
                            else {
                                for (const metaModule of MetaModulesToLookFor) {
                                    if (dependency.startsWith(metaModule)) {
                                        tags['workspace.npm.' + metaModule] = true;
                                    }
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving file or parsing file contents
                    }
                });
                const goModPromises = getFilePromises('go.mod', this.fileService, this.textFileService, content => {
                    try {
                        const lines = (0, strings_1.splitLines)(content.value);
                        let firstRequireBlockFound = false;
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (line.startsWith('require (')) {
                                if (!firstRequireBlockFound) {
                                    firstRequireBlockFound = true;
                                    continue;
                                }
                                else {
                                    break;
                                }
                            }
                            if (line.startsWith(')')) {
                                break;
                            }
                            if (firstRequireBlockFound && line !== '') {
                                const packageName = line.split(' ')[0].trim();
                                if (GoModulesToLookFor.indexOf(packageName) > -1) {
                                    tags['workspace.go.mod.' + packageName] = true;
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving file or parsing file contents
                    }
                });
                const pomPromises = getFilePromises('pom.xml', this.fileService, this.textFileService, content => {
                    try {
                        let dependenciesContent;
                        while (dependenciesContent = javaWorkspaceTags_1.MavenDependenciesRegex.exec(content.value)) {
                            let dependencyContent;
                            while (dependencyContent = javaWorkspaceTags_1.MavenDependencyRegex.exec(dependenciesContent[1])) {
                                const groupIdContent = javaWorkspaceTags_1.MavenGroupIdRegex.exec(dependencyContent[1]);
                                const artifactIdContent = javaWorkspaceTags_1.MavenArtifactIdRegex.exec(dependencyContent[1]);
                                if (groupIdContent && artifactIdContent) {
                                    this.tagJavaDependency(groupIdContent[1], artifactIdContent[1], 'workspace.pom.', tags);
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving maven dependencies
                    }
                });
                const gradlePromises = getFilePromises('build.gradle', this.fileService, this.textFileService, content => {
                    try {
                        this.processGradleDependencies(content.value, javaWorkspaceTags_1.GradleDependencyLooseRegex, tags);
                        this.processGradleDependencies(content.value, javaWorkspaceTags_1.GradleDependencyCompactRegex, tags);
                    }
                    catch (e) {
                        // Ignore errors when resolving gradle dependencies
                    }
                });
                const androidPromises = folders.map(workspaceUri => {
                    const manifest = uri_1.URI.joinPath(workspaceUri, '/app/src/main/AndroidManifest.xml');
                    return this.fileService.exists(manifest).then(result => {
                        if (result) {
                            tags['workspace.java.android'] = true;
                        }
                    }, err => {
                        // Ignore errors when resolving android
                    });
                });
                return Promise.all([...packageJsonPromises, ...requirementsTxtPromises, ...pipfilePromises, ...pomPromises, ...gradlePromises, ...androidPromises, ...goModPromises]).then(() => tags);
            });
        }
        processGradleDependencies(content, regex, tags) {
            let dependencyContent;
            while (dependencyContent = regex.exec(content)) {
                const groupId = dependencyContent[1];
                const artifactId = dependencyContent[2];
                if (groupId && artifactId) {
                    this.tagJavaDependency(groupId, artifactId, 'workspace.gradle.', tags);
                }
            }
        }
        tagJavaDependency(groupId, artifactId, prefix, tags) {
            for (const javaLibrary of javaWorkspaceTags_1.JavaLibrariesToLookFor) {
                if ((groupId === javaLibrary.groupId || new RegExp(javaLibrary.groupId).test(groupId)) &&
                    (artifactId === javaLibrary.artifactId || new RegExp(javaLibrary.artifactId).test(artifactId))) {
                    tags[prefix + javaLibrary.tag] = true;
                    return;
                }
            }
        }
        searchArray(arr, regEx) {
            return arr.some(v => v.search(regEx) > -1) || undefined;
        }
    };
    exports.WorkspaceTagsService = WorkspaceTagsService;
    exports.WorkspaceTagsService = WorkspaceTagsService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, textfiles_1.ITextFileService)
    ], WorkspaceTagsService);
    (0, extensions_1.registerSingleton)(workspaceTags_1.IWorkspaceTagsService, WorkspaceTagsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFnc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YWdzL2VsZWN0cm9uLXNhbmRib3gvd29ya3NwYWNlVGFnc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLE1BQU0sb0JBQW9CLEdBQUc7UUFDNUIsaUJBQWlCO1FBQ2pCLFFBQVE7UUFDUixXQUFXO1FBQ1gsYUFBYTtRQUNiLGVBQWU7UUFDZixjQUFjO1FBQ2QsaUJBQWlCO1FBQ2pCLGlCQUFpQjtRQUNqQixlQUFlO1FBQ2YsZ0JBQWdCO0tBQ2hCLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFHO1FBQ3hCLHNDQUFzQztRQUN0QyxTQUFTO1FBQ1QsT0FBTztRQUNQLEtBQUs7UUFDTCxNQUFNO1FBQ04sV0FBVztRQUNYLFNBQVM7UUFDVCxNQUFNO1FBQ04sTUFBTTtRQUNOLGNBQWM7UUFDZCxRQUFRO1FBQ1IsUUFBUTtRQUNSLGdCQUFnQjtRQUNoQixPQUFPO1FBQ1AsY0FBYztRQUNkLG9CQUFvQjtRQUNwQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLGVBQWU7UUFDZixRQUFRO1FBQ1IsS0FBSztRQUNMLGtCQUFrQjtRQUNsQixvQkFBb0I7UUFDcEIsVUFBVTtRQUNWLDZCQUE2QjtRQUM3QixTQUFTO1FBQ1QsYUFBYTtRQUNiLE9BQU87UUFDUCxlQUFlO1FBQ2YsVUFBVTtRQUNWLHNCQUFzQjtRQUN0QixZQUFZO1FBQ1osaUNBQWlDO1FBQ2pDLHFCQUFxQjtRQUNyQixzQkFBc0I7UUFDdEIsOEJBQThCO1FBQzlCLGtCQUFrQjtRQUNsQix1QkFBdUI7UUFDdkIsd0JBQXdCO1FBQ3hCLGlCQUFpQjtRQUNqQix3QkFBd0I7UUFDeEIsbUJBQW1CO1FBQ25CLHVCQUF1QjtRQUN2QixxQkFBcUI7UUFDckIs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