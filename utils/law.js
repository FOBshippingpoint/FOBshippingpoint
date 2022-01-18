function lawProcessor(chLaw) {
  // 各法律
  const laws = chLaw.Laws;
  laws.forEach((l) => {
    const articles = l.LawArticles;
    articles.forEach((a) => (a.ArticleNo = v.substr(a.ArticleNo, 2, -3)));
  });
}
