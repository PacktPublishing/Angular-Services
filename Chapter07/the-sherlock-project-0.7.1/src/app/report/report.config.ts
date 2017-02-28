export class ReportConfig {
  constructor(
    public templateName: string,
    public corpusSize: boolean,
    public vocabularySize: boolean,
    public printButton: boolean,
    public maxFreqWords: number,
    public maxIDFs: number,
    public longestArticle: boolean,
    public shortestArticle: boolean,
    public avgArticleSize: boolean,
    public rootNode: boolean,
    public clusterNode: boolean,
    public articleNode: {show: boolean, size: boolean, distance: boolean, url:boolean},
    public maxRootPhrases: number,
    public maxCenterPhrases: number
  ) {}
}
