<script id="fleex-info-tpl" type="text/x-template">
	<ul class="nav nav-hor right">
		<% if(typeof level != 'undefined' && level && level.index && level.completionRate != undefined && level.completionRate != null) { %>
			<li class="level-container" data-toggle="tooltip" data-placement="bottom" title="
				<div class='fleex-tooltip-label'>Level <%= level.index %> completed at <%= level.completionRate %>%</div>
				<div class='fleex-flag eng'><%= level.percentOfTargetSubs %>%</div>
				<% if(level.percentOfNativeSubs) { %>
					 / <div class='fleex-flag <%= nativeLanguageCode %>'><%= level.percentOfNativeSubs %>%</div>
				<% } %>
				">
				<span class="level-index"><%= level.index %></span>
				<span class="level-completion-rate <% if(level.completionRate <= 50) { %>under-fifty<% } %>">
					<span class="first half">
						<span class="slice" style="-webkit-transform: rotate(<%= Math.min(180, level.completionRate * 180 / 50) %>deg);">
						</span>
					</span>
					<span class="second half">
						<span class="slice" style="-webkit-transform: rotate(<%= (level.completionRate - 50) * 180 / 50 %>deg);">
						</span>
					</span>
				</span>
			</li>
		<% } %>
		<% if(typeof name != 'undefined' && name) { %>
			<li>
				<i class="fa fa-book show-vocab-list"></i>
			</li>
			<li class="dropdown">
				<a class="dropdown-toggle" data-toggle="dropdown" href="#">
					<span class="user-name"><%= name %></span>
					<span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
					<li><a href="#" class="logout"><%= i18n.__("Logout") %></a></li>
				</ul>
			</li>
		<% } %>
	</ul>
</script>