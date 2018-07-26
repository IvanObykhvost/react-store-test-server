const constants = require('../constants');
const mongoose = require('mongoose');
const CommentRepository = require('./commentRepository');
const TagRepository = require('./tagRepository');


const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    topic: {type: String, required: true},
    message: {type: String, required: true},
    favorited: {type: Boolean, default: false},
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    favouritesCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    // tags: [{ type: String, default: "" }],
    tags:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tags'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }]
},
{
    versionKey: false
});

PostSchema.pre('find', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});

PostSchema.pre('findOne', function() {
    this.populate('author');
    this.populate('favorites');
    this.populate('comments');
    this.populate('tags');
});

PostSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {updatedAt: new Date()});
    next();
});

PostSchema.pre('save', function(next) {
    this.populate('author').execPopulate();

    next();
});

PostSchema.pre('remove', function(next) {
    let commentsId = this.comments.map(comment => comment.id);
    let tagsId = this.tags.map(tag => tag.id);
    return CommentRepository.removeComments({_id: {$in : commentsId}})
        .then(
            () => {
                if(tagsId.length !== 0)
                    return TagRepository.deleleRefPostByParams({_id: {$in: tagsId}}, this.id)
            },
            error => Promise.reject(error)
        )
        .then(
            () => next(),
            error => Promise.reject(error)
        )
});

const PostRepository = mongoose.model('posts', PostSchema);

/**
* Use by looking for Posts
* @method  getPostsByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @return {Array[Objects]} posts or error
*/
PostRepository.getPostsByParams = (findParams) => {
    return PostRepository.find(findParams, null, {sort: '-createdAt'})
        .then(posts => {
            if(posts.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_POSTS);
            if(posts.errors) return Promise.reject(posts.errors);
            return posts;
        });
}

PostRepository.getPostsPaginationByParams = (findParams, aggregate) => {
    let request = PostRepository
        .find(findParams)
        .sort('-createdAt')
        .skip(Number(aggregate.offset))
        .limit(Number(aggregate.limit))
        .exec();

    return request
        .then(posts => {
            if(posts.length === 0) return Promise.reject(constants.ERRORS.NO_FOUND_POSTS);
            if(posts.errors) return Promise.reject(posts.errors);
            return posts;
        })
}
 /**
* Use by looking for Post
* @method  getOnePostByParams
* @param {Object} findParams object by find {name : 'Jack'}.
* @returns {Object} post or error
*/
PostRepository.getOnePostByParams = (findParams) => {
    return PostRepository.findOne(findParams)
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST)
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.updateOnePostByParams = (findParams, post) => {
    return PostRepository.findOneAndUpdate(findParams, post, {new: true})
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.saveOnePost = (post) => {
    return post.save()
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

PostRepository.removeOnePost = (post) => {
    return post.remove()
        .then(post => {
            if(!post) return Promise.reject(constants.ERRORS.NO_FOUND_POST);
            if(post.errors) return Promise.reject(post.errors);
            return post;
        });
}

module.exports = PostRepository;