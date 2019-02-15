var $currentPopover = null,
    $skipTime = true;

  $(document).on('shown.bs.popover', function (ev) {
    var $target = $(ev.target);
    if ($currentPopover && ($currentPopover.get(0) != $target.get(0))) {
      $currentPopover.popover('toggle');
    }
    $currentPopover = $target;
  }).on('hidden.bs.popover', function (ev) {
    var $target = $(ev.target);
    if ($currentPopover && ($currentPopover.get(0) == $target.get(0))) {
      $currentPopover = null;
    }
  });


//quicktmpl is a simple template language I threw together a while ago; it is not remotely secure to xss and probably has plenty of bugs that I haven't considered, but it basically works
//the design is a function I read in a blog post by John Resig (http://ejohn.org/blog/javascript-micro-templating/) and it is intended to be loosely translateable to a more comprehensive template language like mustache easily
$.extend({
    quicktmpl: function (template) {return new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+template.replace(/[\r\t\n]/g," ").split("{{").join("\t").replace(/((^|\}\})[^\t]*)'/g,"$1\r").replace(/\t:(.*?)\}\}/g,"',$1,'").split("\t").join("');").split("}}").join("p.push('").split("\r").join("\\'")+"');}return p.join('');")}
});

$.extend(Date.prototype, {
  //provides a string that is _year_month_day, intended to be widely usable as a css class
  toDateCssClass:  function () { 
    return '_' + this.getFullYear() + '_' + (this.getMonth() + 1) + '_' + this.getDate(); 
  },
  //this generates a number useful for comparing two dates; 
  toDateInt: function () { 
    return ((this.getFullYear()*12) + this.getMonth())*32 + this.getDate(); 
  },
  toTimeString: function() {
    var hours = this.getHours(),
        minutes = this.getMinutes(),
        hour = (hours > 12) ? (hours - 12) : hours,
        ampm = (hours >= 12) ? ' pm' : ' am';
    if (hours === 0 && minutes===0) { return ''; }
    if (minutes > 0) {
      return hour + ':' + minutes + ampm;
    }
    return hour + ampm;
  }
});


