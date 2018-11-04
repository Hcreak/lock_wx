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
  return '/' + wx.getStorageSync('lockno') + '/' + item
}

function publish(item, payload) {
  var message = new Paho.Message(payload);
  message.destinationName = buildTopic(item);
  client.send(message);
}

function onConnect() {
  console.log("onConnect");
  client.subscribe(buildTopic('RTInfo'));
  publish('ping', '1')
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
    console.log("onConnectionLost:" + responseObject.errorMessage);
};

var statu_code = {
  '-2': '未连接',
  '0': '未锁止',
  '1': '锁止中'
}

function onMessageArrived(message) {
  console.log("onMessageArrived: [" + message.destinationName + "] " + message.payloadString);
  var payload = message.payloadString
  var statu = statu_code[payload['statu']]
  var charge = payload['charge'] + '%'
  this.setData({
    statu: statu,
    charge: charge
  })

};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isfingerPrint: false, //可否使用指纹识别  默认false
    // isfacial: false, //可否使用人脸识别  默认false
    m_button: false,
    f_button: false,
    statu: '未连接',
    charge: ''
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
          }
        }
      }
    })

    var morf = wx.getStorageSync('morf')
    if (morf == 'm') {
      this.setData({
        m_button: true
      })
    }
    if (morf == 'f') {
      this.setData({
        f_button: true
      })
    }

  },

  verify: function() {
    if (this.FingerPrint()) {
      var morf = wx.getStorageSync('morf')
      publish(morf, '1')
    }
  },

  //是否可以指纹识别
  checkIsFingerPrint: function() {
    var boole = this.data.isfingerPrint
    var txt = "不可以使用指纹识别"
    if (!boole) {
      wx.showToast({
        title: txt,
      })
      return false
    } else {
      return true
    }

  },

  //进行指纹识别
  FingerPrint: function() {
    if (this.checkIsFingerPrint) {
      wx.startSoterAuthentication({
        requestAuthModes: ['fingerPrint'],
        challenge: 'sakura',
        authContent: '请用指纹',
        success(res) {
          console.log("识别成功", res)
          return true
        },
        fail(res) {
          console.log("识别失败", res)
          wx.showToast({
            title: '识别失败',
          })
          return false
        }
      })
    } else {
      return false
    }
  },

  vibrateShort: function() {
    dellock()
  },

  vibrateLong: function() {
    wx.vibrateLong()
  }
})


function dellock() {
  console.log('dellock function')

  wx.login({
    success: function(res) {
      if (res.code) {
        wx.request({
          url: 'http://127.0.0.1:5000/dellog',
          method: 'DELETE',
          header: {
            'content-type': 'application/json'
          },
          data: {
            code: res.code
          },
          success: function(sres) {
            if (sres.data != '') {
              wx.showToast({
                title: '设备注销成功',
              })
              wx.clearStorageSync()
              wx.reLaunch({
                url: '../addpage/addpage',
              })
            } else {
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