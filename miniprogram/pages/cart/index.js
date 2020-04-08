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
    this.setData({
      dealer_id: app.globalData.openid
    })
    if (app.globalData.openid){
      this.getList();
      this.getValidList();
    }
  },

  getList: function(){
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getCartList',
      success: res => {
        console.log(res)

        res.result.list.map((group) => {
          if(group._id == 1){
            group.goodsList.map((goods) => {
              console.log(goods.num, goods.stock);

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
            totalGoodsPrice: Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100
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
    let content = '确定删除所有' + (status == 2 ? '无效' : status == 3 ? '下架' : '') + '商品？';
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
    wx.navigateTo({
      url: '/pages/confirmOrder/index',
    })
  }


})