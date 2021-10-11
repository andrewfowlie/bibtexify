// Andrew Fowlie
// Icon from https://icons.getbootstrap.com/icons/clipboard-plus/

function click() {
  browser.tabs.query({active: true, currentWindow: true})
  .then(tabs => parse_id(tabs))
  .then(id => copy_bibtex_try_catch(id))
  .catch(err => notify("Failure: " + err));
}

function parse_id(tabs) {
  let url = tabs[0].url;
  let urlRegExp = /\d\d\d\d\.\d\d\d\d\d/g;
  return url.match(urlRegExp)[0];
}

function regExpGroup(text, regExp) {
  return text.match(regExp)[0].replace(regExp, "$1");
}

function notify(note) {
  browser.notifications.create("bibtexify", {
      "type": "basic",
      "title": "bibtexify",
      "message": note,
    });
}

function fetch_doi(id) {
  let urlRegExp = /<arxiv:doi xmlns:arxiv="http:\/\/arxiv.org\/schemas\/atom">(.*?)<\/arxiv:doi>/g;
  let url = 'http://export.arxiv.org/api/query?id_list=' + id;
  return fetch(url)
    .then(res => res.text())
    .then(text => regExpGroup(text, urlRegExp));
}

async function copy_bibtex_dx(id) {
  let doi = await fetch_doi(id);
  let url = 'http://dx.doi.org/' + doi;
  return fetch(url, {headers: {'Accept': 'application/x-bibtex'}})
    .then(res => res.text())
    .then(bibtex => copy(bibtex));
}

function copy_bibtex_inspire(id) {
  let url = 'https://inspirehep.net/api/literature/?q=eprint ' + id + '&format=bibtex';
  return fetch(url)
    .then(res => res.text())
    .then(bibtex => copy(bibtex));
}

function copy_bibtex_try_catch(id) {
  return copy_bibtex_inspire(id)
    .catch(err => copy_bibtex_dx(id));
}

function copy(data) {
  if (data.length == 0) {
    throw new Error('bibtex string was empty')
  }
  navigator.clipboard.writeText(data)
    .then(res => notify("Success: '" + data.substring(0, 25) + "...' copied to clipboard"))
    .then(res => window.close());
}

browser.pageAction.onClicked.addListener(click);
