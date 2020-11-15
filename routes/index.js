let express = require('express');
let router = express.Router();
let admin = require('./admin/adminRouter')
let file = require('./admin/fileRouter')
let article = require('./admin/articleRouter')
let user = require('./user/userRouter')
let note = require('./note/noteRouter')
let message = require('./message/messageAndReply')

/* 管理员登录 */
router.post('/admin/login', admin.adminLogin);

/* 验证管理员是否登录 */
router.get('/admin/adminIsLogined', admin.adminIsLogined);

/* 退出管理系统 */
router.get('/admin/exit', admin.adminExit);

/* 上传封面图片 */
router.post('/upload', file.upload.single('images'),file.uploadCallBack);

/* 上传文章图片 */
router.post('/articleImages', file.upload.single('articleImages'),file.uploadCallBack);
/* 上传文章图片 */
router.post('/toolImages', file.upload.single('toolImages'),file.uploadCallBack);

/* 上传头像 */
router.post('/userAvatar', file.upload.single('avator'),file.uploadAvatarCallBack);

/* 上传视频 */
router.post('/demoVideo', file.upload.single('video'),file.uploadVideoCallBack);

/* 删除图片 */
router.post('/removeFile', file.removeFile);

/* 发布文章 */
router.post('/article/publish', article.articlePublish);

/* 查询文章数量 */
router.get('/article/getArticlesCount', article.getArticlesCount);

/* 查询文章 */
router.get('/article/getArticle', article.getArticle);

/* 修改文章 */
router.post('/article/updataArticle', article.updataArticle);

/* 文章点赞 */
router.post('/article/like', article.articleLike);

/* 删除文章 */
router.post('/article/deleteArticle', article.deleteArticle);

/* 添加分类 */
router.post('/article/addCategory', article.addCategory);

/* 查询分类 */
router.get('/article/getCategory', article.getCategory);

/* 修改分类 */
router.post('/article/updateCategory', article.updateCategory);

/* 删除分类 */
router.post('/article/deleteCategory', article.deleteCategory);

/* 添加标签 */
router.post('/article/addLabel', article.addLabel);

/* 获取标签 */
router.get('/article/getLabel',article.getLabel);  

/* 修改标签 */
router.post('/article/updateLabel', article.updateLabel);

/* 删除标签 */
router.post('/article/deleteLabel', article.deleteLabel);

/* 发布公告 */
router.post('/notice/publish', article.publishNotice);

/* 发布素材&工具 */
router.post('/tool/publish', article.publishTool);

/* 发布Demo */
router.post('/demo/publish', article.publishDemo);

/* 用户登录 */
router.post('/user/login', user.userLogin);

/* 获取个人信息 */
router.get('/user/getUserInfo', user.getUserInformation);

/* 获取所有用户信息 */
router.get('/user/getAllUserInfo', user.getAllUserInformation);

/* 删除用户 */
router.post('/user/deleteUser', user.deleteUser);

/* 修改头像 */
router.post('/user/updateAvatar', user.updateAvatar);

/* 验证用户是否登录 */
router.post('/user/userIsLogined', user.userIsLogined);

/* 用户退出 */
router.get('/user/exit', user.userExit);

/* 发送邮箱验证码 */
router.post('/sendMail', user.sendMail);

/* 用户注册 */
router.post('/user/registe', user.registe);

/* 获取文章页码所对应文章 */
router.get('/article/page', note.getArticlePage);

/* 获取分类页码所对应文章 */
router.get('/category/page', note.getCategoryPage);

/* 获取标签页码所对应文章 */
router.get('/label/page', note.getLabelPage);

/* 获取关键字页码所对应文章 */
router.get('/keyword/page', note.getKeyWordPage);

/* 获取文章详情 */
router.get('/article/detail', note.getArticleDetail);

// 获取站点统计
router.get('/article/getSiteStatistics', note.getSiteStatistics);

// 评论文章
router.post('/article/message', message.leaveMessages);

// 删除评论
router.post('/article/deleteMessage', message.deleteMessage);

// 回复评论
router.post('/article/reply', message.leaveReply);

//是否有评论
router.get('/article/hasMessage', message.hasMessage);

// 获取评论与回复
router.get('/article/getMessageAndReply', message.getMessageAndReply);

//获取最新评论
router.get('/article/getNewMessage', message.getNewMessage);

// 获取最新公告
router.get('/notice/getNotice', note.getNotice);

// 获取素材&工具
router.get('/tool/getTool', note.getTool);

// 获取Demo
router.get('/demo/getDemo', note.getDemo);

module.exports = router;
