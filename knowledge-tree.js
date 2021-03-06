var Sequelize = require('sequelize');
var Utils = Sequelize.Utils;
var fs = require('fs');

var lines = [
"第一章 数的整除,1.1 整数和整除的意义",
"第一章 数的整除,1.2 因数和倍数",
"第一章 数的整除,1.3 能被2、5整除的数,能被2、5整除的数的特征及应用",
"第一章 数的整除,1.3 能被2、5整除的数,能被3整除的数的特征，能被2、3、5整数数的综合应用",
"第一章 数的整除,1.4 素数、合数与分解素因数,素数、合数的概念",
"第一章 数的整除,1.4 素数、合数与分解素因数,素因数的概念，分解素因数的方法",
"第一章 数的整除,1.5 公因数与最大公因数",
"第一章 数的整除,1.6 公倍数与最小公倍数",
"第二章 分数,2.1 分数与除法",
"第二章 分数,2.2 分数的基本性质,分数的性质",
"第二章 分数,2.2 分数的基本性质,约分",
"第二章 分数,2.2 分数的基本性质,一个数和另一个数的几分之几",
"第二章 分数,2.3 分数的大小比较",
"第二章 分数,2.4 分数的加减法,异分母分数相加减",
"第二章 分数,2.4 分数的加减法,正分数、假分数、带分数",
"第二章 分数,2.4 分数的加减法,分数加减法的简单应用",
"第二章 分数,2.5 分数的乘法",
"第二章 分数,2.6 分数的除法,倒数的意义",
"第二章 分数,2.6 分数的除法,分数除法的运算法则",
"第二章 分数,2.7 分数与小数的互化,分数与有限小数的互化",
"第二章 分数,2.7 分数与小数的互化,循环小数",
"第二章 分数,2.8 分数、小数的四则混合运算,运算法则",
"第二章 分数,2.8 分数、小数的四则混合运算,运算律",
"第二章 分数,2.9 分数运算的应用,分数应用的三个核心问题",
"第二章 分数,2.9 分数运算的应用,分数运算的基本应用",
"第三章 比和比例,3.1 比的意义",
"第三章 比和比例,3.2 比的基本性质",
"第三章 比和比例,3.3 比例",
"第三章 比和比例,3.4 百分比的意义",
"第三章 比和比例,3.5 百分比的应用,常用的百分率问题",
"第三章 比和比例,3.5 百分比的应用,图标类问题",
"第三章 比和比例,3.5 百分比的应用,盈利率、亏损率问题",
"第三章 比和比例,3.5 百分比的应用,利率和税率问题",
"第三章 比和比例,3.6 等可能事件",
"第四章 圆和扇形,4.1 圆的周长",
"第四章 圆和扇形,4.2 弧长",
"第四章 圆和扇形,4.3 圆的面积,圆的面积公式",
"第四章 圆和扇形,4.3 圆的面积,圆面积和半径的关系",
"第四章 圆和扇形,4.4 扇形的面积,扇形的面积公式",
"第四章 圆和扇形,4.4 扇形的面积,扇形面积与半径、圆心角的关系",
"第五章 有理数,5.1 有理数的意义",
"第五章 有理数,5.2 数轴,数轴的定义和画法",
"第五章 有理数,5.2 数轴,相反数的定义和应用",
"第五章 有理数,5.3 绝对值",
"第五章 有理数,5.4 有理数的加法,有理数加法法则及应用",
"第五章 有理数,5.4 有理数的加法,有理数加法运算律及应用",
"第五章 有理数,5.5 有理数的减法",
"第五章 有理数,5.6 有理数的乘法,有理数乘法法则及简单应用",
"第五章 有理数,5.6 有理数的乘法,有理数乘法法则与运算律的应用",
"第五章 有理数,5.7 有理数的除法",
"第五章 有理数,5.8 有理数的乘方",
"第五章 有理数,5.9 有理数的混合运算,有理数混合运算法则及简单应用",
"第五章 有理数,5.9 有理数的混合运算,运算律在有理数混合运算中的应用",
"第五章 有理数,5.10 科学计数法",
"第六章 一次方程（组）和一次不等式（组）,6.1 列方程",
"第六章 一次方程（组）和一次不等式（组）,6.2 方程的解",
"第六章 一次方程（组）和一次不等式（组）,6.3 一元一次方程及其解法,移项",
"第六章 一次方程（组）和一次不等式（组）,6.3 一元一次方程及其解法,去括号",
"第六章 一次方程（组）和一次不等式（组）,6.3 一元一次方程及其解法,去分母",
"第六章 一次方程（组）和一次不等式（组）,6.3 一元一次方程及其解法,含有字母的一元一次方程",
"第六章 一次方程（组）和一次不等式（组）,6.4 一元一次方程的应用,比例和调配问题",
"第六章 一次方程（组）和一次不等式（组）,6.4 一元一次方程的应用,理财问题",
"第六章 一次方程（组）和一次不等式（组）,6.4 一元一次方程的应用,行程问题",
"第六章 一次方程（组）和一次不等式（组）,6.5 不等式及其性质,不等式的性质1",
"第六章 一次方程（组）和一次不等式（组）,6.5 不等式及其性质,不等式的性质2、3",
"第六章 一次方程（组）和一次不等式（组）,6.6 一元一次不等式的解法,移项、化简",
"第六章 一次方程（组）和一次不等式（组）,6.6 一元一次不等式的解法,去括号",
"第六章 一次方程（组）和一次不等式（组）,6.6 一元一次不等式的解法,去分母",
"第六章 一次方程（组）和一次不等式（组）,6.7 一元一次不等式组,不等式组的解集",
"第六章 一次方程（组）和一次不等式（组）,6.7 一元一次不等式组,不等式组的解法",
"第六章 一次方程（组）和一次不等式（组）,6.8 二元一次方程",
"第六章 一次方程（组）和一次不等式（组）,6.9 二元一次方程组及其解法,代入消元",
"第六章 一次方程（组）和一次不等式（组）,6.9 二元一次方程组及其解法,加减消元法",
"第六章 一次方程（组）和一次不等式（组）,6.10 三元一次方程组及其解法",
"第六章 一次方程（组）和一次不等式（组）,6.11 一元方程组的应用,二元一次方程组的应用",
"第六章 一次方程（组）和一次不等式（组）,6.11 一元方程组的应用,二元一次方程组和三元一次方程组的应用",
"第七章 线段和角的画法,7.1 线段的大小的比较",
"第七章 线段和角的画法,7.2 画线段的和、差、倍",
"第七章 线段和角的画法,7.3 角的概念与表示",
"第七章 线段和角的画法,7.4 角的大小的比较、画相等的角",
"第七章 线段和角的画法,7.5 画角的和、差、倍",
"第七章 线段和角的画法,7.6 余角、补角",
"第八章 长方体的再认识,8.1 长方体的元素",
"第八章 长方体的再认识,8.2 长方体直观图的画法",
"第八章 长方体的再认识,8.3 长方体中棱与棱位置关系的认识",
"第八章 长方体的再认识,8.4 长方体中棱与平面位置关系的认识,棱与平面垂直",
"第八章 长方体的再认识,8.4 长方体中棱与平面位置关系的认识,棱与平面平行",
"第八章 长方体的再认识,8.5 长方体中平面与平面位置关系的认识,平面与平面垂直",
"第八章 长方体的再认识,8.5 长方体中平面与平面位置关系的认识,平面与平面平行",
"第九章 整式,9.1 字母表示数,字母表示数、公式、规律、数量关系",
"第九章 整式,9.1 字母表示数,观察、归纳规律",
"第九章 整式,9.2 代数式",
"第九章 整式,9.3 代数式的值,直接、整体代入求值",
"第九章 整式,9.3 代数式的值,列代数式",
"第九章 整式,9.4 整式,单项式、系数、次数、多项式、项、次数",
"第九章 整式,9.4 整式,降升幂排列",
"第九章 整式,9.5 合并同类项,同列项概念和简单合并同类项",
"第九章 整式,9.5 合并同类项,先化简再求值",
"第九章 整式,9.6 整式的加减,去括号合并同类项",
"第九章 整式,9.6 整式的加减,实际问题转化成整式加减",
"第九章 整式,9.7 同底数幂的乘法,同底数幂的乘法法则",
"第九章 整式,9.7 同底数幂的乘法,奇数次幂和偶数次幂",
"第九章 整式,9.8 幂的乘方,幂的乘方法则",
"第九章 整式,9.8 幂的乘方,逆用幂的乘方法则、简单应用",
"第九章 整式,9.9 积的乘方,积德乘方法则",
"第九章 整式,9.9 积的乘方,逆用积德乘方法则",
"第九章 整式,9.10 整式的乘法,单项式乘单项式",
"第九章 整式,9.10 整式的乘法,单项式乘多项式",
"第九章 整式,9.10 整式的乘法,多项式乘多项式",
"第九章 整式,9.10 整式的乘法,整式乘法的运用",
"第九章 整式,9.11 平方差公式,平方差公式",
"第九章 整式,9.11 平方差公式,运用平方差公式简化解决问题",
"第九章 整式,9.12 完全平方公式,两项完全平方公式的运用",
"第九章 整式,9.12 完全平方公式,两项以上完全平方公式的运用",
"第九章 整式,9.13 提取公因式法,公因式为单项式",
"第九章 整式,9.13 提取公因式法,公因式为多项式",
"第九章 整式,9.14 公式法,平方差公式",
"第九章 整式,9.14 公式法,完全平方公式",
"第九章 整式,9.14 公式法,综合应用",
"第九章 整式,9.15 十字相乘法,二次项系数为1的二次三项式",
"第九章 整式,9.15 十字相乘法,综合应用",
"第九章 整式,9.16 分组分解法,一三、二二基本型分解",
"第九章 整式,9.16 分组分解法,综合应用",
"第九章 整式,9.17 同底数幂的除法,同底数幂的除法",
"第九章 整式,9.18 单项式除以单项式,单项式除以单项式",
"第九章 整式,9.19 多项式除以单项式,多项式除以单项式",
"第十章 分式,10.1 分式的意义",
"第十章 分式,10.2 分式的基本性质",
"第十章 分式,10.3 分式的乘除",
"第十章 分式,10.4 分式的加减,分式加减法法则及其应用",
"第十章 分式,10.4 分式的加减",
"第十章 分式,10.5 可以化成一元一次方程的分式方程",
"第十章 分式,10.6 整数指数幂及其运算,整数指数幂的运算法则及其应用",
"第十章 分式,10.6 整数指数幂及其运算",
"第十一章 图形的运动,11.1 平移",
"第十一章 图形的运动,11.2 旋转",
"第十一章 图形的运动,11.3 旋转对称中心与中心对称中心",
"第十一章 图形的运动,11.4 中心对称中心",
"第十一章 图形的运动,11.5 翻折与轴对称",
"第十一章 图形的运动,11.6 轴对称",
"第十二章 实数,12.1 实数的概念,无理数的概念以及实数的分类",
"第十二章 实数,12.2 平方根和开平方,求一个非负数的平方和平方根",
"第十二章 实数,12.2 平方根和开平方,估算带根号的无理数的大小",
"第十二章 实数,12.3 立方根和开立方",
"第十二章 实数,12.4 n次方根",
"第十二章 实数,12.5 用数轴上的点表示实数",
"第十二章 实数,12.6 实数的运算,实数运算法则及性质",
"第十二章 实数,12.6 实数的运算,准确数、近似数、精确度、有效数字的概念",
"第十二章 实数,12.6 实数的运算,运用实数的运算解决简单的实际问题",
"第十二章 实数,12.7 分数指数幂,方根与分数指数幂的转化",
"第十二章 实数,12.7 分数指数幂,利用幂的运算性质对含方根算式进行计算",
"第十三章 相交线 平行线,13.1 邻补角、对顶角",
"第十三章 相交线 平行线,13.2 垂线,两直线垂直问题",
"第十三章 相交线 平行线,13.2 垂线,点到直线的距离",
"第十三章 相交线 平行线,13.3 同位角、内错角、同旁内角",
"第十三章 相交线 平行线,13.4 平行线的判定,同位角相等，两直线平行",
"第十三章 相交线 平行线,13.4 平行线的判定,内错角相等，两直线平行；同旁内角互补，两直线平行",
"第十三章 相交线 平行线,13.4 平行线的判定,综合应用",
"第十三章 相交线 平行线,13.5 平行线的性质,两直线平行，同位角相等",
"第十三章 相交线 平行线,13.5 平行线的性质,两直线平行，内错角相等；两直线平行，同旁内角互补；平行线的传递性",
"第十三章 相交线 平行线,13.5 平行线的性质,平行线间的距离",
"第十三章 相交线 平行线,13.5 平行线的性质,平行线判定与性质综合应用",
"第十四章 三角形,14.1 三角形的有关概念,三角形的有关线段",
"第十四章 三角形,14.1 三角形的有关概念,三角形的分类",
"第十四章 三角形,14.2 三角形的内角和,三角形的内角和性质",
"第十四章 三角形,14.2 三角形的内角和,三角形的外角",
"第十四章 三角形,14.2 三角形的内角和,三角形的内、外角性质的应用",
"第十四章 三角形,14.3 全等三角形的概念与性质,全等三角形的概念与性质",
"第十四章 三角形,14.3 全等三角形的概念与性质,画三角形",
"第十四章 三角形,14.4 全等三角形的判定,全等三角形的判定方法1（S.A.S）",
"第十四章 三角形,14.4 全等三角形的判定,全等三角形的判定方法2（A.S.A）",
"第十四章 三角形,14.4 全等三角形的判定,全等三角形的判定方法3（A.A.S）、4（S.S.S）",
"第十四章 三角形,14.4 全等三角形的判定,全等三角形判定方法的应用",
"第十四章 三角形,14.5 等腰三角形的性质",
"第十四章 三角形,14.6 等腰三角形的判定,等角对等边",
"第十四章 三角形,14.6 等腰三角形的判定,等腰三角形判定的应用",
"第十四章 三角形,14.7 等边三角形",
"第十五章 平面直角坐标系,15.1 平面直角坐标系,根据点的位置写出坐标",
"第十五章 平面直角坐标系,15.1 平面直角坐标系,根据坐标找出点的位置",
"第十五章 平面直角坐标系,15.2 直角坐标平面内点的运动,平行于坐标轴的两点间距离、图形面积",
"第十五章 平面直角坐标系,15.2 直角坐标平面内点的运动,图形平移前后对应点的坐标",
"第十五章 平面直角坐标系,15.2 直角坐标平面内点的运动,关于坐标轴、原点对称的对应点的坐标",
"第十六章 二次根式,16.1 二次根式,概念与性质",
"第十六章 二次根式,16.1 二次根式,利用性质化简",
"第十六章 二次根式,16.2 最简二次根式和同类二次根式,最简二次根式",
"第十六章 二次根式,16.2 最简二次根式和同类二次根式,同类二次根式",
"第十六章 二次根式,16.3 二次根式的运算,加法和减法",
"第十六章 二次根式,16.3 二次根式的运算,乘法和除法",
"第十六章 二次根式,16.3 二次根式的运算,分母有理化",
"第十六章 二次根式,16.3 二次根式的运算,混合运算",
"第十七章 一元二次方程,17.1 一元二次方程的概念",
"第十七章 一元二次方程,17.2 一元二次方程的解法,开平方法",
"第十七章 一元二次方程,17.2 一元二次方程的解法,因式分解法",
"第十七章 一元二次方程,17.2 一元二次方程的解法,配方法",
"第十七章 一元二次方程,17.2 一元二次方程的解法,公式法",
"第十七章 一元二次方程,17.2 一元二次方程的解法,综合应用",
"第十七章 一元二次方程,17.3 一元二次方程根的判别式,根的判别式",
"第十七章 一元二次方程,17.3 一元二次方程根的判别式,字母系数的取值范围",
"第十七章 一元二次方程,17.4 一元二次方程的应用,二次三项式的因式分解",
"第十七章 一元二次方程,17.4 一元二次方程的应用,实际问题",
"第十八章 正比例函数和反比例函数,18.1 函数的概念,函数基本概念",
"第十八章 正比例函数和反比例函数,18.1 函数的概念,函数的定义域与值域",
"第十八章 正比例函数和反比例函数,18.2 正比例函数,基本概念",
"第十八章 正比例函数和反比例函数,18.2 正比例函数,图像与性质",
"第十八章 正比例函数和反比例函数,18.3 反比例函数,基本概念",
"第十八章 正比例函数和反比例函数,18.3 反比例函数,图像与性质1",
"第十八章 正比例函数和反比例函数,18.3 反比例函数,图像与性质2",
"第十八章 正比例函数和反比例函数,18.4 函数的表示方法1",
"第十八章 正比例函数和反比例函数,18.5 函数的表示方法2",
"第十九章 几何证明,19.1 命题和证明,演绎证明",
"第十九章 几何证明,19.1 命题和证明,命题、公理、定理",
"第十九章 几何证明,19.2 证明举例,平行线的判定和性质",
"第十九章 几何证明,19.2 证明举例,用全等三角形性质证明边角相等",
"第十九章 几何证明,19.2 证明举例,全等三角形与平行",
"第十九章 几何证明,19.2 证明举例,全等三角形与垂直",
"第十九章 几何证明,19.2 证明举例,根据基本图形补形添线",
"第十九章 几何证明,19.2 证明举例,中线加倍与沿角平分线翻折",
"第十九章 几何证明,19.2 证明举例,文字命题的证明",
"第十九章 几何证明,19.3 逆命题和逆定理",
"第十九章 几何证明,19.4 线段的垂直平分线",
"第十九章 几何证明,19.5 角的平分线,角平分线性质定理及其逆定理",
"第十九章 几何证明,19.5 角的平分线,四个定理的综合应用",
"第十九章 几何证明,19.6 轨迹",
"第十九章 几何证明,19.7 直角三角形全等的判定",
"第十九章 几何证明,19.8 直角三角形的性质,直角三角形的性质",
"第十九章 几何证明,19.8 直角三角形的性质,直角三角形的性质推论",
"第十九章 几何证明,19.9 勾股定理,勾股定理",
"第十九章 几何证明,19.9 勾股定理,勾股定理逆定理",
"第十九章 几何证明,19.9 勾股定理,勾股定理的应用",
"第十九章 几何证明,19.10 两点的距离公式",
"第二十章 一次函数,20.1 一次函数的概念",
"第二十章 一次函数,20.2 一次函数的图像,图像的截距及与坐标轴的交点",
"第二十章 一次函数,20.2 一次函数的图像,图像的倾斜程度",
"第二十章 一次函数,20.2 一次函数的图像,与一次方程、一次不等式的关系",
"第二十章 一次函数,20.3 一次函数的性质,增减性",
"第二十章 一次函数,20.3 一次函数的性质,位置特征",
"第二十章 一次函数,20.4 一次函数的应用,解析式的建立与图像信息问题",
"第二十章 一次函数,20.4 一次函数的应用,简单分段函数与决策问题",
"第二十一章 代数方程,21.1 一元整式方程",
"第二十一章 代数方程,21.2 特殊的高次方程的解法,二项方程",
"第二十一章 代数方程,21.2 特殊的高次方程的解法,双二次方程",
"第二十一章 代数方程,21.2 特殊的高次方程的解法,因式分解法解特殊的高次方程",
"第二十一章 代数方程,21.3 可化为一元二次方程的分式方程,基本概念",
"第二十一章 代数方程,21.3 可化为一元二次方程的分式方程,去分母法求解分式方程",
"第二十一章 代数方程,21.3 可化为一元二次方程的分式方程,换元法求解分式方程（组）",
"第二十一章 代数方程,21.4 无理方程,基本概念",
"第二十一章 代数方程,21.4 无理方程,基本解法",
"第二十一章 代数方程,21.5 二元二次方程和方程组",
"第二十一章 代数方程,21.6 二元二次方程的解法,代入消元求解“类型1”",
"第二十一章 代数方程,21.6 二元二次方程的解法,因式分解求解“类型2”",
"第二十一章 代数方程,21.7 列方程（组）解应用题,百分率问题",
"第二十一章 代数方程,21.7 列方程（组）解应用题,工程问题",
"第二十一章 代数方程,21.7 列方程（组）解应用题,行程问题",
"第二十一章 代数方程,21.7 列方程（组）解应用题,图形与直角坐标系问题",
"第二十一章 代数方程,21.7 列方程（组）解应用题,“商品”问题",
"第二十二章 四边形,22.1 多边形,多边形的内角和与对角线",
"第二十二章 四边形,22.1 多边形,多边形的外角和",
"第二十二章 四边形,22.2 平行四边形,平行四边形的性质1、2",
"第二十二章 四边形,22.2 平行四边形,平行四边形的性质3、4",
"第二十二章 四边形,22.2 平行四边形,平行四边形的判定1、2",
"第二十二章 四边形,22.2 平行四边形,平行四边形的判定3、4",
"第二十二章 四边形,22.2 平行四边形,平行四边形的性质和判定",
"第二十二章 四边形,22.3 特殊的平行四边形,矩形和菱形的性质",
"第二十二章 四边形,22.3 特殊的平行四边形,矩形和菱形的判定",
"第二十二章 四边形,22.3 特殊的平行四边形,正方形的性质",
"第二十二章 四边形,22.3 特殊的平行四边形,正方形的判定",
"第二十二章 四边形,22.4 梯形",
"第二十二章 四边形,22.5 等腰梯形,等腰梯形的性质",
"第二十二章 四边形,22.5 等腰梯形,等腰梯形的判定",
"第二十二章 四边形,22.6 三角形、梯形的中位线,三角形的中位线",
"第二十二章 四边形,22.6 三角形、梯形的中位线,梯形的中位线",
"第二十二章 四边形,22.6 三角形、梯形的中位线,中位线在四边形中的综合运用",
"第二十二章 四边形,22.7 平面向量",
"第二十二章 四边形,22.8 平面向量的加法,向量加法的三角形法则和运算律",
"第二十二章 四边形,22.8 平面向量的加法,向量加法的多边形法则",
"第二十二章 四边形,22.9 平面向量的减法,向量减法的三角形法则",
"第二十二章 四边形,22.9 平面向量的减法,向量加法的平行四边形法则",
"第二十三章 概率初步,23.1 确定事件和随机事件",
"第二十三章 概率初步,23.2 事件发生的可能性",
"第二十三章 概率初步,23.3 事件的概率,频率与概率",
"第二十三章 概率初步,23.3 事件的概率,等可能事件",
"第二十三章 概率初步,23.3 事件的概率,列表法与树形图",
"第二十三章 概率初步,23.4 概率计算举例,一般概率问题",
"第二十三章 概率初步,23.4 概率计算举例,与几何图形有关的概率问"
];

function find(level,name){
  var sel = level.filter(function(node){
    return node.name === name;
  });
  if(sel.length){
    return sel[0];
  }
  else{
    return false;
  }
}

exports.records = [];
exports.tree = {name:"root",children:[]};
lines.forEach(function(line,i){
  var cols = line.split(',');
  var point = cols.splice(-1,1);
  var deepNode = cols.reduce(function(node,col){
    var subnode = find(node.children,col);
    if(!subnode){
      subnode = {name: col,children:[],pointIds:[]};
      node.children.push(subnode);
    }
    return subnode;
  },exports.tree);

  var record = {
    Level1: cols[0],
    Level2: cols.length > 1 ? cols[1] : point,
    Name: point,
    Difficulty: 3
  };
  exports.records.push(record);
  deepNode.pointIds.push(i+1);
});

if (!module.parent) {
  var models = require('./models');
  models.Knowledge.sync({force:true}).success(function(){
    var chainer = new Sequelize.Utils.QueryChainer();
    exports.records.forEach(function(record){
      chainer.add(models.Knowledge,'create',[record]);
    });
    chainer.runSerially();
  });
  fs.writeFileSync(__dirname + '/public/knowledge-tree.json',JSON.stringify(exports.tree,null,'  '));
}
