// miniprogram/pages/search/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword:'',
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      keyword: options.keyword || ''
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

  //根据keyword获取list
  getList: function(){
    wx.showLoading();
    let keyword = this.data.keyword;
       const db = wx.cloud.database({
         env: app.globalData.env
       })
    // 查询当前用户所有的 counters
    db.collection('goods').where({
      status:1,
      name:{
        $regex: '.*' + keyword + '.*',	
        $options: 'i'	
      }

    }).orderBy('create_time', 'desc').get({
      success: res => {
        wx.hideLoading();
        this.setData({
          list:res.data
        })
      
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  //输入框事件
  bindKey: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  }
})