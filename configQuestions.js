var questions = [];

var questions = [
    {
      name: 'startUrl',
      type: 'input',
      message: 'Enter the url you want scrap through:',
      validate: function( value ) {
        if (value.length && (value.startsWith('https://') || value.startsWith('http://'))) {
          return true;
        } else {
          return 'The url should start with https:// or http:// ';
        }
      }
    },
    {
      name: 'searchWord',
      type: 'input',
      message: 'Enter the word you want to search:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please the search word!';
        }
      }
    },
    {
        name: 'maxPagesToVisit',
        type: 'input',
        message: 'Enter the max number of pages to be visited:',
        validate: function(value) {
          if (value.length == 0 || typeof parseInt(value)) {
            return true;
          } else {
            return 'It should be a number!';
          }
        }
      }
  ];

module.exports.questions = questions;