const users = [{
  openid: '1',
  nickname: '丘龙',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/UBb9rpw8DvwtdBhs202szaApaAHDlQzUffz9bicKxibWiaANbuUkSOBYobZqGcvEkkNtWAicmWZ3V0lyUshvwmLaAO1Eku4nNtIb/132',
  is_show: true,
}, {
  openid: '2',
  nickname: '疯猿',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/UBb9rpw8Dvyf6Q3lBDkPypXJeYUPlpDq1ib5x8NRIzFDQYXhP0PyvQyOhwMp5VSrziahjtX4RKCPlKwDKGib5MYRMyku6LhExhw/132',
  is_show: true,
}, {
  openid: '3',
  nickname: 'rookie',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/EgQUCFHu06msYLcibMa8oOY43OXyx6G6OGtIbSwmO7rflnY9N4CianJ3KOq8hd2zNbmkLl4z3jSsCLBkMBs7EOQ6pcoMzPRpmZ/132',
  is_show: true,
}, {
  openid: '4',
  nickname: '-core',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/5GgBjQicia7ic250jMZIicwQI7YU8ebvNa0qb7XmbwMQHTengjAByMEQn7M0TTLrt1bbpdZThvJXAXd7zBcJBSaJJIqBFBI6KBfV/132',
  is_show: true,
}]
const prizes = [{
  prize_id: 1,
  prize_img: '',
  prize_name: '三等奖',
  can_repeat: 0,
  is_published: 0,
  users: [],
}, {
  prize_id: 2,
  prize_img: '',
  prize_name: '二等奖',
  can_repeat: 0,
  is_published: 0,
  users: [],
}, {
  prize_id: 3,
  prize_img: '',
  prize_name: '一等奖',
  can_repeat: 0,
  is_published: 0,
  users: [],
}, {
  prize_id: 4,
  prize_img: '',
  prize_name: '特等奖',
  can_repeat: 1,
  is_published: 0,
  users: [],
}]

// 监听浏览器标签切换，停止页面动画
const getHiddenProp = () => {
  let prefixes = ['webkit','moz','ms','o']
  if ('hidden' in document) return 'hidden'
  for (let i = 0; i < prefixes.length; i++)
  {
    if ((prefixes[i] + 'Hidden') in document) return prefixes[i] + 'Hidden'
  }
  return null
}

const getVisibilityState = () => {
  let prefixes = ['webkit', 'moz', 'ms', 'o']
  if ('visibilityState' in document) return 'visibilityState'
  for (let i = 0; i < prefixes.length; i++)
  {
    if ((prefixes[i] + 'VisibilityState') in document) return prefixes[i] + 'VisibilityState'
  }
  return null
}

const isHidden = () => {
  let prop = getHiddenProp()
  if (!prop) return false
  return document[prop]
}

// 获取范围随机数
const getRand = (min, max) => min + Math.round((max - min) * Math.random())

// 全屏
const launchFullscreen = () => {
  if(document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen()
  } else if(document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen()
  } else if(document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen()
  } else if(document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen()
  }
}

// 退出全屏
const exitFullscreen = () => {
  let exitMethod = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.webkitExitFullscreen
  exitMethod && exitMethod.call(document)
}

const parseUrlParams = (str) => {
  if(str == undefined) return {}
  str = str.substr(1)
  let arr = str.split("&"), obj = {}, newArr = []
  arr.map((value,index,arr) => {
    newArr = value.split("=")
    if(newArr[0] != undefined && newArr[0] != '') {
      obj[newArr[0]] = newArr[1]
    }
  })
  return obj
}

