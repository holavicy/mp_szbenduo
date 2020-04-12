// miniprogram/pages/confirmOrder/index.js

import { formatDate } from '../../utils/common.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressId:'',
    goodsList:[],
    isLogistic:false,
    totalFreightPrice:0,
    totalGoodsPrice:0,
    totalPrice:0,
    addressItem:null,
    freeBaseAmount: -1,
    canCityFreight: false,
    down:true //标志商品列表展开或收起
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
    let p1 = this.getActivityRule();
    let p2 = this.getDefaultAmount();
    let p3 = this.getValidCartGoods();

    Promise.all([p1, p2, p3]).then((e) => {

      let res = e[2];

      let totalFreightPrice = Math.floor((res.result.list[0].totalFreightPrice) * 100) / 100;
      let initTotalFreight = totalFreightPrice;
      let totalGoodsPrice = Math.floor((res.result.list[0].totalGoodsPrice) * 100) / 100;
      let totalNum = res.result.list[0].totalNum;

      this.setData({
        goodsList: res.result.list[0].goodsList,
        initFreightPrice: initTotalFreight,
        totalGoodsPrice: totalGoodsPrice,
        totalNum: totalNum
      })
      this.computedCutAmount();
      this.getAddressInfo().then(() => {
        let p1 = this.checkCityFreight();
        let p2 = this.getProvinceFreight();

        Promise.all([p1, p2]).then((res) => {
          this.computedFreightPrice();
        })
      })
    })
    
  },

  //选择地址
  toAddress:function(){
    let addressId = this.data.addressId;

    wx.navigateTo({
      url: '/address/pages/list/index?id=' + addressId+'&type=1',
    })
  },

  //获取地址信息
  getAddressInfo: function(){
    let id = this.data.addressId;

    return new Promise((reslove, reject) => {
      if(id) {
        wx.cloud.callFunction({
          name: 'getAddressInfo',
          data: {
            id: id
          },
          success: res => {
            this.setData({
              addressItem: res.result.data[0]
            });
            reslove()
          }
        })
      } else {
        reslove()
      }
    })


  },

