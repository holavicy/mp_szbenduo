// miniprogram/pages/createFreight/index.js

import { logisticCompanys } from '../../utils/logisticCompany.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id || ''
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
    this.setData({
      companyList: logisticCompanys
    })
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

  openLayer: function(){
    this.setData({
      companyLayer: true
    })
  },

  closeLayer: function(){
    this.setData({
      companyLayer: false
    })
  },

  setCompanyId: function(e){
    let companyId = e.currentTarget.dataset.companyid,
      companyName = e.currentTarget.dataset.companyname,
      expressCode = e.currentTarget.dataset.expresscode;
    this.setData({
      companyId: companyId,
      companyName: companyName,
      expressCode: expressCode,
      companyLayer: false
    })
  },

  bindInput: function(e){
    let _data = e.detail.value;

    this.setData({
      fexNo: _data.trim()
    })
  },

  submitFn: function () {
    var companyId = this.data.companyId;
    var fexNo = this.data.fexNo;
    var orderId = this.data.id;
    var companyName = this.data.companyName;
    var expressCode = this.data.expressCode;

    if (!companyId) {
      wx.showToast({
        title: '请选择快递公司',
        icon:'none'
      })
      return
    }

    if (!fexNo || fexNo.length > 20) {
      wx.showToast({
        title: '请正确填写快递单号',
        icon: 'none'
      })
      return
    }


    let _data = {
      'id': orderId,
      'expressId': companyId,
      'expressCode': expressCode,
      'expressName': companyName,
      'expressNo': fexNo
    }


    wx.showLoading({
      title: '提交中',
      mask: true
    })

    console.log(_data);

    wx.cloud.callFunction({
      name:'createOrderFreight',
      data: _data,
      success: (res) => {
        console.log(res);
        wx.hideLoading();

        wx.showToast({
          title: '提交成功',
        })

        setTimeout(function(){
          wx.navigateBack({

          })
        }, 1000)

      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: '发货失败',
          icon:'none'
        })
      }
    })
  },
})