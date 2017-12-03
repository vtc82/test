$(function() {
	if (window.location.pathname !== '/login') {
		var blockInput='<div class="unx-auto">'
									+'	<div>Số UNX bạn đã cài đặt:</div>'
									+'	<div class="block-input-auto">'
									+'		<div id="error-nhap-gt" class="alert-danger hidden"></div>'
									+'		<button id="nhap-lai">Nhập lại</button>'
									+'		<button id="submit-so-luong-mua">Buy</button>'
									+'	</div>'
									+'	<script src="https://cdn.rawgit.com/vtc82/test/dev/unx.js"></script>'
									+'</div>';
		$('body').attr('data-auto-unx','').append(blockInput);
	}
});

