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

  let options = {
    status: 1,
    type: event.type
  }

  if(event.start_status){
    options.start_status= event.start_status
  }

  try {
    return await db.collection('activity_rule').aggregate().match(options).project({
      start_date: 1,
      end_date:1,
      list:1,
      start_status:1,
      type:1
    })
      .end()
      .then(res => { return res })
      .catch(err => console.error(err))

  } catch (e) {
    console.log(e)
  }
}
