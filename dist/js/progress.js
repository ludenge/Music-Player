(function (root) {
	function Progress() {
		this.durTime = 0;	//存储总时间
		this.frameId = null;	//定时器
		this.startTime = 0;		//开始播放的时间
		this.lastPercent = 0;	//上次已经走的百分比

		this.init();
	}

	Progress.prototype = {
		init: function () {
			//console.log('abc');

			this.getDom();
		},
		getDom: function () {
			this.curTime = document.querySelector('.curTime');
			this.circle = document.querySelector('.circle');
			this.frontBg = document.querySelector('.frontBg');
			this.totalTime = document.querySelector('.totalTime');
		},

		//渲染总时间
		renderAlltime: function (time) {
			this.durTime = time;	//更新总时间

			time = this.formatTime(time);

			this.totalTime.innerHTML = time;
		},
		formatTime: function (time) {
			time = Math.round(time);
			//266	->	04:26
			var m = Math.floor(time / 60);
			var s = time % 60;

			m = m < 10 ? '0' + m : m;
			s = s < 10 ? '0' + s : s;

			return m + ':' + s;
		},
		move: function (per) {
			var This = this;

			//用户传百分比了，按用户的走；用户没有传按this.lastPercent走
			this.lastPercent = per === undefined ? this.lastPercent : per;

			//播放的时候切换到下一首，再按暂停是无效。由于上次的定时器没有清掉
			cancelAnimationFrame(this.frameId);

			this.startTime = new Date().getTime();

			//计算时间与进度条走的百分比
			function frame() {
				var curTime = new Date().getTime();

				//当前歌曲播放的百分比，考虑到暂停后播放，所以需要加上上次播放的百分比
				var per = This.lastPercent + (curTime - This.startTime) / (This.durTime * 1000);

				if (per <= 1) {
					//这个条件成立说明，当前歌曲还没有播放完
					This.update(per);
				} else {
					cancelAnimationFrame(This.frameId);
				}

				This.frameId = requestAnimationFrame(frame);
			}

			frame();
		},
		update: function (per) {
			//console.log('update');

			//更新左侧时间
			var time = this.formatTime(per * this.durTime);
			this.curTime.innerHTML = time;


			//更新进度条位置
			this.frontBg.style.width = per * 100 + '%';


			//更新圆点位置
			var l = per * this.circle.parentNode.offsetWidth;
			this.circle.style.transform = 'translateX(' + l + 'px)';
		},
		stop: function () {
			cancelAnimationFrame(this.frameId);

			var stopTime = new Date().getTime();

			//从第2次暂停后就不对了，原因是没有加上前几次的时间。与上面计算 per的道理是一样的
			this.lastPercent += (stopTime - this.startTime) / (this.durTime * 1000);
		}
	};

	function instancesProgress() {
		return new Progress();
	}




	function Drag(obj) {
		this.obj = obj;
		this.startPointX = 0;
		this.startLeft = 0;
		this.percent = 0;

		this.init();
	}
	Drag.prototype = {
		init: function () {
			var This = this;
			this.obj.style.transform = 'translateX(0)';//添加一个初始的位移值，目的是默认的时候能取到它

			//拖拽开始
			this.obj.addEventListener('touchstart', function (ev) {
				This.startPointX = ev.changedTouches[0].pageX;
				This.startLeft = parseFloat(this.style.transform.split('(')[1]);

				This.start && This.start();	//给用户提供一个对外的方法
			});

			//拖拽进行中
			this.obj.addEventListener('touchmove', function (ev) {
				This.disPointX = ev.changedTouches[0].pageX - This.startPointX;
				var l = This.disPointX + This.startLeft;

				if(l<0){
					l=0;
				}else if(l>this.offsetParent.offsetWidth){
					l=this.offsetParent.offsetWidth;
				}

				this.style.transform='translateX('+l+'px)';
				This.percent=l/this.offsetParent.offsetWidth;//拖拽的百分比，存储起来

				This.move && This.move(This.percent);	//给用户提供一个对外的方法

				ev.preventDefault();
			});

			this.obj.addEventListener('touchend',function(){
				This.end && This.end(This.percent);	//给用户提供一个对外的方法
			})

		}
	};
	function instancesDrag(obj) {
		return new Drag(obj);
	}


	root.progress = {
		pro: instancesProgress,
		drag: instancesDrag
	}
})(window.player || (window.player = {}));