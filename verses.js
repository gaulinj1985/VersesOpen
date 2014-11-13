if (Meteor.isClient) {
  var bookColors = ['#e2574c', '#3db39e', '#efc75e', '#2394bc', '#54c975', '#b34967', '#f9845b', '#556b7c', '#53bbb4', '#e15258', '#773053', '#665885', '#bbde66', '#ea4c89', '#b34949', '#2ea5b0', '#d7b344', '#bd3e80', '#ef985e', '#c84d4d', '#6aaec6', '#e6d549', '#479a52', '#8c4f60', '#c792c1', '#7eba66', '#6397a6']
  var bookIds = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev']

  //------------ My Helpers ------------//
  Handlebars.registerHelper("eachkeys", function(obj, fn) {
    var buffer = "",
    key;
     
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        buffer += fn({key: parseInt(key)+1, value: obj[key]});
      }
    }
     
    return buffer;
  });
  //------------ Helpers End ------------//
  Session.setDefault('ready', false)

  Meteor.subscribe( "books_db", function() {})
  Meteor.subscribe( "gifts_db", function() {})
  Meteor.subscribe( "chests_db", function() {})
  Meteor.subscribe( "chestItems_db", function() {})
  Meteor.subscribe( "points_db", function() {})
  Meteor.subscribe( "progress_db", function() {})
  var chaptersReady = Meteor.subscribe( "chapters_db", function() {})
  Meteor.subscribe( "questions_db", function() {})
  Meteor.subscribe( "emailList_db", function() {})
  Meteor.subscribe( "following_db", function() {})
  Meteor.subscribe( "followers_db", function() {})
  Meteor.subscribe( "donations_db", function() {})
  Meteor.subscribe( "activity_db", function() {})
  //Meteor.subscribe("userdata", function() {});
  Session.set('userCount', Meteor.users.find().count())

  Meteor.startup( function() {
      filepicker.setKey("AaMxd4HMjRK2gsK9GLmEXz");
      Stripe.setPublishableKey('pk_live_oGOE112l6Mu0uMADvi6QnIrr');
      $(function(){
        var os = navigator.platform.toLowerCase();
        if( os.indexOf('mac') != -1){
          $('body').addClass('mac');
        }

        $('body').click(function(){
          $('.profile-contain ul').hide()
        })
      })
       FB.init({ 
         appId:'1387339228187004', 
         cookie:true, 
         status:true, 
         xfbml:true 
       });
  });

  Template.outer_tmpl.loaded = function(){
    return Session.get('loaded')
  }

  Template.landing_outer_tmpl.loaded = function(){
    return Session.get('loaded')
  }

  Template.landing_tmpl.scroll = function(){
    var showNav = false;

    $.fn.isOnScreen = function(){
    
        var win = $(window);
        
        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        
        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();
        
        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
        
    };

    $(window).scroll(function () {
        var scrollTop = $(window).scrollTop()
        if(scrollTop >= '600' && !showNav){
            $('header').removeClass('landing-header').css({'top':'-50px'})
            $('header').animate({
                top: 0
            })
            showNav = true
        }else if(scrollTop =='0' && showNav){
            $('header').addClass('landing-header').removeAttr('style')
            showNav = false
        }
    })
   
  }

  Template.landing_tmpl.rendered = function(){
      $('.chart').easyPieChart({
          barColor: '#3b89c1',
          scaleColor: false,
          lineCap: 'butt',
          trackColor: '#e5e5e5',
          lineWidth: 30,
          size: 170
      });
      var visible = false;
      if($('.chart').isOnScreen()){
        landingPieChart(20,61,18,9)
        visible = true
      }else{
        $(window).scroll(function () {
          if(!visible){
            if($('.chart').isOnScreen()){
              landingPieChart(20,61,18,9)
              visible = true
            }
          }
          
        })
      }
      
  }

  Template.total_points_tmpl.points = function(){
    Meteor.call('checkPoints')
    if(Meteor.userId()){
      var points = Points.findOne({owner: Meteor.userId()}).total
      return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  };

  Template.total_chapters_complete_tmpl.stars = function(){
    return Points.findOne({owner: Meteor.userId()}).stars
  };


  Template.chapters_tmpl.books = function(){
    Meteor.subscribe( "books_db", function() {Meteor.call('createBooks');})
    return Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}},{sort: {bookNum: 1}}).fetch();
  }

  Template.chapters_tmpl.gifts = function(){
    return Gifts.find({owner: Meteor.userId()}).fetch();
  }

  Template.chapters_tmpl.chests = function(){
    return Chests.find({owner: Meteor.userId()}).fetch();
  }

  Template.chapters_tmpl.progressPercent = function(){
    var percentage = Math.floor(parseInt(this.chaptersComplete) * 100 / parseInt(this.chapters))
    if(percentage<=100){
     return percentage 
    }
    else{
      return '100'
    }
    
  }

  Template.chapters_tmpl.suggestedBook = function(){
    Meteor.subscribe("userdata", function() {
      if(Meteor.user().profile.bookSuggest){
        var trimmed = Meteor.user().profile.bookSuggest.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
        Session.set('suggestedBook', trimmed)
      }else{
        Session.set('suggestedBook', 'Matthew')
      }
    })
    return Session.get('suggestedBook')
  }

  Template.chapters_tmpl.suggestedBookLink = function(){
    Meteor.subscribe("userdata", function() {
      if(Meteor.user().profile.bookSuggest){
        var trimmed = Meteor.user().profile.bookSuggest.replace(' ', '')
        Session.set('suggestedBookLink', trimmed)
      }else{
        Session.set('suggestedBookLink', 'Matthew')
      }
    })
    return Session.get('suggestedBookLink')
  }

  Template.chapters_tmpl.progressTotalPercent = function(){
    var percentage = Math.floor(parseInt(this.chaptersTotalComplete) * 100 / parseInt(this.chapters))
    if(percentage<=100){
     return percentage 
    }
    else{
      return '100'
    }
  }

  Template.chapters_tmpl.backgroundColor = function(){
    return bookColors[bookNames.indexOf(this.bookName)]
  }

  Template.chapters_tmpl.bookNameTrim = function(){
    var trimmed = this.bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
    return trimmed
  }



  Template.chapters_tmpl.chapterGrammer = function(){
    if(this.chapters > 1){
      return 'chapters'
    }else{
      return 'chapter'
    }
  }

  Template.chapters_tmpl.completeBooks = function(){
    var complete = Books.find({owner: Meteor.userId(), totalComplete: true}).count()
    var more = true
    if(complete==1){
      more = false
    }
    return {'complete':complete, 'more': more}
  }

  Template.chapters_tmpl.bookCoinsEarned = function(){
    return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  Template.chapters_tmpl.rendered = function(){
    if (!this.rendered){
       Meteor.subscribe("userdata", function() {
        if(Meteor.user().profile.newUser == true && $('.overlay-content').length != 1){
          // $('.book-details-bubble').remove()
          // loadInOverlay('overlay-content')
          // $('.overlay-content').append(Meteor.render(Template.tour_tmpl)).addClass('tour-container')
          // $('.overlay-content .close').remove()
        }
       })

    }
  }

  Template.tour_step2_tmpl.underMaxCoins = function(){
    var chapter = Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()});
    if(chapter.coinsAccumulated < chapter.verses){
      return true
    }
  }

  Template.tour_step2_tmpl.coinsAccumulated = function(){
    var chapter = Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()})
    ajaxChapterInfo(chapter)
    return Chapters.findOne({chapter: 1, bookName: 'demo', owner: Meteor.userId()}).coinsAccumulated;
  }

  Template.tour_step3_tmpl.rendered = function(){
    if (!this.rendered){
      $('.complete-true .answers-container').each(function(){
        if($(this).attr('data-answer')){
          var answer = $(this).attr('data-answer')
          $(this).find('.answer'+answer).addClass('correct-answer')
          $('.complete-tour').fadeIn().css('display', 'block');
        }
      })
      this.rendered = true;
    }
  }

  Template.tour_step3_tmpl.questionData = function(){
    var question = Questions.findOne({bookName: 'demo', chapter: 1, owner: Meteor.userId()})
    return question
  }

  Template.tour_step3_tmpl.questionTitle = function(){
   // console.log(Session.get("jsonData"))
    return Session.get("jsonData").questionInfo[1].questions[1]
  }

  Template.tour_step3_tmpl.answers = function(){
    return Session.get("jsonData").questionInfo[1].answers[1]
  }

  Template.tour_step3_tmpl.heart = function(){
    var livesRemain = new Array();
    for(var i=1;i<=this.lives; i++){
      livesRemain[i] = '<div class="heart heart'+i+'"></div>'
    }
    return livesRemain
  }

  Template.single_chapter_tmpl.chapterPull = function(){
    var chapterPull = Chapters.findOne({bookName: Session.get("bookName"), chapter:Session.get("chapterNum"), owner: Meteor.userId()}, {reactive:false});
    return chapterPull
  }
  Template.single_chapter_tmpl.underMaxCoins = function(){
    var chapter = Chapters.findOne({chapter: Session.get("chapterNum"), bookName: Session.get("bookName"), owner: Meteor.userId()});
    if(ChestItems.findOne({owner: Meteor.userId(), unlimitedAudio:{"$exists":true}}) || chapter.coinsAccumulated < chapter.verses){
      return true
    }
  }
  // Template.single_chapter_tmpl.totalVerses = function(){
  //   return Session.get("totalVerses")
  // }
  Template.audio_tmpl.audioFile = function(){
    return Session.get("audioFile")
  }

  Template.book_tmpl.chapterCount = function(){
    return Chapters.find({owner: Meteor.userId(), bookName:Session.get("bookName")}, {sort: {chapter: 1}});
  }

  Template.book_tmpl.selected = function(){
    if(this.chapter == Session.get("chapterNum")){
      return true
    }
  }

  Template.book_tmpl.bookName = function(){
    return Session.get("bookName")
  }

  Template.book_tmpl.bookNameTrimmed = function(){
    return Session.get("bookName").replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
  }

  Template.book_tmpl.backgroundColor = function(){
    return Session.get("backgroundColor")
  }

  Template.book_tmpl.rendered = function(){
    if (!this.rendered){
      audioInitiate()
    }
  }

  Template.star_overlay_tmpl.bookName = function(){
    return Session.get("bookName")
  }

  Template.questions_verses_btns.questionSelected = function(){
    if(Session.get("questionVerseSelect") == 'Questions'){
      return true;
    }
  }

  Template.questions_verses_btns.verseSelected = function(){
    if(Session.get("questionVerseSelect") == 'Verses' || Session.get("questionVerseSelect") == null){
      return true;
    }
  }

  Template.questions_verses_btns.numQuestionsRemain= function(){
    var numQuestions = Chapters.findOne({owner: Meteor.userId(), bookName:Session.get("bookName"), chapter: Session.get("chapterNum")});
    var remain = 3 - parseInt(numQuestions.correctAnswers)
    return remain
  }

  Template.questions_verses_btns.questionsComplete= function(){
    var questionsComplete = Chapters.findOne({owner: Meteor.userId(), bookName:Session.get("bookName"), chapter: Session.get("chapterNum")});
    return questionsComplete.totalComplete
  }

  Template.questions_verses_btns.rendered = function(){
    if (!this.rendered){
      if(Session.get("questionVerseSelect") == 'Verses' || !Session.get("questionVerseSelect")){
        $('#questions-verses-container').html(Meteor.render(Template.verses_tmpl))
      }
      else if(Session.get("questionVerseSelect") == 'Questions'){
        $('#questions-verses-container').html(Meteor.render(Template.questions_tmpl))
      }
    }
  }

  Template.chest_items_tmpl.item = function(){
    return ChestItems.find({owner: Meteor.userId()}).fetch()
  }

  Template.verses_tmpl.verseText = function(){
    return Session.get('verseText')
  }

  Template.verses_tmpl.verseTextLoaded = function(){
    return Session.get("verseTextLoaded")
  }

  Template.questions_tmpl.questionData = function(){
     Meteor.call('questionsInitialize', Session.get("chapterNum"), Session.get("bookName"))
     return Questions.find({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
  }

  Template.questions_tmpl.pointsRemaining = function(){
    var points = this.pointsRemaining
    if(ChestItems.findOne({owner: Meteor.userId(), doubler:{"$exists":true}}) && !this.complete){
      points = points * 2
    }else if(this.complete){
      points = this.pointsAquired
    }
    return points
  }

  Template.questions_tmpl.questionTitle = function(){
    return Session.get("jsonData").questionInfo[Session.get("chapterNum")].questions[this.question]
  }

  Template.questions_tmpl.answers = function(){
    return Session.get("jsonData").questionInfo[Session.get("chapterNum")].answers[this.question]
  }

  Template.questions_tmpl.heart = function(){
    var livesRemain = new Array();
    for(var i=1;i<=this.lives; i++){
      livesRemain[i] = '<div class="heart heart'+i+'"></div>'
    }
    return livesRemain
  }

  Template.questions_tmpl.audioComplete = function(){
    var audioComplete = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
    if(ChestItems.findOne({owner: Meteor.userId(), questionView:{"$exists":true}})){
      return true
    }else if(audioComplete.complete && audioComplete.coinsAccumulated >= audioComplete.verses){
      return true
    }
  }

  Template.questions_tmpl.recycler = function(){
    if(ChestItems.findOne({owner: Meteor.userId(), recycler:{"$exists":true}})){
      return true
    }
  }

  Template.questions_tmpl.specialLives = function(){
    if(ChestItems.findOne({owner: Meteor.userId(), lifeUpgrade:{"$exists":true}})){
      return true
    }
  }

  Template.questions_tmpl.chapter = function(){
    var chapter = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
    return chapter
  }

  Template.questions_tmpl.coinComplete = function(){
    if(this.coinsAccumulated >= this.verses){
      return true
    }
  }

  Template.questions_verses_btns.audioComplete = function(){
    var audioComplete = Chapters.findOne({bookName: Session.get("bookName"), chapter: Session.get("chapterNum"), owner: Meteor.userId()})
    if(ChestItems.findOne({owner: Meteor.userId(), questionView:{"$exists":true}})){
      return true
    }else if(audioComplete.complete && audioComplete.coinsAccumulated >= audioComplete.verses){
      return true
    }
  }

  Template.questions_tmpl.rendered = function(){
    if (!this.rendered){
      $('.complete-true .answers-container').each(function(){
        if($(this).attr('data-answer')){
          var answer = $(this).attr('data-answer')
          $(this).find('.answer'+answer).addClass('correct-answer')
        }
      })
      this.rendered = true;
    }
  }

  Template.outer_tmpl.avatar = function(){
    var imagePath = Meteor.users.findOne({_id:Meteor.userId()})
    Session.set("avatarUrl", imagePath.profile.avatar)
    return "https://s3.amazonaws.com/versesavatars/"+imagePath.profile.avatar
  }

  Template.account_left_tmpl.avatar = function(){
    if(Session.get("avatarUrl")) return "https://s3.amazonaws.com/versesavatars/"+Session.get("avatarUrl")
  }

  Template.account_tmpl.emailVerified = function(){
    return Session.get('emailVerify')
  }

  Template.account_tmpl.emailSent = function(){
    return Session.get('verEmailSent')
  }

  Template.account_left_tmpl.followingCount = function(){
    return Following.find({owner: Meteor.userId()}).count()
  }

  Template.account_left_tmpl.followerCount = function(){
    return Followers.find({owner: Meteor.userId()}).count()
  }

  Template.account_left_tmpl.user = function(){
    if(!Session.get('custId')){
      if(Donations.findOne({owner: Meteor.userId()})){
        Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
      }
    }
    return Meteor.user()
  }

  Template.account_tmpl.pageName = function(){
    var urlName = Backbone.history.fragment.replace('/', '')
    return urlName
  }


  Template.email_ver_alert_tmpl.rendered = function(){
    emailVerified()
  }

  Template.email_sent_alert_tmpl.rendered = function(){
    emailVerified()
  }

  Template.account_tmpl.rendered = function(){
    // if(Backbone.history.fragment.indexOf('i/') >= 0 || Backbone.history.fragment.indexOf('u/') >= 0){
    //   var urlName = Backbone.history.fragment
    // }else{
    //   var urlName = Backbone.history.fragment.replace('/', '')
    // }
    // if (!this.rendered){
    //   var username = Meteor.user().username
    //   if(urlName == 'billing'){
    //     $('.account-nav').removeClass('selected')
    //     $('#billing-info-link').addClass('selected')
    //     $('#lower-right').html(Meteor.render(Template.billing_tmpl))
    //   }else if(urlName == 'profile'){
    //     $('.account-nav').removeClass('selected')
    //     $('#activity-info-link').addClass('selected')
    //     $('#lower-right').html(Meteor.render(Template.activity_tmpl))
    //   }else if(urlName == 'u/'+username){
    //     $('.account-nav').removeClass('selected')
    //     $('#activity-info-link').addClass('selected')
    //     $('#lower-right').html(Meteor.render(Template.activity_tmpl))
    //   }else if(urlName == 'i/'+Session.get('chargeId')){
    //     $('.account-nav').removeClass('selected')
    //     $('#billing-info-link').addClass('selected')
    //     $('#lower-right').html(Meteor.render(Template.invoice_tmpl))
    //   }
    //   this.rendered = true;
    // }
  }

  Template.book_tmpl.chaptersLoading = function(){
    return !chaptersReady.ready()
  }

  Template.single_chapter_tmpl.rendered = function(){
      windowLoad()
      $( window ).resize(function() {
        windowResize()
      });
  }

  Template.single_chapter_tmpl.chaptersLoading = function(){
    return !chaptersReady.ready()
  }

  Template.single_chapter_tmpl.backgroundColor = function(){
    return Session.get('backgroundColor')
  }

  Template.account_right_tmpl.user = function(){
    if(!Session.get('custId')){
      if(Donations.findOne({owner: Meteor.userId()})){
        Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
      }
    }
    return Meteor.user()
  }

  Template.account_right_tmpl.donationsExist = function(){
    if(Donations.find({owner: Meteor.userId()}).fetch().length){
      return true
    }
  }

  Template.drop_menu_tmpl.donationsExist = function(){
    if(Donations.find({owner: Meteor.userId()}).fetch().length){
      return true
    }
  }

  Template.mobile_menu_tmpl.followingCount = function(){
    return Following.find({owner: Meteor.userId()}).count()
  }

  Template.mobile_menu_tmpl.followerCount = function(){
    return Followers.find({owner: Meteor.userId()}).count()
  }

  Template.account_info_tmpl.profile = function(){
    //console.log(Meteor.user().profile)
    return Meteor.user().profile
  }

  Template.account_info_tmpl.user = function(){
    return Meteor.user()
  }

  Template.account_info_tmpl.jsonKingBooks = function(){
    if(Meteor.user().profile.version == 'jsonKingBooks'){
      return true
    }
  }

  Template.account_info_tmpl.jsonBooks = function(){
    if(Meteor.user().profile.version == 'jsonBooks'){
      return true
    }
  }

  Template.account_following_tmpl.followingUsers = function(){
      Meteor.call('displayFollowing', Session.get('profileID'), function (error, result){
        if(result){
          if(result.length >= 9){
            var newResults = new Array()
            var remainingResults = result.length - 8
            for(var i = 0; i < 8; i++){
              newResults[i] = result[i]
            }
            var newResultsPlus = new Array()
            var b = 0;
            for(var a = 0; a <= result.length-1; a++){
              if (a<8) continue;
              newResultsPlus[b] = result[a]
              b++
            }
            Session.set('followingResultPlusUsers', newResultsPlus)
            Session.set('followingResult', newResults)
            Session.set('followingResultPlus', remainingResults)
          }else{
            Session.set('followingResultPlus', '')
            Session.set('followingResult', result)
          }
        }else{
          Session.set('followingResult', '')
        }
        
        //console.log(result.length)
        
      })
      //console.log(Session.get('followingResult'))
      return Session.get('followingResult')
  }

  Template.account_following_tmpl.publicPage = function(){
    var isPublicPage = Session.get('profileID') != Meteor.userId() ? true : false;
    return isPublicPage
  }

  

  Template.account_follower_tmpl.followerUsers = function(){
      Meteor.call('displayFollowers', Session.get('profileID'), function (error, result){
        if(result){
          if(result.length >= 9){
            var newResults = new Array()
            var remainingResults = result.length - 8
            for(var i = 0; i < 8; i++){
              newResults[i] = result[i]
            }
            var newResultsPlus = new Array()
            var b = 0;
            for(var a = 0; a <= result.length-1; a++){
              if (a<8) continue;
              newResultsPlus[b] = result[a]
              b++
            }
            Session.set('followerResultPlusUsers', newResultsPlus)
            Session.set('followerResult', newResults)
            Session.set('followerResultPlus', remainingResults)
          }else{
            Session.set('followerResultPlus', '')
            Session.set('followerResult', result)
          }
          //console.log(result.length)
        }else{
          Session.set('followerResult', '')
        }
      })
      //console.log(Session.get('followingResult'))
      return Session.get('followerResult')
  }

  Template.account_follower_tmpl.followerResultPlus= function(){
    return Session.get('followerResultPlus')   
  }

  Template.account_follower_tmpl.totalFollowers = function(){
    return Session.get('followerResult').length + Session.get('followerResultPlus')
  }

  Template.account_follower_plus_tmpl.followerResultPlus = function(){
    //console.log(Session.get('followerResultPlusUsers'))
    return Session.get('followerResultPlusUsers')
  }

  Template.account_following_tmpl.followingResultPlus= function(){
    return Session.get('followingResultPlus')
  }

  Template.account_following_plus_tmpl.followingResultPlus = function(){
    //console.log(Session.get('followerResultPlusUsers'))
    return Session.get('followingResultPlusUsers')
  }

  Template.account_following_tmpl.totalFollowing = function(){
    if(Session.get('followingResult')){
      return Session.get('followingResult').length + Session.get('followingResultPlus')
    }else{
      return 0
    }
    
  }

  Template.public_profile_tmpl.user = function(){
    return Meteor.users.findOne({'_id':Session.get('profileID')})
  }

  Template.public_profile_tmpl.following = function(){
    var followingUser = Following.findOne({owner: Meteor.userId(), following:Session.get('profileID')})
    if(followingUser){
      return true
    }
  }

  Template.public_profile_tmpl.points = function(){
    if(Points.findOne({owner: Session.get('profileID')})){
      var points = Points.findOne({owner: Session.get('profileID')}).total
      return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }else{
      return '0'
    }
  }

  Template.public_profile_tmpl.activity = function(){
    return Activity.find({owner: Session.get('profileID')},{sort: {date: -1}, limit:10})
  }

  Template.public_profile_tmpl.demo = function(){
    if(this.bookName == 'demo'){
      return true
    }
  }

  Template.public_profile_tmpl.followingUser = function(){
    Meteor.subscribe("activitydata", this.activityFollowing)
    return Meteor.users.findOne({_id:this.activityFollowing})
  }

  Template.public_profile_tmpl.likes = function(){
    return this.like.length
  }

  Template.public_profile_tmpl.likeNames = function(){
    if(this.like.length){
      var namesString
      var self = this
      Meteor.subscribe("likedata", this.like, function(){
        for(var i=0;i<=self.like.length-1; i++){
          if(i == 0){
            Session.set('likeNameString', Meteor.users.findOne({_id:self.like[i]}).username)
          }else{
            Session.set('likeNameString', Session.get('likeNameString')+', '+Meteor.users.findOne({_id:self.like[i]}).username) 
          }
        }
      })
      return Session.get('likeNameString')
    }
  }

  Template.public_profile_tmpl.chapterGrammer = function(){
    if(this.completedChapter.length > 1){
      return 'chapters'
    }else{
      return 'chapter'
    }
  }

  Template.public_profile_tmpl.rendered = function(){
    $('#activity .timestamp-container').each(function(){
      if(!$(this).hasClass('rendered')){
        var time = $(this).find('.timestamp').html()
        $(this).addClass('rendered')
        $(this).find('.timestamp').html($.timeago(time))
      }
      
    })

    activityResize()
    $( window ).resize(function() {
      activityResize()
    });

    percentChart()
  }

  Template.public_profile_tmpl.followingCount = function(){
    Meteor.call('displayFollowing', Session.get('profileID'), function (error, result){
      Session.set('followingMobilePublic', result.length)
    })
    return Session.get('followingMobilePublic')
  }

  Template.public_profile_tmpl.followerCount = function(){
    Meteor.call('displayFollowers', Session.get('profileID'), function (error, result){
      Session.set('followerMobilePublic', result.length)
    })
    return Session.get('followerMobilePublic')
  }

  Template.public_profile_tmpl.bookNameTrim = function(){
    if(this.bookName){
      var bookName = this.bookName
    }else{
      var bookName = this.bookComplete
    }
    var trimmed = bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
    return trimmed
  }

  Template.public_profile_tmpl.badges = function(){
    var badges = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, totalComplete:true}, {fields: {'bookName': 1, 'completeDate': 1}, sort: {date: -1}}).fetch()
    return badges
  }

  Template.public_profile_tmpl.completeDate = function(){
    if(this.completeDate){
      var d = new Date(this.completeDate);
    }else{
      var d = new Date();
    }
      var curr_date = d.getDate();
      var curr_month = d.getMonth();
      var curr_year = d.getFullYear();
      
      return curr_date + " " + monthNames[curr_month] + " " + curr_year 
    
  }

  Template.public_profile_tmpl.progressData = function(){
    var bookProgress = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }},{sort: {bookCoinsEarned: -1}}).fetch()
    return bookProgress
  }

  Template.public_profile_tmpl.progressPercent = function(){
    Meteor.call('publicPercent', Session.get('profileID'), function(error, result){
      Session.set('publicPercent', result)
    })
    return Session.get('publicPercent')
  }

  Template.public_profile_tmpl.bookCoinsEarned = function(){
    return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  Template.public_profile_tmpl.backgroundColor = function(){
    return bookColors[bookNames.indexOf(this.bookName)]
  }

  Template.public_profile_tmpl.chart = function(){
    Meteor.subscribe("books_db", function onComplete() {
      var bookProgress = Books.find({owner: Session.get('profileID'), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }}).fetch()
      var graphArray = new Array()

      $.each(bookProgress, function( index, value ) {
        if(value.bookCoinsEarned){
          graphArray.push({
            value: value.bookCoinsEarned,
            color: bookColors[bookNames.indexOf(value.bookName)]
          })
        }
      
      });

      if(!ChartObject){
        var interestContext = $("#canvas").get(0).getContext("2d");
        var ChartObject = new Chart(interestContext);

        ChartObject.Doughnut(graphArray);
      }
    })
  }



  Template.outer_tmpl.rendered = function(){
      preload([
          '/images/loader.gif',
          '/images/loader_white.gif',
          '/images/small-loader.gif'
      ]);

      Meteor.subscribe("userdata", function() {

        if(Meteor.user() && !$('.uv-icon').length && !isMyScriptLoaded('http://widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js')){
          
          // Include the UserVoice JavaScript SDK (only needed once on a page)
          UserVoice=window.UserVoice||[];(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/IDaui0jyJUpmVFn7PYrNg.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})();

          //
          // UserVoice Javascript SDK developer documentation:
          // https://www.uservoice.com/o/javascript-sdk
          //

          // Set colors
          UserVoice.push(['set', {
            accent_color: '#e23a39',
            trigger_color: 'white',
            trigger_background_color: 'rgba(42, 42, 42, 0.6)'
          }]);
          var name
          
          if(Meteor.user().profile.name){
            name = Meteor.user().profile.name
          }else{
            name = Meteor.user().username
          }
          
          // Identify the user and pass traits
          // To enable, replace sample data with actual user traits and uncomment the line
          UserVoice.push(['identify', {
            email:      Meteor.user().profile.email, // User’s email address
            name:       name, // User’s real name
            created_at: Meteor.user().createdAt, // Unix timestamp for the date the user signed up
            id:         Meteor.userId() // Optional: Unique id of the user (if set, this should not change)
            //type:       'Owner', // Optional: segment your users by type
            //account: {
            //  id:           123, // Optional: associate multiple users with a single account
            //  name:         'Acme, Co.', // Account name
            //  created_at:   1364406966, // Unix timestamp for the date the account was created
            //  monthly_rate: 9.99, // Decimal; monthly rate of the account
            //  ltv:          1495.00, // Decimal; lifetime value of the account
            //  plan:         'Enhanced' // Plan name for the account
            //}
          }]);

          // Add default trigger to the bottom-right corner of the window:
          UserVoice.push(['addTrigger', { mode: 'contact', trigger_position: 'bottom-right' }]);

          // Or, use your own custom trigger:
          //UserVoice.push(['addTrigger', '#id', { mode: 'contact' }]);

          // Autoprompt for Satisfaction and SmartVote (only displayed under certain conditions)
          UserVoice.push(['autoprompt', {}]);
        }else{

        }
      })
  }

  Template.outer_tmpl.live = function(){
    return Session.get('live')
  }

  Template.landing_outer_tmpl.live = function(){
    return Session.get('live')
  }

  Template.sign_up_overlay_tmpl.errorMsg = function(){
    return Session.get('errorMsg')
  }

  Template.sign_in_overlay_tmpl.errorMsg = function(){
    return Session.get('errorMsg')
  }

  Template.forgot_password_overlay_tmpl.errorMsg = function(){
    return Session.get('errorMsg')
  }

  Template.forgot_password_overlay_tmpl.resetPassword = function(){
    return Session.get('resetPassword');
  }

  Template.forgot_password_overlay_tmpl.loading = function(){
    return Session.get('loading');
  }

  Template.forgot_password_overlay_tmpl.emailSent = function(){
    return Session.get('emailSent');
  }

  Template.admin_content_tmpl.user = function(){
    return Meteor.users.find({}, {sort: {"profile.progressPercent": -1}});  
  }

  Template.admin_tmpl.rendered = function(){
    if (!this.rendered){
      Meteor.subscribe( "progress_db", function() {progressGraph()})
      $(".admin-container").empty().html(Meteor.render(Template.admin_content_tmpl))
      this.rendered = true;
    }
     
  }

  Template.admin_content_tmpl.userCount = function(){
    return Meteor.users.find().count()
  }

  Template.admin_tmpl.userCount = function(){
    return Meteor.users.find().count()
  }

  Template.admin_tmpl.emailCount = function(){
    return EmailList.find().count()
  }

  Template.admin_content_tmpl.dayProgress = function(){
    return Session.get('dayProgress')
  }

  Template.admin_content_tmpl.monthName = function(){
    return Session.get('currentMonth')
  }

  Template.signup_email_tmpl.signupEmail = function(){
    return EmailList.find()
  }

  Template.user_email_tmpl.userEmail = function(){
    return Meteor.users.find()
  }

  Template.search_results_tmpl.following = function(){
    //console.log(this._id)
    var followingUser = Following.findOne({owner: Meteor.userId(), following:this._id})
    if(followingUser){
      return true
    }
  }

  Template.search_results_tmpl.user = function(){
    return Session.get('userSearchResult')
  }

  Template.search_results_tmpl.query = function(){
    return Session.get('userSearchQuery')
  }

  Template.search_results_tmpl.queryCount = function(){
    return Session.get('userSearchCount')
  }

  Template.credit_form_tmpl.loggedIn = function(){
    return Session.get('loggedIn')
  }

  Template.credit_form_tmpl.donateAmount = function(){
    return Session.get('donationAmountDec')
  }

  Template.billing_tmpl.creditCardInfo = function(){
    if(Donations.findOne({owner: Meteor.userId()})){
      Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
      Meteor.call('pullCustomer', function (error, result){
        Session.set('custInfo',{cardNum:result.cards.data[0].last4, cardExpMonth: result.cards.data[0].exp_month, cardExpYear: result.cards.data[0].exp_year, cardType: result.cards.data[0].type})
      })
      return Session.get('custInfo')
    }
    
  }

  Template.billing_tmpl.custCharges = function(){
    listAllCharges()
    return Session.get('listCharges')
  }

  Template.billing_tmpl.totalDonated = function(){
    if(Session.get('totalDonated') == ""){
      //console.log('if')
      var total = Session.get('totalDonated')
      return String(total).replace(/([0-9][0-9])$/, ".$1")
    }else{
      listAllCharges()
      var total = Session.get('totalDonated')
      if(Session.get('totalDonated')){
        return String(total).replace(/([0-9][0-9])$/, ".$1")
      }
      
    }
  }

  Template.invoice_tmpl.invoice = function(){
    if(Session.get('invoice') && Session.get('invoice') != 'invalid'){
      if(Session.get('invoice').id == Session.get('chargeId')){
        return Session.get('invoice')
      }else{
        Session.set('invoice','')
      }
    }
    
    if(Session.get('chargeId')){
      Meteor.call('displayCharge', Session.get('chargeId'), function(error, result){
        Session.set('invoice', result)
      })
      return Session.get('invoice')
    }
    
  }

  Template.invoice_tmpl.invalid = function(){
    if(Session.get('invoice') == 'invalid'){
      return true
    }
  }

  Template.invoice_tmpl.amountDec = function(){
    return String(this.amount).replace(/([0-9][0-9])$/, ".$1")
  }

  Template.invoice_tmpl.date = function(){
    var date = new Date(this.created * 1000);
    return monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
  }

  Template.donate_thanks_tmpl.id = function(){
    if(Session.get('chargeId')){
      return Session.get('chargeId')
    }
  }

  Template.credit_form_tmpl.creditCardInfo = function(){
    Session.set('custId', Donations.findOne({owner: Meteor.userId()}).custId) 
    Meteor.call('pullCustomer', function (error, result){
      Session.set('custInfo',{cardNum:result.cards.data[0].last4, cardExpMonth: result.cards.data[0].exp_month, cardExpYear: result.cards.data[0].exp_year, cardType: result.cards.data[0].type})
    })
    return Session.get('custInfo')
  }

  Template.credit_form_tmpl.custId = function(){
    if(Meteor.userId()){
      if(Donations.findOne({owner: Meteor.userId()})){
        return true
      }
    }
  }

  Template.activity_page_tmpl.pageName = function(){
    var urlName = Backbone.history.fragment.replace('/', '')
    return urlName
  }

  Template.activity_tmpl.activity = function(){
    return Activity.find({owner: Meteor.userId()},{sort: {date: -1}, limit:10})
  }

  Template.activity_tmpl.followingUser = function(){
    Meteor.subscribe("activitydata", this.activityFollowing)
    return Meteor.users.findOne({_id:this.activityFollowing})
  }

  Template.activity_tmpl.likes = function(){
    return this.like.length
  }

  Template.activity_tmpl.demo = function(){
    if(this.bookName == 'demo'){
      return true
    }
  }

  Template.activity_tmpl.likeNames = function(){
    if(this.like.length){
      var namesString
      var self = this
      Meteor.subscribe("likedata", this.like, function(){
        for(var i=0;i<=self.like.length-1; i++){
          if(i == 0){
            Session.set('likeNameString', Meteor.users.findOne({_id:self.like[i]}).username)
          }else{
            Session.set('likeNameString', Session.get('likeNameString')+', '+Meteor.users.findOne({_id:self.like[i]}).username) 
          }
        }
      })
      return Session.get('likeNameString')
    }
  }

  Template.activity_tmpl.chapterGrammer = function(){
    if(this.completedChapter.length > 1){
      return 'chapters'
    }else{
      return 'chapter'
    }
  }

  Template.activity_tmpl.bookNameTrim = function(){
    if(this.bookName){
      var bookName = this.bookName
    }else{
      var bookName = this.bookComplete
    }
    var trimmed = bookName.replace('1 ', 'first').replace('2 ', 'second').replace('3 ', 'third')
    return trimmed
  }

  Template.activity_tmpl.badges = function(){
    var badges = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, totalComplete:true}, {fields: {'bookName': 1, 'completeDate': 1}, sort: {date: -1}}).fetch()
    return badges
  }

  Template.activity_tmpl.completeDate = function(){
    if(this.completeDate){
      var d = new Date(this.completeDate);
    }else{
      var d = new Date();
    }
      var curr_date = d.getDate();
      var curr_month = d.getMonth();
      var curr_year = d.getFullYear();
      
      return curr_date + " " + monthNames[curr_month] + " " + curr_year 
    
  }

  Template.activity_tmpl.progressData = function(){
    var bookProgress = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }},{sort: {bookCoinsEarned: -1}}).fetch()
    return bookProgress
  }

  Template.activity_tmpl.bookCoinsEarned = function(){
    return this.bookCoinsEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  Template.activity_tmpl.backgroundColor = function(){
    return bookColors[bookNames.indexOf(this.bookName)]
  }

  Template.activity_tmpl.progressPercent = function(){
    var progressPercent = Meteor.user().profile.progressPercent
    return progressPercent
  }

  Template.activity_tmpl.rendered = function(){
    $('#activity .timestamp-container').each(function(){
      if(!$(this).hasClass('rendered')){
        var time = $(this).find('.timestamp').html()
        $(this).addClass('rendered')
        $(this).find('.timestamp').html($.timeago(time))
      }
      
    })
    

    activityResize()
    $( window ).resize(function() {
      activityResize()
    });
    percentChart()
  }

  Template.activity_tmpl.chart = function(){
    Meteor.subscribe("books_db", function onComplete() {
      var bookProgress = Books.find({owner: Meteor.userId(), bookName:{$ne: 'demo'}, bookCoinsEarned:{ $gt: 0 }}).fetch()
      var graphArray = new Array()

      $.each(bookProgress, function( index, value ) {
        if(value.bookCoinsEarned){
          graphArray.push({
            value: value.bookCoinsEarned,
            color: bookColors[bookNames.indexOf(value.bookName)]
          })
        }
      
      });

      if(!ChartObject){
        var interestContext = $("#canvas").get(0).getContext("2d");
        var ChartObject = new Chart(interestContext);

        ChartObject.Doughnut(graphArray);
      }
    })
  }

  Template.chest_overlay_tmpl.rendered = function(){
    if(!$('.bx-wrapper').length){
      slidey = $('.all-choices-mobile ul').bxSlider({
        controls: false,
        touchEnabled: true,
        oneToOneTouch: true
      });
      $('.choice').each(function(){
        if($(this).hasClass('active')){
          slidey.goToSlide($(this).attr('data-slide-num'));
        }
      })
    }
    
  }

  Template.search_user_tmpl.queryLoaded = function(){
    return Session.get('userSearchLoaded')
  }

  Template.email_ver_alert_tmpl.events({
    'click .close' : function(event){
      $('.email-verified').remove()
    }
  })

  Template.email_sent_alert_tmpl.events({
    'click .close' : function(event){
      $('.email-verified').remove()
    }
  })

  Template.donate_tmpl.events({
    'click .donate-now' : function(event){
      var donationAmount = $('#donation-amount').val()
      var loggedIn = (Meteor.userId()) ? true : false;
      Session.set('loggedIn', loggedIn)
      Session.set('donationAmount', donationAmount.replace(/\./g, ''))
      Session.set('donationAmountDec', donationAmount)
      if(Donations.findOne({owner: Meteor.userId()})){
        $('.donate-now').hide()
        $('.form-load').show()
      }
      $('#donation-container').html(Meteor.render(Template.credit_form_tmpl))

      return false;
    },
    'click .donate-login' : function(event){
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.sign_in_overlay_tmpl)).addClass('no-route')
      return false;
    },
    'click .donate-anon' : function(event){
      Session.set('loggedIn', true)
      return false;
    },
    'click .change' : function(event){
      $('#donation-container').html(Meteor.render(Template.donate_form_tmpl)).find('#donation-amount').val(Session.get('donationAmountDec'))
      return false;
    },
    'click .change-card': function(){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.card_change_tmpl))
      return false
    },
    'click .submit-payment.existing' : function(event){
      $('.submit-payment').hide();
      $('.form-load').show();
      Meteor.call('donateChargeExisting', Session.get('donationAmount'), function(err, data){
        //console.log(data)
        if(data[0] == 'err'){
         //console.log(data.message) 
         $('#card-info-container').prepend('<div class="error-message">'+data[1].message+'</div>')
         $('.submit-payment').show();
         $('.form-load').hide();
        }else{
          Session.set('chargeId', data[1].id)
          $('#donation-container').html(Meteor.render(Template.donate_thanks_tmpl))
        }
        
      })
      return false;
    },
    'click .submit-payment.new' : function(event){
      var $form = $('#payment-form');
      Session.set('tokenForm', '#payment-form')
      // Disable the submit button to prevent repeated clicks
      $form.find('.submit-payment').hide();
      $form.find('.form-load').show();

      var name = "Anonymous"
      if(Meteor.user()){
        name = $('.full-name').val()
      }

      Stripe.card.createToken({
        name: name,
        number: $('.card-number').val(),
        cvc: $('.card-cvc').val(),
        exp_month: $('.card-month').val(),
        exp_year: $('.card-year').val()
      }, stripeResponseHandler);

      
      // Prevent the form from submitting with the default action
      return false;
    },
    'click #form-complete': function(){
      var token = $('#payment-form #tokenId').val();
      Meteor.call('donateCharge', token, Session.get('donationAmount'), function(err, data){
        //console.log(data)
        if(data[0] == 'err'){
         //console.log(data.message) 
         $('#card-info-container').prepend('<div class="error-message">'+data[1].message+'</div>')
         $('.submit-payment').show();
         $('.form-load').hide();
        }else if(data[0] == 'charge'){
          Session.set('chargeId', data[1].id)
          $('#donation-container').html(Meteor.render(Template.donate_thanks_tmpl))
        }else{
          $('#donation-container').html(Meteor.render(Template.donate_thanks_tmpl))
        }
      })
    }
  })





  Template.landing_tmpl.events({
    'click .sign-up-landing' : function(){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.landing_email_tmpl)).addClass('email-signup-overlay')
      //$('.overlay-content').append(Meteor.render(Template.sign_up_overlay_tmpl))
      return false;
    }
  })

  Template.landing_email_tmpl.events({
    'click .email-send' : function(){
      $('.email-input').removeClass('error')
      $('.email-notification').removeClass('email-error').removeClass('email-success')
      $('.email-notification').html('<img src="/images/loader.gif" alt="Loading..." />').show()
      var email = validateEmail($('.email-input').val())
      if($('.email-input').val()){
        if(email){
          var html = Template.email_list_tmpl({
            message: 'welcome'
          })
          Meteor.call('emailWaitingList', $('.email-input').val(), html, function (error, result) { 
            if(result == false){
              $('.email-input').addClass('error')
              $('.email-notification').html("The email entered already exists").addClass('email-error')
            }else{
              $('.email-input').val('')
              $('.email-notification').html("Thanks! We\'ll let you know as soon as we\'re up and running").addClass('email-success')
              $('.email-notification').delay(4500).fadeOut(300)
            }
            return false
          })
          
        }else{
          $('.email-input').addClass('error')
          $('.email-notification').html("The email entered is incorrect").addClass('email-error')
        }
      }else{
        $('.email-input').addClass('error')
        $('.email-notification').html("Please enter your email address").addClass('email-error')
      }
      
      
      return false;
    }
    
  })

  Template.landing_outer_tmpl.events({
    'click .sign-in-btn' : function(){
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.sign_in_overlay_tmpl))
      return false;
    },
    'click .sign-up-btn' : function(){
      Session.set('errorMsg', '')
       loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.sign_up_overlay_tmpl))
      return false;
    }
  })

  Template.outer_tmpl.events({
    'click .sign-in-btn' : function(){
      Session.set('errorMsg', '')
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.sign_in_overlay_tmpl))
      return false;
    },
    'click .sign-up-btn' : function(){
      Session.set('errorMsg', '')
       loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.sign_up_overlay_tmpl))
      return false;
    },
    'click .sign-out-btn' : function(){
      $('.left-menu .sign-out-btn').css({'background-color':'#444444'})
      $('.sign-out-btn .sign-out').addClass('signing-out')
      Meteor.logout(function(err){
        //console.log(err)
        // removeUserVoice()
        // Spark.finalize($("body")[0])
        // $("body").empty().html(Meteor.render(Template.landing_tmpl))
        // console.log('sign out')
        // Router.navigate("/",{trigger:true});
        window.location.href = '/';
      })
      
      return false;
    },
    'click .home' : function(){
      window.location.href = '/';
      // Router.home();
      // sideMenuClose()
      // $('.profile-contain ul').hide()
      // $('html,body').scrollTop(0);
      return false
    },
    'click .my-profile' : function(){
      window.location.href = '/profile';
      //Router.navigate("/profile", {replace: false});
      //Router.profile();
      // sideMenuClose()
      // $('.profile-contain ul').hide()
      // $('html,body').scrollTop(0);
      return false
    },
    'click .my-settings' : function(){
      window.location.href = '/account';
      // Router.account();
      // sideMenuClose()
      // $('.profile-contain ul').hide()
      // $('html,body').scrollTop(0);
      return false
    },
    'click .my-billing' : function(){
      window.location.href = '/billing';
      // Router.billing();
      // sideMenuClose()
      // $('.profile-contain ul').hide()
      // $('html,body').scrollTop(0);
      return false
    },
    'click .my-search' : function(){
      window.location.href = '/search';
      // Router.billing();
      // sideMenuClose()
      // $('.profile-contain ul').hide()
      // $('html,body').scrollTop(0);
      return false
    },
    'click .profile-contain' : function(e){
      $('.profile-contain ul').show()
      e.stopPropagation();
      return false
    },
    'click .logo' : function(){
      //Router.home();
      window.location.href = '/';
      return false
    },
    'click .top-search-icon': function(e){
      var searchVal = $('#top-search-input').val()
      search(searchVal)
      return false
    },
    'keypress #top-search-input': function(e){
      var searchVal = $('#top-search-input').val()
      if (e.keyCode == 13) {
        search(searchVal)
        return false
      }
    },
    'click .mobile-menu.open': function(e){
      sideMenuClose()
      return false
    },
    'click .mobile-menu.closed': function(e){
      sideMenuOpen()
      return false
    },
    'click .site-cover': function(e){
      sideMenuClose()
      return false
    }
  })

  Template.account_tmpl.events({
    'change #attachment': function(e){
        var input = e.target

        if (!input.files[0]) {
            //console.log("Choose an image to store to S3");
        } else {
          var type = input.files[0].type
          //console.log(input.files[0])
          if(type.substring(0, type.indexOf('/')) != 'image'){
              $('#left-container .error').html('Must be an image file')
              $('#left-container .error').show().delay(5000).fadeOut()
          }else if(input.files[0].size > 500000){
              $('#left-container .error').html('File size too big')
              $('#left-container .error').show().delay(5000).fadeOut()
          }else{
            $('#left-container .progress').show()
            filepicker.store(input.files[0], function(InkBlob){
                filepicker.convert(InkBlob, {width: 138, height: 138, fit: 'crop'},{location: 'S3'},
                    function(new_InkBlob){
                        var imagePath = JSON.stringify(new_InkBlob.key).replace(/\"/g,"")
                        Meteor.call('updateUserAvatar', imagePath)
                    }
                );
                
              }, function(FPError) {
                console.log(FPError.toString());
              }, function(progress) {
                $('#left-container .progress span.complete').animate({width: progress+"%"})
                if(progress == 100){
                  $('#left-container .progress').delay(500).fadeOut(1000, function(){
                    $('#left-container .progress span.complete').css('width',"0%")
                  })
                }
              }
           );
          }
        }
    },
    'click .bible-version': function(e){
      $('.bible-version').removeClass('selected')
      $(e.target).addClass('selected')
      return false
    },
    'click .save-profile': function(){
      var profileName = $('#profile-name').val()
      var profileEmail = $('#profile-email').val()
      var profileUsername = $('#profile-username').val()
      var profileBio = $('#profile-bio').val()
      var oldPassword = $('#old-password').val()
      var newPassword = $('#new-password').val()
      var retypePassword = $('#retype-password').val()
      var profileBibleVersion = 'jsonBooks'
      // $('.bible-version').each(function(){
      //   if($(this).hasClass('selected')){
      //     profileBibleVersion = $(this).attr('data-version')
      //   }
      // })

      $('.password').removeClass('error')
      $('.error-message').hide()
      if(oldPassword || newPassword || retypePassword){
        if(oldPassword && newPassword && retypePassword){
          if(newPassword == retypePassword){
            Accounts.changePassword(oldPassword, newPassword, function(error){
              if(error){
                $('#old-password').addClass('error')
                $('.error-message').show().html("That's not your old password")
              }
            })
          }else{
            $('#retype-password').addClass('error')
            $('.error-message').show().html("The new passwords don't match")
          }
        }else{
          $('.password').each(function(){
            var empty = ($(this).val()) ? false : true
            if(empty){
              $(this).addClass('error')
              $('.error-message').show().html('Field is empty')
            }
          })
        }
      }
      if(profileBibleVersion != Meteor.user().profile.version){
        Session.set("jsonDataChapter","")
      }
      Meteor.call('updateProfile', profileName, profileEmail, profileUsername, profileBio, profileBibleVersion, function(error, result){
        var savedSpan = $('#account-container .buttons .saved')
        if(result == 'saved'){
          savedSpan.html('Saved!').css('color','#2ABB26').show().delay(2000).fadeOut()
        }else if(result == 'emailError'){
          savedSpan.html('Invalid email').css('color','#D40000').show().delay(2000).fadeOut()
        }else if(result == 'usernameError'){
          savedSpan.html('Username cannot contain spaces').css('color','#D40000').show().delay(2000).fadeOut()
        }
        
      })
      return false
    },
    'mouseover .user-container.minus': function(e){
      popupBubble($(e.target), this.username)
    },
    'mouseout .user-container.minus': function(e){
      $('.popup-bubble').remove()
    },
    'click .user-container.plus.followers': function(e){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.account_follower_plus_tmpl)).addClass('follow-overlay')
      return false
    },
    'click .user-container.plus.following': function(e){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.account_following_plus_tmpl)).addClass('follow-overlay')
      return false
    }
  })

  Template.account_info_tmpl.events({

    'mouseover .email-container span': function(e){
      var content = $(e.target).html()
      popupBubble($(e.target), content)
    },
    'mouseout .email-container span': function(e){
      $('.popup-bubble').remove()
    },
    'click .email-container .not-verified': function(e){
      Session.set('verEmailSent', true)
      Meteor.call('sendVerification', Meteor.userId())
    }

  })

  Template.account_left_tmpl.events({
    'click .choose-avatar': function(){
      $('#attachment').click()
      return false
    },
    'mouseover .user-container.minus': function(e){
      popupBubble($(e.target), this.username)
    },
    'mouseout .user-container.minus': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.account_right_tmpl.events({
    'click #account-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#account-info-link').addClass('selected')
      $('#lower-right').html(Meteor.render(Template.account_info_tmpl))
      Router.navigate("/account");
      return false
    },
    'click #billing-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#billing-info-link').addClass('selected')
      $('#lower-right').html(Meteor.render(Template.billing_tmpl))
      Router.navigate("/billing");
      return false
    },

    'click #activity-info-link': function(){
      $('.account-nav').removeClass('selected')
      $('#activity-info-link').addClass('selected')
      $('#lower-right').html(Meteor.render(Template.activity_tmpl))
      Router.navigate("/profile");
      return false
    }
  })

  Template.billing_tmpl.events({
    'click .change-card': function(){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.card_change_tmpl))
      return false
    }
  })

  Template.invoice_tmpl.events({
    'click .close': function(e){
      $('#lower-right').html(Meteor.render(Template.billing_tmpl))
      Router.navigate("/billing");
      return false
    },
    'click .print': function(e){
      $('.invoice-content').printArea(); 
      return false
    }
  })

  Template.activity_tmpl.events({
    'click .like': function(e){
      $('.popup-bubble').remove()
      Meteor.call('likeActivity', this._id)
      return false
    },
    'mouseover .like': function(e){
      $('.popup-bubble').remove()
      var names = $(e.currentTarget).find('b').html()
      if(names) popupBubble($(e.currentTarget), names);
      return false
    },
    'mouseout .like': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.card_change_tmpl.events({
    'click .save-card': function(){
      $('.save-card').hide()
      $('#card-change-form .form-load').show()
      var $form = $('#card-change-form');
      Session.set('tokenForm', '#card-change-form')
      Stripe.card.createToken($form, stripeResponseHandler);
      return false
    },
    'click #form-complete': function(){
      var token = $('#card-change-form').find('#tokenId').val();
      if(token){
        Meteor.call('createCard', token, function(err, cardData){
          if(err){
           console.log('card: '+err) 
          }
          Meteor.call('updateDefaultCard', cardData.id, function(err, custData){
            if(err){
             console.log('customer: ' +err) 
            }
            $('.black-overlay .close').click()
          })
        })
      }
      return false
    }
  })

  Template.tour_tmpl.events({
    'click #book-0-box': function(){
      Session.set('audioFile', 'https://s3.amazonaws.com/versesweb/audio/demo.mp3')
      Session.set("verseAudioBegin", '')
      $('.overlay-content').html(Meteor.render(Template.tour_step2_tmpl))
      audioInitiate('demo')
      return false
    },
    'click .skip-tour':function(){
      Meteor.call('updateNewUser')
      $('.black-overlay, .tour-container').remove()
      $('body').removeClass('noScroll')
    }
  })

  Template.tour_step2_tmpl.events({
    'click .skip-tour':function(){
      Meteor.call('updateNewUser')
      $('.black-overlay, .tour-container').remove()
      $('body').removeClass('noScroll')
    },
    'click .continue':function(){
      $('.overlay-content').html(Meteor.render(Template.tour_step3_tmpl))
      return false
    },
    'click .jp-play': function(){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html();
        addAudioCoins(3, totalTime, 'demo', 1)
      },2000)
    }
  })

  Template.tour_step3_tmpl.events({
    'click .skip-tour':function(){
      Meteor.call('updateNewUser')
      $('.black-overlay, .tour-container').remove()
      $('body').removeClass('noScroll')
    },
    'click .answer' : function(e){
      answerQuestion(e, 'demo')
      return false;
    },
    'click .jp-play': function(){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html();
        addAudioCoins(3, totalTime, 'demo', 1)
      },2000)
    },
    'click .complete-tour' : function(e){
      $('.overlay-content').html(Meteor.render(Template.tour_step4_tmpl))
      return false;
    },
  })

  Template.tour_step4_tmpl.events({
    'click .close-tour':function(){
      Meteor.call('updateNewUser')
      $('.black-overlay, .tour-container').remove()
      $('body').removeClass('noScroll')
      $('.book-details-bubble').remove()
    }
  })

  Template.sign_in_overlay_tmpl.events({
    'submit #sign-in-form' : function(e, t){
      signIn(e,t,!$('.overlay-content').hasClass('no-route'))
      clearSessions()
      return false
    },
    'click .fb-login' : function(e, t){
      Meteor.loginWithFacebook({ requestPermissions: ['email']},
      function (error) {
          if (error) {
              return console.log(error);
          }else{
            $('.black-overlay .close').click()
            Router.home();
          }
      });
      return false
    },
    'click .create-account' : function(){
      Session.set('errorMsg', '')
      $('#sign-in-container').fadeOut(250, function(){
        $('#sign-in-container').remove();
        $('.overlay-content').append(Meteor.render(Template.sign_up_overlay_tmpl))
      })
      return false
    },
    'click .forgot-password' : function(){
      Session.set('errorMsg', '')
      Session.set('emailSent', false)
      $('#sign-in-container').fadeOut(250, function(){
        $('#sign-in-container').remove();
        $('.overlay-content').append(Meteor.render(Template.forgot_password_overlay_tmpl))
      })
      return false
    }
  })

  Template.sign_up_overlay_tmpl.events({
    'click .fb-login' : function(e, t){
      Meteor.loginWithFacebook({ requestPermissions: ['email']},
      function (error) {
          if (error) {
              return console.log(error);
          }else{
            $('.black-overlay .close').click()
            Router.home();
          }
      });
      return false
    },
    'submit #sign-up-form' : function(e, t){
      //$('#sign-up-form .error').hide()
      var emailRaw = t.find('#email').value
      var password = t.find('#password').value
      var username = t.find('#username').value
      var emailTrimmed = trimInput(emailRaw);
      //console.log(profileCreated)
      
      //console.log(emailTrimmed)
      var email = validateEmail(emailTrimmed)
      var isValidPassword = function(val) {
         return val.length >= 6 ? true : false; 
      }

      if(email && password && username){
        if (!isValidPassword(password)){
          Session.set('errorMsg', 'Password must be 6 characters or more')
        }else if(username.indexOf(' ') >= 0){
          Session.set('errorMsg', 'Username cannot contain spaces')
        }else{
          //console.log(emailTrimmed)
          Accounts.createUser({
            email: emailTrimmed, 
            password : password, 
            username : username, 
            profile:{
              email: emailTrimmed
            }
          }, function(err){
            if (err) {
              if(err == 'Error: Username already exists. [403]'){
                Session.set('errorMsg', 'Username is taken')
              }else{
                Session.set('errorMsg', 'Account already exists')
              }
              //console.log(err)
              
            } 
            else {
              $('.black-overlay .close').click()
              Router.home();
            } 
          })
        }
        
      }else{
        if(email){
          Session.set('errorMsg', 'Field missing')
          $('.sign-up-input').each(function(){
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
      clearSessions()
      return false
    }
  })

    Template.forgot_password_overlay_tmpl.events({

        'submit #forgot-password-form' : function(e, t) {
          e.preventDefault()
          var email = trimInput(t.find('#email').value)

          if (email && validateEmail(email)) {
            Session.set('loading', true);
            Accounts.forgotPassword({email: email}, function(err){
              if (err){
                console.log(err)
                Session.set('errorMsg', 'Password Reset Error &amp; Doh')
              }
                
              else {
                //console.log('sent')
                Session.set('emailSent', true)
              }
              Session.set('loading', false);
            });
          }
          return false; 
        },

        'submit #new-password' : function(e, t) {
          e.preventDefault();
          var pw = t.find('#new-password-password').value;
          if (pw && isValidPassword(pw)) {
            Session.set('loading', true);
            Accounts.resetPassword(Session.get('resetPassword'), pw, function(err){
              if (err){
                if(err == 'Error: Token expired [403]'){
                  Session.set('errorMsg', 'Password was already reset');
                }else{
                  Session.set('errorMsg', 'Password Reset Error');
                }
              }else {
                Session.set('resetPassword', null);
                $('.black-overlay .close').click()
                Router.home();
              }
              Session.set('loading', false);
            });
          }else{
            Session.set('errorMsg', 'Password is too short');
          }
        return false; 
        }
    });
  

  Template.book_tmpl.events({
    'click .chapter-link' : function(e){
      // $('.chapter-link').removeClass('selected')
      // $(e.currentTarget).addClass('selected')
      $("#audio").jPlayer('stop')
      // var self = this;
      // Session.set("chapterID", this._id)
      // Session.set("chapterNum", this.chapter)
      // Session.set("verseAudioBegin", '')
      var bookName = Session.get("bookName").replace(' ', '')
      // Number of arrays in the json file must match the number of verses in the chapter
      // ajaxChapterInfo(self)
      // Meteor.call('questionsInitialize', Session.get("chapterNum"), Session.get("bookName"))

      // $("#constant-audio").empty().html(Meteor.render(Template.audio_tmpl))
      Router.navigate("/books/"+bookName+"/"+this.chapter,{trigger:true});
      $('html,body').scrollTop(0);
      return false;
    },
    'click .chapter-questions-btn' : function(e){
      Session.set("questionVerseSelect", 'Questions')
      return false;
    },
    'click .chapter-verses-btn' : function(e){
      Session.set("questionVerseSelect", 'Verses')
      return false;
    },
    'click #audio-container .jp-play' : function(e){
      var t=setTimeout(function(){
        var totalTime = $('.jp-duration').html(); 
        addAudioCoins(Session.get("totalVerses"), totalTime, Session.get("bookName"), Session.get("chapterNum"))
      },2000)
    },
    'mouseover #chest-items span': function(e){
      var target = $(e.target)
      popupBubble(target, target.html());
    },
    'mouseout #chest-items span': function(e){
      $('.popup-bubble').remove()
    },
    'mouseover .badge': function(e){
      var target = $(e.target)
      popupBubble(target, target.html());
    },
    'mouseout .badge': function(e){
      $('.popup-bubble').remove()
    }
  })

  Template.star_overlay_tmpl.events({
    'click .next-chapter' : function(e){
      var nextChapter = Session.get("chapterNum")+1
      //window.location.href = "/books/"+Session.get("bookName")+'/'+nextChapter
      // var self = this;
      // Session.set("chapterNum", nextChapter)
      // Session.set("verseAudioBegin", '')
      // var bookName = Session.get("bookName").replace(' ', '')
      // // Number of arrays in the json file must match the number of verses in the chapter
      // ajaxChapterInfo(self)
      // Meteor.call('questionsInitialize', Session.get("chapterNum"), Session.get("bookName"))

      // $("#constant-audio").empty().html(Meteor.render(Template.audio_tmpl))
      $('.overlay-content .close').click()
      Router.navigate("/books/"+Session.get("bookName")+'/'+nextChapter,{trigger:true});
      $('html,body').scrollTop(0);
      return false;
    }
  })

  Template.questions_tmpl.events({
    'click .answer' : function(e){
      answerQuestion(e)
      
      return false;
    },
    'click .recycle-answer' : function(e){
      Meteor.call('recycleQuestion', this._id, Session.get("bookName"), function(error, result){
        if(result == 'noPoints'){
          $('.incorrect-answer .error').show().delay(3000).fadeOut()
        }
      })
      return false;
    },
    'click .special-recycler' : function(e){
      Meteor.call('recycleQuestion', this._id, Session.get("bookName"), 'special')
      $('.popup-bubble').remove()
      return false;
    },
    'mouseover .special-recycler': function(e){
      var target = $(e.currentTarget)
      var html = target.find('span').html()
      popupBubble(target, html);
    },
    'mouseout .special-recycler': function(e){
      $('.popup-bubble').remove()
    },
  })



  Template.chapters_tmpl.events({
    'click .book-box' : function(e){
      var bookNameTrimmed = this.bookName.replace(" ", "")
      window.location.href = "/books/"+bookNameTrimmed;
      return false;
    },
    'click .total-complete .book-lock' : function(e){
      //console.log(this)
      //Session.set('chestNum', this.chest)
      var self = this
      Meteor.call('chestVerify', this, function (error, result) { 
        if(result[1] == true){
          loadInOverlay('chest-content')
          $('.chest-content').append(Meteor.render(Template.chest_overlay_tmpl))
          $('.choice.first').append(Meteor.render(Template.first_chest_tmpl({
            chestTmpl1: result[2][0] == 1 ? true : false,
            chestTmpl2: result[2][0] == 2 ? true : false,
            chestTmpl3: result[2][0] == 3 ? true : false,
            chestTmpl4: result[2][0] == 4 ? true : false,
            chestTmpl5: result[2][0] == 5 ? true : false,
            chestTmpl6: result[2][0] == 6 ? true : false,
            chestTmpl7: result[2][0] == 7 ? true : false,
            chestTmpl8: result[2][0] == 8 ? true : false,
            chestTmpl9: result[2][0] == 9 ? true : false,
            chestTmpl10: result[2][0] == 10 ? true : false,
            chestTmpl11: result[2][0] == 11 ? true : false
          })))
          $('.choice.second').append(Meteor.render(Template.second_chest_tmpl({
            chestTmpl1: result[2][1] == 1 ? true : false,
            chestTmpl2: result[2][1] == 2 ? true : false,
            chestTmpl3: result[2][1] == 3 ? true : false,
            chestTmpl4: result[2][1] == 4 ? true : false,
            chestTmpl5: result[2][1] == 5 ? true : false,
            chestTmpl6: result[2][1] == 6 ? true : false,
            chestTmpl7: result[2][1] == 7 ? true : false,
            chestTmpl8: result[2][1] == 8 ? true : false,
            chestTmpl9: result[2][1] == 9 ? true : false,
            chestTmpl10: result[2][1] == 10 ? true : false,
            chestTmpl11: result[2][1] == 11 ? true : false
          })))
          $('.choice.third').append(Meteor.render(Template.third_chest_tmpl({
            chestTmpl1: result[2][2] == 1 ? true : false,
            chestTmpl2: result[2][2] == 2 ? true : false,
            chestTmpl3: result[2][2] == 3 ? true : false,
            chestTmpl4: result[2][2] == 4 ? true : false,
            chestTmpl5: result[2][2] == 5 ? true : false,
            chestTmpl6: result[2][2] == 6 ? true : false,
            chestTmpl7: result[2][2] == 7 ? true : false,
            chestTmpl8: result[2][2] == 8 ? true : false,
            chestTmpl9: result[2][2] == 9 ? true : false,
            chestTmpl10: result[2][2] == 10 ? true : false,
            chestTmpl11: result[2][2] == 11 ? true : false
          })))
          if(result[0] != 0){
            $('.chest-content h1').html('Chest unlocked')
            $('.choice').addClass('complete')
            $('.choice').each(function(){
              if($(this).find('.choose-item').attr('data-item-num') == result[0]){
                $(this).addClass('active')
                $(this).find('.choose-item').html('Chosen').removeClass('gray-gradient').addClass('chosen')
              }
            })
          }
          Session.set("chapterID", self._id)
        }else{
          loadInOverlay('chest-error')
          $('.chest-error').append(Meteor.render(Template.chest_error_overlay_tmpl))
        }
        
      })
    },
    'click .book-lock' : function(){
      return false
    }
  })

  Template.chest_overlay_tmpl.events({
    'click .choose-item' : function(e){
      var item = $(e.target).attr('data-item-num')
      if($(e.target).parents('.choice').hasClass('complete')){
        return false
      }else{
        $('.choice').addClass('complete')
        $(e.target).html('Chosen').removeClass('gray-gradient').addClass('chosen')
        $(e.target).parents('.choice').addClass('active')
        //console.log(item)
        Meteor.call('chestSelect', Session.get('chapterID'), item, function (error, result) { 
          //console.log(result)
          // loadInOverlay('chest-content')
          // $('.chest-content').append(Meteor.render(Template.chest_overlay_tmpl))
        })
      }
      return false
    },
    'click .next' : function(e){
      slidey.goToNextSlide();
      return false;
    },
    'click .prev' : function(e){
      slidey.goToPrevSlide();
      return false;
    }
  })

  Template.admin_tmpl.events({
    'mouseover .graphBarbar-graph': function(e){
      var target = $(e.target)
      var html = target.prev().html()
      popupBubble($(e.target), html);
    },
    'mouseout .graphBarbar-graph': function(e){
      $('.popup-bubble').remove()
    },
    'click .export-signup-emails': function(){
      $(".admin-container").empty().html(Meteor.render(Template.signup_email_tmpl))
    },
    'click .export-user-emails': function(){
      $(".admin-container").empty().html(Meteor.render(Template.user_email_tmpl))
    }
  })

  Template.search_user_tmpl.events({
    'submit #search-user' : function(e){
      var searchVal = $('#user-input-search').val()
      search(searchVal)
      return false
    },
    'click .invite-friends': function(e){
      FacebookInviteFriends()
      return false
    },
    'click .follow-user': function(e){
      //var userID = Meteor.users.findOne({'username':$(e.target).attr('data-username')})._id
      var self = $(e.target)
      if(self.hasClass('green-gradient')){
        self.removeClass('green-gradient')
        self.html('Follow')
      }else{
        self.addClass('green-gradient')
        self.html('Following')
      }
      Meteor.call('followUser', self.attr('data-user'))
      return false
    }
  })

  Template.public_profile_tmpl.events({
    'click .follow-user': function(e){
      Meteor.call('followUser', Session.get('profileID'))
      return false
    },
    'click .user-container.plus.followers': function(e){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.account_follower_plus_tmpl)).addClass('follow-overlay')
      return false
    },
    'click .user-container.plus.following': function(e){
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.account_following_plus_tmpl)).addClass('follow-overlay')
      return false
    },
    'click .like': function(e){
      $('.popup-bubble').remove()
      Meteor.call('likeActivity', this._id)
      return false
    },
    'mouseover .like': function(e){
      $('.popup-bubble').remove()
      var names = $(e.currentTarget).find('b').html()
      if(names) popupBubble($(e.currentTarget), names);
      return false
    },
    'mouseout .like': function(e){
      $('.popup-bubble').remove()
    }
  })

  // --------- ROUTING ---------- //
  var versesRouter = Backbone.Router.extend({
    routes: {
      "books/:bookName/:chapterNum": "book",
      "books/:bookName": "book",
      "account?e=:token": "account",
      "account": "account",
      "billing": "billing",
      "profile": "profile",
      "donate": "donate",
      "privacy": "privacy",
      "reset-password/:token": "resetPassword",
      "admin": "admin",
      "home": "home",
      "search?q=:keyword" : "search",
      "search?q=" : "search",
      "search" : "search",
      "u/:username": "publicProfile",
      "i/:invoiceId": "invoice",
      "/": "home",
      "": "home",
      '404': 'notFound',
      '*notFound': 'notFound'
    },
    book: function (bookName, chapterNum) {
      if(Meteor.userId()){
        loadingPage()
        $("#site-container").empty()
        var bookName = bookName.replace(/(\d)/g, "$1 ")
        var bookInfo;
        Meteor.subscribe( "books_db", function() {
          bookInfo = Books.findOne({bookName: bookName, owner: Meteor.userId()})
          if(Chapters.find({bookName: bookName, owner: Meteor.userId()}).count() == 0){
            Meteor.call('chapterInitialize', bookInfo.bookName)
          }
          Session.set("bookName", bookInfo.bookName);
          Session.set("chapters", bookInfo.chapters);
        })
        //var booknameRaw = bookInfo.bookname
        // var booknameTrimmed = booknameRaw.replace(" ", "")
        Meteor.subscribe( "chapters_db", function() {
          
          if(chapterNum){
            var number = parseInt(chapterNum)
            var setChapterNumber = Chapters.findOne({bookName:bookName, chapter:number, owner: Meteor.userId()}, {sort:{chapter:1}});
          }else{
            var setChapterNumber = Chapters.findOne({bookName:bookName, totalComplete: false, owner: Meteor.userId()}, {sort:{chapter:1}});
            if(!setChapterNumber){
              var setChapterNumber = Chapters.findOne({bookName:bookName, chapter:1 , owner: Meteor.userId()}, {sort:{chapter:1}});
            }
          }
          //console.log(setChapterNumber)
          $('#'+setChapterNumber._id).addClass('selected')
          Session.set("chapterID", setChapterNumber._id)
          Session.set("chapterNum", setChapterNumber.chapter)
          Session.set("verseAudioBegin", '')
          Session.set('backgroundColor', bookColors[bookNames.indexOf(bookName)])
          Session.set("totalVerses", setChapterNumber.verses)
          Session.set("bookId", bookIds[bookInfo.bookNum])
          Session.set("verseText", '')
          Session.set("verseTextLoaded", false)
          Session.set("verseAudioLoaded", false)
          //console.log(setChapterNumber.verses)
          //console.log(setChapterNumber.chapter)
          //var result = Backbone.history.fragment.substring(Backbone.history.fragment.lastIndexOf("/")+ 1);
          //console.log(result)
          Meteor.call('ajaxAudio', bookIds[bookInfo.bookNum], setChapterNumber.chapter, function(error, result){
            Session.set("audioFile", result)
            Session.set("verseAudioLoaded", true)
          })
          Meteor.call('ajaxText', Session.get("bookId"), Session.get("chapterNum"), function(error, result){
            Session.set("verseText", result)
            Session.set("verseTextLoaded", true)
          })
          ajaxChapterInfo(setChapterNumber)
          $("#site-container").html(Meteor.render(Template.book_tmpl))
          Meteor.call('questionsInitialize', setChapterNumber.chapter, bookName)
          var bookNameTrimmed = bookName.replace(" ", "")
          // Router.navigate("books/"+bookNameTrimmed+"/"+setChapterNumber.chapter,{trigger:true, replace: true});
          pageLoaded() //now loads after text is loaded Template.verses_tmpl.verseTextLoaded
          Router.navigate("books/"+bookNameTrimmed+"/"+setChapterNumber.chapter,{replace:true});
        })
      }else{
        Spark.finalize($("body")[0])
        $("body").empty().html(Meteor.render(Template.landing_tmpl))
        this.navigate("/");
      }
    },
    home: function(){
      Spark.finalize($("body")[0])
      if(Meteor.userId()){
        loadingPage()
        Meteor.subscribe("userdata", function() {
          pageLoaded()
        })
        $("body").empty().html(Meteor.render(Template.chapters_page_tmpl))
      }else{
        pageLoaded()
        $("body").empty().html(Meteor.render(Template.landing_tmpl))
      }
      this.navigate("/");
    },
    donate: function(){
      pageLoaded()
      Spark.finalize($("#site-container")[0])
      $("#site-container").empty().html(Meteor.render(Template.donate_tmpl))
      this.navigate("/donate");
    },
    privacy: function(){
      pageLoaded()
      Spark.finalize($("#site-container")[0])
      $("#site-container").empty().html(Meteor.render(Template.privacy_tmpl))
      this.navigate("/privacy");
    },
    account: function(token){
      loadingPage()
      if(Meteor.userId()){
        Session.set('emailVerify', false)
        Session.set('verEmailSent', false)
        Session.set('profileID', Meteor.userId())
        Spark.finalize($("#site-container")[0])
        Meteor.subscribe("userdata", function() {
        pageLoaded()
          //console.log('account')
          $("#site-container").empty().html(Meteor.render(Template.account_tmpl))
        })

        if(token){
          Accounts.verifyEmail(token, function(){
            Session.set('emailVerify', true)
            Router.navigate("/account?e="+token);
          })
        }else{
          this.navigate("/account");
        }
        
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    billing: function(){
      loadingPage()
      if(Meteor.userId()){
        Meteor.subscribe("donations_db", function() {
          if(Donations.findOne({owner: Meteor.userId()})){
            Session.set('profileID', Meteor.userId())
            Spark.finalize($("#site-container")[0])
            Meteor.subscribe("userdata", function() {
              $("#site-container").empty().html(Meteor.render(Template.billing_page_tmpl))
              $('.account-nav').removeClass('selected')
              $('#billing-info-link').addClass('selected')
              pageLoaded()
            })
            Router.navigate("/billing");
          }else{
            Router.account();
          }
        })
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    invoice: function(invoiceId){
      loadingPage()
      if(Meteor.userId()){
        Meteor.subscribe("donations_db", function() {
          if(Donations.findOne({owner: Meteor.userId()})){
            Session.set('profileID', Meteor.userId())
            Session.set('chargeId', invoiceId)
            Spark.finalize($("#site-container")[0])
            Meteor.subscribe("userdata", function() {
              $("#site-container").empty().html(Meteor.render(Template.invoice_page_tmpl))
              $('.account-nav').removeClass('selected')
              $('#billing-info-link').addClass('selected')
              pageLoaded()
            })
            Router.navigate("/i/"+invoiceId);
          }else{
            pageLoaded()
            Router.account();
          }
        })
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    profile: function(){
      loadingPage()
      if(Meteor.userId()){
        Session.set('profileID', Meteor.userId())
        Spark.finalize($("#site-container")[0])
        Meteor.subscribe("userdata", function() {
          $("#site-container").empty().html(Meteor.render(Template.activity_page_tmpl))
          $('.account-nav').removeClass('selected')
          $('#activity-info-link').addClass('selected')
          pageLoaded()
        })
        this.navigate("/profile");
      }else{
        pageLoaded()
        Router.notFound();
      }
    },
    search: function(keyword){
      pageLoaded()
      Spark.finalize($("#site-container")[0])
      $("#site-container").empty().html(Meteor.render(Template.search_user_tmpl))
      if(keyword){
        $('#user-input-search').val(keyword)
        search(keyword)
        //console.log(keyword)
      }
      if(!keyword){
        keyword = ''
        Session.set('userSearchLoaded', true)
      }
      this.navigate("/search?q="+keyword);
    },
    publicProfile: function(username){
      loadingPage()
      Session.set('publicUsername', username)
      Meteor.subscribe("publicdata", username, function(){
        Session.set('profileID', Meteor.users.findOne({'username':username})._id)
        if(Meteor.userId() == Session.get('profileID')){
          Spark.finalize($("#site-container")[0])
          Meteor.subscribe("userdata", function() {
            pageLoaded()
            $("#site-container").empty().html(Meteor.render(Template.account_tmpl))
            $('#lower-right').html(Meteor.render(Template.activity_tmpl))
            $('.account-nav').removeClass('selected')
            $('#activity-info-link').addClass('selected')
          })
        }else{
          if(Meteor.users.findOne({'username':username})){
            Meteor.subscribe("publicpoints", Session.get('profileID'), function(){
              Meteor.subscribe("publicactivity", Session.get('profileID'), function(){
                Meteor.subscribe("publicbooks", Session.get('profileID'), function(){
                  pageLoaded()
                  Spark.finalize($("#site-container")[0])
                  $("#site-container").empty().html(Meteor.render(Template.public_profile_tmpl))
                })
              })
            })
          }else{
            pageLoaded()
            Router.notFound();
          }
        }
        
      })
    },
    notFound: function(){
      pageLoaded()
      Spark.finalize($("#site-container")[0])
      $("#site-container").empty().html(Meteor.render(Template.not_found_tmpl))
      this.navigate("/404");
    },
    resetPassword: function(token){
      pageLoaded()
      Session.set('resetPassword', token);
      Spark.finalize($("body")[0])
      $("body").empty().html(Meteor.render(Template.landing_tmpl))
      loadInOverlay('overlay-content')
      $('.overlay-content').append(Meteor.render(Template.forgot_password_overlay_tmpl))
      //this.navigate("/404");
    },
    admin: function(){

      Spark.finalize($("#site-container")[0])
      $("#site-container").empty()
      if(Meteor.userId()){
        if(Meteor.user().profile.admin){
          pageLoaded()
          $("#site-container").empty().html(Meteor.render(Template.admin_tmpl))
        }
      }else{
        pageLoaded()
        Router.notFound();
      }
      
    }
  });

  Router = new versesRouter;

  Meteor.startup(function () {
    Backbone.history.start({pushState: true});
  });
// --------- ROUTING END ---------- //

}


