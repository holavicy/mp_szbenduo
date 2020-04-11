// miniprogram/pages/orderList/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList:['全部','待付款','待发货','待收货','已完成','已取消']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currIndex: options.status? Number(options.status) : ''
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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getList: function(){
    let status = this.data.currIndex;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'getOrderList',
      data:{
        status: status == 0 ? '' : status
      },
      success: (res) => {
        console.log()

        if(res && res.result && res.result.list){
          this.setData({
            list: res.result.list
          })
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  setTab: function(e){
    let index = e.currentTarget.dataset.index;

    this.setData({
      currIndex: index
    })

    this.getList()
  },

  toOrderInfo: function(e){
    let id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '/pages/orderInfo/index?id='+id,
    })
  },

  bindscrolltolower: function(){
    console.log(21)
  }
})