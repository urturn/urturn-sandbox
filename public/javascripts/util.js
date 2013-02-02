sandbox.compile = function(html, context){
  return html.replace(/\$([a-zA-Z]+)/g, function(m){
    var k = m.substring(1)
    return (context[k] !== undefined ? context[k] : m);
  });
}