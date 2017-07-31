(function (hashUtil) {
    var crypto = require("crypto");

    hashUtil.createSalt = function () {
        var len = 10;
        return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").substring(0, len);
    };

    hashUtil.computeHash = function (source, salt) {
        var hmac = crypto.createHmac("sha1", salt);
        var hash = hmac.update(source);
        return hash.digest("hex");
    };
})(module.exports);