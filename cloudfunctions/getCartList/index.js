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
    return await db.collection('cart').aggregate().match({
      status: 1,
      dealer_id: openId
    }).project({
      status: 0
      }).sort({
        create_time: -1
      })
      .lookup({
        from: 'goods',
        let: {
          goods_id: '$goods_id'
        },
        as: 'goodsList',
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$_id', '$$goods_id'])
          ])))
          .done()
      }).replaceRoot({
        newRoot: $.mergeObjects([$.arrayElemAt(['$goodsList', 0]), '$$ROOT'])
      }).addFields({
        goodsCount: $.size('$goodsList')
      }).match({
        goodsCount: _.gt(0)
      }).project({
        goodsList: 0
      }).group({
        _id: '$status',
        goodsList: $.push({
          _id: '$_id',
          name: '$name',
          descript: '$descript',
          image: '$image',
          price: '$price',
          stock: '$stock',
          unit: '$unit',
          goods_id: '$goods_id',
          num: '$num',
          image: '$image',
          is_selected: '$is_selected'
        })
      }).sort({
        _id: 1
      }).limit(1000)
      .end()
      .then(res => { return res })
      .catch(err => console.error(err))
  } catch (e) {
    console.log(e)
  }
}