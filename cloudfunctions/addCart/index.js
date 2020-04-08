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

  let data = {
    openId: openId,
    goodsId: event.goodsId,
  }

  if (event.num && event.num > 0) {
    data.num = event.num
  }

  if (event.incNum && event.incNum > 0) {
    data.incNum = event.incNum
  }

  //获取当前商品在购物车里面的数量

  const res1 = await db.collection('cart').where({
    dealer_id: openId,
    goods_id: event.goodsId,
    status: 1
  }).get()

  let num = res1 && res1.data && res1.data.length > 0 ? res1.data[0].num : 0;

  //获取当前商品的库存
  const res = await db.collection('goods').where({
    _id: event.goodsId
  }).get()

  let stock = res.data[0].stock;

  if (num >= stock || data.num > stock || num + data.incNum > stock) {
    return {
      code: -1,
      stock: stock,
      msg: '库存告急喽'
    }
  } else {
    if (num > 0) {
      return await cloud.callFunction({
        name: 'updateCart',
        data: data
      })

    } else {

      return await cloud.callFunction({
        name: 'insertCart',
        data: data
      })
    }
  }
}