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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkAdmin().then((res) => {
      console.log(res);
      this.setData({
        isAdmin: res.isAdmin
      },()=>{
        this.getList();
      })
    });
    
  },

  checkAdmin: function(){
    return new Promise(( resolve, reject) => {
      wx.cloud.callFunction({
        name: 'checkAdmin',
        success: (res) => {

          if(res && res.result && res.result.data && res.result.data.length>0){
            resolve({isAdmin:true})
          } else {
            resolve({ isAdmin: false })
          }
          
        }
      })
    })
  },

  getList: function(){
    let status = this.data.currIndex;
    wx.showLoading({
      title: '加载中',
    })

    let data = {
      status: status == 0 ? '' : status
    }

    if(this.data.isAdmin){
      data.isAdmin = true
    }
    wx.cloud.callFunction({
      name:'getOrderList',
      data: data,
      success: (res) => {

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