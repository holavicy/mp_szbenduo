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
  try {
    return await db.collection('category').aggregate().match({
      status: 1
    })
      .lookup({
        from: 'goods',
        let: {
          category_id: '$_id'
        },
        as: 'goodsList',
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$cateId', '$$category_id']),
            $.eq(['$status', 1])
          ])))
          .sort({
            create_time: - 1
          })
          .done(),
      }).sort({
        create_time: 1
      }).limit(1000)
      .end()
      .then(res => { return res })
      .catch(err => console.error(err))
  } catch (e) {
    console.log(e)
  }

}