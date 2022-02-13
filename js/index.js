//holidays: ['假期安排', '元旦节', '除夕', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'],
//https://www.rili.com.cn/wannianli

(function () {
	var calendar = {
		curDate: new Date(),	//当前的日期对象
		holidays: ['假期安排', '元旦节', '除夕', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'],

		init() {
			this.renderSelect(this.curDate);	//渲染下拉列表
			this.getData(this.curDate);
		},
		renderSelect(d) {	//渲染下拉框
			var yearList = document.querySelector('.yearSelect .selectBox ul');
			var monthList = document.querySelector('.montSelect .selectBox ul');
			var holidayList = document.querySelector('.holidaySelect .selectBox ul');
			var yearSelected = document.querySelector('.yearSelect .selected span');
			var monthSelected = document.querySelector('.montSelect .selected span');
			var holidaySelected = document.querySelector('.holidaySelect .selected span');

			//生成年份
			var li = '';
			yearList.innerHTML = '';
			for (var i = 1900; i <= 2050; i++) {
				li += `<li ${i == d.getFullYear() ? 'class="active"' : ''}>${i}年</li>`;
			}
			yearList.innerHTML = li;
			yearSelected.innerHTML = d.getFullYear() + '年';


			//生成月份
			var li = '';
			monthList.innerHTML = '';
			for (var i = 1; i <= 12; i++) {
				li += `<li ${i == (d.getMonth() + 1) ? 'class="active"' : ''}>${i}月</li>`;
			}
			monthList.innerHTML = li;
			monthSelected.innerHTML = (d.getMonth() + 1) + '月';

			//生成假期
			var li = '';
			holidayList.innerHTML = '';
			for (var i = 0; i < this.holidays.length; i++) {
				li += `<li ${i == 0 ? 'class="active"' : ''}>${this.holidays[i]}</li>`;
			}
			holidayList.innerHTML = li;
			holidaySelected.innerHTML = this.holidays[0];

			this.selectBindEvent();	//添加事件

			//this.closeSelect();
		},
		closeSelect() {	//关闭下拉框
			var selects = [...document.querySelectorAll('.select')];	//类数组，不能使用find方法。...是转成真正的数组
			//selects.find(select=>select.classList.contains('active'));
			//var arr = [1, 2, 3].find();
			var open = selects.find(select => select.classList.contains('active'));	//有active的那个元素
			open && open.classList.remove('active');//只有找到有active的元素后才删除这个class
		},
		selectBindEvent() {	//给日期下拉框添加事件
			var selects = document.querySelectorAll('.select');	//所有的下拉框

			selects.forEach((select, index) => {
				var cl = select.classList;	//元素身上的class集合
				var selected = select.querySelector('span');	//点击的那个下拉框里的选中内容

				select.onclick = ev => {
					if (cl.contains('active')) {	//点击的还是自己，就看自己身上有没有active
						cl.remove('active');
					} else {	//点击的是别人
						//关掉别人的active
						//添加自己的active

						this.closeSelect();
						cl.add('active');

						this.scrollBar();	//添加滚动条，要在元素显示的时候去添加
					}

					//console.log(ev.target);	//事件源
					if (ev.target.tagName != 'LI') {	//这个条件成立说明现在点击的不是列表
						return;
					}

					//代码走到这里说明你点击的是li
					var lis = [...select.querySelectorAll('ul li')];
					lis.find(li => li.classList.contains('active')).classList.remove('active');	//把找到的active删除
					ev.target.classList.add('active');	//自己身上添加一个active

					//根据索引值区分点击的是谁
					switch (index) {
						case 0:	//点击的是年
							this.curDate.setFullYear(parseInt(ev.target.innerHTML));	//取到点击的年份，把中文去掉，然后把这个年份设置给curDate;
							selected.innerHTML = ev.target.innerHTML;
							break;
						case 1:	//点击的是月
							this.curDate.setMonth(parseInt(ev.target.innerHTML) - 1);	//因为月分是从0开始的，取到值需要减1
							selected.innerHTML = ev.target.innerHTML;
							break;
						case 2:	//点击的是假期

							selected.innerHTML = ev.target.innerHTML;
							break;
					}

					//console.log(this.curDate);
					this.getData(this.curDate);	//请求数据
				};
			});

			this.monthChange();	//添加切换月份功能
			this.backToday();	//添加返回今天功能
		},
		scrollBar() {	//滚动条
			var scrollWrap = document.querySelector('.yearSelect .selectBox');
			var content = document.querySelector('.yearSelect .selectBox ul');
			var barWrap = document.querySelector('.yearSelect .selectBox .scroll');
			var bar = document.querySelector('.yearSelect .selectBox span');

			//初始化
			bar.style.transform = content.style.transform = 'translateY(0)';

			//设置滑块的高度
			var multiple = (content.offsetHeight + 18) / scrollWrap.offsetHeight;	//内容是内容父级的几倍
			multiple = multiple > 20 ? 20 : multiple;	//内容与内容父级的倍数不能超过20
			bar.style.height = scrollWrap.offsetHeight / multiple + 'px';	//根据倍数算出滑块的高度（相反的关系）

			//滑块拖拽
			var scrollTop = 0;	//滚动条走的距离
			var maxHeight = barWrap.offsetHeight - bar.offsetHeight;	//滑块能走的最大距离

			bar.onmousedown = function (ev) {
				var startY = ev.clientY;	//按下时鼠标的坐标
				var startT = parseInt(this.style.transform.split('(')[1]);	//['translateY','0)'] 按下时元素走的距离

				bar.style.transition = content.style.transition = null;

				document.onmousemove = ev => {
					scrollTop = ev.clientY - startY + startT;	//滚动条走的位置

					// console.log(scrollTop);

					scroll();	//走的功能
				};

				document.onmouseup = () => document.onmousemove = null;
			};
			barWrap.onclick = ev => ev.stopPropagation();	//在滑块的父级区间内按下鼠标要阻止事件冒泡

			function scroll() {
				if (scrollTop < 0) {	//上边走到头了
					scrollTop = 0;
				}

				if (scrollTop > maxHeight) {	//下边走到头了
					scrollTop = maxHeight;
				}

				var scaleY = scrollTop / maxHeight;	//滚动条走的比例

				bar.style.transform = 'translateY(' + scrollTop + 'px)';
				content.style.transform = 'translateY(' + (scrollWrap.offsetHeight - content.offsetHeight - 18) * scaleY + 'px)';
			}

			scrollWrap.onwheel = ev => {	//滚轮滚动事件
				ev.deltaY > 0 ? scrollTop += 10 : scrollTop -= 10;	//ev.deltaY>0表示往下滚动

				bar.style.transition = content.style.transition = '.2s';
				scroll();

				ev.preventDefault();	//阻止默认行为
			};
		},
		getData(d) {	//请求数据 
			$.ajax({
				url: `https://www.rili.com.cn/rili/json/pc_wnl/${d.getFullYear()}/${d.getMonth() + 1}.js`,
				dataType: 'jsonp',
			});

			window.jsonrun_PcWnl = res => {	//一定要把jsonp里的函数定义成全局的
				//console.log(res);
				this.renderDate(d, res.data);	//渲染日期

				//渲染农历
				this.renderLunar(res.data.find(item => item.nian == d.getFullYear() && item.yue == d.getMonth() + 1 && item.ri == d.getDate()));
			};
		},
		getEndDay: (year, month) => new Date(year, month, 0).getDate(),	//获取到某个月的最后一天的日期。月份是几月就传几月，不用+1或者-1
		getFirstWeek: (year, month) => new Date(year, month - 1, 1).getDay(),	//获取某个月的第一天是周几，月份是几月就传几月
		//<div>kaivon</div> <img />
		delTag: str => str.replace(/<\/?.+?\/?>/g, ''),	//删除标签
		repair: v => v < 10 ? '0' + v : v,
		renderDate(d, data) {	//渲染日期
			// console.log(this.getFirstWeek(2031, 2));
			var tbody = document.querySelector('.dateWrap tbody');

			var lastEndDay = this.getEndDay(d.getFullYear(), d.getMonth());	//上个月的最后一天。月份不需要计算
			var curEdnDay = this.getEndDay(d.getFullYear(), d.getMonth() + 1);	//当前月的最后一天，月份要+1
			var week = this.getFirstWeek(d.getFullYear(), d.getMonth() + 1);	//当前月的第一天是周几

			var lastDateNum = week - 1;	//上个月占几个格子
			lastDateNum = week == 0 ? 6 : lastDateNum;	//如果当前月的第一天是周日，那week的值就为0，这个时候需要给上个月留出6个格子
			var prevStartDate = lastEndDay - lastDateNum;	//上个月的起始日期。这个值是少了1，是因为最后一天的格子它也减去了，这个格子不能减
			var nextStartDate = 1;	//下个月起始日期
			var curStartDate = 1;	//当前月起始日期

			var calendar = document.querySelector('#calendar');
			calendar.classList.remove('active');	//如果之前已经有添加了，要先取消再添加

			//console.log(prevStartDate);

			console.log(data);
			var cn = -1;	//记录42次循环走的每一次

			tbody.innerHTML = '';
			for (var i = 0; i < 6; i++) {	//这个循环走的是tr
				var tr = document.createElement('tr');
				var td = '';

				for (var j = 0; j < 7; j++) {	//这个循环走的是td
					//td+='<td></td>';
					cn++;

					var festival = data[cn].jie ? this.delTag(data[cn].jie) : data[cn].r2;
					var weekday = data[cn].jia == 90 ? 'weekday' : '';	//班
					var holiday = data[cn].jia > 90 ? 'holiday' : '';	//休

					if (cn < lastDateNum) {	//走的是上个月的日期
						td += `<td>
							<div class="prevMonth ${weekday + ' ' + holiday}">
								<span>${++prevStartDate}</span>
								<span>${festival}</span>
							</div>
						</td>`;

					} else if (cn >= lastDateNum + curEdnDay) {	//走的是下个月的日期
						td += `<td>
							<div class="nextMonth ${weekday + ' ' + holiday}">
								<span>${nextStartDate++}</span>
								<span>${festival}</span>
							</div>
						</td>`;
					} else {	//走的是当前月的日期
						var cl = '';
						if (curStartDate == d.getDate()) {	//格子里的数值（日期）与当前日期对象(this.curDate)里的日期进行对比
							cl = 'active';
						}

						//这个条件成立，循环的格子是今天的日期
						if (new Date().getFullYear() == d.getFullYear() &&
							new Date().getMonth() == d.getMonth() &&
							new Date().getDate() == d.getDate() &&
							d.getDate() == curStartDate) {
							cl += ' today';
						}

						td += `<td>
							<div class=" ${cl + ' ' + weekday + ' ' + holiday}">
								<span>${curStartDate++}</span>
								<span>${festival}</span>
							</div>
						</td>`;

						if (cl.indexOf('active') != -1 && holiday == 'holiday') {
							//这个条件满足表示是节假日，最外层的父级需要添加红色的class
							var curDay = this.delTag(data[cn].jie);	//循环到这个dd是否是节日
							this.holidays.includes(curDay) && calendar.classList.add('active');

							/*
								添加红色active的条件
									1、当前的格子必需有active的class，表示激活状态 
									2、当前的格子必需有holiday的class，表示是个节日
									3、节日必需为this.holiday里的某一个
							 */
						}
					}

					tr.innerHTML = td;
				}

				tbody.appendChild(tr);
			}

			this.dateBindEvent(data);
		},
		monthChange() {	//切换月份
			var arrows = document.querySelectorAll('.arrow');

			//上个月
			arrows[0].onclick = () => {
				this.curDate.setMonth(this.curDate.getMonth() - 1);	//月份减1
				this.renderSelect(this.curDate);	//渲染下拉框
				this.getData(this.curDate);		//更新日期内容
				this.closeSelect();	//如果下拉框显示的话，就让它消失
			};

			//下个月
			arrows[1].onclick = () => {
				this.curDate.setMonth(this.curDate.getMonth() + 1);	//月份加1
				this.renderSelect(this.curDate);	//渲染下拉框
				this.getData(this.curDate);		//更新日期内容
				this.closeSelect();	//如果下拉框显示的话，就让它消失
			};
		},
		backToday() {	//返回今天功能
			var returnBtn = document.querySelector('#calendar .topBar button');

			returnBtn.onclick = () => {
				this.curDate = new Date();	//今天的日期
				this.renderSelect(this.curDate);	//渲染下拉框
				this.getData(this.curDate);		//更新日期内容
			};
		},
		dateBindEvent(data) {	//日期点击功能
			//console.log(data);
			var boxes = [...document.querySelectorAll('.dateWrap tbody td div')];
			var last = boxes.find(box => box.classList.contains('active'));

			var curYear = this.curDate.getFullYear();	//当前的年份
			var curMonth = this.curDate.getMonth();	//当前的月份

			boxes.forEach((box, index) => box.onclick = () => {
				var date = box.children[0].innerHTML;	//点击的日期
				//选项卡
				var cl = box.classList;

				last && last.classList.remove('active');
				cl.add('active');
				last = box;

				this.closeSelect();	//如果下拉框显示，点击的话需要隐藏

				if (cl.contains('prevMonth')) {	//点击的是上个月
					this.curDate = new Date(curYear, curMonth - 1, date);	//这里要同时设置年月日

					this.renderSelect(this.curDate);
					this.getData(this.curDate);
				} else if (cl.contains('nextMonth')) {	//点击的是下个月
					this.curDate = new Date(curYear, curMonth + 1, date);	//这里要同时设置年月日

					this.renderSelect(this.curDate);
					this.getData(this.curDate);
				} else {	//点击的当前月
					var calendar = document.querySelector('#calendar');
					var curDay = box.children[1].innerHTML;	//点击的那个日期的农历
					//this.holidays.includes(curDay);

					calendar.className = this.holidays.includes(curDay) ? 'active' : '';

					this.renderLunar(data[index]);	//渲染农历
				}
			});
		},
		renderLunar(data) {	//渲染农历
			console.log(data);
			var date = document.querySelector('.right .date');
			var day = document.querySelector('.right .day');
			var ps = document.querySelectorAll('.right .lunar p');
			var holidayList = document.querySelector('.right .holidayList');

			date.innerHTML = data.nian + '-' + this.repair(data.yue) + '-' + this.repair(data.ri);
			day.innerHTML = data.ri;
			ps[0].innerHTML = data.n_yueri;
			ps[1].innerHTML = data.gz_nian + '年 ' + data.shengxiao;
			ps[2].innerHTML = data.gz_yue + '月 ' + data.gz_ri;

			//节日
			var holidays = this.delTag(data.jieri).split(',');
			holidays = holidays.length > 2 ? holidays.slice(0, 2) : holidays;
			holidayList.innerHTML = '';
			holidays.forEach(holiday => holidayList.innerHTML += `<li>${holiday}</li>`);
			// console.log(holidays);

			//宜忌
			var defaultDl = document.querySelectorAll('.suit .default dl');
			var hoverDl = document.querySelectorAll('.suit .hover dl');

			defaultDl[0].innerHTML = '<dt>宜</dt>';
			data.yi.forEach(yi => defaultDl[0].innerHTML += `<dd>${yi}</dd>`);

			defaultDl[1].innerHTML = '<dt>忌</dt>';
			data.ji.forEach(ji => defaultDl[1].innerHTML += `<dd>${ji}</dd>`);


			//hover对应的结构
			var str = '';
			data.yi.forEach(yi => str += `${yi}、`);
			hoverDl[0].innerHTML = '<dt>宜</dt><dd>' + str.substr(0, str.length - 1) + '</dd>';

			var str = '';
			data.ji.forEach(ji => str += `${ji}、`);
			hoverDl[1].innerHTML = '<dt>忌</dt><dd>' + str.substr(0, str.length - 1) + '</dd>';
		}

		//微信：haokeruyi
	};

	calendar.init();
})();
