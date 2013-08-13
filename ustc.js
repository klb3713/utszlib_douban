// ==UserScript==
// @name          深圳大学城图书馆
// @namespace     com.douban.book
// @version	  1.0
// @include       http://book.douban.com/subject/*
// @exclude       http://movie.douban.com/
// @exclude       http://music.douban.com/
// @exclude       http://book.douban.com/
// @exclude       http://www.douban.com/*
// @exclude       http://9.douban.com/*
// @exclude       http://*.douban.com/subject/*/edit
// @exclude       http://*.douban.com/subject/*/update_image
// @exclude       http://*.douban.com/subject/*/edit?mine
// @exclude       http://*.douban.com/subject/*/new_version
// @exclude       http://*.douban.com/subject/*/offers
// @exclude       http://*.douban.com/subject/*/new_offer
// @exclude       http://*.douban.com/subject/offer/*/
// @exclude       http://*.douban.com/subject/*/cinema?view=ticket
// @exclude       http://*.douban.com/subject/*/doulists
// @exclude       http://*.douban.com/subject/*/all_photos
// @exclude       http://*.douban.com/subject/*/mupload
// @exclude       http://*.douban.com/subject/*/comments
// @exclude       http://*.douban.com/subject/*/reviews
// @exclude       http://*.douban.com/subject/*/new_review
// @exclude       http://*.douban.com/subject/*/group_collectors
// @exclude       http://*.douban.com/subject/*/discussion/
// @exclude       http://*.douban.com/subject/*/wishes
// @exclude       http://*.douban.com/subject/*/doings
// @exclude       http://*.douban.com/subject/*/collections
// ==/UserScript==
  
function extractBookInfo (htmlstr) {
    var books = [];
    var results_table = $(htmlstr.match(/<tbody>[\s\S]+<\/tbody>/)[0]);
    var results = results_table.find("span a");
    results.each(function(){
        book={};
        detail_url = $(this).attr("href");
        book.url = detail_url;
        book.title = $(this).text();
        htmlobj=$.ajax({url:detail_url, async:false});
        var count = htmlobj.responseText.match(/入藏/g);
        book.accessible = count ? count.length:0;
        books.push(book);
    });
    return books;
}

function setInfo(books){
    var tempstr = '<b class="pl" style="padding-left:5px;">馆藏数:{{=totalcount }}</b>';
    var WRAPPER_TMPL =  '<div class="gray_ad">'+
    '<h2><a href="http://lib.utsz.edu.cn/" target="_blank">深圳大学城图书馆藏书››</a></h2>' +
    '<ul class="bs"><li class="msg" style="display:none;color:#333;">' +
    '图书馆还没有此书，您可以考虑<a target="_blank" href="http://lib.utsz.edu.cn/news/2009-06-04/34_1244077455819.shtml">荐购一本</a>,'+
    '<br>或者<a href="http://lib.utsz.edu.cn/">去看看</a>其它有趣的书</li></ul>'+
    '</div>',
        ITEM_TMPL_RELATED = '<li><a target="_blank" href="{{=url }}">{{=title }}</a><b class="pl" style="padding-left:5px;">可借数:{{=accessible }}</b></li>'; 

    var element = $(WRAPPER_TMPL);
    var cnt=0;
    list = element.find("ul");
    $.each(books, function (idx, value) {
        var item=$(ITEM_TMPL_RELATED.replace("{{=url }}",value.url)
               .replace("{{=title }}",value.title)
               //.replace("{{=totalcount }}", value.totalcount)
               .replace("{{=accessible }}",value.accessible));
        if (!value.related){
            item.css('font-weight','bold');
        }
        element.find("ul").append(item);
        cnt=cnt+1;
        });
    $(".aside").prepend(element);
    if (!cnt)
        element.find(".msg").show();
}

function init(){
	var subjectIsbn = document.getElementById("info").textContent;
	subjectIsbn = subjectIsbn.match(/ISBN: [0-9]+/)[0];
	subjectIsbn = subjectIsbn.match(/[0-9]+/)[0];
	var bookname = $("h1:first span").text();
    bookname = $URL.encode(bookname);
    //var matchUrl = "http://219.223.211.37/searchresult.aspx?title="+bookname+"&isbn_f="+subjectIsbn+"&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL&st=2";
    var matchUrl = "http://219.223.211.37/searchresult.aspx?title_f="+bookname+"&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL&st=2";

    $.get(matchUrl,function(data,status){
        if(status == "success"){
            if(data.indexOf("searchnotfound")==-1){
                books = extractBookInfo(data);
                //alert(books);
                setInfo(books);
            }
            else{
                setInfo([]);
            }
        }
    });
}

init();