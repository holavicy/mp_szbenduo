// miniprogram/pages/goodsInfo/index.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    goodsInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      dealer_id: app.globalData.openid
    })
    this.setData({
      id: options.id || ''
    }, ()=>{
      this.getList(options.id);
    });
    
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
    // this.getList();
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

  getList: function(id){
    // id ="f3db088f5e8484ef003eab5b5c64380e"
    wx.cloud.callFunction({
      name:'getGoodsInfo',
      data:{
        "id": id
      },
      success: (res)=>{
        console.log(res)

        let goodsInfo = res.result.data[0]
        goodsInfo.imgList = goodsInfo.images.split(',');
        goodsInfo.num = 1;
        this.setData({
          goodsInfo: goodsInfo
        })
        console.log(res)
      },

      fail: (err) => {
        console.log(err)
      }
    })
  },

  updateNum: function(e){
    let type = e.currentTarget.dataset.type;

    console.log(type);

    let goodsItem = this.data.goodsInfo;

    if(type == 2){
      goodsItem.num ++;
    }

    if(type == 1){
      goodsItem.num --;
    }

    this.setData({
      goodsInfo: goodsItem
    })
  },

  setNum: function(e){
    let num = e.detail.value.trim();
    let goodsItem = this.data.goodsInfo;
    goodsItem.num = num;

    this.setData({
      goodsInfo: goodsItem
    })
  },

  addToCart: function(){
    wx.showLoading({
      title: '',
    })
    let num = Number(this.data.goodsInfo.num);
    let goodsId = this.data.id;

    wx.cloud.callFunction({
      name:'addCart',
      data:{
        goodsId: goodsId,
        incNum:num
      },
      success: (res) => {
        wx.hideLoading()
        console.log(res);

        if (res && res.result && res.result.result && res.result.result.code == 0){
          wx.showToast({
            title: '加入购物车成功',
          })

          this.getList(this.data.id);
        } else if (res && res.result && res.result.code == -1) {
          wx.showToast({
            title: res.result.msg || '加入购物车失败',
            icon:'none'
          })
        }
      },
      fail: (err) =>{
        wx.hideLoading();
        console.log(err)
      }
    })
  },

  preview: function(e){
    let index = e.currentTarget.dataset.index;

    let url = this.data.goodsInfo.imgList[index];

    wx.previewImage({
      current:url,
      urls: this.data.goodsInfo.imgList
    })
  }
})