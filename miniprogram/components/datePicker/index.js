// components/datePicker/index.js
const date = new Date()
const years = []
const months = []
const days = []
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day =date.getDate()

for (let i = year - 10; i <= year+10; i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    years: years,
    year: year,
    months: months,
    month: month,
    days: days,
    day: day,
    value: [10, month - 1, day-1],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindChange: function (e) {
      const val = e.detail.value
      this.setData({
        year: this.data.years[val[0]],
        month: this.data.months[val[1]],
        day: this.data.days[val[2]]
      })
    }
  }
})
