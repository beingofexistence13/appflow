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
    exports.$Oac = void 0;
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
    let $Oac = class $Oac {
        constructor(b, d, f, g) {
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
        }
        async getTags() {
            if (!this.a) {
                this.a = await this.h();
            }
            return this.a;
        }
        async getTelemetryWorkspaceId(workspace, state) {
            function createHash(uri) {
                return (0, hash_1.$1Q)(uri.scheme === network_1.Schemas.file ? uri.fsPath : uri.toString());
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
            return this.b.exists(uri).then(exists => {
                if (!exists) {
                    return [];
                }
                return this.g.read(uri, { acceptTextOnly: true }).then(content => (0, workspaceTags_2.$Fac)(content.value, stripEndingDotGit), err => [] // ignore missing or binary file
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
        async h() {
            const tags = Object.create(null);
            const state = this.d.getWorkbenchState();
            const workspace = this.d.getWorkspace();
            tags['workspace.id'] = await this.getTelemetryWorkspaceId(workspace, state);
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.f;
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
            const aiGeneratedWorkspaces = uri_1.URI.joinPath(this.f.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
            await this.b.exists(aiGeneratedWorkspaces).then(async (result) => {
                if (result) {
                    try {
                        const content = await this.b.readFile(aiGeneratedWorkspaces);
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
            return this.b.resolveAll(folders.map(resource => ({ resource }))).then((files) => {
                const names = [].concat(...files.map(result => result.success ? (result.stat.children || []) : [])).map(c => c.name);
                const nameSet = names.reduce((s, n) => s.add(n.toLowerCase()), new Set());
                tags['workspace.grunt'] = nameSet.has('gruntfile.js');
                tags['workspace.gulp'] = nameSet.has('gulpfile.js');
                tags['workspace.jake'] = nameSet.has('jakefile.js');
                tags['workspace.tsconfig'] = nameSet.has('tsconfig.json');
                tags['workspace.jsconfig'] = nameSet.has('jsconfig.json');
                tags['workspace.config.xml'] = nameSet.has('config.xml');
                tags['workspace.vsc.extension'] = nameSet.has('vsc-extension-quickstart.md');
                tags['workspace.ASP5'] = nameSet.has('project.json') && this.l(names, /^.+\.cs$/i);
                tags['workspace.sln'] = this.l(names, /^.+\.sln$|^.+\.csproj$/i);
                tags['workspace.unity'] = nameSet.has('assets') && nameSet.has('library') && nameSet.has('projectsettings');
                tags['workspace.npm'] = nameSet.has('package.json') || nameSet.has('node_modules');
                tags['workspace.bower'] = nameSet.has('bower.json') || nameSet.has('bower_components');
                tags['workspace.java.pom'] = nameSet.has('pom.xml');
                tags['workspace.java.gradle'] = nameSet.has('build.gradle') || nameSet.has('settings.gradle') || nameSet.has('build.gradle.kts') || nameSet.has('settings.gradle.kts') || nameSet.has('gradlew') || nameSet.has('gradlew.bat');
                tags['workspace.yeoman.code.ext'] = nameSet.has('vsc-extension-quickstart.md');
                tags['workspace.py.requirements'] = nameSet.has('requirements.txt');
                tags['workspace.py.requirements.star'] = this.l(names, /^(.*)requirements(.*)\.txt$/i);
                tags['workspace.py.Pipfile'] = nameSet.has('pipfile');
                tags['workspace.py.conda'] = this.l(names, /^environment(\.yml$|\.yaml$)/i);
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
                const requirementsTxtPromises = getFilePromises('requirements.txt', this.b, this.g, content => {
                    const dependencies = (0, strings_1.$Ae)(content.value);
                    for (const dependency of dependencies) {
                        // Dependencies in requirements.txt can have 3 formats: `foo==3.1, foo>=3.1, foo`
                        const format1 = dependency.split('==');
                        const format2 = dependency.split('>=');
                        const packageName = (format1.length === 2 ? format1[0] : format2[0]).trim();
                        addPythonTags(packageName);
                    }
                });
                const pipfilePromises = getFilePromises('pipfile', this.b, this.g, content => {
                    let dependencies = (0, strings_1.$Ae)(content.value);
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
                const packageJsonPromises = getFilePromises('package.json', this.b, this.g, content => {
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
                const goModPromises = getFilePromises('go.mod', this.b, this.g, content => {
                    try {
                        const lines = (0, strings_1.$Ae)(content.value);
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
                const pomPromises = getFilePromises('pom.xml', this.b, this.g, content => {
                    try {
                        let dependenciesContent;
                        while (dependenciesContent = javaWorkspaceTags_1.$Jac.exec(content.value)) {
                            let dependencyContent;
                            while (dependencyContent = javaWorkspaceTags_1.$Kac.exec(dependenciesContent[1])) {
                                const groupIdContent = javaWorkspaceTags_1.$Lac.exec(dependencyContent[1]);
                                const artifactIdContent = javaWorkspaceTags_1.$Mac.exec(dependencyContent[1]);
                                if (groupIdContent && artifactIdContent) {
                                    this.k(groupIdContent[1], artifactIdContent[1], 'workspace.pom.', tags);
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignore errors when resolving maven dependencies
                    }
                });
                const gradlePromises = getFilePromises('build.gradle', this.b, this.g, content => {
                    try {
                        this.j(content.value, javaWorkspaceTags_1.$Hac, tags);
                        this.j(content.value, javaWorkspaceTags_1.$Iac, tags);
                    }
                    catch (e) {
                        // Ignore errors when resolving gradle dependencies
                    }
                });
                const androidPromises = folders.map(workspaceUri => {
                    const manifest = uri_1.URI.joinPath(workspaceUri, '/app/src/main/AndroidManifest.xml');
                    return this.b.exists(manifest).then(result => {
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
        j(content, regex, tags) {
            let dependencyContent;
            while (dependencyContent = regex.exec(content)) {
                const groupId = dependencyContent[1];
                const artifactId = dependencyContent[2];
                if (groupId && artifactId) {
                    this.k(groupId, artifactId, 'workspace.gradle.', tags);
                }
            }
        }
        k(groupId, artifactId, prefix, tags) {
            for (const javaLibrary of javaWorkspaceTags_1.$Nac) {
                if ((groupId === javaLibrary.groupId || new RegExp(javaLibrary.groupId).test(groupId)) &&
                    (artifactId === javaLibrary.artifactId || new RegExp(javaLibrary.artifactId).test(artifactId))) {
                    tags[prefix + javaLibrary.tag] = true;
                    return;
                }
            }
        }
        l(arr, regEx) {
            return arr.some(v => v.search(regEx) > -1) || undefined;
        }
    };
    exports.$Oac = $Oac;
    exports.$Oac = $Oac = __decorate([
        __param(0, files_1.$6j),
        __param(1, workspace_1.$Kh),
        __param(2, environmentService_1.$hJ),
        __param(3, textfiles_1.$JD)
    ], $Oac);
    (0, extensions_1.$mr)(workspaceTags_1.$NZb, $Oac, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceTagsService.js.map