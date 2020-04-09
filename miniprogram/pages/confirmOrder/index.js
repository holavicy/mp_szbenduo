// miniprogram/pages/confirmOrder/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressId:'',
    goodsList:[],
    isLogistic:false,
    totalFreightPrice:0,
    totalGoodsPrice:0,
    totalPrice:0,
    addressItem:{},
    down:true //标志商品列表展开或收起
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList();
    this.getAddressInfo();
  },

//获取信息
  getList: function(){
    wx.showLoading();
    this.getValidCartGoods().then((res)=>{
      wx.hideLoading();
    })
  },

//选择地址
  toAddress:function(){
    let addressId = this.data.addressId;

    wx.navigateTo({
      url: '/address/pages/list/index?id=' + addressId+'&type=1',
    })
  },

  //获取地址信息
  getAddressInfo: function(){
    let id = this.data.addressId;

    wx.cloud.callFunction({
      name: 'getAddressInfo',
      data: {
        id: id
      },
      success: res => {
        this.setData({
          addressItem: res.result.data[0]
        })
      }
    })
  },

//跳转商品详情页
  toGoodsInfo: function(e){
    let id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '/pages/goodsInfo/index?id='+id,
    })
  },

  //跳转支付页

  toOrderPay:function(){
    //判断是否选择了地址
    let addressId = this.data.addressId;
    if (!addressId){
      wx.showToast({
        icon:'none',
        title: '请选择地址',
      })
      return
    }

    wx.showLoading({
      title: '订单提交中',
    })

    this.getValidCartGoods().then( (res)=> {
      let idsList = [];

      //校验库存是否充足
      if (res && res.result && res.result.list.length > 0 && res.result.list[0].goodsList.length > 0) {
        let flag = true;
        var goodsList = res.result.list[0].goodsList;
        goodsList.map(goods => {
          if (flag) {
            idsList.push(goods._id);
            if (goods.num > goods.stock) {
              wx.hideLoading();
              flag = false;
              wx.showToast({
                title: goods.name + '库存不足，请返回购物车重新操作',
              })
            }
          }
        })

        if(flag){ //若商品库存充足，则创建订单，创建订单商品关联，创建订单地址关联，库存减少，删除购物车的数据，发起微信支付
          let data = {
            total_num: Number(this.data.totalNum),
            total_goods_price: Number(this.data.totalGoodsPrice),
            total_freight_price: Number(this.data.totalFreightPrice),
            total_price: Number(this.data.totalPrice),
            is_freight: this.data.isLogistic,
            address_id: this.data.addressId
          }

          wx.cloud.callFunction({
            name: 'createOrder',
            data: {
              item: data
            },
            success: (res) => {

              if (res && res.result && res.result._id) {//将商品插入order_goods表
                var order_id = res.result._id;
                const db = wx.cloud.database();

                let promiseList = [];
                goodsList.map(goods => {
                  var createPromise = this.createGoodsRel(goods, order_id);
                  promiseList.push(createPromise);
                })

                Promise.all(promiseList).then((result) => {
                  let success = true
                  result.map(res => {
                    if(success){
                      if (res.result.code != 0) {
                        success = false
                      }
                    }
                  });

                  if (success) {//更新库存
                    let updatePromise = [];

                    goodsList.map((goods) => {
                      let promise = this.updateGoodsStock(goods);
                      updatePromise.push(promise)
                    })

                    Promise.all(updatePromise).then(result => {
                      let upSuccess = true
                      result.map(res => {
                        if (upSuccess) {
                          if (res.errMsg.indexOf('ok') < 0) {
                            upSuccess = false
                          }
                        }
                      });

                      if (upSuccess) {//购物车里面的商品要删除

                        let ids = idsList.join(',');

                        wx.cloud.callFunction({
                          name: 'deleteCart',
                          data: {
                            ids: ids
                          },
                          success: (res) => { //获取签名等支付参数
                            if (res && res.result && res.result.code == 0) {

                              let body = '共' + this.data.totalNum + '件商品';
                              wx.cloud.callFunction({
                                name: 'getPay',
                                data: {
                                  total_fee: parseFloat(this.data.totalPrice).toFixed(2) * 100,
                                  attach: 'anything',
                                  body: body
                                },
                                success: (res) => { //调用支付接口
                                  this.payAPI(res, order_id)
                                },
                                fail: (err) => {
                                  console.log(err);
                                  this.payErr();
                                }
                              })

                            } else {
                              this.payErr(); 
                            }
                          },
                          fail: (err) => {
                            console.log(err);
                            this.payErr(); 
                          }
                        })
                      } else {
                        this.payErr();    
                      }
                    })
                  } else {
                    this.payErr();
                  }
                }).catch((error) => {
                  console.log(error);
                  this.payErr();
                })
              }

            },
            fail: (err) => {
              console.log(err)
            }
          })
        }
      } else {
        this.payErr();
      }
    })
  },

  switchChange:function(e){
    let isLogistic = e.detail.value;
    let totalFreightPrice = 0,
    totalPrice = 0;

    if (isLogistic){
      totalFreightPrice=0;
    } else {
      totalFreightPrice = this.data.initFreightPrice;
    }

    totalPrice = Math.floor((this.data.totalGoodsPrice + totalFreightPrice) * 100) / 100


    this.setData({
      isLogistic: e.detail.value,
      totalFreightPrice: totalFreightPrice,
      totalPrice: totalPrice
    })
  },

  scrollGoodsWrapper: function(){
    this.setData({
      down: !this.data.down
    })
  },

  //获取信息
  getValidCartGoods: function(){
    return new Promise( (resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getValidCartList',
        success: (res) => {

          let totalFreightPrice = Math.floor((res.result.list[0].totalFreightPrice) * 100) / 100;
          let totalGoodsPrice = Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100;
          let totalNum = res.result.list[0].totalNum;

          if (totalGoodsPrice >= 500) {
            totalFreightPrice = 0;
          }

          if (this.data.isLogistic) {
            totalFreightPrice = 0;
          }

          let totalPrice = Math.floor((totalGoodsPrice + totalFreightPrice) * 100) / 100

          this.setData({
            goodsList: res.result.list[0].goodsList,
            totalFreightPrice: totalFreightPrice,
            initFreightPrice: totalFreightPrice,
            totalGoodsPrice: totalGoodsPrice,
            totalPrice: totalPrice,
            totalNum: totalNum
          })

          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          wx.hideLoading();
          reject(err)
        }
      })
    })
  },

  //创建订单和商品之间的联系
  createGoodsRel: function(goods, id){
    var p = new Promise((resolve, reject) => {

      delete goods._id;
      goods.order_id = id;

      wx.cloud.callFunction({
        name: 'addOrderGoods',
        data: goods,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          this.payErr();
        }
      })
 
    })
    return p
  },

  //更新商品库存
  updateGoodsStock: function (goods) {
    const db = wx.cloud.database();
    var p = new Promise((resolve, reject) => {

      db.collection('goods').doc(goods.goods_id).update({
        data: {
          stock: goods.stock - goods.num
        },
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          this.payErr();
        }

      })
    })
    return p
  },

  //调用支付接口
  payAPI: function(res, id){
    wx.requestPayment({
      appId: res.result.appid,
      timeStamp: res.result.timeStamp,
      nonceStr: res.result.nonce_str,
      package: 'prepay_id=' + res.result.prepay_id,
      signType: 'MD5',
      paySign: res.result.paySign,
      success: res => {
        wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: {
            id: id,
            status: 2
          },
          success: (res) => {
            console.log(res)
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/orderInfo/index?id=' + id
            })
          },
          fail: (err) => {
            console.log(err);
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/orderInfo/index?id=' + id
            })
          }
        })
      },
      fail: (err) => {
        wx.redirectTo({
          url: '/pages/orderInfo/index?id=' + id
        })
      }
    })
  },

  //支付错误回调方法
  payErr: function(){
    wx.hideLoading();
    wx.showToast({
      title: '客观别急，请稍后再试',
      icon: 'none'
    })
  }
})