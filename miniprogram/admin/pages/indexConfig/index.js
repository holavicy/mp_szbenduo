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

    wx.showLoading({
      title: '提交中',
      mask:'true'
    })

    wx.cloud.callFunction({
      name:'updateAdv',
      data: adv,
      success: (res) => {
        wx.navigateBack();
      },
      conmplete:()=>{
        wx.hideLoading();
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
      },
      fail: (err) => {
        console.log(err)
      }
    })
  }
})