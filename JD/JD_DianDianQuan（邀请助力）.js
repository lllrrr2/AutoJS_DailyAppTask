/*
  京东<点点券-邀请助力>任务

  20221230 V1.0
  新增脚本
  20221231 V1.1
  增加黑号检测

*/
var TaskName = "点点券-邀请助力"
Start(TaskName);
console.info("开始任务");
let Task_Log = "重要日志汇总："
Task_Log = Task_Log + "\n" + "========== " + "\n" + "京东点点券" + "\n" + "———————"
/*
  账号明细.js文件说明
  账号文件需和脚本在同一目录
  文件编码为utf-8
  每行一个账号，参数以逗号隔开（中英不限）
  每行第一个参数为任务名称，后续的参数参考对应Run参数说明填写

 */
/*
  Run参数说明：
  参数1：启动的APP名称，如需手动，则填手动
  参数2：对应参数1的APP名称，是否是分身应用，0：正常应用，1：分身有术Pro内部分身，暂不支持其他分身应用（如是小X分身（原多开分身），可在参数1中直接填入分身应用APP名称即可）

*/
if (files.exists("./账号明细.js")) {
  console.info("发现账号文件");
  var file = open("./账号明细.js")
  let AccountIDs = file.readlines()
  let t = 0
  for (var i = 0; i < AccountIDs.length; i++) {
    var str = AccountIDs[i];
    //处理格式
    var str = str.replace(/，/g, ",")
    var str = str.replace(/"/g, "")
    var AccountID = str.split(",");
    if (AccountID[0] == TaskName) {
      console.info("第" + (i + 1) + "行账号符合当前任务，开始执行")
      Run(AccountID[1], AccountID[2]); home();
      console.info("第" + (i + 1) + "行账号任务执行完毕")
      //每5个账号清除一次分身有术的缓存
      if (t > 5 && (t / 5) % 1 === 0) {
        CleanCache("分身有术Pro", 1);
      }
      t++;
    } else {
      console.info("第" + (i + 1) + "行账号不属于当前任务，跳过")
    }
  }
  file.close();
}
else {
  //京东例子
  //Run("京东",0);home();
  //Run("京东",1);home();
  //Run("京东-2",1);home();
  //手动例子
  Run("手动", 0); home();
  //分身有术缓存清理
  //CleanCache("分身有术Pro",1);
}

console.log("已退出脚本");
console.clear();
console.log(Task_Log);
engines.myEngine().forceStop()

function Start() {
  auto.waitFor();//获取无障碍服务权限
  console.show();//开启悬浮窗
  console.info("京东<" + TaskName + ">任务");
}

function Run(LauchAPPName, IsSeparation) {
  if (IsSeparation == null) {
    IsSeparation = 0 //0：正常应用 1：分身有术内部应用
  }
  var IsSeparation_info = ""
  if (IsSeparation == 0) {
    IsSeparation_info = "正常应用"
  } else if (IsSeparation == 1) {
    IsSeparation_info = "分身有术Pro"
  } else {
    IsSeparation_info = "无效参数，改为默认值“非分身应用”"
    IsSeparation = 0
  }
  console.info(
    "当前设置" + "\n" +
    "启动APP：" + LauchAPPName + "\n" +
    "是否分身：" + IsSeparation_info
  )
  Task_Log = Task_Log + "\n" + LauchAPPName + "-" + IsSeparation_info
  //将京口令分段填入，只要里面的特征码即可，分不清什么是特征码的也可以整段放进来，注意用双引号和逗号隔开
  Code = new Array("￥G9outC4YB3￥");//邀请码第一个是助力作者，第二个纯属举例，使用时建议删除
  RunTime = Code.length;
  console.info("共识别到" + RunTime + "个助力码");
  for (var i = 0; i < RunTime; i++) {
    console.log("第" + (i + 1) + "个助力码");
    setClip(Code[i]);
    console.log("助力码写入剪切板");
    if (LauchAPPName == "手动") {
      console.log("请手动打开APP，以便进行下一步");
      while (text("领京豆").findOnce() == null) {
        if (text("立即查看").exists() | app.getAppName(currentPackage()) == "京东" | currentActivity() == "com.jingdong.app.mall.MainFrameActivity") {
          break;
        }
        console.log("当前应用名:  " + app.getAppName(currentPackage()) + "\n"
          + "当前活动:  " + currentActivity() + "\n"
          + "未识别到京东相关界面，继续等待……");
        sleep(3000);
      }
      console.log("已检测到京东APP，等待下一步");
    }
    else {
      if (IsSeparation == 1) {
        console.info("打开分身有术Pro，准备调用分身");
        app.launchApp("分身有术Pro");
        for (var t = 0; !id("tv_app_name").className("android.widget.TextView").text(LauchAPPName).exists(); t++) {
          console.log("等待识别分身……");
          console.log("当前应用名:  " + app.getAppName(currentPackage()) + "\n"
            + "未识别到<" + LauchAPPName + ">，继续等待……");
          sleep(3000);
          if (id("im_close_clear").exists()) {
            console.log("发现加速弹窗");
            id("im_close_clear").findOne().click();
            console.log("关闭加速弹窗");
          }
          if (t > 10) {
            console.log("识别超时，退出当前任务");
            return;
          }
        }
        if (id("tv_app_name").className("android.widget.TextView").text(LauchAPPName).exists()) {
          console.log("找到分身<" + LauchAPPName + ">");
          text(LauchAPPName).findOne().parent().click();
          console.log("分身已启动，等待活动检测……");
        }
      }
      else {
        console.info("打开" + LauchAPPName + "");
        app.launchApp(LauchAPPName);
        console.log("等待任务检测……");
      }
    }
    if (text("立即查看").findOne(2000) == null) {
      console.log("等待APP识别助力码");
      var j = 0;
      while (j < 15 | text("立即查看").findOnce() == null) {
        if (text("立即查看").exists()) {
          break;
        }
        console.log(j + 1);
        j++;
        sleep(1000);
        if (j == 10) {
          console.log("未检测到新助力码，尝试再次复制");
          OutAPP(1000);
          setClip(Code[i]);
          console.log("助力码重新写入剪切板");
          sleep(1000);
          if (LauchAPPName == "手动") {
            console.log("请手动打开APP，以便进行下一步");
            while (text("领京豆").findOnce() == null) {
              if (text("立即查看").exists() | app.getAppName(currentPackage()) == "京东" | currentActivity() == "com.jingdong.app.mall.MainFrameActivity") {
                break;
              }
              console.log("当前应用名:  " + app.getAppName(currentPackage()) + "\n"
                + "当前活动:  " + currentActivity() + "\n"
                + "未识别到京东相关界面，继续等待……");
              sleep(3000);
            }
            console.log("检测到京东APP，等待再次检测");
          }
          else {
            if (IsSeparation == 1) {
              console.info("打开分身有术Pro，准备调用分身");
              app.launchApp("分身有术Pro");
              for (var t = 0; !id("tv_app_name").className("android.widget.TextView").text(LauchAPPName).exists(); t++) {
                console.log("等待识别分身……");
                console.log("当前应用名:  " + app.getAppName(currentPackage()) + "\n"
                  + "未识别到<" + LauchAPPName + ">，继续等待……");
                sleep(3000);
                if (id("im_close_clear").exists()) {
                  console.log("发现加速弹窗");
                  id("im_close_clear").findOne().click();
                  console.log("关闭加速弹窗");
                }
                if (t > 10) {
                  console.log("识别超时，退出当前任务");
                  return;
                }
              }
              if (id("tv_app_name").className("android.widget.TextView").text(LauchAPPName).exists()) {
                console.log("找到分身<" + LauchAPPName + ">");
                text(LauchAPPName).findOne().parent().click();
                console.log("分身已启动，等待活动检测……");
              }
            }
            else {
              console.info("打开" + LauchAPPName + "");
              app.launchApp(LauchAPPName);
            }
            console.log("重启APP成功，等待再次检测");
            sleep(1000);
          }
        }
        if (j > 15) {
          console.error("超时未检测到新助力码，跳过助力任务");
          sleep(1000);
          if (i < RunTime - 1) {
            console.log("退出当前APP，准备第" + (i + 2) + "个助力码");
            OutAPP(2000);
          }
          break;
        }
      }
      if (j > 15) {
        //超时则跳出当前助力任务
        console.info("跳过当前助力");
        continue;
      }
    }
    let TaskKey = "为Ta助力"
    while (text("立即查看").exists()) {
      if (text("立即查看").exists()) {
        console.log("立即查看");
        text("立即查看").findOnce().click();
        while (!text(TaskKey).exists()) {
          sleep(2000);
          console.log("等待加载……");
        }
        if (text(TaskKey).exists()) {
          console.log("为Ta助力");
          text(TaskKey).findOne().click();
          sleep(1000);
          break;
        }
      } else if (text(TaskKey).exists()) {
        console.log("为Ta助力");
        text(TaskKey).findOne().click();
        sleep(1000);
        break;
      }
    }
    //关闭邀请弹窗
    for (var a = 0; a < 15; a++) {
      if (text("邀请好友 赢点点券").exists()) {
        console.log("关闭邀请弹窗");
        text("邀请好友 赢点点券").findOne().click();
        sleep(500);
        back();
        sleep(500);
        break;
      }
      if (a == 10) {
        console.log("超时，跳过收取动作");
        break;
      }
    }
    //最后一次助力特殊处理
    if (i < RunTime - 1) {
      home();
      console.log("准备第" + (i + 2) + "个助力码");
    }
    else {
      console.log("当前账户已助力完成");
      Task_Log = Task_Log + "\n" + "当前账户已助力完成"
      if (a == 10) {
        console.log("当前账号已黑，跳过收取动作");
        Task_Log = Task_Log + "\n" + "当前账号已黑，跳过收取动作"
      }
      else {
        //收点券
        console.info("待检测点点券可收取情况");
        var t = 1
        while (true) {
          let Buttons = text("我的点点券").findOne(5000).parent().parent().parent().children()
          if (Buttons.empty()) {
            console.info("无点点券收取");
            break;
          }
          else {
            for (var ii = 1; ii < Buttons.length - 3; ii++) {
              if (t == 1) {
                console.info("发现可收取点点券");
              }
              let Button = Buttons[ii]
              ButtonText = Button.child(0).child(0).child(0).text()
              if (ButtonText.match(/[+][1-9].*/)) {
                console.log("第" + t + "次收点点券");
                t++;
                Button.click();
                sleep(100);
                if (text("每日攒点点券").findOne(3000) == null) {
                  console.log("点击错误，返回");
                  back();
                  sleep(500);
                }
                else {
                  console.log("收取成功");
                  sleep(500);
                }
              }
              else {
                console.log("已无点点券收取");
                break;
              }
              sleep(500);
            }
          }
          sleep(1500);
          break;
        }
        console.info("点点券收取完毕");
        Task_Log = Task_Log + "\n" + "点点券收取完毕"
        if (textContains("点点券将在7天内过期，快去使用吧").exists()) {
          var log = textContains("点点券将在7天内过期，快去使用吧").findOne().text()
          Task_Log = Task_Log + "\n" + "当前账号" + log.replace("您", "")
          console.error("当前账号" + log.replace("您", ""));
          sleep(2000);
        }
      }
      OutAPP(100);
    }
  }

  back();
  sleep(1000);
  back();
  sleep(1000);
  home();
  sleep(500);

}

//确保退出活动界面及当前账号
function OutAPP(SleepTime) {
  if (SleepTime == null) {
    SleepTime = 100
  }
  back();
  sleep(100);
  back();
  sleep(SleepTime);
}

function CleanCache(LauchAPPName, Isclean) {
  if (LauchAPPName == "分身有术Pro" && Isclean == 1) {
    console.info("打开分身有术Pro，准备清理缓存");
    app.launchApp("分身有术Pro");
    console.log("等待清理");
    for (var i = 0; !id("iv_home_clean").exists() && i < 15; i++) {
      sleep(1000);
      if (i == 5 | i == 10) {
        console.log("已等待" + i + "秒");
      }
      if (id("iv_home_clean").exists()) {
        id("iv_home_clean").findOne().click();
        console.log("加速完毕");
        sleep(3000);
        break;
      }
    }
    if (i >= 15) {
      console.error("识别超时，未能完成加速");
    }
    if (id("im_close_clear").exists()) {
      sleep(2000);
      id("im_close_clear").findOne().click();
      console.log("关闭加速弹窗");
    }
  }
  else {
    console.error("参数不符，退出清理任务");
  }
}
