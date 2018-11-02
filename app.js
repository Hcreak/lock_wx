//app.js
App({
  onLaunch: function() {
    // wx.login({
    //   success: function(res) {
    //     if (res.code) {
    //       wx.request({
    //         url: '',
		//         method: 'POST',
		//         header: {'content-type': 'application/json'},
    //         data: {
    //           code: res.code
    //         },
    //         success: function(sres) {
    //           if (sres.data != '') {
    //             var newkey = sres.data['newkey']
    //             if (newkey == 0)
    //               console.log('addlock')
    //             else
    //               wx.setStorageSync('key', newkey)
    //           } else {
    //             console.log('server error!')
    //           }
    //         }
    //       })
    //     } else {
    //       console.log('login error!' + res.errMsg)
    //     }
    //   }
    // })
  }
})