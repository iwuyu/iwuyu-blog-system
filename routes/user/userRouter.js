var dbConfig = require('../../util/dbConfig');
let Mail = require('../utils/mail');
let Date = require('../utils/time');
const Jwt = require("../utils/jsonwebtoken");

let codes = {} // 通过内存保存验证码信息
let time = {} // 保存发送时长
let time2 = {} // 保存验证码存放时长
let timer2 = {}; // 保存验证码时长定时器

// 验证用户是否为登录状态
userIsLogined = (req,res) => {
  let {token} = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    if (data.token.username) {
      return res.json({ err: 0, msg: "欢迎小可爱回哦来！" });
    } else {
      return res.json({ err: -999, msg: "您还没有登录,快去登录吧！" });
    }
 }).catch(err => {return res.json({ err: -999, msg: "您登录时间过长,为了您的账号安全请重新登录吧！" });})
}

// 用户退出
userExit = (req,res) => {
  req.session.destroy();
  return res.json({ err: 0, message: "拜拜，下次见！" });
}

// 用户登录
userLogin = (req,res) => {
  const { username,password } = req.body;
  const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  let sqlArr = [username, password];
  let userLoginCallBack = (err,data) => {
    if(err) {
      res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
    }else {
      if(data.length > 0){
        // 存在
        /* 登陆成功 我们直接就生成一个token给的用户传递过去 */
        const token = Jwt.createToken({ username: username, login: true });
        req.session.userlogin = true;
        let user = {};
        user.name = data[0].username;
        user.avatar = data[0].head_image;
        user.nick = data[0].nick_name;
        user.token = token;
        res.send({
          'err':0,
          'msg':`欢迎小可爱回来哦！`,
          data:user,
        });
      }else {
        res.send({
          'err':-888,
          'msg':'太马虎了,用户名或密码都能搞错!'
        })
      }
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,userLoginCallBack)
}
// 发送邮箱验证码
sendMail = (req,res) => {
  const { mail } = req.body;
  const sql = "SELECT username FROM user WHERE email = ?";
  let sqlArr = [ mail ];
  let sendMailCallBack = (err,data) => {
    if(err) {
      res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
    }else {
      if(data.length > 0){
        // 查询到该邮箱已被注册
        res.send({ err: -777, msg: `该邮箱已被${data[0].username}用户注册!` });
      }else {
        if(!time.hasOwnProperty(mail)){
          // 判断内存中没有该邮箱的限制时长
          let code = parseInt(Math.random()*10000) // 产生随机验证码
          Mail.send(mail,code).then(() => {
            codes[mail] = code; // 将邮箱和邮箱匹配的验证码保存到缓存中
            console.log(codes.hasOwnProperty(mail))
            res.send({err:0,msg:'验证码发送成功！请注意查收'})
          }).catch(err => {
            res.send({err:-1,msg:'验证码发送失败,请检查您的邮箱是否正确'})
          })
          // 开启定时器1,限制一分钟之内不能重复发送
          time[mail] = 0; // 保存该邮箱的限制时长
          let timer = setInterval(() => {
            time[mail]++;
            if(time[mail] > 60){ 
              // 超过限制时长 
              clearInterval(timer); // 关闭定时器1
              delete time[mail]; // 删除该邮箱的限制时长
            }
          },1000);
          // 初始化定时器2
          if(timer2[mail]) clearInterval(timer2[mail]);
          // 开启定时器2，限制验证码保存时间
          time2[mail] = 0;
          timer2[mail] = setInterval(() => {
            time2[mail]++;
            if(time2[mail] > 300){
              // 超过限定时间
              clearInterval(timer2[mail]); // 关闭定时器2
              delete codes[mail]; // 删除验证码
              delete time2[mail]; // 删除定时器2时长
            }
          },1000);
        }else {
          res.send({err:-666,msg:`发送太频繁了，请${60 - time[mail]}秒后再试`})
        }
      }
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,sendMailCallBack)
}

// 用户注册
registe = (req,res) => {
  const { username,password,mail,code } = req.body;
  let sqlArr1 = [username];
  let sql1 = "SELECT username FROM user WHERE username = ?";
  let registedCallBack = (err,data) => {
    if(err){
      res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
    }else{
      if(data.length > 0){
        res.send({ err: -333, msg: "该用户名已被注册!" });
      }else {
        if(codes[mail]){
          if(codes[mail] == code){
            let date = Date.getLocalTime('yyyy-MM-dd hh:mm:ss').toString();
            const sql = "INSERT INTO user(username,password,email,registration_time)VALUES(?,?,?,?)";
            let sqlArr = [username,password,mail,date];
            let registeCallBack = (err) => {
              if(err) {
                res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
              }else {
                // 注册成功
                delete codes[mail]; // 删除验证码
                res.send({ err: 0, msg: "恭喜你，加入了CODEJAY的小家庭!，快去登录吧！" });
              }
            }
            dbConfig.sqlConnect(sql,sqlArr,registeCallBack);
          }else {
            res.send({ err: -444, msg: "你的验证码不正确！" });
          }
        }else {
          res.send({ err: -555, msg: "你还没有发送验证码!" });
        }
      }
    }
  }
  dbConfig.sqlConnect(sql1,sqlArr1,registedCallBack);
}

// 更改头像
updateAvatar = (req,res) => {
  let {token,avatar} = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    const sql = "UPDATE user SET head_image = ? WHERE username = ?";
    let sqlArr = [avatar,data.token.username];
    let updateAvatarCallBack = err => {
      if(!err) {
        return res.json({ err: 0, msg: "修改成功", data:true });
      }else {
        res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,updateAvatarCallBack)
  })
  
}

// 获取登录信息
getUserInformation = (req,res) => {
  let {token} = req.query;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    const sql = "SELECT username,head_image FROM user WHERE username = ?";
    let sqlArr = [data.token.username];
    getUserInformationCallBack = (err,data) => {
      if(!err) {
        return res.json({ err: 0, msg: "查询成功", data:data });
      }else {
        res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,getUserInformationCallBack)
  })
}

