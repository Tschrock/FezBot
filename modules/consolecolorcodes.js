'use strict';

var ConsoleColorCodes = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};
var hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
var ColorValues = {
    Black: hexToRgb("#000000"),
    Red: hexToRgb("#ff0000"),
    Green: hexToRgb("#00ff00"),
    Yellow: hexToRgb("#FFFF00"),
    Blue: hexToRgb("#0000ff"),
    Magenta: hexToRgb("#FF00FF"),
    Cyan: hexToRgb("#00FFFF"),
    White: hexToRgb("#ffffff")
};
var getDistance = function (r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
            Math.pow((r1 - r2), 2)
            + Math.pow((g1 - g2), 2)
            + Math.pow((b1 - b2), 2)
            );
};
var getClosest = function (hex) {
    var startRGB = hexToRgb(hex);

    var closesetVal = 255;
    var closestColor = false;

    for (var colorName in ColorValues) {
        var val, color = ColorValues[colorName];
        if ((val = getDistance(startRGB.r, startRGB.g, startRGB.b, color.r, color.g, color.b)) < closesetVal) {
            closesetVal = val;
            closestColor = colorName;
        }
    }
    return closestColor;
};

module.exports = {
    ConsoleColorCodes: ConsoleColorCodes,
    hexToRgb: hexToRgb,
    ColorValues: ColorValues,
    getDistance: getDistance,
    getClosest: getClosest
};