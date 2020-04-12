// miniprogram/address/pages/freight/index.js
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCityRules();
  },

  setCity: function (e) {
    let index = e.currentTarget.dataset.index;


let cityRule = this.data.cityRule;
    let cityList = cityRule.cityList;
    cityList[index].selected = !cityList[index].selected;

    this.setData({
      cityRule: cityRule
    })
  },

  getCityRules: function () {
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getCityRules',
      success: (res) => {
        console.log(res.result.data);
        this.setData({
          cityRule: res.result.data[0]
        })
      },
      complete: ()=>{
        wx.hideLoading()
      }
    })
  },

  submit: function(){
    wx.showLoading({
      title: '',
    })
    let cityRule = this.data.cityRule;

    wx.cloud.callFunction({
      name:'updateCityRule',
      data: cityRule,
      success: (res) => {
        console.log(res);
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          mask: true
        });
        setTimeout(function () {
          wx.navigateBack({

          })},1000)

      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  reset: function(){
    let cityRule = this.data.cityRule;

    cityRule.amount = 0;
    cityRule.cityList.map((item) => {
      item.selected = false
    })

    this.setData({
      cityRule: cityRule
    })
  },

  amount: function(e){
    let amount = e.detail.value;

    let cityRule = this.data.cityRule;

    cityRule.amount = amount;

    this.setData({
      cityRule: cityRule
    })
  }
})