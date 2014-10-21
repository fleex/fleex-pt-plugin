<script id="fleex-player-tpl" type="text/x-template">
	<div class="player-header-background vjs-control-bar">
		<div class="player-title"><%= title %></div> 
			<div class="details-player">
				<span class="close-info-player"></span>
				<div class="download-info-player">
					<div class="eye-info-player"></div>
					<div class="details-info-player">
						<div class="arrow-up"></div>
						<span class="speed-info-player"><%= i18n.__("Download") %>:&nbsp;</span><span class="download_speed_player"></span>
						<span class="speed-info-player"><%= i18n.__("Upload") %>:&nbsp;</span><span class="upload_speed_player"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<iframe id="video_player" width="100%" height="100%" src="<%= fleexUrl %>"></iframe>
</script>