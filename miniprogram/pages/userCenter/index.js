// miniprogram/pages/userCenter/index.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    avatarUrl: '',
    isAdmin:0,  //1是管理员，2不是管理员

    cateNum:0,
    onSaleGoodsNum:0,
    offSaleGoodsNum:0,

    unPayOrderNum:0,
    unFreightOrderNum:0,
    unConfirmOrderNum:0,
    finishedOrderNum:0,
    totalOrderNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName
              })
              this.onGetOpenid()
            }
          })
        }
      }
    }),

    app.getCartNum();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      dealerId: app.globalData.openid
    })

    if (app.globalData.openid) {
      this.onGetOpenid();
    }

  },
  confirmGetUserInfo:function(){
    this.setData({
      modalShow: true
    })
  },
  cancel: function(){
    this.setData({
      modalShow:false
    })
  },
  //获取用户的昵称和头像
  onGetUserInfo: function (e) {
    this.setData({
      modalShow:false
    })
    if (e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      })
      app.globalData.userInfo = e.detail.userInfo;
      this.onGetOpenid()
    }
  },

  //获取openId
  onGetOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {

        if(res && res.result && res.result.openid){
          app.globalData.openid = res.result.openid;
          this.setData({
            dealerId: app.globalData.openid
          })

          wx.cloud.callFunction({
            name:'checkAdmin',
            success: (e)=>{

              if (e && e.result && e.result.data && e.result.data.length>=1){
                this.setData({
                  isAdmin:1
                })
              } else {
                this.setData({
                  isAdmin: 2
                })
              }
              this.getOrderCount();
              if(this.data.isAdmin == 1){
                this.getCateCount();
                this.getGoodsCount();
              }
              
            }
          })
        }
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  //获取所有的分类数
  getCateCount: function(){
    wx.cloud.callFunction({
      name:'getCategoryList',
      success: (res) => {
        if (res && res.result && res.result.data && res.result.data.length){
          this.setData({
            cateNum: res.result.data.length
          })
        } else{
          this.setData({
            cateNum: 0
          })
        }
      }
    })
  },

  //获取所有的商品
  getGoodsCount: function () {
    this.setData({
      onSaleGoodsNum:0,
      offSaleGoodsNum:0
    })
    const db = wx.cloud.database({
      env: app.globalData.env
    });
    const _ = db.command;
    const $ = db.command.aggregate
    // 查询当前用户所有的 counters

    db.collection('goods').aggregate()
    .group({
      _id: '$status',
      num: $.sum(1)
    })
      .end().then((res) => {

        let resList = res.list;

        resList.map((item) => {
          if (item._id == 1) {
            this.setData({
              onSaleGoodsNum: item.num || 0,
            })
          }

          if (item._id == 3) {
            this.setData({
              offSaleGoodsNum: item.num || 0,
            })
          }
        })
      })
  },

  setRead: function(){
    let read = this.data.read;

    this.setData({
      read: !read
    })
  },

  //获取各类订单的数据

  getOrderCount: function(){
    this.setData({
      unPayOrderNum: 0,
      unFreightOrderNum: 0,
      unConfirmOrderNum: 0,
      finishedOrderNum: 0
    })
    let isAdmin = this.data.isAdmin;

    isAdmin = isAdmin==2?false:isAdmin == 1?true:false
    wx.cloud.callFunction({
      name:'getOrderCount',
      data:{
        isAdmin: isAdmin
      },
      success: (res) => {

        res.result.list.map((item) => {
          if (item._id == 1) {
            this.setData({
              unPayOrderNum: item.num
            })
          }

          if (item._id == 2) {
            this.setData({
              unFreightOrderNum: item.num
            })
          }

          if (item._id == 3) {
            this.setData({
              unConfirmOrderNum: item.num
            })
          }

          if (item._id == 4) {
            this.setData({
              finishedOrderNum: item.num
            })
          }
        })
      }
    })
  },

  contactUs: function(){
    let _phoneNum = '18913262333';
    if (_phoneNum) {
      wx.makePhoneCall({
        phoneNumber: _phoneNum,
        success: function () {
          console.log("拨打电话成功！")
        },
        fail: function () {
          console.log("拨打电话失败！")
        }
      })
    }
  }
})