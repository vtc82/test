var defaultPageSize = 8;
var __token = $('input[name="__RequestVerificationToken"]').val();
var correctCaptcha = function (t) {
    var datapost = {};
    datapost.Code = $('input[name="robot-check"]').val();
    if (datapost.Code == null || datapost.Code.trim().length < 5) {
        $('input[name="robot-check"]').css('border', '1px solid #ac2925');
        bootbox.dialog({
            size: 'small',
            message: "Captcha is invalid. Please try again",
            title: "Warning",
            buttons: {
                confirm: {
                    label: '<i class="fa fa-times"></i> Close',
                    className: "btn-warning button-bootbox-close"
                }
            }
        });
        return;
    }
    datapost.__RequestVerificationToken = __token;
    $.ajax({
        url: urlRobotCheck,
        data: datapost,
        type: 'POST',
        dataType: 'json',
        beforeSend: function () {

        },
        success: function (data) {
            if (data.Result == "OK") {

                var footer = [];
                footer.push('<div class="modal-footer"><button class="btn btn-default btn-ico-custome" data-dismiss="modal">Cancel</button><button class="btn btn-warning btn-ico-custome" id="btn-submit-buy">Buy</button></div>');
                if ($('#div-modal-content-buy-ico').find('.modal-footer').length == 0) {
                    $('#div-modal-content-buy-ico').append(footer.join(''));
                }
                if ($('#div-captcha-check').length == 0) {
                    var html = [];
                    html.push('<div class="row-item" id="div-captcha-check">');
                    html.push('<div class="left">Input captcha</div>');
                    html.push('<div class="right">');
                    html.push('<input type="text" name="captcha" class="form-control" placeholder="">');
                    html.push('<img class="img-captcha" src="'+data.Data+'" /><i class="fa fa-refresh refresh-captcha"></i></div>');
                    html.push('</div>');
                    $(html.join('')).insertBefore('#google-check-bot');
                    $('#google-check-bot').remove();
                }
            }
            else {
                bootbox.dialog({
                    size: 'small',
                    message: "Captcha is invalid. Please try again",
                    title: "Warning",
                    buttons: {
                        confirm: {
                            label: '<i class="fa fa-times"></i> Close',
                            className: "btn-warning button-bootbox-close"
                        }
                    }
                });
            }
            RefreshCaptcha = 0;

        },
        error: function (data) {
            RefreshCaptcha = 0;
        }
    });
    
}
var ICOItem = function (item) {
    var self = this;
    this.Id = item.Id;
    this.TotalCoin = parseFloat(item.TotalCoin);
    this.SoldCoin = parseFloat(item.SoldCoin);
    if (this.SoldCoin > this.TotalCoin) {
        this.SoldCoin = this.TotalCoin;
    }
    this.TimeICO = item.TimeICO;
    this.TimeBuyICO = item.TimeBuyICO;
    this.OpenBuyTime = item.OpenBuyTime;
    this.OpenICOTime = item.OpenICOTime;
    this.Price = item.Price;
    this.Limit = Number(parseFloat(item.Limit).toFixed(8));
    this.TimeLeft = item.TimeLeft;
    this.BuyICO = false;
};

$('#div-buy-uch').on('hidden.bs.modal', function (e) {
    $('input[name="4amount--4coin--2ver3"]').val('');
    $('input[name="4amount--4uch--2ver3"]').val('');
});

