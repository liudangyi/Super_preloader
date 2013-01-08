// ==UserScript==
// @name Super_preloader.db
// @author NLF
// @description  Super_preloader的数据库文件,无法单独使用.
// @create 2010-12-21
// @lastmodified 2010-12-29
// @version 1.0.0.5
// @namespace  http://userscripts.org/users/NLF
// @download  http://bbs.operachina.com/viewtopic.php?f=41&t=74923
// @download  http://userscripts.org/scripts/show/93080
// @include http*
// ==/UserScript==

(function(){
	/////////////////////设置(请注意开关的缩进关系..子开关一般在父开关为true的时候才会生效.)//////////////////////
	var prefs={
		floatWindow:true																	,//显示悬浮窗
				FW_position:2																	,//1:出现在左上角;2:出现在右上角;3：出现在右下角;4：出现在左下角;
				FW_offset:[20,20]															,//偏离版边的垂直和水平方向的数值..(单位:像素)
				FW_RAS:true																		,//点击悬浮窗上的保存按钮..立即刷新页面;
		pauseA:true																				,//快速停止自动翻页(当前模式为翻页模式的时候生效.);
				Pbutton:[2,0,0]																,//需要按住的键.....0: 不按住任何键;1: shift鍵;2: ctrl鍵; 3: alt鍵;(同时按3个键.就填 1 2 3)(一个都不按.就填 0 0 0)
				mouseA:true																		,//按住鼠标左键..否则.双击;
						Atimeout:200															,//按住左键时..延时.多少生效..(单位:毫秒);
				stop_ipage:true																,//如果在连续翻页过程中暂停.重新启用后.不在继续..连续翻页..
		Aplus:true																				,//自动翻页模式的时候..提前预读好一页..就是翻完第1页,立马预读第2页,翻完第2页,立马预读第3页..(大幅加快翻页快感-_-!!)(建议开启)..
		sepP:true																					,//翻页模式下.分隔符.在使用上滚一页或下滚一页的时候是否保持相对位置..
		sepT:true																					,//翻页模式下.分隔符.在使用上滚一页或下滚一页的时候使用动画过渡..
				s_method:3																		,//动画方式 0-10 一种11种动画效果..自己试试吧
				s_ease:2																			,//淡入淡出效果 0：淡入 1：淡出 2：淡入淡出
				s_FPS:60																			,//帧速.(单位:帧/秒)
				s_duration:333																,//动画持续时长.(单位:毫秒);
		debug:false																			,//debug,firefox打开firebug切换到错误控制台,chrome打开自带调试工具,opera打开dragonfly切换到命令行.
		someValue:'Powered by Super_preloader'						,//显示在翻页导航最右边的一个小句子..-_-!!..
		DisableI:true																			,//只在顶层窗口加载JS..提升性能..如果开启了这项,那么DIExclude数组有效,里面的网页即使不在顶层窗口也会加载....
		arrowKeyPage:true																	,//允许使用 左右方向键 翻页..
		updateSet:[false,7,true]													,//(不支持chrome)3项分别为:使用自动更新提醒,检查间隔(天),给firefoxGM注册右键
		sepStartN:1																				,//翻页导航上的,从几开始计数.(貌似有人在意这个,所以弄个开关出来,反正简单.-_-!!)
	};


	//分页导航的6个图标:
	var sep_icons={
		top:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjM3NkQ2MTFFOTUyNjExREZBNkRGOEVGQ0JDNkM0RDU3IiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjM3NkQ2MTFGOTUyNjExREZBNkRGOEVGQ0JDNkM0RDU3Ij4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Mzc2RDYxMUM5NTI2MTFERkE2REY4  RUZDQkM2QzRENTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Mzc2RDYxMUQ5NTI2MTFERkE2  REY4RUZDQkM2QzRENTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz7bso/VAAACxElEQVR42rSUS0iUURTH//d+j9EppSRtCjEi  w0EhjR6kIyUpWilFpbUTei1auMoellAQZFSbVrkQilplhZC9IKyNQg8CXVQKZigaOgojNdg3j++7  nTtjAzPqTI50Zu7ce+ec87vnnPtgQghIcZ3VxiGwGksRhomemwGHHKqRPwl6+ujFJXHvPLwWCUyN  VT7qvZ4UtK7oQtQ8CizLUlt4fr4U6ctmExPyZ478LelcMMNIa3vL2nkrR7KnvEaR/auuZ2akeHMt  f0SGsSvFSuk5rWOzs2RvXm6+zRJBDAx+8fUNfHjZfSNwMJ4fj6ekk9KU49hYuaXAZfs4/BzvhztR  6Nxmy85aXyl1SYFdjVrViuWrmqtLj9h7R18jKPwImD6CP0V5cY09fdnKZmmzKDA55Kqqrb2u4oR9  yNOHXz4PVEWDbtPhNSfR7+lGze46u6bp7dL2n8BkmMY4umrLj6XNCA8mfn4PQ3UdNgJzGzA28xnT  1giqdh4I2UqfuGAyYGTYUbH90JrMDAcbmuqFwlWCaiGoxQwomoCmc3z1vEV6RgrbUVTmkD7Sd+GI  GVo25Ra7tjp3af3ud1C5Dk3VQ9FazI+gYkAlqKqzUP/J3Yn8vAI9N8dZIn2jUJG3olE7nJ214cGp  /U2pMnVTmLCsIN4M3UMAXrj9g1B0AUXloAixb90Z0gtYpoBh+PD4xf2ZqemJ+p5bgSdRF4SMG0bd  31Ivt50MzxUYV463pchF3L/HaE5QjVNj4JzuocJw++5Vw/SLlFmEXTKojwbTgS+LqbfgZGmKAAzL  S+Xg4ARTCc5VFhpLKEXIFn1B5E5OG+PUy4wkDCGorDHj8R+lBGAGI+iN2t3QIowlfO3ig+kjb1v4  9aI2u1lBv0Xj+GA1nlKel+q8BnANdBrCdZVNBiwXSRY8eam1PjNBxlMLZpvo2UxWOP6T/BFgAOBe  8h+hfm64AAAAAElFTkSuQmCC'
		,bottom:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjg2RjU3NUQzOTUyNjExREY4M0U4RDZGQThBMjcwMEIzIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjg2RjU3NUQ0OTUyNjExREY4M0U4RDZGQThBMjcwMEIzIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODZGNTc1RDE5NTI2MTFERjgzRThE  NkZBOEEyNzAwQjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODZGNTc1RDI5NTI2MTFERjgz  RThENkZBOEEyNzAwQjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6bp+ZPAAAC0UlEQVR42rRVXUhUQRT+5t67uzdZwwX/0FKS  CCMiwcwi6QfpwcAgKHvzpR6EoKeQpIcIJCOCIB8SooIgKK2gssBwQ0PXsB8s8KdSIhFzXbHS2vbe  ufdOM3fd1mx3zRUPezgzzDnfnP3mm7mEMYaVMAkrZEq8hZ0nHQEe0hepD3RfpJlLAhagtcfPgBBA  sGWZzHbT4JEC2e4NON1UnbHkjoURiaDdf8kGpCELOncaMkF0FceKG5PnmPBVxSlBkom9iehemEN2  gYEt7/CEasLCiQKpihuLqSkhMLMAQ+ecCl5NMQ9vkqZm82glVkVZrSMy7uC5uyMT2UlCnFvV0CxY  Fps7PN6t5IZMHLB4MpER4uph86jr5GFP1wUKZd7GjelpWSWH9lenqKpL8KoyDmbolt25afBoEnic  uTBMand89uh1VeboYn71YcOvscmRxliquDf13V/i9T06sWtH+aqu8VuwJO2P3ITMUuUMPiagBoX3  w02oDje2rq3AE9/t0Fhg5LLAiM0xQ93w6JBv4H2/XpxZaXcrOBZRMVVIzAld1zmwDsPSUZi5Ha+G  Oum74Z5uUZvo8MQ/PPiir2NiZjrENnr2gnJQkxIOqkLTdA5MYVoGCtKLEJieYO2997+Imr9kE0cV  szyxvO35g9k0KQ+5KZtgaZgD1W0+s1avQwrx4K73hp0rav6VmxB9xKM2TKle1fqsJVjoKYObc6tr  YdBUlwcFni1oab8WNAytSuRGb1QUJ5GO22Z+fq339rQGS/MP2LdNIU4UrdmHx13NwW8/pupFTlJv  BbeGsclP294OvawoXV/pkoiC1/3d2ujEx6di7X+fzc/ccxaoREiN9A32Ijsn/Dq+GfCJmkruNAbe  OPf8MHD0LPNqqurivEbiFyav5shmOd7709TckBeTCsJvQ0vf+aS+GIeLTiXmeGFC8p+mqMz8V+6c  y1oWGoE/MvwtwABuklC1izbNcAAAAABJRU5ErkJggg=='
		,pre:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOkUzRDUyNEQ5OTBFMjExREZCMjNFRjQzNkMwMjdFNUMwIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOkUzRDUyNERBOTBFMjExREZCMjNFRjQzNkMwMjdFNUMwIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTNENTI0RDc5MEUyMTFERkIyM0VG  NDM2QzAyN0U1QzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTNENTI0RDg5MEUyMTFERkIy  M0VGNDM2QzAyN0U1QzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6I8cyJAAAC20lEQVR42tRVW0hUURTd+5xz550PVMwcUksJ  JY2wrMHpoxQzQrFRxF5iGn1EERGEZCBI9OFPUR9ZkNRX0a9fkeBPEhFBP1mDFj0xdVTSqXnce8/p  3Gtjvh+IH53LZu6Bc9dZe+2196AQAtZjEVinxWIv3stsqXM3ATG+16E1iVbBVwUsOC525pI7dfNp  gRApDnxulvvrq5KCoFgoKhLjktsOeWud5d7qhHhX0lnPBaVqVcA6J3Njp9224ZGvtMHhD7yE/vFe  UlN+PM0V52jPr6WFKwbmTJ0ZbsZYt6+k0RkIfYLByX74HvTDYLSP1FQe25KYpTzYtJel25LQ1A+T  ERcFtgenw8U47anaX5+AFh0+BN6AwizAKAX/2HPQ7OPEV+HLzSyGu1YH2JOyFSICQmi6RhYEThkx  g6oO1lXuqctIS0kn74deACOKGZwIQCn62/GnkJaZggdLDpdlVyo3RgdU0yU4x7nTu8EsasQdT36Z  Jz9nt9L3oxcoMqASFOQvF5p0HKDOBbwaeUJ2FBTQosI9ddtPWq4Z30vGuCCwEORiXkbRiZJdR6zv  JFMBXILSKXAkQlWjgmuyFrqA4K/f0PO1E0u9B5w52zaecleQRkZm9wHGWvpoe17oTFWLjVKZtkTQ  JcNu/0NQ9bAIa5M4HBkAq5MKi41gdW6L5A1E6MgnJkbVjse3hz6+Dp379ox3zWuQL8P9tqv3GqbS  YBhua+qUEER6maIajchUZQZRQwyZi4bYeqs59DMobPKI1UrRHZcB5+Wn84FN/WPW04RsNDSl0KSn  VflwWSNNFo8LRF0Thoa2gfucLNvScxdKKkalDdbGnbLluRrhhArCNVUnBNcw3fCv7xVqMc8a40eL  cIxGVHkhrn1s2hWXwdkQybAP6sYNywAvOSv3ba2VM0OTOqswGR4DlUdiXjL4rxB4NvehKx31qf+2  YmZtwXQo4siSMv53f03rBvxHgAEAqLoqsgGSMo4AAAAASUVORK5CYII='
		,next:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOkY3M0ZDRTgzOTBFMjExREZCNjlFQUY1QUIyNjQ1NzE3IiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOkY3M0ZDRTg0OTBFMjExREZCNjlFQUY1QUIyNjQ1NzE3Ij4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RjczRkNFODE5MEUyMTFERkI2OUVB  RjVBQjI2NDU3MTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RjczRkNFODI5MEUyMTFERkI2  OUVBRjVBQjI2NDU3MTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6Q0swTAAAC50lEQVR42tRVXUhUQRQ+M/dnd0sN/1gtAimW  LXsoiAixFyGIHnqNioioh36ghyh6sCAijAgiIoLowSRMBG1b1n5s0XxRtiyRlIpQ1M1sKxV1XffH  e2emM+u6qG11EXzoXM6de2fOfPeb8x3OJUIIWAmjsEKmzj+UndeWrv0kAgoJWTglT0cW0vqB96L5  144bxu/Ac5sWWeHpQxfT0xq1QbY9D1SqgUJVHHWovHfE+U/GU5Mc1uQoi1cFgYbua8mPErxK8reC  Q8sGm+qACtdh6zmejnLEEGlXCC4TTAiGSeiYEVm+eGMRDhxBpes2DVQbFWQuihtsdu4gFiopY1WM  T0tgEKqmCFUnVEuCCypTwgWXdwTnloH96CylIsdtcUUloNspqDpFdAoaXhKQcYZBAqhK4ql4sVT9  tHjhINzZsN3uPnngjDMnJ18jinAQEFy3KXIQzBBE023ImOEbJ5L51eM1dooVwpgB971V8YyMgy/M  5wMfYlcantaNJ8yI8H+7LXzDVRSrSlAFiKJRITVk3ERQA9r6auF10AfRRBjqW+7Ghsf6KzMCm9yU  Q3Xf5+8PWtpfzVSsPyayVq8CioSRFGiaTpAruplMBc7CZmcZtL57kvgY7KzFvbcyAquKKoLeJPil  zq439e97etiOwv1coURWnqAE0ZOgBkjw0qJy6O17awR6/YHiQXZq7ZCRWTyptOpUIBQQtN9nnH3Z  +swfGhoVW3L3yBQTygmeykj6JmQaGh3hzYH6oBY196VE/2NV8FQj4IkoxIY64ISnyfNJjeVyd94u  MBkDw5yFjQXbQMwq4G17OGlSVoHxESt1LBaMIxODxtFGX91AsV7K12W5oTjbBQWOEvC0Vs+Yprkb  Y74ut212RcLRC43Nj0Ku3HLuLtgJnpaaaCw+fRDXui21zb+YdyoyXtrc/vgcdg3bRHjsMurZZLkf  L7XQXgahdOrhevnoFxeWxxTKcNNKEyL/3a9pxYB/CTAALMFZuEnI1jsAAAAASUVORK5CYII='
		,next_gray:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjg1RDA5RjFGOTUyMjExREZCMkM4QUZEOEY4Qzg2MDREIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjg1RDA5RjIwOTUyMjExREZCMkM4QUZEOEY4Qzg2MDREIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODVEMDlGMUQ5NTIyMTFERkIyQzhB  RkQ4RjhDODYwNEQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODVEMDlGMUU5NTIyMTFERkIy  QzhBRkQ4RjhDODYwNEQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz62tt8rAAACiUlEQVR42tRVS6tSURTe5/hWFAderhoIKqmI  U2eCBg2a9AOaBQ4iZxE0yCCcNYkGDYWaNEh8ICQpoYg4CJQIFA0chKGpBb7A9+Oc1jp4LnK12+GC  gxYs1j7stb79rcfeh2JZlpxCaHIiEfMLj8dzee836NlVwRRF/QKj57+LxeIh8BE5CwQChC+VRCIh  arWaiEQiTsViMQkGg+f/ZDyfz4lcLj9wiEajF2uz2UwUCgWRyWTE5/MJr/FqteIY8gqporI7SxaL  xfWbt1wuL4ClUimWgAMGYdbrNecjZJKOTgWCYzzUkYV60mh53/2MhAJ/At1iLLIDXWCTsGkATGGz  aJomDMOQ7XbLAcP+YufP62HzRqPRa5PJZPf7/edarVYC6SvwAADGOrAARmHTABgwWQqBQ6GQHA/f  bDYkHA4vjjJuNBofO51OKB6P96FJbDabZVOpFA2BLDBFxlhr7gBknM/nSalUIrPZjEQikXm73X56  FBhPBXnTbDbfFgqFqdfrZVUqFZc+KjIHthRfCmyow+EguVxuWavV3kHsq6PAyKher+PyWblcfl+p  VLZut5tBUMwdU0ZQJIDW6XSSarW6/gwyGAwe9vv94xcEa6bRaIhSqaRhrB4B0A24aXdcLhcFKXM1  RVA8AJn2ej0mnU7/gNm/u2v6X6cCJ4Hazeu81Wo9SCaT3yATxm63c+njHFssFo4x7I3A9xboRMgc  s3v2J6R3PxaLfdfr9YzRaCQGg4HodDqSSCSmwP42+LSv+2x+mUwmTwCoa7PZGFAEnU2n03uw91XQ  s3mFJMfjsTOTyTyGtWw4HD4H+0Hwe3xZrFbr/ueLbrd7Exo4hvVLIY8Q9d/9mk4G/EeAAQCBEkva  rHrRPgAAAABJRU5ErkJggg=='
		,pre_gray:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjc0MTI5MDY4OTUyMjExREZCODVDREYyM0U0QjMzQkQzIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjc0MTI5MDY5OTUyMjExREZCODVDREYyM0U0QjMzQkQzIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzQxMjkwNjY5NTIyMTFERkI4NUNE  RjIzRTRCMzNCRDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzQxMjkwNjc5NTIyMTFERkI4  NUNERjIzRTRCMzNCRDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz5D2F5XAAACZklEQVR42tSVz6sSURTH7x0VJxX8CampSQtF  /AESConiQkhdlKKCLdr0YxW0iDaBSBLZok3tol27/oC3TcS14EpEBV24UOO5EETLn9M5g4KoPXu9  XHTgMNc7537me7/3zEg5jiOnCIacKISbQSAQuKjuI6VULhAInhSLxdWlFKMlv8mXer3+qU6nu79c  Ll/9KyvuKZXKN9FoVBqJRBRyufyZz+eLXxXslkqlXxOJhKTZbBJIBsY6mUz23uFw3P5bsEEoFH4D  kHQwGJBer0e63S7p9/tMKpW6pVarv5hMphsSiYRi8eZ6EDybzTYpg5/FeDyuYBiGtNttIhKJCBwc  aTQaZLFYMHDPZjQaP8P8NY1Gw0wmEw7nD4LH4zGmQCwWn4GnN7VaLVOv13kgqCfQFZhctVolcJg0  HA7ftdlsH2BHfJfg/YNglUqF+ekOhNPpFNVqNYKKEYpX6AhcTFerFSmXy4zL5RJ4PJ4Hbrf7La4H  xfQgGNa8sNvtD0OhkBiVYquhWoRCcvP5nEMoJu6uVCrRYDAoNZvNj6xW62MUcPAFMRgM79LpNIsF  Xq+XBxQKBYQjlIIifgzKaSwWw+0z8HCaTCbVw+HwtcViOW+1Wmd74E6nw2azWX4MgJ+5XI5F30At  nU6n/IM220VgPp//AfNYI4Yag0KheA639sHoxmYAqjiEohXo7RrKHx5CcQ6CrVQqzNFvxW6su2D7  tFfrllrtttalX+kNFPt47SlBv7Hfd9vrjxVvB8uyZOu7jX5cDez3+3mPMUejEard281R8E7h90wm  c/3IRs4vtPG/+2s6GfiXAAMAq3cXTADTBMIAAAAASUVORK5CYII='
	};

	//悬浮窗的状态颜色.
	var FWKG_color={
		loading:'#8B00E8',//读取中状态
		prefetcher:'#5564AF',//预读状态
		autopager:'#038B00',//翻页状态
		Apause:'#B7B700',//翻页状态(暂停).
		Astop:'#A00000',//翻页状态(停止)(翻页完成,或者被异常停止.)(无法再开启)
		dot:'#00FF05',//读取完后,会显示一个小点,那么小点的颜色.
	};

	//黑名单,在此网页上禁止加载..3个项.分别是:名字,启用,网站正则..
	var blackList=[
		['中关村首页',false,/^http:\/\/www\.zol\.com\.cn\/(?:#.*)?$/i],
		['Gmail',true,/mail\.google\.com/i],
		['Google reader',true,/google\.com\/reader\//i],
		['优酷视频播放页面',true,/http:\/\/v\.youku\.com\//i],
	];

	//在以下网站上允许在非顶层窗口上加载JS..比如猫扑之类的框架集网页.
	var DIExclude=[
		['猫扑帖子内容页面',true,/http:\/\/dzh\.mop\.com\/topic\/readSub/i],
		['水木社区帖子内容',true,/http:\/\/www\.newsmth\.net\/bbstcon/i],
	];

	//////////////////////////---------------规则-------////////////////
	//翻页所要的站点信息.
	//高级规则的一些默认设置..如果你不知道是什么..请务必不要修改(删除)它.此修改会影响到所有高级规则...
	var SITEINFO_D={
		enable:true							,//启用
		useiframe:false				,//(预读)是否使用iframe..
		viewcontent:false			,//查看预读的内容,显示在页面的最下方.
		autopager:{
			enable:true						,//启用自动翻页...
			manualA:false				,//手动翻页.
			useiframe:false			,//(翻页)是否使用iframe..
				iloaded:false			,//是否在iframe完全load后操作..否则在DOM完成后操作
				itimeout:0						,//延时多少毫秒后,在操作..
			remain:1							,//剩余页面的高度..是显示高度的 remain 倍开始翻页..
			maxpage:99						,//最多翻多少页..
			ipages:[false,2]			,//立即翻页,第一项是控制是否在js加载的时候立即翻第二项(必须小于maxpage)的页数,比如[true,3].就是说JS加载后.立即翻3页.
			separator:true				//显示翻页导航..(推荐显示.)
		}
	};

	//高优先级规则,第一个是教程.
	var SITEINFO=[
		{siteName:'google搜索',																																//站点名字...(可选)
			url:/^https?:\/\/\w{3,10}\.google(?:\.\w{1,4}){1,2}\/search/i,											//站点正则...(~~必须~~)
			//url:'wildc;http://www.google.com.hk/search*',
			siteExample:'http://www.google.com',																								//站点实例...(可选)
			enable:true,																																			//启用.(总开关)(可选)
			useiframe:false,																																		//是否用iframe预读...(可选)
			viewcontent:false,																																	//查看预读的内容,显示在页面的最下方.(可选)
			nextLink:'auto;',
			//nextLink:'//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',				//下一页链接 xpath 或者 CSS选择器 或者 函数返回值(此函数必须使用第一个传入的参数作为document对象) (~~必选~~)
			//nextLink:'css;table#nav>tbody>tr>td.b:last-child>a',
			//nextLink:function(D,W){return D.evaluate('//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',D,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;},
			preLink:'auto;',
			//preLink:'//table[@id="nav"]/descendant::a[1][parent::td[@class="b"]]',			//上一页链接 xpath 或者 CSS选择器 或者 函数返回值 (可选)
			autopager:{
				enable:true	,																								//启用(自动翻页)(可选)
				useiframe:false,																						//是否使用iframe翻页(可选)
					iloaded:false,																						//是否在iframe完全load之后操作..否则在DOM完成后操作.
					itimeout:0,																								//延时多少毫秒后,在操作..
				//pageElement:'//div[@id="ires"]',														//主体内容 xpath 或 CSS选择器 或函数返回值(~~必须~~)
				pageElement:'css;div#ires',
				//pageElement:function(doc,win){return doc.getElementById('ires')},
				//filter:'//li[@class="g"]',																		//(此项功能未完成)xpath 或 CSS选择器从匹配到的节点里面过滤掉符合的节点.
				remain:1/3,																									//剩余页面的高度..是显示高度的 remain 倍开始翻页(可选)
					relatedObj:['css;div#navcnt','bottom'],															//以这个元素当做最底的元素,计算页面总高度的计算.(可选)
				replaceE:'//div[@id="navcnt"]',															//需要替换的部分 xpat h或 CSS选择器 一般是页面的本来的翻页导航(可选);
				//replaceE:'css;div#navcnt',
				ipages:[false,3],																					//立即翻页,第一项是控制是否在js加载的时候立即翻第二项(必须小于maxpage)的页数,比如[true,3].就是说JS加载后.立即翻3页.(可选)
				separator:true,																							//是否显示翻页导航(可选)
				maxpage:66,																									//最多翻页数量(可选)
				manualA:false,																							//是否使用手动翻页.
				HT_insert:['//div[@id="res"]',2],														//插入方式此项为一个数组: [节点xpath或CSS选择器,插入方式(1：插入到给定节点之前;2：附加到给定节点的里面;)](可选);
				//HT_insert:['css;div#res',2],
			}
		},
		{siteName:'google图片',
			url:/^https?:\/\/\w{3,7}\.google(?:\.\w{1,4}){1,2}\/images/i,
			siteExample:'http://images.google.com',
			nextLink:'//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="res"]/div',
				replaceE:'//div[@id="navcnt"]',
			}
		},
		{siteName:'百度搜索',
			url:/^https?:\/\/www\.baidu\.com\/(?:s|baidu)\?/i,
			siteExample:'http://www.baidu.com',
			enable:false,
			nextLink:'//p[@id="page"]/a[text()="下一页"][@href]',
			//nextLink:'css;div.p>a:last-of-type',
			autopager:{
				pageElement:'//div[@id="wrapper"]/table[@id] | //div[@id="wrapper"]/table[@id]/following-sibling::br[1] | //p[@id="page"]',
				//pageElement:'css;div#wrapper>table[id],div#wrapper>table[id]+br,div.p',
				remain:1/3,
				HT_insert:['//div[@id="search"]',1],
				//HT_insert:['css;div#wrapper>table:last-of-type',1],
			}
		},
		{siteName:'百度mp3',
			url:/^http:\/\/mp3\.baidu\.com\/.+/i,
			siteExample:'http://mp3.baidu.com/m?tn=baidump3&ct=134217728&lm=0&f=1&word=%CB%C0%C9%F1',
			nextLink:'//div[@class="pg"]/a[(font/text()="下一页")]',
			autopager:{
				replaceE:'//div[@class="pg"]',
				pageElement:'//table[@id="Tbs"]',
			}
		},
		{siteName:'百度贴吧帖子列表页面',
			url:/^http:\/\/tieba\.baidu\.com\/f\?.*kw=/i,
			siteExample:'http://tieba.baidu.com/f?kw=opera&fr=tb0_search&ie=utf-8',
			nextLink:'//div[@id="pagebar"]/div[@class="pagination"]/a[text()="下一页"]',
			autopager:{
				pageElement:'//div[@id="thread_list"] | //div[@id="thread_list_foot"] | //div[@id="pagebar"]',
			}
		},
		{siteName:'百度贴吧俱乐部帖子列表内容页面',
			url:/^http:\/\/tieba\.baidu\.com\/club\/.+\/p\/.+/i,
			siteExample:'http://tieba.baidu.com/club/6883547/p/4047809',
			nextLink:'//div[@class="pagination"]/a[text()="下一页"]',
			autopager:{
				pageElement:'//div[@id="content"]',
			}
		},
		{siteName:'百度贴吧俱乐部帖子列表页面',
			url:/^http:\/\/tieba\.baidu\.com\/club\/.+(?!\/p\/)/i,
			siteExample:'http://tieba.baidu.com/club/6883547',
			nextLink:'//div[@class="pagination"]/a[text()="下一页"]',
			autopager:{
				pageElement:'//table[@id="thread_table"]',
			}
		},
		{siteName:'百度贴吧帖子内容页面',
			url:/^http:\/\/tieba\.baidu\.com\/f\?kz=\d+/i,
			siteExample:'http://tieba.baidu.com/f?kz=620671135',
			nextLink:'//li[@class="pagination"]/a[text()="下一页"]',
			autopager:{
				pageElement:'//div[@id="pb_content"]',
			}
		},
		{siteName:'万卷书库小说阅读页',
			url:/^http:\/\/www\.wanjuan\.net\/article\/.+html/i,
			useiframe:true,
			nextLink:'//div[@id="gotopage"]/descendant::a[text()="下一页"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="contentleft"]'
			}
		},
		{siteName:'万卷书屋小说阅读页',
			url:/^http:\/\/www\.wjxsw\.com\/html\/.+html/i,
			useiframe:true,
			nextLink:'//div[@id="LinkMenu"]/descendant::a[last()]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="TextTitle"] | //div[@id="BookText"]'
			}
		},
		{siteName:'起点小说阅读页',
			url:/^http:\/\/www\.qidian\.com\/BookReader\/\d+,\d+/i,
			siteExample:'http://www.qidian.com/BookReader/1545376,27301383.aspx',
			useiframe:true,
			nextLink:'//a[@id="NextLink"]',
			autopager:{
				enable:true,
				useiframe:true,
				pageElement:'//div[@id="maincontent"]/div[@class="booktitle"] | //div[@id="maincontent"]/div[@id="content"]'
			}
		},
		{siteName:'冰地小说阅读页',
			url:/^http:\/\/www\.bingdi\.com\/html\/book\/.+/i,
			siteExample:'http://www.bingdi.com/html/book/130/153935/4201826.shtm',
			useiframe:true,
			nextLink:'//div[@id="LinkMenu"]/descendant::a[last()][text()="翻下页"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="Content"]'
			}
		},
		{siteName:'opera官方网站帖子列表页面',
			url:/^http:\/\/bbs\.operachina\.com\/viewforum/i,
			siteExample:'http://bbs.operachina.com/viewforum.php?f=41',
			nextLink:'//div[starts-with(@class,"pagination")]/descendant::a[text()="下一页"]',
			autopager:{
				pageElement:'//div[@id="body"]/div[@class="topic block clear"]/table',
				replaceE:'//div[starts-with(@class,"pagination")]',
			}
		},
		{siteName:'opera官方网站帖子内容页面',
			url:/^http:\/\/bbs\.operachina\.com\/viewtopic/i,
			siteExample:'http://bbs.operachina.com/viewtopic',
			nextLink:'//div[starts-with(@class,"pagination")]/descendant::a[text()="下一页"]',
			autopager:{
				//pageElement:'//div[@id="page-body"]',
				pageElement:'//div[@id="body"]/div[starts-with(@class,"post")]',
				replaceE:'//div[starts-with(@class,"pagination")]'
			}
		},
		{siteName:'opera官方网站查看新帖帖子列表页面',
			url:/^http:\/\/bbs\.operachina\.com\/search/i,
			siteExample:'http://bbs.operachina.com/search.php?search_id=newposts',
			nextLink:'//li[contains(@class,"pagination")]/descendant::a[text()="下一页"]',
			autopager:{
				pageElement:'//div[@class="search block clear"]/table',
				replaceE:'//li[contains(@class,"pagination")]'
			}
		},
		{siteName:'深度论坛帖子内容页面',
			url:/http:\/\/bbs\.deepin\.org\/thread/i,
			siteExample:'http://bbs.deepin.org/thread',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'卡饭论坛帖子内容页面',
			url:/http:\/\/bbs\.kafan\.cn\/thread/i,
			siteExample:'http://bbs.kafan.cn/thread',
			nextLink:'//div[@class="pg"]/descendant::a[@class="nxt"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'卡饭论坛帖子列表页面',
			url:/http:\/\/bbs\.kafan\.cn\/forum/i,
			siteExample:'http://bbs.kafan.cn/forum-74-1.html',
			nextLink:'//div[@class="pg"]/descendant::a[@class="nxt"]',
			autopager:{
				pageElement:'//form[@id="moderate"]'
			}
		},
		{siteName:'远景论坛帖子内容页面',
			url:/http:\/\/bbs\.pcbeta\.com\/thread/i,
			siteExample:'http://bbs.pcbeta.com/thread',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'思源论坛帖子内容页面',
			url:/http:\/\/www\.missyuan\.com\/(?:view)?thread/i,
			siteExample:'http://www.missyuan.com/thread-431242-1-1.html',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				useiframe:true,
				replaceE:'//div[@class="pages_btns"]/div[@class="pages"]',
				pageElement:'//form[@name="modactions"]',
			}
		},
		{siteName:'思源论坛帖子列表页面',
			url:/http:\/\/www\.missyuan\.com\/forum/i,
			siteExample:'http://www.missyuan.com/forum-98-1.html',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				replaceE:'//div[@class="pages_btns"]/div[@class="pages"]',
				pageElement:'//form[@name="moderate"]/table[last()]',
			}
		},
		{siteName:'极点五笔帖子内容页面',
			url:/www\.wbfans\.com\/bbs\/viewthread\.php/i,
			siteExample:'http://www.wbfans.com/bbs/viewthread.php?tid=49308&extra=page%3D1',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				pageElement:'//div[@id="postlist"]',
				remain:1/2
			}
		},
		{siteName:'天极动漫频道新闻',
			url:/http:\/\/comic\.yesky\.com\/\d+\/.+\.shtml/i,
			siteExample:'http://comic.yesky.com/249/11335749_5.shtml',
			nextLink:'//div[@id="numpage"]/descendant::a[contains(text(),"下一页")]',
			autopager:{
				pageElement:'//div[@class="ArticleCnt"]',
				remain:1.4,
				replaceE:'//div[@id="numpage"]',
			}
		},
		{siteName:'赢政天下论坛帖子内容页面',
			url:/http:\/\/bbs\.winzheng\.com\/viewthread/i,
			siteExample:'http://bbs.winzheng.com/viewthread.php?tid=',
			nextLink:'//div[@class="forumcontrol"]/descendant::a[@class="next"]',
			autopager:{
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'soso网页搜索',
			url:/http:\/\/www\.soso\.com\/q/i,
			siteExample:'http://www.soso.com/q',
			nextLink:'//div[@id="page"]/descendant::a[last()][@class="next"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="s_main"]/table[1]',
				remain:1/2,
				replaceE:'//div[@id="page"]',
			}
		},
		{siteName:'bing网页搜索',
			url:/bing\.com\/search\?q=/i,
			siteExample:'bing.com/search?q=',
			nextLink:'//div[@id="results_container"]/descendant::a[last()][@class="sb_pagN"]',
			autopager:{
				pageElement:'//div[@id="results"] | //div[@id="results_container"]/div[@class="sb_pag"]',
			}
		},
		{siteName:'有道网页搜索',
			url:/http:\/\/www\.youdao\.com\/search\?/i,
			siteExample:'http://www.youdao.com/search?',
			useiframe:true,
			nextLink:'//div[@id="pagination"]/descendant::a[last()][@class="next-page"]',
			autopager:{
				pageElement:'//ul[@id="results"] | //div[@id="pagination"]',
				HT_insert:['//form[@id="bs"]',1]
			}
		},
		{siteName:'爱漫画',
			url:/^http:\/\/www\.imanhua\.com\/comic\/.+/i,
			siteExample:'http://www.imanhua.com/comic/55/list_39448.html',
			useiframe:true,
			preLink:{
				startAfter:'?p=',
				inc:-1,
				min:1,
			},
			nextLink:{
				startAfter:'?p=',
				mFails:[/http:\/\/www\.imanhua\.com\/comic\/.+\.html/i,'?p=1'],
				inc:1,
				isLast:function(doc,win,lhref){
					var s2=doc.getElementById('s2');
					if(s2){
						var s2os=s2.options
						var s2osl=s2os.length;
						//alert(s2.selectedIndex);
						if(s2.selectedIndex==s2osl-1)return true;
					};
				},
			},
			autopager:{
				useiframe:true,
				pageElement:'//body/table[@class="tbCenter"][1]',
			}
		},
		{siteName:'煎蛋首页',
			url:/http:\/\/jandan\.net\/(?:page)?/i,
			siteExample:'http://jandan.net/',
			useiframe:true,
			nextLink:'//div[@class="wp-pagenavi"]/child::a[text()=">>"]',
			autopager:{
				pageElement:'//div[@id="body"]'
			}
		},
		{siteName:'中国教程网论坛帖子内容页面',
			url:/http:\/\/bbs\.jcwcn\.com\/thread/i,
			siteExample:'http://bbs.jcwcn.com/thread',
			nextLink:'//div[@class="pages"]/descendant::a[@class="next"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'kuku动漫',
			url:/http:\/\/comic\.kukudm\.com\/comiclist\/\d+\/\d+.*\.htm/i,
			siteExample:'http://comic.kukudm.com/comiclist/4/17099/3.htm',
			useiframe:true,
			nextLink:'//a[img[contains(@src,"images/d.gif")]]',
			autopager:{
				useiframe:true,
				pageElement:'//body/table[2]'
			}
		},
		{siteName:'EZ游戏社区帖子内容页面',
			url:/http:\/\/bbs\.emu-zone\.org\/newbbs\/thread/i,
			siteExample:'http://bbs.emu-zone.org/newbbs/thread',
			nextLink:'//div[@class="p_bar"]/a[contains(text(),"››")]',
			autopager:{
				pageElement:'//form[@name="delpost"]'
			}
		},
		{siteName:'mozest社区帖子内容页面',
			url:/^https?:\/\/g\.mozest\.com\/thread/i,
			siteExample:'https://board.mozest.com/thread-34726-1-1',
			nextLink:'//div[@class="pages"]/a[@class="next"]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]'
			}
		},
		{siteName:'mozest社区帖子列表页面',
			url:/^http:\/\/g\.mozest\.com\/forum/i,
			siteExample:'http://board.mozest.com/forum-50-1',
			nextLink:'//div[@class="pages"]/a[@class="next"]',
			autopager:{
				pageElement:'//div[@id="threadlist"]'
			}
		},
		{siteName:'海贼王中文网漫画页',
			url:/http:\/\/op\.52pk\.com\/manhua\/\d+\/\d+/i,
			siteExample:'http://op.52pk.com/manhua/2010/921364.html',
			nextLink:'//li[@id="page__next"]/a[1]',
			autopager:{
				relatedObj:['css;li#page__select','bottom'],
				pageElement:'//div[@id="pictureContent"]'
			}
		},
		{siteName:'死神中文网漫画页',
			url:/http:\/\/sishen\.52pk\.com\/manhua\/\d+\/\d+/i,
			siteExample:'http://sishen.52pk.com/manhua/2010/927406.html',
			nextLink:'//li[@id="page__next"]/a[1]',
			autopager:{
				relatedObj:['css;li#page__select','bottom'],
				pageElement:'//div[@id="pictureContent"]'
			}
		},
		{siteName:'火影中文网漫画页',
			url:/http:\/\/narutocn\.52pk\.com\/manhua\/\d+\/\d+/i,
			siteExample:'http://narutocn.52pk.com/manhua/2010/921439.html',
			//nextLink:'css;li#page__next>a:first-child',
			nextLink:'//li[@id="page__next"]/a[1]',
			autopager:{
				//pageElement:'//div[@id="pictureContent"]'
				pageElement:'css;div#pictureContent'
			}
		},
		{siteName:'塞班智能手机论坛帖子列表页面',
			url:/http:\/\/bbs\.dospy\.com\/forum/i,
			siteExample:'http://bbs.dospy.com/forum-354-1.html',
			nextLink:'//div[@class="p_bar"]/a[@class="p_curpage"]/following-sibling::a[@class="p_num"]',
			autopager:{
				pageElement:'//form[@name="moderate"]'
			}
		},
		{siteName:'塞班智能手机论坛帖子内容页面',
			url:/http:\/\/bbs\.dospy\.com\/thread/i,
			siteExample:'http://bbs.dospy.com/thread-672836-1-52-1.html',
			nextLink:'//div[@class="p_bar"]/a[@class="p_curpage"]/following-sibling::a[@class="p_num"]',
			autopager:{
				pageElement:'//form[@name="delpost"]'
			}
		},
		{siteName:'新华网新闻页面',
			url:/http:\/\/news\.xinhuanet\.com\/.+\/\d+-/i,
			siteExample:'http://news.xinhuanet.com/politics/2010-07/19/c_12347755.htm',
			nextLink:'//div[@id="div_currpage"]/a[text()="下一页"]',
			autopager:{
				remain:2,
				pageElement:'//table[@id="myTable"]'
			}
		},
		{siteName:'中关村在线新闻页面',
			url:/http:\/\/(?:[^\.]+\.)?zol.com.cn\/\d+\/\d+/i,
			siteExample:'http://lcd.zol.com.cn/187/1875145.html',
			nextLink:'//a[text()="下一页>"][@href]',
			autopager:{
				remain:2,
				pageElement:'//div[@id="cotent_idd"]'
			}
		},
		{siteName:'天涯论坛帖子内容页面',
			url:/http:\/\/www\.tianya\.cn\/.+\/content\/.+/i,
			siteExample:'http://www.tianya.cn/publicforum/content/2010expo/4eddfdeea800b3957fd4781ff6004bc3/1/0/1.shtml',
			nextLink:'//*[@id="pageDivTop" or @class="pages"]/descendant::a[text()="下一页"][@href]',
			autopager:{
				pageElement:'//div[@id="pContentDiv"]'
			}
		},
		{siteName:'色影无忌帖子内容页面',
			url:/http:\/\/forum\.xitek\.com\/showthread/i,
			siteExample:'http://forum.xitek.com/showthread.php?threadid=571986',
			nextLink:'//font[@size="2"]/font[@class="thtcolor"]/following-sibling::a[@href]',
			autopager:{
				pageElement:'//body/table[position()>2 and position()<(last()-2)]',
			}
		},
		{siteName:'梦想文学',
			url:/^http:\/\/www\.mx99\.com\/html\/book\/.+html/i,
			useiframe:true,
			nextLink:'//div[@id="thumb"]/a[4]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="content" and @class="fonts_mesne"]'
			}
		},
		{siteName:'招聘区,杭州19楼,帖子内容',
			url:/^http:\/\/www\.19lou\.com\/forum.*thread/i,
			siteExample:'http://www.19lou.com/forum-1502-thread-29762777-1-1.html',
			nextLink:'//div[@class="pages"]/descendant::a[text()="下一页"][@href]',
			useiframe:true,
			autopager:{
				useiframe:true,
				pageElement:'//div[@class="layout"]/form[@name="modactions"]'
			}
		},
		{siteName:'招聘区,杭州19楼,帖子列表',
			url:/^http:\/\/www\.19lou\.com\/forum/i,
			siteExample:'http://www.19lou.com/forum-1500-1.html',
			nextLink:'//div[@class="pages"]/descendant::a[text()="下一页"][@href]',
			autopager:{
				pageElement:'//div[@id="forum_nav"]/following-sibling::form'
			}
		},
		{siteName:'汽车之家论坛帖子内容',
			url:/^http:\/\/club\.autohome\.com\.cn\/bbs\/thread/i,
			siteExample:'http://club.autohome.com.cn/bbs/thread-a-100019-7383135-1.html',
			nextLink:'//div[@class="pages"]/a[@title="下1页"][@href]',
			autopager:{
				pageElement:'//body/div[@id="divTopic" or contains(@class,"viewthread")]'
			}
		},
		{siteName:'爱卡汽车论坛帖子内容',
			url:/^http:\/\/www\.xcar\.com\.cn\/bbs\/viewthread/i,
			siteExample:'http://www.xcar.com.cn/bbs/viewthread.php?tid=12474760',
			nextLink:'//a[text()="下一页＞"][@href]',
			autopager:{
				pageElement:'//form[@id="delpost"]',
			}
		},
		{siteName:'猫扑大杂烩帖子内容',
			url:/http:\/\/dzh\.mop\.com\/topic\/readSub/i,
			nextLink:'//a[contains(text(),"下一页")][@href]',
			autopager:{
				pageElement:'//div[@class="huitie"]',
			}
		},
		{siteName:'水木社区帖子内容页面',
			url:/http:\/\/www\.newsmth\.net\/bbstcon/i,
			nextLink:'//a[text()="下一页"][@href]',
			useiframe:true,
			autopager:{
				useiframe:true,
				pageElement:'//body/*',
			}
		},
		{siteName:'VeryCD搜索页面',
			url:/http:\/\/www\.verycd\.com\/search\/folders.+/i,
			siteExample:'http://www.verycd.com/search/folders/opera',
			nextLink:'//div[@class="pages-nav"]/a[contains(text(),"下一页")][@href]',
			autopager:{
				pageElement:'//table[@id="results-container"]',
			}
		},
		{siteName:'照片处理网',
			url:/http:\/\/www\.photops\.com\/Article\/.+/i,
			siteExample:'http://www.photops.com/Article/xsjc/20100728172116.html',
			nextLink:'//a[text()="下一页"][@href]',
			autopager:{
				pageElement:'//body/table[last()-2]',
				useiframe:true,
			}
		},
		{siteName:'178在线漫画',
			url:/http:\/\/manhua\.178\.com\/.+\/.+\/.+/i,
			siteExample:'http://manhua.178.com/h/haizeiwang/10062.shtml',
			nextLink:'//div[@class="pages"]/a[text()="下一页"][@href]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="inner_img"]/img[1]',
			}
		},
		{siteName:'sosg论坛帖子内容',
			url:/http:\/\/www\.sosg\.net\/read/i,
			siteExample:'http://www.sosg.net/read.php?tid=424833',
			nextLink:'//td[@align="left"]/b/following-sibling::a[@href]',
			autopager:{
				pageElement:'//div[@id="b5"]/form/a/table[1]',
			}
		},
		{siteName:'flickr搜索',
			url:/http:\/\/www\.flickr\.com\/search\/\?q=/i,
			siteExample:'http://www.flickr.com/search/?q=opera',
			nextLink:'//div[@class="Paginator"]/a[@class="Next"][@href]',
			autopager:{
				pageElement:'//div[@id="ResultsThumbsDiv"]',
				replaceE:'//div[@class="Paginator"]',
			}
		},
		{siteName:'搜狗浏览器论坛帖子页面',
			url:/http:\/\/ie\.sogou\.com\/bbs\/forumdisplay\.php/i,
			siteExample:'http://ie.sogou.com/bbs/forumdisplay.php?fid=2',
			nextLink:'//div[@class="pages"]/a[@class="next"][@href]',
			autopager:{
				pageElement:'//div[@id="threadlist"]',
				replaceE:'//div[@class="pages"]',
			}
		},
		{siteName:'搜狗浏览器论坛帖子内容页面',
			url:/http:\/\/ie\.sogou\.com\/bbs\/viewthread\.php/i,
			siteExample:'http://ie.sogou.com/bbs/viewthread.php?tid=203223&extra=page%3D1',
			nextLink:'//div[@class="pages"]/a[@class="next"][@href]',
			autopager:{
				useiframe:true,
				pageElement:'//div[@id="postlist"]',
				replaceE:'//div[@class="pages"]',
			}
		},
		{siteName:'小说梦阅读页',
			url:/http:\/\/www\.xiaoshuomeng\.com\/book\/.+\/zhangjie\/.+/i,
			siteExample:'http://www.xiaoshuomeng.com/book/3967/zhangjie/1/',
			nextLink:'//a[text()="下一章"][@href]',
			autopager:{
				pageElement:'//div[@class="main"]',
				useiframe:true,
					iloaded:true,
				itimeout:0,
			}
		},
		{siteName:'有妖气漫画阅读页',
			url:/http:\/\/www\.u17\.com\/comic_show\/.+/i,
			siteExample:'http://www.u17.com/comic_show/c28540_m0.html',
			nextLink:function(D){
				var input=D.evaluate('//input[@class="btn_next_page"]',D,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
				//alert(input.getAttribute('onclick').match(/location.href='(.*)'/i)[1]);
				return input.getAttribute('onclick').match(/location.href='(.*)'/i)[1];
			},
			autopager:{
				pageElement:'//div[@class="comic_read_img"]',
				useiframe:true,
			}
		},
		{siteName:'火影忍者中文网',
			url:/http:\/\/www\.narutom\.com\/comic\/.+/i,
			siteExample:'http://www.narutom.com/comic/11624.html?p=3',
			preLink:{
				startAfter:'?p=',
				inc:-1,
				min:1,
			},
			nextLink:{
				startAfter:'?p=',
				mFails:[/http:\/\/www\.narutom\.com\/comic\/.+\.html/i,'?p=1'],
				inc:1,
				isLast:function(doc,win,lhref){
					var topSelect=doc.getElementById('topSelect');
					if(topSelect){
						var s2os=topSelect.options
						var s2osl=s2os.length;
						if(topSelect.selectedIndex==s2osl-1)return true;
					};
				},
			},
			autopager:{
				pageElement:'//img[@id="showImg"]',
				useiframe:true,
			}
		},
		{siteName:'死神中文网',
			url:/http:\/\/(?:\w+\.)?bleachcn\.net\/manhua\/.+/i,
			siteExample:'http://naruto.bleachcn.net/manhua/6759.html',
			nextLink:'//div[@id="comic_pages"]/a[text()="下一页"][@href]',
			autopager:{
				pageElement:'//div[@id="comic_endtext"]',
			}
		},
		{siteName:'Mozilla Firefox中文社区帖子列表页面',
			url:/http:\/\/www\.firefox\.net\.cn\/forum\/viewforum/i,
			siteExample:'http://www.firefox.net.cn/forum/viewforum.php?f=4',
			nextLink:'auto;',
			autopager:{
				pageElement:'//div[@id="container"]//b[@class="gensmall"][last()]/following-sibling::table',
			}
		},
		{siteName:'Mozilla Firefox中文社区帖子内容页面',
			url:/http:\/\/www\.firefox\.net\.cn\/forum\/viewtopic/i,
			siteExample:'http://www.firefox.net.cn/forum/viewtopic.php?t=34339',
			nextLink:'auto;',
			autopager:{
				pageElement:'//div[@id="container"]/table[@class="forumline"]',
			}
		},
		{siteName:'文学迷小说阅读网,小说阅读页面',
			url:/^http:\/\/www\.wenxuemi\.com\/files\/article\/html\/.+\.html/i,
			siteExample:'http://www.wenxuemi.com/files/article/html/34/34307/3502012.html',
			nextLink:'auto;',
			autopager:{
				pageElement:'css;#content',
			}
		},
		{siteName:'verycd分类资源页',
			url:/^http:\/\/www\.verycd\.com\/sto\/.+/i,
			siteExample:'http://www.verycd.com/sto/teleplay/',
			nextLink:'auto;',
			autopager:{
				useiframe:true,
					iloaded:false,
				pageElement:'css;#content',
			}
		},
		{siteName:'deviantart',
			url:/^http:\/\/browse\.deviantart\.com\//i,
			siteExample:'http://browse.deviantart.com/?order=24&offset=0',
			nextLink:'auto;',
			autopager:{
				pageElement:'css;#output div.browse2:first-child',
			}
		},
		{siteName:'PCHOME 社区帖子内容页面',
			url:/http:\/\/club\.pchome\.net\/thread_/i,
			siteExample:'http://club.pchome.net/thread_1_15_6009928__.html',
			nextLink:'auto;',
			autopager:{
				pageElement:'css;div.item',
			},
		},
	];


	//统配规则..用来灭掉一些DZ.或者phpwind论坛系统..此组规则..优先级自动降为最低..
	var SITEINFO_TP=[
		{siteName:'Discuz论坛帖子列表页面',
			url:/^https?:\/\/[^\/]+\/(?:bbs\/)?(?:(?:forum)|(?:showforum)|(?:viewforum))+/i,
			preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
			nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
			autopager:{
				useiframe:true,
					iloaded:false,
				pageElement:'//form[@method="post"][@name] | //div[@id="postlist"]',
			}
		},
		{siteName:'Discuz论坛帖子内容页面',
			url:/^https?:\/\/[^\/]+\/(?:bbs\/)?(?:(?:thread)|(?:viewthread)|(?:showtopic)|(?:viewtopic))+/i,
			preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
			nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
			autopager:{
				useiframe:true,
					iloaded:false,
				pageElement:'//div[@id="postlist"]',
			}
		},
		{siteName:'phpWind论坛帖子列表页面',
			url:/^https?:\/\/[^\/]+\/(?:bbs\/)?thread/i,
			preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
			nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)]',
			autopager:{
				pageElement:'//div[@class="t z"] | //div[@class="z"]',
			}
		},
		{siteName:'phpWind论坛帖子内容页面',
			url:/^https?:\/\/[^\/]+\/(?:bbs\/)?read/i,
			preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
			nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)]',
			autopager:{
				pageElement:'//div[@class="t5"] | //div[@class="read_t"]',
			}
		},
	];

	//兼容 oautopager的规则放在这里,此规则组..优先级最低(比统配规则还低)..
	//所以说尽量不要放规则在这个组里面.
	var SITEINFO_comp=[
	];


	//---------------------------------------------------------------------------------------
	//当没有找到规则的时候,进入自动搜索模式.
	//在没有高级规则的网站上.的一些设置..
	var autoMatch={
		keyMatch:true														,//是否启用关键字匹配
				cases:false												,//关键字区分大小写....
				digitalCheck:true										,//对数字连接进行检测,从中找出下一页的链接
				pfwordl:{//关键字前面的字符限定.
					previous:{//上一页关键字前面的字符,例如 "上一页" 要匹配 "[上一页" ,那么prefix要的设置要不小于1,并且character要包含字符 "["
						enable:true,
						maxPrefix:3,
						character:[' ','　','[','［','<','＜','‹','«','<<','『','「','【','(','←']
					},
					next:{//下一页关键字前面的字符
						enable:true,
						maxPrefix:2,
						character:[' ','　','[','［','『','「','【','(']
					}
				},
				sfwordl:{//关键字后面的字符限定.
					previous:{//上一页关键字后面的字符
						enable:true,
						maxSubfix:2,
						character:[' ','　',']','］','』','」','】',')']
					},
					next:{//下一页关键字后面的字符
						enable:true,
						maxSubfix:3,
						character:[' ','　',']','］','>','﹥','›','»','>>','』','」','】',')','→']
					}
				},
		useiframe:false												,//(预读)是否使用iframe..
		viewcontent:false											,//查看预读的内容,显示在页面的最下方.
		FA:{//强制拼接 选项 功能设置.
			enable:false									,//默认启用 强制拼接
			manualA:false								,//手动翻页.
			useiframe:false							,//(翻页)是否使用iframe..
				iloaded:false								,//(只在opera有效)如果使用iframe翻页..是否在iframe完全load后操作..否则在DOM完成后操作
				itimeout:0										,//当使用iframe翻页时在完成后继续等待多少毫秒后,在操作..
			remain:1											,//剩余页面的高度..是显示高度的 remain 倍开始翻页..
			maxpage:99										,//最多翻多少页..
			ipages:[false,2]							,//立即翻页,第一项是控制是否在js加载的时候立即翻第二项(必须小于maxpage)的页数,比如[true,3].就是说JS加载后.立即翻3页.
			separator:true								,//显示翻页导航..(推荐显示.)..
		}
	};

	//上一页关键字
	var prePageKey=[
			'上一页',
			'上一頁',
			'上1页',
			'上1頁',
			'上页',
			'上頁',
			'翻上頁',
			'翻上页',
			'上一张',
			'上一張',
			'上一幅',
			'上一章',
			'上一节',
			'上一節',
			'上一篇',
			'前一页',
			'前一頁',
			'后退',
			'後退',
			'上篇',
			'previous',
			'previous Page',
			'前へ'
	];


