// miniprogram/pages/orderInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    down: true,
    isAdmin: 0
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
    this.getList();

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
      }
    })
  },

  getList: function () {
    let id = this.data.id;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: {
        id: id
      },
      success: (res) => {

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
              console.log(res);

              wx, wx.hideLoading();
              wx.showToast({
                title: '订单已取消',
              })

              wx.navigateBack({})
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
            console.log(2);

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
                wx.navigateBack({
                  
                })
                console.log(res)
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
          console.log(2);

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
              console.log(res)
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  }
})