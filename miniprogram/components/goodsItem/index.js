
// components/goodsItem/index.js
Component({
  externalClasses: ['cus-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    goods:{
      type:'Object',
      value:{}
    },
    switch:{
      type:'Bollean',
      value:false
    },
    cart:{
      type:Boolean,
      value:false
    },
    toCart: {
      type: 'Bollean',
      value: false
    },
    numChange:{
      type: 'Bollean',
      value: false
    },
    topAction: {
      type: 'Bollean',
      value: false
    },
    delGoods:{
      type: 'Bollean',
      value: false     
    },
    linkType: {
      type:Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // dealer_id: app.globalData.openid
  },

  ready: function(){
    
    setTimeout(()=>{
      let app = getApp();
      this.setData({
        dealer_id: app.globalData.openid
      })
    },1000)

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //商品上下架
    switchChange: function (e) {
      let id = e.currentTarget.dataset.id;

      const db = wx.cloud.database()
      const status = e.detail.value?1:3;
      console.log(status)

      wx.cloud.callFunction({
        name:'updateGoodsStatus',
        data:{
          id:id,
          status:status
        },
        success: (res) => {
          console.log(res);

          if(res.result.code == 0){
            wx.showToast({
              title: status == 1 ? '上架成功' : '下架成功',
            })
            this.triggerEvent("switchChange")
          }
        },
        fail: (err) => {
          console.log(err)
        }
      })
    },

    //加入购物车
    toCart:function(e){
      const db = wx.cloud.database();
      wx.showLoading({
        title: '',
        mask: true
      })
      
      let goodsId = e.currentTarget.dataset.id;
      wx.cloud.callFunction({
        name: 'addCart',
        data:{
          goodsId: goodsId
        },
        success: res => {
          wx.hideLoading()

          if(res && res.result){
            if (res.result.result && res.result.result.code == 0) {
              this.getCartNum().then((res) => {
                console.log(res)
              })
              wx.showToast({
                title: '加入购物车成功',
              })
            } else if (res.result.code == -1){
              wx.showToast({
                title: res.result.msg || '加入购物车失败',
                icon: 'none'
              })
            } else {
              wx.showToast({
                title: '加入购物车失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    //选择或不选择商品
    triggerSelect: function(e){
      wx.showLoading({
        title: '',
        mask:true
      })
      let cartId = e.currentTarget.dataset.id;
      let isSelected = !e.currentTarget.dataset.select ;

      console.log(cartId, isSelected)
      wx.cloud.callFunction({
        name: 'updateCartSelect',
        data: {
          cartId: cartId,
          isSelected: isSelected
        },
        success: res => {
          this.triggerEvent("selectSuccess")
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    },

    //改变数量
    updateNum: function(e){
      let type = e.currentTarget.dataset.type; // 1:减一 2：加一
      let cartId = e.currentTarget.dataset.id;
      let num = e.currentTarget.dataset.num;
      let stock = e.currentTarget.dataset.stock;
      let goodsId = e.currentTarget.dataset.gid;

      if(type == 1){
        if(num>1){
          num--;
          this.updateNumRes(num, goodsId);
        } else {
          this.deleteCartRes(cartId);
        }
      } else {
        if (num >= stock){
          wx.showToast({
            icon:'none',
            title: '库存不够啦',
          })
          return
        } else {
          num++;
          this.updateNumRes(num, goodsId);
        }

      }
    },

    //进入商品详情页
    toGoodsInfo: function(e){
      let id = e.currentTarget.dataset.id;

      let linkType = this.data.linkType;

      if(linkType == 1){
        wx.navigateTo({
          url: '/pages/goodsInfo/index?id=' + id,
        })
      }

      if(linkType == 2){
        wx.navigateTo({
          url: '/goods/pages/addGoods/index?id=' + id,
        })
      }

      
    },

    //删除商品
    deleteCart: function(e){
      let id = e.currentTarget.dataset.id;
      this.deleteCartRes(id);
    },

    //从购物车删除商品请求
    deleteCartRes: function(id){
      let that = this;

      wx.showModal({
        content: '确定从购物车移除当前商品？',
        confirmColor: '#3d6034',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              mask: true
            })

            wx.cloud.callFunction({
              name: 'deleteCart',
              data: {
                ids: id,
              },
              success: res => {
                wx.hideLoading();
                that.getCartNum().then((res) => {
                  console.log(res)
                })
                that.triggerEvent("deleteSuccess")
                wx.showToast({
                  title: '删除成功',
                })
              },
              fail: err => {
                wx.hideLoading()
                console.log(err);
                wx.showToast({
                  title: '删除失败',
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    //更新商品数量请求
    updateNumRes: function (num, goodsId){
      let that = this;
      console.log(num, goodsId)
      wx.cloud.callFunction({
        name: 'updateCart',
        data: {
          num: num,
          goodsId: goodsId
        },
        success: res => {
          wx.hideLoading();
          this.getCartNum().then((res) => {
            console.log(res)
          })
          that.triggerEvent("updateSuccess")
        },
        fail: err => {
          wx.hideLoading()
          console.log(err);
          wx.showToast({
            title: '操作失败',
          })
        }
      })
    },

    //删除商品
    deleteGoods: function(e){
      let id = e.currentTarget.dataset.id;
      let that = this;

      wx.showModal({
        content: '确定删除此商品？',
        confirmColor: '#3d6034',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              mask: true
            })

            wx.cloud.callFunction({
              name: 'deleteGoods',
              data: {
                ids: id,
              },
              success: res => {
                wx.hideLoading();
                that.triggerEvent("deleteSuccess")
                wx.showToast({
                  title: '删除成功',
                })
              },
              fail: err => {
                wx.hideLoading()
                console.log(err);
                wx.showToast({
                  title: '删除失败',
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    //获取购物车数量
    getCartNum: function () {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'getValidCartList',
          success: (res) => {
            if (res && res.result && res.result.list.length>0) {
              let num = String(res.result.list[0].totalNum)
              let data = {
                num: num
              }
              wx.setTabBarBadge({//tabbar右上角添加文本
                index: 1, ////tabbar下标
                text: data.num //显示的内容
              })
              resolve(data)
            } else {
              wx.removeTabBarBadge({//tabbar右上角添加文本
                index: 1
              })
            }
            
          }
        })
      })
      
    }
  }
})
