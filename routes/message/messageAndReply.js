var dbConfig = require('../../util/dbConfig');
let Date1 = require('../utils/time');
const jwt = require("../utils/jsonwebtoken");

// 留言接口
leaveMessages = (req,res) => {
  const { token,articleId,messageContent} = req.body;
  jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let date = Date.parse(new Date()); // 生成时间戳
    /* 声明插入留言的sql语句 */
    const sql = "INSERT INTO message(message_username,article_id,message_content,message_time) VALUES(?, ?, ?, ?)";
    /* 插入值 */
    let sqlArr = [data.token.username,articleId,messageContent,date];
    /* 执行插入的回调函数 */
    let leaveMessagesCallBack = (err) => {
      if(err){
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!1"});
      }else {
        // 评论成功，该文章评论数加1
        
        updateArticleMessageCount(articleId);
        return res.json({err: 0,msg: "评论成功"});
        
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,leaveMessagesCallBack); // 插入留言信息
  })
  .catch(err => {
    return res.json({err: -888,msg: "发布失败,非法的token!"});
  })
}

// 回复接口
leaveReply = (req,res) => {
  const { token,messageId,replyContent} = req.body;
  jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let date = Date.parse(new Date()); // 生成当前时间戳
    /* 声明插入回复的sql语句 */
    const sql = "INSERT INTO reply(reply_username,message_id,reply_content,reply_time) VALUES(?, ?, ?, ?)";
    /* 插入数据 */
    let sqlArr = [data.token.username,messageId,replyContent,date];
    /* 执行插入回复时的回调函数 */
    let leaveReplyCallBack = (err) => {
      if(err){
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }else {
        return res.json({err: 0,msg: "回复成功"});
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,leaveReplyCallBack); // 插入回复
  }).catch(err => {
    return res.json({err: -888,msg: "发布失败,非法的token!"});
  })
}

