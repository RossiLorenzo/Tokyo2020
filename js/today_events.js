  // Utility function to get time in a time-zone
  function format_time(s){
    let t = new Date(s);
    return t.toLocaleString('it-IT', { timeStyle: 'short' });
  };

  function collapse_all(){
    
  }

  async function check_events(){
    let events_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/SCHByDay_${get_time({tz: 'Asia/Tokyo', dateStyle: 'short', format: 'ja-JP'}).replaceAll('/', '-')}.json`
    let events_response = await fetch(events_url);
    let events_data = await events_response.json()

    let mappings_url = "https://olympics.com/tokyo-2020/RMA/olympic/data/CCO/CC_ENG.json"
    let mappings_response = await fetch(mappings_url);
    let mappings_data = await mappings_response.json();

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
      if (res[clean_event.sportName] == null) {
        res[clean_event.sportName] = []
      }

      res[clean_event.sportName].push(clean_event)
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

    
    console.log(res)

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
      let res = await check_events();
      this.EventsList = res;
      setInterval(async () => {
        let res = await check_events();
        this.EventsList = res;
      }, 60000)
    }
  }

  const TodayEventsApp = Vue.createApp(TodayEvents)

  TodayEventsApp.mount('#todayevents')
  