(function ($) {

  //t here is a function which gets passed an options object and returns a string of html. I am using quicktmpl to create it based on the template located over in the html block
  var t = $.quicktmpl($('#tmpl').get(0).innerHTML);
  
  function calendar($el, options) {
    //actions aren't currently in the template, but could be added easily...
    $el.on('click', '.js-cal-prev', function () {
      switch(options.mode) {
      case 'year': options.date.setFullYear(options.date.getFullYear() - 1); break;
      case 'month': options.date.setMonth(options.date.getMonth() - 1); break;
      case 'week': options.date.setDate(options.date.getDate() - 7); break;
      case 'day':  options.date.setDate(options.date.getDate() - 1); break;
      }
      draw();
    }).on('click', '.js-cal-next', function () {
      switch(options.mode) {
      case 'year': options.date.setFullYear(options.date.getFullYear() + 1); break;
      case 'month': options.date.setMonth(options.date.getMonth() + 1); break;
      case 'week': options.date.setDate(options.date.getDate() + 7); break;
      case 'day':  options.date.setDate(options.date.getDate() + 1); break;
      }
      draw();
    }).on('click', '.js-cal-option', function () {
      var $t = $(this), o = $t.data();
      if (o.date) { o.date = new Date(o.date); }
      $.extend(options, o);
      draw();
    }).on('click', '.js-cal-years', function () {
      var $t = $(this), 
          haspop = $t.data('popover'),
          s = '', 
          y = options.date.getFullYear() - 2, 
          l = y + 5;
      if (haspop) { return true; }
      for (; y < l; y++) {
        s += '<button type="button" class="btn btn-default btn-lg btn-block js-cal-option" data-date="' + (new Date(y, 1, 1)).toISOString() + '" data-mode="year">'+y + '</button>';
      }
      $t.popover({content: s, html: true, placement: 'auto top'}).popover('toggle');
      return false;
    }).on('click', '.event', function () {
      var $t = $(this), 
          index = +($t.attr('data-index')), 
          haspop = $t.data('popover'),
          data, time;
          
      if (haspop || isNaN(index)) { return true; }
      data = options.data[index];
      time = data.start.toTimeString();
      if (time && data.end) { time = time + ' - ' + data.end.toTimeString(); }
      $t.data('popover',true);
      $t.popover({content: '<p><strong>' + time + '</strong></p>'+data.text, html: true, placement: 'auto left'}).popover('toggle');
      return false;
    });
    
    function monthAddEvent(index, event) {
      var $event = $('<div/>', {'class': 'event', text: event.title, title: event.title, style: 'background-color: '+event.backgroundColor, 'data-index': index}),
          e = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()),
          eventLength = event.end - event.start,
          dateclass = e.toDateCssClass(),
          day = $('.' + e.toDateCssClass()),
          empty = $('<div/>', {'class':'clear event', html:'&nbsp;'}), 
          numbevents = 0, 
          hour = event.start.getHours(),
          time = event.start.toTimeString(),
          endday = event.end && $('.' + event.end.toDateCssClass()).length > 0,
          checkanyway = new Date(e.getFullYear(), e.getMonth(), e.getDate()+40),
          existing,
          i;
      $event.toggleClass('all-day', !!event.allDay);
      if (!!time) {
        //$event.html('<strong>' + time + '</strong> ' + $event.html());
      }
      if (!event.end) {
        $event.addClass('begin end');
        $('.' + event.start.toDateCssClass()).append($event);
        return;
      }
            
      endDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
      
      while (e <= endDate ) {
        if(day.length) { 
          existing = day.find('.event').length;
          numbevents = Math.max(numbevents, existing);
          for(i = 0; i < numbevents - existing; i++) {
            day.append(empty.clone());
          }
          day.append(
            $event.
            toggleClass('begin', dateclass === event.start.toDateCssClass()).
            toggleClass('end', dateclass === event.end.toDateCssClass()).
            toggleClass('noOverflow', eventLength < 2)
          );
          $event = $event.clone();
          $event.html('&nbsp;');
        }
        e.setDate(e.getDate() + 1);
        dateclass = e.toDateCssClass();
        day = $('.' + dateclass);
      }
    }
    
    function draw() {
      $el.html(t(options));
      //potential optimization (untested), this object could be keyed into a dictionary on the dateclass string; the object would need to be reset and the first entry would have to be made here
      $('.' + (new Date()).toDateCssClass()).addClass('today');
      if (options.data && options.data.length) {
         $.each(options.data, monthAddEvent);
      }
    }
    
    draw();    
  }
  
  ;(function (defaults, $, window, document) {
    $.extend({
      calendar: function (options) {
        return $.extend(defaults, options);
      }
    }).fn.extend({
      calendar: function (options) {
        options = $.extend({}, defaults, options);
        return $(this).each(function () {
          var $this = $(this);
          calendar($this, options);
        });
      }
    });
  })({
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    date: (new Date()),
        daycss: ["c-sunday", "", "", "", "", "", "c-saturday"],
        todayname: "Today",
        thismonthcss: "current",
        lastmonthcss: "outside",
        nextmonthcss: "outside",
    mode: "month",
    data: []
  }, jQuery, window, document);
    
})(jQuery);

