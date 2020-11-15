var dbConfig = require('../../util/dbConfig');
const fs = require('fs');
let Date1 = require('../utils/time');

/* 文章 */

// 删除文章图片
deleteImage = path =>{
  fs.unlink(`./public/images/${path}`, err => {
    if(err){
      console.log(err);
    }else{
      console.log('删除成功')
    }
  })
}


// 文章发布
articlePublish = (req, res) => {
  if (req.session.adminlogin) { // 判断是否有权限
    const {
      articleTitle,
      articleCategoryId,
      articleLabelId,
      articleImage,
      articleSynopsis,
      articleContent
    } = req.body;
    var date = Date.parse(new Date());
    const sql = "INSERT INTO article(article_title, article_image,article_synopsis,article_category_id,article_label_id,article_content,article_time) VALUES(?, ?, ?, ?, ?, ?, ?);";
    let sqlArr = [articleTitle, articleImage, articleSynopsis, articleCategoryId, articleLabelId, articleContent, date];
    let articlePublishCallBack = (err) => {
      if (!err) {
        // 发表成功
        return res.json({err: 0,msg: "发表成功"});
      } else {
        // 发表失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, articlePublishCallBack)
  } else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
};

/* 查询商品总数量 */
getArticlesCount = (req,res) => {
  const { categoryId,labelId, keyword } = req.query;
  let sqlArr;
  let sql;
  if(keyword == ""){
    if(categoryId == "") {
      sql = `SELECT COUNT(*) AS count FROM article`;
    }else {
      if(labelId === ""){
        sql = `SELECT COUNT(*) AS count FROM article WHERE article_category_id = ?`;
        sqlArr = [categoryId];
      }else {
        sql = `SELECT COUNT(*) AS count FROM article WHERE article_label_id = ?`;
        sqlArr = [labelId];
      }
    }
  }else {
    sql = `SELECT COUNT(*) AS count FROM article WHERE article_title LIKE ?`;
    let keywords = `%${keyword}%`
    sqlArr = [keywords];
  }
  callBack = (err, data) => {
    if(!err){
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  if(keyword == "" && categoryId == "" && labelId == ""){
    dbConfig.sqlConnect(sql,callBack);
  }else {
    dbConfig.sqlConnect(sql,sqlArr,callBack);
  }
}

// 查询文章
getArticle = (req,res) => {
  const {categoryId,labelId,keyword,currentPage,pageSize} = req.query;
  let categoryId1  = parseInt(categoryId);
  let labelId1  = parseInt(labelId);
  let currentPage1 = (currentPage - 1) * pageSize;
  let pageSize1 = pageSize * 1;
  let sql;
  let sqlArr;
  if(keyword == ""){
    if(!categoryId1){
      sql = `SELECT article.*,article_label.article_label_name,article_category.article_category_name 
             FROM article,article_label,article_category 
             WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id ORDER BY article.article_id DESC LIMIT ?,?`;
      sqlArr= [currentPage1,pageSize1];
    }else {
      if(!labelId1){
        sql = `SELECT article.*,article_label.article_label_name,article_category.article_category_name 
               FROM article,article_label,article_category 
               WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id AND article.article_category_id = ? ORDER BY article.article_id DESC LIMIT ?,?`;
        sqlArr= [categoryId1,currentPage1,pageSize1];
      }else {
        sql = `SELECT article.*,article_label.article_label_name,article_category.article_category_name 
               FROM article,article_label,article_category 
               WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id AND article.article_label_id = ? AND article.article_category_id = ? ORDER BY article.article_id DESC LIMIT ?,?`;
        sqlArr= [labelId1,categoryId1,currentPage1,pageSize1];
      }
    }
  }else {
    sql = `SELECT article.*,article_label.article_label_name,article_category.article_category_name
           FROM article,article_label,article_category 
           WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id AND article.article_title LIKE ?  ORDER BY article.article_id DESC LIMIT ?,?`;
    let keywords = `%${keyword}%`;
    sqlArr = [keywords,currentPage1,pageSize1]
  }
  let getArticleCallBack = (err,data) => {
    if(!err){
      data.forEach(item => {
        item.article_time = Date1.getTime(item.article_time,"YMD");
      })
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,getArticleCallBack)
}

// 修改文章
updataArticle = (req, res) => {
  if (req.session.adminlogin) { // 判断是否有权限
    const {
      articleTitle,
      articleCategoryId,
      articleLabelId,
      articleImage,
      articleSynopsis,
      articleContent,
      articleId
    } = req.body;
    // 如果修改图片路径跟数据库里不一样，删除之前的
    const sqlImg = "SELECT article_image FROM article WHERE article_id = ?";
    let sqlArrImg = [articleId];
    let selectImgCallBack = (err,data) => {
      if(!err) {
        if(data[0].article_image != articleImage) {
          var paths = data[0].article_image.split("/");
          path = paths[paths.length -1];
          deleteImage(path);
        }
      }
    }
    dbConfig.sqlConnect(sqlImg, sqlArrImg, selectImgCallBack);
    const sql ="UPDATE article SET article_title = ?,article_image = ?,article_synopsis = ?,article_category_id = ?,article_label_id = ?,article_content = ? WHERE article_id = ?";
    let sqlArr = [articleTitle, articleImage, articleSynopsis, articleCategoryId, articleLabelId, articleContent, articleId];
    let updateArticleCallBack = (err) => {
      if (!err) {
        // 发表成功
        return res.json({err: 0,msg: "修改成功"});
      } else {
        // 发表失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, updateArticleCallBack)
  } else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
};

// 文章点赞
articleLike = (req,res) => {
  const {articleId} = req.body;
  // 1.查询原有赞数
  const sql = "SELECT num_likes FROM article WHERE article_id = ?";
  let sqlArr = [articleId];
  let articleLikeCallBack = (err,data) => {
    if(err) {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }else {
      let articleLikes = data[0].num_likes + 1;
      const sql2 = "UPDATE article SET num_likes = ? WHERE article_id = ?"
      let sqlArr2 = [articleLikes,articleId];
      let updataArticleLikesCallBack = (err) => {
        if(err) {
          return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
        }else {
          return res.json({err: 0,msg: "感谢您的点赞!"});
        }
      }
      dbConfig.sqlConnect(sql2,sqlArr2,updataArticleLikesCallBack)
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,articleLikeCallBack)
}

// 删除文章
deleteArticle = (req,res) => {
  if(req.session.adminlogin) {
    const {articleId,articleImage} = req.body;
    const sql = "DELETE FROM article WHERE article_id = ?";
    let sqlArr = [articleId];
    let deleteArticleCallBack = err => {
      if(!err){
        // 删除成功
        // 删除该文章的图片
        deleteImage(articleImage);
        const sql0 = "SELECT message_id FROM message WHERE article_id = ?"
        let sqlArr0 = [articleId]
        let getMessageIdCallBack = (err,data) => {
          data.forEach(item => {
            const sql = "SELECT * FROM reply WHERE message_id = ?";
            let sqlArr = [item.message_id];
            let deleteMessageCallBack = (err,data) => {
              if (!err) {
                // 查询成功
                if(data.length > 0){
                  // 有回复，一起删除
                  const sql1 = "DELETE message,reply FROM message INNER JOIN reply ON message.message_id = reply.message_id WHERE message.message_id = ?";
                  let deleteMessageCallBack1 = err => {
                    if(!err){
                      // 删除成功
                      return res.json({err: 0,msg: "删除成功"}); 
                    }else {
                      // 删除失败
                      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                    }
                  }
                  dbConfig.sqlConnect(sql1, sqlArr, deleteMessageCallBack1) // 有回复，一起删除
                }else {
                  // 无相关回复 直接删除
                  const sql2 = "DELETE FROM message WHERE message_id = ?";
                  let deleteMessageCallBack2 = err => {
                    if(!err){
                      // 删除成功
                      return res.json({err: 0,msg: "删除成功"}); 
                    }else {
                      // 删除失败
                      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                    }
                  }
                  dbConfig.sqlConnect(sql2, sqlArr, deleteMessageCallBack2) // 无相关回复 直接删除
                }
              }else {
                // 查询失败
                return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
              }
            }
            dbConfig.sqlConnect(sql, sqlArr, deleteMessageCallBack)
          })
        } 
        dbConfig.sqlConnect(sql0, sqlArr0, getMessageIdCallBack) //查询留言id
      }else {
        // 删除失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, deleteArticleCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 添加分类
addCategory = (req, res) => {
  if (req.session.adminlogin) {
    const {categoryName} = req.body;
    const sql = "INSERT INTO article_category(article_category_name)VALUES(?);";
    let sqlArr = [categoryName];
    let addCategoryCallBack = err => {
      if (!err) {
        // 添加成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 添加失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, addCategoryCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 查询分类
getCategory = (req,res) => {
  const sql = "SELECT * FROM article_category";
  let getCategoryCallBack = (err,data) => {
    if(!err){
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,getCategoryCallBack)
}

// 修改分类
updateCategory = (req, res) => {
  if (req.session.adminlogin) {
    const {newCategoryName,oldCategoryName} = req.body;
    const sql = "UPDATE article_category SET article_category_name = ? WHERE article_category_name = ?";
    let sqlArr = [newCategoryName,oldCategoryName];
    let updateCategoryCallBack = err => {
      if (!err) {
        // 修改成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 修改失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, updateCategoryCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

//删除分类
deleteCategory = (req,res) => {
  if (req.session.adminlogin) {
    const {categoryName} = req.body;
    const sql = "SELECT article_label_name FROM article_label WHERE article_category_id = (SELECT article_category_id FROM article_category WHERE article_category_name = ?)";
    let sqlArr = [categoryName];
    let deleteCategoryCallBack = (err,data) => {
      if (!err) {
        // 查询成功
        if(data.length > 0){
          // 有相关数据 不可删除
          return res.json({err: -777,msg: "该数据与其他数据有关联哦！ 不可删除"}); 
        }else {
          // 无相关数据 可以删除
          const sql2 = "DELETE FROM article_category WHERE article_category_name = ?";
          let deleteCategoryCallBack2 = err => {
            if(!err){
              // 删除成功
              return res.json({err: 0,msg: "删除成功"}); 
            }else {
              // 修改失败
              return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
            }
          }
          dbConfig.sqlConnect(sql2, sqlArr, deleteCategoryCallBack2)
        }
      }else {
        // 查询失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, deleteCategoryCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 添加标签
addLabel = (req,res) => {
  if(req.session.adminlogin){
    const { categoryId,labelName } = req.body;
    const sql = "INSERT INTO article_label(article_category_id,article_label_name)VALUES(?,?);";
    let sqlArr = [categoryId,labelName];
    let addLabelCallBack = err => {
      if(!err) {
        // 添加成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 添加失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, addLabelCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 获取标签
getLabel = (req,res) => {
  const sql = `SELECT article_label.article_label_id,article_label.article_label_name,article_category.article_category_id,article_category.article_category_name 
               FROM article_category,article_label 
               WHERE article_label.article_category_id = article_category.article_category_id`;
  let getLabelCallBack = (err,data) => {
    if(!err){
      return res.json({err:0,msg:"查询成功",data:data});
    }else {
      return res.json({err:-999,msg:"出错了，请检查网络设备是否正常!"})
    }
  }
  dbConfig.sqlConnect(sql,getLabelCallBack)
}

// 修改标签
updateLabel = (req, res) => {
  if (req.session.adminlogin) {
    const {newLabelName,oldLabelName} = req.body;
    const sql = "UPDATE article_label SET article_label_name = ? WHERE article_label_name = ?";
    let sqlArr = [newLabelName,oldLabelName];
    let updateLabelCallBack = err => {
      if (!err) {
        // 修改成功
        return res.json({err: 0,msg: "修改成功"});
      }else {
        // 修改失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, updateLabelCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

//删除标签
deleteLabel = (req,res) => {
  if (req.session.adminlogin) {
    const {labelId} = req.body;
    const sql = "SELECT * FROM article WHERE article_label_id = ?";
    let sqlArr = [labelId];
    let deleteLabelCallBack = (err,data) => {
      if (!err) {
        // 查询成功
        if(data.length > 0){
          // 有相关数据 不可删除
          return res.json({err: -777,msg: "该数据与其他数据有关联哦！ 不可删除"}); 
        }else {
          // 无相关数据 可以删除
          const sql2 = "DELETE FROM article_label WHERE article_label_id = ?";
          let deleteLabelCallBack2 = err => {
            if(!err){
              // 删除成功
              return res.json({err: 0,msg: "删除成功"}); 
            }else {
              // 删除失败
              return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
            }
          }
          dbConfig.sqlConnect(sql2, sqlArr, deleteLabelCallBack2)
        }
      }else {
        // 查询失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, deleteLabelCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 发布公告
publishNotice = (req,res) => {
  if(req.session.adminlogin){
    const {notice} = req.body;
    var date = Date.parse(new Date());
    const sql = "INSERT INTO notice(content,publish_time)VALUE(?,?)";
    let sqlArr = [notice,date];
    let publishNoticeCallBack = err => {
      if(!err) {
        // 添加成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 添加失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, publishNoticeCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 发布素材
publishTool = (req,res) => {
  if(req.session.adminlogin){
    const {toolName,toolPath,toolImage,toolBrief} = req.body;
    const sql = "INSERT INTO tool(tool_name,tool_path,tool_image,tool_brief)VALUE(?,?,?,?)"
    let sqlArr = [toolName,toolPath,toolImage,toolBrief];
    let publishToolCallBack = err => {
      if(!err) {
        // 添加成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 添加失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, publishToolCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}

// 发布Demo
publishDemo = (req,res) => {
  if(req.session.adminlogin){
    const {demoName,demoPath,demoVideo,demoBrief} = req.body;
    var date = Date.parse(new Date());
    const sql = "INSERT INTO demo(demo_name,demo_path,demo_video,demo_brief,demo_date)VALUE(?,?,?,?,?)"
    let sqlArr = [demoName,demoPath,demoVideo,demoBrief,date];
    let publishDemoCallBack = err => {
      if(!err) {
        // 添加成功
        return res.json({err: 0,msg: "添加成功"});
      }else {
        // 添加失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, publishDemoCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}


module.exports = {
  articlePublish,
  getArticlesCount,
  getArticle,
  updataArticle,
  articleLike,
  deleteArticle,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  addLabel,
  getLabel,
  updateLabel,
  deleteLabel,
  publishNotice,
  publishTool,
  publishDemo
}