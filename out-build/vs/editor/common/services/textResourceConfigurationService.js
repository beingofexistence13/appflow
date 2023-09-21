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
    exports.$NBb = void 0;
    let $NBb = class $NBb extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.a.event;
            this.B(this.b.onDidChangeConfiguration(e => this.a.fire(this.n(e))));
        }
        getValue(resource, arg2, arg3) {
            if (typeof arg3 === 'string') {
                return this.j(resource, position_1.$js.isIPosition(arg2) ? arg2 : null, arg3);
            }
            return this.j(resource, null, typeof arg2 === 'string' ? arg2 : undefined);
        }
        updateValue(resource, key, value, configurationTarget) {
            const language = this.m(resource, null);
            const configurationValue = this.b.inspect(key, { resource, overrideIdentifier: language });
            if (configurationTarget === undefined) {
                configurationTarget = this.h(configurationValue, language);
            }
            switch (configurationTarget) {
                case 8 /* ConfigurationTarget.MEMORY */:
                    return this.g(key, value, configurationTarget, configurationValue.memory?.override, resource, language);
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    return this.g(key, value, configurationTarget, configurationValue.workspaceFolder?.override, resource, language);
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this.g(key, value, configurationTarget, configurationValue.workspace?.override, resource, language);
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    return this.g(key, value, configurationTarget, configurationValue.userRemote?.override, resource, language);
                default:
                    return this.g(key, value, configurationTarget, configurationValue.userLocal?.override, resource, language);
            }
        }
        g(key, value, configurationTarget, overriddenValue, resource, language) {
            if (language && overriddenValue !== undefined) {
                return this.b.updateValue(key, value, { resource, overrideIdentifier: language }, configurationTarget);
            }
            else {
                return this.b.updateValue(key, value, { resource }, configurationTarget);
            }
        }
        h(configurationValue, language) {
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
        j(resource, position, section) {
            const language = resource ? this.m(resource, position) : undefined;
            if (typeof section === 'undefined') {
                return this.b.getValue({ resource, overrideIdentifier: language });
            }
            return this.b.getValue(section, { resource, overrideIdentifier: language });
        }
        inspect(resource, position, section) {
            const language = resource ? this.m(resource, position) : undefined;
            return this.b.inspect(section, { resource, overrideIdentifier: language });
        }
        m(resource, position) {
            const model = this.c.getModel(resource);
            if (model) {
                return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
            }
            return this.f.guessLanguageIdByFilepathOrFirstLine(resource);
        }
        n(configurationChangeEvent) {
            return {
                affectedKeys: configurationChangeEvent.affectedKeys,
                affectsConfiguration: (resource, configuration) => {
                    const overrideIdentifier = resource ? this.m(resource, null) : undefined;
                    return configurationChangeEvent.affectsConfiguration(configuration, { resource, overrideIdentifier });
                }
            };
        }
    };
    exports.$NBb = $NBb;
    exports.$NBb = $NBb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct)
    ], $NBb);
});
//# sourceMappingURL=textResourceConfigurationService.js.map