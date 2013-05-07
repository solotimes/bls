var models = require('../../models'),
    Sequelize = require('sequelize'),
    Utils = Sequelize.Utils,
    utility = require('../logics/utility'),
    extend = require('extend'),
    iconv = require('iconv-lite'),
    moment = require('moment'),
    xlsx = require('node-xlsx'),
    Q = require('q');


function fetchCustomerWrongKnowledges(cid,start,end){
  var records;
  var sql = "SELECT `KnowledgesQuestions`.`KnowledgeId` as `kid` , " +
            "`CustomerPapers`.`CustomerId` as `cid` , "+
            "sum(case when `Wrong` = 1  then 1 else 0 end) as `wcount`,"+
            "count(`Questions`.`id`) as `qcount` "+
            "FROM CustomerPapers,CustomerPapersQuestions,Questions,`KnowledgesQuestions` "+
            "where `CustomerPapers`.`CustomerId`= "+ cid +
            " AND `CustomerPapersQuestions`.`CustomerPaperId` = `CustomerPapers`.`id`"+
            " AND `CustomerPapersQuestions`.`QuestionId` = `Questions`.`id`"+
            " AND `KnowledgesQuestions`.`QuestionId` = `Questions`.`id` ";
  if(start)
    sql += Utils.format(["AND `CustomerPapers`.`CreatedAt` > ? ",start]);
  if(end)
    sql += Utils.format(["AND `CustomerPapers`.`.CreatedAt` < ? ",end]);
  sql += 'GROUP BY `kid`;';
  return Q.when(models.sequelize.query(sql))
  .then(function(results){
    records = results;
    var kids = records.map(function(record){return record.kid;});
    return models.Question.findAll({
        where:{
          'KnowledgesQuestions.KnowledgeId': kids,
          'CustomerPapersQuestions.Wrong': 1,
          'CustomerPapers.CustomerId': cid
        },
        include: ['Knowledge','CustomerPaper']});
  })
  .then(function(questions){
    records.forEach(function(record){
      try{
        record.wrate = Math.round(100 * record.wcount / record.qcount);
        record.questions = questions.filter(function(q){
          return q.knowledges.filter(function(k){return k.id==record.kid;}).length;
        });
      }catch(e){}
    });
    return records;
  });
}

function exportExcel(res,name,data){
  var buffer = xlsx.build({worksheets: [
    {"name":"mySheetName", "data":data}
  ]});
  res.attachment(name+moment().format('YYYYMMDD-Hmmss')+'.xlsx');
  res.end(buffer);
}

