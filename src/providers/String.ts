/// <amd-module name="VSS/Core/Util/String" />
function prepareForComparison(value: string, upperCase: boolean): string {
    return value ? (upperCase ? value.toLocaleUpperCase() : value) : "";
}

function comparer(a: string, b: string, ignoreCase: boolean): number {
    // Optimization: if the strings are equal no need to convert and perform a locale compare.
    if (a === b) {
        return 0;
    }

    return prepareForComparison(a, ignoreCase).localeCompare(prepareForComparison(b, ignoreCase));
}

/**
 * String comparer (to use for sorting) which is case-sensitive
 *
 * @param a First string to compare
 * @param b Second string to compare
 */
export function localeComparer(a: string, b: string): number {
    return comparer(a, b, false);
}

/**
 * String comparer (to use for sorting) which is case-insensitive
 *
 * @param a First string to compare
 * @param b Second string to compare
 */
export function localeIgnoreCaseComparer(a: string, b: string): number {
    return comparer(a, b, true);
}

/**
 * Compares 2 strings for equality.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @param ignoreCase If true, do a case-insensitive comparison.
 */
export function equals(a: string, b: string, ignoreCase?: boolean): boolean {
    if (ignoreCase) {
        return localeIgnoreCaseComparer(a, b) === 0;
    } else {
        return localeComparer(a, b) === 0;
    }
}

/**
 * Checks whether the given string starts with the specified prefix.
 *
 * @param str String to check
 * @param prefix Substring that the {str} argument must start with in order to return true
 * @param ignoreCase If true, do a case insensitive comparison
 */
export function startsWith(str: string, prefix: string, ignoreCase?: boolean): boolean {
    const comparer = ignoreCase ? localeIgnoreCaseComparer : localeComparer;
    return comparer(prefix, str.substr(0, prefix.length)) === 0;
}

/**
 * Checks whether the given string ends with the specified suffix.
 *
 * @param str String to check
 * @param suffix Substring that the {str} argument must end with in order to return true
 * @param ignoreCase If true, do a case insensitive comparison
 */
export function endsWith(str: string, suffix: string, ignoreCase?: boolean): boolean {
    const comparer = ignoreCase ? localeIgnoreCaseComparer : localeComparer;
    return comparer(suffix, str.substr(str.length - suffix.length, suffix.length)) === 0;
}

/**
 * Performs a case-insensitive contains operation
 *
 * @param str String to check if it contains {subStr}
 * @param subStr The string that the {str} argument must contain in order to return true
 */
export function caseInsensitiveContains(str: string, subStr: string): boolean {
    return str.toLocaleLowerCase().indexOf(subStr.toLocaleLowerCase()) !== -1;
}

/**
 * Generate a string using a format string and arguments.
 *
 * @param format Format string
 * @param args Arguments to use as replacements
 */
export function format(format: string, ...args: any[]): string {
    return _stringFormat(false, format, args);
}

/**
 * Generate a string using a format string and arguments, using locale-aware argument replacements.
 *
 * @param format Format string
 * @param args Arguments to use as replacements
 */
export function localeFormat(format: string, ...args: any[]): string {
    return _stringFormat(true, format, args);
}

function _stringFormat(useLocale: boolean, format: string, args: any[]): string {
    let result = "";
    for (let i = 0; ; ) {
        const open = format.indexOf("{", i);
        const close = format.indexOf("}", i);
        if (open < 0 && close < 0) {
            result += format.slice(i);
            break;
        }

        if (close > 0 && (close < open || open < 0)) {
            if (format.charAt(close + 1) !== "}") {
                throw new Error("The format string contains an unmatched opening or closing brace.");
            }
            result += format.slice(i, close + 1);
            i = close + 2;
            continue;
        }

        result += format.slice(i, open);
        i = open + 1;
        if (format.charAt(i) === "{") {
            result += "{";
            i++;
            continue;
        }

        if (close < 0) {
            throw new Error("The format string contains an unmatched opening or closing brace.");
        }

        const brace = format.substring(i, close);
        const colonIndex = brace.indexOf(":");
        const argNumber = parseInt(colonIndex < 0 ? brace : brace.substring(0, colonIndex), 10);

        if (isNaN(argNumber)) {
            throw new Error("The format string is invalid.");
        }

        const argFormat = colonIndex < 0 ? "" : brace.substring(colonIndex + 1);
        let arg = args[argNumber];
        if (typeof arg === "undefined" || arg === null) {
            arg = "";
        }
        if (arg.toFormattedString) {
            result += arg.toFormattedString(argFormat);
        } else if (arg instanceof Date) {
            result += dateToString(arg, useLocale);
        } else if (arg.format) {
            result += arg.format(argFormat);
        } else {
            result += arg.toString();
        }

        i = close + 1;
    }
    return result;
}

const localeFormatters: { [key: string]: Intl.DateTimeFormat } = ("Intl" in window) ? {
    date: new Intl.DateTimeFormat(),
    dateTime: new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    })
} : {};

/**
 * Converts a date to a string, optionally using the locale formatter
 *
 * @param value date to convert to a string
 * @param useLocale use the locale formatter when converting to a string
 */
export function dateToString(value: Date, useLocale?: boolean | string): string {
    const localeKey = typeof useLocale === "string" ? useLocale : "dateTime";
    if (useLocale) {
        let formatter = localeFormatters[localeKey];
        if (!formatter) {
            formatter = localeFormatters["dateTime"];
        }
        return formatter.format(value);
    } else {
        return value.toString();
    }
}

/**
 * String representation of the empty guid
 */
export const EmptyGuidString = "00000000-0000-0000-0000-000000000000";

/**
 * Is the given string in the format of a GUID
 *
 * @param str String to check
 */
export function isGuid(str: string): boolean {
    return /^\{?([\dA-F]{8})-?([\dA-F]{4})-?([\dA-F]{4})-?([\dA-F]{4})-?([\dA-F]{12})\}?$/i.test(str);
}

/**
 * Returns a GUID such as xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx.
 * @return New GUID.(UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * @notes Disclaimer: This implementation uses non-cryptographic random number generator so absolute uniqueness is not guarantee.
 */
export function newGuid(): string {
    // c.f. rfc4122 (UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    // "Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively"
    const clockSequenceHi = (128 + Math.floor(Math.random() * 64)).toString(16);
    return oct(8) + "-" + oct(4) + "-4" + oct(3) + "-" + clockSequenceHi + oct(2) + "-" + oct(12);
}

/**
 * Generated non-zero octet sequences for use with GUID generation.
 *
 * @param length Length required.
 * @return Non-Zero hex sequences.
 */
function oct(length: number): string {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 0x10).toString(16);
    }

    return result;
}
