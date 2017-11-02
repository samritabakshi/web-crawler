var initialize  = require('./initialize');
var crawler = require('./crawler');


// -------------------Initialize by asking the questionnaire-----------------
initialize.init();

// -------------------User choices captured---------------------------------- 
initialize.startQuestionnaire().then(arguements => {
    
    var startUrl = arguements['0']['startUrl'];
    var searchWord = arguements['0']['searchWord'];
    var maxPagesToVisit = parseInt(arguements['0']['maxPagesToVisit']);
    
    //-------------------The Crawler starts to crawl-----------------------------
    crawler.init(startUrl,searchWord,maxPagesToVisit);
    crawler.startCrawling();
});






