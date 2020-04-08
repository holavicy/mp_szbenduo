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
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters

    let status = this.data.currIndex==0?1:3
    db.collection('goods').where({
      status: status
    }).orderBy('create_time', 'desc').get({
      success: res => {
        console.log(res.data);
        this.setData({
          goodsList: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询商品失败'
        })
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