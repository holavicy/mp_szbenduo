// miniprogram/pages/cart/index.js
var app = getApp();
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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.onGetOpenid()
            }
          })
        } else{
          this.setData({
            dealer_id: -1
          })
        }
      }
    })

  },

  getList: function(){
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getCartList',
      success: res => {

        res.result.list.map((group) => {
          if(group._id == 1){
            group.goodsList.map((goods) => {

              if(goods.num > goods.stock){
                //静默将该商品的num 改成 stock

                goods.num = goods.stock;

                wx.cloud.callFunction({
                  name:'updateCart',
                  data: {
                    goodsId: goods.goods_id,
                    num: goods.stock},
                  success: (res) => {

                    

                  }
                })
              }
            })
          }
        })

        this.setData({
          list: res.result.list
        })
      },
      complete: ()=>{
        wx.hideLoading()
        }
    })
  },

  getValidList: function(){

    wx.cloud.callFunction({
      name: 'getValidCartList',
      success: res => {

        if (res && res.result && res.result.list.length>0){
          this.setData({
            totalGoodsPrice: Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100,
            totalNum: (res.result.list[0].totalNum)
          })
        } else {
          this.setData({
            totalGoodsPrice: '0.00',
            totalNum: 0
          })
        }
        
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  reloadPage: function(){
    this.getList();
    this.getValidList();
  },

  deleteGoods: function(e){
    let status = e.currentTarget.dataset.status;
    let content = '确定清空所有' + (status == 3?'下架':status == 2?'失效':'')+'商品吗？'
    wx.showModal({
      content: content,
      confirmColor:'#3d6034',
      success: (res) => {
        if(res.confirm){
          let idsList = [];
          this.data.list.map((group)=>{
            if(group._id == status){
              group.goodsList.map((goods)=>{
                idsList.push(goods._id)
              })
            }
          })

          let ids = idsList.join(',');

          wx.cloud.callFunction({
            name:'deleteCart',
            data:{
              ids: ids
            },
            success: (res)=>{
              if(res && res.result && res.result.code == 0){
                wx.showToast({
                  title: '删除成功',
                });

                this.reloadPage()
              }
            }
          })
        }
      }
    })
  },

  toConfirm: function(){
    //判断是否选择了商品

    if(this.data.totalNum<1){
      wx.showToast({
        title: '请选择商品',
        icon:'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/confirmOrder/index',
    })
  },

  onGetOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {

        if (res && res.result && res.result.openid) {

          this.setData({
            dealer_id: res.result.openid
          })

          this.getList();
          this.getValidList();
        } else {
          this.setData({
            dealer_id: -1
          })

          wx.hideLoading()
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

})