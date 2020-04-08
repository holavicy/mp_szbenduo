// miniprogram/pages/addressList/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type || '',
      id:options.id || ''
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

  getList: function(){
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getAddressList',
      success: res => {
        this.setData({
          list: res.result.data
        })
      },
      complete:()=>{
        wx.hideLoading()
      }
    })
  },

  //跳转详情页
  toInfo: function(e){
    let id = e.currentTarget.dataset.id;
    console.log(id)
    wx.navigateTo({
      url: '/address/pages/add/index?id='+id,
    })
  },

  selectAddress: function(e){
    let id = e.currentTarget.dataset.id;

    this.setData({
      id:id
    })

    //判断当前页面的类型,若type == 1
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1] || [];
    var prevPage = pages[pages.length - 2] || [];     //获取上一个页面

    prevPage.setData({
      addressId: id
    })

    wx.navigateBack({})
  }
})