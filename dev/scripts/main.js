var weatherApp = {
    req: new XMLHttpRequest(),
    res: null,
    timer: null,
    results: document.getElementById('current'),
    error:document.getElementById('error'),
    windDirection: document.getElementById('wind_direction'),
    loader: document.getElementById('loading'),
    refresh:document.getElementById('refresh'),
    waiting: false,
    allowRender: false,
    requestWeather: function(search, refresh){
        if(!refresh){
            this.refresh.dataset.query = search.query.value;
            var query = search.query.value;
        }else{
            var query = search;
        }
        this.resetResults();
        var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+query+'") and u="c"&format=json';
        var self = this;
        this.req.open('GET', url);
        this.req.timeout = 5000;
        this.req.onerror = function () {
            self.renderError('An issue occured while connecting. Please try again.');
            return false;
        };
        this.req.ontimeout = function () {
            self.renderError('We did not receive a response from the weather server. Please try again.');
            return false;
        };
        this.req.onload = function(){
            var res = JSON.parse(self.req.responseText);
            if(res.query.results == null){
                self.renderError('No results were found, please try a different location.')
            }else{
                self.res = res.query.results.channel;
                self.checkTime(self.res);
            }
        }
        this.req.send(null);
        return false; 
    },
    resetResults: function(){
        if(this.results.classList.contains('visible')){
            this.results.classList.remove('visible');
            this.results.classList.add('hide');
        }
        if(this.error.classList.contains('visible')){
            this.error.classList.remove('visible')
            this.error.classList.add('hide');
        }
        this.waiting = true;
        var self = this;
        this.timer = setTimeout(self.renderDelay.bind(null,self), 300);                       
    },
    checkTime: function(res){
        if(!this.waiting){
            this.renderView(res);
        }else{
            this.allowRender=true;
        }
    },
    renderView: function(res){
        this.loader.classList.remove('visible');
        var view = document.getElementsByClassName('req-data');
        for(i=0;i<view.length;i++){
            view[i].innerHTML = eval(view[i].dataset.model);
        }
        this.windDirection.style.transform = 'rotate('+res.wind.direction+'deg)';
        this.error.classList.remove('hide');
        this.results.classList.remove('hide')
        this.results.classList.add('visible');
    },
    renderError: function(message){
        clearTimeout(this.timer);
        this.loader.classList.remove('visible');
        var view = document.getElementsByClassName('req-error')[0];
        view.innerHTML = message;
        this.error.classList.remove('hide');
        this.error.classList.add('visible');
    },
    renderDelay:function(self){
        console.log(self);
        self.waiting = false;
        self.loader.classList.add('visible');
        if(self.allowRender){
            self.renderView(self.res);
        }
    }
}