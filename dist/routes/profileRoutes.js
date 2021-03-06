"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const authController_1 = require("../controllers/authController");
class ProfileRoutes {
    constructor() {
        this._profileController = new profileController_1.ProfileController();
        this._authController = new authController_1.AuthController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.get('/:username/', this._profileController.getProfile);
        this.router.get('/:username/followers', this._profileController.getFollowers);
        this.router.get('/:username/following', this._profileController.getFollowing);
        this.router.post('/:username/follow', this._authController.authentication, this._profileController.follow);
        this.router.delete('/:username/unfollow', this._authController.authentication, this._profileController.unfollow);
    }
}
exports.ProfileRoutes = ProfileRoutes;
const profileRoutes = new ProfileRoutes();
profileRoutes.routes();
exports.default = profileRoutes.router;
//# sourceMappingURL=profileRoutes.js.map