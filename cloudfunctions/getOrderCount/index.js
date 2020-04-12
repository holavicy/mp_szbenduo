// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const $ = db.command.aggregate;
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  let options = {}

  if(!event.isAdmin){
    options.dealer_id = openId
  }

  try {
    return await db.collection('order_list').aggregate().match(options).limit(1000)
      .group({
        _id: '$status',
        num: $.sum(1)
      })
      .end()
      .then(res => { return res })
      .catch(err => console.error(err))
  } catch (e) {
    console.log(e)
  }
}