/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformationService", "vs/platform/log/common/log", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/base/common/cancellation", "vs/base/test/common/utils"], function (require, exports, assert, aiRelatedInformationService_1, log_1, aiRelatedInformation_1, cancellation_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('AiRelatedInformationService', () => {
        const store = (0, utils_1.$bT)();
        let service;
        setup(() => {
            service = new aiRelatedInformationService_1.$Nyb(store.add(new log_1.$fj()));
        });
        test('should check if providers are registered', () => {
            assert.equal(service.isEnabled(), false);
            store.add(service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, { provideAiRelatedInformation: () => Promise.resolve([]) }));
            assert.equal(service.isEnabled(), true);
        });
        test('should register and unregister providers', () => {
            const provider = { provideAiRelatedInformation: () => Promise.resolve([]) };
            const disposable = service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, provider);
            assert.strictEqual(service.isEnabled(), true);
            disposable.dispose();
            assert.strictEqual(service.isEnabled(), false);
        });
        test('should get related information', async () => {
            const command = 'command';
            const provider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.CommandInformation, command, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, provider);
            const result = await service.getRelatedInformation('query', [aiRelatedInformation_1.RelatedInformationType.CommandInformation], cancellation_1.CancellationToken.None);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].command, command);
        });
        test('should get different types of related information', async () => {
            const command = 'command';
            const commandProvider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.CommandInformation, command, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, commandProvider);
            const setting = 'setting';
            const settingProvider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.SettingInformation, setting, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.SettingInformation, settingProvider);
            const result = await service.getRelatedInformation('query', [
                aiRelatedInformation_1.RelatedInformationType.CommandInformation,
                aiRelatedInformation_1.RelatedInformationType.SettingInformation
            ], cancellation_1.CancellationToken.None);
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].command, command);
            assert.strictEqual(result[1].setting, setting);
        });
    });
});
//# sourceMappingURL=aiRelatedInformationService.test.js.map