//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env:'benduo-zv240',
        env: 'online-n0oiv',
        traceUser: true,
      })
    }

    this.globalData = {
      cartNum:0,
      // env: 'benduo-zv240',
      env: 'online-n0oiv'
    };

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              this.onGetOpenid()
            }
          })
        }
      }
    })
  },

  onShow: function(){
    setTimeout(() => {
      this.getCartNum()
    }, 1000);
    
  },

  getUserInfo: function(cbk){
    let that = this;

    wx.getUserInfo({
      success: function (res) {
        let userInfo = res.userInfo;

        that.globalData.avatarUrl = userInfo.avatarUrl;
        that.globalData.nickName = userInfo.nickName;
        that.globalData.gender = userInfo.gender;
        that.globalData.getUserInfo = true;

        cbk && cbk()
      }
    })
  },

  onGetOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {

        if (res && res.result && res.result.openid) {
          this.globalData.openid = res.result.openid;
          console.log(this.globalData.openid)
        }

      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  getCartNum: function(){
    console.log(this.globalData)

    if (!this.globalData.openid){
      console.log(1);
      wx.removeTabBarBadge({//tabbar右上角添加文本
        index: 1
      })
      return
    }
    console.log(2)
    wx.cloud.callFunction({
      name: 'getValidCartList',
      success: (res) => {
        if (res && res.result && res.result.list.length > 0) {
          let num = String(res.result.list[0].totalNum)
          let data = {
            num: num
          }
          wx.setTabBarBadge({//tabbar右上角添加文本
            index: 1, //tabbar下标
            text: data.num //显示的内容
          })
        } else {
          wx.removeTabBarBadge({//tabbar右上角添加文本
            index: 1
          })
        }
      }
    })
  }
})
