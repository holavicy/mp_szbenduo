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
    dealer_id: openId
  }

  if (event.status) {
    options.status = event.status
  }

  if (event.id) {
    options._id = event.id
  }

  try {
    return await db.collection('order_list').aggregate().match(options)
      .lookup({
        from: 'order_goods',
        localField: '_id',
        foreignField: 'order_id',
        as: 'goodsList'
      }).sort({
        create_time: -1
      }).project({
        address_id: 1,
        freight_no: 1,
        is_freight: 1,
        total_freight_price: 1,
        total_goods_price: 1,
        total_price: 1,
        total_num: 1,
        status: 1,
        goodsList: 1,
        expressName:1,
        expressNo:1,
        create_time: $.dateToString({
          date: '$create_time',
          format: '%Y-%m-%d %H:%M:%S'
        })
      }).limit(1000)
      .end()
      .then(res => { return res })
      .catch(err => console.error(err))
  } catch (e) {
    console.log(e)
  }
}