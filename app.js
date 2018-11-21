//app.js
App({
	// globalData: {
	// 	intervalID: null
	// },

	onLaunch: function () {
    this.setkey()
  },

  setkey:function setkey () {
		var that = this
    // wx.clearStorageSync()
    console.log('setkey function')

    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            // url: 'http://127.0.0.1:5000/login',
            url: 'http://172.20.0.145:80/login',            
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: {
              code: res.code
            },
            success: function (sres) {
              if (sres.data != '') {
                var sdata = sres.data
                if (sdata['exists'] == 1) {
                  wx.setStorageSync('lockno', sdata['lockno'])
                  wx.setStorageSync('morf', sdata['morf'])
                  wx.setStorageSync('adate', sdata['adate'])
                  wx.setStorageSync('key', sdata['key'])
                  wx.setStorageSync('pwd', sdata['pwd'])

									// if (that.globalData.intervalID != null)
									// 	clearInterval(that.globalData.intervalID)
									// var intervalID = setInterval(updatekey, 60000)
									// that.globalData.intervalID = intervalID

									wx.reLaunch({
										url: '../indexpage/index'
									})
                }
                else {
                  console.log('nonono')
                  wx.reLaunch({
                    url: '../addpage/addpage'
                  })
                }
              }
              else
                console.log('server error!')
            }
          })
        } else {
          console.log('wxlogin error!' + res.errMsg)
        }
      }
    })
  } 
})

// function updatekey() {
//   var oldkey = wx.getStorageSync('key')
//   wx.request({
//     // url: 'http://127.0.0.1:5000/updatekey',
//     url: 'http://172.20.0.145:80/updatekey',    
//     method: 'POST',
//     header: { 'content-type': 'application/json' },
//     data: {
//       oldkey: oldkey
//     },
//     success: function (sres) {
//       if (sres.data == 0)
//         setkey()
//       else
//         console.log('update success')
//     }
//   })
// }

