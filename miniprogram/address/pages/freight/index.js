// miniprogram/address/pages/freight/index.js
import { areas } from '../../../utils/areas.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules:[],
    modalShow:false,
    cityList:areas[9].subAreas[4].subAreas
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
        id:item.id,
        name:item.name
      }
      provinces.push(obj)
    })

    this.setData({
      provinceList: provinces
    })
  },

  setCity: function(e){
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

  newRule: function(){
    this.setData({
      modalShow: true
    })
  },

  createRule: function(){
    let provinceList = this.data.provinceList;

    let tempList = [];
    let leftList = [];

    provinceList.map((item,index) => {
      if(item.selected){
        tempList.push(item);
      } else {
        leftList.push(item)
      }
    })

    let rules = this.data.rules;
    let newRule = {
      provinces: tempList,
      amount:0
    }
    rules.push(newRule)

    this.setData({
      rules: rules,
      provinceList: leftList
    }, ()=>{
      this.cancel()
    })
  },

  cancel: function(){
    this.setData({
      modalShow:false
    })
  }
})