var request = require('request');
var cheerio = require ('cheerio');
var URL = require ('url-parse');
var http = require('http');
var _progress = require('cli-progress');
var e = {};
var dict = require('./crawlerDictionary').crawlerDictionary;
var url,baseUrl;
var foundWords =[];
var promises = [];
var bar ;

e.init = function(_startUrl, _searchWord, _maxPagesToVisit){
     dict.startUrl = _startUrl;
     dict.searchWord = _searchWord;
     dict.maxPagesToVisit = _maxPagesToVisit ? _maxPagesToVisit : 10;
     url = new URL (dict.startUrl);
     baseUrl = url.protocol + "//" + url.hostname;
     dict.pagesToVisit.push(dict.startUrl);
     manageProgressBar('initialise');     
}

function manageProgressBar(_state){
    switch (_state){
        case "initialise":
            bar = new _progress.Bar({
                format: 'progress [{bar}] {percentage}% |  {value}/{total} '
            });
            break;
        case "start":
             bar.start(dict.maxPagesToVisit-1,0);
            break;
        case "update":
             bar.update(dict.i);
            break;
        case "stop" :
            bar.stop();
            break;
    }
        
}

e.startCrawling = function() {
    process(dict.startUrl)
    manageProgressBar('start');   
}

var fetch = function (_url) {
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

function parseBody (_body){
    $ = cheerio.load(_body);
    var bodyText = $('html > body').text().toLowerCase();
    return [bodyText.indexOf(dict.searchWord.toLowerCase()) !== -1 , $];
}

function checkForWord(_result,_url){
    if(_result[0]){
        var found = {
            word : dict.searchWord,
            pageUrl : _url
        };
    foundWords.push(found);
    }
    return _result[1]   
}
function searchRelativeLinksOnPage($){
    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function(){
        if(checkForPageToBeVisited() && valueLessThanMaxPagesToVisit(dict.numPagesVisited))
           dict.pagesToVisit.push(baseUrl + $(this).attr('href'))
    });
    return ;
}

function updatePageVisited(){
    if (++dict.i < dict.pagesToVisit.length && valueLessThanMaxPagesToVisit(dict.i)) {
        dict.pagesVisited[dict.pagesToVisit[dict.i]] = true;
        dict.numPagesVisited++;
        process(dict.pagesToVisit[dict.i]);
        manageProgressBar('update')
     }
     else {
        manageProgressBar('stop');
        showResults();
    }
}

function valueLessThanMaxPagesToVisit(_value){
    return _value < dict.maxPagesToVisit ? true : false
}

function process (_url){
    fetch(_url).then(function (body) {
       return parseBody(body);       
    })
    .then(result => {
         return checkForWord(result,_url) ;
    })
    .then($ => {
        return searchRelativeLinksOnPage($);
    })
    .then(() =>{
        updatePageVisited();
    }) 
    .catch(err => {
        throw err;
    });
}
function checkForPageToBeVisited(){
    return dict.pagesToVisit.indexOf(baseUrl + $(this).attr('href')) == -1 ;
}
function showResults(){
    console.log("");
    console.log("********** Results for word :" + dict.searchWord + " ************")
    if(!foundWords.length)
        console.log("No Match Found !")
    else 
        foundWords.forEach((el,index) => {
            console.log(index+1 + " Found at : " + el.pageUrl)
        })
}

module.exports = e;
