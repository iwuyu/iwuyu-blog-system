var dbConfig = require('../../util/dbConfig');

// 管理员

// 验证管理员是否为登录状态
adminIsLogined = (req,res) => {
  console.log(req.session.adminlogin)
  if (req.session.adminlogin) {
    return res.json({ err: 0, message: "欢迎回来最帅的站长!"});
  } else {
    return res.json({ err: -999, message: "您还没有登陆,请先去登陆！"});
  }
}

// 退出后台
adminExit = (req,res) => {
  req.session.destroy();
  return res.json({ err: 0, message: "退出后台管理成功！" });
}

// 后台登录
adminLogin = (req,res) => {
  const { username,password } = req.body;
  let turePassword = new Buffer(password,'base64').toString();
  const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
  let sqlArr = [username, turePassword];
  let callBack = (err,data) => {
    if(err) {
      res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
    }else {
      if(data.length > 0){
        // 存在
        req.session.adminlogin = true;
        console.log(req.session.adminlogin)
        res.send({
          'err':0,
          'msg':'欢迎进入博客后台管理系统'
        })
      }else {
        res.send({
          'err':-888,
          'msg':'对不起您不是管理员用户, 不能进入该区域!'
        })
      }
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,callBack)
}

module.exports = {
  adminLogin,
  adminIsLogined,
  adminExit
}
