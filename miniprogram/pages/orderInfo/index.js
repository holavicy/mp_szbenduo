// miniprogram/pages/orderInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    down: true,
    isAdmin: 0,
    orderStatusObj:{
      1:{
        info:'订单待支付',
        subInfo:'请尽快支付哦'
      },
      2: {
        info: '订单待发货',
        subInfo: '客官别急，我们正在为您打包包裹'
      },
      3: {
        info: '订单待收货',
        subInfo: '包裹正在快马加鞭向您赶来'
      },
      4: {
        info: '订单已完成',
        subInfo: '欢迎再次下单哦'
      },
      5: {
        info: '订单已取消',
        subInfo: '期待下次为您服务'
      },
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id || ''
    })
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

    wx.cloud.callFunction({
      name: 'checkAdmin',
      success: (e) => {

        if (e && e.result && e.result.data && e.result.data.length >= 1) {
          this.setData({
            isAdmin: 1
          })
        } else {
          this.setData({
            isAdmin: 2
          })
        }

        this.getList();
      }
    })
  },

  getList: function () {
    let id = this.data.id;
    let isAdmin = this.data.isAdmin == 1?true:false;
    console.log(isAdmin)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: {
        id: id,
        isAdmin: isAdmin
      },
      success: (res) => {
        console.log(res)

        if (res && res.result && res.result.list) {
          this.setData({
            order: res.result.list[0]
          })
          this.getAddressInfo(res.result.list[0].address_id)
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  scrollGoodsWrapper: function(){
    this.setData({
      down: !this.data.down
    })
  },

  getAddressInfo: function (id) {

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

  //取消订单
  cancelOrder: function(){

    let id = this.data.id;
    wx.showModal({
      title: '',
      content: '确定取消该订单?',
      confirmColor: '#3d6034',
      success: (res) => {
        if(res.confirm){
          wx.showLoading({
            mask: true
          })
          wx.cloud.callFunction({
            name: 'cancelOrder',
            data: {
              id: id
            },
            success: (res) => {

              //把订单里面的商品逐一加上购物车里面的数量
              let goodsList = this.data.order.goodsList;
              let updatePromise = [];
              goodsList.map((goods) => {
                let promise = this.updateGoodsStock(goods);
                updatePromise.push(promise)
              })

              Promise.all(updatePromise).then(result => {
                wx, wx.hideLoading();
                wx.showToast({
                  title: '订单已取消',
                })
  
                setTimeout(function(){
                  wx.navigateBack({})
                },1000)
              })
            },

            fail: (err) => {
              console.log(err);
              wx.hideLoading()
            }
          })
        }
      }
    })


  },

  //去发货
  toCreateFreight: function(){
    let isLogistic = this.data.order.is_freight;

    if (isLogistic){
      wx.showModal({
        title: '同城配送',
        content: '该订单是同城配送单，确定已配送？',
        confirmColor:'#3d6034',
        success: (res) => {
          if(res.confirm){

            wx.showLoading({
              title: '',
              mask: true
            })
            wx.cloud.callFunction({
              name:'updateOrderStatus',
              data:{
                id: this.data.id,
                status: 3
              },
              success: (res) => {

                wx.showToast({
                  title: '发货成功',
                })

                setTimeout(function(){
                  wx.navigateBack({

                  })
                }, 1000)

              },
              complete: () => {
                wx.hideLoading()
              }
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/createFreight/index?id=' + this.data.id,
      })
    }

  },

  //支付
  toOrderPay: function(){
    wx.showLoading({
      title: '',
      mask: true
    })
    let body = '共' + this.data.order.total_num + '件商品';
    wx.cloud.callFunction({
      name: 'getPay',
      data: {
        total_fee: parseFloat(this.data.order.total_price).toFixed(2) * 100,
        attach: 'anything',
        body: body
      },
      success: (res) => { //调用支付接口
        this.payAPI(res, this.data.id)
      },
      fail: (err) => {
        console.log(err);
        this.payErr();
      }
    })
  },

  //调用支付接口
  payAPI: function (res, id) {
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
            wx.hideLoading()
            this.getList();
          },
          fail: (err) => {
            console.log(err);
            wx.hideLoading()
            this.getList();
          }
        })
      },
      fail: (err) => {
        this.getList();
      }
    })
  },

  //支付错误回调方法
  payErr: function () {
    wx.hideLoading();
    wx.showToast({
      title: '客观别急，请稍后再试',
      icon: 'none'
    })
  },

  confirmOrder: function(){

    wx.showModal({
      title: '确认收货',
      content: '确定已收到包裹？',
      confirmColor: '#3d6034',
      success: (res) => {
        if (res.confirm) {

          wx.showLoading({
            title: '',
            mask: true
          })
          wx.cloud.callFunction({
            name: 'updateOrderStatus',
            data: {
              id: this.data.id,
              status: 4
            },
            success: (res) => {
              wx.navigateBack({

              })
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  } ,

    //更新商品库存
    updateGoodsStock: function (goods) {
      const db = wx.cloud.database();
      const _ = db.command
      var p = new Promise((resolve, reject) => {
  
        db.collection('goods').doc(goods.goods_id).update({
          data: {
            stock: _.inc(goods.num)
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
    }
})