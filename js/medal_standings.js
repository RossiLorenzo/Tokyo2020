
async function get_medals(){
    let medals_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/medalStandings.json`
    let medals_response = await fetch(medals_url);
    let medals_data = await medals_response.json();
    medals_data = medals_data.total

    let mappings_url = "https://olympics.com/tokyo-2020/RMA/olympic/data/CCO/CC_ENG.json"
    let mappings_response = await fetch(mappings_url);
    let mappings_data = await mappings_response.json();

    for (var i = medals_data.length - 1; i >= 0; i--) {
      medals_data[i].Sn = mappings_data.NOC[medals_data[i].noc].Sn
    }
    return(medals_data)
};

  // Cards
  const MedalsStanding = {
    data() {
      return {
        MedalsList: [],
      }
    },
    async mounted() {
      let res = await get_medals();
      res.sort((a,b) => (a.rank) - (b.rank) )
      res = res.filter(x => x.Sn == "Italy" || x.rank < 10)
      this.MedalsList = res;
      setInterval(async () => {
        let res = await get_medals();
        res.sort((a,b) => (a.rank) - (b.rank) )
        res = res.filter(x => x.Sn == "Italy" || x.rank < 10)
        this.MedalsList = res;
      }, 60000)
    }
  }

  const MedalsStandingApp = Vue.createApp(MedalsStanding)

  MedalsStandingApp.mount('#medalsstanding')
  