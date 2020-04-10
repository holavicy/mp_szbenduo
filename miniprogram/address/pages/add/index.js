// miniprogram/pages/addressInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    item:{},
    showAreaPicker:false,
    value:[0,0,0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id || '';
    this.setData({
      id:id});

    if (id){
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
    }

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

    if(this.data.id){
      this.getList();
    } else {
      let item = {
        is_default:false,
        sex:1
      }

      this.setData({
        item: item
      })
    }
    
  },

  getList: function () {
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getAddressInfo',
      data:{
        id: this.data.id
      },
      success: res => {
        console.log(res.result.data[0])
        this.setData({
          item: res.result.data[0]
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  //选择性别
  radioChange: function(e){

    let item = this.data.item;
    item.sex = e.detail.value;

    this.setData({
      item: item
    })
  },

  //是否默认
  switch1Change: function(e){
    let item = this.data.item;
    item.is_default = e.detail.value;

    this.setData({
      item: item
    })
  },

  //删除地址
  deleteAddress:function(){
    let that = this;
    wx.showModal({
      content: '确定删除当前地址',
      confirmColor:'#3d6034',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteAddress',
            data: {
              id: that.data.id
            },
            success: res => {

              if (res.result.code == 0) {

                wx.navigateBack({
                  
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })



  },

  //更新地址
  updateAddress: function () {
    let that = this;
    let item = that.data.item;

    //check

    if(!item.name){
      wx.showToast({
        title: '请输入姓名',
        icon:'none'
      })

      return
    }

    if (!item.sex) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })

      return
    }

    if (!item.tel) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      })

      return
    }

    if (!item.province_id) {
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      })

      return
    }

    if (!item.detail) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })

      return
    }

    if (item.name.length>6) {
      wx.showToast({
        title: '姓名最多输入6个字符',
        icon: 'none'
      })

      return
    }

    if (!/^1\d{10}$/.test(item.tel)) {
      wx.showToast({
        title: '联系电话格式错误',
        icon: 'none'
      })

      return
    }

    if (item.detail.length>60) {
      wx.showToast({
        title: '详细地址最多只能输入60个字符',
        icon: 'none'
      })

      return
    }

    wx.showLoading({
      mask: true
    })

    if(that.data.id){
      delete item._id;
      wx.cloud.callFunction({
        name: 'updateAddress',
        data: {
          id: that.data.id,
          item: item
        },
        success: res => {
          wx.hideLoading()

          if (res.result.code == 0) {
            wx.navigateBack({})
          } else {
            wx.showToast({
              title: '更新失败',
            })
          }
        },
        fail:(err)=>{
          console.log(err);
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
          })
        }
      })
    } else {
      wx.cloud.callFunction({
        name: 'addAddress',
        data: {
          item: item
        },
        success: res => {
          console.log(res)
          wx.hideLoading()
          if (res.result.code == 0) {
            wx.navigateBack({})
          } else {
            wx.showToast({
              title: '新增失败',
            })
          }
        }
      })
    }
  },

  keyInput: function(e){
    let key = e.currentTarget.dataset.name;
    let value = e.detail.value;

    let item = this.data.item;
    item[key] = value;

    this.setData({
      item: item
    })
  },

  confirm: function(e){
    let item = this.data.item;
    let data = Object.assign(item, e.detail)

    console.log(data);

    this.setData({
      value: data.value,
      showAreaPicker: false
    })

    delete data.value
    this.setData({
      item:data,
    })
  },

  cancel: function(){
    this.setData({
      showAreaPicker:false
    })
  },

  showAreaPicker: function(){
    this.setData({
      showAreaPicker:true
    })
  }
})