// 获取所有用户信息
getAllUserInformation = (req,res) => {
  if(req.session.adminlogin) {
    const sql = "SELECT username,email,head_image,registration_time FROM user"
    let getAllUserInformationCallBack = (err,data) => {
      if(!err) {
        return res.json({ err: 0, msg: "查询成功", data:data });
      }else {
        res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
      }
    }
    dbConfig.sqlConnect(sql,getAllUserInformationCallBack)
  }else {
    return res.json({err: -888,msg: "你不是管理员,没有权限"});
  }
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

// 删除用户
deleteUser = (req,res) => {
  const {username} = req.body;
  if(req.session.adminlogin) {
    const sql = "DELETE FROM user WHERE username = ?"
    let sqlArr = [username];
    let deleteUserCallBack = err => {
      if(!err) {
        // 判断留言表是否有相关信息，有则删除
        const sql1 = "SELECT * FROM message WHERE message_username = ?"
        let isHaveMessageCallback = (err,messageData) => {
          if(!err){
            if(messageData.length > 0) {
              // 有则删除
              const sql2 = "DELETE FROM message WHERE message_username = ?"
              let deleteUserMessageCallBack = err => {
                if(!err) {
                  // sql2语句执行成功
                  // 修改该留言对应文章的留言数
                  messageData.forEach(item => {
                    updateArticleMessageCount(item.article_id)
                  })
                  // 判断是否有回复
                  const sql3 = "SELECT * FROM reply WHERE reply_username = ?"
                  let isHaveReplyCallback = (err,data) => {
                    if(!err) {
                      // sql3语句执行成功
                      if(data.length > 0){
                        // 有则删除
                        const sql6 = "DELETE FROM reply WHERE reply_username = ?";
                        let deleteUserReplyCallBack = err => {
                          if(!err) {
                            // sql6执行成功
                            return res.json({ err: 0, msg: `已删除${username}相关信息`});
                          }else {
                            // sql6执行失败
                            return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                          }
                        }
                        dbConfig.sqlConnect(sql6,sqlArr,deleteUserReplyCallBack)
                      }else {
                        // 无则正常返回
                        return res.json({ err: 0, msg: `已删除${username}相关信息`});
                      }
                    }else{
                      // sql3语句执行失败
                      return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                    }
                  }
                  dbConfig.sqlConnect(sql3,sqlArr,isHaveReplyCallback)
                }else {
                  // sql语句执行失败
                  return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                }
              }
              dbConfig.sqlConnect(sql2,sqlArr,deleteUserMessageCallBack)
            }else {
              // 留言中无数据直接判断回复中是否有回复数据，有则删除，无则直接返回
              // 判断是否有回复
              const sql4 = "SELECT * FROM reply WHERE reply_username = ?"
              let isHaveReplyCallback1 = (err,data) => {
                if(!err) {
                  // sql4语句执行成功
                  if(data.length > 0){
                    // 有则删除回复
                    const sql5 = "DELETE FROM reply WHERE reply_username = ?";
                    let deleteUserReplyCallBack1 = err => {
                      if(!err) {
                        // sql5语句执行成功
                        return res.json({ err: 0, msg: `已删除${username}相关信息(包括评论)`});
                      }else{
                        // sql5语句执行失败
                        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                      }
                    }
                    dbConfig.sqlConnect(sql5,sqlArr,deleteUserReplyCallBack1)
                  }else {
                    // 回复中无数据直接返回
                    return res.json({ err: 0, msg: `已删除${username}相关信息(包括评论)`});
                  }
                }else{
                  // sql4语句执行失败
                  return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
                }
              }
              dbConfig.sqlConnect(sql4,sqlArr,isHaveReplyCallback1)
            }
          }else{
            // sql1语句执行失败
            return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
          }
        }
        dbConfig.sqlConnect(sql1,sqlArr,isHaveMessageCallback)
      }else {
        // sql语句执行失败
        return res.json({err: -999,msg: "出错了，请检查网络设备是否正常!"});
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,deleteUserCallBack)
  }else {
    return res.json({err: -888,msg: "你不是管理员,没有权限"});
  }
}


module.exports = {
  userLogin,
  userIsLogined,
  userExit,
  sendMail,
  registe,
  getUserInformation,
  getAllUserInformation,
  updateAvatar,
  deleteUser
}