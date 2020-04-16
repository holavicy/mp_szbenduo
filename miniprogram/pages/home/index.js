// miniprogram/pages/home/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword:'',
    list: [],
    selectedIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAdv();
    this.getList((list) => {

      if (list && list.length > 0) {
        this.setData({
          showList: list[0].goodsList
        })
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //点击导航，显示当前的分类下的商品
  setShowList: function(e){
    let index = e.currentTarget.dataset.index;
    let showList = this.data.list[index].goodsList;
    this.setData({
      selectedIndex:index,
      showList: showList
    })
  },

  //获取列表
  getList: function(callback){
    this.setData({
      list:[],
      selectedIndex:0
    })
    wx.showLoading()
    wx.cloud.callFunction({
     
      name: 'getCateAndGoods',
      success: res => {

        if(res && res.result && res.result.list){
          this.setData({
            list: res.result.list
          })

          callback && callback(res.result.list)
        }

        
      },
      complete: ()=>{
        wx.hideLoading()
      }
    })
  },

  //跳转搜索页
  toSearch:function(){
    let keyword = this.data.keyword;
    wx.navigateTo({
      url: '/pages/search/index?keyword='+keyword,
    })
  },

  //输入框事件
  bindKey:function(e){
    this.setData({
      keyword: e.detail.value
    })
  },

//获取广告列表
  getAdv: function () {
    wx.cloud.callFunction({
      name: 'getAdv',
      success: (res) => {
        this.setData({
          adv: res.result.data[0]
        })
      }
    })
  }
})