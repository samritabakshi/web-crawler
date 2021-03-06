var request = require('request');
var cheerio = require ('cheerio');
var URL = require ('url-parse');
var http = require('http');
var _progress = require('cli-progress');

var dict = require('./crawlerDictionary').crawlerDictionary;
var e = {};
var url,baseUrl;
var foundWords =[];
var promises = [];
var bar ;

//-----------------Initialise Dictionary and Local Variables -----------------------------
e.init = function(_startUrl, _searchWord, _maxPagesToVisit){
     dict.startUrl = _startUrl;
     dict.searchWord = _searchWord;
     dict.maxPagesToVisit = _maxPagesToVisit ? _maxPagesToVisit : 10;
     url = new URL (dict.startUrl);
     baseUrl = url.protocol + "//" + url.hostname;
     dict.pagesToVisit.push(dict.startUrl);
     manageProgressBar('initialise');     
}


//-------------------Performs Actions on Progress Bar -------------------------------------
function manageProgressBar(_state){
    switch (_state){
        case "initialise":
            console.log("");
            bar = new _progress.Bar({
                format: 'progress [{bar}] {percentage}% |  {value}/{total} '
            });
            break;
        case "start":
             bar.start(dict.maxPagesToVisit,0);
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
    manageProgressBar('start');   
    process(dict.startUrl) 
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
// --------------------Returns Body text of the given URL --------------------
function fetch (_url) {
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

//---------------------- Parses body of URL --------------------
function parseBody (_body){
    $ = cheerio.load(_body);
    var bodyText = $('html > body').text().toLowerCase();
    return [searchWordIndexExists(bodyText), $];
}

function searchWordIndexExists(_bodyText){
    return _bodyText.indexOf(dict.searchWord.toLowerCase()) !== -1 ;
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

//-------------------- Searches for other relative links on the page-------------------
function searchRelativeLinksOnPage($){
    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function(){
        if(checkForPageToBeVisited() && valueLessThanMaxPagesToVisit(dict.numPagesVisited))
           dict.pagesToVisit.push(baseUrl + $(this).attr('href'))
    });
    return ;
}


//---------------------Updates the pages visited and process relative URLs---------------
function updatePageVisited(){
    if (dict.i < dict.pagesToVisit.length && valueLessThanMaxPagesToVisit(dict.i)) {
        dict.pagesVisited[dict.pagesToVisit[dict.i]] = true;
        dict.numPagesVisited++;
        manageProgressBar('update')
        process(dict.pagesToVisit[dict.i++]);
       
     }
     else {
        manageProgressBar('stop');
        showResults();
    }
}

function valueLessThanMaxPagesToVisit(_value){
    return _value <= dict.maxPagesToVisit ? true : false
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
            console.log(index+1 + ") Found at : " + el.pageUrl)
        })
}

module.exports = e;