exports.report1 = function(req, res ,next ){
  var report = {};
  var knowledges;
  var searchParams = {};
  req.fetchParams(['Start','End'],function(name,value){
    searchParams[name]=value;
  });
  Q.resolve(req.param('CustomerIds'))
  .then(function(str){
    if(!str)
      return;
    var ids = str.split(',');
    searchParams.CustomerIds = str;
    return Q.when(models.Customer.findAll({
      where: {id: ids}
    }))
    .then(function(customers){
      report.customers = customers;
      return customers.map(function(customer){
        return fetchCustomerWrongKnowledges(customer.id,searchParams.start,searchParams.end);
      });
    })
    .all()
    .then(function(results){
      report.rows = {};
      results.forEach(function(result){
        result.forEach(function(record){
          report.rows[record.kid] = report.rows[record.kid] || {};
          report.rows[record.kid][record.cid] = record;
        });
      });

      return Q.when(models.Knowledge.findAll({where:{id:Utils._.keys(report.rows)}}));
    })
    .then(function(knowledges){
      report.rows = knowledges.map(function(knowledge){
        return Utils._.extend(knowledge.values,report.rows[knowledge.id]);
      });
      return report;
    });
  })
  .then(function(){
    if(req.param('type') == 'export'){
      var data = [];
      var line = ['','',''];
      report.customers.forEach(function(customer){
        line = line.concat([customer.Name,customer.School,'']);
      });
      data.push(line);
      line = ['分类1','分类2','知识点'];
      report.customers.forEach(function(customer){
        line = line.concat(['错误率','错题数','错题ID']);
      });
      data.push(line);
      report.rows.forEach(function(row){
        var r = [row.Level1,row.Level2,row.Name];
        report.customers.forEach(function(customer){
          var cols = row[customer.id];
          r = r.concat([
            cols ? cols.wrate : '',
            cols ? cols.wcount: '',
            cols ? cols.questions.map(function(q){return q.id;}).join(',') : ''
          ]);
        });
        data.push(r);
      });
      exportExcel(res,'学生错题目知识点错误分布',data);
    }
    else
      res.render('statistics/report1',{report:report,searchParams:searchParams});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.report2 = function(req,res,next){
  var report = {};
  var knowledges;
  var searchParams = {};
  var query = {};
  query.include = ['CustomerPaper'];
  query.where = '`Questions`.`Status` in(5,6,8)';
  query.addAttributes = ' sum(case when `Wrong` = 1  then 1 else 0 end) as `wcount` ';
  query.addAttributes += ', count(DISTINCT `CustomerPapers`.`id`) as `qcount` ';
  query.group = '`Questions`.`id`';
  // query.order = '`CreatedAt` DESC';

  req.fetchParam('School',function(School){
    searchParams['School']=School;
    query.join = ' LEFT OUTER JOIN `Customers` ON `Customers`.`id`=`CustomerPapers`.`CustomerId` ';
    query.where += Utils.format(['AND `Customers`.`School` LIKE ? ','%' + School + '%']);
  });

  req.fetchParam('GradeId',function(GradeId){
    searchParams['GradeId']=GradeId;
    query.where += Utils.format(['AND `CustomerPapers`.`GradeId` = ? ',GradeId]);
  });
  req.fetchParams(['Condition','Method','Difficulty'],function(name,value){
    searchParams[name] = value;
    query.where += Utils.format(['AND `Questions`.`'+name+'` = ? ',value]);
  });

  req.fetchParam('KnowledgeIds',function(str){
    var kids = str.split(',').map(function(kid) {
          return Utils.escape(kid);
        });
    searchParams['KnowledgeIds'] = str.split(',');
    query.include.push('Knowledge');
    query.where += 'AND `KnowledgeId` IN ( '+ kids.join(',') +') ';
    // query.attributes = Utils._.keys(models.Question.attributes).concat([['Questions.id','qid']]);
  });

  if(!Utils._.keys(searchParams).length)
    return res.render('statistics/report2',{report:report,searchParams:searchParams});
  Q.when(models.Question.findAll(query))
  .then(function(questions){
    if(!questions)
      return;
    report.questions = questions.filter(function(q){
      return q.wcount;
    });
    var ids = report.questions.map(function(q){
      return q.id;
    });
    return Q.when(models.Question.findAll({where:{id:ids},include:['Knowledge']}))
    .then(function(qWithks){
      report.questions.forEach(function(question){
        try{
          var knowledges = qWithks.forEach(function(qwithk){
            if(qwithk.id==question.id && qwithk.knowledges && qwithk.knowledges[0].id){
              question.knowledges = qwithk.knowledges;
              if(searchParams.KnowledgeIds){
                var dup = question.knowledges.filter(function(k){
                  return searchParams.KnowledgeIds.indexOf(""+(k.id)) != -1;
                }).length;
                question.wcount -= Math.max(dup-1,0);
              }
              question.complex = (question.knowledges.length > 1);
            }
          });
          question.wrate = Math.round(100*question.wcount/question.qcount);
        }catch(e){console.log(e);}
      });
      report.questions = report.questions.sort(function(a,b){
        return b.wrate - a.wrate;
      });
    });
  })
  .then(function(){
    if(req.param('type') == 'export'){
      var data = [['类型', '复合', '提干','错误率','错误数量','修改时间', '录入时间']];
      report.questions.forEach(function(question){
        data.push([
            models.Question.Types[question.Type],
            question.knowledges && question.knowledges.length ? '复' : '',
            {value:' '+question.Excerpt,formatCode:'@'},
            {value:question.wrate/100,formatCode:'00%'},
            question.wcount,
            moment(question.UpdatedAt).format('YYYY/MM/DD'),
            moment(question.CreatedAt).format('YYYY/MM/DD')
          ]);
      });
      exportExcel(res,'学校年级错题统计',data);
    }
    else
      res.render('statistics/report2',{report:report,searchParams:searchParams});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};


exports.report3 = function(req,res,next){
  var report = {};
  var knowledges;
  var searchParams = {};
  var query = {};
  var id = req.param('id');
  if(!id)
    res.render('statistics/report3',{report:report,searchParams:searchParams});
  else
    Q.when(models.Question.findAll({
      where:{
        id:id
      },
      include: ['CustomerPaper'],
      join: ' LEFT OUTER JOIN `Customers` ON `Customers`.`id`=`CustomerPapers`.`CustomerId` ',
      addAttributes: ' sum(case when `Wrong` = 1  then 1 else 0 end) as `wcount`, '+
                     ' count(DISTINCT `CustomerPapers`.`id`) as `qcount` ,' +
                     ' count(DISTINCT case when `Wrong` = 1 then `Customers`.`id` else NULL end) as ccount',
      group: '`Questions`.`id`'
    }))
    .then(function(questions){
      report.question=questions[0];
      return Q.when(models.Customer.findAll({
        include: ['CustomerPaper','Level','Grade','Role'],
        join: ' LEFT OUTER JOIN `CustomerPapersQuestions` ON `CustomerPapers`.`id` = `CustomerPapersQuestions`.`CustomerPaperId` ',
        group: '`Customers`.`id`',
        where: '`CustomerPapersQuestions`.`QuestionId` = "'+id+'" AND `CustomerPapersQuestions`.`Wrong` = 1'
      }));
    })
    .then(function(customers){
      report.customers = customers;
      if(req.param('type') == 'export'){
        var data=[['会员ID','会员类别','姓名','身份','用户名','邮箱','性别','学校','年级','到期时间','最后登陆时间']];
        report.customers.forEach(function(customer){
          data.push([
            customer.id,
            customer.levelText(),
            customer.Name,
            customer.roleText(),
            customer.UserName,
            customer.Email,
            customer.Gender ? '男' : '女',
            customer.School,
            customer.gradeText(),
            customer.ExpireDate ? moment(customer.ExpireDate).format('YYYY/MM/DD') : '',
            customer.LoginTime ? moment(customer.LoginTime).format('YYYY/MM/DD') : ''
          ]);
        });
        exportExcel(res,'错题用户名单统计',data);
      }
      else
        res.render('statistics/report3',{report:report,searchParams:searchParams});
    })
    .fail(function(error){
      logger.log(error);
      next(error);
    });
};

exports.report4 = function(req,res,next){
  var report = {};
  var knowledges;
  var searchParams = {};
  var query = {};
  var kid = req.param('KnowledgeId');
  searchParams.KnowledgeId = kid;
  if(!kid)
    return res.render('statistics/report4',{report:report,searchParams:searchParams});

  query.include= ['Knowledge','CustomerPaper'];
  query.where = Utils.format([' `Knowledges`.`id` = ? ',kid]);
  query.join = ' LEFT OUTER JOIN `Customers` ON `Customers`.`id`=`CustomerPapers`.`CustomerId` ';
  query.addAttributes = ' sum(case when `Wrong` = 1  then 1 else 0 end) as `wcount`, '+
                  ' count(DISTINCT `CustomerPapers`.`id`,`Questions`.`id`) as `qcount` ,' +
                  ' count(DISTINCT case when `Wrong` = 1 then `Customers`.`id` else NULL end) as ccount';
  query.group = '`Knowledges`.`id`';

  req.fetchParams(['Condition','Method'],function(name,value){
    searchParams[name] = value;
    query.where += Utils.format(['AND `Questions`.`'+name+'` = ? ',value]);
  });

  Q.when(models.Question.findAll(query))
  .then(function(questions){
    if(!questions || !questions.length)
      return;
    Utils._.extend(report,Utils._.pick(questions[0],'wcount','qcount','ccount'));
    query = {
      include: ['CustomerPaper','Level','Grade','Role'],
      join: ' LEFT OUTER JOIN `CustomerPapersQuestions` ON `CustomerPapers`.`id` = `CustomerPapersQuestions`.`CustomerPaperId` ' +
            ' LEFT OUTER JOIN `KnowledgesQuestions` ON `KnowledgesQuestions`.`QuestionId` = `CustomerPapersQuestions`.`QuestionId`' +
            ' LEFT OUTER JOIN `Questions` ON `KnowledgesQuestions`.`QuestionId` = `Questions`.`Id`',
      group: '`Customers`.`id`',
      where: '`CustomerPapersQuestions`.`Wrong` = 1' +
              Utils.format([' AND `KnowledgesQuestions`.`KnowledgeId` = ? ',kid])
    };
    req.fetchParams(['Condition','Method'],function(name,value){
      searchParams[name] = value;
      query.where += Utils.format(['AND `Questions`.`'+name+'` = ? ',value]);
    });
    return Q.when(models.Customer.findAll(query))
      .then(function(customers){
        report.customers = customers;
      });
  })
  .then(function(){
    if(req.param('type') == 'export' && report.customers){
      var data=[['会员ID','会员类别','姓名','身份','用户名','邮箱','性别','学校','年级','到期时间','最后登陆时间']];
      report.customers.forEach(function(customer){
        data.push([
          customer.id,
          customer.levelText(),
          customer.Name,
          customer.roleText(),
          customer.UserName,
          customer.Email,
          customer.Gender ? '男' : '女',
          customer.School,
          customer.gradeText(),
          customer.ExpireDate ? moment(customer.ExpireDate).format('YYYY/MM/DD') : '',
          customer.LoginTime ? moment(customer.LoginTime).format('YYYY/MM/DD') : ''
        ]);
      });
      exportExcel(res,'错题知识点用户名单统计',data);
    }
    else
      res.render('statistics/report4',{report:report,searchParams:searchParams});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.report5 = function(req,res,next){
  var report = {};
  var searchParams = {};
  var query = {};
  query.where = ' `Papers`.`Status` = 6 ';

  req.fetchParam('Name',function(Name){
    searchParams['Name']=Name;
    query.where += Utils.format(['AND `Papers`.`Name` LIKE ? ','%' + Name + '%']);
  });

  req.fetchParams(['Type','GradeId'],function(name,value){
    searchParams[name] = value;
    query.where += Utils.format(['AND `Papers`.`'+name+'` = ? ',value]);
  });

  if(!Utils._.keys(searchParams).length)
    return  res.render('statistics/report5',{report:report,searchParams:searchParams});

  Q.when(models.Paper.count(query))
  .then(function(count){
    if(!count)
      return;
    report.paperCount = count;
    query.include = ['Question'];
    query.join = ' LEFT OUTER JOIN `PapersQuestions` ON `PapersQuestions`.`QuestionId` = `Questions`.`id` ' +
                 ' LEFT OUTER JOIN `Papers` ON `Papers`.`id` = `PapersQuestions`.`PaperId` ';
    query.addAttributes = ' count(DISTINCT `Papers`.`id`) as `pcount` ,' + //出现试卷数
                          ' count( case when `Questions`.`Type` = 0 then 1 else NULL end) as `t0count` ,'+ //选择题次数
                          ' count( case when `Questions`.`Type` = 1 then 1 else NULL end) as `t1count` ,'+ //填空题次数
                          ' count( case when `Questions`.`Type` = 2 then 1 else NULL end) as `t2count` '  //主观题次数
                          ;
    query.group = '`Knowledges`.`id` ';

    return Q.when(models.Knowledge.findAll(query))
            .then(function(knowledges){
              report.knowledges = knowledges;
            });
  })
  .then(function(){
    if(report.knowledges){
      report.knowledges = report.knowledges.sort(function(a,b){
        [a,b].forEach(function(k){
          if(Utils._.isUndefined(k.rate))
            k.rate = Math.round(100*k.pcount/report.paperCount);
        });
        return b.rate - a.rate;
      });
    }
    if(req.param('export') == 'true' && report.knowledges){
      var data=[['分类','子分类','知识点','出现率','单选(分)','填空(分)','主观(分)']];
      report.knowledges.forEach(function(knowledge){
        data.push([
          knowledge.Level1,
          knowledge.Level2,
          knowledge.Name,
          {value:knowledge.rate/100,formatCode: '00%'},
          knowledge.t0count * 3,
          knowledge.t1count * 3,
          knowledge.t2count * 8
        ]);
      });
      exportExcel(res,'卷子知识点题目分布',data);
    }
    else
      res.render('statistics/report5',{report:report,searchParams:searchParams});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });

};