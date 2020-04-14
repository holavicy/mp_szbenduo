// miniprogram/goods/goodsList/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currIndex:0,
    tabList:['已上架','已下架'],
    goodsList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currIndex:options.index || 0
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
    this.getList()
  },

  //获取商品列表
  getList: function(){
    wx.showLoading({
      title: '加载中',
    })

    let status = this.data.currIndex==0?1:3
    wx.cloud.callFunction({
      name:'getGoodsList',
      data:{
        status: status
      },
      success: (res) => {
        if(res && res.result && res.result.data && res.result.data.length>0){
          console.log(1)
          this.setData({
            goodsList: res.result.data
          })
        } else {
          console.log(2)
          this.setData({
            goodsList: []
          })
        }
      },
      fail:(err)=>{
        console.log(err);
        this.setData({
          goodsList: []
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },

  //tab切换
  setTab: function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      currIndex: index
    });

    this.getList();
  }
})