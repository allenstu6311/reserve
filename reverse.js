const APP = {
    data() {
        return {
            //月曆
            month: '',
            year: new Date().getFullYear(),
            day: [],
            holiday: [],
            description: [],
            date: [],
            //預約
            reverse: [],
            registerTime: [],
            id: '',
            type: '',//教練
            time: '',//日期
            post: '',//備註
            hour: '',//時間
            //燈箱
            showBox: false,
            //時間下拉選單
            timeList: [
                '10:00',
                '11:00',
                '12:00',
                '13:00',
                '14:00',
                '15:00',
                '16:00',
                '17:00',
                '18:00',
                '19:00',
            ],
            Available: [],//篩選後的時間
            //教練
            coach: [],
            coachList: ["全部", "黃玄", '俊彥', '宇俊'],
            choseCoach: '黃玄',
            //其他
            judge: [],//判斷時間不重複
            showTime: dayjs(new Date()).format('YYYY/MM/DD'),
            fucusDay: '',//被點到的日期
        }
    },
    methods: {
        getToDay() {//月曆
            this.day = []
            let first_day = new Date(this.year, this.month - 1, 1)
            for (let i = 0; i < this.monthDay[this.month - 1] + first_day.getDay(); i++) {
                this.day.push(i - first_day.getDay() + 1)
            }
            this.holidayApi()
        },
        toRegister(item) {//點選日期時就把資料準備好
            this.registerTime = []
            this.registerTime.push(this.year)
            this.registerTime.push(this.month)
            this.registerTime.push(item)

            this.judge = this.reverse.filter(v => v.registerTime[0] == this.year && v.registerTime[1] == this.month && v.registerTime[2] == item)
            this.resetTime()
            this.time = this.year + '/' + this.month + '/' + item
            this.showTime = this.time
        },
        goResverse() {//點預約時確認有沒有選日期
            if (this.time == '') {
                alert("尚未選取日期")
            } else {
                this.showBox = true
            }
        },
        resetTime() {//重新選教練時重置時間
            this.coach = this.reverse.filter(v => v.type == this.type && this.judge.some(u => u.registerTime[0] == v.registerTime[0] && u.registerTime[1] == v.registerTime[1] && u.registerTime[2] == v.registerTime[2]))


            if (this.coach.length) {
                let coachTime = this.timeList.filter(v => this.coach.some(u => v == u.hour))
                this.Available = this.timeList.filter(v => coachTime.indexOf(v) == -1)
            } else {
                this.Available = this.timeList
            }
        },
        sendReverse() {//確認預約
            let sure = confirm("確定送出?")
            if (sure) {
                this.reverse.push({
                    id: this.reverse.length,
                    type: this.type,
                    time: this.time,
                    hour: this.hour,
                    post: this.post,
                    registerTime: this.registerTime
                })
                this.setLocalStorage()
                this.orderByReverse()
                let sameTime = this.timeList.filter(v => this.reverse.some(u => v == u.hour))
                this.Available = this.timeList.filter(v => sameTime.indexOf(v) == -1)
                this.showBox = false
                this.time = ''
                this.type = ''
                this.post = ''
                this.hour = ''
                this.fucusDay = ''
            }
        },
        deleteReverse(item, index) {//取消預約
            let sure = confirm("確定取消?")
            if (sure) {
                this.reverse.splice(index, 1)
                this.setLocalStorage()
            }
        },
        setLocalStorage() {//存入local
            localStorage.setItem("reverse", JSON.stringify(this.reverse))
        },
        getreverse() {//拿local資料
            let list = localStorage.getItem('reverse')
            if (!list) return
            this.reverse = JSON.parse(list)
        },
        orderByReverse() {//所有預約的排序
            this.reverse.sort(function (a, b) {
                let orderA = a.hour[0] + a.hour[1]
                let orderB = b.hour[0] + b.hour[1]
                return orderA - orderB

            })
        },
        holidayApi() {//拿假日的資料
            if (new Date().getFullYear() == this.year) {
                fetch('./holiday.json')
                    .then(res => res.json())
                    .then(json => {

                        this.holiday = json.filter(item => item.isHoliday == true)
                        this.holiday = this.holiday.filter(item => dayjs(item.date).format('M') == this.month)
                        this.holiday = this.holiday.map(item => dayjs(item.date).format('D'))

                        this.description = json.filter(item => item.description)
                        this.description = this.description.filter(item => dayjs(item.date).format('M') == this.month)
                        this.date = this.description.map(item => dayjs(item.date).format('D'))
                        for (let i = 0; i < this.date.length; i++) {
                            this.description[i].date = this.date[i]
                        }
                    })
            } else {
                fetch("https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/2023.json")
                    .then(res => res.json())
                    .then(json => {

                        this.holiday = json.filter(item => item.isHoliday == true)
                        this.holiday = this.holiday.filter(item => dayjs(item.date).format('M') == this.month)
                        this.holiday = this.holiday.map(item => dayjs(item.date).format('D'))

                        this.description = [...json].filter(item => item.description)
                        this.description = this.description.filter(item => dayjs(item.date).format('M') == this.month)
                        this.date = this.description.map(item => dayjs(item.date).format('D'))

                        for (let i = 0; i < this.date.length; i++) {
                            this.description[i].date = this.date[i]
                        }
                    })

            }
        },
        preNum(num) {//上個月or年
            if (num == 2) {
                if (this.month <= 1) this.month = 12, this.year -= 1
                else this.month -= 1
                this.getToDay()

            } else {
                this.year -= 1
                this.getToDay()
            }

        },
        nextNum(num) {//下個月or年
            if (num == 2) {
                if (this.month >= 12) this.month = 1, this.year++
                else this.month++
                this.getToDay()
            } else {
                this.year++
                this.getToDay()
            }

        }
    },
    created() {
        this.getreverse()
    },
    computed: {
        isLeapTear() {
            return (this.year % 4 === 0 && this.year % 100 !== 0 && this.year % 400 !== 0 || this.year % 100 === 0 && this.year % 400 === 0) ? 29 : 28
        },
        monthDay() {
            return [31, this.isLeapTear, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        },
    },
    mounted() {
        this.month = dayjs(new Date()).format('YYYY-MM-DD').split('-')[1]//拿這個月的月份
        this.getToDay()
        this.orderByReverse()
    },
}
const app = Vue.createApp(APP)
app.mount("#app")