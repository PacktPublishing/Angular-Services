import {Injectable, OnInit} from "@angular/core";
import forEach = require("core-js/fn/array/for-each");
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs";
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2";
import {googleSearchConfig, timeSpans} from "../app.module";

@Injectable()
export class EvidenceService implements OnInit {
  private http;
  private article = '';
  private words = [];
  private vocabularySize;
  private corpusSize;
  private angularFire;
  private stats: FirebaseObjectObservable <any>;
  private corpus: FirebaseListObservable <any>;
  private IDFs: FirebaseListObservable <any>;
  private clusters;
  private colors = [{
    border: '#555555',
    background: '#BBBBBB',
    highlight: { border: '#444444', background: '#EEEEEE' },
    hover: { border: '#444444', background: '#EEEEEE' }
  },{
    border: '#777777',
    background: '#DADADA',
    highlight: { border: '#555555', background: '#EFEFEF' },
    hover: { border: '#555555', background: '#EFEFEF' }
  },{
    border: '#CC9900',
    background: '#FFCC00',
    highlight: { border: '#FF9900', background: '#FFEE55' },
    hover: { border: '#FF9900', background: '#FFEE55' }
  },{
    border: '#990066',
    background: '#FF99CC',
    highlight: { border: '#FF66CC', background: '#FFCCCC' },
    hover: { border: '#FF66CC', background: '#FFCCCC' }
  },{
    border: '#666600',
    background: '#99CC66',
    highlight: { border: '#999900', background: '#66FF33' },
    hover: { border: '#999900', background: '#66FF33' }
  },{
    border: '#2B7CE9',
    background: '#97C2FC',
    highlight: { border: '#2B7CE9', background: '#D2E5FF' },
    hover: { border: '#2B7CE9', background: '#D2E5FF' }
  }];


  constructor(http: Http, af: AngularFire) {
    this.http = http;
    this.angularFire = af;
    this.stats = af.database.object('Evidence/Corpus/Stats');
    this.corpus = af.database.list('Evidence/Corpus/Articles');
    this.IDFs = af.database.list('Evidence/Corpus/IDFs');
  }

  ngOnInit() {
  }

  wordAnalyzer(url) {
    return this.getArticle(this.getYahooQueryUrl(url))
      .subscribe( data => {
        this.resetCounters();
        this.findKey(data, 'content');
        if (this.article) {
          this.evaluateWords( // normalizeWords
            this.countInstances(
              this.extractWords(this.article)
            )
          ).then(data => {
            this.corpus.push({article: this.article, link: url, bag_of_words: data});
          })
        }
      });
  }

  // instances are array of {word, count} objects
  evaluateWords(instances) {
    var self = this;
    var normFactor = this.calculateNorm(instances);
    return Promise.all(instances
      .filter(function(w) { //better way to weed out nonsense long words
        return w.word.length < 20;
      })
      .map(function (w) {
        var normalized = w.count / normFactor;
        w['normalized'] = normalized.toFixed(4);
        self.words.push(w);
        return w;
    }));
  }

  resetCounters() {
    this.article = null;
    this.words = [];
  }

  calculateNorm(rawWords) {
    // Norm factor = Square Root of (Sum of(each word value power 2));
    var total = 0;
    rawWords.forEach(function (w) {
      total += w.count * w.count;
    });
    return Math.sqrt(total);
  }

  findKey(object, string) {
    for (var key in object) {
      if (object[key] && typeof(object[key]) == "object") {
        this.findKey(object[key], string);
      } else if (
        key == string ||
        typeof (key) == "string" &&
        key != 'class' &&
        key != 'id' &&
        key != 'href'
      ) {
        this.article += object[key];
      }
    }
  }

  getArticle(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.query.results)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  extractWords(article) {
    // remove all symbols from the article
    var cleanse = article.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    // extract all words available between white spaces. (tabs, spaces, etc)
    // and return the result as an array of words,
    return cleanse.split(/\s+/);
  }

