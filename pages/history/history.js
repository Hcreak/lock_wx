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
			url: 'https://sakura.xeonphi.cn/wx/gethistory',
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