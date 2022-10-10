<script>
	export let bannerInfo = {
		style: '',
		text: '',
		display: false
	};
</script>

{#if bannerInfo.display}
	<div class="banner {bannerInfo.style}">{bannerInfo.text}</div>
{/if}
