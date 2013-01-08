// ==UserScript==
// @name Super_preloader
// @author NLF
// @description  预读+翻页..全加速你的浏览体验...#^_^#...(Support Opera 10.1+ ,Fx3.6+(need GreaseMonkey) ,Chrome5.0+)..
// @create 2010-4-30
// @lastmodified 2010-12-29
// @version 2.0.2.2
// @updatelog ....
// @namespace  http://userscripts.org/users/NLF
// @download  http://bbs.operachina.com/viewtopic.php?f=41&t=74923
// @download  http://userscripts.org/scripts/show/84937
// @needdatabase http://userscripts.org/scripts/show/93080
// @include http*
// ==/UserScript==

(function(){
	//.浏览器检测.开始.
	var UA=navigator.userAgent.toLowerCase();
	var browser={
		opera:false,
		chrome:false,
		firefox:false,
		name:'unknown',
		getBrowserName:function(){
			var self=this;
			if(self.name!='unknown')return self.name;
			for(var i in self){
				if(self.hasOwnProperty(i) && self[i]){
					self.name=i;
					return i;
				};
			};
		},
	};
	if(window.opera){
		browser.opera=true;
	}else if(window.chrome){
		browser.chrome=true;
	}else if(typeof XPCNativeWrapper=='function' && String(XPCNativeWrapper).search(/native\s+code/i)!=-1){
		browser.firefox=true;
	}else if(UA.indexOf('applewebkit')!=-1){//UA检测放到最后,伪装的太厉害了.-_-!!
		//国内的壳浏览器,作为chrome处理.
		browser.chrome=true;
		if(UA.indexOf('se 2')!=-1){//记录下搜狗的.
			browser.sogou=true;
		};
	};
	browser.getBrowserName();
	//alert(browser.name);
	if(browser.name=='unknown')return;
	//.浏览器检测.结束


	//如果是取出下一页使用的iframe window
	if(window.name=='superpreloader-iframe'){//搜狗,iframe里面怎么不加载js啊?
		if(browser.chrome){
			//window.parent.postMessage('superpreloader-iframe:DOMLoaded','*');//iframe里面 chrome无法访问window.parent,返回undefined
			window.scroll(window.scrollX,99999);
			document.body.setAttribute('data-superpreloader-iframe-domloaded','true');
		}else{
			function domloaded(){
				window.scroll(window.scrollX,99999);//滚动到底部,针对,某些使用滚动事件加载图片的网站.
				window.parent.postMessage('superpreloader-iframe:DOMLoaded','*');
			};
			if(browser.opera){
				/*
				window.opera.addEventListener('BeforeExternalScript',function(e){//阻止外部脚本.
					//alert(e.element.getAttribute("src"));
					e.preventDefault()
				},false);
				*/
				document.addEventListener('DOMContentLoaded',domloaded,false);
			}else{
				domloaded();
			};
		};
		return;
	};

	function run(){
		if(browser.opera){
			document.removeEventListener('DOMContentLoaded',DOMLoadedHandler,false);
			if(!DOMLoaded){
				document.removeEventListener('DOMContentLoaded',run,false);
			};
		};
		init(browser,window,document,db,G_window,opera,scriptStorage);
	};

	var db;
	var G_window=this['unsafeWindow'] || window;
	var scriptStorage;
	var DOMLoaded;
	var opera;
	var DOMLoadedHandler;

	if(browser.opera){
		opera=window.opera;
		try{
			scriptStorage=opera.scriptStorage;//某些版本的opera会出错,捕捉下错误.
		}catch(e){};

		DOMLoadedHandler=function(){
			DOMLoaded=true;
		};
		document.addEventListener('DOMContentLoaded',DOMLoadedHandler,false);
	};

	window.postMessage('fromeSuperPreloader.post','*');//postMessage传递.

/*//直接使用外部数据库.
	function loaddb(){
		var dbs=document.createElement('script');
		dbs.type='text/javascript';
		dbs.src='http://userscripts.org/scripts/source/93080.user.js';
		document.body.appendChild(dbs);
	};

	if(browser.opera){
		document.addEventListener('DOMContentLoaded',function(){
			loaddb();
		},false);
	}else{
		loaddb();
	};
*/

	window.addEventListener('message',function(e){
		if(db)return;
		var data=e.data;
		if(typeof data=='string' && data.indexOf('superPreloader.db')==0){
			var data=data.slice(17);
			//alert(data);
			db=eval('('+data+')');
			//alert(db.prefs.debug);
			window.removeEventListener('message',arguments.callee,false);
			window.postMessage('fromeSuperPreloader.remove','*');
			if(browser.opera && !DOMLoaded){
				document.addEventListener('DOMContentLoaded',run,false);
			}else{
				run();
				//setTimeout(run,10000);
			};
		};
	},false);


	//初始化函数..
	function init(browser,window,document,db,G_window,opera,scriptStorage){
		var startTime=new Date();

		//--update信息
		var updateInfo={
			id:'84937'											,//上传在 userscript上的脚本 编号.. 如地址 http://userscripts.org/scripts/show/84937 id为 84937
			curVersion:'2.0.2.2'						,//当前的版本号
			userJSName:'Super_preloader'		,//用户脚本的名字
		};
		//--------

		//从db取出数据.
		var prefs=db.prefs,
			sep_icons=db.sep_icons,
			FWKG_color=db.FWKG_color,
			blackList=db.blackList,
			DIExclude=db.DIExclude,
			SITEINFO_D=db.SITEINFO_D,
			SITEINFO=db.SITEINFO,
			SITEINFO_TP=db.SITEINFO_TP,
			SITEINFO_comp=db.SITEINFO_comp,
			autoMatch=db.autoMatch,
			prePageKey=db.prePageKey,
			nextPageKey=db.nextPageKey;
		///////////
		db=null;

		var nullFn=function(){};//空函数.
		var url=document.location.href.replace(/#.*$/,'');//url 去掉hash
		var cplink=url;//翻上来的最近的页面的url;
		var domain=document.domain;//取得域名.
		var domain_port=url.match(/https?:\/\/([^\/]+)/)[1];//端口和域名,用来验证是否跨域.


		//引用console对象的部分函数.
		var xbug=prefs.debug;
		var C={
			log:nullFn,//一般信息.
			err:nullFn,//错误信息.
		};
		if(browser.opera && opera.version()<10.5){
			C.log=C.err=function(){
				opera.postError.apply(opera,arguments);
			};
		}else{
			var console=G_window.console;
			if(console){
				C.log=function(){
					console.log.apply(console,arguments);
				};
				C.err=console.error? function(){
					console.error.apply(console,arguments);;
				} : C.log;
			};
		};

		if(xbug)C.log('----------------------------------------------------');

		//自动更新
		(function(prefs,opera,scriptStorage,updateSet){
			//不支持chrome
			if(browser.chrome)return;
			if(!updateSet[2] && !updateSet[0])return;
			var id=prefs.id,
						curVersion=prefs.curVersion,
						userJSName=prefs.userJSName;

			if(browser.opera){
				if(!scriptStorage)return;
				var iframeName='checkUpdateIframe'+id;
				var INameLength=iframeName.length;
				if(window.name==iframeName){
					window.parent.postMessage(iframeName+document.body.textContent,'*');
				};
			};

			if(window.self!=window.top)return;

			var metaData='http://userscripts.org/scripts/source/'+id+'.meta.js',
						downloadPage='http://userscripts.org/scripts/show/'+id,
						downloadAddress='http://userscripts.org/scripts/source/'+id+'.user.js',
						curURL=location.href;

			var GM_log=this.GM_log,
					GM_getValue=this.GM_getValue,
					GM_setValue=this.GM_setValue,
					GM_registerMenuCommand=this.GM_registerMenuCommand,
					GM_xmlhttpRequest=this.GM_xmlhttpRequest,
					GM_openInTab=this.GM_openInTab,
					GM_addStyle=this.GM_addStyle;

			//for opera
			if(opera){
				var crossMessage=function(url,loadFN){
					if(window.name==iframeName)return;
					window.addEventListener('message',function(e){
						var data=e.data,
									origin=e.origin;//发送消息的框架所在的域名
						//alert(data);
						if(data.indexOf(iframeName)==0 && data.length>INameLength){
							window.removeEventListener('message',arguments.callee,false);
							//alert(e.source)//跨域的情况下,将返回安全警告
							//alert(origin);
							//alert(data);
							//alert(Oiframe);
							if(Oiframe){
								Oiframe.parentNode.removeChild(Oiframe);
								Oiframe=null;
							};
							data=data.replace(iframeName,'');
							//alert(data)
							loadFN(data);
						};
					},false);
					var Oiframe=document.createElement('iframe');
					Oiframe.name=iframeName;
					Oiframe.src=url;
					Oiframe.style.setProperty('display','none','important');
					function apppendIframe(){
						apppendPosition.appendChild(Oiframe);
					};
					var apppendPosition=document.body;
					if(!apppendPosition){
						document.addEventListener('DOMContentLoaded',function(){
							apppendPosition=document.body;
							apppendIframe();
						},false);
					}else{
						apppendIframe();
					};
				};

				GM_log=function(){
					opera.postError.apply(opera,arguments);
				};
				GM_getValue=function(key,defaultValue){
					var value=scriptStorage.getItem(key);
					if(!value)return defaultValue;
					value=eval(value);
					var Vtype=value[1];
					value=decodeURIComponent(value[0]);
					switch(Vtype){
						case 'boolean':{
							return value=='true'? true:false;
						}break;
						case 'number':{
							return Number(value)
						}break;
						case 'string':{
							return value;
						}break;
						default:{
							//opera.postError(Vtype)
						}break;
					};
				};
				GM_setValue=function(key,value){
					if(!key || !value)return;
					key=String(key);
					scriptStorage.setItem(key,'["'+encodeURIComponent(String(value))+'","'+(typeof value)+'"]');
				};
				GM_registerMenuCommand=function(){
					
				};
				GM_xmlhttpRequest=function(){
					
				};
				GM_openInTab=window.open;
				GM_addStyle=function(css){
					var style=document.createElement('style');
					style.type='text/css';
					style.textContent=css;
					document.getElementsByTagName('head')[0].appendChild(style);
				};
			};


			var checking;
			function checkUpdate(manual){
				if(checking)return;
				GM_setValue(id+'_lastCT',String(curT));
				checking=true;
				//alert(manual)
				//manual=true;

				function getInfo(txt){
					//alert(txt);
					var latestVersion=txt.match(/@\s*version\s*([\d\.]+)\s*/i);
					if(latestVersion){
						latestVersion=latestVersion[1];
					}else{
						checking=false;
						if(manual)alert('检查失败,版本号不符合要求(版本号必须由 数字 和 . 组成),并且递增.');
						return;
					};
					//alert(latestVersion);

					var description=txt.match(/@\s*description\s*(.+)/i);
					if(description){
						description=description[1];
					};
					//alert(description);

					var author=txt.match(/@\s*author\s*(.+)\s*/i);
					if(author){
						author=author[1];
					};

					var timestamp=txt.match(/@\s*uso:timestamp\s*(.+)\s*/i);
					if(timestamp){
						timestamp=timestamp[1];
					};

					var updateLog=txt.match(/@\s*updatelog\s*(.+)\s*/i);
					if(updateLog){
						updateLog=updateLog[1].split('&');
					};
					//alert(timestamp);

					//对比版本号
					var needUpdate;
					var xlatestVersion=latestVersion;
					var latestVersion=latestVersion.split('.');
					var lVLength=latestVersion.length;
					var currentVersion=curVersion.split('.');
					var cVLength=currentVersion.length;
					var lV_x;
					var cV_x;
					for(var i=0;i<lVLength;i++){
						lV_x=Number(latestVersion[i]);
						cV_x=(i>=cVLength)? 0 : Number(currentVersion[i]);
						if(lV_x>cV_x){
							needUpdate=true;
							break;
						}else if(lV_x<cV_x){
							break;
						};
					};
					checking=false;

					if(isDownloadPage){
						var install_script=document.getElementById('install_script');
						if(install_script){
							var userjs=install_script.getElementsByClassName('userjs');
							if(userjs.length>0){
								userjs=userjs[0];
								userjs.style.cssText='\
									font-size:14px!important;\
									color:black!important;\
								';
								if(needUpdate){
									userjs.style.setProperty('color','red','important');
									if(opera){
										userjs.textContent='更新:请右键另存为,然后改名为:'+userJSName+'.js';
									}else{
										userjs.textContent='更新:立即安装';
									}
								}else{
									userjs.textContent='不需要更新';
								};
							};
						};
					}else{
						if(needUpdate){
							var ok=confirm('找到了一个更新!'+'\n\nJS名字: '+userJSName+(author? ('\n作者: '+author) : '')+'\n描述: '+(description? description : '无')+'\n\n当前版本号: '+curVersion+'\n最新版本号: '+xlatestVersion+(updateLog? ('\n\n主要更新:\n'+ updateLog.join('\n')):'')+(timestamp? ('\n\n更新时间: '+timestamp):'')+'\n\n你是否要升级到最新呢?');
							if(ok){
								location.href=opera? downloadPage : downloadAddress;
							};
						}else{
							//手动更新才提示这个..
							if(manual){
								alert('已经是最新的了!'+'\n\nJS名字: '+userJSName+(author? ('\n作者: '+author) : '')+'\n描述: '+(description? description : '无')+'\n\n当前版本号: '+curVersion+'\n');
							};
						};
					};
				};

				if(opera){
					crossMessage(metaData,getInfo);
				}else{
					GM_xmlhttpRequest({
						method: "GET",
						url:metaData,
						onload: function(rsp){
							if(rsp.status!=200){
								checking=false;
								if(manual){
									alert('网络故障,检查失败,请稍后再试试!')
								};
								return;
							};
							getInfo(rsp.responseText);
						}
					});
				};
			};

			function checkUpdateM(){
				checkUpdate(true);
			};
			//checkUpdateM();

			var registerMenuCommand=updateSet[2];
			//alert(registerMenuCommand);
			if(registerMenuCommand){
				GM_registerMenuCommand('检查 '+userJSName+' 更新',checkUpdateM);
				if(opera){
					//alert(userJSName+'_checkUpdate');
					window[userJSName+'_checkUpdate']=checkUpdateM;
				};
			};

			var autoUpdate=updateSet[0];
			if(!autoUpdate)return;

			var interval=updateSet[1];

			var needCheck;
			var curT=new Date().getTime();
			//alert(typeof curT);

			var lastCT=GM_getValue(id+'_lastCT',null);
			//alert(lastCT);

			if(lastCT===null){
				needCheck=true;
			}else{
				var oneDay=86400000;//毫秒
				lastCT=Number(lastCT);
				needCheck=(((curT-lastCT)/oneDay)>=interval);
			};

			//如果在下载页面.
			var isDownloadPage=(curURL.indexOf(downloadPage)==0);
			//needCheck=true;
			if(needCheck || isDownloadPage)checkUpdate();

		})(updateInfo,opera,scriptStorage,prefs.updateSet);


		//css 获取单个元素
		function getElementByCSS(css,contextNode){
			return (contextNode || document).querySelector(css);
		};
		//css 获取所有元素
		function getAllElementsByCSS(css,contextNode){
			return (contextNode || document).querySelectorAll(css);
		};
		//xpath 获取单个元素
		function getElementByXpath(xpath,contextNode,doc){
			doc=doc || document;
			contextNode=contextNode || doc;
			return doc.evaluate(xpath,contextNode,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
		};
		//xpath 获取多个元素.
		function getAllElementsByXpath(xpath,contextNode,doc){
			doc=doc || document;
			contextNode=contextNode || doc;
			return doc.evaluate(xpath,contextNode,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		};

		//地址栏递增处理函数.
		function hrefInc(obj,doc,win){
			var _cplink=cplink;
			function getHref(href){
				var mFails=obj.mFails;
				if(!mFails)return href;
				var str;
				if(typeof mFails=='string'){
					str=mFails;
				}else{
					var fx;
					var array=[];
					var i,ii;
					var mValue;
					for(i=0,ii=mFails.length;i<ii;i++){
						fx=mFails[i];
						if(!fx)continue;
						if(typeof fx=='string'){
							array.push(fx);
						}else{
							mValue=href.match(fx);
							if(!mValue)return href;
							array.push(mValue);
						};
					};
					var str=array.join('');
				};
				return str;
			};
			//alert(getHref(_cplink))

			var sa=obj.startAfter;
			var saType=typeof sa;
			var index;

			if(saType=='string'){
				index=_cplink.indexOf(sa);
				if(index==-1){
					_cplink=getHref(_cplink);
					index=_cplink.indexOf(sa);
					if(index==-1)return;
					//alert(index);
				};
			}else{
				var tsa=_cplink.match(sa);
				//alert(sa);
				if(!tsa){
					_cplink=getHref(_cplink);
					sa=(_cplink.match(sa) || [])[0];
					if(!sa)return;
					index=_cplink.indexOf(sa);
					if(index==-1)return;
				}else{
					sa=tsa[0];
					index=_cplink.indexOf(sa);
					//alert(index)
					//alert(tsa.index)
				};
			};

			index+=sa.length;
			var max=obj.max===undefined? 9999 : obj.max;
			var min=obj.min===undefined? 1 : obj.min;
			var aStr=_cplink.slice(0,index);
			var bStr=_cplink.slice(index);
			var nbStr=bStr.replace(/^(\d+)(.*)$/,function(a,b,c){
				b=Number(b)+obj.inc;
				if(b>=max || b<min)return a;
				return b+c;
			});
			//alert(aStr+nbStr);
			if(nbStr!==bStr){
				var ilresult;
				try{
					ilresult=obj.isLast(doc,win,_cplink);
				}catch(e){}
				if(ilresult)return;
				return aStr+nbStr;
			};
		};

		//获取单个元素,混合
		function getElement(selector,contextNode,doc,win){
			var ret;
			if(!selector)return ret;
			doc=doc || document;
			win=win || window;
			contextNode=contextNode || doc;
			var type=typeof selector;
			if(type=='string'){
				if(selector.search(/^css;/i)==0){
					ret=getElementByCSS(selector.slice(4),contextNode);
				}else if(selector.toLowerCase()=='auto;'){
					ret=autoGetLink(doc,win);
				}else{
					ret=getElementByXpath(selector,contextNode,doc);
				};
			}else if(type=='function'){
				ret=selector(doc,win,cplink);
			}else{
				ret=hrefInc(selector,doc,win);
			};
			return ret;
		};

		//获取最后一个元素.
		function getLastElement(selector,contextNode,doc,win){
			var eles=getAllElements(selector,contextNode,doc,win);
			var l=eles.length;
			if(l>0){
				return eles[l-1]
			};
		};

		//获取多个元素
		function getAllElements(selector,contextNode,doc,win){
			var ret=[];
			if(!selector)return ret;
			var Eles;
			doc=doc || document;
			win=win || window;
			contextNode=contextNode || doc;
			if(typeof selector=='string'){
				if(selector.search(/^css;/i)==0){
					Eles=getAllElementsByCSS(selector.slice(4),contextNode);
				}else{
					Eles=getAllElementsByXpath(selector,contextNode,doc);
				};
			}else{
				Eles=selector(doc,win);
				if(!Eles)return ret;
				if(Eles.nodeType){//单个元素.
					ret[0]=Eles;
					return ret;
				};
			};

			function unique(array){//数组去重并且保持数组顺序.
				var i,ca,ca2,j;
				for(i=0;i<array.length;i++){
					ca=array[i];
					for(j=i+1;j<array.length;j++){
						ca2=array[j];
						if(ca2==ca){
							array.splice(j,1);
							j--;
						};
					};
				};
				return array;
			};

			function makeArray(x){
				var ret=[];
				var i,ii;
				var x_x;
				if(x.pop){//普通的 array
					for(i=0,ii=x.length;i<ii;i++){
						x_x=x[i];
						if(x_x){
							if(x_x.nodeType){//普通类型,直接放进去.
								ret.push(x_x);
							}else{
								ret=ret.concat(makeArray(x_x));//嵌套的.
							};
						};
					};
					//alert(ret)
					return unique(ret);
				}else if(x.item){//nodelist or HTMLcollection
					i=x.length;
					while(i){
						ret[--i]=x[i];
					};
					/*
					for(i=0,ii=x.length;i<ii;i++){
						ret.push(x[i]);
					};
					*/
					return ret;
				}else if(x.iterateNext){//XPathResult
					i=x.snapshotLength;
					while(i){
						ret[--i]=x.snapshotItem(i);
					};
					/*
					for(i=0,ii=x.snapshotLength;i<ii;i++){
						ret.push(x.snapshotItem(i));
					};
					*/
					return ret;
				};
			};

			return makeArray(Eles);
		};

		var saveValue;//保存设置
		var getValue;//读取设置
		if(window.localStorage){
			saveValue=function(key,value){
				localStorage.setItem(key,encodeURIComponent(value));
			};
			getValue=function(key){
				var value=localStorage.getItem(key);
				return value? decodeURIComponent(value) : undefined
			};
		}else{
			//写cookie
			var setCookie=function(c_name,c_value,keepday,c_path,c_domain,c_secure){
				var scookie=c_name+'='+encodeURIComponent(c_value);
				if (keepday){
					var exdate=new Date();
					exdate.setDate(exdate.getDate()+Number(keepday));
					scookie+=';expires='+exdate.toGMTString();
				};
				if (c_path){
					scookie+=';path='+c_path;
				};
				if (c_domain){
					scookie+=';domain='+c_domain;
				};
				if (c_secure){
					scookie+=';secure='+c_secure;
				};
				//alert(scookie);
				document.cookie=scookie;
			};

			saveValue=function(key,value){
				setCookie(key,value,365,'/',domain);
			};
			//取cookie
			var getCookie=function(c_name){
				var sre="(?:;)?"+c_name+"=([^;]*);?"
				var ore=new RegExp(sre);
				var value=document.cookie.match(ore);
				return value? decodeURIComponent(value[1]) : '';
			};
			getValue=function(key){
				return getCookie(key);
			};
		};

		//string转为DOM
		function createDocumentByString(str){
			if(!str){
				if(xbug)C.err('没有找到要转成DOM的字符串');
				return;
			};
			if(document.documentElement.nodeName != 'HTML'){
				return new DOMParser().parseFromString(str, 'application/xhtml+xml');
			};
			var doc;
			if(document.implementation.createHTMLDocument){
				doc=document.implementation.createHTMLDocument('superPreloader');
			}else{
				try{
					doc=document.cloneNode(false);
					doc.appendChild(doc.importNode(document.documentElement, false));
					doc.documentElement.appendChild(doc.createElement('head'));
					doc.documentElement.appendChild(doc.createElement('body'));
				}catch(e){};
			};
			if(!doc)return;
			var range=document.createRange();
			range.selectNodeContents(document.body);
			var fragment = range.createContextualFragment(str);
			doc.body.appendChild(fragment);
			var headChildNames={
				TITLE: true,
				META: true,
				LINK: true,
				STYLE:true, 
				BASE: true
			};
			var child;
			var body=doc.body;
			var bchilds=body.childNodes;
			for(var i=bchilds.length-1;i>=0;i--){//移除head的子元素
				child=bchilds[i];
				if(headChildNames[child.nodeName])body.removeChild(child);
			};
			//alert(doc.documentElement.innerHTML);
			//C.log(doc);
			//C.log(doc.documentElement.innerHTML);
			return doc;
		};

		//从相对路径的a.href获取完全的href值.
		function getFullHref(href){
			if(typeof href!='string')href=href.getAttribute('href');
			//alert(href);
			//if(href.search(/^https?:/)==0)return href;//http打头,不一定就是完整的href;
			var a=getFullHref.a;
			if(!a){
				getFullHref.a=a=document.createElement('a');
			};
			a.href=href;
			//alert(a.href);
			return a.href;
		};


	//动画库
		var Tween = {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			Quad: {
				easeIn: function(t,b,c,d){
					return c*(t/=d)*t + b;
				},
				easeOut: function(t,b,c,d){
					return -c *(t/=d)*(t-2) + b;
				},
				easeInOut: function(t,b,c,d){
					if ((t/=d/2) < 1) return c/2*t*t + b;
					return -c/2 * ((--t)*(t-2) - 1) + b;
				}
			},
			Cubic: {
				easeIn: function(t,b,c,d){
					return c*(t/=d)*t*t + b;
				},
				easeOut: function(t,b,c,d){
					return c*((t=t/d-1)*t*t + 1) + b;
				},
				easeInOut: function(t,b,c,d){
					if ((t/=d/2) < 1) return c/2*t*t*t + b;
					return c/2*((t-=2)*t*t + 2) + b;
				}
			},
			Quart: {
				easeIn: function(t,b,c,d){
					return c*(t/=d)*t*t*t + b;
				},
				easeOut: function(t,b,c,d){
					return -c * ((t=t/d-1)*t*t*t - 1) + b;
				},
				easeInOut: function(t,b,c,d){
					if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
					return -c/2 * ((t-=2)*t*t*t - 2) + b;
				}
			},
			Quint: {
				easeIn: function(t,b,c,d){
					return c*(t/=d)*t*t*t*t + b;
				},
				easeOut: function(t,b,c,d){
					return c*((t=t/d-1)*t*t*t*t + 1) + b;
				},
				easeInOut: function(t,b,c,d){
					if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
					return c/2*((t-=2)*t*t*t*t + 2) + b;
				}
			},
			Sine: {
				easeIn: function(t,b,c,d){
					return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
				},
				easeOut: function(t,b,c,d){
					return c * Math.sin(t/d * (Math.PI/2)) + b;
				},
				easeInOut: function(t,b,c,d){
					return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
				}
			},
			Expo: {
				easeIn: function(t,b,c,d){
					return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
				},
				easeOut: function(t,b,c,d){
					return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
				},
				easeInOut: function(t,b,c,d){
					if (t==0) return b;
					if (t==d) return b+c;
					if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
					return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
				}
			},
			Circ: {
				easeIn: function(t,b,c,d){
					return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
				},
				easeOut: function(t,b,c,d){
					return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
				},
				easeInOut: function(t,b,c,d){
					if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
					return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
				}
			},
			Elastic: {
				easeIn: function(t,b,c,d,a,p){
					if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
					if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				},
				easeOut: function(t,b,c,d,a,p){
					if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
					if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
				},
				easeInOut: function(t,b,c,d,a,p){
					if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
					if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
					return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
				}
			},
			Back: {
				easeIn: function(t,b,c,d,s){
					if (s == undefined) s = 1.70158;
					return c*(t/=d)*t*((s+1)*t - s) + b;
				},
				easeOut: function(t,b,c,d,s){
					if (s == undefined) s = 1.70158;
					return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
				},
				easeInOut: function(t,b,c,d,s){
					if (s == undefined) s = 1.70158; 
					if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
					return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
				}
			},
			Bounce: {
				easeIn: function(t,b,c,d){
					return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
				},
				easeOut: function(t,b,c,d){
					if ((t/=d) < (1/2.75)) {
						return c*(7.5625*t*t) + b;
					} else if (t < (2/2.75)) {
						return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
					} else if (t < (2.5/2.75)) {
						return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
					} else {
						return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
					}
				},
				easeInOut: function(t,b,c,d){
					if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
					else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
				}
			}
		};

		var TweenM=[
			'Linear',
			'Quad',
			'Cubic',
			'Quart',
			'Quint',
			'Sine',
			'Expo',
			'Circ',
			'Elastic',
			'Back',
			'Bounce',
		];

		var TweenEase=[
			'easeIn',
			'easeOut',
			'easeInOut',
		];



		//任何转成字符串,存储
		function xToString(x){//任何转字符串.
			function toStr(x){
				//alert(typeof x);
				switch(typeof x){
					case 'undefined':{
						return Str(x);
					}break;
					case 'boolean':{
						return Str(x);
					}break;
					case 'number':{
						return Str(x);
					}break;
					case 'string':{
						return ('"'+
							(x.replace(/(?:\r\n|\n|\r|\t|\\|")/g,function(a){
								var ret; 
								switch(a){//转成字面量
									case '\r\n':{
										ret='\\r\\n'
									}break;
									case '\n':{
										ret='\\n';
									}break;
									case '\r':{
										ret='\\r'
									}break;
									case '\t':{
										ret='\\t'
									}break;
									case '\\':{
										ret='\\\\'
									}break;
									case '"':{
										ret='\\"'
									}break;
									default:{
									}break; 
								};
								return ret;
							}))+'"');
						//'"'+x.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"';
					}break;
					case 'function':{
						/*
						var fnName=x.name;
						if(fnName && fnName!='anonymous'){
							return x.name;
						}else{
							var fnStr=Str(x);
							return fnStr.indexOf('native code')==-1? fnStr : 'function(){}';
						};
						*/
						var fnStr=Str(x);
						return fnStr.indexOf('native code')==-1? fnStr : 'function(){}';
					}break;
					case 'object':{//注,object的除了单纯{},其他的对象的属性会造成丢失..
						if(x===null){
							return Str(x);
						};
						//alert(x.constructor);
						switch(x.constructor){
							case Object:{
								var i;
								var rStr='';
								for(i in x){
									//alert(i);
									if(!x.hasOwnProperty(i)){//去掉原型链上的属性.
										//alert(i);
										continue;
									};
									rStr+=toStr(i)+':'+toStr(x[i])+',';
								};
								return ('{'+rStr.replace(/,$/i,'')+'}');
							}break;
							case Array:{
								var i;
								var rStr='';
								for(i in x){
									//alert(i);
									if(!x.hasOwnProperty(i)){//去掉原型链上的属性.
										//alert(i);
										continue;
									};
									rStr+=toStr(x[i])+',';
								};
								return '['+rStr.replace(/,$/i,'')+']';
							}break;
							case String:{
								return toStr(Str(x));
							}break;
							case RegExp:{
								return Str(x);
							}break;
							case Number:{
								return Str(x);
							}break;
							case Boolean:{
								return Str(x);
							}break;
							default:{
								//alert(x.constructor);//漏了什么类型么?
							}break;
						};
					}break;
					default:break;
				};
			};
			var Str=String;
			return toStr(x);
		};


		//创建规则UI.
		/*
		function ruleNav(){
			var div=ruleNav.div;
			if(div){
				div.style.display='block';
				return;
			};
			var style=document.createElement('style');
			style.type='text/css';
			style.textContent='\
				\
			';
			getElementByCSS('head').appendChild(style);
			div=document.createElement('div');
			ruleNav.div=div;
			div.innerHTML='\
				\
			';
			document.body.appendChild(div);

		};
*/

		//ruleNav();

		//悬浮窗
		var floatWO={
			updateColor:nullFn,
			loadedIcon:nullFn,
			CmodeIcon:nullFn,
		};
		function floatWindow(){
			var style=document.createElement('style');
			style.type='text/css';
			style.textContent='\
				#sp-fw-container {\
					z-index:999999!important;\
					text-align:left!important;\
				}\
				#sp-fw-container * {\
					font-size:13px!important;\
					color:black!important;\
					float:none!important;\
				}\
				#sp-fw-main-head{\
					position:relative!important;\
					top:0!important;\
					left:0!important;\
				}\
				#sp-fw-span-info{\
					position:absolute!important;\
					right:1px!important;\
					top:0!important;\
					font-size:10px!important;\
					line-height:10px!important;\
					background:none!important;\
					font-style:italic!important;\
					color:#5a5a5a!important;\
					text-shadow:white 0px 1px 1px!important;\
				}\
				#sp-fw-container input {\
					vertical-align:middle!important;\
					display:inline-block!important;\
					outline:none!important;\
				}\
				#sp-fw-container input[type="number"] {\
					width:50px!important;\
					text-align:left!important;\
				}\
				#sp-fw-container input[type="checkbox"] {\
					border:1px solid #B4B4B4!important;\
					padding:1px!important;\
					margin:3px!important;\
					width:13px!important;\
					height:13px!important;\
					background:none!important;\
					cursor:pointer!important;\
				}\
				#sp-fw-container input[type="button"] {\
					border:1px solid #ccc!important;\
					cursor:pointer!important;\
					background:none!important;\
					width:auto!important;\
					height:auto!important;\
				}\
				#sp-fw-container li {\
					list-style:none!important;\
					margin:3px 0!important;\
					border:none!important;\
					float:none!important;\
				}\
				#sp-fw-container fieldset {\
					border:2px groove #ccc!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					padding:4px 9px 6px 9px!important;\
					margin:2px!important;\
					display:block!important;\
					width:auto!important;\
					height:auto!important;\
				}\
				#sp-fw-container fieldset>ul {\
					padding:0!important;\
					margin:0!important;\
				}\
				#sp-fw-container ul#sp-fw-a_useiframe-extend{\
					padding-left:40px!important;\
				}\
				#sp-fw-rect {\
					position:relative!important;\
					top:0!important;\
					left:0!important;\
					float:right!important;\
					height:10px!important;\
					width:10px!important;\
					padding:0!important;\
					margin:0!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					border:1px solid white!important;\
					-webkit-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
					-moz-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
					box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
					opacity:0.8!important;\
				}\
				#sp-fw-dot,\
				#sp-fw-cur-mode {\
					position:absolute!important;\
					z-index:9999!important;\
					width:5px!important;\
					height:5px!important;\
					padding:0!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					border:1px solid white!important;\
					opacity:1!important;\
					-webkit-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
					-moz-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
					box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
				}\
				#sp-fw-dot{\
					right:-3px!important;\
					top:-3px!important;\
				}\
				#sp-fw-cur-mode{\
					left:-3px!important;\
					top:-3px!important;\
					width:6px!important;\
					height:6px!important;\
				}\
				#sp-fw-content{\
					padding:0!important;\
					margin:5px 5px 0 0!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					border:1px solid #A0A0A0!important;\
					-webkit-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
					-moz-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
					box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
				}\
				#sp-fw-main {\
					padding:5px!important;\
					border:1px solid white!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					background-color:#F2F2F7!important;\
					background: -moz-linear-gradient(top, #FCFCFC, #F2F2F7 100%)!important;\
					background: -webkit-gradient(linear, 0 0, 0 100%, from(#FCFCFC), to(#F2F2F7))!important;\
				}\
				#sp-fw-foot{\
				 position:relative!important;\
				 left:0!important;\
				 right:0!important;\
				 min-height:20px!important;\
				}\
				#sp-fw-savebutton{\
					position:absolute!important;\
					top:0!important;\
					right:2px!important;\
				}\
				#sp-fw-container .sp-fw-spanbutton{\
					border:1px solid #ccc!important;\
					-moz-border-radius:3px!important;\
					border-radius:3px!important;\
					padding:2px 3px!important;\
					cursor:pointer!important;\
					background-color:#F9F9F9!important;\
					-webkit-box-shadow:inset 0 10px 5px white!important;\
					-moz-box-shadow:inset 0 10px 5px white!important;\
					box-shadow:inset 0 10px 5px white!important;\
				}\
			';
			getElementByCSS('head').appendChild(style);
			var div=document.createElement('div');
			div.id='sp-fw-container';

			div.innerHTML='\
				<div id="sp-fw-rect" style="background-color:#000;">\
					<div id="sp-fw-dot" style="display:none;"></div>\
					<div id="sp-fw-cur-mode" style="display:none;"></div>\
				</div>\
				<div id="sp-fw-content" style="display:none;">\
					<div id="sp-fw-main">\
						<div id="sp-fw-main-head">\
							<input type="checkbox" title="使用翻页模式,否则使用预读模式" id="sp-fw-a_enable" name="sp-fw-a_enable"/>使用翻页模式\
							<span id="sp-fw-span-info">Super_preloader</span>\
						</div>\
						<fieldset>\
							<legend title="预读模式的相关设置" >预读设置</legend>\
						<ul>\
								<li>\
									<input type="checkbox" title="使用iframe预先载入好下一页到缓存,否则使用xhr请求下一页源码,取出所有的图片进行预读" id="sp-fw-useiframe" name="sp-fw-useiframe"/>使用iframe方式\
								</li>\
								<li>\
									<input type="checkbox" title="查看预读的内容,将其显示在页面的底部,看看预读了些什么." id="sp-fw-viewcontent" name="sp-fw-viewcontent"/>查看预读的内容\
								</li>\
							</ul>\
						</fieldset>\
						<fieldset id="sp-fw-autopager-field" style="display:block;">\
							<legend title="自动翻页模式的相关设置">翻页设置</legend>\
							<ul>\
								<li>\
									<input type="checkbox" title="使用iframe方式进行翻页,否则使用xhr方式翻页,可以解决某些网页xhr方式无法翻页的问题,如果xhr翻页正常的话,就不要勾这项吧." id="sp-fw-a_useiframe" name="sp-fw-a_useiframe"/>使用iframe方式\
									<ul id="sp-fw-a_useiframe-extend">\
										<li>\
											<input type="checkbox" title="等待iframe完全载入后(发生load事件),将内容取出,否则在DOM完成后,就直接取出来..(勾上后,会比较慢,但是可能会解决一些问题.)" id="sp-fw-a_iloaded" name="sp-fw-a_iloaded" />等待iframe完全载入\
										</li>\
										<li>\
											<input type="number"  min="0" title="在可以从iframe取数据的时候,继续等待设定的毫秒才开始取出数据(此项为特殊网页准备,如果正常,请设置为0)" id="sp-fw-a_itimeout" name="sp-fw-a_itimeout"/>ms延时取出\
										</li>\
									</ul>\
								</li>\
								<li>\
									<input type="checkbox" id="sp-fw-a_manualA" name="sp-fw-a_manualA" title="不会自动拼接上来,会出现一个类似翻页导航的的图形,点击翻页(在论坛的帖子内容页面,可以考虑勾选此项,从而不影响你的回帖)"/>手动模式\
								</li>\
								<li>\
									 剩余<input type="number" min="0" id="sp-fw-a_remain" name="sp-fw-a_remain" title="当剩余的页面的高度是浏览器可见窗口高度的几倍开始翻页"/>倍页面高度触发\
								</li>\
								<li>\
									 最多翻<input type="number" min="0" id="sp-fw-a_maxpage" name="sp-fw-a_maxpage" title="最多翻页数量,当达到这个翻页数量的时候,自动翻页停止." />页\
								</li>\
								<li>\
									<input type="checkbox" id="sp-fw-a_separator" name="sp-fw-a_separator" title="分割页面主要内容的导航条,可以进行页面主要内容之间的快速跳转定位等."/>显示翻页导航\
								</li>\
								<li>\
									<input type="checkbox" title="将下一页的body部分内容整个拼接上来.(当需翻页的网站没有高级规则时,该项强制勾选,无法取消.)" id="sp-fw-a_force" name="sp-fw-a_force"/>强制拼接\
								</li>\
								<li>\
									<input type="checkbox" id="sp-fw-a_ipages_0" name="sp-fw-a_ipages_0" title="在JS加载后,立即连续翻后面设定的页数"/>启用 \
									立即翻<input type="number" min="1" id="sp-fw-a_ipages_1" name="sp-fw-a_ipages_1" title="连续翻页的数量" />页\
									<input type="button" value="开始" title="现在立即开始连续翻页" id="sp-fw-a_starti" />\
								</li>\
							</ul>\
						</fieldset>\
						<div id="sp-fw-foot">\
						 <input type="checkbox" id="sp-fw-enable" title="总开关,启用js,否则禁用." name="sp-fw-enable"/>启用\
						 <span id="sp-fw-savebutton" class="sp-fw-spanbutton" title="保存设置">保存</span>\
						</div>\
					</div>\
				</div>\
			';
			document.body.appendChild(div);

			//id获取元素
			function $(id){
				return document.getElementById(id);
			};

			var rect=$('sp-fw-rect');//悬浮窗的小正方形,用颜色描述当前的状态.
			var spanel=$('sp-fw-content');//设置面板.

			if(browser.chrome){//chrome 8-9bug,当触碰到 type=number的 input的调整按钮时,会导致chrome出问题.chrome 10已经修复.
				var sheet=style.sheet;
				//alert(sheet.insertRule);
				sheet.insertRule('\
				#sp-fw-container:hover #sp-fw-content{\
					display:block!important;\
				}',sheet.cssRules.length);
			}else{
				var spanelc={
					show:function(){
						spanel.style.display='block';
					},
					hide:function(){
						spanel.style.display='none';
					},
				};
				var rectt1,rectt2;
				//设置面板显隐
				rect.addEventListener('mouseover',function(e){
					rectt1=setTimeout(spanelc.show,100);
				},false);
				rect.addEventListener('mouseout',function(e){
					clearTimeout(rectt1);
				},false);

				div.addEventListener('mouseover',function(e){
					//C.log('over:',e.target);
					clearTimeout(rectt2);
				},false);

				div.addEventListener('mouseout',function(e){
					//C.log('out:',e.target);
					if(e.relatedTarget && e.relatedTarget.disabled)return;//for firefox and chrome
					rectt2=setTimeout(spanelc.hide,288);
				},false);
			};

			var dot=$('sp-fw-dot');//载入完成后,显示的小点
			dot.style.backgroundColor=FWKG_color.dot;

			var cur_mode=$('sp-fw-cur-mode');//当载入状态时,用来描述当前是翻页模式,还是预读模式.
			cur_mode.style.backgroundColor=SSS.a_enable? FWKG_color.autopager : FWKG_color.prefetcher

			var a_enable=$('sp-fw-a_enable');//启用翻页模式
			var autopager_field=$('sp-fw-autopager-field');//翻页设置区域

			//预读设置
			var useiframe=$('sp-fw-useiframe');
			var viewcontent=$('sp-fw-viewcontent');

			//翻页设置
			var a_useiframe=$('sp-fw-a_useiframe');
			var a_iloaded=$('sp-fw-a_iloaded');
			var a_itimeout=$('sp-fw-a_itimeout');
			var a_manualA=$('sp-fw-a_manualA');
			var a_remain=$('sp-fw-a_remain');
			var a_maxpage=$('sp-fw-a_maxpage');
			var a_separator=$('sp-fw-a_separator');
			var a_ipages_0=$('sp-fw-a_ipages_0');
			var a_ipages_1=$('sp-fw-a_ipages_1');
			var a_force=$('sp-fw-a_force');

			var a_starti=$('sp-fw-a_starti');//开始立即翻页
			a_starti.addEventListener('click',function(){
				if(this.disabled)return;
				var value=Number(a_ipages_1.value);
				if(isNaN(value) || value<=0){
					value=SSS.a_ipages[1];
					a_ipages_1.value=value;
				};
				autoPO.startipages(value);
			},false);

			//总开关
			var enable=$('sp-fw-enable');

			//保存设置按钮.
			var savebutton=$('sp-fw-savebutton');
			savebutton.addEventListener('click',function(e){
				var value={
					Rurl:SSS.Rurl,
					useiframe:gl(useiframe),
					viewcontent:gl(viewcontent),
					enable:gl(enable),
				};
				function gl(obj){
					return (obj.type=='checkbox'? obj.checked : obj.value);
				};
				if(SSS.a_enable!==undefined){
					value.a_enable=gl(a_enable);
					value.a_useiframe=gl(a_useiframe);
					value.a_iloaded=gl(a_iloaded);
					value.a_manualA=gl(a_manualA);
					value.a_force=gl(a_force);
					var t_a_itimeout=Number(gl(a_itimeout));
					value.a_itimeout=isNaN(t_a_itimeout)? SSS.a_itimeout : (t_a_itimeout>=0? t_a_itimeout : 0);
					var t_a_remain=Number(gl(a_remain));
					value.a_remain=isNaN(t_a_remain)? SSS.a_remain : Number(t_a_remain.toFixed(2));
					var t_a_maxpage=Number(gl(a_maxpage));
					value.a_maxpage=isNaN(t_a_maxpage)? SSS.a_maxpage : (t_a_maxpage>=1? t_a_maxpage : 1);
					var t_a_ipages_1=Number(gl(a_ipages_1));
					value.a_ipages=[gl(a_ipages_0),(isNaN(t_a_ipages_1)? SSS.a_ipages[1] : (t_a_ipages_1>=1? t_a_ipages_1 : 1))];
					value.a_separator=gl(a_separator);
				};
				//alert(xToString(value));
				SSS.savedValue[SSS.sedValueIndex]=value;
				//alert(xToString(SSS.savedValue));
				saveValue('spfwset',xToString(SSS.savedValue));
				if((e.shiftKey? !prefs.FW_RAS : prefs.FW_RAS)){//按住shift键,执行反向操作.
					setTimeout("location.reload()",1);
				};
			},false);

			function ll(obj,value){
				if(obj.type=='checkbox'){
					obj.checked=value;
				}else{
					obj.value=value;
				};
			};


			//载入翻页设置.
			if(SSS.a_enable===undefined){//未定义翻页功能.
				a_enable.disabled=true;
				autopager_field.style.display='none';
			}else{
				ll(a_enable,SSS.a_enable);
				ll(a_useiframe,SSS.a_useiframe);
				ll(a_iloaded,SSS.a_iloaded);
				ll(a_itimeout,SSS.a_itimeout);
				ll(a_manualA,SSS.a_manualA);
				ll(a_force,SSS.a_force);
				ll(a_remain,SSS.a_remain);
				ll(a_maxpage,SSS.a_maxpage);
				ll(a_separator,SSS.a_separator);
				ll(a_ipages_0,SSS.a_ipages[0]);
				ll(a_ipages_1,SSS.a_ipages[1]);
			};


			if(!SSS.a_enable){//当前不是翻页模式,禁用立即翻页按钮.
				a_starti.disabled=true;
			};


			if(!SSS.hasRule){//如果没有高级规则,那么此项不允许操作.
				a_force.disabled=true;
			};

			//载入预读设置.
			ll(useiframe,SSS.useiframe);
			ll(viewcontent,SSS.viewcontent);

			//总开关
			ll(enable,SSS.enable);


			floatWO={
				updateColor:function(state){
					rect.style.backgroundColor=FWKG_color[state];
				},
				loadedIcon:function(command){
					dot.style.display=command=='show'? 'block':'none'
				},
				CmodeIcon:function(command){
					cur_mode.style.display=command=='show'? 'block':'none'
				},
			};


			var vertical=parseInt(prefs.FW_offset[0],10);
			var horiz=parseInt(prefs.FW_offset[1],10);
			var FW_position=prefs.FW_position;

			function gss(){
				var scrolly=window.scrollY;
				var scrollx=window.scrollX;
				switch(FW_position){
					case 1:{
						div.style.top=vertical+scrolly+'px';
						div.style.left=horiz+scrollx+'px';
					}break;
					case 2:{
						div.style.top=vertical+scrolly+'px';
						div.style.right=horiz-scrollx+'px';
					}break;
					case 3:{
						div.style.bottom=vertical-scrolly+'px';
						div.style.right=horiz-scrollx+'px';
					}break;
					case 4:{
						div.style.bottom=vertical-scrolly+'px';
						div.style.left=horiz+scrollx+'px';
					}break;
					default:break;
				};
			};

			if(browser.opera){
				div.style.position='absolute';
				var timeout;
				function gs(){
					clearTimeout(timeout);
					timeout=setTimeout(gss,200);
				};
				gss();
				window.addEventListener('scroll',gs,false);
			}else{//非opera用fixed定位.
				div.style.position='fixed';
				switch(FW_position){
					case 1:{
						div.style.top=vertical+'px';
						div.style.left=horiz+'px';
					}break;
					case 2:{
						div.style.top=vertical+'px';
						div.style.right=horiz+'px';
					}break;
					case 3:{
						div.style.bottom=vertical+'px';
						div.style.right=horiz+'px';
					}break;
					case 4:{
						div.style.bottom=vertical+'px';
						div.style.left=horiz+'px';
					}break;
					default:break;
				};
			};
		};


		function xhttpRequest(link,callback){
			var xhr=new XMLHttpRequest();
			xhr.onreadystatechange=callback;
			xhr.open("GET",link,true);
			xhr.overrideMimeType('text/html; charset=' + document.characterSet);
			xhr.send(null);
		};


		function sp_transition(start,end){
			var TweenF=sp_transition.TweenF;
			if(!TweenF){
				TweenF=Tween[TweenM[prefs.s_method]];
				TweenF=TweenF[TweenEase[prefs.s_ease]] || TweenF;
				sp_transition.TweenF=TweenF;
			};
			var frameSpeed=1000/prefs.s_FPS;
			var t=0;//次数,开始
			var b=start;//开始
			var c=end-start;//结束
			var d=Math.ceil(prefs.s_duration/frameSpeed);//次数,结束
			//alert(d);
			//alert(c);

			var x=window.scrollX;
			function transition(){
				var y=Math.ceil(TweenF(t,b,c,d));
				//alert(y);
				window.scroll(x,y);
				if(t<d){
					t++;
					setTimeout(transition,frameSpeed);
				};
			};
			transition();
		};

		function sepHandler(e){
			e.stopPropagation();
			var div=this;
			//alert(div);
			var target=e.target;
			//alert(target);
			function getRelativeDiv(which){
				var id=div.id;
				id=id.replace(/(sp-separator-)(.+)/,function(a,b,c){
					return b+String((Number(c)+(which=='pre'? -1 : 1)));
				});
				//alert(id);
				return (id? document.getElementById(id) : null);
			};
			function scrollIt(a,b){
				//a=a!==undefined? a : window.scrollY;
				prefs.sepT? sp_transition(a,b) : window.scroll(window.scrollX,b);
			};

			switch(target.className){
				case 'sp-sp-gotop':{
					scrollIt(window.scrollY,0);
				}break;
				case 'sp-sp-gopre':{
					var prediv=getRelativeDiv('pre');
					if(!prediv)return;
					var o_scrollY=window.scrollY;
					var preDS=prediv.getBoundingClientRect().top;
					if(prefs.sepP){
						var divS=div.getBoundingClientRect().top;
						preDS=o_scrollY-(divS-preDS);
					}else{
						preDS+=o_scrollY-6
					};
					scrollIt(o_scrollY,preDS);
				}break;
				case 'sp-sp-gonext':{
					var nextdiv=getRelativeDiv('next');
					if(!nextdiv)return;
					var o_scrollY=window.scrollY;
					var nextDS=nextdiv.getBoundingClientRect().top;
					if(prefs.sepP){
						var divS=div.getBoundingClientRect().top;
						nextDS=o_scrollY+(-divS+nextDS);
					}else{
						nextDS+=o_scrollY-6
					};
					scrollIt(o_scrollY,nextDS)
				}break;
				case 'sp-sp-gobottom':{
					scrollIt(window.scrollY,Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));
				}break;
				default:break;
			};
		};

		//autopager
		var autoPO={
			startipages:nullFn,
		};
		function autopager(SSS,floatWO){
			//return;
			//更新悬浮窗的颜色.
			floatWO.updateColor('autopager');

			//获取插入位置节点.
			var insertPoint;
			var pageElement;
			var insertMode;
			if(SSS.a_HT_insert){
				insertPoint=getElement(SSS.a_HT_insert[0]);
				insertMode=SSS.a_HT_insert[1];
			}else{
				pageElement=getAllElements(SSS.a_pageElement);
				if(pageElement.length>0){
					var pELast=pageElement[pageElement.length-1];
					insertPoint=pELast.nextSibling? pELast.nextSibling : pELast.parentNode.appendChild(document.createTextNode(' '));
				};
			};

			if(insertPoint){
				if(xbug)C.log('验证是否能找到插入位置节点:成功,',insertPoint);
			}else{
				if(xbug)C.err('验证是否能找到插入位置节点:失败',(SSS.a_HT_insert? SSS.a_HT_insert[0] : ''),'JS执行终止');
				floatWO.updateColor('Astop');
				return;
			};

			if(pageElement===undefined){
				pageElement=getAllElements(SSS.a_pageElement);
			};
			if(pageElement.length>0){
				if(xbug)C.log('验证是否能找到主要元素:成功,',pageElement);
			}else{
				if(xbug)C.err('验证是否能找到主要元素:失败,',SSS.a_pageElement,'JS执行终止');
				floatWO.updateColor('Astop');
				return;
			};


			var insertPointP;
			if(insertMode!=2){
				insertPointP=insertPoint.parentNode;
			};

			var addIntoDoc;
			if(insertMode==2){
				addIntoDoc=function(obj){
					insertPoint.appendChild(obj)
				};
			}else{
				addIntoDoc=function(obj){
					insertPointP.insertBefore(obj,insertPoint)
				};
			};

			var doc,win;
			function XHRLoaded(){
				if(this.readyState!=4)return;
				var str=this.responseText;
				doc=win=createDocumentByString(str);
				if(!doc){
					if(xbug)C.err('文档对象创建失败');
					removeL();
					return;
				};
				floatWO.updateColor('autopager');
				floatWO.CmodeIcon('hide');
				floatWO.loadedIcon('show');
				working=false;
				scroll();
			};


			var remove=[];
			function removeL(){
				if(xbug)C.log('移除各种事件监听');
				floatWO.updateColor('Astop');
				var _remove=remove;
				for(var i=0,ii=_remove.length;i<ii;i++){
					_remove[i]();
				};
			};


			var iframe;
			var messageR;
			var cdomloadedc=nullFn;
			function iframeLoaded(){
				var iframe=this;
				//alert(this.contentDocument.body)
				//alert(iframe.contentDocument.body.innerHTML);
				var body=iframe.contentDocument.body;
				if(body && body.firstChild){
					setTimeout(function(){
						doc=iframe.contentDocument;
						win=iframe.contentWindow || doc;
						floatWO.updateColor('autopager');
						floatWO.CmodeIcon('hide');
						floatWO.loadedIcon('show');
						working=false;
						scroll();
					},SSS.a_itimeout);
				};
			};
			function iframeRquest(link){
				if(!iframe){
					var i=document.createElement('iframe');
					iframe=i;
					i.name='superpreloader-iframe';
					i.width='100%';
					i.height='0';
					i.frameBorder="0";
					i.style.cssText='\
						margin:0!important;\
						padding:0!important;\
						visibility:hidden!important;\
					';
					i.src=link;
					if(SSS.a_iloaded){
						i.addEventListener('load',iframeLoaded,false);
						remove.push(function(){
							i.removeEventListener('load',iframeLoaded,false)
						});
					}else{
						if(!browser.chrome){
							function messagehandler(e){
								if(!messageR && e.data=='superpreloader-iframe:DOMLoaded'){
									//alert(e.source);
									messageR=true;
									iframeLoaded.call(i);
								};
							};
							window.addEventListener('message',messagehandler,false);
							remove.push(function(){
								window.removeEventListener('message',messagehandler,false);
							});
						}else{
							cdomloadedc=function(){
								var body=i.contentDocument.body;
								if(!messageR && body && body.hasAttribute('data-superpreloader-iframe-domloaded')){
									messageR=true;
									i.contentDocument.body.removeAttribute('data-superpreloader-iframe-domloaded');
									iframeLoaded.call(i);
								}else{
									setTimeout(arguments.callee,1);
								};
							};
						};
					};
					document.body.appendChild(i);
					cdomloadedc();
				}else{
					messageR=false;
					iframe.contentDocument.location.replace(link);
					cdomloadedc();
				};
			};

			var working;
			function doRequest(){
				working=true;
				floatWO.updateColor('loading');
				floatWO.CmodeIcon('show');
				SSS.a_useiframe? iframeRquest(nextlink) : xhttpRequest(nextlink,XHRLoaded);
			};

			var ipagesmode=SSS.a_ipages[0];
			var ipagesnumber=SSS.a_ipages[1];
			var scrollDo=nullFn;
			var afterInsertDo=nullFn;
			if(prefs.Aplus){
				afterInsertDo=doRequest;
				doRequest();
			}else{
				scrollDo=doRequest;
				if(ipagesmode)doRequest();
			};


			var noticeDiv;
			var noticeDivto;
			var noticeDivto2;
			function notice(html_txt){
				if(!noticeDiv){
					var div=document.createElement('div');
					noticeDiv=div;
					div.style.cssText='\
						position:fixed!important;\
						z-index:2147483647!important;\
						float:none!important;\
						width:auto!important;\
						height:auto!important;\
						font-size:13px!important;\
						padding:3px 20px 2px 5px!important;\
						background-color:#7f8f9c!important;\
						border:none!important;\
						color:#000!important;\
						text-align:left!important;\
						left:0!important;\
						bottom:0!important;\
						opacity:0;\
						-moz-border-radius:0 6px 0 0!important;\
						border-radius:0 6px 0 0!important;\
						-o-transition:opacity 0.3s ease-in-out;\
						-webkit-transition:opacity 0.3s ease-in-out;\
						-moz-transition:opacity 0.3s ease-in-out;\
					';
					document.body.appendChild(div);
				};
				clearTimeout(noticeDivto);
				clearTimeout(noticeDivto2);
				noticeDiv.innerHTML=html_txt;
				noticeDiv.style.display='block';
				noticeDiv.style.opacity='0.96';
				noticeDivto2=setTimeout(function(){
					noticeDiv.style.opacity='0';
				},1666);
				noticeDivto=setTimeout(function(){
					noticeDiv.style.display='none';
				},2000);
			};

			var manualDiv;
			function manualAdiv(){
				if(!manualDiv){
					var style=document.createElement('style');
					style.type='text/css';
					style.textContent='\
						#sp-sp-manualdiv{\
							line-height:1.6!important;\
							opacity:1!important;\
							position:relative!important;\
							float:none!important;\
							top:0!important;\
							left:0!important;\
							z-index:1000!important;\
							min-width:366px!important;\
							width:auto!important;\
							text-align:center!important;\
							font-size:14px!important;\
							padding:3px 0!important;\
							margin:5px 10px 8px!important;\
							clear:both!important;\
							border-top:1px solid #ccc!important;\
							border-bottom:1px solid #ccc!important;\
							-moz-border-radius:30px!important;\
							border-radius:30px!important;\
							background-color:#F5F5F5!important;\
							-moz-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
							-webkit-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
							box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
						}\
						.sp-sp-md-span{\
							font-weight:bold!important;\
							margin:0 5px!important;\
						}\
						#sp-sp-md-number{\
							width:50px!important;\
							vertical-align:middle!important;\
							display:inline-block!important;\
							text-align:left!important;\
						}\
						#sp-sp-md-imgnext{\
							padding:0!important;\
							margin:0 0 0 5px!important;\
							vertical-align:middle!important;\
							display:inline-block!important;\
						}\
						#sp-sp-manualdiv:hover{\
							cursor:pointer;\
						}\
						#sp-sp-md-someinfo{\
							position:absolute!important;\
							right:16px!important;\
							bottom:1px!important;\
							font-size:10px!important;\
							text-shadow:white 0 1px 0!important;\
							color:#5A5A5A!important;\
							font-style:italic!important;\
							z-index:-1!important;\
							background:none!important;\
						}\
					';
					getElementByCSS('head').appendChild(style);
					var div=document.createElement('div');
					div.id='sp-sp-manualdiv';
					manualDiv=div;
					var span=document.createElement('span');
					span.textContent='下';
					span.className='sp-sp-md-span'
					div.appendChild(span);
					var input=document.createElement('input');
					input.type='number';
					input.value=1;
					input.min=1;
					input.title="输入你想要拼接的页数(必须>=1),然后按回车."
					input.id='sp-sp-md-number';
					function getInputValue(){
						var value=Number(input.value);
						if(isNaN(value) || value<1){
							value=1;
							input.value=1;
						};
						return value;
					};
					function spage(){
						if(doc){
							var value=getInputValue();
							//alert(value);
							ipagesmode=true;
							ipagesnumber=value+paged;
							insertedIntoDoc();
						};
					};
					input.addEventListener('keyup',function(e){
						//alert(e.keyCode);
						if(e.keyCode==13){//回车
							spage();
						};
					},false);
					div.appendChild(input);
					var span2=document.createElement('span');
					span2.textContent='页';
					span2.className='sp-sp-md-span'
					div.appendChild(span2);
					var img=document.createElement('img');
					img.id='sp-sp-md-imgnext';
					img.src=_sep_icons.next;
					div.appendChild(img);
					var span_info=document.createElement('span');
					span_info.id='sp-sp-md-someinfo';
					span_info.textContent=prefs.someValue;
					div.appendChild(span_info);
					document.body.appendChild(div);
					div.addEventListener('click',function(e){
						if(e.target.id=='sp-sp-md-number')return;
						spage();
					},false);
				};
				addIntoDoc(manualDiv);
				manualDiv.style.display='block';
			};

			function beforeInsertIntoDoc(){
				working=true;
				if(SSS.a_manualA && !ipagesmode){//显示手动翻页触发条.
					manualAdiv();
				}else{//直接拼接.
					insertedIntoDoc();
				};
			};


			var sepStyle;
			var goNextImg=[false];
			var sNumber=prefs.sepStartN;
			var _sep_icons=sep_icons;
			var curNumber=sNumber;
			function createSep(){
				var div=document.createElement('div');
				if(SSS.a_separator){
					if(!sepStyle){
						var style=document.createElement('style');
						style.type='text/css';
						style.textContent='\
							div.sp-separator{\
								line-height:1.6!important;\
								opacity:1!important;\
								position:relative!important;\
								float:none!important;\
								top:0!important;\
								left:0!important;\
								z-index:1000!important;\
								min-width:366px!important;\
								width:auto!important;\
								text-align:center!important;\
								font-size:14px!important;\
								display:block!important;\
								padding:3px 0!important;\
								margin:5px 10px 8px!important;\
								clear:both!important;\
								border-top:1px solid #ccc!important;\
								border-bottom:1px solid #ccc!important;\
								-moz-border-radius:30px!important;\
								border-radius:30px!important;\
								background-color:#F5F5F5!important;\
								-moz-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
								-webkit-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
								box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
							}\
							div.sp-separator img{\
								vertical-align:middle!important;\
								cursor:pointer!important;\
								padding:0!important;\
								margin:0 5px!important;\
								border:none!important;\
								display:inline-block!important;\
								float:none!important;\
							}\
							div.sp-separator a.sp-sp-nextlink{\
								margin:0 20px 0 -6px!important;\
								display:inline!important;\
								text-shadow:#fff 0 1px 0!important;\
								background:none!important;\
							}\
							div.sp-separator span.sp-span-someinfo{\
								position:absolute!important;\
								right:16px!important;\
								bottom:1px!important;\
								font-size:10px!important;\
								text-shadow:white 0 1px 0!important;\
								color:#5A5A5A!important;\
								font-style:italic!important;\
								z-index:-1!important;\
								background:none!important;\
							}\
						';
						sepStyle=style;
						getElementByCSS('head').appendChild(style);
					};

					div.className='sp-separator';
					div.id='sp-separator-'+curNumber;
					div.addEventListener('click',sepHandler,false);
					var a=document.createElement('a');
					a.className='sp-sp-nextlink';
					a.innerHTML='Super_preloader: Page <b><span style="color:red!important;">'+curNumber+'</span></b>';
					a.href=a.title=nextlink;
					var img=document.createElement('img');
					var i_top=img.cloneNode(false);
					i_top.src=_sep_icons.top;
					i_top.className='sp-sp-gotop';
					i_top.alt=i_top.title='去到顶部';
					var i_bottom=img.cloneNode(false);
					i_bottom.src=_sep_icons.bottom;
					i_bottom.className='sp-sp-gobottom';
					i_bottom.alt=i_bottom.title='去到底部';
					var i_pre=img.cloneNode(false);
					i_pre.src=curNumber==sNumber? _sep_icons.pre_gray : _sep_icons.pre;
					i_pre.title='上滚一页';
					i_pre.className='sp-sp-gopre';
					var i_next=img;
					i_next.src=_sep_icons.next_gray;
					i_next.className='sp-sp-gonext';
					i_next.alt=i_next.title='下滚一页';
					if(goNextImg.length==2){
						goNextImg.shift();
					};
					goNextImg.push(i_next);
					var span_info=document.createElement('span');
					span_info.className='sp-span-someinfo';
					span_info.textContent=prefs.someValue;

					div.appendChild(a);
					div.appendChild(i_top);
					div.appendChild(i_pre);
					div.appendChild(i_next);
					div.appendChild(i_bottom);
					div.appendChild(span_info);
					curNumber+=1;
				}else{
					div.style.cssText='\
						height:0!important;\
						width:0!important;\
						margin:0!important;\
						padding:0!important;\
						border:none!important;\
						clear:both!important;\
						display:block!important;\
						visibility:hidden!important;\
					';
				};
				return div;
			};

			var paged=0;
			function insertedIntoDoc(){
				if(!doc)return;
				var fragment=document.createDocumentFragment();
				var pageElement=getAllElements(SSS.a_pageElement,false,doc,win);
				var ii=pageElement.length;
				if(ii<=0){
					if(xbug)C.log('获取下一页的主要内容失败',SSS.a_pageElement);
					removeL();
					return;
				};
				var i,pe_x,pe_x_nn;
				for(i=0;i<ii;i++){
					pe_x=pageElement[i];
					pe_x_nn=pe_x.nodeName;
					if(pe_x_nn=='BODY' || pe_x_nn=='HTML' || pe_x_nn=='SCRIPT')continue;
					pe_x=doc.importNode(pe_x,true);
					fragment.appendChild(pe_x);
				};
				var scripts=getAllElements('css;script',fragment);//移除脚本
				//alert(scripts.length);
				var scripts_x;
				for(i=scripts.length-1;i>=0;i--){
					scripts_x=scripts[i];
					scripts_x.parentNode.removeChild(scripts_x);
				};
				if(SSS.filter){//功能未完善.
					//alert(SSS.filter);
					var nodes=[]
					try{
						nodes=getAllElements(SSS.filter,fragment);
					}catch(e){};
					var nodes_x;
					for(i=nodes.length-1;i>=0;i--){
						nodes_x=nodes[i];
						nodes_x.parentNode.removeChild(nodes_x);
					};
				};
				var imgs;
				if(!browser.opera && SSS.a_useiframe && !SSS.a_iloaded){
					imgs=getAllElements('css;img[src]',fragment);//收集所有图片
				};
				var sepdiv=createSep();
				fragment.insertBefore(sepdiv,fragment.firstChild);
				addIntoDoc(fragment);
				cplink=nextlink;
				//C.log('----------');
				if(imgs){//非opera,在iframeDOM取出数据时需要重载图片.
					setTimeout(function(){
						var _imgs=imgs;
						var i,ii,img;
						for(i=0,ii=_imgs.length;i<ii;i++){
							img=_imgs[i];
							var src=img.src;
							img.src=src;
						};
					},99);
				};
				if(SSS.a_replaceE){
					var oldE=getAllElements(SSS.a_replaceE);
					var oldE_lt=oldE.length;
					//alert(oldE_lt);
					if(oldE_lt>0){
						var newE=getAllElements(SSS.a_replaceE,false,doc,win);
						var newE_lt=newE.length;
						//alert(newE_lt);
						if(newE_lt==oldE_lt){
							var oldE_x,newE_x;
							for(i=0;i<newE_lt;i++){
								oldE_x=oldE[i];
								newE_x=newE[i];
								newE_x=doc.importNode(newE_x,true);
								oldE_x.parentNode.replaceChild(newE_x,oldE_x);
							};
						};
					};
				};
				paged+=1;
				if(ipagesmode && paged>=ipagesnumber){
					ipagesmode=false;
				};
				floatWO.loadedIcon('hide');
				if(manualDiv){
					manualDiv.style.display='none';
				};
				if(goNextImg[0])goNextImg[0].src=_sep_icons.next;

				//alert(SSS.nextLink)
				var nl=getElement(SSS.nextLink,false,doc,win);
				//alert(nl);
				if(nl){
					nl=getFullHref(nl);
					if(nl==nextlink){
						nextlink=null;
					}else{
						nextlink=nl;
					};
				}else{
					nextlink=null;
				};
				if(paged>=SSS.a_maxpage){
					if(xbug)C.log('到达所设定的最大翻页数',SSS.a_maxpage);
					notice('<b>状态</b>:'+'到达所设定的最大翻页数:<b style="color:red">'+SSS.a_maxpage+'</b>');
					removeL();
					return;
				};
				var delayiframe=function(fn){
					setTimeout(fn,199);
				};
				if(nextlink){
					if(xbug)C.log('找到下一页链接:',nextlink);
					doc=win=null;
					if(ipagesmode){
						if(SSS.a_useiframe){//延时点,firefox,太急会卡-_-!
							delayiframe(doRequest);
						}else{
							doRequest();
						};
					}else{
						working=false;
						if(SSS.a_useiframe){
							delayiframe(afterInsertDo);
						}else{
							afterInsertDo();
						};
					};
				}else{
					if(xbug)C.log('没有找到下一页链接',SSS.nextLink);
					removeL();
					return;
				};
			};

			//返回,剩余高度是总高度的比值.
			var relatedObj_0,relatedObj_1;
			if(SSS.a_relatedObj){
				relatedObj_0=SSS.a_relatedObj[0];
				relatedObj_1=SSS.a_relatedObj[1];
			};

			function getRemain(){
				var scrolly=window.scrollY;
				var WI=window.innerHeight;
				var obj=getLastElement(relatedObj_0);
				var scrollH=(obj && obj.nodeType==1)? (obj.getBoundingClientRect()[relatedObj_1] + scrolly) : Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
				return (scrollH-scrolly-WI)/WI;//剩余高度于页面总高度的比例.
			};

			var pause=false;
			if(prefs.pauseA){
				var Sbutton=['target','shiftKey','ctrlKey','altKey'];
				var ltype=prefs.mouseA? 'mousedown' : 'dblclick';
				var button_1=Sbutton[prefs.Pbutton[0]];
				var button_2=Sbutton[prefs.Pbutton[1]];
				var button_3=Sbutton[prefs.Pbutton[2]];
				function pauseIt(){
					pause=!pause;
					if(prefs.stop_ipage)ipagesmode=false;
					if(pause){
						floatWO.updateColor('Apause');
						notice('<b>状态</b>:'+'自动翻页<span style="color:red!important;"><b>暂停</b></span>.');
					}else{
						floatWO.updateColor('autopager');
						floatWO.CmodeIcon('hide');
						notice('<b>状态</b>:'+'自动翻页<span style="color:red!important;"><b>启用</b></span>.');
					};
					scroll();
				};
				var Sctimeout;
				function clearPause(){
					clearTimeout(Sctimeout);
					document.removeEventListener('mouseup',arguments.callee,false);
				};
				function pausehandler(e){
					if(!SSS.a_manualA || ipagesmode || pause){
						if(e[button_1] && e[button_2] && e[button_3]){
							if(e.type=='mousedown'){
								document.addEventListener('mouseup',clearPause,false);
								Sctimeout=setTimeout(pauseIt,prefs.Atimeout);
							}else{
								pauseIt();
							};
						};
					};
				};
				document.addEventListener(ltype,pausehandler,false);
				remove.push(function(){
					document.removeEventListener(ltype,pausehandler,false);
				});
			};



			function scroll(){
				if(!pause && !working && (getRemain()<=SSS.a_remain || ipagesmode)){
					if(doc){//有的话,就插入到文档.
						beforeInsertIntoDoc();
					}else{//否则就请求文档.
						scrollDo();
					};
				};
			};

			var timeout;
			function timeoutfn(){
				clearTimeout(timeout);
				timeout=window.setTimeout(scroll,100);
			};
			window.addEventListener('scroll',timeoutfn,false);
			remove.push(function(){
				window.removeEventListener('scroll',timeoutfn,false);
			});


			autoPO={
				startipages:function(value){
					if(value>0){
						ipagesmode=true;
						ipagesnumber=value+paged;
						notice('<b>状态</b>:'+'当前已翻页数量:<b>'+paged+'</b>,'+'连续翻页到第<b style="color:red!important;">'+ipagesnumber+'</b>页.');
						if(SSS.a_manualA)insertedIntoDoc();
						scroll();
					};
				},
			};
		};

		//prefetcher
		function prefetcher(SSS,floatWO){
			function cContainer(){
				var div=document.createElement('div');
				var div2=div.cloneNode(false);
				var hr=document.createElement('hr');
				div.style.cssText='\
					margin:3px!important;\
					padding:5px!important;\
					border-radius:8px!important;\
					-moz-border-radius:8px!important;\
					border-bottom:1px solid #E30005!important;\
					border-top:1px solid #E30005!important;\
					background-color:#F5F5F5!important;\
					float:none!important;\
				';
				div.title='预读的内容';
				div2.style.cssText='\
					text-align:left!important;\
					color:red!important;\
					font-size:13px!important;\
					display:block!important;\
					float:none!important;\
					position:static!important;\
				';
				hr.style.cssText='\
					display:block!important;\
					border:1px inset #000!important;\
				';
				div.appendChild(div2);
				div.appendChild(hr);
				document.body.appendChild(div);
				return{
					div:div,
					div2:div2
				};
			};

			floatWO.updateColor('prefetcher');

			floatWO.updateColor('loading');
			floatWO.CmodeIcon('show');
			if(SSS.useiframe){
				var iframe=document.createElement('iframe');
				iframe.name='superpreloader-iframe';
				iframe.src=nextlink;
				iframe.width='100%';
				iframe.height='0';
				iframe.frameBorder="0";
				iframe.style.cssText='\
					margin:0!important;\
					padding:0!important;\
				';
				iframe.addEventListener('load',function(){
					var body=this.contentDocument.body;
					if(body && body.firstChild){
						floatWO.updateColor('prefetcher');
						floatWO.CmodeIcon('hide');
						floatWO.loadedIcon('show');
						this.removeEventListener('load',arguments.callee,false);
					};
				},false);
				if(SSS.viewcontent){
					var container=cContainer();
					container.div2.innerHTML='iframe全预读: '+'<br />'+'预读网址: '+'<b>'+nextlink+'</b>';
					iframe.height='300px';
					container.div.appendChild(iframe);
				}else{
					document.body.appendChild(iframe);
				};
			}else{
				xhttpRequest(nextlink,function(){
					if(this.readyState!=4)return;
					var str=this.responseText;
					var doc=createDocumentByString(str);
					if(!doc){
						if(xbug)C.err('文档对象创建失败!');
						return;
					};
					var images=doc.images;
					var isl=images.length;
					var img;
					var iarray=[];
					var i;
					var existSRC={};
					var isrc;
					for(i=isl-1;i>=0;i--){
						isrc=images[i].getAttribute('src');
						if(!isrc || existSRC[isrc]){
							continue;
						}else{
							existSRC[isrc]=true;
						};
						img=document.createElement('img');
						img.src=isrc;
						iarray.push(img);
					};
					if(SSS.viewcontent){
						var containter=cContainer();
						var div=containter.div;
						i=iarray.length;
						containter.div2.innerHTML='预读取图片张数: '+'<b>' +i+ '</b>'+'<br />'+'预读网址: '+'<b>'+nextlink +'</b>';
						for(i-=1;i>=0;i--){
							div.appendChild(iarray[i]);
						};
					};
					floatWO.updateColor('prefetcher');
					floatWO.loadedIcon('show');
					floatWO.CmodeIcon('hide');
				});
			};
		};


		//执行开始..///////////////////
		function toRE(obj){
			if(obj instanceof RegExp){
				return obj;
			}else if(obj instanceof Array){
				return new RegExp(obj[0],obj[1]);
			}else{
				if(obj.search(/^wildc;/i)==0){
					obj='^'+((obj.slice(6))
						.replace(/\\/g, '\\\\')
						.replace(/\+/g, '\\+')
						.replace(/\./g, '\\.')
						.replace(/\?/g, '\\?')
						.replace(/\{/g, '\\{')
						.replace(/\}/g, '\\}')
						.replace(/\[/g, '\\[')
						.replace(/\]/g, '\\]')
						.replace(/\^/g, '\\^')
						.replace(/\$/g, '\\$')
						.replace(/\*/g, '.*')
						.replace(/\(/g, '\\(')
						.replace(/\)/g, '\\)')
						.replace(/\|/g, '\\|')
						.replace(/\//g, '\\/'))+'$';
				};
				//alert(obj);
				return new RegExp(obj);
			};
		};


		//分析黑名单
		var blacklist_x;
		var i;
		var ii;

		for(i=0,ii=blackList.length;i<ii;i++){
			blacklist_x=blackList[i];
			if(blacklist_x[1]){
				if(toRE(blacklist_x[2]).test(url)){
					if(xbug){
						C.log('匹配黑名单',blacklist_x,'js执行终止');
						C.log('全部过程耗时',new Date()-startTime,'毫秒');
					};
					return;
				};
			};
		};

		//是否在frame上加载..
		if(prefs.DisableI && window.self!=window.parent){
			var isreturn=true,
						DIExclude_x;
			for(i=0,ii=DIExclude.length;i<ii;i++){
				DIExclude_x=DIExclude[i];
				if(DIExclude_x[1] && DIExclude_x[2].test(url)){
					isreturn=false;
					break;
				};
			};
			if(isreturn){
				if(xbug)C.log('url为:',url,'的页面为为非顶层窗口,JS执行终止.');
				return;
			};
		};
		if(xbug)C.log('url为:',url,'JS加载成功')


		//第一阶段..分析高级模式..
		SITEINFO=SITEINFO.concat(SITEINFO_TP,SITEINFO_comp);


		var docChecked;

		function autoGetLink(doc,win){
			if(!autoMatch.keyMatch)return;
			if(!parseKWRE.done){
				parseKWRE();
				parseKWRE.done=true;
			};

			var startTime=new Date();
			doc=doc || document;
			win=win || window;

			if(doc==document){//当前文档,只检查一次.
				//alert(nextlink);
				if(docChecked)return nextlink;
				docChecked=true;
			};

			var _prePageKey=prePageKey;
			var _nextPageKey=nextPageKey;
			var _nPKL=nextPageKey.length;
			var _pPKL=prePageKey.length;
			var _getFullHref=getFullHref;
			var _getAllElementsByXpath=getAllElementsByXpath;
			var _Number=Number;
			var _domain_port=domain_port;
			var alllinks=doc.links;
			var alllinksl=alllinks.length;


			var curLHref=cplink;
			var _nextlink;
			var _prelink;
			if(!autoGetLink.checked){//第一次检查
				_nextlink=nextlink;
				_prelink=prelink;
			}else{
				_prelink=true;
			};

			var DCEnable=autoMatch.digitalCheck;
			var DCRE=/^\s*\D{0,1}(\d+)\D{0,1}\s*$/;

			var i,a,ahref,atext,numtext;
			var aP,initSD,searchD=1,preS1,preS2,searchedD,pSNText,preSS,nodeType;
			var nextS1,nextS2,nSNText,nextSS;
			var aimgs,j,jj,aimg_x,xbreak,k,keytext;

			function finalCheck(a,type){
				//C.log(a);
				var ahref=a.getAttribute('href');//在chrome上当是非当前页面文档对象的时候直接用a.href访问,不返回href
				ahref=_getFullHref(ahref);//从相对路径获取完全的href;

				//3个条件:http协议链接,非跳到当前页面的链接,非跨域
				if(/^https?:/i.test(ahref) && ahref.replace(/#.*$/,'')!=curLHref && ahref.match(/https?:\/\/([^\/]+)/)[1]==_domain_port){
					if(xbug){
						C.log((type=='pre'? '上一页' : '下一页')+'匹配到的关键字为:',atext);
					};
					return a;//返回对象A
					//return ahref;
				};
			};

			if(xbug){C.log('全文档链接数量:',alllinksl)}

			for(i=0;i<alllinksl;i++){
				if(_nextlink && _prelink)break;
				a=alllinks[i];
				if(!a)continue;//undefined跳过
				//links集合返回的本来就是包含href的a元素..所以不用检测
				//if(!a.hasAttribute("href"))continue;
				atext=a.textContent;
				if(atext){
					if(DCEnable){
						numtext=atext.match(DCRE);
						if(numtext){//是不是纯数字
							//C.log(numtext);
							numtext=numtext[1];
							//alert(numtext);
							aP=a;
							initSD=0;

							if(!_nextlink){
								preS1=a.previousSibling;
								preS2=a.previousElementSibling;
								

								while(!(preS1 || preS2) && initSD<searchD){
									aP=aP.parentNode;
									if(aP){
										preS1=aP.previousSibling;
										preS2=aP.previousElementSibling;
									};
									initSD++;
									//alert('initSD: '+initSD);
								};
								searchedD=initSD>0? true : false;

								if(preS1 || preS2){
									pSNText=preS1? preS1.textContent.match(DCRE) : '';
									if(pSNText){
										preSS=preS1;
									}else{
										pSNText=preS2? preS2.textContent.match(DCRE) : '';
										preSS=preS2;
									};
									//alert(previousS);
									if(pSNText){
										pSNText=pSNText[1];
										//C.log(pSNText)
										//alert(pSNText)
										if(_Number(pSNText)==_Number(numtext)-1){
											//alert(searchedD);
											nodeType=preSS.nodeType;
											//alert(nodeType);
											if(nodeType==3 || (nodeType==1 && (searchedD? _getAllElementsByXpath('./descendant-or-self::a[@href]',preSS,doc).snapshotLength==0 : (!preSS.hasAttribute('href') || _getFullHref(preSS.getAttribute('href'))==curLHref)))){
												_nextlink=finalCheck(a,'next');
												//alert(_nextlink);
											};
											continue;
										};
									};
								};
							};

							if(!_prelink){
								nextS1=a.nextSibling;
								nextS2=a.nextElementSibling;

								while(!(nextS1 || nextS2) && initSD<searchD){
									aP=aP.parentNode;
									if(aP){
										nextS1=a.nextSibling;
										nextS2=a.nextElementSibling;
									};
									initSD++;
									//alert('initSD: '+initSD);
								};
								searchedD=initSD>0? true : false;

								if(nextS1 || nextS2){
									nSNText=nextS1? nextS1.textContent.match(DCRE) : '';
									if(nSNText){
										nextSS=nextS1;
									}else{
										nSNText=nextS2? nextS2.textContent.match(DCRE) : '';
										nextSS=nextS2;
									};
									//alert(nextS);
									if(nSNText){
										nSNText=nSNText[1];
										//alert(pSNText)
										if(_Number(nSNText)==_Number(numtext)+1){
											//alert(searchedD);
											nodeType=nextSS.nodeType;
											//alert(nodeType);
											if(nodeType==3 || (nodeType==1 && (searchedD? _getAllElementsByXpath('./descendant-or-self::a[@href]',nextSS,doc).snapshotLength==0 : (!nextSS.hasAttribute("href") || _getFullHref(nextSS.getAttribute('href'))==curLHref)))){
												_prelink==finalCheck(a,'pre');
												//alert(_prelink);
											};
										};
									};
								};
							};
							continue;
						};
					};
				}else{
					atext=a.title;
				};
				if(!atext){
					aimgs=a.getElementsByTagName('img');
					for(j=0,jj=aimgs.length;j<jj;j++){
						aimg_x=aimgs[j];
						atext=aimg_x.alt || aimg_x.title;
						if(atext)break;
					};
				};
				if(!atext)continue;
				if(!_nextlink){
					xbreak=false;
					for(k=0;k<_nPKL;k++){
						keytext=_nextPageKey[k];
						if(!(keytext.test(atext)))continue;
						_nextlink=finalCheck(a,'next');
						xbreak=true;
						break;
					};
					if(xbreak || _nextlink)continue;
				};
				if(!_prelink){
					for(k=0;k<_pPKL;k++){
						keytext=_prePageKey[k];
						if(!(keytext.test(atext)))continue;
						_prelink=finalCheck(a,'pre');
						break;
					};
				};
			};

			//opera.postError(new Date()-startTime)
			if(xbug)C.log('搜索链接数量:',i,'耗时:',new Date()-startTime,'毫秒')

			if(!autoGetLink.checked){//只在第一次检测的时候,抛出上一页链接.
				prelink=_prelink;
				autoGetLink.checked=true;
			};

			//alert(_nextlink);
			return _nextlink;
		};

		function parseKWRE(){
			function modifyPageKey(name,pageKey,pageKeyLength){
				function strMTE(str){
					return (str.replace(/\\/g, '\\\\')
								.replace(/\+/g, '\\+')
								.replace(/\./g, '\\.')
								.replace(/\?/g, '\\?')
								.replace(/\{/g, '\\{')
								.replace(/\}/g, '\\}')
								.replace(/\[/g, '\\[')
								.replace(/\]/g, '\\]')
								.replace(/\^/g, '\\^')
								.replace(/\$/g, '\\$')
								.replace(/\*/g, '\\*')
								.replace(/\(/g, '\\(')
								.replace(/\)/g, '\\)')
								.replace(/\|/g, '\\|')
								.replace(/\//g, '\\/'));
				};

			var pfwordl=autoMatch.pfwordl,
						sfwordl=autoMatch.sfwordl;

			var RE_enable_a=pfwordl[name].enable,
						RE_maxPrefix=pfwordl[name].maxPrefix,
						RE_character_a=pfwordl[name].character,
						RE_enable_b=sfwordl[name].enable,
						RE_maxSubfix=sfwordl[name].maxSubfix,
						RE_character_b=sfwordl[name].character;
			var plwords,
						slwords,
						rep;

			plwords=RE_maxPrefix>0? ('['+(RE_enable_a? strMTE(RE_character_a.join('')) : '.')+']{0,'+RE_maxPrefix+'}') : '';
			plwords='^\\s*' + plwords;
			//alert(plwords);
			slwords=RE_maxSubfix>0? ('['+(RE_enable_b? strMTE(RE_character_b.join('')) : '.')+']{0,'+RE_maxSubfix+'}') : '';
			slwords=slwords + '\\s*$';
			//alert(slwords);
			rep=prefs.cases? '' : 'i';

			for(var i=0;i<pageKeyLength;i++){
				pageKey[i]=new RegExp(plwords + strMTE(pageKey[i]) + slwords,rep);
				//alert(pageKey[i]);
			};
			return pageKey;
		};

			//转成正则.
			prePageKey=modifyPageKey('previous',prePageKey,prePageKey.length);
			nextPageKey=modifyPageKey('next',nextPageKey,nextPageKey.length);
		};


		//重要的变量两枚.
		var nextlink;
		var prelink;
		//===============


		var SSS={};
		var SII;
		var SIIA;
		var SIIAD=SITEINFO_D.autopager;
		var Rurl;
		var ii=SITEINFO.length;

		if(xbug)C.log('高级规则数量:',ii);

		for(i=0;i<ii;i++){
			SII=SITEINFO[i];
			Rurl=toRE(SII.url);
			if(Rurl.test(url)){
				if(xbug)C.log('找到匹配当前站点的规则:',SII,'是第',i+1,'规则');
				nextlink=getElement(SII.nextLink || 'auto;');
				if(!nextlink){
					if(xbug)C.log('无法找到下一页链接,跳过规则:',SII,'继续查找其他规则');
					continue;
				};
				//alert(nextlink);
				if(SII.preLink && SII.preLink!='auto;'){//如果设定了具体的preLink
					prelink=getElement(SII.preLink);
				}else{
					getElement('auto;');
				};
				//alert(prelink);
				SSS.hasRule=true;
				SSS.Rurl=String(Rurl);
				//alert(SSS.Rurl);
				SSS.nextLink=SII.nextLink || 'auto;';
				SSS.viewcontent=SII.viewcontent;
				SSS.enable=(SII.enable===undefined)? SITEINFO_D.enable : SII.enable;
				SSS.useiframe=(SII.useiframe===undefined)? SITEINFO_D.useiframe : SII.useiframe;
				if(SII.pageElement){//如果是Oautopager的规则..
					if(!(SII.autopager instanceof Object))SII.autopager={};
					SII.autopager.pageElement=SII.pageElement;
					if(SII.insertBefore)SII.autopager.HT_insert=[SII.insertBefore,1];
				};
				//自动翻页设置.
				SIIA=SII.autopager;
				if(SIIA){
					SSS.a_pageElement=SIIA.pageElement;
					if(!SSS.a_pageElement)break;
					SSS.a_manualA=(SIIA.manualA===undefined)? SIIAD.manualA : SIIA.manualA;
					SSS.filter=SIIA.filter;
					SSS.a_enable=(SIIA.enable===undefined)? SIIAD.enable : SIIA.enable;
					SSS.a_useiframe=(SIIA.useiframe===undefined)? SIIAD.useiframe : SIIA.useiframe;
					SSS.a_iloaded=(SIIA.iloaded===undefined)? SIIAD.iloaded : SIIA.iloaded;
					SSS.a_itimeout=(SIIA.itimeout===undefined)? SIIAD.itimeout : SIIA.itimeout;
					//alert(SSS.a_itimeout);
					SSS.a_remain=(SIIA.remain===undefined)? SIIAD.remain : SIIA.remain;
					SSS.a_maxpage=(SIIA.maxpage===undefined)? SIIAD.maxpage : SIIA.maxpage;
					SSS.a_separator=(SIIA.separator===undefined)? SIIAD.separator : SIIA.separator;
					SSS.a_replaceE=SIIA.replaceE;
					SSS.a_HT_insert=SIIA.HT_insert;
					SSS.a_relatedObj=SIIA.relatedObj;
					SSS.a_ipages=(SIIA.ipages===undefined)? SIIAD.ipages : SIIA.ipages;
				};
				break;
			};
		};

		if(!SSS.hasRule){
			if(xbug)C.log('未找到合适的高级规则,开始自动匹配.');
			//自动搜索.
			if(!autoMatch.keyMatch){
				if(xbug)C.log('自动匹配功能被禁用了.');
			}else{
				nextlink=autoGetLink();
				//alert(nextlink);
				if(nextlink){//强制模式.
					var FA=autoMatch.FA;
					SSS.Rurl=window.localStorage? ('am:' + (url.match(/^https?:\/\/[^:]*\//i) || [])[0]) : 'am:automatch';
					//alert(SSS.Rurl);
					SSS.enable=true;
					SSS.nextLink='auto;';
					SSS.viewcontent=autoMatch.viewcontent;
					SSS.useiframe=autoMatch.useiframe;
					SSS.a_force=true;
					SSS.a_manualA=FA.manualA;
					SSS.a_enable=FA.enable || false;//不能使a_enable的值==undefined...
					SSS.a_useiframe=FA.useiframe;
					SSS.a_iloaded=FA.iloaded;
					SSS.a_itimeout=FA.itimeout;
					SSS.a_remain=FA.remain;
					SSS.a_maxpage=FA.maxpage;
					SSS.a_separator=FA.separator;
					SSS.a_ipages=FA.ipages;
				};
			};
		};



		if(xbug){
			C.log('搜索高级规则和自动匹配过程总耗时:',new Date()-startTime,'毫秒');
		};

		//上下页都没有找到啊
		if(!nextlink && !prelink){
			if(xbug){
				C.log('未找到相关链接,JS执行停止.');
				C.log('全部过程耗时',new Date()-startTime,'毫秒');
			};
			return;
		}else{
			if(xbug){
				C.log('上一页链接:',prelink);
				C.log('下一页链接:',nextlink);
			};
			nextlink=nextlink? (nextlink.href || nextlink)  : undefined;
			prelink=prelink? (prelink.href || prelink): undefined;
		};


		var superPreloader={
			go:function(){
				if(nextlink)window.location.href=nextlink;
			},
			back:function(){
				if(prelink)window.location.href=prelink;
			},
		};

		if(prefs.arrowKeyPage){
			if(xbug)C.log('添加键盘左右方向键翻页监听.');
			document.addEventListener('keyup',function(e){
				//alert(e.keyCode);
				var tarNN=e.target.nodeName;
				if(tarNN!='BODY' && tarNN!='HTML')return;
				switch(e.keyCode){
					case 37:{
						superPreloader.back();
					}break;
					case 39:{
						superPreloader.go();
					}break;
					default:break;
				};
			},false);
		};

		//监听下一页事件.
		if(xbug)C.log('添加鼠标手势翻页监听.');
		document.addEventListener('superPreloader.go',function(){
			superPreloader.go();
		},false);

		//监听下一页事件.
		document.addEventListener('superPreloader.back',function(){
			superPreloader.back();
		},false);

		//没找到下一页的链接
		if(!nextlink){
			if(xbug){
				C.log('下一页链接不存在,JS无法继续.');
				C.log('全部过程耗时:',new Date()-startTime,'毫秒');
			};
			return;
		};

		//载入设置..
		//alert(SSS.Rurl);
		if(xbug)C.log('加载设置');
		//saveValue('spfwset','');//清除设置.
		var savedValue=getValue('spfwset');
		//alert(savedValue);
		if(savedValue){
			try{
				savedValue=eval(savedValue);
			}catch(e){
				saveValue('spfwset','');//有问题的设置,被手动修改过?,清除掉,不然下次还是要出错.
			};
		};
		//alert(savedValue instanceof Array);
		if(savedValue){
			SSS.savedValue=savedValue;
			var savedValue_x;
			for(i=0,ii=savedValue.length;i<ii;i++){
				savedValue_x=savedValue[i];
				if(savedValue_x.Rurl==SSS.Rurl){
					for(var ix in savedValue_x){
						if(savedValue_x.hasOwnProperty(ix)){
							SSS[ix]=savedValue_x[ix];//加载键值.
						};
					};
					break;
				};
			};
			//alert(i);
			SSS.sedValueIndex=i;
		}else{
			SSS.savedValue=[];
			SSS.sedValueIndex=0;
		};

		if(browser.sogou){//搜狗强制iframe loaded
			SSS.a_iloaded=true;
		};

		if(!SSS.hasRule){
			SSS.a_force=true;
		};

		if(SSS.a_force){
			SSS.a_pageElement='//body/*';
			SSS.a_HT_insert=undefined;
			SSS.a_relatedObj=undefined;
		};

		if(prefs.floatWindow){
			if(xbug)C.log('创建悬浮窗');
			floatWindow(SSS);
		};

		if(!SSS.enable){
			if(xbug){
				C.log('本规则被关闭,脚本执行停止');
				C.log('全部过程耗时:',new Date()-startTime,'毫秒');
			};
			return;
		};
		if(xbug)C.log('全部过程耗时:',new Date()-startTime,'毫秒');

		//预读或者翻页.
		if(SSS.a_enable){
			if(xbug)C.log('初始化,翻页模式.');
			autopager(SSS,floatWO);
		}else{
			if(xbug)C.log('初始化,预读模式.');
			prefetcher(SSS,floatWO);
		};
	};

})();


//修正一些网站的自动翻页..
(function(){
	var URL=location.href;
	if(window.name=='superpreloader-iframe'){
		//修改百度iframe请求..无限翻页..
		if(window.opera && /^http:\/\/(?:(?:image)|(?:mp3))\.baidu\.com\/.+/i.test(URL)){
			window.opera.addEventListener('BeforeScript',function(e){
				e.element.text=e.element.text.replace(/top\.location=self\.location/gi,'');
			},false);
		};
	};

	//修正天涯帖子内容页面的使用.强制拼接.的问题.
	if(/http:\/\/www\.tianya\.cn\/.+\/content\/.+/i.test(URL)){
		var style=document.createElement('style');
		style.type='text/css';
		style.textContent='\
			div.wrapper{\
				height:auto!important;\
			}\
		';
		document.getElementsByTagName('head')[0].appendChild(style);
	}else if(/http:\/\/manhua\.178\.com\/.+\/.+\/.+/i.test(URL)){
		var style=document.createElement('style');
		style.type='text/css';
		style.textContent='\
			img.bigimgborder{\
				display:inline-block!important;\
			}\
		';
		document.getElementsByTagName('head')[0].appendChild(style);
	};
})();