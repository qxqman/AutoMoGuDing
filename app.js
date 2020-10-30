/**
 * ============================================
 *  @author : 乔越博客
 *  @host : http://www.79bk.cn/
 *  @version : v1.0
 *  @description : 对蘑菇丁APP实施自动签到功能
 *  @email : duogongnengq@163.com
 *  @Copyright : 2020 乔越博客. All rights reserved
 *  ============================================
 */

// 使用 Koa 框架
const Koa = require("koa");
// 接收请求数据
const koaBody = require("koa-body")
// 路由转化
const Router = require("koa-router");
// 数据操作；
const mysql2 = require("mysql2");
// 请求
const axios = require("axios")
// 定时任务
const schedule = require('node-schedule');

// 实例化Koa
let app = new Koa();
// 实例化路由
let router = new Router();
const url = 'https://api.moguding.net:9000'
// 实例化接收数据
app.use(koaBody());
// 连接数据库
const connection = mysql2.createConnection({
    host: "",
    user: "",
    password: "",
    database: ""
})


// 获取登陆存数据库
const Ltoken = async (username, password, isUser) => {
    //获取
    let token, userid, resInfo
    // 发送请求 将数据获取
    // 发送 POST 请求
    await axios({
        method: 'post',
        url: url + '/session/user/v1/login',
        data: {
            phone: username,
            loginType: 'iso',
            password: password
        }
    }).then((res) => {
        resInfo = res.data
        if (res.data.code !== 500) {
            let { data } = res.data
            token = data.token
            userid = data.userId
            if (isUser.length == 1) {
                connection.promise().query(`UPDATE user SET  password = "${password}", token = "${data.token}" WHERE userId = "${data.userId}"`)
            } else if (isUser.length == 0) {
                connection.promise().query(`INSERT INTO user (userId,username,phone,gender,token,schoolName,depName,majorName,className,studentNumber,grade,password) VALUES (${data.userId},"${data.orgJson.userName}","${data.phone}","${data.gender}","${data.token}","${data.orgJson.schoolName}","${data.orgJson.depName}","${data.orgJson.majorName}","${data.orgJson.className}",${data.orgJson.studentNumber},"${data.orgJson.grade}","${password}")`);
            }
        }
    });

    return { token, userid }
}

// 获取事件id
const getplanId = async (token, userid) => {
    let planId
    // 添加事件id
    await axios({
        method: 'post',
        url: url + '/practice/plan/v1/getPlanByStu',
        data: {
            paramsType: "student"
        },
        headers: {
            'Authorization': token,
        },
    }).then((res) => {
        let [data] = res.data.data
        planId = data.planId
        connection.promise().query(`UPDATE user SET planId = "${data.planId}" WHERE userId = "${userid}"`)
    })

    return planId
}



// 重登陆
const login = async (type, userId, phone, password, isLogin = false) => {
    //接收数据
    let [isUser] = await connection.promise().query(`SELECT * FROM user WHERE phone = "${phone}"`);
    let token, userid, planId, isok
    await Ltoken(phone, password, isUser).then((result) => {
        token = result.token
        userid = result.userid
    })
    if (token !== undefined || userid !== undefined) {
        await getplanId(token, userid).then((result) => {
            planId = result
            isok = {
                code: 200,
                msg: "登陆成功"
            }
        })
    } else {
        isok = {
            code: 500,
            msg: "账号密码错误"
        }
    }
    if (isLogin) {
        Commuting(type, planId, token, userId, phone, password)
    }
    return isok
}

// 上下班方法
const Commuting = (type, planId, token, userId, phone, password) => {
    /** 
        如果想修改地址的话我们可以修改
        address 地址名称
        longitude 经纬度
        latitude  经纬度
        city 城市名
        province 省份
    */
    let json = {
        "device": "iOS",
        "planId": planId,
        "country": "中国",
        "state": "NORMAL",
        "attendanceType": "",
        "address": "北京市 · 科技楼",
        "type": type,
        "longitude": "116.326664",
        "city": "北京市",
        "province": "北京市",
        "latitude": "39.937648"
    };
    axios({
        method: 'post',
        url: url + '/attendence/clock/v1/save',
        headers: {
            'Authorization': token,
        },
        data: json
    }).then((res) => {
        if (res.data.code == 401 && res.data.msg == 'token失效') {
            login(type, userId, phone, password, true)
        }
    });
}
// 将所以用户的信息拿出来
const userInfo = async (type) => {
    let [users] = await connection.promise().query(`SELECT userId,phone,token,password,planId FROM user`)
    await users.forEach(async (item, index) => {
        await Commuting(type, item.planId, item.token, item.userId, item.phone, item.password)
    })
}

const goToWork = () => {
    //每天的每天早上8点1分30秒触发 ：'30 1 8 * * *'
    schedule.scheduleJob('30 1 8 * * *', () => {
        userInfo("START")
    });
}

goToWork();
const goOffWork = () => {
    //每天的每天晚上上6点6分16秒触发 ：'16 6 18 * * *'
    schedule.scheduleJob('16 6 18 * * *', () => {
        userInfo("END")
    });
}
goOffWork()

// 设置路由
router.post("/addUser", async (ctx, next) => {
    // 设置跨域
    ctx.set("Access-Control-Allow-Origin", "*")
    //接收数据
    let { username, password } = ctx.request.body
    await login("END", "79bk.cn", username, password, false).then((res) => {
        ctx.body = res
    })
})

// 设置中间件 导入路由
app.use(router.routes());

// 开启服务器
app.listen(8880);