//跳转商品详情页
  toGoodsInfo: function(e){
    let id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '/pages/goodsInfo/index?id='+id,
    })
  },

  //跳转支付页
  toOrderPay:function(){
    //判断是否选择了地址
    let addressId = this.data.addressId;
    if (!addressId){
      wx.showToast({
        icon:'none',
        title: '请选择地址',
      })
      return
    }

    wx.showLoading({
      title: '订单提交中',
    })

    this.getValidCartGoods().then( (res)=> {
      let idsList = [];

      //校验库存是否充足
      if (res && res.result && res.result.list.length > 0 && res.result.list[0].goodsList.length > 0) {
        let flag = true;
        var goodsList = res.result.list[0].goodsList;
        goodsList.map(goods => {
          if (flag) {
            idsList.push(goods._id);
            if (goods.num > goods.stock) {
              wx.hideLoading();
              flag = false;
              wx.showToast({
                title: goods.name + '库存不足，请返回购物车重新操作',
              })
            }
          }
        })

        if(flag){ //若商品库存充足，则创建订单，创建订单商品关联，创建订单地址关联，库存减少，删除购物车的数据，发起微信支付
          let data = {
            total_num: Number(this.data.totalNum),
            total_goods_price: Number(this.data.totalGoodsPrice),
            total_freight_price: Number(this.data.totalFreightPrice),
            total_price: Number(this.data.totalPrice),
            is_freight: this.data.isLogistic,
            address_id: this.data.addressId,
            cut_amount: this.data.cutAmount
          }

          wx.cloud.callFunction({
            name: 'createOrder',
            data: {
              item: data
            },
            success: (res) => {

              if (res && res.result && res.result._id) {//将商品插入order_goods表
                var order_id = res.result._id;
                const db = wx.cloud.database();

                let promiseList = [];
                goodsList.map(goods => {
                  var createPromise = this.createGoodsRel(goods, order_id);
                  promiseList.push(createPromise);
                })

                Promise.all(promiseList).then((result) => {
                  let success = true
                  result.map(res => {
                    if(success){
                      if (res.result.code != 0) {
                        success = false
                      }
                    }
                  });

                  if (success) {//更新库存
                    let updatePromise = [];

                    goodsList.map((goods) => {
                      let promise = this.updateGoodsStock(goods);
                      updatePromise.push(promise)
                    })

                    Promise.all(updatePromise).then(result => {
                      let upSuccess = true
                      result.map(res => {
                        if (upSuccess) {
                          if (res.errMsg.indexOf('ok') < 0) {
                            upSuccess = false
                          }
                        }
                      });

                      if (upSuccess) {//购物车里面的商品要删除

                        let ids = idsList.join(',');

                        wx.cloud.callFunction({
                          name: 'deleteCart',
                          data: {
                            ids: ids
                          },
                          success: (res) => { //获取签名等支付参数
                            if (res && res.result && res.result.code == 0) {

                              let body = '共' + this.data.totalNum + '件商品';
                              wx.cloud.callFunction({
                                name: 'getPay',
                                data: {
                                  total_fee: parseFloat(this.data.totalPrice).toFixed(2) * 100,
                                  attach: 'anything',
                                  body: body
                                },
                                success: (res) => { //调用支付接口
                                  this.payAPI(res, order_id)
                                },
                                fail: (err) => {
                                  console.log(err);
                                  this.payErr();
                                }
                              })

                            } else {
                              this.payErr(); 
                            }
                          },
                          fail: (err) => {
                            console.log(err);
                            this.payErr(); 
                          }
                        })
                      } else {
                        this.payErr();    
                      }
                    })
                  } else {
                    this.payErr();
                  }
                }).catch((error) => {
                  console.log(error);
                  this.payErr();
                })
              }

            },
            fail: (err) => {
              console.log(err)
            }
          })
        }
      } else {
        this.payErr();
      }
    })
  },

  switchChange:function(e){
    let isLogistic = e.detail.value;
    this.setData({
      isLogistic: e.detail.value
    })
    this.computedFreightPrice();
  },

  scrollGoodsWrapper: function(){
    this.setData({
      down: !this.data.down
    })
  },

  //获取信息
  getValidCartGoods: function(){
    return new Promise( (resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getValidCartList',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          wx.hideLoading();
          reject(err)
        }
      })
    })
  },

  //创建订单和商品之间的联系
  createGoodsRel: function(goods, id){
    var p = new Promise((resolve, reject) => {

      delete goods._id;
      goods.order_id = id;

      wx.cloud.callFunction({
        name: 'addOrderGoods',
        data: goods,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          this.payErr();
        }
      })
 
    })
    return p
  },

  //更新商品库存
  updateGoodsStock: function (goods) {
    const db = wx.cloud.database();
    var p = new Promise((resolve, reject) => {

      db.collection('goods').doc(goods.goods_id).update({
        data: {
          stock: goods.stock - goods.num
        },
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log(err);
          this.payErr();
        }

      })
    })
    return p
  },

  //调用支付接口
  payAPI: function(res, id){
    wx.requestPayment({
      appId: res.result.appid,
      timeStamp: res.result.timeStamp,
      nonceStr: res.result.nonce_str,
      package: 'prepay_id=' + res.result.prepay_id,
      signType: 'MD5',
      paySign: res.result.paySign,
      success: res => {
        wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: {
            id: id,
            status: 2
          },
          success: (res) => {
            console.log(res)
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/orderInfo/index?id=' + id
            })
          },
          fail: (err) => {
            console.log(err);
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/orderInfo/index?id=' + id
            })
          }
        })
      },
      fail: (err) => {
        wx.redirectTo({
          url: '/pages/orderInfo/index?id=' + id
        })
      }
    })
  },

  //支付错误回调方法
  payErr: function(){
    wx.hideLoading();
    wx.showToast({
      title: '客观别急，请稍后再试',
      icon: 'none'
    })
  },

  //根据地址和订单金额判断是否支持同城配送
  checkCityFreight: function(){
    let addressItem = this.data.addressItem;

    return new Promise((resolve, reject) => {
      if (addressItem && addressItem._id && addressItem.area_id) {
        let id = addressItem.area_id;
        wx.cloud.callFunction({
          name: 'checkCityFreight',
          data: {
            id: id
          },
          success: (res) => {
            let result = res.result.list[0];
            let amount = result.amount;
            let totalGoodsPrice = this.data.totalGoodsPrice

            if (result.cityList.length > 0 && totalGoodsPrice >= amount) {

              this.setData({
                canCityFreight: true,
                isLogistic:false
              })

              resolve()
            } else {
              this.setData({
                canCityFreight: false,
                isLogistic: false
              })
              resolve()
            }
          },
          fail: (err) => {
            console.log(err);

            reject()
          }
        })
      } else {
        this.setData({
          canCityFreight: false,
          isLogistic: false
        })

        resolve()
      }
    })



  },

  //根据地址判获取免邮金额
  getProvinceFreight: function(){
    let provinceId = this.data.addressItem? this.data.addressItem.province_id:'';
    let that = this;

    return new Promise(function(reslove, reject){
      if (provinceId) {
        wx.cloud.callFunction({
          name: 'getProvinceFreightRule',
          data: {
            provinceId: provinceId
          },
          success: (res) => {
            if (res && res.result && res.result.data && res.result.data.length > 0) {
              that.setData({
                freeBaseAmount: res.result.data[0].amount
              }, () => {
                reslove()
              })
            } else {
              that.setData({
                freeBaseAmount: that.data.defaultAmount
              }, ()=>{
                reslove()
              })
            }
          },
          fail: (err) => {
            console.log(err);
            reject()
          }
        })
      } else {
        that.setData({
          freeBaseAmount: that.data.defaultAmount
        }, ()=>{
          reslove();
        })
      }
    })


  },

  //获取全国默认免邮金额
  getDefaultAmount: function(){

    return new Promise ((reslove, reject) => {
      wx.cloud.callFunction({
        name: 'getDefaultFreight',
        success: (res) => {
          this.setData({
            defaultAmount: res.result.data[0].amount
          })
          reslove();
        },
        fail: (err) => {
          console.log(err);
          reject()
        }
      })
    })

  },

