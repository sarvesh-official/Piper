"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    var _a;
    if (!((_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
