/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/base/common/severity", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, extHost_protocol_1, typeConvert, extHostTypes_1, severity_1, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostLanguages = void 0;
    class ExtHostLanguages {
        constructor(mainContext, _documents, _commands, _uriTransformer) {
            this._documents = _documents;
            this._commands = _commands;
            this._uriTransformer = _uriTransformer;
            this._languageIds = [];
            this._handlePool = 0;
            this._ids = new Set();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadLanguages);
        }
        $acceptLanguageIds(ids) {
            this._languageIds = ids;
        }
        async getLanguages() {
            return this._languageIds.slice(0);
        }
        async changeLanguage(uri, languageId) {
            await this._proxy.$changeLanguage(uri, languageId);
            const data = this._documents.getDocumentData(uri);
            if (!data) {
                throw new Error(`document '${uri.toString()}' NOT found`);
            }
            return data.document;
        }
        async tokenAtPosition(document, position) {
            const versionNow = document.version;
            const pos = typeConvert.Position.from(position);
            const info = await this._proxy.$tokensAtPosition(document.uri, pos);
            const defaultRange = {
                type: extHostTypes_1.StandardTokenType.Other,
                range: document.getWordRangeAtPosition(position) ?? new extHostTypes_1.Range(position.line, position.character, position.line, position.character)
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
            const handle = this._handlePool++;
            const proxy = this._proxy;
            const ids = this._ids;
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
            const commandDisposables = new lifecycle_1.DisposableStore();
            const updateAsync = () => {
                soonHandle?.dispose();
                if (!ids.has(fullyQualifiedId)) {
                    console.warn(`LanguageStatusItem (${id}) from ${extension.identifier.value} has been disposed and CANNOT be updated anymore`);
                    return; // disposed in the meantime
                }
                soonHandle = (0, async_1.disposableTimeout)(() => {
                    commandDisposables.clear();
                    this._proxy.$setLanguageStatus(handle, {
                        id: fullyQualifiedId,
                        name: data.name ?? extension.displayName ?? extension.name,
                        source: extension.displayName ?? extension.name,
                        selector: typeConvert.DocumentSelector.from(data.selector, this._uriTransformer),
                        label: data.text,
                        detail: data.detail ?? '',
                        severity: data.severity === extHostTypes_1.LanguageStatusSeverity.Error ? severity_1.default.Error : data.severity === extHostTypes_1.LanguageStatusSeverity.Warning ? severity_1.default.Warning : severity_1.default.Info,
                        command: data.command && this._commands.toInternal(data.command, commandDisposables),
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
    exports.ExtHostLanguages = ExtHostLanguages;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdExhbmd1YWdlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RMYW5ndWFnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsZ0JBQWdCO1FBTTVCLFlBQ0MsV0FBeUIsRUFDUixVQUE0QixFQUM1QixTQUE0QixFQUM1QixlQUE0QztZQUY1QyxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUM1QixjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUM1QixvQkFBZSxHQUFmLGVBQWUsQ0FBNkI7WUFOdEQsaUJBQVksR0FBYSxFQUFFLENBQUM7WUF1RDVCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1lBQ3hCLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBaERoQyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxHQUFhO1lBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWTtZQUNqQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWUsRUFBRSxVQUFrQjtZQUN2RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFB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