// 判断是否有留言(根据数量判断)接口
/* 用于判断是否执行获取留言与回复信息接口 */
hasMessage = (req,res) => {
  const {articleId} = req.query;
  /* 查询数据 */
  let sqlArr = [articleId];
  /* 查询的SQL语句 */
  const sql = "SELECT COUNT(*) AS count FROM message WHERE message.article_id = ?";
  /* 执行查询时的回调函数 */
  let getMessageCount = (err,data) => {
    if(err) {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }else {
      return res.json({err: 0,msg: "查询成功",data:data[0].count});
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,getMessageCount); //判断是否有留言
}

// 获取对应文章的留言与回复信息接口
getMessageAndReply = (req,res) => {
  const {articleId} = req.query;
  /* 查询对象 */
  let sqlArr = [articleId];
  /* 声明查询留言与回复的sql语句 */
  const sql = "SELECT message_id,message_content,message_time,username,head_image,nick_name FROM message,user WHERE message.article_id = ? AND message.message_username = user.username ";
  /* 执行时的回调函数 */
  let getMessageAndReplyCallback = (err,data) => {
    if(err){
      return res.json({err: -999,msg:"出错了，请检查网络设备是否正常!"});
    }else {
      /* 查询成功*/
      if(data.length > 0){
      /* 如果有留言继续查询回复信息 */
      let count = 1; // 声明一个留言的数量，用于判断遍历到第几个留言
      data.forEach(item => {
        /* 将每一个留言的时间戳解析为时间格式 */
        item.message_time = Date1.getTime(item.message_time);
        /* 声明查询回复的sql语句 */
        const sql2 = "SELECT reply_id,reply_content,reply_time,username,head_image,nick_name FROM reply,user WHERE reply.message_id = ? AND reply.reply_username = user.username"
        /* 查询回复的对象 */
        let sqlArr2 = [item.message_id];
        /* 执行查询回复时的回调函数 */
        let getReplyCallBack = (err,value) => {
          if(!err){
            value.forEach(key => {
              /* 将每一个回复的时间解析 */
              key.reply_time = Date1.getTime(key.reply_time);
            });
            item.reply = value; // 把回复信息放入对应的留言中
            if(count == data.length){
              /* 留言信息遍历结束 */
              return res.json({err: 0,msg: "查询成功",data:data});
            }
            count ++;
          }else {
            return res.json({err: -999,msg:"出错了，请检查网络设备是否正常!"});
          }
        }
        dbConfig.sqlConnect(sql2,sqlArr2,getReplyCallBack); // 查询回复
      })
    }
    }
  }
  
  dbConfig.sqlConnect(sql,sqlArr,getMessageAndReplyCallback) // 查询留言
}

// 获取最新留言与回复信息接口
getNewMessage = (req,res) => {
  const sql = "SELECT message_id,message_content,message_time,username,head_image,nick_name,article_title FROM message,article,user WHERE message.message_username = user.username AND message.article_id = article.article_id ORDER BY message_id DESC LIMIT 0,5;"
  let getNewMessageCallBack = (err,data) => {
    if(err) {
      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
    }else {
      data.forEach(item => {
        item.article_time = Date1.getTime(item.message_time);
      });
      return res.json({err: 0,msg: "查询成功",data:data});
    }
  }
  dbConfig.sqlConnect(sql,getNewMessageCallBack); 
}

// 更改文章留言数
function updateArticleMessageCount(articleId) {
  const sql2 = "SELECT COUNT(*) AS count FROM message WHERE article_id = ?";
  let sqlArr2 = [articleId];
  let getArticleMessageCountCallBack= (err,data) => {
    if(err) {
      return;
    }else {
      // 2.更改评论数
      let messageCount = data[0].count;
      const sql3 = "UPDATE article SET article_messagecount = ? WHERE article_id = ?";
      let sqlArr3 = [messageCount,articleId]
      let updateArticleMessageCountCallBack = (err) => {
        if(err) {
          return;
        }else {
          // return res.json({err: 0,msg: "成功"});
        }
      }
      dbConfig.sqlConnect(sql3,sqlArr3,updateArticleMessageCountCallBack);
    }
  }
  dbConfig.sqlConnect(sql2,sqlArr2,getArticleMessageCountCallBack); 
}

// 删除留言
deleteMessage = (req,res) => {
  if (req.session.adminlogin) {
    const {messageId,articleId} = req.body;
    const sql = "SELECT * FROM reply WHERE message_id = ?";
    let sqlArr = [messageId];
    let deleteMessageCallBack = (err,data) => {
      if (!err) {
        // 查询成功
        if(data.length > 0){
          // 有回复，一起删除
          const sql1 = "DELETE message,reply FROM message INNER JOIN reply ON message.message_id = reply.message_id WHERE message.message_id = ?";
          let deleteMessageCallBack1 = err => {
            if(!err){
              // 删除成功
              updateArticleMessageCount(articleId) // 更改文章留言数
              return res.json({err: 0,msg: "删除成功"}); 
            }else {
              // 删除失败
              return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
            }
          }
          dbConfig.sqlConnect(sql1, sqlArr, deleteMessageCallBack1) 
        }else {
          // 无相关回复 直接删除
          const sql2 = "DELETE FROM message WHERE message_id = ?";
          let deleteMessageCallBack2 = err => {
            if(!err){
              // 删除成功
              updateArticleMessageCount(articleId) // 更改文章留言数
              return res.json({err: 0,msg: "删除成功"}); 
            }else {
              // 删除失败
              return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
            }
          }
          dbConfig.sqlConnect(sql2, sqlArr, deleteMessageCallBack2)
        }
      }else {
        // 查询失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, deleteMessageCallBack)
  }else {
    return res.json({err: -888,message: "你不是管理员,没有权限"});
  }
}



module.exports = {
  leaveMessages,
  leaveReply,
  hasMessage,
  getMessageAndReply,
  getNewMessage,
  deleteMessage,
}

