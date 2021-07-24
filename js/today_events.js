  // Utility function to get time in a time-zone
  function format_time(s){
    let t = new Date(s);
    return t.toLocaleString('it-IT', { timeStyle: 'short' });
  };

  async function get_athlete_detail(id){
    let athlete_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/BIO/ATH/${id}.json`
    let athlete_response = await fetch(athlete_url);
    let athlete_data = await athlete_response.json();
    return athlete_data;
  }

  async function check_events(italy_only){
    let events_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/SCHByDay_${get_time({tz: 'Asia/Tokyo', dateStyle: 'short', format: 'ja-JP'}).replaceAll('/', '-')}.json`
    //let events_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/SCHByDay_2021-07-24.json`
    let events_response = await fetch(events_url);
    let events_data = await events_response.json()

    let mappings_url = "https://olympics.com/tokyo-2020/RMA/olympic/data/CCO/CC_ENG.json"
    let mappings_response = await fetch(mappings_url);
    let mappings_data = await mappings_response.json();

    let athletes_url = "https://olympics.com/tokyo-2020/olympic-games/en/results/all-sports/zzje001a.json"
    let athletes_response = await fetch(athletes_url);
    let athletes_data = await athletes_response.json();
    let athletes_data_json = {}
    for (x of athletes_data.data) {
      athletes_data_json[x.code] = {
        id: x.code,
        name: x.shortName,
        longname: x.name,
        img: x.img,
        noc: x.noc,
        lnk: x.lnk
      }
    }

    let links_url = "https://olympics.com/tokyo-2020/olympic-games/en/results/all-sports/json-mapping.json"
    let links_response = await fetch(links_url);
    let links_data = await links_response.json();
    links_data = links_data.mappingRSCtoWRSURL;
    let links_data_clean = {}
    links_data.map(x => links_data_clean[Object.keys(x)] = Object.values(x)[0]);

    let res = {}
    events_data['schedules'].forEach(function(e){
      let clean_event = {
        rsc: e.rsc,
        link: "https://olympics.com/tokyo-2020/olympic-games/" + links_data_clean[e.rsc],
        name: mappings_data.EventUnit[e.rsc].Sn,
        gender: ((e.gender == "W") ? 'female' : ((e.gender == "M") ? 'male' : ((e.gender == "X") ? 'restroom' : 'horse'))),
        participants_noc: e.participants.map(x => x.noc).concat(e.noc.split(',')),
        participants_ids: ((e.type == "HATH") ? e.participants.map(function(x){
          let res = athletes_data_json[x.id];
          res['hasWin'] = x.hasWin
          return res
        }) : []),
        participants_italians: ((e.type == "HATH") ? e.participants.filter(x => x.noc == "ITA").map(x => athletes_data_json[x.id]) : []),
        participants_winner_ids: ((e.type == "HATH") ? e.participants.filter(x => x.hasWin).map(x => athletes_data_json[x.id]) : []),
        medalFlag: e.medalFlag,
        sport: e.sport,
        sportName: mappings_data.Discipline[e.sport].Sn,
        icon: `img/disciplines/${e.sport}.png`,
        isLive: e.isLive,
        status: e.status,
        color: ((e.status == "FINISHED") ? 'red' : ((e.status == "RUNNING") ? 'green' : 'grey')),
        type: e.type,
        fullStartDate: format_time(e.fullStartDate),
        fullEndDate: format_time(e.fullEndDate)
      }

      if (italy_only == true) {
        if (clean_event.participants_noc.filter(x => x.includes('ITA')).length > 0) {
          if (res[clean_event.sportName] == null) {
            res[clean_event.sportName] = []
          }

          res[clean_event.sportName].push(clean_event)
        }
      }
      else {
        if (res[clean_event.sportName] == null) {
          res[clean_event.sportName] = []
        }

        res[clean_event.sportName].push(clean_event)
      }



    });

    // Order by sport
    res = Object.keys(res).sort().reduce((obj, key) => { 
      obj[key] = res[key]; 
      return obj;
    }, 
    {}
    );

    // Order by time
    Object.values(res).forEach(function(e){
      e.sort((a,b) => Date.parse('2021-01-01 ' + a.fullStartDate) - Date.parse('2021-01-01 ' + b.fullStartDate))
    })

    return(res)
  }

  // Cards
  const TodayEvents = {
    data() {
      return {
        EventsList: [],
      }
    },
    async mounted() {
      let res = await check_events(false);
      this.EventsList = res;
      setInterval(async () => {
        let res = await check_events(false);
        this.EventsList = res;
      }, 60000)
    }
  }

  async function clean_italians(id){
        let res = await check_events();
        res = Object.values(res).flat();
        res.sort((a,b) => Date.parse('2021-01-01 ' + a.fullStartDate) - Date.parse('2021-01-01 ' + b.fullStartDate))
        res_ita = res.filter(x => x.participants_italians.length > 0).map(x => x.participants_italians).flat()
        for (var i = res_ita.length - 1; i >= 0; i--) {
          let extra = await get_athlete_detail(res_ita[i].id)
          let extra_clean = {
            basicInfo: extra.basicInfo,
            schedule: extra.schedule.map(x => Object.values(res).filter(y => y.rsc == x.rsc)).flat().sort((a,b) => Date.parse('2021-01-01 ' + a.fullStartDate) - Date.parse('2021-01-01 ' + b.fullStartDate)),
            socialMedia: extra.socialMedia
          }
          res_ita[i]['extra_data'] = extra_clean;
        }
        console.log(res_ita);  
        return res_ita;
  }
  
  // Cards
  const TodayItalians = {
    data() {
      return {
        ItaliansList: [],
      }
    },
    async mounted() {
        let res_ita = await clean_italians();
        this.ItaliansList = res_ita;
      setInterval(async () => {
        let res_ita =  await clean_italians()
        this.ItaliansList = res_ita;
      }, 60000)
    }
  }

  const TodayEventsApp = Vue.createApp(TodayEvents)
  const TodayItaliansApp = Vue.createApp(TodayItalians)

  TodayItaliansApp.mount('#todayitalians')
  TodayEventsApp.mount('#todayevents')
  
  