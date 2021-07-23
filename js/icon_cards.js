
  // Utility function to get time in a time-zone
  function get_time(args){
    // Current Time
    var now = new Date();
    if (args.dateStyle == null) {
      return now.toLocaleString(args.format, { timeZone: args.tz, timeStyle: args.timeStyle });  
    }
    if (args.timeStyle == null) {
      return now.toLocaleString(args.format, { timeZone: args.tz, dateStyle: args.dateStyle });  
    }
    return now.toLocaleString(args.format, { timeZone: args.tz, dateStyle: args.dateStyle, timeStyle: args.timeStyle });  
  };

  // Cards
  const IconCards = {
    data() {
      return {
        IconCardList: [
          { id: 0, title: 'Time in Japan', icon: 'fa-globe-asia'},
          { id: 1, title: 'Time in Italy', icon: 'fa-globe-europe'},
          { id: 2, title: 'Events Today', icon: 'fa-list'},
          { id: 3, title: 'Medals Today', icon: 'fa-medal'}
        ]
      }
    },
    async mounted() {
      let events_url = `https://olympics.com/tokyo-2020/RMA/olympic/data/CAT/SCHByDay_${get_time({tz: 'Asia/Tokyo', dateStyle: 'short', format: 'ja-JP'}).replaceAll('/', '-')}.json`
      let events_response = await fetch(events_url);
      let events_data = await events_response.json()

      this.IconCardList[2].value = events_data['schedules'].length
      this.IconCardList[3].value = events_data['schedules'].filter(function (el) {
        return el.medalFlag == "1"
      }).length

      setInterval(() => {
        this.IconCardList[0].value = get_time({tz: 'Asia/Tokyo', timeStyle: 'medium', dateStyle: 'short', format: 'it-IT'});
        this.IconCardList[1].value = get_time({tz: 'Europe/Rome', timeStyle: 'medium', dateStyle: 'short', format: 'it-IT'});
      }, 1000)
    }
  }

  const iconcardapp = Vue.createApp(IconCards)

  iconcardapp.component('icon-card', {
    props: ['card'],
    template: `
      <div class="col-sm">
        <div class="card_container">
          <div class="card_body">
            <div class="row">
              <div class="col-8">
                <div>
                  <p style="margin-bottom: 0"> {{card.title}} </p>
                  <h5> {{card.value}} </h5>
                </div>
              </div>
              <div class="col-4 text_right">
                <div class="icon_container text_right">
                  <i class='fas fa-lg icon_center' v-bind:class="card.icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  })

  iconcardapp.mount('#iconcard')
  