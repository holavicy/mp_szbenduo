//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {};

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          console.log('scope.userInfo')
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
})
