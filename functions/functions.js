
  //------------ Functions ------------//

  //verseText = ""

  isValidPassword = function isValidPassword(val) {
     return val.length >= 6 ? true : false; 
  }

  signIn = function signIn(e,t,topNav){
    var emailRaw = t.find('#email').value
      var password = t.find('#password').value
      var emailTrimmed = trimInput(emailRaw);
      var email = validateEmail(emailTrimmed)

      if(email && password){
        if (!isValidPassword(password)){
          Session.set('errorMsg', 'Password is too short')
        }else{
          //console.log('login')
          Meteor.loginWithPassword(emailTrimmed, password, function(err){
            //console.log('meteor call')
            
            if (err){
              console.log(err)
              if(err == 'Error: Incorrect password [403]'){
                Session.set('errorMsg', "Incorrect password")
              }else{
                Session.set('errorMsg', "Account doesn't exist")
              }
              //console.log(err)
            }
            else if(topNav){
              //console.log('close overlay, route to home')
              $('.black-overlay .close').click()
              //Router.home();
              window.location = '/'
            } else{
              $('.black-overlay .close').click()
              Session.set('loggedIn', true)
              $('#donation-container').html(Meteor.render(Template.credit_form_tmpl))
              
            }
          });
        }
      }else{
        if(email){
          Session.set('errorMsg', 'Field missing')
          $('.sign-in-input').each(function(){
            var inputVal = $(this).val()
            if(!inputVal){
              $(this).addClass('error').focus(function(){
                $(this).removeClass('error')
              })
            }
          })
        }else{
          Session.set('errorMsg', 'Email is incorrect')
        }
        
      } 
  }
  clearSessions = function clearSessions(){
    Session.set('tockenId', '')
    Session.set('tokenForm', '')
    Session.set('custCard', '')
    Session.set('custId', '')
    Session.set('totalDonated', '')
    Session.set('followingResult', '')
    Session.set('followingResultPlus', '')
    Session.set('followerResult', '')
    Session.set('followerResultPlus', '')
    Session.set('activity', '')
  }
  audioInitiate = function audioInitiate(book){
    
    var audioFile = $('#audio-container').attr('data-audio-file');
    //$("#audio").jPlayer('destroy')
    if(audioFile){
      $("#audio").jPlayer({
        ready: function (event) {
            $(this).jPlayer("setMedia", {
              mp3: audioFile
            });
        },
        ended: function() {
          if(book == 'demo'){
            $('.tour-container .continue').fadeIn().css('display', 'block');
          }else{
            Meteor.call('audioComplete', Session.get("chapterNum"), Session.get("totalVerses"), Session.get("bookName"))
            $('#complete-badge, #chapter-title').addClass('complete')
            $('#complete-badge').html('Audio complete')
          }
          
        },
        swfPath: "/js/Jplayer.swf",
        supplied: "mp3"
      });

      $.jPlayer.timeFormat.padMin = false;
    }
  }

  animateCoin =  function animateCoin(){
    if($('.audio-coin').hasClass('underMaxCoins')){
      var coin = $('.audio-coin b')
      var newCoin = '<div class="newCoin"></div>';

      $('body').append(newCoin)
      $('.newCoin').css({
        top: coin.offset().top,
        left: coin.offset().left,
      })

      coin.hide()
      $('.audio-coin em').show()

      var coinLocation = $('.total-points .coin')
      var locationLeft = coinLocation.offset().left;
      var locationTop = coinLocation.offset().top +20;

      $('.newCoin').animate({
        opacity: 0,
        left: locationLeft,
        top: locationTop
      }, 1000, function() {
        coin.fadeIn('slow', function() {
           $('.audio-coin em').hide()
          $('.newCoin').remove()
        });
      });
    }
    
    
  }

  inArray = function inArray(needle, haystack) {
      var length = haystack.length;
      for(var i = 0; i < length; i++) {
          if(haystack[i] == needle) return true;
      }
      return false;
  }

  addAudioCoins = function addAudioCoins(totalVerses, totalTime, bookName, chapter){
    Meteor.call('checkAudio', bookName, chapter, function(error, result){
      if(result){
        if(Session.get("verseAudioBegin") != chapter && totalTime){
          //console.log('in')
          Session.set("verseAudioBegin", chapter)
          var c = totalTime.split(':');
          var seconds = (+c[0]) * 60 + (+c[1]); 

          var verseTime = (seconds/totalVerses)
          //var coinDrop = (380/totalVerses)
          
          var coinLocation = new Array();
          for(var i=1;i<=totalVerses;i++){
            coinLocation[i]=Math.floor(verseTime*i-1);
            //var newVerseTime = (coinDrop*i)-coinDrop;
            //$('#audio-coins').prepend('<div class="audio-coin coin-'+i+'"><span></span><b></b></div>')
          }
          var oneCall = $('#oneCall').html()
          var currentState = $('#coins-remaining i strong').html();
          $("#audio").bind($.jPlayer.event.timeupdate, function(event) {
            var currentTime = Math.floor(event.jPlayer.status.currentTime)
            var matchTime = $.inArray(currentTime, coinLocation)
            if(matchTime >= 1){
              $('#oneCall').html(matchTime);
              if ($('#oneCall').html() != oneCall) {
                currentState++
                //console.log(currentState)
                $('#coins-remaining i strong').html(currentState)
                animateCoin()
                var t=setTimeout(function(){
                  Meteor.call('audioPoints', bookName, chapter)
                  //Meteor.call('writeCoin', bookName, chapter)
                },750)
              }
              oneCall = $('#oneCall').html()
            }
          })
        }
      }
    })
  }

  animateLargeCoin = function animateLargeCoin(quesitonId, pointsPlace){

    var coin = $('#'+quesitonId+' .points-remaining')
    var newCoin = '<div class="points-remaining-new"><span>'+pointsPlace+'</span></div>';

    $('body').append(newCoin)
    $('.points-remaining-new').css({
      top: coin.offset().top,
      left: coin.offset().left,
    })

    var coinLocation = $('.total-points .coin')
    var locationLeft = coinLocation.offset().left;
    var locationTop = coinLocation.offset().top +20;

    $('.points-remaining-new').animate({
      opacity: 0,
      left: locationLeft,
      top: locationTop
    }, 1500, function() {
      $('.points-remaining-new').remove()
    });
    
  }

  animateRemoveHeart = function animateRemoveHeart(quesitonId, heartNum){
    //console.log(quesitonId)
    //console.log(heartNum)
    var heart = $('#'+quesitonId+' .heart'+heartNum)
    //console.log(heart)
    var newHeart = '<div class="heart-new"></div>';
    //console.log(heart.offset().top)
    $('body').append(newHeart)
    $('.heart-new').css({
      top: heart.offset().top,
      left: heart.offset().left
    })

    $('.heart-new').animate({
      opacity: 0,
      top: parseInt(heart.offset().top) + 30
    }, 500, function() {
      $('.heart-new').remove()
    });
  }

  answerQuestion = function answerQuestion(e, bookname){
    if(bookname != 'demo'){
      var bookname = Session.get("bookName")
      var chapterNum = Session.get("chapterNum")
    }else{
      var bookname = 'demo'
      var chapterNum = 1
    }
    if(!$(e.target).hasClass('disable')){
      var allAnswers = $(e.target).parent('.answers-container').find('a')
      //console.log($(e.target))

      allAnswers.addClass('disable')
      $(e.target).parent('.answers-container').find('a').addClass('disable')
      var question = $(e.target).parent('.answers-container').attr('data-question')
      var answer = $(e.target).attr('data-answer')
      var self = $(e.target).parents('.question-container').find('.lives-remaining')
      //$(e.target).addClass('wrong-answer')
      Meteor.call('answerSelect', bookname, chapterNum, answer, question, function(error, result){
        if(result[2] != 'wrongAnswer'){
          $(e.target).addClass('correct-answer')
        }
        if(result[2] == 'completeAll'){
          $('#chapter-title, #total-complete-badge').addClass('total-complete')
          $('#complete-badge').addClass('complete').html('Audio complete')
          $('#total-complete-badge').html('Questions complete')
          loadInOverlay('overlay-content')
          $('.overlay-content').append(Meteor.render(Template.star_overlay_tmpl)).addClass('star-overlay')
          setTimeout(function(){$('.star-overlay .star-win').css({'-webkit-animation-name':'rotateIn','animation-name': 'rotateIn'})},400);
        }else if(result[2] == 'wrongAnswer'){
          animateRemoveHeart(result[0], result[1])
          setTimeout(function(){allAnswers.removeClass('disable')},800);
          return false
        }
        animateLargeCoin(result[0], result[1])
        setTimeout(function(){allAnswers.removeClass('disable')},800);
        if(bookname == 'demo'){
          $('.complete-tour').fadeIn().css('display', 'block');
        }
      })
      
    }
  }

  ajaxChapterInfo = function ajaxChapterInfo(self) {
      //console.log(Session.get("jsonDataChapter")+' != '+self.bookName)
      //console.log('ajaxChapterInfo')
      if (Session.get("jsonDataChapter")!=self.bookName){
        //console.log('if')
        var jsonBookname = self.bookName;
        var trimmedBookname = jsonBookname.replace(" ","")
        var bookVersion = Meteor.user().profile.version
        $.ajax({
          url: "/"+bookVersion+"/"+trimmedBookname+".json",
          dataType: "json",
          beforeSend: function ( xhr ) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
        }).done(function ( data ) {
          Session.set("jsonData",data);
          Session.set("jsonDataChapter",self.bookName);
          //Session.set("totalVerses", data.chapterInfo[self.chapter].verses)
          //console.log('done')
          // var verseTextRaw = data.chapterInfo[self.chapter].verseText
          // var verseTextWrap = verseTextRaw.replace(/(\d+)/g, "<strong>$1 </strong>");
          // verseText = verseTextWrap
          //Session.set("verseText", verseTextWrap)
        }).fail(function(){
          console.log('ajax chapter info if ERROR')
        });
      }
      else{
        //console.log('else')
        var jsonData = Session.get("jsonData")
        //Session.set("totalVerses", jsonData.chapterInfo[self.chapter].verses)

        // var verseTextRaw = jsonData.chapterInfo[self.chapter].verseText
        // var verseTextWrap = verseTextRaw.replace(/(\d+)/g, "<strong>$1</strong>");
        // verseText = verseTextWrap
        //Session.set("verseText", verseTextWrap)
      }
  }

  loadInOverlay = function loadInOverlay(className){
    console.log('load')
    var windowPosition = document.body.scrollTop
    $('body').append('<div class="black-overlay"><div class="'+className+'"><a href="#" class="close">Close</a></div></div>').addClass('noScroll')
    $('.black-overlay .close').click(function(){

      $('.black-overlay, .'+className).fadeOut(200, function(){
        $('.black-overlay, .'+className).remove()
        $('body').removeClass('noScroll')
        //window.scrollTo(0,windowPosition)
      })
      return false
    })
    return false
  }

  

  trimInput = function trimInput(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

  validateEmail = function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  } 

  progressGraph = function progressGraph(){

    Session.set('dayProgress', "")
    var currentdate = new Date()
    var month = currentdate.getMonth() + 1

    var progress = Progress.find({month: month}).fetch();
    Session.set('currentMonth', monthNames[currentdate.getMonth()])
    progress.unshift(" ")
    var day = currentdate.getDate()
    daysInMonth = new Array([],[31],[28],[31],[30],[31],[30],[31],[31],[30],[31],[30],[31])
    arrayOfData = new Array()

    //console.log(daysInMonth[month])
    for(i=1;i<=daysInMonth[month];i++){
      arrayZ = new Array(0,i);
      arrayOfData.push(arrayZ)
    }

    for(i=1;i<=day;i++){
      if(i<progress.length){
        var fullDate = String(progress[i].date)
        var trimDate = progress[i].day
        var trimMonth = progress[i].month
        //console.log(trimDate+" "+trimMonth)
        if(trimMonth == month){
          arrayOfData[parseInt(trimDate)-1] = [progress[i].progress, arrayOfData[parseInt(trimDate)-1][1]]
        }
        
        if(trimDate == day){
          Session.set('dayProgress', progress[i].progress)
        }
      }
      
      if(!Session.get('dayProgress')){
        Session.set('dayProgress', 0)
      }

    }
    //console.log(arrayOfData)
      $('#bar-graph').jqBarGraph({ data: arrayOfData, width: 845, barSpace: 15, height:165, color:'#0085d8' });
      $('#bar-graph .graphLabelbar-graph').each(function(){
        if($(this).html() == day){
          $(this).parent().addClass('today')
        }
      })
  }

  preload = function preload(arrayOfImages) {
      $(arrayOfImages).each(function(){
          $('<img/>')[0].src = this;
      });
      //console.log('Preloaded')
  }

  search = function search(searchVal){
    searchVal = searchVal.replace(/\%20/g, ' ').replace(/[*|&;$%@"<>()+,]/gi, '')
    if(Backbone.history.fragment != "search"){
      Spark.finalize($("#site-container")[0])
      $("#site-container").empty().html(Meteor.render(Template.search_user_tmpl))
      Router.navigate("/search?q="+searchVal)
      $('#user-input-search').val(searchVal)
    }
    
    Session.set('userSearchLoaded', false)

    Session.set('userSearchQuery', searchVal)
    if(searchVal){
      Meteor.call('searchUser', searchVal, function (error, result) {
        Session.set('userSearchCount', result.length)
        Session.set('userSearchResult', result)
        Session.set('userSearchLoaded', true)
      })
    }else{
      Session.set('userSearchCount', '0')
      Session.set('userSearchResult', false)
      Session.set('userSearchLoaded', true)
    }
    
  }

  popupBubble = function popupBubble(target, content){
    if($('.popup-bubble').length < 1){
      var position = target.offset()
      $('body').append('<div class="popup-bubble">'+content+'<div class="arrow"></div></div>')
      var bubbleHeight = $('.popup-bubble').height() + 18
      var bubbleWidth = $('.popup-bubble').width() + 14
      
      if(target.css("border-left-width")){
        var add = target.css("border-left-width").replace('px', '')
        bubbleWidth = bubbleWidth - parseInt(add)
      }

      if(target.css("border-right-width")){
        var add = target.css("border-right-width").replace('px', '')
        bubbleWidth = bubbleWidth - parseInt(add)
      }

      
      if((position.left + (bubbleWidth/2))>window.innerWidth){
        var bubbleOffsetLeft = -(bubbleWidth - target.width())
        $('.popup-bubble').addClass('off')
        $('.popup-bubble.off .arrow').css({'right':(target.width()/2)-5})
      }else{
        var bubbleOffsetLeft = (target.width() - bubbleWidth)/2
      }
      
      $('.popup-bubble').css({'top':position.top - bubbleHeight, 'left':position.left + bubbleOffsetLeft, 'display': 'block', 'opacity': '0'})
      $('.popup-bubble').animate({
        top: '+=3',
        opacity: 1
      }, 200)
    }
    
  }



  listAllCharges = function listAllCharges(){
    Meteor.call('listCharges', function (error, result){
      //console.log(result)
      var amount = 000;
      if(result){
        var dates = new Array()
        
        for (var i=0; i<=result.data.length-1; i++){
          //console.log(result.data[i])
          if(result.data[i].paid){
            amount = amount + result.data[i].amount
          }
          
          var created = result.data[i].created
          var date = new Date(created * 1000);
          result.data[i].created = monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
          result.data[i].amount = String(result.data[i].amount).replace(/([0-9][0-9])$/, ".$1")
        }
        Session.set('listCharges',result.data)
        
      }

      Session.set('totalDonated',amount)
      
    })
    //console.log('Call')
  }

  isMyScriptLoaded = function isMyScriptLoaded(url) {
      if (!url) url = "http://widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js";
      scripts = document.getElementsByTagName('script');
      for (var i = scripts.length; i--;) {
          if (scripts[i].src == url) return true;
      }
      return false;
  }

  removeUserVoice = function removeUserVoice(){
    $('script').each(function(){
        if($(this).attr('src')){
            var srcName = $(this).attr('src')
            if(srcName.indexOf('uservoice.com') > 0){
              $(this).remove()
            }
        }
    })
    $('.uv-icon').remove()
  }

  stripeResponseHandler = function stripeResponseHandler(status, response) {
    var $form = $(Session.get('tokenForm'))
    if (response.error) {
      //console.log('Show the errors on the form') 
      $form.find('.payment-errors').text(response.error.message);
      $form.find('.submit-payment, .save-card').show();
      $form.find('.form-load').hide();

    } else {
      //console.log('token contains id, last4, and card type')
      var token = response.id;
      Session.set('tockenId', token)
      
      
      //console.log('Insert the token into the form so it gets submitted to the server')
      $form.append($('<input type="hidden" name="stripeToken" id="tokenId" />').val(token));
      //console.log('and submit')
      $(Session.get('tokenForm')+' #form-complete').click()
      
      //$form.submit();
    }
  };


  FacebookInviteFriends = function FacebookInviteFriends(){
    FB.ui({ method: 'apprequests', message: 'Invite your friends to Verses'});
  }

  emailVerified = function emailVerified(){
    $('.email-verified').delay(4000).animate({'margin-top': '-42px', 'opacity': '0'}, 500, function(){Session.set('verEmailSent', false)})
  }

  windowLoad = function windowLoad(){
    windowWidth = window.innerWidth
    if(window.innerWidth > 900){
      var chapterRightWidth = $('#logged-in-container').width() - 280
      var questionWidth = chapterRightWidth
      var progressWidth = $('#audio-container').width() - 135
    }else if(window.innerWidth <= 900 && window.innerWidth > 600){
      var chapterRightWidth = $('#logged-in-container').width()
      var questionWidth = chapterRightWidth
      var progressWidth = $('#audio-container').width() - 135
    }else if(window.innerWidth <= 600){
      var progressWidth = $(window).width() - 140
      var questionWidth = $('#logged-in-container').width()
    }
    
    $('#chapters-right').width(chapterRightWidth)
    $('#chapter-title-right').width(chapterRightWidth - 160)
    $('.question-container-right').width(questionWidth - 85)
    $('.jp-progress').width(progressWidth)
  }
  
  windowResize = function windowResize(){
    if(window.innerWidth != windowWidth){
      windowWidth = window.innerWidth
      if(window.innerWidth > 900){
        var chapterRightWidth = $('#logged-in-container').width() - 280
        var questionWidth = chapterRightWidth
        var progressWidth = $('#audio-container').width() - 135
      }else if(window.innerWidth <= 900 && window.innerWidth > 600){
        var chapterRightWidth = $('#logged-in-container').width()
        var questionWidth = chapterRightWidth
        var progressWidth = $('#audio-container').width() - 135
      }else if(window.innerWidth <= 600){
        var progressWidth = $(window).width() - 140
        var questionWidth = $('#logged-in-container').width()
      }
      
      $('#chapters-right').width(chapterRightWidth)
      $('#chapter-title-right').width(chapterRightWidth - 160)
      $('.question-container-right').width(questionWidth - 85)
      if($.browser.chrome){
        $('#audio-container #jp_container_1').hide()
        setTimeout(function(){
            $('.jp-progress').width(progressWidth)
        },500);
        setTimeout(function(){
            $('#audio-container #jp_container_1').show(0)
        },800);
      }else{
        $('.jp-progress').width(progressWidth)
      }
    }
  }

  activityResize = function windowResize(){
    if(window.innerWidth <= 500){
      var containerWidth = $('#right-container').width() - 88
    }else{
      var containerWidth = $('#right-container').width() - 95
    }
    $('#activity .activity-container').width(containerWidth)

  }

  sideMenuOpen = function sideMenuOpen(){
    $('.site-cover').show()
    $('body').addClass('noScroll')
    $('header').after(Meteor.render(Template.mobile_menu_tmpl))
    $('.left-menu').animate({'left': '0px'})
    $('.mobile-menu').toggleClass('open closed')
  }

  sideMenuClose = function sideMenuClose(){
    $('.left-menu').animate({'left': '-250px'}, 500, function() {
      $('.site-cover').hide()
      $('body').removeClass('noScroll')
      $('.left-menu').remove()
    });
    $('.mobile-menu').toggleClass('open closed')
  }

  loadingPage = function loadingPage(){
    Session.set('loaded', false);
    $('body').addClass('noScroll')
    setTimeout(function(){pageLoaded()},10000);
  }

  pageLoaded = function pageLoaded(){
    Session.set('loaded', true);
    $('body').removeClass('noScroll')
  }

  landingPieChart = function landingPieChart(one,two,three,four){
    var chart1 = window.chart = $('.chart.one').data('easyPieChart');
    var chart2 = window.chart = $('.chart.two').data('easyPieChart');
    var chart3 = window.chart = $('.chart.three').data('easyPieChart');
    var chart4 = window.chart = $('.chart.four').data('easyPieChart');
    chart1.update(one);
    chart2.update(two);
    chart3.update(three);
    chart4.update(four);
    $('.counter').countTo();
  }

  percentChart = function percentChart(){
    $('.chart').easyPieChart({
        barColor: '#5fcf80',
        scaleColor: false,
        lineCap: 'butt',
        trackColor: '#e5e5e5',
        lineWidth: 45,
        size: 190
    });
    $('.counter').countTo();
  }

  //------------ Functions End ------------//