////====================================================///

	//下一页关键字
	var nextPageKey=[
			'下一页',
			'下一頁',
			'下1页',
			'下1頁',
			'下页',
			'下頁',
			'翻页',
			'翻頁',
			'翻下頁',
			'翻下页',
			'下一张',
			'下一張',
			'下一幅',
			'下一章',
			'下一节',
			'下一節',
			'下一篇',
			'后一页',
			'後一頁',
			'前进',
			'下篇',
			'后页',
			'往后',
			'Next',
			'Next Page',
			'次へ'
	];




	//------------------------下面的不要管他-----------------
	///////////////////////////////////////////////////////////////////
	//.浏览器检测.开始.
	var UA=navigator.userAgent.toLowerCase();
	var browser={
		opera:false,
		chrome:false,
		firefox:false,
		name:'unknown',
		getBrowserName:function(){
			var self=this;
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
		browser.chrome=true;
	};
	browser.getBrowserName();
	//alert(browser.name);
	if(browser.name=='unknown')return;
	//.浏览器检测.结束

	var superPreloader={
		prefs:prefs,
		sep_icons:sep_icons,
		FWKG_color:FWKG_color,
		blackList:blackList,
		DIExclude:DIExclude,
		SITEINFO_D:SITEINFO_D,
		SITEINFO:SITEINFO,
		SITEINFO_TP:SITEINFO_TP,
		SITEINFO_comp:SITEINFO_comp,
		autoMatch:autoMatch,
		prePageKey:prePageKey,
		nextPageKey:nextPageKey,
	};


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


	var JSONString=xToString(superPreloader);
	var postString='superPreloader.db'+JSONString;

	function postData(){
		window.postMessage(postString,'*');
	};

	postData();
	window.addEventListener('message',function(e){
		var data=e.data;
		switch(data){
			case 'fromeSuperPreloader.post':{
				postData();
			}break;
			case 'fromeSuperPreloader.remove':{
				//alert('remove');
				window.removeEventListener('message',arguments.callee,false);//释放闭包.
			}break;
			default:break;
		};
	},false);

})();

