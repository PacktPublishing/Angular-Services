import {Injectable} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ReportService{
  private IDFs: FirebaseListObservable <any>;
  private angularFire;
  constructor(af: AngularFire) {
    this.angularFire = af;
  }

  setCorpus(template) {
    let topFreqs = [];
    let topIDFs = [];
    let stats = [];
    let limitTopFreq = parseInt(template.maxFreqWords);
    let limitTopIDFs = parseInt(template.maxIDFs);
    // calculating topFreqs
    if (limitTopFreq>0) {
      this.angularFire.database.list('Evidence/Corpus/IDFs', {
        query: {
          orderByChild: "doc_with_word",
          limitToLast: limitTopFreq // highest occurrence
        }})
        .subscribe(data => {
          data.forEach( d => {
            topFreqs.push({word:d.word, count: d.doc_with_word})
          });
          topFreqs.sort(function (a, b) { return b['count'] - a['count']});
        });
    } else {
      topFreqs.push({word:"value is not set", count: "..."});
    }

    // calculating topIDFs
    if (limitTopIDFs>0) {
      this.angularFire.database.list('Evidence/Corpus/IDFs', {
        query: {
          orderByChild: "IDF",
          limitToFirst:  limitTopIDFs// highest occurrence
        }})
        .subscribe(data => {
          data.forEach( d => {
            topIDFs.push({word:d.word, idf: d.IDF.toFixed(7)});
          });
        });
    } else {
      topIDFs.push({word:"value is not set", count: "..."})
    }

    // calculating articleStats
    if ( template.shortestArticle ||
         template.avgArticleSize  ||
         template.longestArticle  )
    this.angularFire.database.list('Evidence/Corpus/Articles')
      .subscribe(data => {
        let sum = 0;
        data.forEach( d => {
          sum += d.article.length;
        });
        let shortest = (template.shortestArticle)?
          (data.reduce(function (a, b) {
          return a.article.length > b.article.length ? b : a;
          })):{article:{length:0}, link:'check the box in the config tab'};
        let longest = (template.longestArticle)?
          (data.reduce(function (a, b) {
          return a.article.length > b.article.length ? a : b;
        })):{article:{length:0}, link:'check the box in the config tab'};
        stats.push({
          longestArticle: {
            size: longest.article.length, link: longest.link
          },
          averageSize: template.avgArticleSize?
            Math.round(sum/data.length): 0,
          shortestArticle: {
            size: shortest.article.length, link: shortest.link
          }
        });
      });
    return {
      topFreqs: topFreqs, topIDFs: topIDFs, articleStats: stats
    };
  }

  setCluster(template) {
    let root ='';
    let centers = [];
    let nodes = [];
    let reportNodes = [];
    let reportClusters = [];
    let cluster = {};
    if (template.rootNode) {
      this.angularFire.database
        .list('Evidence/Corpus/network-graph/nodes')
        .subscribe(data => {
          root = data[0].label;
          data.shift(data[0]);
          if (template.clusterNode) {
            data.forEach(d => {
              if (d.title[1].indexOf("cluster center") != -1) {
                centers.push(d);
              } else {
                nodes.push(d);
              }
            });
          }
        });
      this.angularFire.database
        .list('Evidence/Corpus/network-graph/edges')
        .subscribe(data => {
          if (template.clusterNode) {
            centers.forEach(c => {
              reportNodes = [];
              if (template.articleNode.show) {
                data.forEach(d => {
                  if (c.id == d.from) {
                    let node = nodes.filter(function (obj) {
                      return obj.id == d.to;
                    })[0];
                    let link = (template.articleNode.url)?node.title[0]:'';
                    let wordCount = (template.articleNode.size)?node.label.split("\n")[1]:'';
                    let distance = (template.articleNode.distance)?d.label:'';
                    let mainPhrases = (template.maxRootPhrases>0)?
                      this.getPhrases(node.title[1], root, template.maxRootPhrases):'';
                    let keyPhrases = (template.maxCenterPhrases>0)?
                      this.getPhrases(node.title[1], c.label, template.maxCenterPhrases):'';
                    reportNodes.push({
                      word_count: wordCount, distance: distance, link: link,
                      main_phrases: mainPhrases, keyword_phrases: keyPhrases
                    })
                  }
                });
              }
              reportClusters.push({
                name: c.label, nodes: reportNodes
              })
            });
          } else {
            reportClusters.push({
              name: 'cluster node is not selected', nodes: null
            })
          }
        });
    }
    else {
      root = 'root node is not selected';
      reportClusters = null;
    }
    return { root: root, clusters: reportClusters };
  }

  getPhrases(id, word, limit) {
    let phrases = [];
    let range = 33; //number of chars on each side of keyword
    this.angularFire.database
      .object('Evidence/Corpus/Articles/'+id+'/article/')
      ._ref.once("value").then(snapshot => {
        let text = snapshot.val();
        let i = text.indexOf(word);
        while(i > -1 && limit-- > 0) {
          (i-range <0)?
            phrases.push(text.slice(0,i+range)):
            (i+range > text.length )?
              phrases.push('...'+text.slice(i-range,text.length)):
              phrases.push('...'+text.slice(i-range,i+range)+'...');
          i = text.indexOf(word, i+word.length);
        }
      });
    return phrases;
  }
}
