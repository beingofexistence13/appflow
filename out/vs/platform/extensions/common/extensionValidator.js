/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/severity", "vs/nls", "vs/base/common/semver/semver"], function (require, exports, resources_1, severity_1, nls, semver) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEngineValid = exports.isValidExtensionVersion = exports.validateExtensionManifest = exports.isValidVersion = exports.normalizeVersion = exports.parseVersion = exports.isValidVersionStr = void 0;
    const VERSION_REGEXP = /^(\^|>=)?((\d+)|x)\.((\d+)|x)\.((\d+)|x)(\-.*)?$/;
    const NOT_BEFORE_REGEXP = /^-(\d{4})(\d{2})(\d{2})$/;
    function isValidVersionStr(version) {
        version = version.trim();
        return (version === '*' || VERSION_REGEXP.test(version));
    }
    exports.isValidVersionStr = isValidVersionStr;
    function parseVersion(version) {
        if (!isValidVersionStr(version)) {
            return null;
        }
        version = version.trim();
        if (version === '*') {
            return {
                hasCaret: false,
                hasGreaterEquals: false,
                majorBase: 0,
                majorMustEqual: false,
                minorBase: 0,
                minorMustEqual: false,
                patchBase: 0,
                patchMustEqual: false,
                preRelease: null
            };
        }
        const m = version.match(VERSION_REGEXP);
        if (!m) {
            return null;
        }
        return {
            hasCaret: m[1] === '^',
            hasGreaterEquals: m[1] === '>=',
            majorBase: m[2] === 'x' ? 0 : parseInt(m[2], 10),
            majorMustEqual: (m[2] === 'x' ? false : true),
            minorBase: m[4] === 'x' ? 0 : parseInt(m[4], 10),
            minorMustEqual: (m[4] === 'x' ? false : true),
            patchBase: m[6] === 'x' ? 0 : parseInt(m[6], 10),
            patchMustEqual: (m[6] === 'x' ? false : true),
            preRelease: m[8] || null
        };
    }
    exports.parseVersion = parseVersion;
    function normalizeVersion(version) {
        if (!version) {
            return null;
        }
        const majorBase = version.majorBase;
        const majorMustEqual = version.majorMustEqual;
        const minorBase = version.minorBase;
        let minorMustEqual = version.minorMustEqual;
        const patchBase = version.patchBase;
        let patchMustEqual = version.patchMustEqual;
        if (version.hasCaret) {
            if (majorBase === 0) {
                patchMustEqual = false;
            }
            else {
                minorMustEqual = false;
                patchMustEqual = false;
            }
        }
        let notBefore = 0;
        if (version.preRelease) {
            const match = NOT_BEFORE_REGEXP.exec(version.preRelease);
            if (match) {
                const [, year, month, day] = match;
                notBefore = Date.UTC(Number(year), Number(month) - 1, Number(day));
            }
        }
        return {
            majorBase: majorBase,
            majorMustEqual: majorMustEqual,
            minorBase: minorBase,
            minorMustEqual: minorMustEqual,
            patchBase: patchBase,
            patchMustEqual: patchMustEqual,
            isMinimum: version.hasGreaterEquals,
            notBefore,
        };
    }
    exports.normalizeVersion = normalizeVersion;
    function isValidVersion(_inputVersion, _inputDate, _desiredVersion) {
        let version;
        if (typeof _inputVersion === 'string') {
            version = normalizeVersion(parseVersion(_inputVersion));
        }
        else {
            version = _inputVersion;
        }
        let productTs;
        if (_inputDate instanceof Date) {
            productTs = _inputDate.getTime();
        }
        else if (typeof _inputDate === 'string') {
            productTs = new Date(_inputDate).getTime();
        }
        let desiredVersion;
        if (typeof _desiredVersion === 'string') {
            desiredVersion = normalizeVersion(parseVersion(_desiredVersion));
        }
        else {
            desiredVersion = _desiredVersion;
        }
        if (!version || !desiredVersion) {
            return false;
        }
        const majorBase = version.majorBase;
        const minorBase = version.minorBase;
        const patchBase = version.patchBase;
        let desiredMajorBase = desiredVersion.majorBase;
        let desiredMinorBase = desiredVersion.minorBase;
        let desiredPatchBase = desiredVersion.patchBase;
        const desiredNotBefore = desiredVersion.notBefore;
        let majorMustEqual = desiredVersion.majorMustEqual;
        let minorMustEqual = desiredVersion.minorMustEqual;
        let patchMustEqual = desiredVersion.patchMustEqual;
        if (desiredVersion.isMinimum) {
            if (majorBase > desiredMajorBase) {
                return true;
            }
            if (majorBase < desiredMajorBase) {
                return false;
            }
            if (minorBase > desiredMinorBase) {
                return true;
            }
            if (minorBase < desiredMinorBase) {
                return false;
            }
            if (productTs && productTs < desiredNotBefore) {
                return false;
            }
            return patchBase >= desiredPatchBase;
        }
        // Anything < 1.0.0 is compatible with >= 1.0.0, except exact matches
        if (majorBase === 1 && desiredMajorBase === 0 && (!majorMustEqual || !minorMustEqual || !patchMustEqual)) {
            desiredMajorBase = 1;
            desiredMinorBase = 0;
            desiredPatchBase = 0;
            majorMustEqual = true;
            minorMustEqual = false;
            patchMustEqual = false;
        }
        if (majorBase < desiredMajorBase) {
            // smaller major version
            return false;
        }
        if (majorBase > desiredMajorBase) {
            // higher major version
            return (!majorMustEqual);
        }
        // at this point, majorBase are equal
        if (minorBase < desiredMinorBase) {
            // smaller minor version
            return false;
        }
        if (minorBase > desiredMinorBase) {
            // higher minor version
            return (!minorMustEqual);
        }
        // at this point, minorBase are equal
        if (patchBase < desiredPatchBase) {
            // smaller patch version
            return false;
        }
        if (patchBase > desiredPatchBase) {
            // higher patch version
            return (!patchMustEqual);
        }
        // at this point, patchBase are equal
        if (productTs && productTs < desiredNotBefore) {
            return false;
        }
        return true;
    }
    exports.isValidVersion = isValidVersion;
    function validateExtensionManifest(productVersion, productDate, extensionLocation, extensionManifest, extensionIsBuiltin) {
        const validations = [];
        if (typeof extensionManifest.publisher !== 'undefined' && typeof extensionManifest.publisher !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.publisher', "property publisher must be of type `string`.")]);
            return validations;
        }
        if (typeof extensionManifest.name !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.name', "property `{0}` is mandatory and must be of type `string`", 'name')]);
            return validations;
        }
        if (typeof extensionManifest.version !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.version', "property `{0}` is mandatory and must be of type `string`", 'version')]);
            return validations;
        }
        if (!extensionManifest.engines) {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.engines', "property `{0}` is mandatory and must be of type `object`", 'engines')]);
            return validations;
        }
        if (typeof extensionManifest.engines.vscode !== 'string') {
            validations.push([severity_1.default.Error, nls.localize('extensionDescription.engines.vscode', "property `{0}` is mandatory and must be of type `string`", 'engines.vscode')]);
            return validations;
        }
        if (typeof extensionManifest.extensionDependencies !== 'undefined') {
            if (!isStringArray(extensionManifest.extensionDependencies)) {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.extensionDependencies', "property `{0}` can be omitted or must be of type `string[]`", 'extensionDependencies')]);
                return validations;
            }
        }
        if (typeof extensionManifest.activationEvents !== 'undefined') {
            if (!isStringArray(extensionManifest.activationEvents)) {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.activationEvents1', "property `{0}` can be omitted or must be of type `string[]`", 'activationEvents')]);
                return validations;
            }
            if (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.activationEvents2', "property `{0}` should be omitted if the extension doesn't have a `{1}` or `{2}` property.", 'activationEvents', 'main', 'browser')]);
                return validations;
            }
        }
        if (typeof extensionManifest.extensionKind !== 'undefined') {
            if (typeof extensionManifest.main === 'undefined') {
                validations.push([severity_1.default.Warning, nls.localize('extensionDescription.extensionKind', "property `{0}` can be defined only if property `main` is also defined.", 'extensionKind')]);
                // not a failure case
            }
        }
        if (typeof extensionManifest.main !== 'undefined') {
            if (typeof extensionManifest.main !== 'string') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.main1', "property `{0}` can be omitted or must be of type `string`", 'main')]);
                return validations;
            }
            else {
                const mainLocation = (0, resources_1.joinPath)(extensionLocation, extensionManifest.main);
                if (!(0, resources_1.isEqualOrParent)(mainLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize('extensionDescription.main2', "Expected `main` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.", mainLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (typeof extensionManifest.browser !== 'undefined') {
            if (typeof extensionManifest.browser !== 'string') {
                validations.push([severity_1.default.Error, nls.localize('extensionDescription.browser1', "property `{0}` can be omitted or must be of type `string`", 'browser')]);
                return validations;
            }
            else {
                const browserLocation = (0, resources_1.joinPath)(extensionLocation, extensionManifest.browser);
                if (!(0, resources_1.isEqualOrParent)(browserLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize('extensionDescription.browser2', "Expected `browser` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.", browserLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (!semver.valid(extensionManifest.version)) {
            validations.push([severity_1.default.Error, nls.localize('notSemver', "Extension version is not semver compatible.")]);
            return validations;
        }
        const notices = [];
        const isValid = isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices);
        if (!isValid) {
            for (const notice of notices) {
                validations.push([severity_1.default.Error, notice]);
            }
        }
        return validations;
    }
    exports.validateExtensionManifest = validateExtensionManifest;
    function isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices) {
        if (extensionIsBuiltin || (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined')) {
            // No version check for builtin or declarative extensions
            return true;
        }
        return isVersionValid(productVersion, productDate, extensionManifest.engines.vscode, notices);
    }
    exports.isValidExtensionVersion = isValidExtensionVersion;
    function isEngineValid(engine, version, date) {
        // TODO@joao: discuss with alex '*' doesn't seem to be a valid engine version
        return engine === '*' || isVersionValid(version, date, engine);
    }
    exports.isEngineValid = isEngineValid;
    function isVersionValid(currentVersion, date, requestedVersion, notices = []) {
        const desiredVersion = normalizeVersion(parseVersion(requestedVersion));
        if (!desiredVersion) {
            notices.push(nls.localize('versionSyntax', "Could not parse `engines.vscode` value {0}. Please use, for example: ^1.22.0, ^1.22.x, etc.", requestedVersion));
            return false;
        }
        // enforce that a breaking API version is specified.
        // for 0.X.Y, that means up to 0.X must be specified
        // otherwise for Z.X.Y, that means Z must be specified
        if (desiredVersion.majorBase === 0) {
            // force that major and minor must be specific
            if (!desiredVersion.majorMustEqual || !desiredVersion.minorMustEqual) {
                notices.push(nls.localize('versionSpecificity1', "Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions before 1.0.0, please define at a minimum the major and minor desired version. E.g. ^0.10.0, 0.10.x, 0.11.0, etc.", requestedVersion));
                return false;
            }
        }
        else {
            // force that major must be specific
            if (!desiredVersion.majorMustEqual) {
                notices.push(nls.localize('versionSpecificity2', "Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions after 1.0.0, please define at a minimum the major desired version. E.g. ^1.10.0, 1.10.x, 1.x.x, 2.x.x, etc.", requestedVersion));
                return false;
            }
        }
        if (!isValidVersion(currentVersion, date, desiredVersion)) {
            notices.push(nls.localize('versionMismatch', "Extension is not compatible with Code {0}. Extension requires: {1}.", currentVersion, requestedVersion));
            return false;
        }
        return true;
    }
    function isStringArray(arr) {
        if (!Array.isArray(arr)) {
            return false;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (typeof arr[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdDaEcsTUFBTSxjQUFjLEdBQUcsa0RBQWtELENBQUM7SUFDMUUsTUFBTSxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQztJQUVyRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFlO1FBQ2hELE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsT0FBTyxDQUFDLE9BQU8sS0FBSyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFIRCw4Q0FHQztJQUVELFNBQWdCLFlBQVksQ0FBQyxPQUFlO1FBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNoQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6QixJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7WUFDcEIsT0FBTztnQkFDTixRQUFRLEVBQUUsS0FBSztnQkFDZixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixTQUFTLEVBQUUsQ0FBQztnQkFDWixjQUFjLEVBQUUsS0FBSztnQkFDckIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLFNBQVMsRUFBRSxDQUFDO2dCQUNaLGNBQWMsRUFBRSxLQUFLO2dCQUNyQixVQUFVLEVBQUUsSUFBSTthQUNoQixDQUFDO1NBQ0Y7UUFFRCxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxDQUFDLEVB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