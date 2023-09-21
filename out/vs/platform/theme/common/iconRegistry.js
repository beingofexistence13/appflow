/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, async_1, codicons_1, themables_1, event_1, types_1, uri_1, nls_1, jsonContributionRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.spinningLoading = exports.syncing = exports.gotoNextLocation = exports.gotoPreviousLocation = exports.widgetClose = exports.iconsSchemaId = exports.getIconRegistry = exports.registerIcon = exports.IconFontDefinition = exports.IconContribution = exports.Extensions = void 0;
    //  ------ API types
    // icon registry
    exports.Extensions = {
        IconContribution: 'base.contributions.icons'
    };
    var IconContribution;
    (function (IconContribution) {
        function getDefinition(contribution, registry) {
            let definition = contribution.defaults;
            while (themables_1.ThemeIcon.isThemeIcon(definition)) {
                const c = iconRegistry.getIcon(definition.id);
                if (!c) {
                    return undefined;
                }
                definition = c.defaults;
            }
            return definition;
        }
        IconContribution.getDefinition = getDefinition;
    })(IconContribution || (exports.IconContribution = IconContribution = {}));
    var IconFontDefinition;
    (function (IconFontDefinition) {
        function toJSONObject(iconFont) {
            return {
                weight: iconFont.weight,
                style: iconFont.style,
                src: iconFont.src.map(s => ({ format: s.format, location: s.location.toString() }))
            };
        }
        IconFontDefinition.toJSONObject = toJSONObject;
        function fromJSONObject(json) {
            const stringOrUndef = (s) => (0, types_1.isString)(s) ? s : undefined;
            if (json && Array.isArray(json.src) && json.src.every((s) => (0, types_1.isString)(s.format) && (0, types_1.isString)(s.location))) {
                return {
                    weight: stringOrUndef(json.weight),
                    style: stringOrUndef(json.style),
                    src: json.src.map((s) => ({ format: s.format, location: uri_1.URI.parse(s.location) }))
                };
            }
            return undefined;
        }
        IconFontDefinition.fromJSONObject = fromJSONObject;
    })(IconFontDefinition || (exports.IconFontDefinition = IconFontDefinition = {}));
    class IconRegistry {
        constructor() {
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.iconSchema = {
                definitions: {
                    icons: {
                        type: 'object',
                        properties: {
                            fontId: { type: 'string', description: (0, nls_1.localize)('iconDefinition.fontId', 'The id of the font to use. If not set, the font that is defined first is used.') },
                            fontCharacter: { type: 'string', description: (0, nls_1.localize)('iconDefinition.fontCharacter', 'The font character associated with the icon definition.') }
                        },
                        additionalProperties: false,
                        defaultSnippets: [{ body: { fontCharacter: '\\\\e030' } }]
                    }
                },
                type: 'object',
                properties: {}
            };
            this.iconReferenceSchema = { type: 'string', pattern: `^${themables_1.ThemeIcon.iconNameExpression}$`, enum: [], enumDescriptions: [] };
            this.iconsById = {};
            this.iconFontsById = {};
        }
        registerIcon(id, defaults, description, deprecationMessage) {
            const existing = this.iconsById[id];
            if (existing) {
                if (description && !existing.description) {
                    existing.description = description;
                    this.iconSchema.properties[id].markdownDescription = `${description} $(${id})`;
                    const enumIndex = this.iconReferenceSchema.enum.indexOf(id);
                    if (enumIndex !== -1) {
                        this.iconReferenceSchema.enumDescriptions[enumIndex] = description;
                    }
                    this._onDidChange.fire();
                }
                return existing;
            }
            const iconContribution = { id, description, defaults, deprecationMessage };
            this.iconsById[id] = iconContribution;
            const propertySchema = { $ref: '#/definitions/icons' };
            if (deprecationMessage) {
                propertySchema.deprecationMessage = deprecationMessage;
            }
            if (description) {
                propertySchema.markdownDescription = `${description}: $(${id})`;
            }
            this.iconSchema.properties[id] = propertySchema;
            this.iconReferenceSchema.enum.push(id);
            this.iconReferenceSchema.enumDescriptions.push(description || '');
            this._onDidChange.fire();
            return { id };
        }
        deregisterIcon(id) {
            delete this.iconsById[id];
            delete this.iconSchema.properties[id];
            const index = this.iconReferenceSchema.enum.indexOf(id);
            if (index !== -1) {
                this.iconReferenceSchema.enum.splice(index, 1);
                this.iconReferenceSchema.enumDescriptions.splice(index, 1);
            }
            this._onDidChange.fire();
        }
        getIcons() {
            return Object.keys(this.iconsById).map(id => this.iconsById[id]);
        }
        getIcon(id) {
            return this.iconsById[id];
        }
        getIconSchema() {
            return this.iconSchema;
        }
        getIconReferenceSchema() {
            return this.iconReferenceSchema;
        }
        registerIconFont(id, definition) {
            const existing = this.iconFontsById[id];
            if (existing) {
                return existing;
            }
            this.iconFontsById[id] = definition;
            this._onDidChange.fire();
            return definition;
        }
        deregisterIconFont(id) {
            delete this.iconFontsById[id];
        }
        getIconFont(id) {
            return this.iconFontsById[id];
        }
        toString() {
            const sorter = (i1, i2) => {
                return i1.id.localeCompare(i2.id);
            };
            const classNames = (i) => {
                while (themables_1.ThemeIcon.isThemeIcon(i.defaults)) {
                    i = this.iconsById[i.defaults.id];
                }
                return `codicon codicon-${i ? i.id : ''}`;
            };
            const reference = [];
            reference.push(`| preview     | identifier                        | default codicon ID                | description`);
            reference.push(`| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`);
            const contributions = Object.keys(this.iconsById).map(key => this.iconsById[key]);
            for (const i of contributions.filter(i => !!i.description).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|${themables_1.ThemeIcon.isThemeIcon(i.defaults) ? i.defaults.id : i.id}|${i.description || ''}|`);
            }
            reference.push(`| preview     | identifier                        `);
            reference.push(`| ----------- | --------------------------------- |`);
            for (const i of contributions.filter(i => !themables_1.ThemeIcon.isThemeIcon(i.defaults)).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|`);
            }
            return reference.join('\n');
        }
    }
    const iconRegistry = new IconRegistry();
    platform.Registry.add(exports.Extensions.IconContribution, iconRegistry);
    function registerIcon(id, defaults, description, deprecationMessage) {
        return iconRegistry.registerIcon(id, defaults, description, deprecationMessage);
    }
    exports.registerIcon = registerIcon;
    function getIconRegistry() {
        return iconRegistry;
    }
    exports.getIconRegistry = getIconRegistry;
    function initialize() {
        const codiconFontCharacters = (0, codicons_1.getCodiconFontCharacters)();
        for (const icon in codiconFontCharacters) {
            const fontCharacter = '\\' + codiconFontCharacters[icon].toString(16);
            iconRegistry.registerIcon(icon, { fontCharacter });
        }
    }
    initialize();
    exports.iconsSchemaId = 'vscode://schemas/icons';
    const schemaRegistry = platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(exports.iconsSchemaId, iconRegistry.getIconSchema());
    const delayer = new async_1.RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(exports.iconsSchemaId), 200);
    iconRegistry.onDidChange(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
    //setTimeout(_ => console.log(iconRegistry.toString()), 5000);
    // common icons
    exports.widgetClose = registerIcon('widget-close', codicons_1.Codicon.close, (0, nls_1.localize)('widgetClose', 'Icon for the close action in widgets.'));
    exports.gotoPreviousLocation = registerIcon('goto-previous-location', codicons_1.Codicon.arrowUp, (0, nls_1.localize)('previousChangeIcon', 'Icon for goto previous editor location.'));
    exports.gotoNextLocation = registerIcon('goto-next-location', codicons_1.Codicon.arrowDown, (0, nls_1.localize)('nextChangeIcon', 'Icon for goto next editor location.'));
    exports.syncing = themables_1.ThemeIcon.modify(codicons_1.Codicon.sync, 'spin');
    exports.spinningLoading = themables_1.ThemeIcon.modify(codicons_1.Codicon.loading, 'spin');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvblJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGhlbWUvY29tbW9uL2ljb25SZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsb0JBQW9CO0lBR3BCLGdCQUFnQjtJQUNILFFBQUEsVUFBVSxHQUFHO1FBQ3pCLGdCQUFnQixFQUFFLDBCQUEwQjtLQUM1QyxDQUFDO0lBaUJGLElBQWlCLGdCQUFnQixDQVloQztJQVpELFdBQWlCLGdCQUFnQjtRQUNoQyxTQUFnQixhQUFhLENBQUMsWUFBOEIsRUFBRSxRQUF1QjtZQUNwRixJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLE9BQU8scUJBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUNQLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtnQkFDRCxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUN4QjtZQUNELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFWZSw4QkFBYSxnQkFVNUIsQ0FBQTtJQUNGLENBQUMsRUFaZ0IsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFZaEM7SUFhRCxJQUFpQixrQkFBa0IsQ0FtQmxDO0lBbkJELFdBQWlCLGtCQUFrQjtRQUNsQyxTQUFnQixZQUFZLENBQUMsUUFBNEI7WUFDeEQsT0FBTztnQkFDTixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07Z0JBQ3ZCLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztnQkFDckIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFF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