var data = [],
    date = new Date(),
    d = date.getDate(),
    d1 = d,
    m = date.getMonth(),
    y = date.getFullYear(),
    i,
    end, 
    j, 
    c = 1063, 
    c1 = 3329,
    h, 
    m;



  red = '#ff4747';
  data.push(
      {
          start: new Date('2019-02-28 00:00:00'),
          end: new Date('2019-02-28 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Andalucia Day"
      },
      {
          start: new Date('2019-04-18 00:00:00'),
          end: new Date('2019-04-18 00:00:00'),

          backgroundColor: red,
          allDay: true,
          title: "Maundy Thursday"
      },
      {
          start: new Date('2019-04-19 00:00:00'),
          end: new Date('2019-04-19 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Good Friday"
      },
      {
          start: new Date('2019-04-22 00:00:00'),
          end: new Date('2019-04-22 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Easter Monday"
      },
      {
          start: new Date('2019-05-01 00:00:00'),
          end: new Date('2019-05-01 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Labour Day"
      },
      {
          start: new Date('2019-08-15 00:00:00'),
          end: new Date('2019-08-15 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Assumption Day"},
      {
          start: new Date('2019-10-12 00:00:00'),
          end: new Date('2019-10-12 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Columbus Day"},
      {
          start: new Date('2019-11-01 00:00:00'),
          end: new Date('2019-11-01 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "All Saint's Day"},
      {
          start: new Date('2019-12-01 00:00:00'),
          end: new Date('2019-12-01 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Constitution Day"
      },
      {
          start: new Date('2019-12-08 00:00:00'),
          end: new Date('2019-12-08 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Immaculate Conveption Day"
      },
      {
          start: new Date('2019-12-25 00:00:00'),
          end: new Date('2019-12-25 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Christmas Day"},
      {
          start: new Date('2019-12-26 00:00:00'),
          end: new Date('2019-12-26 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "Boxing Day"},
      {
          start: new Date('2020-01-01 00:00:00'),
          end: new Date('2020-01-01 00:00:00'),
          backgroundColor: red,
          allDay: true,
          title: "New Year's Day"
      },
      {
          title: "Conor Off School",
          backgroundColor: 'lightblue',
          allDay: true,
          start: new Date('2019-06-22 00:00:00'),
          end: new Date('2019-09-09 00:00:00')
      }

      );

// Conor & Laura Holiday
  data.push(
      {
          title: "Conor Motril",
          backgroundColor: '#6ef441',
          allDay: true,
          start: new Date('2019-02-22 00:00:00'),
          end: new Date('2019-03-03 00:00:00')
      },
      {
          title: "Conor Motril",
          backgroundColor: '#6ef441',
          allDay: true,
          start: new Date('2019-04-10 00:00:00'),
          end: new Date('2019-04-22 00:00:00')
      },
      {
          title: "Conor Motril",
          backgroundColor: '#6ef441',
          allDay: true,
          start: new Date('2019-07-22 00:00:00'),
          end: new Date('2019-08-02 00:00:00')
      },
      {
          title: "Conor Motril Alone",
          backgroundColor: '#6ef441',
          allDay: true,
          start: new Date('2019-08-03 00:00:00'),
          end: new Date('2019-08-11 00:00:00')
      }
  );


// Conor & Artur

   data.push(
       {
           title: "Karl",
           backgroundColor: '#FFC300',
           allDay: true,
           start: new Date('2019-03-02 00:00:00'),
           end: new Date('2019-03-11 00:00:00')
       },
       {
           title: "Possibly Grzegorz & Daria ES",
           backgroundColor: '#FFC300',
           allDay: true,
           start: new Date('2019-03-27 00:00:00'),
           end: new Date('2019-04-02 00:00:00')
       },
       {
           title: "Symphony",
           backgroundColor: '#FFC300',
           allDay: true,
           start: new Date('2019-03-23 00:00:00'),
           end: new Date('2019-03-23 00:00:00')
       },
       {
           title: "Conor PL",
           backgroundColor: '#FFC300', allDay: true,
           start: new Date('2019-06-22 00:00:00'),
           end: new Date('2019-07-13 00:00:00')
       }
   );


// Your IT Solutions
  data.push(
      {
          title: "RDS",
          backgroundColor: '#BB8FCE',
          allDay: true,
          start: new Date('2019-04-05 00:00:00'),
          end: new Date('2019-04-07 00:00:00')
      },
      {
          title: "MG Tralee",
          backgroundColor: '#BB8FCE',
          allDay: true,
          start: new Date('2019-05-06 00:00:00'),
          end: new Date('2019-05-10 00:00:00')
      },
      {
          title: "RDS",
          backgroundColor: '#BB8FCE',
          allDay: true,
          start: new Date('2019-10-04 00:00:00'),
          end: new Date('2019-10-06 00:00:00')
      }
  );

  data.sort(function(a,b) { return (+a.start) - (+b.start); });
  
//data must be sorted by start date

//Actually do everything
$('#holder').calendar({
  data: data
});