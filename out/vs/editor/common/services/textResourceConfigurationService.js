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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration"], function (require, exports, event_1, lifecycle_1, position_1, language_1, model_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourceConfigurationService = void 0;
    let TextResourceConfigurationService = class TextResourceConfigurationService extends lifecycle_1.Disposable {
        constructor(configurationService, modelService, languageService) {
            super();
            this.configurationService = configurationService;
            this.modelService = modelService;
            this.languageService = languageService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._register(this.configurationService.onDidChangeConfiguration(e => this._onDidChangeConfiguration.fire(this.toResourceConfigurationChangeEvent(e))));
        }
        getValue(resource, arg2, arg3) {
            if (typeof arg3 === 'string') {
                return this._getValue(resource, position_1.Position.isIPosition(arg2) ? arg2 : null, arg3);
            }
            return this._getValue(resource, null, typeof arg2 === 'string' ? arg2 : undefined);
        }
        updateValue(resource, key, value, configurationTarget) {
            const language = this.getLanguage(resource, null);
            const configurationValue = this.configurationService.inspect(key, { resource, overrideIdentifier: language });
            if (configurationTarget === undefined) {
                configurationTarget = this.deriveConfigurationTarget(configurationValue, language);
            }
            switch (configurationTarget) {
                case 8 /* ConfigurationTarget.MEMORY */:
                    return this._updateValue(key, value, configurationTarget, configurationValue.memory?.override, resource, language);
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return this._updateValue(key, value, configurationTarget, configurationValue.workspaceFolder?.override, resource, language);
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this._updateValue(key, value, configurationTarget, configurationValue.workspace?.override, resource, language);
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    return this._updateValue(key, value, configurationTarget, configurationValue.userRemote?.override, resource, language);
                default:
                    return this._updateValue(key, value, configurationTarget, configurationValue.userLocal?.override, resource, language);
            }
        }
        _updateValue(key, value, configurationTarget, overriddenValue, resource, language) {
            if (language && overriddenValue !== undefined) {
                return this.configurationService.updateValue(key, value, { resource, overrideIdentifier: language }, configurationTarget);
            }
            else {
                return this.configurationService.updateValue(key, value, { resource }, configurationTarget);
            }
        }
        deriveConfigurationTarget(configurationValue, language) {
            if (language) {
                if (configurationValue.memory?.override !== undefined) {
                    return 8 /* ConfigurationTarget.MEMORY */;
                }
                if (configurationValue.workspaceFolder?.override !== undefined) {
                    return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
                if (configurationValue.workspace?.override !== undefined) {
                    return 5 /* ConfigurationTarget.WORKSPACE */;
                }
                if (configurationValue.userRemote?.override !== undefined) {
                    return 4 /* ConfigurationTarget.USER_REMOTE */;
                }
                if (configurationValue.userLocal?.override !== undefined) {
                    return 3 /* ConfigurationTarget.USER_LOCAL */;
                }
            }
            if (configurationValue.memory?.value !== undefined) {
                return 8 /* ConfigurationTarget.MEMORY */;
            }
            if (configurationValue.workspaceFolder?.value !== undefined) {
                return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
            if (configurationValue.workspace?.value !== undefined) {
                return 5 /* ConfigurationTarget.WORKSPACE */;
            }
            if (configurationValue.userRemote?.value !== undefined) {
                return 4 /* ConfigurationTarget.USER_REMOTE */;
            }
            return 3 /* ConfigurationTarget.USER_LOCAL */;
        }
        _getValue(resource, position, section) {
            const language = resource ? this.getLanguage(resource, position) : undefined;
            if (typeof section === 'undefined') {
                return this.configurationService.getValue({ resource, overrideIdentifier: language });
            }
            return this.configurationService.getValue(section, { resource, overrideIdentifier: language });
        }
        inspect(resource, position, section) {
            const language = resource ? this.getLanguage(resource, position) : undefined;
            return this.configurationService.inspect(section, { resource, overrideIdentifier: language });
        }
        getLanguage(resource, position) {
            const model = this.modelService.getModel(resource);
            if (model) {
                return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
            }
            return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
        }
        toResourceConfigurationChangeEvent(configurationChangeEvent) {
            return {
                affectedKeys: configurationChangeEvent.affectedKeys,
                affectsConfiguration: (resource, configuration) => {
                    const overrideIdentifier = resource ? this.getLanguage(resource, null) : undefined;
                    return configurationChangeEvent.affectsConfiguration(configuration, { resource, overrideIdentifier });
                }
            };
        }
    };
    exports.TextResourceConfigurationService = TextResourceConfigurationService;
    exports.TextResourceConfigurationService = TextResourceConfigurationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService)
    ], TextResourceConfigurationService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlQ29uZmlndXJhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL3RleHRSZXNvdXJjZUNvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFpQyxTQUFRLHNCQUFVO1FBTy9ELFlBQ3dCLG9CQUE0RCxFQUNwRSxZQUE0QyxFQUN6QyxlQUFrRDtZQUVwRSxLQUFLLEVBQUUsQ0FBQztZQUpnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQU5wRCw4QkFBeUIsR0FBbUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUMsQ0FBQyxDQUFDO1lBQ2xKLDZCQUF3QixHQUFpRCxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDO1lBUTdILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUosQ0FBQztRQUlELFFBQVEsQ0FBSSxRQUF5QixFQUFFLElBQVUsRUFBRSxJQUFVO1lBQzVELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLG1CQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxD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