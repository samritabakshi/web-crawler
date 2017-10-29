var request = require('request');
var cheerio = require ('cheerio');
var URL = require ('url-parse');
var http = require('http');
var _progress = require('cli-progress');
var e = {};
var startUrl,searchWord,maxPagesToVisit;
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url,baseUrl;
var foundWords =[];
var promises = [];
var bar ;

e.init = function(_startUrl, _searchWord, _maxPagesToVisit){
     startUrl = _startUrl;
     searchWord = _searchWord;
     maxPagesToVisit = _maxPagesToVisit ? _maxPagesToVisit : 10;
     url = new URL (startUrl);
     baseUrl = url.protocol + "//" + url.hostname;
     pagesToVisit.push(startUrl);
      bar = new _progress.Bar({
        format: 'progress [{bar}] {percentage}% |  {value}/{total} '
    });
}

var i = 0;

e.startCrawling = function() {
    process(startUrl)
    bar.start(maxPagesToVisit-1,0)
}

var fetch = function (_url) {
    //console.log('Processing', _url);
    return new Promise(function (resolve, reject) {
        request(_url, function (err, res, body) {
            if (err) {
                resolve(err);
           } else if (res.statusCode !== 200) {
               err = new Error("Unexpected status code: " + res.statusCode);
               err.res = res;
                resolve(err);
           }
             resolve(body);
        });
    });
};

function process (_url){
    fetch(_url).then(function (body) {
        $ = cheerio.load(body);
        var bodyText = $('html > body').text().toLowerCase();
        return [bodyText.indexOf(searchWord.toLowerCase()) !== -1 , $];
    })
    .then(result => {
        if(result[0]){
            var found = {
                word : searchWord,
                pageUrl : _url
            };
        foundWords.push(found);
        }
        return result[1]    
    })
    .then($ => {
        var relativeLinks = $("a[href^='/']");
        relativeLinks.each(function(){
            if(pagesToVisit.indexOf(baseUrl + $(this).attr('href')) == -1 && numPagesVisited < maxPagesToVisit)
               pagesToVisit.push(baseUrl + $(this).attr('href'))
        });
        return ;
    })
    .then(() => {
        //  console.log("hey",foundWords);
         if (++i < pagesToVisit.length && i < maxPagesToVisit) {
            pagesVisited[pagesToVisit[i]] = true;
            numPagesVisited++;
            bar.update(i)
            process(pagesToVisit[i]);
         }
         else {
            bar.stop();
            showResults();
        }
    }) 
    .catch(err => {
        throw err;
    });
}

function showResults(){
    console.log("------ Results for word :" + searchWord + " ----------")
    foundWords.forEach((el,index) => {
        console.log(index+1 + " Found at : " + el.pageUrl)
    })
}

module.exports = e;
