/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/base/common/severity", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, extHost_protocol_1, typeConvert, extHostTypes_1, severity_1, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Wbc = void 0;
    class $Wbc {
        constructor(mainContext, c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.b = [];
            this.f = 0;
            this.g = new Set();
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadLanguages);
        }
        $acceptLanguageIds(ids) {
            this.b = ids;
        }
        async getLanguages() {
            return this.b.slice(0);
        }
        async changeLanguage(uri, languageId) {
            await this.a.$changeLanguage(uri, languageId);
            const data = this.c.getDocumentData(uri);
            if (!data) {
                throw new Error(`document '${uri.toString()}' NOT found`);
            }
            return data.document;
        }
        async tokenAtPosition(document, position) {
            const versionNow = document.version;
            const pos = typeConvert.Position.from(position);
            const info = await this.a.$tokensAtPosition(document.uri, pos);
            const defaultRange = {
                type: extHostTypes_1.StandardTokenType.Other,
                range: document.getWordRangeAtPosition(position) ?? new extHostTypes_1.$5J(position.line, position.character, position.line, position.character)
            };
            if (!info) {
                // no result
                return defaultRange;
            }
            const result = {
                range: typeConvert.Range.to(info.range),
                type: typeConvert.TokenType.to(info.type)
            };
            if (!result.range.contains(position)) {
                // bogous result
                return defaultRange;
            }
            if (versionNow !== document.version) {
                // concurrent change
                return defaultRange;
            }
            return result;
        }
        createLanguageStatusItem(extension, id, selector) {
            const handle = this.f++;
            const proxy = this.a;
            const ids = this.g;
            // enforce extension unique identifier
            const fullyQualifiedId = `${extension.identifier.value}/${id}`;
            if (ids.has(fullyQualifiedId)) {
                throw new Error(`LanguageStatusItem with id '${id}' ALREADY exists`);
            }
            ids.add(fullyQualifiedId);
            const data = {
                selector,
                id,
                name: extension.displayName ?? extension.name,
                severity: extHostTypes_1.LanguageStatusSeverity.Information,
                command: undefined,
                text: '',
                detail: '',
                busy: false
            };
            let soonHandle;
            const commandDisposables = new lifecycle_1.$jc();
            const updateAsync = () => {
                soonHandle?.dispose();
                if (!ids.has(fullyQualifiedId)) {
                    console.warn(`LanguageStatusItem (${id}) from ${extension.identifier.value} has been disposed and CANNOT be updated anymore`);
                    return; // disposed in the meantime
                }
                soonHandle = (0, async_1.$Ig)(() => {
                    commandDisposables.clear();
                    this.a.$setLanguageStatus(handle, {
                        id: fullyQualifiedId,
                        name: data.name ?? extension.displayName ?? extension.name,
                        source: extension.displayName ?? extension.name,
                        selector: typeConvert.DocumentSelector.from(data.selector, this.e),
                        label: data.text,
                        detail: data.detail ?? '',
                        severity: data.severity === extHostTypes_1.LanguageStatusSeverity.Error ? severity_1.default.Error : data.severity === extHostTypes_1.LanguageStatusSeverity.Warning ? severity_1.default.Warning : severity_1.default.Info,
                        command: data.command && this.d.toInternal(data.command, commandDisposables),
                        accessibilityInfo: data.accessibilityInformation,
                        busy: data.busy
                    });
                }, 0);
            };
            const result = {
                dispose() {
                    commandDisposables.dispose();
                    soonHandle?.dispose();
                    proxy.$removeLanguageStatus(handle);
                    ids.delete(fullyQualifiedId);
                },
                get id() {
                    return data.id;
                },
                get name() {
                    return data.name;
                },
                set name(value) {
                    data.name = value;
                    updateAsync();
                },
                get selector() {
                    return data.selector;
                },
                set selector(value) {
                    data.selector = value;
                    updateAsync();
                },
                get text() {
                    return data.text;
                },
                set text(value) {
                    data.text = value;
                    updateAsync();
                },
                get detail() {
                    return data.detail;
                },
                set detail(value) {
                    data.detail = value;
                    updateAsync();
                },
                get severity() {
                    return data.severity;
                },
                set severity(value) {
                    data.severity = value;
                    updateAsync();
                },
                get accessibilityInformation() {
                    return data.accessibilityInformation;
                },
                set accessibilityInformation(value) {
                    data.accessibilityInformation = value;
                    updateAsync();
                },
                get command() {
                    return data.command;
                },
                set command(value) {
                    data.command = value;
                    updateAsync();
                },
                get busy() {
                    return data.busy;
                },
                set busy(value) {
                    data.busy = value;
                    updateAsync();
                }
            };
            updateAsync();
            return result;
        }
    }
    exports.$Wbc = $Wbc;
});
//# sourceMappingURL=extHostLanguages.js.map