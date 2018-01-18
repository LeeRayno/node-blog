const config = require('config-lite')(__dirname)
const moment = require('moment')
const objectIdTimerstamp = require('objectid-to-timestamp')
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
// 链接数据库
mongolass.connect(config.mongodb)

// 根据 id 生成创建时间 created_at

mongolass.plugin('addCreatedAt', {
  afterFind(results) {
    results.forEach(function(item) {
      item.created_at = moment(objectIdTimerstamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne(result) {
    if (result) {
      result.created_at = moment(objectIdTimerstamp(result._id)).format('YYYY-MM-DD HH:mm')
    }
    return result
  }
})

// 定义用户 shecma
exports.User = mongolass.model('User', {
  name: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string',
    required: true
  },
  avatar: {
    type: 'string',
    required: true
  },
  gender: {
    type: 'string',
    enum: ['m', 'f', 'x'],
    default: 'x'
  },
  bio: {
    type: 'string',
    required: true
  }
})

// 根据用户名找到用户，用户名全局唯一
exports.User.index({
  name: 1
}, {
  unique: true
}).exec()

// 定义文章 schema
exports.Post = mongolass.model('Post', {
  author: {
    type: Mongolass.Types.ObjectId,
    required: true
  },
  title: {
    type: 'string',
    required: true
  },
  content: {
    type: 'string',
    required: true
  },
  pv: {
    type: 'number',
    default: 0
  }
})

// 按创建时间降序查看用户的文章列表
exports.Post.index({
  author: 1,
  _id: -1
}).exec()

// 留言 schema
exports.Comment = mongolass.model('Comment', {
  author: {
    type: Mongolass.Types.ObjectId,
    required: true
  },
  content: {
    type: 'string',
    required: true
  },
  postId: {
    type: Mongolass.Types.ObjectId,
    required: true
  }
})

// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({
  postId: 1,
  _id: 1
}).exec()
