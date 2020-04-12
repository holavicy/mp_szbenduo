// miniprogram/admin/pages/saleConfig/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rule: {}
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
    this.getActivityRule();
  },

  getActivityRule: function(){
    wx.cloud.callFunction({
      name:'getActivityRule',
      data:{
        type:1
      },
      success: (res) => {
        console.log(res);
        let rule = res.result.list[0];

        if(rule.list.length<1){
          rule.list.push({
            status:1,
            limitAmount:'',
            cutAmount:''
          })
        }
        this.setData({
          rule: rule
        })
      },
      complete: (res) => {
        wx.hideLoading()
      }
    })
  },

  bindStartDateChange: function (e) {
    let rule = this.data.rule;
    rule.start_date = e.detail.value;
    this.setData({
      rule: rule
    })
  },

  bindEndDateChange: function (e) {
    let rule = this.data.rule;
    rule.end_date = e.detail.value;
    this.setData({
      rule: rule
    })
  },

  addRule: function(){
    let rule = this.data.rule;

    rule.list.push({
      limitAmount:'',
      cutAmount:'',
      status:1
    })

    this.setData({
      rule: rule
    })
  },

  delRule: function(e){
    let rule = this.data.rule;
    let index = e.currentTarget.dataset.index;

    rule.list.splice(index,1);
    this.setData({
      rule:rule
    })
  },

  limitAmount: function(e){
    let rule = this.data.rule;
    let index = e.currentTarget.dataset.index;
    let val = e.detail.value;
    rule.list[index].limitAmount = Number(val);
    this.setData({
      rule: rule
    })
  },

  cutAmount: function (e) {
    let rule = this.data.rule;
    let index = e.currentTarget.dataset.index;
    let val = e.detail.value;
    rule.list[index].cutAmount = Number(val);
    this.setData({
      rule: rule
    })
  },

  setStatus:function(e){
    let val = e.detail.value;
    let rule = this.data.rule;

    if(val){
      rule.start_status = 1
    } else {
      rule.start_status = 2
    }

    this.setData({
      rule:rule
    })
  }
})