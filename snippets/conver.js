const fs = require('fs');
const snippets = require('./snippets.json');
const componentNames = Object.keys(snippets);
const components = {};
componentNames.map((name)=>{
  components[name] = snippets[name].body.join('');
});


fs.writeFileSync('./snippets-gen.json', JSON.stringify(components), {encoding: 'utf8'});

