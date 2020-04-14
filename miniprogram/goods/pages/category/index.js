// miniprogram/goods/pages/category/index.js

/* 该页面有两个入口:
  新增或编辑商品的时候,进行分类选择, type == 1
  管理员进行分类管理, type == 2
  若从别的页面进入此页面,type依次定义
*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedId:'',
    categoryName:'',
    categoryList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let selectedId = options.selectedId || '',
        type = options.type || '';
    this.setData({
      selectedId: selectedId,
      type: type
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.queryCategory()
  },

  //分类名称输入事件
  bindKeyInput: function(e){
    let val = e.detail.value.trim();
    this.setData({
      categoryName: val
    })
  },

  //新增分类
  addCategory: function(){
    let categoryName = this.data.categoryName;

    if (!categoryName){
      wx.showToast({
        icon:'none',
        title: '请输入分类名称',
      })
      return
    }

  const db = wx.cloud.database();
    db.collection('category').where({
      name: categoryName,
      status:1
    }).get({
    success: (res) => {
      console.log(res);

      if(res.data.length>0){
        wx.showToast({
          title: '该分类名称已存在',
          icon:'none'
        })
      } else {
        wx.cloud.callFunction({
          name:'addCategory',
          data:{
            name: categoryName
          },
          success: (res)=>{

            if(res && res.result && res.result.code == 0){
              wx.showToast({
                title: '新增分类成功',
              });
              this.queryCategory();
              this.setData({
                categoryName:''
              })
            }
          },
          fail: (err)=>{
            console.log(err);
            wx.showToast({
              icon: 'none',
              title: '新增分类失败'
            })
          }
        })
      }
    }
  })


  },

  //查询分类
  queryCategory: function(){
    wx.showLoading()

    wx.cloud.callFunction({
      name:'getCategoryList',
      success: (res)=>{
        wx.hideLoading()
        if(res && res.result && res.result.data){
          this.setData({
            categoryList: res.result.data
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading()
      }
    })

  },

  //删除分类
  deleteCategory: function(){

    let selectedId = this.data.selectedId;

    if (!selectedId) {
      wx.showToast({
        icon: 'none',
        title: '请选择要删除的分类'
      })
      return
    }

    wx.showModal({
      title: '',
      content: '确定删除当前选择的分类吗?',
      confirmColor: '#3d6034',
      success: (res) => {

        if(res.confirm){
          wx.showLoading();
          wx.cloud.callFunction({
            name:'deleteCategory',
            data:{
              id: selectedId
            },
            success: (res)=>{
              wx.hideLoading();
              console.log(res);

              if(res && res.result && res.result.code == 0){
                this.setData({
                  selectedId:''
                });
                this.queryCategory();
              }
            },

            fail: (err) => {
              wx.hideLoading();
              console.log(err);
            }
          })
        }
      }
    })

  },

  //选择分类
  radioChange: function(e){
    console.log(e.detail.value)
    let selectedObj = JSON.parse(e.detail.value);
    let type = this.data.type;

    this.setData({
      selectedId: selectedObj._id
    })

    if (type == 1) {
      //判断当前页面的类型,若type == 1
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1] || [];
      var prevPage = pages[pages.length - 2] || [];     //获取上一个页面

      let goodsItem = prevPage.data.goodsItem;
      goodsItem.cateId = selectedObj._id;
      goodsItem.categoryName = selectedObj.name;
      prevPage.setData({                                      //修改上一个页面的变量
        goodsItem: goodsItem
      })
      wx.navigateBack();                  //返回上一个页面
    }
  },

  //获取焦点事件
  bindfocus: function(e){
    console.log(e);
  },

  updateCategory: function(e){
    let index = e.currentTarget.dataset.index;
    let val = e.detail.value.trim();
    let cateList = this.data.categoryList;
    let id = cateList[index]._id,
      name = val;

    let data = {
      id:id,
      name:name
    }

    const db = wx.cloud.database();
    db.collection('category').where({
      name: name
    }).get({
      success: (res) => {
        if(res.data.length>0 &&res.data[0]._id != id){
          wx.showToast({
            title: '该分类已存在',
            icon:'none'
          })
          this.queryCategory();
        } else {
          wx.cloud.callFunction({
            name: 'updateCategory',
            data: data,
            success: (res) => {
              console.log(res);

              if (res && res.result && res.result.code == 0) {
                this.queryCategory();
              }
            }
          })
        }
      }
    })   
  },

  bindKey: function(e){
    let val = e.detail.value.trim();
    let index = e.currentTarget.dataset.index;
    let cateList = this.data.categoryList;
    cateList[index].name = val;
    this.setData({
      categoryList: cateList
    })
  },

  bindfocus: function(e){
    let index = e.currentTarget.dataset.index;
    let cateList = this.data.categoryList;
    cateList[index].needUpdate = true;
    this.setData({
      categoryList:cateList
    })
  },

    bindblur: function (e) {
      let index = e.currentTarget.dataset.index;
      let cateList = this.data.categoryList;
      cateList[index].needUpdate = false;
      this.setData({
        categoryList: cateList
      })
    },
})