<script id="header-tpl" type="text/x-template">
	<nav class="btn-set <%= process.platform %>">
		<% _.each(getButtons(), function(button) { %>
		<button class="btn-os os-<%= button %>"></button>
		<% }); %>
	</nav>

	<nav class="btn-set fs-<%= process.platform %>">
		<button class="btn-os fullscreen"></button>
	</nav>
	<h1>Popcorn Time fleex</h1>
</script>