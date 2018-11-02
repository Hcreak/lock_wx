// pages/addpage/addpage.js
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
    wx.scanCode({
      onlyFromCamera: true,
      success(qres) {
        console.log(qres)

        wx.login({
          success: function(res) {
            if (res.code) {
              wx.request({
                url: 'http://127.0.0.1:5000/logup',
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  code: res.code,
                  qrcode: qres.result
                },
                success: function(sres) {
                  if (sres.data == 0)
                    console.log('error')
                  else {
                    setTimeout(function() {
                      wx.reLaunch({
                        url: '../index/index'
                      })
                    }, 200)
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})