  countInstances(allWords) {
    // create an object for word instances and their counts
    var instances = {};
    allWords.forEach(function (word) {
      if (instances.hasOwnProperty(word)) {
        instances[word]++;
      } else {
        instances[word] = 1;
      }
    });
    return this.sortWords(instances);
  }

  // sort the words and save them as an array of {word, count} objects
  sortWords(instances) {
    var words = [];
    var sortedWords = Object.keys(instances).sort(function (a, b) {
      return instances[b] - instances[a]
    });
    sortedWords.forEach(function (word) {
      words.push({word: word, count: instances[word]});
    });

    return words;
  }

  getYahooQueryUrl(link) {
    return "https://query.yahooapis.com/v1/public/yql?" +
      "q=select * from html where url=\"" + link + "\" and " +
      "xpath=\"//*[contains(@class,\'paragraph\')]|//p\"" +
      "&format=json&diagnostics=true&callback=";
  }

  saveIDFs(mainKeyword) {
    var uniqueBagOfWords = {};
    this.IDFs.remove();
    this.corpus._ref.once("value")
      .then(snapshot => {
        this.corpusSize = snapshot.numChildren();
        snapshot.forEach(item => {
          item.child('bag_of_words').val().forEach(w => {
            if (w.word.length < 20) {
              uniqueBagOfWords.hasOwnProperty(w.word) ?
                uniqueBagOfWords[w.word]++ :
                uniqueBagOfWords[w.word] = 1;
            }
          });
        });

        var words = Object.keys(uniqueBagOfWords)
          // lets sort them based on their occurance
          .sort(function (a, b) {
            return uniqueBagOfWords[b] - uniqueBagOfWords[a]
          });
        this.vocabularySize = words.length;
        words.forEach(word => {
          var idf = Math.abs(Math.log2(
            (this.corpusSize == 0) ?
              1 : this.corpusSize / (uniqueBagOfWords[word] + 1)
          ));
          this.IDFs.push({
            'word': word, 'doc_with_word': uniqueBagOfWords[word], 'IDF': idf
          })
          // this.words[this.words.indexOf(word)]['idf'] = idf;
          this.words.some(function (item) {
            if (item.word === word) {
              item['idf'] = idf.toFixed(4);
              item['tfidf_C'] = (idf * item.count).toFixed(4);
              item['tfidf_N'] = (idf * item.normalized).toFixed(4);
              return true;
            }
          })
        });
        this.stats.set({
          corpusSize: this.corpusSize,
          mainKeyword: mainKeyword,
          vocabularySize: this.vocabularySize
        });
      });
  }



  getIDF(word, IDFs) {
    var idf = 0;
    IDFs.some((item: any) => {
      if (item.name === word.word) {
        idf = item.idf;
        return true;
      }
    });
    return idf;
  }

  corpusBuilder(mainKeyword, supportKeywords) {
    this.resetCounters();
    // ToDo:
    // 1. Fetch links for each keyword
    // 2. Pass the link to EvidenceService for extracting contents
    // 3. Save them under corpus key for further calculation
    var keywords = this.setKeywordArray(mainKeyword, supportKeywords);
    keywords.forEach((keyword: any) => {
      this.fetchLinks(keyword);
    })
  }

  setKeywordArray(mainKeyword, supportKeywords) {
    var keywords = [];
    if (supportKeywords)
      keywords = supportKeywords.split(",");
    keywords.forEach(k => {
      keywords.push(mainKeyword+' '+k);
    });
    // keywords.push(mainKeyword);
    // use unshift to add an element to the beginning of an array
    keywords.unshift(mainKeyword);
    return keywords;
  }

  fetchLinks(keyword) {
    var self = this;
    timeSpans.forEach(function (period) {
      self.getSearchResults(self.getGoogleQueryUrl(keyword, period))
        .subscribe(data => data.forEach(function (item) {
          self.wordAnalyzer(item.link);
        }))
    });
  }