var ICOTransaction = function () {
    var self = this;
    self.RefreshCaptcha = 0;
    self.Limit = 0;
    self.MaxBuy = 0;
    self.ICO = ko.observable();
    self.Price = ko.observable();
    self.UserWallet = ko.observable();
    self.Blockchain = 'BTC';
    self.transactionList = ko.observableArray([]);

    self.pagination = new pagination();

    self.pagination.pageChanged(function (pageIndex) {
        self.GetListTransaction(pageIndex);
    });
    this.init = function (data, userWallet) {
        self.Limit = data.Limit;
        self.ICO(new ICOItem(data));

        var ico_info = new xyz();

        if (data.TotalCoin > 0) {
            var percent = Number(parseFloat(data.SoldCoin * 100 / data.TotalCoin).toFixed(2));
            if (percent == 100 && data.SoldCoin < data.TotalCoin) {
                percent = 99.9999;
            }
            $('#process--ico').css('width', percent + '%').attr('aria-valuenow', percent).html(percent + '%');
        }
        var eventTime = moment(ico_info.s());//moment(moment(ico_info.s()).format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");// moment(item.TimeICO);
        var currentTime = moment();// moment(moment.utc().format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");
        if (data.OpenICOTime) {
            $('#buy--ico--now').removeClass('enabled');
            var diffTime = parseInt(data.TimeLeft);// eventTime.unix() - currentTime.unix();
            diffTime = diffTime < 0 ? 0 : diffTime;
            var clock2 = $('#buy--ico--time').FlipClock({
                clockFace: 'DailyCounter',
                autoStart: false,
                callbacks: {
                    stop: function () {
                        var html = [];
                        html.push('<h4 class="buy-ico-title-time"><img src="/Content/images/time-buy-ico.png" />ICO STARTS NOW: </h4>');
                        html.push('<div class="ico-action text-center enabled">');
                        html.push('<button class="btn btn-warning enabled" id="buy--ico--now">BUY UCH</button>');
                        html.push('</div>');
                        $('#div-time-count-down').html(html.join(''));
                        self.ICO().BuyICO = true;
                    }
                }
            });

            clock2.setTime(diffTime);
            clock2.setCountdown(true);
            clock2.start();

        }
        else {
            var _currentTime = moment();// moment(moment.utc().format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");
            var _diffTime = parseInt(data.TimeLeft);// eventTime.unix() - _currentTime.unix();
            if (_diffTime < 0) {
                $('#div-time-count-down').removeClass('enabled');
                $('#div-time-count-down-open').removeClass('enabled');
                $('#div-time-count-down-close').addClass('enabled');
                $('#buy--ico--now').removeClass('enabled');
            }
            else {
                if (data.OpenBuyTime == 1) {
                    //on going
                    self.ICO().BuyICO = true;
                }
                else if (data.OpenBuyTime == 2) {
                    //next ico
                    $('#buy--ico--now').removeClass('enabled');
                    $('#div-time-count-down').addClass('enabled');
                    $('#div-time-count-down-open').removeClass('enabled');
                    var _eventTime = moment(ico_info.e());// moment(moment(ico_info.e()).format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");// moment(item.TimeBuyICO);

                    var diffTime = parseInt(data.TimeLeft);//  _eventTime.unix() - currentTime.unix();
                    diffTime = diffTime < 0 ? 0 : diffTime;
                    var clock2 = $('#buy--ico--time').FlipClock({
                        clockFace: 'DailyCounter',
                        autoStart: false,
                        callbacks: {
                            stop: function () {
                                var html = [];
                                html.push('<h4 class="buy-ico-title-time"><img src="/Content/images/time-buy-ico.png" />ICO STARTS NOW: </h4>');
                                html.push('<div class="ico-action text-center enabled">');
                                html.push('<button class="btn btn-warning enabled" id="buy--ico--now">BUY UCH</button>');
                                html.push('</div>');
                                $('#div-time-count-down').html(html.join(''));
                                self.ICO().BuyICO = true;
                            }
                        }
                    });

                    clock2.setTime(diffTime);
                    clock2.setCountdown(true);
                    clock2.start();

                }
                else {
                    $('#buy--ico--now').removeClass('enabled');
                    $('#div-time-count-down').removeClass('enabled');
                    $('#div-time-count-down-open').removeClass('enabled');
                    $('#div-time-count-down-close').addClass('enabled');
                }
            }
        }

        self.UserWallet(userWallet);
        ko.applyBindings(self, $('#div-ico-controller')[0]);
        self.GetListTransaction(1, function () {

        });

    };

    this.refreshCaptcha = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        if (self.RefreshCaptcha == 1) { return; }
        self.RefreshCaptcha = 1;
        var datapost = {};
        datapost.__RequestVerificationToken = __token;
        $.ajax({
            url: urlRefresh,
            data: datapost,
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {

            },
            success: function (data) {
                if (data.Result == "OK") {
                    $('#img-new-captcha').attr('src', data.Data);
                }
                else {
                    bootbox.dialog({
                        message: data.Message,
                        title: "Warning",
                        buttons: {
                            confirm: {
                                label: '<i class="fa fa-times"></i> Close',
                                className: "btn-warning button-bootbox-close"
                            }
                        }
                    });
                }
                self.RefreshCaptcha = 0;
                
            },
            error: function (data) {
                self.RefreshCaptcha = 0;
            }
        });
    };

    this.refreshRobotCaptcha = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        if (RefreshCaptcha == 1) { return; }
        var RefreshCaptcha = 1;
        var datapost = {};
        datapost.__RequestVerificationToken = __token;
        $.ajax({
            url: urlRefreshRobot,
            data: datapost,
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {

            },
            success: function (data) {
                if (data.Result == "OK") {
                    $('.img-robot-captcha').attr('src', data.Data);
                }
                else {
                    bootbox.dialog({
                        message: data.Message,
                        title: "Warning",
                        buttons: {
                            confirm: {
                                label: '<i class="fa fa-times"></i> Close',
                                className: "btn-warning button-bootbox-close"
                            }
                        }
                    });
                }
                RefreshCaptcha = 0;

            },
            error: function (data) {
                RefreshCaptcha = 0;
            }
        });
    };

    this.transferCoin = function (type) {
        if (type == 1) {
            var total_coin = parseFloat($('input[name="4amount--4coin--2ver3"]').val().trim());
            var __price = self.Blockchain == "BTC" ? parseFloat(self.Price().btc_last_price).toFixed(2) : parseFloat(self.Price().eth_last_price).toFixed(2);
            var __priceICO = Number(parseFloat(self.ICO().Price).toFixed(8));
            var amount = parseFloat(total_coin * __price / __priceICO).toFixed(8);
            $('input[name="4amount--4uch--2ver3"]').val(amount);
        }
        else {
            var total_coin = parseFloat($('input[name="4amount--4uch--2ver3"]').val().trim());
            total_coin = parseInt(total_coin);
            $('input[name="4amount--4uch--2ver3"]').val(total_coin);
            var __price = self.Blockchain == "BTC" ? parseFloat(self.Price().btc_last_price).toFixed(2) : parseFloat(self.Price().eth_last_price).toFixed(2);
            var __priceICO = Number(parseFloat(self.ICO().Price).toFixed(8));
            var amount = parseFloat(total_coin * __priceICO / __price).toFixed(8);
            $('input[name="4amount--4coin--2ver3"]').val(amount);
        }
    };
    this.buyAll = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        var total_coin = self.Blockchain == "BTC" ? parseFloat(self.UserWallet().BTC).toFixed(8) : parseFloat(self.UserWallet().ETH).toFixed(8);
        var __price = self.Blockchain == "BTC" ? parseFloat(self.Price().btc_last_price).toFixed(2) : parseFloat(self.Price().eth_last_price).toFixed(2);
        var amount = parseFloat(total_coin * __price / self.ICO().Price).toFixed(8);
        $('input[name="4amount--4coin--2ver3"]').val(total_coin);
        $('input[name="4amount--4uch--2ver3"]').val(amount);
    };
    this.changeBTC = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        $('input[name="4amount--4coin--2ver3"]').val('');
        $('input[name="4amount--4uch--2ver3"]').val('');
        self.Blockchain = 'BTC';
        $('#div--amount--coin').html(self.Blockchain + ' amount');
        $('#btn-bitcoin').addClass('btn-success').removeClass('btn-default');
        $('#btn-ethereum').removeClass('btn-success').addClass('btn-default');
        $('#total--coin--can').html(parseFloat(self.UserWallet().BTC).toFixed(8));
        $('#price--coin').html(parseFloat(self.Price().btc_last_price).toFixed(2));
        $('#span--blockchain').html(self.Blockchain);
        $('#price--coin-label').html('1 BTC');
        var __priceICO = Number(parseFloat(self.ICO().Price).toFixed(8));
        var __price = Number(parseFloat(self.Price().btc_last_price).toFixed(2));
        //var amount = Number(parseFloat(self.UserWallet().BTC * __price / __priceICO).toFixed(8));
        var amount = Number(parseInt(self.UserWallet().BTC * __price / __priceICO));
        amount = amount > self.Limit ? self.Limit : amount;
        if (amount > self.ICO().TotalCoin - self.ICO().SoldCoin) {
            amount = self.ICO().TotalCoin - self.ICO().SoldCoin;
        }
        amount = parseFloat(amount).toFixed(8);
        self.MaxBuy = Number(amount);
        $('#max--coin-label').html(amount);
    };

    this.changeETH = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        $('input[name="4amount--4coin--2ver3"]').val('');
        $('input[name="4amount--4uch--2ver3"]').val('');
        self.Blockchain = 'ETH';
        $('#div--amount--coin').html(self.Blockchain + ' amount');
        $('#total--coin--can').html(parseFloat(self.UserWallet().ETH).toFixed(8));
        $('#btn-ethereum').addClass('btn-success').removeClass('btn-default');
        $('#btn-bitcoin').removeClass('btn-success').addClass('btn-default');
        $('#span--blockchain').html(self.Blockchain);
        $('#price--coin-label').html('1 ETH');
        $('#price--coin').html(parseFloat(self.Price().eth_last_price).toFixed(2));

        var __priceICO = Number(parseFloat(self.ICO().Price).toFixed(8));
        var __price = Number(parseFloat(self.Price().eth_last_price).toFixed(2));
        //var amount = Number(parseFloat(self.UserWallet().ETH * __price / __priceICO).toFixed(8));
        var amount = Number(parseInt(self.UserWallet().ETH * __price / __priceICO));
        amount = amount > self.Limit ? self.Limit : amount;
        if (amount > self.ICO().TotalCoin - self.ICO().SoldCoin) {
            amount = self.ICO().TotalCoin - self.ICO().SoldCoin;
        }
        amount = parseFloat(amount).toFixed(8);
        self.MaxBuy = Number(amount);
        $('#max--coin-label').html(amount);
    };

    this.OpenBuyICO = function () {
        if (!self.ICO().BuyICO) {
            return;
        }
        var datapost = {};
        datapost.__RequestVerificationToken = __token;
        $.ajax({
            url: urlGetPrice,
            data: datapost,
            type: "get",
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                main.ctr_shw_loadng();
                
            },
            success: function (data) {
                $('#div-buy-uch').remove();
                $('body').append(data);
                $('#div-buy-uch').modal('show');
                self.Price(localPrice);

                $('#btn-bitcoin').click();
                
            },
            error: function (data) {

            }
        });
    };

    this.Buy = function () {

        if (!self.ICO().BuyICO) {
            return;
        }
        
        var blockchain = self.Blockchain;
        var captcha = $('#input-captcha').val();
        if (captcha == null || captcha.trim().length < 5) {
            $('#input-captcha').css('border', '1px solid #ac2925');
            bootbox.dialog({
                size: 'small',
                message: "Captcha is invalid. Please try again",
                title: "Warning",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-times"></i> Close',
                        className: "btn-warning button-bootbox-close"
                    }
                }
            });
            return;
        }
        var amount = $('input[name="4amount--4uch--2ver3"]').val();
        var coinPaid = $('input[name="4amount--4coin--2ver3"]').val();

        if (coinPaid == null || coinPaid.trim().length == 0 || isNaN(coinPaid) || coinPaid <= 0) {
            $('input[name="4amount--4coin--2ver3"]').css('border', '1px solid red');
            setTimeout(function () {
                $('input[name="4amount--4coin--2ver3"]').removeAttr('style');
            }, 3000);
            bootbox.dialog({
                size: 'small',
                message: "Amount " + self.Blockchain + " is invalid",
                title: "Warning",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-times"></i> Close',
                        className: "btn-warning button-bootbox-close"
                    }
                }
            });
            return;
        }
        if (amount == null || amount.trim().length == 0 || isNaN(amount) || amount <= 0) {
            $('input[name="4amount--4uch--2ver3"]').css('border', '1px solid red');
            setTimeout(function () {
                $('input[name="4amount--4uch--2ver3"]').removeAttr('style');
            }, 3000);
            bootbox.dialog({
                size: 'small',
                message: "UCH amount is invalid",
                title: "Warning",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-times"></i> Close',
                        className: "btn-warning button-bootbox-close"
                    }
                }
            });
            return;
        }
        var coin_available = self.Blockchain == "BTC" ? parseFloat(self.UserWallet().BTC).toFixed(8) : parseFloat(self.UserWallet().ETH).toFixed(8);
        coinPaid = parseFloat(coinPaid);
        coin_available = Number(coin_available);
        if (coinPaid > coin_available) {
            bootbox.dialog({
                size: 'small',
                message: "Your wallet " + self.Blockchain + "'s balance is not enough",
                title: "Warning",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-times"></i> Close',
                        className: "btn-warning button-bootbox-close"
                    }
                }
            });
            return;
        }

        var _limit = self.ICO().Limit;
        if (self.ICO().Limit > self.ICO().TotalCoin - self.ICO().SoldCoin) {
            _limit = self.ICO().TotalCoin - self.ICO().SoldCoin;
        }
        amount = Number(parseFloat(amount).toFixed(8));
        _limit = Number(parseFloat(_limit).toFixed(8));
        if (amount > _limit) {
            bootbox.dialog({
                size: 'small',
                message: "The maximum amount of UCH that you can buy: " + Number(_limit),
                title: "Warning",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-times"></i> Close',
                        className: "btn-warning button-bootbox-close"
                    }
                }
            });
            return;
        }



        var post = {};
        post.__RequestVerificationToken = __token;
        post.blockchain = blockchain;
        post.amount = amount;
        post.captcha = captcha.trim();
        post.coinPaid = coinPaid;
        post.calendar = self.ICO().Id;
        post.PriceCoin = self.Blockchain == "BTC" ? self.Price().btc_last_price : self.Price().eth_last_price;
        $.ajax({
            url: urlBuy,
            data: post,
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {
                main.ctr_shw_loadng();
            },
            success: function (data) {
                if (data.Result == "OK") {
                    if (data.Data.IsSuccess) {
                        $('#div-buy-uch').modal('hide');
                        bootbox.dialog({
                            message: 'Wow! You have successfully bought UCH! Congratulations!',
                            title: "",
                            buttons: {
                                confirm: {
                                    label: '<i class="fa fa-times"></i> Close',
                                    className: "btn-warning button-bootbox-close",
                                    callback: function () {
                                        window.location.reload();
                                    }
                                }
                            }
                        });
                        setTimeout(function () { window.location.reload(); }, 2000);
                    }
                    else {
                        bootbox.dialog({
                            message: data.Data.Message,
                            title: "Warning",
                            buttons: {
                                confirm: {
                                    label: '<i class="fa fa-times"></i> Close',
                                    className: "btn-warning button-bootbox-close"
                                }
                            }
                        });
                    }
                }
                else {
                    bootbox.dialog({
                        message: data.Message,
                        title: "Warning",
                        buttons: {
                            confirm: {
                                label: '<i class="fa fa-times"></i> Close',
                                className: "btn-warning button-bootbox-close"
                            }
                        }
                    });
                }

            },
            error: function (data) {

            }
        });
    };

    this.GetListTransaction = function (pageIndex, callback) {
        var datapost = {};
        datapost.pageIndex = pageIndex;
        datapost.pageSize = defaultPageSize;
        datapost.calendar = self.ICO().Id;
        datapost.all = $('#select-transaction').val();
        datapost.__RequestVerificationToken = __token;
        $.ajax({
            url: urlTransaction,
            data: datapost,
            type: 'POST',
            dataType: 'json',
            beforeSend: function () {
                //main.ctr_shw_loadng();
                $('#select-transaction').attr('disabled', true);
            },
            success: function (data) {
                if (data.Result == "OK") {
                    $('#select-transaction').removeAttr('disabled');
                    self.transactionList.removeAll();
                    //var _totalPage = Math.floor(data.Records.TotalCount / defaultPageSize);
                    //if (_totalPage * defaultPageSize < data.Records.TotalCount) {
                    //    _totalPage++;
                    //}
                    //self.pagination.initData(pageIndex, defaultPageSize, _totalPage);
                    var index = 0;
                    $.each(data.Records.Records, function (key, val) {
                        index++;
                        val.Amount = parseFloat(val.Amount).toFixed(8);
                        var utcTime = moment(val.CreatedDate).format('YYYY-MM-DD HH:mm:ss');
                        val.DateCreated = utcTime;
                        self.transactionList.push(val);

                    });

                    if (index == 0) {
                        $('#no-item-found-alert').addClass('enabled');
                        var html = "";

                        html = "You have not made any transactions. Once you do, they will appear here.";
                        $('#no-item-found-alert td').html('<div class="text-center">' + html + '</div>');
                    }
                    else {
                        $('#no-item-found-alert').removeClass('enabled');
                    }
                    if (callback) {
                        callback();
                    }
                }
            },
            error: function (data) {
                $('#select-transaction').removeAttr('disabled');
            }
        });

    };
};

