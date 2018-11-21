// pages/addpage/addpage.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

	},

	add: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success(qres) {
        console.log(qres)

        wx.login({
          success: function(res) {
            if (res.code) {
              wx.request({
                // url: 'http://127.0.0.1:5000/logup',
								url: 'http://172.20.0.145:80/logup',
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  code: res.code,
                  qrcode: qres.result
                },
                success: function(sres) {
                  if (sres.data == 1) {
										setTimeout(app.setkey, 200)

                  } else {
										if (sres.data == 2) {
											wx.showToast({
												title: '设备已被注册',
												icon: 'none'
											})
										}
										if (sres.data == 0) {
											wx.showToast({
												title: '检查二维码有错误',
												icon: 'none'
											})
										}
                    
                  }
                }
              })
            } else {
              console.log('wxlogin error!' + res.errMsg)
            }
          }
        })
      }
    })
  }

})