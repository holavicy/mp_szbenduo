// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  try {
    return await db.collection('city_freight_rule').aggregate().project({
      cityList: $.filter({
        input: '$cityList',
        as: 'item',
        cond:$.and([
          $.eq(['$$item.id', event.id]),
          $.eq(['$$item.selected', true])
        ])
        // cond: $.eq(['$$item.selected', true])
      }),
      amount:1
    }).end()

  } catch (e) {
    console.log(e)
  }
}
