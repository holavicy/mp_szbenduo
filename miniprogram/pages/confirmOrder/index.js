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
    wx.cloud.callFunction({
      name:'getValidCartList',
      success: (res)=>{
        wx.hideLoading();
        
        let totalFreightPrice = Math.floor((res.result.list[0].totalFreightPrice) * 100) / 100;
        let totalGoodsPrice = Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100;
        let totalNum = res.result.list[0].totalNum;

        if (totalGoodsPrice>=500){
          totalFreightPrice = 0;
        }

        let totalPrice = Math.floor((totalGoodsPrice + totalFreightPrice) * 100) / 100

        this.setData({
          goodsList:res.result.list[0].goodsList,
          totalFreightPrice: totalFreightPrice,
          initFreightPrice: totalFreightPrice,
          totalGoodsPrice: totalGoodsPrice,
          totalPrice: totalPrice,
          totalNum: totalNum
        })
      },
      fail: (err)=>{
        console.log(err);
        wx.hideLoading();
      }
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

  toOrderPay: function(){
    var timestamp = new Date().getTime()+'';
    var num = '';
    for (var i = 0; i < 3; i++) {
      num += Math.floor(Math.random() * 10);
    }

    let nonceStr = timestamp + '' + num;
    console.log(nonceStr)
    wx.requestPayment({
      timeStamp: timestamp,
      nonceStr: nonceStr,
      package: '',
      signType: '',
      paySign: '',
      success: (res) => {
        console.log(res);
        wx.redirectTo({
          url: '/pages/orderInfo/index?id=' + id
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  toOrderPay1:function(){
    //判断是否选择了地址
    let addressId = this.data.addressId;
    if (!addressId){
      wx.showToast({
        icon:'none',
        title: '请选择地址',
      })
      return
    }

    //创建订单

    //获取当前用户的所有选中的购物车内的有效商品，每个商品check num是否小于库存，若存在一个商品check失败，则整个订单提交失败，且提示：某某商品库存不足，请返回购物车重新操作
    //若所有商品check成功，order表创建订单，所有的商品在购物车表的status置为2，调用支付API


    wx.cloud.callFunction({
      name: 'getValidCartList',
      success: (res) => {
        wx.hideLoading();

        let totalFreightPrice = Math.floor((res.result.list[0].totalFreightPrice) * 100) / 100;
        let totalGoodsPrice = Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100;
        let totalNum = res.result.list[0].totalNum;

        if (totalGoodsPrice >= 500) {
          totalFreightPrice = 0;
        }

        if (this.data.isLogistic){
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

        let idsList = [];

        if (res && res.result && res.result.list.length > 0 && res.result.list[0].goodsList.length > 0) {
          let flag = true;
          var goodsList = res.result.list[0].goodsList;
          goodsList.map(goods => {
            if (flag) {
              idsList.push(goods._id);
              if (goods.num > goods.stock) {
                flag = false;
                wx.showToast({
                  title: goods.name + '库存不足，请返回购物车重新操作',
                })
              }
            }
          })
        }

        let data = {
          total_num: Number(totalNum),
          total_goods_price: Number(totalGoodsPrice),
          total_freight_price: Number(totalFreightPrice),
          total_price: Number(totalPrice),
          is_freight: this.data.isLogistic,
          address_id: this.data.addressId
        }

        wx.cloud.callFunction({
          name:'createOrder',
          data: {
            item:data
          },
          success: (res) => {

            if(res && res.result && res.result._id){
              let id = res.result._id


            //将商品插入order_goods表
              goodsList.map(goods => {
                
                delete goods._id;
                goods.order_id = id;

                wx.cloud.callFunction({
                  name:'addOrderGoods',
                  data: goods,
                  fail: (err) => {
                    console.log(err)
                  }
                })

                const db = wx.cloud.database();

                db.collection('goods').doc(goods.goods_id).update({
                  data:{
                    stock: goods.stock - goods.num
                  },
                  fail: (err) => {
                    console.log(err)
                  }
                  
                })
              })

              //购物车里面的商品要删除

              let ids = idsList.join(',');

              wx.cloud.callFunction({
                name: 'deleteCart',
                data: {
                  ids: ids
                },
                success: (res) => {
                  if (res && res.result && res.result.code == 0) {
                    wx.requestPayment({
                      timeStamp: '',
                      nonceStr: '',
                      package: '',
                      signType: '',
                      paySign: '',
                      success: (res) => {
                        console.log(res);
                        wx.redirectTo({
                          url: '/pages/orderInfo/index?id=' + id
                        })
                      }
                    })
                    
                  }
                }
              })

           
            }

          },
          fail: (err) => {
            console.log(err)
          }
        })


        // wx.requestPayment({
        //   'timeStamp': payInfo.timeStamp,
        //   'nonceStr': payInfo.nonceStr,
        //   'package': payInfo.package,
        //   'signType': payInfo.signType,
        //   'paySign': payInfo.paySign,
        //   'success': function (res) {
        //     // 跳转支付成功页面
        //     if (_that.data.systemPlatForm == 'android') {
        //       wx.redirectTo({
        //         url: '/pages/orderSuccess/index?orderId=' + _that.data.orderId + '&realAmount=' + _that.data.orderDetail.amount
        //       })
        //     } else {
        //       wx.reLaunch({
        //         url: '/pages/orderSuccess/index?orderId=' + _that.data.orderId + '&realAmount=' + _that.data.orderDetail.amount
        //       })
        //     }

        //   },
        //   'fail': function (res) {
        //     // 跳转支付失败页面

        //     wx.navigateTo({
        //       url: '/pages/orderFail/index?orderId=' + _that.data.orderId + '&realAmount=' + _that.data.orderDetail.amount
        //     })

        //   }
        // });
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
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
  }
})