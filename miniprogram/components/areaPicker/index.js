// components/areaPicker/index.js

import {areas} from '../../utils/areas.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value:{
      type:Array,
      value:[0,0,0]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    areas:areas,
    province:[]
  },
  attached: function(){
    console.log(this.data.value)
    let areas = this.data.areas;
    let province = [];

    let value = this.data.value;

    areas.map((item) => {
      province.push({
        id:item.id,
        name:item.name
      })
    })

    let provinceIndex = value[0] - 1,
      cityIndex = value[1] - 1,
      areaIndex = value[2] - 1;

    let [...city] = areas[provinceIndex] ? areas[provinceIndex].subAreas || [] : [];
    let [...area] = city[cityIndex] ? city[cityIndex].subAreas || [] : [];

    province.unshift({
      id:'',
      name:'请选择'
    });

    city.unshift({
      id: '',
      name: '请选择'
    })

    area.unshift({
      id: '',
      name: '请选择'
    })
    

    this.setData({
      province: province,
      city:city,
      area:area,
      areas:areas
    })

    console.log(areas);

    this.setData({
      value: this.data.value
    })

    console.log(this.data.value)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindChange: function(e){
      console.log(e.detail.value);
      let value = e.detail.value;
      let provinceIndex = value[0]-1,
      cityIndex = value[1]-1,
      areaIndex = value[2]-1;

      let areas = this.data.areas;
      console.log(areas)
      let [...city] = areas[provinceIndex]?areas[provinceIndex].subAreas || []:[];
      let [...area] = city[cityIndex]? city[cityIndex].subAreas || []:[];

      let provinceId = areas[provinceIndex]? areas[provinceIndex].id:'',
        provinceName = areas[provinceIndex]? areas[provinceIndex].name:'',
        cityId = city[cityIndex]? city[cityIndex].id:'',
        cityName = city[cityIndex] ?city[cityIndex].name:'',
        areaId = area[areaIndex]? area[areaIndex].id:'',
        areaName = area[areaIndex]?area[areaIndex].name:'';

      city.unshift({
        id: '',
        name: '请选择'
      })
      area.unshift({
        id: '',
        name: '请选择'
      })
      this.setData({
        value: value,
        pickerValue: e.detail.value,
        city: city,
        area: area,
        provinceId: provinceId,
        provinceName: provinceName,
        cityId: cityId,
        cityName: cityName,
        areaId: areaId,
        areaName: areaName
      })
    },

    confirm: function(){
      let data = {
        province_id: this.data.provinceId,
        province_name: this.data.provinceName,
        city_id: this.data.cityId,
        city_name: this.data.cityName,
        area_id: this.data.areaId,
        area_name: this.data.areaName,
        value: this.data.value
      }
      this.triggerEvent('confirm', data)
    },

    cancel: function(){
      this.triggerEvent('cancel')
    }
  }
})