//计算运费的方法
  computedFreightPrice: function(){
    let isLogistic = this.data.isLogistic;
    let freeBaseAmount = this.data.freeBaseAmount;
    let totalGoodsPrice = this.data.totalGoodsPrice;
    let initFreightPrice = this.data.initFreightPrice;
    let cutAmount = this.data.cutAmount;

    let freightPrice = this.data.totalFreightPrice;
    totalGoodsPrice = totalGoodsPrice - cutAmount;

    if(isLogistic){
      freightPrice = 0;
    } else if (totalGoodsPrice>=freeBaseAmount){
      freightPrice = 0
    } else {
      freightPrice = initFreightPrice
    }

    if(!this.data.addressItem){
      freightPrice = 0
    }


    let totalPrice = Math.floor((totalGoodsPrice + freightPrice) * 100) / 100
    this.setData({
      totalFreightPrice: freightPrice,
      totalPrice: totalPrice
    })
  },

  //获取活动
  getActivityRule: function () {

    return new Promise((reslove, reject) => {
      wx.cloud.callFunction({
        name: 'getActivityRule',
        data: {
          type: 1,
          start_status:1
        },
        success: (res) => {
          let rule = res.result.list[0];

          this.setData({
            rule: rule
          });

          reslove()
        },
        fail: (err) => {
          console.log(err)
        }
      })
    })
  },

  //计算优惠金额
  computedCutAmount: function(){
    let rule = this.data.rule;

    let totalGoodsPrice = this.data.totalGoodsPrice;

    if(!rule._id || rule.list.length<1){
      this.setData({
        cutAmount:0
      })
    } else {
      //判断当前时间是否在规则时间范围内
      let currDate = formatDate(new Date(), 'yyyy-MM-dd');
      if (new Date(rule.start_date) <= new Date(currDate) && new Date(currDate) <= new Date(rule.end_date) ){
        let cutAmount = 0;
        rule.list.map((item)=>{
          if (totalGoodsPrice>=item.limitAmount){
            cutAmount = item.cutAmount
          }
        })

        this.setData({
          cutAmount: cutAmount
        })

      } else {
        this.setData({
          cutAmount: 0
        })
      }
     
    }
  }

})