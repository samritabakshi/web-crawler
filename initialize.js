var chalk       = require('chalk');
var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var questions   = require('./configQuestions').questions;

var e ={};

e.init= function (){
    clear();
    console.log(
      chalk.green(
        figlet.textSync('Crawler', { horizontalLayout: 'full' })
      )
    );
}

e.startQuestionnaire =  function(){
    return new Promise((resolve,reject) => {
        questionnaire(function(){
              return resolve(arguments);
             
        });
    })
    
}

function questionnaire(callback) {
   inquirer.prompt(questions).then(callback);
}



module.exports = e;