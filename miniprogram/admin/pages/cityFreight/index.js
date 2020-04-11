// miniprogram/address/pages/freight/index.js
import { areas } from '../../../utils/areas.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules: [],
    modalShow: false,
    cityList: areas[9].subAreas[4].subAreas
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

    this.setData({
      provinceList: provinces
    });

    this.getCityRules();

    this.getAddressRule();
  },

  setCity: function (e) {
    let index = e.currentTarget.dataset.index;

    console.log(index);

    let cityList = this.data.cityList;
    cityList[index].selected = !cityList[index].selected;

    this.setData({
      cityList: cityList
    })
  },

  setProvince: function (e) {
    let index = e.currentTarget.dataset.index;

    console.log(index);

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

    console.log(rule);

    wx.showLoading();

    if (id) {
      wx.cloud.callFunction({
        name: 'updateFreightRule',
        data: rule,
        success: (res) => {
          wx.hideLoading();
          console.log(res);
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
          console.log(res);
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
        console.log(res);

        if (res && res.result && res.result.data) {
          this.setData({
            rules: res.result.data
          })

          let selectedProvince = [];
          res.result.data.map((rule) => {
            rule.provinces.map((province) => {
              selectedProvince.push(province.id)
            })
          })

          let selectedStr = selectedProvince.join(',');
          console.log(selectedStr);

          let provinces = this.data.provinceList;

          let leftList = [];

          provinces.map((p) => {
            if (!selectedProvince.includes(p.id)) {
              leftList.push(p)
            }
          })

          console.log(leftList);

          this.setData({
            provinceList: leftList
          })
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
          if (id) {
            wx.cloud.callFunction({
              name: 'deleteFreightRule',
              data: {
                id: id
              },
              success: (res) => {
                console.log(res);
                this.getAddressRule();
              }
            })
          } else {
            rules.splice(index, 1);

            this.setData({
              rules: rules
            })
          }
        }
      }
    })
  },

  getCityRules: function () {
    wx.cloud.callFunction({
      name: 'getCityRules',
      success: (res) => {
        console.log(res.result.data);
      }
    })
  }
})