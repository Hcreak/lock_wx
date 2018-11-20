// var app = getApp();
var Paho = require('../../utils/paho-mqtt-min.js');

var statu_code = {
  '-2': '未连接',
  '0': '未锁止',
  '1': '锁止中'
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isfingerPrint: false, //可否使用指纹识别  默认false
    // isfacial: false, //可否使用人脸识别  默认false
    client: null,

    m_button: false,
    f_button: false,
    m_verify: false,
    f_verify: false,
    timeoutID: 0,

    lockno: '',
    adate: '',
    statu: '-2',
    charge: '',
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
            that.data.isfingerPrint = true
          }
        }
      }
    })

    // var client = new Paho.Client("172.20.0.145", 8083, "clientId");
    var client = new Paho.Client("172.20.0.145", 8083, wx.getStorageSync('key'));
    client.onConnectionLost = that.onConnectionLost;
    client.onMessageArrived = that.onMessageArrived;
    client.connect({
      useSSL: false,
      // userName: 'user',
      userName: wx.getStorageSync('key'),
      // password: 'pwd',
      password: wx.getStorageSync('pwd'),
      cleanSession: true,
      keepAliveInterval: 30,
      onSuccess: function() {
        console.log("onConnect");
        that.data.client = client
        client.subscribe(that.buildTopic('#'));
        that.publish('ping', '1')
      }
    });

    var adate = new Date(wx.getStorageSync('adate'));
    var ndate = new Date();
    var days_t = ndate.getTime() - adate.getTime();
    var days = parseInt(days_t / (1000 * 60 * 60 * 24));
    var year = adate.getFullYear()
    var month = adate.getMonth() + 1
    var day = adate.getDate()
    var adate_str = year + '年' + month + '月' + day + '日 - ' + days + '天'
      this.setData({
        lockno: wx.getStorageSync('lockno'),
        adate: adate_str
      })

    this.setbutton()
  },

  verify: function() {
    var that = this;
    if (this.data.statu == '1') {
			this.FingerPrint()
    } else {
      wx.showToast({
        title: '当前状态为  ' + statu_code[that.data.statu],
        icon: 'none'
      })
    }
  },

  //是否可以指纹识别
  checkIsFingerPrint: function() {
    var boole = this.data.isfingerPrint
    if (!boole) {
      wx.showToast({
				title: "不可以使用指纹识别",
      })
      return false
    } else {
      return true
    }

  },

  //进行指纹识别
  FingerPrint: function() {
		var that = this
    if (this.checkIsFingerPrint) {
      wx.startSoterAuthentication({
        requestAuthModes: ['fingerPrint'],
        challenge: 'sakura',
        authContent: '请用指纹',
        success(res) {
          console.log("识别成功", res)
          var morf = wx.getStorageSync('morf')
        	that.publish(morf, '1')
        },
        fail(res) {
          console.log("识别失败", res)
          wx.showToast({
            title: '识别失败',
						icon: 'none'
          })
        }
      })
    }
  },

  setting: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['注销设备', '历史纪录'],
      success(res) {
        // console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          wx.showModal({
            title: '注销设备',
            content: '确认注销设备？',
            cancelColor: '#3cc51f',
            confirmColor: '#f00',
            success: function(res) {
              if (res.confirm == true)
                that.dellock()
            }
          })
        }
        if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '../history/history',
          })
        }
      }
    })
  },

  dellock: function dellock() {
    console.log('dellock function')

    wx.login({
      success: function(res) {
        if (res.code) {
          wx.request({
            // url: 'http://127.0.0.1:5000/dellog',
            url: 'http://172.20.0.145:80/dellog',
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
  },

  setbutton: function setbutton() {
    this.setData({
      m_verify: false,
      f_verify: false
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

  buildTopic: function buildTopic(item) {
    return '/' + wx.getStorageSync('lockno') + '/' + item
  },

  publish: function publish(item, payload) {
    var message = new Paho.Message(payload);
    message.destinationName = this.buildTopic(item);
    this.data.client.send(message);
  },

  onConnectionLost: function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0)
      console.log("onConnectionLost:" + responseObject.errorMessage);
  },

  onMessageArrived: function onMessageArrived(message) {
    console.log("onMessageArrived: [" + message.destinationName + "] " + message.payloadString);
    var topic = message.destinationName
    var payload = message.payloadString
    var topic_part = topic.split('/')
    // console.log(topic_part)
    if (topic_part[2] == 'statu') {
      this.setData({
        statu: payload
      })
      if (payload == '-2') {
        this.setData({
          charge: ''
        })
      }

    }
    if (topic_part[2] == 'charge') {
      this.setData({
        charge: payload
      })
    }
    if (topic_part[2] == 'm') {
      this.setData({
        m_button: false,
        m_verify: true
      })
      this.display_check()
    }
    if (topic_part[2] == 'f') {
      this.setData({
        f_button: false,
        f_verify: true
      })
      this.display_check()
    }
  },

  display_check: function display_check() {
    var that = this
    if (that.data.m_verify && that.data.f_verify == true) {
      clearTimeout(that.data.timeoutID)
      wx.vibrateLong()
      wx.showLoading({
        title: '正在开锁',
      })
      setTimeout(function() {
        wx.hideLoading()
        that.setbutton()
      }, 2000)

    } else {
      var timeoutid;
      timeoutid = setTimeout(that.setbutton, 30000)
      that.data.timeoutID = timeoutid
    }
  }

})