const ORIGIN = location.protocol + '//applet.starfoods.com.cn'
let IS_OFFLINE = location.origin !== ORIGIN
// ajax
const ajax = (url = '', data = {}, method = 'get') => {
  if (IS_OFFLINE) {
    console.log('离线模式')
    return Promise.reject('离线模式')
  }
  let headers = {}
  let params = {
    ...parseUrlParams(location.search)
  }
  let body = undefined
  if (method.toLowerCase() == 'post') {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  } else {
    params = {...params, ...data}
  }
  url = `${ORIGIN}/index.php/${url}`
  let paramsArray = []
  //拼接参数
  Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
  if (url.search(/\?/) === -1) {
    url += '?' + paramsArray.join('&')
  } else {
    url += '&' + paramsArray.join('&')
  }
  return fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
  }).then(response => {
    if (response.ok) {
      try {
        return response.json()
      } catch(e) {
        return Promise.reject('服务器繁忙')
      }
    } else {
      return Promise.reject('服务器繁忙')
    }
  })
}

const FORCE_ALERT = true
let tmpPos = []
let tmpTimes = 0
// 主程序
const app = new Vue({
  el: '#app',
  data() {
    return {
      isLoading: true,
      IS_OFFLINE,
      winW: 0, // 窗口宽度
      winH: 0, // 窗口高度
      activityTitle: '2018年公司年会',
      background: './imgs/5.jpg', // 活动背景
      qrImg: './imgs/qr.png', // 二维码图片
      giftImg: './imgs/gift.jpg', // 礼品图片
      users: [], // 参与者列表
      prizes, // 奖项列表
      createUserInterval: null, // // 创建用户定时器
      runBarrageInterval: null, // 弹幕移动定时器
      lotteryPerTimes: 1, // 一次性抽取多少人
      isLotteryStarted: false, // 是否抽奖开始
      isFullScreen: false, // 是否全屏
      showQrImg: true, // 是否显示二维码
      isActivityStarted: false, // 活动是否开始
      showBarrageConfig: false, // 显示弹幕配置
      intShowBarrage: 1, // 是否开启弹幕（int值）
      showBarrage: true, // 是否开启弹幕
      barrageMovePeriod: 10, // 弹幕移动周期（1~10，越大越慢）
      barrageMoveSpeed: 1, // 弹幕移动速度（1~50，越大越快）
      barrageOpacity: 0.8, // 弹幕透明度
      nowPrizeIndex: 0, // 当前奖项索引
      nowLotteryUser: {}, // 当前抽取的用户
      lotteryUserInterval: null, // 随机头像定时器
      showRedoLotteryCheckbox: false, // 是否显示checkbox
      allRedoLotteryChecked: true, // 是否全选
      alertTimeout: null, // 弹窗timeout
      showUserFilter: false, // 显示参与列表
      appOpacity: 0, // 背景图加载进来了再显示div
    }
  },
  computed: {
    // 当前奖品
    nowPrize() {
      if (this.nowPrizeIndex < this.prizes.length) {
        return this.prizes[this.nowPrizeIndex]
      } else {
        return {}
      }
    },
    // 获得奖品的用户数组
    gotPrizeUsers() {
      return this.prizes.reduce((p, v) => {
        return !v.can_repeat ? [...p, ...v.users] : p
      }, [])
    },
    // 没有获得奖品的用户数组
    noRepeatUsers() {
      return this.users.filter(user => {
        return !this.didUserGotPrize(user)
      })
    },
    validUsers() {
    	return this.users.filter(user => user.is_show)
    }
  },
  watch: {
  	isLoading(n) {
  		document.querySelector('.loading').style.display = n ? 'block' : 'none';
  	},
    // 速度更新，重新开启定时器
    barrageMovePeriod() {
      this.runBarrageMove()
    },
    intShowBarrage(n) {
      this.showBarrage = Boolean(parseInt(n))
    },
    // 奖品图片onerror处理
    prizes(n) {
      n.forEach(prize => {
        let img = new Image()
        img.onerror = () => prize.prize_img = this.giftImg
        img.src = prize.prize_img
      })
    },
    // 设置一次抽取人数
    lotteryPerTimes(n, o) {
      if (isNaN(n)) this.lotteryPerTimes = o
      if (n <= 0) this.lotteryPerTimes = 1
      if (n > this.users.length) this.lotteryPerTimes = this.users.length - 1
    }
  },
  created() {
  	// 加载背景
  	let img = new Image()
  	img.onload = () => {
  		this.appOpacity = 1
  		this.startApp()
    	this.refreshAll()
  	}
  	img.src = this.background
  },
  mounted() {
    this.winW = document.documentElement.offsetWidth
    this.winH = document.documentElement.offsetHeight
    let visProp = getHiddenProp()
    if (visProp) {
      let title = document.title
      let evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange'
      document.addEventListener(evtname, () => {
        if (document[getVisibilityState()] == 'hidden') {
          document.title = `已离开页面`
          this.stopApp()
        } else {
          document.title = title
          this.startApp()
        }
      }, false)
    }
    window.onresize = () => {
      this.winW = document.documentElement.offsetWidth
      this.winH = document.documentElement.offsetHeight
    }
    this.$nextTick(() => {
      // 特效按钮
      const animateButton = e => {
        e.preventDefault()
        e.target.classList.remove('animate')
        e.target.classList.add('animate')
        setTimeout(() => e.target.classList.remove('animate'), 700)
      }
      const bubblyBtns = document.getElementsByClassName("bubbly-button")
      for (let i = 0; i < bubblyBtns.length; i++) {
        bubblyBtns[i].addEventListener('click', animateButton, false)
      }
    })
  },
  methods: {
    // 获取弹幕样式
    getBarrageStyle(user = {}) {
      return {
        left: `${user.left}px`,
        top: `${user.top}px`,
        opacity: this.barrageOpacity,
      }
    },
    // 启动App
    startApp() {
      // 刷新用户
      this.runCreateUser()
      // 弹幕移动
      this.runBarrageMove()
    },
    // 停止App
    stopApp() {
      this.stopCreateUser()
      this.stopBarrageMove()
    },
    // 开始创建用户
    runCreateUser() {
      this.stopCreateUser()
      if (!this.isActivityStarted) {
        // 活动没开始
        if (this.IS_OFFLINE) {
          this.createUserInterval = setInterval(() => {
            // 數量比较大用canvas开发，不然会卡
            if (this.users.length >= 50) {
              this.stopCreateUser()
              return
            }
            let randIndex = getRand(0, users.length - 1)
            let user = {...users[randIndex]}
            user.nickname += '' + this.users.length
            user.openid += '' + this.users.length
            this.loadUser(user)
          }, 500)

        } else {
          // 获取远程数据
          this.createUserInterval = setInterval(() => {
            this.getUsers()
          }, 5000)
        }
      }
    },
    // 停止创建用户
    stopCreateUser() {
      clearInterval(this.createUserInterval)
    },
    // 开始弹幕移动
    runBarrageMove() {
      this.stopBarrageMove()
      // 定时器： 1~10最佳
      this.runBarrageInterval = setInterval(() => {
        let resetUsers = []
        let filterIndex = []
        this.users.forEach((user, index) => {
          user.left -= this.barrageMoveSpeed
          if (user.left <= -this.winW) {
            this.resetUserPosition(user)
          }
        })
      }, this.barrageMovePeriod)
    },
    // 重置弹幕位置
    resetUserPosition(user = {}) {
      if (!tmpPos.length || tmpPos.reduce((c, p) => c + p.is_occupy, 0) == tmpPos.length) {
        tmpPos = []
        tmpTimes++
        let iWidth = 130
        let iHeight = 60
        let vSpance = 40
        let vRows = Math.floor((this.winH - 200) / (iHeight + vSpance * 2))
        for(let i = 0; i <= vRows; i++) {
          let left = this.winW + tmpTimes * iWidth
          let top = i * (iHeight + vSpance * 2) + getRand(0, vSpance)
          tmpPos[i] = {
            left: left,
            top: top,
            is_occupy: 0
          }
        }
      }
      let availPos = tmpPos.filter(p => !p.is_occupy)
      if (availPos.length) {
        let randIndex = getRand(0, availPos.length - 1)
        let randPos = {...availPos[randIndex]}
        tmpPos.forEach(p => {
          if(p.top == randPos.top){
            p.is_occupy = 1
            p.user = user.nickname
          }
        })
        user.left = randPos.left
        user.top = randPos.top
      } else {
        console.log(user.nickname)
      }
    },
    // 停止弹幕移动
    stopBarrageMove() {
      clearInterval(this.runBarrageInterval)
    },
    // 切换抽奖状态
    toggoleLottery() {
      if (!this.users.length) {return}
      if (!this.prizes.length) {return}
      this.isLotteryStarted = !this.isLotteryStarted
      clearInterval(this.lotteryUserInterval)
      if (this.isLotteryStarted) {
        // 开始抽奖
        this.lotteryUserInterval = setInterval(() => {
          let randIndex = getRand(0, this.users.length - 1)
          this.nowLotteryUser = this.users[randIndex]
        }, 10)
      } else {
        // 结束抽奖
        let user
        let num = parseInt(this.lotteryPerTimes)
        for(let i = 0; i < num; i++) {
          let loopTimes = 0
          let randIndex
          do {
            randIndex = getRand(0, this.users.length - 1)
            if (randIndex == -1 || loopTimes++ >= 100) {
              randIndex = -1
              break
            }
            user = {...this.users[randIndex], checked: true}
          } while (!user.is_show || (!this.nowPrize.can_repeat && this.didUserGotPrize(user)) || this.didUserInNowPrize(user))
          if (randIndex == -1) {
            this.alertMsg('没有符合条件的抽奖者', FORCE_ALERT)
            return
          }

          this.nowPrize.users.push(user)
          this.showUser(user)
        }
        // 记录抽奖日志
        this.logLottery()
      }
    },
    // 切换全屏
    toggoleFullScreen() {
      this.isFullScreen = !this.isFullScreen
      this.isFullScreen ? launchFullscreen() : exitFullscreen()
    },
    // 开始活动
    toggleActivity() {
      this.showQrImg = this.isActivityStarted
      this.isActivityStarted = !this.isActivityStarted
      if (this.isActivityStarted) {
      	this.showUserFilter = false
        this.stopCreateUser()
      } else {
        this.runCreateUser()
      }
    },
    // 关闭所有菜单
    closeAllMenu() {
      this.showBarrageConfig = false
    },
    // 判断用户是否已经抽奖过
    didUserGotPrize(user = {}) {
      return this.didUserInArr(user, this.gotPrizeUsers)
    },
    // 判断用户是否在当前奖项内
    didUserInNowPrize(user = {}) {
      return this.didUserInArr(user, this.nowPrize.users)
    },
    didUserInArr(user = {}, users = []) {
      return users.some(v => user.openid == v.openid)
    },
    // 重新抽奖
    redoLottery() {
      if (!this.users.length) {return}
      if (!this.prizes.length) {return}
      if (!this.nowPrize.users.length) {return}
      let redoUsers = this.nowPrize.users.filter(user => user.checked)
      if (!redoUsers.length) {return}
      if (confirm('确定要重新抽奖吗？')) {
        this.nowPrize.users = this.nowPrize.users.filter(user => !this.didUserInArr(user, redoUsers))
        this.logLottery()
      }
    },
    // 记录抽奖日志
    logLottery() {
      let data = {
        prize_id: this.nowPrize.prize_id,
        prize_users: this.nowPrize.users,
      }
      return ajax('Admin/OfficialAccount/lottery_log', data, 'post')
        .then(res => {
          if (res.no == -1) {
            this.alertMsg('抽奖记录失败')
          }
        })
        .catch(err => {
          console.log('logLottery: ', err)
          this.alertMsg('服务器繁忙')
        })
    },
    // 确认抽奖结果（发送消息）
    confirmLotteryResult() {
      if (confirm('确定本次抽奖结果吗？')) {
        let data = {
          prize_id: this.nowPrize.prize_id,
        }
        return ajax('Admin/OfficialAccount/confirm_lottery', data, 'get')
          .then(res => {
            if (res.no == -1) {
              this.alertMsg('操作失败')
            } else {
              this.nowPrize.is_published = 1
              this.alertMsg('操作成功')
            }
          })
          .catch(err => {
            console.log('confirmLotteryResult: ', err)
            this.alertMsg('服务器繁忙')
          })
      } else {
        return Promise.reject('点击取消')
      }
    },
    // 切换选中状态
    toggoleChecked() {
      if (!this.users.length) {return}
      if (!this.prizes.length) {return}
      if (!this.nowPrize.users.length) {return}
      this.allRedoLotteryChecked = !this.allRedoLotteryChecked
      this.nowPrize.users.forEach(user => user.checked = this.allRedoLotteryChecked)
    },
    // 点击右侧tr，显示某个头像到左侧
    showUser(user = {}) {
      if (this.isLotteryStarted) {return}
      this.nowLotteryUser = user
    },
    // 获取二维码
    getQr(params = {}) {
      return ajax('Official/Index/createLotteryQr', params, 'get')
        .then(res => {
          if (res.extra && res.extra.qr_path) {
            this.qrImg = res.extra.qr_path
          } else {
            this.alertMsg('获取二维码失败')
          }
        })
        .catch(err => {
          console.log('getQr: ', err)
          this.alertMsg('服务器繁忙')
        })
    },
    // 强制刷新二维码
    refreshQr() {
      this.isLoading = true
      return this.getQr({force_refresh: 1})
        .finally(() => setTimeout(() => this.isLoading = false, 1000))
    },
    // 刷新信息
    refreshAll() {
      this.isLoading = true
      this.users = []
      this.getQr()
        .then(this.getActivityInfo)
        .then(this.getUsers)
        .finally(() => {
          setTimeout(() => this.isLoading = false, 1000)
          if (this.IS_OFFLINE) {
            this.startApp()
          }
        })
    },
    // 活动信息
    getActivityInfo() {
      return ajax('Admin/OfficialAccount/qr_activity_list', {}, 'get')
        .then(res => {
          if (res.msg.count) {
            let activityInfo = res.msg.list[0]
            this.prizes = activityInfo.prizes || []
            this.prizes.forEach(prize => {
              prize.users.forEach(user => {
                user.checked = true
              })
            })
            this.activityTitle = activityInfo.activity_name
          } else {
            this.alertMsg('获取活动信息失败')
            IS_OFFLINE = this.IS_OFFLINE = true
          }
        })
        .catch(err => {
          console.log('getActivityInfo: ', err)
          this.alertMsg('服务器繁忙')
        })
    },
    // 刷新用户参与列表
    getUsers() {
      return ajax('Admin/OfficialAccount/qr_scan_log', {}, 'get')
        .then(res => {
          let list = res.msg.list || []
          let users = list.map(log => ({
            openid: log.scanner_openid,
            nickname: log.scanner_nickname,
            headimgurl: log.scanner_headimgurl,
            scan_time: parseInt(log.scan_time),
            scan_date: log.scan_date,
            is_freshman: parseInt(log.is_freshman),
          }))
          users.forEach(user => this.$nextTick(() => this.loadUser(user)))
        })
        .catch(err => {
          console.log('getUsers: ', err)
          this.stopCreateUser()
          this.alertMsg('服务器繁忙')
        })
    },
    // 设置弹幕位置坐标
    loadUser(user) {
      let img = new Image()
      img.onload = () => {
        if (!this.users.length || this.users.every(u => u.openid != user.openid)) {
          // 新增的弹幕才推入数组，不要反复重置
          this.resetUserPosition(user)
          user.is_show = true
          this.users.push(user)
        }
      }
      img.src = user.headimgurl
    },
    // 解决多个弹窗的问题
    alertMsg(err, forceAlert = false) {
      clearInterval(this.alertTimeout)
      if(!this.IS_OFFLINE || forceAlert) this.alertTimeout = setTimeout(() => alert(err))
    }
  }
})