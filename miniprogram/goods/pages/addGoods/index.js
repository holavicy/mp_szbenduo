// miniprogram/goods/pages/addGoods/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picturesList:[],
    pictureCloudList:[],
    goodsItem:{},
    id:''   //编辑商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let id = options.id || '';
    this.setData({
      id: id
    })

    if (id) {
      //根据id获取商品详情
      this.getGoodsInfo(id);
      wx.setNavigationBarTitle({
        title: '编辑商品'
      })
    }

  },

  getGoodsInfo: function(id){
    wx.cloud.callFunction({
      name:'getGoodsInfo',
      data:{
        id: id
      },
      success: (res) => {
        console.log(res);

        let goodsItem = res.result.data[0];
        

        this.setData({
          goodsItem: res.result.data[0],
          picturesList: goodsItem.images && goodsItem.images.length>0?goodsItem.images.split(','):[]
        })
      }
    })
  },

  // 上传图片
  addPictures: function () {
    // 选择图片
    wx.chooseImage({
      count: 4,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          picturesList: res.tempFilePaths
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  //将文件上传至云存储
  uploadFileToCloud: function (filePath){
    var p = new Promise((resolve, reject)=>{
      var timestamp = (new Date()).valueOf();
      const cloudPath = 'goods/' + timestamp + filePath.match(/\.[^.]+?$/)[0];
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => {
          resolve(res)
        },
        fail: e => {
          console.error('[上传文件] 失败：', e)
          reject()
        },
        complete: () => {
          wx.hideLoading();
        }
      })
    })
    return p
  },

  //去分类列表页
  toCategoryList: function(){
    let categoryId = this.data.goodsItem.cateId;
    wx.navigateTo({
      url: '/goods/pages/category/index?selectedId=' + categoryId+'&type=1',
    })
  },

  submit: function(e){
    let data = this.data.goodsItem;

    let priceReg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;

    //校验数据

    if (!data.name){
      wx.showToast({
        title: '商品名称不能为空',
        icon:'none'
      })
      return
    }

    if (!data.descript) {
      wx.showToast({
        title: '商品描述不能为空',
        icon: 'none'
      })
      return
    }

    if (!data.stock) {
      wx.showToast({
        title: '库存不能为空',
        icon: 'none'
      })
      return
    }
    if (!/^[1-9]\d*$/.test(data.stock)) {
      wx.showToast({
        title: '库存必须是大于0的整数',
        icon: 'none'
      })
      return
    }
    if (!data.price) {
      wx.showToast({
        title: '价格不能为空',
        icon: 'none'
      })
      return
    }

    if (!priceReg.test(data.price)){
      wx.showToast({
        title: '价格必须是大于0的两位小数',
        icon: 'none'
      })
      return
    }

    if (!data.unit) {
      wx.showToast({
        title: '单位不能为空',
        icon: 'none'
      })
      return
    }

    if (!data.base_freight_price) {
      wx.showToast({
        title: '基础运费不能为空',
        icon: 'none'
      })
      return
    }

    if (!priceReg.test(data.base_freight_price)) {
      wx.showToast({
        title: '基础运费必须是大于0的两位小数',
        icon: 'none'
      })
      return
    }

    if (!data.inc_freight_price) {
      wx.showToast({
        title: '增量运费不能为空',
        icon: 'none'
      })
      return
    }

    if (!priceReg.test(data.inc_freight_price)) {
      wx.showToast({
        title: '增量运费必须是大于0的两位小数',
        icon: 'none'
      })
      return
    }

    if (!data.cateId) {
      wx.showToast({
        title: '请选择类别',
        icon: 'none'
      })
      return
    }

    if(this.data.picturesList.length<1){
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '',
      mask: true
    })

    let length = this.data.picturesList.length;
    let i = 0;

    let promiseAll = [];
    let pictureCloudList = []

    //将图片上传至云端
    for (i = 0; i < length; i++) {

      if (/^cloud/.test(this.data.picturesList[i])){
        pictureCloudList.push(this.data.picturesList[i])
      } else {
        let promise = this.uploadFileToCloud(this.data.picturesList[i]);
        promiseAll.push(promise);
      }
      
    }

    

    Promise.all(promiseAll).then((result) => {
      result.map(res => {
        pictureCloudList.push(res.fileID)
      });

      this.setData({
        pictureCloudList: pictureCloudList
      })

      this.submitRes(data);
  
    }).catch((error) => {
      console.log(error);
      wx.hideLoading();
      wx.showToast({
        title: '客观别急,请稍后再试',
      })
    })
  },

  //存储至数据库
  submitRes: function(data){
    const db = wx.cloud.database();
    data.image = this.data.pictureCloudList[0];
    data.images = this.data.pictureCloudList.join(',');
    data.price = Number(data.price);
    data.base_freight_price = Number(data.base_freight_price);
    data.inc_freight_price = Number(data.inc_freight_price);
    data.stock = Number(data.stock);

    if(this.data.id){
      db.collection('goods').where({
        name: data.name
      }).get({
        success: (res) => {

          if (res.data.length > 0 && res.data[0]._id != data._id) {
            wx.hideLoading();
            wx.showToast({
              title: '该商品名称已存在',
              icon: 'none'
            })
          } else {
            data.update_time = db.serverDate();
            delete data._id;
            delete data._openid;
            delete data.create_time;

            db.collection('goods').doc(this.data.id).update({
              // data 传入需要局部更新的数据
              data: data,
              success: (res) => {
                console.log(res);
                wx.hideLoading()

                if (res.stats.updated) {
                  wx.showToast({
                    title: '更新成功',
                  })

                  setTimeout(function(){
                    wx.navigateBack({})
                  }, 1000)
                  
                }
              },
              fail: (err) => {
                console.log(err);
                wx.hideLoading();
                wx.showToast({
                  title: '客观别急,请稍后再试',
                })
              }
            })
          }
        }
      })
    } else {
      db.collection('goods').where({
        name: data.name
      }).get({
        success: (res) => {

          if (res.data.length > 0) {
            wx.hideLoading();
            wx.showToast({
              title: '该商品名称已存在',
              icon: 'none'
            })
          } else {
            data.status = 3;
            data.create_time = db.serverDate();
            data.update_time = db.serverDate();

            db.collection('goods').add({
              data: data,
              success: res => {
                wx.hideLoading();
                wx.showToast({
                  title: '新增商品成功',
                })

                setTimeout(function(){
                  wx.navigateBack({})
                }, 1000)

              },
              fail: err => {
                wx.hideLoading();
                wx.showToast({
                  icon: 'none',
                  title: '新增商品失败'
                })
              }
            })
          }
        }
      })
    }
    
  },

  //重置
  reset: function(){
    this.setData({
      goodsItem:{}
    })
  },

  //input
  setGoodsItem: function(e){

    let key = e.currentTarget.dataset.name;
    let val = e.detail.value.trim();

    let obj = this.data.goodsItem;
    obj[key]=val;

    this.setData({
      goodsItem: obj
    })
  }
})