"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authController_1 = require("../controllers/authController");
const commentController_1 = require("../controllers/commentController");
class UserRoutes {
    constructor() {
        this._postController = new postController_1.PostController();
        this._authController = new authController_1.AuthController();
        this._commentController = new commentController_1.CommentController();
        this.router = express_1.Router();
        this.routes();
    }
    routes() {
        this.router.get('/all', this._postController.getAllPosts);
        this.router.get('/feed', this._authController.authentication, this._postController.getPostsByFeed);
        this.router.post('/', this._authController.authentication, this._postController.addNewPost);
        this.router.route('/:id')
            .get(this._postController.getOnePost)
            .put(this._authController.authentication, this._postController.updatePost)
            .delete(this._authController.authentication, this._postController.deletePost);
        this.router.post('/:id/favorite', this._authController.authentication, this._postController.addFavorited);
        this.router.delete('/:id/unfavorite', this._authController.authentication, this._postController.deleteFavorited);
        //CommentController
        this.router.route('/:id/comments')
            .get(this._commentController.getComments)
            .post(this._authController.authentication, this._commentController.addComment);
        this.router.delete('/:id/comments/:commentId', this._authController.authentication, this._commentController.deleteComment);
    }
}
exports.UserRoutes = UserRoutes;
const userRoutes = new UserRoutes();
userRoutes.routes();
exports.default = userRoutes.router;
//# sourceMappingURL=postRoutes.js.map