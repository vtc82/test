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
      this.times = {
        hh : this.boxTime.find('#ico-open-hh').text().trim(),
        mm : this.boxTime.find('#ico-open-mm').text().trim(),
        ss : this.boxTime.find('#ico-open-ss').text().trim()
      };
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
      this.count = 0;
      this.total = 10;
      this.delayRequest = 5555;
      this.overtime = 1000;
      this.uniAuto.prepend('<h1>Version 1.0.1 </h1> <h2>Thời gian (1/1000 s) :'+this.overtime+'</h2>');
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
    getTime: function () {
      var times = this.times;
      return (Number(times.hh) * 60 + Number(times.mm))*60 + Number(times.ss);
    },
    autoBuy: function() {
      var that = this,
      timeDelay = that.getTime() + that.overtime;
        that.responseBuy();
        
      setTimeout(function() {
        that.uniAuto.addClass('hidden');
        that.element.append(that.showRunTool);
        that.responseBuy();
      }, timeDelay);
    },
    responseBuy: function() {
      var that = this;
      $.ajax({
        url: '/ico',
        method: 'POST',
        data: {
          unx_amount: that.unx_amount.val(),
          captcha_secret: that.captcha_secret.val(),
          captcha_key2: that.captcha_key2.val()
        },
        success: function(res) {
          console.log('success: ', res)
          if (res.success) {
            window.location.reload();
          }
          if (res.error) {
            if (that.count < that.total) {
              that.count +=1;
              setTimeout(function() {that.responseBuy()}, that.delayRequest);
            }
          }
        },
        error: function(err) {
          if (that.count < that.total) {
            console.log('error status', err.status);
            that.count +=1;
            setTimeout(function() {that.responseBuy()}, that.delayRequest);
          }
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
