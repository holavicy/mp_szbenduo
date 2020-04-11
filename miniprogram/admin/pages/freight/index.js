// miniprogram/address/pages/freight/index.js
import { areas } from '../../../utils/areas.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules: [],
    modalShow: false
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
    let provinces = [];
    areas.map((item) => {
      let obj = {
        id: item.id,
        name: item.name
      }
      provinces.push(obj)
    })

    let [...initProvinces] = provinces;

    this.setData({
      provinceList: provinces,
      initProvinces: initProvinces
    });

    this.getAddressRule();
  },

  setProvince: function (e) {
    let index = e.currentTarget.dataset.index;

    let provinceList = this.data.provinceList;
    provinceList[index].selected = !provinceList[index].selected;

    this.setData({
      provinceList: provinceList
    })
  },

  newRule: function () {
    this.setData({
      modalShow: true
    })
  },

  createRule: function () {
    let provinceList = this.data.provinceList;

    let tempList = [];
    let leftList = [];

    provinceList.map((item, index) => {
      if (item.selected) {
        tempList.push(item);
      } else {
        leftList.push(item)
      }
    })

    if (tempList.length < 1) {
      wx.showToast({
        title: '请选择省份',
        icon: 'none'
      })
      return
    }

    let rules = this.data.rules;
    let newRule = {
      provinces: tempList,
      amount: 0
    }
    rules.push(newRule)

    this.setData({
      rules: rules,
      provinceList: leftList
    }, () => {
      this.cancel()
    })
  },

  cancel: function () {
    this.setData({
      modalShow: false
    })
  },

  setAmount: function (e) {
    let index = e.currentTarget.dataset.index;
    let val = e.detail.value;
    let rules = this.data.rules;

    rules[index].amount = val;

    this.setData({
      rules: rules
    })
  },

  addRule: function (e) {
    let priceReg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    let index = e.currentTarget.dataset.index;

    let id = e.currentTarget.dataset.id;

    let rules = this.data.rules;

    let rule = rules[index];

    if (!priceReg.test(rule.amount)) {
      wx.showToast({
        title: '金额必须是大于0的两位小数',
        icon: 'none'
      })
      return
    }

    wx.showLoading();

    if (id) {
      wx.cloud.callFunction({
        name: 'updateFreightRule',
        data: rule,
        success: (res) => {
          wx.hideLoading();
          this.getAddressRule();
        },

        fail: (err) => {
          wx.hideLoading();
          console.log(err)
        }
      })
    } else {
      wx.cloud.callFunction({
        name: 'addFreightRule',
        data: rule,
        success: (res) => {
          wx.hideLoading();
          this.getAddressRule();
        },

        fail: (err) => {
          wx.hideLoading();
          console.log(err)
        }
      })
    }

  },

  getAddressRule: function () {
    wx.cloud.callFunction({
      name: 'getFreightRule',
      success: (res) => {
        if (res && res.result && res.result.data) {

          let defaultRule = null;
          let rules = [];
          res.result.data.map((item)=>{
            if(item.is_default){
              defaultRule = item
            } else {
              rules.push(item)
            }
          })

          this.setData({
            defaultRule: defaultRule,
            rules: rules
          })

          //更新剩余省份
          this.setLeftProvince(this.data.initProvinces);
        }
      }
    })
  },

  deleteRule: function (e) {
    let index = e.currentTarget.dataset.index;

    let id = e.currentTarget.dataset.id;

    let rules = this.data.rules;

    wx.showModal({
      title: '',
      content: '确定删除此规则？',
      confirmColor: '#3d6034',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          })
          if (id) {
            wx.cloud.callFunction({
              name: 'deleteFreightRule',
              data: {
                id: id
              },
              success: (res) => {
                this.getAddressRule();
              },
              complete: ()=> {
                wx.hideLoading()
              }
            })
          } else {
            wx.hideLoading()
            rules.splice(index, 1);
            
            this.setData({
              rules: rules
            })

            this.setLeftProvince(this.data.initProvinces);


          }
        }
      }
    })
  },
  defaultAmount: function(e){
    let amount = e.detail.value;
    let defaultRule = this.data.defaultRule;

    defaultRule.amount = Number(amount);

    this.setData({
      defaultRule: defaultRule
    })
  },
  setDefaultAmount: function(){
    wx.showLoading({
      mask:true
    })
    let amount = Number(this.data.defaultRule.amount);

    wx.cloud.callFunction({
      name:'updateDefaultFreightAmount',
      data:{
        amount: amount
      },
      success: (res) => {

        if(res && res.result && res.result.code == 0){
          wx.hideLoading();
          wx.showToast({
            title: '提交成功',
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err)
      }
    })
  },
  setLeftProvince: function (provinces){
    let rules = this.data.rules;
    let selectedProvince = [];
    rules.map((rule) => {
      rule.provinces.map((province) => {
        selectedProvince.push(province.id)
      })
    })

    let leftList = [];

    provinces.map((p) => {
      if (!selectedProvince.includes(p.id)) {
        p.selected = false;
        leftList.push(p)
      }
    })

    this.setData({
      provinceList: leftList
    })
  }
})