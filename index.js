var socket;
var user_src = '';
var user_dest = 'SELECT USER';

// function to scroll to message
function scroll_to_me(id){
    $('#main').scrollTop(0);
    $('#main').stop().animate({ scrollTop: $('#' + id).offset().top-60 }, 500);
    console.log('scroll out');
  }

function open_notif()
{
  document.getElementById('notif_drop').click();
}

$(document).ready(function(){
  
  // function to scroll to message
  function scroll_to_me(id){
    $('#main').scrollTop(0);
    $('#main').stop().animate({ scrollTop: $('#' + id).offset().top-60 }, 500);
    console.log('scroll in');
  }

  // small popup notification display function
  function show_notif(typ,pos,msg,tim_out)
  {
    new Noty({
      type: typ, //alert (default), success, error, warning
      layout: pos, //top, topLeft, topCenter, topRight (default), center, centerLeft, centerRight, bottom, bottomLeft, bottomCenter, bottomRight
      theme: 'bootstrap-v4', //relax, mint (default), metroui 
      text: msg, //This string can contain HTML too. But be careful and don't pass user inputs to this parameter.
      timeout: tim_out, // false (default)
      progressBar: true, //Default, progress before fade out is displayed
    }).show();
  }

  //scoket created here
  socket = io.connect('http://localhost:5000/socketio');

  // SOCKET ROUTES
  socket.on('connect', function() {
    console.log('connected');
    $('#main_form').css('display','block');
    $('#blog').css('display','none');
  });

  socket.on('disconnect', function() {
    console.log('disconnected');
  });

  socket.on('disconnect_it',function(){
    console.log('disconnect_it');
    $('#main_form').css('display','block');
    $('#blog').css('display','none');
    show_notif('error','topCenter','<p style="font-size:50px">SERVER CLOSED!</p>',false);
     $('#reg_user').val('');
      $('#reg_pass').val('');
       $('#log_user').val('');
      $('#log_pass').val('');
  });

  socket.on('notif_card',function(msg){
    if (msg.succ)
      {
        show_notif('alert','topCenter',msg.data,2000);
        $('#login_tab').click();
      }
    else
      {
        show_notif('error','topCenter','ERROR!<br>' + msg.data,2000);
      }
  });

  socket.on('logged_in',function(data){
    user_src = data;
    $('#main_form').css('display','none');
    $('#blog').css('display','block');
    socket.emit('get_my_details',user_src);
  });

  socket.on('get_my_details',function(my_details){
    $('#user_details').html(my_details);
  }); 

  socket.on('users_list',function(lst_html){
    $('#USERS_LIST').html(lst_html);
  });

  socket.on('get_user_details',function(htm,username){
        $('#userModal_body').html(htm);
  });

  $( "#user_selected" ).change(function() {
      user_dest = $('#user_selected').find(":selected").text();
  });

  socket.on('user_drp',function(users){
      htm = "";
      $.each( users, function( index, value ){
        htm = htm + "<option>"+value+"</option>"
      });

    $('#user_selected').html(htm);
  });
  
  socket.on('send_message',function(data){
    
    if(user_src == '')
      return 
    dst = data['dst'];
    msg = data['msg']
    time_ = data['time']
    mess_id = data['id']
    src = data['src']
    dst = data['dst']
    if (data['src'] == user_src)
      src = 'YOU'
    if (data['dst'] == user_src)
      dst = 'YOU'

    show_notif('success','topRight','<div onclick="scroll_to_me(\'mess_'+ mess_id + '\')">NEW MESSAGE sent from <strong>' + src + '</strong> to <strong>' + dst + '</strong><br><p style="font-size:20px">'+ data['msg'] + '</p></div>',5000);
    
    new_msg_htm =`
    <div id=mess_` + mess_id + ` class="panel panel-default">
              <div class="panel-heading">
                <p class="pull-right" style="color: #80808080;">` + time_ + `</p> 
                <h4>` + src +` ► ` + dst + `</h4>
            </div>
              <div class="panel-body">
                    <p>` + msg + `</p>
                </div>
            </div>`;
    $('#main_blog').html(new_msg_htm + $('#main_blog').html());
    
  });

  // UI Events
  $('.form1').find('input, textarea').on('keyup blur focus', function (e) {
  
  var $this = $(this),
      label = $this.prev('label');

    if (e.type === 'keyup') {
      if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
      if( $this.val() === '' ) {
        label.removeClass('active highlight'); 
      } else {
        label.removeClass('highlight');   
      }   
    } else if (e.type === 'focus') {
      
      if( $this.val() === '' ) {
        label.removeClass('highlight'); 
      } 
      else if( $this.val() !== '' ) {
        label.addClass('highlight');
      }
    }

  });

$('.tab a').on('click', function (e) {
  e.preventDefault();
  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');
  target = $(this).attr('href');
  $('.tab-content > div').not(target).hide();
  $(target).fadeIn(600);
});

  $('#register_me').click(function(){
    socket.emit('register_me',{'user_' : $('#reg_user').val(), 'pass_' : sha512($('#reg_pass').val())})
  });

  $('#login_me').click(function(){
    socket.emit('login_me',{'user_' : $('#log_user').val(), 'pass_' : sha512($('#log_pass').val())})
  });

  $('#scroll_to_ele').click(function(){
    $('#main').scrollTop(0);
    $('#main').stop().animate({ scrollTop: $('#scroll_to_me').offset().top-60 }, 500);
  });

  socket.on('notifs',function(data){
    $('#notif_dropdown').html(data['htm']);
    show_notif('info','topRight','<div onclick="open_notif()">You have ' + data['cnts'] + ' new Notifications!</div>',false);
  });

  socket.on('all_mess',function(htm) {
    $('#main_blog').html(htm);  
  });


  $('#login_tab').click(function(){
      $('#reg_user').val('');
      $('#reg_pass').val('');
  });

  $('#signup_tab').click(function(){
      $('#log_user').val('');
      $('#log_pass').val('');
  });

  $('#logout').click(function(){
    socket.emit('logged_out',user_src);
    user_src = '';
    $('#log_user').val('');
    $('#log_pass').val('');
    // $('#main_content').html('');
    $('#main_form').css('display','block');
    $('#blog').css('display','none');
    $('#USERS_LIST').html('');
    show_notif('alert','topCenter','Logged OUT!',2000);
    // alert('Logged OUT!');
  });

  $('.quit').click(function(){
    $.ajax({url: "/quit_without_save", success: function(result){
        console.log('quit_without_save');
    }});
  });

  $('.save_quit').click(function(){
    $.ajax({url: "/save_and_quit", success: function(result){
        console.log('save_and_quit');
    }});
  });

  $('#send_message').click(function(){
    msg = $('#send_message_content').val();
    if (user_dest == 'SELECT USER')
    {
      show_notif('error','topCenter','ERROR!<br>Select proper user to send message to',2000);
      setTimeout(function(){$('#post_message').trigger('click');},500);
    }
    else
    {
      socket.emit('send_message',{'src':user_src,'dst':user_dest,'msg':msg});
      $("#user_selected").prop("selectedIndex", 0);
      $('#send_message_content').val('');  
    }
    
  });

});

  


