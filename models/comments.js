
const marked = require('marked')
const Comment = require('../lib/mongo').Comment

// 将 comment 的 content 从 markdown 转换成 html
Comment.plugin('contentToHtml', {
  afterFind(comments) {
    return comments.map(function(comment) {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
  // 创建一条留言
  create(comment) {
    return Comment.create(comment).exec()
  },
  // 通过留言 id 获取一个留言
  getCommentById(commentId) {
    return Comment.findOne({
      _id: commentId
    }).exec()
  },
  // 通过留言 id 删除一个留言
  delCommentById(commentId) {
    return Comment.remove({
      _id: commentId
    }).exec()
  },
  // 通过文章 id 删除该文章下所有留言
  delCommentsByPostId(postId) {
    return Comment.remove({
      postId: postId
    }).exec()
  },
  // 通过文章 id 获取该文章下所有的留言，按留言创建时间升序
  getComments(postId) {
    return Comment
      .find({
        postId: postId
      })
      .populate({
        path: 'author',
        model: 'User'
      })
      .sort({
        _id: 1
      })
      .addCreatedAt()
      .exec()
  },
  // 通过文章 id 获取该文章下留言数
  getCommentsCount(postId) {
    return Comment.count({
      postId: postId
    }).exec()
  }
}
