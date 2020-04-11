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
    wx.showLoading({
      mask: true
    })

    let id = this.data.id;

    wx.cloud.callFunction({
      name:'cancelOrder',
      data:{
        id:id
      },
      success: (res) => {
        console.log(res);

        wx,wx.hideLoading();
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
  },

  //去发货
  toCreateFreight: function(){
    wx.navigateTo({
      url: '/pages/createFreight/index?id='+ this.data.id,
    })
  }
})