var Sequelize = require("sequelize"),
    models = require('./models'),
    qi = models.sequelize.getQueryInterface(),
    async = require('async'),
    q = require('q');
    utility = require('./routes/logics/utility'),
    fs = require('fs'),
    moment = require('moment');

for(var modelName in models){
    var model = models[modelName];
    eval("var " + modelName + " = model;");
}

function createAll(Model,records){
  var chainer = new Sequelize.Utils.QueryChainer();
  records.forEach(function(record){
      chainer.add(Model.create(record));
  });
  return chainer.run();
}

function seed(){
    async.auto({
      AddColumns: function(fn){
        var chainer = new Sequelize.Utils.QueryChainer();
        chainer.add(qi.addColumn('CustomerPapersQuestions','Wrong',{
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }));
        chainer.add(qi.addColumn('CustomerPapersQuestions','Order',Sequelize.INTEGER));
        chainer.add(qi.addColumn('CustomerPapersQuestions','Number',Sequelize.STRING));
        chainer.add(qi.addColumn('PapersQuestions','Wrong',{
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }));
        chainer.add(qi.addColumn('PapersQuestions','Order',Sequelize.INTEGER));
        chainer.add(qi.addColumn('PapersQuestions','Number',Sequelize.STRING));
        chainer.add(qi.addColumn('GeneratedPaper','Wrong',{
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }));
        chainer.add(qi.addColumn('GeneratedPaper','Order',Sequelize.INTEGER));
        chainer.add(qi.addColumn('GeneratedPaper','Number',Sequelize.STRING));
        chainer.run().done(fn);
      },
      Grades:function(fn){
        var grades = [
          {Name:"预初",  Order:1},
          {Name:"初一",  Order:2},
          {Name:"初二",  Order:3},
          {Name:"初三",  Order:4},
          {Name:"中考",  Order:4}
        ];
        createAll(Grade,grades).done(fn);
      },
      CustomeRoles:function(fn){
        var roles = [
          {Name:"学生",Order:1},
          {Name:"家长",Order:2},
          {Name:"老师",Order:3}
        ];
        createAll(CustomerRole,roles).done(fn);
      },
      Levels:function(fn){
        var levels = [
            {Name: '青铜', Order: 1},
            {Name: '白银', Order: 2},
            {Name: '黄金', Order: 3},
            {Name: '钻石', Order: 4}
        ];
        createAll(Level,levels).done(fn);
      },
      Customers:function(fn){
        var customers = [];
        for(i = 0; i < 40 ; i++){
            customers.push({
                Name:'客户'+i,
                UserName:'customer'+i,
                Password:'b1b3773a05c0ed0176787a4f1574ff0075f7521e',
                Email:'victor.guo@d1miao.com',
                Enabled:true,
                CustomerRoleId: Math.round(Math.random()*2)+1,
                LevelId: Math.round(Math.random()*3)+1,
                GradeId: Math.round(Math.random()*3)+1,
                LoginIP:'127.0.0.1',
                LoginTime:utility.getCurrentTime(),
                Gender: (Math.random()*2 > 1),
                Class: '测试班级',
                School: '测试学校'
            });
        }
        createAll(Customer,customers).done(fn);
      },
      AdminRoles:function(fn){
        var adminRoles = [
            {Name: '分配员', Order:1 },
            {Name: '录入员', Order:2 },
            // {Name: '标错题', Order:3 },
            {Name: '老师', Order:4 },
            {Name: '试卷库题库管理', Order:5 },
            {Name: '推送', Order:6 },
            {Name: '管理员', Order:7 }
        ];
        createAll(AdminRole,adminRoles).done(fn);
      },
      // 添加 主要admin账户 密码 admin
      Admin:function(fn,results){
        Admin.create({
            Name:'Admin',
            UserName:'admin',
            Password:'d033e22ae348aeb5660fc2140aec35850c4da997',
            Email:'admin@example.com',
            LoginIP:'127.0.0.1',
            LoginTime:utility.getCurrentTime()
        }).done(fn);
      },
      // 设置 admin 拥有所有的权限
      SetAdminRoles:['Admin','AdminRoles',function(fn,results){
        var roles = results.AdminRoles;
        results.Admin.setRoles(roles);
      }],
      AddMoreAdmins:['Admin',function(fn){
        var chainer = new Sequelize.Utils.QueryChainer();
        for(var i=0 ; i< 30; i++){
            chainer.add(Admin,'create',[{
                Name: ('Admin'+i),
                UserName: ('admin'+i),
                Password:'d033e22ae348aeb5660fc2140aec35850c4da997',
                Email: ('admin' + i + '@example.com'),
                LoginIP:'127.0.0.1',
                LoginTime: utility.getCurrentTime()
            }]);
        }
        chainer.runSerially().done(fn);
      }],
      CustomerPapers: ['Customers',function(fn,results){
        // var customers = results.Customers;
        // var papers = [];
        // for(var i = 0; i < 40 ; i++){
        //     var cid = Math.round(Math.random()*(customers.length-1));
        //     papers.push({
        //         Name:'测试试卷'+i,
        //         CustomerId: customers[cid].id,
        //         CreatedAt:utility.getCurrentTime(),
        //         CodeName: moment().format('YYYYMDD-X')
        //     });
        // }
        // createAll(CustomerPaper,papers).done(fn);
        fn();
      }],
      CustomerPaperPics: function(fn){
        var pics = [];
        for(var i=0; i<160; i++){
          pics.push({
            PicIndex: i%4,
            CreatedAt:utility.getCurrentTime(),
            PicPath: 'paper'+ (i%2+1)+'.jpg',
            AudioPath: ((i%2 === 0) ? 'record.ogg' : null),
            CustomerPaperId: (Math.floor(i/4) + 1)
          });
        }
        createAll(CustomerPaperPic,pics).done(fn);
      },
      Knowledges: function(fn){
        var json = JSON.parse(fs.readFileSync(__dirname + '/knowledges.json'));
        points = json.points;
        var chainer = new Sequelize.Utils.QueryChainer();
        points.forEach(function(point,i){
          chainer.add(Knowledge,'create',[{Name:point,Difficulty:3}]);
        });
        chainer.runSerially().done(fn);
      }
    },function(error, results){
      console.log(error);
    });
}

sequelize.sync().success(seed);