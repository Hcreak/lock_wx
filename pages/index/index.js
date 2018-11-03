// var app = getApp();
var Paho = require('../../utils/paho-mqtt-min.js');

var client = new Paho.Client("172.20.0.145", 8083, "clientId");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({
  useSSL: false,
  userName: 'user',
  // userName: wx.getStorageSync('key'),
  password: 'pwd',
  // password: wx.getStorageSync('pwd'),
  cleanSession: true,
  keepAliveInterval: 30,
  onSuccess: onConnect
});

function buildTopic(item) {
  return '/'+wx.getStorageSync('lockno')+'/'+item
}

function publish(item,payload) {
  var message = new Paho.Message(payload);
  message.destinationName = buildTopic(item);
  client.send(message);
}

function onConnect() {
  console.log("onConnect");
  client.subscribe(buildTopic('#'));
  publish('ping','1')
};
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
    console.log("onConnectionLost:" + responseObject.errorMessage);
};
function onMessageArrived(message) {
  console.log("onMessageArrived: [" + message.destinationName + "] " + message.payloadString);
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isfingerPrint: false, //可否使用指纹识别  默认false
    isfacial: false, //可否使用人脸识别  默认false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    

    var that = this
    //查看支持的生物认证   比如ios的指纹识别   安卓部分机器是不能用指纹识别的
    wx.checkIsSupportSoterAuthentication({
      success(res) {
        for (var i in res.supportMode) {
          if (res.supportMode[i] == 'fingerPrint') {
            console.log("支持指纹识别", res.supportMode[i]);
            that.setData({
              isfingerPrint: true
            })
          } else if (res.supportMode[i] == 'facial') {
            console.log("支持人脸识别", res.supportMode[i]);
          }
        }
      }
    })
  },

  bindViewTap: function() {
    wx.navigateTo({
      url: '../addpage/addpage'
    })
  },

  //是否可以指纹识别
  checkIsFingerPrint: function() {
    var boole = this.data.isfingerPrint
    var txt = "不可以使用指纹识别"
    if (boole) {
      txt = "可以使用指纹识别"
    }
    show("提示", txt, false);
  },
  //是否可以人脸识别
  checkIsFacial: function() {
    var boole = this.data.isfacial
    var txt = "不可以使用人脸识别"
    if (boole) {
      txt = "可以使用人脸识别"
    }

    function SUCC() {
      console.log("用户点击确定")
    }

    function FAIL() {
      console.log("用户点击取消")
    }

    show("提示", txt, true, SUCC, FAIL);
  },

  //进行指纹识别
  FingerPrint: function() {
    wx.startSoterAuthentication({
      requestAuthModes: ['fingerPrint'],
      challenge: 'm',
      authContent: '请用指纹',
      success(res) {
        console.log("识别成功", res)
        show("提示", "识别成功", false);

      },
      fail(res) {
        console.log("识别失败", res)
        show("提示", "识别失败", false);
      }
    })


  },
  //是否有指纹
  HaveFingerPrint: function() {
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success(res) {
        if (res.isEnrolled == 1) {
          show("提示", "有指纹", false);
        } else if (res.isEnrolled == 0) {
          show("提示", "无指纹", false);
        }
      },
      fail(res) {
        show("提示", "异常", fail);
      }
    })
  },

  vibrateShort: function() {
    dellock()
  },

  vibrateLong: function() {
    wx.vibrateLong()
  }
})


/**
 * 显示提示信息
 * tit 提示的标题
 * msg 提示的内容
 * q   是否有取消按钮（布尔值）
 * succ 用户点击确定的回调（非必须）
 * fail 用户点击取消的回调（非必须）
 *
 */
function show(tit, msg, q, succ, fail) {
  wx.showModal({
    title: tit,
    content: msg,
    showCancel: q,
    success: function(res) {
      if (res.confirm) {
        if (succ) {
          succ();
        }
      } else if (res.cancel) {
        if (fail) {
          fail();
        }
      }
    }
  })
}

function dellock() {
  console.log('dellock function')

  wx.login({
    success: function (res) {
      if (res.code) {
        wx.request({
          url: 'http://127.0.0.1:5000/dellog',
          method: 'DELETE',
          header: { 'content-type': 'application/json' },
          data: {
            code: res.code
          },
          success: function (sres) {
            if (sres.data != '') {
              wx.showToast({
                title: '设备注销成功',
              })
              wx.clearStorageSync()
              wx.reLaunch({
                url: '../addpage/addpage',
              })
            } 
            else {
              wx.showToast({
                title: '设备注销失败',
              })
            }
          }
        })
      } else {
        console.log('wxlogin error!' + res.errMsg)
      }
    }
  })
}