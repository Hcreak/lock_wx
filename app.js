//app.js
App({
  onLaunch: function() {
    // this.setkey()
  },

  setkey:function setkey() {
    wx.clearStorageSync()
    console.log('setkey function')

    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            url: 'http://127.0.0.1:5000/login',
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
                  wx.setStorageSync('adata', sdata['adata'])
                  wx.setStorageSync('key', sdata['key'])
                  wx.setStorageSync('pwd', sdata['pwd'])
                  setInterval(updatekey, 60000)
                }
                else {
                  console.log('nonono')
                  wx.reLaunch({
                    url: 'pages/addpage/addpage'
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

function updatekey() {
  var oldkey = wx.getStorageSync('key')
  wx.request({
    url: 'http://127.0.0.1:5000/updatekey',
    method: 'POST',
    header: { 'content-type': 'application/json' },
    data: {
      oldkey: oldkey
    },
    success: function (sres) {
      if (sres.data == 0)
        setkey()
      else
        console.log('update success')
    }
  })
}

