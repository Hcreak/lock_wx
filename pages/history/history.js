// pages/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		list:[]
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
		var that = this
		wx.request({
			url: 'http://172.20.0.145:80/gethistory',
			method: 'GET',
			data: {
				lockno: wx.getStorageSync('lockno')
			},
			success: function (res) {
				// console.log(res.data)
				that.setData({
					list: res.data
				})
			}
		})
  }
})