  getGoogleQueryUrl(keyword, range) {
    return "https://www.googleapis.com/customsearch/v1?" +
      "key=" + googleSearchConfig.apiKey + "&cx=" + googleSearchConfig.cx +
      "&q=" + keyword + "&sort=" + range.sort + "&num=3&dateRestrict=" + range.span;
  }

  getSearchResults(url) {
    return this.http.get(url)
      .map((res: Response) => res.json())
      .map(data => data.items)
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  clusterBuilder(main, centers) {
    var self = this;
    var count;
    var max;
    var clusterCenters = {};
    var flag;
    var keywords = centers.split(",");
    var records = this.corpus._ref.once("value");
    var observations = {};
    var network = {};
    var nodes = []; //{id, label}
    var edges = []; //{from, to}
    var currentCenterId; // id
    var id = 10;
    var colorIndex = 2; // index 0 belongs to the root and 1 belongs to centers
    nodes.push({
      id: 1, label: main, title: [main, 'This is the root'], font: {size:40},
      color: this.colors[0], borderWidth: 3, borderWidthSelected: 4
    });

    return Promise.all(keywords.map(function (word) {
      observations[word] = [];
      records
        .then(snapshot => {
          max = 0;
          snapshot.forEach(article => {
            count = 0;
            flag = false;
            article.child('bag_of_words').val().forEach(w => {
              if (w.word == word) count += w.count;
              if (w.word == main) flag = true;
            });
            if (flag && count > max) {
              max = count;
              clusterCenters[word] = {
                id: article.key,
                bag_of_words: article.child('bag_of_words').val()
              }
            }
            edges.push({from: 1, to: currentCenterId, width: 2});
            return clusterCenters;
          })
          currentCenterId = id++; //clusterCenters[word].id;
          nodes.push({
            id: currentCenterId,
            label: word,
            title:[word, 'This is a cluster center', 0],
            color: self.colors[1],
            borderWidth: 2,
            borderWidthSelected: 3,
            font: {size: 28},
          });
          edges.push({from: 1, to: currentCenterId, width: 2});
          return clusterCenters;
        })
        .then(centers => {
            var i = 1;
            return records
              .then(snapshot => {
                snapshot.forEach(article => {
                  var sum = 0;
                  var d = 0;
                  var contents = article.child('article').val();
                  centers[word].bag_of_words.forEach(k => {
                    article.child('bag_of_words').val().forEach(w => {
                      if (k.word == w.word) {
                        sum += isNaN(k.normalized * w.normalized) ?
                          0 : (k.normalized * w.normalized);
                      }
                    })
                  })
                  d = 1 - sum;
                  observations[word].push({
                    id: article.key,
                    distance: d.toFixed(4),
                    link: article.child('link').val(),
                    size: contents.split(' ').length
                  });
                })
                observations[word].sort(function (a, b) {
                  return a['distance'] - b['distance'];
                });
                observations[word] = observations[word].slice(0,6);

                var node = nodes.find(node => node.label === word);
                observations[word].forEach(item => {
                  nodes.push({
                    id: id /*item.id won't work here. Because it should be unique and
                    chances are it won't be. (An article - depend on the distance - can
                    apper in two or more clusters.)*/,
                    label: (item.link)?item.link
                      .replace('http://','')
                      .replace('https://','')
                      .replace('www.','').split("/")[0]+'\n'+item.size+' words'
                    :'4xx', // for 404 or 400 responses
                    title: [item.link, item.id],
                    shadow:{ enabled: true, color: 'rgba(0,0,0,0.5)', size:11, x:3, y:3 },
                    color: self.colors[colorIndex],
                    shape: 'box'
                  });
                  edges.push({
                    from: node.id,
                    to: id, /*item.id*/
                    dashes: true,
                    label: item.distance,
                    length: 100 + item.distance * 1000,
                    font: {
                      color: '#777777',
                      background: 'white',
                      align:'middle'
                    },
                  });
                  id++;
                });
                colorIndex ++;
              })
          })// calculate distance to the centers for all articles in the corpus

      network = {nodes: nodes, edges: edges};      return network;
    }));
  }
}

