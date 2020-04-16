// miniprogram/admin/pages/indexConfig/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
    this.getAdv();
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

  inputValue: function(e){
    let value = e.detail.value;
    let adv = this.data.adv;

    adv.contents = value;

    this.setData({
      adv: adv
    })
  },

  reset: function(){
    let adv = this.data.adv; 
    adv.contents = '';
    this.setData({
      adv: adv
    })
  },

  submit: function(){
    let adv = this.data.adv;
    adv.contents = adv.contents;

    wx.cloud.callFunction({
      name:'updateAdv',
      data: adv,
      success: (res) => {
        console.log(res)
      }
    })
  },

  getAdv: function(){
    wx.cloud.callFunction({
      name:'getAdv',
      success: (res) => {
        this.setData({
          adv: res.result.data[0]
        })
      }
    })
  }
})