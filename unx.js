;(function($, window, undefined) {
  'use strict';

  var pluginName = 'auto-unx';
  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      this.initDOM();
      this.bindEvent();
    },
    initDOM: function() {
      var el = this.element;
      this.boxTime = el.find('#time-box');
      this.uniAuto = el.find('.unx-auto');
      this.btnSubmitBuy = this.uniAuto.find('#submit-so-luong-mua');
      this.btnNhapLai = this.uniAuto.find('#nhap-lai');
      this.resultUNX = this.uniAuto.find('#so-unx-mua');
      this.showRunTool = '<div id="show-run-tool">'
                        +'<h1> Tool đang chạy vui lòng chờ..... </h1>'
                        +'</div>';
      this.unx_amount = $('#unx_amount');
      this.captcha_secret = $('[name="captcha_secret"]');
      this.captcha_key2 = $('[name="captcha_key2"]');
      this.errorMes = $('#error-nhap-gt');
    },

    bindEvent: function() {
      this.setDataBuy();
    },
    setDataBuy: function() {
      var that=this;
      that.uniAuto.find('.block-input-auto').prepend($('#unx_amount'),$('#captcha-img'),$('input[name="captcha_key2"]'));
      that.btnSubmitBuy.on('click', function() {
        if (that.unx_amount.val() === '' || that.captcha_key2.val() === '') {
          that.errorMes.text('Vui lòng nhập đầy đủ thông tin...').removeClass('hidden');
          return;
        }
        that.errorMes.addClass('hidden');
        localStorage.setItem('UNXBuy', that.unx_amount.val());
        localStorage.setItem('secret', that.captcha_secret.val());
        localStorage.setItem('captcha', that.captcha_key2.val());

        that.autoBuy();
        that.showTimeDelay();
        that.btnNhapLai.removeClass('hidden');
      });
      if (localStorage.getItem('UNXBuy') !== null && localStorage.getItem('captcha') !== null) {
        that.showTimeDelay();
        that.autoBuy();
      }
      that.btnNhapLai.on('click', function() {
        that.uniAuto.removeClass('success');
        $('.block-input-auto').find('input').attr('disabled', false);
      });
    },

    showTimeDelay: function() {
      this.unx_amount.val(localStorage.getItem('UNXBuy'));
      this.captcha_key2.val(localStorage.getItem('captcha'));
      this.resultUNX.text(localStorage.getItem('UNXBuy'));
      $('.block-input-auto').find('input').attr('disabled', true);
      this.uniAuto.addClass('success').append(this.boxTime);
    },
    autoBuy: function() {
    	var that = this;
      $.get('/ico/info', function (res) {
        if(res.success) {
          var timestamp = res.next_ico_date.from_timestamp,
              now = new Date().getTime(),
              timeDelay = timestamp - now;
          setTimeout(function() {
            that.uniAuto.addClass('hidden');
            that.element.append(that.showRunTool);
            that.responseBuy();
          }, timeDelay);
        }
      });
    },
    responseBuy: function() {
      var that = this;
      $.post('/ico', {
        unx_amount: that.unx_amount.val(),
        captcha_secret: that.captcha_secret.val(),
        captcha_key2: that.captcha_key2.val()
      }, function (res) {
        if (res.success) {
          console.log('---- success responseBuy ----- ');
          that.isLoad = false;
          that.getUserInfo();
          setTimeout(function () {
            that.getIcoInfo();
            that.getUserInfo();
          }, 6666);
        }
      })
    },
    getUserInfo: function() {
      var that = this;
      $.get('/user/info', function (res) {
        if (res.success) {
          console.log('--- success getUserInfo -----');
          if (that.isLoad) {
            $('#show-run-tool h1').text('Kết quả : ', res.ico_orders[0].status +'^^' );
          }
        } else {
          console.log('not success', res);
        }
        that.isLoad = true;
      });
    },
    getIcoInfo: function() {
      $.get('/ico/info', function (res) {
        if(res.success) {
          console.log('--- success getIcoInfo -----');
        } else {
          console.log('not success', res);
        }
      });
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {};

  $(function() {
    setTimeout(function() {$('[data-' + pluginName + ']')[pluginName]()}, 2000);
  });

}(jQuery, window));
