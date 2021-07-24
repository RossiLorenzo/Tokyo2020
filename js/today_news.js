
async function get_headline(){
    let headline_url = `https://olympics.com/tokyo-2020/en/mobileapp/v1/api/device/smartphone/stories/filterable/all-news/country/all/discipline/all/skip/0/limit/10/?style=olympic`
    let headline_response = await fetch(headline_url);
    let headline_data = await headline_response.json()
    return(headline_data.sections[0].items)
};


  async function check_news(){
    let headline_data = await get_headline();

    let res = []
    headline_data.forEach(async function(e, index){
      res.push({
        is_active: ((index == 0) ? 'active' : ''),
        title: e.content.title,
        image: e.content.images[0].href.replace('t_{p.Device}_card_collection_{p.Density}', 't_smartphone_card_carousel_2x'),
        link: 'https://olympics.com/tokyo-2020/en/news/' + e.id
      })
      

    })

    return(res)
  }

  // Cards
  const TodayNews = {
    data() {
      return {
        NewsList: [],
      }
    },
    async mounted() {
      let res = await check_news();
      this.NewsList = res;
      setInterval(async () => {
        let res = await check_news();
        this.NewsList = res;
      }, 60000)
    }
  }

  const TodayNewsApp = Vue.createApp(TodayNews)

  TodayNewsApp.mount('#todaynews')
  