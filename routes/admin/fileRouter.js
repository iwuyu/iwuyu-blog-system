const multer = require('multer')
const fs = require('fs')

// 上传文件
var storage = multer.diskStorage({
  // 设置上传后文件路径，
  destination: function(req,file,cb) {
      cb(null,`./public/${file.fieldname}`)
  },
  // 给上传的文件重命名，获取添加后缀名
  filename: function(req,file,cb) {
    let fileFormats = file.originalname.split("."); // 获取后缀名
    let fileFormat = fileFormats[fileFormats.length - 1];
    let fileName = (new Date()).getTime() + parseInt(Math.random() * 9999); // 随机生成文件名
    // 给图片加上时间戳格式防止重命名
    cb(null,`${fileName}.${fileFormat}`);
  }
});

let upload = multer({
  storage:storage
});

// 上传错误操作 删除
let imgDelete = filepath => {
  fs.unlink(`./${filepath}`, err => {
    if(err){
      console.log(err)
    }else{
      console.log('删除成功')
    }
  })
}

// 上传封面图/文章图/素材图 回调
uploadCallBack = (req,res) => {
  if (req.session.adminlogin) {
    let {size,mimetype,path} = req.file;
    console.log(req.file)
    let types = ['jpg','jpeg','png','gif']; // 允许上传的数据类型
    let temType = mimetype.split('/')[1];
    if(size > 500 * 1024){
      imgDelete(req.file.path)
      return res.json({ err: -1, msg: "尺寸过大" });
    }else if(types.indexOf(temType) == -1){
      imgDelete(req.file.path)
      return res.json({ err: -2, msg: "文件类型错误,仅支持'jpg','jpeg','png','gif'" });
    }else if(req.file.fieldname == 'images') {
      let url = `/public/images/${req.file.filename}`
      return res.json({ err: 0, msg: "上传成功" ,data:{imgUrl:url}});
    }else if(req.file.fieldname == 'articleImages') {
      let url = `/public/articleImages/${req.file.filename}`
      return res.json({ err: 0, msg: "上传成功" ,data:{imgUrl:url}});
    }else if(req.file.fieldname == 'toolImages') {
      let url = `/public/toolImages/${req.file.filename}`
      return res.json({ err: 0, msg: "上传成功" ,data:{imgUrl:url}});
    }
  }else {
    imgDelete(req.file.path)
    return res.json({ err: -888, msg: "你不是管理员,没有权限" });
  }
}


// 上传头像回调函数
uploadAvatarCallBack = (req,res) => {
    let {size,mimetype,path} = req.file;
    console.log(req.file)
    let types = ['jpg','jpeg']; // 允许上传的数据类型
    let temType = mimetype.split('/')[1];
    if(size > 2 * 1024 * 1024){
      imgDelete(req.file.path)
      return res.json({ err: -1, msg: "尺寸过大" });
    }else if(types.indexOf(temType) == -1){
      imgDelete(req.file.path)
      return res.json({ err: -2, msg: "文件类型错误,仅支持'jpg','jpeg'" });
    }else if(req.file.fieldname == 'avator') {
      let url = `/public/avator/${req.file.filename}`
      return res.json({ err: 0, msg: "上传成功" ,data:{imgUrl:url}});
    }
  
}

// 上传视频回调
uploadVideoCallBack = (req,res) => {
  if(req.session.adminlogin){
    let {size,mimetype,path} = req.file;
    console.log(req.file)
    let types = ['mp4']; // 允许上传的数据类型
    let temType = mimetype.split('/')[1];
    if(size > 30 * 1024 * 1024){
      imgDelete(req.file.path)
      return res.json({ err: -1, msg: "文件过大,仅支持30M以内！" });
    }else if(types.indexOf(temType) == -1){
      imgDelete(req.file.path)
      return res.json({ err: -2, msg: "文件类型错误,仅支持 mp4格式" });
    }else if(req.file.fieldname == 'video') {
      let url = `/public/video/${req.file.filename}`
      return res.json({ err: 0, msg: "上传成功" ,data:{videoUrl:url}});
    }
  }else {
    imgDelete(req.file.path)
    return res.json({ err: -888, msg: "你不是管理员,没有权限" });
  }
}


// 移出文件
removeFile = (req,res) => {
  const { filePath } = req.body;
  imgDelete(filePath)
  return res.json({ err: 0, msg: "移出成功"});
}

module.exports = {
  upload,
  uploadCallBack,
  uploadAvatarCallBack,
  uploadVideoCallBack,
  removeFile
}