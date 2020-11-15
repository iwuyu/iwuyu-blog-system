var dbConfig = require('../../util/dbConfig');
let Date = require('../utils/time');

// 文章分页
getArticlePage = (req,res) => {
  let count = 0;
  let sql1 = "select count(*) AS count from article"
  let articleCountCallBack = (err,data) => {
    if(!err){
      count = data[0].count;
      const {pageNo,pageSize} = req.query;
      let thisPageNo = (pageNo-1)*pageSize;
      let thisPageSize = pageSize*1;
      const sql = `SELECT article.article_id,article.article_title, article.article_image,article.article_synopsis,article.article_category_id,article.article_label_id,article_messagecount,
                   article.article_content,article.article_time,article.num_likes,article.num_views,article_label.article_label_name,article_category.article_category_name
                   FROM article,article_label,article_category
                   WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id ORDER BY article_id DESC LIMIT ?,?`;
      let sqlArr = [thisPageNo,thisPageSize];
      let getArticlePageCallBack = (err,data) => {
        if(!err){
          data.forEach(item => {
            item.article_time = Date.getTime(item.article_time,"YMD");
          });
          return res.json({err: 0,msg: "查询成功",count:count,data:data});
        }else {
          return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
        }
      }
      dbConfig.sqlConnect(sql,sqlArr,getArticlePageCallBack)
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql1,articleCountCallBack)
}

// 文章按分类分页
getCategoryPage = (req,res) => {
  const {pageNo,pageSize,categoryId } = req.query;
  let sql1 = "SELECT COUNT(*) AS COUNT FROM article WHERE article_label_id = ?";
  let sqlArr1 = [categoryId];
  let labelCountCallBack = (err,data) => {
    if(!err){
      let count = data[0].COUNT;
      let thisPageNo = (pageNo-1)*pageSize;
      let thisPageSize = pageSize*1;
      const sql = `SELECT article.article_id,article.article_title, article.article_image,article.article_synopsis,article.article_category_id,article.article_label_id,article_messagecount,
                   article.article_content,article.article_time,article.num_likes,article.num_views,article_label.article_label_name,article_category.article_category_name
                   FROM article,article_label,article_category
                   WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id And article.article_category_id = ? ORDER BY article_id DESC LIMIT ?,?`;
      let sqlArr = [categoryId,thisPageNo,thisPageSize];
      let getLabelPageCallBack = (err,data) => {
        if(!err){
          data.forEach(item => {
            item.article_time = Date.getTime(item.article_time);
          });
          return res.json({err: 0,msg: "查询成功",count:count,data:data});
        }else {
          return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
        }
      }
      dbConfig.sqlConnect(sql,sqlArr,getLabelPageCallBack)
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql1,sqlArr1,labelCountCallBack)
}

// 文章按标签分页
getLabelPage = (req,res) => {
  const {pageNo,pageSize,labelId } = req.query;
  let sql1 = "SELECT COUNT(*) AS COUNT FROM article WHERE article_label_id = ?";
  let sqlArr1 = [labelId];
  let labelCountCallBack = (err,data) => {
    if(!err){
      let count = data[0].COUNT;
      let thisPageNo = (pageNo-1)*pageSize;
      let thisPageSize = pageSize*1;
      const sql = `SELECT article.article_id,article.article_title, article.article_image,article.article_synopsis,article.article_category_id,article.article_label_id,article_messagecount,
                   article.article_content,article.article_time,article.num_likes,article.num_views,article_label.article_label_name,article_category.article_category_name
                   FROM article,article_label,article_category
                   WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id And article.article_label_id = ? ORDER BY article_id DESC LIMIT ?,?`;
      let sqlArr = [labelId,thisPageNo,thisPageSize];
      let getLabelPageCallBack = (err,data) => {
        if(!err){
          data.forEach(item => {
            item.article_time = Date.getTime(item.article_time);
          });
          return res.json({err: 0,msg: "查询成功",count:count,data:data});
        }else {
          return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
        }
      }
      dbConfig.sqlConnect(sql,sqlArr,getLabelPageCallBack)
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql1,sqlArr1,labelCountCallBack)
}

// 模糊查询分页
getKeyWordPage = (req,res) => {
  const {pageNo,pageSize,keyWord } = req.query;
  keyword = `%${keyWord}%`;
  console.log(keyword)
  const sql = "SELECT COUNT(*) AS COUNT FROM article WHERE article_title LIKE ?";
  sqlArr = [keyword];
  let keyWordCountCallback = (err,data) => {
    if(!err) {
      let count = data[0].COUNT;
      let thisPageNo = (pageNo-1)*pageSize;
      let thisPageSize = pageSize*1;
      const sql1 = `SELECT article.article_id,article.article_title, article.article_image,article.article_synopsis,article.article_category_id,article.article_label_id,article_messagecount,
                    article.article_content,article.article_time,article.num_likes,article.num_views,article_label.article_label_name,article_category.article_category_name
                    FROM article,article_label,article_category
                    WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id AND article.article_title  LIKE ? ORDER BY article_id DESC LIMIT ?,?`;
      let sqlArr1 = [keyword,thisPageNo,thisPageSize];
      let getKeyWordPageCallBack = (err,data) => {
        if(!err){
          data.forEach(item => {
            item.article_time = Date.getTime(item.article_time);
          });
          return res.json({err: 0,msg: "查询成功",count:count,data:data});
        }else {
          return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
        }
      }
      dbConfig.sqlConnect(sql1,sqlArr1,getKeyWordPageCallBack)
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,keyWordCountCallback)
}

// 文章详情
getArticleDetail = (req,res) => {
  const {articleId } = req.query;
  const sql = `SELECT article.article_id,article.article_title, article.article_image,article.article_synopsis,article.article_category_id,article.article_label_id,article_messagecount,
               article.article_content,article.article_time,article.num_likes,article.num_views,article_label.article_label_name,article_category.article_category_name
               FROM article,article_label,article_category
               WHERE article.article_label_id = article_label.article_label_id AND article.article_category_id = article_category.article_category_id AND article.article_id = ?`;
  let sqlArr = [articleId];
  let getArticleDetailCallBack = (err,data) => {
    if(!err){
      const sql2 = "UPDATE article SET num_views = ? WHERE article_id = ?";
      let sqlArr2 = [++data[0].num_views,articleId]
      let updateViews = (err) => {
        if(err) {
          console.log('失败')
        }else{

        }
      }
      dbConfig.sqlConnect(sql2,sqlArr2,updateViews);
      data[0].article_time = Date.getTime(data[0].article_time);
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,getArticleDetailCallBack)
}

// 站点统计
getSiteStatistics = (req,res) => {
  const sql = "SELECT COUNT(*) AS label,(SELECT COUNT(*) FROM article_category) AS category,(SELECT COUNT(*)FROM article) AS article,(SELECT COUNT(*)FROM message) AS message,(SELECT article.article_time FROM article ORDER BY article.article_id DESC LIMIT 1) AS lastTime FROM article_label;"
  let getSiteStatisticsCallBack = (err,value) => {
    if(err) {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }else {
      let data = value[0];
      data.lastTime = Date.getTime(data.lastTime,'YMD');
      return res.json({err: 0,msg: "查询成功",data:data});
    }
  }
  dbConfig.sqlConnect(sql,getSiteStatisticsCallBack); 
}

// 获取最新公告
getNotice = (req,res) => {
  const sql = "SELECT * FROM notice ORDER BY id DESC LIMIT 1";
  let getNoticeCallBack = (err,value) => {
    if(!err) {
      let data = value[0];
      data.publish_time = Date.getTime(data.publish_time);
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,getNoticeCallBack); 
}

// 获取素材&工具
getTool = (req,res) => {
  const sql = "SELECT * FROM tool";
  let getToolCallBack = (err,data) => {
    if(!err) {
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,getToolCallBack);
}

// 获取Demo
getDemo = (req,res) => {
  const sql = "SELECT * FROM demo";
  let getDemoCallBack = (err,data) => {
    if(!err) {
      data.forEach(item => {
        item.demo_date = Date.getTime(item.demo_date,'YMD');
      })
      return res.json({err: 0,msg: "查询成功",data:data});
    }else {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }
  }
  dbConfig.sqlConnect(sql,getDemoCallBack);
}

module.exports = {
  getArticlePage,
  getCategoryPage,
  getLabelPage,
  getKeyWordPage,
  getArticleDetail,
  getSiteStatistics,
  getNotice,
  getTool,
  getDemo
}