(this["webpackJsonpcoral-dex"]=this["webpackJsonpcoral-dex"]||[]).push([[0],{536:function(t,e,r){"use strict";r.r(e),r.d(e,"createSwipeBackGesture",(function(){return c}));var n=r(34),a=(r(60),r(116)),c=function(t,e,r,c,i){var o=t.ownerDocument.defaultView;return Object(a.createGesture)({el:t,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:function(t){return t.startX<=50&&e()},onStart:r,onMove:function(t){var e=t.deltaX/o.innerWidth;c(e)},onEnd:function(t){var e=t.deltaX,r=o.innerWidth,a=e/r,c=t.velocityX,u=r/2,s=c>=0&&(c>.2||t.deltaX>u),d=(s?1-a:a)*r,h=0;if(d>5){var l=d/Math.abs(c);h=Math.min(l,540)}i(s,a<=0?.01:Object(n.c)(0,a,.9999),h)}})}}}]);